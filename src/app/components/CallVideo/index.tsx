/*
    Creation Time: 2020 - Nov - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import VideoPlaceholder, {IVideoPlaceholderRef} from "../VideoPlaceholder";
import CallService, {IMediaSettings} from "../../services/callService";
import {findIndex, differenceWith} from "lodash";
import UserAvatar from "../UserAvatar";
import i18n from "../../services/i18n";

import './style.scss';

export interface IRemoteConnection {
    connId: number;
    media?: IVideoPlaceholderRef;
    status: number;
    streams: MediaStream[] | undefined;
    userId: string;
}

interface IProps {
    onClick?: (e: any) => void;
    callId: string;
    userId: string;
}

interface IState {
    callId: string;
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
    private videoRemoteRefs: IRemoteConnection[] = [];
    private initialized: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            callId: props.callId,
        };

        this.callService = CallService.getInstance();
    }

    public componentDidMount() {
        this.videoRemoteRefs = [];
        if (this.initialized) {
        }
    }

    public componentWillUnmount() {
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
            if (remote.media && remote.media.video) {
                remote.media.video.srcObject = streams[0];
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

    public render() {
        return (<div className={'call-video cp-' + (this.videoRemoteRefs.length)} onClick={this.props.onClick}>
            {this.getRemoteVideoContent()}
        </div>);
    }

    private getRemoteVideoContent() {
        return this.videoRemoteRefs.map((item) => {
            if (item.status === 0 || item.status === 1) {
                return <div key={item.userId} className="call-user-container">
                    <UserAvatar className="call-user" id={item.userId} noDetail={true} big={true}/>
                    <div className="call-user-status"
                    >{i18n.t(item.status ? 'call.is_ringing' : 'call.is_calling')}</div>
                </div>;
            }
            const videoRemoteRefHandler = (ref: any) => {
                item.media = ref;
                const streams = this.callService.getRemoteStreams(item.connId);
                if (streams && item.media && item.media.video) {
                    item.media.video.srcObject = streams[0];
                    item.streams = streams;
                } else if (item.streams && item.media.video && item.media) {
                    item.media.video.srcObject = item.streams[0];
                }
            };
            return (<div className="call-user-container" key={item.userId}>
                <VideoPlaceholder className="remote-video" innerRef={videoRemoteRefHandler}
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
    }
}

export default CallVideo;
