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
    private readonly testUrl: string = '';
    private lastSendTime: number = 0;
    private lastReceiveTime: number = 0;
    private online: boolean = navigator.onLine === undefined ? true : navigator.onLine;
    private resolveEncryptFn: any | undefined;
    private resolveDecryptFn: any | undefined;

    public constructor() {
        this.testUrl = localStorage.getItem('river.workspace_url') || '';

        this.worker = new Worker('/bin/worker.js?v18');

        setTimeout(() => {
            this.workerMessage('init', {});
        }, 100);

        window.addEventListener('online', () => {
            this.online = true;
            this.dispatchEvent('networkStatus', {online: true});
            this.initTimeout = setTimeout(() => {
                this.initWebSocket();
            }, 10);
        });

        window.addEventListener('offline', () => {
            this.online = false;
            this.dispatchEvent('networkStatus', {online: false});
            this.closeWire();
        });

        setTimeout(() => {
            if (!navigator.onLine) {
                this.online = false;
                this.dispatchEvent('networkStatus', {online: false});
                this.closeWire();
            }
        }, 3000);

        // @ts-ignore
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            connection.addEventListener('change', () => {
                window.console.log('connection changed!');
                if (this.online) {
                    this.closeWire();
                }
            });
        }

        this.worker.onmessage = (e) => {
            const d = e.data;
            switch (d.cmd) {
                case 'saveConnInfo':
                    localStorage.setItem('river.conn.info', d.data);
                    break;
                case 'loadConnInfo':
                    this.workerMessage('loadConnInfo', {connInfo: localStorage.getItem('river.conn.info'), serverKeys});
                    this.initWebSocket();
                    this.workerMessage('initSDK', 0);
                    setTimeout(() => {
                        this.dispatchEvent('wasmInit', null);
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
                        if (this.lastReceiveTime >= this.lastSendTime) {
                            this.lastSendTime = Date.now();
                        }
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
                        this.dispatchEvent('wsOpen', null);
                    }
                    this.started = true;
                    this.dispatchEvent('fnStarted', d.data);
                    break;
                case 'fnDecryptError':
                    this.dispatchEvent('fnDecryptError', null);
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

    public sendWorkerMessage(cmd: string, data: any) {
        this.workerMessage(cmd, data);
    }

    public isOnline() {
        return this.online;
    }

    public send(data: IServerRequest) {
        this.workerMessage('fnCall', {
            constructor: data.constructor,
            payload: uint8ToBase64(data.data),
            reqId: data.reqId,
        });
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
        window.console.log('initWebSocket');
        clearTimeout(this.initTimeout);

        this.tryCounter++;

        if (this.testUrl.length > 0) {
            this.socket = new WebSocket(`ws://${this.testUrl}`);
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
            this.lastReceiveTime = Date.now();
            if (this.started) {
                this.dispatchEvent('wsOpen', null);
            }
            this.workerMessage('wsOpen', null);
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
        this.dispatchEvent('wsClose', null);
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

    private dispatchEvent(cmd: string, data: any) {
        const fnStarted = new CustomEvent(cmd, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(fnStarted);
    }

    private checkNetwork() {
        setInterval(() => {
            if (this.lastSendTime > this.lastReceiveTime && this.online) {
                const now = Date.now();
                if (now - this.lastSendTime > 12000) {
                    window.console.log('bad network');
                    this.closeWire();
                }
            }
        }, 12000);
    }
}
