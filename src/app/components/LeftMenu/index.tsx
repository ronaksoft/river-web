/*
    Creation Time: 2019 - Oct - 06
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import Dialog from "../Dialog";
import SettingsMenu from "../SettingsMenu";
import ContactsMenu from "../ContactsMenu";
import {IDialog, IPeer} from "../../repository/dialog/interface";
import BottomBar from "../BottomBar";
import Tooltip from "@material-ui/core/Tooltip";
import i18n from "../../services/i18n";
import IconButton from "@material-ui/core/IconButton";
import {
    CloseRounded,
    /*EditRounded,*/
    MoreVertRounded,
    SearchRounded,
    MenuRounded,
    MenuOpenRounded, ArrowDropDownRounded
} from "@material-ui/icons";
import Menu from "@material-ui/core/Menu";
import Divider from "@material-ui/core/Divider";
import MenuItem from "@material-ui/core/MenuItem";
import NewGroupMenu from "../NewGroupMenu";
import {IUser} from "../../repository/user/interface";
import {omitBy, isNil, debounce, find} from "lodash";
import LabelMenu from "../LabelMenu";
import {IMessage} from "../../repository/message/interface";
import {C_LOCALSTORAGE} from "../../services/sdk/const";
import {RiverTextLogo} from "../SVG/river";
import {ITeam} from "../../repository/team/interface";
import TeamName from "../TeamName";
import TeamRepo from "../../repository/team";
import {CircularProgress} from "@material-ui/core";

import './style.scss';
import {localize} from "../../services/utilities/localize";

export type menuItems = 'chat' | 'settings' | 'contacts';
export type menuAction = 'new_message' | 'close_iframe' | 'logout';

interface IProps {
    cancelIsTyping: (id: string) => void;
    dialogRef: (ref: Dialog) => void;
    iframeActive: boolean;
    mobileView: boolean;
    onAction: (cmd: menuAction) => void;
    onContextMenu: (cmd: string, dialog: IDialog) => void;
    onGroupCreate: (contacts: IUser[], title: string, fileId: string) => void;
    onReloadDialog: (peerIds: IPeer[]) => void;
    onSettingsAction: (cmd: 'logout' | 'count_dialog') => void;
    onSettingsClose: (e: any) => void;
    onUpdateMessages: (keep?: boolean) => void;
    onShrunk: (shrunk: boolean) => void;
    onError?: (text: string) => void;
    onDrop: (peerId: string, files: File[], hasData: boolean) => void;
    onMediaAction?: (cmd: 'download', message: IMessage) => void;
    onTeamChange?: (team: ITeam) => void;
    onTeamLoad?: (teams: ITeam[]) => void;
}

interface IState {
    chatMoreAnchorEl: any;
    connectionStatus: boolean;
    connectionStatusHide: boolean;
    dialogHover: boolean;
    iframeActive: boolean;
    isConnecting: boolean;
    isOnline: boolean;
    isUpdating: boolean;
    leftMenu: menuItems;
    overlayMode: number;
    shrunkMenu: boolean;
    anchorFrom: 'chat' | 'settings';
    teamLoading: boolean;
    teamList: ITeam[];
    teamMoreAnchorEl: any;
    hasUpdate: boolean;
}

class LeftMenu extends React.PureComponent<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        if (props.mobileView && state.shrunkMenu) {
            return {
                shrunkMenu: false,
            };
        }
        if (props.iframeActive === state.iframeActive) {
            return null;
        }
        return {
            iframeActive: props.iframeActive,
        };
    }

    private teamId: string = '0';
    private bottomBarRef: BottomBar | undefined;
    private dialogRef: Dialog | undefined;
    private settingsMenuRef: SettingsMenu | undefined;
    private contactsMenuRef: ContactsMenu | undefined;
    private chatTopIcons: any[];
    private chatMoreMenuItem: any[];
    private timeout: any = null;
    private unreadCounter: number = 0;
    private teamRepo: TeamRepo;
    private readonly mouseEnterDebounce: any;
    private readonly mouseLeaveDebounce: any;

    constructor(props: IProps) {
        super(props);

        this.state = {
            anchorFrom: 'chat',
            chatMoreAnchorEl: null,
            connectionStatus: false,
            connectionStatusHide: false,
            dialogHover: false,
            hasUpdate: false,
            iframeActive: props.iframeActive,
            isConnecting: false,
            isOnline: false,
            isUpdating: false,
            leftMenu: 'chat',
            overlayMode: 0,
            shrunkMenu: false,
            teamList: [],
            teamLoading: false,
            teamMoreAnchorEl: null,
        };

        this.chatTopIcons = [{
            cmd: 'search',
            icon: <SearchRounded/>,
            tooltip: i18n.t('chat.search'),
        }, /*{
            cmd: 'new_message',
            icon: <EditRounded/>,
            tooltip: i18n.t('chat.new_message'),
        }, */{
            cmd: 'more',
            icon: <MoreVertRounded/>,
            tooltip: i18n.t('chat.more'),
        }];

        this.chatMoreMenuItem = [{
            cmd: 'new_group',
            title: i18n.t('chat.new_group'),
        }, {
            cmd: 'new_message',
            title: i18n.t('chat.new_message'),
        }, {
            cmd: 'labels',
            title: i18n.t('chat.labels'),
        }, {
            cmd: 'account',
            title: i18n.t('chat.account_info'),
        }, {
            cmd: 'settings',
            title: i18n.t('chat.settings'),
        }, {
            role: 'divider',
        }, {
            cmd: 'logout',
            title: i18n.t('chat.log_out'),
        }];

        this.teamRepo = TeamRepo.getInstance();

        this.mouseEnterDebounce = debounce(this.mouseEnterDebounceHandler, 320);
        this.mouseLeaveDebounce = debounce(this.mouseLeaveDebounceHandler, 128);
    }

    public setTeam(teamId: string) {
        this.teamId = teamId;
        this.forceUpdate();
    }

    public setUpdateFlag(enable: boolean) {
        if (this.state.hasUpdate !== enable) {
            this.setState({
                hasUpdate: enable,
            });
        }
    }

    public componentDidMount(): void {
        if (!this.props.mobileView && !this.props.iframeActive && localStorage.getItem(C_LOCALSTORAGE.ShrunkMenu) === 'true') {
            this.props.onShrunk(true);
            this.setState({
                shrunkMenu: true,
            });
        } else if (this.state.shrunkMenu) {
            this.setState({
                shrunkMenu: false,
            });
        }
        this.getTeamList();
    }

    public setMenu(menu: menuItems, pageContent?: string, pageSubContent?: string) {
        const fn = () => {
            if (this.settingsMenuRef && pageContent && pageSubContent) {
                this.settingsMenuRef.navigateToPage(pageContent, pageSubContent);
            }
        };
        if (this.state.leftMenu !== menu) {
            this.setState({
                leftMenu: menu,
            }, fn);
        } else {
            if (menu === 'settings') {
                fn();
            }
        }
    }

    public setUnreadCounter(counter: number) {
        this.unreadCounter = counter;
        if (this.bottomBarRef) {
            this.bottomBarRef.setUnreadCounter(counter);
        }
    }

    public setStatus(state: {
        isConnecting?: boolean;
        isOnline?: boolean;
        isUpdating?: boolean;
    }) {
        // @ts-ignore
        this.setState(omitBy(state, isNil));
        if (state.isConnecting === false && state.isOnline === true && state.isUpdating === false) {
            if (this.state.connectionStatus) {
                this.setState({
                    connectionStatusHide: true,
                });
                this.timeout = setTimeout(() => {
                    this.setState({
                        connectionStatus: false,
                    });
                }, 200);
            }
        } else {
            if (!this.state.connectionStatus) {
                clearTimeout(this.timeout);
                this.setState({
                    connectionStatus: true,
                    connectionStatusHide: false,
                });
            }
        }
    }

    public render() {
        const {chatMoreAnchorEl, leftMenu, overlayMode, iframeActive, shrunkMenu, dialogHover, teamList, teamLoading, teamMoreAnchorEl, hasUpdate} = this.state;
        const className = (leftMenu === 'chat' ? 'with-top-bar' : '') + (overlayMode ? ' left-overlay-enable' : '') + (overlayMode ? ' label-mode' : '') + (dialogHover ? ' dialog-hover' : '') + (shrunkMenu ? ' shrunk-menu' : '');
        return (
            <div className={'column-left ' + className}>
                {!shrunkMenu && <div className="top-bar">
                    {iframeActive &&
                    <span className="close-btn">
                        <Tooltip
                            title={i18n.t('general.close')}
                            placement="bottom"
                            onClick={this.chatMoreActionHandler('close_iframe')}
                        >
                            <IconButton>
                                <CloseRounded/>
                            </IconButton>
                        </Tooltip>
                    </span>}
                    {Boolean(!iframeActive && !this.props.mobileView) &&
                    <span className="menu-btn">
                        <Tooltip
                            title={i18n.t('general.collapse')}
                            placement="bottom"
                            onClick={this.toggleMenuHandler}
                        >
                            <IconButton>
                                 <MenuOpenRounded/>
                            </IconButton>
                        </Tooltip>
                    </span>}
                    <span className="new-message">
                        <div className="text-logo">
                            {iframeActive &&
                            <a href="/" target="_blank">
                                <RiverTextLogo/>
                            </a>}
                            {!iframeActive && <RiverTextLogo/>}
                            {this.teamId !== '0' &&
                            <TeamName id={this.teamId} className="team-name" prefix="(" postfix=")"/>}
                            {Boolean(teamList.length > 0) &&
                            <div className="team-select-icon" onClick={this.teamOpenHandler}><ArrowDropDownRounded/>
                                {hasUpdate && <div className="team-badge"/>}
                            </div>}
                        </div>
                    </span>
                    <div className="actions">
                        {this.chatTopIcons.map((item, key) => {
                            return (
                                <Tooltip
                                    key={key}
                                    title={item.tooltip}
                                    placement="bottom"
                                >
                                    <IconButton
                                        onClick={this.chatTopIconActionHandler(item.cmd)}
                                    >{item.icon}</IconButton>
                                </Tooltip>
                            );
                        })}
                        <Menu
                            anchorEl={chatMoreAnchorEl}
                            open={Boolean(chatMoreAnchorEl)}
                            onClose={this.chatMoreCloseHandler}
                            className="kk-context-menu darker"
                            classes={{
                                paper: 'kk-context-menu-paper'
                            }}
                        >
                            {this.chatMoreMenuItem.map((item, key) => {
                                if (item.role === 'divider') {
                                    return (<Divider key={key}/>);
                                } else {
                                    return (
                                        <MenuItem key={key}
                                                  onClick={this.chatMoreActionHandler(item.cmd)}
                                                  className="context-item"
                                        >{item.title}</MenuItem>
                                    );
                                }
                            })}
                        </Menu>
                    </div>
                </div>}
                {shrunkMenu && <div className="top-bar" onMouseEnter={this.contentMouseEnterHandler}
                                    onMouseLeave={this.contentMouseLeaveHandler}>
                    <span className="menu-btn">
                        <Tooltip
                            title={i18n.t('general.expand')}
                            placement="bottom"
                            onClick={this.toggleMenuHandler}
                        >
                            <IconButton>
                                 <MenuRounded/>
                            </IconButton>
                        </Tooltip>
                    </span>
                    {Boolean(overlayMode === 2) && <div className="actions">
                        <Tooltip
                            title={i18n.t('chat.search')}
                            placement="bottom"
                        >
                            <IconButton
                                onClick={this.chatTopIconActionHandler('search')}
                            ><SearchRounded/></IconButton>
                        </Tooltip>
                    </div>}
                </div>}
                <div className="left-content" onMouseEnter={this.contentMouseEnterHandler}
                     onMouseLeave={this.contentMouseLeaveHandler}>
                    {this.connectionStatus()}
                    {this.getContent()}
                </div>
                {!shrunkMenu && <BottomBar ref={this.bottomBarRefHandler} onSelect={this.bottomBarSelectHandler}
                                           selected={this.state.leftMenu}/>}
                <div className="left-overlay">
                    {Boolean(overlayMode === 1) &&
                    <NewGroupMenu onClose={this.overlayCloseHandler} onCreate={this.props.onGroupCreate}
                                  teamId={this.teamId}/>}
                    {Boolean(overlayMode === 2) &&
                    <LabelMenu onClose={this.overlayCloseHandler} onError={this.props.onError}
                               onAction={this.props.onMediaAction} teamId={this.teamId}/>}
                </div>
                {Boolean(teamList.length > 0) && <Menu
                    anchorEl={teamMoreAnchorEl}
                    anchorOrigin={{
                        horizontal: 'center',
                        vertical: 'top',
                    }}
                    transformOrigin={{
                        horizontal: 'center',
                        vertical: 'top',
                    }}
                    open={Boolean(teamMoreAnchorEl)}
                    onClose={this.teamCloseHandler}
                    className="kk-context-menu darker top-bar-team"
                    classes={{
                        paper: 'kk-context-menu-paper'
                    }}
                >
                    {teamList.map((item) => {
                        return (<MenuItem key={item.id} className="context-item"
                                          onClick={this.teamSelectHandler(item)}
                                          selected={this.teamId === item.id}>
                            <div className="team-name">{item.name}</div>
                            {Boolean(item.unread_counter) &&
                            <div className="team-unread-counter">{localize(item.unread_counter || 0)}</div>}
                        </MenuItem>);
                    })}
                    {teamLoading && <div style={{
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                        <CircularProgress size={16}/>
                    </div>}
                </Menu>}
            </div>
        );
    }

    private getContent() {
        const {leftMenu} = this.state;
        return <div className={'left-content-inner ' + leftMenu}>
            <Dialog key="dialog-menu" ref={this.dialogRefHandler} cancelIsTyping={this.props.cancelIsTyping}
                    onContextMenu={this.props.onContextMenu} onDrop={this.props.onDrop} teamId={this.teamId}/>
            <div className="left-content-overlay">
                {leftMenu === 'settings' &&
                <SettingsMenu key="settings-menu" ref={this.settingsMenuRefHandler}
                              onUpdateMessages={this.props.onUpdateMessages}
                              onClose={this.props.onSettingsClose}
                              onAction={this.props.onSettingsAction}
                              onError={this.props.onError}
                              onReloadDialog={this.props.onReloadDialog}
                              onSubPlaceChange={this.settingsSubPlaceChangeHandler}
                              onTeamChange={this.props.onTeamChange}
                              onTeamUpdate={this.settingsMenuTeamUpdateHandler}
                              teamId={this.teamId}
                />}
                {leftMenu === 'contacts' &&
                <ContactsMenu key="contacts-menu" ref={this.contactsMenuRefHandler} onError={this.props.onError}
                              onClose={this.contactsCloseHandler} teamId={this.teamId}/>}
            </div>
        </div>;
    }

    private dialogRefHandler = (ref: any) => {
        this.dialogRef = ref;
        this.props.dialogRef(ref);
    }

    private settingsMenuRefHandler = (ref: any) => {
        this.settingsMenuRef = ref;
    }

    private contactsMenuRefHandler = (ref: any) => {
        this.contactsMenuRef = ref;
    }

    private bottomBarRefHandler = (ref: any) => {
        this.bottomBarRef = ref;
        if (this.bottomBarRef) {
            this.bottomBarRef.setUnreadCounter(this.unreadCounter);
        }
    }

    private bottomBarSelectHandler = (item: menuItems) => {
        if (this.state.leftMenu !== item) {
            if (this.state.leftMenu === 'settings' && this.settingsMenuRef) {
                this.settingsMenuRef.applyChanges();
            }
            this.setState({
                leftMenu: item,
            });
        } else {
            if (this.dialogRef) {
                this.dialogRef.scrollTop();
            }
            if (this.contactsMenuRef) {
                this.contactsMenuRef.scrollTop();
            }
        }
    }

    private chatMoreOpenHandler = (e: any) => {
        this.setState({
            chatMoreAnchorEl: e.currentTarget,
        });
    }

    private chatMoreCloseHandler = () => {
        if (this.state.chatMoreAnchorEl) {
            this.setState({
                chatMoreAnchorEl: null,
            });
        }
    }

    private chatTopIconActionHandler = (cmd: string) => (e: any) => {
        this.chatMoreCloseHandler();
        switch (cmd) {
            case 'search':
                if (this.dialogRef) {
                    this.dialogRef.toggleSearch();
                }
                break;
            case 'new_message':
                this.props.onAction('new_message');
                break;
            case 'more':
                this.chatMoreOpenHandler(e);
                break;
        }
    }

    private chatMoreActionHandler = (cmd: string | undefined, anchor?: 'chat' | 'settings') => (e?: any) => {
        this.chatMoreCloseHandler();
        switch (cmd) {
            case 'new_group':
                this.setState({
                    overlayMode: 1,
                });
                break;
            case 'labels':
                this.setState({
                    anchorFrom: anchor || 'chat',
                    overlayMode: 2,
                    shrunkMenu: true,
                });
                break;
            case 'new_message':
                this.props.onAction('new_message');
                break;
            case 'account':
                this.setMenu('settings', 'account', 'none');
                break;
            case 'settings':
                this.setMenu('settings');
                break;
            case 'logout':
                this.props.onAction('logout');
                break;
            case 'close_iframe':
                this.props.onAction('close_iframe');
                break;
        }
    }

    private overlayCloseHandler = () => {
        this.setState({
            leftMenu: this.state.anchorFrom,
            overlayMode: 0,
            shrunkMenu: false,
        });
    }

    private connectionStatus() {
        if (!this.props.mobileView || !this.state.connectionStatus) {
            return;
        }
        let body: any = '';
        if (!this.state.isOnline) {
            body = <span>{i18n.t('status.waiting_for_network')}</span>;
        } else if (this.state.isConnecting) {
            body = <span>{i18n.t('status.connecting')}</span>;
        } else if (this.state.isUpdating) {
            body = <span>{i18n.t('status.updating')}</span>;
        }
        if (body === '') {
            return;
        } else {
            return (<div className={'status-alert' + (this.state.connectionStatusHide ? ' hide' : '')}>{body}</div>);
        }
    }

    private toggleMenuHandler = () => {
        if (this.state.overlayMode === 2) {
            this.setState({
                dialogHover: !this.state.dialogHover,
            });
        } else {
            this.setState({
                shrunkMenu: !this.state.shrunkMenu,
            }, () => {
                this.props.onShrunk(this.state.shrunkMenu);
                localStorage.setItem(C_LOCALSTORAGE.ShrunkMenu, this.state.shrunkMenu ? 'true' : 'false');
            });
        }
    }

    private contentMouseLeaveHandler = () => {
        if (this.state.overlayMode !== 2) {
            return;
        }
        this.mouseEnterDebounce.cancel();
        this.mouseLeaveDebounce();
    }

    private contentMouseEnterHandler = () => {
        if (this.state.overlayMode !== 2) {
            return;
        }
        this.mouseLeaveDebounce.cancel();
        this.mouseEnterDebounce();
    }

    private mouseEnterDebounceHandler = () => {
        if (!this.state.dialogHover) {
            this.setState({
                dialogHover: true,
            });
        }
    }

    private mouseLeaveDebounceHandler = () => {
        if (this.state.dialogHover) {
            this.setState({
                dialogHover: false,
            });
        }
    }

    private settingsSubPlaceChangeHandler = (place: string, subPlace: string) => {
        if (place === 'label') {
            this.setState({
                leftMenu: 'chat',
            }, () => {
                this.chatMoreActionHandler('labels', 'settings')();
            });
        }
    }

    private contactsCloseHandler = () => {
        this.setState({
            leftMenu: 'chat',
        });
    }

    private getTeamList() {
        this.setState({
            teamLoading: true,
        });
        const fn = (loading: boolean) => (res: ITeam[]) => {
            const q: any = {
                teamList: res,
                teamLoading: loading,
            };
            const item = find(res, {id: this.teamId});
            if (item) {
                q.teamSelectedId = item.id;
                q.teamSelectedName = item.name;
            }
            q.hasUpdate = res.some(o => o.id !== this.teamId && o.unread_counter);
            this.setState(q);
            if (!loading && this.props.onTeamLoad) {
                this.props.onTeamLoad(res);
            }
        };
        this.teamRepo.getCachedTeam(fn(true), true, true).then(fn(false)).catch(() => {
            this.setState({
                teamLoading: false,
            });
        });
    }

    private teamOpenHandler = (e: any) => {
        if (this.state.hasUpdate) {
            this.getTeamList();
        }
        this.setState({
            hasUpdate: false,
            teamMoreAnchorEl: e.currentTarget,
        });
    }

    private teamCloseHandler = () => {
        this.setState({
            teamMoreAnchorEl: null,
        });
    }

    private teamSelectHandler = (item: ITeam) => (e: any) => {
        localStorage.setItem(C_LOCALSTORAGE.TeamId, item.id || '0');
        localStorage.setItem(C_LOCALSTORAGE.TeamData, JSON.stringify({
            accesshash: item.accesshash,
            id: item.id,
        }));
        this.teamId = item.id || '0';
        this.setState({
            hasUpdate: this.state.teamList.some(o => o.id !== this.teamId && o.unread_counter),
            teamMoreAnchorEl: null,
        });
        setTimeout(() => {
            if (this.props.onTeamChange) {
                this.props.onTeamChange(item);
            }
        }, 10);
    }

    private settingsMenuTeamUpdateHandler = () => {
        this.getTeamList();
    }
}

export default LeftMenu;
