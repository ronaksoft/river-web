/*
    Creation Time: 2020 - Dec - 08
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
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
    PersonAddAlt1Rounded,
    ScreenShareRounded,
    StopScreenShareRounded,
} from "@material-ui/icons";
import CallService, {
    C_CALL_EVENT,
    getMediaInputs,
    ICallParticipant,
    IMediaDevice,
    IMediaSettings
} from "../../services/callService";
import i18n from '../../services/i18n';
import {clone, findIndex, orderBy} from "lodash";
import {getDefaultAudio} from "../SettingsMediaInput";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import Scrollbars from "react-custom-scrollbars";
import {currentUserId} from "../../services/sdk";
import {IUser} from "../../repository/user/interface";
import VoiceActivityDetection from "../../services/vad";
import IsMobile from "../../services/isMobile";

import './style.scss';

interface IProps {
    onMediaSettingsChange?: (settings: IMediaSettings) => void;
    group?: boolean;
    onAddParticipant?: (users: IUser[]) => void;
}

interface IState {
    activeScreenShare: boolean;
    allConnected: boolean;
    currentParticipant: ICallParticipant | undefined;
    drawerOpen: boolean;
    isAdmin: boolean;
    loading: boolean;
    mediaDevice: IMediaDevice;
    mediaSettings: IMediaSettings;
    moreAnchorPos: any;
    muteNotice?: boolean;
    participants: ICallParticipant[];
    selectedUserId: string | undefined;
}

class CallSettings extends React.Component<IProps, IState> {
    private callService: CallService;
    private eventReferences: any[] = [];
    private vad: VoiceActivityDetection | undefined;
    private container: HTMLElement | undefined;
    private preventClosing: boolean = false;
    private readonly isMobile = IsMobile.isAny();

    constructor(props: IProps) {
        super(props);

        this.callService = CallService.getInstance();

        this.state = {
            activeScreenShare: false,
            allConnected: false,
            currentParticipant: undefined,
            drawerOpen: false,
            isAdmin: false,
            loading: false,
            mediaDevice: {
                screenShare: false,
                speaker: true,
                video: true,
                voice: true,
            },
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
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.LocalStreamUpdated, this.eventLocalStreamUpdatedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.AllConnected, this.eventAllConnectedHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.ShareScreenStreamUpdated, this.eventShareMediaStreamUpdateHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.MediaSettingsUpdated, this.eventMediaSettingsUpdatedHandler));
        getMediaInputs().then((mediaDevice) => {
            this.setState({
                mediaDevice,
            });
        });
    }

    public componentWillUnmount() {
        if (this.vad) {
            this.vad.destroy(true);
        }
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public startAudioAnalyzer() {
        this.initAudioAnalyzer();
    }

    public openContextMenu(userId: string, e: any) {
        this.getParticipants(false);
        this.openMenuHandler(userId)(e);
    }

    public render() {
        const {group} = this.props;
        const {mediaSettings, muteNotice, drawerOpen, moreAnchorPos, mediaDevice, allConnected, activeScreenShare} = this.state;
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
                {mediaDevice.video &&
                <IconButton className="call-settings-item" onClick={this.mediaSettingsChangeHandler('video')}
                            disabled={mediaSettings.screenShare || activeScreenShare}>
                    {mediaSettings.video ? <VideocamRounded/> : <VideocamOffRounded/>}
                </IconButton>}
                {mediaDevice.voice &&
                <IconButton className="call-settings-item" onClick={this.mediaSettingsChangeHandler('audio')}>
                    {mediaSettings.audio ? <MicRounded/> : <MicOffRounded/>}
                </IconButton>}
                {!this.isMobile && allConnected && mediaDevice.screenShare &&
                <IconButton className="call-settings-item screen-share"
                            onClick={this.mediaSettingsChangeHandler('screenShare')}>
                    {mediaSettings.screenShare ? <StopScreenShareRounded/> : <ScreenShareRounded/>}
                </IconButton>}
            </div>
            {group && <IconButton className="call-settings-participants" onClick={this.drawerOpenHandler}>
                <PeopleRounded/>
            </IconButton>}
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

    private mediaSettingsChangeHandler = (key: 'audio' | 'video' | 'screenShare') => (e: any) => {
        const {mediaSettings, loading} = this.state;
        if (loading) {
            return;
        }
        this.setState({
            loading: true,
        });
        const enable = !mediaSettings[key];
        const promise = new Promise((resolve, reject) => {
            if (key === 'audio') {
                this.callService.toggleAudio(enable);
                if (this.vad) {
                    this.vad.setActive(!enable);
                }
                resolve(null);
            } else if (key === 'video') {
                this.callService.toggleVideo(enable).then(resolve).catch(reject);
            } else if (key === 'screenShare') {
                this.callService.toggleScreenShare(enable).then(resolve).catch(reject);
            } else {
                resolve(null);
            }
        });
        promise.then(() => {
            mediaSettings[key] = !mediaSettings[key];
            this.setState({
                loading: false,
                mediaSettings,
            });
            if (this.props.onMediaSettingsChange) {
                this.props.onMediaSettingsChange(clone(mediaSettings));
            }
        }).catch(() => {
            this.setState({
                loading: false,
            });
        });
    }

    private eventLocalStreamUpdatedHandler = () => {
        this.setState({
            mediaSettings: this.callService.getStreamState(),
        }, () => {
            if (this.vad) {
                this.vad.setActive(!this.state.mediaSettings.audio);
            }
        });
    }

    private eventAllConnectedHandler = () => {
        if (!this.state.allConnected) {
            this.setState({
                allConnected: true,
            });
        }
    }

    private eventShareMediaStreamUpdateHandler = ({stream}: { connId: number, stream: MediaStream | undefined, userId: string }) => {
        if (stream && !this.state.activeScreenShare) {
            this.setState({
                activeScreenShare: true,
            });
        } else if (!stream && this.state.activeScreenShare) {
            this.setState({
                activeScreenShare: false,
            });
        }
    }

    private eventMediaSettingsUpdatedHandler = (data: ICallParticipant) => {
        if (data.peer.userid === currentUserId) {
            this.setState({
                mediaSettings: data.mediaSettings,
            });
        }
    }

    private initAudioAnalyzer = () => {
        if (!window.AudioContext) {
            return Promise.reject('no AudioContext');
        }
        this.vad = new VoiceActivityDetection();
        this.vad.onActivity((val) => {
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
        });
        return navigator.mediaDevices.getUserMedia({audio: getDefaultAudio()}).then((stream) => {
            return this.vad.setStream(stream, !this.state.mediaSettings.audio);
        });
    }

    private drawerOpenHandler = () => {
        this.preventClose();
        if (!this.state.drawerOpen) {
            this.getParticipants(true);
        } else {
            this.setState({
                drawerOpen: false,
            });
        }
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

    private getParticipants(open: boolean) {
        const activeCallId = this.callService.getActiveCallId();
        if (!activeCallId) {
            return;
        }
        const currentParticipant = this.callService.getParticipantByUserId(activeCallId, currentUserId);
        const participants = orderBy(this.callService.getParticipantList(activeCallId, true), ['admin'], ['desc']);
        this.setState({
            currentParticipant,
            drawerOpen: open,
            participants,
        });
    }

    private drawerContent() {
        const {participants, currentParticipant} = this.state;
        const hasAccess = currentParticipant && (currentParticipant.initiator || currentParticipant.admin);
        return <>
            {hasAccess && <div className="call-participant-item add-participant" onClick={this.addParticipantHandler}>
                <div className="action-icon">
                    <PersonAddAlt1Rounded/>
                </div>
                <div className="user-name">{i18n.t('call.add_participant')}</div>
            </div>}
            {participants.map((item) => {
                return (<div key={item.peer.userid} className="call-participant-item">
                    <UserAvatar className="user-avatar" id={item.peer.userid} noDetail={true}/>
                    {item.initiator ? <div className="user-badge"><StarsRounded/></div> : item.admin ?
                        <div className="user-badge"><StarRateRounded/></div> : null}
                    <UserName className="user-name" id={item.peer.userid} noDetail={true} you={true} noIcon={true}/>
                    {hasAccess && !item.initiator &&
                    <div className="more" onClick={this.openMenuHandler(item.peer.userid)}>
                        <MoreVertRounded/>
                    </div>}
                </div>);
            })}
        </>;
    }

    private openMenuHandler = (userId: string) => (e: any) => {
        const activeCallId = this.callService.getActiveCallId();
        if (!activeCallId) {
            return;
        }
        const currentParticipant = this.callService.getParticipantByUserId(activeCallId, currentUserId);
        this.setState({
            isAdmin: currentParticipant && (currentParticipant.initiator || currentParticipant.admin),
            moreAnchorPos: {
                left: e.pageX - 96,
                top: e.pageY,
            },
            selectedUserId: userId,
        });
    }

    private contextMenuContent() {
        const {selectedUserId, participants, isAdmin} = this.state;
        const menuItems = [];
        window.console.log(participants);
        const index = findIndex(participants, o => o.peer.userid === selectedUserId);
        if (isAdmin) {
            if (index > -1) {
                if (participants[index].admin) {
                    menuItems.push({
                        cmd: 'demote',
                        title: i18n.t('contact.demote'),
                    });
                } else {
                    menuItems.push({
                        cmd: 'promote',
                        title: i18n.t('contact.promote'),
                    });
                }
            }
            menuItems.push({
                cmd: 'remove',
                title: i18n.t('contact.remove'),
            });
        }
        if (index > -1) {
            if (!participants[index].muted) {
                menuItems.push({
                    cmd: 'mute',
                    title: i18n.t('call.mute'),
                });
            } else {
                menuItems.push({
                    cmd: 'unmute',
                    title: i18n.t('call.unmute'),
                });
            }
        }

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

        const {selectedUserId, participants} = this.state;
        switch (cmd) {
            case 'promote':
            case 'demote':
                const admin = cmd === 'promote';
                this.callService.callUpdateAdmin(activeCallId, selectedUserId, admin).then(() => {
                    const index = findIndex(participants, o => o.peer.userid === selectedUserId);
                    if (index > -1) {
                        participants[index].admin = admin;
                        this.setState({
                            participants,
                        });
                    }
                });
                break;
            case 'remove':
                this.callService.callRemoveParticipant(activeCallId, [selectedUserId], false).then(() => {
                    const index = findIndex(participants, o => o.peer.userid === selectedUserId);
                    if (index > -1) {
                        participants.splice(index, 1);
                        this.setState({
                            participants,
                        });
                    }
                });
                break;
            case 'mute':
            case 'unmute':
                const mute = cmd === 'mute';
                this.callService.setParticipantMute(selectedUserId, mute);
                const index = findIndex(participants, o => o.peer.userid === selectedUserId);
                if (index > -1) {
                    participants[index].muted = mute;
                    this.setState({
                        participants,
                    });
                }
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

    private addParticipantHandler = () => {
        if (this.props.onAddParticipant) {
            const {participants} = this.state;
            const users: IUser[] = participants.map((p) => {
                return {
                    accesshash: p.peer.accesshash,
                    id: p.peer.userid,
                };
            });
            this.props.onAddParticipant(users);
        }
        this.drawerCloseHandler();
    }
}

export default CallSettings;
