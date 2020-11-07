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
    private localPeerConnections: RTCPeerConnection[] = [];
    private remotePeerConnections: RTCPeerConnection[] = [];
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

    public call(peer: InputPeer) {
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
                this.callUser(peer, JSON.stringify(offer.sdp || ''));
            });
        } catch (e) {
            window.console.log(e);
        }

        this.localPeerConnections.push(pc);
    }

    public accept(id: string) {
        this.initVideo().then(() => {
            const data = this.callRequest[id];
            if (!data) {
                return;
            }

            const sdpData = JSON.parse((data.data as PhoneActionRequested.AsObject).sdp || '') as RTCSessionDescription;

            const pc = new RTCPeerConnection(this.configs);
            pc.addEventListener('icecandidate', (e) => {
                window.console.log(e);
            });

            pc.addEventListener('track', (e) => {
                window.console.log(e);
            });

            pc.setRemoteDescription(sdpData);

            pc.createAnswer(this.offerOptions).then((answer) => {
                window.console.log(answer);
            });

            this.remotePeerConnections.push(pc);
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
        if (!peer || !this.callId) {
            return;
        }

        const actionData = new PhoneActionIceExchange();
        actionData.setIce(JSON.stringify(candidate));

        const inputUser = new InputUser();
        inputUser.setUserid(peer.getId() || '0');
        inputUser.setAccesshash(peer.getAccesshash() || '0');

        this.apiManager.callUpdate(inputUser, this.callId, PhoneCallAction.PHONECALLICEEXCHANGE, actionData.serializeBinary()).then(() => {
            //
        }).catch((e) => {
            window.console.log(e);
        });
    }

    private callUser(peer: InputPeer, sdp: string) {
        const inputUser = new InputUser();
        inputUser.setUserid(peer.getId() || '0');
        inputUser.setAccesshash(peer.getAccesshash() || '0');
        const randomId = UniqueId.getRandomId();
        this.apiManager.callRequest(inputUser, randomId, sdp, true).then((res) => {
            window.console.log(res);
            this.callId = res.id || '0';
        });
    }

    private phoneCallHandler = (data: IUpdatePhoneCall) => {
        const d = parseData(data.action || 0, data.actiondata);
        data.data = d;
        window.console.log(data);
        switch (data.action) {
            case PhoneCallAction.PHONECALLREQUESTED:
                this.callRequested(data);
                break;
            case PhoneCallAction.PHONECALLICEEXCHANGE:
                this.iceExchange(data);
                break;
        }
    }

    private callRequested(data: IUpdatePhoneCall) {
        this.callRequest[data.callid || '0'] = data;
        this.callHandlers(C_CALL_EVENT.CallRequest, data);
    }

    private iceExchange(data: IUpdatePhoneCall) {
        const actionData = data.data as PhoneActionIceExchange.AsObject;
        if (!actionData.ice) {
            return;
        }

        const pc = new RTCPeerConnection(this.configs);
        pc.addEventListener('icecandidate', () => {
            if (this.localPeerConnections.length === 0) {
                return;
            }
            const iceObject = JSON.parse(actionData.ice || '') as RTCIceCandidate;
            const iceCandidate = new RTCIceCandidate(iceObject);
            this.localPeerConnections[0].addIceCandidate(iceCandidate).catch((e) => {
                window.console.log(e);
            });
        });
        pc.addEventListener('track', (e) => {
            window.console.log(e);
        });
        this.remotePeerConnections.push(pc);
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
