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
import {CheckRounded, KeyboardBackspaceRounded, PersonAddRounded, PersonRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import APIManager from '../../services/sdk';
import {PhoneContact} from '../../services/sdk/messages/core.types_pb';
import UniqueId from '../../services/uniqueId';
import ContactList from '../ContactList';
import {IUser} from '../../repository/user/interface';
import Broadcaster from '../../services/broadcaster';
import SettingsModal from '../SettingsModal';
import i18n from '../../services/i18n';
import {extractPhoneNumber} from "../../services/utilities/localize";

import './style.scss';

interface IProps {
    id?: number;
    onClose?: () => void;
    onError?: (text: string) => void;
    teamId: string;
}

interface IState {
    firstName: string;
    lastName: string;
    newContactDialogOpen: boolean;
    phone: string;
    scrollIndex: number;
    selectedId: string;
}

class ContactMenus extends React.Component<IProps, IState> {
    private contactListRef: ContactList | undefined;
    private userRepo: UserRepo;
    private apiManager: APIManager;
    private broadcaster: Broadcaster;

    constructor(props: IProps) {
        super(props);

        this.state = {
            firstName: '',
            lastName: '',
            newContactDialogOpen: false,
            phone: '',
            scrollIndex: -1,
            selectedId: '-1',
        };

        this.userRepo = UserRepo.getInstance();
        this.apiManager = APIManager.getInstance();
        this.broadcaster = Broadcaster.getInstance();
    }

    public scrollTop() {
        if (this.contactListRef) {
            this.contactListRef.scrollTop();
        }
    }

    public reload(empty?: boolean) {
        if (this.contactListRef) {
            this.contactListRef.reload(empty);
        }
    }

    public render() {
        const {firstName, lastName, phone, newContactDialogOpen} = this.state;
        return (
            <div className="contacts">
                <div className="menu-header">
                    <IconButton onClick={this.props.onClose}>
                        <KeyboardBackspaceRounded/>
                    </IconButton>
                    <label>{i18n.t(this.props.teamId === '0' ? 'general.contacts' : 'general.members')}</label>
                    {this.props.teamId === '0' && <Tooltip
                        title={i18n.t('contact.new_contact')}
                        placement="bottom"
                    >
                        <IconButton onClick={this.newContactOpenHandler}>
                            <PersonAddRounded/>
                        </IconButton>
                    </Tooltip>}
                </div>
                <div className="contact-box">
                    <ContactList ref={this.contactListRefHandler} className="contacts-menu"
                                 teamId={this.props.teamId} mode="link"
                                 noRowsRenderer={this.noRowsRenderer} disableCheckSelected={true}
                                 onContextMenuAction={this.contextMenuActionHandler} globalSearch={true}
                                 showOfficialBadge={true}/>
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
                            onChange={this.firstNameHandleChange}
                            value={firstName}
                            onKeyDown={this.confirmKeyDown}
                            error={firstName.length <= 0}
                        />
                        <TextField
                            fullWidth={true}
                            label={i18n.t('general.last_name')}
                            margin="dense"
                            onChange={this.lastNameHandleChange}
                            value={lastName}
                            onKeyDown={this.confirmKeyDown}
                        />
                        <TextField
                            fullWidth={true}
                            label={i18n.t('general.phone')}
                            inputProps={{
                                inputMode: "tel",
                                maxLength: 32,
                            }}
                            margin="dense"
                            onChange={this.phoneHandleChange}
                            value={phone}
                            type="tel"
                            onKeyDown={this.confirmKeyDown}
                        />
                        <div className="actions-bar">
                            <div
                                className={'add-action' + (((firstName.length > 0 || lastName.length > 0) && phone.length > 5) ? '' : ' disabled')}
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
        this.contactListRef = ref;
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

    private firstNameHandleChange = (e: any) => {
        this.setState({
            firstName: e.currentTarget.value,
        });
    }

    private lastNameHandleChange = (e: any) => {
        this.setState({
            lastName: e.currentTarget.value,
        });
    }

    private phoneHandleChange = (e: any) => {
        this.setState({
            phone: extractPhoneNumber(e.currentTarget.value),
        });
    }

    private createContactHandler = () => {
        let {firstName, lastName} = this.state;
        const {phone} = this.state;
        if (!(firstName.length > 0 && phone.length > 5)) {
            return;
        }
        this.newContactCloseHandler();
        const contacts: PhoneContact.AsObject[] = [];
        if (firstName.length === 0) {
            firstName = ' ';
        }
        if (lastName.length === 0) {
            lastName = ' ';
        }
        contacts.push({
            clientid: String(UniqueId.getRandomId()),
            firstname: firstName,
            lastname: lastName,
            phone,
        });
        this.apiManager.contactImport(true, contacts).then((data) => {
            this.userRepo.importBulk(true, data.contactusersList, undefined, undefined, this.props.teamId).then(() => {
                if (this.contactListRef) {
                    this.contactListRef.reload();
                }
                data.contactusersList.forEach((user) => {
                    this.broadcastEvent('User_Dialog_Open', {
                        id: user.id,
                    });
                });
            });
            if (data.contactusersList.length === 0 && this.props.onError) {
                this.props.onError(i18n.tf('contact.is_not_on_river_yet', firstName));
            } else {
                this.userRepo.computeHash(this.props.teamId);
            }
            this.setState({
                firstName: '',
                lastName: '',
                newContactDialogOpen: false,
                phone: '',
            });
        }).catch(() => {
            this.setState({
                firstName: '',
                lastName: '',
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
                this.apiManager.removeContact(contactIds).then(() => {
                    this.userRepo.removeContact(this.props.teamId, contact.id || '').finally(() => {
                        if (this.contactListRef) {
                            this.contactListRef.reload();
                        }
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
            const {firstName, lastName, phone} = this.state;
            if (firstName.length > 0 && lastName.length > 0 && phone.length > 5) {
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

export default ContactMenus;
