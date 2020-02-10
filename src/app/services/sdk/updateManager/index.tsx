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
import SDK from "../index";
import {ILabel} from "../../../repository/label/interface";
import {IGroup} from "../../../repository/group/interface";
import DialogRepo from "../../../repository/dialog";
import UserRepo from "../../../repository/user";
import GroupRepo from "../../../repository/group";
import LabelRepo from "../../../repository/label";

const C_MAX_UPDATE_DIFF = 2000;
const C_DIFF_AMOUNT = 100;

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
    dialogs: { [key: string]: IDialog };
    messages: { [key: number]: IMessage };
    users: { [key: string]: IUser };
    groups: { [key: string]: IGroup };
    labels: { [key: number]: ILabel };
    clearDialogs: IClearDialog[];
    labelRanges: ILabelRange[];
    toCheckDialogIds: string[];
    updateId: number;
    flushDb: boolean;
    live: boolean;
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
    private sdk: SDK | undefined;

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
            this.sdk = SDK.getInstance();
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
        const data = UpdateContainer.deserializeBinary(base64ToU8a(bytes)).toObject();
        if (!this.isLive) {
            return;
        }
        const minId = data.minupdateid || 0;
        const maxId = data.maxupdateid || 0;
        window.console.debug('on update, current:', this.internalUpdateId, 'min:', minId, 'max:', maxId);
        if (!(minId === 0 && maxId === 0) && this.internalUpdateId > minId) {
            return;
        }
        if ((this.outOfSync || this.internalUpdateId + 1 !== minId) && !(minId === 0 && maxId === 0)) {
            this.outOfSyncCheck(data);
            return;
        }
        this.applyUpdates(data);
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

    public disable() {
        this.isLive = false;
    }

    public enable() {
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
            } else if (this.sdk) {
                this.sdk.getUpdateState().then((res) => {
                    // TODO: check
                    fn(res.updateid || 0);
                }).catch(reject);
            }
        });
    }

    private startSyncing(lastId: number, limit: number) {
        if (!this.sdk) {
            return;
        }
        this.sdk.getUpdateDifference(lastId, limit).then((res) => {
            this.applyDiffUpdate(res.toObject()).then((id) => {
                this.startSyncing(id, limit);
            }).catch((err2) => {
                this.enable();
                this.isDiffUpdating = false;
                this.callHandlers(C_MSG.UpdateManagerStatus, {
                    isUpdating: false,
                });
                if (err2.code === -1) {
                    this.canSync().then(() => {
                        this.disable();
                        this.isDiffUpdating = true;
                        this.callHandlers(C_MSG.UpdateManagerStatus, {
                            isUpdating: true,
                        });
                    }).catch(() => {
                        this.enable();
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
                maxupdateid: lastUpdateId,
                minupdateid: data.minupdateid,
                updatesList: data.updatesList,
                usersList: data.usersList,
            }, false, () => {
                if (more) {
                    resolve(lastUpdateId + 1);
                }
            });
            // this.updateMany(data.updatesList, data.groupsList, data.usersList, !more, () => {
            //     if (more) {
            //         resolve(lastUpdateId + 1);
            //     }
            // });
            if (!more) {
                reject({
                    code: -1,
                });
            }
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
        // updates.forEach((update) => {
        //     try {
        //         this.response(update);
        //     } catch (e) {
        //         window.console.error(e);
        //         this.callOutOfSync();
        //         this.isLive = false;
        //     }
        // });
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
        if (this.updateList[0].minupdateid === (this.lastUpdateId + 1)) {
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
        this.callHandlers(C_MSG.OutOfSync, {});
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

    private processContainer(data: UpdateContainer.AsObject, live: boolean, doneFn?: any) {
        const transaction: ITransactionPayload = {
            clearDialogs: [],
            dialogs: {},
            flushDb: false,
            groups: {},
            labelRanges: [],
            labels: {},
            live,
            messages: {},
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
        if (data.maxupdateid) {
            this.internalUpdateId = data.maxupdateid;
        }
        if (doneFn) {
            this.processTransaction(transaction, doneFn);
        } else {
            this.queueTransaction(transaction);
        }
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
                this.mergeMessage(transaction.messages, message);
                // Check [deleted dialog]/[clear history]
                if (message.messageaction === C_MESSAGE_ACTION.MessageActionClearHistory) {
                    this.removeDialog(transaction.dialogs, message.peerid || '');
                    if (message.actiondata && message.actiondata.pb_delete) {
                        transaction.clearDialogs.push({
                            maxId: message.actiondata.maxid || 0,
                            peerId: message.peerid || '',
                            remove: message.actiondata.pb_delete || false,
                        });
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
                this.mergeMessage(transaction.messages, updateMessageEdited.message);
                // Update to check list
                transaction.toCheckDialogIds.push(updateMessageEdited.message.peerid || '');
                break;
            case C_MSG.UpdateMessagesDeleted:
                const updateMessagesDeleted = UpdateMessagesDeleted.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateMessagesDeleted);
                // Delete message(s)
                updateMessagesDeleted.messageidsList.forEach((id) => {
                    this.removeMessage(transaction.messages, id);
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
                    this.mergeMessage(transaction.messages, {
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
                if (this.sdk) {
                    const connInfo = this.sdk.getConnInfo();
                    connInfo.Phone = updateUsername.phone;
                    this.sdk.setConnInfo(connInfo);
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
                    this.mergeMessage(transaction.messages, {
                        added_labels: uniq(updateLabelItemsAdded.labelidsList),
                        id,
                    });
                });
                // Update label list
                updateLabelItemsAdded.labelidsList.forEach((id) => {
                    this.mergeLabel(transaction.labels, {
                        id,
                        increase_counter: updateLabelItemsAdded.messageidsList.length,
                    });
                    transaction.labelRanges.push({
                        labelId: id,
                        mode: 'add',
                        msgIds: updateLabelItemsAdded.messageidsList,
                        peerid: updateLabelItemsAdded.peer.id || '',
                        peertype: updateLabelItemsAdded.peer.type || 0,
                    });
                });
                break;
            case C_MSG.UpdateLabelItemsRemoved:
                const updateLabelItemsRemoved = UpdateLabelItemsRemoved.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateLabelItemsRemoved);
                // Update message label list
                updateLabelItemsRemoved.messageidsList.forEach((id) => {
                    this.mergeMessage(transaction.messages, {
                        id,
                        removed_labels: uniq(updateLabelItemsRemoved.labelidsList),
                    });
                });
                // Update label list
                updateLabelItemsRemoved.labelidsList.forEach((id) => {
                    this.mergeLabel(transaction.labels, {
                        id,
                        increase_counter: -updateLabelItemsRemoved.messageidsList.length,
                    });
                    transaction.labelRanges.push({
                        labelId: id,
                        mode: 'remove',
                        msgIds: updateLabelItemsRemoved.messageidsList,
                        peerid: updateLabelItemsRemoved.peer.id || '',
                        peertype: updateLabelItemsRemoved.peer.type || 0,
                    });
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

    private mergeMessage(messages: { [key: number]: IMessage }, message: IMessage) {
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
        const messageList: IMessage[] = [];
        Object.keys(transaction.messages).forEach((key) => {
            messageList.push(transaction.messages[key]);
        });
        if (messageList.length > 0 && this.messageRepo) {
            promises.push(this.messageRepo.importBulk(messageList));
        }
        // Dialog list (conditional)
        if (transaction.toCheckDialogIds.length === 0) {
            promises.push(this.applyDialogs(transaction.dialogs));
        }
        if (promises.length > 0) {
            Promise.all(promises).then(() => {
                this.processTransactionStep2(transaction, doneFn);
            });
        } else {
            this.processTransactionStep2(transaction, doneFn);
        }
    }

    private processTransactionStep2(transaction: ITransactionPayload, doneFn?: any) {
        const promises: any[] = [];
        if (transaction.clearDialogs.length > 0) {
            promises.push(this.applyClearDialogs(transaction.clearDialogs));
        }
        if (transaction.labelRanges.length > 0) {
            promises.push(this.applyLabelRange(transaction.labelRanges));
        }
        if (promises.length > 0) {
            Promise.all(promises).then(() => {
                this.processTransactionStep3(transaction, doneFn);
            });
        } else {
            this.processTransactionStep3(transaction, doneFn);
        }
    }

    private processTransactionStep3(transaction: ITransactionPayload, doneFn?: any) {
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
                this.applyDialogs(transaction.dialogs).then(() => {
                    this.processTransactionStep4(transaction, doneFn);
                });
            });
        } else {
            this.applyDialogs(transaction.dialogs).then(() => {
                this.processTransactionStep4(transaction, doneFn);
            });
        }
    }

    private processTransactionStep4(transaction: ITransactionPayload, doneFn?: any) {
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

    private applyDialogs(dialogs: { [key: string]: IDialog }) {
        const dialogList: IDialog[] = [];
        Object.keys(dialogs).forEach((key) => {
            dialogList.push(dialogs[key]);
        });
        if (dialogList.length > 0 && this.dialogRepo) {
            return this.dialogRepo.importBulk(dialogList);
        } else {
            return Promise.resolve();
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
            if (eventConstructor === C_MSG.UpdateNewMessage && this.messageIdMap.hasOwnProperty(data.message.id || 0)) {
                this.callHandlers(C_MSG.UpdateNewMessageDrop, data);
                delete this.messageIdMap[data.message.id || 0];
            } else {
                this.callHandlers(eventConstructor, data);
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
