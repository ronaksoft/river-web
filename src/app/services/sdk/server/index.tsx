/*
    Creation Time: 2018 - Sep - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {C_ERR, C_ERR_ITEM, C_LOCALSTORAGE, C_MSG, C_MSG_NAME} from '../const';
import Presenter from '../presenters';
import UpdateManager from './../updateManager';
import {throttle, cloneDeep, forEachRight} from 'lodash';
import Socket from './socket';
import {base64ToU8a, uint8ToBase64} from '../fileManager/http/utils';
import MainRepo from "../../../repository";
import * as Sentry from "@sentry/browser";
import {isProd} from "../../../../App";
import {EventCheckNetwork, EventWebSocketClose, EventWebSocketOpen} from "../../events";
import {SystemConfig} from "../messages/system_pb";
import {InputPassword, InputTeam, MessageContainer, MessageEnvelope} from "../messages/core.types_pb";
import {Error as RiverError} from "../messages/core.types_pb";
import {getServerKeys} from "../../../components/DevTools";

const C_IDLE_TIME = 300;
const C_TIMEOUT = 20000;
export const C_RETRY = 3;

interface IErrorPair {
    code: string;
    items: string;
}

interface IRequestOptions {
    retry?: number;
    retryErrors?: IErrorPair[];
    retryWait?: number;
    timeout?: number;
    inputTeam?: InputTeam.AsObject;
}

export interface IServerRequest {
    constructor: number;
    data: Uint8Array;
    inputTeam?: InputTeam.AsObject;
    options?: IRequestOptions;
    reqId: number;
    retry: number;
    timeout: any;
}

interface IMessageListener {
    reject: any;
    request: IServerRequest;
    resolve: any;
    state: number;
}

export const serverKeys = getServerKeys();

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
    private messageListeners: { [key: number]: IMessageListener } = {};
    private serviceMessagesListeners: object = {};
    private sentQueue: number[] = [];
    private updateQueue: any[] = [];
    private readonly updateManager: UpdateManager | undefined;
    private isConnected: boolean = false;
    private requestQueue: MessageEnvelope[] = [];
    private readonly executeSendThrottledRequestThrottle: any;
    private readonly checkNetworkThrottle: any;
    private lastActivityTime: number = 0;
    private cancelList: number[] = [];
    private updateInterval: any = null;
    private systemConfig: SystemConfig.AsObject = {dcsList: []};
    private inputTeam: InputTeam.AsObject | undefined;
    private verboseAPI: boolean = localStorage.getItem(C_LOCALSTORAGE.DebugVerboseAPI) === 'true';

    public constructor() {
        this.socket = Socket.getInstance();
        this.reqId = 0;
        this.getLastActivityTime();
        this.startIdleCheck();
        const version = this.shouldMigrate();
        if (version !== false) {
            this.migrate(version);
            return;
        } else {
            const systemConfig = localStorage.getItem(C_LOCALSTORAGE.SystemConfig);
            if (systemConfig) {
                try {
                    this.systemConfig = JSON.parse(systemConfig);
                } catch (e) {
                    window.console.warn(e);
                }
            }
            this.socket.setCallback((data: any) => {
                this.response(data);
            });

            this.socket.setUpdate((data: any) => {
                this.update(data);
            });

            this.socket.setError((data: any) => {
                this.error(data);
            });

            this.socket.setResolveGenSrpHashFn(this.genSrpHashResolve);

            this.socket.setResolveGenInputPasswordFn(this.genInputPasswordResolve);

            window.addEventListener(EventWebSocketOpen, () => {
                this.isConnected = true;
                this.flushSentQueue();
                if (this.executeSendThrottledRequestThrottle) {
                    this.executeSendThrottledRequestThrottle();
                }
            });

            window.addEventListener(EventWebSocketClose, () => {
                this.isConnected = false;
            });

            this.updateManager = UpdateManager.getInstance();
            let throttleInterval = 128;
            const tils = localStorage.getItem(C_LOCALSTORAGE.DebugThrottleInterval);
            if (tils) {
                throttleInterval = parseInt(tils, 10);
            }
            this.executeSendThrottledRequestThrottle = throttle(this.executeSendThrottledRequest, throttleInterval);
            this.checkNetworkThrottle = throttle(this.checkNetworkHandler, 1023);
        }
    }

    public setTeam(team: InputTeam.AsObject | undefined) {
        this.inputTeam = team;
        this.executeSendThrottledRequest();
    }

    /* Send a request to WASM worker over CustomEvent in window object */
    public send(constructor: number, data: Uint8Array, instant: boolean, options?: IRequestOptions, reqIdFn?: (rId: number) => void): Promise<any> {
        let internalResolve = null;
        let internalReject = null;

        const reqId = ++this.reqId;
        if (reqIdFn) {
            reqIdFn(reqId);
        }
        // retry on E00 Server error
        if (!options) {
            options = {
                retry: 3,
                retryErrors: [{
                    code: C_ERR.ErrCodeInternal,
                    items: C_ERR_ITEM.ErrItemServer,
                }],
            };
        } else {
            if (options.retryErrors) {
                if (!options.retryErrors.find(o => o.code === C_ERR.ErrCodeInternal && o.items === C_ERR_ITEM.ErrItemServer)) {
                    options.retryErrors.push({
                        code: C_ERR.ErrCodeInternal,
                        items: C_ERR_ITEM.ErrItemServer,
                    });
                }
            }
        }

        // if (this.inputTeam) {
        //     this.inputTeam.accesshash = '5675765';
        // }
        const request: IServerRequest = {
            constructor,
            data,
            inputTeam: options.inputTeam || this.inputTeam,
            options,
            reqId,
            retry: 0,
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

    public genSrpHash(password: string, algorithm: number, algorithmData: Uint8Array) {
        let internalResolve = null;
        let internalReject = null;

        const reqId = ++this.reqId;

        const promise = new Promise<Uint8Array>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        this.serviceMessagesListeners[reqId] = {
            reject: internalReject,
            resolve: internalResolve,
        };

        // @ts-ignore
        const encoder = new TextEncoder("utf-8");

        this.socket.fnGenSrpHash({
            algorithm,
            algorithmData: uint8ToBase64(algorithmData),
            pass: uint8ToBase64(encoder.encode(password)),
            reqId,
        });

        return promise;
    }

    public genInputPassword(password: string, accountPass: Uint8Array) {
        let internalResolve = null;
        let internalReject = null;

        const reqId = ++this.reqId;

        const promise = new Promise<InputPassword>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        this.serviceMessagesListeners[reqId] = {
            reject: internalReject,
            resolve: internalResolve,
        };

        // @ts-ignore
        const encoder = new TextEncoder("utf-8");

        this.socket.fnGenInputPassword({
            accountPass: uint8ToBase64(accountPass),
            pass: uint8ToBase64(encoder.encode(password)),
            reqId,
        });

        return promise;
    }

    public getSystemConfig(): SystemConfig.AsObject {
        return this.systemConfig;
    }

    public setSystemConfig(config: SystemConfig.AsObject) {
        this.systemConfig = config;
        localStorage.setItem(C_LOCALSTORAGE.SystemConfig, JSON.stringify(config));
    }

    public startNetwork() {
        this.socket.start();
    }

    public stopNetwork() {
        this.socket.stop();
    }

    public isStarted() {
        return this.socket.isStarted();
    }

    public cancelReqId(id: number) {
        if (this.cancelList.indexOf(id) === -1) {
            this.cancelList.push(id);
        }
    }

    private cancelRequestByEnvelope(envelope: MessageEnvelope) {
        // @ts-ignore
        this.cancelRequest({constructor: envelope.getConstructor() || 0, reqId: envelope.getRequestid() || 0});
    }

    private cancelRequest(request: IServerRequest) {
        const index = this.cancelList.indexOf(request.reqId);
        if (index > -1) {
            this.cancelList.splice(index, 1);
            delete this.messageListeners[request.reqId];
            window.console.debug(`%c${C_MSG_NAME[request.constructor]} ${request.reqId} cancelled`, 'color: #cc0000');
            return true;
        }
        return false;
    }

    /* Generate string from request and send to the api */
    private sendRequest(request: IServerRequest) {
        if (this.cancelList.length > 0) {
            if (this.cancelRequest(request)) {
                return;
            }
        }
        window.console.debug(`%c${C_MSG_NAME[request.constructor]} ${request.reqId} ${request.inputTeam && request.inputTeam.id !== '0' ? ('teamId: ' + request.inputTeam.id) : ''}`, 'color: #f9d71c');
        request.timeout = setTimeout(() => {
            this.dispatchTimeout(request.reqId);
        }, request.options ? (request.options.timeout || C_TIMEOUT) : C_TIMEOUT);
        this.socket.send(request);
    }

    private sendThrottledRequest(request: IServerRequest) {
        window.console.debug(`%c${C_MSG_NAME[request.constructor]} ${request.reqId} ${request.inputTeam && request.inputTeam.id !== '0' ? ('teamId: ' + request.inputTeam.id) : ''}`, 'color: #f9d74e');
        request.timeout = setTimeout(() => {
            this.dispatchTimeout(request.reqId);
        }, request.options ? (request.options.timeout || C_TIMEOUT) : C_TIMEOUT);
        const data = new MessageEnvelope();
        data.setConstructor(request.constructor);
        data.setMessage(request.data);
        data.setRequestid(request.reqId);
        if (request.inputTeam && request.inputTeam.id !== '0') {
            const inputTeam = new InputTeam();
            inputTeam.setAccesshash(request.inputTeam.accesshash || '0');
            inputTeam.setId(request.inputTeam.id || '0');
            data.setTeam(inputTeam);
        }
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
                inputTeam: this.inputTeam,
                reqId,
                retry: 0,
                timeout: null,
            });
        };
        let envelopes: MessageEnvelope[] = [];
        while (this.requestQueue.length > 0) {
            const envelope = this.requestQueue.shift();
            if (envelope) {
                if (this.cancelList.length > 0) {
                    this.cancelRequestByEnvelope(envelope);
                } else {
                    envelopes.push(envelope);
                }
            }
            if (envelopes.length >= 50) {
                execute(envelopes);
                envelopes = [];
            }
        }
        execute(envelopes);
    }

    private response({reqId, constructor, data}: any) {
        this.getLastActivityTime();
        if (constructor !== C_MSG.Error) {
            window.console.debug(`%c${C_MSG_NAME[constructor]} ${reqId}`, 'color: #f967a0');
        }
        if (!this.messageListeners[reqId]) {
            return;
        }
        try {
            const res = Presenter.getMessage(constructor, base64ToU8a(data));
            if (constructor === C_MSG.Error) {
                const errObj = res.toObject();
                if (errObj.code === C_ERR.ErrCodeUnavailable && errObj.items === C_ERR_ITEM.ErrItemInputFile && this.messageListeners[reqId] && this.messageListeners[reqId].request.constructor === C_MSG.FileGetBySha256) {
                    window.console.debug(`%cnot found ${reqId}`, 'color: #f967a0');
                } else {
                    window.console.error(C_MSG_NAME[constructor], reqId, errObj);
                }
            }
            if (res) {
                if (this.verboseAPI) {
                    window.console.info('%cResponse', 'background-color: #8124F9', res.toObject());
                }
                if (constructor === C_MSG.Error) {
                    const resData = res.toObject();
                    if (this.checkRetry(reqId, resData)) {
                        if (this.messageListeners[reqId].reject) {
                            let isLogout = false;
                            if (this.messageListeners[reqId] && this.messageListeners[reqId].request && this.messageListeners[reqId].request.constructor === C_MSG.AuthLogout) {
                                isLogout = true;
                            }
                            if (resData.code === C_ERR.ErrCodeUnavailable && resData.items === C_ERR_ITEM.ErrItemUserID && !isLogout) {
                                if (this.updateManager) {
                                    this.updateManager.forceLogOut();
                                }
                            } else {
                                this.messageListeners[reqId].reject(resData);
                            }
                        }
                    }
                } else if (constructor === C_MSG.UpdateDifference) {
                    if (this.messageListeners[reqId].resolve) {
                        this.messageListeners[reqId].resolve(res);
                    }
                } else {
                    if (this.messageListeners[reqId].resolve) {
                        if (constructor === C_MSG.AccountPassword) {
                            this.messageListeners[reqId].resolve(res);
                        } else {
                            this.messageListeners[reqId].resolve(res.toObject());
                        }
                    }
                }
                clearTimeout(this.messageListeners[reqId].request.timeout);
                this.cleanQueue(reqId);
            }
        } catch (e) {
            window.console.warn(e, `reqId: ${reqId}`);
            if (this.messageListeners[reqId] && this.messageListeners[reqId].request) {
                if (isProd) {
                    Sentry.captureMessage(`Assertion failed req: ${C_MSG_NAME[this.messageListeners[reqId].request.constructor]}, res: ${C_MSG_NAME[constructor]}`, Sentry.Severity.Warning);
                }
                const req = Presenter.getMessage(this.messageListeners[reqId].request.constructor, this.messageListeners[reqId].request.data);
                if (req) {
                    window.console.warn(`${C_MSG_NAME[this.messageListeners[reqId].request.constructor]} payload`, req.toObject());
                    if (isProd) {
                        Sentry.captureMessage(`Assertion failed ${e.toString()} | ${C_MSG_NAME[this.messageListeners[reqId].request.constructor]} payload: ${req.toObject().toString()}`, Sentry.Severity.Warning);
                    }
                }
            }
        }
    }

    private error({reqId, constructor, data}: any) {
        window.console.debug(`%c${C_MSG_NAME[constructor]} ${reqId}`, 'color: #f9d71c');
        const res = Presenter.getMessage(constructor, base64ToU8a(data));
        if (res) {
            if (constructor === C_MSG.Error) {
                const resp = res.toObject();
                if (resp.code === C_ERR.ErrCodeInvalid && resp.items === C_ERR_ITEM.ErrItemAuth) {
                    const authErrorEvent = new CustomEvent('authErrorEvent', {});
                    window.dispatchEvent(authErrorEvent);
                }
            }
        }
    }

    private flushSentQueue() {
        const skipIds = this.getSkippableRequestIds();
        this.sentQueue.forEach((reqId) => {
            if (this.messageListeners[reqId]) {
                const msg = this.messageListeners[reqId];
                if (skipIds.length > 0 && skipIds.indexOf(msg.request.reqId) > -1) {
                    if (msg.reject) {
                        msg.reject({
                            code: C_ERR.ErrCodeInternal,
                            items: C_ERR_ITEM.ErrItemSkip,
                        });
                    }
                    this.cleanQueue(reqId);
                } else {
                    this.sendRequest(msg.request);
                }
            }
        });
    }

    private dispatchTimeout(reqId: number) {
        const item = this.messageListeners[reqId];
        if (!item) {
            return;
        }
        window.console.warn('sdk timeout', reqId, C_MSG_NAME[item.request.constructor]);
        if (this.checkRetry(reqId, {
            code: C_ERR.ErrCodeInternal,
            items: C_ERR_ITEM.ErrItemTimeout,
        })) {
            if (item.reject) {
                const name = C_MSG_NAME[item.request.constructor];
                item.reject({
                    constructor: name,
                    err: 'timeout',
                    reqId,
                });
            }
        }
        this.cleanQueue(reqId);
        this.checkNetworkThrottle();
    }

    private checkNetworkHandler = () => {
        this.dispatchEvent(EventCheckNetwork, {});
    }

    private cleanQueue(reqId: number) {
        delete this.messageListeners[reqId];
        const index = this.sentQueue.indexOf(reqId);
        if (index > -1) {
            this.sentQueue.splice(index, 1);
        }
    }

    private update(bytes: any) {
        this.getLastActivityTime();
        this.updateQueue.push(bytes);
        this.updateThrottler();
    }

    private updateThrottler() {
        this.dispatchUpdate();
        if (!this.updateInterval) {
            this.updateInterval = setInterval(() => {
                this.dispatchUpdate();
            }, 5);
        }
    }

    private dispatchUpdate() {
        if (this.updateQueue.length > 0 && this.updateManager) {
            this.updateManager.parseUpdate(this.updateQueue.shift());
        } else {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    private shouldMigrate() {
        const v = localStorage.getItem(C_LOCALSTORAGE.Version);
        if (v === null) {
            localStorage.setItem(C_LOCALSTORAGE.Version, JSON.stringify({
                v: 6,
            }));
            return false;
        }
        const pv = JSON.parse(v);
        switch (pv.v) {
            default:
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                return pv.v;
            case 6:
                return false;
        }
    }

    private migrate(v: number | null) {
        switch (v) {
            default:
            case 0:
                this.migrate1();
                return;
            case 1:
            case 2:
                this.migrate2();
                return;
            case 3:
                this.migrate3();
                return;
            case 4:
            case 5:
                this.migrate4();
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
        localStorage.setItem(C_LOCALSTORAGE.LastUpdateId, JSON.stringify({
            lastId: 0,
        }));
        localStorage.setItem(C_LOCALSTORAGE.Version, JSON.stringify({
            v: 1,
        }));

        setTimeout(() => {
            this.migrate(1);
        }, 1000);
    }

    private migrate2() {
        if (this.updateManager) {
            this.updateManager.disableLiveUpdate();
        }
        setTimeout(() => {
            MainRepo.getInstance().destroyDB().then(() => {
                localStorage.removeItem(C_LOCALSTORAGE.LastUpdateId);
                localStorage.setItem(C_LOCALSTORAGE.Version, JSON.stringify({
                    v: 3,
                }));
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            });
        }, 1000);
    }

    private migrate3() {
        // setTimeout(() => {
        //     const messageRepo = MessageRepo.getInstance();
        //     messageRepo.getAllTemps().then((msgs) => {
        //         msgs.map((msg) => {
        //             msg.temp = false;
        //             return msg;
        //         });
        //         const promises: any[] = [];
        //         promises.push(messageRepo.importBulk(msgs));
        //         promises.push(messageRepo.insertDiscrete('0', msgs));
        //         Promise.all(promises).then(() => {
        //             localStorage.setItem(C_LOCALSTORAGE.Version, JSON.stringify({
        //                 v: 4,
        //             }));
        //             window.location.reload();
        //         });
        //     });
        // }, 100);
        localStorage.setItem(C_LOCALSTORAGE.Version, JSON.stringify({
            v: 4,
        }));
        window.location.reload();
    }

    private migrate4() {
        if (this.updateManager) {
            this.updateManager.disableLiveUpdate();
        }
        setTimeout(() => {
            MainRepo.getInstance().destroyDB().then(() => {
                localStorage.removeItem(C_LOCALSTORAGE.ContactsHash);
                localStorage.removeItem(C_LOCALSTORAGE.SettingsDownload);
                localStorage.removeItem(C_LOCALSTORAGE.GifHash);
                localStorage.removeItem(C_LOCALSTORAGE.TeamId);
                localStorage.removeItem(C_LOCALSTORAGE.TeamData);
                localStorage.removeItem(C_LOCALSTORAGE.SnapshotRecord);
                localStorage.removeItem(C_LOCALSTORAGE.ThemeBg);
                localStorage.removeItem(C_LOCALSTORAGE.ThemeBgPic);
                localStorage.removeItem(C_LOCALSTORAGE.LastUpdateId);
                localStorage.setItem(C_LOCALSTORAGE.Version, JSON.stringify({
                    v: 6,
                }));
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            });
        }, 1000);
    }

    private getTime() {
        return Math.floor(Date.now() / 1000);
    }

    private startIdleCheck() {
        setInterval(() => {
            if (!this.socket.isOnline()) {
                return;
            }
            const now = this.getTime();
            if (now - this.lastActivityTime > C_IDLE_TIME) {
                this.lastActivityTime = now;
                if (this.updateManager) {
                    this.updateManager.idleHandler();
                }
            }
        }, 10000);
    }

    private getLastActivityTime() {
        this.lastActivityTime = this.getTime();
    }

    private checkRetry(id: number, error: RiverError.AsObject) {
        if (!this.messageListeners[id]) {
            return true;
        }

        const req: IServerRequest = this.messageListeners[id].request;
        if (!req) {
            return true;
        }

        if (!req.options || !req.options.retryErrors || (req.options.retry || C_RETRY) <= req.retry) {
            return true;
        }

        const check = req.options.retryErrors.some((err) => {
            return error.code === err.code && error.items === err.items;
        });
        if (!check) {
            return true;
        }

        const msg = this.messageListeners[id];
        const reqId = ++this.reqId;
        const request: IServerRequest = cloneDeep(req);
        request.reqId = reqId;
        request.retry++;
        request.timeout = null;

        if (this.isConnected) {
            setTimeout(() => {
                this.sendRequest(request);
            }, req.options.retryWait || 0);
        }

        /* Add request to the queue manager */
        this.messageListeners[reqId] = {
            reject: msg.reject,
            request,
            resolve: msg.resolve,
            state: 0,
        };

        this.sentQueue.push(reqId);

        return false;
    }

    private genSrpHashResolve = (reqId: number, data: string) => {
        if (!this.serviceMessagesListeners[reqId]) {
            return;
        }
        const req = this.serviceMessagesListeners[reqId];
        if (req && req.resolve) {
            req.resolve(base64ToU8a(data));
        }
    }

    private genInputPasswordResolve = (reqId: number, data: string) => {
        if (!this.serviceMessagesListeners[reqId]) {
            return;
        }
        const req = this.serviceMessagesListeners[reqId];
        if (req && req.resolve) {
            req.resolve(InputPassword.deserializeBinary(base64ToU8a(data)));
        }
    }

    private getSkippableRequestIds() {
        const containList: number[] = [];
        const reqIds: number[] = [];
        forEachRight(this.sentQueue, (reqId) => {
            const req = this.messageListeners[reqId];
            if (req && (req.request.constructor === C_MSG.Ping || req.request.constructor === C_MSG.AuthRecall || req.request.constructor === C_MSG.UpdateGetState)) {
                if (containList.indexOf(req.request.constructor) > -1) {
                    reqIds.push(req.request.reqId);
                } else {
                    containList.push(req.request.constructor);
                }
            }
        });
        return reqIds;
    }

    private dispatchEvent(cmd: string, data: any) {
        const fnStarted = new CustomEvent(cmd, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(fnStarted);
    }
}
