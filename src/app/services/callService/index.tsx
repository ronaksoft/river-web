/*
    Creation Time: 2020 - Nov - 04
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import UpdateManager from "../sdk/updateManager";
import {C_LOCALSTORAGE, C_MSG} from "../sdk/const";
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
    PhoneMediaSettingsUpdated,
    PhoneParticipant,
    PhoneParticipantSDP,
    PhoneSDPAnswer,
    PhoneSDPOffer
} from "../sdk/messages/chat.phone_pb";
import {InputPeer, InputUser, PeerType} from "../sdk/messages/core.types_pb";
import UniqueId from "../uniqueId";
import APIManager, {currentUserId} from "../sdk";
import {orderBy} from "lodash";

const C_RETRY_INTERVAL = 10000;
const C_RETRY_LIMIT = 6;

export const C_CALL_EVENT = {
    CallAccept: 0x02,
    CallReject: 0x04,
    CallRequest: 0x01,
    CallTimeout: 0x07,
    LocalStreamUpdate: 0x06,
    MediaSettingsUpdate: 0x05,
    StreamUpdate: 0x03,
};

export interface IUpdatePhoneCall extends Partial<UpdatePhoneCall.AsObject> {
    data?: any;
}

export interface IMediaSettings {
    audio: boolean;
    video: boolean;
}

export interface ICallParticipant extends PhoneParticipant.AsObject {
    mediaSettings: IMediaSettings;
}

interface IConnection {
    accepted: boolean;
    connection: RTCPeerConnection;
    streams: MediaStream[];
    iceQueue: RTCIceCandidate[];
    interval: any;
    try: number;
}

interface IBroadcastItem {
    fnQueue: { [key: number]: any };
    data: any;
}

interface ICallInfo {
    acceptedParticipants: number[];
    mediaSettings: IMediaSettings;
    participantMap: { [key: string]: number };
    participants: { [key: number]: ICallParticipant };
    request: IUpdatePhoneCall;
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
        case PhoneCallAction.PHONECALLMEDIASETTINGSCHANGED:
            return PhoneMediaSettingsUpdated.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLSDPOFFER:
            return PhoneSDPOffer.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLSDPANSWER:
            return PhoneSDPAnswer.deserializeBinary(data).toObject();
    }
    return undefined;
};

export interface IMediaDevice {
    speaker: boolean;
    video: boolean;
    voice: boolean;
}

export const getMediaInputs = (): Promise<IMediaDevice> => {
    const out: IMediaDevice = {
        speaker: false,
        video: false,
        voice: false,
    };
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return Promise.resolve(out);
    }

    return navigator.mediaDevices.enumerateDevices().then((res) => {
        res.forEach((item) => {
            if (item.kind === "audioinput") {
                out.voice = true;
            } else if (item.kind === "audiooutput") {
                out.speaker = true;
            } else if (item.kind === "videoinput") {
                out.video = true;
            }
        });
        return out;
    });
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

    // Handlers
    private openDialogFn: ((peer: InputPeer | null) => void) | null = null;
    private setTeamFn: ((teamId: string) => void) | null = null;

    // Devices
    private mediaDevice: IMediaDevice = localStorage.getItem(C_LOCALSTORAGE.MediaDevice) ? JSON.parse(localStorage.getItem(C_LOCALSTORAGE.MediaDevice)) : {
        speaker: false,
        video: false,
        voice: false,
    };

    // Call variables
    private localStream: MediaStream | undefined;
    private peerConnections: { [key: number]: IConnection } = {};
    private offerOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        voiceActivityDetection: true,
    };
    private configs: RTCConfiguration = {
        iceServers: [{
            credential: 'hamidreza',
            urls: 'turn:vm-02.ronaksoftware.com',
            username: 'hamid',
        }],
        iceTransportPolicy: 'all',
    };
    private peer: InputPeer | null = null;
    private activeCallId: string | undefined;
    private callInfo: { [key: string]: ICallInfo } = {};

    private constructor() {
        this.initMediaDevice();

        this.updateManager = UpdateManager.getInstance();
        this.apiManager = APIManager.getInstance();

        this.updateManager.listen(C_MSG.UpdatePhoneCall, this.phoneCallHandler);
    }

    public setDialogOpenFunction(fn: any) {
        this.openDialogFn = fn;
    }

    public openCallDialog(peer: InputPeer | null) {
        if (this.openDialogFn) {
            this.openDialogFn(peer);
        }
    }

    public setSetTeamFunction(fn: any) {
        this.setTeamFn = fn;
    }

    public setTeam(teamId: string) {
        if (this.setTeamFn) {
            this.setTeamFn(teamId);
        }
    }

    public initMediaDevice() {
        getMediaInputs().then((res) => {
            this.mediaDevice = res;
            localStorage.setItem(C_LOCALSTORAGE.MediaDevice, JSON.stringify(this.mediaDevice));
            if (!res.video) {
                this.offerOptions.offerToReceiveVideo = false;
            }
            if (!res.voice) {
                this.offerOptions.offerToReceiveAudio = false;
            }
        });
    }

    public getMediaDevice() {
        return this.mediaDevice;
    }

    public initStream(constraints: MediaStreamConstraints) {
        return navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            if (stream.getVideoTracks().length > 0) {
                this.offerOptions.offerToReceiveVideo = true;
            }
            if (stream.getAudioTracks().length > 0) {
                this.offerOptions.offerToReceiveAudio = true;
            }
            this.localStream = stream;
            this.callHandlers(C_CALL_EVENT.LocalStreamUpdate, stream);
            return stream;
        });
    }

    public toggleVideo(enable: boolean) {
        if (!this.localStream) {
            return;
        }
        const localVideos = this.localStream.getVideoTracks();
        if (localVideos.length > 0) {
            localVideos.forEach((track) => {
                track.enabled = enable;
                this.propagateMediaSettings({video: enable});
            });
        }
        this.modifyMediaStream(enable);
    }

    public toggleAudio(enable: boolean) {
        if (!this.localStream) {
            return;
        }
        this.localStream.getAudioTracks().forEach((track) => {
            track.enabled = enable;
            this.propagateMediaSettings({audio: enable});
        });
    }

    public getStreamState() {
        if (!this.localStream) {
            return {
                audio: false,
                video: false,
            };
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
        this.localStream = undefined;
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

    public call(peer: InputPeer, participants: InputUser.AsObject[], video: boolean) {
        this.peer = peer;

        return this.apiManager.callInit(peer).then((res) => {
            this.configs.iceServers = res.iceserversList.map((item) => ({
                credential: item.credential,
                urls: item.urlsList,
                username: item.username,
            }));
            this.initCallParticipants('temp', participants);
            return this.initConnections(peer, 'temp', true).then((done) => {
                this.swapTempInfo(this.activeCallId || '0');
                return this.activeCallId || '0';
            });
        });
    }

    public accept(id: string, video: boolean) {
        const peer = this.peer;
        if (!peer) {
            return Promise.reject('invalid peer');
        }
        return this.apiManager.callInit(peer).then((res) => {
            this.activeCallId = id;

            this.configs.iceServers = res.iceserversList.map((item) => ({
                credential: item.credential,
                urls: item.urlsList,
                username: item.username,
            }));
            const info = this.getCallInfo(id);
            if (!info) {
                return Promise.reject('invalid call request');
            }

            if (this.isInitiator(id, info.request.userid || '0')) {
                return this.initStream({audio: true, video}).then((stream) => {
                    const sdpData = (info.request.data as PhoneActionRequested.AsObject);
                    return this.initConnections(peer, id, false, {
                        sdp: sdpData.sdp,
                        type: sdpData.type as any,
                    }).then(() => {
                        const streamState = this.getStreamState();
                        this.mediaSettingsInit(streamState);
                        this.propagateMediaSettings(streamState);
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

        const participants = this.getInputUsers(id);
        if (!participants) {
            return Promise.reject('invalid call id');
        }

        return this.apiManager.callReject(peer, id, participants, reason, duration).then(() => {
            this.destroyConnections(id);
        });
    }

    public getParticipantList(callId: string): ICallParticipant[] {
        if (!this.callInfo.hasOwnProperty(callId)) {
            return [];
        }
        const list: ICallParticipant[] = [];
        Object.values(this.callInfo[callId].participants).forEach((participant) => {
            list.push(participant);
        });
        return orderBy(list, ['connectionid'], ['asc']);
    }

    public destroyConnections(id: string, connId?: number) {
        const close = (conn: IConnection) => {
            conn.connection.close();
            conn.streams.forEach((stream) => {
                stream.getTracks().forEach((track) => {
                    track.stop();
                });
            });
            clearInterval(conn.interval);
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
            delete this.callInfo[id];
            this.activeCallId = undefined;
            this.peer = null;
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

        const participants = this.getInputUsers(data.callid || '0');
        if (!participants) {
            return Promise.reject('invalid call id');
        }

        return this.apiManager.callReject(peer, data.callid || '0', participants, DiscardReason.DISCARDREASONHANGUP, 0).then(() => {
            //
        });
    }

    private callUser(peer: InputPeer, initiator: boolean, phoneParticipants: PhoneParticipantSDP[], callId?: string) {
        const randomId = UniqueId.getRandomId();
        return this.apiManager.callRequest(peer, randomId, initiator, phoneParticipants, callId).then((res) => {
            this.activeCallId = res.id || '0';
            return res;
        });
    }

    private phoneCallHandler = (data: IUpdatePhoneCall) => {
        const d = parseData(data.action || 0, data.actiondata);
        delete data.actiondata;
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
            case PhoneCallAction.PHONECALLMEDIASETTINGSCHANGED:
                this.mediaSettingsUpdated(data);
                break;
            case PhoneCallAction.PHONECALLSDPOFFER:
                this.sdpOfferUpdated(data);
                break;
            case PhoneCallAction.PHONECALLSDPANSWER:
                this.sdpAnswerUpdated(data);
                break;
        }
    }

    private callRequested(data: IUpdatePhoneCall) {
        if (false && this.activeCallId) {
            this.busyHandler(data);
            return;
        }
        if (!this.callInfo.hasOwnProperty(data.callid || 0)) {
            this.initCallRequest(data);
            const inputPeer = new InputPeer();
            inputPeer.setId(data.peerid || '0');
            inputPeer.setAccesshash(data.peertype === PeerType.PEERGROUP ? '0' : (data.accesshash || '0'));
            inputPeer.setType(data.peertype || PeerType.PEERUSER);
            this.peer = inputPeer;
            this.callHandlers(C_CALL_EVENT.CallRequest, data);
        }
    }

    private callAccepted(data: IUpdatePhoneCall) {
        const connId = this.getConnId(data.callid, data.userid);
        if (connId === null || !this.peerConnections.hasOwnProperty(connId)) {
            return;
        }

        const sdpData = (data.data as PhoneActionAccepted.AsObject);

        this.peerConnections[connId].connection.setRemoteDescription({
            sdp: sdpData.sdp,
            type: sdpData.type as any,
        }).then(() => {
            if (this.peerConnections.hasOwnProperty(connId)) {
                this.peerConnections[connId].accepted = true;
                this.flushIceCandidates(data.callid || '0', connId);
            }
        });

        this.propagateMediaSettings(this.getStreamState());

        this.clearRetryInterval(connId);

        this.callHandlers(C_CALL_EVENT.CallAccept, data);
    }

    private callRejected(data: IUpdatePhoneCall) {
        const connId = this.getConnId(data.callid, data.userid);
        if (connId !== null) {
            this.clearRetryInterval(connId);
        }
        // const actionData = (data.data as PhoneActionDiscarded.AsObject);
        this.callHandlers(C_CALL_EVENT.CallReject, data);
    }

    private iceExchange(data: IUpdatePhoneCall) {
        const connId = this.getConnId(data.callid, data.userid);
        const conn = this.peerConnections;
        if (connId === null || !conn.hasOwnProperty(connId)) {
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

    private convertPhoneParticipant(item: PhoneParticipantSDP.AsObject) {
        const phoneParticipant = new PhoneParticipantSDP();
        phoneParticipant.setConnectionid(item.connectionid || 0);
        phoneParticipant.setSdp(item.sdp || '');
        phoneParticipant.setType(item.type || '');
        const peer = new InputUser();
        peer.setAccesshash(item.peer.accesshash || '0');
        peer.setUserid(item.peer.userid || '0');
        phoneParticipant.setPeer(peer);
        return phoneParticipant;
    }

    private initCallParticipants(callId: string, participants: InputUser.AsObject[]) {
        participants.unshift({
            accesshash: '0',
            userid: currentUserId,
        });
        const callParticipants: { [key: number]: ICallParticipant } = {};
        const callParticipantMap: { [key: string]: number } = {};
        participants.forEach((participant, index) => {
            callParticipants[index] = {
                admin: index === 0,
                connectionid: index,
                initiator: index === 0,
                mediaSettings: {audio: true, video: true},
                peer: participant,
            };
            callParticipantMap[participant.userid || '0'] = index;
        });
        const mediaState = this.getStreamState();
        this.callInfo[callId] = {
            acceptedParticipants: [],
            mediaSettings: mediaState ? mediaState : {audio: true, video: true},
            participantMap: callParticipantMap,
            participants: callParticipants,
            request: {
                actiondata: '',
            },
        };
    }

    private initCallRequest(data: IUpdatePhoneCall) {
        if (this.callInfo.hasOwnProperty(data.callid || 0)) {
            return;
        }
        const sdpData = (data.data as PhoneActionRequested.AsObject);
        const callParticipants: { [key: number]: ICallParticipant } = {};
        const callParticipantMap: { [key: string]: number } = {};
        sdpData.participantsList.forEach((participant) => {
            callParticipants[participant.connectionid || 0] = {
                admin: participant.admin,
                connectionid: participant.connectionid,
                initiator: participant.initiator,
                mediaSettings: {audio: true, video: true},
                peer: participant.peer,
            };
            callParticipantMap[participant.peer.userid || '0'] = participant.connectionid || 0;
        });
        const mediaState = this.getStreamState();
        this.callInfo[data.callid || '0'] = {
            acceptedParticipants: [],
            mediaSettings: mediaState ? mediaState : {audio: true, video: true},
            participantMap: callParticipantMap,
            participants: callParticipants,
            request: data,
        };
    }

    private isInitiator(callId: string, userId: string) {
        const info = this.getCallInfo(callId);
        if (!info) {
            return false;
        }
        const connId = info.participantMap[userId];
        if (connId === undefined) {
            return false;
        }
        const participant = info.participants[connId];
        if (!participant) {
            return false;
        }
        return participant.initiator || false;
    }

    private initConnections(peer: InputPeer, id: string, initiator: boolean, sdp?: RTCSessionDescriptionInit) {
        const userConnId = this.getConnId(id, currentUserId) || 0;
        const callInfo = this.getCallInfo(id);
        if (!callInfo) {
            return Promise.reject('invalid call id');
        }
        const promises: any[] = [];
        Object.values(callInfo.participants).forEach((participant) => {
            // Initialize connections only for greater connId,
            // full mesh initialization will take place here
            if (userConnId > (participant.connectionid || 0)) {
                promises.push(this.initConnection(true, participant.connectionid || 0, sdp).then((res) => {
                    const rc = this.convertPhoneParticipant({
                        ...callInfo.participants[participant.connectionid || 0],
                        sdp: res.sdp || '',
                        type: res.type || 'answer',
                    });
                    return this.apiManager.callAccept(peer, id || '0', [rc]);
                }));
            } else if (userConnId < (participant.connectionid || 0)) {
                const innerPromises: any[] = [];
                innerPromises.push(this.initConnection(false, participant.connectionid || 0).then((res) => {
                    return {
                        ...callInfo.participants[participant.connectionid || 0],
                        sdp: res.sdp || '',
                        type: res.type || 'offer'
                    };
                }));
                if (innerPromises.length > 0) {
                    promises.push(Promise.all(innerPromises).then((res) => {
                        return res.map((item: PhoneParticipantSDP.AsObject) => {
                            return this.convertPhoneParticipant(item);
                        });
                    }).then((phoneParticipants) => {
                        phoneParticipants.forEach((participant) => {
                            const connId = participant.getConnectionid() || 0;
                            if (this.peerConnections.hasOwnProperty(connId)) {
                                // Retry mechanism
                                this.peerConnections[connId].interval = setInterval(() => {
                                    if (this.activeCallId && this.peerConnections.hasOwnProperty(connId)) {
                                        this.callUser(peer, initiator, phoneParticipants, this.activeCallId);
                                        this.peerConnections[connId].try++;
                                        if (this.peerConnections[connId].try >= C_RETRY_LIMIT) {
                                            clearInterval(this.peerConnections[connId].interval);
                                            this.checkCallTimout();
                                        }
                                    }
                                }, C_RETRY_INTERVAL);
                            }
                        });
                        return this.callUser(peer, initiator, phoneParticipants);
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
            this.sendIceCandidate(this.activeCallId || '0', e.candidate, connId).catch((err) => {
                window.console.log('icecandidate', err);
            });
        });

        pc.addEventListener('iceconnectionstatechange', (e) => {
            window.console.log('iceconnectionstatechange', pc.iceConnectionState, pc.connectionState);
        });

        pc.addEventListener('icecandidateerror', (e) => {
            window.console.log('icecandidateerror', e);
        });

        const conn: IConnection = {
            accepted: remote,
            connection: pc,
            iceQueue: [],
            interval: null,
            streams: [],
            try: 0,
        };

        pc.addEventListener('track', (e) => {
            if (e.streams.length > 0) {
                conn.streams = [];
                conn.streams.push(...e.streams);
                this.callHandlers(C_CALL_EVENT.StreamUpdate, {connId, streams: e.streams});
            }
        });

        stream.getTracks().forEach((track) => {
            if (stream) {
                pc.addTrack(track, stream);
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
        const info = this.getCallInfo(id);
        if (!info) {
            return null;
        }

        const inputUsers: InputUser[] = [];
        Object.values(info.participants).forEach((participant) => {
            const inputUser = new InputUser();
            inputUser.setAccesshash(participant.peer.accesshash || '0');
            inputUser.setUserid(participant.peer.userid || '0');
            inputUsers.push(inputUser);
        });
        return inputUsers;
    }

    private getCallInfo(callId: string) {
        if (!this.callInfo.hasOwnProperty(callId)) {
            return undefined;
        }
        return this.callInfo[callId];
    }

    private getConnId(callId: string | undefined, userId: string | undefined) {
        const info = this.getCallInfo(callId || '0');
        if (!info) {
            return null;
        }

        return info.participantMap[userId || '0'];
    }

    private getInputUserByConnId(callId: string, connId: number) {
        const info = this.getCallInfo(callId);
        if (!info) {
            return null;
        }

        const participant = info.participants[connId];
        if (!participant) {
            return null;
        }

        const inputUser = new InputUser();
        inputUser.setUserid(participant.peer.userid || '0');
        inputUser.setAccesshash(participant.peer.accesshash || '0');
        return inputUser;
    }

    private swapTempInfo(callId: string) {
        const info = this.getCallInfo('temp');
        if (!info) {
            return;
        }
        this.callInfo[callId] = info;
        delete this.callInfo.temp;
    }

    private sendIceCandidate(callId: string, candidate: RTCIceCandidate | null, connId: number) {
        if (!candidate) {
            return Promise.reject('invalid candidate');
        }

        const conn = this.peerConnections[connId];
        if (!conn) {
            return Promise.reject('invalid connection');
        }

        if (!conn.accepted) {
            conn.iceQueue.push(candidate);
            return Promise.resolve();
        }

        const peer = this.peer;
        if (!peer || !this.activeCallId) {
            return Promise.reject('invalid input');
        }

        const inputUser = this.getInputUserByConnId(callId, connId);
        if (!inputUser) {
            return Promise.reject('invalid connId');
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

        return this.apiManager.callUpdate(peer, this.activeCallId, [inputUser], PhoneCallAction.PHONECALLICEEXCHANGE, actionData.serializeBinary()).then(() => {
            return Promise.resolve();
        });
    }

    private flushIceCandidates(callId: string, connId: number) {
        const conn = this.peerConnections[connId];
        if (!conn) {
            return;
        }
        while (true) {
            const candidate = conn.iceQueue.shift();
            if (candidate) {
                this.sendIceCandidate(callId, candidate, connId);
            } else {
                return;
            }
        }
    }

    private propagateMediaSettings({video, audio}: { video?: boolean, audio?: boolean }) {
        if (!this.activeCallId || !this.peer || !this.callInfo.hasOwnProperty(this.activeCallId)) {
            return;
        }

        const inputUsers = this.getInputUsers(this.activeCallId);
        if (!inputUsers) {
            return;
        }

        if (audio !== undefined) {
            this.callInfo[this.activeCallId].mediaSettings.audio = audio;
        }

        if (video !== undefined) {
            this.callInfo[this.activeCallId].mediaSettings.video = video;
        }

        const actionData = new PhoneMediaSettingsUpdated();
        actionData.setAudio(this.callInfo[this.activeCallId].mediaSettings.audio);
        actionData.setVideo(this.callInfo[this.activeCallId].mediaSettings.video);
        this.apiManager.callUpdate(this.peer, this.activeCallId, inputUsers, PhoneCallAction.PHONECALLMEDIASETTINGSCHANGED, actionData.serializeBinary());
    }

    private mediaSettingsUpdated(data: IUpdatePhoneCall) {
        const mediaSettings = data.data as PhoneMediaSettingsUpdated.AsObject;
        const connId = this.getConnId(data.callid, data.userid);
        const callId = data.callid || '0';
        if (connId === null || !this.callInfo.hasOwnProperty(callId) || !this.callInfo[callId].participants.hasOwnProperty(connId)) {
            return;
        }
        this.callInfo[callId].participants[connId].mediaSettings.audio = mediaSettings.audio || false;
        this.callInfo[callId].participants[connId].mediaSettings.video = mediaSettings.video || false;
        this.callHandlers(C_CALL_EVENT.MediaSettingsUpdate, this.callInfo[callId].participants[connId]);
    }

    private mediaSettingsInit({video, audio}: { video?: boolean, audio?: boolean }) {
        const callId = this.activeCallId;
        if (!callId) {
            return;
        }
        const connId = this.getConnId(callId, currentUserId);
        if (connId === null || !this.callInfo.hasOwnProperty(callId) || !this.callInfo[callId].participants.hasOwnProperty(connId)) {
            return;
        }
        this.callInfo[callId].participants[connId].mediaSettings.audio = audio || false;
        this.callInfo[callId].participants[connId].mediaSettings.video = video || false;
        this.callHandlers(C_CALL_EVENT.MediaSettingsUpdate, this.callInfo[callId].participants[connId]);
    }

    private modifyMediaStream(video: boolean) {
        this.destroy();
        this.initStream({audio: true, video}).then((stream) => {
            if (this.activeCallId) {
                for (const [connId, pc] of Object.entries(this.peerConnections)) {
                    pc.connection.getSenders().forEach((track) => {
                        pc.connection.removeTrack(track);
                    });
                    stream.getTracks().forEach((track) => {
                        pc.connection.addTrack(track, stream);
                    });
                    pc.connection.createOffer(this.offerOptions).then((res) => {
                        return pc.connection.setLocalDescription(res).then(() => {
                            return this.sendSDPOffer(this.parseNumberValue(connId), res);
                        });
                    });
                }
            }
            this.propagateMediaSettings({video});
        });
    }

    private sdpOfferUpdated(data: IUpdatePhoneCall) {
        const sdpOfferData = data.data as PhoneSDPOffer.AsObject;
        const connId = this.getConnId(data.callid, data.userid);
        const callId = data.callid || '0';
        if (connId === null || !this.callInfo.hasOwnProperty(callId) || !this.callInfo[callId].participants.hasOwnProperty(connId) || !this.peerConnections.hasOwnProperty(connId)) {
            return;
        }

        const pc = this.peerConnections[connId].connection;
        pc.setRemoteDescription({
            sdp: sdpOfferData.sdp,
            type: sdpOfferData.type as any,
        }).then(() => {
            return pc.createAnswer(this.offerOptions).then((res) => {
                return pc.setLocalDescription(res).then(() => {
                    return this.sendSDPAnswer(connId, res);
                });
            });
        });
    }

    private sdpAnswerUpdated(data: IUpdatePhoneCall) {
        const sdpAnswerData = data.data as PhoneSDPAnswer.AsObject;
        const connId = this.getConnId(data.callid, data.userid);
        const callId = data.callid || '0';
        if (connId === null || !this.callInfo.hasOwnProperty(callId) || !this.callInfo[callId].participants.hasOwnProperty(connId) || !this.peerConnections.hasOwnProperty(connId)) {
            return;
        }

        const pc = this.peerConnections[connId].connection;
        pc.setRemoteDescription({
            sdp: sdpAnswerData.sdp,
            type: sdpAnswerData.type as any,
        });
    }

    private sendSDPOffer(connId: number, sdp: RTCSessionDescriptionInit) {
        const callId = this.activeCallId;
        if (!callId) {
            return Promise.reject('no active call');
        }

        const conn = this.peerConnections[connId];
        if (!conn) {
            return Promise.reject('invalid connection');
        }

        const peer = this.peer;
        if (!peer || !this.activeCallId) {
            return Promise.reject('invalid input');
        }

        const inputUser = this.getInputUserByConnId(callId, connId);
        if (!inputUser) {
            return Promise.reject('invalid connId');
        }

        const actionData = new PhoneSDPOffer();
        actionData.setSdp(sdp.sdp);
        actionData.setType(sdp.type);

        return this.apiManager.callUpdate(peer, this.activeCallId, [inputUser], PhoneCallAction.PHONECALLSDPOFFER, actionData.serializeBinary()).then(() => {
            return Promise.resolve();
        });
    }

    private sendSDPAnswer(connId: number, sdp: RTCSessionDescriptionInit) {
        const callId = this.activeCallId;
        if (!callId) {
            return Promise.reject('no active call');
        }

        const conn = this.peerConnections[connId];
        if (!conn) {
            return Promise.reject('invalid connection');
        }

        const peer = this.peer;
        if (!peer || !this.activeCallId) {
            return Promise.reject('invalid input');
        }

        const inputUser = this.getInputUserByConnId(callId, connId);
        if (!inputUser) {
            return Promise.reject('invalid connId');
        }

        const actionData = new PhoneSDPAnswer();
        actionData.setSdp(sdp.sdp);
        actionData.setType(sdp.type);

        return this.apiManager.callUpdate(peer, this.activeCallId, [inputUser], PhoneCallAction.PHONECALLSDPANSWER, actionData.serializeBinary()).then(() => {
            return Promise.resolve();
        });
    }

    private clearRetryInterval(connId: number) {
        if (!this.peerConnections.hasOwnProperty(connId)) {
            return;
        }
        clearInterval(this.peerConnections[connId].interval);
        if (this.activeCallId && this.callInfo.hasOwnProperty(connId)) {
            this.callInfo[this.activeCallId].acceptedParticipants.push(connId);
        }
    }

    private parseNumberValue(val: number | string) {
        if (typeof val === 'string') {
            return parseInt(val);
        }
        return val;
    }

    private checkCallTimout() {
        if (!this.activeCallId || !this.callInfo.hasOwnProperty(this.activeCallId)) {
            return;
        }

        if (this.callInfo[this.activeCallId].acceptedParticipants.length === 0) {
            this.reject(this.activeCallId, 0, DiscardReason.DISCARDREASONHANGUP);
            this.callHandlers(C_CALL_EVENT.CallTimeout, {});
        }
    }

    private callHandlers(name: number, data: any) {
        if (!this.listeners.hasOwnProperty(name)) {
            return Promise.resolve();
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
