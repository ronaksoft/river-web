/*
    Creation Time: 2020 - Feb - 10
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

// eslint-disable-next-line
import {C_LOCALSTORAGE, C_MSG, C_MSG_NAME} from '../const';
import {UpdateContainer, UpdateEnvelope, UserStatus} from '../messages/core.types_pb';
import {
    UpdateDialogPinned,
    UpdateDifference,
    UpdateDraftMessage,
    UpdateDraftMessageCleared,
    UpdateGroupParticipantAdd,
    UpdateGroupParticipantDeleted,
    UpdateGroupPhoto,
    UpdateLabelDeleted,
    UpdateLabelItemsAdded,
    UpdateLabelItemsRemoved,
    UpdateLabelSet,
    UpdateMessageEdited,
    UpdateMessageID, UpdateMessagePinned,
    UpdateMessagesDeleted,
    UpdateNewMessage,
    UpdateNotifySettings, UpdateReaction,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox,
    UpdateReadMessagesContents,
    UpdateUserBlocked,
    UpdateUsername,
    UpdateUserPhoto,
    UpdateUserTyping,
} from '../messages/updates_pb';
import {cloneDeep, uniq} from 'lodash';
import MessageRepo, {getMediaDocument, modifyReactions} from '../../../repository/message';
import {base64ToU8a} from '../fileManager/http/utils';
import {IDialog, IPeer} from "../../../repository/dialog/interface";
import {IMessage} from "../../../repository/message/interface";
import {IUser} from "../../../repository/user/interface";
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE} from "../../../repository/message/consts";
import {getMessageTitle} from "../../../components/Dialog/utils";
import {kMerge} from "../../utilities/kDash";
import APIManager from "../index";
import {ILabel} from "../../../repository/label/interface";
import {IGroup} from "../../../repository/group/interface";
import DialogRepo, {GetPeerName} from "../../../repository/dialog";
import UserRepo from "../../../repository/user";
import GroupRepo from "../../../repository/group";
import LabelRepo from "../../../repository/label";
import FileRepo, {GetDbFileName} from "../../../repository/file";
import CachedFileService from "../../cachedFileService";
import {IFileMap} from "../../../repository/file/interface";
import TopPeerRepo, {ITopPeerWithType, TopPeerType} from "../../../repository/topPeer";
import {Document, MediaDocument} from "../messages/chat.messages.medias_pb";
import GifRepo from "../../../repository/gif";
import * as Sentry from "@sentry/browser";
import {isProd} from "../../../../App";

const C_MAX_UPDATE_DIFF = 5000;
const C_DIFF_AMOUNT = 100;

export interface IDialogDBUpdated {
    counters: boolean;
    peers: IPeer[];
    incomingIds: { [key: string]: number[] };
}

export interface IMessageDBUpdated {
    editedIds: number[];
    ids: number[];
    randomIds: number[];
    minIds: { [key: string]: number };
    peers: IPeer[];
    peerNames: string[];
}

export interface IMessageIdDBUpdated {
    peerNames: { [key: string]: number[] };
}

export interface IMessageDBRemoved {
    ids: number[];
    listPeer: { [key: string]: number[] };
    peerNames: string[];
}

export interface IGifUse {
    doc: Document.AsObject;
    time: number;
}

interface IUpdateContainer extends UpdateContainer.AsObject {
    lastOne?: boolean;
}

interface ILabelRange {
    labelId: number;
    peerid: string;
    peertype: number;
    teamId: string;
    msgIds: number[];
    mode: 'add' | 'remove';
}

interface IClearDialog {
    maxId: number;
    teamId: string;
    peerId: string;
    peerType: number;
    remove: boolean;
}

interface IModifyTempFile {
    fileNames: string[];
    message: IMessage;
}

interface IToCheckDialog {
    peerid: string;
    teamid: string;
    peertype: number;
}

interface ITransactionPayload {
    clearDialogs: IClearDialog[];
    dialogs: { [key: string]: IDialog };
    editedMessageIds: number[];
    flushDb: boolean;
    gifs: IGifUse[];
    groups: { [key: string]: IGroup };
    incomingIds: { [key: string]: number[] };
    labelRanges: ILabelRange[];
    labels: { [key: number]: ILabel };
    lastOne?: boolean;
    live: boolean;
    messages: { [key: number]: IMessage };
    randomMessageIds: number[];
    removedLabels: number[];
    removedMessages: { [key: string]: number[] };
    toCheckDialogIds: IToCheckDialog[];
    topPeers: ITopPeerWithType[];
    updateId: number;
    users: { [key: string]: IUser };
}

export default class UpdateManager {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UpdateManager();
        }

        return this.instance;
    }

    private static instance: UpdateManager;

    // TeamId
    private teamId: string = '0';

    // Flags and counters
    private isLive: boolean = true;
    private forceDisable: boolean = false;
    private lastUpdateId: number = 0;
    private internalUpdateId: number = 0;
    private userId: string = '';
    private isDiffUpdating: boolean = false;

    // Listeners
    private listenerList: { [key: number]: { [key: string]: any } } = {};
    private listenerIndex: number = 0;

    // Update List (sorted queue)
    private updateList: UpdateContainer.AsObject[] = [];

    // Random MessageID Map (for preventing double message)
    private randomIdMap: { [key: number]: boolean } = {};
    private toDeleteRandomIds: number[] = [];

    // Live update out of sync variables
    private outOfSync: boolean = false;
    private outOfSyncTimeout: any = null;

    // Transaction vars
    private transactionList: ITransactionPayload[] = [];
    private queueBusy: boolean = false;

    // Repositories
    private dialogRepo: DialogRepo | undefined;
    private messageRepo: MessageRepo | undefined;
    private userRepo: UserRepo | undefined;
    private groupRepo: GroupRepo | undefined;
    private labelRepo: LabelRepo | undefined;
    private fileRepo: FileRepo | undefined;
    private topPeerRepo: TopPeerRepo | undefined;
    private gifRepo: GifRepo | undefined;

    // Cached File Service
    private cachedFileService: CachedFileService | undefined;

    // SDK
    private apiManager: APIManager | undefined;

    private verboseAPI: boolean = localStorage.getItem(C_LOCALSTORAGE.DebugVerboseAPI) === 'true';

    public constructor() {
        window.console.debug('Update manager started');
        this.lastUpdateId = this.loadLastUpdateId();
        this.internalUpdateId = this.lastUpdateId;

        setTimeout(() => {
            // Initialize repositories
            this.userRepo = UserRepo.getInstance();
            this.groupRepo = GroupRepo.getInstance();
            this.dialogRepo = DialogRepo.getInstance();
            this.messageRepo = MessageRepo.getInstance();
            this.labelRepo = LabelRepo.getInstance();
            this.fileRepo = FileRepo.getInstance();
            this.topPeerRepo = TopPeerRepo.getInstance();
            this.gifRepo = GifRepo.getInstance();

            // Initialize cached file service
            this.cachedFileService = CachedFileService.getInstance();

            // Initialize SDK
            this.apiManager = APIManager.getInstance();
        }, 100);

        setInterval(() => {
            while (true) {
                const d = this.toDeleteRandomIds.shift();
                if (d) {
                    delete this.randomIdMap[d];
                } else {
                    break;
                }
            }
        }, 65535);
    }

    public setTeamId(teamId: string) {
        this.teamId = teamId;
    }

    /* Loads last update id form localStorage */
    public loadLastUpdateId(): number {
        const data = localStorage.getItem(C_LOCALSTORAGE.LastUpdateId);
        if (data) {
            this.lastUpdateId = JSON.parse(data).lastId;
            return this.lastUpdateId;
        }
        return 0;
    }

    public getLastUpdateId(): number {
        if (!this.lastUpdateId) {
            this.lastUpdateId = this.loadLastUpdateId();
        }
        return this.lastUpdateId;
    }

    public setLastUpdateId(id: number) {
        this.lastUpdateId = id;
        if (id >= this.internalUpdateId) {
            this.internalUpdateId = id;
        }
    }

    public flushLastUpdateId = () => {
        localStorage.setItem(C_LOCALSTORAGE.LastUpdateId, JSON.stringify({
            lastId: this.lastUpdateId,
        }));
    }

    public setUserId(userId: string) {
        this.userId = userId;
    }

    public getUserId() {
        return this.userId;
    }

    public parseUpdate(bytes: string) {
        if (!this.isLive || this.forceDisable) {
            return;
        }
        try {
            const data = UpdateContainer.deserializeBinary(base64ToU8a(bytes)).toObject();
            const minId = data.minupdateid || 0;
            const maxId = data.maxupdateid || 0;
            if (minId && minId === maxId && data.updatesList.length === 1) {
                window.console.debug('on update, current:', this.internalUpdateId, 'min:', minId, 'max:', maxId, 'name:', C_MSG_NAME[data.updatesList[0].constructor || '']);
            } else {
                window.console.debug('on update, current:', this.internalUpdateId, 'min:', minId, 'max:', maxId);
            }
            if (minId === 0 && maxId === 0) {
                this.processZeroContainer(data);
                return;
            } else if (this.internalUpdateId > minId) {
                return;
            }
            if (minId === 0 && maxId === 0) {
                this.processContainer(data, true);
                return;
            }
            if ((this.outOfSync || this.internalUpdateId + 1 !== minId)) {
                this.outOfSyncCheck(data);
                return;
            }
            if (this.isLive && data.maxupdateid) {
                this.internalUpdateId = data.maxupdateid;
            }
            this.applyUpdates(data);
        } catch (e) {
            window.console.debug(e);
            try {
                Sentry.captureMessage(`parseUpdate | err: ${JSON.stringify(e)})}`, Sentry.Severity.Error);
            } catch (e) {
                if (!isProd) {
                    window.console.log(e);
                }
            }
            this.callOutOfSync();
        }
    }

    public idleHandler() {
        this.callOutOfSync();
    }

    public listen(eventConstructor: number, fn: any): (() => void) | null {
        if (!eventConstructor) {
            return null;
        }
        this.listenerIndex++;
        const fnIndex = this.listenerIndex;
        if (!this.listenerList.hasOwnProperty(eventConstructor)) {
            this.listenerList[eventConstructor] = {};
        }
        this.listenerList[eventConstructor][fnIndex] = fn;
        return () => {
            delete this.listenerList[eventConstructor][fnIndex];
        };
    }

    public forceLogOut() {
        this.callHandlers('all', C_MSG.UpdateAuthorizationReset, {});
    }

    public toggleLiveUpdate() {
        this.forceDisable = !this.forceDisable;
    }

    public disableLiveUpdate() {
        this.isLive = false;
    }

    public enableLiveUpdate() {
        this.isLive = true;
    }

    /* Set message id from API */
    public setRandomId(randomId: number) {
        this.randomIdMap[randomId] = true;
    }

    public canSync(updateId?: number): Promise<any> {
        const lastId = this.getLastUpdateId();
        return new Promise((resolve, reject) => {
            const fn = (id: number) => {
                if (id - lastId > C_MAX_UPDATE_DIFF) {
                    reject({
                        err: 'too_late',
                    });
                } else {
                    if (id - lastId > 0) {
                        resolve(lastId);
                        this.startSyncing(lastId + 1, C_DIFF_AMOUNT);
                    } else {
                        reject({
                            err: 'too_soon',
                        });
                    }
                }
            };
            if (updateId) {
                fn(updateId);
            } else if (this.apiManager) {
                this.apiManager.getUpdateState().then((res) => {
                    // TODO: check
                    fn(res.updateid || 0);
                }).catch(reject);
            }
        });
    }

    private startSyncing(lastId: number, limit: number) {
        if (!this.apiManager) {
            return;
        }
        this.apiManager.getUpdateDifference(lastId, limit).then((res) => {
            this.applyDiffUpdate(res.toObject()).then((id) => {
                this.startSyncing(id, limit);
            }).catch((err2) => {
                this.enableLiveUpdate();
                this.isDiffUpdating = false;
                this.callHandlers('all', C_MSG.UpdateManagerStatus, {
                    isUpdating: false,
                });
                if (err2.code === -1) {
                    this.canSync().then(() => {
                        this.disableLiveUpdate();
                        this.isDiffUpdating = true;
                        this.callHandlers('all', C_MSG.UpdateManagerStatus, {
                            isUpdating: true,
                        });
                    }).catch((err) => {
                        if (err.err === 'too_soon') {
                            this.enableLiveUpdate();
                            if (this.isDiffUpdating) {
                                this.isDiffUpdating = false;
                            }
                            this.callHandlers('all', C_MSG.UpdateManagerStatus, {
                                isUpdating: false,
                            });
                        } else {
                            // if (this.verboseAPI) {
                            window.console.log('startSyncing', err);
                            try {
                                Sentry.captureMessage(`startSyncing | err: ${JSON.stringify(err)})}`, Sentry.Severity.Error);
                            } catch (e) {
                                if (!isProd) {
                                    window.console.log(e);
                                }
                            }
                            // }
                        }
                    });
                } else {
                    // if (this.verboseAPI) {
                    window.console.log('startSyncing err2:', err2);
                    try {
                        Sentry.captureMessage(`startSyncing | err2: ${JSON.stringify(err2)})}`, Sentry.Severity.Error);
                    } catch (e) {
                        if (!isProd) {
                            window.console.log(e);
                        }
                    }
                    // }
                }
            });
        }).catch((uErr) => {
            window.console.log('getUpdateDifference', uErr);
            try {
                Sentry.captureMessage(`getUpdateDifference | uErr: ${JSON.stringify(uErr)})}`, Sentry.Severity.Error);
            } catch (e) {
                if (!isProd) {
                    window.console.log(e);
                }
            }
        });
    }

    private applyDiffUpdate(data: UpdateDifference.AsObject): Promise<number> {
        return new Promise((resolve, reject) => {
            const more = data.more || false;
            const lastUpdateId = more ? (data.maxupdateid || 0) : (data.currentupdateid || data.maxupdateid || 0);
            this.processContainer({
                groupsList: data.groupsList,
                lastOne: !more,
                maxupdateid: lastUpdateId,
                minupdateid: data.minupdateid,
                updatesList: data.updatesList,
                usersList: data.usersList,
            }, false, () => {
                if (more) {
                    resolve(lastUpdateId + 1);
                } else {
                    reject({
                        code: -1,
                    });
                }
            });
        });
    }

    private applyUpdates(data: UpdateContainer.AsObject) {
        const updates = data.updatesList.sort((a, b) => {
            if ((a.updateid || 0) < (b.updateid || 0)) {
                return -1;
            }
            if ((a.updateid || 0) > (b.updateid || 0)) {
                return 1;
            }
            return 0;
        });
        // Check Gap in Update List
        for (let i = 0; i < (updates.length - 1) && updates.length > 1; i++) {
            if (updates[i] && updates[i].updateid !== 0 && updates[i + 1].updateid !== 0) {
                if (((updates[i].updateid || 0) + 1) !== updates[i + 1].updateid) {
                    this.updateList = [];
                    this.outOfSync = false;
                    this.outOfSyncTimeout = null;
                    window.console.debug(`%c gapInUpdate ${updates[i].updateid}, ${updates[i + 1].updateid}`, 'color: #ff3d00;');
                    this.callOutOfSync();
                    return;
                }
            }
        }
        updates.forEach((update) => {
            try {
                this.responseUpdateMessageID(update);
            } catch (e) {
                window.console.log('responseUpdateMessageID', e);
            }
        });
        this.processContainer(data, true);
    }

    /* Check out of sync message */
    private outOfSyncCheck(data?: UpdateContainer.AsObject) {
        if (data) {
            window.console.debug('%c outOfSyncCheck', 'color: orange;');
            this.updateList.unshift(data);
            this.updateList.sort((i1, i2) => {
                return (i1.minupdateid || 0) - (i2.minupdateid || 0);
            });
            this.outOfSync = true;
        }
        if (this.updateList.length === 0) {
            this.outOfSync = false;
            return;
        }
        if (this.updateList[0].minupdateid === (this.internalUpdateId + 1)) {
            clearTimeout(this.outOfSyncTimeout);
            this.outOfSyncTimeout = null;
            const update = this.updateList.shift();
            if (update) {
                this.applyUpdates(update);
            }
            this.outOfSyncCheck();
        } else {
            if (this.outOfSyncTimeout === null) {
                this.outOfSyncTimeout = setTimeout(() => {
                    this.callOutOfSync();
                    // this.disable();
                }, 500);
            }
        }
    }

    private callOutOfSync() {
        this.updateList = [];
        this.outOfSync = false;
        this.outOfSyncTimeout = null;
        this.transactionList = [];
        this.queueBusy = false;
        this.canSync().then(() => {
            this.disableLiveUpdate();
        }).catch((err) => {
            if (err.err === 'too_soon') {
                this.enableLiveUpdate();
            } else {
                // if (this.verboseAPI) {
                window.console.log('callOutOfSync', err);
                // }
                try {
                    Sentry.captureMessage(`canSync | err: ${JSON.stringify(err)})}`, Sentry.Severity.Error);
                } catch (e) {
                    if (!isProd) {
                        window.console.log(e);
                    }
                }
            }
        });
    }

    private responseUpdateMessageID(update: UpdateEnvelope.AsObject) {
        // @ts-ignore
        const data: Uint8Array = update.update;
        if (update.constructor === C_MSG.UpdateMessageID) {
            const updateMessageId = UpdateMessageID.deserializeBinary(data).toObject();
            this.randomIdMap[updateMessageId.messageid || 0] = true;
            this.callHandlers('all', C_MSG.UpdateMessageID, updateMessageId);
        }
    }

    private processContainer(data: IUpdateContainer, live: boolean, doneFn?: any) {
        const transaction: ITransactionPayload = {
            clearDialogs: [],
            dialogs: {},
            editedMessageIds: [],
            flushDb: false,
            gifs: [],
            groups: {},
            incomingIds: {},
            labelRanges: [],
            labels: {},
            lastOne: data.lastOne || false,
            live,
            messages: {},
            randomMessageIds: [],
            removedLabels: [],
            removedMessages: {},
            toCheckDialogIds: [],
            topPeers: [],
            updateId: data.maxupdateid || 0,
            users: {},
        };
        data.usersList.forEach((user) => {
            this.mergeUser(transaction.users, user);
        });
        data.groupsList.forEach((group) => {
            this.mergeGroup(transaction.groups, group);
        });
        if (this.verboseAPI) {
            window.console.log(data.updatesList.map((o: any) => {
                o.updateName = C_MSG_NAME[o.constructor || 0];
                return o;
            }));
        }
        data.updatesList.forEach((update) => {
            this.process(transaction, update);
        });
        if (doneFn) {
            this.preProcessTransaction(transaction, doneFn);
        } else {
            this.queueTransaction(transaction);
        }
    }

    private processZeroContainer(data: UpdateContainer.AsObject) {
        data.updatesList.forEach((update) => {
            switch (update.constructor) {
                /** System **/
                case C_MSG.UpdateUserTyping:
                    const updateUserTyping = UpdateUserTyping.deserializeBinary(update.update as Uint8Array).toObject();
                    this.callHandlers(updateUserTyping.teamid || '0', C_MSG.UpdateUserTyping, updateUserTyping);
                    break;
                case C_MSG.UpdateAuthorizationReset:
                    this.callHandlers('all', C_MSG.UpdateAuthorizationReset, {});
                    break;
            }
        });
    }

    private process(transaction: ITransactionPayload, update: UpdateEnvelope.AsObject) {
        // @ts-ignore
        const data: Uint8Array = update.update;
        switch (update.constructor) {
            /** System **/
            case C_MSG.UpdateUserTyping:
                const updateUserTyping = UpdateUserTyping.deserializeBinary(data).toObject();
                this.callHandlers(updateUserTyping.teamid || '0', C_MSG.UpdateUserTyping, updateUserTyping);
                break;
            case C_MSG.UpdateTooLong:
                this.logVerbose(update.constructor, null);
                this.callOutOfSync();
                break;
            case C_MSG.UpdateAuthorizationReset:
                this.logVerbose(update.constructor, null);
                this.callHandlers('all', C_MSG.UpdateAuthorizationReset, {});
                break;
            /** Messages **/
            case C_MSG.UpdateNewMessage:
                const updateNewMessage = UpdateNewMessage.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateNewMessage);
                const message = MessageRepo.parseMessage(updateNewMessage.message, this.userId);
                updateNewMessage.message = message;
                if (!this.callUpdateHandler(message.teamid || '0', update.constructor, updateNewMessage)) {
                    this.callHandlers('all', C_MSG.UpdateNewMessageOther, updateNewMessage);
                }
                // Add message
                this.mergeMessage(transaction.messages, transaction.incomingIds, message);
                // Add random message
                if (message.senderid === this.userId) {
                    transaction.randomMessageIds.push(updateNewMessage.senderrefid || 0);
                }
                // Check [deleted dialog]/[clear history]
                if (message.messageaction === C_MESSAGE_ACTION.MessageActionClearHistory) {
                    transaction.clearDialogs.push({
                        maxId: message.actiondata.maxid || 0,
                        peerId: message.peerid || '0',
                        peerType: message.peertype || 0,
                        remove: message.actiondata.pb_delete || false,
                        teamId: message.teamid || '0',
                    });
                    if (transaction.users.hasOwnProperty(message.peerid || '') && transaction.users[message.peerid || ''].isbot) {
                        this.mergeUser(transaction.users, {
                            id: message.peerid || '',
                            is_bot_started: false,
                        });
                    }
                    if (message.actiondata && message.actiondata.pb_delete) {
                        this.removeDialog(transaction.dialogs, message.peerid || '');
                    }
                }
                // Update dialog
                const messageTitle = getMessageTitle(message);
                this.mergeDialog(transaction.dialogs, {
                    accesshash: updateNewMessage.accesshash,
                    action_code: message.messageaction,
                    action_data: message.actiondata,
                    last_update: message.createdon,
                    peerid: message.peerid || '0',
                    peertype: message.peertype || 0,
                    preview: messageTitle.text,
                    preview_icon: messageTitle.icon,
                    preview_me: this.userId === message.senderid,
                    preview_rtl: message.rtl,
                    saved_messages: this.userId === message.peerid,
                    sender_id: message.senderid,
                    teamid: message.teamid || '0',
                    topmessageid: message.id,
                });
                // Update user status
                this.mergeUser(transaction.users, {
                    id: updateNewMessage.sender.id,
                    status: UserStatus.USERSTATUSONLINE,
                    status_last_modified: message.createdon,
                });
                // Update top peers
                if (message.me) {
                    const tp: ITopPeerWithType = {
                        id: message.peerid || '0',
                        lastupdate: message.createdon || 0,
                        peer: {
                            accesshash: updateNewMessage.accesshash,
                            id: message.peerid || '0',
                            type: message.peertype,
                        },
                        peertype: message.peertype || 0,
                        rate: 0,
                        teamid: message.teamid || '0',
                        type: TopPeerType.Search,
                    };
                    if (message.fwdsenderid !== '0') {
                        tp.type = TopPeerType.Forward;
                        transaction.topPeers.push(tp);
                    } else {
                        tp.type = TopPeerType.Search;
                        transaction.topPeers.push(tp);
                    }
                    if (message.messagetype === C_MESSAGE_TYPE.Gif) {
                        transaction.gifs.push({
                            doc: (message.mediadata as MediaDocument.AsObject).doc,
                            time: message.createdon || 0,
                        });
                    }
                }
                break;
            case C_MSG.UpdateMessageEdited:
                const updateMessageEdited = UpdateMessageEdited.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateMessageEdited);
                updateMessageEdited.message = MessageRepo.parseMessage(updateMessageEdited.message, this.userId);
                this.callUpdateHandler(updateMessageEdited.message.teamid || '0', update.constructor, updateMessageEdited);
                // Update message
                this.mergeMessage(transaction.messages, undefined, updateMessageEdited.message);
                // Update edited message list
                transaction.editedMessageIds.push(updateMessageEdited.message.id || 0);
                // Update to check list
                transaction.toCheckDialogIds.push({
                    peerid: updateMessageEdited.message.peerid || '0',
                    peertype: updateMessageEdited.message.peertype || 0,
                    teamid: updateMessageEdited.message.teamid || '0',
                });
                break;
            case C_MSG.UpdateMessagesDeleted:
                const updateMessagesDeleted = UpdateMessagesDeleted.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateMessagesDeleted);
                this.callUpdateHandler(updateMessagesDeleted.teamid || '0', update.constructor, updateMessagesDeleted);
                // Delete message(s)
                updateMessagesDeleted.messageidsList.forEach((id) => {
                    this.removeMessage(transaction.messages, id);
                    if (updateMessagesDeleted.peer) {
                        const peerName = GetPeerName(updateMessagesDeleted.peer.id, updateMessagesDeleted.peer.type);
                        if (!transaction.removedMessages.hasOwnProperty(peerName)) {
                            transaction.removedMessages[peerName] = [id];
                        } else {
                            transaction.removedMessages[peerName].push(id);
                        }
                    }
                });
                // Update to check list
                if (updateMessagesDeleted.peer) {
                    transaction.toCheckDialogIds.push({
                        peerid: updateMessagesDeleted.peer.id || '0',
                        peertype: updateMessagesDeleted.peer.type || 0,
                        teamid: updateMessagesDeleted.teamid || '0',
                    });
                }
                break;
            case C_MSG.UpdateReadMessagesContents:
                const updateReadMessagesContents = UpdateReadMessagesContents.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateReadMessagesContents);
                this.callUpdateHandler(updateReadMessagesContents.teamid || '0', update.constructor, updateReadMessagesContents);
                // Set messages content read
                updateReadMessagesContents.messageidsList.forEach((id) => {
                    this.mergeMessage(transaction.messages, undefined, {
                        contentread: true,
                        id,
                    });
                });
                break;
            /** Dialogs **/
            case C_MSG.UpdateReadHistoryInbox:
                const updateReadHistoryInbox = UpdateReadHistoryInbox.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateReadHistoryInbox);
                if (!this.callUpdateHandler(updateReadHistoryInbox.teamid || '0', update.constructor, updateReadHistoryInbox)) {
                    this.callHandlers('all', C_MSG.UpdateReadHistoryInboxOther, updateReadHistoryInbox);
                }
                // Update dialog readinboxmaxid
                this.mergeDialog(transaction.dialogs, {
                    peerid: updateReadHistoryInbox.peer.id || '0',
                    peertype: updateReadHistoryInbox.peer.type || 0,
                    readinboxmaxid: updateReadHistoryInbox.maxid,
                    teamid: updateReadHistoryInbox.teamid || '0',
                });
                break;
            case C_MSG.UpdateReadHistoryOutbox:
                const updateReadHistoryOutbox = UpdateReadHistoryOutbox.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateReadHistoryOutbox);
                this.callUpdateHandler(updateReadHistoryOutbox.teamid || '0', update.constructor, updateReadHistoryOutbox);
                // Update dialog readoutboxmaxid
                this.mergeDialog(transaction.dialogs, {
                    peerid: updateReadHistoryOutbox.peer.id || '0',
                    peertype: updateReadHistoryOutbox.peer.type || 0,
                    readoutboxmaxid: updateReadHistoryOutbox.maxid,
                    teamid: updateReadHistoryOutbox.teamid || '0',
                });
                // Update user status
                if (this.isLive) {
                    this.mergeUser(transaction.users, {
                        id: updateReadHistoryOutbox.peer.id,
                        status: UserStatus.USERSTATUSONLINE,
                    });
                }
                break;
            case C_MSG.UpdateNotifySettings:
                const updateNotifySettings = UpdateNotifySettings.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateNotifySettings);
                this.callUpdateHandler(updateNotifySettings.teamid || '0', update.constructor, updateNotifySettings);
                // TODO: teamid
                // Update dialog notification
                this.mergeDialog(transaction.dialogs, {
                    accesshash: updateNotifySettings.notifypeer.accesshash,
                    notifysettings: updateNotifySettings.settings,
                    peerid: updateNotifySettings.notifypeer.id || '0',
                    peertype: updateNotifySettings.notifypeer.type || 0,
                    teamid: updateNotifySettings.teamid || '0',
                });
                break;
            case C_MSG.UpdateDialogPinned:
                const updateDialogPinned = UpdateDialogPinned.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateDialogPinned);
                this.callUpdateHandler(updateDialogPinned.teamid || '0', update.constructor, updateDialogPinned);
                // Update pinned dialog
                this.mergeDialog(transaction.dialogs, {
                    peerid: updateDialogPinned.peer.id || '0',
                    peertype: updateDialogPinned.peer.type || 0,
                    pinned: updateDialogPinned.pinned,
                    teamid: updateDialogPinned.teamid || '0',
                });
                break;
            case C_MSG.UpdateDraftMessage:
                const updateDraftMessage = UpdateDraftMessage.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateDraftMessage);
                this.callUpdateHandler(updateDraftMessage.message.teamid || '0', update.constructor, updateDraftMessage);
                // Update dialog's draft
                this.mergeDialog(transaction.dialogs, {
                    draft: updateDraftMessage.message,
                    peerid: updateDraftMessage.message.peerid || '0',
                    peertype: updateDraftMessage.message.peertype || 0,
                    teamid: updateDraftMessage.message.teamid || '0',
                });
                break;
            case C_MSG.UpdateDraftMessageCleared:
                const updateDraftMessageCleared = UpdateDraftMessageCleared.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateDraftMessageCleared);
                this.callUpdateHandler(updateDraftMessageCleared.teamid || '0', update.constructor, updateDraftMessageCleared);
                // Remove dialog's draft
                this.mergeDialog(transaction.dialogs, {
                    draft: {},
                    peerid: updateDraftMessageCleared.peer.id || '0',
                    peertype: updateDraftMessageCleared.peer.type || 0,
                    teamid: updateDraftMessageCleared.teamid || '0',
                });
                break;
            /** Users **/
            case C_MSG.UpdateUsername:
                const updateUsername = UpdateUsername.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateUsername);
                this.callUpdateHandler('all', update.constructor, updateUsername);
                // Update user
                this.mergeUser(transaction.users, {
                    bio: updateUsername.bio,
                    firstname: updateUsername.firstname,
                    id: updateUsername.userid,
                    lastname: updateUsername.lastname,
                    phone: updateUsername.phone,
                    username: updateUsername.username,
                });
                if (this.apiManager) {
                    const connInfo = this.apiManager.getConnInfo();
                    connInfo.Phone = updateUsername.phone;
                    this.apiManager.setConnInfo(connInfo);
                }
                break;
            case C_MSG.UpdateUserPhoto:
                const updateUserPhoto = UpdateUserPhoto.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateUserPhoto);
                this.callUpdateHandler('all', update.constructor, updateUserPhoto);
                // Update user's photo
                this.mergeUser(transaction.users, {
                    id: updateUserPhoto.userid,
                    photo: updateUserPhoto.photo,
                    remove_photo: updateUserPhoto.photo === undefined,
                });
                break;
            case C_MSG.UpdateUserBlocked:
                const updateUserBlocked = UpdateUserBlocked.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateUserBlocked);
                this.callUpdateHandler('all', update.constructor, updateUserBlocked);
                // Update user block status
                this.mergeUser(transaction.users, {
                    blocked: updateUserBlocked.blocked,
                    id: updateUserBlocked.userid,
                });
                break;
            /** Groups **/
            case C_MSG.UpdateGroupPhoto:
                const updateGroupPhoto = UpdateGroupPhoto.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateGroupPhoto);
                this.callUpdateHandler('all', update.constructor, updateGroupPhoto);
                // Update group's photo
                this.mergeGroup(transaction.groups, {
                    id: updateGroupPhoto.groupid,
                    photo: updateGroupPhoto.photo,
                    remove_photo: updateGroupPhoto.photo === undefined,
                });
                break;
            case C_MSG.UpdateGroupParticipantAdd:
                const updateGroupParticipantAdd = UpdateGroupParticipantAdd.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateGroupParticipantAdd);
                this.callUpdateHandler('all', update.constructor, updateGroupParticipantAdd);
                // Set groups's need updated flag
                this.mergeGroup(transaction.groups, {
                    hasUpdate: true,
                    id: updateGroupParticipantAdd.groupid,
                });
                break;
            case C_MSG.UpdateGroupParticipantDeleted:
                const updateGroupParticipantDeleted = UpdateGroupParticipantDeleted.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateGroupParticipantDeleted);
                this.callUpdateHandler('all', update.constructor, updateGroupParticipantDeleted);
                // Set groups's need updated flag
                this.mergeGroup(transaction.groups, {
                    hasUpdate: true,
                    id: updateGroupParticipantDeleted.groupid,
                });
                break;
            /** Labels **/
            case C_MSG.UpdateLabelSet:
                const updateLabelSet = UpdateLabelSet.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateLabelSet);
                this.callUpdateHandler('all', update.constructor, updateLabelSet);
                // Add label
                updateLabelSet.labelsList.forEach((label) => {
                    this.mergeLabel(transaction.labels, label);
                });
                break;
            case C_MSG.UpdateLabelDeleted:
                const updateLabelDeleted = UpdateLabelDeleted.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateLabelDeleted);
                this.callUpdateHandler('all', update.constructor, updateLabelDeleted);
                // Remove label
                updateLabelDeleted.labelidsList.forEach((id) => {
                    this.removeLabel(transaction.labels, transaction.removedLabels, id);
                });
                break;
            case C_MSG.UpdateLabelItemsAdded:
                const updateLabelItemsAdded = UpdateLabelItemsAdded.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateLabelItemsAdded);
                this.callUpdateHandler(updateLabelItemsAdded.teamid || '0', update.constructor, updateLabelItemsAdded);
                // Update message label list
                updateLabelItemsAdded.messageidsList.forEach((id) => {
                    this.mergeMessage(transaction.messages, undefined, {
                        added_labels: uniq(updateLabelItemsAdded.labelidsList),
                        id,
                    });
                });
                // Update label list
                updateLabelItemsAdded.labelidsList.forEach((id) => {
                    // this.mergeLabel(transaction.labels, {
                    //     id,
                    //     increase_counter: updateLabelItemsAdded.messageidsList.length,
                    // });
                    transaction.labelRanges.push({
                        labelId: id,
                        mode: 'add',
                        msgIds: updateLabelItemsAdded.messageidsList,
                        peerid: updateLabelItemsAdded.peer.id || '0',
                        peertype: updateLabelItemsAdded.peer.type || 0,
                        teamId: updateLabelItemsAdded.teamid || '0',
                    });
                });
                // Add label
                updateLabelItemsAdded.labelsList.forEach((label: ILabel) => {
                    label.teamid = updateLabelItemsAdded.teamid || '0';
                    this.mergeLabel(transaction.labels, label);
                });
                break;
            case C_MSG.UpdateLabelItemsRemoved:
                const updateLabelItemsRemoved = UpdateLabelItemsRemoved.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateLabelItemsRemoved);
                this.callUpdateHandler(updateLabelItemsRemoved.teamid || '0', update.constructor, updateLabelItemsRemoved);
                // Update message label list
                updateLabelItemsRemoved.messageidsList.forEach((id) => {
                    this.mergeMessage(transaction.messages, undefined, {
                        id,
                        removed_labels: uniq(updateLabelItemsRemoved.labelidsList),
                    });
                });
                // Update label list
                updateLabelItemsRemoved.labelidsList.forEach((id) => {
                    // this.mergeLabel(transaction.labels, {
                    //     id,
                    //     increase_counter: -updateLabelItemsRemoved.messageidsList.length,
                    // });
                    transaction.labelRanges.push({
                        labelId: id,
                        mode: 'remove',
                        msgIds: updateLabelItemsRemoved.messageidsList,
                        peerid: updateLabelItemsRemoved.peer.id || '0',
                        peertype: updateLabelItemsRemoved.peer.type || 0,
                        teamId: updateLabelItemsRemoved.teamid || '0',
                    });
                });
                // Add label
                updateLabelItemsRemoved.labelsList.forEach((label: ILabel) => {
                    label.teamid = updateLabelItemsRemoved.teamid || '0';
                    this.mergeLabel(transaction.labels, label);
                });
                break;
            case C_MSG.UpdateReaction:
                const updateReaction = UpdateReaction.deserializeBinary(data).toObject();
                updateReaction.counterList = modifyReactions(updateReaction.counterList || []);
                this.logVerbose(update.constructor, updateReaction);
                this.callUpdateHandler(updateReaction.teamid || '0', update.constructor, updateReaction);
                // Update message
                this.mergeMessage(transaction.messages, undefined, {
                    id: updateReaction.messageid,
                    reaction_updated: true,
                    reactionsList: updateReaction.counterList,
                    yourreactionsList: updateReaction.yourreactionsList,
                });
                // Update edited message list
                transaction.editedMessageIds.push(updateReaction.messageid || 0);
                break;
            case C_MSG.UpdateMessagePinned:
                const updateMessagePinned = UpdateMessagePinned.deserializeBinary(data).toObject();
                this.logVerbose(update.constructor, updateMessagePinned);
                this.callUpdateHandler(updateMessagePinned.teamid || '0', update.constructor, updateMessagePinned);
                this.mergeDialog(transaction.dialogs, {
                    peerid: updateMessagePinned.peer.id || '0',
                    peertype: updateMessagePinned.peer.type || 0,
                    pinnedmessageid: updateMessagePinned.msgid || 0,
                    teamid: updateMessagePinned.teamid || '0',
                });
                break;
            default:
                break;
        }
    }

    private mergeDialog(dialogs: { [key: string]: IDialog }, dialog: IDialog) {
        const dialogId = `${dialog.teamid || '0'}_${dialog.peerid || '0'}_${dialog.peertype || '0'}`;
        const d = dialogs[dialogId];
        if (d) {
            if ((d.readinboxmaxid || 0) > (dialog.readinboxmaxid || 0)) {
                dialog.readinboxmaxid = (d.readinboxmaxid || 0);
            }
            if ((d.readoutboxmaxid || 0) > (dialog.readoutboxmaxid || 0)) {
                dialog.readoutboxmaxid = (d.readoutboxmaxid || 0);
            }
            if (dialog.topmessageid) {
                if (dialog.force || dialog.topmessageid > (d.topmessageid || 0)) {
                    dialogs[dialogId] = kMerge(d, dialog);
                }
            } else {
                dialogs[dialogId] = kMerge(d, dialog);
            }
        } else {
            dialogs[dialogId] = dialog;
        }
    }

    private removeDialog(dialogs: { [key: string]: IDialog }, peerId: string) {
        delete dialogs[peerId];
    }

    private mergeMessage(messages: { [key: number]: IMessage }, incomingIds: { [key: string]: number[] } | undefined, message: IMessage) {
        const m = messages[message.id || 0];
        if (m) {
            if (m.added_labels) {
                m.added_labels = uniq([...(m.added_labels || []), ...(message.added_labels || [])]);
            }
            if (m.removed_labels) {
                m.removed_labels = uniq([...(m.removed_labels || []), ...(message.removed_labels || [])]);
            }
            messages[m.id || 0] = kMerge(m, message);
        } else {
            messages[message.id || 0] = message;
        }
        if (incomingIds && !message.me) {
            const peerName = GetPeerName(message.peerid, message.peertype);
            if (!incomingIds.hasOwnProperty(peerName)) {
                incomingIds[peerName] = [];
            }
            incomingIds[peerName].push(message.id || 0);
        }
    }

    private removeMessage(messages: { [key: number]: IMessage }, id: number) {
        delete messages[id];
    }

    private mergeUser(users: { [key: string]: IUser }, user: IUser) {
        const u = users[user.id || ''];
        if (u) {
            users[u.id || ''] = kMerge(u, user);
        } else {
            users[user.id || ''] = user;
        }
    }

    // @ts-ignore
    private removeUser(users: { [key: string]: IUser }, id: string) {
        delete users[id];
    }

    private mergeGroup(groups: { [key: string]: IGroup }, group: IGroup) {
        const g = groups[group.id || ''];
        if (g) {
            groups[g.id || ''] = kMerge(g, group);
        } else {
            groups[group.id || ''] = group;
        }
    }

    // @ts-ignore
    private removeGroup(groups: { [key: string]: IUser }, id: string) {
        delete groups[id];
    }

    private mergeLabel(labels: { [key: number]: ILabel }, label: ILabel) {
        const l = labels[label.id || ''];
        if (l) {
            if (label.increase_counter) {
                label.increase_counter += label.increase_counter;
            }
            labels[l.id || ''] = kMerge(l, label);
        } else {
            labels[label.id || 0] = label;
        }
    }

    private removeLabel(labels: { [key: number]: ILabel }, removedLabels: number[], id: number) {
        delete labels[id];
        removedLabels.push(id);
    }

    private queueTransaction(transaction: ITransactionPayload) {
        if (this.transactionList.length === 0 && !this.queueBusy) {
            this.queueBusy = true;
            this.preProcessTransaction(transaction);
            return;
        }
        this.transactionList.push(transaction);
        this.applyTransactions();
    }

    private applyTransactions() {
        if (!this.queueBusy && this.transactionList.length > 0) {
            const transaction = this.transactionList.shift();
            if (transaction) {
                this.queueBusy = true;
                this.preProcessTransaction(transaction);
            }
        }
    }

    private preProcessTransaction(transaction: ITransactionPayload, doneFn?: any) {
        if (this.messageRepo && Object.keys(transaction.removedMessages).length > 0) {
            const ids: number[] = [];
            Object.values(transaction.removedMessages).forEach((removedMessage) => {
                ids.push(...removedMessage);
            });
            return this.messageRepo.getIn(ids, true).then((res) => {
                res.forEach((msg) => {
                    if (msg.labelidsList && msg.labelidsList.length > 0) {
                        msg.labelidsList.forEach((labelId) => {
                            this.mergeLabel(transaction.labels, {
                                id: labelId,
                                increase_counter: -1,
                                teamid: msg.teamid || '0',
                            });
                        });
                    }
                });
                return this.processTransaction(transaction, doneFn);
            }).catch((err) => {
                window.console.log('preProcessTransaction', err);
                return this.processTransaction(transaction, doneFn);
            });
        } else {
            return this.processTransaction(transaction, doneFn);
        }
    }

    private processTransaction(transaction: ITransactionPayload, doneFn?: any) {
        return new Promise((transactionResolve) => {
            const promises: any[] = [];
            // User list
            const userList: IUser[] = [];
            Object.values(transaction.users).forEach((user) => {
                userList.push(user);
            });
            if (userList.length > 0 && this.userRepo) {
                promises.push(this.userRepo.importBulk(false, userList));
            }
            // Group list
            const groupList: IGroup[] = [];
            Object.values(transaction.groups).forEach((group) => {
                groupList.push(group);
            });
            if (groupList.length > 0 && this.groupRepo) {
                promises.push(this.groupRepo.importBulk(groupList));
            }
            // Label list
            const labelList: ILabel[] = [];
            Object.values(transaction.labels).forEach((label) => {
                labelList.push(label);
            });
            if (labelList.length > 0 && this.labelRepo) {
                promises.push(this.labelRepo.importBulk(labelList));
            }
            if (transaction.removedLabels.length > 0 && this.labelRepo) {
                promises.push(this.labelRepo.removeMany(transaction.removedLabels));
            }
            // Message list
            if (Object.keys(transaction.messages).length > 0) {
                promises.push(this.applyMessages(transaction.messages, transaction.editedMessageIds, transaction.randomMessageIds).then((res) => {
                    if (!transaction.live) {
                        this.callHandlers('all', C_MSG.UpdateMessageDB, res);
                    }
                    return res;
                }));
            }
            // Removed message list
            if (Object.keys(transaction.removedMessages).length > 0) {
                promises.push(this.applyRemovedMessages(transaction.removedMessages).then((res) => {
                    if (!transaction.live) {
                        this.callHandlers('all', C_MSG.UpdateMessageDBRemoved, res);
                    }
                    return res;
                }));
            }
            // Dialog list (conditional)
            if (transaction.toCheckDialogIds.length === 0) {
                promises.push(this.applyDialogs(transaction.dialogs).then((peers) => {
                    if (!transaction.live) {
                        this.callHandlers('all', C_MSG.UpdateDialogDB, {
                            counters: transaction.lastOne,
                            incomingIds: transaction.incomingIds,
                            peers,
                        });
                    }
                    return peers;
                }));
            }
            // Gif list
            if (this.gifRepo && transaction.gifs.length > 0) {
                promises.push(this.gifRepo.updateGifUseBulk(transaction.gifs));
            }
            // Top Peers
            if (this.topPeerRepo && transaction.topPeers.length > 0) {
                promises.push(this.topPeerRepo.importBulkEmbedType(transaction.topPeers));
            }
            if (promises.length > 0) {
                Promise.all(promises).then(() => {
                    this.processTransactionStep2(transaction, transactionResolve, doneFn);
                }).catch((err) => {
                    window.console.log('processTransaction', err);
                });
            } else {
                this.processTransactionStep2(transaction, transactionResolve, doneFn);
            }
        });
    }

    private processTransactionStep2(transaction: ITransactionPayload, transactionResolve: any, doneFn?: any) {
        const promises: any[] = [];
        if (transaction.clearDialogs.length > 0) {
            promises.push(this.applyClearDialogs(transaction.clearDialogs));
        }
        if (transaction.labelRanges.length > 0) {
            promises.push(this.applyLabelRange(transaction.labelRanges));
        }
        if (promises.length > 0) {
            Promise.all(promises).then(() => {
                this.processTransactionStep3(transaction, transactionResolve, doneFn);
            }).catch((err) => {
                window.console.log('processTransaction2', err);
            });
        } else {
            this.processTransactionStep3(transaction, transactionResolve, doneFn);
        }
    }

    private processTransactionStep3(transaction: ITransactionPayload, transactionResolve: any, doneFn?: any) {
        if (transaction.toCheckDialogIds.length > 0 && this.dialogRepo) {
            const lastMessagePromise: any[] = [];
            transaction.toCheckDialogIds.forEach((toCheck) => {
                if (this.messageRepo) {
                    lastMessagePromise.push(this.messageRepo.getLastMessage(toCheck.teamid, toCheck.peerid, toCheck.peertype));
                }
            });
            const messagePromise = Promise.all(lastMessagePromise).then((arr) => {
                arr.forEach((msg: IMessage | undefined) => {
                    if (msg) {
                        const messageTitle = getMessageTitle(msg);
                        this.mergeDialog(transaction.dialogs, {
                            action_code: msg.messageaction,
                            action_data: msg.actiondata,
                            force: true,
                            last_update: (msg.editedon || 0) > 0 ? msg.editedon : msg.createdon,
                            peerid: msg.peerid || '0',
                            peertype: msg.peertype || 0,
                            pinnedmessageid: undefined,
                            preview: messageTitle.text,
                            preview_icon: messageTitle.icon,
                            preview_me: (this.userId === msg.senderid),
                            preview_rtl: msg.rtl,
                            saved_messages: (this.userId === msg.peerid),
                            sender_id: msg.senderid,
                            teamid: msg.teamid || '0',
                            topmessageid: msg.id,
                        });
                    }
                });
                return Promise.resolve();
            });
            const dialogPromise = this.dialogRepo.getIn(transaction.toCheckDialogIds.map(o => [o.teamid, o.peerid, o.peertype])).then((dialogs) => {
                dialogs.forEach((dialog) => {
                    if (!dialog) {
                        return;
                    }
                    const peerName = GetPeerName(dialog.peerid, dialog.peertype);
                    if (transaction.removedMessages.hasOwnProperty(peerName) && transaction.removedMessages[peerName].indexOf(dialog.pinnedmessageid || 0) > -1) {
                        this.mergeDialog(transaction.dialogs, {
                            peerid: dialog.peerid || '0',
                            peertype: dialog.peertype || 0,
                            pinnedmessageid: 0,
                            teamid: dialog.teamid || '0',
                        });
                    }
                });
                return Promise.resolve();
            });
            Promise.all([messagePromise, dialogPromise]).then(() => {
                return this.applyDialogs(transaction.dialogs).then((peers) => {
                    this.callHandlers('all', C_MSG.UpdateDialogDB, {
                        counters: transaction.live ? true : transaction.lastOne,
                        incomingIds: transaction.incomingIds,
                        peers,
                    });
                    this.processTransactionStep4(transaction, transactionResolve, doneFn);
                    return Promise.resolve();
                });
            }).catch((err) => {
                window.console.log('processTransactionStep3', err);
            });
        } else {
            this.processTransactionStep4(transaction, transactionResolve, doneFn);
        }
    }

    private processTransactionStep4(transaction: ITransactionPayload, transactionResolve: any, doneFn?: any) {
        if (transaction.updateId) {
            this.setLastUpdateId(transaction.updateId);
            this.flushLastUpdateId();
            if (doneFn) {
                doneFn();
            }
        }
        if (!doneFn) {
            this.queueBusy = false;
            this.applyTransactions();
        }
        transactionResolve();
    }

    private applyClearDialogs(list: IClearDialog[]) {
        const promises: any[] = [];
        list.forEach((item) => {
            if (item.remove && this.dialogRepo) {
                promises.push(this.dialogRepo.remove(item.teamId, item.peerId, item.peerType));
            }
            if (item.maxId > 0 && this.messageRepo) {
                promises.push(this.messageRepo.clearHistory(item.teamId, item.peerId, item.peerType, item.maxId));
            }
        });
        return Promise.all(promises);
    }

    private applyDialogs(dialogs: { [key: string]: IDialog }): Promise<IPeer[]> {
        const dialogList: IDialog[] = [];
        const peers: IPeer[] = [];
        Object.values(dialogs).forEach((dialog) => {
            peers.push({
                id: dialog.peerid || '0',
                peerType: dialog.peertype || 0,
            });
            dialogList.push(dialog);
        });
        if (dialogList.length > 0 && this.dialogRepo) {
            window.console.log(dialogList);
            return this.dialogRepo.importBulk(dialogList).then(() => {
                return peers;
            });
        } else {
            return Promise.resolve(peers);
        }
    }

    private applyMessages(messages: { [key: number]: IMessage }, editedMessageIds: number[], randomMessageIds: number[]): Promise<IMessageDBUpdated> {
        const messageList: IMessage[] = [];
        const keys: number[] = [];
        const peerNames: string[] = [];
        const peers: IPeer[] = [];
        const minIdPerPeer: { [key: string]: number } = {};
        const myMessageList: IMessage[] = [];
        Object.values(messages).forEach((message) => {
            if (!message.id) {
                return;
            }
            const peerName = GetPeerName(message.peerid, message.peertype);
            messageList.push(message);
            keys.push(message.id);
            if (!peerNames[peerName]) {
                peerNames.push(peerName);
                peers.push({
                    id: message.peerid || '',
                    peerType: message.peertype || 0,
                });
            }
            if (message && message.id) {
                if (minIdPerPeer.hasOwnProperty(peerName)) {
                    minIdPerPeer[peerName] = message.id;
                } else {
                    if (minIdPerPeer[peerName] > message.id) {
                        minIdPerPeer[peerName] = message.id;
                    }
                }
                if (message.senderid === this.userId) {
                    myMessageList.push(message);
                }
            }
        });
        if (myMessageList.length > 0) {
            setTimeout(() => {
                this.modifyPendingMessages(randomMessageIds, myMessageList);
            }, 1024);
        }
        if (messageList.length > 0 && this.messageRepo) {
            return this.messageRepo.importBulk(messageList).then(() => {
                return {
                    editedIds: uniq(editedMessageIds),
                    ids: keys,
                    minIds: minIdPerPeer,
                    peerNames,
                    peers,
                    randomIds: randomMessageIds,
                };
            });
        } else {
            return Promise.resolve({
                editedIds: uniq(editedMessageIds),
                ids: keys,
                minIds: minIdPerPeer,
                peerNames,
                peers,
                randomIds: randomMessageIds,
            });
        }
    }

    private modifyPendingMessages(randomMessageIds: number[], messages: IMessage[]) {
        return new Promise((resolve, reject) => {
            const messageRepo = this.messageRepo;
            if (!messageRepo) {
                reject();
                return;
            }
            const messageMap: { [key: number]: IMessage } = {};
            messages.forEach((message, index) => {
                messageMap[randomMessageIds[index] || 0] = message;
            });
            messageRepo.getPendingByIds(randomMessageIds).then((pendingArr) => {
                messageRepo.removePendingByIds(randomMessageIds);
                messageRepo.removeManyByRandomId(randomMessageIds);
                if (pendingArr) {
                    const toModifyTempList: IModifyTempFile[] = [];
                    pendingArr.forEach((pending) => {
                        if (pending.file_ids && pending.file_ids.length > 0 && messageMap.hasOwnProperty(pending.id)) {
                            toModifyTempList.push({
                                fileNames: pending.file_ids.map(o => GetDbFileName(o, 0)),
                                message: messageMap[pending.id],
                            });
                        }
                    });
                    if (toModifyTempList.length > 0) {
                        this.modifyTempFiles(toModifyTempList);
                    }
                    resolve();
                } else {
                    resolve();
                }
            });
        });
    }

    /* Modify temp chunks */
    private modifyTempFiles(list: IModifyTempFile[]) {
        const messageRepo = this.messageRepo;
        const fileRepo = this.fileRepo;
        const cachedFileService = this.cachedFileService;
        if (!messageRepo || !fileRepo || !cachedFileService) {
            return;
        }
        const persistFilePromises: any[] = [];
        const messages: IMessage[] = [];
        const fileMapList: IFileMap[] = [];
        list.forEach((item) => {
            const mediaDocument = getMediaDocument(item.message);
            if (mediaDocument && mediaDocument.doc && mediaDocument.doc.id) {
                const mediaFileName = GetDbFileName(mediaDocument.doc.id, mediaDocument.doc.clusterid);
                persistFilePromises.push(fileRepo.persistTempFiles(item.fileNames[0], mediaFileName, mediaDocument.doc.mimetype || 'application/octet-stream'));
                cachedFileService.swap(item.fileNames[0], {
                    accesshash: mediaDocument.doc.accesshash,
                    clusterid: mediaDocument.doc.clusterid,
                    fileid: mediaDocument.doc.id,
                    version: 0,
                });
                // Check thumbnail
                if (item.fileNames.length > 1 && mediaDocument.doc.thumbnail) {
                    persistFilePromises.push(fileRepo.persistTempFiles(item.fileNames[1], GetDbFileName(mediaDocument.doc.thumbnail.fileid, mediaDocument.doc.thumbnail.clusterid), 'image/jpeg'));
                    cachedFileService.swap(item.fileNames[0], mediaDocument.doc.thumbnail);
                }
                item.message.downloaded = true;
                messages.push(item.message);
                if (mediaDocument && mediaDocument.doc && mediaDocument.doc.id) {
                    fileMapList.push({
                        id: mediaFileName,
                        msg_ids: [item.message.id || 0],
                    });
                }
            }
        });
        Promise.all(persistFilePromises).then(() => {
            if (messages.length > 0) {
                messageRepo.importBulk(messages).then(() => {
                    const data: IMessageIdDBUpdated = {
                        peerNames: {},
                    };
                    messages.forEach((message) => {
                        const peerName = GetPeerName(message.peerid, message.peertype);
                        if (data.peerNames && data.peerNames.hasOwnProperty(peerName)) {
                            data.peerNames[peerName].push(message.id || 0);
                        } else {
                            data.peerNames[peerName] = [message.id || 0];
                        }
                    });
                    this.callHandlers('all', C_MSG.UpdateMessageIdDB, data);
                });
            }
            if (fileMapList.length > 0) {
                fileRepo.upsertFileMap(fileMapList);
            }
        });
    }

    private applyRemovedMessages(removedMessages: { [key: string]: number[] }): Promise<IMessageDBRemoved> {
        const peerNames = Object.keys(removedMessages);
        const ids: number[] = [];
        Object.values(removedMessages).forEach((removedMessage) => {
            ids.push(...removedMessage);
        });
        if (ids.length > 0 && this.messageRepo) {
            return this.messageRepo.removeMany(ids).then(() => {
                return {
                    ids,
                    listPeer: removedMessages,
                    peerNames,
                };
            });
        } else {
            return Promise.resolve({
                ids,
                listPeer: {},
                peerNames,
            });
        }
    }

    private applyLabelRange(list: ILabelRange[]) {
        const newList = cloneDeep(list);
        const fn = (resolve: any, reject: any) => {
            const item = newList.shift();
            if (item && this.labelRepo) {
                if (item.mode === 'add') {
                    this.labelRepo.insertInRange(item.teamId, item.labelId, item.peerid, item.peertype, item.msgIds).then(() => {
                        fn(resolve, resolve);
                    }).catch(reject);
                } else {
                    this.labelRepo.removeFromRange(item.teamId, item.labelId, item.msgIds).then(() => {
                        fn(resolve, resolve);
                    }).catch(reject);
                }
            } else {
                resolve();
            }
        };
        return new Promise((resolve, reject) => {
            fn(resolve, reject);
        });
    }

    private callUpdateHandler(teamId: string, eventConstructor: number, data: any) {
        let ok = !this.isLive;
        if (this.isLive && (this.teamId === teamId || teamId === 'all')) {
            try {
                if (eventConstructor === C_MSG.UpdateNewMessage && this.randomIdMap.hasOwnProperty((data as UpdateNewMessage.AsObject).senderrefid || 0)) {
                    ok = this.callHandlers(teamId, C_MSG.UpdateNewMessageDrop, data);
                    if ((data as UpdateNewMessage.AsObject).senderrefid) {
                        this.toDeleteRandomIds.push((data as UpdateNewMessage.AsObject).senderrefid || 0);
                    }
                } else {
                    ok = this.callHandlers(teamId, eventConstructor, data);
                }
            } catch (e) {
                window.console.warn(e);
            }
        }
        return ok;
    }

    private callHandlers(teamId: string, eventConstructor: number, data: any) {
        if ((this.teamId !== teamId && teamId !== 'all') || !this.listenerList[eventConstructor]) {
            return false;
        }
        Object.values(this.listenerList[eventConstructor]).forEach((fn) => {
            if (fn) {
                fn(data);
            }
        });
        return true;
    }

    private logVerbose(constructor: number | undefined, data: any) {
        if (this.verboseAPI) {
            if (constructor === C_MSG.UpdateNewMessage || constructor === C_MSG.UpdateMessageEdited) {
                const dd = cloneDeep(data);
                dd.body = 'filtered';
                window.console.info('%cUpdate', 'background-color: #AA8A00', C_MSG_NAME[constructor || 0], dd);
            } else {
                window.console.info('%cUpdate', 'background-color: #AA8A00', C_MSG_NAME[constructor || 0], data);
            }
        }
    }
}
