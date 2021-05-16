/*
    Creation Time: 2019 - Jan - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

/* eslint import/no-webpack-loader-syntax: off */
import {base64ToU8a, uint8ToBase64} from '../../fileManager/http/utils';
import {IServerRequest, serverKeys} from '../index';
import ElectronService from '../../../electron';
import {
    EventNetworkStatus,
    EventWasmInit,
    EventWebSocketClose,
    EventSocketReady, EventSocketConnected, EventAuthProgress, EventOnline, EventOffline, EventChange
} from "../../../events";
import {C_LOCALSTORAGE, C_MSG} from "../../const";
import {getWsServerUrl} from "../../../../components/DevTools";

//@ts-ignore
import RiverWorker from 'worker-loader?filename=river.js!../../worker';
import {RiverConnection} from "../../messages/conn_pb";

export const defaultGateway = 'edge.river.im';

export const ping = new Uint8Array([0x50, 0x49, 0x4e, 0x47]);

export const checkPong = (data: any) => {
    if (data.byteLength === 4) {
        // @ts-ignore
        if (String.fromCharCode.apply(null, new Uint8Array(data)) === 'PONG') {
            return true;
        }
    }
    return false;
};

export let serverTime: number = 0;

export interface ISendPayload {
    constructor: number;
    payload: string;
    reqId: number;
    teamId?: string;
    teamAccessHash?: string;
    withSend: boolean;
}

const C_JS_MSG = {
    Auth: 'auth',
    AuthProgress: 'authProgress',
    CreateAuthKey: 'createAuthKey',
    Decode: 'decode',
    Encode: 'encode',
    GenInputPassword: 'genInputPassword',
    GenSrpHash: 'genSrpHash',
    GetServerTime: 'getServerTime',
    Save: 'save',
    Update: 'update',
    WASMLoaded: 'wasmLoaded',
};

const C_WASM_MSG = {
    Auth: 'auth',
    Decode: 'decode',
    Encode: 'encode',
    GenInputPassword: 'genInputPassword',
    GenSrpHash: 'genSrpHash',
    Init: 'init',
    Load: 'load',
    SetServerTime: 'setServerTime',
};

export default class Socket {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new Socket();
        }

        return this.instance;
    }

    private static instance: Socket;

    private worker: Worker;
    private started: boolean = false;
    private socket: WebSocket | undefined;
    private connected: boolean = false;
    // @ts-ignore
    private pingCounter: number = 0;
    private tryCounter: number = 0;
    private initTimeout: any = null;
    private fnCreateAuthKey: any = null;
    private fnGetServerTime: any = null;
    private fnCallback: any = null;
    private fnUpdate: any = null;
    private fnError: any = null;
    private lastSendTime: number = 0;
    private lastReceiveTime: number = 0;
    private online: boolean = navigator.onLine === undefined ? true : navigator.onLine;
    private resolveEncryptFn: any | undefined;
    private resolveDecryptFn: any | undefined;
    private resolveGenSrpHashFn: any | undefined;
    private resolveGenInputPasswordFn: any | undefined;
    private resolveAuthStepFn: any | undefined;
    private checkPingFn: any | undefined;

    public constructor() {
        this.worker = new RiverWorker();

        setTimeout(() => {
            this.workerMessage(C_WASM_MSG.Init, {});
        }, 100);

        window.addEventListener(EventOnline, () => {
            this.online = true;
            this.dispatchEvent(EventNetworkStatus, {online: true});
            this.initTimeout = setTimeout(() => {
                this.initWebSocket();
            }, 10);
        });

        window.addEventListener(EventOffline, () => {
            this.online = false;
            this.dispatchEvent(EventNetworkStatus, {online: false});
            this.closeWire();
        });

        setTimeout(() => {
            if (!navigator.onLine) {
                this.online = false;
                this.dispatchEvent(EventNetworkStatus, {online: false});
                this.closeWire();
            }
        }, 3000);

        // @ts-ignore
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            connection.addEventListener(EventChange, () => {
                window.console.info('connection changed!');
                this.checkPing();
            });
        }

        this.worker.onmessage = (e) => {
            this.messageHandler(e.data.cmd, e.data.data);
        };

        this.checkNetwork();
    }

    public setServerTime(time: number) {
        serverTime = time;
        this.workerMessage(C_WASM_MSG.SetServerTime, time);
    }

    public setResolveEncryptFn(fn: any) {
        this.resolveEncryptFn = fn;
    }

    public setResolveDecryptFn(fn: any) {
        this.resolveDecryptFn = fn;
    }

    public setResolveGenSrpHashFn(fn: any) {
        this.resolveGenSrpHashFn = fn;
    }

    public setResolveGenInputPasswordFn(fn: any) {
        this.resolveGenInputPasswordFn = fn;
    }

    public setResolveAuthStepFn(fn: any) {
        this.resolveAuthStepFn = fn;
    }

    public sendWorkerMessage(cmd: string, data: any) {
        this.workerMessage(cmd, data);
    }

    public isOnline() {
        return this.online;
    }

    public fnGenSrpHash(data: { reqId: number, pass: string, algorithm: number, algorithmData: string }) {
        this.workerMessage(C_WASM_MSG.GenSrpHash, data);
    }

    public fnGenInputPassword(data: { reqId: number, pass: string, accountPass: string }) {
        this.workerMessage(C_WASM_MSG.GenInputPassword, data);
    }

    public authStep(data: { step: number, reqId: number, data?: Uint8Array }) {
        this.workerMessage(C_WASM_MSG.Auth, {
            data: data.data ? uint8ToBase64(data.data) : '',
            reqId: data.reqId,
            step: data.step,
        });
    }

    public send(data: IServerRequest) {
        const payload: ISendPayload = {
            constructor: data.constructor,
            payload: uint8ToBase64(data.data),
            reqId: data.reqId,
            withSend: true,
        };
        if (data.inputTeam) {
            payload.teamId = data.inputTeam.id;
            payload.teamAccessHash = data.inputTeam.accesshash;
        }
        this.workerMessage(C_WASM_MSG.Encode, payload);
    }

    public setCreateAuthKey(fn: any) {
        this.fnCreateAuthKey = fn;
    }

    public setGetServerTime(fn: any) {
        this.fnGetServerTime = fn;
    }

    public setCallback(fn: any) {
        this.fnCallback = fn;
    }

    public setUpdate(fn: any) {
        this.fnUpdate = fn;
    }

    public setError(fn: any) {
        this.fnError = fn;
    }

    public start() {
        this.initTimeout = setTimeout(() => {
            this.initWebSocket();
        }, 10);
    }

    public stop() {
        this.closeWire();
    }

    public isStarted() {
        return this.started;
    }

    public setCheckPingFn(fn: any) {
        this.checkPingFn = fn;
    }

    public restartNetwork() {
        this.tryCounter = 0;
        this.closeWire(true);
    }

    public checkPing() {
        if (this.checkPingFn) {
            this.checkPingFn();
        }
    }

    private convertConnInfoProtoToJson(str: string) {
        const data = base64ToU8a(str);
        const connInfo = RiverConnection.deserializeBinary(data).toObject();
        return JSON.stringify(connInfo);
    }

    private messageHandler(cmd: string, data: any) {
        switch (cmd) {
            case C_JS_MSG.WASMLoaded:
                this.wasmLoaded();
                break;
            case C_JS_MSG.Save:
                localStorage.setItem(C_LOCALSTORAGE.ConnInfo, this.convertConnInfoProtoToJson(data));
                break;
            case C_JS_MSG.CreateAuthKey:
                if (this.fnCreateAuthKey) {
                    window.console.log('fnCreateAuthKey');
                    this.fnCreateAuthKey().then((duration: number) => {
                        if (!this.started && this.connected) {
                            this.started = true;
                            this.dispatchEvent(EventSocketReady, {duration});
                        }
                    });
                }
                break;
            case C_JS_MSG.GetServerTime:
                this.getServerTime();
                break;
            case C_JS_MSG.Decode:
                this.decode(data);
                break;
            case C_JS_MSG.Update:
                if (this.fnUpdate) {
                    this.fnUpdate(data);
                }
                break;
            case C_JS_MSG.Encode:
                this.encode(data);
                break;
            case C_JS_MSG.AuthProgress:
                this.dispatchEvent(EventAuthProgress, data);
                break;
            case C_JS_MSG.GenSrpHash:
                if (this.resolveGenSrpHashFn) {
                    this.resolveGenSrpHashFn(data.reqId, data.msg);
                }
                break;
            case C_JS_MSG.GenInputPassword:
                if (this.resolveGenInputPasswordFn) {
                    this.resolveGenInputPasswordFn(data.reqId, data.msg);
                }
                break;
            case C_JS_MSG.Auth:
                if (this.resolveAuthStepFn) {
                    this.resolveAuthStepFn(data.reqId, data.step, data.data);
                }
                break;
        }
    }

    private initWebSocket() {
        if (this.socket) {
            try {
                this.socket.close();
            } catch (e) {
                //
            }
        }
        clearTimeout(this.initTimeout);

        this.tryCounter++;

        const wsUrl = getWsServerUrl();
        if (wsUrl && wsUrl.length > 0) {
            this.socket = new WebSocket(`ws://${wsUrl}`);
        } else if (window.location.protocol === 'https:' && !ElectronService.isElectron()) {
            this.socket = new WebSocket('wss://' + window.location.host + '/ws');
        } else {
            this.socket = new WebSocket(`ws://${defaultGateway}`);
        }
        this.socket.binaryType = 'arraybuffer';

        // Connection opened
        this.socket.onopen = () => {
            window.console.log('WebSocket opened', new Date());
            if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
                return;
            }
            // this.socket.send(ping);
            this.pingCounter = 0;
            this.tryCounter = 0;
            this.connected = true;
            this.lastSendTime = Date.now();
            this.lastReceiveTime = Date.now() + 1;
            this.dispatchEvent(EventSocketConnected, null);
            if (this.started) {
                this.dispatchEvent(EventSocketReady, {duration: 0});
            } else {
                this.getServerTime();
            }
        };

        // Listen for messages
        this.socket.onmessage = (event) => {
            this.lastReceiveTime = Date.now();
            if (checkPong(event.data)) {
                this.pingCounter = 0;
            } else {
                this.workerMessage(C_WASM_MSG.Decode, {
                    data: uint8ToBase64(new Uint8Array(event.data)),
                    withParse: true
                });
            }
        };

        // Listen for messages
        this.socket.onclose = () => {
            this.closeWire();
        };
    }

    private closeWire(force?: boolean) {
        this.connected = false;
        if (this.socket) {
            this.socket.onclose = null;
            this.socket.onmessage = null;
        }
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
                this.socket.close();
            } catch (e) {
                window.console.log(e);
            }
        }
        this.dispatchEvent(EventWebSocketClose, null);
        if (!this.online && !force) {
            return;
        }
        clearTimeout(this.initTimeout);
        if (force) {
            this.initWebSocket();
        } else {
            if (this.tryCounter === 0) {
                this.initTimeout = setTimeout(() => {
                    this.initWebSocket();
                }, 1000);
            } else {
                this.initTimeout = setTimeout(() => {
                    this.initWebSocket();
                }, 5000 + Math.floor(Math.random() * 3000));
            }
        }
    }

    private workerMessage(cmd: string, data: any) {
        this.worker.postMessage({
            cmd,
            data,
        });
    }

    private checkNetwork() {
        setInterval(() => {
            if (this.lastSendTime > this.lastReceiveTime && this.online) {
                const now = Date.now();
                if (now - this.lastSendTime > 12000) {
                    this.checkPing();
                }
            }
        }, 12000);
    }

    private convertConnInfoJsonToProto(str: string) {
        if (!str || str === '') {
            return '';
        }
        const data: RiverConnection.AsObject = JSON.parse(str);
        const riverConn = new RiverConnection();
        riverConn.setAuthid(data.authid);
        riverConn.setAuthkey(data.authkey);
        riverConn.setUserid(data.userid);
        riverConn.setUsername(data.username);
        riverConn.setPhone(data.phone);
        riverConn.setFirstname(data.firstname);
        riverConn.setLastname(data.lastname);
        riverConn.setDifftime(data.difftime);
        return uint8ToBase64(riverConn.serializeBinary());
    }

    private wasmLoaded() {
        this.workerMessage(C_WASM_MSG.Load, {
            connInfo: this.convertConnInfoJsonToProto(localStorage.getItem(C_LOCALSTORAGE.ConnInfo)),
            serverKeys
        });
        this.initWebSocket();
        setTimeout(() => {
            this.dispatchEvent(EventWasmInit, null);
        }, 50);
    }

    private encode(data: any) {
        if (data.withSend) {
            if (this.socket && this.connected && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(base64ToU8a(data.msg));
                this.lastSendTime = Date.now();
            }
        } else if (this.resolveEncryptFn) {
            this.resolveEncryptFn(data.reqId, data.msg);
        }
    }

    private decode(data: any) {
        if (data.withParse) {
            if (data.reqId === 0 && data.constructor === C_MSG.Error) {
                if (this.fnError) {
                    this.fnError({
                        constructor: data.constructor,
                        data: data.msg,
                        reqId: data.reqId,
                    });
                }
            } else if (this.fnCallback) {
                this.fnCallback({
                    constructor: data.constructor,
                    data: data.msg,
                    reqId: data.reqId,
                });
            }
        } else {
            if (this.resolveDecryptFn) {
                this.resolveDecryptFn(data.reqId, data.constructor, data.msg);
            }
        }
    }

    private getServerTime() {
        if (this.fnGetServerTime) {
            this.fnGetServerTime().then(() => {
                if (!this.started && this.connected) {
                    this.started = true;
                    this.dispatchEvent(EventSocketReady, {duration: 0});
                }
            });
        }
    }

    private dispatchEvent(cmd: string, data: any) {
        const fnStarted = new CustomEvent(cmd, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(fnStarted);
    }
}
