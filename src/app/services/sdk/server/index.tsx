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
     * @type {object}
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

    public constructor() {
        this.reqId = 0;
        window.addEventListener('fnCallbackEvent', (event: any) => {
            this.response(event.detail);
        });
    }

    /**
     * Send a request to wasm worker over CustomEvent in window object
     */
    public send(constructor: number, data: Uint8Array): Promise<any> {
        let internalResolve = null;
        let internalReject = null;

        this.reqId++;
        const payload: any = {
            constructor,
            data,
            reqId: this.reqId,
        };

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
            this.sendRequest(payload);
        });

        /**
         * Add request to the queue manager
         */
        this.messageListeners[this.reqId] = {
            payload,
            reject: internalReject,
            resolve: internalResolve,
            state: 0,
        };

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
        window.dispatchEvent(fnCallbackEvent);
    }

    private response({reqId, constructor, data}: any) {
        window.console.log(constructor);
        const res = Presenter.getMessage(constructor, data);
        if (res) {
            if (constructor === C_MSG.Error) {
                this.messageListeners[reqId].reject(res.toObject());
            } else {
                this.messageListeners[reqId].resolve(res.toObject());
            }
            delete this.messageListeners[reqId];
        }
    }
}
