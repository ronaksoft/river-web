/*
    Creation Time: 2018 - Nov - 28
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {IContact} from '../../repository/contact/interface';
import {CloseRounded, CheckRounded, EditRounded, AddRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import {InputPeer, PhoneContact} from '../../services/sdk/messages/core.types_pb';
import SDK from '../../services/sdk';
import UserAvatar from '../UserAvatar';
import ContactRepo from '../../repository/contact';
import TextField from '@material-ui/core/TextField/TextField';
import UserRepo from '../../repository/user';

import './style.css';
import UniqueId from '../../services/uniqueId';

// Todo: add member, kick member, promote member and etc.
interface IProps {
    onClose: () => void;
    peer: InputPeer | null;
}

interface IState {
    edit: boolean;
    firstname: string;
    isInContact: boolean;
    lastname: string;
    page: string;
    phone: string;
    peer: InputPeer | null;
    user: IContact | null;
}

class UserInfoMenu extends React.Component<IProps, IState> {
    private contactRepo: ContactRepo;
    private userRepo: UserRepo;
    // @ts-ignore
    private sdk: SDK;

    constructor(props: IProps) {
        super(props);

        this.state = {
            edit: false,
            firstname: '',
            isInContact: false,
            lastname: '',
            page: '1',
            peer: props.peer,
            phone: '',
            user: null,
        };

        // Contact Repository singleton
        this.contactRepo = ContactRepo.getInstance();
        // User Repository singleton
        this.userRepo = UserRepo.getInstance();
        // SDK singleton
        this.sdk = SDK.getInstance();
    }

    public componentDidMount() {
        this.getUser();
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.peer === newProps.peer) {
            return;
        }
        this.setState({
            peer: newProps.peer,
        }, () => {
            this.getUser();
        });
    }

    public render() {
        const {user, page, edit, firstname, lastname, phone, isInContact} = this.state;
        return (
            <div className="user-info-menu">
                <div className="menu-header">
                    <IconButton
                        aria-label="Close"
                        aria-haspopup="true"
                        onClick={this.props.onClose}
                    >
                        <CloseRounded/>
                    </IconButton>
                    <label>User Info</label>
                </div>
                <div className={'page-container page-' + page}>
                    <div className="page page-1">
                        {user && <div className="info kk-card">
                            <div className="avatar">
                                <UserAvatar id={user.id || ''}/>
                            </div>
                            <div className="line">
                                {!edit && <div className="form-control">
                                    <div className="inner">{user.firstname}</div>
                                    {isInContact && <div className="action">
                                        <IconButton
                                            aria-label="Edit title"
                                            onClick={this.onEditHandler}
                                        >
                                            <EditRounded/>
                                        </IconButton>
                                    </div>}
                                </div>}
                                {edit &&
                                <TextField
                                    label="First Name"
                                    fullWidth={true}
                                    inputProps={{
                                        maxLength: 32,
                                    }}
                                    value={firstname}
                                    className="input-edit"
                                    onChange={this.onFirstnameChangeHandler}
                                />}
                            </div>
                            <div className="line">
                                {!edit && <div className="form-control">
                                    <div className="inner">{user.lastname}</div>
                                    {isInContact && <div className="action">
                                        <IconButton
                                            aria-label="Edit title"
                                            onClick={this.onEditHandler}
                                        >
                                            <EditRounded/>
                                        </IconButton>
                                    </div>}
                                </div>}
                                {edit &&
                                <TextField
                                    label="Last Name"
                                    fullWidth={true}
                                    inputProps={{
                                        maxLength: 32,
                                    }}
                                    value={lastname}
                                    className="input-edit"
                                    onChange={this.onLastnameChangeHandler}
                                />}
                                {Boolean(edit && !isInContact) &&
                                <TextField
                                    label="Phone"
                                    fullWidth={true}
                                    inputProps={{
                                        maxLength: 32,
                                    }}
                                    value={phone}
                                    className="input-edit"
                                    onChange={this.onPhoneChangeHandler}
                                />}
                            </div>
                            {Boolean(edit && user && ((user.firstname !== firstname || user.lastname !== lastname) || !isInContact)) &&
                            <div className="actions-bar">
                                <div className="add-action" onClick={this.confirmChangesHandler}>
                                    <CheckRounded/>
                                </div>
                            </div>}
                            {Boolean(!isInContact && !edit) &&
                            <div className="add-as-contact" onClick={this.addAsContactHandler}>
                                <AddRounded/> Add as contact
                            </div>}
                        </div>}
                    </div>
                </div>
            </div>
        );
    }

    /* Gets the user from repository */
    private getUser() {
        const {peer} = this.state;
        if (!peer) {
            return;
        }

        this.contactRepo.get(peer.getId() || '').then((res) => {
            this.setState({
                firstname: res.firstname || '',
                isInContact: true,
                lastname: res.lastname || '',
                user: res,
            });
        }).catch(() => {
            this.userRepo.get(peer.getId() || '').then((res) => {
                this.setState({
                    firstname: res.firstname || '',
                    isInContact: false,
                    lastname: res.lastname || '',
                    user: res,
                });
            });
        });
    }

    private onEditHandler = () => {
        this.setState({
            edit: true,
        });
    }

    private onFirstnameChangeHandler = (e: any) => {
        this.setState({
            firstname: e.currentTarget.value,
        });
    }

    private onLastnameChangeHandler = (e: any) => {
        this.setState({
            lastname: e.currentTarget.value,
        });
    }

    private onPhoneChangeHandler = (e: any) => {
        this.setState({
            phone: e.currentTarget.value,
        });
    }

    private confirmChangesHandler = () => {
        const {user, lastname, firstname, phone, isInContact} = this.state;
        if (!user) {
            return;
        }
        const contacts: PhoneContact.AsObject[] = [];
        contacts.push({
            clientid: isInContact ? user.clientid : String(UniqueId.getRandomId()),
            firstname,
            lastname,
            phone: isInContact ? user.phone : phone,
        });
        this.sdk.contactImport(true, contacts).then((data) => {
            data.usersList.forEach((item) => {
                this.contactRepo.importBulk([item]);
            });
            user.lastname = lastname;
            user.firstname = firstname;
            this.setState({
                edit: false,
                isInContact: true,
                user,
            });
        }).catch((err) => {
            this.setState({
                edit: false,
                firstname: user.firstname || '',
                lastname: user.lastname || '',
            });
        });
    }

    private addAsContactHandler = () => {
        this.setState({
            edit: true,
        });
    }
}

export default UserInfoMenu;
