/*
    Creation Time: 2020 - Sep - 06
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {Team} from "../../services/sdk/messages/core.types_pb";
import {IconButton, TextField} from "@material-ui/core";
import {KeyboardBackspaceRounded, MoreVert, PersonRounded, StarRateRounded, GroupAddRounded} from "@material-ui/icons";
import i18n from "../../services/i18n";
import Scrollbars from "react-custom-scrollbars";
import {C_LOCALSTORAGE} from "../../services/sdk/const";
import APIManager from "../../services/sdk";
import UserRepo from "../../repository/user";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import {IUser} from "../../repository/user/interface";
import {categorizeContact} from "../ContactList";
import {Loading} from "../Loading";
import AutoSizer from "react-virtualized-auto-sizer";
import {VariableSizeList} from "react-window";
import IsMobile from "../../services/isMobile";
import getScrollbarWidth from "../../services/utilities/scrollbar_width";
import LastSeen from "../LastSeen";
import {localize} from "../../services/utilities/localize";
import Menu from "@material-ui/core/Menu/Menu";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";

import './style.scss';

interface IMember {
    admin: boolean;
    id: string;
    category?: string;
}

interface IProps {
    onPrev: (e: any) => void;
    team: Team.AsObject | undefined;
}

interface IState {
    count: number;
    list: IMember[];
    loading: boolean;
    moreAnchorPos: any;
    moreIndex: number;
    team: Team.AsObject | undefined;
}

const listStyle: React.CSSProperties = {
    overflowX: 'visible',
    overflowY: 'visible',
};

class SettingsTeam extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        return {
            team: props.team,
        };
    }

    private readonly rtl: boolean = false;
    private readonly isMobile: boolean = false;
    private readonly hasScrollbar: boolean = false;
    private list: VariableSizeList | undefined;
    private apiManager: APIManager;
    private userRepo: UserRepo;

    constructor(props: IProps) {
        super(props);

        this.state = {
            count: 0,
            list: [],
            loading: false,
            moreAnchorPos: null,
            moreIndex: -1,
            team: props.team,
        };

        this.rtl = localStorage.getItem(C_LOCALSTORAGE.LangDir) === 'rtl';
        this.isMobile = IsMobile.isAny();
        this.hasScrollbar = getScrollbarWidth() > 0;

        this.apiManager = APIManager.getInstance();
        this.userRepo = UserRepo.getInstance();
    }

    public componentDidMount() {
        this.getMembers();
    }

    public render() {
        const {team, count, moreAnchorPos} = this.state;
        if (!team) {
            return null;
        }
        return (
            <>
                <div className="menu-header">
                    <IconButton
                        onClick={this.props.onPrev}
                    >
                        <KeyboardBackspaceRounded/>
                    </IconButton>
                    <label>{i18n.t('settings.team.teams')}</label>
                </div>
                <div className="menu-content team-settings-section">
                    <div className="sub-page-header-alt">{i18n.t('settings.team.info')}</div>
                    <div className="team-info">
                        <div className="line">
                            <TextField
                                label={i18n.t('general.title')}
                                fullWidth={true}
                                value={team.name || ''}
                                className="input-edit"
                            />
                        </div>
                    </div>
                    <div
                        className="sub-page-header-alt">{i18n.tf('settings.team.members', String(localize(count)))}</div>
                    <div className="page-anchor anchor-padding-side">
                        <div className="icon color-session">
                            <GroupAddRounded/>
                        </div>
                        <div className="anchor-label">{i18n.t('settings.team.add_member')}</div>
                    </div>
                    <div className="member-wrapper">
                        {this.getWrapper()}
                    </div>
                </div>
                <Menu
                    anchorReference="anchorPosition"
                    anchorPosition={moreAnchorPos}
                    open={Boolean(moreAnchorPos)}
                    onClose={this.moreCloseHandler}
                    className="kk-context-menu"
                    classes={{
                        paper: 'kk-context-menu-paper'
                    }}
                >
                    {this.contextMenuItem()}
                </Menu>
            </>
        );
    }

    private contextMenuItem() {
        const {list, moreIndex} = this.state;
        if (!list[moreIndex]) {
            return null;
        }
        const member = list[moreIndex];
        const menuItems: any[] = [{
            cmd: 'remove',
            color: '#cc0000',
            title: i18n.t('contact.remove'),
        }];
        if (!member.admin) {
            menuItems.push({
                cmd: 'promote',
                title: i18n.t('contact.promote'),
            });
        } else {
            menuItems.push({
                cmd: 'demote',
                title: i18n.t('contact.demote'),
            });
        }
        return menuItems.map((item, index) => {
            let style = {};
            if (item.color) {
                style = {
                    color: item.color,
                };
            }
            return (<MenuItem onClick={this.contextMenuActionHandler(item.cmd, member)}
                              key={index} className="context-item" style={style}>{item.title}</MenuItem>);
        });
    }

    /* Context menu open handler */
    private contextMenuOpenHandler = (index: number) => (e: any) => {
        const {list} = this.state;
        if (!list || index === -1) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const rect = e.target.getBoundingClientRect();
        this.setState({
            moreAnchorPos: {
                left: rect.left,
                top: rect.top,
            },
            moreIndex: index,
        });
    }

    /* Context menu close handler */
    private moreCloseHandler = () => {
        this.setState({
            moreAnchorPos: null,
        });
    }

    private getWrapper() {
        const {list, loading} = this.state;
        if (list.length === 0) {
            if (loading) {
                return (<div className="member-container">
                    <Loading/>
                </div>);
            } else {
                return (<div className="member-container">{this.noRowsRenderer()}</div>);
            }
        } else {
            if (this.isMobile || !this.hasScrollbar) {
                return (
                    <AutoSizer>
                        {({width, height}: any) => (
                            <VariableSizeList
                                ref={this.refHandler}
                                itemSize={this.getHeight}
                                itemCount={list.length}
                                overscanCount={32}
                                width={width}
                                height={height}
                                className="member-container"
                                direction={this.rtl ? 'ltr' : 'rtl'}
                            >{({index, style}) => {
                                return this.rowRender({index, style, key: index});
                            }}
                            </VariableSizeList>
                        )}
                    </AutoSizer>);
            } else {
                return (<AutoSizer>
                    {({width, height}: any) => (
                        <div className="contacts-inner" style={{
                            height: height + 'px',
                            width: width + 'px',
                        }}>
                            <Scrollbars
                                autoHide={true}
                                style={{
                                    height: height + 'px',
                                    width: width + 'px',
                                }}
                                onScroll={this.handleScroll}
                                universal={true}
                            >
                                <VariableSizeList
                                    ref={this.refHandler}
                                    itemSize={this.getHeight}
                                    itemCount={list.length}
                                    overscanCount={32}
                                    width={width}
                                    height={height}
                                    className="contact-container"
                                    style={listStyle}
                                >{({index, style}) => {
                                    return this.rowRender({index, style, key: index});
                                }}
                                </VariableSizeList>
                            </Scrollbars>
                        </div>
                    )}
                </AutoSizer>);
            }
        }
    }

    /* No Rows Renderer */
    private noRowsRenderer = () => {
        return (
            <div className="no-result">
                <PersonRounded/>
                {i18n.t('settings.team.no_members')}
            </div>
        );
    }

    /* Row renderer for list */
    private rowRender = ({index, key, parent, style}: any): any => {
        const item = this.state.list[index];
        if (item.category) {
            return (<div style={style} key={`${index}-${item.category}`}
                         className="category-item">{item.category}</div>);
        } else {
            return (
                <div key={item.id} style={style}
                     className={'member-item' + (item.admin ? ' admin' : '')}>
                    <UserAvatar className="avatar" id={item.id}/>
                    {item.admin &&
                    <div className="admin-wrapper"><StarRateRounded/></div>}
                    <div className="member-info">
                        <div className="name"><UserName id={item.id} noIcon={true}/></div>
                        <LastSeen className="last-seen" id={item.id || ''}
                                  teamId={this.state.team ? this.state.team.id || '0' : '0'}/>
                    </div>
                    <div className="more" onClick={this.contextMenuOpenHandler(index)}>
                        <MoreVert/>
                    </div>
                </div>
            );
        }
    }

    /* Gets list element */
    private refHandler = (value: any) => {
        this.list = value;
    }

    /* Custom Scrollbars handler */
    private handleScroll = (e: any) => {
        const {scrollTop} = e.target;
        if (this.list) {
            this.list.scrollTo(scrollTop);
        }
    }

    /* Get dynamic height */
    private getHeight = (index: number): number => {
        const member = this.state.list[index];
        if (member.category) {
            return 26;
        } else {
            return 64;
        }
    }

    private getMembers() {
        const {team, loading} = this.state;
        if (!team || loading) {
            return;
        }
        this.setState({
            loading: true,
        });
        this.apiManager.teamListMember(team.id || '0').then((res) => {
            this.userRepo.importBulk(false, res.membersList.map(m => m.user));
            const admins: IUser[] = [];
            let users: IUser[] = [];
            const count = res.membersList.length;
            res.membersList.forEach((m) => {
                if (m.admin) {
                    admins.push(m.user);
                } else {
                    users.push(m.user);
                }
            });
            users = categorizeContact(users);
            const list: IMember[] = [{
                admin: true,
                category: i18n.t('settings.team.admins'),
                id: 'admin',
            }, ...admins.map(u => ({
                admin: true,
                id: u.id || '0',
            })), ...users.map(u => ({admin: false, id: u.id || '0', category: u.category}))];
            this.setState({
                count,
                list,
                loading: false,
            });
        }).catch(() => {
            this.setState({
                loading: false,
            });
        });
    }

    /* Context Menu action handler */
    private contextMenuActionHandler = (cmd: string, member: IMember) => (e: any) => {
        this.moreCloseHandler();
    }
}

export default SettingsTeam;
