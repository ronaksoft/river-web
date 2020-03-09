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
import {AddRounded, CheckRounded, CloseRounded, EditRounded, KeyboardBackspaceRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import {
    InputPeer,
    InputUser,
    PeerNotifySettings,
    PeerType,
    PhoneContact
} from '../../services/sdk/messages/chat.core.types_pb';
import SDK from '../../services/sdk';
import UserAvatar from '../UserAvatar';
import TextField from '@material-ui/core/TextField/TextField';
import UserRepo, {UserDBUpdated} from '../../repository/user';
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
import PeerMedia from '../PeerMedia';
import i18n from "../../services/i18n";
import {notifyOptions} from "../../pages/Chat";
import Broadcaster from "../../services/broadcaster";

import './style.scss';

interface IProps {
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open' | 'start_bot', messageId: number) => void;
    onClose: (e: any) => void;
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
    shareMediaEnabled: boolean;
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
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private callerId: number = UniqueId.getRandomId();

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
            shareMediaEnabled: false,
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
        // DocumentViewerService singleton
        this.documentViewerService = DocumentViewerService.getInstance();
        // Broadcaster singleton
        this.broadcaster = Broadcaster.getInstance();
    }

    public componentDidMount() {
        this.getUser();
        this.eventReferences.push(this.broadcaster.listen(UserDBUpdated, this.getUser));
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

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {
            user, page, peer, edit, firstname, lastname, phone, isInContact, dialog, notifySettingDialogOpen,
            notifyValue, shareMediaEnabled
        } = this.state;
        return (
            <div className="user-info-menu">
                <div className={'page-container page-' + page}>
                    <div className="page page-1">
                        <div className="menu-header">
                            <IconButton
                                aria-label="Close"
                                aria-haspopup="true"
                                onClick={this.props.onClose}
                            >
                                <CloseRounded/>
                            </IconButton>
                            <label>{i18n.t('chat.contact_info')}</label>
                        </div>
                        <Scrollbars
                            autoHide={true}
                        >
                            <div>
                                {user && <div className="info kk-card">
                                    <div className={'avatar' + (Boolean(user && user.photo) ? ' pointer-cursor' : '')}
                                         onClick={this.showAvatarHandler}>
                                        <UserAvatar id={user.id || ''} noDetail={true}/>
                                    </div>
                                    <div className="line">
                                        {!edit && <div className="form-control">
                                            <label>{i18n.t('general.first_name')}</label>
                                            <div className="inner">{user.firstname}</div>
                                            {isInContact && <div className="action">
                                                <IconButton
                                                    onClick={this.onEditHandler}
                                                >
                                                    <EditRounded/>
                                                </IconButton>
                                            </div>}
                                        </div>}
                                        {edit &&
                                        <TextField
                                            label={i18n.t('general.first_name')}
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
                                            <label>{i18n.t('general.last_name')}</label>
                                            <div className="inner">{user.lastname}</div>
                                            {isInContact && <div className="action">
                                                <IconButton
                                                    onClick={this.onEditHandler}
                                                >
                                                    <EditRounded/>
                                                </IconButton>
                                            </div>}
                                        </div>}
                                        {edit &&
                                        <TextField
                                            label={i18n.t('general.last_name')}
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
                                            label={i18n.t('general.phone')}
                                            fullWidth={true}
                                            inputProps={{
                                                maxLength: 32,
                                            }}
                                            value={phone}
                                            className="input-edit"
                                            onChange={this.onPhoneChangeHandler}
                                        />}
                                    </div>
                                    {Boolean(user && (user.username || '').length > 0) && <div className="line">
                                        <div className="form-control">
                                            <label>{i18n.t('general.username')}</label>
                                            <div className="inner">@{user.username}</div>
                                        </div>
                                    </div>}
                                    {isInContact && user && (user.phone || '').length > 0 && <div className="line">
                                        <div className="form-control">
                                            <label>{i18n.t('general.phone')}</label>
                                            <div className="inner">{user.phone}</div>
                                        </div>
                                    </div>}
                                    {Boolean(user && (user.bio || '').length > 0) && <div className="line">
                                        <div className="form-control">
                                            <label>{i18n.t('general.bio')}</label>
                                            <div className="inner">{user.bio}</div>
                                        </div>
                                    </div>}
                                    {Boolean(edit && user && ((user.firstname !== firstname || user.lastname !== lastname) || !isInContact)) &&
                                    <div className="actions-bar">
                                        <div className="add-action" onClick={this.confirmChangesHandler}>
                                            <CheckRounded/>
                                        </div>
                                    </div>}
                                    {Boolean(!isInContact && !edit) &&
                                    <div className="add-as-contact" onClick={this.addAsContactHandler}>
                                        <AddRounded/> {i18n.t('peer_info.add_as_contact')}
                                    </div>}
                                    {Boolean(!edit && user) && <Button key="block" color="secondary" fullWidth={true}
                                                                       onClick={this.blockUserHandler(user)}>
                                        {(user && user.blocked) ? i18n.t('general.unblock') : i18n.t('general.block')}</Button>}
                                    {Boolean(!edit && user && user.isbot && !user.is_bot_started) &&
                                    <Button color="secondary" fullWidth={true}
                                            onClick={this.startBotHandler}>{i18n.t('bot.start_bot')}</Button>}
                                </div>}
                                {dialog && <div className="kk-card notify-settings">
                                    <div className="label">{i18n.t('peer_info.mute')}</div>
                                    <div className="value">
                                        <Checkbox
                                            className={'checkbox ' + (isMuted(dialog.notifysettings) ? 'checked' : '')}
                                            color="primary" checked={isMuted(dialog.notifysettings)}
                                            onChange={this.muteChangeHandler}/>
                                    </div>
                                </div>}
                                {(dialog && peer && !shareMediaEnabled) &&
                                <PeerMedia className="kk-card" peer={peer} full={false}
                                           onMore={this.peerMediaMoreHandler} onAction={this.props.onAction}/>}
                            </div>
                        </Scrollbars>
                    </div>
                    <div className="page page-2">
                        <div className="menu-header">
                            <IconButton
                                aria-label="Close"
                                aria-haspopup="true"
                                onClick={this.peerMediaCloseHandler}
                            >
                                <KeyboardBackspaceRounded/>
                            </IconButton>
                            <label>{i18n.t('peer_info.shared_media')}</label>
                        </div>
                        {(dialog && peer && shareMediaEnabled) &&
                        <PeerMedia className="kk-card" peer={peer} full={true} onAction={this.props.onAction}/>}
                    </div>
                </div>
                <Dialog
                    open={notifySettingDialogOpen}
                    onClose={this.notifySettingDialogCloseHandler}
                    maxWidth="xs"
                    className="notify-setting-dialog"
                    classes={{
                        paper: 'notify-setting-dialog-paper'
                    }}
                >
                    <DialogTitle>{i18n.t('peer_info.notify_settings')}</DialogTitle>
                    <DialogContent className="dialog-content">
                        <RadioGroup
                            name="notify-setting"
                            value={notifyValue}
                            onChange={this.notifyValueChangeHandler}
                        >
                            {notifyOptions.map((item: any, key: number) => {
                                return (<FormControlLabel key={key} value={item.val} label={item.title}
                                                          control={<Radio color="primary"/>}/>);
                            })}
                        </RadioGroup>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.notifySettingDialogCloseHandler} color="secondary">
                            {i18n.t('general.cancel')}
                        </Button>
                        <Button onClick={this.applyNotifySettings} color="primary" autoFocus={true}>
                            {i18n.t('general.apply')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

    /* Gets the user from repository */
    private getUser = (data?: any) => {
        const {peer} = this.state;
        if (!peer) {
            return;
        }

        if (data && this.state.user && (data.callerId === this.callerId || data.ids.indexOf(this.state.user.id || '') === -1)) {
            return;
        }

        const fn = (user: IUser) => {
            this.setState({
                firstname: user.firstname || '',
                isInContact: (user.is_contact === 1),
                lastname: user.lastname || '',
                user,
            });
        };

        if (data) {
            this.userRepo.get(peer.getId() || '').then((res) => {
                fn(res);
            });
        } else {
            this.userRepo.getFull(peer.getId() || '', fn, this.callerId).then((res) => {
                fn(res);
            });
        }

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
        if ((user.username || '') !== '' && phone === '') {
            const inputUser = new InputUser();
            inputUser.setAccesshash(user.accesshash || '');
            inputUser.setUserid(user.id || '');
            this.sdk.contactAdd(inputUser, firstname, lastname, phone).then(() => {
                this.userRepo.importBulk(true, [user], false, this.callerId);
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
        } else {
            const contacts: PhoneContact.AsObject[] = [];
            contacts.push({
                clientid: isInContact ? user.clientid : String(UniqueId.getRandomId()),
                firstname,
                lastname,
                phone: isInContact ? user.phone : phone,
            });
            this.sdk.contactImport(true, contacts).then((data) => {
                const items: any[] = [];
                data.usersList.forEach((item) => {
                    items.push(item);
                });
                this.userRepo.importBulk(true, items, false, this.callerId);
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
            settings.setMuteuntil(mode);
        }
        settings.setFlags(0);
        settings.setSound('');
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
        let peer: InputPeer | undefined;
        if (user.accesshash) {
            peer = new InputPeer();
            peer.setAccesshash(user.accesshash);
            peer.setId(user.id || '');
            peer.setType(PeerType.PEERUSER);
        }
        const doc: IDocument = {
            items: [{
                caption: '',
                fileLocation: user.photo.photobig,
                thumbFileLocation: user.photo.photosmall,
            }],
            peer,
            type: 'avatar',
        };
        this.documentViewerService.loadDocument(doc);
    }

    /* Show more media handler */
    private peerMediaMoreHandler = () => {
        this.setState({
            page: '2',
            shareMediaEnabled: true,
        });
    }

    /* Close media handler */
    private peerMediaCloseHandler = () => {
        this.setState({
            page: '1',
            shareMediaEnabled: false,
        });
    }

    /* Start bot handler */
    private startBotHandler = () => {
        const {user} = this.state;
        if (!user || !this.props.onAction) {
            return;
        }
        this.props.onAction('start_bot', 0);
    }

    /* Block user handler */
    private blockUserHandler = (user: IUser) => () => {
        if (!user) {
            return;
        }
        const inputUser = new InputUser();
        inputUser.setUserid(user.id || '');
        inputUser.setAccesshash(user.accesshash || '');
        if (user.blocked) {
            this.sdk.accountUnblock(inputUser).then(() => {
                this.userRepo.importBulk(false, [{
                    blocked: false,
                    id: user.id || '',
                }], false, this.callerId);
                user.blocked = false;
                this.setState({
                    user,
                });
            });
        } else {
            this.sdk.accountBlock(inputUser).then(() => {
                this.userRepo.importBulk(false, [{
                    blocked: true,
                    id: user.id || '',
                }], false, this.callerId);
                user.blocked = true;
                this.setState({
                    user,
                });
            });
        }
    }
}

export default UserInfoMenu;
