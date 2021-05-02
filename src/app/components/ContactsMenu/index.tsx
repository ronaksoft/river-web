/*
    Creation Time: 2018 - Oct - 21
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import React from 'react';
import UserRepo from '../../repository/user';
import {KeyboardBackspaceRounded, PersonAddRounded, PersonRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import APIManager from '../../services/sdk';
import {PhoneContact} from '../../services/sdk/messages/core.types_pb';
import UniqueId from '../../services/uniqueId';
import ContactList from '../ContactList';
import {IUser} from '../../repository/user/interface';
import Broadcaster from '../../services/broadcaster';
import i18n from '../../services/i18n';
import ContactNew from "../ContactNew";

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

class ContactMenu extends React.Component<IProps, IState> {
    private contactListRef: ContactList | undefined;
    private userRepo: UserRepo;
    private apiManager: APIManager;
    private broadcaster: Broadcaster;
    private contactNewRef: ContactNew | undefined;

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

    public openNewContact(data: {phone?: string, firstname?: string, lastname?: string}) {
        if (this.contactNewRef) {
            this.contactNewRef.open(data);
        }
    }

    public render() {
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
                <ContactNew ref={this.contactNewRefHandler} onDone={this.contactNewDoneHandler}/>
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

    private contactNewRefHandler = (ref: any) => {
        this.contactNewRef = ref;
    }

    private newContactOpenHandler = () => {
        if (this.contactNewRef) {
            this.contactNewRef.open({});
        }
    }

    private contactNewDoneHandler = (phone: string, firstname: string, lastname: string) => {
        const contacts: PhoneContact.AsObject[] = [];
        if (firstname.length === 0) {
            firstname = ' ';
        }
        if (lastname.length === 0) {
            lastname = ' ';
        }
        contacts.push({
            clientid: String(UniqueId.getRandomId()),
            firstname,
            lastname,
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
                this.props.onError(i18n.tf('contact.is_not_on_river_yet', firstname));
            } else {
                this.userRepo.computeHash(this.props.teamId);
            }
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

    /* Broadcast global event */
    private broadcastEvent(name: string, data: any) {
        this.broadcaster.publish(name, data);
    }
}

export default ContactMenu;
