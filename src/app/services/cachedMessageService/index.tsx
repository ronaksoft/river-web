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
}
