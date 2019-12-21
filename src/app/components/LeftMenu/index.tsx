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
import {IDialog} from "../../repository/dialog/interface";
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
    MenuOpenRounded
} from "@material-ui/icons";
import RiverLogo from "../RiverLogo";
import Menu from "@material-ui/core/Menu";
import Divider from "@material-ui/core/Divider";
import MenuItem from "@material-ui/core/MenuItem";
import NewGroupMenu from "../NewGroupMenu";
import {IUser} from "../../repository/user/interface";
import {omitBy, isNil} from "lodash";

import './style.scss';
import LabelMenu from "../LabelMenu";

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
    onReloadDialog: (peerIds: string[]) => void;
    onSettingsAction: (cmd: 'logout') => void;
    onSettingsClose: (e: any) => void;
    onUpdateMessages: (keep?: boolean) => void;
    onMenuShrunk: (shrunk: boolean) => void;
}

interface IState {
    chatMoreAnchorEl: any;
    connectionStatus: boolean;
    connectionStatusHide: boolean;
    iframeActive: boolean;
    isConnecting: boolean;
    isOnline: boolean;
    isUpdating: boolean;
    leftMenu: menuItems;
    overlayMode: number;
    shrunkMenu: boolean;
}

class LeftMenu extends React.PureComponent<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        if (props.mobileView && state.shrunkMenu) {
            return {
                shrunkMenu: false,
            };
        }
        if (props.iframeActive === state.iframeActive) {
            return;
        }
        return {
            iframeActive: props.iframeActive,
        };
    }

    private bottomBarRef: BottomBar | undefined;
    private dialogRef: Dialog | undefined;
    private settingsMenuRef: SettingsMenu | undefined;
    private contactsMenuRef: ContactsMenu | undefined;
    private chatTopIcons: any[];
    private chatMoreMenuItem: any[];
    private timeout: any = null;
    private unreadCounter: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            chatMoreAnchorEl: null,
            connectionStatus: false,
            connectionStatusHide: false,
            iframeActive: props.iframeActive,
            isConnecting: false,
            isOnline: false,
            isUpdating: false,
            leftMenu: 'chat',
            overlayMode: 0,
            shrunkMenu: false,
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
        }/*, {
            cmd: 'labels',
            title: i18n.t('chat.labels'),
        }*/, {
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
    }

    public componentDidMount(): void {
        if (!this.props.mobileView && !this.props.iframeActive && localStorage.getItem('river.shrunk_menu') === 'true') {
            this.props.onMenuShrunk(true);
            this.setState({
                shrunkMenu: true,
            });
        } else if (this.state.shrunkMenu) {
            this.setState({
                shrunkMenu: false,
            });
        }
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
        const {chatMoreAnchorEl, leftMenu, overlayMode, iframeActive, shrunkMenu} = this.state;
        return (
            <div
                className={'column-left ' + (leftMenu === 'chat' ? 'with-top-bar' : '') + (overlayMode ? ' left-overlay-enable' : '') + (shrunkMenu ? ' shrunk-menu' : '')}>
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
                        {iframeActive &&
                        <a href="/" target="_blank"><RiverLogo height={28} width={28}/></a>}
                        {!iframeActive && <RiverLogo height={28} width={28}/>}
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
                {shrunkMenu && <div className="top-bar">
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
                </div>}
                <div className="left-content">
                    {this.connectionStatus()}
                    {this.leftMenuRender()}
                </div>
                {!shrunkMenu && <BottomBar ref={this.bottomBarRefHandler} onSelect={this.bottomBarSelectHandler}
                                           selected={this.state.leftMenu}/>}
                <div className="left-overlay">
                    {Boolean(overlayMode === 1) && <NewGroupMenu onClose={this.overlayCloseHandler}
                                                                 onCreate={this.props.onGroupCreate}/>}
                    {Boolean(overlayMode === 2) &&
                    <LabelMenu onClose={this.overlayCloseHandler}/>}
                </div>
            </div>
        );
    }

    private leftMenuRender = () => {
        const {leftMenu} = this.state;
        if (leftMenu === 'settings') {
            return (<SettingsMenu key="settings-menu" ref={this.settingsMenuRefHandler}
                                  onUpdateMessages={this.props.onUpdateMessages}
                                  onClose={this.props.onSettingsClose}
                                  onAction={this.props.onSettingsAction}
                                  onReloadDialog={this.props.onReloadDialog}/>);
        } else if (leftMenu === 'contacts') {
            return (<ContactsMenu key="contacts-menu" ref={this.contactsMenuRefHandler}/>);
        } else {
            return (<Dialog key="dialog-menu" ref={this.dialogRefHandler}
                            cancelIsTyping={this.props.cancelIsTyping}
                            onContextMenu={this.props.onContextMenu}/>);
        }
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

    private chatMoreActionHandler = (cmd: string | undefined) => (e: any) => {
        this.chatMoreCloseHandler();
        switch (cmd) {
            case 'new_group':
                this.setState({
                    overlayMode: 1,
                });
                break;
            case 'labels':
                this.setState({
                    overlayMode: 2,
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
            overlayMode: 0,
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
        this.setState({
            shrunkMenu: !this.state.shrunkMenu,
        }, () => {
            this.props.onMenuShrunk(this.state.shrunkMenu);
            localStorage.setItem('river.shrunk_menu', this.state.shrunkMenu ? 'true' : 'false');
        });
    }
}

export default LeftMenu;
