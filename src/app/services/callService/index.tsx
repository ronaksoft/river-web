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
    PhoneActionAccepted,
    PhoneActionCallEmpty,
    PhoneActionCallWaiting,
    PhoneActionDiscarded,
    PhoneActionIceExchange,
    PhoneActionRequested,
    PhoneCallAction
} from "../sdk/messages/chat.phone_pb";
import {InputPeer, InputUser} from "../sdk/messages/core.types_pb";
import UniqueId from "../uniqueId";
import APIManager from "../sdk";

export const C_CALL_EVENT = {
    CallRequest: 0x01,
};

export interface IUpdatePhoneCall extends UpdatePhoneCall.AsObject {
    data?: any;
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
    private localPeerConnections: { [key: number]: RTCPeerConnection } = {};
    private remotePeerConnections: { [key: number]: RTCPeerConnection } = {};
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

    public initVideo() {
        return navigator.mediaDevices.getUserMedia({audio: true, video: true}).then((stream) => {
            this.localStream = stream;
            return stream;
        });
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

    public call(peer: InputPeer, connId: number) {
        if (this.localPeerConnections.hasOwnProperty(connId)) {
            return;
        }

        this.peer = peer;
        const stream = this.localStream;
        if (!stream) {
            return;
        }

        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();
        if (videoTracks.length > 0) {
            window.console.log(`Using video device: ${videoTracks[0].label}`);
        }
        if (audioTracks.length > 0) {
            window.console.log(`Using audio device: ${audioTracks[0].label}`);
        }

        const pc = new RTCPeerConnection(this.configs);

        pc.addEventListener('icecandidate', (e) => {
            window.console.log(e);
            this.sendLocalIce(e.candidate);
        });

        stream.getTracks().forEach((track) => {
            if (this.localStream) {
                pc.addTrack(track, this.localStream);
            }
        });

        try {
            pc.createOffer(this.offerOptions).then((offer) => {
                window.console.log(offer);
                pc.setLocalDescription(offer).catch((e) => {
                    window.console.log(e);
                });
                this.callUser(peer, offer.sdp || '', offer.type || 'offer');
            });
        } catch (e) {
            window.console.log(e);
        }

        this.localPeerConnections[connId] = pc;
    }

    public accept(id: string, connId: number) {
        if (this.localPeerConnections.hasOwnProperty(connId)) {
            return Promise.reject('connection id already exists');
        }

        return this.initVideo().then(() => {
            const data = this.callRequest[id];
            if (!data) {
                return;
            }

            const inputUser = new InputUser();
            inputUser.setUserid(data.userid || '0');
            inputUser.setAccesshash(data.accesshash || '0');

            const sdpData = (data.data as PhoneActionRequested.AsObject);

            const pc = new RTCPeerConnection(this.configs);
            pc.addEventListener('icecandidate', (e) => {
                window.console.log(e);
            });

            pc.addEventListener('track', (e) => {
                window.console.log(e);
                const video = document.createElement('video');
                video.autoplay    = true;
                video.muted       = true;
                // @ts-ignore
                video.playsinline = true;
                video.srcObject = e.streams[0];
                document.body.appendChild(video);
            });

            pc.setRemoteDescription({
                sdp: sdpData.sdp,
                type: sdpData.type as any,
            });

            this.localPeerConnections[connId] = pc;

            return pc.createAnswer(this.offerOptions).then((answer) => {
                this.localPeerConnections[connId].setLocalDescription(answer);
                return this.apiManager.callAccept(inputUser, id, answer.sdp || '', answer.type || 'answer').then(() => {
                    return this.localStream;
                });
            });
        });
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

    private sendLocalIce(candidate: RTCIceCandidate | null) {
        const peer = this.peer;
        if (!peer || !this.callId || !candidate) {
            return;
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

        this.apiManager.callUpdate(inputUser, this.callId, PhoneCallAction.PHONECALLICEEXCHANGE, actionData.serializeBinary()).then(() => {
            //
        }).catch((e) => {
            window.console.log(e);
        });
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
                window.console.log(data);
                break;
            case PhoneCallAction.PHONECALLICEEXCHANGE:
                this.iceExchange(data, 0);
                break;
        }
    }

    private callRequested(data: IUpdatePhoneCall) {
        this.callRequest[data.callid || '0'] = data;
        this.callHandlers(C_CALL_EVENT.CallRequest, data);
    }

    private iceExchange(data: IUpdatePhoneCall, connId: number) {
        if (!this.localPeerConnections.hasOwnProperty(connId)) {
            return;
        }

        const actionData = data.data as PhoneActionIceExchange.AsObject;
        if (!actionData) {
            return;
        }

        const iceCandidate = new RTCIceCandidate({
            candidate: actionData.candidate,
            sdpMLineIndex: actionData.sdpmlineindex,
            sdpMid: actionData.sdpmid,
            usernameFragment: actionData.usernamefragment,
        });
        this.localPeerConnections[connId].addIceCandidate(iceCandidate).catch((e) => {
            window.console.log(e);
        });
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
