/*
    Creation Time: 2019 - June - 22
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {C_VERSION} from "../../components/SettingsMenu";

export const C_IFRAME_SUBJECT = {
    IsLoaded: 'is_loaded',
    UnreadCounter: 'unread_counter',
    UserInfo: 'user_info',
};

export const C_IFRAME_CMD = {
    Bool: 'bool',
    Close: 'close',
    Error: 'error',
    Loaded: 'loaded',
    NewSession: 'new_session',
    Unread: 'unread_counter',
};

interface IMessageListener {
    cmd: string;
    reject: any;
    resolve: any;
    timeout?: any;
}

interface IMessage {
    client: string;
    cmd: string;
    data: any;
    mode: 'req' | 'res';
    reqId: number;
}

interface IResMessage {
    cmd: string;
    data: any;
    reqId: number;
}

export default class IframeService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new IframeService();
        }

        return this.instance;
    }

    private static instance: IframeService;

    private fnQueue: any = {};
    private fnIndex: number = 0;
    private reqId: number = 0;
    private messageListeners: { [key: number]: IMessageListener } = {};
    private active: boolean = false;

    private constructor() {
        window.addEventListener('message', (e) => {
            if (e.data) {
                try {
                    const data: IMessage = JSON.parse(e.data);
                    if (['nested_web'].indexOf(data.client) > -1) {
                        if (data.mode === 'res') {
                            this.response(data);
                        } else if (data.mode === 'req') {
                            this.callHandlers(data.cmd, data);
                        }
                    }
                } catch (e) {
                    window.console.warn(e);
                }
            }
        });
    }

    /* Listen to event */
    public listen(subject: string, fn: (e: IMessage) => void): (() => void) | null {
        if (!subject) {
            return null;
        }
        this.fnIndex++;
        const fnIndex = this.fnIndex;
        if (!this.fnQueue.hasOwnProperty(subject)) {
            this.fnQueue[subject] = {};
        }
        this.fnQueue[subject][fnIndex] = fn;
        return () => {
            delete this.fnQueue[subject][fnIndex];
        };
    }

    public loaded(reqId: number) {
        this.sendResponse({
            cmd: C_IFRAME_CMD.Loaded,
            data: {
                version: C_VERSION,
            },
            reqId,
        });
        this.active = true;
    }

    public bool(reqId: number) {
        this.sendResponse({
            cmd: C_IFRAME_CMD.Bool,
            data: true,
            reqId,
        });
    }

    public setUnreadCounter(unread: number) {
        if (!this.active) {
            return;
        }
        return this.send(C_IFRAME_CMD.Unread, {
            unread,
        });
    }

    public close() {
        if (!this.active) {
            return;
        }
        return this.send(C_IFRAME_CMD.Close, {});
    }

    public newSession() {
        if (!this.active) {
            return;
        }
        return this.send(C_IFRAME_CMD.NewSession, {});
    }

    public isActive() {
        return this.active;
    }

    /* Call queue handler */
    private callHandlers(subject: string, payload: IMessage) {
        if (!this.fnQueue[subject]) {
            return;
        }
        const keys = Object.keys(this.fnQueue[subject]);
        keys.forEach((key) => {
            const fn = this.fnQueue[subject][key];
            if (fn) {
                fn(payload);
            }
        });
    }

    private sendResponse(data: IResMessage) {
        window.parent.postMessage(JSON.stringify({
            client: 'river_web',
            cmd: data.cmd,
            data: data.data,
            mode: 'res',
            reqId: data.reqId,
        }), '*');
    }

    // @ts-ignore
    private send(cmd: string, data: any) {
        let internalResolve = null;
        let internalReject = null;

        const reqId = ++this.reqId;

        const promise = new Promise<any>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        this.messageListeners[reqId] = {
            cmd,
            reject: internalReject,
            resolve: internalResolve,
        };

        window.parent.postMessage(JSON.stringify({
            client: 'river_web',
            cmd,
            data,
            mode: 'req',
            reqId,
        }), '*');

        this.messageListeners[reqId].timeout = setTimeout(() => {
            this.dispatchTimeout(reqId);
        }, 10000);

        return promise;
    }

    private response(data: IMessage) {
        if (!this.messageListeners.hasOwnProperty(data.reqId)) {
            return false;
        }
        if (data.cmd === C_IFRAME_CMD.Error) {
            this.messageListeners[data.reqId].reject(data.data);
        } else {
            this.messageListeners[data.reqId].resolve(data.data);
        }
        if (this.messageListeners[data.reqId].timeout) {
            clearTimeout(this.messageListeners[data.reqId].timeout);
        }
        delete this.messageListeners[data.reqId];
        return true;
    }

    private dispatchTimeout(reqId: number) {
        const item = this.messageListeners[reqId];
        if (!item) {
            return;
        }
        if (item.reject) {
            item.reject({
                err: 'timeout',
                reqId,
            });
        }
    }
}
