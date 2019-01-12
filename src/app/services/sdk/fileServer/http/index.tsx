/*
    Creation Time: 2019 - Jan - 09
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import Presenter from '../../presenters';
import axios from 'axios';

export interface IHttpRequest {
    constructor: number;
    data: Uint8Array;
    reqId: number;
}

export default class Http {
    private worker: Worker;
    private reqId: number;
    private messageListeners: object = {};
    private sentQueue: number[] = [];
    private dataCenterUrl: string = 'file.river.im';
    private workerId: number = 0;

    public constructor(bytes: ArrayBuffer, id: number) {
        this.reqId = 0;
        this.worker = new Worker('/bin/worker.js');
        this.workerId = id;

        this.workerMessage('init', bytes);
        this.initWorkerEvent();
    }

    public send(constructor: number, data: Uint8Array, onUploadProgress?: (e: any) => void, onDownloadProgress?: (e: any) => void) {
        let internalResolve = null;
        let internalReject = null;

        const reqId = ++this.reqId;
        const request: IHttpRequest = {
            constructor,
            data,
            reqId,
        };

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
            this.sendRequest(request);
        });

        /**
         * Add request to the queue manager
         */
        this.messageListeners[reqId] = {
            onDownloadProgress,
            onUploadProgress,
            reject: internalReject,
            request,
            resolve: internalResolve,
        };

        this.sentQueue.push(reqId);

        return promise;
    }

    private initWorkerEvent() {
        this.worker.onmessage = (e) => {
            const d = e.data;
            switch (d.cmd) {
                case 'loadConnInfo':
                    this.workerMessage('loadConnInfo', localStorage.getItem('river.conn.info'));
                    this.workerMessage('initSDK', {});
                    break;
                case 'fnEncryptCallback':
                    this.resolveEncrypt(d.data.reqId, d.data.data);
                    window.console.timeEnd(`${this.workerId} fnEncrypt`);
                    break;
                case 'fnDecryptCallback':
                    this.resolveDecrypt(d.data.reqId, d.data.constructor, d.data.data);
                    window.console.timeEnd(`${this.workerId} fnDecrypt`);
                    break;
                default:
                    break;
            }
        };
    }

    /* Send http request */
    private sendRequest(request: IHttpRequest) {
        window.console.time(`${this.workerId} fnEncrypt`);
        this.workerMessage('fnEncrypt', {
            constructor: request.constructor,
            payload: this.uint8ToBase64(request.data),
            reqId: request.reqId,
        });
    }

    private resolveEncrypt(reqId: number, base64: string) {
        if (!this.messageListeners.hasOwnProperty(reqId)) {
            return;
        }
        const message = this.messageListeners[reqId];
        // @ts-ignore
        const u8a = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        axios.post(`http://${this.dataCenterUrl}`, u8a, {
            headers: {
                'Accept': 'application/protobuf',
                'Content-Type': 'application/protobuf',
            },
            onDownloadProgress: message.onDownloadProgress,
            onUploadProgress: message.onUploadProgress,
            responseType: 'arraybuffer',
        }).then((response) => {
            return response.data;
        }).then((bytes) => {
            if (this.messageListeners.hasOwnProperty(reqId)) {
                const data = new Uint8Array(bytes);
                window.console.time('fnDecrypt');
                this.workerMessage('fnDecrypt', this.uint8ToBase64(data));
            }
        });
    }

    private resolveDecrypt(reqId: number, constructor: number, base64: string) {
        // @ts-ignore
        const u8a = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const res = Presenter.getMessage(constructor, u8a);
        this.messageListeners[reqId].resolve(res.toObject());
    }

    /* Post message to worker */
    private workerMessage = (cmd: string, data: any) => {
        this.worker.postMessage({
            cmd,
            data,
        });
    }

    /* Convert Uint8array to base64 */
    private uint8ToBase64(u8a: Uint8Array) {
        const CHUNK_SZ = 0x8000;
        const c = [];
        for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
            c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
        }
        return btoa(c.join(''));
    }
}
