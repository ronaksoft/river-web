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
import {debounce, findIndex, differenceBy, clone} from 'lodash';
import UserAvatar from '../UserAvatar';
import TextField from '@material-ui/core/TextField';
import ChipInput from 'material-ui-chip-input';
import Chip from '@material-ui/core/Chip';
import UserName from '../UserName';
import {MoreVert, NotInterestedRounded} from '@material-ui/icons';
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
}

interface IState {
    contacts: IUser[];
    hiddenContacts: IUser[];
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
    private readonly searchDebounce: any;
    private defaultContact: IUser[] = [];
    private readonly isMobile: boolean = false;
    private readonly hasScrollbar: boolean = false;
    private readonly rtl: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            contacts: [],
            hiddenContacts: props.hiddenContacts || [],
            moreAnchorPos: null,
            moreIndex: -1,
            page: '1',
            selectedContacts: props.contacts || [],
            title: '',
        };

        this.isMobile = IsMobile.isAny();
        this.hasScrollbar = getScrollbarWidth() > 0;
        this.rtl = localStorage.getItem('river.lang.dir') === 'rtl';

        this.userRepo = UserRepo.getInstance();
        this.searchDebounce = debounce(this.search, 512);
    }

    public componentDidMount() {
        // Gets all contacts on mount
        this.getDefault();
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            hiddenContacts: newProps.hiddenContacts || [],
        }, () => {
            if (this.state.selectedContacts.length === 0 && !this.props.disableCheckSelected) {
                this.getDefault();
            }
        });
    }

    public reload() {
        this.getDefault();
    }

    public scrollTop() {
        const className = this.props.className ? `.${this.props.className}` : '';
        const el = document.querySelector((this.isMobile || !this.hasScrollbar) ? `.contact-container${className}` : `.contacts-inner${className} > div > div:first-child`);
        // const el = document.querySelector(`.contacts-inner${className} > div > div:first-child`);
        if (el) {
            const options: any = {
                // duration of the scroll per 1000px, default 500
                speed: 500,

                // minimum duration of the scroll
                minDuration: 128,

                // maximum duration of the scroll
                maxDuration: 256,

                // @ts-ignore
                element: el,

                // Additional offset value that gets added to the desiredOffset.  This is
                // useful when passing a DOM object as the desiredOffset and wanting to adjust
                // for an fixed nav or to add some padding.
                offset: 0,

                // should animated scroll be canceled on user scroll/keypress
                // if set to "false" user input will be disabled until animated scroll is complete
                // (when set to false, "passive" will be also set to "false" to prevent Chrome errors)
                cancelOnUserAction: true,

                // Set passive event Listeners to be true by default. Stops Chrome from complaining.
                passive: true,

                // Scroll horizontally rather than vertically (which is the default)
                horizontal: false,
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
                        label={i18n.t('contact.search_contact')}
                        value={selectedContacts}
                        chipRenderer={this.chipRenderer}
                        fullWidth={true}
                        onUpdateInput={this.searchChangeHandler}
                        onDelete={this.removeMemberHandler}
                        // @ts-ignore
                        classes={{}}
                        className="contact-chips-container"
                    />}
                    {Boolean(this.props.mode === 'link') && <TextField
                        label={i18n.t('contact.search')}
                        fullWidth={true}
                        inputProps={{
                            maxLength: 32,
                        }}
                        onChange={this.searchChangeHandler}
                    />}
                </div>
                <div className="contact-list-container">
                    {this.getWrapper()}
                </div>
                <Menu
                    anchorReference="anchorPosition"
                    anchorPosition={moreAnchorPos}
                    open={Boolean(moreAnchorPos)}
                    onClose={this.moreCloseHandler}
                    className="kk-context-menu"
                >
                    {this.contextMenuItem()}
                </Menu>
            </div>
        );
    }

    private getWrapper() {
        const {contacts} = this.state;
        if (contacts.length === 0) {
            return (<div className="contact-container">{this.noRowsRenderer()}</div>);
        } else {
            if (this.isMobile || !this.hasScrollbar) {
                return (
                    <AutoSizer>
                        {({width, height}: any) => (
                            <VariableSizeList
                                ref={this.refHandler}
                                itemSize={this.getHeight}
                                itemCount={contacts.length}
                                overscanCount={32}
                                width={width}
                                height={height}
                                className={'contact-container ' + (this.props.className || '')}
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
                            >
                                <VariableSizeList
                                    ref={this.refHandler}
                                    itemSize={this.getHeight}
                                    itemCount={contacts.length}
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
                        <span className="phone">{contact.phone ? contact.phone : i18n.t('contact.no_phone')}</span>
                        {Boolean(this.props.onContextMenuAction) &&
                        <div className="more" onClick={this.contextMenuOpenHandler(index)}>
                            <MoreVert/>
                        </div>}
                    </div>
                );
            } else {
                return (
                    <div style={style} key={contact.id || ''} className="contact-item">
                        <Link to={`/chat/${contact.id}`}>
                            <span className="avatar">
                                <UserAvatar id={contact.id || ''}/>
                            </span>
                            <span className="name">
                                <span className="inner">{`${contact.firstname} ${contact.lastname}`}</span>
                                <LastSeen className="last-seen" id={contact.id || ''}/>
                            </span>
                            <span className="phone">{contact.phone ? contact.phone : i18n.t('contact.no_phone')}</span>
                            {Boolean(this.props.onContextMenuAction) &&
                            <div className="more" onClick={this.contextMenuOpenHandler(index)}>
                                <MoreVert/>
                            </div>}
                        </Link>
                    </div>
                );
            }
        }
    }

    /* No Rows Renderer */
    private noRowsRenderer = () => {
        return (
            <div className="no-result">
                <NotInterestedRounded/>
                {i18n.t('contact.no_result')}
            </div>
        );
    }

    /* Get all contacts */
    private getDefault(fill?: boolean) {
        const fn = (us: IUser[]) => {
            window.console.log(us);
            this.defaultContact = us;
            this.contactsRes = clone(us);
            if (fill !== false) {
                this.setState({
                    contacts: categorizeContact(this.getTrimmedList([])),
                });
            }
        };
        this.userRepo.getAllContacts(fn).then(fn);
    }

    /* Searches the given string */
    private searchChangeHandler = (e: any) => {
        const text = e.currentTarget.value;
        if (text.length > 0) {
            this.searchDebounce(text);
        } else {
            this.searchDebounce.cancel();
            this.contactsRes = clone(this.defaultContact);
            this.setState({
                contacts: categorizeContact(this.getTrimmedList(this.state.selectedContacts)),
            });
        }
    }

    /* For debouncing the query in order to have best performance */
    private search = (text: string) => {
        this.userRepo.getManyCache(true, {keyword: text, limit: 12}).then((res) => {
            this.contactsRes = clone(res || []);
            this.setState({
                contacts: categorizeContact(this.getTrimmedList(this.state.selectedContacts)),
            });
        });
    }

    /* Add member to selectedContacts */
    private addMemberHandler = (contact: IUser) => (e: any) => {
        const {selectedContacts} = this.state;
        if (findIndex(selectedContacts, {id: contact.id || ''}) === -1) {
            selectedContacts.push(contact);
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
        return differenceBy(this.contactsRes, [...selectedContacts, ...this.state.hiddenContacts], 'id');
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
        const contact = this.state.contacts[index];
        if (contact.category) {
            return 40;
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
            return;
        }
        const {contacts, moreIndex} = this.state;
        if (!contacts[moreIndex]) {
            return '';
        }
        const menuItems = [{
            cmd: 'remove',
            color: '#cc0000',
            title: i18n.t('contact.remove'),
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
