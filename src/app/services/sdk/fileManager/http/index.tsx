/*
    Creation Time: 2019 - Jan - 09
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

/* eslint import/no-webpack-loader-syntax: off */
import Presenter from '../../presenters';
import axios from 'axios';
import {base64ToU8a, uint8ToBase64} from './utils';
import {C_FILE_ERR_CODE, C_FILE_ERR_NAME} from '../const/const';
import {C_LOCALSTORAGE, C_MSG, C_MSG_NAME} from '../../const';
import ElectronService from '../../../electron';
import {serverKeys} from "../../server";
import Socket, {ISendPayload, serverTime} from '../../server/socket';
import {EventSocketReady} from "../../../events";
import {InputTeam} from "../../messages/core.types_pb";
import {getFileServerUrl} from "../../../../components/DevTools";
//@ts-ignore
import RiverWorker from 'worker-loader?filename=river.js!../../worker';

export interface IHttpRequest {
    constructor: number;
    data: Uint8Array;
    reqId: number;
}

export interface IHttpResponse {
    constructor: number;
    data: any;
}

interface IMessageListener {
    cancel: any;
    onDownloadProgress?: (e: any) => void;
    onUploadProgress?: (e: any) => void;
    reject: any;
    request: IHttpRequest;
    resolve: any;
}

const C_TIMEOUT = 60000;
const C_TIMEOUT_SAMPLE = 10;
const C_TIMEOUT_MIN = 5000;

export default class Http {
    private worker: Worker;
    private reqId: number;
    private messageListeners: { [key: number]: IMessageListener } = {};
    private sentQueue: number[] = [];
    private dataCenterUrl: string = 'http://edge.river.im';
    // @ts-ignore
    private workerId: number = 0;
    private isWorkerReady: boolean = false;
    private readyHandler: any = null;
    private readonly shareWorker: any = null;
    private socket: Socket | undefined;
    private executionTimes: number[] = [];
    private inputTeam: InputTeam.AsObject | undefined;

    public constructor(shareWorker: boolean, id: number) {
        const fileUrl = getFileServerUrl();
        this.shareWorker = shareWorker;

        this.reqId = 0;
        this.worker = new RiverWorker();
        this.workerId = id;

        if (fileUrl && fileUrl.length > 0 && (ElectronService.isElectron() || window.location.host.indexOf('localhost') === 0 || fileUrl.indexOf('localhost') > -1)) {
            this.dataCenterUrl = 'http://' + fileUrl;
        } else if (window.location.protocol === 'https:' && !ElectronService.isElectron()) {
            this.dataCenterUrl = 'https://' + window.location.host + '/file';
        } else if (window.location.protocol === 'http:') {
            this.dataCenterUrl = 'http://' + fileUrl;
        }

        const fn = () => {
            if (shareWorker) {
                this.initShareWorker();
            } else {
                window.removeEventListener(EventSocketReady, fn);
                this.workerMessage('init', {});
                this.initWorkerEvent();
            }
        };

        if (serverTime === 0) {
            window.addEventListener(EventSocketReady, fn);
        } else {
            fn();
        }

        this.initTimeout();

        // @ts-ignore
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            connection.addEventListener('change', () => {
                this.initTimeout();
            });
        }
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

    /* Send HTTP Message */
    public send(constructor: number, data: Uint8Array, cancel?: (fnCancel: any) => void, onUploadProgress?: (e: any) => void, onDownloadProgress?: (e: any) => void): Promise<IHttpResponse> {
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

        if (cancel) {
            cancel(() => {
                this.cancelRequest(reqId);
            });
        }

        this.sentQueue.push(reqId);

        return promise;
    }

    public setTeam(inputTeam: InputTeam.AsObject | undefined) {
        this.inputTeam = inputTeam;
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
                case 'wasmLoaded':
                    this.workerMessage('load', {
                        connInfo: localStorage.getItem(C_LOCALSTORAGE.ConnInfo),
                        serverKeys
                    });
                    if (serverTime) {
                        this.workerMessage('setServerTime', serverTime);
                    }
                    break;
                case 'ready':
                    if (this.readyHandler) {
                        this.readyHandler();
                    }
                    this.isWorkerReady = true;
                    break;
                case 'encode':
                    this.resolveEncrypt(d.data.reqId, d.data.msg);
                    break;
                case 'decode':
                    this.resolveDecrypt(d.data.reqId, d.data.constructor, d.data.msg);
                    break;
                default:
                    break;
            }
        };
    }

    private initShareWorker() {
        this.socket = Socket.getInstance();
        this.socket.setResolveEncryptFn(this.resolveEncrypt);
        this.socket.setResolveDecryptFn(this.resolveDecrypt);
        if (this.readyHandler) {
            this.readyHandler();
        }
        this.isWorkerReady = true;
    }

    /* Send http request */
    private sendRequest(request: IHttpRequest) {
        const payload: ISendPayload = {
            constructor: request.constructor,
            payload: uint8ToBase64(request.data),
            reqId: request.reqId,
            withSend: false,
        };
        if (this.inputTeam) {
            payload.teamId = this.inputTeam.id;
            payload.teamAccessHash = this.inputTeam.accesshash;
        }
        this.workerMessage('encode', payload);
    }

    private resolveEncrypt = (reqId: number, base64: string) => {
        if (!this.messageListeners.hasOwnProperty(reqId)) {
            return;
        }
        const message = this.messageListeners[reqId];
        const cancelToken = new axios.CancelToken((c) => {
            this.messageListeners[reqId].cancel = c;
        });
        const time = Date.now();
        axios.post(this.dataCenterUrl, base64ToU8a(base64), {
            cancelToken,
            headers: {
                'Accept': 'application/protobuf',
                'Content-Type': 'application/protobuf',
            },
            onDownloadProgress: message.onDownloadProgress,
            onUploadProgress: message.onUploadProgress,
            responseType: 'arraybuffer',
            timeout: this.getTimeout(),
        }).then((response) => {
            this.setTimeout(Date.now() - time);
            return response.data;
        }).then((bytes) => {
            if (this.messageListeners.hasOwnProperty(reqId)) {
                const data = new Uint8Array(bytes);
                this.workerMessage('decode', {data: uint8ToBase64(new Uint8Array(data)), reqId, withParse: false});
            }
        }).catch((err) => {
            this.setTimeout(Date.now() - time);
            if (this.messageListeners.hasOwnProperty(reqId)) {
                if (!axios.isCancel(err)) {
                    this.messageListeners[reqId].reject(err);
                }
            }
        });
    }

    private resolveDecrypt = (reqId: number, constructor: number, base64: string) => {
        if (!this.messageListeners.hasOwnProperty(reqId)) {
            return;
        }

        try {
            const res = Presenter.getMessage(constructor, base64ToU8a(base64));
            if (constructor === C_MSG.Error) {
                this.messageListeners[reqId].reject({constructor, data: res.toObject()});
            } else {
                this.messageListeners[reqId].resolve({constructor, data: res});
            }
            delete this.messageListeners[reqId];
            const index = this.sentQueue.indexOf(reqId);
            if (index > -1) {
                this.sentQueue.splice(index);
            }
        } catch (e) {
            window.console.warn(`cannot parse "${C_MSG_NAME[constructor]}"`, e);
        }
    }

    /* Post message to worker */
    private workerMessage = (cmd: string, data: any) => {
        if (this.socket && this.shareWorker) {
            this.socket.sendWorkerMessage(cmd, data);
        } else {
            this.worker.postMessage({
                cmd,
                data,
            });
        }
    }

    private getTimeout() {
        let totalTime = 0;
        this.executionTimes.forEach((time) => {
            totalTime += time;
        });
        return Math.floor((totalTime / this.executionTimes.length) + 1000);
    }

    private setTimeout(time: number) {
        if (time < C_TIMEOUT_MIN) {
            time = C_TIMEOUT_MIN;
        }
        this.executionTimes.push(time);
        if (this.executionTimes.length > C_TIMEOUT_SAMPLE) {
            this.executionTimes.unshift();
        }
    }

    private initTimeout() {
        this.executionTimes = [];
        for (let i = 0; i < C_TIMEOUT_SAMPLE; i++) {
            this.executionTimes.push(C_TIMEOUT);
        }
    }
}
