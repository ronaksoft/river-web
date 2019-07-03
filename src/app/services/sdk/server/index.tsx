/*
    Creation Time: 2018 - Sep - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {C_ERR, C_ERR_ITEM, C_MSG, C_MSG_NAME} from '../const';
import Presenter from '../presenters';
import UpdateManager from './updateManager';
import {MessageContainer, MessageEnvelope} from '../messages/chat.core.types_pb';
import {throttle} from 'lodash';
import Socket from './socket';
import {base64ToU8a} from '../fileManager/http/utils';

const C_IDLE_TIME = 300;

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
    private readonly executeSendThrottledRequestThrottle: any;
    private lastActivityTime: number = 0;

    public constructor() {
        this.socket = Socket.getInstance();
        this.reqId = 0;
        this.lastActivityTime = this.getTime();
        this.startIdleCheck();
        const version = this.shouldMigrate(localStorage.getItem('river.version'));
        if (version !== false) {
            this.migrate(version);
            return;
        } else {
            this.socket.setCallback((data: any) => {
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
            let throttleInterval = 200;
            const tils = localStorage.getItem('river.debug.throttle_interval');
            if (tils) {
                throttleInterval = parseInt(tils, 10);
            }
            this.executeSendThrottledRequestThrottle = throttle(this.executeSendThrottledRequest, throttleInterval);
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

    public startNetwork() {
        this.socket.start();
    }

    public stopNetwork() {
        this.socket.stop();
    }

    /* Generate string from request and send to the api */
    private sendRequest(request: IServerRequest) {
        window.console.debug(`%c${C_MSG_NAME[request.constructor]} ${request.reqId}`, 'color: #f9d71c');
        request.timeout = setTimeout(() => {
            this.dispatchTimeout(request.reqId);
        }, 10000);
        this.socket.send(request);
    }

    private sendThrottledRequest(request: IServerRequest) {
        window.console.debug(`%c${C_MSG_NAME[request.constructor]} ${request.reqId}`, 'color: #f9d71c');
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
            window.console.debug(`%c${C_MSG_NAME[constructor]} ${reqId}`, 'color: #f9d71c');
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
                    const resData = res.toObject();
                    if (resData.code === C_ERR.ERR_CODE_INTERNAL && resData.items === C_ERR_ITEM.ERR_ITEM_USER_ID) {
                        this.updateManager.forceLogOut();
                    } else {
                        this.messageListeners[reqId].reject(resData);
                    }
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
        window.console.debug(`%c${C_MSG_NAME[constructor]} ${reqId}`, 'color: #f9d71c');
        const res = Presenter.getMessage(constructor, base64ToU8a(data));
        if (res) {
            if (constructor === C_MSG.Error) {
                const resp = res.toObject();
                if (resp.code === 'E01' && resp.items === 'AUTH') {
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
            const name = C_MSG_NAME[item.request.constructor];
            item.reject({
                constructor: name,
                err: 'timeout',
                reqId,
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
        }, 5);
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

    private getTime() {
        return Math.floor(Date.now() / 1000);
    }

    private startIdleCheck() {
        setInterval(() => {
            const now = this.getTime();
            if (now - this.lastActivityTime > C_IDLE_TIME) {
                this.lastActivityTime = now;
                this.updateManager.idleHandler();
            }
        }, 10000);
    }
}
