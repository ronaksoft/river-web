/*
    Creation Time: 2018 - Nov - 28
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import React from 'react';
import {IUser} from '../../repository/user/interface';
import {AddRounded, CheckRounded, EditRounded, SendRounded} from '@material-ui/icons';
import {
    InputPeer,
    InputUser,
    PeerNotifySettings,
    PeerType,
    PhoneContact
} from '../../services/sdk/messages/core.types_pb';
import APIManager, {currentUserId} from '../../services/sdk';
import UserAvatar from '../UserAvatar';
import UserRepo from '../../repository/user';
import UniqueId from '../../services/uniqueId';
import {Button, Dialog, Checkbox, TextField, IconButton} from '@material-ui/core';
import {Link} from 'react-router-dom';
import RiverTime from '../../services/utilities/river_time';
import DocumentViewerService, {IDocument} from '../../services/documentViewerService';
import {isMuted} from '../UserInfoMenu';
import Broadcaster from '../../services/broadcaster';
import i18n from '../../services/i18n';
import {OfficialIcon} from "../SVG/official";
import {extractPhoneNumber} from "../../services/utilities/localize";
import LastSeen from "../LastSeen";
import {ModalityService} from "kk-modality";
import {NotifyContent} from "../GroupInfoMenu";

import './style.scss';
import UserName from "../UserName";

interface IProps {
    onClose?: () => void;
    onAction: (cmd: string, user?: IUser) => void;
    teamId: string;
    onError: (text: string) => void;
}

interface IState {
    edit: boolean;
    firstname: string;
    isInContact: boolean;
    lastname: string;
    notifySetting: PeerNotifySettings.AsObject | null;
    notifyValue: string;
    peer: InputPeer | null;
    phone: string;
    sendMessageEnable: boolean;
    user: IUser | null;
    userDialogOpen: boolean;
}

class UserDialog extends React.Component<IProps, IState> {
    private userRepo: UserRepo;
    private apiManager: APIManager;
    private riverTime: RiverTime;
    private documentViewerService: DocumentViewerService;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private me: boolean = false;
    private modalityService: ModalityService;

    constructor(props: IProps) {
        super(props);

        this.state = {
            edit: false,
            firstname: '',
            isInContact: false,
            lastname: '',
            notifySetting: null,
            notifyValue: '-1',
            peer: null,
            phone: '',
            sendMessageEnable: false,
            user: null,
            userDialogOpen: false,
        };
        // RiverTime singleton
        this.riverTime = RiverTime.getInstance();
        // User Repository singleton
        this.userRepo = UserRepo.getInstance();
        // SDK singleton
        this.apiManager = APIManager.getInstance();

        this.documentViewerService = DocumentViewerService.getInstance();

        this.broadcaster = Broadcaster.getInstance();

        this.modalityService = ModalityService.getInstance();
    }

    public componentDidMount() {
        this.eventReferences.push(this.broadcaster.listen('User_Dialog_Open', this.openUserDialog));
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public openDialog(peer: InputPeer, text?: string) {
        if (this.state.peer === peer) {
            return;
        }
        this.me = Boolean(peer.getId() === currentUserId);
        this.setState({
            edit: false,
            firstname: '',
            isInContact: false,
            lastname: '',
            notifyValue: '-1',
            peer,
            phone: '',
            sendMessageEnable: false,
            user: null,
            userDialogOpen: true,
        }, () => {
            this.getUser(text);
        });
    }

    public render() {
        const {user, edit, firstname, lastname, phone, isInContact, notifySetting, userDialogOpen, sendMessageEnable} = this.state;
        const isOfficial = user && user.official;
        return (
            <Dialog
                open={userDialogOpen}
                onClose={this.userDialogCloseHandler}
                maxWidth="xs"
                className="user-dialog"
                classes={{
                    paper: 'user-dialog-paper'
                }}
            >
                <div className="user-info-menu">
                    {user && <div className="info kk-card">
                        <div className={'avatar' + (Boolean(user && user.photo) ? ' pointer-cursor' : '')}
                             onClick={this.showAvatarHandler}>
                            <UserAvatar id={user.id || '0'} noDetail={true}/>
                        </div>
                        <div className="line">
                            <LastSeen className="last-seen" id={user.id || '0'} teamId={this.props.teamId}
                                      withLastSeen={true}/>
                        </div>
                        <div className="line">
                            {!edit && <div className="form-control">
                                <label>{i18n.t('general.first_name')}</label>
                                <div className="inner">{user.firstname}{user && user.official &&
                                <OfficialIcon/>}</div>
                                {Boolean(!this.me && !isOfficial && isInContact) && <div className="action">
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
                                {Boolean(!this.me && !isOfficial && isInContact) && <div className="action">
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
                        {Boolean(edit || (isInContact && (user.phone || '').length > 0)) &&
                        <div className="line">
                            {Boolean(isInContact && !edit && (user.phone || '').length > 0) &&
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
                                className="input-edit"
                                type="tel"
                                onChange={this.phoneChangeHandler}
                            />}
                        </div>}
                        {Boolean(user.username && (user.username || '').length > 0) && <div className="line">
                            <div className="form-control">
                                <label>{i18n.t('general.username')}</label>
                                <div className="inner">@{user.username}</div>
                            </div>
                        </div>}
                        {Boolean(user.bio && (user.bio || '').length > 0) && <div className="line">
                            <div className="form-control">
                                <label>{i18n.t('general.bio')}</label>
                                <div className="inner">{user.bio}</div>
                            </div>
                        </div>}
                        {Boolean(this.props.teamId === '0' && !this.me && !isInContact && !edit && user && !user.isbot) &&
                        <div className="add-as-contact" onClick={this.addAsContactHandler}>
                            <AddRounded/> {i18n.t('peer_info.add_as_contact')}
                        </div>}
                        {Boolean(edit && user && ((user.firstname !== firstname || user.lastname !== lastname) || !isInContact)) &&
                        <div className="actions-bar">
                            <div className="add-action" onClick={this.confirmChangesHandler}>
                                <CheckRounded/>
                            </div>
                        </div>}
                        {Boolean(edit) && <div className="actions-bar cancel" onClick={this.cancelHandler}>
                            {i18n.t('general.cancel')}
                        </div>}
                        {Boolean(!this.me && !edit && user) && <Button key="block" color="secondary" fullWidth={true}
                                                                       onClick={this.blockUserHandler(user)}>
                            {(user && user.blocked) ? i18n.t('general.unblock') : i18n.t('general.block')}</Button>}
                        {Boolean(!edit && user && user.isbot && !user.is_bot_started) &&
                        <Button key="start" color="secondary" fullWidth={true}
                                onClick={this.startBotHandler}>{i18n.t('bot.start_bot')}</Button>}
                    </div>}
                    {notifySetting && <div className="kk-card notify-settings">
                        <div className="label">{i18n.t('peer_info.mute')}</div>
                        <div className="value">
                            <Checkbox
                                className={'checkbox ' + (isMuted(notifySetting) ? 'checked' : '')}
                                color="primary" checked={isMuted(notifySetting)}
                                onChange={this.muteChangeHandler}/>
                        </div>
                    </div>}
                    {sendMessageEnable && <div className="kk-card">
                        <Link className="send-message"
                              to={`/chat/${this.props.teamId}/${user ? `${user.id}_${PeerType.PEERUSER}` : 'null'}`}
                              onClick={this.close}>
                            <SendRounded/> {i18n.t('general.send_message')}
                        </Link>
                    </div>}
                </div>
            </Dialog>
        );
    }

    /* Gets the user from repository */
    private getUser(text?: string) {
        const {peer} = this.state;
        if (!peer) {
            return;
        }

        const fn = (user: IUser) => {
            this.setState({
                firstname: user.firstname || '',
                isInContact: Boolean(user.is_contact),
                lastname: user.lastname || '',
                phone: user.phone || '',
                sendMessageEnable: Boolean(user.accesshash && user.accesshash.length > 0),
                user,
            });
        };

        this.userRepo.getFull(peer.getId() || '', fn, undefined, true).then((res) => {
            fn(res);
        }).catch((err) => {
            if (err === 'not_found' && text && text.indexOf('@') === 0) {
                this.userRepo.contactSearch(text.substr(1)).then((userRes) => {
                    if (userRes.length === 1) {
                        const userPeer = new InputPeer();
                        userPeer.setId(userRes[0].id || '');
                        userPeer.setType(PeerType.PEERUSER);
                        userPeer.setAccesshash(userRes[0].accesshash || '');
                        this.setState({
                            peer: userPeer,
                        }, () => {
                            this.getUser(text);
                        });
                    }
                });
            }
        });

        if ((peer.getAccesshash() || '').length > 0) {
            this.apiManager.getNotifySettings(peer).then((res) => {
                this.setState({
                    notifySetting: res,
                });
            });
        }
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
                this.userRepo.importBulk(true, [user], false, undefined, this.props.teamId);
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
                this.userRepo.importBulk(true, items);
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
        const {peer, notifySetting} = this.state;
        if (!peer || !notifySetting) {
            return;
        }
        if (e.currentTarget.checked) {
            const notifyValue = String(notifySetting.muteuntil || -1);
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
        const {peer, notifySetting} = this.state;
        if (!peer || !notifySetting) {
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
            this.setState({
                notifySetting: settings.toObject(),
            });
            this.setState({
                notifyValue: String(settings.toObject().muteuntil),
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

    /* User dialog close handler */
    private userDialogCloseHandler = () => {
        this.setState({
            userDialogOpen: false,
        });
    }

    /* Open user handler from global event */
    private openUserDialog = (data: any) => {
        if (!data) {
            return;
        }
        const peerId = data.id;
        const peer = new InputPeer();
        peer.setId(peerId);
        peer.setType(PeerType.PEERUSER);
        peer.setAccesshash(data.accesshash || '');
        this.openDialog(peer, data.text);
    }

    /* Close dialog */
    private close = () => {
        this.setState({
            userDialogOpen: false,
        });
    }

    /* Cancel handler */
    private cancelHandler = () => {
        const {user} = this.state;
        if (!user) {
            return;
        }
        this.setState({
            edit: false,
            firstname: user.firstname || '',
            lastname: user.lastname || '',
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
            teamId: this.props.teamId,
            type: 'avatar',
        };
        this.documentViewerService.loadDocument(doc);
    }

    /* Start bot handler */
    private startBotHandler = () => {
        const {user} = this.state;
        if (!user) {
            return;
        }
        this.props.onAction('start_bot', user);
    }

    /* Block user handler */
    private blockUserHandler = (user: IUser) => () => {
        if (!user) {
            return;
        }
        const fn = () => {
            const inputUser = new InputUser();
            inputUser.setUserid(user.id || '');
            inputUser.setAccesshash(user.accesshash || '');
            if (user.blocked) {
                this.apiManager.accountUnblock(inputUser).then(() => {
                    this.userRepo.importBulk(false, [{
                        blocked: false,
                        id: user.id || '0',
                    }]);
                    user.blocked = false;
                    this.setState({
                        user,
                    });
                });
            } else {
                this.apiManager.accountBlock(inputUser).then(() => {
                    this.userRepo.importBulk(false, [{
                        blocked: true,
                        id: user.id || '0',
                    }]);
                    user.blocked = true;
                    this.setState({
                        user,
                    });
                });
            }
        };
        if (user.blocked) {
            fn();
        } else {
            this.modalityService.open({
                cancelText: i18n.t('general.cancel'),
                confirmText: i18n.t('general.block'),
                description: i18n.t('chat.block_desc'),
                title: <UserName id={user.id} noIcon={true} noDetail={true} format={i18n.t('chat.block_title')}/>
            }).then((modalRes) => {
                if (modalRes === 'confirm') {
                    fn();
                }
            });
        }
    }
}

export default UserDialog;
