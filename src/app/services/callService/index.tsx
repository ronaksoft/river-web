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
    PhoneCallAction,
    PhoneRecipient, PhoneRecipientSDP
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
    private readonly userId: string = '0';

    // Call variables
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
        iceTransportPolicy: "relay",
    };
    private peer: InputPeer | null = null;
    private activeCallId: string | undefined = '0';
    private callRequest: { [key: string]: IUpdatePhoneCall } = {};
    private callRecipients: { [key: number]: PhoneRecipient.AsObject } = {};
    private callRecipientMap: { [key: string]: number } = {};

    private constructor() {
        this.updateManager = UpdateManager.getInstance();
        this.apiManager = APIManager.getInstance();
        this.userId = this.apiManager.getConnInfo().UserID || '0';

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

    public call(peer: InputPeer, recipients: InputUser.AsObject[]) {
        this.peer = peer;

        return this.apiManager.callInit(peer).then((res) => {
            this.configs.iceServers = res.iceserversList.map((item) => ({
                credential: item.credential,
                urls: item.urlsList,
                username: item.username,
            }));
            return this.initInitiatorConnections(recipients).then((phoneRecipients) => {
                this.callUser(peer, phoneRecipients);
            });
        });
    }

    public accept(id: string) {
        const peer = this.peer;
        if (!peer) {
            return Promise.reject('invalid peer');
        }
        return this.apiManager.callInit(peer).then((res) => {
            this.configs.iceServers = res.iceserversList.map((item) => ({
                credential: item.credential,
                urls: item.urlsList,
                username: item.username,
            }));
            const data = this.callRequest[id];
            if (!data) {
                return Promise.reject('invalid call request');
            }
            const sdpData = (data.data as PhoneActionRequested.AsObject);
            if (this.initRecipients(sdpData.recipientsList, data.userid || '0')) {
                return this.initStream().then((stream) => {
                    return this.initAcceptorConnections(peer, id, {
                        sdp: sdpData.sdp,
                        type: sdpData.type as any,
                    }).then(() => {
                        return stream;
                    });
                });
            } else {
                // accept all other
                return Promise.reject('not implemented yet');
            }
        });
    }

    public reject(id: string, duration: number, reason: DiscardReason) {
        const peer = this.peer;
        if (!peer) {
            return Promise.reject('invalid peer');
        }

        // const inputUser = new InputUser();
        // const data = this.callRequest[id];
        // if (data) {
        //     inputUser.setUserid(data.userid || '0');
        //     inputUser.setAccesshash(data.accesshash || '0');
        // } else if (this.peer) {
        //     inputUser.setUserid(this.peer.getId() || '0');
        //     inputUser.setAccesshash(this.peer.getAccesshash() || '0');
        // } else {
        //     return Promise.reject('invalid call request');
        // }

        return this.apiManager.callReject(peer, id, this.getInputUsers(id), reason, duration).then(() => {
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
            this.activeCallId = undefined;
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

    private busyHandler(data: IUpdatePhoneCall) {
        const peer = this.peer;
        if (!peer) {
            return Promise.reject('invalid peer');
        }

        return this.apiManager.callReject(peer, data.callid || '0', this.getInputUsers(data.callid || '0'), DiscardReason.DISCARDREASONHANGUP, 0).then(() => {
            //
        });
    }

    private callUser(peer: InputPeer, phoneRecipients: PhoneRecipientSDP[]) {
        const randomId = UniqueId.getRandomId();
        this.apiManager.callRequest(peer, randomId, phoneRecipients).then((res) => {
            this.activeCallId = res.id || '0';
        });
    }

    private phoneCallHandler = (data: IUpdatePhoneCall) => {
        const d = parseData(data.action || 0, data.actiondata);
        window.console.log(data);
        data.data = d;
        switch (data.action) {
            case PhoneCallAction.PHONECALLREQUESTED:
                this.callRequested(data);
                break;
            case PhoneCallAction.PHONECALLACCEPTED:
                this.callAccepted(data);
                break;
            case PhoneCallAction.PHONECALLDISCARDED:
                this.callRejected(data);
                break;
            case PhoneCallAction.PHONECALLICEEXCHANGE:
                this.iceExchange(data);
                break;
        }
    }

    private callRequested(data: IUpdatePhoneCall) {
        if (false && this.activeCallId) {
            this.busyHandler(data);
            return;
        }
        this.callRequest[data.callid || '0'] = data;
        const inputPeer = new InputPeer();
        inputPeer.setId(data.peerid || '0');
        inputPeer.setAccesshash(data.peertype === PeerType.PEERGROUP ? '0' : (data.accesshash || '0'));
        inputPeer.setType(data.peertype || PeerType.PEERUSER);
        this.peer = inputPeer;
        this.callHandlers(C_CALL_EVENT.CallRequest, data);
    }

    private callAccepted(data: IUpdatePhoneCall) {
        const connId = this.callRecipientMap[data.userid || 0];
        window.console.log(connId, this.peerConnections);
        if (!this.peerConnections.hasOwnProperty(connId)) {
            return;
        }

        this.activeCallId = data.callid || '0';

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

    private callRejected(data: IUpdatePhoneCall) {
        // const actionData = (data.data as PhoneActionDiscarded.AsObject);
        this.callHandlers(C_CALL_EVENT.CallRejected, data);
    }

    private iceExchange(data: IUpdatePhoneCall) {
        const connId = this.callRecipientMap[data.userid || 0];
        window.console.log(connId, this.peerConnections);
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

    private convertPhoneRecipient(item: PhoneRecipientSDP.AsObject) {
        const phoneRecipient = new PhoneRecipientSDP();
        phoneRecipient.setConnectionid(item.connectionid || 0);
        phoneRecipient.setSdp(item.sdp || '');
        phoneRecipient.setType(item.type || '');
        const peer = new InputUser();
        peer.setAccesshash(item.peer.accesshash || '0');
        peer.setUserid(item.peer.userid || '0');
        phoneRecipient.setPeer(peer);
        return phoneRecipient;
    }

    private initRecipients(recipients: PhoneRecipient.AsObject[], userId: string) {
        recipients.forEach((recipient) => {
            this.callRecipients[recipient.connectionid || 0] = {
                connectionid: recipient.connectionid,
                peer: recipient.peer,
            };
            this.callRecipientMap[recipient.peer.userid || '0'] = recipient.connectionid || 0;
        });
        return this.callRecipientMap[userId] === 0;
    }

    private initInitiatorConnections(recipients: InputUser.AsObject[]): Promise<PhoneRecipientSDP[]> {
        recipients.unshift({
            accesshash: '0',
            userid: this.userId,
        });
        recipients.forEach((recipient, index) => {
            this.callRecipients[index] = {
                connectionid: index,
                peer: recipient,
            };
            this.callRecipientMap[recipient.userid || '0'] = index;
        });
        const userConnId = this.callRecipientMap[this.userId] || 0;
        const promises: any[] = [];
        Object.values(this.callRecipients).forEach((recipient) => {
            // Initialize connections only for greater connId,
            // full mesh initialization will take place here
            if (userConnId === recipient.connectionid) {
                promises.push(Promise.resolve({
                    ...this.callRecipients[recipient.connectionid || 0],
                    sdp: '',
                    type: '',
                }));
            } else if (userConnId < (recipient.connectionid || 0)) {
                promises.push(this.initConnection(false, recipient.connectionid || 0).then((res) => {
                    return {
                        ...this.callRecipients[recipient.connectionid || 0],
                        sdp: res.sdp || '',
                        type: res.type || 'offer'
                    };
                }));
            }
        });
        if (promises.length > 0) {
            return Promise.all(promises).then((res) => {
                return res.map((item: PhoneRecipientSDP.AsObject) => {
                    return this.convertPhoneRecipient(item);
                });
            });
        } else {
            return Promise.resolve([]);
        }
    }

    private initAcceptorConnections(peer: InputPeer, id: string, sdp: RTCSessionDescriptionInit) {
        const userConnId = this.callRecipientMap[this.userId] || 0;
        const promises: any[] = [];
        Object.values(this.callRecipients).forEach((recipient) => {
            // Initialize connections only for greater connId,
            // full mesh initialization will take place here
            if (userConnId > (recipient.connectionid || 0)) {
                promises.push(this.initConnection(true, recipient.connectionid || 0, sdp).then((res) => {
                    const rc = this.convertPhoneRecipient({
                        ...this.callRecipients[recipient.connectionid || 0],
                        sdp: res.sdp || '',
                        type: res.type || 'answer',
                    });
                    return this.apiManager.callAccept(peer, id, [rc]);
                }));
            } else if (userConnId < (recipient.connectionid || 0)) {
                const innerPromises: any[] = [];
                innerPromises.push(this.initConnection(false, recipient.connectionid || 0).then((res) => {
                    return {
                        ...this.callRecipients[recipient.connectionid || 0],
                        sdp: res.sdp || '',
                        type: res.type || 'offer'
                    };
                }));
                if (innerPromises.length > 0) {
                    promises.push(Promise.all(innerPromises).then((res) => {
                        return res.map((item: PhoneRecipientSDP.AsObject) => {
                            return this.convertPhoneRecipient(item);
                        });
                    }).then((phoneRecipients) => {
                        return this.callUser(peer, phoneRecipients);
                    }));
                } else {
                    promises.push(Promise.resolve([]));
                }
            }
        });
        if (promises.length > 0) {
            return Promise.all(promises);
        } else {
            return Promise.resolve([]);
        }
    }

    private initConnection(remote: boolean, connId: number, sdp?: RTCSessionDescriptionInit) {
        const stream = this.localStream;
        if (!stream) {
            return Promise.reject('no available stream');
        }

        const pc = new RTCPeerConnection(this.configs);
        pc.addEventListener('icecandidate', (e) => {
            this.sendLocalIce(e.candidate, connId).catch((err) => {
                window.console.log('icecandidate', err);
            });
        });

        pc.addEventListener('icecandidateerror', (e) => {
            window.console.log('icecandidateerror', e);
        });

        const conn: IConnection = {
            accepted: remote,
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

    private getInputUsers(id: string) {
        const inputUsers: InputUser[] = [];
        Object.values(this.callRecipients).forEach((recipient) => {
            const inputUser = new InputUser();
            inputUser.setAccesshash(recipient.peer.accesshash || '0');
            inputUser.setUserid(recipient.peer.userid || '0');
            inputUsers.push(inputUser);
        });
        return inputUsers;
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
        if (!peer || !this.activeCallId) {
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

        return this.apiManager.callUpdate(peer, this.activeCallId, [inputUser], PhoneCallAction.PHONECALLICEEXCHANGE, actionData.serializeBinary()).then(() => {
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
