/*
    Creation Time: 2018 - Oct - 21
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {List, AutoSizer, Index} from 'react-virtualized';
import {IContact} from '../../repository/contact/interface';
import ContactRepo from '../../repository/contact';
import {debounce} from 'lodash';
import {Link} from 'react-router-dom';
import {TextAvatar} from '../UserAvatar';
import TextField from '@material-ui/core/TextField/TextField';
import {CheckRounded, PersonAddRounded, PersonRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Dialog from '@material-ui/core/Dialog/Dialog';
import SDK from '../../services/sdk';
import {PhoneContact} from '../../services/sdk/messages/core.types_pb';
import UniqueId from '../../services/uniqueId';

import './style.css';
import {categorizeContact} from '../ContactList';

interface IProps {
    id?: number;
}

interface IState {
    contacts: IContact[];
    firstname: string;
    lastname: string;
    newContactDialogOpen: boolean;
    phone: string;
    scrollIndex: number;
    selectedId: string;
}

class ContactMenu extends React.Component<IProps, IState> {
    // @ts-ignore
    private list: any;
    private contactRepo: ContactRepo;
    private searchDebounce: any;
    private defaultContact: IContact[];
    private sdk: SDK;

    constructor(props: IProps) {
        super(props);

        this.state = {
            contacts: [],
            firstname: '',
            lastname: '',
            newContactDialogOpen: false,
            phone: '',
            scrollIndex: -1,
            selectedId: '-1',
        };

        this.contactRepo = ContactRepo.getInstance();
        this.searchDebounce = debounce(this.search, 512);
        this.sdk = SDK.getInstance();
    }

    public componentDidMount() {
        this.getContacts();
    }

    public render() {
        const {firstname, lastname, phone, contacts, newContactDialogOpen, scrollIndex} = this.state;
        return (
            <div className="contacts">
                <div className="menu-header">
                    <label>Contacts</label>
                    <span className="actions">
                        <Tooltip
                            title="New Contact"
                            placement="bottom"
                        >
                            <IconButton
                                aria-label="New Contact"
                                aria-haspopup="true"
                                onClick={this.newContactOpenHandler}
                            >
                                <PersonAddRounded/>
                            </IconButton>
                        </Tooltip>
                    </span>
                </div>
                <div className="search-container">
                    <TextField
                        label="Search..."
                        fullWidth={true}
                        inputProps={{
                            maxLength: 32,
                        }}
                        onChange={this.searchChangeHandler}
                    />
                </div>
                <div className="contact-box">
                    <AutoSizer>
                        {({width, height}: any) => (
                            <List
                                ref={this.refHandler}
                                rowHeight={this.getHeight}
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
                <Dialog
                    open={newContactDialogOpen}
                    onClose={this.newContactCloseHandler}
                    aria-labelledby="form-dialog-title"
                    maxWidth="xs"
                    className="add-contact-dialog"
                >
                    <DialogTitle id="form-dialog-title">New Contact</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus={true}
                            fullWidth={true}
                            label="First Name"
                            margin="dense"
                            onChange={this.firstnameHandleChange}
                            value={firstname}
                        />
                        <TextField
                            fullWidth={true}
                            label="Last Name"
                            margin="dense"
                            onChange={this.lastnameHandleChange}
                            value={lastname}
                        />
                        <TextField
                            fullWidth={true}
                            label="Phone"
                            margin="dense"
                            onChange={this.phoneHandleChange}
                            value={phone}
                        />
                        {Boolean(firstname.length > 0 && lastname.length > 0 && phone.length > 5) && <div className="actions-bar">
                            <div className="add-action" onClick={this.createContactHandler}>
                                <CheckRounded/>
                            </div>
                        </div>}
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    private refHandler = (value: any) => {
        this.list = value;
    }

    private noRowsRenderer = () => {
        return (
            <div className="no-result">
                <PersonRounded/>
                add a contact : )
            </div>);
    }

    private rowRender = ({index, key, parent, style}: any): any => {
        const contact = this.state.contacts[index];
        if (contact.category) {
            return (<div style={style} key={index} className="category-item">{contact.category}</div>);
        } else {
            return (
                <div style={style} key={index} className="contact-item">
                    <Link to={`/conversation/${contact.id}`}>
                    <span className="avatar">
                        {contact.avatar ? <img src={contact.avatar}/> : TextAvatar(contact.firstname, contact.lastname)}
                    </span>
                        <span className="name">{`${contact.firstname} ${contact.lastname}`}</span>
                        <span className="phone">{contact.phone ? contact.phone : 'no phone'}</span>
                    </Link>
                </div>
            );
        }
    }

    private searchChangeHandler = (e: any) => {
        const text = e.currentTarget.value;
        if (text.length > 0) {
            this.searchDebounce(text);
        } else {
            this.searchDebounce.cancel();
            this.setState({
                contacts: categorizeContact(this.defaultContact),
            });
        }
    }

    private search = (text: string) => {
        this.contactRepo.getManyCache({keyword: text, limit: 12}).then((res) => {
            this.setState({
                contacts: categorizeContact(res) || [],
            }, () => {
                this.list.recomputeRowHeights();
                this.list.forceUpdateGrid();
            });
        });
    }

    private getContacts() {
        this.contactRepo.getAll().then((res) => {
            this.defaultContact = res;
            this.setState({
                contacts: categorizeContact(res),
            }, () => {
                this.list.recomputeRowHeights();
                this.list.forceUpdateGrid();
            });
        });
    }

    private newContactOpenHandler = () => {
        this.setState({
            newContactDialogOpen: true,
        });
    }

    private newContactCloseHandler = () => {
        this.setState({
            newContactDialogOpen: false,
        });
    }

    private firstnameHandleChange = (e: any) => {
        this.setState({
            firstname: e.currentTarget.value,
        });
    }

    private lastnameHandleChange = (e: any) => {
        this.setState({
            lastname: e.currentTarget.value,
        });
    }

    private phoneHandleChange = (e: any) => {
        this.setState({
            phone: e.currentTarget.value,
        });
    }

    private createContactHandler = () => {
        this.newContactCloseHandler();
        const {firstname, lastname, phone} = this.state;
        const contacts: PhoneContact.AsObject[] = [];
        contacts.push({
            clientid: String(UniqueId.getRandomId()),
            firstname,
            lastname,
            phone,
        });
        this.sdk.contactImport(true, contacts).then((data) => {
            data.usersList.forEach((user) => {
                this.contactRepo.importBulk([user]).then(() => {
                    this.getContacts();
                });
            });
            this.setState({
                firstname: '',
                lastname: '',
                phone: '',
            });
        }).catch(() => {
            this.setState({
                firstname: '',
                lastname: '',
                phone: '',
            });
        });
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
}

export default ContactMenu;
