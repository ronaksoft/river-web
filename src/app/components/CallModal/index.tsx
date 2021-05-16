/*
    Creation Time: 2020 - Nov - 04
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import {Dialog, Grow, IconButton, Tooltip} from '@material-ui/core';
import {TransitionProps} from '@material-ui/core/transitions';
import Draggable, {ControlPosition, DraggableData} from 'react-draggable';
import {InputPeer, InputUser, PeerType} from "../../services/sdk/messages/core.types_pb";
import CallService, {
    C_CALL_EVENT,
    ICallParticipant,
    IMediaSettings,
    IUpdatePhoneCall
} from "../../services/callService";
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
    CallMergeRounded,
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
import APIManager, {currentUserId} from "../../services/sdk";
import CallVideo from "../CallVideo";
import CallSettings from "../CallSettings";
import {clone, debounce} from "lodash";
import MainRepo from "../../repository";
import SettingsMediaInput from "../SettingsMediaInput";
import SettingsModal from "../SettingsModal";
import {C_ERR, C_ERR_ITEM, C_LOCALSTORAGE} from "../../services/sdk/const";
import {IUser} from "../../repository/user/interface";
import ScreenCaptureModal from "../ScreenCaptureModal";
import {EventResize} from "../../services/events";
import IsMobile from "../../services/isMobile";
import ElectronService from "../../services/electron";

import './style.scss';

const C_MINIMIZE_WIDTH = 240;
// const C_MINIMIZE_HEIGHT = 135;
const C_MINIMIZE__PADDING = 16;

interface IProps {
    height?: string;
}

interface IState {
    activeScreenShare: boolean;
    allAudio: boolean;
    animateState: string;
    callId: string;
    callStarted: boolean;
    callerId: string | null;
    cropCover: boolean;
    fullscreen: boolean;
    groupId: string | undefined;
    isCaller: boolean;
    localVideoInGrid: boolean;
    minimize: boolean;
    mode: 'call_init' | 'call_request' | 'call_join_request' | 'call' | 'call_report' | 'call_unavailable';
    open: boolean;
    rate: number | null;
    resetPosition: boolean;
    settingsOpen: boolean;
    unavailableMode: 'none' | 'timeout' | 'unavailable' | 'busy';
    videoSwap: boolean;
}

const TransitionEffect = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Grow ref={ref} {...props} />;
});

class CallModal extends React.Component<IProps, IState> {
    private teamId: string = '0';
    private peer: InputPeer | null = null;
    private readonly callService: CallService;
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
    private mediaSettings: IMediaSettings = {audio: true, screenShare: false, video: true};
    private callConnectingTone: string = '/ringingtone/connecting-1.mp3';
    private callRingingTone: string = '/ringingtone/tone-2.mp3';
    private loading: boolean = false;
    private videoCall: boolean = false;
    private readonly windowResizeDebounce: any = undefined;
    private readonly isMobile = IsMobile.isAny();
    private draggablePos: DraggableData = {
        deltaX: 0,
        deltaY: 0,
        lastX: 0,
        lastY: 0,
        node: window.document as any,
        x: 0,
        y: 0,
    };

    constructor(props: IProps) {
        super(props);

        this.state = {
            activeScreenShare: false,
            allAudio: false,
            animateState: 'init',
            callId: '0',
            callStarted: false,
            callerId: null,
            cropCover: !this.isMobile,
            fullscreen: false,
            groupId: undefined,
            isCaller: false,
            localVideoInGrid: false,
            minimize: false,
            mode: 'call_init',
            open: false,
            rate: null,
            resetPosition: false,
            settingsOpen: false,
            unavailableMode: 'none',
            videoSwap: false,
        };

        this.callService = CallService.getInstance();
        this.apiManager = APIManager.getInstance();
        this.mainRepo = MainRepo.getInstance();

        this.callService.setDialogOpenFunction(this.openDialog);
        this.callService.setSetTeamFunction(this.setTeam);

        this.windowResizeDebounce = debounce(this.windowResizeDebounceHandler, 511);
    }

    public openDialog = (peer: InputPeer | null, video: boolean, force?: boolean) => {
        if (!peer) {
            return;
        }
        this.videoCall = video;
        this.peer = clone(peer);
        const fn = () => {
            if (this.state.open) {
                return;
            }

            this.timeStart = 0;
            this.timeEnd = 0;
            if (this.peer.getType() === PeerType.PEERUSER) {
                this.showPreview(this.videoCall);
            } else if (this.peer.getType() === PeerType.PEERGROUP) {
                this.setState({
                    groupId: this.peer.getId() || '0',
                }, () => {
                    if (this.contactPickerRef) {
                        this.contactPickerRef.openDialogPromise().then((res) => {
                            if (res.ok) {
                                this.groupParticipant = res.contacts.map((u) => ({
                                    accesshash: u.accesshash,
                                    userid: u.id,
                                }));
                                this.showPreview(this.videoCall);
                            } else {
                                this.closeHandler();
                            }
                        });
                    }
                });
            }
        };
        if (force) {
            fn();
        } else {
            this.hasDefaultInputSettings().then(() => {
                fn();
            }).catch(() => {
                this.setState({
                    settingsOpen: true,
                });
            });
        }
    }

    public componentDidMount() {
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallRequested, this.eventCallRequestedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallJoinRequested, this.eventCallJoinRequestedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallAccepted, this.eventCallAcceptedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallPreview, this.eventCallJoinedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallRejected, this.eventCallRejectedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallTimeout, this.eventCallTimeoutHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallAck, this.eventCallAckHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallCancelled, this.eventCallCancelledHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.StreamUpdated, this.eventStreamUpdatedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.LocalStreamUpdated, this.eventLocalStreamUpdatedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.MediaSettingsUpdated, this.eventMediaSettingsUpdatedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.ParticipantLeft, this.eventParticipantLeftHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.ParticipantJoined, this.eventParticipantJoinedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.ParticipantRemoved, this.eventParticipantRemovedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.ShareScreenStreamUpdated, this.eventScreenShareSteamUpdatedHandler));
        window.addEventListener(EventResize, this.windowResizeHandler);
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
        window.removeEventListener(EventResize, this.windowResizeHandler);
    }

    public render() {
        const {open, mode, cropCover, groupId, minimize, settingsOpen} = this.state;
        let {fullscreen} = this.state;
        const disableClose = !(mode === 'call_init' || mode === 'call_report');
        const enableDrag = !this.isMobile && mode === 'call';
        if (this.isMobile && (mode === 'call' || mode === 'call_init')) {
            fullscreen = true;
        }
        const dialogRenderer = () => {
            return <Dialog
                key="call-modal"
                open={open}
                onClose={this.closeHandler}
                className={'call-modal ' + mode + (fullscreen ? ' fullscreen' : '') + (cropCover ? ' crop-cover' : ' crop-contain') + (minimize ? ' minimize' : '') + (this.isMobile ? ' mobile-vew' : '')}
                classes={{
                    paper: 'call-modal-paper',
                }}
                disableBackdropClick={disableClose}
                disableEscapeKeyDown={disableClose}
                disableEnforceFocus={true}
                fullScreen={mode === 'call_report' ? false : fullscreen}
                TransitionComponent={TransitionEffect}
            >
                {this.getContent()}
            </Dialog>;
        };
        return (
            <>
                {Boolean(enableDrag) ?
                    <Draggable handle="#draggable-call-modal" cancel={'[class*="MuiDialogContent-root"]'}
                               positionOffset={this.getDraggableOffset()} disabled={fullscreen}
                               onStop={this.draggableStopHandler}>
                        {dialogRenderer()}
                    </Draggable> : dialogRenderer()}
                <ContactPicker ref={this.contactPickerRefHandler} groupId={groupId} teamId={this.teamId}
                               sendIcon={<CheckRounded/>} title={i18n.t('general.choose_recipient')} limit={11}
                               selectAll={true}/>
                <SettingsModal open={settingsOpen} title={i18n.t('settings.media_input.title')}
                               icon={<CheckRounded/>} onDone={this.settingsModalDoneHandler}
                               onClose={this.settingsModalCloseHandler} height="486px" noScrollbar={true}
                >
                    <SettingsMediaInput/>
                </SettingsModal>
                <ScreenCaptureModal ref={this.screenCaptureModalRef}/>
            </>
        );
    }

    private settingsModalCloseHandler = () => {
        this.setState({
            settingsOpen: false,
        });
    }

    private settingsModalDoneHandler = () => {
        this.settingsModalCloseHandler();
        this.openDialog(this.peer, this.videoCall, true);
    }

    private draggableStopHandler = (e: any, data: DraggableData) => {
        this.draggablePos = data;
    }

    private getDraggableOffset(): ControlPosition | undefined {
        const xo = -320;
        const yo = -240;
        const {minimize} = this.state;
        if (!minimize) {
            return {
                x: xo,
                y: yo,
            };
        }
        const w = window.innerWidth;
        const h = window.innerHeight;
        return {
            x: (((w / 2) - C_MINIMIZE_WIDTH) - C_MINIMIZE__PADDING) - this.draggablePos.x,
            y: -((h / 2) - C_MINIMIZE__PADDING) - this.draggablePos.y,
        };
    }

    private closeHandler = () => {
        this.callService.destroyConnections(this.state.callId);
        this.callService.destroy();
        this.setState({
            allAudio: false,
            callId: '0',
            callStarted: false,
            cropCover: !this.isMobile,
            fullscreen: false,
            groupId: undefined,
            isCaller: false,
            localVideoInGrid: false,
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
        this.mediaSettings = {audio: true, screenShare: false, video: true};
        this.peer = null;
        this.loading = false;
        this.videoCall = false;
        this.draggablePos.x = 0;
        this.draggablePos.y = 0;
    }

    private toggleFullscreenHandler = () => {
        this.setState({
            fullscreen: !this.state.fullscreen,
            minimize: false,
        }, () => {
            if (this.callVideoRef) {
                this.callVideoRef.resize(this.state.fullscreen);
            }
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
            }, () => {
                if (this.callVideoRef) {
                    this.callVideoRef.resize(this.state.fullscreen);
                }
            });
        }
    }

    private showPreview(video: boolean, callId?: string, disableVideo?: boolean, isJoin?: boolean) {
        this.timeStart = 0;
        this.timeEnd = 0;
        const state: Partial<IState> = {
            fullscreen: false,
            mode: video ? 'call_init' : 'call',
            open: true,
            unavailableMode: 'none',
        };
        if (callId) {
            state.callId = callId;
        }
        this.mediaSettings.video = video;
        const useVideo = video && disableVideo !== true;
        this.setState(state as any, () => {
            this.initMediaStreams(useVideo).then((stream) => {
                if (this.videoRef) {
                    this.videoRef.srcObject = stream;
                }
                if (!video) {
                    this.callHandler()();
                }
            });
        });
    }

    private getContent() {
        const {mode} = this.state;
        switch (mode) {
            case 'call_request':
            case 'call_join_request':
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
        const {callerId, mode} = this.state;
        const mediaDevice = this.callService.getMediaDevice();
        const join = mode === 'call_join_request';
        return <div className="call-modal-content">
            {callerId && (callerId.indexOf('-') === -1 ?
                <UserAvatar className="call-user-bg" id={callerId} noDetail={true} big={true}/> :
                <GroupAvatar className="call-user-bg" id={callerId} teamId={this.teamId} big={true}/>)}
            <div className="call-info">
                {callerId && (callerId.indexOf('-') === -1 ?
                    <UserName className="call-user-name" id={callerId} noDetail={true} noIcon={true}/> :
                    <GroupName className="call-user-name" id={callerId} teamId={this.teamId} noIcon={true}/>)}
                <div className="call-status">
                    {i18n.t('call.is_calling')}
                </div>
            </div>
            <div className="call-modal-action">
                <div className="call-item call-end" onClick={this.rejectCallHandler}>
                    <CallEndRounded/>
                </div>
                <div className="call-item call-accept"
                     onClick={join ? this.callJoinHandler(false) : this.callAcceptHandler(false)}>
                    <CallRounded/>
                </div>
                {mediaDevice.video &&
                <div className="call-item call-accept"
                     onClick={join ? this.callJoinHandler(true) : this.callAcceptHandler(true)}>
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
                return i18n.t('call.is_busy');
            case 'unavailable':
                return i18n.t('call.is_not_available');
        }
        return null;
    }

    private getCallUnavailableActionContent() {
        const {unavailableMode} = this.state;
        switch (unavailableMode) {
            case 'timeout':
            case 'busy':
            case 'unavailable':
                return (<div className="call-modal-action">
                    <div className="call-item call-normal" onClick={this.closeHandler}>
                        <CloseRounded/>
                    </div>
                    <div className="call-item call-accept" onClick={this.callHandler()}>
                        <div className="call-item-label">{i18n.t('call.call_back')}</div>
                        <CallRounded/>
                    </div>
                </div>);
        }
        return null;
    }

    private getCallInitContent() {
        const {fullscreen, cropCover, callId} = this.state;
        return <div id={!fullscreen ? 'draggable-call-modal' : undefined} className="call-modal-content">
            <video ref={this.videoRefHandler} playsInline={true} autoPlay={true} muted={true}/>
            <div className="call-modal-header">
                <Tooltip enterDelay={500} title={i18n.t(cropCover ? 'call.crop_fit' : 'call.crop_cover')}>
                    <IconButton className="call-action-item" onClick={this.toggleCropHandler}>
                        {cropCover ? <CropLandscapeRounded/> : <CropSquareRounded/>}
                    </IconButton>
                </Tooltip>
                {!this.isMobile &&
                <Tooltip enterDelay={500} title={i18n.t(fullscreen ? 'call.exit_fullscreen' : 'call.fullscreen')}>
                    <IconButton className="call-action-item" onClick={this.toggleFullscreenHandler}>
                        {fullscreen ? <FullscreenExitRounded/> : <FullscreenRounded/>}
                    </IconButton>
                </Tooltip>}
                <Tooltip enterDelay={500} title={i18n.t('general.close')}>
                    <IconButton className="call-action-item" onClick={this.closeHandler}>
                        <CloseRounded/>
                    </IconButton>
                </Tooltip>
            </div>
            <div className="call-info">
                {this.getCalleeContent()}
            </div>
            <div className="call-modal-action">
                <CallSettings ref={this.callSettingsRefHandler} key="init-settings"
                              onMediaSettingsChange={this.mediaSettingsChangeHandler}/>
                {Boolean(callId === '0') ? <div className="call-buttons">
                    {/*<div className="call-item call-end" onClick={this.closeHandler}>
                        <CallEndRounded/>
                    </div>*/}
                    <div className="call-item call-accept" onClick={this.callHandler()}>
                        <CallRounded/>
                    </div>
                </div> : <div className="call-buttons">
                    <div className="call-item call-end" onClick={this.closeHandler}>
                        <CallEndRounded/>
                    </div>
                    <div className="call-item call-accept" onClick={this.callHandler(callId)}>
                        <div className="call-item-label">{i18n.t('call.join')}</div>
                        <CallMergeRounded/>
                    </div>
                </div>}
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
        const {fullscreen, animateState, callStarted, isCaller, cropCover, videoSwap, callId, minimize, localVideoInGrid, allAudio, activeScreenShare} = this.state;
        const isGroup = this.peer && this.peer.getType() === PeerType.PEERGROUP;
        return <div id={!fullscreen ? 'draggable-call-modal' : undefined}
                    className={'call-modal-content animate-' + animateState + (videoSwap ? ' video-swap' : '') + (isGroup ? ' group-call' : '')}>
            {!localVideoInGrid &&
            <Draggable handle="#draggable-call-local-video" cancel={'[class*="MuiDialogContent-root"]'}
                       disabled={!fullscreen} position={!fullscreen || videoSwap ? {x: 0, y: 0} : undefined}>
                <div className="local-video" id="draggable-call-local-video">
                    <video ref={this.videoRefHandler} playsInline={true} autoPlay={true} muted={true}
                           onClick={this.videoClickHandler(false)} hidden={!this.mediaSettings.video}/>
                    {!this.mediaSettings.video &&
                    <div className="local-video-placeholder" onClick={this.videoClickHandler(false)}>
                        <UserAvatar className="local-video-user" id={currentUserId} noDetail={true}/>
                    </div>}
                </div>
            </Draggable>}
            <CallVideo ref={this.callVideoRefHandler} callId={callId} userId={currentUserId}
                       onClick={this.videoClickHandler(true)} onContextMenu={this.callVideoContextMenuHandler}/>
            <div className="call-modal-header">
                {(!allAudio || activeScreenShare) &&
                <Tooltip enterDelay={500} title={i18n.t(cropCover ? 'call.crop_fit' : 'call.crop_cover')}>
                    <IconButton className="call-action-item" onClick={this.toggleCropHandler}>
                        {cropCover ? <CropLandscapeRounded/> : <CropSquareRounded/>}
                    </IconButton>
                </Tooltip>}
                {!this.isMobile &&
                <Tooltip enterDelay={500} title={i18n.t(fullscreen ? 'call.exit_fullscreen' : 'call.fullscreen')}>
                    <IconButton className="call-action-item" onClick={this.toggleFullscreenHandler}>
                        {fullscreen ? <FullscreenExitRounded/> : <FullscreenRounded/>}
                    </IconButton>
                </Tooltip>}
                {!this.isMobile && (!isGroup || allAudio) &&
                <Tooltip enterDelay={500} title={i18n.t(minimize ? 'call.normal_size' : 'call.minimize')}>
                    <IconButton className="call-action-item" onClick={this.toggleMinimizeHandler}>
                        {minimize ? <WebAssetRounded/> : <DynamicFeedRounded/>}
                    </IconButton>
                </Tooltip>}
            </div>
            {isCaller && !callStarted &&
            <audio autoPlay={true} src={this.callConnectingTone} loop={true} style={{display: 'none'}}>
                <source src={this.callConnectingTone} type="audio/mp3"/>
            </audio>}
            <div className="call-modal-action main-call-action">
                <CallSettings ref={this.callSettingsRefHandler} key="call-settings"
                              onMediaSettingsChange={this.mediaSettingsChangeHandler} group={isGroup}
                              onAddParticipant={this.callSettingsAddParticipantHandler}
                />
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
            this.callVideoRef.addLocalVideo(this.state.localVideoInGrid, this.videoRefHandler);
            this.callVideoRef.initRemoteConnection();
        }
    }

    private callVideoContextMenuHandler = (userId: string) => (e: any) => {
        e.preventDefault();
        if (this.callSettingsRef && this.peer && this.peer.getType() === PeerType.PEERGROUP) {
            this.callSettingsRef.openContextMenu(userId, e);
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
            if (!remote && this.callVideoRef && !this.state.localVideoInGrid) {
                this.callVideoRef.addLocalVideo(true, this.videoRefHandler);
                this.setState({
                    localVideoInGrid: true,
                });
            }
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

    private callHandler = (callId?: string) => () => {
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.setState({
            animateState: 'init',
            callerId: this.peer ? this.peer.getId() || '0' : null,
            cropCover: this.peer ? this.peer.getType() !== PeerType.PEERGROUP : false,
            groupId: this.peer && this.peer.getType() === PeerType.PEERGROUP ? this.peer.getId() || '0' : undefined,
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
                this.callService.start(this.peer, this.getRecipients(), callId).then((callId) => {
                    this.setState({
                        callId,
                    }, () => {
                        if (this.callVideoRef) {
                            this.callVideoRef.initRemoteConnection();
                        }
                        if (this.callSettingsRef) {
                            this.callSettingsRef.startAudioAnalyzer();
                        }
                        this.checkLocalGroupVideo();
                    });
                }).catch((err) => {
                    if (err && ((err.code === C_ERR.ErrCodeAccess && err.items === C_ERR_ITEM.ErrItemUserID) || (err.code === C_ERR.ErrCodeInvalid && err.items === C_ERR_ITEM.ErrItemAccessHash))) {
                        this.callService.enqueueSnackbar(i18n.t('call.privacy_error'));
                    } else {
                        window.console.log(err);
                    }
                    this.closeHandler();
                }).finally(() => {
                    this.loading = false;
                });
            };
            if (!this.callService.getLocalStream()) {
                this.callService.initStream({
                    audio: this.mediaSettings.audio,
                    video: this.mediaSettings.video,
                }).then(() => {
                    callFn();
                });
            } else {
                callFn();
            }
        }
    }

    private callAcceptHandler = (video: boolean) => () => {
        this.setState({
            animateState: 'end',
            cropCover: this.peer ? this.peer.getType() !== PeerType.PEERGROUP : false,
            groupId: this.peer && this.peer.getType() === PeerType.PEERGROUP ? this.peer.getId() || '0' : undefined,
            mode: 'call',
        });
        this.callService.accept(this.state.callId, video).then(() => {
            const stream = this.callService.getLocalStream();
            if (!stream) {
                return;
            }
            this.mediaSettings = this.callService.getStreamState();
            if (this.videoRef && stream) {
                this.videoRef.srcObject = stream;
            }
            if (this.callVideoRef) {
                this.callVideoRef.initRemoteConnection();
            }
            if (this.callSettingsRef) {
                this.callSettingsRef.startAudioAnalyzer();
            }
            this.forceUpdate();
        }).catch((err) => {
            window.console.log(err);
        });
    }

    private callJoinHandler = (video: boolean) => () => {
        this.initMediaStreams(video).then(() => {
            this.mediaSettings.video = video;
            this.callHandler(this.state.callId)();
        });
    }

    private initMediaStreams(video: boolean) {
        return this.callService.initStream({
            audio: true,
            video: video,
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
                    fullscreen: false,
                    isCaller: false,
                    mode: 'call_report',
                });
                if (this.callService) {
                    this.callService.destroy();
                    this.callService.destroyConnections(this.state.callId);
                }
            } else if (this.state.mode !== 'call_report') {
                this.closeHandler();
            }
        }).catch((err) => {
            if (err && err.code === C_ERR.ErrCodeAccess && err.items === C_ERR_ITEM.ErrItemCall) {
                this.closeHandler();
            }
        }).finally(() => {
            this.loading = false;
        });
    }

    private focus() {
        if (this.state.mode !== 'call_request' && this.state.mode !== 'call_join_request' && !window.document.hasFocus()) {
            if (ElectronService.isElectron()) {
                ElectronService.getInstance().focus();
            } else {
                const popupWin = window.open('url', 'call_request', 'scrollbars=no,resizable=yes, width=1,height=1,status=no,location=no,toolbar=no');
                if (popupWin) {
                    popupWin.focus();
                    popupWin.close();
                }
                window.focus();
            }
        }
    }

    private eventCallRequestedHandler = (data: IUpdatePhoneCall) => {
        this.focus();
        if (this.state.callId === '0') {
            this.mainRepo.getInputPeerBy(data.peerid, data.peertype).then((peer) => {
                this.peer = peer;
            });
        }
        this.setState({
            callId: data.callid || '0',
            callerId: data.peerid || '0',
            mode: 'call_request',
            open: true,
        });
    }

    private eventCallJoinRequestedHandler = ({callId, calleeId, peer}: { callId: string, calleeId: string, peer: InputPeer }) => {
        this.focus();
        this.peer = peer;
        this.setState({
            callId: callId,
            callerId: peer.getId() || '0',
            mode: 'call_join_request',
            open: true,
        });
    }

    private eventCallAcceptedHandler = ({connId, data}: { connId: number, data: IUpdatePhoneCall }) => {
        if (this.callVideoRef) {
            this.callVideoRef.setStatus(connId, 2);
        }
    }

    private eventCallJoinedHandler = ({peer, callId}: { peer: InputPeer, callId: string }) => {
        this.peer = peer;
        this.showPreview(true, callId, true);
    }

    private eventCallRejectedHandler = ({reason}: { reason: DiscardReason }) => {
        if (this.state.mode === 'call_report') {
            return;
        }
        const {callId, isCaller} = this.state;
        this.callService.destroyConnections(callId);
        if (this.timeStart === 0) {
            if (isCaller) {
                this.setState({
                    mode: 'call_unavailable',
                    unavailableMode: reason === DiscardReason.DISCARDREASONBUSY ? 'busy' : 'unavailable',
                });
            } else {
                this.closeHandler();
            }
        } else {
            this.timeEnd = Date.now();
            this.setState({
                callStarted: false,
                fullscreen: false,
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

    private eventCallAckHandler = (connId: number) => {
        if (this.callVideoRef) {
            this.callVideoRef.setStatus(connId, 1);
        }
    }

    private eventCallCancelledHandler = ({callId}: { callId: string }) => {
        if ((this.state.mode === 'call_request' || this.state.mode === 'call_join_request') && this.state.callId === callId) {
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

    private eventStreamUpdatedHandler = ({connId, stream}: { connId: number, stream: MediaStream }) => {
        if (!this.state.callStarted) {
            this.setState({
                callStarted: true,
            });
        }

        if (!this.callVideoRef) {
            return;
        }

        this.callVideoRef.initRemoteConnection(true);
        const participant = this.callService.participantByConnId(connId);
        this.callVideoRef.setStatus(connId, 2, participant ? participant.deviceType : undefined);
        this.callVideoRef.setStream(connId, stream);
        if (!this.timeStart) {
            this.timeStart = Date.now();
        }
    }

    private eventLocalStreamUpdatedHandler = (stream: MediaStream) => {
        if (this.videoRef) {
            this.videoRef.srcObject = stream;
            const allAudio = this.callService.areAllAudio();
            if (this.state.allAudio !== allAudio) {
                this.setState({
                    allAudio,
                }, this.checkMinimize);
            }
        }
        this.checkLocalGroupVideo();
    }

    private checkLocalGroupVideo() {
        // add video to CallVideo in group calls
        if (this.callVideoRef && this.peer && this.peer.getType() === PeerType.PEERGROUP && !this.state.localVideoInGrid) {
            this.callVideoRef.addLocalVideo(true, this.videoRefHandler);
            this.setState({
                localVideoInGrid: true,
            }, this.checkMinimize);
        }
    }

    private checkMinimize = () => {
        const isGroup = this.peer && this.peer.getType() === PeerType.PEERGROUP;
        const {allAudio, activeScreenShare} = this.state;
        if (!isGroup && allAudio && !activeScreenShare) {
            this.setState({
                fullscreen: false,
                minimize: true,
            });
        } else {
            this.setState({
                minimize: false,
            }, () => {
                if (this.callVideoRef) {
                    this.callVideoRef.resize(this.state.fullscreen);
                }
            });
        }
    }

    private eventMediaSettingsUpdatedHandler = (data: ICallParticipant) => {
        if (!this.callVideoRef) {
            return;
        }

        this.callVideoRef.setMediaSettings(data.connectionid || 0, data.mediaSettings);

        const allAudio = this.callService.areAllAudio();
        if (this.state.allAudio !== allAudio) {
            this.setState({
                allAudio,
            }, this.checkMinimize);
        }
    }

    private eventParticipantLeftHandler = (data: IUpdatePhoneCall) => {
        if (!this.callVideoRef) {
            return;
        }

        this.callVideoRef.initRemoteConnection();

        if (this.callService) {
            this.callService.enqueueSnackbar(<div className="call-notification">
                <UserAvatar className="user-avatar" id={data.userid} noDetail={true}/>
                <UserName className="user-name" id={data.userid} noDetail={true} you={true} noIcon={true}
                          format={i18n.t('call.user_left_the_call')}/>
            </div>);
        }
    }

    private eventParticipantRemovedHandler = ({timeout, userIds}: { timeout: boolean, userIds: string[] }) => {
        if (!this.callVideoRef) {
            return;
        }

        this.callVideoRef.initRemoteConnection();

        if (this.callService) {
            userIds.forEach((userId) => {
                this.callService.enqueueSnackbar(<div className="call-notification">
                    <UserAvatar className="user-avatar" id={userId} noDetail={true}/>
                    <UserName className="user-name" id={userId} noDetail={true} you={true} noIcon={true}
                              format={i18n.t(timeout ? 'call.user_not_answering' : 'call.user_kicked')}/>
                </div>);
            });
        }
    }

    private eventParticipantJoinedHandler = ({userIds}: { userIds: string[] }) => {
        if (!this.callVideoRef) {
            return;
        }

        this.callVideoRef.initRemoteConnection();

        if (this.callService) {
            userIds.forEach((userId) => {
                this.callService.enqueueSnackbar(<div className="call-notification">
                    <UserAvatar className="user-avatar" id={userId} noDetail={true}/>
                    <UserName className="user-name" id={userId} noDetail={true} you={true} noIcon={true}
                              format={i18n.t('call.user_joined_the_call')}/>
                </div>);
            });
        }
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

    private callSettingsRefHandler = (ref: any) => {
        this.callSettingsRef = ref;
    }

    private screenCaptureModalRef = (ref: any) => {
        if (ref) {
            this.callService.setGetScreenCapture(ref.open);
        }
    }

    private callSettingsAddParticipantHandler = (users: IUser[]) => {
        const {callId} = this.state;
        if (this.contactPickerRef) {
            this.contactPickerRef.openDialogPromise(users).then((res) => {
                if (res.ok && res.contacts.length > 0) {
                    const inputUsers: InputUser[] = [];
                    res.contacts.forEach((contact) => {
                        const inputUser = new InputUser();
                        inputUser.setAccesshash(contact.accesshash);
                        inputUser.setUserid(contact.id);
                        inputUsers.push(inputUser);
                    });
                    this.callService.groupAddParticipant(callId, inputUsers).then((res) => {
                        window.console.log(res);
                    });
                }
            });
        }
    }

    private setTeam = (teamId: string) => {
        this.teamId = teamId;
    }

    private mediaSettingsChangeHandler = (settings: IMediaSettings) => {
        const {mode} = this.state;
        let forceUpdate = false;
        if (mode === 'call' && this.mediaSettings.video !== settings.video) {
            forceUpdate = true;
        }
        this.mediaSettings = clone(settings);
        if (forceUpdate) {
            this.forceUpdate();
        }
    }

    private hasDefaultInputSettings() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return Promise.resolve();
        }

        return navigator.mediaDevices.enumerateDevices().then((res) => {
            let audio: number = 0;
            let video: number = 0;
            res.forEach((item) => {
                if (item.kind === 'audioinput') {
                    audio++;
                } else if (item.kind === 'videoinput') {
                    video++;
                }
            });
            if (audio <= 1 && video <= 1) {
                return Promise.resolve();
            } else {
                const defaultAudio = localStorage.getItem(C_LOCALSTORAGE.SettingsDefaultAudio);
                const defaultVideo = localStorage.getItem(C_LOCALSTORAGE.SettingsDefaultVideo);
                if (defaultAudio && defaultVideo) {
                    return Promise.resolve();
                } else {
                    return Promise.reject();
                }
            }
        });
    }

    private windowResizeHandler = () => {
        if (this.state.minimize) {
            this.windowResizeDebounce();
        }
    }

    private windowResizeDebounceHandler = () => {
        this.forceUpdate();
    }

    private eventScreenShareSteamUpdatedHandler = ({stream}: { connId: number, stream: MediaStream | undefined, userId: string }) => {
        this.setState({
            activeScreenShare: Boolean(stream),
            cropCover: !(this.state.cropCover && Boolean(stream)),
        }, this.checkMinimize);
    }
}

export default CallModal;
