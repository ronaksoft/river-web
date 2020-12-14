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
import {
    AddRounded,
    CheckRounded,
    CloseRounded,
    EditRounded,
    KeyboardBackspaceRounded,
} from '@material-ui/icons';
import {
    InputPeer,
    InputUser,
    PeerNotifySettings,
    PeerType,
    PhoneContact
} from '../../services/sdk/messages/core.types_pb';
import APIManager from '../../services/sdk';
import UserAvatar from '../UserAvatar';
import UserRepo, {UserDBUpdated} from '../../repository/user';
import UniqueId from '../../services/uniqueId';
import DialogRepo from '../../repository/dialog';
import {IDialog} from '../../repository/dialog/interface';
import {Button, Checkbox, TextField, IconButton} from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import RiverTime from '../../services/utilities/river_time';
import DocumentViewerService, {IDocument} from '../../services/documentViewerService';
import PeerMedia from '../PeerMedia';
import i18n from "../../services/i18n";
import Broadcaster from "../../services/broadcaster";
import {OfficialIcon} from "../SVG/official";
import {extractPhoneNumber} from "../../services/utilities/localize";
import {ModalityService} from "kk-modality";
import {NotifyContent} from "../GroupInfoMenu";

import './style.scss';

interface IProps {
    onAction: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open' | 'start_bot', messageId: number) => void;
    onClose: (e: any) => void;
    peer: InputPeer | null;
    teamId: string;
    onError: (text: string) => void;
}

interface IState {
    dialog: IDialog | null;
    edit: boolean;
    firstname: string;
    isInContact: boolean;
    lastname: string;
    notifyValue: string;
    page: string;
    peer: InputPeer | null;
    phone: string;
    shareMediaEnabled: boolean;
    user: IUser | null;
}

export const isMuted = (notifySettings?: Partial<PeerNotifySettings.AsObject>) => {
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
    private apiManager: APIManager;
    private riverTime: RiverTime;
    private documentViewerService: DocumentViewerService;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private callerId: number = UniqueId.getRandomId();
    private me: boolean = false;
    private modalityService: ModalityService;

    constructor(props: IProps) {
        super(props);

        this.state = {
            dialog: null,
            edit: false,
            firstname: '',
            isInContact: false,
            lastname: '',
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
        this.apiManager = APIManager.getInstance();
        // DocumentViewerService singleton
        this.documentViewerService = DocumentViewerService.getInstance();
        // Broadcaster singleton
        this.broadcaster = Broadcaster.getInstance();

        this.modalityService = ModalityService.getInstance();

        this.me = Boolean(props.peer && props.peer.getId() === this.apiManager.getConnInfo().UserID);
    }

    public componentDidMount() {
        this.getUser();
        this.eventReferences.push(this.broadcaster.listen(UserDBUpdated, this.getUser));
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
        if (this.state.peer === newProps.peer) {
            return;
        }
        this.me = Boolean(newProps.peer && newProps.peer.getId() === this.apiManager.getConnInfo().UserID);
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
            user, page, peer, edit, firstname, lastname, phone, isInContact, dialog, shareMediaEnabled,
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
                                            <div className="inner">{user.firstname}{user && user.official &&
                                            <OfficialIcon/>}</div>
                                            {Boolean(!this.me && isInContact) && <div className="action">
                                                <IconButton
                                                    onClick={this.editHandler}
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
                                            onChange={this.firstnameChangeHandler}
                                        />}
                                    </div>
                                    {Boolean(edit || (user && (user.lastname || '').length > 0)) &&
                                    <div className="line">
                                        {!edit && Boolean(user && (user.lastname || '').length > 0) &&
                                        <div className="form-control">
                                            <label>{i18n.t('general.last_name')}</label>
                                            <div className="inner">{user.lastname}</div>
                                            {Boolean(!this.me && isInContact) && <div className="action">
                                                <IconButton
                                                    onClick={this.editHandler}
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
                                            onChange={this.lastnameChangeHandler}
                                        />}
                                    </div>}
                                    {Boolean(edit || (isInContact && user && (user.phone || '').length > 0)) &&
                                    <div className="line">
                                        {!edit && isInContact && user && (user.phone || '').length > 0 &&
                                        <div className="form-control">
                                            <label>{i18n.t('general.phone')}</label>
                                            <div className="inner">{user.phone}</div>
                                        </div>}
                                        {Boolean(edit && !isInContact) &&
                                        <TextField
                                            label={i18n.t('general.phone')}
                                            fullWidth={true}
                                            inputProps={{
                                                inputMode: "tel",
                                                maxLength: 32,
                                            }}
                                            value={phone}
                                            type="tel"
                                            className="input-edit"
                                            onChange={this.phoneChangeHandler}
                                        />}
                                    </div>}
                                    {Boolean(user && (user.username || '').length > 0) && <div className="line">
                                        <div className="form-control">
                                            <label>{i18n.t('general.username')}</label>
                                            <div className="inner">@{user.username}</div>
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
                                    {Boolean(this.props.teamId === '0' && !this.me && !isInContact && !edit && user && !user.isbot) &&
                                    <div className="add-as-contact" onClick={this.addAsContactHandler}>
                                        <AddRounded/> {i18n.t('peer_info.add_as_contact')}
                                    </div>}
                                    {Boolean(!this.me && !edit && user) &&
                                    <Button key="block" color="secondary" fullWidth={true}
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
                                <PeerMedia className="kk-card" peer={peer} full={false} teamId={this.props.teamId}
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
                        <PeerMedia className="kk-card" peer={peer} teamId={this.props.teamId} full={true}
                                   onAction={this.props.onAction}/>}
                    </div>
                </div>
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
                if (res) {
                    fn(res);
                }
            });
        } else {
            this.userRepo.getFull(peer.getId() || '', fn, this.callerId).then((res) => {
                fn(res);
            });
        }

        this.dialogRepo.get(this.props.teamId, peer.getId() || '', peer.getType() || 0).then((dialog) => {
            if (dialog) {
                this.setState({
                    dialog,
                });
            }
        });
    }

    private editHandler = () => {
        this.setState({
            edit: true,
        });
    }

    private firstnameChangeHandler = (e: any) => {
        this.setState({
            firstname: e.currentTarget.value,
        });
    }

    private lastnameChangeHandler = (e: any) => {
        this.setState({
            lastname: e.currentTarget.value,
        });
    }

    private phoneChangeHandler = (e: any) => {
        this.setState({
            phone: extractPhoneNumber(e.currentTarget.value),
        });
    }

    private confirmChangesHandler = () => {
        const {user, lastname, firstname, phone, isInContact} = this.state;
        if (!user) {
            return;
        }

        if (firstname.length === 0) {
            this.props.onError(i18n.t('settings.first_name_is_required'));
            return;
        }

        if ((user.username || '') !== '' && phone === '') {
            const inputUser = new InputUser();
            inputUser.setAccesshash(user.accesshash || '');
            inputUser.setUserid(user.id || '');
            this.apiManager.contactAdd(inputUser, firstname, lastname, phone).then(() => {
                this.userRepo.importBulk(true, [user], false, this.callerId, this.props.teamId);
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
            if ((user.phone || '') === '' && phone === '') {
                this.props.onError(i18n.t('settings.phone_is_required'));
                return;
            }

            const contacts: PhoneContact.AsObject[] = [];
            contacts.push({
                clientid: isInContact ? user.clientid : String(UniqueId.getRandomId()),
                firstname,
                lastname,
                phone: isInContact ? user.phone : phone,
            });
            this.apiManager.contactImport(true, contacts).then((data) => {
                const items: any[] = [];
                data.usersList.forEach((item) => {
                    const contact = data.contactusersList.find(o => o.id === item.id);
                    if (contact) {
                        item.firstname = contact.firstname;
                        item.lastname = contact.lastname;
                    }
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
                notifyValue,
            }, () => {
                this.modalityService.open({
                    cancelText: i18n.t('general.cancel'),
                    confirmText: i18n.t('general.apply'),
                    description: <NotifyContent value={this.state.notifyValue}
                                                onChange={this.notifyValueChangeHandler}/>,
                    title: i18n.t('peer_info.notify_settings'),
                }).then((modalRes) => {
                    if (modalRes === 'confirm') {
                        this.saveNotifySettings(parseInt(this.state.notifyValue, 10));
                    }
                });
            });
        } else {
            this.saveNotifySettings(-1);
        }
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
        this.apiManager.setNotifySettings(peer, settings).then(() => {
            dialog.notifysettings = settings.toObject();
            this.setState({
                dialog,
            });
            this.setState({
                notifyValue: String(dialog.notifysettings.muteuntil),
            });
        }).catch(() => {
            this.setState({
                notifyValue: '-1',
            });
        });
    }

    /* Notify settings Radio group change value handler */
    private notifyValueChangeHandler = (val: string) => {
        this.setState({
            notifyValue: val,
        });
    }

    /* Show avatar handler */
    private showAvatarHandler = () => {
        const {user} = this.state;
        if (!user || !user.photo) {
            return;
        }
        let inputPeer: InputPeer | undefined;
        if (user.accesshash) {
            inputPeer = new InputPeer();
            inputPeer.setAccesshash(user.accesshash);
            inputPeer.setId(user.id || '');
            inputPeer.setType(PeerType.PEERUSER);
        }
        const doc: IDocument = {
            inputPeer,
            items: [{
                caption: '',
                fileLocation: user.photo.photobig,
                thumbFileLocation: user.photo.photosmall,
            }],
            teamId: '0',
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
            this.apiManager.accountUnblock(inputUser).then(() => {
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
            this.apiManager.accountBlock(inputUser).then(() => {
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
