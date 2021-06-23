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
import {UpdatePhoneCall, UpdatePhoneCallEnded} from "../sdk/messages/updates_pb";
import {
    CallDeviceType,
    DiscardReason, IceServer,
    PhoneActionAccepted,
    PhoneActionAck,
    PhoneActionAdminUpdated,
    PhoneActionCallEmpty,
    PhoneActionCallWaiting,
    PhoneActionDiscarded,
    PhoneActionIceExchange,
    PhoneActionJoinRequested,
    PhoneActionMediaSettingsUpdated,
    PhoneActionParticipantAdded,
    PhoneActionParticipantRemoved, PhoneActionPicked,
    PhoneActionRequested, PhoneActionRestarted,
    PhoneActionScreenShare,
    PhoneActionSDPAnswer,
    PhoneActionSDPOffer,
    PhoneCallAction,
    PhoneParticipant,
    PhoneParticipantSDP,
} from "../sdk/messages/chat.phone_pb";
import {InputPeer, InputTeam, InputUser, PeerType} from "../sdk/messages/core.types_pb";
import UniqueId from "../uniqueId";
import APIManager, {currentAuthId, currentUserId} from "../sdk";
import {cloneDeep, difference, findIndex, orderBy} from "lodash";
import {getDefaultAudio, getDefaultVideo} from "../../components/SettingsMediaInput";

const C_RETRY_INTERVAL = 10000;
const C_RETRY_LIMIT = 6;
const C_RECONNECT_TRY = 7;
const C_RECONNECT_TIMEOUT = 10000;
const C_CHECK_STREAM_INTERVAL = 10000;

export const C_CALL_EVENT = {
    AllConnected: 0x12,
    CallAccepted: 0x02,
    CallAck: 0x08,
    CallCancelled: 0x0e,
    CallDestroyed: 0x15,
    CallJoinRequested: 0x0f,
    CallPreview: 0x0d,
    CallRejected: 0x04,
    CallRequested: 0x01,
    CallTimeout: 0x07,
    ConnectionStateChanged: 0x13,
    LocalMediaSettingsUpdated: 0x16,
    LocalStreamUpdated: 0x06,
    MediaSettingsUpdated: 0x05,
    ParticipantAdded: 0x0b,
    ParticipantAdminUpdated: 0x10,
    ParticipantJoined: 0x09,
    ParticipantLeft: 0x0a,
    ParticipantMuted: 0x14,
    ParticipantRemoved: 0x0c,
    ShareScreenStreamUpdated: 0x11,
    StreamUpdated: 0x03,
};

export interface IUpdatePhoneCall extends Partial<UpdatePhoneCall.AsObject> {
    data?: any;
}

export interface IMediaSettings {
    audio: boolean;
    screenShare: boolean;
    video: boolean;
}

export interface ICallParticipant extends PhoneParticipant.AsObject {
    deviceType: CallDeviceType;
    mediaSettings: IMediaSettings;
    muted: boolean,
    started?: boolean;
}

interface IConnection {
    accepted: boolean;
    audioIndex: number;
    connectingInterval: any;
    checkStreamInterval: any;
    checkStreamTimeout: any;
    connection: RTCPeerConnection;
    iceQueue: RTCIceCandidate[];
    iceServers?: RTCIceServer[];
    init: boolean;
    reconnecting: boolean;
    reconnectingTimeout: any;
    reconnectingTry: number;
    screenShareStream?: MediaStream;
    stream?: MediaStream;
    streamId: string;
    try: number;
    videoIndex: number;
}

interface IBroadcastItem {
    fnQueue: { [key: number]: any };
    data: any;
}

interface ICallInfo {
    acceptedParticipantIds: string[]
    acceptedParticipants: number[];
    allConnected: boolean;
    dialed: boolean;
    mediaSettings: IMediaSettings;
    participantMap: { [key: string]: number };
    participants: { [key: number]: ICallParticipant };
    requestParticipantIds: string[];
    requests: IUpdatePhoneCall[];
}

interface IScreenShare {
    connId: number;
    trackIds: string[];
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
        case PhoneCallAction.PHONECALLJOINREQUESTED:
            return PhoneActionJoinRequested.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLADMINUPDATED:
            return PhoneActionAdminUpdated.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLSCREENSHARE:
            return PhoneActionScreenShare.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLPICKED:
            return PhoneActionPicked.deserializeBinary(data).toObject();
        case PhoneCallAction.PHONECALLRESTARTED:
            return PhoneActionRestarted.deserializeBinary(data).toObject();
    }
    return undefined;
};

export interface IMediaDevice {
    screenShare: boolean;
    speaker: boolean;
    video: boolean;
    voice: boolean;
}

export const getMediaInputs = (): Promise<IMediaDevice> => {
    const out: IMediaDevice = {
        screenShare: false,
        speaker: false,
        video: false,
        voice: false,
    };
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return Promise.resolve(out);
    }

    // @ts-ignore
    out.screenShare = Boolean(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);

    return navigator.mediaDevices.enumerateDevices().then((res) => {
        res.forEach((item) => {
            if (item.kind === 'audioinput') {
                out.voice = true;
            } else if (item.kind === 'audiooutput') {
                out.speaker = true;
            } else if (item.kind === 'videoinput') {
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
    private openDialogFn: ((peer: InputPeer | null, video: boolean) => void) | null = null;
    private setTeamFn: ((teamId: string) => void) | null = null;
    private enqueueSnackbarFn: any = undefined;
    private getScreenCaptureFn?: () => Promise<MediaStream> = undefined;

    // Devices
    private mediaDevice: IMediaDevice = localStorage.getItem(C_LOCALSTORAGE.MediaDevice) ? JSON.parse(localStorage.getItem(C_LOCALSTORAGE.MediaDevice)) : {
        speaker: false,
        video: false,
        voice: false,
    };

    // Screen Share
    private activeScreenShare: IScreenShare | undefined;
    private lastVideoState: boolean = false;

    // Call variables
    private localStream: MediaStream | undefined;
    private screenShareStream: MediaStream | undefined;
    private peerConnections: { [key: number]: IConnection } = {};
    private configs: RTCConfiguration = {
        iceTransportPolicy: 'all',
    };
    private peer: InputPeer | null = null;
    private activeCallId: string | undefined;
    private callInfo: { [key: string]: ICallInfo } = {};
    private rejectedCallIds: string[] = [];
    private verboseAPI: boolean = localStorage.getItem(C_LOCALSTORAGE.DebugVerboseAPI) === 'true';

    private constructor() {
        this.initMediaDevice();

        this.updateManager = UpdateManager.getInstance();
        this.apiManager = APIManager.getInstance();

        this.updateManager.listen(C_MSG.UpdatePhoneCall, this.phoneCallHandler);
        this.updateManager.listen(C_MSG.UpdatePhoneCallEnded, this.phoneCallEndedHandler);
    }

    public setDialogOpenFunction(fn: any) {
        this.openDialogFn = fn;
    }

    public openCallDialog(peer: InputPeer | null, video: boolean) {
        if (this.openDialogFn) {
            this.openDialogFn(peer, video);
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

    public setGetScreenCapture(fn: any) {
        this.getScreenCaptureFn = fn;
    }

    public initMediaDevice() {
        getMediaInputs().then((res) => {
            this.mediaDevice = res;
            localStorage.setItem(C_LOCALSTORAGE.MediaDevice, JSON.stringify(this.mediaDevice));
        });
    }

    public getMediaDevice() {
        return this.mediaDevice;
    }

    public getActiveCallId() {
        return this.activeCallId;
    }

    public getActivePeer() {
        return this.peer;
    }

    public initStream(settings: { audio: boolean, video: boolean }): Promise<MediaStream> {
        return new Promise((resolve, reject) => {
            try {
                const constraints: MediaStreamConstraints = {
                    audio: settings.audio ? getDefaultAudio() : false,
                    video: settings.video ? getDefaultVideo() : false,
                };
                this.lastVideoState = settings.video;
                if (!this.localStream) {
                    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                        this.localStream = stream;
                        this.callHandlers(C_CALL_EVENT.LocalStreamUpdated, stream);
                        resolve(stream);
                    }).catch((err) => {
                        reject(err);
                    });
                } else {
                    if (constraints.video) {
                        if (this.localStream.getVideoTracks().length > 0) {
                            resolve(this.localStream);
                        } else {
                            navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
                                stream.getVideoTracks().forEach((track) => {
                                    this.localStream.addTrack(track);
                                });
                                resolve(this.localStream);
                            }).catch((err) => {
                                reject(err);
                            });
                        }
                    } else {
                        this.localStream.getVideoTracks().forEach((track) => {
                            track.stop();
                            this.localStream.removeTrack(track);
                        });
                        resolve(this.localStream);
                    }
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    public toggleVideo(enable: boolean) {
        if (!this.localStream) {
            return Promise.reject('no local stream');
        }
        for (const pc of Object.values(this.peerConnections)) {
            if (['failed', 'disconnected', 'closed'].indexOf(pc.connection.iceConnectionState) > -1) {
                return Promise.reject('still connecting');
            }
        }
        const localVideos = this.localStream.getVideoTracks();
        if (localVideos.length > 0) {
            localVideos.forEach((track) => {
                track.enabled = enable;
            });
            this.propagateMediaSettings({video: enable});
        }
        return this.modifyMediaStream(enable);
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

    public toggleScreenShare(enable: boolean) {
        return this.modifyScreenShareMediaStream(enable).then((stream) => {
            if (!this.activeCallId) {
                return Promise.reject('no active call id');
            }
            const connId = this.getConnId(this.activeCallId, currentUserId);
            window.console.log('[webrtc] screen share stream, connId: ', connId, ' has stream: ', Boolean(stream));
            this.callHandlers(C_CALL_EVENT.ShareScreenStreamUpdated, {
                connId,
                stream: enable ? stream : undefined,
                userId: currentUserId,
            });
            return stream;
        });
    }

    public getStreamState(): IMediaSettings {
        if (!this.localStream) {
            return {
                audio: false,
                screenShare: false,
                video: false,
            };
        }

        const videoTracks = this.localStream.getVideoTracks();
        const audioTracks = this.localStream.getAudioTracks();
        return {
            audio: audioTracks.length > 0 ? audioTracks[0].enabled : false,
            screenShare: Boolean(this.screenShareStream),
            video: videoTracks.length > 0 ? videoTracks[0].enabled : false,
        };
    }

    public destroy() {
        this.destroyLocalStream();
        this.destroyScreenShareStream();
        this.callHandlers(C_CALL_EVENT.CallDestroyed, {callId: this.activeCallId});
        this.activeCallId = undefined;
    }

    public destroyLocalStream() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                track.stop();
                this.localStream.removeTrack(track);
            });
        }
        this.localStream = undefined;
    }

    public destroyScreenShareStream() {
        if (this.screenShareStream) {
            window.console.log('[webrtc] screen share destroy, has stream: ', Boolean(this.screenShareStream));
            this.screenShareStream.getTracks().forEach(track => {
                track.stop();
                this.screenShareStream.removeTrack(track);
            });
        }
        this.screenShareStream = undefined;
    }

    public getLocalStream(): MediaStream | undefined {
        return this.localStream;
    }

    public getLocalScreamShareStream(): MediaStream | undefined {
        return this.screenShareStream;
    }

    public getRemoteStream(connId: number): MediaStream | undefined {
        if (!this.peerConnections.hasOwnProperty(connId)) {
            return undefined;
        }
        if (this.peerConnections[connId].stream) {
            return this.peerConnections[connId].stream;
        } else {
            return undefined;
        }
    }

    public tryReconnect(connId: number) {
        this.checkDisconnection(connId, 'disconnected');
    }

    public getRemoteScreenShareStream(): { stream: MediaStream, userId: string } | undefined {
        const screenShare = this.activeScreenShare;
        if (!screenShare || !this.activeCallId || !this.peerConnections.hasOwnProperty(screenShare.connId)) {
            return undefined;
        }
        if (this.peerConnections[screenShare.connId].screenShareStream) {
            const userId = this.getUserIdByCallId(this.activeCallId, screenShare.connId) || '';
            return {stream: this.peerConnections[screenShare.connId].screenShareStream, userId};
        } else {
            return undefined;
        }
    }

    public start(peer: InputPeer, participants: InputUser.AsObject[], callId?: string) {
        this.peer = peer;

        return this.apiManager.callInit(peer, callId).then((res) => {
            this.configs.iceServers = this.transformIceServers(res.iceserversList);
            if (callId) {
                this.activeCallId = callId;
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

    public join(peer: InputPeer, callId: string) {
        if (this.activeCallId) {
            return;
        }
        this.activeCallId = callId;
        this.callHandlers(C_CALL_EVENT.CallPreview, {callId, peer});
    }

    public accept(callId: string, video: boolean) {
        const peer = this.peer;
        if (!peer) {
            return Promise.reject('invalid peer');
        }
        return this.apiManager.callInit(peer, callId).then((res) => {
            this.activeCallId = callId;

            this.configs.iceServers = this.transformIceServers(res.iceserversList);
            const info = this.getCallInfo(callId);
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
                        promises.push(this.initConnections(peer, callId, false, request).then(() => {
                            const streamState = this.getStreamState();
                            this.mediaSettingsInit(streamState);
                            const connId = this.getConnId(callId, request.userid);
                            if (connId !== null) {
                                this.checkInitialization(connId);
                            }
                            this.propagateMediaSettings(streamState, 255);
                            return Promise.resolve();
                        }));
                    } else {
                        break;
                    }
                } while (info.requests.length > 0);
                return Promise.all(promises);
            };

            if (!info.dialed) {
                return this.initStream({
                    audio: true,
                    video: video,
                }).then(() => {
                    return initFn();
                });
            } else {
                return initFn();
            }
        });
    }

    public reject(callId: string, duration: number, reason: DiscardReason, targetPeer?: InputPeer) {
        const peer = targetPeer || this.peer;
        if (!peer) {
            return Promise.reject('invalid peer');
        }

        this.pushToRejectedCallIds(callId);

        this.callHandlers(C_CALL_EVENT.CallRejected, {
            callId,
            reason: DiscardReason.DISCARDREASONHANGUP,
        });

        return this.apiManager.callReject(peer, callId, reason, duration).then(() => {
            this.destroyConnections(callId);
        });
    }

    public participantByUserId(callId: string, userId: string): ICallParticipant | undefined {
        if (!this.callInfo.hasOwnProperty(callId)) {
            return undefined;
        }
        const connId = this.callInfo[callId].participantMap[userId];
        if (connId === undefined) {
            return undefined;
        }
        return this.callInfo[callId].participants[connId];
    }

    public participantByConnId(connId: number): ICallParticipant | undefined {
        if (!this.activeCallId) {
            return undefined;
        }
        if (!this.callInfo.hasOwnProperty(this.activeCallId)) {
            return undefined;
        }
        return this.callInfo[this.activeCallId].participants[connId];
    }

    public getParticipantList(callId: string, excludeCurrent?: boolean): ICallParticipant[] {
        if (!this.callInfo.hasOwnProperty(callId)) {
            return [];
        }
        const list: ICallParticipant[] = [];
        Object.values(this.callInfo[callId].participants).forEach((participant) => {
            if (!excludeCurrent || participant.peer.userid !== currentUserId) {
                if (this.peerConnections.hasOwnProperty(participant.connectionid) && this.peerConnections[participant.connectionid].stream) {
                    participant.started = true;
                }
                list.push(participant);
            }
        });
        return orderBy(list, ['connectionid'], ['asc']);
    }

    public groupAddParticipant(callId: string, participants: InputUser[]) {
        const peer = this.peer;
        if (!peer) {
            return Promise.reject('invalid peer');
        }

        return this.apiManager.callAddParticipant(this.peer, callId, participants).then((res) => {
            return res;
        });
    }

    public groupRemoveParticipant(callId: string, userIds: string[], timeout: boolean) {
        const peer = this.peer;
        if (!peer) {
            return Promise.reject('invalid peer');
        }

        const inputUsers = this.getInputUserByUserIds(callId, userIds);
        if (inputUsers === null) {
            return Promise.reject('invalid callId');
        }

        userIds.forEach((userId) => {
            this.removeParticipant(userId);
        });

        return this.apiManager.callRemoveParticipant(peer, callId, inputUsers, timeout).then(() => {
            this.callHandlers(C_CALL_EVENT.ParticipantRemoved, {timeout, userIds});
            return Promise.resolve();
        });
    }

    public groupUpdateAdmin(callId: string, userId: string, admin: boolean) {
        const peer = this.peer;
        if (!peer) {
            return Promise.reject('invalid peer');
        }

        const inputUsers = this.getInputUserByUserIds(callId, [userId]);
        if (inputUsers === null || inputUsers.length === 0) {
            return Promise.reject('invalid callId');
        }

        return this.apiManager.callUpdateAdmin(peer, callId, inputUsers[0], admin).then(() => {
            this.updateAdmin(userId, admin);
            this.callHandlers(C_CALL_EVENT.ParticipantAdminUpdated, {admin, userId});
            return Promise.resolve();
        });
    }

    public destroyConnections(callId: string, connId?: number) {
        const close = (conn: IConnection) => {
            conn.connection.close();
            if (conn.stream) {
                conn.stream.getTracks().forEach((track) => {
                    track.stop();
                });
                conn.stream = undefined;
            }
            clearInterval(conn.connectingInterval);
            clearTimeout(conn.reconnectingTimeout);
            clearInterval(conn.checkStreamInterval);
            clearInterval(conn.checkStreamTimeout);
            delete this.peerConnections[connId];
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
            delete this.callInfo[callId];
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

    public areAllAudio() {
        const currentState = this.getStreamState();
        if (currentState.video) {
            return false;
        }
        const participants = this.getParticipantList(this.activeCallId, true);
        return !participants.some(o => o.mediaSettings.video);
    }

    public setParticipantMute(userId: string, muted: boolean) {
        if (!this.activeCallId) {
            return;
        }
        if (!this.callInfo[this.activeCallId]) {
            return;
        }
        const connId = this.callInfo[this.activeCallId].participantMap[userId];
        this.callInfo[this.activeCallId].participants[connId].muted = muted;
        this.callHandlers(C_CALL_EVENT.ParticipantMuted, {connId, muted, userId});
    }

    private phoneCallHandler = (data: IUpdatePhoneCall) => {
        const d = parseData(data.action || 0, data.actiondata);
        delete data.actiondata;
        data.data = d;
        if (this.verboseAPI) {
            window.console.log('call update:', data);
        }
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
            case PhoneCallAction.PHONECALLADMINUPDATED:
                this.adminUpdated(data);
                break;
            case PhoneCallAction.PHONECALLJOINREQUESTED:
                this.joinRequested(data);
                break;
            case PhoneCallAction.PHONECALLSCREENSHARE:
                this.screenShareUpdated(data);
                break;
            case PhoneCallAction.PHONECALLPICKED:
                this.callPicked(data);
                break;
            case PhoneCallAction.PHONECALLRESTARTED:
                this.callRestarted(data);
                break;
        }
    }

    private busyHandler(data: IUpdatePhoneCall) {
        const peer = new InputPeer();
        peer.setType(data.peertype);
        peer.setId(data.peerid);
        if (data.peertype === PeerType.PEERGROUP) {
            peer.setAccesshash('0');
        } else if (data.peertype === PeerType.PEERUSER) {
            peer.setAccesshash(data.accesshash);
        }
        const inputTeam: InputTeam.AsObject = {
            accesshash: data.accesshash,
            id: data.teamid,
        };

        return this.apiManager.callReject(peer, data.callid || '0', DiscardReason.DISCARDREASONBUSY, 0, inputTeam).then(() => {
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
        return this.apiManager.callRequest(peer, randomId, false, [phoneParticipant], callId, true);
    }

    private phoneCallEndedHandler = (data: UpdatePhoneCallEnded.AsObject) => {
        if (this.activeCallId && this.peer && this.peer.getId() === data.peer.id && this.peer.getType() === data.peer.type) {
            this.callHandlers(C_CALL_EVENT.CallRejected, {
                callId: this.activeCallId,
                reason: DiscardReason.DISCARDREASONHANGUP,
            });
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

    private revertShouldAccept(data: IUpdatePhoneCall) {
        if (this.activeCallId !== data.callid) {
            return;
        }

        if (!this.peer || this.peer.getType() === PeerType.PEERUSER) {
            return;
        }

        if (!this.callInfo.hasOwnProperty(this.activeCallId)) {
            return;
        }

        const index = this.callInfo[this.activeCallId].acceptedParticipantIds.indexOf(data.userid);
        if (index > -1) {
            this.callInfo[this.activeCallId].acceptedParticipantIds.splice(index, 1);
        }
    }

    private callRequested(data: IUpdatePhoneCall) {
        if (this.activeCallId && data.callid !== this.activeCallId) {
            this.busyHandler(data);
            return;
        }

        if (this.rejectedCallIds.indexOf(data.callid) > -1) {
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
        }
        // Accept other participants in group
        else {
            this.initCallRequest(data);
            if (this.shouldAccept(data)) {
                this.accept(this.activeCallId, this.getStreamState().video).catch(() => {
                    this.revertShouldAccept(data);
                });
            }
        }
    }

    private callAccepted(data: IUpdatePhoneCall) {
        if (!this.activeCallId) {
            return;
        }

        const connId = this.getConnId(data.callid, data.userid);
        if (connId === null || !this.peerConnections.hasOwnProperty(connId)) {
            return;
        }

        const sdpData = (data.data as PhoneActionAccepted.AsObject);

        if (this.callInfo.hasOwnProperty(this.activeCallId)) {
            this.callInfo[this.activeCallId].participants[connId].deviceType = sdpData.devicetype;
        }

        if (this.peerConnections[connId].accepted) {
            return;
        }

        this.peerConnections[connId].connection.setRemoteDescription({
            sdp: sdpData.sdp,
            type: sdpData.type as any,
        }).then(() => {
            if (this.peerConnections.hasOwnProperty(connId)) {
                this.peerConnections[connId].accepted = true;
                this.flushIceCandidates(data.callid || '0', connId);

                this.propagateMediaSettings(this.getStreamState(), 255);
            }
        });

        this.clearRetryInterval(connId);
        this.appendToAcceptedList(connId);
        this.checkInitialization(connId);
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
            this.callHandlers(C_CALL_EVENT.CallRejected, {callId: data.callid, reason: actionData.reason});
        } else {
            if (this.removeParticipant(data.userid, data.callid)) {
                this.callHandlers(C_CALL_EVENT.CallRejected, {callId: data.callid, reason: actionData.reason});
            } else {
                this.checkAllConnected();
                this.callHandlers(C_CALL_EVENT.ParticipantLeft, data);
            }
        }
    }

    private removeParticipant(userId: string, activeCallId?: string) {
        activeCallId = activeCallId || this.activeCallId;
        if (!activeCallId) {
            return false;
        }
        if (!this.callInfo[activeCallId]) {
            return false;
        }
        const connId = this.callInfo[activeCallId].participantMap[userId];
        if (this.peerConnections.hasOwnProperty(connId)) {
            this.peerConnections[connId].connection.close();
            clearInterval(this.peerConnections[connId].checkStreamInterval);
            clearTimeout(this.peerConnections[connId].checkStreamTimeout);
            clearTimeout(this.peerConnections[connId].reconnectingTimeout);
            delete this.peerConnections[connId];
        }
        let index = this.callInfo[activeCallId].acceptedParticipantIds.indexOf(userId);
        if (index > -1) {
            this.callInfo[activeCallId].acceptedParticipantIds.splice(index, 1);
        }
        index = this.callInfo[activeCallId].requestParticipantIds.indexOf(userId);
        if (index > -1) {
            this.callInfo[activeCallId].requestParticipantIds.splice(index, 1);
        }
        index = findIndex(this.callInfo[activeCallId].requests, {userid: userId});
        if (index > -1) {
            this.callInfo[activeCallId].requests.splice(index, 1);
        }
        delete this.callInfo[activeCallId].participants[connId];
        delete this.callInfo[activeCallId].participantMap[userId];
        return Object.keys(this.callInfo[activeCallId].participants).length <= 1;
    }

    private updateAdmin(userId: string, admin: boolean) {
        if (!this.activeCallId) {
            return;
        }
        if (!this.callInfo[this.activeCallId]) {
            return;
        }
        const connId = this.callInfo[this.activeCallId].participantMap[userId];
        this.callInfo[this.activeCallId].participants[connId].admin = admin;
    }

    private iceExchange(data: IUpdatePhoneCall) {
        const connId = this.getConnId(data.callid, data.userid);
        const conn = this.peerConnections;
        if (connId === null || !conn.hasOwnProperty(connId)) {
            return;
        }

        const actionData = data.data as PhoneActionIceExchange.AsObject;
        if (!actionData) {
            return;
        }

        if (conn[connId].connection.iceConnectionState in ['closed', 'disconnected', 'failed']) {
            return;
        }

        const iceCandidate = new RTCIceCandidate({
            candidate: actionData.candidate,
            sdpMLineIndex: actionData.sdpmlineindex,
            sdpMid: actionData.sdpmid,
            usernameFragment: actionData.usernamefragment,
        });

        conn[connId].connection.addIceCandidate(iceCandidate).catch((err) => {
            window.console.log('cannot add ice candidate', err, actionData);
        });
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
                deviceType: CallDeviceType.CALLDEVICEUNKNOWN,
                initiator: index === 0,
                mediaSettings: {audio: true, screenShare: false, video: true},
                muted: false,
                peer: participant,
            };
            callParticipantMap[participant.userid || '0'] = index;
        });
        const mediaState = this.getStreamState();
        this.callInfo[callId] = {
            acceptedParticipantIds: [],
            acceptedParticipants: [],
            allConnected: false,
            dialed: false,
            mediaSettings: mediaState ? mediaState : {audio: true, screenShare: false, video: true},
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
                    deviceType: CallDeviceType.CALLDEVICEUNKNOWN,
                    initiator: participant.initiator,
                    mediaSettings: {audio: true, screenShare: false, video: true},
                    muted: false,
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
                    allConnected: false,
                    dialed: false,
                    mediaSettings: mediaState ? mediaState : {audio: true, screenShare: false, video: true},
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
        const sdpData = (data.data as PhoneActionRequested.AsObject);
        if (this.callInfo.hasOwnProperty(data.callid || '0')) {
            const requestParticipantIds = this.callInfo[data.callid || '0'].requestParticipantIds;
            if (requestParticipantIds.indexOf(data.userid) === -1) {
                this.callInfo[data.callid || '0'].requests.push(data);
                this.callInfo[data.callid || '0'].requestParticipantIds.push(data.userid);
                const pi = this.callInfo[data.callid || '0'].participantMap[data.userid];
                if (pi !== undefined) {
                    this.callInfo[data.callid || '0'].participants[pi].deviceType = sdpData.devicetype || CallDeviceType.CALLDEVICEUNKNOWN;
                }
                window.console.log('[webrtc] request from:', data.userid);
            }
            return;
        }
        window.console.log('[webrtc] request from:', data.userid);
        const callParticipants: { [key: number]: ICallParticipant } = {};
        const callParticipantMap: { [key: string]: number } = {};
        sdpData.participantsList.forEach((participant) => {
            callParticipants[participant.connectionid || 0] = {
                admin: participant.admin,
                connectionid: participant.connectionid,
                deviceType: data.userid === participant.peer.userid ? sdpData.devicetype : CallDeviceType.CALLDEVICEUNKNOWN,
                initiator: participant.initiator,
                mediaSettings: {audio: true, screenShare: false, video: true},
                muted: false,
                peer: participant.peer,
            };
            callParticipantMap[participant.peer.userid || '0'] = participant.connectionid || 0;
        });
        const mediaState = this.getStreamState();
        this.callInfo[data.callid || '0'] = {
            acceptedParticipantIds: [],
            acceptedParticipants: [],
            allConnected: false,
            dialed: false,
            mediaSettings: mediaState ? mediaState : {audio: true, screenShare: false, video: true},
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

    private initConnections(peer: InputPeer, callId: string, initiator: boolean, request?: IUpdatePhoneCall): Promise<any> {
        const currentUserConnId = this.getConnId(callId, currentUserId) || 0;
        const callInfo = this.getCallInfo(callId);
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
                window.console.log('[webrtc] answer from:', currentUserId, ' to:', rc.getPeer().getUserid(), ' connId:', connId);
                return this.apiManager.callAccept(peer, callId || '0', [rc]);
            });
        };

        if (request) {
            const sdpData = (request.data as PhoneActionRequested.AsObject);
            sdp = {
                sdp: sdpData.sdp,
                type: sdpData.type as any,
            };
            requestConnId = this.getConnId(callId, request.userid);
            if (callInfo.dialed) {
                return initAnswerConnection(requestConnId);
            }
        }

        const shouldCall = !callInfo.dialed;
        if (shouldCall) {
            this.setCallInfoDialed(callId);
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
                        clearInterval(this.peerConnections[connId].connectingInterval);
                        // Retry mechanism
                        this.peerConnections[connId].connectingInterval = setInterval(() => {
                            if (this.activeCallId && this.peerConnections.hasOwnProperty(connId)) {
                                this.peerConnections[connId].try++;
                                this.callUserSingle(peer, participant, this.activeCallId).finally(() => {
                                    if (this.peerConnections.hasOwnProperty(connId) && this.peerConnections[connId].try >= C_RETRY_LIMIT) {
                                        clearInterval(this.peerConnections[connId].connectingInterval);
                                        if (initiator) {
                                            this.checkCallTimout(connId);
                                        }
                                    }
                                });
                            }
                        }, C_RETRY_INTERVAL);
                    }
                });
                window.console.log('[webrtc] call from:', currentUserId, ' to:', phoneParticipants.map(o => o.getPeer().getUserid()).join(", "));
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

        if (!this.localStream) {
            return Promise.reject('no available stream');
        }

        const stream = this.screenShareStream ? new MediaStream(this.localStream.getAudioTracks()) : this.localStream;
        if (this.screenShareStream) {
            this.screenShareStream.getVideoTracks().forEach((track) => {
                stream.addTrack(track);
            });
        }

        return new Promise((resolve, reject) => {
            try {
                const config = cloneDeep(this.configs);
                if (this.peerConnections[connId] && this.peerConnections[connId].iceServers) {
                    config.iceServers = this.peerConnections[connId].iceServers;
                }

                const pc = new RTCPeerConnection(config);
                pc.addEventListener('icecandidate', (e) => {
                    this.sendIceCandidate(this.activeCallId || '0', e.candidate, connId).catch((err) => {
                        window.console.log('[webrtc] icecandidate, connId:', connId, err);
                    });
                });

                pc.addEventListener('iceconnectionstatechange', () => {
                    window.console.log('[webrtc] iceconnectionstatechange, connId:', connId, pc.iceConnectionState);
                    this.callHandlers(C_CALL_EVENT.ConnectionStateChanged, {connId, state: pc.iceConnectionState});
                    this.checkAllConnected();
                    this.checkDisconnection(connId, pc.iceConnectionState);

                    // End of initializing the connection
                    if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
                        window.console.log('[webrtc] connection initialized, connId:', connId);
                        this.propagateMediaSettings(this.getStreamState(), 255);
                        conn.init = true;
                        conn.reconnecting = false;
                        conn.reconnectingTry = 0;
                        clearTimeout(conn.reconnectingTimeout);
                        clearTimeout(conn.checkStreamInterval);
                    }
                });

                pc.addEventListener('icecandidateerror', (e) => {
                    window.console.log('[webrtc] icecandidateerror, connId:', connId, e);
                    this.checkDisconnection(connId, pc.iceConnectionState, true);
                });

                let conn: IConnection = {
                    accepted: remote,
                    audioIndex: -1,
                    checkStreamInterval: null,
                    checkStreamTimeout: null,
                    connectingInterval: null,
                    connection: pc,
                    iceQueue: [],
                    init: false,
                    reconnecting: false,
                    reconnectingTimeout: null,
                    reconnectingTry: 0,
                    stream: undefined,
                    streamId: '',
                    try: 0,
                    videoIndex: -1,
                };
                if (!this.peerConnections.hasOwnProperty(connId)) {
                    this.peerConnections[connId] = conn;
                } else {
                    conn = this.peerConnections[connId];
                    conn.connection = pc;
                }

                pc.addEventListener('track', (e) => {
                    if (e.streams.length > 0) {
                        const streamId = e.streams[0].id;
                        e.streams.forEach((stream) => {
                            window.console.log('[webrtc] stream, connId:', connId, ' streams', `${stream.getVideoTracks().length > 0 ? `video (${stream.getVideoTracks().length})` : ' '} ${stream.getAudioTracks().length > 0 ? `audio (${stream.getAudioTracks().length})` : ''}`);
                            // Stop previous tracks
                            if (streamId !== conn.streamId) {
                                window.console.log('[webrtc] stop previous tracks');
                                if (conn.stream) {
                                    conn.stream.getTracks().forEach((track) => {
                                        track.stop();
                                        conn.stream.removeTrack(track);
                                    });
                                }
                                if (conn.screenShareStream) {
                                    conn.screenShareStream.getTracks().forEach((track) => {
                                        track.stop();
                                        conn.stream.removeTrack(track);
                                    });
                                }
                            }
                            conn.streamId = streamId;
                            if (this.activeScreenShare && this.activeScreenShare.connId === connId) {
                                // Screen share with video track
                                if (stream.getVideoTracks().length > 0) {
                                    conn.screenShareStream = new MediaStream(stream.getTracks());
                                    const userId = this.getUserIdByCallId(this.activeCallId, connId);
                                    window.console.log('[webrtc] screen share stream, connId: ', connId, ' has stream: ', Boolean(conn.screenShareStream));
                                    this.callHandlers(C_CALL_EVENT.ShareScreenStreamUpdated, {
                                        connId,
                                        stream: conn.screenShareStream,
                                        userId
                                    });
                                } else if (stream.getAudioTracks().length > 0) {
                                    conn.stream = new MediaStream(stream.getAudioTracks());
                                    this.callHandlers(C_CALL_EVENT.StreamUpdated, {connId, stream: conn.stream});
                                }
                            } else {
                                conn.stream = stream;
                                this.callHandlers(C_CALL_EVENT.StreamUpdated, {connId, stream});
                            }
                        });
                    }
                });

                stream.getAudioTracks().forEach((track) => {
                    if (stream) {
                        pc.addTrack(track, stream);
                    }
                });

                stream.getVideoTracks().forEach((track) => {
                    if (stream) {
                        pc.addTrack(track, stream);
                    }
                });

                if (remote) {
                    if (sdp) {
                        pc.setRemoteDescription(sdp).then(() => {
                            return pc.createAnswer(this.getOfferFromStream(stream)).then((res) => {
                                return pc.setLocalDescription(res).then(() => {
                                    return res;
                                });
                            });
                        }).then(resolve).catch(reject);
                    } else {
                        reject('no sdp');
                    }
                } else {
                    pc.createOffer(this.getOfferFromStream(stream)).then((res) => {
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

    private getOfferFromStream(stream: MediaStream): RTCOfferOptions {
        return {
            offerToReceiveAudio: stream.getAudioTracks().length > 0,
            offerToReceiveVideo: stream.getVideoTracks().length > 0,
        };
    }

    private checkAllConnected() {
        if (!this.activeCallId || !this.callInfo.hasOwnProperty(this.activeCallId)) {
            return;
        }
        if (this.callInfo[this.activeCallId].allConnected) {
            return;
        }
        for (const pc of Object.values(this.peerConnections)) {
            if (!(pc.connection.iceConnectionState === 'connected' || pc.connection.iceConnectionState === 'completed')) {
                return;
            }
        }
        this.callInfo[this.activeCallId].allConnected = true;
        setTimeout(() => {
            this.callHandlers(C_CALL_EVENT.AllConnected, null);
        }, 255);
    }

    private checkDisconnection(connId: number, state: RTCIceConnectionState, isIceError?: boolean) {
        if (this.activeCallId === '0') {
            return;
        }
        if (this.peerConnections.hasOwnProperty(connId) && !this.peerConnections[connId].reconnecting && ((isIceError && this.peerConnections[connId].init && (state === 'disconnected' || state === 'failed' || state === 'closed')) || state === 'disconnected')) {
            this.peerConnections[connId].connection.close();
            this.peerConnections[connId].iceQueue = [];
            this.peerConnections[connId].reconnecting = true;
            this.peerConnections[connId].reconnectingTry++;
            if (this.peerConnections[connId].reconnectingTry <= C_RECONNECT_TRY) {
                this.peerConnections[connId].reconnectingTimeout = setTimeout(() => {
                    if (this.peerConnections.hasOwnProperty(connId)) {
                        this.peerConnections[connId].reconnecting = false;
                    }
                    this.checkDisconnection(connId, state, isIceError);
                }, C_RECONNECT_TIMEOUT);
            }
            window.console.log('[webrtc] reconnecting, connId: ', connId, ' state: ', state, ' from ice error: ', isIceError ? 'true' : 'false');
            this.callHandlers(C_CALL_EVENT.ConnectionStateChanged, {connId, state: 'reconnecting'});
            this.apiManager.callInit(this.peer, this.activeCallId).then((res) => {
                if (this.peerConnections[connId]) {
                    this.peerConnections[connId].iceServers = this.transformIceServers(res.iceserversList);
                }
                const currentConnId = this.getConnId(this.activeCallId, currentUserId);
                if (currentConnId < connId) {
                    this.callSendRestart(connId, true);
                } else {
                    this.initConnection(true, connId).catch((sdp) => {
                    });
                }
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

    private getUserIdByCallId(callId: string | undefined, connId: number): string | undefined {
        const info = this.getCallInfo(callId || '0');
        if (!info) {
            return null;
        }

        if (info.participants[connId]) {
            return info.participants[connId].peer.userid;
        } else {
            return undefined;
        }
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

    private propagateMediaSettings({video, screenShare, audio}: { video?: boolean, screenShare?: boolean, audio?: boolean }, delay?: number) {
        setTimeout(() => {
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

            if (screenShare !== undefined) {
                this.callInfo[this.activeCallId].mediaSettings.screenShare = screenShare;
            }

            const actionData = new PhoneActionMediaSettingsUpdated();
            actionData.setAudio(this.callInfo[this.activeCallId].mediaSettings.audio);
            actionData.setVideo(this.callInfo[this.activeCallId].mediaSettings.video);
            actionData.setScreenshare(this.callInfo[this.activeCallId].mediaSettings.screenShare);

            this.callHandlers(C_CALL_EVENT.LocalMediaSettingsUpdated, this.callInfo[this.activeCallId].mediaSettings);

            this.apiManager.callUpdate(this.peer, this.activeCallId, inputUsers, PhoneCallAction.PHONECALLMEDIASETTINGSCHANGED, actionData.serializeBinary());
        }, delay || 0);
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
        this.callInfo[callId].participants[connId].mediaSettings.screenShare = mediaSettings.screenshare || false;
        this.callHandlers(C_CALL_EVENT.MediaSettingsUpdated, this.callInfo[callId].participants[connId]);
    }

    private mediaSettingsInit({video, audio, screenShare}: { video?: boolean, audio?: boolean, screenShare?: boolean }) {
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
        this.callInfo[callId].participants[connId].mediaSettings.screenShare = screenShare || false;
        this.callHandlers(C_CALL_EVENT.MediaSettingsUpdated, this.callInfo[callId].participants[connId]);
    }

    private screenShareUpdated(data: IUpdatePhoneCall) {
        const screenShareData = data.data as PhoneActionScreenShare.AsObject;
        const connId = this.getConnId(data.callid, data.userid);
        if (screenShareData.enable) {
            const currentConnId = this.getConnId(data.callid, currentUserId);
            if (this.activeScreenShare) {
                // Deactivate screen share if current user is streaming
                if (this.activeScreenShare.connId === currentConnId) {
                    const settings = cloneDeep(this.callInfo[data.callid].participants[currentConnId]);
                    settings.mediaSettings.screenShare = false;
                    this.callHandlers(C_CALL_EVENT.MediaSettingsUpdated, settings);
                    this.destroyScreenShareStream();
                } else {
                    // Deactivate previous screen share stream
                    window.console.log('[webrtc] screen share stream, connId: ', connId, ' has stream: ', false);
                    this.callHandlers(C_CALL_EVENT.ShareScreenStreamUpdated, {
                        connId,
                        stream: undefined,
                        userId: data.userid,
                    });
                }
            }
            // Set active screen share
            this.activeScreenShare = {
                connId,
                trackIds: screenShareData.trackidsList,
            };
        } else if (!screenShareData.enable && this.activeScreenShare && this.activeScreenShare.connId === connId) {
            this.activeScreenShare = undefined;
            // Deactivate screen share stream
            window.console.log('[webrtc] screen share stream, connId: ', connId, ' has stream: ', false);
            this.callHandlers(C_CALL_EVENT.ShareScreenStreamUpdated, {
                connId,
                stream: undefined,
                userId: data.userid,
            });
        }
    }

    private propagateScreenShareUpdate(enable: boolean, trackIds: string[]) {
        if (!this.activeCallId || !this.peer || !this.callInfo.hasOwnProperty(this.activeCallId)) {
            return Promise.reject('no active call');
        }

        const inputUsers = this.getInputUsers(this.activeCallId);
        if (!inputUsers) {
            return Promise.reject('no inputUsers');
        }

        const actionData = new PhoneActionScreenShare();
        actionData.setEnable(enable);
        actionData.setTrackidsList(trackIds);
        return this.apiManager.callUpdate(this.peer, this.activeCallId, inputUsers, PhoneCallAction.PHONECALLSCREENSHARE, actionData.serializeBinary(), true);
    }

    private modifyMediaStream(video: boolean) {
        if (!this.activeCallId) {
            return Promise.reject('no active call');
        }
        return this.initStream({
            audio: true,
            video: video,
        }).then((stream) => {
            this.upgradeConnection(stream);
            this.propagateMediaSettings({video});
        });
    }

    private modifyScreenShareMediaStream(enable: boolean): Promise<MediaStream | undefined> {
        if (!this.activeCallId || !this.getScreenCaptureFn) {
            return Promise.reject('no active call');
        }
        if (!this.localStream) {
            return Promise.reject('no localStream');
        }
        for (const pc of Object.values(this.peerConnections)) {
            if (!(pc.connection.iceConnectionState === 'connected' || pc.connection.iceConnectionState === 'completed')) {
                return Promise.reject('still connecting');
            }
        }
        this.destroyScreenShareStream();
        const fn = (stream: MediaStream) => {
            this.upgradeConnection(stream, true);
            this.propagateMediaSettings({screenShare: enable});
            return Promise.resolve(stream);
        };
        const connId = this.getConnId(this.activeCallId, currentUserId);
        if (enable) {
            return this.getScreenCaptureFn().then((stream) => {
                const trackIds = stream.getTracks().map(o => o.id);
                this.activeScreenShare = {
                    connId,
                    trackIds,
                };
                this.localStream.getVideoTracks().forEach((track) => {
                    track.stop();
                    this.localStream.removeTrack(track);
                });
                stream.getVideoTracks().forEach((track) => {
                    this.localStream.addTrack(track);
                });
                return this.propagateScreenShareUpdate(true, trackIds).then(() => {
                    return fn(this.localStream);
                });
            });
        } else {
            if (this.activeScreenShare && this.activeScreenShare.connId === connId) {
                this.activeScreenShare = undefined;
            }
            this.localStream.getVideoTracks().forEach((track) => {
                track.stop();
                this.localStream.removeTrack(track);
            });
            return this.initStream({
                audio: true,
                video: this.lastVideoState,
            }).then((stream) => {
                return this.propagateScreenShareUpdate(false, []).then(() => {
                    return fn(stream);
                });
            });
        }
    }

    private upgradeConnection(stream: MediaStream, forceRemoveVideo?: boolean) {
        const videoTracks = stream.getVideoTracks().filter(o => o.readyState === 'live');
        try {
            for (const [connId, pc] of Object.entries(this.peerConnections)) {
                if (pc.connection.iceConnectionState === 'connected' || pc.connection.iceConnectionState === 'completed') {
                    const senders = pc.connection.getSenders();
                    senders.forEach((sender, index) => {
                        // if (pc.audioIndex === -1 && sender.track && sender.track.kind === 'audio') {
                        //     pc.audioIndex = index;
                        // } else if (pc.videoIndex === -1 && sender.track && sender.track.kind === 'video') {
                        //     pc.videoIndex = index;
                        // }
                        if ((forceRemoveVideo || videoTracks.length === 0) && sender.track && sender.track.kind === 'video') {
                            window.console.log('[webrtc] remove track', sender);
                            pc.videoIndex = index;
                            pc.connection.removeTrack(sender);
                        }
                    });
                    videoTracks.forEach((track) => {
                        window.console.log('[webrtc] track', track);
                        pc.connection.addTrack(track, stream);
                    });
                    // audioTracks.forEach((track) => {
                    //     if (pc.audioIndex > -1 && senders[pc.audioIndex]) {
                    //         senders[pc.audioIndex].setStreams(new MediaStream(audioTracks));
                    //     } else {
                    //         pc.connection.addTrack(track, stream);
                    //     }
                    // });
                    // videoTracks.forEach((track) => {
                    //     if (pc.videoIndex > -1 && senders[pc.videoIndex]) {
                    //         senders[pc.videoIndex].setStreams(new MediaStream(videoTracks));
                    //     } else {
                    //         pc.connection.addTrack(track, stream);
                    //     }
                    // });
                    // audioTracks.forEach((track) => {
                    //     pc.connection.addTrack(track, stream);
                    // });
                    pc.connection.createOffer().then((res) => {
                        return pc.connection.setLocalDescription(res).then(() => {
                            return this.sendSDPOffer(this.parseNumberValue(connId), res);
                        });
                    });
                }
            }
        } catch (e) {
            window.console.log(e, videoTracks);
        }
    }

    private sdpOfferUpdated(data: IUpdatePhoneCall) {
        if (!this.localStream) {
            return;
        }

        if (this.activeCallId !== data.callid) {
            return;
        }

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
            return pc.createAnswer().then((res) => {
                this.peerConnections[connId].accepted = true;
                this.flushIceCandidates(data.callid || '0', connId);
                return pc.setLocalDescription(res).then(() => {
                    return this.sendSDPAnswer(connId, res);
                });
            });
        }).catch((err) => {
            window.console.log(err);
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
        }).catch((err) => {
            window.console.log(err);
        });
    }

    private callAcknowledged(data: IUpdatePhoneCall) {
        const connId = this.getConnId(data.callid, data.userid);
        if (connId === null) {
            return;
        }

        // this.clearRetryInterval(connId);
        this.callHandlers(C_CALL_EVENT.CallAck, connId);
    }

    private callPicked(data: IUpdatePhoneCall) {
        const callPickedData = data.data as PhoneActionPicked.AsObject;
        if (callPickedData.authid !== currentAuthId) {
            this.callHandlers(C_CALL_EVENT.CallCancelled, {callId: data.callid});
        }
    }

    private callRestarted(data: IUpdatePhoneCall) {
        const callRestartedData = data.data as PhoneActionRestarted.AsObject;
        const connId = this.getConnId(data.callid, data.userid);
        if (callRestartedData.sender) {
            this.checkDisconnection(connId, 'disconnected');
            this.callSendRestart(connId, false);
        } else {
            this.initConnection(false, connId).then((sdp) => {
                return this.sendSDPOffer(connId, sdp);
            });
        }
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
        const participantRemovedData = data.data as PhoneActionParticipantRemoved.AsObject;
        if (participantRemovedData.useridsList.indexOf(currentUserId) > -1) {
            this.callHandlers(C_CALL_EVENT.CallCancelled, {callId: data.callid});
        }

        if (this.activeCallId !== data.callid) {
            participantRemovedData.useridsList.forEach((userId) => {
                this.removeParticipant(userId, data.callid);
            });
            return;
        }

        let isCurrentRemoved: boolean = false;
        participantRemovedData.useridsList.forEach((userId) => {
            this.removeParticipant(userId);
            if (userId === currentUserId) {
                isCurrentRemoved = true;
            }
        });
        this.callHandlers(C_CALL_EVENT.ParticipantRemoved, {
            timeout: participantRemovedData.timeout,
            userIds: participantRemovedData.useridsList
        });
        if (isCurrentRemoved) {
            this.callHandlers(C_CALL_EVENT.CallRejected, {
                callId: this.activeCallId,
                reason: DiscardReason.DISCARDREASONHANGUP,
            });
        }
        this.checkAllConnected();
    }

    private adminUpdated(data: IUpdatePhoneCall) {
        if (this.activeCallId !== data.callid) {
            return;
        }

        const adminUpdatedDate = data.data as PhoneActionAdminUpdated.AsObject;
        this.updateAdmin(adminUpdatedDate.userid, adminUpdatedDate.admin);
        this.callHandlers(C_CALL_EVENT.ParticipantAdminUpdated, {
            admin: adminUpdatedDate.admin,
            userid: adminUpdatedDate.userid
        });
    }

    private joinRequested(data: IUpdatePhoneCall) {
        const joinRequestedData = data.data as PhoneActionJoinRequested.AsObject;
        if (joinRequestedData.useridsList.some(o => o === currentUserId)) {
            const peer = new InputPeer();
            peer.setType(data.peertype);
            peer.setId(data.peerid);
            peer.setAccesshash('0');
            this.callHandlers(C_CALL_EVENT.CallJoinRequested, {callId: data.callid, calleeId: data.userid, peer});
        }
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

    private callSendRestart(connId: number, sender: boolean) {
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

        const actionData = new PhoneActionRestarted();
        actionData.setSender(sender);

        return this.apiManager.callUpdate(peer, this.activeCallId, [inputUser], PhoneCallAction.PHONECALLRESTARTED, actionData.serializeBinary(), true).then(() => {
            return Promise.resolve();
        });
    }

    private clearRetryInterval(connId: number) {
        if (!this.peerConnections.hasOwnProperty(connId)) {
            return;
        }
        if (this.peerConnections[connId].connectingInterval) {
            clearInterval(this.peerConnections[connId].connectingInterval);
            this.peerConnections[connId].connectingInterval = null;
        }
    }

    private appendToAcceptedList(connId: number) {
        if (!this.activeCallId) {
            return;
        }
        if (!this.callInfo.hasOwnProperty(this.activeCallId)) {
            return;
        }
        this.callInfo[this.activeCallId].acceptedParticipants.push(connId);
    }

    // Check if all peer connections are initialized
    private checkInitialization(connId: number) {
        if (!this.peerConnections.hasOwnProperty(connId)) {
            return;
        }

        if (this.peerConnections[connId].init) {
            return;
        }

        window.console.log('[webrtc] checkInitialization, connId:', connId);

        this.peerConnections[connId].checkStreamTimeout = setTimeout(() => {
            if (!this.peerConnections.hasOwnProperty(connId)) {
                return;
            }

            this.peerConnections[connId].checkStreamInterval = setInterval(() => {
                if (!this.activeCallId || !this.peerConnections.hasOwnProperty(connId)) {
                    return;
                }

                if (!this.peerConnections[connId].init) {
                    this.checkDisconnection(connId, 'disconnected');
                } else {
                    clearInterval(this.peerConnections[connId].checkStreamInterval);
                }
            }, C_CHECK_STREAM_INTERVAL);
        }, C_CHECK_STREAM_INTERVAL);
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
            this.reject(this.activeCallId, 0, DiscardReason.DISCARDREASONMISSED);
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
                this.groupRemoveParticipant(this.activeCallId, userIds, true);
            }
        }
    }

    private pushToRejectedCallIds(callId: string) {
        this.rejectedCallIds.push(callId);
        setTimeout(() => {
            const index = this.rejectedCallIds.indexOf(callId);
            if (index > -1) {
                this.rejectedCallIds.splice(index, 1);
            }
        }, 15000);
    }

    private transformIceServers(list: IceServer.AsObject[]) {
        return list.map((item) => ({
            credential: item.credential,
            urls: item.urlsList,
            username: item.username,
        }));
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
                resolve(null);
            } catch (e) {
                reject(e);
            }
        });
    }
}
