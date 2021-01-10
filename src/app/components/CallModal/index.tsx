/*
    Creation Time: 2020 - Nov - 04
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {useRef} from 'react';
import {Dialog, Grow, IconButton, Paper, PaperProps} from '@material-ui/core';
import {TransitionProps} from '@material-ui/core/transitions';
import Draggable, {ControlPosition, DraggableEventHandler} from 'react-draggable';
import {InputPeer, InputUser, PeerType} from "../../services/sdk/messages/core.types_pb";
import CallService, {C_CALL_EVENT, ICallParticipant, IUpdatePhoneCall} from "../../services/callService";
import {
    CallEndRounded,
    CallRounded,
    CheckRounded,
    CloseRounded,
    CropLandscapeRounded,
    CropSquareRounded,
    DynamicFeedRounded,
    FullscreenExitRounded,
    FullscreenRounded,
    VideocamRounded,
    WebAssetRounded,
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
import CallSettings, {IMediaSettings} from "../CallSettings";
import {clone} from "lodash";
import {Merge} from "type-fest";
import MainRepo from "../../repository";

import './style.scss';

const C_MINIMIZE_WIDTH = 240;
const C_MINIMIZE_HEIGHT = 135;
const C_MINIMIZE__PADDING = 16;

interface IProps {
    height?: string;
}

interface IState {
    animateState: string;
    callId: string;
    callStarted: boolean;
    callUserId: string | null;
    cropCover: boolean;
    fullscreen: boolean;
    groupId: string | undefined;
    isCaller: boolean;
    minimize: boolean;
    resetPosition: boolean;
    mode: 'call_init' | 'call_request' | 'call' | 'call_report' | 'call_unavailable';
    open: boolean;
    rate: number | null;
    unavailableMode: 'none' | 'timeout' | 'busy';
    videoSwap: boolean;
}

const TransitionEffect = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Grow ref={ref} {...props} />;
});

interface IPaperProps {
    disabled?: boolean;
    offset?: ControlPosition;
}

function PaperComponent(props: Merge<PaperProps, IPaperProps>) {
    const dragRef = useRef<boolean>(false);
    if (!props.offset) {
        dragRef.current = false;
    }
    const stopHandler: DraggableEventHandler = (e, data) => {
        dragRef.current = Boolean(data.x || data.y);
    };
    return (
        <Draggable handle="#draggable-call-modal" cancel={'[class*="MuiDialogContent-root"]'}
                   key={props.offset && dragRef.current ? 'minimized' : 'normal'} positionOffset={props.offset}
                   disabled={props.disabled} onStop={stopHandler}>
            <Paper {...props} />
        </Draggable>
    );
}

class CallModal extends React.Component<IProps, IState> {
    private teamId: string = '0';
    private peer: InputPeer | null = null;
    private callService: CallService;
    // @ts-ignore
    private apiManager: APIManager;
    private mainRepo: MainRepo;
    private videoRef: HTMLVideoElement | undefined;
    private callVideoRef: CallVideo | undefined;
    private eventReferences: any[] = [];
    private timeStart: number = 0;
    private timeEnd: number = 0;
    private contactPickerRef: ContactPicker | undefined;
    private groupParticipant: InputUser.AsObject[] = [];
    private callSettingsRef: CallSettings | undefined;
    private mediaSettings: IMediaSettings = {audio: true, video: true};
    private callConnectingTone: string = '/ringingtone/connecting-1.mp3';
    private callRingingTone: string = '/ringingtone/tone-2.mp3';
    private loading: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            animateState: 'init',
            callId: '0',
            callStarted: false,
            callUserId: null,
            cropCover: true,
            fullscreen: false,
            groupId: undefined,
            isCaller: false,
            minimize: false,
            mode: 'call_init',
            open: false,
            rate: null,
            resetPosition: false,
            unavailableMode: 'none',
            videoSwap: false,
        };

        this.callService = CallService.getInstance();
        this.apiManager = APIManager.getInstance();
        this.mainRepo = MainRepo.getInstance();

        this.callService.setDialogOpenFunction(this.openDialog);
        this.callService.setSetTeamFunction(this.setTeam);
    }

    public openDialog = (peer: InputPeer | null) => {
        if (this.state.open) {
            return;
        }
        this.timeStart = 0;
        this.timeEnd = 0;
        if (!peer) {
            return;
        }
        this.peer = clone(peer);
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
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallTimeout, this.eventCallTimeoutHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.StreamUpdate, this.eventStreamUpdateHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.LocalStreamUpdate, this.eventLocalStreamUpdateHandler));
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
        const {open, fullscreen, mode, cropCover, groupId, minimize} = this.state;
        const disableClose = !(mode === 'call_init' || mode === 'call_report');
        const paperProps: IPaperProps | undefined = this.getDraggableProps();
        return (
            <>
                <Dialog
                    open={open}
                    onClose={this.closeHandler}
                    className={'call-modal ' + mode + (fullscreen ? ' fullscreen' : '') + (cropCover ? ' crop-cover' : ' crop-contain') + (minimize ? ' minimize' : '')}
                    classes={{
                        paper: 'call-modal-paper',
                    }}
                    disableBackdropClick={disableClose}
                    disableEscapeKeyDown={disableClose}
                    disableEnforceFocus={true}
                    PaperComponent={PaperComponent}
                    PaperProps={paperProps as any}
                    fullScreen={mode === 'call_report' ? false : fullscreen}
                    TransitionComponent={TransitionEffect}
                >
                    {this.getContent()}
                </Dialog>
                <ContactPicker ref={this.contactPickerRefHandler} onDone={this.contactPickerDoneHandler}
                               groupId={groupId} teamId={this.teamId} sendIcon={<CheckRounded/>}
                               title={i18n.t('general.choose_recipient')} limit={11} selectAll={true}/>
            </>
        );
    }

    private getDraggableProps(): IPaperProps | undefined {
        const {minimize} = this.state;
        if (!minimize) {
            return undefined;
        }
        const w = window.innerWidth;
        const h = window.innerHeight;
        return {
            offset: {
                x: ((w - C_MINIMIZE_WIDTH) / 2) - C_MINIMIZE__PADDING,
                y: -(((h - C_MINIMIZE_HEIGHT) / 2) - C_MINIMIZE__PADDING),
            },
        };
    }

    private closeHandler = () => {
        this.callService.destroyConnections(this.state.callId);
        this.callService.destroy();
        this.setState({
            callStarted: false,
            cropCover: true,
            groupId: undefined,
            isCaller: false,
            minimize: false,
            open: false,
            rate: null,
            videoSwap: false,
        });
        setTimeout(() => {
            this.timeStart = 0;
            this.timeEnd = 0;
        }, 300);
        this.groupParticipant = [];
        this.mediaSettings = {audio: true, video: true};
        this.peer = null;
        this.loading = false;
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

    private toggleMinimizeHandler = () => {
        if (!this.state.minimize && this.state.fullscreen) {
            this.setState({
                fullscreen: false,
                minimize: true,
            });
        } else {
            this.setState({
                minimize: !this.state.minimize,
            });
        }
    }

    private showPreview(video: boolean) {
        this.timeStart = 0;
        this.timeEnd = 0;
        this.setState({
            fullscreen: false,
            mode: 'call_init',
            open: true,
            unavailableMode: 'none',
        }, () => {
            this.callService.initStream({audio: true, video}).then((stream) => {
                if (this.videoRef) {
                    this.videoRef.srcObject = stream;
                }
            });
        });
    }

    private getContent() {
        const {mode} = this.state;
        switch (mode) {
            case 'call_request':
                return this.getRequestedContent();
            case 'call_unavailable':
                return this.getCallUnavailableContent();
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
        const mediaDevice = this.callService.getMediaDevice();
        return <div className="call-modal-content">
            {callUserId && <UserAvatar className="call-user-bg" id={callUserId} noDetail={true} big={true}/>}
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
                {mediaDevice.video && <div className="call-item call-accept" onClick={this.callAcceptHandler(true)}>
                    <VideocamRounded/>
                </div>}
            </div>
            <audio autoPlay={true} src={this.callRingingTone} loop={true} style={{display: 'none'}}>
                <source src={this.callRingingTone} type="audio/mp3"/>
            </audio>
        </div>;
    }

    private getCallUnavailableContent() {
        return <div className="call-modal-content">
            {this.getUnavailableCalleeContent()}
            {this.getCallUnavailableActionContent()}
        </div>;
    }

    private getUnavailableCalleeContent() {
        const peer = this.peer;
        if (!peer) {
            return null;
        }
        if (peer.getType() === PeerType.PEERUSER) {
            return <>
                <UserAvatar key="call-user-bg" className="call-user-bg" id={peer.getId() || '0'} noDetail={true}
                            big={true}/>
                <div className="call-info">
                    <UserName className="callee-name" id={peer.getId() || '0'} noDetail={true}/>
                    <div className="call-status">
                        {this.getCallUnavailableTitle()}
                    </div>
                </div>
            </>;
        } else if (peer.getType() === PeerType.PEERGROUP) {
            return <>
                <GroupAvatar key="call-user-bg" className="call-user-bg" teamId={this.teamId} id={peer.getId() || '0'}
                             big={true}/>
                <div className="call-info">
                    <GroupName className="callee-name" teamId={this.teamId} id={peer.getId() || '0'} noIcon={true}/>
                    <div className="call-status">
                        {this.getCallUnavailableTitle()}
                    </div>
                </div>
            </>;
        }
        return null;
    }

    private getCallUnavailableTitle() {
        const {unavailableMode} = this.state;
        switch (unavailableMode) {
            case 'timeout':
                return i18n.t('call.call_timeout');
            case 'busy':
                return i18n.t('call.is_not_available');
        }
        return null;
    }

    private getCallUnavailableActionContent() {
        const {unavailableMode} = this.state;
        switch (unavailableMode) {
            case 'timeout':
            case 'busy':
                return (<div className="call-modal-action">
                    <div className="call-item call-normal" onClick={this.closeHandler}>
                        <CloseRounded/>
                    </div>
                    <div className="call-item call-accept" onClick={this.callHandler(true)}>
                        <div className="call-item-label">{i18n.t('call.call_back')}</div>
                        <CallRounded/>
                    </div>
                </div>);
        }
        return null;
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
                <CallSettings ref={this.callSettingsRefHandler} key="init-settings"
                              onMediaSettingsChange={this.mediaSettingsChangeHandler}/>
                <div className="call-buttons">
                    <div className="call-item call-end" onClick={this.closeHandler}>
                        <CallEndRounded/>
                    </div>
                    <div className="call-item call-accept" onClick={this.callHandler(true)}>
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
                <GroupAvatar className="callee-avatar" teamId={this.teamId} id={peer.getId() || '0'}/>
                <GroupName className="callee-name" teamId={this.teamId} id={peer.getId() || '0'}/>
            </div>;
        }
        return null;
    }

    private getCallContent() {
        const {fullscreen, animateState, callStarted, isCaller, cropCover, videoSwap, callId, minimize} = this.state;
        return <div id={!fullscreen ? 'draggable-call-modal' : undefined}
                    className={'call-modal-content animate-' + animateState + (videoSwap ? ' video-swap' : '')}>
            {/*{!callStarted && callUserId &&*/}
            {/*<UserAvatar className="call-user-bg rounded-avatar" id={callUserId} noDetail={true}/>}*/}
            <div className="local-video">
                <video ref={this.videoRefHandler} playsInline={true} autoPlay={true} muted={true}
                       onClick={this.videoClickHandler(false)} hidden={!this.mediaSettings.video}/>
            </div>
            {!this.mediaSettings.video &&
            <div className="local-video-placeholder" onClick={this.videoClickHandler(false)}>
                <UserAvatar className="local-video-user" id={currentUserId} noDetail={true}/>
            </div>}
            <CallVideo ref={this.callVideoRefHandler} callId={callId} userId={currentUserId}
                       onClick={this.videoClickHandler(true)}/>
            <div className="call-modal-header">
                <IconButton className="call-action-item" onClick={this.toggleCropHandler}>
                    {cropCover ? <CropLandscapeRounded/> : <CropSquareRounded/>}
                </IconButton>
                <IconButton className="call-action-item" onClick={this.toggleFullscreenHandler}>
                    {fullscreen ? <FullscreenExitRounded/> : <FullscreenRounded/>}
                </IconButton>
                <IconButton className="call-action-item" onClick={this.toggleMinimizeHandler}>
                    {minimize ? <WebAssetRounded/> : <DynamicFeedRounded/>}
                </IconButton>
            </div>
            {isCaller && !callStarted &&
            <audio autoPlay={true} src={this.callConnectingTone} loop={true} style={{display: 'none'}}>
                <source src={this.callConnectingTone} type="audio/mp3"/>
            </audio>}
            <div className="call-modal-action main-call-action">
                <CallSettings ref={this.callSettingsRefHandler} key="call-settings"
                              onMediaSettingsChange={this.mediaSettingsChangeHandler}/>
                <div className="call-item call-end" onClick={this.hangupCallHandler}>
                    <CallEndRounded/>
                </div>
                {callStarted && <div className="call-timer">
                    <CallTimer ref={this.callTimerRef}/>
                </div>}
            </div>
        </div>;
    }

    private callVideoRefHandler = (ref: any) => {
        this.callVideoRef = ref;
        if (this.callVideoRef && this.state.mode === 'call') {
            this.callVideoRef.initRemoteConnection();
        }
    }

    private callTimerRef = (ref: any) => {
        if (ref && this.timeStart) {
            ref.setTime(Math.floor((Date.now() - this.timeStart) / 1000));
        }
    }

    private videoClickHandler = (remote: boolean) => () => {
        if (!this.peer) {
            return;
        }
        if (this.peer.getType() === PeerType.PEERGROUP) {
            return;
        }
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
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.setState({
            animateState: 'init',
            callUserId: this.peer ? this.peer.getId() || '0' : null,
            cropCover: this.peer ? this.peer.getType() !== PeerType.PEERGROUP : false,
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
            const callFn = () => {
                this.callService.call(this.peer, this.getRecipients(), video).then((callId) => {
                    this.setState({
                        callId,
                    }, () => {
                        if (this.callVideoRef) {
                            this.callVideoRef.initRemoteConnection();
                        }
                        if (this.callSettingsRef) {
                            this.callSettingsRef.startAudioAnalyzer();
                        }
                    });
                }).catch(() => {
                    this.closeHandler();
                }).finally(() => {
                    this.loading = false;
                });
            };
            if (!this.callService.getLocalStream()) {
                this.callService.initStream(this.mediaSettings).then(() => {
                    callFn();
                });
            } else {
                callFn();
            }
        }
    }

    private callAcceptHandler = (video: boolean) => () => {
        this.setState({
            animateState: 'init',
            cropCover: this.peer ? this.peer.getType() !== PeerType.PEERGROUP : false,
            mode: 'call',
        });
        this.callService.accept(this.state.callId, video).then(() => {
            const stream = this.callService.getLocalStream();
            if (!stream) {
                return;
            }
            this.mediaSettings = this.callService.getStreamState();
            if (this.videoRef && stream) {
                this.setState({
                    animateState: 'end',
                });
                this.videoRef.srcObject = stream;
            }
            if (this.callVideoRef) {
                this.callVideoRef.initRemoteConnection();
            }
            if (this.callSettingsRef) {
                this.callSettingsRef.startAudioAnalyzer();
            }
        }).catch((err) => {
            window.console.log(err);
        });
    }

    private rejectCallHandler = () => {
        this.callService.reject(this.state.callId, Math.floor((this.timeEnd - this.timeStart) / 1000), DiscardReason.DISCARDREASONDISCONNECT).catch((err) => {
            window.console.log(err);
        });
        this.closeHandler();
    }

    private hangupCallHandler = () => {
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.callService.reject(this.state.callId, Math.floor((this.timeEnd - this.timeStart) / 1000), DiscardReason.DISCARDREASONHANGUP).then(() => {
            if (this.state.callStarted) {
                this.timeEnd = Date.now();
                this.setState({
                    callStarted: false,
                    isCaller: false,
                    mode: 'call_report',
                });
            } else {
                this.closeHandler();
            }
        }).finally(() => {
            this.loading = false;
        });
    }

    private eventCallRequestHandler = (data: IUpdatePhoneCall) => {
        if (this.state.mode !== 'call_request' && !window.document.hasFocus()) {
            const popupWin = window.open('url', 'call_request', 'scrollbars=no,resizable=yes, width=1,height=1,status=no,location=no,toolbar=no');
            if (popupWin) {
                popupWin.focus();
                popupWin.close();
            }
            window.focus();
        }

        if (this.state.callId === '0') {
            this.mainRepo.getInputPeerBy(data.peerid, data.peertype).then((peer) => {
                this.peer = peer;
            });
        }
        this.setState({
            callId: data.callid || '0',
            callUserId: data.userid || '0',
            mode: 'call_request',
            open: true,
        });
    }

    private eventCallAcceptHandler = ({connId, data}: { connId: number, data: IUpdatePhoneCall }) => {
        if (this.callVideoRef) {
            this.callVideoRef.setStarted(connId, true);
        }
    }

    private eventCallRejectHandler = (data: IUpdatePhoneCall) => {
        const {callId, isCaller} = this.state;
        this.callService.destroyConnections(callId);
        if (this.timeStart === 0) {
            if (isCaller) {
                this.setState({
                    mode: 'call_unavailable',
                    unavailableMode: 'busy',
                });
            } else {
                this.closeHandler();
            }
        } else {
            this.timeEnd = Date.now();
            this.setState({
                callStarted: false,
                isCaller: false,
                mode: 'call_report',
            });
            this.callService.destroy();
        }
    }

    private eventCallTimeoutHandler = () => {
        this.setState({
            mode: 'call_unavailable',
            unavailableMode: 'timeout',
        });
        this.callService.destroy();
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
        this.callVideoRef.setStarted(connId, true);
        this.callVideoRef.setStream(connId, streams);
        if (!this.timeStart) {
            this.timeStart = Date.now();
        }
        if (!this.state.callStarted) {
            this.setState({
                callStarted: true,
            });
        }
    }

    private eventLocalStreamUpdateHandler = (stream: MediaStream) => {
        if (!this.videoRef) {
            return;
        }

        this.videoRef.srcObject = stream;
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
            <div className="call-duration-value">{timerFormat(Math.floor((this.timeEnd - this.timeStart) / 1000))}</div>
        </div>;
    }

    private rateChangeHandler = (e: any, val: number | null) => {
        if (this.loading) {
            return;
        }
        this.loading = true;
        const {callId} = this.state;
        if (!this.peer || callId === '0') {
            this.closeHandler();
            return;
        }
        this.setState({
            rate: val,
        });
        this.apiManager.callRate(this.peer, callId, Math.floor(val || 0)).finally(() => {
            this.loading = false;
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

    private callSettingsRefHandler = (ref: any) => {
        this.callSettingsRef = ref;
    }

    private setTeam = (teamId: string) => {
        this.teamId = teamId;
    }

    private mediaSettingsChangeHandler = (settings: IMediaSettings) => {
        const {mode} = this.state;
        if (mode === 'call' && this.mediaSettings.video !== settings.video) {
            this.forceUpdate();
        }
        this.mediaSettings = clone(settings);
    }
}

export default CallModal;
