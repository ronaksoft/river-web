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
import {AddRounded, CheckRounded, EditRounded, SendRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import {InputPeer, PeerNotifySettings, PeerType, PhoneContact} from '../../services/sdk/messages/core.types_pb';
import SDK from '../../services/sdk';
import UserAvatar from '../UserAvatar';
import ContactRepo from '../../repository/contact';
import TextField from '@material-ui/core/TextField/TextField';
import UserRepo from '../../repository/user';
import UniqueId from '../../services/uniqueId';
import Checkbox from '@material-ui/core/Checkbox/Checkbox';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Dialog from '@material-ui/core/Dialog/Dialog';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button/Button';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import {Link} from 'react-router-dom';

import './style.css';
import {isMuted} from '../UserInfoMenu';

interface IProps {
    onClose?: () => void;
}

interface IState {
    edit: boolean;
    firstname: string;
    isInContact: boolean;
    lastname: string;
    notifySetting: PeerNotifySettings.AsObject | null;
    notifySettingDialogOpen: boolean;
    notifyValue: string;
    peer: InputPeer | null;
    phone: string;
    sendMessageEnable: boolean;
    user: IContact | null;
    userDialogOpen: boolean;
}

class UserDialog extends React.Component<IProps, IState> {
    private contactRepo: ContactRepo;
    private userRepo: UserRepo;
    // private dialogRepo: DialogRepo;
    private sdk: SDK;

    constructor(props: IProps) {
        super(props);

        this.state = {
            edit: false,
            firstname: '',
            isInContact: false,
            lastname: '',
            notifySetting: null,
            notifySettingDialogOpen: false,
            notifyValue: '-1',
            peer: null,
            phone: '',
            sendMessageEnable: false,
            user: null,
            userDialogOpen: false,
        };

        // Contact Repository singleton
        this.contactRepo = ContactRepo.getInstance();
        // User Repository singleton
        this.userRepo = UserRepo.getInstance();
        // SDK singleton
        this.sdk = SDK.getInstance();
    }

    public componentDidMount() {
        window.addEventListener('User_Dialog_Open', this.openUserDialog, true);
    }

    public componentWillUnmount() {
        window.removeEventListener('User_Dialog_Open', this.openUserDialog, true);
    }

    public openDialog(peer: InputPeer) {
        if (this.state.peer === peer) {
            return;
        }
        this.setState({
            edit: false,
            firstname: '',
            isInContact: false,
            lastname: '',
            notifySettingDialogOpen: false,
            notifyValue: '-1',
            peer,
            phone: '',
            sendMessageEnable: false,
            user: null,
            userDialogOpen: true,
        }, () => {
            this.getUser();
        });
    }

    public render() {
        const {user, edit, firstname, lastname, phone, isInContact, notifySetting, notifySettingDialogOpen, notifyValue, userDialogOpen, sendMessageEnable} = this.state;
        // if (!dialog) {
        //     return '';
        // }
        return (
            <Dialog
                open={userDialogOpen}
                onClose={this.userDialogCloseHandler}
                maxWidth="xs"
                className="user-dialog"
            >
                <div className="user-info-menu">
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
                    {notifySetting && <div className="kk-card notify-settings">
                        <div className="label">Mute</div>
                        <div className="value">
                            <Checkbox
                                className={'checkbox ' + (isMuted(notifySetting) ? 'checked' : '')}
                                color="primary" checked={isMuted(notifySetting)}
                                onChange={this.muteChangeHandler}/>
                        </div>
                    </div>}
                    {sendMessageEnable && <div className="kk-card">
                        <Link className="send-message" to={`/conversation/${user ? user.id : 'null'}`}
                              onClick={this.close}>
                            <SendRounded/> Send Message
                        </Link>
                    </div>}
                    <Dialog
                        open={notifySettingDialogOpen}
                        onClose={this.notifySettingDialogCloseHandler}
                        maxWidth="xs"
                        className="notify-setting-dialog"
                    >
                        <DialogTitle>Notify Settings</DialogTitle>
                        <DialogContent className="dialog-content">
                            <RadioGroup
                                name="notify-setting"
                                value={notifyValue}
                                onChange={this.notifyValueChangeHandler}
                            >
                                <FormControlLabel value="-1" control={<Radio color="primary"/>}
                                                  label="Enable"/>
                                <FormControlLabel value="-2" control={<Radio color="primary"/>}
                                                  label="Disable"/>
                                <FormControlLabel value="480" control={<Radio color="primary"/>}
                                                  label="Disable for 8 hours"/>
                                <FormControlLabel value="2880" control={<Radio color="primary"/>}
                                                  label="Disable for 2 days"/>
                                <FormControlLabel value="10080" control={<Radio color="primary"/>}
                                                  label="Disable for 1 week"/>
                            </RadioGroup>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.notifySettingDialogCloseHandler} color="secondary">
                                Disagree
                            </Button>
                            <Button onClick={this.applyNotifySettings} color="primary" autoFocus={true}>
                                Apply
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </Dialog>
        );
    }

    /* Gets the user from repository */
    private getUser() {
        const {peer} = this.state;
        if (!peer) {
            return;
        }

        this.contactRepo.get(peer.getId() || '', true).then((res) => {
            this.setState({
                firstname: res.firstname || '',
                isInContact: (res.temp !== true),
                lastname: res.lastname || '',
                sendMessageEnable: Boolean(res.accesshash && res.accesshash.length > 0),
                user: res,
            });
        }).catch(() => {
            this.userRepo.get(peer.getId() || '').then((res) => {
                this.setState({
                    firstname: res.firstname || '',
                    isInContact: false,
                    lastname: res.lastname || '',
                    sendMessageEnable: Boolean(res.accesshash && res.accesshash.length > 0),
                    user: res,
                });
            });
        });

        if ((peer.getAccesshash() || '').length > 0) {
            this.sdk.getNotifySettings(peer).then((res) => {
                this.setState({
                    notifySetting: res,
                });
            });
        }
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

    /* On mute value changed */
    private muteChangeHandler = (e: any) => {
        const {peer, notifySetting} = this.state;
        if (!peer || !notifySetting) {
            return;
        }
        if (e.currentTarget.checked) {
            const notifyValue = String(notifySetting.muteuntil);
            this.setState({
                notifySettingDialogOpen: true,
                notifyValue,
            });
        } else {
            this.saveNotifySettings(-1);
        }
    }

    /* Apply notify settings */
    private applyNotifySettings = () => {
        this.saveNotifySettings(parseInt(this.state.notifyValue, 10));
    }

    /* Save notify settings */
    private saveNotifySettings(mode: number) {
        const {peer, notifySetting} = this.state;
        if (!peer || !notifySetting) {
            return;
        }
        const settings = new PeerNotifySettings();
        if (mode < 0) {
            settings.setMuteuntil(mode);
        } else if (mode > 0) {
            mode += Math.floor(Date.now() / 1000);
        }
        settings.setFlags(0);
        settings.setSound('');
        settings.setMuteuntil(mode);
        this.sdk.setNotifySettings(peer, settings).then(() => {
            this.setState({
                notifySetting: settings.toObject(),
            });
            this.setState({
                notifySettingDialogOpen: false,
                notifyValue: String(settings.toObject().muteuntil),
            });
        }).catch(() => {
            this.setState({
                notifySettingDialogOpen: false,
                notifyValue: '-1',
            });
        });
    }

    /* Notify settings Radio group change value handler */
    private notifyValueChangeHandler = (e: any, val: string) => {
        this.setState({
            notifyValue: val,
        });
    }

    /* Close notify settings */
    private notifySettingDialogCloseHandler = () => {
        this.setState({
            notifySettingDialogOpen: false,
        });
    }

    /* User dialog close handler */
    private userDialogCloseHandler = () => {
        this.setState({
            userDialogOpen: false,
        });
    }

    /* Open user handler from global event */
    private openUserDialog = (data: any) => {
        const peerId = data.detail.id;
        const peer = new InputPeer();
        peer.setId(peerId);
        peer.setType(PeerType.PEERUSER);
        peer.setAccesshash('0');
        this.openDialog(peer);
    }

    /* Close dialog */
    private close = () => {
        this.setState({
            userDialogOpen: false,
        });
    }
}

export default UserDialog;
