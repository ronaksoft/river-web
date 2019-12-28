/*
    Creation Time: 2018 - Oct - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {C_MSG} from '../const';
import {UpdateEnvelope, User} from '../messages/chat.core.types_pb';
import {
    UpdateDialogPinned,
    UpdateDifference,
    UpdateDraftMessage,
    UpdateDraftMessageCleared,
    UpdateGroupParticipantAdd,
    UpdateGroupParticipantDeleted, UpdateLabelDeleted, UpdateLabelItemsAdded, UpdateLabelItemsRemoved,
    UpdateLabelSet,
    UpdateMessageEdited,
    UpdateMessageID,
    UpdateMessagesDeleted,
    UpdateNewMessage,
    UpdateNotifySettings,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox,
    UpdateReadMessagesContents,
    UpdateUsername,
    UpdateUserPhoto,
} from '../messages/chat.api.updates_pb';
import {IUser} from '../../../repository/user/interface';
import {IMessage} from '../../../repository/message/interface';
import {IDialog} from '../../../repository/dialog/interface';
import DialogRepo from '../../../repository/dialog';
import MessageRepo from '../../../repository/message';
import UserRepo from '../../../repository/user';
import UpdateManager from '../server/updateManager';
import GroupRepo from '../../../repository/group';
import {IGroup} from '../../../repository/group/interface';
import {Group} from '../messages/chat.core.types_pb';
import {C_MESSAGE_ACTION} from '../../../repository/message/consts';
import {getMessageTitle} from '../../../components/Dialog/utils';
import {kMerge} from "../../utilities/kDash";
import LabelRepo from "../../../repository/label";
import {uniq} from "lodash";
import {ILabel} from "../../../repository/label/interface";

export interface IRemoveDialog {
    maxId: number;
    peerId: string;
    remove: boolean;
}

export const C_SYNC_UPDATE = {
    Dialog: 0x2,
    Group: 0x4,
    Message: 0x1,
    MessageId: 0x5,
    User: 0x3,
};

export default class SyncManager {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new SyncManager();
        }
        return this.instance;
    }

    private static instance: SyncManager;

    private updateManager: UpdateManager;
    private dialogRepo: DialogRepo;
    private messageRepo: MessageRepo;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;
    private labelRepo: LabelRepo;
    private fnIndex: number = 0;
    private fnQueue: any = {};

    public constructor() {
        window.console.log('Sync manager started');
        this.updateManager = UpdateManager.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.dialogRepo = DialogRepo.getInstance();
        this.messageRepo = MessageRepo.getInstance();
        this.labelRepo = LabelRepo.getInstance();
    }

    public getLastUpdateId(): number {
        return this.updateManager.getLastUpdateId();
    }

    public setLastUpdateId(id: number) {
        this.updateManager.setLastUpdateId(id);
    }

    public applyUpdate(data: UpdateDifference.AsObject): Promise<number> {
        return new Promise((resolve, reject) => {
            const more = data.more || false;
            const lastUpdateId = more ? (data.maxupdateid || 0) : (data.currentupdateid || data.maxupdateid || 0);
            if (lastUpdateId > 0) {
                this.setLastUpdateId(lastUpdateId);
            }
            this.updateMany(data.updatesList, data.groupsList, data.usersList, !more, () => {
                if (more) {
                    resolve(lastUpdateId + 1);
                }
            });
            if (!more) {
                reject({
                    code: -1,
                });
            }
        });
    }

    public listen(eventConstructor: number, fn: any): (() => void) | null {
        if (!eventConstructor) {
            return null;
        }
        this.fnIndex++;
        if (!this.fnQueue.hasOwnProperty(eventConstructor)) {
            this.fnQueue[eventConstructor] = {};
        }
        this.fnQueue[eventConstructor][this.fnIndex] = fn;
        return () => {
            delete this.fnQueue[eventConstructor][this.fnIndex];
        };
    }

    private updateMany(envelopes: UpdateEnvelope.AsObject[], groups: Group.AsObject[], updateUsers: User.AsObject[], lastOne: boolean, doneCb: any) {
        let dialogs: { [key: number]: IDialog } = {};
        const toRemoveDialogs: IRemoveDialog[] = [];
        const messages: { [key: number]: IMessage } = {};
        const toRemoveMessages: number[] = [];
        const toCheckDialogs: string[] = [];
        let users: { [key: string]: IUser } = {};
        envelopes.forEach((envelope) => {
            // @ts-ignore
            const data: Uint8Array = envelope.update;
            switch (envelope.constructor) {
                case C_MSG.UpdateNewMessage:
                    const updateNewMessage = UpdateNewMessage.deserializeBinary(data).toObject();
                    users[updateNewMessage.sender.id || '0'] = updateNewMessage.sender;
                    const message = MessageRepo.parseMessage(updateNewMessage.message, this.updateManager.getUserId());
                    messages[updateNewMessage.message.id || 0] = message;
                    // Message Clear History
                    if (message.messageaction === C_MESSAGE_ACTION.MessageActionClearHistory) {
                        toRemoveDialogs.push({
                            maxId: message.actiondata.maxid || 0,
                            peerId: message.peerid || '',
                            remove: message.actiondata.pb_delete || false,
                        });
                    }
                    const messageTitle = getMessageTitle(updateNewMessage.message);
                    dialogs = this.updateDialog(dialogs, {
                        accesshash: updateNewMessage.accesshash,
                        action_code: updateNewMessage.message.messageaction,
                        action_data: messages[updateNewMessage.message.id || 0].actiondata,
                        last_update: updateNewMessage.message.createdon,
                        peerid: updateNewMessage.message.peerid,
                        peertype: updateNewMessage.message.peertype,
                        preview: messageTitle.text,
                        preview_icon: messageTitle.icon,
                        preview_me: (this.updateManager.getUserId() === updateNewMessage.message.senderid),
                        preview_rtl: messages[updateNewMessage.message.id || 0].rtl,
                        saved_messages: (this.updateManager.getUserId() === updateNewMessage.message.peerid),
                        sender_id: updateNewMessage.message.senderid,
                        topmessageid: updateNewMessage.message.id,
                    });
                    users = this.updateUser(users, updateNewMessage.sender);
                    break;
                case C_MSG.UpdateMessageID:
                    this.updateMessageId(UpdateMessageID.deserializeBinary(data).toObject());
                    break;
                case C_MSG.UpdateReadHistoryInbox:
                    const updateReadHistoryInbox = UpdateReadHistoryInbox.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        peerid: updateReadHistoryInbox.peer.id,
                        readinboxmaxid: updateReadHistoryInbox.maxid,
                    });
                    break;
                case C_MSG.UpdateReadHistoryOutbox:
                    const updateReadHistoryOutbox = UpdateReadHistoryOutbox.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        peerid: updateReadHistoryOutbox.peer.id,
                        readoutboxmaxid: updateReadHistoryOutbox.maxid
                    });
                    break;
                case C_MSG.UpdateMessageEdited:
                    const updateMessageEdited = UpdateMessageEdited.deserializeBinary(data).toObject();
                    messages[updateMessageEdited.message.id || 0] = MessageRepo.parseMessage(updateMessageEdited.message, this.updateManager.getUserId());
                    if (toCheckDialogs.indexOf(updateMessageEdited.message.peerid || '') === -1) {
                        toCheckDialogs.push(updateMessageEdited.message.peerid || '');
                    }
                    break;
                case C_MSG.UpdateReadMessagesContents:
                    const updateReadMessagesContents = UpdateReadMessagesContents.deserializeBinary(data).toObject();
                    updateReadMessagesContents.messageidsList.forEach((id) => {
                        if (messages.hasOwnProperty(id || 0)) {
                            messages[id || 0].contentread = true;
                        } else {
                            messages[id || 0] = {
                                contentread: true,
                                id,
                            };
                        }
                    });
                    break;
                case C_MSG.UpdateMessagesDeleted:
                    const updateMessagesDeleted = UpdateMessagesDeleted.deserializeBinary(data).toObject();
                    updateMessagesDeleted.messageidsList.forEach((id) => {
                        if (messages.hasOwnProperty(id)) {
                            delete messages[id || 0];
                        }
                        toRemoveMessages.push(id);
                    });
                    if (updateMessagesDeleted.peer && toCheckDialogs.indexOf(updateMessagesDeleted.peer.id || '') === -1) {
                        toCheckDialogs.push(updateMessagesDeleted.peer.id || '');
                    }
                    break;
                case C_MSG.UpdateUsername:
                    const updateUsername = UpdateUsername.deserializeBinary(data).toObject();
                    if (users.hasOwnProperty(updateUsername.userid || '0')) {
                        users[updateUsername.userid || 0] = kMerge(users[updateUsername.userid || '0'], {
                            bio: updateUsername.bio,
                            firstname: updateUsername.firstname,
                            id: updateUsername.userid,
                            lastname: updateUsername.lastname,
                            username: updateUsername.username,
                        });
                    }
                    break;
                case C_MSG.UpdateNotifySettings:
                    const updateNotifySettings = UpdateNotifySettings.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        accesshash: updateNotifySettings.notifypeer.accesshash,
                        notifysettings: updateNotifySettings.settings,
                        peerid: updateNotifySettings.notifypeer.id,
                    });
                    break;
                case C_MSG.UpdateUserPhoto:
                    const updateUserPhoto = UpdateUserPhoto.deserializeBinary(data).toObject();
                    if (users.hasOwnProperty(updateUserPhoto.userid || '0')) {
                        users[updateUserPhoto.userid || 0] = kMerge(users[updateUserPhoto.userid || '0'], {
                            id: updateUserPhoto.userid,
                            photo: updateUserPhoto.photo,
                        });
                    }
                    break;
                case C_MSG.UpdateDialogPinned:
                    const updateDialogPinned = UpdateDialogPinned.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        peerid: updateDialogPinned.peer.id,
                        pinned: updateDialogPinned.pinned,
                    });
                    break;
                case C_MSG.UpdateDraftMessage:
                    const updateDraftMessage = UpdateDraftMessage.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        draft: updateDraftMessage.message,
                        peerid: updateDraftMessage.message.peerid,
                    });
                    break;
                case C_MSG.UpdateDraftMessageCleared:
                    const updateDraftMessageCleared = UpdateDraftMessageCleared.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        draft: {},
                        peerid: updateDraftMessageCleared.peer.id,
                    });
                    break;
                case C_MSG.UpdateGroupParticipantAdd:
                    const updateGroupParticipantAdd = UpdateGroupParticipantAdd.deserializeBinary(data).toObject();
                    this.groupRepo.importBulk([{
                        hasUpdate: true,
                        id: updateGroupParticipantAdd.groupid,
                    }]);
                    break;
                case C_MSG.UpdateGroupParticipantDeleted:
                    const updateGroupParticipantDeleted = UpdateGroupParticipantDeleted.deserializeBinary(data).toObject();
                    this.groupRepo.importBulk([{
                        hasUpdate: true,
                        id: updateGroupParticipantDeleted.groupid,
                    }]);
                    break;
                case C_MSG.UpdateLabelSet:
                    const updateLabelSet = UpdateLabelSet.deserializeBinary(data).toObject();
                    this.labelRepo.importBulk(updateLabelSet.labelsList);
                    break;
                case C_MSG.UpdateLabelDeleted:
                    const updateLabelDeleted = UpdateLabelDeleted.deserializeBinary(data).toObject();
                    this.labelRepo.removeMany(updateLabelDeleted.labelidsList);
                    break;
                case C_MSG.UpdateLabelItemsAdded:
                    const updateLabelItemsAdded = UpdateLabelItemsAdded.deserializeBinary(data).toObject();
                    updateLabelItemsAdded.messageidsList.forEach((id) => {
                        if (messages.hasOwnProperty(id || 0)) {
                            messages[id || 0].added_labels = uniq([...(messages[id || 0].labelidsList || []), ...updateLabelItemsAdded.labelidsList]);
                        } else {
                            messages[id || 0] = {
                                added_labels: uniq([...(messages[id || 0].labelidsList || []), ...updateLabelItemsAdded.labelidsList]),
                                id,
                            };
                        }
                    });
                    updateLabelItemsAdded.labelidsList.forEach((id) => {
                        this.labelRepo.insertInRange(id, updateLabelItemsAdded.peer.id || '', updateLabelItemsAdded.peer.type || 0, updateLabelItemsAdded.messageidsList);
                    });
                    const addLabelList: ILabel[] = [];
                    updateLabelItemsAdded.labelidsList.forEach((id) => {
                        addLabelList.push({
                            id,
                            increase_counter: updateLabelItemsAdded.messageidsList.length,
                        });
                        this.labelRepo.insertInRange(id, updateLabelItemsAdded.peer.id || '', updateLabelItemsAdded.peer.type || 0, updateLabelItemsAdded.messageidsList);
                    });
                    this.labelRepo.upsert(addLabelList);
                    break;
                case C_MSG.UpdateLabelItemsRemoved:
                    const updateLabelItemsRemoved = UpdateLabelItemsRemoved.deserializeBinary(data).toObject();
                    updateLabelItemsRemoved.messageidsList.forEach((id) => {
                        if (messages.hasOwnProperty(id || 0)) {
                            messages[id || 0].removed_labels = uniq([...(messages[id || 0].labelidsList || []), ...updateLabelItemsRemoved.labelidsList]);
                        } else {
                            messages[id || 0] = {
                                id,
                                removed_labels: uniq([...(messages[id || 0].labelidsList || []), ...updateLabelItemsRemoved.labelidsList]),
                            };
                        }
                    });
                    updateLabelItemsRemoved.labelidsList.forEach((id) => {
                        this.labelRepo.removeFromRange(id, updateLabelItemsAdded.messageidsList);
                    });
                    const removeLabelList: ILabel[] = [];
                    updateLabelItemsRemoved.labelidsList.forEach((id) => {
                        removeLabelList.push({
                            id,
                            increase_counter: -updateLabelItemsRemoved.messageidsList.length,
                        });
                        this.labelRepo.removeFromRange(id, updateLabelItemsRemoved.messageidsList);
                    });
                    this.labelRepo.upsert(removeLabelList);
                    break;
                default:
                    break;
            }
        });
        this.updateUserDB(users, updateUsers);
        this.updateGroupDB(groups);
        this.updateMessageDB(messages, toRemoveMessages).then(() => {
            this.updateDialogDB(dialogs, toRemoveDialogs, toCheckDialogs, lastOne, doneCb);
        }).catch((err) => {
            window.console.warn(err);
            doneCb();
        });
    }

    private updateDialog(dialogs: { [key: number]: IDialog }, dialog: IDialog) {
        const d: IDialog = dialogs[dialog.peerid || '0'];
        if (d) {
            if ((d.readinboxmaxid || 0) > (dialog.readinboxmaxid || 0)) {
                dialog.readinboxmaxid = (d.readinboxmaxid || 0);
            }
            if ((d.readoutboxmaxid || 0) > (dialog.readoutboxmaxid || 0)) {
                dialog.readoutboxmaxid = (d.readoutboxmaxid || 0);
            }
            if (dialog.topmessageid) {
                if (dialog.force || dialog.topmessageid > (d.topmessageid || 0)) {
                    dialogs[dialog.peerid || '0'] = kMerge(d, dialog);
                }
            } else {
                dialogs[dialog.peerid || '0'] = kMerge(d, dialog);
            }
        } else {
            dialogs[dialog.peerid || '0'] = dialog;
        }
        return dialogs;
    }

    private updateDialogDB(dialogs: { [key: number]: IDialog }, toRemoveDialogs: IRemoveDialog[], dialogCheck: string[], lastOne: boolean, doneCb: any) {
        toRemoveDialogs.forEach((item) => {
            if (item.remove) {
                this.dialogRepo.remove(item.peerId);
            }
            if (item.maxId > 0) {
                this.messageRepo.clearHistory(item.peerId, item.maxId);
            }
        });

        const updateDialogs = (d: IDialog[]) => {
            this.dialogRepo.lazyUpsert(d);
            this.dialogRepo.flush().then(() => {
                setTimeout(() => {
                    this.broadcastEvent('Dialog_Sync_Updated', {ids: keys, counters: lastOne});
                    doneCb();
                }, 1);
            }).catch(() => {
                setTimeout(() => {
                    this.broadcastEvent('Dialog_Sync_Updated', {ids: keys, counters: lastOne});
                    doneCb();
                }, 1);
            });
        };

        const keys = Object.keys(dialogs);
        const data: IDialog[] = [];
        // TODO: check
        if (dialogCheck.length > 0) {
            this.dialogRepo.lazyUpsert(data);
            this.dialogRepo.flush().then(() => {
                const promises: any[] = [];
                dialogCheck.forEach((peerId) => {
                    promises.push(this.messageRepo.getLastMessage(peerId));
                });
                Promise.all(promises).then((arr) => {
                    arr.forEach((msg) => {
                        if (msg) {
                            const messageTitle = getMessageTitle(msg);
                            this.updateDialog(dialogs, {
                                action_code: msg.messageaction,
                                action_data: msg.actiondata,
                                force: true,
                                last_update: (msg.editedon || 0) > 0 ? msg.editedon : msg.createdon,
                                peerid: msg.peerid,
                                peertype: msg.peertype,
                                preview: messageTitle.text,
                                preview_icon: messageTitle.icon,
                                preview_me: (this.updateManager.getUserId() === msg.senderid),
                                preview_rtl: msg.rtl,
                                saved_messages: (this.updateManager.getUserId() === msg.peerid),
                                sender_id: msg.senderid,
                                topmessageid: msg.id,
                            });
                            // Add new dialogs if omitted
                            if (keys.indexOf(msg.peerid) === -1) {
                                keys.push(msg.peerid);
                            }
                        }
                    });
                    keys.forEach((key) => {
                        data.push(dialogs[key]);
                    });
                    updateDialogs(data);
                }).catch(() => {
                    updateDialogs(data);
                });
            }).catch(() => {
                this.broadcastEvent('Dialog_Sync_Updated', {ids: keys, counters: lastOne});
                doneCb();
            });
        } else if (keys.length > 0) {
            keys.forEach((key) => {
                data.push(dialogs[key]);
            });
            updateDialogs(data);
        } else {
            this.updateManager.flushLastUpdateId();
            doneCb();
        }
    }

    private updateMessageDB(messages: { [key: number]: IMessage }, toRemoveMessages: number[]): Promise<any> {
        const promises: any[] = [];
        promises.push(this.messageRepo.removeMany(toRemoveMessages));
        const data: IMessage[] = [];
        const keys = Object.keys(messages);
        const peerIds: number[] = [];
        const minIdPerPeer: { [key: string]: number } = {};
        keys.forEach((key) => {
            data.push(messages[key]);
            if (!peerIds[messages[key].peerid]) {
                peerIds.push(messages[key].peerid);
            }
            const message = messages[key];
            if (message && message.id) {
                if (minIdPerPeer.hasOwnProperty(message.peerid)) {
                    minIdPerPeer[message.peerid || ''] = message.id;
                } else {
                    if (minIdPerPeer[message.peerid || ''] > message.id) {
                        minIdPerPeer[message.peerid || ''] = message.id;
                    }
                }
            }
        });
        if (data.length > 0) {
            promises.push(this.messageRepo.lazyUpsert(data));
            setTimeout(() => {
                this.broadcastEvent('Message_Sync_Updated', {
                    ids: keys,
                    minids: minIdPerPeer,
                    peerids: peerIds,
                });
            }, 512);
        }
        if (promises.length > 0) {
            return Promise.all(promises);
        } else {
            return Promise.resolve();
        }
    }

    private updateUser(users: { [key: string]: IUser }, user: IUser) {
        const d: IUser = users[user.id || 0];
        if (d) {
            users[user.id || 0] = kMerge(d, user);
        } else {
            users[user.id || 0] = user;
        }
        return users;
    }

    private updateUserDB(users: { [key: string]: IUser }, updateUsers: IUser[]) {
        const data: IUser[] = [];
        const keys = Object.keys(users);
        updateUsers.forEach((user) => {
            users = this.updateUser(users, user);
        });
        keys.forEach((key) => {
            data.push(users[key]);
        });
        if (data.length > 0) {
            this.userRepo.importBulk(false, data).then(() => {
                this.broadcastEvent('User_Sync_Updated', {ids: keys});
            });
        }
    }

    private updateGroupDB(groups: Group.AsObject[]) {
        const data: IGroup[] = [];
        const keys = groups.map((group) => {
            // @ts-ignore
            data.push(group);
            return group.id;
        });
        if (data.length > 0) {
            this.groupRepo.importBulk(data).then(() => {
                this.broadcastEvent('Group_Sync_Updated', {ids: keys});
            });
        }
    }

    private updateMessageId(messageId: UpdateMessageID.AsObject) {
        this.callHandlers(C_SYNC_UPDATE.MessageId, messageId);
    }

    private callHandlers(update: number, data: any) {
        if (!this.fnQueue[update]) {
            return;
        }
        const keys = Object.keys(this.fnQueue[update]);
        keys.forEach((key) => {
            const fn = this.fnQueue[update][key];
            if (fn) {
                fn(data);
            }
        });
    }

    private broadcastEvent(name: string, data: any) {
        const event = new CustomEvent(name, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(event);
    }
}
