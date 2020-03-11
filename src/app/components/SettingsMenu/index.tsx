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
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import {
    BookmarkRounded,
    Brightness2Rounded,
    ChatBubbleRounded,
    CheckRounded,
    ClearAllRounded,
    CloseRounded,
    CollectionsRounded,
    DataUsageRounded,
    DoneRounded,
    EditRounded,
    FormatColorFillRounded,
    FormatSizeRounded,
    KeyboardBackspaceRounded,
    LanguageRounded,
    LockRounded,
    MaximizeRounded,
    PaletteRounded,
    PhotoCameraRounded,
    LabelRounded,
    VerifiedUserRounded,
    BlockRounded,
    DeleteRounded,
    NotificationsRounded,
    GradientRounded,
} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import UserAvatar from '../UserAvatar';
import TextField from '@material-ui/core/TextField/TextField';
import UserRepo from '../../repository/user';
import SDK from '../../services/sdk';
import {cloneDeep, debounce, find, findIndex, isEqual} from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import {
    bgTypes,
    bubbles,
    C_CUSTOM_BG,
    gradients,
    privacyItems,
    privacyRuleItems,
    storageItems,
    themes
} from './vars/theme';
import {IUser} from '../../repository/user/interface';
import {Link} from 'react-router-dom';
import FileManager, {IFileProgress} from '../../services/sdk/fileManager';
import UniqueId from '../../services/uniqueId';
import ProgressBroadcaster from '../../services/progress';
import RiverTime from '../../services/utilities/river_time';
import {
    InputFile,
    InputPeer,
    InputUser,
    PeerType,
    PrivacyKey,
    PrivacyRule,
    PrivacyType
} from '../../services/sdk/messages/chat.core.types_pb';
import DocumentViewerService, {IDocument} from '../../services/documentViewerService';
import Menu from '@material-ui/core/Menu/Menu';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import AvatarCropper from '../AvatarCropper';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import OverlayDialog from '@material-ui/core/Dialog/Dialog';
import Broadcaster from '../../services/broadcaster';
import {AccountAuthorization, AccountPrivacyRules} from '../../services/sdk/messages/chat.api.accounts_pb';
import TimeUtility from '../../services/utilities/time';
import SettingsBackgroundModal, {ICustomBackground} from '../SettingsBackgroundModal';
import FileRepo from '../../repository/file';
import BackgroundService from '../../services/backgroundService';
import Radio from '@material-ui/core/Radio';
import SettingsConfigManager, {IDownloadSettings, INotificationSettings} from '../../services/settingsConfigManager';
import SettingsStorageUsageModal from '../SettingsStorageUsageModal';
import {Loading} from '../Loading';
import i18n from '../../services/i18n';
import Slider from "@material-ui/lab/Slider";
import UserName from "../UserName";
import ElectronService from "../../services/electron";
import UserListDialog from "../UserListDialog";
import {IInputPeer} from "../SearchList";
import {localize} from "../../services/utilities/localize";
import DevTools from "../DevTools";
import ChangePhoneModal from "../ChangePhoneModal";
import TwoStepVerificationModal from "../TwoStepVerificationModal";
import DialogSkeleton from "../DialogSkeleton";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList, ListOnItemsRenderedProps} from "react-window";
import CircularProgress from "@material-ui/core/CircularProgress";
import getScrollbarWidth from "../../services/utilities/scrollbar_width";
import IsMobile from "../../services/isMobile";
import AvatarService from "../../services/avatarService";

import './style.scss';
import 'react-image-crop/dist/ReactCrop.css';

export const ThemeChanged = 'Theme_Changed';

const C_BLOCKED_USER_LIST_LIMIT = 50;

const listStyle: React.CSSProperties = {
    overflowX: 'visible',
    overflowY: 'visible',
};

export const C_VERSION = '0.30.12';
export const C_CUSTOM_BG_ID = 'river_custom_bg';
export const C_AVATAR_SIZE = 640;

export const languageList = [{
    dir: 'ltr',
    label: 'English',
    lang: 'en',
    title: 'English'
}, {
    dir: 'rtl',
    label: 'Farsi',
    lang: 'fa',
    title: 'فارسی'
}];

const privacyDefault: { [key: string]: IPrivacy } = {
    'privacy_call': {
        excludeIds: [],
        includeIds: [],
        loading: false,
        mode: 'everyone',
    },
    'privacy_chat_invite': {
        excludeIds: [],
        includeIds: [],
        loading: false,
        mode: 'everyone',
    },
    'privacy_forwarded_message': {
        excludeIds: [],
        includeIds: [],
        loading: false,
        mode: 'everyone',
    },
    'privacy_last_seen': {
        excludeIds: [],
        includeIds: [],
        loading: false,
        mode: 'everyone',
    },
    'privacy_phone_number': {
        excludeIds: [],
        includeIds: [],
        loading: false,
        mode: 'everyone',
    },
    'privacy_profile_photo': {
        excludeIds: [],
        includeIds: [],
        loading: false,
        mode: 'everyone',
    },
};

interface IPrivacy {
    excludeIds: string[];
    includeIds: string[];
    loading: boolean;
    mode: 'everyone' | 'my_contacts' | 'no_one';
}

interface IProps {
    onClose?: (e: any) => void;
    onAction?: (cmd: 'logout' | 'count_dialog') => void;
    onError?: (message: string) => void;
    onUpdateMessages?: (keep?: boolean) => void;
    onReloadDialog?: (peerIds: string[]) => void;
    onSubPlaceChange?: (sub: string, subChild: string) => void;
}

interface IState {
    avatarMenuAnchorEl: any;
    bio: string;
    confirmDialogOpen: boolean;
    confirmDialogSelectedId: string;
    contactList: IUser[];
    customBackgroundSrc?: string;
    editProfile: boolean;
    editUsername: boolean;
    firstname: string;
    fontSize: number;
    lastname: string;
    loading: boolean;
    notificationValues: INotificationSettings;
    page: string;
    pageContent: string;
    pageSubContent: string;
    phone: string;
    privacy: { [key: string]: IPrivacy };
    profileCropperOpen: boolean;
    profilePictureCrop: any;
    profilePictureFile?: string;
    riverGroupName: string;
    selectedBackground: string;
    selectedBgType: string;
    selectedBubble: string;
    selectedCustomBackground: string;
    selectedCustomBackgroundBlur: number;
    selectedGradient: string;
    selectedLanguage: string;
    selectedTheme: string;
    sessions?: AccountAuthorization.AsObject[];
    storageValues: IDownloadSettings;
    uploadingPhoto: boolean;
    user: IUser | null;
    username: string;
    usernameAvailable: boolean;
    usernameValid: boolean;
    passwordMode: number;
}

class SettingsMenu extends React.Component<IProps, IState> {
    private userRepo: UserRepo;
    private sdk: SDK;
    private readonly userId: string;
    private readonly currentAuthID: string;
    private readonly usernameCheckDebounce: any;
    private fileManager: FileManager;
    private fileRepo: FileRepo;
    private progressBroadcaster: ProgressBroadcaster;
    private riverTime: RiverTime;
    private profileTempPhoto: string = '';
    private circleProgressRef: any = null;
    private fileId: string = '';
    private cropperRef: AvatarCropper | undefined;
    private documentViewerService: DocumentViewerService;
    private versionClickTimeout: any = null;
    private versionClickCounter: number = 0;
    private broadcaster: Broadcaster;
    private settingsBackgroundModalRef: SettingsBackgroundModal | undefined;
    private backgroundService: BackgroundService;
    private settingsConfigManger: SettingsConfigManager;
    private settingsStorageUsageModalRef: SettingsStorageUsageModal | undefined;
    private changePhoneModalRef: ChangePhoneModal | undefined;
    private twoStepVerificationModalRef: TwoStepVerificationModal | undefined;
    private devToolsRef: DevTools | undefined;
    private electronService: ElectronService;
    private userListDialogRef: UserListDialog | undefined;
    private lastPrivacy: { [key: string]: IPrivacy } = cloneDeep(privacyDefault);
    private readonly isMac: boolean = navigator.platform.indexOf('Mac') > -1;
    private blockUserListRef: FixedSizeList | undefined;
    private readonly rtl: boolean = false;
    private readonly hasScrollbar: boolean = false;
    private readonly isMobile: boolean = false;
    private contactHasMore: boolean = false;
    private readonly switchClasses: any = {};
    private avatarService: AvatarService;

    constructor(props: IProps) {
        super(props);

        this.sdk = SDK.getInstance();
        this.userId = this.sdk.getConnInfo().UserID || '';

        this.state = {
            avatarMenuAnchorEl: null,
            bio: '',
            confirmDialogOpen: false,
            confirmDialogSelectedId: '',
            contactList: [],
            editProfile: false,
            editUsername: false,
            firstname: '',
            fontSize: 2,
            lastname: '',
            loading: false,
            notificationValues: {
                count_muted: true,
            },
            page: '1',
            pageContent: 'none',
            pageSubContent: 'none',
            passwordMode: 0,
            phone: this.sdk.getConnInfo().Phone || '',
            privacy: cloneDeep(privacyDefault),
            profileCropperOpen: false,
            profilePictureCrop: {
                aspect: 1,
                width: C_AVATAR_SIZE,
                x: 0,
                y: 0,
            },
            riverGroupName: '',
            selectedBackground: '-1',
            selectedBgType: '0',
            selectedBubble: '1',
            selectedCustomBackground: localStorage.getItem('river.theme.bg.pic') || '-1',
            selectedCustomBackgroundBlur: parseInt(localStorage.getItem('river.theme.bg.blur') || '0', 10),
            selectedGradient: localStorage.getItem('river.theme.gradient') || '0',
            selectedLanguage: localStorage.getItem('river.lang') || 'en',
            selectedTheme: localStorage.getItem('river.theme.color') || 'light',
            storageValues: {
                auto_save_files: false,
                chat_files: false,
                chat_photos: false,
                chat_videos: false,
                chat_voices: false,
                download_all: false,
                group_files: false,
                group_photos: false,
                group_videos: false,
                group_voices: false,
            },
            uploadingPhoto: false,
            user: null,
            username: '',
            usernameAvailable: false,
            usernameValid: false,
        };
        this.userRepo = UserRepo.getInstance();
        this.usernameCheckDebounce = debounce(this.checkUsername, 256);
        this.fileManager = FileManager.getInstance();
        this.fileRepo = FileRepo.getInstance();
        this.progressBroadcaster = ProgressBroadcaster.getInstance();
        this.riverTime = RiverTime.getInstance();

        this.documentViewerService = DocumentViewerService.getInstance();
        this.broadcaster = Broadcaster.getInstance();
        this.backgroundService = BackgroundService.getInstance();
        this.settingsConfigManger = SettingsConfigManager.getInstance();

        this.currentAuthID = this.sdk.getConnInfo().AuthID;

        this.electronService = ElectronService.getInstance();
        this.hasScrollbar = getScrollbarWidth() > 0;
        this.rtl = localStorage.getItem('river.lang.dir') === 'rtl';
        this.isMobile = this.isMobile = IsMobile.isAny();
        this.avatarService = AvatarService.getInstance();

        this.switchClasses = {
            checked: 'setting-switch-checked',
            root: 'setting-switch',
            switchBase: 'setting-switch-base',
            thumb: 'setting-switch-thumb',
            track: 'setting-switch-track',
        };
    }

    public componentDidMount() {
        const bg = localStorage.getItem('river.theme.bg') || '-1';
        let bgType: string = '0';
        if (bg === C_CUSTOM_BG) {
            bgType = '1';
        } else if (bg === '0') {
            bgType = '0';
        } else {
            bgType = '2';
        }
        this.setState({
            fontSize: parseInt(localStorage.getItem('river.theme.font') || '2', 10),
            notificationValues: this.settingsConfigManger.getNotificationSettings(),
            selectedBackground: bg,
            selectedBgType: bgType,
            selectedBubble: localStorage.getItem('river.theme.bubble') || '1',
            selectedTheme: localStorage.getItem('river.theme.color') || 'light',
            storageValues: this.settingsConfigManger.getDownloadSettings(),
        });
        this.backgroundService.getBackground(C_CUSTOM_BG_ID).then((res) => {
            if (res) {
                this.setState({
                    customBackgroundSrc: URL.createObjectURL(res),
                });
            }
        });
        this.sdk.systemGetInfo(true).then((res) => {
            this.setState({
                riverGroupName: res.workgroupname || '',
            });
        });
    }

    public navigateToPage(pageContent: string, pageSubContent: string) {
        this.setState({
            page: pageContent === 'none' ? '1' : (pageSubContent !== 'none' ? '3' : '2'),
            pageContent,
            pageSubContent,
        }, () => {
            this.dispatchSubPlaceChange();
        });
        if (pageContent === 'account') {
            this.getUser();
        }
        if (pageSubContent === 'session') {
            this.getSessions();
        }
        if (this.state.pageSubContent.indexOf('privacy_') > -1) {
            this.checkPrivacyDiff();
        }
    }

    public applyChanges() {
        if (this.state.pageSubContent.indexOf('privacy_') > -1) {
            this.checkPrivacyDiff();
        }
    }

    public render() {
        const {
            avatarMenuAnchorEl, page, pageContent, pageSubContent, user, editProfile, editUsername, bio, firstname,
            lastname, phone, username, usernameAvailable, usernameValid, uploadingPhoto, sessions,
            confirmDialogOpen, customBackgroundSrc, loading, privacy, passwordMode,
        } = this.state;
        return (
            <div className="setting-menu">
                <DevTools ref={this.devToolsRefHandler}/>
                <AvatarCropper ref={this.cropperRefHandler} onImageReady={this.croppedImageReadyHandler}
                               width={C_AVATAR_SIZE}/>
                <SettingsBackgroundModal ref={this.settingsBackgroundModalRefHandler}
                                         dark={Boolean(this.state.selectedTheme !== 'light')}
                                         defId={this.state.selectedCustomBackground}
                                         defBlur={this.state.selectedCustomBackgroundBlur}
                                         onDone={this.settingsBackgroundModalDoneHandler}
                                         onPatternSelected={this.selectBackgroundHandler}/>
                <SettingsStorageUsageModal ref={this.settingsStorageUsageModalRefHandler}
                                           onDone={this.props.onReloadDialog}/>
                <ChangePhoneModal ref={this.changePhoneModalRefHandler} onError={this.props.onError}
                                  onDone={this.changePhoneModalDoneHandler}/>
                <TwoStepVerificationModal ref={this.twoStepVerificationModalRefHandler} onError={this.props.onError}
                                          onDone={this.twoStepVerificationModalDoneHandler}/>
                <UserListDialog ref={this.userListDialogRefHandler} onDone={this.userListDialogDoneHandler}/>
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
                            <label>{i18n.t('settings.settings')}</label>
                        </div>
                        <div className="menu-content with-footer">
                            <Scrollbars
                                autoHide={true}
                            >
                                <div className="padding-side">
                                    <div className="account-summary">
                                        <div className="account-profile"
                                             onClick={this.selectPageHandler('account')}>
                                            <UserAvatar className="avatar" id={this.userId} noDetail={true}
                                                        forceReload={true}/>
                                        </div>
                                        <div className="account-info"
                                             onClick={this.selectPageHandler('account')}>
                                            <UserName className="username" id={this.userId} noDetail={true}/>
                                            <div className="account-phone">{phone}</div>
                                        </div>
                                    </div>
                                    <div className="page-anchor">
                                        <Link to={`/chat/${this.userId}`}>
                                            <div className="icon color-saved-messages">
                                                <BookmarkRounded/>
                                            </div>
                                            <div className="anchor-label">{i18n.t('general.saved_messages')}</div>
                                        </Link>
                                    </div>
                                    <div className="page-anchor" onClick={this.selectPageHandler('storage')}>
                                        <div className="icon color-data">
                                            <DataUsageRounded/>
                                        </div>
                                        <div className="anchor-label">{i18n.t('settings.data_and_storage')}</div>
                                    </div>
                                    <div className="page-anchor" onClick={this.selectPageHandler('privacy')}>
                                        <div className="icon color-privacy">
                                            <LockRounded/>
                                        </div>
                                        <div className="anchor-label">{i18n.t('settings.privacy_and_security')}</div>
                                    </div>
                                    <div className="page-anchor" onClick={this.selectPageHandler('label')}>
                                        <div className="icon color-label">
                                            <LabelRounded/>
                                        </div>
                                        <div className="anchor-label">{i18n.t('settings.label')}</div>
                                    </div>
                                    <div className="page-anchor" onClick={this.selectPageHandler('theme')}>
                                        <div className="icon color-theme">
                                            <PaletteRounded/>
                                        </div>
                                        <div className="anchor-label">{i18n.t('settings.theme')}</div>
                                    </div>
                                    <div className="page-anchor" onClick={this.selectPageHandler('notification')}>
                                        <div className="icon color-notification">
                                            <NotificationsRounded/>
                                        </div>
                                        <div className="anchor-label">{i18n.t('settings.notification')}</div>
                                    </div>
                                    <div className="page-anchor"
                                         onClick={this.selectPageHandler('language')}>
                                        <div className="icon color-language">
                                            <LanguageRounded/>
                                        </div>
                                        <div className="anchor-label">{i18n.t('settings.language')}</div>
                                    </div>
                                    <div className="page-anchor">
                                        <div className="icon color-night-mode">
                                            <Brightness2Rounded/>
                                        </div>
                                        <div className="anchor-label">{i18n.t('settings.night_mode')}</div>
                                        <div className="setting-switch-label">
                                            <Switch
                                                checked={Boolean(this.state.selectedTheme !== 'light')}
                                                color="default"
                                                onChange={this.nightModeHandler}
                                                classes={this.switchClasses}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Scrollbars>
                        </div>
                        <div className="version" onClick={this.versionClickHandler}>
                            v{C_VERSION}
                            <span className="group-name">{this.state.riverGroupName}</span>
                        </div>
                    </div>
                    <div className="page page-2">
                        {Boolean(pageContent === 'theme') && <React.Fragment>
                            <div className="menu-header">
                                <IconButton
                                    onClick={this.onPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>{i18n.t('settings.theme')}</label>
                            </div>
                            <div className="menu-content">
                                <Scrollbars
                                    autoHide={true}
                                >
                                    <div className="padding-side">
                                        <div className="page-content" style={{overflow: 'hidden'}}>
                                            <div className="page-anchor">
                                                <div className="icon color-font-size">
                                                    <FormatSizeRounded/>
                                                </div>
                                                <div className="anchor-label">{i18n.t('settings.font_size')}</div>
                                            </div>
                                            <div className="page-content-inner">
                                                <div className="font-size-container">
                                                    <Button size="small" onClick={this.increaseFontSizeHandler}
                                                            disabled={this.state.fontSize === 5}>
                                                        <KeyboardArrowRight/>
                                                    </Button>
                                                    <Slider
                                                        value={this.state.fontSize}
                                                        min={0}
                                                        max={5}
                                                        step={1}
                                                        onChange={this.fontSizeChangeHandler}
                                                        className="slider"
                                                    />
                                                    <Button size="small" onClick={this.decreaseFontSizeHandler}
                                                            disabled={this.state.fontSize === 0}>
                                                        <KeyboardArrowLeft/>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        {ElectronService.isElectron() && !this.isMac &&
                                        <div className="page-anchor" onClick={this.toggleMenuBarHandler}>
                                            <div className="icon color-menu-bar">
                                                <MaximizeRounded/>
                                            </div>
                                            <div className="anchor-label">{i18n.t('settings.toggle_menu_bar')}</div>
                                        </div>}
                                        <div className="page-content">
                                            <div className="page-anchor">
                                                <div className="icon color-theme-type">
                                                    <FormatColorFillRounded/>
                                                </div>
                                                <div className="anchor-label">{i18n.t('settings.theme')}</div>
                                            </div>
                                            <div className="page-content-inner">
                                                <div
                                                    className="theme-container"
                                                >
                                                    {themes.map((theme, index) => (
                                                        <div key={index}
                                                             className={'radio-item ' + (this.state.selectedTheme === theme.id ? 'selected' : '')}
                                                             onClick={this.selectThemeHandler(theme.id)}
                                                        >
                                                            <div className="radio-label">
                                                                <Radio color="primary"
                                                                       className={'radio ' + (this.state.selectedTheme === theme.id ? 'checked' : '')}
                                                                       checked={(this.state.selectedTheme === theme.id)}/>
                                                                <div className="radio-title">{i18n.t(theme.title)}</div>
                                                            </div>
                                                            <div
                                                                className={`item theme-${theme.id} gradient-${this.state.selectedGradient} bubble-${this.state.selectedBubble} bg-${this.state.selectedBackground}`}/>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="page-content">
                                            <div className="page-anchor">
                                                <div className="icon color-bubble">
                                                    <ChatBubbleRounded/>
                                                </div>
                                                <div className="anchor-label">{i18n.t('settings.bubble')}</div>
                                            </div>
                                            <div className="page-content-inner">
                                                <div
                                                    className="theme-container"
                                                >
                                                    {bubbles.map((bubble, index) => (
                                                        <div key={index}
                                                             className={'radio-item ' + (this.state.selectedBubble === bubble.id ? 'selected' : '')}
                                                             onClick={this.selectBubbleHandler(bubble.id)}
                                                        >
                                                            <div className="radio-label">
                                                                <Radio color="primary"
                                                                       className={'radio ' + (this.state.selectedBubble === bubble.id ? 'checked' : '')}
                                                                       checked={(this.state.selectedBubble === bubble.id)}/>
                                                                <div
                                                                    className="radio-title">{i18n.t(bubble.title)}</div>
                                                            </div>
                                                            <div
                                                                className={`item bubble-${bubble.id} gradient-${this.state.selectedGradient} theme-${this.state.selectedTheme} bg-${this.state.selectedBackground}`}/>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="page-content">
                                            <div className="page-anchor">
                                                <div className="icon color-background">
                                                    <CollectionsRounded/>
                                                </div>
                                                <div className="anchor-label">{i18n.t('settings.background')}</div>
                                            </div>
                                            <div className="page-content-inner">
                                                <div
                                                    className="theme-container"
                                                >
                                                    {bgTypes.map((types, index) => (
                                                        <div key={index}
                                                             className={'radio-item ' + (this.state.selectedBgType === types.id ? 'selected' : '')}
                                                             onClick={this.selectBgTypeHandler(types.id)}
                                                        >
                                                            <div className="radio-label">
                                                                <Radio color="primary"
                                                                       className={'radio ' + (this.state.selectedBgType === types.id ? 'checked' : '')}
                                                                       checked={(this.state.selectedBgType === types.id)}/>
                                                                <div className="radio-title">{i18n.t(types.title)}</div>
                                                            </div>
                                                            {Boolean(types.id !== '1') && <div
                                                                className={`item bubble-${this.state.selectedBubble} gradient-${this.state.selectedGradient}  theme-${this.state.selectedTheme} bg-${this.state.selectedBackground}`}/>}
                                                            {Boolean(types.id === '1') && <div
                                                                className={`item bubble-${this.state.selectedBubble} gradient-${this.state.selectedGradient} theme-${this.state.selectedTheme} bg-${this.state.selectedBackground}`}>
                                                                {customBackgroundSrc &&
                                                                <img src={customBackgroundSrc} alt="custom-bg"/>}
                                                            </div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="page-content">
                                            <div className="page-anchor">
                                                <div className="icon color-gradient">
                                                    <GradientRounded/>
                                                </div>
                                                <div className="anchor-label">{i18n.t('settings.gradient')}</div>
                                            </div>
                                            <div className="page-content-inner">
                                                <div
                                                    className="theme-container"
                                                >
                                                    {gradients.map((gradient, index) => (
                                                        <div key={index}
                                                             className={'radio-item ' + (this.state.selectedGradient === gradient.id ? 'selected' : '')}
                                                             onClick={this.selectGradientHandler(gradient.id)}
                                                        >
                                                            <div className="radio-label">
                                                                <Radio color="primary"
                                                                       className={'radio ' + (this.state.selectedGradient === gradient.id ? 'checked' : '')}
                                                                       checked={(this.state.selectedGradient === gradient.id)}/>
                                                                <div
                                                                    className="radio-title">{i18n.t(gradient.title)}</div>
                                                            </div>
                                                            <div
                                                                className={`item gradient-${gradient.id} bubble-${this.state.selectedBubble} theme-${this.state.selectedTheme} bg-${this.state.selectedBackground}`}/>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Scrollbars>
                            </div>
                        </React.Fragment>}
                        {Boolean(pageContent === 'account') && <React.Fragment>
                            <div className="menu-header">
                                <IconButton
                                    onClick={this.onPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>{i18n.t('settings.account')}</label>
                            </div>
                            <div className="menu-content">
                                {user &&
                                <Scrollbars
                                    autoHide={true}
                                >
                                    <div className="info">
                                        <div className="avatar" onClick={this.avatarMenuAnchorOpenHandler}>
                                            {!uploadingPhoto &&
                                            <UserAvatar id={user.id || ''} noDetail={true} forceReload={true}/>}
                                            {uploadingPhoto &&
                                            <img src={this.profileTempPhoto} className="avatar-image" alt="avatar"/>}
                                            <div className={'overlay ' + (uploadingPhoto ? 'show' : '')}>
                                                {!uploadingPhoto && <React.Fragment>
                                                    <PhotoCameraRounded/>
                                                    <div className="text">
                                                        {i18n.t('peer_info.CHANGE')}
                                                        <br/>
                                                        {i18n.t('peer_info.PROFILE')}
                                                        <br/>
                                                        {i18n.t('peer_info.PHOTO')}
                                                    </div>
                                                </React.Fragment>}
                                                {uploadingPhoto &&
                                                <div className="progress-action">
                                                    <div className="progress">
                                                        <svg viewBox="0 0 32 32">
                                                            <circle ref={this.progressRefHandler} r="14" cx="16"
                                                                    cy="16"/>
                                                        </svg>
                                                    </div>
                                                    <CloseRounded className="action"
                                                                  onClick={this.cancelFileHandler}/>
                                                </div>}
                                            </div>
                                        </div>
                                        <div className="line">
                                            {!editProfile && <div className="form-control">
                                                <label>{i18n.t('general.first_name')}</label>
                                                <div className="inner">{user.firstname}</div>
                                                <div className="action">
                                                    {!editUsername && <IconButton
                                                        aria-label="Edit firstname"
                                                        onClick={this.editProfileHandler}
                                                    >
                                                        <EditRounded/>
                                                    </IconButton>}
                                                </div>
                                            </div>}
                                            {editProfile &&
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
                                            {!editProfile && <div className="form-control">
                                                <label>{i18n.t('general.last_name')}</label>
                                                <div className="inner">{user.lastname}</div>
                                                <div className="action">
                                                    {!editUsername && <IconButton
                                                        onClick={this.editProfileHandler}
                                                    >
                                                        <EditRounded/>
                                                    </IconButton>}
                                                </div>
                                            </div>}
                                            {editProfile &&
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
                                        </div>
                                        <div className="line">
                                            {!editProfile && <div className="form-control">
                                                <label>{i18n.t('general.bio')}</label>
                                                <div className="inner">{user.bio}</div>
                                                <div className="action">
                                                    {!editUsername && <IconButton
                                                        onClick={this.editProfileHandler}
                                                    >
                                                        <EditRounded/>
                                                    </IconButton>}
                                                </div>
                                            </div>}
                                            {editProfile &&
                                            <TextField
                                                label={i18n.t('general.bio')}
                                                fullWidth={true}
                                                inputProps={{
                                                    maxLength: 70,
                                                }}
                                                value={bio}
                                                multiline={true}
                                                rowsMax={3}
                                                className="input-edit"
                                                onChange={this.bioChangeHandler}
                                            />}
                                        </div>
                                        <div className="line">
                                            {!editUsername && <div className="form-control">
                                                <label>{i18n.t('general.username')}</label>
                                                <div className="inner">{user.username}</div>
                                                <div className="action">
                                                    {!editProfile && <IconButton
                                                        onClick={this.editUsernameHandler}
                                                    >
                                                        <EditRounded/>
                                                    </IconButton>}
                                                </div>
                                            </div>}
                                            {editUsername &&
                                            <TextField
                                                label={i18n.t('general.username')}
                                                fullWidth={true}
                                                inputProps={{
                                                    maxLength: 32,
                                                }}
                                                value={username}
                                                className="input-edit"
                                                onChange={this.usernameChangeHandler}
                                                error={!usernameAvailable || !usernameValid}
                                                helperText={!usernameAvailable ? 'Username is not available' : (!usernameValid ? 'Username is not valid' : '')}
                                            />}
                                        </div>
                                        <div className="line">
                                            <div className="form-control pad">
                                                <label>{i18n.t('general.phone')}</label>
                                                <div className="inner">{phone}</div>
                                                <div className="action">
                                                    <IconButton
                                                        onClick={this.editPhoneHandler}
                                                    >
                                                        <EditRounded/>
                                                    </IconButton>
                                                </div>
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
                                            {i18n.t('general.cancel')}
                                        </div>}
                                        <div className="page-anchor log-out" onClick={this.logOutHandler}>
                                            <Button color="secondary" fullWidth={true}>
                                                {i18n.t('settings.log_out')}
                                            </Button>
                                        </div>
                                    </div>
                                </Scrollbars>}
                            </div>
                        </React.Fragment>}
                        {Boolean(pageContent === 'privacy') && <React.Fragment>
                            <div className="menu-header">
                                <IconButton
                                    onClick={this.onPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>{i18n.t('settings.privacy_and_security')}</label>
                            </div>
                            <div className="menu-content">
                                <Scrollbars
                                    autoHide={true}
                                >
                                    <div>
                                        <div
                                            className="sub-page-header-alt">{i18n.t('settings.security')}</div>
                                        <div className="page-anchor anchor-padding-side"
                                             onClick={this.selectSubPageHandler('session')}>
                                            <div className="icon color-session">
                                                <ClearAllRounded/>
                                            </div>
                                            <div className="anchor-label">{i18n.t('settings.active_sessions')}</div>
                                        </div>
                                        <div className="page-anchor anchor-padding-side"
                                             onClick={this.selectSubPageHandler('2fa')}>
                                            <div className="icon color-2fa">
                                                <VerifiedUserRounded/>
                                            </div>
                                            <div
                                                className="anchor-label">{i18n.t('settings.two_step_verification')}</div>
                                        </div>
                                        <div
                                            className="sub-page-header-alt">{i18n.t('settings.privacy')}</div>
                                        <div className="page-anchor anchor-padding-side"
                                             onClick={this.selectSubPageHandler('block')}>
                                            <div className="icon color-blocked">
                                                <BlockRounded/>
                                            </div>
                                            <div
                                                className="anchor-label">{i18n.t('settings.blocked_users')}</div>
                                        </div>
                                        {privacyItems.map((item) => {
                                            return (
                                                <div key={item.id} className="page-anchor anchor-padding-side"
                                                     onClick={this.selectSubPageHandler(item.id)}>
                                                    <div className="icon color-theme-type" style={{
                                                        backgroundColor: item.color,
                                                    }}>
                                                        {item.icon}
                                                    </div>
                                                    <div
                                                        className="anchor-label anchor-label-privacy">
                                                        <span className="anchor-label-title">{i18n.t(item.title)}</span>
                                                        <span className="anchor-label-status"
                                                        >{(!privacy.hasOwnProperty(item.id) || privacy[item.id].loading) ? i18n.t('general.loading') : this.getPrivacyModeTitle(privacy[item.id].mode)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Scrollbars>
                            </div>
                        </React.Fragment>}
                        {Boolean(pageContent === 'storage') && <React.Fragment>
                            <div className="menu-header">
                                <IconButton
                                    onClick={this.onPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>{i18n.t('settings.data_and_storage')}</label>
                            </div>
                            <div className="menu-content">
                                <Scrollbars autoHide={true}>
                                    <div>
                                        {storageItems.map((item) => {
                                            if (item.type === 'item') {
                                                return (
                                                    <div key={item.id}
                                                         className={'switch-item ' + (item.className || '')}>
                                                        <div className="switch-label">{i18n.t(item.title)}</div>
                                                        <div className="switch">
                                                            <Switch
                                                                checked={Boolean(this.state.storageValues[item.id] || false)}
                                                                color="default"
                                                                onChange={this.storageToggleHandler(item.id)}
                                                                classes={this.switchClasses}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            } else if (item.type === 'header') {
                                                return (
                                                    <div key={item.id}
                                                         className={'sub-page-header ' + (item.className || '')}
                                                    >{i18n.t(item.title)}</div>
                                                );
                                            } else {
                                                return '';
                                            }
                                        })}
                                    </div>
                                    <div className="settings-btn"
                                         onClick={this.storageUsageHandler}>{i18n.t('settings.storage_usage')}</div>
                                </Scrollbars>
                            </div>
                        </React.Fragment>}
                        {Boolean(pageContent === 'language') && <React.Fragment>
                            <div className="menu-header">
                                <IconButton
                                    onClick={this.onPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>{i18n.t('settings.language')}</label>
                            </div>
                            <div className="menu-content">
                                <Scrollbars
                                    autoHide={true}
                                >
                                    <div className="info language-list">
                                        {languageList.map((item, key) => {
                                            return (<div key={key} className="language-item"
                                                         onClick={this.changeLanguage(item.lang)}>
                                                <div className="language-label">{item.title}</div>
                                                <div className="check">
                                                    {item.lang === this.state.selectedLanguage && <DoneRounded/>}
                                                </div>
                                            </div>);
                                        })}
                                    </div>
                                </Scrollbars>
                            </div>
                        </React.Fragment>}
                        {Boolean(pageContent === 'notification') && <React.Fragment>
                            <div className="menu-header">
                                <IconButton
                                    onClick={this.onPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>{i18n.t('settings.notification')}</label>
                            </div>
                            <div className="menu-content">
                                <div
                                    className="sub-page-header-alt">{i18n.t('settings.badge_counter')}</div>
                                <div className="switch-item with-border">
                                    <div
                                        className="switch-label">{i18n.t('settings.include_muted')}</div>
                                    <div className="switch">
                                        <Switch
                                            checked={this.state.notificationValues.count_muted}
                                            color="default"
                                            onChange={this.notificationMuteCountToggleHandler}
                                            classes={this.switchClasses}
                                        />
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>}
                    </div>
                    <div className="page page-3">
                        {Boolean(pageSubContent === 'session') && <React.Fragment>
                            <div className="menu-header">
                                <IconButton
                                    onClick={this.onSubPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>{i18n.t('settings.active_sessions')}</label>
                            </div>
                            {sessions && <div className="menu-content">
                                {Boolean(sessions.length > 0 && !loading) && <Scrollbars
                                    autoHide={true}
                                >
                                    <div>
                                        {sessions.map((item, key) => {
                                            // @ts-ignore
                                            if (item.type === 'terminate_all') {
                                                if (sessions.length > 2) {
                                                    return (
                                                        <div key={key} className="session-item terminate-all">
                                                            <span
                                                                onClick={this.terminateSessionConfirmHandler('0')}>{i18n.t('settings.terminate_all_other_sessions')}</span>
                                                        </div>
                                                    );
                                                } else {
                                                    return '';
                                                }
                                            } else {
                                                return (
                                                    <div key={key} className="session-item">
                                                        {Boolean(this.currentAuthID === item.authid) &&
                                                        <div
                                                            className="session-current">{i18n.t('settings.current')}</div>}
                                                        <div className="session-info">
                                                            <div className="session-row">
                                                                <div
                                                                    className="session-col">{`Client: ${(item.model || '').split(':-').join(' ')}`}</div>
                                                            </div>
                                                            <div
                                                                className="session-row">
                                                                <div
                                                                    className="session-col">{i18n.tf('settings.ip_at', [item.clientip || '', TimeUtility.dynamic(item.createdat)])}</div>
                                                            </div>
                                                            <div className="session-row">
                                                                <div
                                                                    className="session-col">{this.currentAuthID === item.authid ? i18n.t('status.online') : i18n.tf('settings.last_active', TimeUtility.timeAgo(item.lastaccess))}</div>
                                                            </div>
                                                        </div>
                                                        <div className="session-action">
                                                            <span className="action-terminate"
                                                                  onClick={this.terminateSessionConfirmHandler(item.authid)}>{i18n.t('settings.terminate')}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </Scrollbars>}
                                {Boolean(sessions.length === 0) &&
                                <div
                                    className="session-placeholder">{i18n.t('settings.you_have_no_active_sessions')}</div>}
                            </div>}
                            {loading && <Loading/>}
                        </React.Fragment>}
                        {pageSubContent.indexOf('privacy_') > -1 && privacyItems.filter(o => o.id === pageSubContent).map((item) => {
                            return (
                                <React.Fragment key={item.id}>
                                    <div className="menu-header">
                                        <IconButton
                                            onClick={this.onSubPrevHandler}
                                        >
                                            <KeyboardBackspaceRounded/>
                                        </IconButton>
                                        <label>{i18n.t(`settings.${item.id}`)}</label>
                                    </div>
                                    <div
                                        className="sub-page-header-alt header-column">
                                        <div className="header-label">{i18n.t(item.title)}</div>
                                        <div className="header-hint">{i18n.t(item.hint)}</div>
                                    </div>
                                    <div className="radio-item">
                                        {privacyRuleItems.map((prItem) => {
                                            return (
                                                <div
                                                    key={prItem.id}
                                                    className="pr-radio-wrapper"
                                                >
                                                    <Radio
                                                        checked={prItem.id === privacy[item.id].mode}
                                                        value={prItem.id}
                                                        color="primary"
                                                        className="pr-radio"
                                                        classes={{
                                                            checked: 'pr-radio-checked',
                                                        }}
                                                        onChange={this.privacyRuleChangeHandler(item.id)}
                                                    />
                                                    <div className="pr-radio-label"
                                                         onClick={this.privacyRuleChangeHandler(item.id, prItem.id)}>{i18n.t(prItem.title)}</div>
                                                </div>);
                                        })}
                                    </div>
                                    {privacy[item.id].mode !== 'no_one' &&
                                    <div className="sub-page-header-alt"
                                         onClick={this.openPrivacyUsersHandler(`exclude:${item.id}`)}
                                    >
                                        <div className="header-label"
                                        >{i18n.t('settings.privacy_never_share_with')}</div>
                                        <div className="header-value"
                                        >{privacy.hasOwnProperty(item.id) ? localize(privacy[item.id].excludeIds.length) : localize(0)}</div>
                                    </div>}
                                    {privacy[item.id].mode !== 'everyone' &&
                                    <div className="sub-page-header-alt"
                                         onClick={this.openPrivacyUsersHandler(`include:${item.id}`)}
                                    >
                                        <div className="header-label"
                                        >{i18n.t('settings.privacy_always_share_with')}</div>
                                        <div className="header-value"
                                        >{privacy.hasOwnProperty(item.id) ? localize(privacy[item.id].includeIds.length) : localize(0)}</div>
                                    </div>}
                                </React.Fragment>
                            );
                        })}
                        {Boolean(pageSubContent === '2fa') && <React.Fragment>
                            <div className="menu-header">
                                <IconButton
                                    onClick={this.onSubPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>{i18n.t('settings.two_step_verification')}</label>
                            </div>
                            <div className="menu-content">
                                <div className="menu-note">{i18n.t('settings.2fa.note')}</div>
                                <div className="menu-button-wrapper">
                                    <Button color="secondary" fullWidth={true} disabled={passwordMode === 0}
                                            onClick={this.twoStepVerificationModalOpenHandler}>
                                        {Boolean(passwordMode === 0) && i18n.t('general.loading')}
                                        {Boolean(passwordMode === 1) && i18n.t('general.activate')}
                                        {Boolean(passwordMode === 2) && i18n.t('general.deactivate_change')}
                                    </Button>
                                </div>
                            </div>
                        </React.Fragment>}
                        {Boolean(pageSubContent === 'block') && <React.Fragment>
                            <div className="menu-header">
                                <IconButton
                                    onClick={this.onSubPrevHandler}
                                >
                                    <KeyboardBackspaceRounded/>
                                </IconButton>
                                <label>{i18n.t('settings.blocked_users')}</label>
                            </div>
                            <div className="menu-content">
                                {this.getBlockedUserWrapper()}
                            </div>
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
                    open={confirmDialogOpen}
                    onClose={this.confirmDialogCloseHandler}
                    className="confirm-dialog"
                    classes={{
                        paper: 'confirm-dialog-paper'
                    }}
                >
                    <DialogTitle>{this.state.confirmDialogSelectedId === '0' ? i18n.t('settings.terminate_all_other_sessions') : i18n.t('settings.terminate_session')}</DialogTitle>
                    <DialogActions>
                        <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                            {i18n.t('general.disagree')}
                        </Button>
                        <Button onClick={this.terminateSessionHandler} color="primary" autoFocus={true}>
                            {i18n.t('general.agree')}
                        </Button>
                    </DialogActions>
                </OverlayDialog>
            </div>
        );
    }

    private changeLanguage = (lang: string) => (e: any) => {
        const l = localStorage.getItem('river.lang');
        const fn = () => {
            // @ts-ignore
            const selectedLang = find(languageList, {lang});
            localStorage.setItem('river.lang', lang);
            if (selectedLang) {
                localStorage.setItem('river.lang.dir', selectedLang.dir);
            }
            this.setState({
                selectedLanguage: lang,
            });
            window.location.reload();
        };
        if (l !== lang) {
            this.sdk.setLang(lang).then(() => {
                fn();
            }).catch(() => {
                fn();
            });
        }
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
        this.broadcastEvent(ThemeChanged, null);
    }

    /* Increase font size handler */
    private increaseFontSizeHandler = () => {
        this.setState(state => ({
            fontSize: state.fontSize + 1,
        }), () => {
            this.changeFontSize();
        });
    }

    /* Decrease font size handler */
    private decreaseFontSizeHandler = () => {
        this.setState(state => ({
            fontSize: state.fontSize - 1,
        }), () => {
            this.changeFontSize();
        });
    }

    /* Font size change handler */
    private fontSizeChangeHandler = (e: any, value: number) => {
        this.setState({
            fontSize: value,
        }, () => {
            this.changeFontSize();
        });
    }

    private changeFontSize() {
        if (this.props.onUpdateMessages) {
            this.props.onUpdateMessages(true);
        }
        const el = document.querySelector('html');
        if (!el) {
            return;
        }
        localStorage.setItem('river.theme.font', String(this.state.fontSize));
        el.setAttribute('font', String(this.state.fontSize));
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

    private onSubPrevHandler = () => {
        this.setState({
            page: '2',
            pageSubContent: 'none',
            passwordMode: 0,
        }, () => {
            this.dispatchSubPlaceChange();
        });
        if (this.state.pageSubContent.indexOf('privacy_') > -1) {
            this.checkPrivacyDiff();
        }
    }

    private selectPageHandler = (target: string) => (e: any) => {
        if (target === 'label') {
            if (this.props.onSubPlaceChange) {
                this.props.onSubPlaceChange('label', '');
            }
            return;
        }
        this.setState({
            page: '2',
            pageContent: target,
        }, () => {
            this.dispatchSubPlaceChange();
        });
        if (target === 'account') {
            this.getUser();
        } else if (target === 'privacy') {
            this.getPrivacy();
        }
    }

    private selectSubPageHandler = (target: string) => (e: any) => {
        this.setState({
            page: '3',
            pageSubContent: target,
        }, () => {
            this.dispatchSubPlaceChange();
        });
        if (target === 'session') {
            this.getSessions();
        } else if (target === '2fa') {
            this.getPasswordSettings();
        } else if (target === 'block') {
            this.getBlockedUsers();
        }
    }

    private getUser() {
        this.userRepo.get(this.userId).then((res) => {
            if (res) {
                return res;
            } else {
                const inputUser = new InputUser();
                inputUser.setAccesshash('0');
                inputUser.setUserid(this.userId);
                return this.sdk.getUserFull([inputUser]).then((data) => {
                    const index = findIndex(data.usersList, {id: this.userId});
                    if (index > -1) {
                        return data.usersList[index];
                    } else {
                        throw new Error('user not found');
                    }
                });
            }
        }).then((res) => {
            this.setState({
                bio: res.bio || '',
                firstname: res.firstname || '',
                lastname: res.lastname || '',
                user: res,
                username: res.username || '',
            });
        });
    }

    private editProfileHandler = () => {
        this.setState({
            editProfile: true,
        });
    }

    private editUsernameHandler = () => {
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

    private lastnameChangeHandler = (e: any) => {
        this.setState({
            lastname: e.currentTarget.value,
        });
    }

    private bioChangeHandler = (e: any) => {
        this.setState({
            bio: e.currentTarget.value,
        });
    }

    private usernameChangeHandler = (e: any) => {
        const username = e.currentTarget.value;
        if (username.length === 0) {
            this.setState({
                username,
                usernameAvailable: true,
                usernameValid: true,
            });
            return;
        }
        const reg = /^[a-zA-Z][\da-zA-Z]{4,31}$/;
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

    private selectThemeHandler = (id: string) => (e: any) => {
        this.setState({
            selectedTheme: id,
        }, () => {
            this.applyTheme();
        });
    }

    private selectBackgroundHandler = (id: string) => {
        if (id === C_CUSTOM_BG) {
            if (this.settingsBackgroundModalRef) {
                this.settingsBackgroundModalRef.openDialog();
            }
        } else {
            this.backgroundService.disable();
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
    }

    private selectBgTypeHandler = (id: string) => (e: any) => {
        if (id === '1') {
            if (this.settingsBackgroundModalRef) {
                this.settingsBackgroundModalRef.openDialog();
            }
        } else {
            this.backgroundService.disable();
        }
        if (id === '2') {
            if (this.settingsBackgroundModalRef) {
                this.settingsBackgroundModalRef.openDialog(true);
            }
        }
        if (id === '0') {
            this.selectBackgroundHandler('0');
        }
        this.setState({
            selectedBgType: id,
        });
    }

    private selectBubbleHandler = (id: string) => (e: any) => {
        this.setState({
            selectedBubble: id,
        }, () => {
            const el = document.querySelector('html');
            if (!el) {
                return;
            }
            localStorage.setItem('river.theme.bubble', id);
            el.setAttribute('bubble', id);
            if (this.props.onUpdateMessages) {
                this.props.onUpdateMessages();
            }
            this.userRepo.setBubbleMode(id);
            this.broadcastEvent(ThemeChanged, null);
        });
    }

    private selectGradientHandler = (id: string) => (e: any) => {
        this.setState({
            selectedGradient: id,
        }, () => {
            const el = document.querySelector('html');
            if (!el) {
                return;
            }
            localStorage.setItem('river.theme.gradient', id);
            el.setAttribute('gradient', id);
            this.broadcastEvent(ThemeChanged, null);
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
            this.props.onSubPlaceChange(this.state.pageContent, this.state.pageSubContent);
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

    /* DevTools ref handler */
    private devToolsRefHandler = (ref: any) => {
        this.devToolsRef = ref;
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
                const {user} = this.state;
                if (user) {
                    user.photo = res;
                }
                this.setState({
                    uploadingPhoto: false,
                    user,
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
        const {user} = this.state;
        const menuItems: Array<{ cmd: 'show' | 'remove' | 'change', title: string }> = [{
            cmd: 'show',
            title: i18n.t('settings.show_photo'),
        }, {
            cmd: 'remove',
            title: i18n.t('settings.remove_photo'),
        }, {
            cmd: 'change',
            title: i18n.t('settings.change_photo'),
        }];
        return menuItems.filter((item) => {
            return (item.cmd === 'change') || ((item.cmd === 'show' || item.cmd === 'remove') && (user && user.photo && user.photo.photosmall && user.photo.photosmall.fileid !== '0'));
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
                this.sdk.removeProfilePicture().then(() => {
                    const {user} = this.state;
                    if (user) {
                        if (user.photo) {
                            this.avatarService.remove(user.id || '', user.photo.photosmall.fileid);
                            this.avatarService.remove(user.id || '', user.photo.photobig.fileid);
                        }
                        user.photo = undefined;
                        this.profileTempPhoto = '';
                        this.userRepo.importBulk(false, [{
                            id: user.id,
                            remove_photo: true,
                        }]).then(() => {
                            this.setState({
                                user,
                            });
                        });
                    }
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
            if (this.devToolsRef) {
                this.devToolsRef.open();
            }
        }
    }

    /* Logout handler */
    private logOutHandler = () => {
        if (this.props.onAction) {
            this.props.onAction('logout');
        }
    }

    /* Modify Sessions */
    private modifySessions(sessions: AccountAuthorization.AsObject[]) {
        const index = findIndex(sessions, {authid: this.currentAuthID});
        if (index > 0) {
            const currentSession = sessions[index];
            sessions.splice(index, 1);
            // @ts-ignore
            sessions.unshift({type: 'terminate_all'});
            sessions.unshift(currentSession);
        } else {
            // @ts-ignore
            sessions.splice(1, 0, {type: 'terminate_all'});
        }
        for (let i = 2; i < sessions.length; i++) {
            for (let j = i; j < sessions.length; j++) {
                if ((sessions[i].lastaccess || 0) < (sessions[j].lastaccess || 0)) {
                    const hold = sessions[i];
                    sessions[i] = sessions[j];
                    sessions[j] = hold;
                }
            }
        }
        return sessions;
    }

    /* Get All Sessions */
    private getSessions() {
        if (this.state.loading) {
            return;
        }
        this.setState({
            loading: true,
        });

        this.sdk.sessionGetAll().then((res) => {
            this.setState({
                loading: false,
                sessions: this.modifySessions(res.authorizationsList),
            });
        }).catch(() => {
            this.setState({
                loading: false,
            });
        });
    }

    /* Open confirm dialog for terminate session by Id */
    private terminateSessionConfirmHandler = (id: string | undefined) => (e: any) => {
        if (!id) {
            return;
        }
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
                if (confirmDialogSelectedId !== '0') {
                    const index = findIndex(sessions, {authid: confirmDialogSelectedId});
                    if (sessions && index > -1) {
                        sessions.splice(index, 1);
                        this.setState({
                            sessions,
                        });
                    }
                } else {
                    const index = findIndex(sessions, {authid: this.currentAuthID});
                    if (sessions && index > -1) {
                        this.setState({
                            sessions: [sessions[index]],
                        });
                    }
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

    private settingsBackgroundModalRefHandler = (ref: any) => {
        this.settingsBackgroundModalRef = ref;
    }

    private settingsStorageUsageModalRefHandler = (ref: any) => {
        this.settingsStorageUsageModalRef = ref;
    }

    private settingsBackgroundModalDoneHandler = (data: ICustomBackground) => {
        const {customBackgroundSrc} = this.state;
        if (customBackgroundSrc) {
            URL.revokeObjectURL(customBackgroundSrc);
        }
        this.setState({
            customBackgroundSrc: URL.createObjectURL(data.blob),
            selectedCustomBackground: data.id,
            selectedCustomBackgroundBlur: data.blur,
            selectedTheme: C_CUSTOM_BG,
        });
        this.fileRepo.upsertFile(C_CUSTOM_BG_ID, data.blob).then(() => {
            localStorage.setItem('river.theme.bg.pic', data.id);
            localStorage.setItem('river.theme.bg.blur', String(data.blur));
            localStorage.setItem('river.theme.bg', C_CUSTOM_BG);
            const el = document.querySelector('html');
            if (el) {
                el.setAttribute('bg', C_CUSTOM_BG);
            }
            this.backgroundService.setBackground(data.blob);
        });
    }

    private storageToggleHandler = (id: string) => (e: any) => {
        const {storageValues} = this.state;
        storageValues[id] = e.target.checked;
        if (id === 'download_all') {
            for (const i in storageValues) {
                if (i !== 'download_all') {
                    storageValues[i] = storageValues[id];
                }
            }
        }
        this.settingsConfigManger.setDownloadSettings(Object.assign({}, storageValues));
        this.setState({
            storageValues,
        });
    }

    private storageUsageHandler = () => {
        if (!this.settingsStorageUsageModalRef) {
            return;
        }
        this.settingsStorageUsageModalRef.openDialog();
    }

    private toggleMenuBarHandler = () => {
        //
        this.electronService.toggleMenuBar();
    }

    private getPrivacy() {
        const privacyList: PrivacyKey[] = [PrivacyKey.PRIVACYKEYCALL, PrivacyKey.PRIVACYKEYCHATINVITE, PrivacyKey.PRIVACYKEYFORWARDEDMESSAGE, PrivacyKey.PRIVACYKEYLASTSEEN, PrivacyKey.PRIVACYKEYPHONENUMBER, PrivacyKey.PRIVACYKEYPROFILEPHOTO];
        privacyList.forEach((pr) => {
            const key = this.getPrivacyType(pr);
            this.sdk.getPrivacy(pr).then((res) => {
                const {privacy} = this.state;
                privacy[key] = this.transformPrivacy(res);
                privacy[key].loading = false;
                this.setState({
                    privacy,
                });
                this.lastPrivacy = cloneDeep(privacy);
            }).catch(() => {
                const {privacy} = this.state;
                privacy[key].loading = false;
                this.setState({
                    privacy,
                });
            });
        });
    }

    private getPrivacyModeTitle(mode: string) {
        switch (mode) {
            case 'everyone':
            default:
                return i18n.t('settings.privacy_everyone');
            case 'my_contacts':
                return i18n.t('settings.privacy_my_contacts');
            case 'no_one':
                return i18n.t('settings.privacy_no_one');
        }
    }

    private getPrivacyModeType(mode: string) {
        switch (mode) {
            case 'everyone':
            default:
                return PrivacyType.PRIVACYTYPEALLOWALL;
            case 'my_contacts':
                return PrivacyType.PRIVACYTYPEALLOWCONTACTS;
            case 'no_one':
                return PrivacyType.PRIVACYTYPEDISALLOWALL;
        }
    }

    private getPrivacyType(key: PrivacyKey) {
        switch (key) {
            case PrivacyKey.PRIVACYKEYCALL:
                return 'privacy_call';
            case PrivacyKey.PRIVACYKEYCHATINVITE:
                return 'privacy_chat_invite';
            case PrivacyKey.PRIVACYKEYFORWARDEDMESSAGE:
                return 'privacy_forwarded_message';
            case PrivacyKey.PRIVACYKEYLASTSEEN:
                return 'privacy_last_seen';
            case PrivacyKey.PRIVACYKEYPHONENUMBER:
                return 'privacy_phone_number';
            case PrivacyKey.PRIVACYKEYPROFILEPHOTO:
                return 'privacy_profile_photo';
        }
        return '';
    }

    private transformPrivacy(rules: AccountPrivacyRules.AsObject) {
        const privacy: IPrivacy = {
            excludeIds: [],
            includeIds: [],
            loading: false,
            mode: 'everyone',
        };
        rules.rulesList.forEach((rule) => {
            if (rule.privacytype === PrivacyType.PRIVACYTYPEDISALLOWUSERS) {
                privacy.excludeIds = rule.useridsList;
            }
            if (rule.privacytype === PrivacyType.PRIVACYTYPEALLOWUSERS) {
                privacy.includeIds = rule.useridsList;
            } else {
                if (rule.privacytype === PrivacyType.PRIVACYTYPEALLOWALL) {
                    privacy.mode = 'everyone';
                } else if (rule.privacytype === PrivacyType.PRIVACYTYPEALLOWCONTACTS) {
                    privacy.mode = 'my_contacts';
                } else if (rule.privacytype === PrivacyType.PRIVACYTYPEDISALLOWALL) {
                    privacy.mode = 'no_one';
                }
            }
        });
        return privacy;
    }

    private privacyRuleChangeHandler = (id: string, value?: string) => (e: any) => {
        const {privacy} = this.state;
        if (!privacy.hasOwnProperty(id)) {
            return;
        }
        if (value) {
            // @ts-ignore
            privacy[id].mode = value;
        } else {
            privacy[id].mode = e.target.value;
        }
        this.setState({
            privacy
        });
    }

    private userListDialogRefHandler = (ref: any) => {
        this.userListDialogRef = ref;
    }

    private openPrivacyUsersHandler = (target: string) => (e: any) => {
        if (!this.userListDialogRef) {
            return;
        }
        const {privacy} = this.state;
        const d = target.split(':');
        if (!privacy.hasOwnProperty(d[1])) {
            return;
        }
        this.userListDialogRef.openDialog(target, d[0] === 'include' ? privacy[d[1]].includeIds : privacy[d[1]].excludeIds);
    }

    private userListDialogDoneHandler = (target: string, inputPeers: IInputPeer[]) => {
        const {privacy} = this.state;
        const d = target.split(':');
        if (!privacy.hasOwnProperty(d[1])) {
            return;
        }
        if (d[0] === 'exclude') {
            privacy[d[1]].excludeIds = inputPeers.map((o) => {
                return o.id;
            });
        } else if (d[0] === 'include') {
            privacy[d[1]].includeIds = inputPeers.map((o) => {
                return o.id;
            });
        }
        this.setState({
            privacy,
        });
    }

    private getPrivacyRules(key: string) {
        const {privacy} = this.state;
        if (!privacy.hasOwnProperty(key)) {
            return [];
        }
        const rules: PrivacyRule[] = [];
        const privacyRule = new PrivacyRule();
        privacyRule.setUseridsList([]);
        privacyRule.setPrivacytype(this.getPrivacyModeType(privacy[key].mode));
        rules.push(privacyRule);
        if (privacy[key].excludeIds.length > 0) {
            const privacyRuleExclude = new PrivacyRule();
            privacyRuleExclude.setUseridsList(privacy[key].excludeIds);
            privacyRuleExclude.setPrivacytype(PrivacyType.PRIVACYTYPEDISALLOWUSERS);
            rules.push(privacyRuleExclude);
        }
        if (privacy[key].includeIds.length > 0) {
            const privacyRuleInclude = new PrivacyRule();
            privacyRuleInclude.setUseridsList(privacy[key].includeIds);
            privacyRuleInclude.setPrivacytype(PrivacyType.PRIVACYTYPEALLOWUSERS);
            rules.push(privacyRuleInclude);
        }
        return rules;
    }

    private checkPrivacyDiff() {
        const {privacy} = this.state;
        const hasDiff = (key: string) => {
            if (privacy[key].mode !== this.lastPrivacy[key].mode) {
                return true;
            }
            if (!isEqual(privacy[key].excludeIds.sort(), this.lastPrivacy[key].excludeIds.sort())) {
                return true;
            }
            if (!isEqual(privacy[key].includeIds.sort(), this.lastPrivacy[key].includeIds.sort())) {
                return true;
            }
            return false;
        };
        const data: {
            callList?: PrivacyRule[],
            chatInviteList?: PrivacyRule[],
            chatForwardedList?: PrivacyRule[],
            lastSeenList?: PrivacyRule[],
            phoneNumberList?: PrivacyRule[],
            profilePhotoList?: PrivacyRule[]
        } = {
            callList: [],
            chatForwardedList: [],
            chatInviteList: [],
            lastSeenList: [],
            phoneNumberList: [],
            profilePhotoList: [],
        };
        let diff = false;
        Object.keys(privacy).forEach((key: string) => {
            if (hasDiff(key)) {
                diff = true;
                switch (key) {
                    case 'privacy_call':
                        data.callList = this.getPrivacyRules(key);
                        break;
                    case 'privacy_chat_invite':
                        data.chatInviteList = this.getPrivacyRules(key);
                        break;
                    case 'privacy_forwarded_message':
                        data.chatForwardedList = this.getPrivacyRules(key);
                        break;
                    default:
                    case 'privacy_last_seen':
                        data.lastSeenList = this.getPrivacyRules(key);
                        break;
                    case 'privacy_phone_number':
                        data.phoneNumberList = this.getPrivacyRules(key);
                        break;
                    case 'privacy_profile_photo':
                        data.profilePhotoList = this.getPrivacyRules(key);
                        break;
                }
            }
        });
        if (diff) {
            this.sdk.setPrivacy(data).then(() => {
                this.lastPrivacy = cloneDeep(privacy);
            }).catch(() => {
                this.setState({
                    privacy: cloneDeep(this.lastPrivacy),
                });
            });
        }
    }

    private changePhoneModalRefHandler = (ref: any) => {
        this.changePhoneModalRef = ref;
    }

    private editPhoneHandler = () => {
        if (!this.changePhoneModalRef) {
            return;
        }
        this.changePhoneModalRef.openDialog();
    }

    private changePhoneModalDoneHandler = () => {
        this.setState({
            phone: this.sdk.getConnInfo().Phone || '',
        });
    }

    private twoStepVerificationModalRefHandler = (ref: any) => {
        this.twoStepVerificationModalRef = ref;
    }

    private twoStepVerificationModalOpenHandler = () => {
        if (!this.twoStepVerificationModalRef) {
            return;
        }
        this.twoStepVerificationModalRef.openDialog(this.state.passwordMode === 2);
    }

    private twoStepVerificationModalDoneHandler = () => {
        this.getPasswordSettings();
    }

    private getPasswordSettings() {
        this.sdk.accountGetPassword().then((res) => {
            this.setState({
                passwordMode: res.getHaspassword() ? 2 : 1,
            });
        });
    }

    private getBlockedUserWrapper() {
        const {contactList, loading} = this.state;
        if (contactList.length === 0) {
            if (loading) {
                return (<div className="block-list">
                    {DialogSkeleton()}
                </div>);
            } else {
                return (
                    <div className="block-list no-result">
                        <BlockRounded/>
                        {i18n.t('contact.no_result')}
                    </div>
                );
            }
        } else {
            if (this.isMobile || !this.hasScrollbar) {
                return (
                    <AutoSizer>
                        {({width, height}: any) => {
                            return (<FixedSizeList
                                ref={this.blockUserListRefHandler}
                                itemSize={64}
                                itemCount={loading ? contactList.length + 1 : contactList.length}
                                overscanCount={10}
                                width={width}
                                height={height}
                                className="block-list"
                                direction={this.rtl ? 'ltr' : 'rtl'}
                                onItemsRendered={this.blockUserItemRendered}
                            >
                                {({index, style}) => {
                                    return this.rowRender({index, style, key: index});
                                }}
                            </FixedSizeList>);
                        }}
                    </AutoSizer>
                );
            } else {
                return (
                    <AutoSizer>
                        {({width, height}: any) => (
                            <div className="blocked-user-list-inner" style={{
                                height: height + 'px',
                                width: width + 'px',
                            }}>
                                <Scrollbars
                                    autoHide={true}
                                    style={{
                                        height: height + 'px',
                                        width: width + 'px',
                                    }}
                                    onScroll={this.handleScroll}
                                    hideTracksWhenNotNeeded={true}
                                    universal={true}
                                    rtl={!this.rtl}
                                >
                                    <FixedSizeList
                                        ref={this.blockUserListRefHandler}
                                        itemSize={64}
                                        itemCount={loading ? contactList.length + 1 : contactList.length}
                                        overscanCount={10}
                                        width={width}
                                        height={height}
                                        className="block-list"
                                        style={listStyle}
                                        onItemsRendered={this.blockUserItemRendered}
                                    >
                                        {({index, style}) => {
                                            return this.rowRender({index, style, key: index});
                                        }}
                                    </FixedSizeList>
                                </Scrollbars>
                            </div>
                        )}
                    </AutoSizer>
                );
            }
        }
    }

    private blockUserListRefHandler = (ref: any) => {
        this.blockUserListRef = ref;
    }

    /* Custom Scrollbars handler */
    private handleScroll = (e: any) => {
        const {scrollTop} = e.target;
        if (this.blockUserListRef) {
            this.blockUserListRef.scrollTo(scrollTop);
        }
    }

    private blockUserItemRendered = (props: ListOnItemsRenderedProps) => {
        if (!this.contactHasMore || this.state.loading) {
            return;
        }
        const {contactList} = this.state;
        if ((contactList.length - 5) < props.visibleStopIndex) {
            this.getBlockedUsers(contactList.length);
        }
    }

    private rowRender = ({index, key, style}: any): any => {
        const contact = this.state.contactList[index];
        if (contact) {
            return (
                <div key={contact.id || key || ''} style={style} className="contact-item">
                    <div className="avatar">
                        <UserAvatar id={contact.id || ''}/>
                    </div>
                    <div
                        className="name">{`${contact.firstname} ${contact.lastname}`}</div>
                    <div
                        className="phone">{contact.phone ? contact.phone : ((contact.username !== '') ? contact.username : i18n.t('contact.no_phone'))}</div>
                    <div className="more" onClick={this.unblockUserHandler(contact)}>
                        <DeleteRounded/>
                    </div>
                </div>
            );
        } else {
            return (<div style={style} key="contact-item-loading" className="contact-item-loading">
                <CircularProgress size={32} thickness={3} color="inherit"/>
            </div>);
        }
    }

    private unblockUserHandler = (user?: IUser) => () => {
        const {contactList} = this.state;
        if (!user) {
            return;
        }

        const inputUser = new InputUser();
        inputUser.setUserid(user.id || '');
        inputUser.setAccesshash(user.accesshash || '');
        this.sdk.accountUnblock(inputUser).then(() => {
            const index = findIndex(contactList, {id: user.id});
            if (index > -1) {
                contactList.splice(index, 1);
                this.setState({
                    contactList,
                });
            }
        });
    }

    private getBlockedUsers(skip?: number) {
        const {loading, contactList} = this.state;
        if (loading) {
            return;
        }
        this.setState({
            loading: true,
        });
        this.sdk.accountGetBlockedUser(skip || 0, C_BLOCKED_USER_LIST_LIMIT).then((res) => {
            this.contactHasMore = res.usersList.length === C_BLOCKED_USER_LIST_LIMIT;
            if (!skip) {
                this.setState({
                    contactList: res.usersList,
                });
            } else {
                contactList.push.apply(contactList, res.usersList);
                this.setState({
                    contactList,
                });
            }
        }).finally(() => {
            this.setState({
                loading: false,
            });
        });
    }

    private notificationMuteCountToggleHandler = (e: any, checked: boolean) => {
        const {notificationValues} = this.state;
        notificationValues.count_muted = checked;
        this.settingsConfigManger.setNotificationSettings(Object.assign({}, notificationValues));
        this.setState({
            notificationValues,
        });
        if (this.props.onAction) {
            this.props.onAction('count_dialog');
        }
    }
}

export default SettingsMenu;
