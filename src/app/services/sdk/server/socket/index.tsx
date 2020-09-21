/*
    Creation Time: 2019 - Jan - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {base64ToU8a, uint8ToBase64} from '../../fileManager/http/utils';
import {IServerRequest, serverKeys} from '../index';
import ElectronService from '../../../electron';
import {
    EventCheckNetwork,
    EventNetworkStatus,
    EventWasmInit, EventWasmStarted,
    EventWebSocketClose,
    EventWebSocketOpen
} from "../../../events";
import {C_LOCALSTORAGE} from "../../const";
import {getWsServerUrl} from "../../../../components/DevTools";

export const defaultGateway = 'cyrus.river.im';

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

    public constructor() {
        this.worker = new Worker('/bin/worker.js?v23');

        setTimeout(() => {
            this.workerMessage('init', {});
        }, 100);

        window.addEventListener('online', () => {
            this.online = true;
            this.dispatchEvent(EventNetworkStatus, {online: true});
            this.initTimeout = setTimeout(() => {
                this.initWebSocket();
            }, 10);
        });

        window.addEventListener('offline', () => {
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
            connection.addEventListener('change', () => {
                window.console.log('connection changed!');
                this.dispatchEvent(EventCheckNetwork, {});
            });
        }

        this.worker.onmessage = (e) => {
            const d = e.data;
            switch (d.cmd) {
                case 'saveConnInfo':
                    localStorage.setItem(C_LOCALSTORAGE.ConnInfo, d.data);
                    break;
                case 'loadConnInfo':
                    this.workerMessage('loadConnInfo', {
                        connInfo: localStorage.getItem(C_LOCALSTORAGE.ConnInfo),
                        serverKeys
                    });
                    this.initWebSocket();
                    this.workerMessage('initSDK', 0);
                    setTimeout(() => {
                        this.dispatchEvent(EventWasmInit, null);
                    }, 50);
                    break;
                case 'fnCallback':
                    if (this.fnCallback) {
                        this.fnCallback({
                            constructor: d.data.constructor,
                            data: d.data.data,
                            reqId: d.data.reqId,
                        });
                    }
                    break;
                case 'fnUpdate':
                    if (this.fnUpdate) {
                        this.fnUpdate(d.data);
                    }
                    break;
                case 'wsSend':
                    if (this.socket && this.connected && this.socket.readyState === WebSocket.OPEN) {
                        this.socket.send(base64ToU8a(d.data));
                        this.lastSendTime = Date.now();
                    }
                    break;
                case 'wsError':
                    if (this.fnError) {
                        this.fnError({
                            constructor: d.data.constructor,
                            data: d.data.data,
                            reqId: d.data.reqId,
                        });
                    }
                    break;
                case 'authProgress':
                    this.dispatchEvent('authProgress', d.data);
                    break;
                case 'fnStarted':
                    serverTime = d.data.time;
                    if (!this.started && this.connected) {
                        this.dispatchEvent(EventWebSocketOpen, null);
                    }
                    this.started = true;
                    this.dispatchEvent(EventWasmStarted, d.data);
                    break;
                case 'fnDecryptError':
                    // this.dispatchEvent('fnDecryptError', null);
                    break;
                case 'fnEncryptCallback':
                    if (this.resolveEncryptFn) {
                        this.resolveEncryptFn(d.data.reqId, d.data.data);
                    }
                    break;
                case 'fnDecryptCallback':
                    if (this.resolveDecryptFn) {
                        this.resolveDecryptFn(d.data.reqId, d.data.constructor, d.data.data);
                    }
                    break;
                case 'fnGenSrpHashCallback':
                    if (this.resolveGenSrpHashFn) {
                        this.resolveGenSrpHashFn(d.data.reqId, d.data.data);
                    }
                    break;
                case 'fnGenInputPasswordCallback':
                    if (this.resolveGenInputPasswordFn) {
                        this.resolveGenInputPasswordFn(d.data.reqId, d.data.data);
                    }
                    break;
            }
        };

        this.checkNetwork();
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

    public sendWorkerMessage(cmd: string, data: any) {
        this.workerMessage(cmd, data);
    }

    public isOnline() {
        return this.online;
    }

    public fnGenSrpHash(data: { reqId: number, pass: string, algorithm: number, algorithmData: string }) {
        this.workerMessage('fnGenSrpHash', data);
    }

    public fnGenInputPassword(data: { reqId: number, pass: string, accountPass: string }) {
        this.workerMessage('fnGenInputPassword', data);
    }

    public send(data: IServerRequest) {
        const payload: any = {
            constructor: data.constructor,
            payload: uint8ToBase64(data.data),
            reqId: data.reqId,
        };
        if (data.inputTeam) {
            payload.teamId = data.inputTeam.id;
            payload.teamAccessHash = data.inputTeam.accesshash;
        }
        this.workerMessage('fnCall', payload);
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

    public tryAgain() {
        this.tryCounter = 0;
        this.closeWire(true);
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
            if (this.started) {
                this.dispatchEvent(EventWebSocketOpen, null);
            }
            this.workerMessage(EventWebSocketOpen, null);
        };

        // Listen for messages
        this.socket.onmessage = (event) => {
            this.lastReceiveTime = Date.now();
            if (checkPong(event.data)) {
                this.pingCounter = 0;
            } else {
                this.workerMessage('receive', uint8ToBase64(new Uint8Array(event.data)));
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
                    this.dispatchEvent(EventCheckNetwork, {});
                }
            }
        }, 12000);
    }

    private dispatchEvent(cmd: string, data: any) {
        const fnStarted = new CustomEvent(cmd, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(fnStarted);
    }
}
