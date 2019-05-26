/*
    Creation Time: 2018 - Nov - 28
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {List, AutoSizer, Index} from 'react-virtualized';
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

import './style.css';

interface IProps {
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
    moreAnchorEl: any;
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
    private list: List;
    private userRepo: UserRepo;
    private readonly searchDebounce: any;
    private defaultContact: IUser[];

    constructor(props: IProps) {
        super(props);

        this.state = {
            contacts: [],
            hiddenContacts: props.hiddenContacts || [],
            moreAnchorEl: null,
            moreIndex: -1,
            page: '1',
            selectedContacts: props.contacts || [],
            title: '',
        };

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

    public render() {
        const {contacts, selectedContacts, moreAnchorEl} = this.state;
        return (
            <div className="contact-list">
                <div className="contact-input-container">
                    {Boolean(this.props.mode === 'chip') && <ChipInput
                        label="Search contacts"
                        value={selectedContacts}
                        chipRenderer={this.chipRenderer}
                        fullWidth={true}
                        onUpdateInput={this.searchChangeHandler}
                        onDelete={this.removeMemberHandler}
                        // @ts-ignore
                        classes={{}}
                    />}
                    {Boolean(this.props.mode === 'link') && <TextField
                        label="Search..."
                        fullWidth={true}
                        inputProps={{
                            maxLength: 32,
                        }}
                        onChange={this.searchChangeHandler}
                    />}
                </div>
                <div className="contact-list-container">
                    <AutoSizer>
                        {({width, height}: any) => (
                            <React.Fragment>
                                <Scrollbars
                                    autoHide={true}
                                    style={{
                                        height: height + 'px',
                                        width: width + 'px',
                                    }}
                                    onScroll={this.handleScroll}
                                >
                                    <List
                                        ref={this.refHandler}
                                        rowHeight={this.getHeight}
                                        rowRenderer={this.rowRender}
                                        rowCount={contacts.length}
                                        overscanRowCount={10}
                                        width={width}
                                        height={height}
                                        className="contact-container"
                                        noRowsRenderer={this.props.noRowsRenderer || this.noRowsRenderer}
                                        style={listStyle}
                                    />
                                </Scrollbars>
                                <Menu
                                    anchorEl={moreAnchorEl}
                                    open={Boolean(moreAnchorEl)}
                                    onClose={this.moreCloseHandler}
                                    className="kk-context-menu"
                                >
                                    {this.contextMenuItem()}
                                </Menu>
                            </React.Fragment>
                        )}
                    </AutoSizer>
                </div>
            </div>
        );
    }

    /* Custom Scrollbars handler */
    private handleScroll = (e: any) => {
        const {scrollTop} = e.target;
        if (this.list.Grid) {
            this.list.Grid.handleScrollEvent({scrollTop});
        }
    }

    /* Chip renderer for select input */
    private chipRenderer = ({value, text}: any, key: any): React.ReactNode => {
        return (<Chip key={key} avatar={<UserAvatar id={value.id} noDetail={true}/>} tabIndex={-1}
                      label={<UserName id={value.id} noDetail={true} unsafe={true}/>}
                      onDelete={this.removeMemberHandler.bind(this, value)} className="chip"/>);
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
                         onClick={this.addMemberHandler.bind(this, contact)}>
                    <span className="avatar">
                        <UserAvatar id={contact.id || ''}/>
                    </span>
                        <span className="name">{`${contact.firstname} ${contact.lastname}`}</span>
                        <span className="phone">{contact.phone ? contact.phone : 'no phone'}</span>
                        {Boolean(this.props.onContextMenuAction) &&
                        <div className="more" onClick={this.contextMenuOpenHandler.bind(this, index)}>
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
                            <span className="phone">{contact.phone ? contact.phone : 'no phone'}</span>
                            {Boolean(this.props.onContextMenuAction) &&
                            <div className="more" onClick={this.contextMenuOpenHandler.bind(this, index)}>
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
                no result!
            </div>
        );
    }

    /* Get all contacts */
    private getDefault(fill?: boolean) {
        this.userRepo.getAllContacts().then((res) => {
            this.defaultContact = res;
            this.contactsRes = clone(res);
            if (fill !== false) {
                this.setState({
                    contacts: categorizeContact(this.getTrimmedList([])),
                }, () => {
                    this.list.recomputeRowHeights();
                    this.list.forceUpdateGrid();
                });
            }
        });
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
            }, () => {
                this.list.recomputeRowHeights();
                this.list.forceUpdateGrid();
            });
        });
    }

    /* Add member to selectedContacts */
    private addMemberHandler = (contact: IUser) => {
        const {selectedContacts} = this.state;
        if (findIndex(selectedContacts, {id: contact.id || ''}) === -1) {
            selectedContacts.push(contact);
            this.setState({
                contacts: categorizeContact(this.getTrimmedList(selectedContacts)),
                selectedContacts,
            }, () => {
                this.dispatchContactChange();
                this.list.recomputeRowHeights();
            });
        }
    }

    /* Remove member from selectedContacts */
    private removeMemberHandler = (contact: IUser) => {
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
                this.list.recomputeRowHeights();
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
    private getHeight = (param: Index): number => {
        const contact = this.state.contacts[param.index];
        if (contact.category) {
            return 40;
        } else {
            return 64;
        }
    }

    /* Context menu open handler */
    private contextMenuOpenHandler = (index: number, e: any) => {
        const {contacts} = this.state;
        if (!contacts || index === -1) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            moreAnchorEl: e.currentTarget,
            moreIndex: index,
        });
    }

    /* Context menu close handler */
    private moreCloseHandler = () => {
        this.setState({
            moreAnchorEl: null,
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
            title: 'Remove',
        }];
        return menuItems.map((item, index) => {
            let style = {};
            if (item.color) {
                style = {
                    color: item.color,
                };
            }
            return (<MenuItem onClick={this.contextMenuActionHandler.bind(this, item.cmd, contacts[moreIndex])}
                              key={index} className="context-item" style={style}>{item.title}</MenuItem>);
        });
    }

    /* Context Menu action handler */
    private contextMenuActionHandler = (cmd: string, contact: IUser, e: any) => {
        this.moreCloseHandler();
        if (this.props.onContextMenuAction) {
            e.preventDefault();
            e.stopPropagation();
            this.props.onContextMenuAction(cmd, contact);
        }
    }
}

export default ContactList;
