/*
    Creation Time: 2018 - Oct - 14
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import Switch from '@material-ui/core/Switch';
import MobileStepper from '@material-ui/core/MobileStepper';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import {
    KeyboardBackspaceRounded,
    PaletteRounded,
    PersonRounded,
    EditRounded,
    CheckRounded,
    BookmarkRounded,
    PhotoCameraRounded,
    CloseRounded,
    FormatSizeRounded,
    ChatBubbleRounded,
    FormatColorFillRounded,
    CollectionsRounded,
    Brightness2Rounded,
    ClearAllRounded,
} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import UserAvatar from '../UserAvatar';
import TextField from '@material-ui/core/TextField/TextField';
import UserRepo from '../../repository/user';
import SDK from '../../services/sdk';
import {debounce} from 'lodash';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Scrollbars from 'react-custom-scrollbars';
import {backgrounds, bubbles, themes} from './vars/theme';
import {IUser} from '../../repository/user/interface';
import {Link} from 'react-router-dom';
import FileManager, {IFileProgress} from '../../services/sdk/fileManager';
import UniqueId from '../../services/uniqueId';
import ProgressBroadcaster from '../../services/progress';
import RiverTime from '../../services/utilities/river_time';
import {InputFile} from '../../services/sdk/messages/chat.core.types_pb';
import DocumentViewerService, {IDocument} from '../../services/documentViewerService';
import Menu from '@material-ui/core/Menu/Menu';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import AvatarCropper from '../AvatarCropper';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import OverlayDialog from '@material-ui/core/Dialog/Dialog';
import Broadcaster from '../../services/broadcaster';
import {AccountAuthorization} from '../../services/sdk/messages/chat.api.accounts_pb';
import TimeUtility from '../../services/utilities/time';
import {findIndex} from 'lodash';

import './style.css';
import 'react-image-crop/dist/ReactCrop.css';

export const C_VERSION = '0.23.96';

interface IProps {
    onClose?: () => void;
    onAction?: (cmd: 'logout') => void;
    subMenu?: string;
    updateMessages?: () => void;
    onSubPlaceChange?: (sub: string) => void;
}

interface IState {
    avatarMenuAnchorEl: any;
    bio: string;
    confirmDialogOpen: boolean;
    confirmDialogSelectedId: string;
    debugModeOpen: boolean;
    debugModeUrl: string;
    editProfile: boolean;
    editUsername: boolean;
    firstname: string;
    fontSize: number;
    lastname: string;
    page: string;
    pageContent: string;
    phone: string;
    profileCropperOpen: boolean;
    profilePictureCrop: any;
    profilePictureFile?: string;
    selectedBackground: string;
    selectedBubble: string;
    selectedTheme: string;
    sessions?: AccountAuthorization.AsObject[];
    uploadingPhoto: boolean;
    user: IUser | null;
    username: string;
    usernameAvailable: boolean;
    usernameValid: boolean;
}

class SettingMenu extends React.Component<IProps, IState> {
    private userRepo: UserRepo;
    private sdk: SDK;
    private readonly userId: string;
    private readonly currentAuthID: string;
    private readonly usernameCheckDebounce: any;
    private fileManager: FileManager;
    private progressBroadcaster: ProgressBroadcaster;
    private riverTime: RiverTime;
    private profileTempPhoto: string = '';
    private circleProgressRef: any = null;
    private fileId: string = '';
    private cropperRef: AvatarCropper;
    private documentViewerService: DocumentViewerService;
    private versionClickTimeout: any = null;
    private versionClickCounter: number = 0;
    private broadcaster: Broadcaster;

    constructor(props: IProps) {
        super(props);

        this.sdk = SDK.getInstance();
        this.userId = this.sdk.getConnInfo().UserID || '';

        this.state = {
            avatarMenuAnchorEl: null,
            bio: '',
            confirmDialogOpen: false,
            confirmDialogSelectedId: '',
            debugModeOpen: false,
            debugModeUrl: localStorage.getItem('river.test_url') || 'new.river.im',
            editProfile: false,
            editUsername: false,
            firstname: '',
            fontSize: 2,
            lastname: '',
            page: (props.subMenu && props.subMenu !== 'none' ? '2' : '1'),
            pageContent: props.subMenu || 'none',
            phone: this.sdk.getConnInfo().Phone || '',
            profileCropperOpen: false,
            profilePictureCrop: {
                aspect: 1,
                width: 640,
                x: 0,
                y: 0,
            },
            selectedBackground: '-1',
            selectedBubble: '1',
            selectedTheme: 'light',
            uploadingPhoto: false,
            user: null,
            username: '',
            usernameAvailable: false,
            usernameValid: false,
        };
        this.userRepo = UserRepo.getInstance();
        this.usernameCheckDebounce = debounce(this.checkUsername, 256);
        if (props.subMenu === 'account') {
            this.getUser();
        }
        this.fileManager = FileManager.getInstance();
        this.progressBroadcaster = ProgressBroadcaster.getInstance();
        this.riverTime = RiverTime.getInstance();

        this.documentViewerService = DocumentViewerService.getInstance();
        this.broadcaster = Broadcaster.getInstance();

        this.currentAuthID = this.sdk.getConnInfo().AuthID;
    }

    public componentDidMount() {
        const el = document.querySelector('html');
        if (!el) {
            return;
        }
        this.setState({
            fontSize: parseInt(el.getAttribute('font') || '2', 10),
            selectedBackground: el.getAttribute('bg') || '-1',
            selectedBubble: el.getAttribute('bubble') || '1',
            selectedTheme: el.getAttribute('theme') || 'light',
        });
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (newProps.subMenu !== 'none') {
            this.setState({
                page: '2',
                pageContent: newProps.subMenu || 'none',
            });
            if (newProps.subMenu === 'account') {
                this.getUser();
            }
        } else {
            this.setState({
                pageContent: newProps.subMenu || 'none',
            });
        }
    }

    public render() {
        const {avatarMenuAnchorEl, page, pageContent, user, editProfile, editUsername, bio, firstname, lastname, phone, username, usernameAvailable, usernameValid, uploadingPhoto, debugModeOpen, sessions, confirmDialogOpen} = this.state;
        return (
            <div className="setting-menu">
                <AvatarCropper ref={this.cropperRefHandler} onImageReady={this.croppedImageReadyHandler} width={640}/>
                <div className={'page-container page-' + page}>
                    <div className="page page-1">
                        <div className="menu-header">
                            <IconButton
                                aria-label="Close"
                                aria-haspopup="true"
                                onClick={this.props.onClose}
                            >
                                <KeyboardBackspaceRounded/>
                            </IconButton>
                            <label>Settings</label>
                        </div>
                        <div className="menu-content padding-side">
                            <div className="page-anchor">
                                <Link to={`/chat/${this.userId}`}>
                                    <div className="icon color-saved-messages">
                                        <BookmarkRounded/>
                                    </div>
                                    <div className="anchor-label">Saved Messages</div>
                                </Link>
                            </div>
                            <div className="page-anchor" onClick={this.accountPageHandler}>
                                <div className="icon color-account">
                                    <PersonRounded/>
                                </div>
                                <div className="anchor-label">Account ({phone})</div>
                            </div>
                            <div className="page-anchor" onClick={this.sessionPageHandler}>
                                <div className="icon color-session">
                                    <ClearAllRounded/>
                                </div>
                                <div className="anchor-label">Active Sessions</div>
                            </div>
                            <div className="page-anchor" onClick={this.themePageHandler}>
                                <div className="icon color-theme">
                                    <PaletteRounded/>
                                </div>
                                <div className="anchor-label">Theme</div>
                            </div>
                            <div className="page-anchor">
                                <div className="icon color-night-mode">
                                    <Brightness2Rounded/>
                                </div>
                                <div className="anchor-label">Night Mode</div>
                                <div className="setting-switch-label">
                                    <Switch
                                        checked={Boolean(this.state.selectedTheme !== 'light')}
                                        className="setting-switch"
                                        color="default"
                                        onChange={this.nightModeHandler}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="version" onClick={this.versionClickHandler}>
                            v{C_VERSION}
                        </div>
                    </div>
                    <div className="page page-2">
                        {Boolean(pageContent === 'theme') && <React.Fragment>
                            <div className="menu-header">
                                <IconButton
                                    aria-label="Prev"
                                    aria-haspopup="true"
                                    onClick={this.onPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>Theme</label>
                            </div>
                            <div className="menu-content">
                                <Scrollbars
                                    autoHide={true}
                                >
                                    <div className="padding-side">
                                        <div className="page-content">
                                            <div className="page-anchor">
                                                <div className="icon color-font-size">
                                                    <FormatSizeRounded/>
                                                </div>
                                                <div className="anchor-label">Font Size</div>
                                            </div>
                                            <div className="page-content-inner">
                                                <MobileStepper
                                                    variant="progress"
                                                    steps={6}
                                                    position="static"
                                                    activeStep={this.state.fontSize}
                                                    className="font-size-container"
                                                    nextButton={
                                                        <Button size="small" onClick={this.handleNext}
                                                                disabled={this.state.fontSize === 5}>
                                                            <KeyboardArrowRight/>
                                                        </Button>
                                                    }
                                                    backButton={
                                                        <Button size="small" onClick={this.handleBack}
                                                                disabled={this.state.fontSize === 0}>
                                                            <KeyboardArrowLeft/>
                                                        </Button>
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="page-content">
                                            <div className="page-anchor">
                                                <div className="icon color-theme-type">
                                                    <FormatColorFillRounded/>
                                                </div>
                                                <div className="anchor-label">Theme</div>
                                            </div>
                                            <div className="page-content-inner">
                                                <GridList className="theme-container" cellHeight={100} spacing={6}>
                                                    {themes.map((theme, index) => (
                                                        <GridListTile key={index} cols={1} rows={1}
                                                                      onClick={this.selectThemeHandler.bind(this, theme.id)}>
                                                            <div
                                                                className={'item theme-' + theme.id + ' bubble-' + this.state.selectedBubble + ' bg-' + this.state.selectedBackground}/>
                                                            <GridListTileBar
                                                                className={'title-bar ' + (this.state.selectedTheme === theme.id ? 'selected' : '')}
                                                                title={theme.title}
                                                                titlePosition="bottom"
                                                            />
                                                        </GridListTile>
                                                    ))}
                                                </GridList>
                                            </div>
                                        </div>
                                        <div className="page-content">
                                            <div className="page-anchor">
                                                <div className="icon color-bubble">
                                                    <ChatBubbleRounded/>
                                                </div>
                                                <div className="anchor-label">Bubble</div>
                                            </div>
                                            <div className="page-content-inner">
                                                <GridList className="theme-container" cellHeight={100} spacing={6}>
                                                    {bubbles.map((bubble, index) => (
                                                        <GridListTile key={index} cols={1} rows={1}
                                                                      onClick={this.selectBubbleHandler.bind(this, bubble.id)}>
                                                            <div
                                                                className={'item bubble-' + bubble.id + ' bg-' + this.state.selectedBackground}/>
                                                            <GridListTileBar
                                                                className={'title-bar ' + (this.state.selectedBubble === bubble.id ? 'selected' : '')}
                                                                title={bubble.title}
                                                                titlePosition="bottom"
                                                            />
                                                        </GridListTile>
                                                    ))}
                                                </GridList>
                                            </div>
                                        </div>
                                        <div className="page-content">
                                            <div className="page-anchor">
                                                <div className="icon color-background">
                                                    <CollectionsRounded/>
                                                </div>
                                                <div className="anchor-label">Background</div>
                                            </div>
                                            <div className="page-content-inner">
                                                <GridList className="theme-container" cellHeight={100} spacing={6}>
                                                    {backgrounds.map((bg, index) => (
                                                        <GridListTile key={index} cols={1} rows={1}
                                                                      onClick={this.selectBackgroundHandler.bind(this, bg.id)}>
                                                            <div
                                                                className={'item bg-' + bg.id + ' bubble-' + this.state.selectedBubble}/>
                                                            <GridListTileBar
                                                                className={'title-bar ' + (this.state.selectedBackground === bg.id ? 'selected' : '')}
                                                                title={bg.title}
                                                                titlePosition="bottom"
                                                            />
                                                        </GridListTile>
                                                    ))}
                                                </GridList>
                                            </div>
                                        </div>
                                    </div>
                                </Scrollbars>
                            </div>
                        </React.Fragment>}
                        {Boolean(pageContent === 'account') && <div>
                            <div className="menu-header">
                                <IconButton
                                    aria-label="Prev"
                                    aria-haspopup="true"
                                    onClick={this.onPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>Account</label>
                            </div>
                            {user && <div className="info kk-card">
                                <div className="avatar" onClick={this.avatarMenuAnchorOpenHandler}>
                                    {!uploadingPhoto && <UserAvatar id={user.id || ''} noDetail={true}/>}
                                    {uploadingPhoto && <img src={this.profileTempPhoto} className="avatar-image"/>}
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
                                    </div>
                                </div>
                                <div className="line">
                                    {!editProfile && <div className="form-control">
                                        <label>First Name</label>
                                        <div className="inner">{user.firstname}</div>
                                        <div className="action">
                                            {!editUsername && <IconButton
                                                aria-label="Edit firstname"
                                                onClick={this.onEditProfileHandler}
                                            >
                                                <EditRounded/>
                                            </IconButton>}
                                        </div>
                                    </div>}
                                    {editProfile &&
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
                                    {!editProfile && <div className="form-control">
                                        <label>Last Name</label>
                                        <div className="inner">{user.lastname}</div>
                                        <div className="action">
                                            {!editUsername && <IconButton
                                                aria-label="Edit lastname"
                                                onClick={this.onEditProfileHandler}
                                            >
                                                <EditRounded/>
                                            </IconButton>}
                                        </div>
                                    </div>}
                                    {editProfile &&
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
                                </div>
                                <div className="line">
                                    {!editProfile && <div className="form-control">
                                        <label>Bio</label>
                                        <div className="inner">{user.bio}</div>
                                        <div className="action">
                                            {!editUsername && <IconButton
                                                aria-label="Edit bio"
                                                onClick={this.onEditProfileHandler}
                                            >
                                                <EditRounded/>
                                            </IconButton>}
                                        </div>
                                    </div>}
                                    {editProfile &&
                                    <TextField
                                        label="Bio"
                                        fullWidth={true}
                                        inputProps={{
                                            maxLength: 32,
                                        }}
                                        value={bio}
                                        multiline={true}
                                        rowsMax={3}
                                        className="input-edit"
                                        onChange={this.onBioChangeHandler}
                                    />}
                                </div>
                                <div className="line">
                                    {!editUsername && <div className="form-control">
                                        <label>Username</label>
                                        <div className="inner">{user.username}</div>
                                        <div className="action">
                                            {!editProfile && <IconButton
                                                aria-label="Edit title"
                                                onClick={this.onEditUsernameHandler}
                                            >
                                                <EditRounded/>
                                            </IconButton>}
                                        </div>
                                    </div>}
                                    {editUsername &&
                                    <TextField
                                        label="Username"
                                        fullWidth={true}
                                        inputProps={{
                                            maxLength: 32,
                                        }}
                                        value={username}
                                        className="input-edit"
                                        onChange={this.onUsernameChangeHandler}
                                        error={!usernameAvailable || !usernameValid}
                                        helperText={!usernameAvailable ? 'Username is not available' : (!usernameValid ? 'Username is not valid' : '')}
                                    />}
                                </div>
                                <div className="line">
                                    <div className="form-control pad">
                                        <label>Phone</label>
                                        <div className="inner">{phone}</div>
                                    </div>
                                </div>
                                {Boolean(editProfile && user && (user.firstname !== firstname || user.lastname !== lastname || user.bio !== bio)) &&
                                <div className="actions-bar">
                                    <div className="add-action" onClick={this.confirmProfileChangesHandler}>
                                        <CheckRounded/>
                                    </div>
                                </div>}
                                {Boolean(editUsername && user && (user.username !== username || username === '') && usernameAvailable && usernameValid) &&
                                <div className="actions-bar">
                                    <div className="add-action" onClick={this.confirmUsernameChangeHandler}>
                                        <CheckRounded/>
                                    </div>
                                </div>}
                                {Boolean(editProfile || editUsername) && <div
                                    className={'actions-bar cancel' + ((user && ((user.username !== username && usernameAvailable && usernameValid) || (user.firstname !== firstname || user.lastname !== lastname || user.bio !== bio))) ? ' no-padding' : '')}
                                    onClick={this.cancelHandler}>
                                    Cancel
                                </div>}
                            </div>}
                            <div className="page-anchor log-out" onClick={this.logOutHandler}>
                                <div className="anchor-label color-red">Log Out</div>
                            </div>
                        </div>}
                        {Boolean(pageContent === 'session') && <React.Fragment>
                            <div className="menu-header">
                                <IconButton
                                    aria-label="Prev"
                                    aria-haspopup="true"
                                    onClick={this.onPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>Active Sessions</label>
                            </div>
                            {sessions && <div className="menu-content">
                                {Boolean(sessions.length > 0) && <Scrollbars
                                    autoHide={true}
                                >
                                    <div>
                                        {sessions.map((item, key) => {
                                            return (
                                                <div key={key} className="session-item">
                                                    {Boolean(this.currentAuthID === item.authid) &&
                                                    <div className="session-current">current</div>}
                                                    <div className="session-info">
                                                        <div className="session-row">
                                                            <div className="session-col">{`Client: ${(item.model || '').split(':-').join(' ')}`}</div>
                                                        </div>
                                                        <div
                                                            className="session-row">IP: {item.clientip} at {TimeUtility.dynamic(item.createdat)}</div>
                                                        <div className="session-row">
                                                            <div className="session-col">Last
                                                                active {TimeUtility.timeAgo(item.activeat)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="session-action">
                                                    <span className="action-terminate"
                                                          onClick={this.terminateSessionConfirmHandler.bind(this, item.authid)}>Terminate</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Scrollbars>}
                                {Boolean(sessions.length === 0) &&
                                <div className="session-placeholder">you have no active sessions</div>}
                            </div>}
                        </React.Fragment>}
                    </div>
                </div>
                <Menu
                    anchorEl={avatarMenuAnchorEl}
                    open={Boolean(avatarMenuAnchorEl)}
                    onClose={this.avatarMenuAnchorCloseHandler}
                    className="kk-context-menu"
                >
                    {this.avatarContextMenuItem()}
                </Menu>
                <OverlayDialog
                    open={debugModeOpen}
                    onClose={this.debugModeCloseHandler}
                    className="confirm-dialog"
                    disableBackdropClick={true}
                >
                    <div>
                        <DialogTitle>Debug Mode</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Set test url
                            </DialogContentText>
                            <TextField
                                autoFocus={true}
                                margin="dense"
                                label="Test Url"
                                type="text"
                                fullWidth={true}
                                value={this.state.debugModeUrl}
                                onChange={this.debugModeUrlChange}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.debugModeCloseHandler} color="secondary">
                                Cancel
                            </Button>
                            <Button onClick={this.debugModeApplyHandler} color="primary" autoFocus={true}>
                                Apply
                            </Button>
                        </DialogActions>
                    </div>
                </OverlayDialog>
                <OverlayDialog
                    open={confirmDialogOpen}
                    onClose={this.confirmDialogCloseHandler}
                    className="confirm-dialog"
                >
                    <DialogTitle>Terminate session?</DialogTitle>
                    <DialogActions>
                        <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                            Disagree
                        </Button>
                        <Button onClick={this.terminateSessionHandler} color="primary" autoFocus={true}>
                            Agree
                        </Button>
                    </DialogActions>
                </OverlayDialog>
            </div>
        );
    }

    /* Dark mode change handler */
    private nightModeHandler = (e: any) => {
        this.setState({
            selectedTheme: e.currentTarget.checked ? 'dark' : 'light',
        }, () => {
            this.applyTheme();
        });
    }

    /* Apply theme in both localStorage and DOM */
    private applyTheme() {
        const el = document.querySelector('html');
        if (!el) {
            return;
        }
        el.setAttribute('theme', this.state.selectedTheme);
        localStorage.setItem('river.theme.color', this.state.selectedTheme);
        this.broadcastEvent('Theme_Changed', null);
    }

    private handleNext = () => {
        this.setState(state => ({
            fontSize: state.fontSize + 1,
        }), () => {
            this.changeFontSize();
        });
    }

    private handleBack = () => {
        this.setState(state => ({
            fontSize: state.fontSize - 1,
        }), () => {
            this.changeFontSize();
        });
    }

    private changeFontSize() {
        const el = document.querySelector('html');
        if (!el) {
            return;
        }
        localStorage.setItem('river.theme.font', String(this.state.fontSize));
        el.setAttribute('font', String(this.state.fontSize));
        if (this.props.updateMessages) {
            this.props.updateMessages();
        }
    }

    private onPrevHandler = () => {
        this.setState({
            editProfile: false,
            editUsername: false,
            page: '1',
            pageContent: 'none',
        }, () => {
            this.dispatchSubPlaceChange();
        });
    }

    private themePageHandler = () => {
        this.setState({
            page: '2',
            pageContent: 'theme',
        }, () => {
            this.dispatchSubPlaceChange();
        });
    }

    private getUser() {
        this.userRepo.get(this.userId).then((res) => {
            this.setState({
                bio: res.bio || '',
                firstname: res.firstname || '',
                lastname: res.lastname || '',
                user: res,
                username: res.username || '',
            });
        });
    }

    private accountPageHandler = () => {
        this.getUser();
        this.setState({
            page: '2',
            pageContent: 'account',
        }, () => {
            this.dispatchSubPlaceChange();
        });
    }

    private sessionPageHandler = () => {
        this.getSessions();
        this.setState({
            page: '2',
            pageContent: 'session',
        }, () => {
            this.dispatchSubPlaceChange();
        });
    }

    private onEditProfileHandler = () => {
        this.setState({
            editProfile: true,
        });
    }

    private onEditUsernameHandler = () => {
        this.setState({
            editUsername: true,
            usernameAvailable: false,
            usernameValid: false,
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

    private onBioChangeHandler = (e: any) => {
        this.setState({
            bio: e.currentTarget.value,
        });
    }

    private onUsernameChangeHandler = (e: any) => {
        const username = e.currentTarget.value;
        if (username.length === 0) {
            this.setState({
                username,
                usernameAvailable: true,
                usernameValid: true,
            });
            return;
        }
        const reg = /^(?=.{2,32}$)[a-zA-Z0-9._]/;
        this.setState({
            usernameValid: reg.test(username),
        }, () => {
            if (this.state.usernameValid) {
                this.usernameCheckDebounce(username);
            }
        });
        this.setState({
            username,
        });
    }

    private checkUsername = (username: string) => {
        this.sdk.usernameAvailable(username).then((res) => {
            this.setState({
                usernameAvailable: res.result || false,
            });
        });
    }

    private selectThemeHandler = (id: string) => {
        this.setState({
            selectedTheme: id,
        }, () => {
            this.applyTheme();
        });
    }

    private selectBackgroundHandler = (id: string) => {
        this.setState({
            selectedBackground: id,
        }, () => {
            const el = document.querySelector('html');
            if (!el) {
                return;
            }
            localStorage.setItem('river.theme.bg', id);
            el.setAttribute('bg', id);
        });
    }

    private selectBubbleHandler = (id: string) => {
        this.setState({
            selectedBubble: id,
        }, () => {
            const el = document.querySelector('html');
            if (!el) {
                return;
            }
            localStorage.setItem('river.theme.bubble', id);
            el.setAttribute('bubble', id);
            if (this.props.updateMessages) {
                this.props.updateMessages();
            }
            this.userRepo.setBubbleMode(id);
            this.broadcastEvent('Theme_Changed', null);
        });
    }

    private confirmProfileChangesHandler = () => {
        const {firstname, lastname, bio, user} = this.state;
        if (!user) {
            return;
        }
        this.sdk.updateProfile(firstname, lastname, bio).then(() => {
            user.firstname = firstname;
            user.lastname = lastname;
            user.bio = bio;
            this.setState({
                bio: user.bio || '',
                editProfile: false,
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                user,
            });
            this.userRepo.importBulk(false, [user]);
        }).catch(() => {
            this.setState({
                bio: '',
                editProfile: false,
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                user,
            });
        });
    }

    private confirmUsernameChangeHandler = () => {
        const {username, usernameAvailable, usernameValid, user} = this.state;
        if (!user) {
            return;
        }
        if (!usernameAvailable || !usernameValid) {
            this.setState({
                editUsername: false,
                username: user.username || '',
            });
            return;
        }
        this.sdk.updateUsername(username).then((res) => {
            user.firstname = res.firstname;
            user.lastname = res.lastname;
            user.username = res.username;
            this.setState({
                editUsername: false,
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                user,
                username: user.username || '',
            });
            this.userRepo.importBulk(false, [user]);
        }).catch(() => {
            this.setState({
                editUsername: false,
                user,
                username: user.username || '',
            });
        });
    }

    /* Dispatch sub place change */
    private dispatchSubPlaceChange() {
        if (this.props.onSubPlaceChange) {
            this.props.onSubPlaceChange(this.state.pageContent);
        }
    }

    /* Cancel handler */
    private cancelHandler = () => {
        const {user} = this.state;
        if (!user) {
            return;
        }
        this.setState({
            editProfile: false,
            editUsername: false,
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            user,
            username: user.username || '',
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
            this.sdk.uploadProfilePicture(inputFile).then((res) => {
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

    /* Avatar menu anchor close handler */
    private avatarMenuAnchorCloseHandler = () => {
        this.setState({
            avatarMenuAnchorEl: null,
        });
    }

    /* Avatar menu anchor open handler */
    private avatarMenuAnchorOpenHandler = (e: any) => {
        this.setState({
            avatarMenuAnchorEl: e.currentTarget,
        });
    }

    /* Decides what content the participants' "more" menu must have */
    private avatarContextMenuItem() {
        const menuItems = [{
            cmd: 'show',
            title: 'Show Photo',
        }, {
            cmd: 'remove',
            title: 'Remove Photo',
        }, {
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
                this.sdk.removeProfilePicture().then(() => {
                    //
                });
                break;
            case 'change':
                this.openFileDialog();
                break;
        }
        this.avatarMenuAnchorCloseHandler();
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

    /* Version click handler */
    private versionClickHandler = () => {
        if (!this.versionClickTimeout) {
            this.versionClickTimeout = setTimeout(() => {
                clearTimeout(this.versionClickTimeout);
                this.versionClickTimeout = null;
                this.versionClickCounter = 0;
            }, 6000);
        }
        this.versionClickCounter++;
        if (this.versionClickCounter >= 10) {
            clearTimeout(this.versionClickTimeout);
            this.versionClickTimeout = null;
            this.versionClickCounter = 0;
            this.setState({
                debugModeOpen: true,
            });
            window.console.log('debug mode');
        }
    }

    /* Debug mode close handler */
    private debugModeCloseHandler = () => {
        this.setState({
            debugModeOpen: false,
        });
    }

    /* Debug mode apply handler */
    private debugModeApplyHandler = () => {
        localStorage.setItem('river.test_url', this.state.debugModeUrl);
        window.location.reload();
    }

    /* Debug mode url change handler */
    private debugModeUrlChange = (e: any) => {
        this.setState({
            debugModeUrl: e.currentTarget.value,
        });
    }

    /* Logout handler */
    private logOutHandler = () => {
        if (this.props.onAction) {
            this.props.onAction('logout');
        }
    }

    /* Get All Sessions */
    private getSessions() {
        this.sdk.sessionGetAll().then((res) => {
            this.setState({
                sessions: res.authorizationsList,
            });
        });
    }

    /* Open confirm dialog for terminate session by Id */
    private terminateSessionConfirmHandler(id: string) {
        this.setState({
            confirmDialogOpen: true,
            confirmDialogSelectedId: id
        });
    }

    /* Terminate session selected session */
    private terminateSessionHandler = () => {
        const {confirmDialogSelectedId} = this.state;
        if (confirmDialogSelectedId !== '') {
            this.sdk.sessionTerminate(confirmDialogSelectedId).then(() => {
                const {sessions} = this.state;
                const index = findIndex(sessions, {authid: confirmDialogSelectedId});
                if (sessions && index > -1) {
                    sessions.splice(index, 1);
                    this.setState({
                        sessions,
                    });
                }
            });
        }
        this.confirmDialogCloseHandler();
    }

    /* Confirm dialog close handler */
    private confirmDialogCloseHandler = () => {
        this.setState({
            confirmDialogOpen: false,
        });
    }

    /* Broadcast Global Event */
    private broadcastEvent(name: string, data: any) {
        this.broadcaster.publish(name, data);
    }
}

export default SettingMenu;
