/*
    Creation Time: 2020 - Sep - 06
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {IconButton, Switch, TextField, MenuItem, Menu} from "@material-ui/core";
import {
    KeyboardBackspaceRounded,
    MoreVertRounded,
    PersonRounded,
    StarRateRounded,
    GroupAddRounded,
    GroupRounded,
} from "@material-ui/icons";
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
import {TeamMember} from "../../services/sdk/messages/team_pb";
import {findIndex} from "lodash";
import ContactPicker from "../ContactPicker";
import {Error as RiverError} from "../../services/sdk/messages/rony_pb";
import {ITeam} from "../../repository/team/interface";
import {switchClasses} from "../SettingsMenu";
import TeamRepo from "../../repository/team";
import {ModalityService} from "kk-modality";

import './style.scss';
import {PartialDeep} from "type-fest";
import {TeamFlags} from "../../services/sdk/messages/core.types_pb";

interface IMember {
    admin: boolean;
    id: string;
    category?: string;
    t?: IUser;
}

interface IProps {
    onPrev: (e: any) => void;
    team: ITeam | undefined;
    onError?: (message: string) => void;
    onUpdate?: () => void;
}

interface IState {
    count: number;
    list: IMember[];
    loading: boolean;
    moreAnchorPos: any;
    moreIndex: number;
    page: number;
    team: ITeam | undefined;
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
    private contactPickerRef: ContactPicker | undefined;
    private teamRepo: TeamRepo;
    private hasUpdate: boolean = false;
    private defaultTeamName: string = '';
    private modalityService: ModalityService;

    constructor(props: IProps) {
        super(props);

        this.state = {
            count: 0,
            list: [],
            loading: false,
            moreAnchorPos: null,
            moreIndex: -1,
            page: 1,
            team: props.team,
        };

        this.rtl = localStorage.getItem(C_LOCALSTORAGE.LangDir) === 'rtl';
        this.isMobile = IsMobile.isAny();
        this.hasScrollbar = getScrollbarWidth() > 0;

        this.apiManager = APIManager.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.teamRepo = TeamRepo.getInstance();
        this.modalityService = ModalityService.getInstance();
    }

    public componentDidMount() {
        if (this.state.team) {
            this.defaultTeamName = this.state.team.name || '';
        }
        this.getMembers();
    }

    public render() {
        const {team, count, moreAnchorPos, page} = this.state;
        if (!team) {
            return null;
        }
        const teamAdmin = team && ((team.flagsList || []).indexOf(TeamFlags.TEAMFLAGSADMIN) > -1 || (team.flagsList || []).indexOf(TeamFlags.TEAMFLAGSCREATOR) > -1);
        return (
            <div className={`page-container page-${page}`}>
                <div className="page page-1">
                    <div className="menu-header">
                        <IconButton
                            onClick={this.prevHandler}
                        >
                            <KeyboardBackspaceRounded/>
                        </IconButton>
                        <label>{i18n.t('settings.team.teams')}</label>
                    </div>
                    <div className="menu-content team-settings-section">
                        {teamAdmin ? <>
                            <div className="sub-page-header-alt">{i18n.t('settings.team.info')}</div>
                            <div className="team-info">
                                <div className="line">
                                    <TextField
                                        label={i18n.t('general.title')}
                                        fullWidth={true}
                                        value={team.name || ''}
                                        onChange={this.nameChangeHandler}
                                        variant="outlined"
                                        className="input-edit"
                                        inputProps={{
                                            maxLength: 20,
                                        }}
                                    />
                                </div>
                            </div>
                        </> : <div className="sub-page-header-alt">{team.name}</div>}
                        {Boolean(teamAdmin) &&
                        <div className="page-anchor anchor-padding-side" onClick={this.nextPageHandler}>
                            <div className="icon color-session">
                                <GroupRounded/>
                            </div>
                            <div
                                className="anchor-label">{i18n.tf('settings.team.members', String(localize(count)))}</div>
                        </div>}
                        <div className="sub-page-header-alt">{i18n.t('settings.team.background_service')}</div>
                        <div className="switch-item with-border">
                            <div
                                className="switch-label">{i18n.t('settings.team.notification')}</div>
                            <div className="switch">
                                <Switch
                                    checked={team.notify || false}
                                    color="default"
                                    onChange={this.toggleNotifyHandler}
                                    classes={switchClasses}
                                    className={team.notify ? 'root-settings-switch-checked' : ''}
                                />
                            </div>
                        </div>
                        <div className="switch-item">
                            <div
                                className="switch-label">{i18n.t('settings.team.count_unread')}</div>
                            <div className="switch">
                                <Switch
                                    checked={team.count_unread || false}
                                    color="default"
                                    onChange={this.toggleCountUnreadHandler}
                                    classes={switchClasses}
                                    className={team.count_unread ? 'root-settings-switch-checked' : ''}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="page page-2">
                    <div className="menu-header">
                        <IconButton
                            onClick={this.prevPageHandler}
                        >
                            <KeyboardBackspaceRounded/>
                        </IconButton>
                        <label>{i18n.tf('settings.team.members', String(localize(count)))}</label>
                    </div>
                    <div className="menu-content team-settings-section">
                        <div className="page-anchor anchor-padding-side" onClick={this.addMemberHandler}>
                            <div className="icon color-session">
                                <GroupAddRounded/>
                            </div>
                            <div className="anchor-label">{i18n.t('settings.team.add_member')}</div>
                        </div>
                        <div className="member-wrapper">
                            {this.getWrapper()}
                        </div>
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
                <ContactPicker ref={this.contactPickerRefHandler} onDone={this.contactPickerDoneHandler}
                               teamId={'0'} title={i18n.t('settings.team.choose_contacts')}/>
            </div>
        );
    }

    private contactPickerRefHandler = (ref: any) => {
        this.contactPickerRef = ref;
    }

    private contextMenuItem() {
        const {list, moreIndex} = this.state;
        if (!list[moreIndex]) {
            return null;
        }
        const member = list[moreIndex];
        const menuItems: any[] = [];
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
        menuItems.push({
            cmd: 'remove',
            color: '#cc0000',
            title: i18n.t('contact.remove'),
        });
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
                                return this.rowRender({index, key: index, style});
                            }}
                            </VariableSizeList>
                        )}
                    </AutoSizer>);
            } else {
                return (<AutoSizer>
                    {({width, height}: any) => (
                        <div className="members-inner" style={{
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
                                    className="member-container"
                                    style={listStyle}
                                    direction={this.rtl ? 'ltr' : 'rtl'}
                                >{({index, style}) => {
                                    return this.rowRender({index, key: index, style});
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
                        <MoreVertRounded/>
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
            const count = res.membersList.length;
            this.setState({
                count,
                list: this.trimList(res.membersList),
                loading: false,
            });
        }).catch(() => {
            this.setState({
                loading: false,
            });
        });
    }

    private trimList(members: PartialDeep<TeamMember.AsObject>[]) {
        const admins: IUser[] = [];
        let users: IUser[] = [];
        members.forEach((m) => {
            if (m.admin) {
                admins.push(m.user as IUser);
            } else {
                users.push(m.user as IUser);
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
            t: u,
        })), ...users.map(u => ({admin: false, category: u.category, id: u.id || '0', t: u}))];
        return list;
    }

    private listToMembers(list: IMember[]): PartialDeep<TeamMember.AsObject>[] {
        return list.filter(i => !i.category).map(i => ({
            admin: i.admin || false,
            user: i.t || {},
            userid: i.id,
        }));
    }

    /* Context Menu action handler */
    private contextMenuActionHandler = (cmd: string, member: IMember) => (e: any) => {
        const {team, list} = this.state;
        if (!team) {
            return;
        }
        this.moreCloseHandler();
        this.modalityService.open({
            cancelText: i18n.t('general.cancel'),
            confirmText: i18n.t('general.yes'),
            title: i18n.t('general.are_you_sure'),
        }).then((modalRes) => {
            if (modalRes === 'confirm') {
                switch (cmd) {
                    case 'remove':
                        this.apiManager.teamRemoveMember(team.id || '0', member.id).then(() => {
                            const index = findIndex(list, {id: member.id});
                            if (index > -1) {
                                list.splice(index, 1);
                                if (this.list) {
                                    this.list.resetAfterIndex(0, false);
                                }
                                this.setState({
                                    list: this.trimList(this.listToMembers(list)),
                                    loading: false,
                                });
                            }
                            this.userRepo.invalidateCacheByTeamId(team.id || '0');
                        }).catch(this.catchFunction);
                        break;
                    case 'promote':
                        this.apiManager.teamPromoteMember(team.id || '0', member.id).then(() => {
                            const index = findIndex(list, {id: member.id});
                            if (index > -1) {
                                list[index].admin = true;
                                if (this.list) {
                                    this.list.resetAfterIndex(0, false);
                                }
                                this.setState({
                                    list: this.trimList(this.listToMembers(list)),
                                    loading: false,
                                });
                            }
                        }).catch(this.catchFunction);
                        break;
                    case 'demote':
                        this.apiManager.teamDemoteMember(team.id || '0', member.id).then(() => {
                            const index = findIndex(list, {id: member.id});
                            if (index > -1) {
                                list[index].admin = false;
                                if (this.list) {
                                    this.list.resetAfterIndex(0, false);
                                }
                                this.setState({
                                    list: this.trimList(this.listToMembers(list)),
                                    loading: false,
                                });
                            }
                        }).catch(this.catchFunction);
                        break;
                }
            }
        });
    }

    private addMemberHandler = () => {
        if (!this.contactPickerRef) {
            return;
        }
        this.contactPickerRef.openDialog(this.state.list.filter(o => o.t && !o.category).map(o => o.t || {}));
    }

    private contactPickerDoneHandler = (contacts: IUser[], caption: string) => {
        const {team, list} = this.state;
        if (!team || contacts.length === 0) {
            return;
        }
        const promises: any[] = [];
        contacts.forEach((contact) => {
            promises.push(this.apiManager.teamAddMember(team.id || '0', contact.id || '0'));
        });
        if (promises.length > 0) {
            Promise.all(promises).then(() => {
                if (this.list) {
                    this.list.resetAfterIndex(0, false);
                }
                this.setState({
                    list: this.trimList([...contacts.map(u => ({
                        admin: false,
                        user: u,
                        userid: u.id || '0',
                    })), ...this.listToMembers(list)]),
                    loading: false,
                });
                this.userRepo.invalidateCacheByTeamId(team.id || '0');
            }).catch(this.catchFunction);
        }
    }

    private catchFunction = (err: RiverError.AsObject) => {
        if (this.props.onError) {
            this.props.onError(JSON.stringify(err));
        }
        this.setState({
            loading: false,
        });
    }

    private toggleNotifyHandler = (e: any, checked: boolean) => {
        const {team} = this.state;
        if (!team) {
            return;
        }
        team.notify = checked;
        this.teamRepo.update(team);
        this.setState({
            team,
        });
        this.hasUpdate = true;
    }

    private toggleCountUnreadHandler = (e: any, checked: boolean) => {
        const {team} = this.state;
        if (!team) {
            return;
        }
        team.count_unread = checked;
        this.teamRepo.update(team);
        this.setState({
            team,
        });
        this.hasUpdate = true;
    }

    private nameChangeHandler = (e: any) => {
        const {team} = this.state;
        if (team) {
            team.name = e.target.value;
            this.setState({
                team,
            });
        }
    }

    private prevPageHandler = () => {
        this.setState({
            page: 1,
        });
    }

    private nextPageHandler = () => {
        this.setState({
            page: 2,
        });
    }

    private prevHandler = (e: any) => {
        if (this.hasUpdate && this.props.onUpdate) {
            this.props.onUpdate();
        }
        const {team} = this.state;
        if (team && team.name !== this.defaultTeamName) {
            this.defaultTeamName = team.name || '';
            this.apiManager.teamEdit(team.id || '0', team.name || '').then(() => {
                this.teamRepo.update({
                    id: team.id,
                    name: team.name,
                });
                if (this.props.onUpdate) {
                    this.props.onUpdate();
                }
            }).catch((err) => {
                if (this.props.onError) {
                    this.props.onError(JSON.stringify(err));
                }
            });
        }
        if (this.props.onPrev) {
            this.props.onPrev(e);
        }
    }
}

export default SettingsTeam;
