/*
    Creation Time: 2020 - Feb - 10
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {C_MSG} from '../const';
import {
    UpdateContainer,
    UpdateEnvelope,
    UserStatus
} from '../messages/chat.core.types_pb';
import {
    UpdateDialogPinned, UpdateDifference,
    UpdateDraftMessage, UpdateDraftMessageCleared, UpdateGroupParticipantAdd, UpdateGroupParticipantDeleted,
    UpdateGroupPhoto, UpdateLabelDeleted, UpdateLabelItemsAdded, UpdateLabelItemsRemoved, UpdateLabelSet,
    UpdateMessageEdited,
    UpdateMessageID,
    UpdateMessagesDeleted,
    UpdateNewMessage,
    UpdateNotifySettings,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox,
    UpdateReadMessagesContents, UpdateUserBlocked,
    UpdateUsername,
    UpdateUserPhoto,
    UpdateUserTyping,
} from '../messages/chat.api.updates_pb';
import {uniq, cloneDeep} from 'lodash';
import MessageRepo from '../../../repository/message';
import {base64ToU8a} from '../fileManager/http/utils';
import {IDialog} from "../../../repository/dialog/interface";
import {IMessage} from "../../../repository/message/interface";
import {IUser} from "../../../repository/user/interface";
import {C_MESSAGE_ACTION} from "../../../repository/message/consts";
import {getMessageTitle} from "../../../components/Dialog/utils";
import {kMerge} from "../../utilities/kDash";
import APIManager from "../index";
import {ILabel} from "../../../repository/label/interface";
import {IGroup} from "../../../repository/group/interface";
import DialogRepo from "../../../repository/dialog";
import UserRepo from "../../../repository/user";
import GroupRepo from "../../../repository/group";
import LabelRepo from "../../../repository/label";

const C_MAX_UPDATE_DIFF = 5000;
const C_DIFF_AMOUNT = 100;

export interface IDialogDBUpdated {
    counters: boolean;
    ids: string[];
    incomingIds: { [key: string]: number[] };
}

export interface IMessageDBUpdated {
    editedIds: number[];
    ids: number[];
    minIds: { [key: string]: number };
    peerIds: string[];
}

export interface IMessageDBRemoved {
    ids: number[];
    listPeer: { [key: string]: number[] };
    peerIds: string[];
}

interface IUpdateContainer extends UpdateContainer.AsObject {
    lastOne?: boolean;
}

interface ILabelRange {
    labelId: number;
    peerid: string;
    peertype: number;
    msgIds: number[];
    mode: 'add' | 'remove';
}

interface IClearDialog {
    maxId: number;
    peerId: string;
    remove: boolean;
}

interface ITransactionPayload {
    clearDialogs: IClearDialog[];
    dialogs: { [key: string]: IDialog };
    editedMessageIds: number[];
    flushDb: boolean;
    groups: { [key: string]: IGroup };
    incomingIds: { [key: string]: number[] };
    labelRanges: ILabelRange[];
    labels: { [key: number]: ILabel };
    lastOne?: boolean;
    live: boolean;
    messages: { [key: number]: IMessage };
    removedMessages: { [key: string]: number[] };
    toCheckDialogIds: string[];
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

    // Flags and counters
    private isLive: boolean = true;
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
    private messageIdMap: { [key: number]: boolean } = {};

    // Live update out of sync variables
    private outOfSync: boolean = false;
    private outOfSyncTimeout: any = null;

    // Transaction vars
    private transactionList: ITransactionPayload[] = [];

    // Repositories
    private dialogRepo: DialogRepo | undefined;
    private messageRepo: MessageRepo | undefined;
    private userRepo: UserRepo | undefined;
    private groupRepo: GroupRepo | undefined;
    private labelRepo: LabelRepo | undefined;

    // SDK
    private apiManager: APIManager | undefined;

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

            // Initialize SDK
            this.apiManager = APIManager.getInstance();
        }, 100);
    }

    /* Loads last update id form localStorage */
    public loadLastUpdateId(): number {
        const data = localStorage.getItem('river.last_update_id');
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
        localStorage.setItem('river.last_update_id', JSON.stringify({
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
        try {
            const data = UpdateContainer.deserializeBinary(base64ToU8a(bytes)).toObject();
            if (!this.isLive) {
                return;
            }
            const minId = data.minupdateid || 0;
            const maxId = data.maxupdateid || 0;
            window.console.debug('on update, current:', this.internalUpdateId, 'min:', minId, 'max:', maxId);
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
        this.callHandlers(C_MSG.UpdateAuthorizationReset, {});
    }

    public disableLiveUpdate() {
        this.isLive = false;
    }

    public enableLiveUpdate() {
        this.isLive = true;
    }

    /* Set message id from API */
    public setMessageId(messageId: number) {
        this.messageIdMap[messageId] = true;
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
                window.console.warn(err2);
                this.enableLiveUpdate();
                this.isDiffUpdating = false;
                this.callHandlers(C_MSG.UpdateManagerStatus, {
                    isUpdating: false,
                });
                if (err2.code === -1) {
                    this.canSync().then(() => {
                        this.disableLiveUpdate();
                        this.isDiffUpdating = true;
                        this.callHandlers(C_MSG.UpdateManagerStatus, {
                            isUpdating: true,
                        });
                    }).catch(() => {
                        this.enableLiveUpdate();
                        if (this.isDiffUpdating) {
                            this.isDiffUpdating = false;
                            this.callHandlers(C_MSG.UpdateManagerStatus, {
                                isUpdating: false,
                            });
                        }
                    });
                }
            });
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
                //
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
        this.canSync().then(() => {
            this.disableLiveUpdate();
        }).catch(() => {
            this.enableLiveUpdate();
        });
    }

    private responseUpdateMessageID(update: UpdateEnvelope.AsObject) {
        // @ts-ignore
        const data: Uint8Array = update.update;
        if (update.constructor === C_MSG.UpdateMessageID) {
            const updateMessageId = UpdateMessageID.deserializeBinary(data).toObject();
            this.messageIdMap[updateMessageId.messageid || 0] = true;
            this.callHandlers(C_MSG.UpdateMessageID, updateMessageId);
        }
    }

    private processContainer(data: IUpdateContainer, live: boolean, doneFn?: any) {
        const transaction: ITransactionPayload = {
            clearDialogs: [],
            dialogs: {},
            editedMessageIds: [],
            flushDb: false,
            groups: {},
            incomingIds: {},
            labelRanges: [],
            labels: {},
            lastOne: data.lastOne || false,
            live,
            messages: {},
            removedMessages: {},
            toCheckDialogIds: [],
            updateId: data.maxupdateid || 0,
            users: {},
        };
        data.usersList.forEach((user) => {
            this.mergeUser(transaction.users, user);
        });
        data.groupsList.forEach((group) => {
            this.mergeGroup(transaction.groups, group);
        });
        data.updatesList.forEach((update) => {
            this.process(transaction, update);
        });
        if (doneFn) {
            this.processTransaction(transaction, doneFn);
        } else {
            this.queueTransaction(transaction);
        }
    }

    private processZeroContainer(data: UpdateContainer.AsObject) {
        data.updatesList.forEach((update) => {
            switch (update.constructor) {
                /** System **/
                case C_MSG.UpdateUserTyping:
                    this.callHandlers(C_MSG.UpdateUserTyping, UpdateUserTyping.deserializeBinary(update.update as Uint8Array).toObject());
                    break;
                case C_MSG.UpdateAuthorizationReset:
                    this.callHandlers(C_MSG.UpdateAuthorizationReset, {});
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
                this.callHandlers(C_MSG.UpdateUserTyping, UpdateUserTyping.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateTooLong:
                this.callOutOfSync();
                break;
            case C_MSG.UpdateAuthorizationReset:
                this.callHandlers(C_MSG.UpdateAuthorizationReset, {});
                break;
            /** Messages **/
            case C_MSG.UpdateNewMessage:
                const updateNewMessage = UpdateNewMessage.deserializeBinary(data).toObject();
                const message = MessageRepo.parseMessage(updateNewMessage.message, this.userId);
                updateNewMessage.message = message;
                this.callUpdateHandler(update.constructor, updateNewMessage);
                // Add message
                this.mergeMessage(transaction.messages, transaction.incomingIds, message);
                // Check [deleted dialog]/[clear history]
                if (message.messageaction === C_MESSAGE_ACTION.MessageActionClearHistory) {
                    transaction.clearDialogs.push({
                        maxId: message.actiondata.maxid || 0,
                        peerId: message.peerid || '',
                        remove: message.actiondata.pb_delete || false,
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
                    peerid: message.peerid,
                    peertype: message.peertype,
                    preview: messageTitle.text,
                    preview_icon: messageTitle.icon,
                    preview_me: this.userId === message.senderid,
                    preview_rtl: message.rtl,
                    saved_messages: this.userId === message.peerid,
                    sender_id: message.senderid,
                    topmessageid: message.id,
                });
                // Update user status
                this.mergeUser(transaction.users, {
                    id: updateNewMessage.sender.id,
                    status: UserStatus.USERSTATUSONLINE,
                    status_last_modified: message.createdon,
                });
                break;
            case C_MSG.UpdateMessageEdited:
                const updateMessageEdited = UpdateMessageEdited.deserializeBinary(data).toObject();
                updateMessageEdited.message = MessageRepo.parseMessage(updateMessageEdited.message, this.userId);
                this.callUpdateHandler(update.constructor, updateMessageEdited);
                // Update message
                this.mergeMessage(transaction.messages, undefined, updateMessageEdited.message);
                // Update edited message list
                transaction.editedMessageIds.push(updateMessageEdited.message.id || 0);
                // Update to check list
                transaction.toCheckDialogIds.push(updateMessageEdited.message.peerid || '');
                break;
            case C_MSG.UpdateMessagesDeleted:
                const updateMessagesDeleted = UpdateMessagesDeleted.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateMessagesDeleted);
                // Delete message(s)
                updateMessagesDeleted.messageidsList.forEach((id) => {
                    this.removeMessage(transaction.messages, id);
                    if (updateMessagesDeleted.peer) {
                        if (!transaction.removedMessages.hasOwnProperty(updateMessagesDeleted.peer.id || '')) {
                            transaction.removedMessages[updateMessagesDeleted.peer.id || ''] = [id];
                        } else {
                            transaction.removedMessages[updateMessagesDeleted.peer.id || ''].push(id);
                        }
                    }
                });
                // Update to check list
                if (updateMessagesDeleted.peer) {
                    transaction.toCheckDialogIds.push(updateMessagesDeleted.peer.id || '');
                }
                break;
            case C_MSG.UpdateReadMessagesContents:
                const updateReadMessagesContents = UpdateReadMessagesContents.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateReadMessagesContents);
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
                this.callUpdateHandler(update.constructor, updateReadHistoryInbox);
                // Update dialog readinboxmaxid
                this.mergeDialog(transaction.dialogs, {
                    peerid: updateReadHistoryInbox.peer.id,
                    readinboxmaxid: updateReadHistoryInbox.maxid,
                });
                break;
            case C_MSG.UpdateReadHistoryOutbox:
                const updateReadHistoryOutbox = UpdateReadHistoryOutbox.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateReadHistoryOutbox);
                // Update dialog readoutboxmaxid
                this.mergeDialog(transaction.dialogs, {
                    peerid: updateReadHistoryOutbox.peer.id,
                    readoutboxmaxid: updateReadHistoryOutbox.maxid
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
                this.callUpdateHandler(update.constructor, updateNotifySettings);
                // Update dialog notification
                this.mergeDialog(transaction.dialogs, {
                    accesshash: updateNotifySettings.notifypeer.accesshash,
                    notifysettings: updateNotifySettings.settings,
                    peerid: updateNotifySettings.notifypeer.id,
                });
                break;
            case C_MSG.UpdateDialogPinned:
                const updateDialogPinned = UpdateDialogPinned.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateDialogPinned);
                // Update pinned dialog
                this.mergeDialog(transaction.dialogs, {
                    peerid: updateDialogPinned.peer.id,
                    pinned: updateDialogPinned.pinned,
                });
                break;
            case C_MSG.UpdateDraftMessage:
                const updateDraftMessage = UpdateDraftMessage.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateDraftMessage);
                // Update dialog's draft
                this.mergeDialog(transaction.dialogs, {
                    draft: updateDraftMessage.message,
                    peerid: updateDraftMessage.message.peerid,
                });
                break;
            case C_MSG.UpdateDraftMessageCleared:
                const updateDraftMessageCleared = UpdateDraftMessageCleared.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateDraftMessageCleared);
                // Remove dialog's draft
                this.mergeDialog(transaction.dialogs, {
                    draft: {},
                    peerid: updateDraftMessageCleared.peer.id,
                });
                break;
            /** Users **/
            case C_MSG.UpdateUsername:
                const updateUsername = UpdateUsername.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateUsername);
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
                this.callUpdateHandler(update.constructor, updateUserPhoto);
                // Update user's photo
                this.mergeUser(transaction.users, {
                    id: updateUserPhoto.userid,
                    photo: updateUserPhoto.photo,
                    remove_photo: updateUserPhoto.photo === undefined,
                });
                break;
            case C_MSG.UpdateUserBlocked:
                const updateUserBlocked = UpdateUserBlocked.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateUserBlocked);
                // Update user block status
                this.mergeUser(transaction.users, {
                    blocked: updateUserBlocked.blocked,
                    id: updateUserBlocked.userid,
                });
                break;
            /** Groups **/
            case C_MSG.UpdateGroupPhoto:
                const updateGroupPhoto = UpdateGroupPhoto.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateGroupPhoto);
                // Update group's photo
                this.mergeGroup(transaction.groups, {
                    id: updateGroupPhoto.groupid,
                    photo: updateGroupPhoto.photo,
                    remove_photo: updateGroupPhoto.photo === undefined,
                });
                break;
            case C_MSG.UpdateGroupParticipantAdd:
                const updateGroupParticipantAdd = UpdateGroupParticipantAdd.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateGroupParticipantAdd);
                // Set groups's need updated flag
                this.mergeGroup(transaction.groups, {
                    hasUpdate: true,
                    id: updateGroupParticipantAdd.groupid,
                });
                break;
            case C_MSG.UpdateGroupParticipantDeleted:
                const updateGroupParticipantDeleted = UpdateGroupParticipantDeleted.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateGroupParticipantDeleted);
                // Set groups's need updated flag
                this.mergeGroup(transaction.groups, {
                    hasUpdate: true,
                    id: updateGroupParticipantDeleted.groupid,
                });
                break;
            /** Labels **/
            case C_MSG.UpdateLabelSet:
                const updateLabelSet = UpdateLabelSet.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateLabelSet);
                // Add label
                updateLabelSet.labelsList.forEach((label) => {
                    this.mergeLabel(transaction.labels, label);
                });
                break;
            case C_MSG.UpdateLabelDeleted:
                const updateLabelDeleted = UpdateLabelDeleted.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateLabelDeleted);
                // Remove label
                updateLabelDeleted.labelidsList.forEach((id) => {
                    this.removeLabel(transaction.labels, id);
                });
                break;
            case C_MSG.UpdateLabelItemsAdded:
                const updateLabelItemsAdded = UpdateLabelItemsAdded.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateLabelItemsAdded);
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
                        peerid: updateLabelItemsAdded.peer.id || '',
                        peertype: updateLabelItemsAdded.peer.type || 0,
                    });
                });
                // Add label
                updateLabelItemsAdded.labelsList.forEach((label) => {
                    this.mergeLabel(transaction.labels, label);
                });
                break;
            case C_MSG.UpdateLabelItemsRemoved:
                const updateLabelItemsRemoved = UpdateLabelItemsRemoved.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateLabelItemsRemoved);
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
                        peerid: updateLabelItemsRemoved.peer.id || '',
                        peertype: updateLabelItemsRemoved.peer.type || 0,
                    });
                });
                // Add label
                updateLabelItemsRemoved.labelsList.forEach((label) => {
                    this.mergeLabel(transaction.labels, label);
                });
                break;
            default:
                break;
        }
    }

    private mergeDialog(dialogs: { [key: string]: IDialog }, dialog: IDialog) {
        const d = dialogs[dialog.peerid || ''];
        if (d) {
            if ((d.readinboxmaxid || 0) > (dialog.readinboxmaxid || 0)) {
                dialog.readinboxmaxid = (d.readinboxmaxid || 0);
            }
            if ((d.readoutboxmaxid || 0) > (dialog.readoutboxmaxid || 0)) {
                dialog.readoutboxmaxid = (d.readoutboxmaxid || 0);
            }
            if (dialog.topmessageid) {
                if (dialog.force || dialog.topmessageid > (d.topmessageid || 0)) {
                    dialogs[d.peerid || ''] = kMerge(d, dialog);
                }
            } else {
                dialogs[d.peerid || ''] = kMerge(d, dialog);
            }
        } else {
            dialogs[dialog.peerid || ''] = dialog;
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
            if (!incomingIds.hasOwnProperty(message.peerid || '')) {
                incomingIds[message.peerid || ''] = [];
            }
            incomingIds[message.peerid || ''].push(message.id || 0);
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
            labels[l.id || ''] = kMerge(l, labels);
        } else {
            labels[label.id || 0] = label;
        }
    }

    private removeLabel(labels: { [key: number]: ILabel }, id: number) {
        delete labels[id];
    }

    private queueTransaction(transaction: ITransactionPayload) {
        this.transactionList.push(transaction);
        this.applyTransactions();
    }

    private applyTransactions() {
        const transaction = this.transactionList.shift();
        if (transaction) {
            this.processTransaction(transaction);
        }
    }

    private processTransaction(transaction: ITransactionPayload, doneFn?: any) {
        return new Promise((transactionResolve) => {
            const promises: any[] = [];
            // User list
            const userList: IUser[] = [];
            Object.keys(transaction.users).forEach((key) => {
                userList.push(transaction.users[key]);
            });
            if (userList.length > 0 && this.userRepo) {
                promises.push(this.userRepo.importBulk(false, userList));
            }
            // Group list
            const groupList: IGroup[] = [];
            Object.keys(transaction.groups).forEach((key) => {
                groupList.push(transaction.groups[key]);
            });
            if (groupList.length > 0 && this.groupRepo) {
                promises.push(this.groupRepo.importBulk(groupList));
            }
            // Label list
            const labelList: ILabel[] = [];
            Object.keys(transaction.labels).forEach((key) => {
                labelList.push(transaction.labels[key]);
            });
            if (labelList.length > 0 && this.labelRepo) {
                promises.push(this.labelRepo.importBulk(labelList));
            }
            // Message list
            if (Object.keys(transaction.messages).length > 0) {
                promises.push(this.applyMessages(transaction.messages, transaction.editedMessageIds).then((res) => {
                    if (!transaction.live) {
                        this.callHandlers(C_MSG.UpdateMessageDB, res);
                    }
                    return res;
                }));
            }
            // Removed message list
            if (Object.keys(transaction.removedMessages).length > 0) {
                promises.push(this.applyRemovedMessages(transaction.removedMessages).then((res) => {
                    if (!transaction.live) {
                        this.callHandlers(C_MSG.UpdateMessageDBRemoved, res);
                    }
                    return res;
                }));
            }
            // Dialog list (conditional)
            if (transaction.toCheckDialogIds.length === 0) {
                promises.push(this.applyDialogs(transaction.dialogs).then((keys) => {
                    if (!transaction.live) {
                        this.callHandlers(C_MSG.UpdateDialogDB, {
                            counters: transaction.lastOne,
                            ids: keys,
                            incomingIds: transaction.incomingIds,
                        });
                    }
                    return keys;
                }));
            }
            if (promises.length > 0) {
                Promise.all(promises).then(() => {
                    this.processTransactionStep2(transaction, transactionResolve, doneFn);
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
            });
        } else {
            this.processTransactionStep3(transaction, transactionResolve, doneFn);
        }
    }

    private processTransactionStep3(transaction: ITransactionPayload, transactionResolve: any, doneFn?: any) {
        if (transaction.toCheckDialogIds.length > 0) {
            const lastMessagePromise: any[] = [];
            transaction.toCheckDialogIds.forEach((peerId) => {
                if (this.messageRepo) {
                    lastMessagePromise.push(this.messageRepo.getLastMessage(peerId));
                }
            });
            Promise.all(lastMessagePromise).then((arr) => {
                arr.forEach((msg) => {
                    if (msg) {
                        const messageTitle = getMessageTitle(msg);
                        this.mergeDialog(transaction.dialogs, {
                            action_code: msg.messageaction,
                            action_data: msg.actiondata,
                            force: true,
                            last_update: (msg.editedon || 0) > 0 ? msg.editedon : msg.createdon,
                            peerid: msg.peerid,
                            peertype: msg.peertype,
                            preview: messageTitle.text,
                            preview_icon: messageTitle.icon,
                            preview_me: (this.userId === msg.senderid),
                            preview_rtl: msg.rtl,
                            saved_messages: (this.userId === msg.peerid),
                            sender_id: msg.senderid,
                            topmessageid: msg.id,
                        });
                    }
                });
                this.applyDialogs(transaction.dialogs).then((keys) => {
                    this.callHandlers(C_MSG.UpdateDialogDB, {
                        counters: transaction.live ? true : transaction.lastOne,
                        ids: keys,
                        incomingIds: transaction.incomingIds,
                    });
                    this.processTransactionStep4(transaction, transactionResolve, doneFn);
                });
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
            this.applyTransactions();
        }
        transactionResolve();
    }

    private applyClearDialogs(list: IClearDialog[]) {
        const promises: any[] = [];
        list.forEach((item) => {
            if (item.remove && this.dialogRepo) {
                promises.push(this.dialogRepo.remove(item.peerId));
            }
            if (item.maxId > 0 && this.messageRepo) {
                promises.push(this.messageRepo.clearHistory(item.peerId, item.maxId));
            }
        });
        return Promise.all(promises);
    }

    private applyDialogs(dialogs: { [key: string]: IDialog }): Promise<string[]> {
        const dialogList: IDialog[] = [];
        const keys = Object.keys(dialogs);
        keys.forEach((key) => {
            dialogList.push(dialogs[key]);
        });
        if (dialogList.length > 0 && this.dialogRepo) {
            return this.dialogRepo.importBulk(dialogList).then(() => {
                return keys;
            });
        } else {
            return Promise.resolve(keys);
        }
    }

    private applyMessages(messages: { [key: number]: IMessage }, editedMessageIds: number[]): Promise<IMessageDBUpdated> {
        const messageList: IMessage[] = [];
        const keys: number[] = [];
        const peerIds: string[] = [];
        const minIdPerPeer: { [key: string]: number } = {};
        // @ts-ignore
        Object.keys(messages).forEach((key: number) => {
            const message = messages[key];
            if (!message.id) {
                return;
            }
            messageList.push(message);
            keys.push(message.id);
            if (!peerIds[message.peerid || '']) {
                peerIds.push(message.peerid || '');
            }
            if (message && message.id) {
                if (minIdPerPeer.hasOwnProperty(message.peerid || '')) {
                    minIdPerPeer[message.peerid || ''] = message.id;
                } else {
                    if (minIdPerPeer[message.peerid || ''] > message.id) {
                        minIdPerPeer[message.peerid || ''] = message.id;
                    }
                }
            }
        });
        if (messageList.length > 0 && this.messageRepo) {
            return this.messageRepo.importBulk(messageList).then(() => {
                return {
                    editedIds: uniq(editedMessageIds),
                    ids: keys,
                    minIds: minIdPerPeer,
                    peerIds,
                };
            });
        } else {
            return Promise.resolve({
                editedIds: uniq(editedMessageIds),
                ids: keys,
                minIds: minIdPerPeer,
                peerIds,
            });
        }
    }

    private applyRemovedMessages(removedMessages: { [key: string]: number[] }): Promise<IMessageDBRemoved> {
        const peerIds = Object.keys(removedMessages);
        const ids: number[] = [];
        peerIds.forEach((peerId) => {
            ids.push(...removedMessages[peerId]);
        });
        if (ids.length > 0 && this.messageRepo) {
            return this.messageRepo.removeMany(ids).then(() => {
                return {
                    ids,
                    listPeer: removedMessages,
                    peerIds,
                };
            });
        } else {
            return Promise.resolve({
                ids,
                listPeer: {},
                peerIds,
            });
        }
    }

    private applyLabelRange(list: ILabelRange[]) {
        const newList = cloneDeep(list);
        const fn = (resolve: any, reject: any) => {
            const item = newList.shift();
            if (item && this.labelRepo) {
                if (item.mode === 'add') {
                    this.labelRepo.insertInRange(item.labelId, item.peerid, item.peertype, item.msgIds).then(() => {
                        fn(resolve, resolve);
                    }).catch(reject);
                } else {
                    this.labelRepo.removeFromRange(item.labelId, item.msgIds).then(() => {
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

    private callUpdateHandler(eventConstructor: number, data: any) {
        if (this.isLive) {
            try {
                if (eventConstructor === C_MSG.UpdateNewMessage && this.messageIdMap.hasOwnProperty(data.message.id || 0)) {
                    this.callHandlers(C_MSG.UpdateNewMessageDrop, data);
                    delete this.messageIdMap[data.message.id || 0];
                } else {
                    this.callHandlers(eventConstructor, data);
                }
            } catch (e) {
                window.console.warn(e);
            }
        }
    }

    private callHandlers(eventConstructor: number, data: any) {
        if (!this.listenerList[eventConstructor]) {
            return;
        }
        const keys = Object.keys(this.listenerList[eventConstructor]);
        keys.forEach((key) => {
            const fn = this.listenerList[eventConstructor][key];
            if (fn) {
                fn(data);
            }
        });
    }
}
