/*
    Creation Time: 2018 - Nov - 28
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {IUser} from '../../repository/user/interface';
import {CloseRounded, CheckRounded, EditRounded, AddRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import {InputPeer, PeerNotifySettings, PhoneContact} from '../../services/sdk/messages/chat.core.types_pb';
import SDK from '../../services/sdk';
import UserAvatar from '../UserAvatar';
import TextField from '@material-ui/core/TextField/TextField';
import UserRepo from '../../repository/user';
import UniqueId from '../../services/uniqueId';
import DialogRepo from '../../repository/dialog';
import {IDialog} from '../../repository/dialog/interface';
import Checkbox from '@material-ui/core/Checkbox/Checkbox';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Dialog from '@material-ui/core/Dialog/Dialog';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button/Button';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Scrollbars from 'react-custom-scrollbars';
import RiverTime from '../../services/utilities/river_time';
import DocumentViewerService, {IDocument} from '../../services/documentViewerService';

import './style.css';

interface IProps {
    onClose: () => void;
    peer: InputPeer | null;
}

interface IState {
    dialog: IDialog | null;
    edit: boolean;
    firstname: string;
    isInContact: boolean;
    lastname: string;
    notifySettingDialogOpen: boolean;
    notifyValue: string;
    page: string;
    peer: InputPeer | null;
    phone: string;
    user: IUser | null;
}

export const isMuted = (notifySettings?: PeerNotifySettings.AsObject) => {
    if (!notifySettings) {
        return false;
    } else if (notifySettings.muteuntil === -1) {
        return false;
    } else if (notifySettings.muteuntil === -2) {
        return true;
    } else if ((notifySettings.muteuntil || 0) > 0) {
        return (RiverTime.getInstance().now() <= (notifySettings.muteuntil || 0));
    } else {
        return false;
    }
};

class UserInfoMenu extends React.Component<IProps, IState> {
    private userRepo: UserRepo;
    private dialogRepo: DialogRepo;
    private sdk: SDK;
    private riverTime: RiverTime;
    private documentViewerService: DocumentViewerService;

    constructor(props: IProps) {
        super(props);

        this.state = {
            dialog: null,
            edit: false,
            firstname: '',
            isInContact: false,
            lastname: '',
            notifySettingDialogOpen: false,
            notifyValue: '-1',
            page: '1',
            peer: props.peer,
            phone: '',
            user: null,
        };
        // RiverTime singleton
        this.riverTime = RiverTime.getInstance();
        // User Repository singleton
        this.userRepo = UserRepo.getInstance();
        // Dialog Repository singleton
        this.dialogRepo = DialogRepo.getInstance();
        // SDK singleton
        this.sdk = SDK.getInstance();
        // DocumentViewerService singleton */
        this.documentViewerService = DocumentViewerService.getInstance();
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
        const {user, page, edit, firstname, lastname, phone, isInContact, dialog, notifySettingDialogOpen, notifyValue} = this.state;
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
                        <Scrollbars
                            autoHide={true}
                        >
                            <div>
                                {user && <div className="info kk-card">
                                    <div className="avatar" onClick={this.showAvatarHandler}>
                                        <UserAvatar id={user.id || ''} noDetail={true}/>
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
                                {dialog && <div className="kk-card notify-settings">
                                    <div className="label">Mute</div>
                                    <div className="value">
                                        <Checkbox
                                            className={'checkbox ' + (isMuted(dialog.notifysettings) ? 'checked' : '')}
                                            color="primary" checked={isMuted(dialog.notifysettings)}
                                            onChange={this.muteChangeHandler}/>
                                    </div>
                                </div>}
                            </div>
                        </Scrollbars>
                    </div>
                </div>
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
        );
    }

    /* Gets the user from repository */
    private getUser() {
        const {peer} = this.state;
        if (!peer) {
            return;
        }

        this.userRepo.get(peer.getId() || '').then((res) => {
            this.setState({
                firstname: res.firstname || '',
                isInContact: (res.is_contact === 1),
                lastname: res.lastname || '',
                user: res,
            });
        });

        this.dialogRepo.get(peer.getId() || '').then((dialog) => {
            this.setState({
                dialog,
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
                this.userRepo.importBulk(true, [item]);
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
        const {peer, dialog} = this.state;
        if (!peer || !dialog) {
            return;
        }
        if (e.currentTarget.checked) {
            let notifyValue = '-1';
            if (dialog && dialog.notifysettings) {
                notifyValue = String(dialog.notifysettings.muteuntil || -1);
            }
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
        const {peer, dialog} = this.state;
        if (!peer || !dialog) {
            return;
        }
        const settings = new PeerNotifySettings();
        if (mode < 0) {
            settings.setMuteuntil(mode);
        } else if (mode > 0) {
            mode += this.riverTime.now();
        }
        settings.setFlags(0);
        settings.setSound('');
        settings.setMuteuntil(mode);
        this.sdk.setNotifySettings(peer, settings).then(() => {
            dialog.notifysettings = settings.toObject();
            this.setState({
                dialog,
            });
            this.setState({
                notifySettingDialogOpen: false,
                notifyValue: String(dialog.notifysettings.muteuntil),
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

    /* Show avatar handler */
    private showAvatarHandler = () => {
        const {user} = this.state;
        if (!user || !user.photo) {
            return;
        }
        const doc: IDocument = {
            items: [{
                caption: '',
                fileLocation: user.photo.photobig,
                thumbFileLocation: user.photo.photosmall,
            }],
            type: 'avatar'
        };
        this.documentViewerService.loadDocument(doc);
    }
}

export default UserInfoMenu;
