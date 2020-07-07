/*
    Creation Time: 2019 - July - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {IMessage} from "../../repository/message/interface";
import {GetPeerName} from "../../repository/dialog";

interface ICachedMessage {
    message: IMessage;
    peerName: string;
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
    private peerNames: { [key: string]: number[] } = {};

    private fnIndex: number = 0;
    private listeners: { [key: string]: IBroadcastItem } = {};

    /* Get message */
    public getMessage(peerName: string, id: number): IMessage | null {
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
        const peerName = GetPeerName(message.peerid || '', message.peertype || 0);
        if (this.messages.hasOwnProperty(id)) {
            if (this.messages[id].timeout !== null) {
                clearTimeout(this.messages[id].timeout);
            }
        }
        this.messages[id] = {
            message,
            peerName,
            timeout: null,
        };
        if (!this.peerNames.hasOwnProperty(peerName)) {
            this.peerNames[peerName] = [];
        }
        const index = this.peerNames[peerName].indexOf(id);
        if (index === -1) {
            this.peerNames[peerName].push(id);
        }
    }

    /* Update message */
    public updateMessage(message: IMessage) {
        const id = message.id || 0;
        const peerName = GetPeerName(message.peerid || '', message.peertype || 0);
        if (!this.peerNames.hasOwnProperty(peerName)) {
            return;
        }
        this.messages[id] = {
            message,
            peerName,
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
            if (this.peerNames.hasOwnProperty(this.messages[id].peerName)) {
                const index = this.peerNames[this.messages[id].peerName].indexOf(id);
                if (index > -1) {
                    this.peerNames[this.messages[id].peerName].splice(index);
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
            if (this.peerNames.hasOwnProperty(this.messages[id].peerName)) {
                const index = this.peerNames[this.messages[id].peerName].indexOf(id);
                if (index > -1) {
                    this.peerNames[this.messages[id].peerName].splice(index);
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
    public clearPeerId(name: string) {
        if (this.peerNames.hasOwnProperty(name)) {
            this.peerNames[name].forEach((id) => {
                if (this.messages.hasOwnProperty(id)) {
                    if (this.messages[id].timeout) {
                        clearTimeout(this.messages[id].timeout);
                    }
                    delete this.messages[id];
                }
            });
            delete this.peerNames[name];
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
