/*
    Creation Time: 2020 - Nov - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import CallService, {C_CALL_EVENT, ICallParticipant, IMediaSettings} from "../../services/callService";
import CallVideoPlaceholder from "../CallVideoPlaceholder";
import {findIndex, differenceWith, cloneDeep} from "lodash";
import UserAvatar from "../UserAvatar";
import i18n from "../../services/i18n";
import {currentUserId} from "../../services/sdk";
import UserName from "../UserName";
import {CallDeviceType} from "../../services/sdk/messages/chat.phone_pb";
import IsMobile from "../../services/isMobile";
import {MicOffRounded} from "@material-ui/icons";

import './style.scss';

export enum IceState {
    Closed = 0,
    Connected = 1,
    Connecting = 2,
}

export enum ConnectionStatus {
    Calling = 0,
    Ringing = 1,
    Connecting = 2,
    Connected = 3,
};

export interface IRemoteConnection {
    connId: number;
    deviceType: CallDeviceType;
    iceState: IceState;
    media?: CallVideoPlaceholder;
    muted: boolean;
    setIceState: ((iceState: IceState) => void) | undefined;
    setMute: ((muted: boolean) => void) | undefined;
    status: ConnectionStatus;
    stream: MediaStream | undefined;
    userId: string;
}

interface IProps {
    onClick?: (e: any) => void;
    onContextMenu: (userId: string) => (e: any) => void;
    callId: string;
    userId: string;
}

interface IState {
    callId: string;
    gridSize: number | undefined;
    localVideo: boolean;
    screenShareStream: MediaStream | undefined;
    screenShareUserId: string | undefined;
}

class CallVideo extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        if (props.callId === state.callId) {
            return null;
        }
        return {
            callId: props.callId,
        };
    }

    private callService: CallService;
    private eventReferences: any[] = [];
    private videoRemoteRefs: IRemoteConnection[] = [];
    private initialized: boolean = false;
    private localVideoRefFn: any;
    private mediaSettings: IMediaSettings = {audio: true, screenShare: false, video: true};
    private readonly isMobile = IsMobile.isAny();

    constructor(props: IProps) {
        super(props);

        this.state = {
            callId: props.callId,
            gridSize: undefined,
            localVideo: false,
            screenShareStream: undefined,
            screenShareUserId: undefined,
        };

        this.callService = CallService.getInstance();
        this.mediaSettings = this.callService.getStreamState();
    }

    public componentDidMount() {
        this.videoRemoteRefs = [];
        if (this.initialized) {
        }
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.LocalStreamUpdated, this.eventLocalStreamUpdateHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.ShareScreenStreamUpdated, this.eventShareMediaStreamUpdateHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.MediaSettingsUpdated, this.eventMediaSettingsUpdatedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.LocalMediaSettingsUpdated, this.eventLocalMediaSettingsUpdatedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.ParticipantMuted, this.eventParticipantMutedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.ConnectionStateChanged, this.eventConnectionStateChangedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.AllConnected, this.eventAllConnectedHandler));
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
        this.videoRemoteRefs = [];
        this.initialized = false;
    }

    public initRemoteConnection(noForceUpdate?: boolean) {
        if (noForceUpdate === true && this.videoRemoteRefs.length > 0) {
            return;
        }
        this.initialized = true;
        this.retrieveConnections();
        if (noForceUpdate !== true) {
            this.forceUpdate();
        }
    }

    public setStream(connId: number, stream: MediaStream) {
        const index = findIndex(this.videoRemoteRefs, {connId});
        if (index > -1 && stream) {
            const remote = this.videoRemoteRefs[index];
            remote.stream = stream;
            if (remote.media) {
                remote.media.setVideo(stream);
            }
        }
    }

    public setMediaSettings(connId: number, settings: Partial<IMediaSettings>) {
        const index = findIndex(this.videoRemoteRefs, {connId});
        if (index > -1) {
            const remote = this.videoRemoteRefs[index];
            if (remote.media) {
                remote.media.setSettings(settings);
            }
        }
    }

    public setStatus(connId: number, status: ConnectionStatus, deviceType?: CallDeviceType) {
        const index = findIndex(this.videoRemoteRefs, {connId});
        if (index > -1) {
            const remote = this.videoRemoteRefs[index];
            if (remote.status !== status || (deviceType !== undefined && remote.deviceType !== deviceType)) {
                remote.status = status;
                if (deviceType !== undefined) {
                    remote.deviceType = deviceType;
                }
                this.forceUpdate();
            }
        }
    }

    public addLocalVideo(enable: boolean, refFn?: (ref: any) => void) {
        if (refFn && enable) {
            this.localVideoRefFn = refFn;
        }
        if (this.state.localVideo !== enable) {
            this.setState({
                localVideo: enable,
            }, () => {
                this.calculateGridHeight();
            });
        }
    }

    public resize(fullscreen?: boolean) {
        setTimeout(() => {
            this.calculateGridHeight(fullscreen);
        }, fullscreen ? 10 : 511);
    }

    public render() {
        const {localVideo, gridSize, screenShareStream, screenShareUserId} = this.state;
        return (<div className={'call-video cp-' + (this.videoRemoteRefs.length + (localVideo ? 1 : 0))}
                     onClick={this.props.onClick}>
            {localVideo &&
            <div className="call-user-container"
                 style={gridSize ? this.isMobile ? {width: `${gridSize}px`} : {height: `${gridSize}px`} : undefined}>
                <div className="video-placeholder">
                    <video ref={this.localVideoRefFn} playsInline={true} autoPlay={true} muted={true}/>
                    {!this.mediaSettings.video && <div className="video-user-placeholder">
                        <UserAvatar className="call-user-avatar" id={currentUserId} noDetail={true}/>
                        {!this.mediaSettings.audio && <div className="video-user-audio-muted">
                            <MicOffRounded/>
                            {i18n.t('call.muted')}
                        </div>}
                    </div>}
                </div>
            </div>}
            {this.getRemoteVideoContent()}
            {Boolean(screenShareStream) && <div className="screen-share-container">
                <div className="screen-share-user">
                    <div className="screen-share-label">{i18n.t('call.streaming_from')}</div>
                    {screenShareUserId && <UserName className="user" id={screenShareUserId} noIcon={true} you={true}/>}
                </div>
                <video ref={this.shareScreenRefHandler} playsInline={true} autoPlay={true}
                       muted={screenShareUserId === currentUserId}/>
            </div>}
        </div>);
    }

    private getStatusName(status: ConnectionStatus) {
        switch (status) {
            case ConnectionStatus.Calling:
                return i18n.t('call.is_calling');
            case ConnectionStatus.Ringing:
                return i18n.t('call.is_ringing');
            case ConnectionStatus.Connecting:
                return i18n.t('call.is_connecting');
            case ConnectionStatus.Connected:
                return i18n.t('call.connected');
        }
        return null;
    }

    private getRemoteVideoContent() {
        return this.videoRemoteRefs.map((item) => {
            if (item.status !== ConnectionStatus.Connected) {
                return <div key={`${item.connId}_p`} className="call-user-container"
                            onDoubleClick={this.reconnectHandler(item.connId)}>
                    <UserAvatar className="call-user" id={item.userId} noDetail={true} big={true}/>
                    <div className="call-user-status">{this.getStatusName(item.status)}</div>
                </div>;
            }
            const {gridSize} = this.state;
            const videoRemoteRefHandler = (ref: CallVideoPlaceholder) => {
                item.media = ref;
                const stream = this.callService.getRemoteStream(item.connId);
                if (stream && item.media) {
                    item.stream = stream;
                }
                if (item.stream && item.media) {
                    item.media.setVideo(item.stream);
                }
                if (!ref) {
                    return;
                }
                item.setIceState = (iceState: IceState) => {
                    ref.setIceState(iceState);
                };
                ref.setIceState(item.iceState);
                item.setMute = (muted: boolean) => {
                    ref.setMute(muted);
                };
                ref.setMute(item.muted);
            };
            return (<div key={`${item.connId}_v`} className="call-user-container"
                         style={gridSize ? this.isMobile ? {width: `${gridSize}px`} : {height: `${gridSize}px`} : undefined}
                         onContextMenu={this.props.onContextMenu(item.userId)}
                         onDoubleClick={this.reconnectHandler(item.connId)}>
                <CallVideoPlaceholder className="remote-video" ref={videoRemoteRefHandler}
                                      srcObject={item.stream} playsInline={true}
                                      autoPlay={true} userId={item.userId} deviceType={item.deviceType}/>
            </div>);
        });
    }

    private reconnectHandler = (connId: number) => () => {
        this.callService.tryReconnect(connId);
    }

    private retrieveConnections() {
        const {callId} = this.state;
        const participants = this.callService.getParticipantList(callId, true);
        const addedVideos = differenceWith(participants, this.videoRemoteRefs, (o1, o2) => o1.connectionid === o2.connId);
        const removedVideos = differenceWith(this.videoRemoteRefs, participants, (o1, o2) => o1.connId === o2.connectionid);
        if (removedVideos.length > 0) {
            removedVideos.forEach((video) => {
                const index = findIndex(this.videoRemoteRefs, {connId: video.connId});
                if (index > -1) {
                    this.videoRemoteRefs.splice(index, 1);
                }
            });
        }
        if (addedVideos.length > 0) {
            this.videoRemoteRefs.push(...addedVideos.map(participant => ({
                connId: participant.connectionid || 0,
                deviceType: participant.deviceType,
                iceState: IceState.Connected,
                media: undefined,
                muted: participant.muted,
                setIceState: undefined,
                setMute: undefined,
                status: participant.started ? 2 : 0,
                stream: undefined,
                userId: participant.peer.userid || '0',
            })));
        }
        this.calculateGridHeight();
    }

    private calculateGridHeight(fullscreen?: boolean) {
        const {gridSize, localVideo} = this.state;
        const el = document.querySelector(fullscreen ? 'body' : '.call-modal-content');
        let gh: number | undefined = undefined;
        if (el) {
            const gridCount = (this.videoRemoteRefs.length + (localVideo ? 1 : 0));
            if (this.isMobile) {
                const width = el.clientWidth;
                if (gridCount >= 7) {
                    gh = width / 3;
                } else if (gridCount >= 3) {
                    gh = width / 2;
                }
            } else {
                const height = el.clientHeight;
                if (gridCount >= 7) {
                    gh = height / 3;
                } else if (gridCount >= 3) {
                    gh = height / 2;
                }
            }
        }
        if (gridSize !== gh) {
            this.setState({
                gridSize: gh,
            });
        }
    }

    private eventLocalStreamUpdateHandler = () => {
        const settings = this.callService.getStreamState();
        let forceUpdate = false;
        if (settings.video !== this.mediaSettings.video) {
            forceUpdate = true;
        }
        this.mediaSettings = settings;
        if (forceUpdate) {
            this.forceUpdate();
        }
    }

    private eventShareMediaStreamUpdateHandler = ({connId, stream, userId}: { connId: number, stream: MediaStream | undefined, userId: string }) => {
        this.videoRemoteRefs.forEach((video) => {
            if (video.media) {
                if (stream) {
                    video.media.setVODEnable(false);
                    video.media.destroyVOD();
                } else {
                    video.media.setVODEnable(true);
                }
            }
        });
        if (stream) {
            this.setState({
                screenShareStream: stream,
                screenShareUserId: userId,
            });
        } else {
            this.setState({
                screenShareStream: undefined,
                screenShareUserId: undefined,
            });
        }
    }

    private eventMediaSettingsUpdatedHandler = (data: ICallParticipant) => {
        if (data.mediaSettings.screenShare && !this.state.screenShareStream) {
            const streamData = this.callService.getRemoteScreenShareStream();
            if (streamData) {
                this.setState({
                    screenShareStream: streamData.stream,
                    screenShareUserId: streamData.userId,
                });
            }
        }
    }

    private eventParticipantMutedHandler = ({connId, muted, userId}: { connId: number, muted: boolean, userId: string }) => {
        const index = findIndex(this.videoRemoteRefs, {connId});
        if (index > -1) {
            this.videoRemoteRefs[index].muted = muted;
            if (this.videoRemoteRefs[index].setMute) {
                this.videoRemoteRefs[index].setMute(muted);
            }
        }
    }

    private eventConnectionStateChangedHandler = ({connId, state}: { connId: number, state: RTCIceConnectionState }) => {
        const index = findIndex(this.videoRemoteRefs, {connId});
        if (index > -1) {
            this.videoRemoteRefs[index].iceState = this.transformIceState(state);
            if (this.videoRemoteRefs[index].setIceState) {
                this.videoRemoteRefs[index].setIceState(this.videoRemoteRefs[index].iceState);
            }
        }
    }

    private eventLocalMediaSettingsUpdatedHandler = (mediaSettings: IMediaSettings) => {
        this.mediaSettings = cloneDeep(mediaSettings);
        if (this.state.localVideo) {
            this.forceUpdate();
        }
    }

    private transformIceState(state: RTCIceConnectionState | 'reconnecting'): IceState {
        switch (state) {
            default:
                return IceState.Closed;
            case 'new':
            case 'connected':
            case 'completed':
                return IceState.Connected;
            case 'reconnecting':
                return IceState.Connecting;
        }
    }

    private shareScreenRefHandler = (ref: HTMLVideoElement) => {
        if (ref && this.state.screenShareStream) {
            ref.srcObject = this.state.screenShareStream;
        }
    }

    private eventAllConnectedHandler = () => {
        setInterval(() => {
            window.console.log(this.videoRemoteRefs.map(o => `${o.connId}_${o.status}_${o.stream}`).join(' | '));
        }, 1000);
    }
}

export default CallVideo;
