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
    PhoneActionAck,
    PhoneActionCallEmpty,
    PhoneActionCallWaiting,
    PhoneActionDiscarded,
    PhoneActionIceExchange, PhoneActionMediaSettingsUpdated, PhoneActionParticipantAdded, PhoneActionParticipantRemoved,
    PhoneActionRequested, PhoneActionSDPAnswer, PhoneActionSDPOffer,
    PhoneCallAction,
    PhoneParticipant,
    PhoneParticipantSDP,
} from "../sdk/messages/chat.phone_pb";
import {InputPeer, InputUser, PeerType} from "../sdk/messages/core.types_pb";
import UniqueId from "../uniqueId";
import APIManager, {currentUserId} from "../sdk";
import {findIndex, orderBy, difference} from "lodash";

const C_RETRY_INTERVAL = 5000;
const C_RETRY_LIMIT = 2;

export const C_CALL_EVENT = {
    CallAccepted: 0x02,
    CallAck: 0x08,
    CallCancelled: 0x0e,
    CallPreview: 0x0d,
    CallRejected: 0x04,
    CallRequested: 0x01,
    CallTimeout: 0x07,
    LocalStreamUpdated: 0x06,
    MediaSettingsUpdated: 0x05,
    ParticipantAdded: 0x0b,
    ParticipantJoined: 0x09,
    ParticipantLeft: 0x0a,
    ParticipantRemoved: 0x0c,
    StreamUpdated: 0x03,
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
    started?: boolean;
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
    acceptedParticipantIds: string[]
    acceptedParticipants: number[];
    dialed: boolean;
    mediaSettings: IMediaSettings;
    participantMap: { [key: string]: number };
    participants: { [key: number]: ICallParticipant };
    requestParticipantIds: string[];
    requests: IUpdatePhoneCall[];
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
            return PhoneActionMediaSettingsUpdated.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLSDPOFFER:
            return PhoneActionSDPOffer.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLSDPANSWER:
            return PhoneActionSDPAnswer.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLPARTICIPANTADDED:
            return PhoneActionParticipantAdded.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLPARTICIPANTREMOVED:
            return PhoneActionParticipantRemoved.deserializeBinary(data).toObject();
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
    private enqueueSnackbarFn: any = undefined;

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

    public setEnqueueSnackbarFn(fn: any) {
        this.enqueueSnackbarFn = fn;
    }

    public enqueueSnackbar(message: any) {
        if (this.enqueueSnackbarFn) {
            this.enqueueSnackbarFn(message);
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
            this.callHandlers(C_CALL_EVENT.LocalStreamUpdated, stream);
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

    public callStart(peer: InputPeer, participants: InputUser.AsObject[], join: boolean) {
        this.peer = peer;

        return this.apiManager.callInit(peer).then((res) => {
            this.configs.iceServers = res.iceserversList.map((item) => ({
                credential: item.credential,
                urls: item.urlsList,
                username: item.username,
            }));
            if (join) {
                return this.apiManager.callJoin(peer, this.activeCallId).then((res) => {
                    this.initParticipants(this.activeCallId, res.participantsList, true);
                    return this.initConnections(peer, this.activeCallId, false).then(() => {
                        return this.activeCallId || '0';
                    });
                });
            } else {
                this.activeCallId = undefined;
                this.initCallParticipants('temp', participants);
                return this.initConnections(peer, 'temp', true).then(() => {
                    this.swapTempInfo(this.activeCallId || '0');
                    return this.activeCallId || '0';
                });
            }
        });
    }

    public joinCall(peer: InputPeer, callId: string) {
        if (this.activeCallId) {
            return;
        }
        this.activeCallId = callId;
        this.callHandlers(C_CALL_EVENT.CallPreview, {callId, peer});
    }

    public callAccept(id: string, video: boolean) {
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

            if (info.requests.length === 0) {
                return Promise.reject('no call request');
            }

            const initFn = () => {
                const promises: any[] = [];
                do {
                    const request = info.requests.shift();
                    if (request) {
                        promises.push(this.initConnections(peer, id, false, request).then(() => {
                            const streamState = this.getStreamState();
                            this.mediaSettingsInit(streamState);
                            this.propagateMediaSettings(streamState);
                            return Promise.resolve();
                        }));
                    } else {
                        break;
                    }
                } while (info.requests.length > 0);
                return Promise.all(promises);
            };

            if (!info.dialed) {
                return this.initStream({audio: true, video}).then(() => {
                    return initFn();
                });
            } else {
                return initFn();
            }
        });
    }

    public callReject(id: string, duration: number, reason: DiscardReason) {
        const peer = this.peer;
        if (!peer) {
            return Promise.reject('invalid peer');
        }

        return this.apiManager.callReject(peer, id, reason, duration).then(() => {
            this.destroyConnections(id);
        });
    }

    private callRemoveParticipant(callId: string, userIds: string[], timeout: boolean) {
        const peer = this.peer;
        if (!peer) {
            return Promise.reject('invalid peer');
        }

        const inputUsers = this.getInputUserByUserIds(callId, userIds);
        if (inputUsers === null) {
            return Promise.reject('invalid callId');
        }

        return this.apiManager.callRemoveParticipant(peer, callId, inputUsers, timeout).then(() => {
            return Promise.resolve();
        });
    }

    public getParticipantList(callId: string, excludeCurrent?: boolean): ICallParticipant[] {
        if (!this.callInfo.hasOwnProperty(callId)) {
            return [];
        }
        const list: ICallParticipant[] = [];
        Object.values(this.callInfo[callId].participants).forEach((participant) => {
            if (!excludeCurrent || participant.peer.userid !== currentUserId) {
                if (this.peerConnections.hasOwnProperty(participant.connectionid) && this.peerConnections[participant.connectionid].streams.length > 0) {
                    participant.started = true;
                }
                list.push(participant);
            }
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

        return this.apiManager.callReject(peer, data.callid || '0', DiscardReason.DISCARDREASONHANGUP, 0).then(() => {
            //
        });
    }

    private callUser(peer: InputPeer, initiator: boolean, phoneParticipants: PhoneParticipantSDP[], callId?: string) {
        const randomId = UniqueId.getRandomId();
        return this.apiManager.callRequest(peer, randomId, initiator, phoneParticipants, callId).then((res) => {
            if (!callId) {
                this.activeCallId = res.id || '0';
            }
            return res;
        });
    }

    private callUserSingle(peer: InputPeer, phoneParticipant: PhoneParticipantSDP, callId: string) {
        const randomId = UniqueId.getRandomId();
        return this.apiManager.callRequest(peer, randomId, false, [phoneParticipant], callId, true).then((res) => {
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
            case PhoneCallAction.PHONECALLACK:
                this.callAcknowledged(data);
                break;
            case PhoneCallAction.PHONECALLPARTICIPANTADDED:
                this.participantAdded(data);
                break;
            case PhoneCallAction.PHONECALLPARTICIPANTREMOVED:
                this.participantRemoved(data);
                break;
        }
    }

    private callRequested(data: IUpdatePhoneCall) {
        if (this.activeCallId && data.callid !== this.activeCallId) {
            this.busyHandler(data);
            return;
        }

        // Send ack update so callee ringing indicator activates
        this.sendCallAck(data);
        if (!this.callInfo.hasOwnProperty(data.callid || 0)) {
            this.initCallRequest(data);
            const inputPeer = new InputPeer();
            inputPeer.setId(data.peerid || '0');
            inputPeer.setAccesshash(data.peertype === PeerType.PEERGROUP ? '0' : (data.accesshash || '0'));
            inputPeer.setType(data.peertype || PeerType.PEERUSER);
            this.peer = inputPeer;
            this.callHandlers(C_CALL_EVENT.CallRequested, data);
        } else {
            this.initCallRequest(data);

            // Accept other participants in group
            if (this.shouldAccept(data)) {
                this.callAccept(this.activeCallId, this.getStreamState().video);
            }
        }
    }

    private shouldAccept(data: IUpdatePhoneCall) {
        if (this.activeCallId !== data.callid) {
            return false;
        }

        if (!this.peer || this.peer.getType() === PeerType.PEERUSER) {
            return false;
        }

        if (!this.callInfo.hasOwnProperty(this.activeCallId)) {
            return false;
        }

        if (this.callInfo[this.activeCallId].acceptedParticipantIds.indexOf(data.userid) > -1) {
            return false;
        }

        this.callInfo[this.activeCallId].acceptedParticipantIds.push(data.userid);

        return true;
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
        window.console.log('[webrtc] accept signal, connId:', connId);

        this.callHandlers(C_CALL_EVENT.CallAccepted, {connId, data});
    }

    private callRejected(data: IUpdatePhoneCall) {
        const connId = this.getConnId(data.callid, data.userid);
        if (connId !== null) {
            this.clearRetryInterval(connId);
        }
        const actionData = (data.data as PhoneActionDiscarded.AsObject);
        if (data.peertype === PeerType.PEERUSER || actionData.terminate) {
            this.callHandlers(C_CALL_EVENT.CallRejected, data);
        } else {
            if (this.removeParticipant(data.userid)) {
                this.callHandlers(C_CALL_EVENT.CallRejected, data);
            } else {
                this.callHandlers(C_CALL_EVENT.ParticipantLeft, data);
            }
        }
    }

    private removeParticipant(userId: string) {
        if (!this.activeCallId) {
            return false;
        }
        if (!this.callInfo[this.activeCallId]) {
            return false;
        }
        const connId = this.callInfo[this.activeCallId].participantMap[userId];
        if (this.peerConnections.hasOwnProperty(connId)) {
            this.peerConnections[connId].connection.close();
        }
        let index = this.callInfo[this.activeCallId].acceptedParticipantIds.indexOf(userId);
        if (index > -1) {
            this.callInfo[this.activeCallId].acceptedParticipantIds.splice(index, 1);
        }
        index = this.callInfo[this.activeCallId].requestParticipantIds.indexOf(userId);
        if (index > -1) {
            this.callInfo[this.activeCallId].requestParticipantIds.splice(index, 1);
        }
        index = findIndex(this.callInfo[this.activeCallId].requests, {userid: userId});
        if (index > -1) {
            this.callInfo[this.activeCallId].requests.splice(index, 1);
        }
        delete this.callInfo[this.activeCallId].participants[connId];
        delete this.callInfo[this.activeCallId].participantMap[userId];
        return Object.keys(this.callInfo[this.activeCallId].participants).length <= 1;
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
            acceptedParticipantIds: [],
            acceptedParticipants: [],
            dialed: false,
            mediaSettings: mediaState ? mediaState : {audio: true, video: true},
            participantMap: callParticipantMap,
            participants: callParticipants,
            requestParticipantIds: [],
            requests: [],
        };
    }

    private initParticipants(callId: string, participants: PhoneParticipant.AsObject[], bootstrap?: boolean) {
        const fn = (callParticipants: { [key: number]: ICallParticipant }, callParticipantMap: { [key: string]: number }) => {
            participants.forEach((participant) => {
                callParticipants[participant.connectionid] = {
                    admin: participant.admin,
                    connectionid: participant.connectionid,
                    initiator: participant.initiator,
                    mediaSettings: {audio: true, video: true},
                    peer: participant.peer,
                };
                callParticipantMap[participant.peer.userid || '0'] = participant.connectionid;
            });
            return {participantMap: callParticipantMap, participants: callParticipants};
        };
        if (!this.callInfo.hasOwnProperty(callId)) {
            if (bootstrap) {
                const res = fn({}, {});
                const mediaState = this.getStreamState();
                this.callInfo[callId] = {
                    acceptedParticipantIds: [],
                    acceptedParticipants: [],
                    dialed: false,
                    mediaSettings: mediaState ? mediaState : {audio: true, video: true},
                    participantMap: res.participantMap,
                    participants: res.participants,
                    requestParticipantIds: [],
                    requests: [],
                };
            }
        } else {
            const res = fn(this.callInfo[callId].participants, this.callInfo[callId].participantMap);
            this.callInfo[callId].participantMap = res.participantMap;
            this.callInfo[callId].participants = res.participants;
        }
    }

    private initCallRequest(data: IUpdatePhoneCall) {
        if (this.callInfo.hasOwnProperty(data.callid || '0')) {
            const requestParticipantIds = this.callInfo[data.callid || '0'].requestParticipantIds;
            if (requestParticipantIds.indexOf(data.userid) === -1) {
                this.callInfo[data.callid || '0'].requests.push(data);
                this.callInfo[data.callid || '0'].requestParticipantIds.push(data.userid);
                window.console.log('[webrtc] request from:', data.userid);
            }
            return;
        }
        window.console.log('[webrtc] request from:', data.userid);
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
            acceptedParticipantIds: [],
            acceptedParticipants: [],
            dialed: false,
            mediaSettings: mediaState ? mediaState : {audio: true, video: true},
            participantMap: callParticipantMap,
            participants: callParticipants,
            requestParticipantIds: [data.userid],
            requests: [data],
        };

        window.console.log('[webrtc] assigned, connId:', this.getConnId(data.callid, currentUserId));
    }

    // @ts-ignore
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

    private initConnections(peer: InputPeer, id: string, initiator: boolean, request?: IUpdatePhoneCall): Promise<any> {
        const currentUserConnId = this.getConnId(id, currentUserId) || 0;
        const callInfo = this.getCallInfo(id);
        if (!callInfo) {
            return Promise.reject('invalid call id');
        }

        const callPromises: any[] = [];
        const acceptPromises: any[] = [];
        let sdp: RTCSessionDescriptionInit | undefined;
        let requestConnId: number = -1024;

        const initAnswerConnection = (connId: number) => {
            return this.initConnection(true, connId, sdp).then((res) => {
                const rc = this.convertPhoneParticipant({
                    ...callInfo.participants[connId],
                    sdp: res.sdp || '',
                    type: res.type || 'answer',
                });
                window.console.log('[webrtc] answer, from:', currentUserId, ' to:', rc.getPeer().getUserid());
                return this.apiManager.callAccept(peer, id || '0', [rc]);
            });
        };

        if (request) {
            const sdpData = (request.data as PhoneActionRequested.AsObject);
            sdp = {
                sdp: sdpData.sdp,
                type: sdpData.type as any,
            };
            requestConnId = this.getConnId(id, request.userid);
            if (callInfo.dialed) {
                return initAnswerConnection(requestConnId);
            }
        }

        const shouldCall = !callInfo.dialed;
        if (shouldCall) {
            this.setCallInfoDialed(id);
        }

        Object.values(callInfo.participants).forEach((participant) => {
            // Initialize connections only for greater connId,
            // full mesh initialization will take place here
            if (requestConnId === participant.connectionid) {
                acceptPromises.push(initAnswerConnection(requestConnId));
            } else if (shouldCall && currentUserConnId < participant.connectionid) {
                callPromises.push(this.initConnection(false, participant.connectionid).then((res) => {
                    return {
                        ...callInfo.participants[participant.connectionid],
                        sdp: res.sdp || '',
                        type: res.type || 'offer'
                    };
                }));
            }
        });
        if (callPromises.length > 0) {
            acceptPromises.push(Promise.all(callPromises).then((res) => {
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
                                this.peerConnections[connId].try++;
                                this.callUserSingle(peer, participant, this.activeCallId).finally(() => {
                                    if (this.peerConnections.hasOwnProperty(connId) && this.peerConnections[connId].try >= C_RETRY_LIMIT) {
                                        clearInterval(this.peerConnections[connId].interval);
                                        if (initiator) {
                                            this.checkCallTimout(connId);
                                        }
                                    }
                                });
                            }
                        }, C_RETRY_INTERVAL);
                    }
                });
                window.console.log('[webrtc] call form:', currentUserId, ' to:', phoneParticipants.map(o => o.getPeer().getUserid()).join(", "));
                return this.callUser(peer, initiator, phoneParticipants, this.activeCallId);
            }));
        }
        if (acceptPromises.length > 0) {
            return Promise.all(acceptPromises);
        } else {
            return Promise.resolve([]);
        }
    }

    private initConnection(remote: boolean, connId: number, sdp?: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
        window.console.log('[webrtc] init connection, connId:', connId);

        const stream = this.localStream;
        if (!stream) {
            return Promise.reject('no available stream');
        }

        return new Promise((resolve, reject) => {
            try {
                const pc = new RTCPeerConnection(this.configs);
                pc.addEventListener('icecandidate', (e) => {
                    this.sendIceCandidate(this.activeCallId || '0', e.candidate, connId).catch((err) => {
                        window.console.log('[webrtc] icecandidate, connId:', connId, err);
                    });
                });

                pc.addEventListener('iceconnectionstatechange', () => {
                    window.console.log('[webrtc] iceconnectionstatechange, connId:', connId, pc.iceConnectionState, pc.connectionState);
                });

                pc.addEventListener('icecandidateerror', (e) => {
                    window.console.log('[webrtc] icecandidateerror, connId:', connId, e);
                });

                pc.addEventListener('signalingstatechange', () => {
                    if (pc.signalingState === 'closed') {
                        window.console.log('[webrtc] signalingstatechange, connId:', connId, pc.signalingState);
                    }
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
                        window.console.log('[webrtc] stream, connId:', connId, ' streams', e.streams.map((o) => `${o.getVideoTracks().length > 0 ? 'video' : ' '} ${o.getAudioTracks().length > 0 ? 'audio' : ''}`).join(', '));
                        this.callHandlers(C_CALL_EVENT.StreamUpdated, {connId, streams: e.streams});
                    }
                });

                stream.getTracks().forEach((track) => {
                    if (stream) {
                        pc.addTrack(track, stream);
                    }
                });

                this.peerConnections[connId] = conn;
                if (remote) {
                    if (sdp) {
                        pc.setRemoteDescription(sdp).then(() => {
                            return pc.createAnswer(this.offerOptions).then((res) => {
                                return pc.setLocalDescription(res).then(() => {
                                    return res;
                                });
                            });
                        }).then(resolve).catch(reject);
                    } else {
                        reject('no sdp');
                    }
                } else {
                    pc.createOffer(this.offerOptions).then((res) => {
                        return pc.setLocalDescription(res).then(() => {
                            return res;
                        });
                    }).then(resolve).catch(reject);
                }
            } catch (e) {
                reject(e);
            }
        });
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

    private getInputUserByUserIds(callId: string, userIds: string[]) {
        const info = this.getCallInfo(callId);
        if (!info) {
            return null;
        }

        const inputUsers: InputUser[] = [];
        userIds.forEach((userId) => {
            if (info.participantMap.hasOwnProperty(userId)) {
                const connId = info.participantMap[userId];
                if (info.participants.hasOwnProperty(connId)) {
                    const peer = info.participants[connId].peer;
                    const inputUser = new InputUser();
                    inputUser.setUserid(peer.userid || '0');
                    inputUser.setAccesshash(peer.accesshash || '0');
                    inputUsers.push(inputUser);
                }
            }
        });

        return inputUsers;
    }

    private swapTempInfo(callId: string) {
        const info = this.getCallInfo('temp');
        if (!info) {
            return;
        }
        this.callInfo[callId] = info;
        delete this.callInfo.temp;
    }

    private setCallInfoDialed(callId: string) {
        if (!this.callInfo.hasOwnProperty(callId)) {
            return;
        }
        this.callInfo[callId].dialed = true;
    }

    private sendIceCandidate(callId: string, candidate: RTCIceCandidate | null, connId: number) {
        if (!candidate) {
            return Promise.resolve();
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
        if (!peer) {
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

        return this.apiManager.callUpdate(peer, callId, [inputUser], PhoneCallAction.PHONECALLICEEXCHANGE, actionData.serializeBinary()).then(() => {
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
                break;
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

        const actionData = new PhoneActionMediaSettingsUpdated();
        actionData.setAudio(this.callInfo[this.activeCallId].mediaSettings.audio);
        actionData.setVideo(this.callInfo[this.activeCallId].mediaSettings.video);
        this.apiManager.callUpdate(this.peer, this.activeCallId, inputUsers, PhoneCallAction.PHONECALLMEDIASETTINGSCHANGED, actionData.serializeBinary());
    }

    private mediaSettingsUpdated(data: IUpdatePhoneCall) {
        const mediaSettings = data.data as PhoneActionMediaSettingsUpdated.AsObject;
        const connId = this.getConnId(data.callid, data.userid);
        const callId = data.callid || '0';
        if (connId === null || !this.callInfo.hasOwnProperty(callId) || !this.callInfo[callId].participants.hasOwnProperty(connId)) {
            return;
        }
        this.callInfo[callId].participants[connId].mediaSettings.audio = mediaSettings.audio || false;
        this.callInfo[callId].participants[connId].mediaSettings.video = mediaSettings.video || false;
        this.callHandlers(C_CALL_EVENT.MediaSettingsUpdated, this.callInfo[callId].participants[connId]);
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
        this.callHandlers(C_CALL_EVENT.MediaSettingsUpdated, this.callInfo[callId].participants[connId]);
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
        const sdpOfferData = data.data as PhoneActionSDPOffer.AsObject;
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
        const sdpAnswerData = data.data as PhoneActionSDPAnswer.AsObject;
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

    private callAcknowledged(data: IUpdatePhoneCall) {
        const connId = this.getConnId(data.callid, data.userid);
        if (connId === null) {
            return;
        }
        this.clearRetryInterval(connId, true);
        this.callHandlers(C_CALL_EVENT.CallAck, connId);
    }

    private participantAdded(data: IUpdatePhoneCall) {
        if (this.activeCallId !== data.callid) {
            return;
        }
        const phoneActionParticipantAdded = data.data as PhoneActionParticipantAdded.AsObject;
        this.initParticipants(this.activeCallId, phoneActionParticipantAdded.participantsList);
        if (phoneActionParticipantAdded.participantsList.some(o => o.peer.userid !== currentUserId)) {
            this.callHandlers(C_CALL_EVENT.ParticipantJoined, {userIds: phoneActionParticipantAdded.participantsList.map(o => o.peer.userid)});
        }
    }

    private participantRemoved(data: IUpdatePhoneCall) {
        this.callHandlers(C_CALL_EVENT.CallCancelled, {callId: data.callid});

        if (this.activeCallId !== data.callid) {
            return;
        }

        const kickActionData = data.data as PhoneActionParticipantRemoved.AsObject;
        kickActionData.useridsList.forEach((userId) => {
            this.removeParticipant(userId);
        });
        this.callHandlers(C_CALL_EVENT.ParticipantRemoved, {
            timeout: kickActionData.timeout,
            userIds: kickActionData.useridsList
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

        const actionData = new PhoneActionSDPOffer();
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

        const actionData = new PhoneActionSDPAnswer();
        actionData.setSdp(sdp.sdp);
        actionData.setType(sdp.type);

        return this.apiManager.callUpdate(peer, this.activeCallId, [inputUser], PhoneCallAction.PHONECALLSDPANSWER, actionData.serializeBinary()).then(() => {
            return Promise.resolve();
        });
    }

    private sendCallAck(data: IUpdatePhoneCall) {
        const peer = new InputPeer();
        peer.setType(data.peertype);
        peer.setId(data.peerid);
        if (data.peertype === PeerType.PEERGROUP) {
            peer.setAccesshash('0');
        } else if (data.peertype === PeerType.PEERUSER) {
            peer.setAccesshash(data.accesshash);
        }

        const inputUser = new InputUser();
        inputUser.setUserid(data.userid);
        inputUser.setAccesshash(data.accesshash);

        const actionData = new PhoneActionAck();

        return this.apiManager.callUpdate(peer, data.callid, [inputUser], PhoneCallAction.PHONECALLACK, actionData.serializeBinary());
    }

    private clearRetryInterval(connId: number, onlyClearInterval?: boolean) {
        if (!this.peerConnections.hasOwnProperty(connId)) {
            return;
        }
        clearInterval(this.peerConnections[connId].interval);
        if (onlyClearInterval !== true && this.activeCallId && this.callInfo.hasOwnProperty(this.activeCallId)) {
            this.callInfo[this.activeCallId].acceptedParticipants.push(connId);
        }
    }

    private parseNumberValue(val: number | string) {
        if (typeof val === 'string') {
            return parseInt(val);
        }
        return val;
    }

    private checkCallTimout(connId: number) {
        if (!this.activeCallId || !this.callInfo.hasOwnProperty(this.activeCallId) || !this.peer) {
            return;
        }

        if (this.callInfo[this.activeCallId].acceptedParticipants.length === 0) {
            this.callReject(this.activeCallId, 0, DiscardReason.DISCARDREASONHANGUP);
            this.callHandlers(C_CALL_EVENT.CallTimeout, {});
            window.console.log('[webrtc] call timeout, connId:', connId);
        } else if (this.peer.getType() === PeerType.PEERGROUP) {
            const participants = this.callInfo[this.activeCallId].participants;
            const connIds = Object.values(participants).map(o => o.connectionid);
            const notAnsweringConnId = difference(connIds, this.callInfo[this.activeCallId].acceptedParticipants);
            if (notAnsweringConnId.length > 0) {
                const userIds: string[] = [];
                notAnsweringConnId.forEach((connId) => {
                    const participant = participants[connId];
                    if (participant && participant.peer.userid !== currentUserId) {
                        userIds.push(participant.peer.userid);
                    }
                });
                this.callRemoveParticipant(this.activeCallId, userIds, true);
                userIds.forEach((userId) => {
                    this.removeParticipant(userId);
                });
                this.callHandlers(C_CALL_EVENT.ParticipantRemoved, {timeout: true, userIds});
            }
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
