/*
    Creation Time: 2018 - Oct - 21
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import UserRepo from '../../repository/user';
import TextField from '@material-ui/core/TextField/TextField';
import {CheckRounded, PersonAddRounded, PersonRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import SDK from '../../services/sdk';
import {PhoneContact} from '../../services/sdk/messages/chat.core.types_pb';
import UniqueId from '../../services/uniqueId';
import ContactList from '../ContactList';
import {IUser} from '../../repository/user/interface';
import Broadcaster from '../../services/broadcaster';
import SettingsModal from '../SettingsModal';
import i18n from '../../services/i18n';

import './style.css';

interface IProps {
    id?: number;
}

interface IState {
    firstname: string;
    lastname: string;
    newContactDialogOpen: boolean;
    phone: string;
    scrollIndex: number;
    selectedId: string;
}

class ContactMenu extends React.Component<IProps, IState> {
    private contactListComponent: ContactList;
    private userRepo: UserRepo;
    private sdk: SDK;
    private broadcaster: Broadcaster;

    constructor(props: IProps) {
        super(props);

        this.state = {
            firstname: '',
            lastname: '',
            newContactDialogOpen: false,
            phone: '',
            scrollIndex: -1,
            selectedId: '-1',
        };

        this.userRepo = UserRepo.getInstance();
        this.sdk = SDK.getInstance();

        this.broadcaster = Broadcaster.getInstance();
    }

    public componentDidMount() {
        // this.getContacts();
    }

    public render() {
        const {firstname, lastname, phone, newContactDialogOpen} = this.state;
        return (
            <div className="contacts">
                <div className="menu-header">
                    <label>{i18n.t('contact.contacts')}</label>
                    <span className="actions">
                        <Tooltip
                            title={i18n.t('contact.new_contact')}
                            placement="bottom"
                        >
                            <IconButton
                                onClick={this.newContactOpenHandler}
                            >
                                <PersonAddRounded/>
                            </IconButton>
                        </Tooltip>
                    </span>
                </div>
                <div className="contact-box">
                    <ContactList ref={this.contactListRefHandler} noRowsRenderer={this.noRowsRenderer} mode="link"
                                 onContextMenuAction={this.contextMenuActionHandler} disableCheckSelected={true}/>
                </div>
                <SettingsModal open={newContactDialogOpen} title={i18n.t('contact.new_contact')}
                               icon={<PersonAddRounded/>}
                               onClose={this.newContactCloseHandler}
                               noScrollbar={true}
                               height="280px"
                >
                    <div className="new-contact-dialog">
                        <TextField
                            autoFocus={true}
                            fullWidth={true}
                            label={i18n.t('general.first_name')}
                            margin="dense"
                            onChange={this.firstnameHandleChange}
                            value={firstname}
                            onKeyDown={this.confirmKeyDown}
                        />
                        <TextField
                            fullWidth={true}
                            label={i18n.t('general.last_name')}
                            margin="dense"
                            onChange={this.lastnameHandleChange}
                            value={lastname}
                            onKeyDown={this.confirmKeyDown}
                        />
                        <TextField
                            fullWidth={true}
                            label={i18n.t('general.phone')}
                            margin="dense"
                            onChange={this.phoneHandleChange}
                            value={phone}
                            onKeyDown={this.confirmKeyDown}
                        />
                        <div className="actions-bar">
                            <div
                                className={'add-action' + (((firstname.length > 0 || lastname.length > 0) && phone.length > 5) ? '' : ' disabled')}
                                onClick={this.createContactHandler}>
                                <CheckRounded/>
                            </div>
                        </div>
                    </div>
                </SettingsModal>
            </div>
        );
    }

    private contactListRefHandler = (ref: any) => {
        this.contactListComponent = ref;
    }

    private noRowsRenderer = () => {
        return (
            <div className="no-result">
                <PersonRounded/>
                {i18n.t('contact.placeholder')}
            </div>);
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
        const {firstname, lastname, phone} = this.state;
        if (!((firstname.length > 0 || lastname.length > 0) && phone.length > 5)) {
            return;
        }
        this.newContactCloseHandler();
        const contacts: PhoneContact.AsObject[] = [];
        contacts.push({
            clientid: String(UniqueId.getRandomId()),
            firstname,
            lastname,
            phone,
        });
        this.sdk.contactImport(true, contacts).then((data) => {
            data.usersList.forEach((user) => {
                this.userRepo.importBulk(true, [user]).then(() => {
                    this.contactListComponent.reload();
                    this.broadcastEvent('User_Dialog_Open', {
                        id: user.id,
                    });
                });
            });
            this.setState({
                firstname: '',
                lastname: '',
                newContactDialogOpen: false,
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

    /* Context Menu action handler */
    private contextMenuActionHandler = (cmd: string, contact: IUser) => {
        switch (cmd) {
            case 'remove':
                const contactIds: string[] = [];
                contactIds.push(contact.id || '');
                this.sdk.removeContact(contactIds).then(() => {
                    this.userRepo.removeContact(contact.id || '').finally(() => {
                        this.contactListComponent.reload();
                    });
                });
                break;
            default:
                return;
        }
    }

    /* Confirm key down */
    private confirmKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            const {firstname, lastname, phone} = this.state;
            if (firstname.length > 0 && lastname.length > 0 && phone.length > 5) {
                this.createContactHandler();
            }
            this.newContactCloseHandler();
        }
    }

    /* Broadcast global event */
    private broadcastEvent(name: string, data: any) {
        this.broadcaster.publish(name, data);
    }
}

export default ContactMenu;
