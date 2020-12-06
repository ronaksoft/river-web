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
import {InputPeer, InputUser, PeerType} from "../../services/sdk/messages/core.types_pb";
import CallService, {
    C_CALL_EVENT,
    ICallParticipant,
    IUpdatePhoneCall
} from "../../services/callService";
import {
    CallEndRounded,
    CallRounded,
    CloseRounded,
    CropLandscapeRounded,
    CropSquareRounded,
    FullscreenExitRounded,
    FullscreenRounded,
    MicOffRounded,
    MicRounded,
    VideocamOffRounded,
    VideocamRounded,
    CheckRounded,
} from "@material-ui/icons";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import i18n from '../../services/i18n';
import GroupAvatar from "../GroupAvatar";
import GroupName from "../GroupName";
import {CallTimer, timerFormat} from "../CallTimer";
import Rating from '@material-ui/lab/Rating';
import {DiscardReason} from "../../services/sdk/messages/chat.phone_pb";
import ContactPicker from "../ContactPicker";
import {IUser} from "../../repository/user/interface";
import APIManager, {currentUserId} from "../../services/sdk";
import CallVideo from "../CallVideo";

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
    cropCover: boolean;
    fullscreen: boolean;
    groupId: string | undefined;
    isCaller: boolean;
    mode: 'call_init' | 'call_requested' | 'call' | 'call_report';
    open: boolean;
    rate: number | null;
    videoSwap: boolean;
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
    // @ts-ignore
    private apiManager: APIManager;
    private videoRef: HTMLVideoElement | undefined;
    private callVideoRef: CallVideo | undefined;
    private eventReferences: any[] = [];
    private timer: number = 0;
    private timerEnd: number = 0;
    private contactPickerRef: ContactPicker | undefined;
    private groupParticipant: InputUser.AsObject[] = [];

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
            cropCover: true,
            fullscreen: false,
            groupId: undefined,
            isCaller: false,
            mode: 'call_init',
            open: false,
            rate: null,
            videoSwap: false,
        };

        this.callService = CallService.getInstance();
        this.apiManager = APIManager.getInstance();
    }

    public openDialog(peer: InputPeer | null) {
        if (this.state.open) {
            return;
        }
        this.peer = peer;
        if (!this.peer) {
            return;
        }
        if (this.peer.getType() === PeerType.PEERUSER) {
            this.showPreview(true);
        } else if (this.peer.getType() === PeerType.PEERGROUP) {
            this.setState({
                groupId: this.peer.getId() || '0',
            }, () => {
                if (this.contactPickerRef) {
                    this.contactPickerRef.openDialog();
                }
            });
        }
    }

    public componentDidMount() {
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallRequest, this.eventCallRequestHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallAccept, this.eventCallAcceptHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallReject, this.eventCallRejectHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.StreamUpdate, this.eventStreamUpdateHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.MediaSettingsUpdate, this.eventMediaSettingsUpdateHandler));
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {open, fullscreen, mode, cropCover, groupId} = this.state;
        const disableClose = !(mode === 'call_init' || mode === 'call_report');
        return (
            <>
                <Dialog
                    open={open}
                    onClose={this.closeHandler}
                    className={'call-modal ' + mode + (fullscreen ? ' fullscreen' : '') + (cropCover ? ' crop-cover' : ' crop-contain')}
                    classes={{
                        paper: 'call-modal-paper',
                    }}
                    disableBackdropClick={disableClose}
                    disableEscapeKeyDown={disableClose}
                    disableEnforceFocus={true}
                    PaperComponent={PaperComponent}
                    fullScreen={mode === 'call_report' ? false : fullscreen}
                    TransitionComponent={TransitionEffect}
                >
                    {this.getContent()}
                </Dialog>
                <ContactPicker ref={this.contactPickerRefHandler} onDone={this.contactPickerDoneHandler}
                               groupId={groupId} teamId={this.props.teamId} sendIcon={<CheckRounded/>}
                               title={i18n.t('general.choose_recipient')}/>
            </>
        );
    }

    private showPreview(video: boolean) {
        this.timer = 0;
        this.timerEnd = 0;
        this.setState({
            fullscreen: false,
            mode: 'call_init',
            open: true,
        }, () => {
            this.callService.initStream({audio: true, video}).then((stream) => {
                if (this.videoRef) {
                    this.videoRef.srcObject = stream;
                }
            });
        });
    }

    private closeHandler = () => {
        this.callService.destroyConnections(this.state.callId);
        this.callService.destroy();
        this.setState({
            groupId: undefined,
            open: false,
            rate: null,
        });
        this.timer = 0;
        this.timerEnd = 0;
        this.groupParticipant = [];
    }

    private toggleFullscreenHandler = () => {
        this.setState({
            fullscreen: !this.state.fullscreen,
        });
    }

    private toggleCropHandler = () => {
        this.setState({
            cropCover: !this.state.cropCover,
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
                <div className="call-item call-accept" onClick={this.callAcceptHandler(false)}>
                    <CallRounded/>
                </div>
                <div className="call-item call-accept" onClick={this.callAcceptHandler(true)}>
                    <VideocamRounded/>
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
        const {fullscreen, cropCover} = this.state;
        return <div id={!fullscreen ? 'draggable-call-modal' : undefined} className="call-modal-content">
            <video ref={this.videoRefHandler} playsInline={true} autoPlay={true} muted={true}/>
            <div className="call-modal-header">
                <IconButton className="call-action-item" onClick={this.toggleCropHandler}>
                    {cropCover ? <CropLandscapeRounded/> : <CropSquareRounded/>}
                </IconButton>
                <IconButton className="call-action-item" onClick={this.toggleFullscreenHandler}>
                    {fullscreen ? <FullscreenExitRounded/> : <FullscreenRounded/>}
                </IconButton>
                <IconButton className="call-action-item" onClick={this.closeHandler}>
                    <CloseRounded/>
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
                    <div className="call-item call-accept" onClick={this.callHandler(false)}>
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
        const {fullscreen, animateState, callUserId, callStarted, isCaller, cropCover, videoSwap, callId} = this.state;
        return <div id={!fullscreen ? 'draggable-call-modal' : undefined}
                    className={'call-modal-content animate-' + animateState + (videoSwap ? ' video-swap' : '')}>
            {!callStarted && callUserId &&
            <UserAvatar className="call-user-bg rounded-avatar" id={callUserId} noDetail={true}/>}
            <video className="local-video" ref={this.videoRefHandler} playsInline={true} autoPlay={true} muted={true}
                   onClick={this.videoClickHandler(false)}/>
            <CallVideo ref={this.callVideoRefHandler} callId={callId} userId={currentUserId}
                       onClick={this.videoClickHandler(true)}/>
            <div className="call-modal-header">
                <IconButton className="call-action-item" onClick={this.toggleCropHandler}>
                    {cropCover ? <CropLandscapeRounded/> : <CropSquareRounded/>}
                </IconButton>
                <IconButton className="call-action-item" onClick={this.toggleFullscreenHandler}>
                    {fullscreen ? <FullscreenExitRounded/> : <FullscreenRounded/>}
                </IconButton>
            </div>
            {isCaller && !callStarted && <div className="call-status">
                {i18n.t('call.is_ringing')}
            </div>}
            <div className="call-modal-action">
                {this.getCallSettingsContent()}
                <div className="call-item call-end" onClick={this.hangupCallHandler}>
                    <CallEndRounded/>
                </div>
                {callStarted && <div className="call-timer">
                    <CallTimer/>
                </div>}
            </div>
        </div>;
    }

    private callVideoRefHandler = (ref: any) => {
        this.callVideoRef = ref;
    }

    private videoClickHandler = (remote: boolean) => () => {
        const {callStarted, videoSwap} = this.state;
        if (!callStarted) {
            return;
        }
        if (!videoSwap && !remote) {
            this.setState({
                videoSwap: true,
            });
        } else if (videoSwap && remote) {
            this.setState({
                videoSwap: false,
            });
        }
    }

    private callHandler = (video: boolean) => () => {
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
            this.callService.call(this.peer, this.getRecipients(), video).then((callId) => {
                this.setState({
                    callId,
                }, () => {
                    if (this.callVideoRef) {
                        this.callVideoRef.initRemoteConnection();
                    }
                });
            }).catch(() => {
                this.closeHandler();
            });
        }
    }

    private callAcceptHandler = (video: boolean) => () => {
        this.setState({
            animateState: 'init',
            mode: 'call',
        });
        this.callService.accept(this.state.callId, video).then((stream) => {
            if (this.videoRef && stream) {
                this.setState({
                    animateState: 'end',
                    callSettings: this.callService.getStreamState(),
                });
                this.videoRef.srcObject = stream;
            }
            if (this.callVideoRef) {
                this.callVideoRef.initRemoteConnection();
            }
        }).catch((err) => {
            window.console.log(err);
        });
    }

    private rejectCallHandler = () => {
        this.callService.reject(this.state.callId, Math.floor((this.timerEnd - this.timer) / 1000), DiscardReason.DISCARDREASONDISCONNECT).catch((err) => {
            window.console.log(err);
        });
        this.closeHandler();
    }

    private hangupCallHandler = () => {
        this.callService.reject(this.state.callId, Math.floor((this.timerEnd - this.timer) / 1000), DiscardReason.DISCARDREASONHANGUP).then(() => {
            this.timerEnd = Date.now();
            this.setState({
                mode: 'call_report',
            });
        });
    }

    private eventCallRequestHandler = (data: IUpdatePhoneCall) => {
        this.setState({
            callId: data.callid || '0',
            callUserId: data.userid || '0',
            mode: 'call_requested',
            open: true,
        });
    }

    private eventCallAcceptHandler = (data: IUpdatePhoneCall) => {
        //
    }

    private eventCallRejectHandler = (data: IUpdatePhoneCall) => {
        const {callId} = this.state;
        this.callService.destroyConnections(callId);
        if (this.timer === 0) {
            this.closeHandler();
        } else {
            this.timerEnd = Date.now();
            this.setState({
                mode: 'call_report',
            });
            this.callService.destroy();
        }
    }

    private videoRefHandler = (ref: any) => {
        this.videoRef = ref;
        const stream = this.callService.getLocalStream();
        if (this.videoRef && stream) {
            this.videoRef.srcObject = stream;
        }
    }

    private eventStreamUpdateHandler = ({connId, streams}: { connId: number, streams: MediaStream[] }) => {
        if (!this.callVideoRef) {
            return;
        }

        this.callVideoRef.initRemoteConnection(true);
        this.callVideoRef.setStream(connId, streams);
        if (!this.timer) {
            this.timer = Date.now();
        }
        if (!this.state.callStarted) {
            this.setState({
                callStarted: true,
            });
        }
    }

    private eventMediaSettingsUpdateHandler = (data: ICallParticipant) => {
        if (!this.callVideoRef) {
            return;
        }

        this.callVideoRef.setMediaSettings(data.connectionid || 0, data.mediaSettings);
    }

    private getCallReportContent = () => {
        const {rate} = this.state;
        return <div className="call-modal-content">
            <div className="call-rate-label">{i18n.t('call.rate_this_call')}</div>
            <div className="call-rate-value">
                <Rating value={rate} onChange={this.rateChangeHandler}/>
            </div>
            <div className="call-duration-label">{'Duration:'}</div>
            <div className="call-duration-value">{timerFormat(Math.floor((this.timerEnd - this.timer) / 1000))}</div>
        </div>;
    }

    private rateChangeHandler = (e: any, val: number | null) => {
        this.setState({
            rate: val,
        });
        this.closeHandler();
    }

    private getRecipients(): InputUser.AsObject[] {
        if (this.peer) {
            if (this.peer.getType() === PeerType.PEERUSER) {
                return [{
                    accesshash: this.peer.getAccesshash() || '0',
                    userid: this.peer.getId() || '0',
                }];
            } else if (this.peer.getType() === PeerType.PEERGROUP) {
                return this.groupParticipant;
            }
        }
        return [];
    }

    private contactPickerRefHandler = (ref: any) => {
        this.contactPickerRef = ref;
    }

    private contactPickerDoneHandler = (contacts: IUser[], caption: string) => {
        this.groupParticipant = contacts.map((u) => ({
            accesshash: u.accesshash,
            userid: u.id,
        }));
        this.showPreview(true);
    }
}

export default CallModal;
