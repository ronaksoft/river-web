/*
    Creation Time: 2020 - Nov - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import CallService, {C_CALL_EVENT, IMediaSettings} from "../../services/callService";
import CallVideoPlaceholder from "../CallVideoPlaceholder";
import {findIndex, differenceWith} from "lodash";
import UserAvatar from "../UserAvatar";
import i18n from "../../services/i18n";
import {currentUserId} from "../../services/sdk";

import './style.scss';

export interface IRemoteConnection {
    connId: number;
    media?: CallVideoPlaceholder;
    status: number;
    streams: MediaStream[] | undefined;
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
    gridHeight: number | undefined;
    localVideo: boolean;
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

    constructor(props: IProps) {
        super(props);

        this.state = {
            callId: props.callId,
            gridHeight: undefined,
            localVideo: false,
        };

        this.callService = CallService.getInstance();
        this.mediaSettings = this.callService.getStreamState();
    }

    public componentDidMount() {
        this.videoRemoteRefs = [];
        if (this.initialized) {
        }
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.LocalStreamUpdated, this.eventLocalStreamUpdateHandler));
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
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

    public setStream(connId: number, streams: MediaStream[]) {
        const index = findIndex(this.videoRemoteRefs, {connId});
        if (index > -1 && streams) {
            const remote = this.videoRemoteRefs[index];
            remote.streams = streams;
            if (remote.media) {
                remote.media.setVideo(streams[0]);
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

    public setStatus(connId: number, status: number) {
        const index = findIndex(this.videoRemoteRefs, {connId});
        if (index > -1) {
            const remote = this.videoRemoteRefs[index];
            if (remote.status !== status) {
                remote.status = status;
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
        const {localVideo, gridHeight} = this.state;
        return (<div className={'call-video cp-' + (this.videoRemoteRefs.length + (localVideo ? 1 : 0))}
                     onClick={this.props.onClick}>
            {localVideo &&
            <div className="call-user-container" style={gridHeight ? {height: `${gridHeight}px`} : undefined}>
                <div className="video-placeholder">
                    <video ref={this.localVideoRefFn} playsInline={true} autoPlay={true} muted={true}/>
                    {!this.mediaSettings.video &&
                    <UserAvatar className="video-user-placeholder" id={currentUserId} noDetail={true}/>}
                </div>
            </div>}
            {this.getRemoteVideoContent()}
        </div>);
    }

    private getRemoteVideoContent() {
        return this.videoRemoteRefs.map((item) => {
            if (item.status === 0 || item.status === 1) {
                return <div key={item.connId} className="call-user-container">
                    <UserAvatar className="call-user" id={item.userId} noDetail={true} big={true}/>
                    <div className="call-user-status"
                    >{i18n.t(item.status ? 'call.is_ringing' : 'call.is_calling')}</div>
                </div>;
            }
            const {gridHeight} = this.state;
            const videoRemoteRefHandler = (ref: CallVideoPlaceholder) => {
                item.media = ref;
                const streams = this.callService.getRemoteStreams(item.connId);
                if (streams && item.media) {
                    item.streams = streams;
                }
                if (item.streams && item.media) {
                    item.media.setVideo(item.streams[0]);
                }
            };
            return (<div key={item.connId} className="call-user-container"
                         style={gridHeight ? {height: `${gridHeight}px`} : undefined}
                         onContextMenu={this.props.onContextMenu(item.userId)}>
                <CallVideoPlaceholder className="remote-video" ref={videoRemoteRefHandler}
                                      srcObject={item.streams ? item.streams[0] : undefined} playsInline={true}
                                      autoPlay={true} userId={item.userId}/>
            </div>);
        });
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
                media: undefined,
                status: participant.started ? 2 : 0,
                streams: undefined,
                userId: participant.peer.userid || '0',
            })));
        }
        this.calculateGridHeight();
    }

    private calculateGridHeight(fullscreen?: boolean) {
        const {gridHeight, localVideo} = this.state;
        const el = document.querySelector(fullscreen ? 'body' : '.call-modal-content');
        let gh: number | undefined = undefined;
        if (el) {
            const gridCount = (this.videoRemoteRefs.length + (localVideo ? 1 : 0));
            const height = el.clientHeight;
            if (gridCount >= 7) {
                gh = height / 3;
            } else if (gridCount >= 3) {
                gh = height / 2;
            }
        }
        if (gridHeight !== gh) {
            this.setState({
                gridHeight: gh,
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
}

export default CallVideo;
