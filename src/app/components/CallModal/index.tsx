/*
    Creation Time: 2020 - Nov - 04
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {Dialog, FormControlLabel, Grow, IconButton, Paper, PaperProps, Switch} from '@material-ui/core';
import {TransitionProps} from '@material-ui/core/transitions';
import Draggable from 'react-draggable';
import {InputPeer, PeerType} from "../../services/sdk/messages/core.types_pb";
import CallService, {C_CALL_EVENT, IUpdatePhoneCall} from "../../services/callService";
import {
    CallEndRounded,
    CallRounded,
    CloseRounded,
    FullscreenExitRounded,
    FullscreenRounded,
    MicOffRounded,
    MicRounded,
    VideocamOffRounded,
    VideocamRounded
} from "@material-ui/icons";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import i18n from '../../services/i18n';
import GroupAvatar from "../GroupAvatar";
import GroupName from "../GroupName";
import {CallTimer, timerFormat} from "../CallTimer";

import './style.scss';

interface IProps {
    height?: string;
    teamId: string;
}

interface ICallSettings {
    video: boolean;
    audio: boolean;
}

interface IState {
    animateState: string;
    callId: string;
    callSettings: ICallSettings;
    callStarted: boolean;
    callUserId: string | null;
    fullscreen: boolean;
    isCaller: boolean;
    mode: 'call_init' | 'call_requested' | 'call' | 'call_report';
    open: boolean;
    remoteVideoEnabled: boolean;
}

const TransitionEffect = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Grow ref={ref} {...props} />;
});

function PaperComponent(props: PaperProps) {
    return (
        <Draggable handle="#draggable-call-modal" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}

class CallModal extends React.Component<IProps, IState> {
    private peer: InputPeer | null = null;
    private callService: CallService;
    private videoRef: HTMLVideoElement | undefined;
    private videoRemoteRef: HTMLVideoElement | undefined;
    private eventReferences: any[] = [];
    private timer: number = 0;
    private timerEnd: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            animateState: 'init',
            callId: '0',
            callSettings: {
                audio: true,
                video: true,
            },
            callStarted: false,
            callUserId: null,
            fullscreen: false,
            isCaller: false,
            mode: 'call_init',
            open: false,
            remoteVideoEnabled: false,
        };

        this.callService = CallService.getInstance();
    }

    public openDialog(peer: InputPeer | null) {
        if (this.state.open) {
            return;
        }
        this.peer = peer;
        this.setState({
            mode: 'call_init',
            open: true,
        }, () => {
            this.callService.initStream().then((stream) => {
                if (this.videoRef) {
                    this.videoRef.srcObject = stream;
                }
            });
        });
    }

    public componentDidMount() {
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallRequest, this.callRequestHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallRejected, this.callRejectedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.StreamUpdate, this.streamUpdateHandler));
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {open, fullscreen, mode} = this.state;
        return (
            <Dialog
                open={open}
                onClose={this.closeHandler}
                className={'call-modal ' + mode + (fullscreen ? ' fullscreen' : '')}
                classes={{
                    paper: 'call-modal-paper',
                }}
                disableBackdropClick={!(mode === 'call_init' || mode === 'call_report')}
                disableEnforceFocus={true}
                PaperComponent={PaperComponent}
                fullScreen={fullscreen}
                TransitionComponent={TransitionEffect}
            >
                {this.getContent()}
            </Dialog>
        );
    }

    private closeHandler = () => {
        this.callService.destroy();
        this.setState({
            mode: 'call_init',
            open: false,
        });
    }

    private toggleFullscreenHandler = () => {
        this.setState({
            fullscreen: !this.state.fullscreen,
        });
    }

    private getContent() {
        const {mode} = this.state;
        switch (mode) {
            case 'call_requested':
                return this.getRequestedContent();
            case 'call_init':
                return this.getCallInitContent();
            case 'call':
                return this.getCallContent();
            case 'call_report':
                return this.getCallReportContent();
        }
        return null;
    }

    private getRequestedContent() {
        const {callUserId} = this.state;
        return <div className="call-modal-content">
            {callUserId && <UserAvatar className="call-user-bg" id={callUserId} noDetail={true}/>}
            <div className="call-info">
                {callUserId && <UserName className="call-user-name" id={callUserId} noDetail={true}/>}
                <div className="call-status">
                    {i18n.t('call.is_calling')}
                </div>
            </div>
            <div className="call-modal-action">
                <div className="call-item call-end" onClick={this.rejectCallHandler}>
                    <CallEndRounded/>
                </div>
                <div className="call-item call-accept" onClick={this.callAcceptHandler}>
                    <CallRounded/>
                </div>
            </div>
        </div>;
    }

    private getCallSettingsContent() {
        const {callSettings} = this.state;
        return <div className="call-settings">
            <FormControlLabel
                className="call-settings-switch"
                control={
                    <Switch
                        checked={callSettings.video}
                        onChange={this.callSettingsChangeHandler('video')}
                        color="primary"
                    />
                }
                label={callSettings.video ? <VideocamRounded/> : <VideocamOffRounded/>}
                labelPlacement="start"
            />
            <FormControlLabel
                className="call-settings-switch"
                control={
                    <Switch
                        checked={callSettings.audio}
                        onChange={this.callSettingsChangeHandler('audio')}
                        color="primary"
                    />
                }
                label={callSettings.audio ? <MicRounded/> : <MicOffRounded/>}
                labelPlacement="start"
            />
        </div>;
    }

    private getCallInitContent() {
        const {fullscreen} = this.state;
        return <div id={!fullscreen ? 'draggable-call-modal' : undefined} className="call-modal-content">
            <video ref={this.videoRefHandler} playsInline={true} autoPlay={true} muted={true}/>
            <div className="call-modal-header">
                <IconButton className="call-action-item" onClick={this.closeHandler}>
                    <CloseRounded/>
                </IconButton>
                <IconButton className="call-action-item" onClick={this.toggleFullscreenHandler}>
                    {fullscreen ? <FullscreenExitRounded/> : <FullscreenRounded/>}
                </IconButton>
            </div>
            <div className="call-info">
                {this.getCalleeContent()}
            </div>
            <div className="call-modal-action">
                {this.getCallSettingsContent()}
                <div className="call-buttons">
                    <div className="call-item call-end" onClick={this.closeHandler}>
                        <CallEndRounded/>
                    </div>
                    <div className="call-item call-accept" onClick={this.callHandler}>
                        <CallRounded/>
                    </div>
                </div>
            </div>
        </div>;
    }

    private getCalleeContent() {
        const peer = this.peer;
        if (!peer) {
            return null;
        }
        if (peer.getType() === PeerType.PEERUSER) {
            return <div className="callee-info">
                <UserAvatar className="callee-avatar" id={peer.getId() || '0'} noDetail={true}/>
                <UserName className="callee-name" id={peer.getId() || '0'} noDetail={true}/>
            </div>;
        } else if (peer.getType() === PeerType.PEERGROUP) {
            return <div className="callee-info">
                <GroupAvatar className="callee-avatar" teamId={this.props.teamId} id={peer.getId() || '0'}/>
                <GroupName className="callee-name" teamId={this.props.teamId} id={peer.getId() || '0'}/>
            </div>;
        }
        return null;
    }

    private callSettingsChangeHandler = (key: string) => (e: any, checked: boolean) => {
        const {callSettings} = this.state;
        callSettings[key] = checked;
        this.setState({
            callSettings,
        });
        if (key === 'audio') {
            this.callService.toggleAudio(checked);
        } else if (key === 'video') {
            this.callService.toggleVideo(checked);
        }
    }

    private getCallContent() {
        const {fullscreen, animateState, callUserId, remoteVideoEnabled, callStarted} = this.state;
        return <div id={!fullscreen ? 'draggable-call-modal' : undefined}
                    className={'call-modal-content animate-' + animateState}>
            {!remoteVideoEnabled && callUserId &&
            <UserAvatar className="call-user-bg" id={callUserId} noDetail={true}/>}
            <video className="local-video" ref={this.videoRefHandler} playsInline={true} autoPlay={true} muted={true}/>
            <video className="remote-video" ref={this.videoRemoteRefHandler} playsInline={true} autoPlay={true}/>
            <div className="call-modal-header">
                <IconButton className="call-action-item" onClick={this.closeHandler}>
                    <CloseRounded/>
                </IconButton>
                <IconButton className="call-action-item" onClick={this.toggleFullscreenHandler}>
                    {fullscreen ? <FullscreenExitRounded/> : <FullscreenRounded/>}
                </IconButton>
            </div>
            {!callStarted && <div className="call-status">
                {i18n.t('call.is_ringing')}
            </div>}
            <div className="call-modal-action">
                {this.getCallSettingsContent()}
                <div className="call-item call-end" onClick={this.rejectCallHandler}>
                    <CallEndRounded/>
                </div>
                {callStarted && <div className="call-timer">
                    <CallTimer/>
                </div>}
            </div>
        </div>;
    }

    private callHandler = () => {
        this.setState({
            animateState: 'init',
            callUserId: this.peer ? this.peer.getId() || '0' : null,
            isCaller: true,
            mode: 'call',
        }, () => {
            setTimeout(() => {
                this.setState({
                    animateState: 'end',
                });
            }, 512);
        });
        if (this.peer) {
            this.callService.call(this.peer, 0);
        }
    }

    private callAcceptHandler = () => {
        this.setState({
            animateState: 'init',
            mode: 'call',
        });
        this.callService.accept(this.state.callId, 0).then((stream) => {
            if (this.videoRef && stream) {
                this.setState({
                    animateState: 'end',
                });
                this.videoRef.srcObject = stream;
            }
        }).catch((err) => {
            window.console.log(err);
        });
    }

    private rejectCallHandler = () => {
        this.callService.reject(this.state.callId, Math.floor((this.timerEnd - this.timer) / 1000)).catch((err) => {
            window.console.log(err);
        });
        this.closeHandler();
    }

    private callRequestHandler = (data: IUpdatePhoneCall) => {
        this.setState({
            callId: data.callid || '0',
            callUserId: data.userid || '0',
            mode: 'call_requested',
            open: true,
        });
    }

    private callRejectedHandler = (data: IUpdatePhoneCall) => {
        window.console.log(data);
        const {isCaller, callId} = this.state;
        this.callService.destroyConnections(callId);
        this.timerEnd = Date.now();
        if (isCaller) {
            this.setState({
                mode: 'call_report',
            });
            this.callService.destroy();
        } else {
            this.closeHandler();
        }
    }

    private videoRefHandler = (ref: any) => {
        this.videoRef = ref;
        const stream = this.callService.getLocalStream();
        if (this.videoRef && stream) {
            this.videoRef.srcObject = stream;
        }
    }

    private videoRemoteRefHandler = (ref: any) => {
        this.videoRemoteRef = ref;
        const streams = this.callService.getRemoteStreams(0);
        if (this.videoRemoteRef && streams) {
            this.videoRemoteRef.srcObject = streams[0];
        }
    }

    private streamUpdateHandler = ({connId, streams}: { connId: number, streams: MediaStream[] }) => {
        if (this.videoRemoteRef && streams) {
            this.videoRemoteRef.srcObject = streams[0];
            const hasVideo = streams[0].getVideoTracks().some(o => o.enabled);
            if (!this.timer) {
                this.timer = Date.now();
            }
            this.setState({
                callStarted: true,
                remoteVideoEnabled: hasVideo,
            });
        }
    }

    private getCallReportContent = () => {
        return <div className="call-modal-content">
            <div className="call-duration-label">{'Duration:'}</div>
            <div className="call-duration-value">{timerFormat(Math.floor((this.timerEnd - this.timer) / 1000))}</div>
        </div>;
    }
}

export default CallModal;
