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
import ContactMenu from "../ContactMenu";
import {IDialog} from "../../repository/dialog/interface";
import BottomBar from "../BottomBar";
import Tooltip from "@material-ui/core/Tooltip";
import i18n from "../../services/i18n";
import IconButton from "@material-ui/core/IconButton";
import {CloseRounded, EditRounded, MoreVertRounded, SearchRounded} from "@material-ui/icons";
import RiverLogo from "../RiverLogo";
import Menu from "@material-ui/core/Menu";
import Divider from "@material-ui/core/Divider";
import MenuItem from "@material-ui/core/MenuItem";
import IframeService from "../../services/iframe";
import NewGroupMenu from "../NewGroupMenu";
import {IUser} from "../../repository/user/interface";

import './style.css';

export type menuItems = 'chat' | 'settings' | 'contacts';
export type menuAction = 'new_message' | 'close_iframe' | 'logout';

interface IProps {
    cancelIsTyping: (id: string) => void;
    dialogRef: (ref: Dialog) => void;
    iframeActive: boolean;
    onAction: (cmd: menuAction) => void;
    onContextMenu: (cmd: string, dialog: IDialog) => void;
    onGroupCreate: (contacts: IUser[], title: string, fileId: string) => void;
    onReloadDialog: (peerIds: string[]) => void;
    onSettingsAction: (cmd: 'logout') => void;
    onSettingsClose: (e: any) => void;
    updateMessages: (keep?: boolean) => void;
}

interface IState {
    chatMoreAnchorEl: any;
    iframeActive: boolean;
    leftMenu: menuItems;
    overlay: boolean;
}

class LeftMenu extends React.Component<IProps, IState> {
    private bottomBarRef: BottomBar;
    private dialogRef: Dialog;
    private settingsMenuRef: SettingsMenu;
    private iframeActive: boolean = IframeService.getInstance().isActive();
    private chatTopIcons: any[];
    private chatMoreMenuItem: any[];

    constructor(props: IProps) {
        super(props);

        this.state = {
            chatMoreAnchorEl: null,
            iframeActive: props.iframeActive,
            leftMenu: 'chat',
            overlay: false,
        };

        this.chatTopIcons = [{
            cmd: 'search',
            icon: <SearchRounded/>,
            tooltip: i18n.t('chat.search'),
        }, {
            cmd: 'new_message',
            icon: <EditRounded/>,
            tooltip: i18n.t('chat.new_message'),
        }, {
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
            fn();
        }
    }

    public setUnreadCounter(counter: number) {
        if (this.bottomBarRef) {
            this.bottomBarRef.setUnreadCounter(counter);
        }
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.iframeActive !== newProps.iframeActive) {
            this.setState({
                iframeActive: newProps.iframeActive,
            });
        }
    }

    public render() {
        const {chatMoreAnchorEl, leftMenu, overlay} = this.state;
        return (
            <div
                className={'column-left ' + (leftMenu === 'chat' ? 'with-top-bar' : '') + (overlay ? ' left-overlay-enable' : '')}>
                <div className="top-bar">
                    {this.iframeActive &&
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
                    <span className="new-message">
                        {this.iframeActive &&
                        <a href="/" target="_blank"><RiverLogo height={28} width={28}/></a>}
                        {!this.iframeActive && <RiverLogo height={28} width={28}/>}
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
                </div>
                <div className="left-content">
                    {this.leftMenuRender()}
                </div>
                <BottomBar ref={this.bottomBarRefHandler} onSelect={this.bottomBarSelectHandler}
                           selected={this.state.leftMenu}/>
                <div className="left-overlay">
                    {overlay && <NewGroupMenu onClose={this.overlayCloseHandler}
                                              onCreate={this.props.onGroupCreate}/>}
                </div>
            </div>
        );
    }

    private leftMenuRender = () => {
        const {leftMenu} = this.state;
        switch (leftMenu) {
            default:
            case 'chat':
                return (<Dialog ref={this.dialogRefHandler}
                                cancelIsTyping={this.props.cancelIsTyping}
                                onContextMenu={this.props.onContextMenu}/>);
            case 'settings':
                return (<SettingsMenu ref={this.settingsMenuRefHandler}
                                      updateMessages={this.props.updateMessages}
                                      onClose={this.props.onSettingsClose}
                                      onAction={this.props.onSettingsAction}
                                      onReloadDialog={this.props.onReloadDialog}/>);
            case 'contacts':
                return (<ContactMenu/>);
        }
    }

    private dialogRefHandler = (ref: any) => {
        this.dialogRef = ref;
        this.props.dialogRef(ref);
    }

    private settingsMenuRefHandler = (ref: any) => {
        this.settingsMenuRef = ref;
    }

    private bottomBarRefHandler = (ref: any) => {
        this.bottomBarRefHandler = ref;
    }

    private bottomBarSelectHandler = (item: menuItems) => {
        this.setState({
            leftMenu: item,
        });
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
                this.dialogRef.toggleSearch();
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
                    overlay: true,
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
            overlay: false,
        });
    }
}

export default LeftMenu;
