/*
    Creation Time: 2018 - Nov - 27
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import React from 'react';
import {useState} from 'react';
import {
    AddRounded,
    CheckRounded,
    CloseRounded,
    EditRounded,
    ExitToAppRounded,
    KeyboardBackspaceRounded,
    MoreVertRounded,
    PhotoCameraRounded,
    StarRateRounded,
    StarsRounded,
} from '@material-ui/icons';
import {
    GroupFlags, GroupParticipant,
    InputFile,
    InputPeer,
    InputUser,
    ParticipantType,
    PeerNotifySettings,
    PeerType,
} from '../../services/sdk/messages/core.types_pb';
import APIManager, {currentUserId} from '../../services/sdk';
import GroupAvatar from '../GroupAvatar';
import {IGroup} from '../../repository/group/interface';
import GroupRepo, {GroupDBUpdated} from '../../repository/group';
import TimeUtility from '../../services/utilities/time';
import {IParticipant, IUser} from '../../repository/user/interface';
import UserAvatar from '../UserAvatar';
import {findIndex, trimStart} from 'lodash';
import {isMuted} from '../UserInfoMenu';
import {IDialog} from '../../repository/dialog/interface';
import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    Menu,
    MenuItem,
    Radio,
    RadioGroup,
    Switch
} from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import RiverTime from '../../services/utilities/river_time';
import UniqueId from '../../services/uniqueId';
import FileManager, {IFileProgress} from '../../services/sdk/fileManager';
import ProgressBroadcaster from '../../services/progress';
import DocumentViewerService, {IDocument} from '../../services/documentViewerService';
import AvatarCropper from '../AvatarCropper';
import PeerMedia from '../PeerMedia';
import Broadcaster from '../../services/broadcaster';
import {notifyOptions} from '../../pages/Chat';
import i18n from '../../services/i18n';
import {C_AVATAR_SIZE} from "../SettingsMenu";
import {ModalityService} from "kk-modality";
import ContactPicker from "../ContactPicker";
import {C_ERR, C_ERR_ITEM} from "../../services/sdk/const";
import UserName from "../UserName";

import './style.scss';

interface IProps {
    peer: InputPeer | null;
    onAction: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open' | 'view_in_chat' | 'forward', messageIds: number) => void;
    onBulkAction: (cmd: 'forward', messageIds: number[]) => void;
    onClose?: (e: any) => void;
    onExitGroup?: () => void;
    onError?: (message: string) => void;
}

interface IState {
    avatarMenuAnchorEl: any;
    currentUser: IParticipant | null;
    dialog: IDialog | null;
    disable: boolean;
    forwardLimit: number;
    group: IGroup | null;
    moreAnchorEl: any;
    notifyValue: string;
    page: string;
    participants: IParticipant[];
    peer: InputPeer | null;
    shareMediaEnabled: boolean;
    title: string;
    titleEdit: boolean;
    uploadingPhoto: boolean;
}

/* hasAuthority checks user permission for group actions */
export const hasAuthority = (group: IGroup, checkAllAdmin: boolean) => {
    if (group.flagsList) {
        return group.flagsList.indexOf(GroupFlags.GROUPFLAGSADMIN) > -1 || (checkAllAdmin && group.flagsList.indexOf(GroupFlags.GROUPFLAGSADMINSENABLED) === -1);
    } else {
        return false;
    }
};

export const NotifyContent = ({value, onChange}: { value: string, onChange: (val: string) => void }) => {
    const [val, setVal] = useState<string>(value);
    const notifyValueChangeHandler = (e: any, v: string) => {
        setVal(v);
        onChange(v);
    };
    return <RadioGroup
        className="notify-content"
        name="notify-setting"
        value={val}
        onChange={notifyValueChangeHandler}
    >
        {notifyOptions.map((item, key) => {
            return (<FormControlLabel key={key} value={item.val} label={item.title}
                                      control={<Radio color="primary"/>}/>);
        })}
    </RadioGroup>;
};

class GroupInfoMenu extends React.Component<IProps, IState> {
    private teamId: string = '0';
    private groupRepo: GroupRepo;
    private apiManager: APIManager;
    private loading: boolean = false;
    private riverTime: RiverTime;
    private fileManager: FileManager;
    private progressBroadcaster: ProgressBroadcaster;
    private profileTempPhoto: string = '';
    private circleProgressRef: any = null;
    private fileId: string = '';
    private cropperRef: AvatarCropper | undefined;
    private documentViewerService: DocumentViewerService;
    private readonly callerId: number = 0;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private modalityService: ModalityService;
    private contactPickerRef: ContactPicker | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            avatarMenuAnchorEl: null,
            currentUser: null,
            dialog: null,
            disable: false,
            forwardLimit: 50,
            group: null,
            moreAnchorEl: null,
            notifyValue: '-1',
            page: '1',
            participants: [],
            peer: this.props.peer,
            shareMediaEnabled: false,
            title: '',
            titleEdit: false,
            uploadingPhoto: false,
        };
        // RiverTime singleton
        this.riverTime = RiverTime.getInstance();
        // Group Repository singleton
        this.groupRepo = GroupRepo.getInstance();
        // SDK singleton
        this.apiManager = APIManager.getInstance();

        this.fileManager = FileManager.getInstance();
        this.progressBroadcaster = ProgressBroadcaster.getInstance();

        this.documentViewerService = DocumentViewerService.getInstance();

        this.callerId = UniqueId.getRandomId();

        this.broadcaster = Broadcaster.getInstance();

        this.modalityService = ModalityService.getInstance();
    }

    public componentDidMount() {
        this.eventReferences.push(this.broadcaster.listen(GroupDBUpdated, this.getGroup));
        this.getGroup();
    }

    public setPeer(teamId: string, peer: InputPeer | null, dialog: IDialog | null) {
        const disable = dialog ? dialog.disable || false : false;
        if (this.state.peer === peer && this.teamId === teamId) {
            if (this.state.disable !== disable) {
                this.setState({
                    dialog,
                    disable,
                    titleEdit: false,
                });
            } else {
                this.setState({
                    dialog,
                    titleEdit: false,
                });
            }
            return;
        }
        this.teamId = teamId;
        this.setState({
            dialog,
            disable: dialog ? dialog.disable || false : false,
            peer,
            titleEdit: false,
        }, () => {
            this.getGroup();
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
            avatarMenuAnchorEl, group, page, peer, participants, title, titleEdit, moreAnchorEl,
            dialog, uploadingPhoto, shareMediaEnabled, disable,
        } = this.state;
        const isAdmin = group ? hasAuthority(group, true) : false;
        const hasAccess = disable ? false : group ? hasAuthority(group, true) : false;
        const allMemberAdmin = group && (group.flagsList || []).indexOf(GroupFlags.GROUPFLAGSADMINSENABLED) === -1;
        const isMember = group && (group.flagsList || []).indexOf(GroupFlags.GROUPFLAGSNONPARTICIPANT) === -1;
        return (
            <div className="group-info-menu">
                <AvatarCropper ref={this.cropperRefHandler} onImageReady={this.croppedImageReadyHandler}
                               width={C_AVATAR_SIZE}/>
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
                            <label>{i18n.t('chat.group_info')}</label>
                        </div>
                        <Scrollbars
                            autoHide={true}
                        >
                            <div>
                                {group && <div className="info kk-card">
                                    <div className={'avatar' + (Boolean(group && group.photo) ? ' pointer-cursor' : '')}
                                         onClick={this.avatarMenuAnchorOpenHandler}>
                                        {!uploadingPhoto &&
                                        <GroupAvatar id={group.id || ''} teamId={group.teamid || '0'}
                                                     forceReload={true}/>}
                                        {uploadingPhoto &&
                                        <img src={this.profileTempPhoto} className="avatar-image" alt="avatar"
                                             draggable={false}/>}
                                        {hasAccess &&
                                        <div className={'overlay ' + (uploadingPhoto ? 'show' : '')}>
                                            {!uploadingPhoto && <>
                                                <PhotoCameraRounded/>
                                                <div className="text">
                                                    {i18n.t('peer_info.CHANGE')}
                                                    <br/>
                                                    {i18n.t('peer_info.PROFILE')}
                                                    <br/>
                                                    {i18n.t('peer_info.PHOTO')}
                                                </div>
                                            </>}
                                            {uploadingPhoto &&
                                            <div className="progress-action">
                                                <div className="progress">
                                                    <svg viewBox="0 0 32 32">
                                                        <circle ref={this.progressRefHandler} r="14" cx="16" cy="16"/>
                                                    </svg>
                                                </div>
                                                <CloseRounded className="action" onClick={this.cancelFileHandler}/>
                                            </div>}
                                        </div>}
                                    </div>
                                    <div className="title">
                                        {!titleEdit && <div className="form-control">
                                            <div className="inner">{group.title}</div>
                                            {hasAccess && <div className="action">
                                                <IconButton
                                                    onClick={this.onTitleEditHandler}
                                                >
                                                    <EditRounded/>
                                                </IconButton>
                                            </div>}
                                        </div>}
                                        {titleEdit &&
                                        <FormControl fullWidth={true} className="title-edit">
                                            <InputLabel htmlFor="adornment-title">{i18n.t('general.title')}</InputLabel>
                                            <Input
                                                id="adornment-title"
                                                type="text"
                                                value={title}
                                                onChange={this.onTitleChangeHandler}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={this.onTitleConfirmHandler}
                                                            className="adornment-button"
                                                        >
                                                            {Boolean(group.title === title) ? <CloseRounded/> :
                                                                <CheckRounded/>}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                            />
                                        </FormControl>}
                                    </div>
                                    <div className="created-on">
                                        {i18n.t('peer_info.created')} {TimeUtility.dynamicDate(group.createdon || 0)}
                                    </div>
                                </div>}
                                {dialog && !disable && <div className="kk-card notify-settings">
                                    <div className="label">{i18n.t('peer_info.mute')}</div>
                                    <div className="value">
                                        <Checkbox
                                            className={'checkbox ' + (isMuted(dialog.notifysettings) ? 'checked' : '')}
                                            color="primary" checked={isMuted(dialog.notifysettings)}
                                            onChange={this.muteChangeHandler}
                                            indeterminate={dialog.notifysettings ? (dialog.notifysettings.muteuntil || 0) > 0 : false}
                                        />
                                    </div>
                                </div>}
                                {group && !disable && <>
                                    {Boolean(group && group.flagsList && group.flagsList.indexOf(GroupFlags.GROUPFLAGSCREATOR) > -1) &&
                                    <div className="kk-card notify-settings">
                                        <div className="label">{i18n.t('peer_info.all_member_admin')}</div>
                                        <div className="value switch">
                                            <Switch
                                                checked={allMemberAdmin}
                                                className="admin-switch"
                                                color="default"
                                                onChange={this.toggleAdminsHandler}
                                                classes={{
                                                    checked: 'setting-switch-checked',
                                                    root: 'setting-switch',
                                                    switchBase: 'setting-switch-base',
                                                    thumb: 'setting-switch-thumb',
                                                    track: 'setting-switch-track',
                                                }}
                                            />
                                        </div>
                                    </div>}
                                </>}
                                {group && !disable && <>
                                    {Boolean(group && group.flagsList && group.flagsList.indexOf(GroupFlags.GROUPFLAGSCREATOR) > -1) &&
                                    <div className="kk-card notify-settings">
                                        <div className="label">{i18n.t('peer_info.admin_only')}</div>
                                        <div className="value switch">
                                            <Switch
                                                checked={group.flagsList.indexOf(GroupFlags.GROUPFLAGSADMINONLY) > -1}
                                                className="admin-switch"
                                                color="default"
                                                onChange={this.toggleAdminOnlyHandler}
                                                classes={{
                                                    checked: 'setting-switch-checked',
                                                    root: 'setting-switch',
                                                    switchBase: 'setting-switch-base',
                                                    thumb: 'setting-switch-thumb',
                                                    track: 'setting-switch-track',
                                                }}
                                            />
                                        </div>
                                    </div>}
                                </>}
                                {(dialog && peer && !shareMediaEnabled) &&
                                <PeerMedia key={peer.getId() || ''} className="kk-card" peer={peer} full={false}
                                           teamId={this.teamId} onMore={this.peerMediaMoreHandler}
                                           onAction={this.props.onAction} onBulkAction={this.props.onBulkAction}/>}
                                {group && !disable && <div className="participant kk-card">
                                    <label>{i18n.tf('peer_info.participants', String(group.participants))} </label>
                                    {participants.map((participant, index) => {
                                        return (
                                            <div key={index}
                                                 className={'contact-item' + (allMemberAdmin || participant.type !== ParticipantType.PARTICIPANTTYPEMEMBER ? ' admin' : '')}>
                                                <UserAvatar className="avatar" id={participant.userid || ''}/>
                                                {participant.type === ParticipantType.PARTICIPANTTYPECREATOR ?
                                                    <div className="admin-wrapper"><StarsRounded/></div> :
                                                    (allMemberAdmin || participant.type === ParticipantType.PARTICIPANTTYPEADMIN) ?
                                                        <div className="admin-wrapper"><StarRateRounded/></div> : null}
                                                <UserName className="name" id={participant.userid} you={true}
                                                          noIcon={true} iconException={['bot']} noDetail={true}
                                                          onClick={this.participantClickHandler(participant.userid, participant.accesshash)}/>
                                                <div
                                                    className="username">{participant.username ? participant.username : i18n.t('general.no_username')}</div>
                                                {isAdmin && participant.type !== ParticipantType.PARTICIPANTTYPECREATOR && (participant.userid !== currentUserId || (participant.userid === currentUserId && participant.type !== ParticipantType.PARTICIPANTTYPEADMIN)) &&
                                                <div className="more"
                                                     onClick={this.moreOpenHandler(participant)}>
                                                    <MoreVertRounded/>
                                                </div>}
                                            </div>
                                        );
                                    })}
                                    {hasAccess && !disable &&
                                    <div className="add-member" onClick={this.addMemberDialogOpenHandler}>
                                        <AddRounded/> {i18n.t('peer_info.add_member')}
                                    </div>}
                                </div>}
                                {isMember && <div className="leave-group kk-card">
                                    <Button color="secondary" fullWidth={true} onClick={this.leaveGroupHandler}>
                                        <ExitToAppRounded/> {i18n.t('peer_info.leave')}
                                    </Button>
                                </div>}
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
                        <PeerMedia key={peer.getId() || ''} className="kk-card" peer={peer} teamId={this.teamId}
                                   full={true} onAction={this.props.onAction} onBulkAction={this.props.onBulkAction}/>}
                    </div>
                </div>
                <Menu
                    anchorEl={moreAnchorEl}
                    open={Boolean(moreAnchorEl)}
                    onClose={this.moreCloseHandler}
                    className="kk-context-menu"
                    classes={{
                        paper: 'kk-context-menu-paper'
                    }}
                >
                    {this.contextMenuItem(allMemberAdmin)}
                </Menu>
                <Menu
                    anchorEl={avatarMenuAnchorEl}
                    open={Boolean(avatarMenuAnchorEl)}
                    onClose={this.avatarMenuAnchorCloseHandler}
                    className="kk-context-menu"
                    classes={{
                        paper: 'kk-context-menu-paper'
                    }}
                >
                    {this.avatarContextMenuItem()}
                </Menu>
                <ContactPicker ref={this.contactPickerRefHandler} onDone={this.contactPickerDoneHandler}
                               teamId={this.teamId} title={i18n.t('peer_info.add_member')}
                               globalSearch={true}/>
            </div>
        );
    }

    /* Gets the group from repository and FullGroup from server */
    private getGroup = (data?: any) => {
        const {peer, disable} = this.state;
        if (!peer) {
            return;
        }

        if (data && (data.callerId === this.callerId || data.ids.indexOf(`${this.teamId}_${peer.getId()}`) === -1)) {
            return;
        }

        this.groupRepo.get(this.teamId, peer.getId() || '').then((res) => {
            if (res) {
                this.setState({
                    group: res,
                    title: res.title || '',
                });
            }
        });

        if (!disable) {
            if (this.loading) {
                return;
            }
            this.loading = true;
            this.groupRepo.getFull(this.teamId, peer.getId(), undefined, {callerId: this.callerId, checkLastUpdate: false}).then((res) => {
                this.setState({
                    group: res,
                    participants: res.participantsList,
                });
                // participantsList
                this.loading = false;
            }).catch((err) => {
                this.loading = false;
            });
        }
    }

    /* On title change will be set on state */
    private onTitleChangeHandler = (e: any) => {
        this.setState({
            title: trimStart(e.currentTarget.value),
        });
    }

    /* On titleEdit will be set on state */
    private onTitleEditHandler = () => {
        this.setState({
            titleEdit: true,
        });
    }

    /* If title have any difference from previous one it commit the changes to server
    *  otherwise it rollback all changes */
    private onTitleConfirmHandler = () => {
        const {group, title, peer} = this.state;
        if (!peer || this.loading) {
            return;
        }
        if (!group) {
            this.setState({
                titleEdit: false,
            });
            return;
        }
        if (title.length > 0 && group.title !== title) {
            this.loading = true;
            this.apiManager.groupEditTitle(peer, title).then(() => {
                group.title = title;
                this.setState({
                    group,
                    titleEdit: false,
                });
                this.loading = false;
            }).catch((err) => {
                this.setState({
                    title: group.title || '',
                    titleEdit: false,
                });
                this.loading = false;
            });
        } else {
            this.setState({
                titleEdit: false,
            });
            return;
        }
    }

    /* Decides what content the participants' "more" menu must have */
    private contextMenuItem(allMemberAdmin: boolean) {
        const {group, currentUser} = this.state;
        if (!group || !currentUser) {
            return null;
        }

        const menuItems = [];
        if (hasAuthority(group, true)) {
            if (currentUser.userid !== currentUserId) {
                menuItems.push({
                    cmd: 'remove',
                    title: i18n.t('contact.remove'),
                });
            }
            if (!allMemberAdmin && group.flagsList && group.flagsList.indexOf(GroupFlags.GROUPFLAGSCREATOR) > -1) {
                if (currentUser.type === ParticipantType.PARTICIPANTTYPEMEMBER) {
                    menuItems.push({
                        cmd: 'promote',
                        title: i18n.t('contact.promote'),
                    });
                }
                if (currentUser.type === ParticipantType.PARTICIPANTTYPEADMIN) {
                    menuItems.push({
                        cmd: 'demote',
                        title: i18n.t('contact.demote'),
                    });
                }
            }
        } else {
            return (<span>{i18n.t('contacts.you_have_no_authority')}</span>);
        }

        return menuItems.map((item, index) => {
            return (<MenuItem key={index} onClick={this.moreCmdHandler(item.cmd)}
                              className="context-item">{item.title}</MenuItem>);
        });
    }

    /* Decide what action should be done on current user */
    private moreCmdHandler = (cmd: string) => (e: any) => {
        const {peer, currentUser, participants, group} = this.state;
        if (!peer || !currentUser || !group) {
            return;
        }
        const user = new InputUser();
        user.setUserid(currentUser.userid || '');
        user.setAccesshash('');
        this.moreCloseHandler();
        switch (cmd) {
            case 'remove':
                this.apiManager.groupRemoveMember(peer, user).then(() => {
                    const index = findIndex(participants, {userid: currentUser.userid});
                    if (index > -1) {
                        participants.splice(index, 1);
                        group.participants = participants.length;
                        this.setState({
                            group,
                            participants,
                        });
                    }
                });
                break;
            case 'promote':
                this.apiManager.groupUpdateAdmin(peer, user, true).then(() => {
                    const index = findIndex(participants, {userid: currentUser.userid});
                    if (index > -1) {
                        participants[index].type = ParticipantType.PARTICIPANTTYPEADMIN;
                        this.setState({
                            participants,
                        });
                    }
                });
                break;
            case 'demote':
                this.apiManager.groupUpdateAdmin(peer, user, false).then(() => {
                    const index = findIndex(participants, {userid: currentUser.userid});
                    if (index > -1) {
                        participants[index].type = ParticipantType.PARTICIPANTTYPEMEMBER;
                        this.setState({
                            participants,
                        });
                    }
                });
                break;
        }
    }

    /* Opens participants' "more" menu
    *  and sets the current user */
    private moreOpenHandler = (user: IUser) => (e: any) => {
        this.setState({
            currentUser: user,
            moreAnchorEl: e.currentTarget,
        });
    }

    /* Closes participants more menu */
    private moreCloseHandler = () => {
        this.setState({
            moreAnchorEl: null,
        });
    }

    /* Opens the add member dialog */
    private addMemberDialogOpenHandler = () => {
        if (this.contactPickerRef) {
            this.contactPickerRef.openDialog(this.state.participants);
        }
    }

    /* Exits the group */
    private leaveGroupHandler = () => {
        if (this.props.onExitGroup) {
            this.props.onExitGroup();
        }
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

    /* Toggle admin handler */
    private toggleAdminsHandler = (e: any) => {
        if (this.loading) {
            return;
        }
        const {peer, group} = this.state;
        if (!peer || !group) {
            return;
        }
        this.loading = true;
        const toggleAdmin = () => {
            if (group.flagsList) {
                const index = group.flagsList.indexOf(GroupFlags.GROUPFLAGSADMINSENABLED);
                if (index > -1) {
                    group.flagsList.splice(index, 1);
                } else {
                    group.flagsList.push(GroupFlags.GROUPFLAGSADMINSENABLED);
                }
                this.setState({
                    group,
                });
            }
        };
        toggleAdmin();
        this.apiManager.groupToggleAdmin(peer, !e.currentTarget.checked).then(() => {
            this.loading = false;
        }).catch(() => {
            toggleAdmin();
        });
    }

    /* Toggle admin only handler */
    private toggleAdminOnlyHandler = (e: any) => {
        if (this.loading) {
            return;
        }
        const {peer, group} = this.state;
        if (!peer || !group) {
            return;
        }
        this.loading = true;
        const toggleAdmin = () => {
            if (group.flagsList) {
                const index = group.flagsList.indexOf(GroupFlags.GROUPFLAGSADMINONLY);
                if (index > -1) {
                    group.flagsList.splice(index, 1);
                } else {
                    group.flagsList.push(GroupFlags.GROUPFLAGSADMINONLY);
                }
                this.setState({
                    group,
                });
            }
        };
        toggleAdmin();
        this.apiManager.groupToggleAdminOnly(peer, e.currentTarget.checked).then(() => {
            this.loading = false;
        }).catch(() => {
            toggleAdmin();
        });
    }

    /* Participant onClick handler */
    private participantClickHandler = (id: string | undefined, accesshash: string | undefined) => (e: any) => {
        if (!id || !accesshash) {
            return;
        }
        this.broadcastEvent('User_Dialog_Open', {
            accesshash,
            id,
        });
    }

    /* Cropper ref handler */
    private cropperRefHandler = (ref: any) => {
        this.cropperRef = ref;
    }

    /* Open file dialog */
    private openFileDialog = () => {
        if (this.cropperRef) {
            this.cropperRef.openFile();
        }
    }

    /* Cropped image ready handler */
    private croppedImageReadyHandler = (blob: Blob) => {
        const {group} = this.state;
        if (!group) {
            return;
        }

        const id = -this.riverTime.milliNow();
        this.fileId = String(UniqueId.getRandomId());
        const fn = this.progressBroadcaster.listen(id, this.uploadProgressHandler);
        if (this.profileTempPhoto !== '') {
            URL.revokeObjectURL(this.profileTempPhoto);
        }
        this.profileTempPhoto = URL.createObjectURL(blob);
        this.setState({
            uploadingPhoto: true,
        });
        this.fileManager.sendFile(this.fileId, blob, (progress) => {
            this.progressBroadcaster.publish(id, progress);
        }).then(() => {
            this.progressBroadcaster.remove(id);
            if (fn) {
                fn();
            }
            const inputFile = new InputFile();
            inputFile.setFileid(this.fileId);
            inputFile.setFilename(`picture_${id}.jpg`);
            inputFile.setMd5checksum('');
            inputFile.setTotalparts(1);
            this.apiManager.groupUploadPicture(group.id || '', inputFile).then((res) => {
                if (group) {
                    group.photo = res;
                }
                this.setState({
                    group,
                    uploadingPhoto: false,
                });
                this.setState({
                    uploadingPhoto: false,
                });
                setTimeout(() => {
                    this.getGroup();
                }, 100);
            });
        }).catch(() => {
            if (this.props.onError) {
                this.props.onError(i18n.t('settings.cannot_update_group_picture'));
            }
            this.progressBroadcaster.remove(id);
            this.setState({
                uploadingPhoto: false,
            });
            if (fn) {
                fn();
            }
        });
    }

    /* Upload progress handler */
    private uploadProgressHandler = (progress: IFileProgress) => {
        let v = 3;
        if (progress.state === 'failed') {
            this.setState({
                uploadingPhoto: false,
            });
            return;
        } else if (progress.state !== 'complete' && progress.download > 0) {
            v = progress.progress * 85;
        } else if (progress.state === 'complete') {
            v = 88;
        }
        if (v < 3) {
            v = 3;
        }
        if (this.circleProgressRef) {
            this.circleProgressRef.style.strokeDasharray = `${v} 88`;
        }
    }

    /* Progress circle ref handler */
    private progressRefHandler = (ref: any) => {
        this.circleProgressRef = ref;
    }

    /* Cancel file download/upload */
    private cancelFileHandler = () => {
        this.fileManager.cancel(this.fileId);
    }

    /* Broadcast global event */
    private broadcastEvent(name: string, data: any) {
        this.broadcaster.publish(name, data);
    }

    /* Avatar menu anchor close handler */
    private avatarMenuAnchorCloseHandler = () => {
        this.setState({
            avatarMenuAnchorEl: null,
        });
    }

    /* Avatar menu anchor open handler */
    private avatarMenuAnchorOpenHandler = (e: any) => {
        const {group, disable} = this.state;
        if (!group) {
            return;
        }
        if (!disable && hasAuthority(group, true)) {
            this.setState({
                avatarMenuAnchorEl: e.currentTarget,
            });
        } else if (group.photo && group.photo.photosmall.fileid !== '0') {
            this.showAvatarHandler();
        }
    }

    /* Decides what content the participants' "more" menu must have */
    private avatarContextMenuItem() {
        const {group} = this.state;
        const hasPhoto = (group && group.photo && group.photo.photosmall && group.photo.photosmall.fileid !== '0');
        const menuItems: Array<{ cmd: 'show' | 'remove' | 'change', title: string }> = [{
            cmd: 'show',
            title: i18n.t('settings.show_photo'),
        }, {
            cmd: 'remove',
            title: i18n.t('settings.remove_photo'),
        }, {
            cmd: 'change',
            title: i18n.t(hasPhoto ? 'settings.change_photo' : 'settings.set_a_new_photo'),
        }];
        return menuItems.filter((item) => {
            return (item.cmd === 'change') || ((item.cmd === 'show' || item.cmd === 'remove') && hasPhoto);
        }).map((item, index) => {
            return (<MenuItem key={index} onClick={this.avatarMoreCmdHandler(item.cmd)}
                              className="context-item">{item.title}</MenuItem>);
        });
    }

    private avatarMoreCmdHandler = (cmd: 'show' | 'remove' | 'change') => (e: any) => {
        switch (cmd) {
            case 'show':
                this.showAvatarHandler();
                break;
            case 'remove':
                if (this.state.group) {
                    this.apiManager.groupRemovePicture(this.state.group.id || '');
                }
                break;
            case 'change':
                this.openFileDialog();
                break;
        }
        this.avatarMenuAnchorCloseHandler();
    }

    /* Show avatar handler */
    private showAvatarHandler = () => {
        const {group} = this.state;
        if (!group || !group.photo) {
            return;
        }
        let inputPeer: InputPeer | undefined;
        inputPeer = new InputPeer();
        inputPeer.setAccesshash('0');
        inputPeer.setId(group.id || '');
        inputPeer.setType(PeerType.PEERGROUP);
        const doc: IDocument = {
            inputPeer,
            items: [{
                caption: '',
                fileLocation: group.photo.photobig,
                thumbFileLocation: group.photo.photosmall,
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

    private contactPickerRefHandler = (ref: any) => {
        this.contactPickerRef = ref;
    }

    private contactPickerDoneHandler = (contacts: IUser[], caption: string) => {
        const {peer, group, forwardLimit, participants} = this.state;
        if (!peer || !group || contacts.length === 0) {
            return;
        }
        const promises: any[] = [];
        const newParticipants: GroupParticipant.AsObject[] = [];
        contacts.forEach((member) => {
            const user = new InputUser();
            user.setUserid(member.id || '');
            // @ts-ignore
            member.userid = member.id;
            user.setAccesshash(member.accesshash || '');
            promises.push(this.apiManager.groupAddMember(peer, user, forwardLimit).catch((err) => {
                if (err.code === C_ERR.ErrCodeAccess && err.items === C_ERR_ITEM.ErrItemUserID) {
                    if (this.props.onError) {
                        this.props.onError(i18n.tf('peer_info.user_cannot_be_added', member.firstname || ''));
                    }
                } else {
                    newParticipants.push(member as GroupParticipant.AsObject);
                }
                return Promise.resolve();
            }));
        });
        /* waits for all promises to be resolved */
        if (promises.length > 0) {
            Promise.all(promises).then((res) => {
                if (newParticipants.length > 0) {
                    participants.push(...newParticipants);
                    group.participants = participants.length;
                    this.setState({
                        group,
                        participants,
                    });
                }
            });
        }
    }
}

export default GroupInfoMenu;