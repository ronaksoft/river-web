/*
    Creation Time: 2018 - Oct - 03
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {C_MSG} from '../../const';
import {UpdateContainer, UpdateEnvelope} from '../../messages/chat.core.types_pb';
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
    UpdateReadMessagesContents,
    UpdateUsername,
    UpdateUserPhoto,
    UpdateUserTyping,
} from '../../messages/chat.api.updates_pb';
import {throttle, findIndex} from 'lodash';
import {User} from '../../messages/chat.core.types_pb';
import {IMessage} from '../../../../repository/message/interface';
import MessageRepo from '../../../../repository/message';
import {base64ToU8a} from '../../fileManager/http/utils';

export interface INewMessageBulkUpdate {
    accessHashes: string[];
    maxMessageId: number;
    messages: IMessage[];
    minMessageId: number;
    peerid: string;
    peertype?: number;
    senderIds: string[];
    senders: User.AsObject[];
}

export default class UpdateManager {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UpdateManager();
        }

        return this.instance;
    }

    private static instance: UpdateManager;

    private lastUpdateId: number = 0;
    private fnQueue: any = {};
    private fnIndex: number = 0;
    private rndMsgMap: { [key: number]: boolean } = {};
    private messageList: { [key: string]: UpdateNewMessage.AsObject[] } = {};
    private messageDropList: { [key: string]: UpdateNewMessage.AsObject[] } = {};
    private readonly newMessageThrottle: any;
    private readonly newMessageDropThrottle: any;
    private readonly flushUpdateIdThrottle: any;
    private active: boolean = true;
    private userId: string = '';
    private outOfSync: boolean = false;
    private updateList: UpdateContainer.AsObject[] = [];
    private outOfSyncTimeout: any = null;

    public constructor() {
        window.console.debug('Update manager started');
        this.lastUpdateId = this.loadLastUpdateId();
        this.newMessageThrottle = throttle(this.executeNewMessageThrottle, 128);
        this.newMessageDropThrottle = throttle(this.executeNewMessageDropThrottle, 128);
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
        if (!this.active) {
            return;
        }
        const currentUpdateId = this.lastUpdateId;
        const minId = data.minupdateid || 0;
        const maxId = data.maxupdateid || 0;
        window.console.debug('on update, current:', currentUpdateId, 'min:', minId, 'max:', maxId);
        if ((this.outOfSync || currentUpdateId + 1 !== minId) && !(minId === 0 && maxId === 0)) {
            this.outOfSyncCheck(data);
            return;
        }
        this.applyUpdates(data);
    }

    public idleHandler() {
        this.callHandlers(C_MSG.OutOfSync, {});
    }

    public listen(eventConstructor: number, fn: any): (() => void) | null {
        if (!eventConstructor) {
            return null;
        }
        this.fnIndex++;
        const fnIndex = this.fnIndex;
        if (!this.fnQueue.hasOwnProperty(eventConstructor)) {
            this.fnQueue[eventConstructor] = {};
        }
        this.fnQueue[eventConstructor][fnIndex] = fn;
        return () => {
            delete this.fnQueue[eventConstructor][fnIndex];
        };
    }

    public forceLogOut() {
        this.callHandlers(C_MSG.UpdateAuthorizationReset, {});
    }

    public disable() {
        this.active = false;
    }

    public enable() {
        this.active = true;
    }

    /* Set message id from API */
    public setMessageId(messageId: number) {
        this.rndMsgMap[messageId] = true;
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
                    this.callHandlers(C_MSG.OutOfSync, {});
                    return;
                }
            }
        }
        updates.forEach((update) => {
            try {
                this.responseUpdateMessageID(update);
            } catch (e) {
                this.callHandlers(C_MSG.OutOfSync, {});
            }
        });
        updates.forEach((update) => {
            try {
                this.response(update);
            } catch (e) {
                this.callHandlers(C_MSG.OutOfSync, {});
            }
        });
        if (this.active && data.maxupdateid) {
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
                    this.updateList = [];
                    this.outOfSync = false;
                    this.outOfSyncTimeout = null;
                    this.callHandlers(C_MSG.OutOfSync, {});
                    // this.disable();
                }, 500);
            }
        }
    }

    private responseUpdateMessageID(update: UpdateEnvelope.AsObject) {
        // @ts-ignore
        const data: Uint8Array = update.update;
        switch (update.constructor) {
            case C_MSG.UpdateMessageID:
                const updateMessageId = UpdateMessageID.deserializeBinary(data).toObject();
                this.rndMsgMap[updateMessageId.messageid || 0] = true;
                this.callHandlers(C_MSG.UpdateMessageID, updateMessageId);
                break;
        }
    }

    private response(update: UpdateEnvelope.AsObject) {
        let flushUpdateId = true;
        // @ts-ignore
        const data: Uint8Array = update.update;
        switch (update.constructor) {
            case C_MSG.UpdateNewMessage:
                const updateNewMessage = UpdateNewMessage.deserializeBinary(data).toObject();
                if (!this.rndMsgMap[updateNewMessage.message.id || 0]) {
                    this.throttledNewMessage(updateNewMessage);
                } else {
                    this.throttledNewMessageDrop(updateNewMessage);
                    delete this.rndMsgMap[updateNewMessage.message.id || 0];
                }
                flushUpdateId = false;
                break;
            case C_MSG.UpdateReadHistoryInbox:
                this.callHandlers(C_MSG.UpdateReadHistoryInbox, UpdateReadHistoryInbox.deserializeBinary(data).toObject());
                flushUpdateId = false;
                break;
            case C_MSG.UpdateReadHistoryOutbox:
                this.callHandlers(C_MSG.UpdateReadHistoryOutbox, UpdateReadHistoryOutbox.deserializeBinary(data).toObject());
                flushUpdateId = false;
                break;
            case C_MSG.UpdateUserTyping:
                this.callHandlers(C_MSG.UpdateUserTyping, UpdateUserTyping.deserializeBinary(data).toObject());
                flushUpdateId = false;
                break;
            case C_MSG.UpdateMessageEdited:
                const updateMessageEdited = UpdateMessageEdited.deserializeBinary(data).toObject();
                updateMessageEdited.message = MessageRepo.parseMessage(updateMessageEdited.message, this.userId);
                if (updateMessageEdited.message && this.messageList.hasOwnProperty(updateMessageEdited.message.peerid || '')) {
                    const index = findIndex(this.messageList[updateMessageEdited.message.peerid || ''], (item) => {
                        return item.message.id === updateMessageEdited.message.id;
                    });
                    if (index > -1) {
                        this.messageList[updateMessageEdited.message.peerid || ''][index].message = updateMessageEdited.message;
                    } else {
                        this.callHandlers(C_MSG.UpdateMessageEdited, updateMessageEdited);
                    }
                } else {
                    this.callHandlers(C_MSG.UpdateMessageEdited, updateMessageEdited);
                }
                break;
            case C_MSG.UpdateMessagesDeleted:
                const updateMessagesDeleted = UpdateMessagesDeleted.deserializeBinary(data).toObject();
                if (updateMessagesDeleted.peer) {
                    updateMessagesDeleted.messageidsList.forEach((id) => {
                        if (updateMessagesDeleted.peer && this.messageList.hasOwnProperty(updateMessagesDeleted.peer.id || '')) {
                            const index = findIndex(this.messageList[updateMessagesDeleted.peer.id || ''], (item) => {
                                return item.message.id === id;
                            });
                            if (index > -1) {
                                this.messageList[updateMessagesDeleted.peer.id || ''].splice(index, 1);
                            }
                        }
                    });
                }
                this.callHandlers(C_MSG.UpdateMessagesDeleted, updateMessagesDeleted);
                break;
            case C_MSG.UpdateUsername:
                this.callHandlers(C_MSG.UpdateUsername, UpdateUsername.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateNotifySettings:
                this.callHandlers(C_MSG.UpdateNotifySettings, UpdateNotifySettings.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateUserPhoto:
                this.callHandlers(C_MSG.UpdateUserPhoto, UpdateUserPhoto.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateGroupPhoto:
                this.callHandlers(C_MSG.UpdateGroupPhoto, UpdateGroupPhoto.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateReadMessagesContents:
                this.callHandlers(C_MSG.UpdateReadMessagesContents, UpdateReadMessagesContents.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateTooLong:
                this.callHandlers(C_MSG.OutOfSync, {});
                break;
            case C_MSG.UpdateAuthorizationReset:
                this.callHandlers(C_MSG.UpdateAuthorizationReset, {});
                flushUpdateId = false;
                break;
            case C_MSG.UpdateDialogPinned:
                this.callHandlers(C_MSG.UpdateDialogPinned, UpdateDialogPinned.deserializeBinary(data).toObject());
                flushUpdateId = false;
                break;
            case C_MSG.UpdateDraftMessage:
                this.callHandlers(C_MSG.UpdateDraftMessage, UpdateDraftMessage.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateDraftMessageCleared:
                this.callHandlers(C_MSG.UpdateDraftMessageCleared, UpdateDraftMessageCleared.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateGroupParticipantAdd:
                this.callHandlers(C_MSG.UpdateGroupParticipantAdd, UpdateGroupParticipantAdd.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateGroupParticipantDeleted:
                this.callHandlers(C_MSG.UpdateGroupParticipantDeleted, UpdateGroupParticipantDeleted.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateLabelSet:
                this.callHandlers(C_MSG.UpdateLabelSet, UpdateLabelSet.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateLabelDeleted:
                this.callHandlers(C_MSG.UpdateLabelDeleted, UpdateLabelDeleted.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateLabelItemsAdded:
                this.callHandlers(C_MSG.UpdateLabelItemsAdded, UpdateLabelItemsAdded.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateLabelItemsRemoved:
                this.callHandlers(C_MSG.UpdateLabelItemsRemoved, UpdateLabelItemsRemoved.deserializeBinary(data).toObject());
                break;
            default:
                break;
        }
        if (flushUpdateId) {
            this.flushUpdateIdThrottle();
        }
    }

    private callHandlers(eventConstructor: number, payload: any) {
        if (!this.fnQueue[eventConstructor]) {
            return;
        }
        const keys = Object.keys(this.fnQueue[eventConstructor]);
        keys.forEach((key) => {
            const fn = this.fnQueue[eventConstructor][key];
            if (fn) {
                fn(payload);
            }
        });
    }

    private throttledNewMessage(data: UpdateNewMessage.AsObject) {
        if (!data.message.peerid) {
            return;
        }
        if (!this.messageList.hasOwnProperty(data.message.peerid)) {
            this.messageList[data.message.peerid] = [data];
        } else {
            this.messageList[data.message.peerid].push(data);
        }
        this.newMessageThrottle();
    }

    private executeNewMessageThrottle = () => {
        setTimeout(() => {
            this.prepareBulkUpdate(C_MSG.UpdateNewMessage, this.messageList);
        }, 100);
    }

    private throttledNewMessageDrop(data: UpdateNewMessage.AsObject) {
        if (!data.message.peerid) {
            return;
        }
        if (!this.messageDropList.hasOwnProperty(data.message.peerid)) {
            this.messageDropList[data.message.peerid] = [data];
        } else {
            this.messageDropList[data.message.peerid].push(data);
        }
        this.newMessageDropThrottle();
    }

    private executeNewMessageDropThrottle = () => {
        this.prepareBulkUpdate(C_MSG.UpdateNewMessageDrop, this.messageDropList);
    }

    private prepareBulkUpdate(eventConstructor: number, list: { [key: string]: UpdateNewMessage.AsObject[] }) {
        const keys = Object.keys(list);
        if (keys.length === 0) {
            return;
        }
        keys.forEach((key) => {
            const batchUpdate: INewMessageBulkUpdate = {
                accessHashes: [],
                maxMessageId: 0,
                messages: [],
                minMessageId: 1000000000,
                peerid: '',
                peertype: undefined,
                senderIds: [],
                senders: [],
            };
            while (list[key].length > 0) {
                const data = list[key].pop();
                if (data) {
                    batchUpdate.accessHashes.push(data.accesshash || '');
                    batchUpdate.messages.push(MessageRepo.parseMessage(data.message, this.userId));
                    batchUpdate.senderIds.push(data.sender.id || '');
                    batchUpdate.senders.push(data.sender);
                    batchUpdate.peerid = data.message.peerid || '';
                    batchUpdate.peertype = data.message.peertype;
                    if (batchUpdate.maxMessageId < (data.message.id || 0)) {
                        batchUpdate.maxMessageId = (data.message.id || 0);
                    }
                    if (batchUpdate.minMessageId > (data.message.id || 0)) {
                        batchUpdate.minMessageId = (data.message.id || 0);
                    }
                }
                if (batchUpdate.messages.length >= 50) {
                    break;
                }
            }
            if (batchUpdate.messages.length > 0) {
                const swap = (obj: any, a: number, b: number) => {
                    const hold = obj[a];
                    obj[a] = obj[b];
                    obj[b] = hold;
                };
                for (let i = 0; i < batchUpdate.messages.length; i++) {
                    for (let j = 0; j < i; j++) {
                        if ((batchUpdate.messages[i].id || 0) < (batchUpdate.messages[j].id || 0)) {
                            swap(batchUpdate.messages, i, j);
                            swap(batchUpdate.accessHashes, i, j);
                            swap(batchUpdate.senderIds, i, j);
                            swap(batchUpdate.senders, i, j);
                        }
                    }
                }
                this.callHandlers(eventConstructor, batchUpdate);
            }
        });
    }
}
