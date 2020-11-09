/*
    Creation Time: 2020 - Nov - 04
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import UpdateManager from "../sdk/updateManager";
import {C_MSG} from "../sdk/const";
import {UpdatePhoneCall} from "../sdk/messages/updates_pb";
import {
    DiscardReason,
    PhoneActionAccepted,
    PhoneActionCallEmpty,
    PhoneActionCallWaiting,
    PhoneActionDiscarded,
    PhoneActionIceExchange,
    PhoneActionRequested,
    PhoneCallAction
} from "../sdk/messages/chat.phone_pb";
import {InputPeer, InputUser, PeerType} from "../sdk/messages/core.types_pb";
import UniqueId from "../uniqueId";
import APIManager from "../sdk";

export const C_CALL_EVENT = {
    CallAccept: 0x02,
    CallRejected: 0x04,
    CallRequest: 0x01,
    StreamUpdate: 0x03,
};

export interface IUpdatePhoneCall extends UpdatePhoneCall.AsObject {
    data?: any;
}

interface IConnection {
    accepted: boolean;
    connection: RTCPeerConnection;
    streams: MediaStream[];
    iceQueue: RTCIceCandidate[];
}

interface IBroadcastItem {
    fnQueue: { [key: number]: any };
    data: any;
}

const parseData = (constructor: number, data: any) => {
    switch (constructor) {
        case PhoneCallAction.PHONECALLREQUESTED:
            return PhoneActionRequested.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLACCEPTED:
            return PhoneActionAccepted.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLDISCARDED:
            return PhoneActionDiscarded.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLCALLWAITING:
            return PhoneActionCallWaiting.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLICEEXCHANGE:
            return PhoneActionIceExchange.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLEMPTY:
            return PhoneActionCallEmpty.deserializeBinary(data).toObject();
    }
    return undefined;
};

export default class CallService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new CallService();
        }

        return this.instance;
    }

    private static instance: CallService;
    private fnIndex: number = 0;
    private updateManager: UpdateManager;
    private apiManager: APIManager;

    private listeners: { [key: number]: IBroadcastItem } = {};

    private localStream: MediaStream | undefined;
    private peerConnections: { [key: number]: IConnection } = {};
    private offerOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
    };
    private configs: RTCConfiguration = {
        iceServers: [{
            credential: 'hamidreza',
            urls: 'turn:vm-02.ronaksoftware.com',
            username: 'hamid',
        }],
    };
    private peer: InputPeer | null = null;
    private callId: string | undefined = '0';
    private callRequest: { [key: string]: IUpdatePhoneCall } = {};

    private constructor() {
        this.updateManager = UpdateManager.getInstance();
        this.apiManager = APIManager.getInstance();

        this.updateManager.listen(C_MSG.UpdatePhoneCall, this.phoneCallHandler);
    }

    public initStream() {
        return navigator.mediaDevices.getUserMedia({audio: true, video: true}).then((stream) => {
            this.localStream = stream;
            return stream;
        });
    }

    public toggleVideo(enable: boolean) {
        if (!this.localStream) {
            return;
        }
        this.localStream.getVideoTracks().forEach((track) => {
            track.enabled = enable;
        });
    }

    public toggleAudio(enable: boolean) {
        if (!this.localStream) {
            return;
        }
        this.localStream.getAudioTracks().forEach((track) => {
            track.enabled = enable;
        });
    }

    public getStreamState() {
        if (!this.localStream) {
            return;
        }
        const videoTracks = this.localStream.getVideoTracks();
        const audioTracks = this.localStream.getAudioTracks();
        return {
            audio: audioTracks.length > 0 ? audioTracks[0].enabled : false,
            video: videoTracks.length > 0 ? videoTracks[0].enabled : false,
        };
    }

    public destroy() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                track.stop();
            });
        }
    }

    public getLocalStream(): MediaStream | undefined {
        return this.localStream;
    }

    public getRemoteStreams(connId: number): MediaStream[] | undefined {
        if (!this.peerConnections.hasOwnProperty(connId)) {
            return undefined;
        }
        return this.peerConnections[connId].streams;
    }

    public call(peer: InputPeer, connId: number) {
        if (this.peerConnections.hasOwnProperty(connId)) {
            return;
        }

        this.peer = peer;

        return this.initConnection(false, 0).then((offer) => {
            this.callUser(peer, offer.sdp || '', offer.type || 'offer');
        });
    }

    public accept(id: string, connId: number) {
        return this.initStream().then((stream) => {
            const data = this.callRequest[id];
            if (!data) {
                return Promise.reject('invalid call request');
            }

            const inputUser = new InputUser();
            inputUser.setUserid(data.userid || '0');
            inputUser.setAccesshash(data.accesshash || '0');

            const sdpData = (data.data as PhoneActionRequested.AsObject);

            return this.initConnection(true, 0, {
                sdp: sdpData.sdp,
                type: sdpData.type as any,
            }).then((answer) => {
                if (!this.peerConnections.hasOwnProperty(connId)) {
                    return Promise.reject('invalid connId');
                }

                return this.apiManager.callAccept(inputUser, id, answer.sdp || '', answer.type || 'answer').then(() => {
                    return stream;
                });
            });
        });
    }

    public reject(id: string, duration: number) {
        const data = this.callRequest[id];
        if (!data) {
            return Promise.reject('invalid call request');
        }

        const inputUser = new InputUser();
        inputUser.setUserid(data.userid || '0');
        inputUser.setAccesshash(data.accesshash || '0');

        return this.apiManager.callReject(inputUser, id, DiscardReason.DISCARDREASONHANGUP, duration).then(() => {
            this.destroyConnections(id);
        });
    }

    public destroyConnections(id: string, connId?: number) {
        const close = (conn: IConnection) => {
            conn.connection.close();
            conn.streams.forEach((stream) => {
                stream.getTracks().forEach((track) => {
                    track.stop();
                });
            });
        };

        if (connId !== undefined) {
            if (this.peerConnections.hasOwnProperty(connId)) {
                close(this.peerConnections[connId]);
                delete this.peerConnections[connId];
            }
        } else {
            Object.values(this.peerConnections).forEach((conn) => {
                close(conn);
            });
            this.peerConnections = {};
            delete this.callRequest[id];
            this.callId = undefined;
        }
    }

    public listen(name: number, fn: any): (() => void) | null {
        if (!name) {
            return null;
        }
        this.fnIndex++;
        const fnIndex = this.fnIndex;
        if (!this.listeners.hasOwnProperty(name)) {
            this.listeners[name] = {
                data: null,
                fnQueue: [],
            };
        }
        this.listeners[name].fnQueue[fnIndex] = fn;
        return () => {
            if (this.listeners.hasOwnProperty(name)) {
                delete this.listeners[name].fnQueue[fnIndex];
            }
        };
    }

    private callUser(peer: InputPeer, sdp: string, type: string) {
        const inputUser = new InputUser();
        inputUser.setUserid(peer.getId() || '0');
        inputUser.setAccesshash(peer.getAccesshash() || '0');
        const randomId = UniqueId.getRandomId();
        this.apiManager.callRequest(inputUser, randomId, sdp, type, true).then((res) => {
            this.callId = res.id || '0';
        });
    }

    private phoneCallHandler = (data: IUpdatePhoneCall) => {
        const d = parseData(data.action || 0, data.actiondata);
        data.data = d;
        switch (data.action) {
            case PhoneCallAction.PHONECALLREQUESTED:
                this.callRequested(data);
                break;
            case PhoneCallAction.PHONECALLACCEPTED:
                this.callAccepted(data, 0);
                break;
            case PhoneCallAction.PHONECALLDISCARDED:
                this.callRejected(data, 0);
                break;
            case PhoneCallAction.PHONECALLICEEXCHANGE:
                this.iceExchange(data, 0);
                break;
        }
    }

    private callRequested(data: IUpdatePhoneCall) {
        this.callRequest[data.callid || '0'] = data;
        const inputPeer = new InputPeer();
        inputPeer.setId(data.userid || '0');
        inputPeer.setAccesshash(data.accesshash || '0');
        inputPeer.setType(PeerType.PEERUSER);
        this.peer = inputPeer;
        this.callHandlers(C_CALL_EVENT.CallRequest, data);
    }

    private callAccepted(data: IUpdatePhoneCall, connId: number) {
        if (!this.peerConnections.hasOwnProperty(connId)) {
            return;
        }

        const sdpData = (data.data as PhoneActionAccepted.AsObject);

        this.peerConnections[connId].connection.setRemoteDescription({
            sdp: sdpData.sdp,
            type: sdpData.type as any,
        }).then(() => {
            if (this.peerConnections.hasOwnProperty(connId)) {
                this.peerConnections[connId].accepted = true;
                this.flushIceCandidates(connId);
            }
        });

        this.callHandlers(C_CALL_EVENT.CallAccept, data);
    }

    private callRejected(data: IUpdatePhoneCall, connId: number) {
        // const actionData = (data.data as PhoneActionDiscarded.AsObject);
        this.callHandlers(C_CALL_EVENT.CallRejected, data);
    }

    private iceExchange(data: IUpdatePhoneCall, connId: number) {
        const conn = this.peerConnections;
        if (!conn.hasOwnProperty(connId)) {
            return Promise.reject('connId is not found');
        }

        const actionData = data.data as PhoneActionIceExchange.AsObject;
        if (!actionData) {
            return Promise.reject('cannot find sdp');
        }

        const iceCandidate = new RTCIceCandidate({
            candidate: actionData.candidate,
            sdpMLineIndex: actionData.sdpmlineindex,
            sdpMid: actionData.sdpmid,
            usernameFragment: actionData.usernamefragment,
        });

        return conn[connId].connection.addIceCandidate(iceCandidate);
    }

    private initConnection(remote: boolean, connId: number, sdp?: RTCSessionDescriptionInit) {
        const stream = this.localStream;
        if (!stream) {
            return Promise.reject('no available stream');
        }

        const pc = new RTCPeerConnection(this.configs);
        pc.addEventListener('icecandidate', (e) => {
            this.sendLocalIce(e.candidate, connId).catch((err) => {
                window.console.log(err);
            });
        });

        const conn: IConnection = {
            accepted: false,
            connection: pc,
            iceQueue: [],
            streams: [],
        };

        pc.addEventListener('track', (e) => {
            if (e.streams.length > 0) {
                conn.streams = [];
                conn.streams.push(...e.streams);
                this.callHandlers(C_CALL_EVENT.StreamUpdate, {connId, streams: e.streams});
            }
            // window.console.log(e);
            // const video = document.createElement('video');
            // video.autoplay = true;
            // // @ts-ignore
            // video.playsinline = true;
            // video.srcObject = e.streams[0];
            // video.style.position = 'fixed';
            // video.style.zIndex = '1000';
            // video.style.top = '50%';
            // video.style.left = '50%';
            // video.style.transform = 'translate(-50%, -50%)';
            // document.body.appendChild(video);
        });

        stream.getTracks().forEach((track) => {
            if (this.localStream) {
                pc.addTrack(track, this.localStream);
            }
        });

        this.peerConnections[connId] = conn;
        if (remote) {
            if (!sdp) {
                return Promise.reject('invalid sdp');
            }
            return pc.setRemoteDescription(sdp).then(() => {
                return pc.createAnswer(this.offerOptions).then((res) => {
                    return pc.setLocalDescription(res).then(() => {
                        return res;
                    });
                });
            });
        } else {
            return pc.createOffer(this.offerOptions).then((res) => {
                return pc.setLocalDescription(res).then(() => {
                    return res;
                });
            });
        }
    }

    private sendLocalIce(candidate: RTCIceCandidate | null, connId: number) {
        if (!candidate) {
            return Promise.reject('invalid candidate');
        }

        const conn = this.peerConnections[connId];
        if (!conn) {
            return Promise.reject('invalid conn');
        }

        if (!conn.accepted) {
            conn.iceQueue.push(candidate);
            return Promise.resolve();
        }

        const peer = this.peer;
        if (!peer || !this.callId) {
            return Promise.reject('invalid input');
        }

        const actionData = new PhoneActionIceExchange();
        actionData.setCandidate(candidate.candidate);
        if (candidate.sdpMid) {
            actionData.setSdpmid(candidate.sdpMid);
        }
        if (candidate.sdpMLineIndex) {
            actionData.setSdpmlineindex(candidate.sdpMLineIndex);
        }
        if (candidate.usernameFragment) {
            actionData.setUsernamefragment(candidate.usernameFragment);
        }

        const inputUser = new InputUser();
        inputUser.setUserid(peer.getId() || '0');
        inputUser.setAccesshash(peer.getAccesshash() || '0');

        return this.apiManager.callUpdate(inputUser, this.callId, PhoneCallAction.PHONECALLICEEXCHANGE, actionData.serializeBinary()).then(() => {
            return Promise.resolve();
        });
    }

    private flushIceCandidates(connId: number) {
        const conn = this.peerConnections[connId];
        if (!conn) {
            return;
        }
        while (true) {
            const candidate = conn.iceQueue.shift();
            if (candidate) {
                this.sendLocalIce(candidate, connId);
            } else {
                return;
            }
        }
    }

    private callHandlers(name: number, data: any) {
        if (!this.listeners.hasOwnProperty(name)) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            try {
                this.listeners[name].data = data;
                const keys = Object.keys(this.listeners[name].fnQueue);
                keys.forEach((key) => {
                    const fn = this.listeners[name].fnQueue[key];
                    if (fn) {
                        fn(data);
                    }
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }
}
