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
    PhoneActionAccepted, PhoneActionCallEmpty,
    PhoneActionCallWaiting,
    PhoneActionDiscarded,
    PhoneActionRequested, PhoneCallAction
} from "../sdk/messages/chat.phone_pb";
import {InputPeer, InputUser} from "../sdk/messages/core.types_pb";
import UniqueId from "../uniqueId";
import APIManager from "../sdk";

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

    private listeners: { [key: string]: IBroadcastItem } = {};

    private localStream: MediaStream | undefined;
    private localPeerConnection: RTCPeerConnection | undefined;
    // private remotePeerConnections: RTCPeerConnection[];
    private offerOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
    };

    private constructor() {
        this.updateManager = UpdateManager.getInstance();
        this.apiManager = APIManager.getInstance();

        this.updateManager.listen(C_MSG.UpdatePhoneCall, this.phoneCallHandler);
    }

    public call(peer: InputPeer) {
        const video = document.createElement('video');
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.setAttribute('muted', '');
        video.style.position = 'absolute';
        video.style.top = '50%';
        video.style.left = '50%';
        video.style.width = '360px';
        video.style.height = '360px';
        video.style.zIndex = '100000';
        video.style.transform = 'translate(-50%, -50%)';

        document.body.appendChild(video);
        navigator.mediaDevices.getUserMedia({audio: true, video: true}).then((stream) => {

            video.srcObject = stream;
            this.localStream = stream;

            const videoTracks = this.localStream.getVideoTracks();
            const audioTracks = this.localStream.getAudioTracks();
            if (videoTracks.length > 0) {
                window.console.log(`Using video device: ${videoTracks[0].label}`);
            }
            if (audioTracks.length > 0) {
                window.console.log(`Using audio device: ${audioTracks[0].label}`);
            }

            this.localPeerConnection = new RTCPeerConnection({
                iceServers: [{
                    credential: 'hamidreza',
                    urls: 'turn:vm-02.ronaksoftware.com',
                    username: 'hamid',
                }],
            });

            this.localPeerConnection.addEventListener('icecandidate', (e) => {
                window.console.log(e);
            });

            this.localStream.getTracks().forEach((track) => {
                if (this.localPeerConnection && this.localStream) {
                    this.localPeerConnection.addTrack(track, this.localStream);
                }
            });

            try {
                this.localPeerConnection.createOffer(this.offerOptions).then((offer) => {
                    window.console.log(offer);
                    this.callUser(peer, offer.sdp || '');
                });
            } catch (e) {
                window.console.log(e);
            }
        });
    }

    public listen(name: string, fn: any): (() => void) | null {
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

    private callUser(peer: InputPeer, sdp: string) {
        const inputUser = new InputUser();
        inputUser.setUserid(peer.getId() || '0');
        inputUser.setAccesshash(peer.getAccesshash() || '0');
        const randomId = UniqueId.getRandomId();
        this.apiManager.callRequest(inputUser, randomId, sdp, true).then((res) => {
            window.console.log(res);
        });
    }

    private phoneCallHandler = (data: UpdatePhoneCall.AsObject) => {
        const d = parseData(data.action || 0, data.actiondata);
        window.console.log(data, d);
        this.callHandlers('hi', 1);
    }

    private callHandlers(name: string, data: any) {
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
