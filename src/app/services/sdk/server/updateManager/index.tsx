import {C_MSG} from '../../const';
import {UpdateContainer, UpdateEnvelope} from '../../messages/core.messages_pb';
import {
    UpdateMessageEdited, UpdateMessageID,
    UpdateNewMessage,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox,
    UpdateUserTyping
} from '../../messages/api.updates_pb';
import {throttle} from 'lodash';
import {User} from '../../messages/core.types_pb';
import {IMessage} from '../../../../repository/message/interface';

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

    public parseUpdate(bytes: string) {
        // @ts-ignore
        const arr = Uint8Array.from(atob(bytes), c => c.charCodeAt(0));
        const data = UpdateContainer.deserializeBinary(arr);
        const updates = data.getUpdatesList();
        const currentUpdateId = this.getLastUpdateId();
        const minId = data.getMinupdateid();
        const maxId = data.getMaxupdateid();
        window.console.log('on update, current:', currentUpdateId, 'min:', minId, 'max:', maxId);
        if (currentUpdateId + 1 !== minId && (minId || 0) > currentUpdateId) {
            this.callHandlers(C_MSG.OutOfSync, {});
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

    private responseUpdateMessageID(update: UpdateEnvelope) {
        const data = update.getUpdate_asU8();
        switch (update.getConstructor()) {
            case C_MSG.UpdateMessageID:
                const updateMessageId = UpdateMessageID.deserializeBinary(data).toObject();
                this.rndMsgMap[updateMessageId.messageid || 0] = true;
                // window.console.log('UpdateMessageID', 'msg id:', updateMessageId.messageid);
                break;
        }
    }

    private response(update: UpdateEnvelope) {
        const data = update.getUpdate_asU8();
        switch (update.getConstructor()) {
            case C_MSG.UpdateNewMessage:
                const updateNewMessage = UpdateNewMessage.deserializeBinary(data).toObject();
                // window.console.log('UpdateNewMessage', 'msg id:', updateNewMessage.message.id);
                if (!this.rndMsgMap[updateNewMessage.message.id || 0]) {
                    // this.callHandlers(C_MSG.UpdateNewMessage, updateNewMessage);
                    this.throttledNewMessage(updateNewMessage);
                } else {
                    // window.console.log('UpdateNewMessage drop on', 'msg id:', updateNewMessage.message.id);
                    // this.callHandlers(C_MSG.UpdateNewMessageDrop, updateNewMessage);
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
                    batchUpdate.messages.push(data.message);
                    batchUpdate.senderIds.push(data.sender.id || '');
                    batchUpdate.senders.push(data.sender);
                    batchUpdate.peerid = data.message.peerid || '';
                    batchUpdate.peertype = data.message.peertype;
                }
                if (batchUpdate.messages.length >= 50) {
                    break;
                }
            }
            window.console.log(batchUpdate.messages.length);
            if (batchUpdate.messages.length > 0) {
                this.callHandlers(eventConstructor, batchUpdate);
            }
        });
    }
}
