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
    PersonAddAlt1Rounded,
} from "@material-ui/icons";
import CallService, {C_CALL_EVENT, ICallParticipant} from "../../services/callService";
import i18n from '../../services/i18n';
import {clone, findIndex} from "lodash";
import {getDefaultAudio} from "../SettingsMediaInput";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import Scrollbars from "react-custom-scrollbars";
import {currentUserId} from "../../services/sdk";
import {IUser} from "../../repository/user/interface";
import VoiceActivityDetection from "../../services/vad";

import './style.scss';

export interface IMediaSettings {
    video: boolean;
    audio: boolean;
}

interface IProps {
    onMediaSettingsChange?: (settings: IMediaSettings) => void;
    group?: boolean;
    onAddParticipant?: (users: IUser[]) => void;
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
    private vad: VoiceActivityDetection | undefined;
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

    public setMediaSettings({audio, video}: { audio: boolean, video: boolean }) {
        this.setState({
            mediaSettings: {
                audio,
                video,
            },
        });
        if (this.vad) {
            this.vad.setActive(audio);
        }
        this.callService.toggleAudio(audio);
        this.callService.toggleVideo(video);
    }

    public startAudioAnalyzer() {
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
                <IconButton className="call-settings-item" onClick={this.mediaSettingsChangeHandler('video')}>
                    {mediaSettings.video ? <VideocamRounded/> : <VideocamOffRounded/>}
                </IconButton>
                <IconButton className="call-settings-item" onClick={this.mediaSettingsChangeHandler('audio')}>
                    {mediaSettings.audio ? <MicRounded/> : <MicOffRounded/>}
                </IconButton>
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
        }, () => {
            if (this.vad) {
                this.vad.setActive(this.state.mediaSettings.audio);
            }
        });
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
            return this.vad.setStream(stream, this.state.mediaSettings.audio);
        });
    }

    private drawerOpenHandler = () => {
        this.preventClose();
        if (!this.state.drawerOpen) {
            this.getParticipants();
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

    private getParticipants() {
        const activeCallId = this.callService.getActiveCallId();
        if (!activeCallId) {
            return;
        }
        const currentParticipant = this.callService.getParticipantByUserId(activeCallId, currentUserId);
        const participants = this.callService.getParticipantList(activeCallId, true);
        this.setState({
            currentParticipant,
            drawerOpen: true,
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
                    {hasAccess && <div className="more" onClick={this.openMenuHandler(item.peer.userid)}>
                        <MoreVertRounded/>
                    </div>}
                </div>);
            })}
        </>;
    }

    private openMenuHandler = (userId: string) => (e: any) => {
        this.setState({
            moreAnchorPos: {
                left: e.pageX - 96,
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
                this.callService.callRemoveParticipant(activeCallId, [selectedUserId], false).then(() => {
                    const {participants} = this.state;
                    const index = findIndex(participants, o => o.peer.userid === selectedUserId);
                    if (index > -1) {
                        participants.splice(index, 1);
                        this.setState({
                            participants,
                        });
                    }
                });
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
