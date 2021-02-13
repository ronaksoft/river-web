/*
    Creation Time: 2019 - Oct - 07
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {InputPeer, PeerType} from "../../services/sdk/messages/core.types_pb";
import i18n from "../../services/i18n";
import {
    CallEndRounded,
    CallRounded,
    CancelOutlined,
    InfoOutlined,
    KeyboardArrowLeftRounded,
    SearchRounded,
    VideocamRounded,
    AddIcCallRounded,
} from "@material-ui/icons";
import StatusBar from "../StatusBar";
import {IconButton, ListItemIcon, Menu, MenuItem, Tooltip} from "@material-ui/core";
import {isNil, omitBy} from "lodash";
import UserRepo from "../../repository/user";
import {IDialog} from "../../repository/dialog/interface";
import CallService, {C_CALL_EVENT} from "../../services/callService";
import {currentUserId} from "../../services/sdk";
import {EventOffline, EventOnline} from "../../services/events";

import './style.scss';

interface IMenuItem {
    cmd: string;
    icon: any;
    title: string;
    whenActive: boolean;
}

interface IProps {
    onBack: () => void;
    onClose?: () => void;
    statusBarRefHandler: (ref: StatusBar) => void;
    isMobileView: boolean;
    onAction: (cmd: string) => (e: any) => void;
    teamId: string;
}

interface IState {
    activeCallId: string | null;
    callAnchorEl: any;
    callStarted: boolean;
    disable: boolean;
    online: boolean;
    peer: InputPeer | null;
    isConnecting: boolean;
    isOnline: boolean;
    isUpdating: boolean;
    teamId: string;
    withCall: boolean;
}

class InfoBar extends React.Component<IProps, IState> {
    private currentUserId: string = UserRepo.getInstance().getCurrentUserId();
    private userRepo: UserRepo;
    private menuItems: IMenuItem[] = [];
    private callService: CallService;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
            activeCallId: null,
            callAnchorEl: null,
            callStarted: false,
            disable: false,
            isConnecting: false,
            isOnline: false,
            isUpdating: false,
            online: navigator.onLine === undefined ? true : navigator.onLine,
            peer: null,
            teamId: props.teamId,
            withCall: true,
        };

        this.userRepo = UserRepo.getInstance();

        this.menuItems.push({
            cmd: 'call_audio',
            icon: <CallRounded/>,
            title: i18n.t('call.audio_call'),
            whenActive: false,
        }, {
            cmd: 'call_video',
            icon: <VideocamRounded/>,
            title: i18n.t('call.video_call'),
            whenActive: false,
        }, {
            cmd: 'call_join',
            icon: <AddIcCallRounded/>,
            title: i18n.t('call.join_call'),
            whenActive: true,
        }, {
            cmd: 'call_end',
            icon: <CallEndRounded/>,
            title: i18n.t('call.hangup'),
            whenActive: true,
        });

        this.callService = CallService.getInstance();
    }

    public setPeer(teamId: string, peer: InputPeer | null, dialog: IDialog | null) {
        this.setState({
            disable: dialog ? dialog.disable || false : false,
            peer,
            teamId,
            withCall: false,
        });
        this.checkCall(peer);
    }

    public setStatus(state: {
        isConnecting?: boolean;
        isOnline?: boolean;
        isUpdating?: boolean;
        peer?: InputPeer | null,
        selectedPeerName?: string,
    }) {
        // @ts-ignore
        this.setState(omitBy(state, isNil));
    }

    public setCallStarted(callStarted: boolean) {
        const activeCallId = this.callService.getActiveCallId();
        this.setState({
            activeCallId: activeCallId !== '0' ? activeCallId : null,
            callStarted,
        });
    }

    public componentDidMount() {
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.LocalStreamUpdated, this.eventLocalStreamUpdateHandler));
        window.addEventListener(EventOnline, this.eventOnlineHandler);
        window.addEventListener(EventOffline, this.eventOfflineHandler);
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
        window.removeEventListener(EventOnline, this.eventOnlineHandler);
        window.removeEventListener(EventOffline, this.eventOfflineHandler);
    }


    public render() {
        const {isConnecting, isOnline, isUpdating, peer, teamId, withCall, callStarted, disable, callAnchorEl, activeCallId, online} = this.state;
        const isGroup = (peer && peer.getType() === PeerType.PEERGROUP);
        return (
            <div className={'info-bar' + (withCall ? ' with-call' : '')}>
                {this.props.isMobileView ?
                    <div className="back-to-chats" onClick={this.props.onBack}>
                        <KeyboardArrowLeftRounded/>
                    </div> :
                    <div className="back-to-chats close-button">
                        <IconButton onClick={this.props.onClose}>
                            <CancelOutlined/>
                        </IconButton>
                    </div>
                }
                <StatusBar ref={this.props.statusBarRefHandler} onAction={this.props.onAction}
                           isConnecting={isConnecting} isOnline={isOnline} isUpdating={isUpdating}
                           peer={peer} teamId={teamId} currentUserId={this.currentUserId}
                />
                <div className="buttons">
                    {withCall && !disable && <>{callStarted ?
                        <div className="call-indicator" onClick={this.indicatorClickHandler}>
                            {i18n.t('call.call_started')}
                        </div> : <Tooltip title={i18n.t('call.call')}>
                            <IconButton onClick={this.callMenuOpenHandler}
                                        disabled={!online}><CallRounded/></IconButton>
                        </Tooltip>}
                    </>}
                    <Tooltip
                        title={i18n.t('chat.search_messages')}
                    >
                        <IconButton
                            onClick={this.props.onAction('search')}
                        ><SearchRounded/></IconButton>
                    </Tooltip>
                    <Tooltip
                        title={isGroup ? i18n.t('chat.group_info') : i18n.t('chat.contact_info')}
                    >
                        <IconButton
                            onClick={this.props.onAction('info')}
                        ><InfoOutlined/></IconButton>
                    </Tooltip>
                </div>
                <Menu
                    anchorEl={callAnchorEl}
                    open={Boolean(callAnchorEl)}
                    onClose={this.callMenuCloseHandler}
                    className="kk-context-menu"
                    anchorOrigin={{
                        horizontal: 'right',
                        vertical: 'center',
                    }}
                    transformOrigin={{
                        horizontal: 'right',
                        vertical: 'top',
                    }}
                    classes={{
                        paper: 'kk-context-menu-paper'
                    }}
                >
                    {this.menuItems.map((item, index) => {
                        if (item.whenActive === (callStarted || false) || (item.cmd === 'call_join' && isGroup && !activeCallId && callStarted)) {
                            return (<MenuItem key={index} onClick={this.callCmdHandler(item.cmd)}
                                              className="context-item">
                                <ListItemIcon className="context-icon">{item.icon}</ListItemIcon>
                                {item.title}
                            </MenuItem>);
                        }
                        return null;
                    })}
                </Menu>
            </div>
        );
    }

    private checkCall(peer: InputPeer | null) {
        if (!peer) {
            return;
        }
        if (peer.getType() === PeerType.PEERUSER) {
            if (peer.getId() === currentUserId) {
                this.setState({
                    activeCallId: null,
                    withCall: false,
                });
            } else {
                this.userRepo.get(peer.getId() || '0').then((user) => {
                    if (user) {
                        this.setState({
                            activeCallId: null,
                            withCall: !Boolean(user.isbot || user.official),
                        });
                    }
                });
            }
        } else if (peer.getType() === PeerType.PEERGROUP) {
            this.setState({
                withCall: true,
            });
        }
    }

    private callMenuOpenHandler = (e: any) => {
        this.setState({
            callAnchorEl: e.currentTarget,
        });
    }

    private callMenuCloseHandler = () => {
        this.setState({
            callAnchorEl: null,
        });
    }

    private callCmdHandler = (cmd: string) => (e: any) => {
        this.props.onAction(cmd)(e);
        this.callMenuCloseHandler();
    }

    private indicatorClickHandler = (e: any) => {
        if (this.state.peer && this.state.online) {
            if (this.state.peer.getType() === PeerType.PEERGROUP && !this.state.activeCallId) {
                this.callMenuOpenHandler(e);
            } else if (this.state.peer.getType() === PeerType.PEERUSER) {
                this.callMenuOpenHandler(e);
            }
        }
    }

    private eventLocalStreamUpdateHandler = () => {
        if (this.state.peer && this.state.peer.getType() === PeerType.PEERGROUP) {
            const activeCallId = this.callService.getActiveCallId();
            this.setState({
                activeCallId: activeCallId !== '0' ? activeCallId : null,
            });
        }
    }

    private eventOnlineHandler = () => {
        if (!this.state.online) {
            this.setState({
                online: true,
            });
        }
    }

    private eventOfflineHandler = () => {
        if (!this.state.online) {
            this.setState({
                online: true,
            });
        }
    }
}

export default InfoBar;
