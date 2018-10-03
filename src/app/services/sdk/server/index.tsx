import {C_MSG} from '../const';
import Presenter from '../presenters';
import UpdateManager from './updateManager';

export default class Server {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new Server();
        }

        return this.instance;
    }

    private static instance: Server;

    /**
     * @name Server#reqId
     * @private
     * @type {number}
     * @memberof Server
     */
    private reqId: number;

    /**
     * @name Server#messageListeners
     * @private
     * @type {object}
     * @memberof Server
     */
    private messageListeners: object = {};

    private sentQueue: number[] = [];

    private updateQueue: any[] = [];

    private updateManager: UpdateManager;

    private isConnected: boolean = false;

    public constructor() {
        this.reqId = 0;
        window.addEventListener('fnCallbackEvent', (event: any) => {
            this.response(event.detail);
        });
        window.addEventListener('fnUpdate', (event: any) => {
            this.update(event.detail);
        });
        window.addEventListener('fnErrorEvent', (event: any) => {
            this.error(event.detail);
        });
        window.addEventListener('wsOpen', () => {
            this.isConnected = true;
            this.flushSentQueue();
        });
        window.addEventListener('wsClose', () => {
            this.isConnected = false;
        });

        this.updateThrottler();
        this.updateManager = new UpdateManager();
    }

    /**
     * Send a request to wasm worker over CustomEvent in window object
     */
    public send(constructor: number, data: Uint8Array): Promise<any> {
        let internalResolve = null;
        let internalReject = null;

        this.reqId++;
        const request: any = {
            constructor,
            data,
            reqId: this.reqId,
            timeout: null,
        };

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
            if (this.isConnected) {
                this.sendRequest(request);
            }
        });

        /**
         * Add request to the queue manager
         */
        this.messageListeners[this.reqId] = {
            reject: internalReject,
            request,
            resolve: internalResolve,
            state: 0,
        };

        this.sentQueue.push(this.reqId);

        return promise;
    }

    /**
     * generates string from request and send to the api
     * @private
     * @param {*} request
     * @memberof Server
     */
    private sendRequest(request: any) {
        const fnCallbackEvent = new CustomEvent('fnCallEvent', {
            bubbles: true,
            detail: request,
        });
        window.console.warn(request.constructor, request.reqId);
        request.timeout = setTimeout(() => {
            this.dispatchTimeout(request.reqId);
        }, 30000);
        window.dispatchEvent(fnCallbackEvent);
    }

    private response({reqId, constructor, data}: any) {
        window.console.warn(constructor, reqId);
        if (!this.messageListeners[reqId]) {
            return;
        }
        // @ts-ignore
        const arr = Uint8Array.from(atob(data), c => c.charCodeAt(0));
        const res = Presenter.getMessage(constructor, arr);
        if (res) {
            if (constructor === C_MSG.Error) {
                if (this.messageListeners[reqId].reject) {
                    this.messageListeners[reqId].reject(res.toObject());
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
        // @ts-ignore
        const arr = Uint8Array.from(atob(data), c => c.charCodeAt(0));
        const res = Presenter.getMessage(constructor, arr);
        if (res) {
            if (constructor === C_MSG.Error) {
                const resp = res.toObject();
                if (resp.items === "AUTH") {
                    window.console.log(reqId, resp);
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
        if (!this.messageListeners[reqId]) {
            return;
        }
        const item = this.messageListeners[reqId];
        item.reject({
            err: 'timeout',
        });
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
}
