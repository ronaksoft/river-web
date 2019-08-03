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
import {base64ToU8a, uint8ToBase64} from './utils';
import {C_FILE_ERR_CODE, C_FILE_ERR_NAME} from '../const/const';
import {C_MSG} from '../../const';
import ElectronService from '../../../electron';
import {serverKeys} from "../../server";

export interface IHttpRequest {
    constructor: number;
    data: Uint8Array;
    reqId: number;
}

interface IMessageListener {
    cancel: any;
    onDownloadProgress?: (e: any) => void;
    onUploadProgress?: (e: any) => void;
    reject: any;
    request: IHttpRequest;
    resolve: any;
}

export default class Http {
    private worker: Worker;
    private reqId: number;
    private messageListeners: { [key: number]: IMessageListener } = {};
    private sentQueue: number[] = [];
    private dataCenterUrl: string = 'http://file.river.im';
    // @ts-ignore
    private workerId: number = 0;
    private isWorkerReady: boolean = false;
    private readyHandler: any = null;

    public constructor(bytes: any, id: number) {
        const fileUrl = localStorage.getItem('river.workspace_url_file') || '';

        this.reqId = 0;
        this.worker = new Worker('/bin/worker.js?v16');
        this.workerId = id;

        if (fileUrl && fileUrl.length > 0 && (ElectronService.isElectron() || window.location.host.indexOf('localhost') === 0)) {
            this.dataCenterUrl = 'http://' + fileUrl;
        } else if (window.location.protocol === 'https:' && !ElectronService.isElectron()) {
            this.dataCenterUrl = 'https://' + window.location.host + '/file';
        } else if (window.location.protocol === 'http:') {
            this.dataCenterUrl = 'http://' + fileUrl;
        }

        this.workerMessage('init', {});
        this.initWorkerEvent();
    }

    public setUrl(url: string) {
        if (url && url.length > 0 && (ElectronService.isElectron() || window.location.host.indexOf('localhost') === 0)) {
            this.dataCenterUrl = 'http://' + url;
        }
    }

    /* Worker is ready handler */
    public ready(fn: any) {
        this.readyHandler = fn;
    }

    /* Return isWorkerReady */
    public isReady() {
        return this.isWorkerReady;
    }

    /* Send WS Message */
    public send(constructor: number, data: Uint8Array, cancel: (fnCancel: any) => void, onUploadProgress?: (e: any) => void, onDownloadProgress?: (e: any) => void) {
        let internalResolve = null;
        let internalReject = null;

        const reqId = ++this.reqId;
        const request: IHttpRequest = {
            constructor,
            data,
            reqId,
        };

        const promise = new Promise<any>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
            this.sendRequest(request);
        });

        /**
         * Add request to the queue manager
         */
        this.messageListeners[reqId] = {
            cancel: null,
            onDownloadProgress,
            onUploadProgress,
            reject: internalReject,
            request,
            resolve: internalResolve,
        };

        cancel(() => {
            this.cancelRequest(reqId);
        });

        this.sentQueue.push(reqId);

        return promise;
    }

    private cancelRequest(id: number) {
        if (!this.messageListeners.hasOwnProperty(id)) {
            return;
        }
        this.messageListeners[id].reject({
            code: C_FILE_ERR_CODE.REQUEST_CANCELLED,
            message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.REQUEST_CANCELLED],
        });
        if (this.messageListeners[id].cancel) {
            this.messageListeners[id].cancel();
        }
        delete this.messageListeners[id];
    }

    private initWorkerEvent() {
        this.worker.onmessage = (e) => {
            const d = e.data;
            switch (d.cmd) {
                case 'loadConnInfo':
                    this.workerMessage('loadConnInfo', {connInfo: localStorage.getItem('river.conn.info'), serverKeys});
                    this.workerMessage('initSDK', 1);
                    break;
                case 'fnStarted':
                    if (this.readyHandler) {
                        this.readyHandler();
                    }
                    this.isWorkerReady = true;
                    break;
                case 'fnEncryptCallback':
                    this.resolveEncrypt(d.data.reqId, d.data.data);
                    break;
                case 'fnDecryptCallback':
                    this.resolveDecrypt(d.data.reqId, d.data.constructor, d.data.data);
                    break;
                default:
                    break;
            }
        };
    }

    /* Send http request */
    private sendRequest(request: IHttpRequest) {
        this.workerMessage('fnEncrypt', {
            constructor: request.constructor,
            payload: uint8ToBase64(request.data),
            reqId: request.reqId,
        });
    }

    private resolveEncrypt(reqId: number, base64: string) {
        if (!this.messageListeners.hasOwnProperty(reqId)) {
            return;
        }
        const message = this.messageListeners[reqId];
        const cancelToken = new axios.CancelToken((c) => {
            this.messageListeners[reqId].cancel = c;
        });
        axios.post(this.dataCenterUrl, base64ToU8a(base64), {
            cancelToken,
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
                this.workerMessage('fnDecrypt', uint8ToBase64(data));
            }
        }).catch((err) => {
            if (this.messageListeners.hasOwnProperty(reqId)) {
                if (!axios.isCancel(err)) {
                    this.messageListeners[reqId].reject(err);
                }
            }
        });
    }

    private resolveDecrypt(reqId: number, constructor: number, base64: string) {
        if (!this.messageListeners.hasOwnProperty(reqId)) {
            return;
        }
        const res = Presenter.getMessage(constructor, base64ToU8a(base64));
        if (constructor === C_MSG.Error) {
            this.messageListeners[reqId].reject(res.toObject());
        } else {
            this.messageListeners[reqId].resolve(res);
        }
        delete this.messageListeners[reqId];
        const index = this.sentQueue.indexOf(reqId);
        if (index > -1) {
            this.sentQueue.splice(index);
        }
    }

    /* Post message to worker */
    private workerMessage = (cmd: string, data: any) => {
        this.worker.postMessage({
            cmd,
            data,
        });
    }
}
