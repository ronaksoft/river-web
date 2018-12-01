/*
    Creation Time: 2018 - Nov - 28
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {List, AutoSizer} from 'react-virtualized';
import {IContact} from '../../repository/contact/interface';
import ContactRepo from '../../repository/contact';
import {debounce, findIndex, differenceBy, clone} from 'lodash';
import UserAvatar, {TextAvatar} from '../UserAvatar';
import ChipInput from 'material-ui-chip-input';
import Chip from '@material-ui/core/Chip';
import UserName from '../UserName';
import {NotInterestedRounded} from '@material-ui/icons';

import './style.css';

interface IProps {
    contacts?: IContact[];
    hiddenContacts?: IContact[];
    onChange?: (contacts: IContact[]) => void;
}

interface IState {
    contacts: IContact[];
    hiddenContacts: IContact[];
    page: string;
    selectedContacts: IContact[];
    scrollIndex: number;
    title: string;
}

class ContactList extends React.Component<IProps, IState> {
    private contactsRes: IContact[] = [];
    // @ts-ignore
    private list: any;
    private contactRepo: ContactRepo;
    private searchDebounce: any;
    private defaultContact: IContact[];

    constructor(props: IProps) {
        super(props);

        this.state = {
            contacts: [],
            hiddenContacts: props.hiddenContacts || [],
            page: '1',
            scrollIndex: -1,
            selectedContacts: props.contacts || [],
            title: '',
        };

        this.contactRepo = ContactRepo.getInstance();
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
            if (this.state.selectedContacts.length === 0) {
                this.getDefault();
            }
        });
    }

    public render() {
        const {contacts, scrollIndex, selectedContacts} = this.state;
        return (
            <div className="contact-list">
                <div className="contact-input-container">
                    <ChipInput
                        label="Search contacts"
                        value={selectedContacts}
                        chipRenderer={this.chipRenderer}
                        fullWidth={true}
                        onUpdateInput={this.searchChangeHandler}
                        onDelete={this.removeMemberHandler}
                        // @ts-ignore
                        classes={{}}
                    />
                </div>
                <div className="contact-list-container">
                    <AutoSizer>
                        {({width, height}: any) => (
                            <List
                                ref={this.refHandler}
                                rowHeight={64}
                                rowRenderer={this.rowRender}
                                rowCount={contacts.length}
                                overscanRowCount={0}
                                scrollToIndex={scrollIndex}
                                width={width}
                                height={height}
                                className="contact-container"
                                noRowsRenderer={this.noRowsRenderer}
                            />
                        )}
                    </AutoSizer>
                </div>
            </div>
        );
    }

    /* Chip renderer for select input */
    private chipRenderer = ({value, text}: any, key: any): React.ReactNode => {
        return (<Chip key={key} avatar={<UserAvatar id={value.id}/>} tabIndex={-1} label={<UserName id={value.id}/>}
                      onDelete={this.removeMemberHandler.bind(this, value)} className="chip"/>);
    }

    /* Gets list element */
    private refHandler = (value: any) => {
        this.list = value;
    }

    /* Row renderer for list */
    private rowRender = ({index, key, parent, style}: any): any => {
        const contact = this.state.contacts[index];
        return (
            <div style={style} key={index} className="contact-item" onClick={this.addMemberHandler.bind(this, contact)}>
                <span className="avatar">
                    {contact.avatar ? <img src={contact.avatar}/> : TextAvatar(contact.firstname, contact.lastname)}
                </span>
                <span className="name">{`${contact.firstname} ${contact.lastname}`}</span>
                <span className="phone">{contact.phone ? contact.phone : 'no phone'}</span>
            </div>
        );
    }

    private noRowsRenderer = () => {
        return (
            <div className="no-result">
                <NotInterestedRounded/>
                no result!
            </div>
        );
    }

    /* Get all contacts */
    private getDefault() {
        this.contactRepo.getAll().then((res) => {
            this.defaultContact = res;
            this.contactsRes = clone(res);
            this.setState({
                contacts: this.getTrimmedList([]),
            }, () => {
                this.list.recomputeRowHeights();
                this.list.forceUpdateGrid();
            });
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
                contacts: this.getTrimmedList(this.state.selectedContacts),
            });
        }
    }

    /* For debouncing the query in order to have best performance */
    private search = (text: string) => {
        this.contactRepo.getManyCache({keyword: text, limit: 12}).then((res) => {
            this.contactsRes = clone(res || []);
            this.setState({
                contacts: this.getTrimmedList(this.state.selectedContacts),
            }, () => {
                this.list.recomputeRowHeights();
                this.list.forceUpdateGrid();
            });
        });
    }

    /* Add member to selectedContacts */
    private addMemberHandler = (contact: IContact) => {
        const {selectedContacts} = this.state;
        if (findIndex(selectedContacts, {id: contact.id || ''}) === -1) {
            selectedContacts.push(contact);
            this.setState({
                contacts: this.getTrimmedList(selectedContacts),
                selectedContacts,
            }, () => {
                this.dispatchContactChange();
            });
        }
    }

    /* Remove member from selectedContacts */
    private removeMemberHandler = (contact: IContact) => {
        const {selectedContacts} = this.state;
        if (!selectedContacts || !contact) {
            return;
        }
        const index = findIndex(selectedContacts, {id: contact.id || ''});
        if (index > -1) {
            selectedContacts.splice(index, 1);
            this.setState({
                contacts: this.getTrimmedList(selectedContacts),
                selectedContacts,
            }, () => {
                this.dispatchContactChange();
            });
        }
    }

    /* Removes the selected users from the list */
    private getTrimmedList(selectedContacts: IContact[]) {
        return differenceBy(this.contactsRes, [...selectedContacts, ...this.state.hiddenContacts], 'id');
    }

    /* Dispatch any changes on edit */
    private dispatchContactChange() {
        const {selectedContacts} = this.state;
        if (this.props.onChange) {
            this.props.onChange(clone(selectedContacts));
        }
    }
}

export default ContactList;
