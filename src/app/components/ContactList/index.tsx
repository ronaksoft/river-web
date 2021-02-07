/*
    Creation Time: 2018 - Nov - 28
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import AutoSizer from "react-virtualized-auto-sizer";
import {debounce, findIndex, differenceBy, clone, uniqBy} from 'lodash';
import UserAvatar from '../UserAvatar';
import TextField from '@material-ui/core/TextField';
import ChipInput from 'material-ui-chip-input';
import Chip from '@material-ui/core/Chip';
import UserName from '../UserName';
import {MoreVertRounded, PersonRounded, SearchRounded} from '@material-ui/icons';
import XRegExp from 'xregexp';
import Menu from '@material-ui/core/Menu/Menu';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import {Link} from 'react-router-dom';
import Scrollbars from 'react-custom-scrollbars';
import {IUser} from '../../repository/user/interface';
import UserRepo from '../../repository/user';
import LastSeen from '../LastSeen';
import i18n from '../../services/i18n';
import {VariableSizeList} from "react-window";
import IsMobile from "../../services/isMobile";
import getScrollbarWidth from "../../services/utilities/scrollbar_width";
import animateScrollTo from "animated-scroll-to";
import {Loading} from '../Loading';
import SearchRepo from "../../repository/search";
import {C_LOCALSTORAGE} from "../../services/sdk/const";
import {InputAdornment} from "@material-ui/core";
import {PeerType} from "../../services/sdk/messages/core.types_pb";
import GroupRepo from "../../repository/group";
import {IGroup} from "../../repository/group/interface";
import {OfficialIcon} from "../SVG/official";
import {currentUserId} from "../../services/sdk";

import './style.scss';

interface IProps {
    className?: string;
    contacts?: IUser[];
    disableCheckSelected?: boolean;
    hiddenContacts?: IUser[];
    mode: 'chip' | 'link';
    noRowsRenderer?: () => JSX.Element;
    onChange?: (contacts: IUser[]) => void;
    onContextMenuAction?: (cmd: string, contact: IUser) => void;
    globalSearch?: boolean;
    teamId: string;
    hideYou?: boolean;
    groupId?: string;
    showOfficialBadge?: boolean;
    onDefaultLoad?: (count: number) => void;
}

interface IState {
    contacts: IUser[];
    globalUsers: IUser[];
    hiddenContacts: IUser[];
    loading: boolean;
    moreAnchorPos: any;
    moreIndex: number;
    page: string;
    selectedContacts: IUser[];
    title: string;
}

const listStyle: React.CSSProperties = {
    overflowX: 'visible',
    overflowY: 'visible',
};

export const categorizeContact = (contacts: IUser[]): IUser[] => {
    const list = clone(contacts);
    list.sort((a, b) => {
        const strA = ((a.firstname || '') + (a.lastname || '')).toLowerCase();
        const strB = ((b.firstname || '') + (b.lastname || '')).toLowerCase();
        if (strA < strB) {
            return -1;
        }
        if (strA > strB) {
            return 1;
        }
        return 0;
    });
    const outList: IUser[] = [];
    let cat = '';
    let lastCat = '';
    const regChar = XRegExp('\\p{L}');
    const regDigit = /^\d+$/;
    list.forEach((item) => {
        const char = ((item.firstname || '') + (item.lastname || '')).toLowerCase().charAt(0);
        if (regChar.test(char)) {
            cat = char.toLocaleUpperCase();
        } else if (regDigit.test(char)) {
            cat = '#';
        } else {
            cat = '*';
        }
        if (cat !== lastCat) {
            outList.push({
                category: cat,
            });
            lastCat = cat;
        }
        outList.push(item);
    });
    return outList;
};

class ContactList extends React.Component<IProps, IState> {
    private contactsRes: IUser[] = [];
    private list: VariableSizeList | undefined;
    private userRepo: UserRepo;
    private searchRepo: SearchRepo;
    private readonly searchDebounce: any;
    private defaultContact: IUser[] = [];
    private readonly isMobile = IsMobile.isAny();
    private readonly hasScrollbar: boolean = false;
    private readonly rtl: boolean = false;
    private extraHidden: IUser[] = [];
    private groupRepo: GroupRepo;

    constructor(props: IProps) {
        super(props);

        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();

        if (props.hideYou) {
            this.extraHidden = [{
                id: this.userRepo.getCurrentUserId(),
            }];
        }

        this.state = {
            contacts: [],
            globalUsers: [],
            hiddenContacts: [...(props.hiddenContacts || []), ...this.extraHidden].map((o) => {
                // @ts-ignore
                if (o.userid) {
                    // @ts-ignore
                    return {...o, id: o.userid};
                } else {
                    return o;
                }
            }),
            loading: false,
            moreAnchorPos: null,
            moreIndex: -1,
            page: '1',
            selectedContacts: props.contacts || [],
            title: '',
        };

        this.hasScrollbar = getScrollbarWidth() > 0;
        this.rtl = localStorage.getItem(C_LOCALSTORAGE.LangDir) === 'rtl';

        this.searchRepo = SearchRepo.getInstance();
        this.searchDebounce = debounce(this.search, 512);
    }

    public componentDidMount() {
        // Gets all contacts on mount
        this.getDefault();
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
        this.setState({
            hiddenContacts: [...(newProps.hiddenContacts || []), ...this.extraHidden].map((o) => {
                // @ts-ignore
                if (o.userid) {
                    // @ts-ignore
                    return {...o, id: o.userid};
                } else {
                    return o;
                }
            }),
        }, () => {
            if (this.state.selectedContacts.length === 0 && !this.props.disableCheckSelected) {
                this.getDefault();
            }
        });
    }

    public reload(empty?: boolean) {
        if (empty) {
            this.setState({
                contacts: [],
                globalUsers: [],
            });
        }
        this.getDefault();
    }

    public selectAll() {
        const {selectedContacts, hiddenContacts} = this.state;
        this.defaultContact.forEach((contact) => {
            if (contact.id === currentUserId || findIndex(selectedContacts, {id: contact.id || ''}) > -1 || (hiddenContacts.length > 0 && findIndex(hiddenContacts, {id: contact.id || ''}) > -1)) {
                return;
            }
            selectedContacts.push(contact);
        });
        if (this.list) {
            this.list.resetAfterIndex(0, false);
        }
        this.setState({
            contacts: categorizeContact(this.getTrimmedList(selectedContacts)),
            selectedContacts,
        }, () => {
            this.dispatchContactChange();
        });
    }

    public scrollTop() {
        const className = this.props.className ? `.${this.props.className}` : '';
        const el = document.querySelector((this.isMobile || !this.hasScrollbar) ? `.contact-container${className}` : `.contacts-inner${className} > div > div:first-child`);
        // const el = document.querySelector(`.contacts-inner${className} > div > div:first-child`);
        if (el) {
            const options: any = {
                cancelOnUserAction: true,
                // @ts-ignore
                element: el,
                horizontal: false,
                maxDuration: 256,
                minDuration: 128,
                offset: 0,
                passive: true,
                speed: 500,
            };
            animateScrollTo(0, options);
        }
    }

    public render() {
        const {selectedContacts, moreAnchorPos} = this.state;
        return (
            <div className="contact-list">
                <div className="contact-input-container">
                    {Boolean(this.props.mode === 'chip') && <ChipInput
                        placeholder={i18n.t('contact.search_contact')}
                        value={selectedContacts}
                        chipRenderer={this.chipRenderer}
                        fullWidth={true}
                        onUpdateInput={this.searchChangeHandler}
                        onDelete={this.removeMemberHandler}
                        variant="outlined"
                        margin="dense"
                        InputProps={{
                            startAdornment:
                                <InputAdornment position="start" className="search-adornment">
                                    <SearchRounded/>
                                </InputAdornment>
                        }}
                        // @ts-ignore
                        classes={{}}
                        className="contact-chips-container"
                    />}
                    {Boolean(this.props.mode === 'link') &&
                    <TextField
                        placeholder={i18n.t('dialog.search')}
                        fullWidth={true}
                        className="contact-text-field"
                        inputProps={{
                            maxLength: 32,
                        }}
                        InputProps={{
                            startAdornment:
                                <InputAdornment position="start" className="dialog-adornment">
                                    <SearchRounded/>
                                </InputAdornment>
                        }}
                        variant="outlined"
                        margin="dense"
                        onChange={this.searchChangeHandler}
                    />}
                </div>
                <div className={'contact-list-container' + (this.props.teamId === '0' ? ' default-team' : '')}>
                    {this.getWrapper()}
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
            </div>
        );
    }

    private getWrapper() {
        const {contacts, globalUsers, loading} = this.state;
        if ((contacts.length + globalUsers.length) === 0) {
            if (loading) {
                return (<div className="contact-container">
                    <Loading/>
                </div>);
            } else {
                return (<div className="contact-container">{this.noRowsRenderer()}</div>);
            }
        } else {
            if (this.isMobile || !this.hasScrollbar) {
                return (
                    <AutoSizer>
                        {({width, height}: any) => (
                            <VariableSizeList
                                ref={this.refHandler}
                                itemSize={this.getHeight}
                                itemCount={contacts.length + (globalUsers.length ? globalUsers.length + 1 : 0)}
                                overscanCount={32}
                                width={width}
                                height={height}
                                className={'contact-container ' + (this.props.className || '')}
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
                        <div className={'contacts-inner ' + (this.props.className || '')} style={{
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
                                rtl={this.rtl}
                            >
                                <VariableSizeList
                                    ref={this.refHandler}
                                    itemSize={this.getHeight}
                                    itemCount={contacts.length + (globalUsers.length ? globalUsers.length + 1 : 0)}
                                    overscanCount={32}
                                    width={width}
                                    height={height}
                                    className="contact-container"
                                    style={listStyle}
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

    /* Custom Scrollbars handler */
    private handleScroll = (e: any) => {
        const {scrollTop} = e.target;
        if (this.list) {
            this.list.scrollTo(scrollTop);
        }
    }

    /* Chip renderer for select input */
    private chipRenderer = ({value, text}: any, key: any): React.ReactNode => {
        return (<Chip key={key} avatar={<UserAvatar id={value.id} noDetail={true}/>} tabIndex={-1}
                      label={<UserName id={value.id} noDetail={true} unsafe={true}/>}
                      onDelete={this.removeMemberHandler(value)} className="chip"/>);
    }

    /* Gets list element */
    private refHandler = (value: any) => {
        this.list = value;
    }

    /* Row renderer for list */
    private rowRender = ({index, key, parent, style}: any): any => {
        if (this.state.contacts.length > index) {
            const contact = this.state.contacts[index];
            if (contact.category) {
                return (<div style={style} key={`${index}-${contact.category}`}
                             className="category-item">{contact.category}</div>);
            } else {
                if (this.props.mode === 'chip') {
                    return (
                        <div style={style} key={contact.id || ''} className="contact-item"
                             onClick={this.addMemberHandler(contact)}>
                            <span className="avatar">
                                <UserAvatar id={contact.id || ''}/>
                            </span>
                            <span className="name">{`${contact.firstname} ${contact.lastname}`}</span>
                            <span
                                className="phone">{contact.phone ? contact.phone : ((contact.username !== '') ? contact.username : i18n.t('contact.no_phone'))}</span>
                            {Boolean(this.props.onContextMenuAction && this.props.teamId === '0') &&
                            <div className="more" onClick={this.contextMenuOpenHandler(index)}>
                                <MoreVertRounded/>
                            </div>}
                        </div>
                    );
                } else {
                    const {showOfficialBadge} = this.props;
                    return (
                        <div style={style} key={contact.id || ''} className="contact-item">
                            <Link to={`/chat/${this.props.teamId}/${contact.id}_${PeerType.PEERUSER}`}>
                                <span className="avatar">
                                    <UserAvatar id={contact.id || ''}/>
                                </span>
                                <span className="name">
                                    <span className="inner">{`${contact.firstname} ${contact.lastname}`}
                                        {showOfficialBadge && contact.official && <OfficialIcon/>}</span>
                                    <LastSeen className="last-seen" id={contact.id || ''} teamId={this.props.teamId}/>
                                </span>
                                <span
                                    className="phone">{contact.phone ? contact.phone : ((contact.username !== '') ? contact.username : i18n.t('contact.no_phone'))}</span>
                                {Boolean(this.props.onContextMenuAction && this.props.teamId === '0') &&
                                <div className="more" onClick={this.contextMenuOpenHandler(index)}>
                                    <MoreVertRounded/>
                                </div>}
                            </Link>
                        </div>
                    );
                }
            }
        } else if (this.state.contacts.length === index) {
            return (
                <div style={style} key={index} className="contact-separator">{i18n.t('contact.global_search')}</div>);
        } else {
            const contact = this.state.globalUsers[index - (this.state.contacts.length + 1)];
            return (
                <div style={style} key={contact.id || ''} className="contact-item">
                    <Link to={`/chat/${this.props.teamId}/${contact.id}_${PeerType.PEERUSER}`}>
                        <span className="avatar">
                            <UserAvatar id={contact.id || ''}/>
                        </span>
                        <span className="name">
                            <span className="inner">{`${contact.firstname} ${contact.lastname}`}</span>
                            <LastSeen className="last-seen" id={contact.id || ''} teamId={this.props.teamId}/>
                        </span>
                        <span
                            className="phone">{contact.phone ? contact.phone : ((contact.username !== '') ? contact.username : i18n.t('contact.no_phone'))}</span>
                        {Boolean(this.props.onContextMenuAction && this.props.teamId === '0') &&
                        <div className="more" onClick={this.contextMenuOpenHandler(index)}>
                            <MoreVertRounded/>
                        </div>}
                    </Link>
                </div>
            );
        }
    }

    /* No Rows Renderer */
    private noRowsRenderer = () => {
        return (
            <div className="no-result">
                <PersonRounded/>
                {i18n.t('contact.no_result')}
            </div>
        );
    }

    /* Get all contacts */
    private getDefault() {
        const {groupId} = this.props;
        if (groupId) {
            this.getDefaultGroupMembers(groupId);
        } else {
            this.getDefaultContacts();
        }
    }

    private getDefaultGroupMembers(groupId: string) {
        const {loading} = this.state;
        if (loading) {
            return;
        }
        this.setState({
            loading: true,
        });
        const fn = (cache: boolean) => (group: IGroup) => {
            const us: IUser[] = uniqBy((group.participantList || []).map((member) => ({
                accesshash: member.accesshash,
                firstname: member.firstname,
                id: member.userid,
                lastname: member.lastname,
                photo: member.photo,
                username: member.username,
            })), 'id');
            this.defaultContact = us;
            this.contactsRes = clone(us);
            if (this.props.onDefaultLoad) {
                this.props.onDefaultLoad(us.length);
            }
            this.setState({
                contacts: categorizeContact(this.getTrimmedList([])),
                loading: false,
            });
        };
        this.groupRepo.getFull(this.props.teamId, groupId, fn(true), true).then(fn(false));
    }

    private getDefaultContacts() {
        const {loading} = this.state;
        if (loading) {
            return;
        }
        this.setState({
            loading: true,
        });
        const fn = (cache: boolean) => (us: IUser[]) => {
            this.defaultContact = us;
            this.contactsRes = clone(us);
            if (this.list) {
                this.list.resetAfterIndex(0, false);
            }
            if (this.props.onDefaultLoad) {
                this.props.onDefaultLoad(us.length);
            }
            this.setState({
                contacts: categorizeContact(this.getTrimmedList([])),
                loading: false,
            });
        };
        this.userRepo.getAllContacts(this.props.teamId, fn(true)).then(fn(false));
    }

    /* Searches the given string */
    private searchChangeHandler = (e: any) => {
        const text = e.currentTarget.value;
        if (text.length > 0) {
            this.searchDebounce(text);
        } else {
            this.searchDebounce.cancel();
            this.contactsRes = clone(this.defaultContact);
            if (this.list) {
                this.list.resetAfterIndex(0, false);
            }
            this.setState({
                contacts: categorizeContact(this.getTrimmedList(this.state.selectedContacts)),
            });
        }
    }

    /* For debouncing the query in order to have best performance */
    private search = (text: string) => {
        const {groupId} = this.props;
        if (groupId) {
            this.searchGroupMembers(text);
        } else {
            this.searchContacts(text);
        }
    }

    private searchGroupMembers(text: string) {
        const reg = new RegExp(text || '', 'gi');
        if (this.list) {
            this.list.resetAfterIndex(0, false);
        }
        this.contactsRes = clone(this.defaultContact.filter((u) => {
            return (reg.test(u.phone || '') || reg.test(u.username || '') || reg.test(`${u.firstname} ${u.lastname}`));
        }));
        this.setState({
            contacts: categorizeContact(this.getTrimmedList(this.state.selectedContacts)),
        });
    }

    private searchContacts(text: string) {
        this.userRepo.getManyCache(this.props.teamId, true, {keyword: text, limit: 12}).then((res) => {
            this.contactsRes = clone(res || []);
            if (this.list) {
                this.list.resetAfterIndex(0, false);
            }
            this.setState({
                contacts: categorizeContact(this.getTrimmedList(this.state.selectedContacts)),
            });
        });
        if (this.props.globalSearch && text.length > 0) {
            this.searchRepo.globalSearch(this.props.teamId, text, this.contactsRes, (users) => {
                if (this.list) {
                    this.list.resetAfterIndex(this.state.contacts.length, false);
                }
                this.setState({
                    globalUsers: users,
                });
            });
        } else if (this.state.globalUsers.length !== 0) {
            this.setState({
                globalUsers: [],
            });
        }
    }

    /* Add member to selectedContacts */
    private addMemberHandler = (contact: IUser) => (e: any) => {
        const {selectedContacts} = this.state;
        if (findIndex(selectedContacts, {id: contact.id || ''}) === -1) {
            selectedContacts.push(contact);
            if (this.list) {
                this.list.resetAfterIndex(0, false);
            }
            this.setState({
                contacts: categorizeContact(this.getTrimmedList(selectedContacts)),
                selectedContacts,
            }, () => {
                this.dispatchContactChange();
            });
        }
    }

    /* Remove member from selectedContacts */
    private removeMemberHandler = (contact: IUser) => (e: any) => {
        const {selectedContacts} = this.state;
        if (!selectedContacts || !contact) {
            return;
        }
        const index = findIndex(selectedContacts, {id: contact.id || ''});
        if (index > -1) {
            selectedContacts.splice(index, 1);
            if (this.list) {
                this.list.resetAfterIndex(0, false);
            }
            this.setState({
                contacts: categorizeContact(this.getTrimmedList(selectedContacts)),
                selectedContacts,
            }, () => {
                this.dispatchContactChange();
            });
        }
    }

    /* Removes the selected users from the list */
    private getTrimmedList(selectedContacts: IUser[]) {
        return differenceBy(this.contactsRes, uniqBy([...selectedContacts, ...this.state.hiddenContacts], 'id'), 'id');
    }

    /* Dispatch any changes on edit */
    private dispatchContactChange() {
        const {selectedContacts} = this.state;
        if (this.props.onChange) {
            this.props.onChange(clone(selectedContacts));
        }
    }

    /* Get dynamic height */
    private getHeight = (index: number): number => {
        if (this.state.contacts.length > index) {
            const contact = this.state.contacts[index];
            if (contact.category) {
                return 20;
            } else {
                return 64;
            }
        } else if (this.state.contacts.length === index) {
            return 24;
        } else {
            return 64;
        }
    }

    /* Context menu open handler */
    private contextMenuOpenHandler = (index: number) => (e: any) => {
        const {contacts} = this.state;
        if (!contacts || index === -1) {
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

    /* Context menu items renderer */
    private contextMenuItem() {
        if (!this.props.onContextMenuAction) {
            return null;
        }
        const {contacts, moreIndex} = this.state;
        if (!contacts[moreIndex]) {
            return null;
        }
        const menuItems = [{
            cmd: 'remove',
            color: '#cc0000',
            title: i18n.t('contact.delete'),
        }];
        return menuItems.map((item, index) => {
            let style = {};
            if (item.color) {
                style = {
                    color: item.color,
                };
            }
            return (<MenuItem onClick={this.contextMenuActionHandler(item.cmd, contacts[moreIndex])}
                              key={index} className="context-item" style={style}>{item.title}</MenuItem>);
        });
    }

    /* Context Menu action handler */
    private contextMenuActionHandler = (cmd: string, contact: IUser) => (e: any) => {
        this.moreCloseHandler();
        if (this.props.onContextMenuAction) {
            e.preventDefault();
            e.stopPropagation();
            this.props.onContextMenuAction(cmd, contact);
        }
    }
}

export default ContactList;
