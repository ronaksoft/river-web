/*
    Creation Time: 2020 - Dec - 08
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {IconButton, ClickAwayListener, Menu, MenuItem} from "@material-ui/core";
import {
    MicOffRounded,
    MicRounded,
    VideocamOffRounded,
    VideocamRounded,
    PeopleRounded,
    StarsRounded,
    StarRateRounded,
    MoreVertRounded,
} from "@material-ui/icons";
import CallService, {C_CALL_EVENT, ICallParticipant} from "../../services/callService";
import i18n from '../../services/i18n';
import {clone} from "lodash";
import {getDefaultAudio} from "../SettingsMediaInput";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import Scrollbars from "react-custom-scrollbars";
import {currentUserId} from "../../services/sdk";

import './style.scss';

export interface IMediaSettings {
    video: boolean;
    audio: boolean;
}

interface IProps {
    onMediaSettingsChange?: (settings: IMediaSettings) => void;
    group?: boolean;
}

interface IState {
    currentParticipant: ICallParticipant | undefined;
    drawerOpen: boolean;
    mediaSettings: IMediaSettings;
    moreAnchorPos: any;
    muteNotice?: boolean;
    participants: ICallParticipant[];
    selectedUserId: string | undefined;
}

class CallSettings extends React.Component<IProps, IState> {
    private callService: CallService;
    private eventReferences: any[] = [];
    private audioContext: AudioContext | undefined;
    private audioAnalyserInterval: any;
    private audioStream: MediaStream | undefined;
    private mounted: boolean = true;
    private container: HTMLElement | undefined;
    private preventClosing: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.callService = CallService.getInstance();

        this.state = {
            currentParticipant: undefined,
            drawerOpen: false,
            mediaSettings: this.callService.getStreamState(),
            moreAnchorPos: null,
            muteNotice: false,
            participants: [],
            selectedUserId: undefined,
        };
    }

    public componentDidMount() {
        this.container = document.querySelector('.call-modal .call-modal-content');
        this.setState({
            mediaSettings: this.callService.getStreamState(),
            muteNotice: false,
        });
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.LocalStreamUpdated, this.eventLocalStreamUpdateHandler));
        if (this.props.group) {
            this.getParticipants();
        }
    }

    public componentWillUnmount() {
        this.mounted = false;
        this.stopAudioAnalyzer();
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public setMediaSettings({audio, video}: { audio: boolean, video: boolean }) {
        this.setState({
            mediaSettings: {
                audio,
                video,
            },
        });
        this.callService.toggleAudio(audio);
        this.callService.toggleVideo(video);
    }

    public startAudioAnalyzer() {
        if (this.audioContext || this.audioStream) {
            return;
        }
        this.initAudioAnalyzer();
    }

    public openContextMenu(userId: string, e: any) {
        const activeCallId = this.callService.getActiveCallId();
        if (!activeCallId) {
            return;
        }
        const currentParticipant = this.callService.getParticipantByUserId(activeCallId, currentUserId);
        if (currentParticipant && (currentParticipant.initiator || currentParticipant.admin)) {
            this.openMenuHandler(userId)(e);
        }
    }

    public render() {
        const {group} = this.props;
        const {mediaSettings, muteNotice, drawerOpen, moreAnchorPos} = this.state;
        return <>
            {group && <ClickAwayListener onClickAway={this.drawerCloseHandler}>
                <div className={'call-settings-drawer' + (drawerOpen ? ' drawer-open' : '')}
                     style={this.container ? {height: `${this.container.clientHeight}px`} : undefined}>
                    <div className="drawer-content">
                        <Scrollbars
                            style={{
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            {this.drawerContent()}
                        </Scrollbars>
                    </div>
                </div>
            </ClickAwayListener>}
            <div className="call-settings">
                {group && <IconButton className="call-settings-item" onClick={this.drawerOpenHandler}>
                    <PeopleRounded/>
                </IconButton>}
                <IconButton className="call-settings-item" onClick={this.mediaSettingsChangeHandler('video')}>
                    {mediaSettings.video ? <VideocamRounded/> : <VideocamOffRounded/>}
                </IconButton>
                <IconButton className="call-settings-item" onClick={this.mediaSettingsChangeHandler('audio')}>
                    {mediaSettings.audio ? <MicRounded/> : <MicOffRounded/>}
                </IconButton>
            </div>
            {muteNotice && <div className="call-settings-notice">{i18n.t('call.audio_muted')}</div>}
            <Menu
                anchorPosition={moreAnchorPos}
                anchorReference="anchorPosition"
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'top',
                }}
                open={Boolean(moreAnchorPos)}
                onClose={this.menuCloseHandler}
                className="kk-context-menu"
                classes={{
                    paper: 'kk-context-menu-paper'
                }}
            >
                {this.contextMenuContent()}
            </Menu>
        </>;
    }

    private mediaSettingsChangeHandler = (key: string) => (e: any) => {
        const {mediaSettings} = this.state;
        mediaSettings[key] = !mediaSettings[key];
        this.setState({
            mediaSettings,
        });
        if (key === 'audio') {
            this.callService.toggleAudio(mediaSettings[key]);
        } else if (key === 'video') {
            this.callService.toggleVideo(mediaSettings[key]);
        }
        if (this.props.onMediaSettingsChange) {
            this.props.onMediaSettingsChange(clone(mediaSettings));
        }
    }

    private eventLocalStreamUpdateHandler = () => {
        this.setState({
            mediaSettings: this.callService.getStreamState(),
        });
    }

    private initAudioAnalyzer = () => {
        if (!window.AudioContext) {
            return Promise.reject('no AudioContext');
        }
        return navigator.mediaDevices.getUserMedia({audio: getDefaultAudio()}).then((stream) => {
            this.audioStream = stream;
            const tracks = stream.getAudioTracks();
            if (tracks.length === 0) {
                return Promise.reject('no audio track');
            }
            this.audioContext = new AudioContext();
            const source = this.audioContext.createMediaStreamSource(stream);
            const audioAnalyser = this.audioContext.createAnalyser();
            audioAnalyser.minDecibels = -70;
            audioAnalyser.fftSize = 128;
            audioAnalyser.smoothingTimeConstant = 0.3;
            source.connect(audioAnalyser);
            const data = new Uint8Array(audioAnalyser.frequencyBinCount);
            const analyze = () => {
                if (!this.mounted) {
                    clearInterval(this.audioAnalyserInterval);
                    return;
                }
                if (this.state.mediaSettings.audio) {
                    return;
                }
                audioAnalyser.getByteFrequencyData(data);
                this.normalizeAnalyze(data);
            };
            this.audioAnalyserInterval = setInterval(analyze, 767);
            analyze();
            return Promise.resolve();
        });
    }

    private normalizeAnalyze(data: Uint8Array) {
        const len = data.length;
        const step = Math.floor(len / 10);
        let val = 0;
        for (let i = 0; i < 10; i++) {
            val += data[i * step];
        }
        val = val / 10;
        const {muteNotice} = this.state;
        if (val > 15 && !muteNotice) {
            this.setState({
                muteNotice: true,
            });
        } else if (val < 10 && muteNotice) {
            this.setState({
                muteNotice: false,
            });
        }
    }

    private stopAudioAnalyzer() {
        clearInterval(this.audioAnalyserInterval);
        if (this.audioStream) {
            this.audioStream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        if (!this.audioContext) {
            return;
        }
        this.audioContext.close();
        this.audioContext = undefined;
    }

    private drawerOpenHandler = () => {
        this.preventClose();
        if (!this.state.drawerOpen && this.state.participants.length === 0) {
            this.getParticipants();
        }
        this.setState({
            drawerOpen: !this.state.drawerOpen,
        });
    }

    private drawerCloseHandler = () => {
        if (this.preventClosing) {
            return;
        }
        if (this.state.drawerOpen) {
            this.setState({
                drawerOpen: false,
            });
        }
    }

    private preventClose() {
        this.preventClosing = true;
        setTimeout(() => {
            this.preventClosing = false;
        }, 127);
    }

    private getParticipants() {
        const activeCallId = this.callService.getActiveCallId();
        if (!activeCallId) {
            return;
        }
        const currentParticipant = this.callService.getParticipantByUserId(activeCallId, currentUserId);
        const participants = this.callService.getParticipantList(activeCallId, true);
        this.setState({
            currentParticipant,
            participants,
        });
    }

    private drawerContent() {
        const {participants, currentParticipant} = this.state;
        const hasAccess = currentParticipant && (currentParticipant.initiator || currentParticipant.admin);
        return participants.map((item) => {
            return (<div key={item.peer.userid} className="call-participant-item">
                <UserAvatar className="user-avatar" id={item.peer.userid} noDetail={true}/>
                {item.initiator ? <div className="user-badge"><StarsRounded/></div> : item.admin ?
                    <div className="user-badge"><StarRateRounded/></div> : null}
                <UserName className="user-name" id={item.peer.userid} noDetail={true} you={true} noIcon={true}/>
                {hasAccess && <div className="more" onClick={this.openMenuHandler(item.peer.userid)}>
                    <MoreVertRounded/>
                </div>}
            </div>);
        });
    }

    private openMenuHandler = (userId: string) => (e: any) => {
        this.setState({
            moreAnchorPos: {
                left: e.pageX - 64,
                top: e.pageY,
            },
            selectedUserId: userId,
        });
    }

    private contextMenuContent() {
        const menuItems = [];
        menuItems.push({
            cmd: 'remove',
            title: i18n.t('contact.remove'),
        });

        return menuItems.map((item, index) => {
            return (<MenuItem key={index} onClick={this.moreCmdHandler(item.cmd)}
                              className="context-item">{item.title}</MenuItem>);
        });
    }

    private moreCmdHandler = (cmd: string) => () => {
        const activeCallId = this.callService.getActiveCallId();
        if (!activeCallId) {
            this.menuCloseHandler();
            return;
        }

        const {selectedUserId} = this.state;
        switch (cmd) {
            case 'remove':
                this.callService.callRemoveParticipant(activeCallId, [selectedUserId], false);
                break;
        }
        this.menuCloseHandler();
    }

    private menuCloseHandler = () => {
        this.preventClose();
        this.setState({
            moreAnchorPos: null,
            selectedUserId: undefined,
        });
    }
}

export default CallSettings;
