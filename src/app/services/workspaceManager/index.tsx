/*
    Creation Time: 2019 - April - 30
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {ProtoMessage} from '../sdk/messages/core.types_pb';
import {checkPong, ping} from '../sdk/server/socket';
import Presenter from '../sdk/presenters';
import {C_MSG} from '../sdk/const';
import {SystemGetInfo, SystemGetServerTime, SystemInfo} from '../sdk/messages/system_pb';
import {MessageEnvelope} from "../sdk/messages/rony_pb";

export interface IHttpRequest {
    constructor: number;
    data: Uint8Array;
    reqId: number;
}

interface IMessageListener {
    reject: any;
    request: IHttpRequest;
    resolve: any;
}

export default class WorkspaceManger {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new WorkspaceManger();
        }

        return this.instance;
    }

    private static instance: WorkspaceManger;

    private reqId: number;
    private messageListeners: { [key: number]: IMessageListener } = {};
    private socket: WebSocket | undefined;
    private connected: boolean = false;
    private sentQueue: number[] = [];

    private constructor() {
        this.reqId = 1;
    }

    public systemGetInfo(): Promise<SystemInfo.AsObject> {
        const data = new SystemGetInfo();
        return this.executeCommand(C_MSG.SystemGetInfo, data.serializeBinary());
    }

    public systemGetServerTime(): Promise<SystemInfo.AsObject> {
        const data = new SystemGetServerTime();
        return this.executeCommand(C_MSG.SystemServerTime, data.serializeBinary());
    }

    public startWebsocket(url: string) {
        return new Promise((resolve, reject) => {
            this.closeWire();

            this.socket = new WebSocket(`ws://${url}`);
            this.socket.binaryType = 'arraybuffer';

            // Connection opened
            this.socket.onopen = () => {
                if (!this.socket || !this.socket.OPEN || this.socket.readyState !== 1) {
                    return;
                }
                this.socket.send(ping);
                this.connected = true;
                this.systemGetServerTime();
                this.startQueue();
                resolve(null);
            };

            // Listen for messages
            this.socket.onmessage = (event) => {
                if (!checkPong(event.data)) {
                    this.resolve(event.data);
                }
            };

            // Listen for messages
            this.socket.onclose = () => {
                this.closeWire();
            };

            this.socket.onerror = (err) => {
                reject(err);
            };
        });
    }

    public closeWire() {
        this.connected = false;
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
            this.socket.close();
        }
        this.sentQueue = [];
        this.messageListeners = {};
    }

    public executeCommand(constructor: number, data: Uint8Array) {
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
            reject: internalReject,
            request,
            resolve: internalResolve,
        };

        this.sentQueue.push(reqId);

        return promise;
    }

    private sendRequest(request: IHttpRequest) {
        if (!this.socket || !this.connected) {
            return;
        }
        const messageEnvelope = new MessageEnvelope();
        messageEnvelope.setConstructor(request.constructor);
        messageEnvelope.setMessage(request.data);
        messageEnvelope.setRequestid(request.reqId);

        const protoMessage = new ProtoMessage();
        protoMessage.setAuthid(0);
        protoMessage.setMessagekey(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
        protoMessage.setPayload(messageEnvelope.serializeBinary());

        this.socket.send(protoMessage.serializeBinary());
    }

    private resolve(data: Uint8Array) {
        let protoMessage: ProtoMessage;
        try {
            protoMessage = ProtoMessage.deserializeBinary(data);
        } catch (e) {
            window.console.debug(e);
            return;
        }
        if (protoMessage.getAuthid() !== 0) {
            return;
        }
        const msgEnvelope = MessageEnvelope.deserializeBinary(protoMessage.getPayload_asU8());
        const reqId = msgEnvelope.getRequestid() || 0;
        const constructor = msgEnvelope.getConstructor() || 0;
        if (constructor === C_MSG.Error) {
            const errorRes = Presenter.getMessage(constructor, msgEnvelope.getMessage_asU8());
            window.console.warn(errorRes.toObject());
        }
        if (!this.messageListeners.hasOwnProperty(reqId)) {
            return;
        }
        const res = Presenter.getMessage(constructor, msgEnvelope.getMessage_asU8());
        if (constructor === C_MSG.Error) {
            this.messageListeners[reqId].reject(res.toObject());
        } else {
            this.messageListeners[reqId].resolve(res.toObject());
        }
        delete this.messageListeners[reqId];
        this.clearQueueById(reqId);
    }

    private startQueue() {
        while (this.sentQueue.length > 0) {
            const id = this.sentQueue.shift();
            if (id && this.messageListeners.hasOwnProperty(id)) {
                const req = this.messageListeners[id];
                this.sendRequest(req.request);
            }
        }
    }

    private clearQueueById(id: number) {
        const index = this.sentQueue.indexOf(id);
        if (index > -1) {
            this.sentQueue.splice(index, 1);
        }
    }

}
