/*
    Creation Time: 2019 - July - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {IMessage} from "../../repository/message/interface";

interface ICachedMessage {
    message: IMessage;
    peerId: string;
    timeout: any;
}

export interface ICachedMessageServiceBroadcastItemData {
    id: number;
    mode: 'updated' | 'removed';
}

interface IBroadcastItem {
    fnQueue: { [key: number]: any };
    data: ICachedMessageServiceBroadcastItemData | null;
}

const C_CACHE_TTL = 67;

export default class CachedMessageService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new CachedMessageService();
        }
        return this.instance;
    }

    private static instance: CachedMessageService;

    private messages: { [key: number]: ICachedMessage } = {};
    private peerIds: { [key: string]: number[] } = {};

    private fnIndex: number = 0;
    private listeners: { [key: string]: IBroadcastItem } = {};

    public constructor() {
        //
    }

    /* Get message */
    public getMessage(peerId: string, id: number): IMessage | null {
        if (this.messages.hasOwnProperty(id)) {
            if (this.messages[id].timeout !== null) {
                clearTimeout(this.messages[id].timeout);
            }
            return this.messages[id].message;
        }
        return null;
    }

    /* Set message */
    public setMessage(message: IMessage) {
        const id = message.id || 0;
        const peerId = message.peerid || '';
        if (this.messages.hasOwnProperty(id)) {
            if (this.messages[id].timeout !== null) {
                clearTimeout(this.messages[id].timeout);
            }
        }
        this.messages[id] = {
            message,
            peerId,
            timeout: null,
        };
        if (!this.peerIds.hasOwnProperty(peerId)) {
            this.peerIds[peerId] = [];
        }
        const index = this.peerIds[peerId].indexOf(id);
        if (index === -1) {
            this.peerIds[peerId].push(id);
        }
    }

    /* Update message */
    public updateMessage(message: IMessage) {
        const id = message.id || 0;
        const peerId = message.peerid || '';
        if (!this.peerIds.hasOwnProperty(peerId)) {
            return;
        }
        this.messages[id] = {
            message,
            peerId,
            timeout: null,
        };
        this.callHandlers(id, {
            id,
            mode: 'updated',
        });
    }

    /* Remove message */
    public removeMessage(id: number) {
        if (this.messages.hasOwnProperty(id)) {
            if (this.peerIds.hasOwnProperty(this.messages[id].peerId)) {
                const index = this.peerIds[this.messages[id].peerId].indexOf(id);
                if (index > -1) {
                    this.peerIds[this.messages[id].peerId].splice(index);
                }
            }
            clearTimeout(this.messages[id].timeout);
            delete this.messages[id];
            this.callHandlers(id, {
                id,
                mode: 'removed',
            });
        }
    }

    /* Start cache clear timeout */
    public unmountCache(id: number, ttl?: number) {
        if (this.messages.hasOwnProperty(id)) {
            if (this.peerIds.hasOwnProperty(this.messages[id].peerId)) {
                const index = this.peerIds[this.messages[id].peerId].indexOf(id);
                if (index > -1) {
                    this.peerIds[this.messages[id].peerId].splice(index);
                }
            }
            this.messages[id].timeout = setTimeout(() => {
                if (this.messages.hasOwnProperty(id)) {
                    delete this.messages[id];
                }
            }, ttl !== undefined ? ttl : (C_CACHE_TTL * 1000));
        }
    }

    /* Clear peer id messages */
    public clearPeerId(peerId: string) {
        if (this.peerIds.hasOwnProperty(peerId)) {
            this.peerIds[peerId].forEach((id) => {
                if (this.messages.hasOwnProperty(id)) {
                    if (this.messages[id].timeout) {
                        clearTimeout(this.messages[id].timeout);
                    }
                    delete this.messages[id];
                }
            });
            delete this.peerIds[peerId];
        }
    }

    /* Listen to message change */
    public listen(messageId: number, fn: any): (() => void) | null {
        if (!messageId) {
            return null;
        }
        const name = String(messageId);
        this.fnIndex++;
        const fnIndex = this.fnIndex;
        if (!this.listeners.hasOwnProperty(name)) {
            this.listeners[name] = {
                data: null,
                fnQueue: [],
            };
        }
        this.listeners[name].fnQueue[fnIndex] = fn;
        return () => {
            if (this.listeners.hasOwnProperty(name)) {
                delete this.listeners[name].fnQueue[fnIndex];
            }
        };
    }

    private callHandlers(messageId: number, data: ICachedMessageServiceBroadcastItemData) {
        const name = String(messageId);
        if (!this.listeners.hasOwnProperty(name)) {
            return;
        }
        this.listeners[name].data = data;
        const keys = Object.keys(this.listeners[name].fnQueue);
        keys.forEach((key) => {
            const fn = this.listeners[name].fnQueue[key];
            if (fn) {
                fn(data);
            }
        });
    }
}
