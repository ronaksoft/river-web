import {C_MSG} from '../../const';
import {UpdateContainer, UpdateEnvelope} from '../../messages/core.messages_pb';
import {
    UpdateMessageEdited, UpdateMessageID,
    UpdateNewMessage,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox,
    UpdateUserTyping
} from '../../messages/api.updates_pb';

export default class UpdateManager {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UpdateManager();
        }

        return this.instance;
    }

    private static instance: UpdateManager;

    private fnQueue: any = {};
    private fnIndex: number = 0;
    private lastUpdateId: number = 0;
    private rndMsgMap: {[key:number]:boolean} = {};

    public constructor() {
        window.console.log('Update manager started');
        this.getLastUpdateId();
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

    public getLastUpdateId(): number {
        const data = localStorage.getItem('river.last_update_id');
        if (data) {
            this.lastUpdateId = JSON.parse(data).lastId;
            return this.lastUpdateId;
        }
        return 0;
    }

    private setLastUpdateId(id: number) {
        this.lastUpdateId = id;
        localStorage.setItem('river.last_update_id', JSON.stringify({
            lastId: this.lastUpdateId,
        }));
    }

    private response(update: UpdateEnvelope) {
        const data = update.getUpdate_asU8();
        switch (update.getConstructor()) {
            case C_MSG.UpdateMessageID:
                const updateMessageId = UpdateMessageID.deserializeBinary(data).toObject();
                this.rndMsgMap[updateMessageId.messageid || 0] = true;
                window.console.log('UpdateMessageID', updateMessageId.messageid);
                break;
            case C_MSG.UpdateNewMessage:
                const updateNewMessage = UpdateNewMessage.deserializeBinary(data).toObject();
                window.console.log('UpdateNewMessage', updateNewMessage.message.id);
                if (!this.rndMsgMap[updateNewMessage.message.id || 0]) {
                    this.callHandlers(C_MSG.UpdateNewMessage, updateNewMessage);
                } else {
                    window.console.log('UpdateNewMessage drop on', updateNewMessage.message.id);
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
}
