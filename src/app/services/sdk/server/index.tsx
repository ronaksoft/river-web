/*
    Creation Time: 2018 - Sep - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {C_MSG, C_MSG_NAME} from '../const';
import Presenter from '../presenters';
import UpdateManager from './updateManager';
import {MessageContainer, MessageEnvelope} from '../messages/core.messages_pb';
import {throttle} from 'lodash';
import Socket from './socket';
import {base64ToU8a} from '../fileServer/http/utils';

export interface IServerRequest {
    constructor: number;
    data: Uint8Array;
    reqId: number;
    timeout: any;
}

export default class Server {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new Server();
        }

        return this.instance;
    }

    private static instance: Server;

    private socket: Socket;
    private reqId: number;
    private messageListeners: object = {};
    private sentQueue: number[] = [];
    private updateQueue: any[] = [];
    private updateManager: UpdateManager;
    private isConnected: boolean = false;
    private requestQueue: MessageEnvelope[] = [];
    private executeSendThrottledRequestThrottle: any;

    public constructor() {
        this.socket = Socket.getInstance();
        this.reqId = 0;
        const version = this.shouldMigrate(localStorage.getItem('river.version'));
        if (version !== false) {
            this.migrate(version);
            return;
        } else {
            this.socket.setCallback((data: any) => {
                window.console.log(data);
                this.response(data);
            });

            this.socket.setUpdate((data: any) => {
                this.update(data);
            });

            this.socket.setError((data: any) => {
                this.error(data);
            });

            window.addEventListener('wsOpen', () => {
                this.isConnected = true;
                this.flushSentQueue();
                this.executeSendThrottledRequestThrottle();
            });

            window.addEventListener('wsClose', () => {
                this.isConnected = false;
            });

            this.updateThrottler();
            this.updateManager = UpdateManager.getInstance();
            this.executeSendThrottledRequestThrottle = throttle(this.executeSendThrottledRequest, 200);
        }
    }

    /* Send a request to WASM worker over CustomEvent in window object */
    public send(constructor: number, data: Uint8Array, instant?: boolean): Promise<any> {
        let internalResolve = null;
        let internalReject = null;

        const reqId = ++this.reqId;
        const request: IServerRequest = {
            constructor,
            data,
            reqId,
            timeout: null,
        };

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
            if (this.isConnected) {
                if (instant) {
                    this.sendRequest(request);
                } else {
                    this.sendThrottledRequest(request);
                }
            }
        });

        /* Add request to the queue manager */
        this.messageListeners[reqId] = {
            reject: internalReject,
            request,
            resolve: internalResolve,
            state: 0,
        };

        this.sentQueue.push(reqId);

        return promise;
    }

    /* Generate string from request and send to the api */
    private sendRequest(request: IServerRequest) {
        window.console.warn(C_MSG_NAME[request.constructor], request.reqId);
        request.timeout = setTimeout(() => {
            this.dispatchTimeout(request.reqId);
        }, 10000);
        this.socket.send(request);
    }

    private sendThrottledRequest(request: IServerRequest) {
        window.console.warn(C_MSG_NAME[request.constructor], request.reqId);
        request.timeout = setTimeout(() => {
            this.dispatchTimeout(request.reqId);
        }, 10000);
        const data = new MessageEnvelope();
        data.setConstructor(request.constructor);
        data.setMessage(request.data);
        data.setRequestid(request.reqId);
        this.requestQueue.push(data);
        this.executeSendThrottledRequestThrottle();
    }

    private executeSendThrottledRequest = () => {
        if (!this.isConnected) {
            return;
        }
        const execute = (envs: MessageEnvelope[]) => {
            if (envs.length === 0) {
                return;
            }
            const reqId = ++this.reqId;
            const data = new MessageContainer();
            data.setEnvelopesList(envs);
            data.setLength(envs.length);

            this.socket.send({
                constructor: C_MSG.MessageContainer,
                data: data.serializeBinary(),
                reqId,
                timeout: null,
            });
            window.console.log('Compact:', envs.length);
        };
        let envelopes: MessageEnvelope[] = [];
        while (this.requestQueue.length > 0) {
            const envelope = this.requestQueue.shift();
            if (envelope) {
                envelopes.push(envelope);
            }
            if (envelopes.length >= 50) {
                execute(envelopes);
                envelopes = [];
            }
        }
        execute(envelopes);
    }

    private response({reqId, constructor, data}: any) {
        if (constructor !== C_MSG.Error) {
            window.console.warn(C_MSG_NAME[constructor], reqId);
        }
        if (!this.messageListeners[reqId]) {
            return;
        }
        const res = Presenter.getMessage(constructor, base64ToU8a(data));
        if (constructor === C_MSG.Error) {
            window.console.error(C_MSG_NAME[constructor], reqId, res.toObject());
        }
        if (res) {
            if (constructor === C_MSG.Error) {
                if (this.messageListeners[reqId].reject) {
                    this.messageListeners[reqId].reject(res.toObject());
                }
            } else if (constructor === C_MSG.UpdateDifference) {
                if (this.messageListeners[reqId].resolve) {
                    this.messageListeners[reqId].resolve(res);
                }
            } else {
                if (this.messageListeners[reqId].resolve) {
                    this.messageListeners[reqId].resolve(res.toObject());
                }
            }
            clearTimeout(this.messageListeners[reqId].request.timeout);
            this.cleanQueue(reqId);
        }
    }

    private error({reqId, constructor, data}: any) {
        window.console.warn(C_MSG_NAME[constructor], reqId);
        const res = Presenter.getMessage(constructor, base64ToU8a(data));
        if (res) {
            if (constructor === C_MSG.Error) {
                const resp = res.toObject();
                if (resp.items === 'AUTH') {
                    const authErrorEvent = new CustomEvent('authErrorEvent', {});
                    window.dispatchEvent(authErrorEvent);
                }
            }
        }
    }

    private flushSentQueue() {
        this.sentQueue.forEach((reqId) => {
            this.sendRequest(this.messageListeners[reqId].request);
        });
    }

    private dispatchTimeout(reqId: number) {
        const item = this.messageListeners[reqId];
        if (!item) {
            return;
        }
        if (item.reject) {
            item.reject({
                err: 'timeout',
            });
        }
        this.cleanQueue(reqId);
    }

    private cleanQueue(reqId: number) {
        delete this.messageListeners[reqId];
        const index = this.sentQueue.indexOf(reqId);
        if (index > -1) {
            this.sentQueue.splice(index, 1);
        }
    }

    private update(bytes: any) {
        this.updateQueue.push(bytes);
    }

    private updateThrottler() {
        this.dispatchUpdate();
        setInterval(() => {
            this.dispatchUpdate();
        }, 50);
    }

    private dispatchUpdate() {
        if (this.updateQueue.length > 0) {
            this.updateManager.parseUpdate(this.updateQueue.pop());
        }
    }

    private shouldMigrate(v: string | null) {
        if (v === null) {
            return 0;
        }
        const pv = JSON.parse(v);
        switch (pv.v) {
            default:
            case 0:
                return pv.v;
            case 1:
                return false;
        }
    }

    private migrate(v: number | null) {
        switch (v) {
            default:
            case 0:
                this.migrate1();
                return;
        }
    }

    private migrate1() {
        // @ts-ignore
        for (const key in localStorage) {
            if (key.indexOf('_pouch_') === 0) {
                indexedDB.deleteDatabase(key);
                localStorage.removeItem(key);
            }
        }
        localStorage.setItem('river.last_update_id', JSON.stringify({
            lastId: 0,
        }));
        localStorage.setItem('river.version', JSON.stringify({
            v: 1,
        }));
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}
