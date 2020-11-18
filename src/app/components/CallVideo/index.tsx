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
import {findIndex} from "lodash";

import './style.scss';

interface IRemoteConnection {
    connId: number;
    media?: IVideoPlaceholderRef;
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

    constructor(props: IProps) {
        super(props);

        this.state = {
            callId: props.callId,
        };

        this.callService = CallService.getInstance();
    }


    public componentWillUnmount() {
        //
    }

    public initRemoteConnection(noForceUpdate?: boolean) {
        if (noForceUpdate === true && this.videoRemoteRefs.length > 0) {
            return;
        }

        const {callId} = this.state;
        this.videoRemoteRefs = [];
        this.callService.getParticipantList(callId).forEach((participant) => {
            if (this.props.userId === participant.peer.userid) {
                return;
            }

            this.videoRemoteRefs.push({
                connId: participant.connectionid || 0,
                media: undefined,
                streams: undefined,
                userId: participant.peer.userid || '0',
            });
        });

        if (noForceUpdate !== true) {
            this.forceUpdate();
        }
    }

    public setStream(connId: number, streams: MediaStream[]) {
        const index = findIndex(this.videoRemoteRefs, {connId});
        if (index > -1 && streams) {
            const remote = this.videoRemoteRefs[index];
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

    public render() {
        return (<div className="call-video" onClick={this.props.onClick}>
            {this.getRemoteVideoContent()}
        </div>);
    }

    private getRemoteVideoContent() {
        return this.videoRemoteRefs.map((item) => {
            const videoRemoteRefHandler = (ref: any) => {
                item.media = ref;
                const streams = this.callService.getRemoteStreams(item.connId);
                if (streams && item.media && item.media.video) {
                    item.media.video.srcObject = streams[0];
                    item.streams = streams;
                }
            };
            return (<VideoPlaceholder key={item.userId} className="remote-video" innerRef={videoRemoteRefHandler}
                                      srcObject={item.streams ? item.streams[0] : undefined} playsInline={true}
                                      autoPlay={true} userId={item.userId}/>);
        });
    }
}

export default CallVideo;
