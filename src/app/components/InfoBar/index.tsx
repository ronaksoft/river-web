/*
    Creation Time: 2019 - Oct - 07
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
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
import {IconButton, ListItemIcon, Menu, MenuItem, Tooltip, CircularProgress} from "@material-ui/core";
import {isNil, omitBy} from "lodash";
import UserRepo from "../../repository/user";
import {IDialog} from "../../repository/dialog/interface";
import CallService, {C_CALL_EVENT} from "../../services/callService";
import APIManager, {currentUserId} from "../../services/sdk";
import {EventOffline, EventOnline} from "../../services/events";

import './style.scss';

interface IMenuItem {
    cmd: string;
    icon: any;
    title: string;
    whenActive: boolean | undefined;
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
    callId: string;
    disable: boolean;
    online: boolean;
    peer: InputPeer | null;
    isConnecting: boolean;
    isOnline: boolean;
    isUpdating: boolean;
    loading: boolean;
    teamId: string;
    visibleMenus: number[];
    withCall: boolean;
}

class InfoBar extends React.Component<IProps, IState> {
    private currentUserId: string = UserRepo.getInstance().getCurrentUserId();
    private userRepo: UserRepo;
    private menuItems: IMenuItem[] = [];
    private callService: CallService;
    private apiManager: APIManager;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
            activeCallId: null,
            callAnchorEl: null,
            callId: '0',
            disable: false,
            isConnecting: false,
            isOnline: false,
            isUpdating: false,
            loading: false,
            online: navigator.onLine === undefined ? true : navigator.onLine,
            peer: null,
            teamId: props.teamId,
            visibleMenus: [],
            withCall: true,
        };

        this.userRepo = UserRepo.getInstance();
        this.apiManager = APIManager.getInstance();
        this.callService = CallService.getInstance();

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
            whenActive: undefined,
        }, {
            cmd: 'call_end',
            icon: <CallEndRounded/>,
            title: i18n.t('call.hangup'),
            whenActive: true,
        });
    }

    public setPeer(teamId: string, peer: InputPeer | null, dialog: IDialog | null) {
        this.setState({
            disable: dialog ? dialog.disable || false : false,
            loading: false,
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

    public setCallId(callId: string) {
        const activeCallId = this.callService.getActiveCallId();
        this.setState({
            activeCallId: activeCallId !== '0' ? activeCallId : null,
            callId,
        });
    }

    public componentDidMount() {
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.LocalStreamUpdated, this.eventLocalStreamUpdateHandler));
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallDestroyed, this.eventCallDestroyedHandler));
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
        const {isConnecting, isOnline, isUpdating, peer, teamId, withCall, callId, disable, callAnchorEl, online} = this.state;
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
                    {withCall && !disable && <>{callId !== '0' ?
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
                    open={Boolean(callAnchorEl)}
                    anchorEl={callAnchorEl}
                    onClose={this.callMenuCloseHandler}
                    className="kk-context-menu"
                    transformOrigin={{
                        horizontal: 'right',
                        vertical: 'top',
                    }}
                    classes={{
                        paper: 'kk-context-menu-paper'
                    }}
                >
                    {this.menuContent()}
                </Menu>
            </div>
        );
    }

    private menuContent() {
        const {visibleMenus, loading} = this.state;
        if (loading) {
            return <MenuItem className="context-item">
                <CircularProgress size={16}/>
            </MenuItem>;
        }
        return this.menuItems.map((item, index) => {
            if (visibleMenus.indexOf(index) > -1) {
                return (<MenuItem key={index} onClick={this.callCmdHandler(item.cmd)} className="context-item">
                    <ListItemIcon className="context-icon">{item.icon}</ListItemIcon>
                    {item.title}
                </MenuItem>);
            }
            return null;
        });
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
                        if (this.state.teamId === '0') {
                            this.setState({
                                activeCallId: null,
                                withCall: !Boolean(user.isbot || user.official || user.deleted),
                            });
                        } else {
                            this.userRepo.isTeamMember(this.state.teamId, user.id).then((ok) => {
                                this.setState({
                                    activeCallId: null,
                                    withCall: ok,
                                });
                            });
                        }
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
        const {callId, peer, activeCallId} = this.state;
        let visibleMenus: number[] = [];
        if (callId === '0') {
            visibleMenus = [0, 1];
        } else {
            const isGroup = (peer && peer.getType() === PeerType.PEERGROUP);
            if (isGroup) {
                if (activeCallId) {
                    visibleMenus = [2];
                } else {
                    if (this.state.loading) {
                        return;
                    }
                    this.setState({
                        callAnchorEl: e.currentTarget,
                        loading: true,
                    });
                    this.apiManager.callGetParticipants(peer, callId).then((res) => {
                        if (res.participantsList.some(o => o.peer.userid === currentUserId)) {
                            visibleMenus = [3];
                        } else {
                            visibleMenus = [2];
                        }
                        this.setState({
                            loading: false,
                            visibleMenus,
                        });
                    }).catch(() => {
                        visibleMenus = [3];
                        this.setState({
                            loading: false,
                            visibleMenus,
                        });
                    });
                    return;
                }
            } else {
                visibleMenus = [3];
            }
        }
        this.setState({
            callAnchorEl: e.currentTarget,
            visibleMenus
        });
    }

    private callMenuCloseHandler = () => {
        this.setState({
            callAnchorEl: null,
            visibleMenus: [],
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

    private eventCallDestroyedHandler = () => {
        const activeCallId = this.callService.getActiveCallId();
        this.setState({
            activeCallId: activeCallId !== '0' ? activeCallId : null,
        });
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
