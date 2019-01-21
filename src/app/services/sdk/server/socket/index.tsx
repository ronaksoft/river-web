/*
    Creation Time: 2019 - Jan - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {base64ToU8a, uint8ToBase64} from '../../fileServer/http/utils';
import {IServerRequest} from '../index';

const ping = new Uint8Array([0x50, 0x49, 0x4e, 0x47]);

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
    private socket: WebSocket;
    private connected: boolean = false;
    // @ts-ignore
    private pingCounter: number = 0;
    private tryCounter: number = 0;
    private initTimeout: any = null;
    private fnCallback: any = null;
    private fnUpdate: any = null;
    private fnError: any = null;
    private testUrl: string = '';

    public constructor() {
        this.testUrl = localStorage.getItem('river.test_url') || '';

        this.worker = new Worker('/bin/worker.js?v11');

        fetch('/bin/river.wasm?v11').then((response) => {
            return response.arrayBuffer();
        }).then((bytes) => {
            this.workerMessage('init', bytes);
        });

        window.addEventListener('online', () => {
            this.initWebSocket();
        });

        window.addEventListener('offline', () => {
            this.closeWire();
        });

        this.worker.onmessage = (e) => {
            const d = e.data;
            switch (d.cmd) {
                case 'saveConnInfo':
                    localStorage.setItem('river.conn.info', d.data);
                    break;
                case 'loadConnInfo':
                    this.workerMessage('loadConnInfo', localStorage.getItem('river.conn.info'));
                    this.initWebSocket();
                    this.workerMessage('initSDK', {});
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
                    if (this.connected) {
                        this.socket.send(base64ToU8a(d.data));
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
                    if (!this.started && this.connected) {
                        this.dispatchEvent('wsOpen', null);
                    }
                    this.started = true;
                    this.dispatchEvent('fnStarted', d.data);
                    break;
                case 'fnDecryptError':
                    this.dispatchEvent('fnDecryptError', null);
                    break;
            }
        };
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

    private initWebSocket() {
        clearTimeout(this.initTimeout);

        this.tryCounter++;
        if (this.testUrl.length > 0) {
            this.socket = new WebSocket(`ws://${this.testUrl}`);
        } else if (window.location.protocol === 'https:') {
            this.socket = new WebSocket('wss://' + window.location.host + '/ws');
        } else {
            this.socket = new WebSocket('ws://new.river.im');
        }
        this.socket.binaryType = 'arraybuffer';

        // Connection opened
        this.socket.onopen = () => {
            window.console.log('Hello Server!', new Date());
            if (!this.socket.OPEN) {
                return;
            }
            this.socket.send(ping);
            this.pingCounter = 0;
            this.tryCounter = 0;
            this.connected = true;
            if (this.started) {
                const event = new CustomEvent('wsOpen');
                window.dispatchEvent(event);
            }
            this.workerMessage('wsOpen', null);
        };

        // Listen for messages
        this.socket.onmessage = (event) => {
            if (this.checkPong(event.data)) {
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

    private closeWire() {
        this.connected = false;
        const event = new CustomEvent('wsClose');
        window.dispatchEvent(event);
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

    private checkPong(data: any) {
        if (data.byteLength === 4) {
            if (String.fromCharCode.apply(null, new Uint8Array(data)) === 'PONG') {
                return true;
            }
        }
        return false;
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
}
