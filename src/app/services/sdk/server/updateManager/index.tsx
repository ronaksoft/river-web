/*
    Creation Time: 2018 - Oct - 03
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {C_MSG} from '../../const';
import {UpdateContainer, UpdateEnvelope} from '../../messages/core.messages_pb';
import {
    UpdateMessageEdited, UpdateMessageID, UpdateMessagesDeleted,
    UpdateNewMessage, UpdateNotifySettings,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox, UpdateUsername,
    UpdateUserTyping
} from '../../messages/api.updates_pb';
import {throttle} from 'lodash';
import {User} from '../../messages/core.types_pb';
import {IMessage} from '../../../../repository/message/interface';
import MessageRepo from '../../../../repository/message';

export interface INewMessageBulkUpdate {
    accessHashes: string[];
    messages: IMessage[];
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
    private newMessageThrottle: any;
    private newMessageDropThrottle: any;
    private active: boolean = true;
    private userId: string = '';

    public constructor() {
        window.console.log('Update manager started');
        this.lastUpdateId = this.loadLastUpdateId();
        this.newMessageThrottle = throttle(this.executeNewMessageThrottle, 300);
        this.newMessageDropThrottle = throttle(this.executeNewMessageDropThrottle, 300);
    }

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

    public flushLastUpdateId() {
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
        if (!this.active) {
            return;
        }
        // @ts-ignore
        const arr = Uint8Array.from(atob(bytes), c => c.charCodeAt(0));
        const data = UpdateContainer.deserializeBinary(arr).toObject();
        const updates = data.updatesList;
        const currentUpdateId = this.lastUpdateId;
        const minId = data.minupdateid;
        const maxId = data.maxupdateid;
        window.console.log('on update, current:', currentUpdateId, 'min:', minId, 'max:', maxId);
        if (currentUpdateId + 1 !== minId && !(minId === 0 && maxId === 0)) {
            this.callHandlers(C_MSG.OutOfSync, {});
            this.disable();
            return;
        }
        if (maxId && maxId !== 0) {
            this.setLastUpdateId(maxId);
        }
        updates.forEach((update) => {
            this.responseUpdateMessageID(update);
        });
        updates.forEach((update) => {
            this.response(update);
        });
        if (data.usersList && data.usersList.length > 0) {
            this.callHandlers(C_MSG.UpdateUsers, data.usersList);
        }
        if (data.groupsList && data.groupsList.length > 0) {
            this.callHandlers(C_MSG.UpdateGroups, data.groupsList);
        }
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

    public disable() {
        this.active = false;
    }

    public enable() {
        this.active = true;
    }

    private responseUpdateMessageID(update: UpdateEnvelope.AsObject) {
        // @ts-ignore
        const data: Uint8Array = update.update;
        switch (update.constructor) {
            case C_MSG.UpdateMessageID:
                const updateMessageId = UpdateMessageID.deserializeBinary(data).toObject();
                this.rndMsgMap[updateMessageId.messageid || 0] = true;
                break;
        }
    }

    private response(update: UpdateEnvelope.AsObject) {
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
                break;
            case C_MSG.UpdateReadHistoryInbox:
                this.callHandlers(C_MSG.UpdateReadHistoryInbox, UpdateReadHistoryInbox.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateReadHistoryOutbox:
                this.callHandlers(C_MSG.UpdateReadHistoryOutbox, UpdateReadHistoryOutbox.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateUserTyping:
                this.callHandlers(C_MSG.UpdateUserTyping, UpdateUserTyping.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateMessageEdited:
                this.callHandlers(C_MSG.UpdateMessageEdited, UpdateMessageEdited.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateMessagesDeleted:
                this.callHandlers(C_MSG.UpdateMessagesDeleted, UpdateMessagesDeleted.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateUsername:
                this.callHandlers(C_MSG.UpdateUsername, UpdateUsername.deserializeBinary(data).toObject());
                break;
            case C_MSG.UpdateNotifySettings:
                this.callHandlers(C_MSG.UpdateNotifySettings, UpdateNotifySettings.deserializeBinary(data).toObject());
                break;
            default:
                break;
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
                messages: [],
                peerid: '',
                peertype: undefined,
                senderIds: [],
                senders: [],
            };
            while (list[key].length > 0) {
                const data = list[key].shift();
                if (data) {
                    batchUpdate.accessHashes.push(data.accesshash || '');
                    batchUpdate.messages.push(MessageRepo.parseMessage(data.message, this.userId));
                    batchUpdate.senderIds.push(data.sender.id || '');
                    batchUpdate.senders.push(data.sender);
                    batchUpdate.peerid = data.message.peerid || '';
                    batchUpdate.peertype = data.message.peertype;
                }
                if (batchUpdate.messages.length >= 50) {
                    break;
                }
            }
            if (batchUpdate.messages.length > 0) {
                this.callHandlers(eventConstructor, batchUpdate);
            }
        });
    }
}
