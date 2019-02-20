/*
    Creation Time: 2018 - Nov - 27
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {
    AddRounded,
    CheckRounded,
    CloseRounded,
    EditRounded,
    ExitToAppRounded, KeyboardBackspaceRounded,
    MoreVert,
    PersonAddRounded, PhotoCameraRounded,
    StarRateRounded,
    StarsRounded,
} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import {
    GroupFlags, InputFile,
    InputPeer,
    InputUser,
    ParticipantType,
    PeerNotifySettings
} from '../../services/sdk/messages/chat.core.types_pb';
import SDK from '../../services/sdk';
import GroupAvatar from '../GroupAvatar';
import {IGroup} from '../../repository/group/interface';
import GroupRepo from '../../repository/group';
import TimeUtility from '../../services/utilities/time';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import {IParticipant, IUser} from '../../repository/user/interface';
import UserAvatar from '../UserAvatar';
import Menu from '@material-ui/core/Menu/Menu';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import {findIndex, trimStart} from 'lodash';
import Dialog from '@material-ui/core/Dialog/Dialog';
import ContactList from '../ContactList';
import Checkbox from '@material-ui/core/Checkbox/Checkbox';
import {isMuted} from '../UserInfoMenu';
import {IDialog} from '../../repository/dialog/interface';
import DialogRepo from '../../repository/dialog';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import RadioGroup from '@material-ui/core/RadioGroup/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import Radio from '@material-ui/core/Radio/Radio';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import Switch from '@material-ui/core/Switch/Switch';
import UserRepo from '../../repository/user';
import Scrollbars from 'react-custom-scrollbars';
import RiverTime from '../../services/utilities/river_time';
import UniqueId from '../../services/uniqueId';
import FileManager, {IFileProgress} from '../../services/sdk/fileManager';
import ProgressBroadcaster from '../../services/progress';
import DocumentViewerService, {IDocument} from '../../services/documentViewerService';
import AvatarCropper from '../AvatarCropper';
import PeerMedia from '../PeerMedia';

import './style.css';

interface IProps {
    peer: InputPeer | null;
    onClose?: () => void;
    onCreate?: (contacts: IUser[], title: string) => void;
}

interface IState {
    addMemberDialogEnable: boolean;
    avatarMenuAnchorEl: any;
    currentUser: IParticipant | null;
    dialog: IDialog | null;
    forwardLimit: number;
    group: IGroup | null;
    moreAnchorEl: any;
    newMembers: IUser[];
    notifySettingDialogOpen: boolean;
    notifyValue: string;
    page: string;
    participants: IParticipant[];
    peer: InputPeer | null;
    title: string;
    titleEdit: boolean;
    uploadingPhoto: boolean;
}

class GroupInfoMenu extends React.Component<IProps, IState> {
    private groupRepo: GroupRepo;
    private dialogRepo: DialogRepo;
    private userRepo: UserRepo;
    private sdk: SDK;
    private loading: boolean = false;
    private readonly userId: string;
    private riverTime: RiverTime;
    private fileManager: FileManager;
    private progressBroadcaster: ProgressBroadcaster;
    private profileTempPhoto: string = '';
    private circleProgressRef: any = null;
    private fileId: string = '';
    private cropperRef: AvatarCropper;
    private documentViewerService: DocumentViewerService;
    private callerId: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            addMemberDialogEnable: false,
            avatarMenuAnchorEl: null,
            currentUser: null,
            dialog: null,
            forwardLimit: 50,
            group: null,
            moreAnchorEl: null,
            newMembers: [],
            notifySettingDialogOpen: false,
            notifyValue: '-1',
            page: '1',
            participants: [],
            peer: props.peer,
            title: '',
            titleEdit: false,
            uploadingPhoto: false,
        };
        // RiverTime singleton
        this.riverTime = RiverTime.getInstance();
        // Group Repository singleton
        this.groupRepo = GroupRepo.getInstance();
        // Dialog Repository singleton
        this.dialogRepo = DialogRepo.getInstance();
        // User Repository singleton
        this.userRepo = UserRepo.getInstance();
        // SDK singleton
        this.sdk = SDK.getInstance();

        this.userId = SDK.getInstance().getConnInfo().UserID || '';

        this.fileManager = FileManager.getInstance();
        this.progressBroadcaster = ProgressBroadcaster.getInstance();

        this.documentViewerService = DocumentViewerService.getInstance();

        this.callerId = UniqueId.getRandomId();
    }

    public componentDidMount() {
        window.addEventListener('Group_DB_Updated', this.getGroup);
        this.getGroup();
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.peer === newProps.peer) {
            return;
        }
        this.setState({
            peer: newProps.peer,
        }, () => {
            this.getGroup();
        });
    }

    public componentWillUnmount() {
        window.removeEventListener('Group_DB_Updated', this.getGroup);
    }

    public render() {
        const {addMemberDialogEnable, avatarMenuAnchorEl, group, page, peer, participants, title, titleEdit, moreAnchorEl, dialog, notifySettingDialogOpen, notifyValue, uploadingPhoto} = this.state;
        return (
            <div className="group-info-menu">
                <AvatarCropper ref={this.cropperRefHandler} onImageReady={this.croppedImageReadyHandler} width={640}/>
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
                            <label>Group Info</label>
                        </div>
                        <Scrollbars
                            autoHide={true}
                        >
                            <div>
                                {group && <div className="info kk-card">
                                    <div className="avatar" onClick={this.avatarMenuAnchorOpenHandler}>
                                        {!uploadingPhoto && <GroupAvatar id={group.id || ''}/>}
                                        {uploadingPhoto && <img src={this.profileTempPhoto} className="avatar-image"/>}
                                        {this.hasAuthority(group) &&
                                        <div className={'overlay ' + (uploadingPhoto ? 'show' : '')}>
                                            {!uploadingPhoto && <React.Fragment>
                                                <PhotoCameraRounded/>
                                                <div className="text">
                                                    CHANGE<br/>PROFILE<br/>PHOTO
                                                </div>
                                            </React.Fragment>}
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
                                            {this.hasAuthority(group) && <div className="action">
                                                <IconButton
                                                    aria-label="Edit title"
                                                    onClick={this.onTitleEditHandler}
                                                >
                                                    <EditRounded/>
                                                </IconButton>
                                            </div>}
                                        </div>}
                                        {titleEdit &&
                                        <FormControl fullWidth={true} className="title-edit">
                                            <InputLabel htmlFor="adornment-title">Title</InputLabel>
                                            <Input
                                                id="adornment-title"
                                                type="text"
                                                value={title}
                                                onChange={this.onTitleChangeHandler}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="Confirm changes"
                                                            onClick={this.onTitleConfirmHandler}
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
                                        Created {TimeUtility.dynamicDate(group.createdon || 0)}
                                    </div>
                                </div>}
                                {dialog && <div className="kk-card notify-settings">
                                    <div className="label">Mute</div>
                                    <div className="value">
                                        <Checkbox
                                            className={'checkbox ' + (isMuted(dialog.notifysettings) ? 'checked' : '')}
                                            color="primary" checked={isMuted(dialog.notifysettings)}
                                            onChange={this.muteChangeHandler}
                                            indeterminate={dialog.notifysettings ? (dialog.notifysettings.muteuntil || 0) > 0 : false}
                                        />
                                    </div>
                                </div>}
                                {group && <React.Fragment>
                                    {this.hasAuthority(group) && <div className="kk-card notify-settings">
                                        <div className="label">All Members Admin</div>
                                        <div className="value switch">
                                            <Switch
                                                checked={(group.flagsList || []).indexOf(GroupFlags.GROUPFLAGSADMINSENABLED) === -1}
                                                className="admin-switch"
                                                color="default"
                                                onChange={this.toggleAdminsHandler}
                                            />
                                        </div>
                                    </div>}
                                </React.Fragment>}
                                {(dialog && peer) &&
                                <PeerMedia className="kk-card" peer={peer} full={false}
                                           onMore={this.peerMediaMoreHandler}/>}
                                {group && <div className="participant kk-card">
                                    <label>{group.participants} participants</label>
                                    {participants.map((participant, index) => {
                                        return (
                                            <div key={index}
                                                 className={'contact-item' + (participant.type !== ParticipantType.PARTICIPANTTYPEMEMBER ? ' admin' : '')}>
                                                <UserAvatar className="avatar" id={participant.userid || ''}/>
                                                {participant.type === ParticipantType.PARTICIPANTTYPECREATOR &&
                                                <div className="admin-wrapper"><StarsRounded/></div>}
                                                {participant.type === ParticipantType.PARTICIPANTTYPEADMIN &&
                                                <div className="admin-wrapper"><StarRateRounded/></div>}
                                                <span className="name"
                                                      onClick={this.participantClickHandler.bind(this, participant.userid, participant.accesshash)}>{`${participant.firstname} ${participant.lastname}`}{this.userId === participant.userid ? ' (you)' : ''}</span>
                                                <span
                                                    className="username">{participant.username ? participant.username : 'no username'}</span>
                                                <div className="more"
                                                     onClick={this.moreOpenHandler.bind(this, participant)}>
                                                    <MoreVert/>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="add-member" onClick={this.addMemberDialogOpenHandler}>
                                        <AddRounded/> Add member
                                    </div>
                                </div>}
                                <div className="leave-group kk-card" onClick={this.leaveGroupHandler}>
                                    <ExitToAppRounded/> Leave the '{group ? group.title : ''}'
                                </div>
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
                            <label>Shared Media</label>
                        </div>
                        {(dialog && peer) &&
                        <PeerMedia className="kk-card" peer={peer} full={true}/>}
                    </div>
                </div>
                <Menu
                    anchorEl={moreAnchorEl}
                    open={Boolean(moreAnchorEl)}
                    onClose={this.moreCloseHandler}
                    className="kk-context-menu"
                >
                    {this.contextMenuItem()}
                </Menu>
                <Dialog
                    open={addMemberDialogEnable}
                    onClose={this.addMemberDialogCloseHandler}
                    className="add-member-dialog"
                >
                    {addMemberDialogEnable && <div className="dialog-content">
                        <div className="dialog-header">
                            <PersonAddRounded/> Add member
                        </div>
                        <ContactList hiddenContacts={participants} onChange={this.addMemberChangeHandler} mode="chip"/>
                        {Boolean(this.state.newMembers.length > 0) && <div className="actions-bar">
                            <div className="add-action" onClick={this.addMemberHandler}>
                                <CheckRounded/>
                            </div>
                        </div>}
                    </div>}
                </Dialog>
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
                <Menu
                    anchorEl={avatarMenuAnchorEl}
                    open={Boolean(avatarMenuAnchorEl)}
                    onClose={this.avatarMenuAnchorCloseHandler}
                    className="kk-context-menu"
                >
                    {this.avatarContextMenuItem()}
                </Menu>
            </div>
        );
    }

    /* Gets the group from repository and FullGroup from server */
    private getGroup = (data?: any) => {
        const {peer} = this.state;
        if (!peer) {
            return;
        }
        if (data && (data.detail.callerId === this.callerId || data.detail.ids.indexOf(peer.getId()) === -1)) {
            return;
        }
        this.groupRepo.get(peer.getId() || '').then((res) => {
            this.setState({
                group: res,
                title: res.title || '',
            });
        });

        this.dialogRepo.get(peer.getId() || '').then((dialog) => {
            this.setState({
                dialog,
            });
        });

        if (this.loading) {
            return;
        }
        this.loading = true;
        this.sdk.groupGetFull(peer).then((res) => {
            const group: IGroup = res.group;
            group.participantList = res.participantsList;
            this.groupRepo.importBulk([group], this.callerId);
            const contacts: IUser[] = [];
            res.participantsList.forEach((list) => {
                contacts.push({
                    accesshash: list.accesshash,
                    firstname: list.firstname,
                    id: list.userid,
                    lastname: list.lastname,
                    username: list.username,
                });
            });
            this.userRepo.importBulk(false, contacts);
            this.setState({
                group: res.group,
                participants: res.participantsList,
            });
            this.loading = false;
        }).catch((err) => {
            this.loading = false;
        });
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
            this.sdk.groupEditTitle(peer, title).then(() => {
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
    private contextMenuItem() {
        const {group, currentUser} = this.state;
        if (!group || !currentUser) {
            return;
        }
        const menuItems = [];
        if (this.hasAuthority(group)) {
            menuItems.push({
                cmd: 'remove',
                title: 'Remove',
            });
            if (currentUser.type === ParticipantType.PARTICIPANTTYPEMEMBER) {
                menuItems.push({
                    cmd: 'promote',
                    title: 'Promote',
                });
            }
            if (currentUser.type === ParticipantType.PARTICIPANTTYPEADMIN) {
                menuItems.push({
                    cmd: 'demote',
                    title: 'Demote',
                });
            }
        } else {
            return (<span>You have no authority!</span>);
        }
        return menuItems.map((item, index) => {
            return (<MenuItem key={index} onClick={this.moreCmdHandler.bind(this, item.cmd)}
                              className="context-item">{item.title}</MenuItem>);
        });
    }

    /* Decide what action should be done on current user */
    private moreCmdHandler = (cmd: string) => {
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
                this.sdk.groupRemoveMember(peer, user).then(() => {
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
                this.sdk.groupUpdateAdmin(peer, user, true).then(() => {
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
                this.sdk.groupUpdateAdmin(peer, user, false).then(() => {
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
    private moreOpenHandler = (user: IUser, e: any) => {
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
        this.setState({
            addMemberDialogEnable: true,
        });
    }

    /* Closes the add member dialog */
    private addMemberDialogCloseHandler = () => {
        this.setState({
            addMemberDialogEnable: false,
        });
    }

    /* Sets the new member list */
    private addMemberChangeHandler = (contacts: IUser[]) => {
        this.setState({
            newMembers: contacts,
        });
    }

    /* Adds member(s) to group */
    private addMemberHandler = () => {
        this.addMemberDialogCloseHandler();
        const {peer, newMembers, group, forwardLimit, participants} = this.state;
        if (!peer || !group || newMembers.length === 0) {
            return;
        }
        const promises: any[] = [];
        newMembers.forEach((member) => {
            const user = new InputUser();
            user.setUserid(member.id || '');
            // @ts-ignore
            member.userid = member.id;
            user.setAccesshash(member.accesshash || '');
            promises.push(this.sdk.groupAddMember(peer, user, forwardLimit));
        });
        /* waits for all promises to be resolved */
        if (promises.length > 0) {
            Promise.all(promises).then((res) => {
                participants.push.apply(participants, newMembers);
                group.participants = participants.length;
                this.setState({
                    group,
                    newMembers: [],
                    participants,
                });
            }).catch(() => {
                this.setState({
                    newMembers: [],
                });
            });
        } else {
            this.setState({
                newMembers: [],
            });
        }
    }

    /* Exits the group */
    private leaveGroupHandler = () => {
        const {peer, participants, group} = this.state;
        if (!peer || !group) {
            return;
        }
        const id = this.sdk.getConnInfo().UserID || '';
        const user = new InputUser();
        user.setUserid(id);
        user.setAccesshash('');
        this.sdk.groupRemoveMember(peer, user).then(() => {
            const index = findIndex(participants, {id});
            if (index > -1) {
                participants.splice(index, 1);
                group.participants = participants.length;
                this.setState({
                    group,
                    participants,
                });
            }
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
        this.sdk.groupToggleAdmin(peer, !e.currentTarget.checked).then(() => {
            this.loading = false;
        }).catch(() => {
            toggleAdmin();
        });
    }

    /* hasAuthority checks user permission for group actions */
    private hasAuthority(group: IGroup) {
        if (group.flagsList) {
            return group.flagsList.indexOf(GroupFlags.GROUPFLAGSADMIN) > -1 || group.flagsList.indexOf(GroupFlags.GROUPFLAGSADMINSENABLED) === -1;
        } else {
            return false;
        }
    }

    /* Participant onClick handler */
    private participantClickHandler = (id: string, accesshash: string) => {
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
            inputFile.setFilename(`picture_${id}.ogg`);
            inputFile.setMd5checksum('');
            inputFile.setTotalparts(1);
            this.sdk.groupUploadPicture(group.id || '', inputFile).then((res) => {
                this.setState({
                    uploadingPhoto: false,
                });
            });
        }).catch(() => {
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
        const event = new CustomEvent(name, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(event);
    }

    /* Avatar menu anchor close handler */
    private avatarMenuAnchorCloseHandler = () => {
        this.setState({
            avatarMenuAnchorEl: null,
        });
    }

    /* Avatar menu anchor open handler */
    private avatarMenuAnchorOpenHandler = (e: any) => {
        const {group} = this.state;
        if (!group) {
            return;
        }
        if (this.hasAuthority(group)) {
            this.setState({
                avatarMenuAnchorEl: e.currentTarget,
            });
        } else {
            this.showAvatarHandler();
        }
    }

    /* Decides what content the participants' "more" menu must have */
    private avatarContextMenuItem() {
        const menuItems = [{
            cmd: 'show',
            title: 'Show Photo',
        }/*, {
            cmd: 'remove',
            title: 'Remove Photo',
        }*/, {
            cmd: 'change',
            title: 'Change Photo',
        }];
        return menuItems.map((item, index) => {
            return (<MenuItem key={index} onClick={this.avatarMoreCmdHandler.bind(this, item.cmd)}
                              className="context-item">{item.title}</MenuItem>);
        });
    }

    private avatarMoreCmdHandler = (cmd: 'show' | 'remove' | 'change') => {
        switch (cmd) {
            case 'show':
                this.showAvatarHandler();
                break;
            case 'remove':
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
        const doc: IDocument = {
            items: [{
                caption: '',
                fileLocation: group.photo.photobig,
                thumbFileLocation: group.photo.photosmall,
            }],
            type: 'avatar'
        };
        this.documentViewerService.loadDocument(doc);
    }

    /* Show more media handler */
    private peerMediaMoreHandler = () => {
        this.setState({
            page: '2',
        });
    }

    /* Close media handler */
    private peerMediaCloseHandler = () => {
        this.setState({
            page: '1',
        });
    }
}

export default GroupInfoMenu;
