/*
    Creation Time: 2020 - Feb - 10
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {C_MSG} from '../const';
import {Group, UpdateContainer, UpdateEnvelope, User} from '../messages/chat.core.types_pb';
import {
    UpdateDialogPinned,
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
import {throttle, uniq} from 'lodash';
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
import {IRemoveDialog} from "../syncManager";
import {IGroup} from "../../../repository/group/interface";

interface ILabelRange {
    labelId: number;
    peerid: string;
    peertype: number;
    msgIds: number;
    mode: 'add' | 'remove';
}

interface IClearDialog {
    maxId: number;
    peerId: string;
}

interface IRepoRef {
    dialogs: { [key: string]: IDialog };
    messages: { [key: number]: IMessage };
    users: { [key: string]: IUser };
    groups: { [key: string]: IGroup };
    labels: { [key: number]: ILabel };
    clearDialogs: IClearDialog[];
    labelRange: ILabelRange[];
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
    private readonly flushUpdateIdThrottle: any;
    private lastUpdateId: number = 0;
    private userId: string = '';

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

    public constructor() {
        window.console.debug('Update manager started');
        this.lastUpdateId = this.loadLastUpdateId();
        this.flushUpdateIdThrottle = throttle(this.flushLastUpdateId, 128);
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
        window.console.debug('on update, current:', this.lastUpdateId, 'min:', minId, 'max:', maxId);
        if (!(minId === 0 && maxId === 0) && this.lastUpdateId > minId) {
            return;
        }
        if ((this.outOfSync || this.lastUpdateId + 1 !== minId) && !(minId === 0 && maxId === 0)) {
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
                // this.callHandlers(C_MSG.OutOfSync, {});
            }
        });
        updates.forEach((update) => {
            try {
                this.response(update);
            } catch (e) {
                window.console.error(e);
                this.callOutOfSync();
                this.isLive = false;
            }
        });
        if (this.isLive && data.maxupdateid) {
            this.setLastUpdateId(data.maxupdateid);
        }
        if (data.usersList && data.usersList.length > 0) {
            this.callHandlers(C_MSG.UpdateUsers, data.usersList);
        }
        if (data.groupsList && data.groupsList.length > 0) {
            this.callHandlers(C_MSG.UpdateGroups, data.groupsList);
        }
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
        this.callHandlers(C_MSG.OutOfSync, {});
    }

    private responseUpdateMessageID(update: UpdateEnvelope.AsObject) {
        // @ts-ignore
        const data: Uint8Array = update.update;
        switch (update.constructor) {
            case C_MSG.UpdateMessageID:
                const updateMessageId = UpdateMessageID.deserializeBinary(data).toObject();
                this.messageIdMap[updateMessageId.messageid || 0] = true;
                this.callHandlers(C_MSG.UpdateMessageID, updateMessageId);
                break;
        }
    }

    private response(repoRef: IRepoRef, update: UpdateEnvelope.AsObject) {
        // @ts-ignore
        const data: Uint8Array = update.update;
        switch (update.constructor) {
            case C_MSG.UpdateUserTyping:
                this.callHandlers(C_MSG.UpdateUserTyping, UpdateUserTyping.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateTooLong:
                this.callOutOfSync();
                break;
            case C_MSG.UpdateAuthorizationReset:
                this.callHandlers(C_MSG.UpdateAuthorizationReset, {});
                break;
            case C_MSG.UpdateNewMessage:
                const updateNewMessage = UpdateNewMessage.deserializeBinary(data).toObject();
                const message = MessageRepo.parseMessage(updateNewMessage.message, this.userId);
                updateNewMessage.message = message;
                this.callUpdateHandler(update.constructor, updateNewMessage);
                // Update message
                this.mergeMessage(repoRef.messages, message);
                // Check [deleted dialog]/[clear history]
                if (message.messageaction === C_MESSAGE_ACTION.MessageActionClearHistory) {
                    this.removeDialog(repoRef.dialogs, message.peerid || '');
                    if (message.actiondata && message.actiondata.pb_delete) {
                        repoRef.clearDialogs.push({
                            maxId: message.actiondata.maxid || 0,
                            peerId: message.peerid || '',
                        });
                    }
                }
                // Update dialog
                const messageTitle = getMessageTitle(message);
                this.mergeDialog(repoRef.dialogs, {
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
                // TODO: Check user status
                break;
            case C_MSG.UpdateMessageEdited:
                const updateMessageEdited = UpdateMessageEdited.deserializeBinary(data).toObject();
                updateMessageEdited.message = MessageRepo.parseMessage(updateMessageEdited.message, this.userId);
                this.callUpdateHandler(update.constructor, updateMessageEdited);
                // Update message
                this.mergeMessage(repoRef.messages, updateMessageEdited.message);
                break;
            case C_MSG.UpdateMessagesDeleted:
                const updateMessagesDeleted = UpdateMessagesDeleted.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateMessagesDeleted);
                // Delete message(s)
                updateMessagesDeleted.messageidsList.forEach((id) => {
                    this.removeMessage(repoRef.messages, id);
                });
                break;
            case C_MSG.UpdateReadMessagesContents:
                const updateReadMessagesContents = UpdateReadMessagesContents.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateReadMessagesContents);
                // Set messages content read
                updateReadMessagesContents.messageidsList.forEach((id) => {
                    this.mergeMessage(repoRef.messages, {
                        contentread: true,
                        id,
                    });
                });
                break;

            case C_MSG.UpdateReadHistoryInbox:
                const updateReadHistoryInbox = UpdateReadHistoryInbox.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateReadHistoryInbox);

                break;
            case C_MSG.UpdateReadHistoryOutbox:
                const updateReadHistoryOutbox = UpdateReadHistoryOutbox.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateReadHistoryOutbox);

                break;

            case C_MSG.UpdateUsername:
                const updateUsername = UpdateUsername.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateUsername);

                break;
            case C_MSG.UpdateNotifySettings:
                const updateNotifySettings = UpdateNotifySettings.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateNotifySettings);

                break;
            case C_MSG.UpdateUserPhoto:
                const updateUserPhoto = UpdateUserPhoto.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateUserPhoto);

                break;
            case C_MSG.UpdateGroupPhoto:
                const updateGroupPhoto = UpdateGroupPhoto.deserializeBinary(data).toObject()
                this.callUpdateHandler(update.constructor, updateGroupPhoto);

                break;
            case C_MSG.UpdateDialogPinned:
                const updateDialogPinned = UpdateDialogPinned.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateDialogPinned);

                break;
            case C_MSG.UpdateDraftMessage:
                const updateDraftMessage = UpdateDraftMessage.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateDraftMessage);

                break;
            case C_MSG.UpdateDraftMessageCleared:
                const updateDraftMessageCleared = UpdateDraftMessageCleared.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateDraftMessageCleared);

                break;
            case C_MSG.UpdateGroupParticipantAdd:
                const updateGroupParticipantAdd = UpdateGroupParticipantAdd.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateGroupParticipantAdd);

                break;
            case C_MSG.UpdateGroupParticipantDeleted:
                const updateGroupParticipantDeleted = UpdateGroupParticipantDeleted.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateGroupParticipantDeleted);

                break;
            case C_MSG.UpdateLabelSet:
                const updateLabelSet = UpdateLabelSet.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateLabelSet);

                break;
            case C_MSG.UpdateLabelDeleted:
                const updateLabelDeleted = UpdateLabelDeleted.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateLabelDeleted);

                break;
            case C_MSG.UpdateLabelItemsAdded:
                const updateLabelItemsAdded = UpdateLabelItemsAdded.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateLabelItemsAdded);

                break;
            case C_MSG.UpdateLabelItemsRemoved:
                const updateLabelItemsRemoved = UpdateLabelItemsRemoved.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateLabelItemsRemoved);

                break;
            case C_MSG.UpdateUserBlocked:
                const updateUserBlocked = UpdateUserBlocked.deserializeBinary(data).toObject();
                this.callUpdateHandler(update.constructor, updateUserBlocked);

                break;
            default:
                break;
        }
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
                case C_MSG.UpdateNewMessage: //
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
                case C_MSG.UpdateMessageID: //
                    this.updateMessageId(UpdateMessageID.deserializeBinary(data).toObject());
                    break;
                case C_MSG.UpdateReadHistoryInbox: //
                    const updateReadHistoryInbox = UpdateReadHistoryInbox.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        peerid: updateReadHistoryInbox.peer.id,
                        readinboxmaxid: updateReadHistoryInbox.maxid,
                    });
                    break;
                case C_MSG.UpdateReadHistoryOutbox: //
                    const updateReadHistoryOutbox = UpdateReadHistoryOutbox.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        peerid: updateReadHistoryOutbox.peer.id,
                        readoutboxmaxid: updateReadHistoryOutbox.maxid
                    });
                    break;
                case C_MSG.UpdateMessageEdited: //
                    const updateMessageEdited = UpdateMessageEdited.deserializeBinary(data).toObject();
                    messages[updateMessageEdited.message.id || 0] = MessageRepo.parseMessage(updateMessageEdited.message, this.updateManager.getUserId());
                    if (toCheckDialogs.indexOf(updateMessageEdited.message.peerid || '') === -1) {
                        toCheckDialogs.push(updateMessageEdited.message.peerid || '');
                    }
                    break;
                case C_MSG.UpdateReadMessagesContents: //
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
                case C_MSG.UpdateMessagesDeleted: //
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
                case C_MSG.UpdateUsername: //
                    const updateUsername = UpdateUsername.deserializeBinary(data).toObject();
                    if (users.hasOwnProperty(updateUsername.userid || '0')) {
                        users[updateUsername.userid || 0] = kMerge(users[updateUsername.userid || '0'], {
                            bio: updateUsername.bio,
                            firstname: updateUsername.firstname,
                            id: updateUsername.userid,
                            lastname: updateUsername.lastname,
                            phone: updateUsername.phone,
                            username: updateUsername.username,
                        });
                    } else {
                        users[updateUsername.userid || 0] = {
                            bio: updateUsername.bio,
                            firstname: updateUsername.firstname,
                            id: updateUsername.userid,
                            lastname: updateUsername.lastname,
                            phone: updateUsername.phone,
                            username: updateUsername.username,
                        };
                    }
                    const connInfo = SDK.getInstance().getConnInfo();
                    connInfo.Phone = updateUsername.phone;
                    SDK.getInstance().setConnInfo(connInfo);
                    break;
                case C_MSG.UpdateNotifySettings: //
                    const updateNotifySettings = UpdateNotifySettings.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        accesshash: updateNotifySettings.notifypeer.accesshash,
                        notifysettings: updateNotifySettings.settings,
                        peerid: updateNotifySettings.notifypeer.id,
                    });
                    break;
                case C_MSG.UpdateUserPhoto: //
                    const updateUserPhoto = UpdateUserPhoto.deserializeBinary(data).toObject();
                    if (users.hasOwnProperty(updateUserPhoto.userid || '0')) {
                        users[updateUserPhoto.userid || 0] = kMerge(users[updateUserPhoto.userid || '0'], {
                            id: updateUserPhoto.userid,
                            photo: updateUserPhoto.photo,
                        });
                    }
                    break;
                case C_MSG.UpdateDialogPinned: //
                    const updateDialogPinned = UpdateDialogPinned.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        peerid: updateDialogPinned.peer.id,
                        pinned: updateDialogPinned.pinned,
                    });
                    break;
                case C_MSG.UpdateDraftMessage: //
                    const updateDraftMessage = UpdateDraftMessage.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        draft: updateDraftMessage.message,
                        peerid: updateDraftMessage.message.peerid,
                    });
                    break;
                case C_MSG.UpdateDraftMessageCleared: //
                    const updateDraftMessageCleared = UpdateDraftMessageCleared.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        draft: {},
                        peerid: updateDraftMessageCleared.peer.id,
                    });
                    break;
                case C_MSG.UpdateGroupParticipantAdd: //
                    const updateGroupParticipantAdd = UpdateGroupParticipantAdd.deserializeBinary(data).toObject();
                    this.groupRepo.importBulk([{
                        hasUpdate: true,
                        id: updateGroupParticipantAdd.groupid,
                    }]);
                    break;
                case C_MSG.UpdateGroupParticipantDeleted: //
                    const updateGroupParticipantDeleted = UpdateGroupParticipantDeleted.deserializeBinary(data).toObject();
                    this.groupRepo.importBulk([{
                        hasUpdate: true,
                        id: updateGroupParticipantDeleted.groupid,
                    }]);
                    break;
                case C_MSG.UpdateLabelSet: //
                    const updateLabelSet = UpdateLabelSet.deserializeBinary(data).toObject();
                    this.labelRepo.importBulk(updateLabelSet.labelsList.map(o => {
                        delete o.count;
                        return o;
                    }));
                    break;
                case C_MSG.UpdateLabelDeleted: //
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
                case C_MSG.UpdateLabelItemsRemoved: //
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
                case C_MSG.UpdateUserBlocked:
                    const updateUserBlocked = UpdateUserBlocked.deserializeBinary(data).toObject();
                    if (users.hasOwnProperty(updateUserBlocked.userid || '0')) {
                        users[updateUserBlocked.userid || 0] = kMerge(users[updateUserBlocked.userid || '0'], {
                            blocked: updateUserBlocked.blocked,
                            id: updateUserBlocked.userid,
                        });
                    } else {
                        users[updateUserBlocked.userid || 0] = {
                            blocked: updateUserBlocked.blocked,
                            id: updateUserBlocked.userid,
                        };
                    }
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
