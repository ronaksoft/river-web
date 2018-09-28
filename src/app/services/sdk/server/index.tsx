import {C_MSG} from '../const';
import Presenter from '../presenters';

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

    public constructor() {
        this.reqId = 0;
        window.addEventListener('fnCallbackEvent', (event: any) => {
            this.response(event.detail);
        });
        window.addEventListener('fnErrorEvent', (event: any) => {
            this.error(event.detail);
        });
        window.addEventListener('wsOpen', () => {
            this.flushSentQueue();
        });
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
        };

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
            this.sendRequest(request);
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
        window.console.log(request.constructor, request.reqId);
        window.dispatchEvent(fnCallbackEvent);
    }

    private response({reqId, constructor, data}: any) {
        window.console.log(constructor, reqId);
        if (!this.messageListeners[reqId]) {
            return;
        }
        const res = Presenter.getMessage(constructor, data);
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
            delete this.messageListeners[reqId];
            const index = this.sentQueue.indexOf(reqId);
            if (index > -1) {
                this.sentQueue.splice(index, 1);
            }
        }
    }

    private error({reqId, constructor, data}: any) {
        const res = Presenter.getMessage(constructor, data);
        if (res) {
            if (constructor === C_MSG.Error) {
                const resp = res.toObject();
                if (resp.items === "AUTH") {
                    // localStorage.removeItem('river.conn.info');
                    // window.location.reload();
                    // window.console.log("wfef");
                    window.console.log(resp);
                }
            }
        }
    }

    private flushSentQueue() {
        this.sentQueue.forEach((reqId) => {
            this.sendRequest(this.messageListeners[reqId].request);
        });
    }
}
