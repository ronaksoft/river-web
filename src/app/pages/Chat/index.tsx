/*
    Creation Time: 2018 - Aug - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import Dialog from '../../components/Dialog/index';
import {IMessage} from '../../repository/message/interface';
import Message, {highlightMessage, highlightMessageText} from '../../components/Message/index';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import {
    EditRounded, ExpandMoreRounded, InfoOutlined, KeyboardArrowLeftRounded, MoreVertRounded, SearchRounded,
    CloseRounded,
} from '@material-ui/icons';
import MessageRepo from '../../repository/message/index';
import DialogRepo from '../../repository/dialog/index';
import UniqueId from '../../services/uniqueId/index';
import ChatInput from '../../components/ChatInput/index';
import {
    clone, differenceBy, find, findIndex, findLastIndex, intersectionBy, throttle, trimStart, cloneDeep,
} from 'lodash';
import SDK from '../../services/sdk/index';
import NewMessage from '../../components/NewMessage';
import * as core_types_pb from '../../services/sdk/messages/chat.core.types_pb';
import {
    FileLocation, Group, InputFile, InputFileLocation, InputPeer, InputUser, MediaType, MessageEntity,
    MessageEntityType, PeerNotifySettings, PeerType, TypingAction, User, UserStatus,
} from '../../services/sdk/messages/chat.core.types_pb';
import {IConnInfo} from '../../services/sdk/interface';
import {IDialog} from '../../repository/dialog/interface';
import UpdateManager, {INewMessageBulkUpdate} from '../../services/sdk/server/updateManager';
import {C_MSG} from '../../services/sdk/const';
import {
    UpdateDialogPinned, UpdateGroupPhoto, UpdateMessageEdited, UpdateMessageID, UpdateMessagesDeleted,
    UpdateNotifySettings, UpdateReadHistoryInbox, UpdateReadHistoryOutbox, UpdateReadMessagesContents,
    UpdateUsername, UpdateUserPhoto, UpdateUserTyping,
} from '../../services/sdk/messages/chat.api.updates_pb';
import UserName from '../../components/UserName';
import SyncManager, {C_SYNC_UPDATE} from '../../services/sdk/syncManager';
import UserRepo from '../../repository/user';
import RiverLogo from '../../components/RiverLogo';
import MainRepo from '../../repository';
import SettingsMenu, {C_CUSTOM_BG_ID} from '../../components/SettingsMenu';
import {C_MSG_MODE} from '../../components/ChatInput/consts';
import TimeUtility from '../../services/utilities/time';
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE} from '../../repository/message/consts';
import PopUpDate from '../../components/PopUpDate';
import BottomBar from '../../components/BottomBar';
import ContactMenu from '../../components/ContactMenu';
import Tooltip from '@material-ui/core/Tooltip';
import NewGroupMenu from '../../components/NewGroupMenu';
import GroupRepo from '../../repository/group';
import GroupName from '../../components/GroupName';
import GroupInfoMenu from '../../components/GroupInfoMenu';
import UserInfoMenu, {isMuted} from '../../components/UserInfoMenu';
import OverlayDialog from '@material-ui/core/Dialog/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import UserDialog from '../../components/UserDialog';
import {IInputPeer} from '../../components/SearchList';
import ElectronService, {C_ELECTRON_SUBJECT} from '../../services/electron';
import FileManager from '../../services/sdk/fileManager';
import {InputMediaType} from '../../services/sdk/messages/chat.api.messages_pb';
import {
    Document, DocumentAttribute, DocumentAttributeAudio, DocumentAttributeFile, DocumentAttributePhoto, MediaDocument,
    DocumentAttributeType, DocumentAttributeVideo, InputMediaContact, InputMediaGeoLocation, InputMediaUploadedDocument,
} from '../../services/sdk/messages/chat.core.message.medias_pb';
import RiverTime from '../../services/utilities/river_time';
import FileRepo from '../../repository/file';
import ProgressBroadcaster from '../../services/progress';
import {C_FILE_ERR_CODE} from '../../services/sdk/fileManager/const/const';
import {getMessageTitle} from '../../components/Dialog/utils';
import {saveAs} from 'file-saver';
import {getFileExtension, getFileInfo} from '../../components/MessageFile';
import AudioPlayerShell from '../../components/AudioPlayerShell';
import DocumentViewer from '../../components/DocumentViewer';
import {IUser} from '../../repository/user/interface';
import {IMediaItem} from '../../components/Uploader';
import {IGeoItem} from '../../components/MapPicker';
import RTLDetector from '../../services/utilities/rtl_detector';
import Badge from '@material-ui/core/Badge/Badge';
import BackgroundService from '../../services/backgroundService';
import {C_CUSTOM_BG} from '../../components/SettingsMenu/vars/theme';
import SearchMessage from '../../components/SearchMessage';
import DownloadManager from '../../services/downloadManager';
import * as Sentry from '@sentry/browser';
import ForwardDialog from "../../components/ForwardDialog";
import AboutDialog from "../../components/AboutModal";
import StatusBar from "../../components/StatusBar";
import i18n from "../../services/i18n";
import IframeService, {C_IFRAME_SUBJECT} from '../../services/iframe';
import PopUpNewMessage from "../../components/PopUpNewMessage";
import CachedMessageService from "../../services/cachedMessageService";
import {isProd} from "../../../App";
import {emojiLevel} from "../../services/utilities/emoji";
import AudioPlayer, {IAudioInfo} from "../../services/audioPlayer";

import './style.css';

export let notifyOptions: any[] = [];
const C_MAX_UPDATE_DIFF = 2000;

interface IProps {
    history?: any;
    location?: any;
    match?: any;
}

interface IState {
    blurMessage: boolean;
    chatMoreAnchorEl: any;
    confirmDialogMode: 'none' | 'logout' | 'remove_message' | 'remove_message_revoke' | 'remove_message_pending' | 'delete_exit_group' | 'delete_user' | 'cancel_recording';
    confirmDialogOpen: boolean;
    forwardRecipientDialogOpen: boolean;
    iframeActive: boolean;
    isChatView: boolean;
    isConnecting: boolean;
    isOnline: boolean;
    isUpdating: boolean;
    leftMenu: string;
    leftMenuSelectedDialogId: string;
    leftOverlay: boolean;
    maxReadId: number;
    messageSelectable: boolean;
    messageSelectedIds: { [key: number]: number };
    moreInfoAnchorEl: any;
    openNewMessage: boolean;
    peer: InputPeer | null;
    rightMenu: boolean;
    rightMenuShrink: boolean;
    selectedDialogId: string;
    textInputMessage?: IMessage;
    textInputMessageMode: number;
    unreadCounter: number;
}

class Chat extends React.Component<IProps, IState> {
    private conversationRef: any = null;
    private containerRef: any = null;
    private isInChat: boolean = true;
    private rightMenuRef: any = null;
    private dialogRef: Dialog;
    private statusBarRef: StatusBar;
    private popUpDateRef: PopUpDate;
    private popUpNewMessageRef: PopUpNewMessage;
    private messageRef: Message;
    // @ts-ignore
    private settingsMenuRef: SettingsMenu;
    private messages: IMessage[] = [];
    private messageRepo: MessageRepo;
    private dialogRepo: DialogRepo;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;
    private fileRepo: FileRepo;
    private mainRepo: MainRepo;
    private chatInputComponent: ChatInput;
    private isLoading: boolean = false;
    private sdk: SDK;
    private updateManager: UpdateManager;
    private syncManager: SyncManager;
    private connInfo: IConnInfo;
    private eventReferences: any[] = [];
    private readonly dialogsSortThrottle: any = null;
    private isMobileView: boolean = false;
    private mobileBackTimeout: any = null;
    private forwardDialogRef: ForwardDialog;
    private userDialogComponent: UserDialog;
    private fileManager: FileManager;
    private electronService: ElectronService;
    private riverTime: RiverTime;
    private progressBroadcaster: ProgressBroadcaster;
    private firstTimeLoad: boolean = true;
    private rtlDetector: RTLDetector;
    private moveDownRef: any = null;
    private moveDownVisible: boolean = false;
    private endOfMessage: boolean = false;
    private lastMessageId: number = -1;
    private dialogReadMap: { [key: string]: { peer: InputPeer, id: number } } = {};
    private readonly messageReadThrottle: any = null;
    private newMessageFlag: boolean = false;
    private backgroundService: BackgroundService;
    private searchMessageRef: SearchMessage;
    private downloadManager: DownloadManager;
    private aboutDialogRef: AboutDialog;
    private dialogMap: { [key: string]: number } = {};
    private dialogs: IDialog[] = [];
    private isTypingList: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } } = {};
    private iframeService: IframeService;
    private readonly newMessageLoadThrottle: any = null;
    private scrollInfo: any = null;
    private cachedMessageService: CachedMessageService;
    private updateReadInboxTimeout: any = {};
    private isRecording: boolean = false;
    private upcomingDialogId: string = 'null';

    constructor(props: IProps) {
        super(props);

        this.iframeService = IframeService.getInstance();

        this.state = {
            blurMessage: false,
            chatMoreAnchorEl: null,
            confirmDialogMode: 'none',
            confirmDialogOpen: false,
            forwardRecipientDialogOpen: false,
            iframeActive: this.iframeService.isActive(),
            isChatView: false,
            isConnecting: true,
            isOnline: navigator.onLine || true,
            isUpdating: false,
            leftMenu: 'chat',
            leftMenuSelectedDialogId: '',
            leftOverlay: false,
            maxReadId: 0,
            messageSelectable: false,
            messageSelectedIds: {},
            moreInfoAnchorEl: null,
            openNewMessage: false,
            peer: null,
            rightMenu: false,
            rightMenuShrink: false,
            selectedDialogId: props.match.params.id,
            textInputMessageMode: C_MSG_MODE.Normal,
            unreadCounter: 0,
        };
        this.riverTime = RiverTime.getInstance();
        this.fileManager = FileManager.getInstance();
        this.sdk = SDK.getInstance();
        this.sdk.loadConnInfo();
        this.connInfo = this.sdk.getConnInfo();
        this.messageRepo = MessageRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.dialogRepo = DialogRepo.getInstance();
        this.fileRepo = FileRepo.getInstance();
        this.mainRepo = MainRepo.getInstance();
        this.updateManager = UpdateManager.getInstance();
        this.syncManager = SyncManager.getInstance();
        this.dialogsSortThrottle = throttle(this.dialogsSort, 256);
        this.isInChat = (document.visibilityState === 'visible');
        this.isMobileView = (window.innerWidth < 600);
        this.updateManager.setUserId(this.connInfo.UserID || '');
        this.progressBroadcaster = ProgressBroadcaster.getInstance();
        this.electronService = ElectronService.getInstance();
        this.rtlDetector = RTLDetector.getInstance();
        this.messageReadThrottle = throttle(this.readMessage, 256);
        this.backgroundService = BackgroundService.getInstance();
        this.downloadManager = DownloadManager.getInstance();
        this.newMessageLoadThrottle = throttle(this.newMessageLoad, 200);
        this.cachedMessageService = CachedMessageService.getInstance();
        const audioPlayer = AudioPlayer.getInstance();
        audioPlayer.setErrorFn(this.audioPlayerErrorHandler);
        audioPlayer.setUpateDurationFn(this.audioPlayerUpdateDurationHandler);

        if (isProd) {
            Sentry.configureScope((scope) => {
                scope.setUser({
                    'auth_id': this.connInfo.AuthID,
                    'user_id': this.connInfo.UserID,
                });
            });
        }

        notifyOptions = [{
            title: i18n.t('general.disable'),
            val: '-1',
        }, {
            title: i18n.t('general.enable'),
            val: '-2',
        }, {
            title: i18n.t('peer_info.disable_for_8_hours'),
            val: '480',
        }, {
            title: i18n.t('peer_info.disable_for_2_days'),
            val: '2880',
        }, {
            title: i18n.t('peer_info.disable_for_1_week'),
            val: '10080',
        }];
    }

    public componentDidMount() {
        if (this.connInfo.AuthID === '0' || this.connInfo.UserID === '0') {
            this.props.history.push('/signup/null');
            return;
        }

        // Global event listeners
        window.addEventListener('focus', this.windowFocusHandler);
        window.addEventListener('blur', this.windowBlurHandler);
        window.addEventListener('wasmInit', this.wasmInitHandler);
        window.addEventListener('wsOpen', this.wsOpenHandler);
        window.addEventListener('wsClose', this.wsCloseHandler);
        window.addEventListener('fnStarted', this.fnStartedHandler);
        window.addEventListener('networkStatus', this.networkStatusHandler);
        window.addEventListener('Dialog_Sync_Updated', this.dialogDBUpdatedHandler);
        window.addEventListener('Message_Sync_Updated', this.messageDBUpdatedHandler);

        // Get latest cached dialogs
        this.initDialogs();

        // Update: Out of sync (internal)
        this.eventReferences.push(this.updateManager.listen(C_MSG.OutOfSync, this.outOfSyncHandler));

        // Update: New Message Received
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateNewMessage, this.updateNewMessageHandler));

        // Update: Message Dropped (internal)
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateNewMessageDrop, this.updateMessageDropHandler));

        // Update: MessageId
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateMessageID, this.updateMessageIDHandler));

        // Update: Message Edited
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateMessageEdited, this.updateMessageEditHandler));

        // Update: User is typing
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateUserTyping, this.updateUserTypeHandler));

        // Update: Read Inbox History
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateReadHistoryInbox, this.updateReadInboxHandler));

        // Update: Read Outbox History
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateReadHistoryOutbox, this.updateReadOutboxHandler));

        // Update: Message Delete
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateMessagesDeleted, this.updateMessageDeleteHandler));

        // Update: Username
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateUsername, this.updateUsernameHandler));

        // Update: Notify Settings
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateNotifySettings, this.updateNotifySettingsHandler));

        // Update: Content Read
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateReadMessagesContents, this.updateContentReadHandler));

        // Update: Users
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateUsers, this.updateUserHandler));

        // Update: Groups
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateGroups, this.updateGroupHandler));

        // Update: User Photo
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateUserPhoto, this.updateUserPhotoHandler));

        // Update: Group Photo
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateGroupPhoto, this.updateGroupPhotoHandler));

        // Update: Force Log Out
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateAuthorizationReset, this.updateAuthorizationResetHandler));

        // Update: dialog pinned
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateDialogPinned, this.updateDialogPinnedHandler));

        // Sync: MessageId
        this.eventReferences.push(this.syncManager.listen(C_SYNC_UPDATE.MessageId, this.updateMessageIDHandler));

        // TODO: add timestamp to pending message

        // Electron events
        this.eventReferences.push(this.electronService.listen(C_ELECTRON_SUBJECT.Setting, this.electronSettingsHandler));
        this.eventReferences.push(this.electronService.listen(C_ELECTRON_SUBJECT.About, this.electronAboutHandler));
        this.eventReferences.push(this.electronService.listen(C_ELECTRON_SUBJECT.Logout, this.electronLogoutHandler));
        this.eventReferences.push(this.electronService.listen(C_ELECTRON_SUBJECT.SizeMode, this.electronSizeModeHandler));

        if (localStorage.getItem('river.theme.bg') === C_CUSTOM_BG) {
            this.backgroundService.getBackground(C_CUSTOM_BG_ID, true);
        }

        if (!this.state.iframeActive) {
            this.eventReferences.push(this.iframeService.listen(C_IFRAME_SUBJECT.IsLoaded, (e) => {
                this.setState({
                    iframeActive: true,
                });
            }));
        }
    }

    public componentWillReceiveProps(newProps: IProps) {
        const selectedId = newProps.match.params.id;
        if (selectedId === 'null') {
            if (this.isMobileView) {
                this.setChatView(false);
            }
        } else if (selectedId === this.state.selectedDialogId) {
            if (this.isMobileView) {
                this.setChatView(true);
            }
            return;
        }
        if (this.isRecording && this.upcomingDialogId !== '!' + selectedId) {
            this.props.history.push(`/chat/${this.state.selectedDialogId}`);
            this.upcomingDialogId = selectedId;
            this.setState({
                confirmDialogMode: 'cancel_recording',
                confirmDialogOpen: true,
            });
            return;
        }
        this.cachedMessageService.clearPeerId(this.state.selectedDialogId);
        this.newMessageLoadThrottle.cancel();
        const selectedMessageId = newProps.match.params.mid;
        this.updateDialogsCounter(this.state.selectedDialogId, {scrollPos: this.lastMessageId});
        if (selectedId === 'null') {
            this.setState({
                peer: null,
                selectedDialogId: 'null',
            });
        } else {
            const peer = this.getPeerByDialogId(selectedId);
            this.setLoading(true);
            if (this.messageRef) {
                this.messageRef.setMessages([]);
            }
            this.setState({
                leftMenu: 'chat',
                messageSelectable: false,
                messageSelectedIds: {},
                peer,
                selectedDialogId: selectedId,
            }, () => {
                this.getMessagesByDialogId(selectedId, true, selectedMessageId);
            });
        }
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });

        window.removeEventListener('focus', this.windowFocusHandler);
        window.removeEventListener('blur', this.windowBlurHandler);
        window.removeEventListener('wasmInit', this.wasmInitHandler);
        window.removeEventListener('wsOpen', this.wsOpenHandler);
        window.removeEventListener('fnStarted', this.fnStartedHandler);
        window.removeEventListener('networkStatus', this.networkStatusHandler);
        window.removeEventListener('Dialog_Sync_Updated', this.dialogDBUpdatedHandler);
        window.removeEventListener('Message_Sync_Updated', this.messageDBUpdatedHandler);
    }

    public render() {
        const {
            confirmDialogMode, confirmDialogOpen, moreInfoAnchorEl, chatMoreAnchorEl, leftMenu, rightMenuShrink,
            /*leftMenuSub,*/ leftOverlay, textInputMessage, textInputMessageMode, peer, selectedDialogId, messageSelectable,
            messageSelectedIds, unreadCounter, blurMessage, iframeActive,
        } = this.state;
        const leftMenuRender = () => {
            switch (leftMenu) {
                default:
                case 'chat':
                    return (<Dialog ref={this.dialogRefHandler} selectedId={selectedDialogId}
                                    cancelIsTyping={this.cancelIsTypingHandler}
                                    onContextMenu={this.dialogContextMenuHandler}/>);
                case 'settings':
                    return (<SettingsMenu ref={this.settingsMenuRefHandler}
                                          updateMessages={this.settingUpdateMessageHandler}
                                          onClose={this.bottomBarSelectHandler.bind(this, 'chat')}
                                          onAction={this.settingActionHandler}
                                          onReloadDialog={this.settingReloadDialogHandler}/>);
                case 'contact':
                    return (<ContactMenu/>);
            }
        };
        const chatTopIcons = [{
            cmd: 'search',
            icon: <SearchRounded/>,
            tooltip: i18n.t('chat.search'),
        }, {
            cmd: 'new_message',
            icon: <EditRounded/>,
            tooltip: i18n.t('chat.new_message'),
        }, {
            cmd: 'more',
            icon: <MoreVertRounded/>,
            tooltip: i18n.t('chat.more'),
        }];

        const chatMoreMenuItem = [{
            cmd: 'new_group',
            title: i18n.t('chat.new_group'),
        }, {
            cmd: 'new_message',
            title: i18n.t('chat.new_message'),
        }, {
            cmd: 'account',
            title: i18n.t('chat.account_info'),
        }, {
            cmd: 'settings',
            title: i18n.t('chat.settings'),
        }, {
            role: 'divider',
        }, {
            cmd: 'logout',
            title: i18n.t('chat.log_out'),
        }];

        const messageMoreMenuItem = [{
            cmd: 'info',
            title: (peer && peer.getType() === PeerType.PEERGROUP) ? i18n.t('chat.group_info') : i18n.t('chat.contact_info'),
        }, {
            cmd: 'search',
            title: i18n.t('chat.search_messages'),
        }];

        return (
            <div className="bg">
                <div className="wrapper">
                    <div
                        ref={this.containerRefHandler}
                        className={'container' + (this.isMobileView ? ' mobile-view' : '')}>
                        <div
                            className={'column-left ' + (leftMenu === 'chat' ? 'with-top-bar' : '') + (leftOverlay ? ' left-overlay-enable' : '')}>
                            <div className="top-bar">
                                {iframeActive && <span className="close-btn">
                                    <Tooltip
                                        title={i18n.t('general.close')}
                                        placement="bottom"
                                        onClick={this.closeIframeHandler}
                                    >
                                        <IconButton>
                                            <CloseRounded/>
                                        </IconButton>
                                    </Tooltip>
                                </span>}
                                <span className="new-message">
                                    {iframeActive &&
                                    <a href="/" target="_blank"><RiverLogo height={28} width={28}/></a>}
                                    {!iframeActive && <RiverLogo height={28} width={28}/>}
                                </span>
                                <div className="actions">
                                    {chatTopIcons.map((item, key) => {
                                        return (
                                            <Tooltip
                                                key={key}
                                                title={item.tooltip}
                                                placement="bottom"
                                            >
                                                <IconButton
                                                    onClick={this.chatTopIconActionHandler.bind(this, item.cmd)}
                                                >{item.icon}</IconButton>
                                            </Tooltip>
                                        );
                                    })}
                                    <Menu
                                        anchorEl={chatMoreAnchorEl}
                                        open={Boolean(chatMoreAnchorEl)}
                                        onClose={this.chatMoreCloseHandler}
                                        className="kk-context-menu darker"
                                    >
                                        {chatMoreMenuItem.map((item, key) => {
                                            if (item.role === 'divider') {
                                                return (<Divider key={key}/>);
                                            } else {
                                                return (
                                                    <MenuItem key={key}
                                                              onClick={this.chatMoreActionHandler.bind(this, item.cmd)}
                                                              className="context-item"
                                                    >{item.title}</MenuItem>
                                                );
                                            }
                                        })}
                                    </Menu>
                                </div>
                            </div>
                            <div className="left-content">{leftMenuRender()}</div>
                            <BottomBar onSelect={this.bottomBarSelectHandler} selected={leftMenu}
                                       unreadCounter={unreadCounter}/>
                            <div className="left-overlay">
                                {leftOverlay &&
                                <NewGroupMenu onClose={this.leftOverlayCloseHandler}
                                              onCreate={this.onGroupCreateHandler}/>}
                            </div>
                        </div>
                        {selectedDialogId !== 'null' &&
                        <div
                            className={'column-center' + (rightMenuShrink ? ' shrink' : '') + (blurMessage ? ' blur' : '')}>
                            <div className="top">
                                <div className="info-bar">
                                    {this.isMobileView &&
                                    <div className="back-to-chats" onClick={this.backToChatsHandler}>
                                        <KeyboardArrowLeftRounded/></div>}
                                    <StatusBar ref={this.statusBarRefHandler} isConnecting={this.state.isConnecting}
                                               isOnline={this.state.isOnline}
                                               isUpdating={this.state.isUpdating}
                                               onAction={this.messageMoreActionHandler}
                                               peer={peer} selectedDialogId={selectedDialogId}/>
                                    <div className="buttons">
                                        <IconButton
                                            onClick={this.messageMoreOpenHandler}
                                        ><InfoOutlined/></IconButton>
                                        {/*<IconButton
                                            onClick={this.testHandler}
                                        ><InfoOutlined/></IconButton>
                                        <IconButton
                                            onClick={this.test2Handler}
                                        ><InfoOutlined/></IconButton>*/}
                                        <Menu
                                            anchorEl={moreInfoAnchorEl}
                                            open={Boolean(moreInfoAnchorEl)}
                                            onClose={this.messageMoreCloseHandler}
                                            className="kk-context-menu darker"
                                        >
                                            {messageMoreMenuItem.map((item, key) => {
                                                return (
                                                    <MenuItem key={key}
                                                              onClick={this.messageMoreActionHandler.bind(this, item.cmd)}
                                                              className="context-item"
                                                    >{item.title}</MenuItem>
                                                );
                                            })}
                                        </Menu>
                                    </div>
                                </div>
                                <AudioPlayerShell onVisible={this.audioPlayerVisibleHandler}
                                                  onAction={this.messageAttachmentActionHandler}/>
                            </div>
                            <div ref={this.conversationRefHandler} className="conversation">
                                <PopUpDate ref={this.popUpDateRefHandler}/>
                                <PopUpNewMessage ref={this.popUpNewMessageRefHandler}
                                                 onClick={this.popUpNewMessageClickHandler}/>
                                <SearchMessage ref={this.searchMessageHandler} peer={peer}
                                               onFind={this.searchMessageFindHandler}
                                               onClose={this.searchMessageCloseHandler}/>
                                <Message ref={this.messageRefHandler}
                                         readId={this.state.maxReadId}
                                         contextMenu={this.messageContextMenuHandler}
                                         peer={peer}
                                         showDate={this.messageShowDateHandler}
                                         showNewMessage={this.messageShowNewMessageHandler}
                                         selectable={messageSelectable}
                                         selectedIds={messageSelectedIds}
                                         onSelectedIdsChange={this.messageSelectedIdsChangeHandler}
                                         onSelectableChange={this.messageSelectableChangeHandler}
                                         onJumpToMessage={this.messageJumpToMessageHandler}
                                         onLastMessage={this.messageLastMessageHandler}
                                         onLoadMoreBefore={this.messageLoadMoreBeforeHandler}
                                         onLoadMoreAfter={this.messageLoadMoreAfterHandler}
                                         onLoadMoreAfterGap={this.messageLoadMoreAfterGapHandler}
                                         onAttachmentAction={this.messageAttachmentActionHandler}
                                         rendered={this.messageRenderedHandler}
                                         onDrop={this.messageDropHandler}
                                />
                                {this.getMoveDown()}
                            </div>
                            <ChatInput ref={this.chatInputRefHandler} onMessage={this.chatInputTextMessageHandler}
                                       onTyping={this.onTyping} userId={this.connInfo.UserID}
                                       previewMessage={textInputMessage} previewMessageMode={textInputMessageMode}
                                       onPreviewMessageChange={this.chatInputPreviewMessageChangeHandler}
                                       selectable={messageSelectable}
                                       selectableDisable={Boolean(messageSelectable && Object.keys(messageSelectedIds).length === 0)}
                                       onBulkAction={this.chatInputBulkActionHandler}
                                       onAction={this.chatInputActionHandler} peer={peer}
                                       onVoiceSend={this.chatInputVoiceHandler}
                                       onMediaSelected={this.chatInputMediaSelectHandler}
                                       onContactSelected={this.chatInputContactSelectHandler}
                                       onMapSelected={this.chatInputMapSelectHandler}
                                       onVoiceStateChange={this.chatInputVoiceStateChangeHandler}
                            />
                        </div>}
                        {selectedDialogId === 'null' && <div className="column-center">
                            <div className="start-messaging no-result">
                                <div className="start-messaging-header">
                                    {this.getConnectionStatus()}
                                </div>
                                <div className="start-messaging-img">
                                    <div className="image"/>
                                </div>
                                <div className="start-messaging-title">{i18n.t('chat.chat_placeholder')}</div>
                                <div className="start-messaging-footer"/>
                            </div>
                        </div>}
                        <div ref={this.rightMenuRefHandler} className="column-right">
                            {(this.state.rightMenu && peer && peer.getType() === PeerType.PEERGROUP) &&
                            <GroupInfoMenu peer={peer} onClose={this.setRightMenu.bind(this, false)}
                                           onAction={this.messageAttachmentActionHandler}
                                           onDeleteAndExitGroup={this.groupInfoDeleteAndExitHandler}/>}
                            {(this.state.rightMenu && peer && peer.getType() === PeerType.PEERUSER) &&
                            <UserInfoMenu peer={peer} onClose={this.setRightMenu.bind(this, false)}
                                          onAction={this.messageAttachmentActionHandler}/>}
                        </div>
                    </div>
                    <NewMessage open={this.state.openNewMessage} onClose={this.onNewMessageClose}
                                onMessage={this.onNewMessageHandler}/>
                </div>
                <OverlayDialog
                    open={confirmDialogOpen}
                    onClose={this.confirmDialogCloseHandler}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    className="confirm-dialog"
                >
                    {Boolean(confirmDialogMode === 'logout') && <div>
                        <DialogTitle>{i18n.t('chat.logout_dialog.title')}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {i18n.t('chat.logout_dialog.p1')}<br/>
                                {i18n.t('chat.logout_dialog.p2')}<br/>
                                {i18n.t('chat.logout_dialog.p3')}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                                {i18n.t('general.disagree')}
                            </Button>
                            <Button onClick={this.confirmDialogAcceptHandler} color="primary" autoFocus={true}>
                                {i18n.t('general.agree')}
                            </Button>
                        </DialogActions>
                    </div>}
                    {Boolean(confirmDialogMode === 'remove_message' || confirmDialogMode === 'remove_message_revoke' || confirmDialogMode === 'remove_message_pending') &&
                    <div>
                        <DialogTitle>{i18n.t('chat.remove_message_dialog.title')}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {i18n.tf('chat.remove_message_dialog.content', String(Object.keys(messageSelectedIds).length))}<br/>
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                                {i18n.t('general.disagree')}
                            </Button>
                            <Button onClick={this.removeMessageHandler.bind(this, 0)} color="primary"
                                    autoFocus={true}>
                                {i18n.t('chat.remove_message_dialog.remove')}
                            </Button>
                            {Boolean(confirmDialogMode === 'remove_message_revoke') &&
                            <Button onClick={this.removeMessageHandler.bind(this, 1)} color="primary">
                                {i18n.t('chat.remove_message_dialog.remove_for_all')}
                            </Button>}
                            {Boolean(confirmDialogMode === 'remove_message_pending') &&
                            <Button onClick={this.removeMessageHandler.bind(this, 2)} color="primary">
                                {i18n.t('chat.remove_message_dialog.remove_all_pending')}
                            </Button>}
                        </DialogActions>
                    </div>}
                    {Boolean(confirmDialogMode === 'delete_exit_group') &&
                    <div>
                        <DialogTitle>{i18n.t('chat.exit_group_dialog.title')}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {i18n.t('chat.exit_group_dialog.p1')}<GroupName className="group-name"
                                                                                id={this.state.leftMenuSelectedDialogId}/> ?<br/>
                                {i18n.t('chat.exit_group_dialog.p2')}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                                {i18n.t('general.disagree')}
                            </Button>
                            <Button onClick={this.deleteAndExitGroupHandler} color="primary" autoFocus={true}>
                                {i18n.t('general.agree')}
                            </Button>
                        </DialogActions>
                    </div>}
                    {Boolean(confirmDialogMode === 'delete_user') &&
                    <div>
                        <DialogTitle>{i18n.t('chat.delete_dialog.title')}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {i18n.t('chat.delete_dialog.p1')} <UserName className="group-name"
                                                                            id={this.state.leftMenuSelectedDialogId}
                                                                            you={this.state.leftMenuSelectedDialogId === this.connInfo.UserID}
                                                                            youPlaceholder={i18n.t('general.saved_messages')}
                            /> ?<br/>
                                {i18n.t('chat.delete_dialog.p2')}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                                {i18n.t('general.disagree')}
                            </Button>
                            <Button onClick={this.deleteUserHandler} color="primary" autoFocus={true}>
                                {i18n.t('general.agree')}
                            </Button>
                        </DialogActions>
                    </div>}
                    {Boolean(confirmDialogMode === 'cancel_recording') &&
                    <div>
                        <DialogTitle>{i18n.t('chat.cancel_recording_dialog.title')}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {i18n.t('chat.cancel_recording_dialog.p')}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                                {i18n.t('general.cancel')}
                            </Button>
                            <Button onClick={this.cancelRecordingHandler} color="primary" autoFocus={true}>
                                {i18n.t('general.yes')}
                            </Button>
                        </DialogActions>
                    </div>}
                </OverlayDialog>
                <ForwardDialog ref={this.forwardDialogRefHandler} onDone={this.forwardDialogDoneHandler}
                               onClose={this.forwardDialogCloseHandler}/>
                <UserDialog ref={this.userDialogRefHandler}/>
                <DocumentViewer onAction={this.messageAttachmentActionHandler}/>
                <AboutDialog ref={this.aboutDialogRefHandler}/>
            </div>
        );
    }

    private containerRefHandler = (ref: any) => {
        this.containerRef = ref;
    }

    private chatInputRefHandler = (ref: any) => {
        this.chatInputComponent = ref;
    }

    /* Set chat view
    *  For responsive view */
    private setChatView(enable: boolean) {
        if (!this.containerRef) {
            return;
        }
        if (enable) {
            this.containerRef.classList.add('chat-view');
        } else {
            this.containerRef.classList.remove('chat-view');
        }
    }

    private getConnectionStatus() {
        if (this.state.isConnecting) {
            return (<span>Connecting...</span>);
        } else if (this.state.isUpdating) {
            return (<span>Updating...</span>);
        } else {
            return '';
        }
    }

    private moreInfoCloseHandler = () => {
        this.setState({
            moreInfoAnchorEl: null,
        });
    }

    // private attachmentToggleHandler = () => {
    //     this.setState({
    //         toggleAttachment: !this.state.toggleAttachment,
    //     });
    // }

    private toggleRightMenu = () => {
        this.setRightMenu();
    }

    private setRightMenu = (force?: boolean) => {
        this.moreInfoCloseHandler();
        let rightMenu: boolean = true;
        if (force === undefined) {
            this.rightMenuRef.classList.toggle('active');
            if (this.rightMenuRef.classList.contains('active')) {
                rightMenu = true;
                this.setState({
                    blurMessage: true,
                    rightMenu: true,
                });
            } else {
                rightMenu = false;
                this.setState({
                    blurMessage: true,
                    rightMenuShrink: false,
                });
            }
        } else {
            if (!force) {
                this.rightMenuRef.classList.remove('active');
                rightMenu = false;
                this.setState({
                    blurMessage: true,
                    rightMenuShrink: false,
                });
            } else {
                this.rightMenuRef.classList.add('active');
                rightMenu = true;
                this.setState({
                    blurMessage: true,
                    rightMenu: true,
                });
            }
        }
        setTimeout(() => {
            this.messageRef.cache.clearAll();
            this.messageRef.list.recomputeRowHeights();
            this.messageRef.list.recomputeGridSize();
            this.messageRef.animateToEnd(true);
            if (!rightMenu) {
                this.setState({
                    rightMenu: false,
                });
            } else {
                this.setState({
                    rightMenuShrink: true,
                });
            }
        }, 300);
        setTimeout(() => {
            this.setState({
                blurMessage: false,
            });
        }, 700);
    }

    private chatMoreOpenHandler = (event: any) => {
        this.setState({
            chatMoreAnchorEl: event.currentTarget,
        });
    }

    private chatMoreCloseHandler = () => {
        this.setState({
            chatMoreAnchorEl: null,
        });
    }

    private messageMoreOpenHandler = (event: any) => {
        this.setState({
            moreInfoAnchorEl: event.currentTarget,
        });
    }

    private messageMoreCloseHandler = () => {
        this.setState({
            moreInfoAnchorEl: null,
        });
    }

    private chatTopIconActionHandler = (cmd: string, e: any) => {
        this.chatMoreCloseHandler();
        switch (cmd) {
            case 'search':
                this.dialogRef.toggleSearch();
                break;
            case 'new_message':
                this.onNewMessageOpen();
                break;
            case 'more':
                this.chatMoreOpenHandler(e);
                break;
        }
    }

    private chatMoreActionHandler = (cmd: string) => {
        this.chatMoreCloseHandler();
        switch (cmd) {
            case 'new_group':
                this.setState({
                    leftOverlay: true,
                });
                break;
            case 'new_message':
                this.onNewMessageOpen();
                break;
            case 'account':
                this.setState({
                    leftMenu: 'settings',
                }, () => {
                    if (this.settingsMenuRef) {
                        this.settingsMenuRef.navigateToPage('account', 'none');
                    }
                });
                break;
            case 'settings':
                this.setState({
                    leftMenu: 'settings',
                });
                break;
            case 'logout':
                this.bottomBarSelectHandler('logout');
                break;
        }
    }

    private messageMoreActionHandler = (cmd: string) => {
        this.messageMoreCloseHandler();
        switch (cmd) {
            case 'info':
                this.toggleRightMenu();
                break;
            case 'search':
                if (this.searchMessageRef) {
                    this.searchMessageRef.toggleVisible();
                }
                break;
        }
    }

    private dialogRefHandler = (ref: any) => {
        this.dialogRef = ref;
        if (this.dialogRef) {
            this.dialogRef.setDialogs(this.dialogs);
        }
    }

    private statusBarRefHandler = (ref: any) => {
        this.statusBarRef = ref;
    }

    private rightMenuRefHandler = (ref: any) => {
        this.rightMenuRef = ref;
    }

    private popUpDateRefHandler = (ref: any) => {
        this.popUpDateRef = ref;
    }

    private popUpNewMessageRefHandler = (ref: any) => {
        this.popUpNewMessageRef = ref;
    }

    private popUpNewMessageClickHandler = () => {
        if (this.messageRef) {
            this.messageRef.focusOnNewMessage();
        }
    }

    private searchMessageHandler = (ref: any) => {
        this.searchMessageRef = ref;
    }

    private messageRefHandler = (ref: any) => {
        this.messageRef = ref;
    }

    private settingsMenuRefHandler = (ref: any) => {
        this.settingsMenuRef = ref;
    }

    /* Init dialogs */
    private initDialogs = () => {
        this.dialogRepo.getManyCache({}).then((res) => {
            const selectedId = this.props.match.params.id;
            const selectedMessageId = this.props.match.params.mid;
            this.dialogsSort(res, () => {
                if (selectedId !== 'null') {
                    const peer = this.getPeerByDialogId(selectedId);
                    this.setState({
                        leftMenu: 'chat',
                        peer,
                        selectedDialogId: selectedId,
                    }, () => {
                        this.getMessagesByDialogId(selectedId, true, selectedMessageId);
                    });
                }
            });
            this.setLoading(false);
        }).catch(() => {
            this.setLoading(false);
        });
    }

    /* Out of sync handler */
    private outOfSyncHandler = () => {
        if (this.state.isUpdating) {
            return;
        }
        window.console.debug('snapshot!');
        this.canSync().then(() => {
            this.updateManager.disable();
            this.setState({
                isUpdating: true,
            });
        }).catch(() => {
            this.updateManager.enable();
            if (this.state.isUpdating) {
                this.setState({
                    isUpdating: false,
                });
            }
        });
    }

    /* Update new message handler */
    private updateNewMessageHandler = (data: INewMessageBulkUpdate) => {
        if (this.state.isUpdating) {
            return;
        }
        this.messageRepo.lazyUpsert(data.messages);
        this.userRepo.importBulk(false, data.senders.map((o, index) => {
            if (data.messages[index] && o.id && data.messages[index].senderid === o.id) {
                o.status = UserStatus.USERSTATUSONLINE;
                if (data.messages.length > 0) {
                    // @ts-ignore
                    o.status_last_modified = data.messages[0].createdon || 0;
                }
            }
            return o;
        }));
        if (data.peerid === this.state.selectedDialogId && this.messageRef) {
            // Check if Top Message exits
            const dialog = this.getDialogById(this.state.selectedDialogId);
            // @ts-ignore
            if (dialog && this.messages.length > 0 && this.messages[this.messages.length - 1] && (dialog.topmessageid || 0) <= (this.messages[this.messages.length - 1].id || 0)) {
                const dataMsg = this.modifyMessages(this.messages, data.messages.reverse(), true);
                data.messages.reverse().forEach((message) => {
                    this.checkMessageOrder(message);
                });
                if (!this.endOfMessage && this.isInChat) {
                    this.setScrollMode('end');
                } else {
                    this.setScrollMode('none');
                }
                this.messageRef.setMessages(dataMsg.msgs, () => {
                    // Scroll down if possible
                    if (!this.endOfMessage && this.isInChat) {
                        if (dataMsg.maxReadId !== -1) {
                            if (this.scrollInfo && this.scrollInfo.stopIndex && this.messages[this.scrollInfo.stopIndex]) {
                                this.sendReadHistory(this.state.peer, Math.floor(this.messages[this.scrollInfo.stopIndex].id || 0), this.scrollInfo.stopIndex);
                            } else {
                                this.sendReadHistory(this.state.peer, dataMsg.maxReadId);
                            }
                        }
                    }
                });
            }
        }

        // Update dialogs
        data.messages.forEach((message, index) => {
            if (data.accessHashes[index]) {
                this.updateDialogs(message, data.accessHashes[index] || '0');
            }
        });

        // Notify user if possible
        this.notifyMessage(data);

        /* Check message flags
         * In this section we check clear history and pending messages
         * Also counters will be increased here
         */
        data.messages.forEach((message) => {
            if (!message || !message.id) {
                return;
            }
            this.checkPendingMessage(message.id || 0);
            this.downloadThumbnail(message);
            // Clear the message history
            if (message.messageaction === C_MESSAGE_ACTION.MessageActionClearHistory) {
                this.messageRepo.clearHistory(message.peerid || '', message.actiondata.maxid).then(() => {
                    if (message.peerid === this.state.selectedDialogId && this.messages.length > 1 && this.messageRef) {
                        this.messageRef.cache.clearAll();
                        this.messages.splice(0, this.messages.length - 1);
                        this.messageRef.list.recomputeGridSize();
                        this.messageRef.fitList();
                    }
                    this.updateDialogsCounter(message.peerid || '', {
                        mentionCounter: 0,
                        unreadCounter: 0,
                    });
                    if (message.actiondata.pb_delete) {
                        // Remove dialog
                        this.dialogRemove(message.peerid || '');
                    }
                });
            } else if (!message.me && (message.peerid !== this.state.selectedDialogId || this.endOfMessage || !this.isInChat)) {
                this.messageRepo.exists(message.id || 0).then((exists) => {
                    if (!exists) {
                        this.updateDialogsCounter(message.peerid || '', {
                            mentionCounterIncrease: (message.mention_me ? 1 : 0),
                            scrollPos: -1,
                            unreadCounterIncrease: 1,
                        });
                    }
                });
            }
        });
    }

    /* Update drop message */
    private updateMessageDropHandler = (data: INewMessageBulkUpdate) => {
        if (this.state.isUpdating) {
            return;
        }
        this.messageRepo.lazyUpsert(data.messages);
        this.userRepo.importBulk(false, data.senders);
        data.messages.forEach((message, index) => {
            if (!message) {
                return;
            }
            this.checkPendingMessage(message.id || 0);
            this.updateDialogs(message, data.accessHashes[index] || '0');
        });
    }

    /* Update message edit */
    private updateMessageEditHandler = (data: UpdateMessageEdited.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        this.messageRepo.lazyUpsert([data.message]);
        const dialog = this.getDialogById(data.message.peerid || '');
        if (dialog) {
            if (dialog.topmessageid === data.message.id) {
                this.updateDialogs(data.message, dialog.accesshash || '0', true);
            }
        }
        if (this.state.selectedDialogId === data.message.peerid) {
            const messages = this.messages;
            const index = findIndex(messages, (o) => {
                return o.id === data.message.id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
            });
            if (index > -1) {
                const avatar = messages[index].avatar;
                messages[index] = data.message;
                messages[index].avatar = avatar;
                if (this.messageRef) {
                    this.messageRef.cache.clear(index, 0);
                    this.messageRef.list.recomputeRowHeights(index);
                    this.messageRef.list.recomputeGridSize();
                    this.messageRef.list.forceUpdateGrid();
                }
            }
        }
    }

    /* Update user typing */
    private updateUserTypeHandler = (data: UpdateUserTyping.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        const isTypingList = this.isTypingList;
        if (data.action !== TypingAction.TYPINGACTIONCANCEL) {
            const fn = setTimeout(() => {
                if (isTypingList.hasOwnProperty(data.peerid || '')) {
                    if (isTypingList[data.peerid || ''].hasOwnProperty(data.userid || 0)) {
                        delete isTypingList[data.peerid || ''][data.userid || 0];
                        if (this.dialogRef) {
                            this.dialogRef.setIsTypingList(isTypingList);
                        }
                        if (this.statusBarRef) {
                            this.statusBarRef.setIsTypingList(isTypingList);
                        }
                    }
                }
            }, 6000);
            if (!isTypingList.hasOwnProperty(data.peerid || '')) {
                isTypingList[data.peerid || ''] = {};
                isTypingList[data.peerid || ''][data.userid || 0] = {
                    action: data.action || TypingAction.TYPINGACTIONTYPING,
                    fn,
                };
            } else {
                if (isTypingList[data.peerid || ''].hasOwnProperty(data.userid || 0)) {
                    clearTimeout(isTypingList[data.peerid || ''][data.userid || 0].fn);
                }
                isTypingList[data.peerid || ''][data.userid || 0] = {
                    action: data.action || TypingAction.TYPINGACTIONTYPING,
                    fn,
                };
            }
            if (this.dialogRef) {
                this.dialogRef.setIsTypingList(isTypingList);
            }
            if (this.statusBarRef) {
                this.statusBarRef.setIsTypingList(isTypingList);
            }
        } else if (data.action === TypingAction.TYPINGACTIONCANCEL) {
            if (isTypingList.hasOwnProperty(data.peerid || '')) {
                if (isTypingList[data.peerid || ''].hasOwnProperty(data.userid || 0)) {
                    clearTimeout(isTypingList[data.peerid || ''][data.userid || 0].fn);
                    delete isTypingList[data.peerid || ''][data.userid || 0];
                    if (this.dialogRef) {
                        this.dialogRef.setIsTypingList(isTypingList);
                    }
                    if (this.statusBarRef) {
                        this.statusBarRef.setIsTypingList(isTypingList);
                    }
                }
            }
        }
    }

    /* Update read history inbox handler */
    private updateReadInboxHandler = (data: UpdateReadHistoryInbox.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        window.console.debug('UpdateMaxInbox:', data.maxid);
        const peerId = data.peer.id || '';
        const dialog = this.getDialogById(peerId);
        if (!dialog) {
            return;
        }
        const readinboxmaxid = dialog.readinboxmaxid || 0;
        this.updateDialogsCounter(peerId, {maxInbox: data.maxid});
        const fn = () => {
            delete this.updateReadInboxTimeout[peerId];
            this.messageRepo.getUnreadCount(peerId, data.maxid || 0, dialog ? (dialog.topmessageid || 0) : 0).then((count) => {
                this.updateDialogsCounter(peerId, {
                    mentionCounter: count.mention,
                    unreadCounter: count.message,
                });
            });
        };
        if (this.state.selectedDialogId === (data.peer.id || '')) {
            if (readinboxmaxid < (data.maxid || 0)) {
                if (this.updateReadInboxTimeout.hasOwnProperty(peerId)) {
                    clearTimeout(this.updateReadInboxTimeout[peerId]);
                }
                this.updateReadInboxTimeout[peerId] = setTimeout(fn, 500);
            }
        } else {
            fn();
        }
    }

    /* Update read history outbox handler */
    private updateReadOutboxHandler = (data: UpdateReadHistoryOutbox.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        window.console.debug('UpdateMaxOutbox:', data.maxid, data.peer.id);
        this.userRepo.importBulk(false, [{
            id: data.peer.id,
            status: UserStatus.USERSTATUSONLINE,
        }]);
        this.updateDialogsCounter(data.peer.id || '', {maxOutbox: data.maxid});
        if (data.peer.id === this.state.selectedDialogId) {
            this.setState({
                maxReadId: data.maxid || 0,
            }, () => {
                if (this.messageRef) {
                    this.messageRef.list.forceUpdateGrid();
                }
            });
        }
    }

    /* Update message delete handler */
    private updateMessageDeleteHandler = (data: UpdateMessagesDeleted.AsObject) => {
        if (this.state.isUpdating || !data.peer) {
            return;
        }
        const peer = data.peer;
        this.messageRepo.removeMany(data.messageidsList).then(() => {
            const dialogPeer = this.getDialogById(peer.id || '');
            if (dialogPeer) {
                this.messageRepo.getUnreadCount(peer.id || '', dialogPeer ? (dialogPeer.readinboxmaxid || 0) : 0, dialogPeer ? (dialogPeer.topmessageid || 0) : 0).then((count) => {
                    this.updateDialogsCounter(peer.id || '', {
                        mentionCounter: count.mention,
                        unreadCounter: count.message
                    });
                });
            }

            // Check if current dialog is visible
            data.messageidsList.sort().forEach((id) => {
                // Update dialog list Top Message
                const dialogIndex = findIndex(this.dialogs, {topmessageid: id});
                let dialog: IDialog | null = null;
                if (dialogIndex < 0) {
                    dialog = this.getDialogById(peer.id || '');
                }
                if (dialogIndex > -1 || (dialog && dialog.topmessageid === id)) {
                    const inputPeer = new InputPeer();
                    inputPeer.setId(peer.id || '');
                    inputPeer.setAccesshash(peer.accesshash || '0');
                    inputPeer.setType(peer.type || 0);
                    if (id > 1) {
                        this.messageRepo.getManyCache({before: id, limit: 1}, inputPeer).then((res) => {
                            if (res.messages.length > 0) {
                                this.updateDialogs(res.messages[0], peer.accesshash || '0', true);
                            }
                        });
                    }
                }
                if (peer.id === this.state.selectedDialogId) {
                    const messages = this.messages;
                    let updateView = false;
                    const index = findLastIndex(messages, (o) => {
                        return o.id === id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                    });
                    if (index > -1) {
                        updateView = true;
                        // Delete visible message if possible
                        this.messageRef.cache.clear(index, 0);
                        messages.splice(index, 1);
                        // Clear date indicator if possible
                        const indexAlpha = index - 1;
                        if (indexAlpha > -1 && messages.length > index) {
                            // If date indicator were in current range boundaries
                            if (messages[indexAlpha].messagetype === C_MESSAGE_TYPE.Date && messages[index].messagetype === C_MESSAGE_TYPE.Date) {
                                this.messageRef.cache.clear(indexAlpha, 0);
                                messages.splice(indexAlpha, 1);
                            }
                        } else if (indexAlpha > -1 && messages.length === index) {
                            // If it was last message
                            if (messages[indexAlpha].messagetype === C_MESSAGE_TYPE.Date) {
                                this.messageRef.cache.clear(indexAlpha, 0);
                                messages.splice(indexAlpha, 1);
                            }
                        }
                    }
                    // Update current message list if visible
                    if (updateView) {
                        this.messageRef.list.recomputeGridSize();
                        this.messageRef.fitList();
                    }
                }
            });
        });
    }

    /* Update username handler */
    private updateUsernameHandler = (data: UpdateUsername.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        this.userRepo.importBulk(false, [{
            bio: data.bio,
            firstname: data.firstname,
            id: data.userid,
            lastname: data.lastname,
            username: data.username,
        }], true);
    }

    /* Update notify settings handler */
    private updateNotifySettingsHandler = (data: UpdateNotifySettings.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        this.updateDialogsNotifySettings(data.notifypeer.id || '', data.settings);
    }

    /* Update content read handler */
    private updateContentReadHandler = (data: UpdateReadMessagesContents.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        let updateView = false;
        const messages = this.messages;
        const msgs: IMessage[] = data.messageidsList.map((id) => {
            if (this.state.selectedDialogId === data.peer.id) {
                const index = findIndex(messages, (o) => {
                    return o.id === id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                });
                if (index > -1) {
                    messages[index].contentread = true;
                    updateView = true;
                }
            }
            return {
                contentread: true,
                id,
            };
        });
        this.messageRepo.lazyUpsert(msgs);
        if (updateView) {
            this.messageRef.list.forceUpdateGrid();
        }
    }

    /* Update user handler */
    private updateUserHandler = (data: User[]) => {
        if (this.state.isUpdating) {
            return;
        }
        // @ts-ignore
        this.userRepo.importBulk(data);
    }

    /* Update user photo handler */
    private updateUserPhotoHandler = (data: UpdateUserPhoto.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        this.userRepo.importBulk(false, [{
            id: data.userid,
            photo: data.photo,
        }]);
    }

    /* Update group handler */
    private updateGroupHandler = (data: Group[]) => {
        if (this.state.isUpdating) {
            return;
        }
        // @ts-ignore
        this.groupRepo.importBulk(data);
    }

    /* Update group photo handler */
    private updateGroupPhotoHandler = (data: UpdateGroupPhoto.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        this.groupRepo.importBulk([{
            delete_photo: data.photo ? undefined : true,
            id: data.groupid,
            photo: data.photo,
        }]);
    }

    /* Electron preferences click handler */
    private electronSettingsHandler = () => {
        this.bottomBarSelectHandler('settings');
    }

    /* Electron about click handler */
    private electronAboutHandler = (version: string) => {
        if (this.aboutDialogRef) {
            this.aboutDialogRef.openDialog(version);
        }
    }

    /* Electron log out click handler */
    private electronLogoutHandler = () => {
        this.bottomBarSelectHandler('logout');
    }

    /* Electron size mode change handler */
    private electronSizeModeHandler = (mode: string) => {
        this.isMobileView = (mode === 'responsive');
        this.forceUpdate();
    }

    private getMessagesByDialogId(dialogId: string, force?: boolean, messageId?: string, beforeMsg?: number) {
        // if (this.isLoading) {
        //     return;
        // }

        this.newMessageFlag = false;

        const {peer} = this.state;
        if (!peer) {
            this.setLoading(false);
            return;
        }

        this.messages = [];

        if (this.chatInputComponent) {
            this.chatInputComponent.setLastMessage(null);
        }

        const updateState = () => {
            this.messageRef.list.recomputeRowHeights();
            this.messageRef.list.recomputeGridSize();
        };

        const dialog = this.getDialogById(dialogId);

        let before = 10000000000;
        // Scroll pos check
        if (beforeMsg !== undefined) {
            before = beforeMsg + 1;
        } else {
            if (dialog) {
                if ((dialog.scroll_pos || -1) !== -1) {
                    before = dialog.scroll_pos || 0;
                } else if ((dialog.unreadcount || 0) > 1) {
                    const tBefore = Math.max((dialog.readinboxmaxid || 0), (dialog.readoutboxmaxid || 0));
                    if (tBefore > 0) {
                        before = tBefore + 1;
                    }
                }
            }
        }

        let minId: number = 0;
        this.setChatView(true);

        this.messageRepo.getMany({peer, limit: 40, before, ignoreMax: true}, (data) => {
            // Checks peerid on transition
            if (this.state.selectedDialogId !== dialogId) {
                this.setLoading(false);
                return;
            }

            let maxReadId = 0;
            let maxReadInbox = 0;
            if (dialog) {
                maxReadId = dialog.readoutboxmaxid || 0;
                maxReadInbox = dialog.readinboxmaxid || 0;
            }

            this.setScrollMode('end');
            const dataMsg = this.modifyMessages(this.messages, data.reverse(), true, maxReadInbox);
            minId = dataMsg.minId;

            this.setState({
                isChatView: true,
                maxReadId,
            }, () => {
                if (!this.messageRef) {
                    this.setLoading(false);
                    return;
                }
                if (dialog) {
                    this.messageRef.setTopMessage(dialog.topmessageid || 0);
                }
                this.messageRef.cache.clearAll();
                this.messageRef.setMessages(dataMsg.msgs, () => {
                    if (force === true) {
                        updateState();
                    }
                    clearTimeout(this.mobileBackTimeout);
                }, Boolean(beforeMsg));
            });
        }).then((resMsgs) => {
            // Checks peerid on transition
            if (this.state.selectedDialogId !== dialogId) {
                this.setLoading(false);
                return;
            }

            if (this.chatInputComponent) {
                this.chatInputComponent.focus();
            }

            const minIdIndex = findIndex(resMsgs, {id: minId});
            if (minIdIndex > -1) {
                resMsgs.splice(0, minIdIndex + 1);
            }

            this.setScrollMode('end');
            if (!beforeMsg) {
                this.messageRef.takeSnapshot();
            }
            const dataMsg = this.modifyMessages(this.messages, resMsgs, false);
            if (this.messages.length === 0) {
                this.setMoveDownVisible(false);
                this.setEndOfMessage(false);
                this.setLoading(false);
            }
            this.messageRef.setMessages(dataMsg.msgs, () => {
                if (messageId && messageId !== '0') {
                    this.messageJumpToMessageHandler(parseInt(messageId, 10));
                }
                setTimeout(() => {
                    this.setLoading(false);
                    if (this.messageRef) {
                        this.messageRef.keepView();
                    }
                }, 100);
                if (this.messageRef) {
                    this.messageRef.removeSnapshot(300);
                    setTimeout(() => {
                        this.messageLoadMoreAfterHandler();
                    }, 250);
                }
            });
        }).catch(() => {
            this.setChatView(true);
            this.setState({
                isChatView: true,
            });
            clearTimeout(this.mobileBackTimeout);
            this.setLoading(false);
        });
    }

    private messageLoadMoreAfterHandler = () => {
        if (this.isLoading) {
            return;
        }
        const {peer} = this.state;
        if (!peer) {
            return;
        }
        const peerId = peer.getId() || '';
        if (this.state.selectedDialogId !== peerId) {
            this.setLoading(false);
            return;
        }
        const dialog = this.getDialogById(peerId);
        if (!dialog) {
            return;
        }
        const after = this.getValidAfter();
        if ((dialog.topmessageid || 0) <= after && (dialog.unreadcount || 0) === 0 || after === 0) {
            return;
        }

        window.console.log('messageLoadMoreAfterHandler');
        this.setLoading(true);
        this.messageRepo.getManyCache({
            after,
            ignoreMax: true,
            limit: 25,
            peer
        }, peer).then((res) => {
            if (this.state.selectedDialogId !== peerId || !this.messageRef) {
                this.setLoading(false);
                return;
            }
            this.setScrollMode('none');
            this.setMoveDownVisible(res.messages.length > 0);
            this.setEndOfMessage(res.messages.length > 0);
            setTimeout(() => {
                const dataMsg = this.modifyMessages(this.messages, res.messages, true, dialog.readinboxmaxid || 0);
                this.messageRef.setMessages(dataMsg.msgs);
                this.setLoading(false);
            }, 1);
        }).catch(() => {
            this.setLoading(false);
        });
    }

    private messageLoadMoreBeforeHandler = () => {
        if (this.isLoading) {
            return;
        }

        const {peer} = this.state;
        if (!peer) {
            return;
        }

        if (this.messages[0].id === 1) {
            return;
        }

        window.console.log('messageLoadMoreBeforeHandler');

        const dialogId = peer.getId() || '';

        this.setLoading(true);

        this.messageRepo.getMany({
            before: this.messages[0].id,
            limit: 25,
            peer,
        }).then((data) => {
            // Checks peerid on transition
            if (this.state.selectedDialogId !== dialogId || data.length === 0 || !this.messageRef) {
                this.setLoading(false);
                return;
            }
            this.messageRef.disableScroll();
            this.messageRef.takeSnapshot();
            this.setScrollMode('stay');
            setTimeout(() => {
                const messages = this.messages;
                const messageSize = messages.length;
                const dataMsg = this.modifyMessages(messages, data, false);
                this.messageRef.setMessages(dataMsg.msgs, () => {
                    this.messageRef.enableScroll();
                    // clears the gap between each message load
                    for (let i = 0; i <= (dataMsg.msgs.length - messageSize) + 1; i++) {
                        this.messageRef.cache.clear(i, 0);
                    }
                    this.messageRef.list.recomputeGridSize();
                    setTimeout(() => {
                        this.setLoading(false);
                    }, 100);
                    // this.messageComponent.removeSnapshot(500);
                });
            }, 10);
        }).catch(() => {
            this.setLoading(false);
        });
    }

    private modifyMessages(defaultMessages: IMessage[], messages: IMessage[], push: boolean, messageReadId?: number): { maxId: number, maxReadId: number, minId: number, msgs: IMessage[] } {
        let maxId = 0;
        let minId = Infinity;
        let maxReadId = -1;
        messages.forEach((msg, key) => {
            if (!msg) {
                return;
            }
            if (msg.id && msg.id > maxReadId && msg.id > 0 && !msg.me) {
                maxReadId = msg.id;
            }
            if (msg.id && msg.id > maxId && msg.id > 0) {
                maxId = msg.id;
            }
            if (msg.id && msg.id < minId && msg.id > 0) {
                minId = msg.id;
            }
            if (push) {
                // avatar breakpoint
                msg.avatar =
                    (key === 0 && (defaultMessages.length === 0 || (defaultMessages.length > 0 && msg.senderid !== defaultMessages[defaultMessages.length - 1].senderid))) ||
                    (key > 0 && msg.senderid !== messages[key - 1].senderid) ||
                    (key > 0 && messages[key - 1].messageaction !== C_MESSAGE_ACTION.MessageActionNope);

                // date breakpoint
                if (msg.messagetype !== C_MESSAGE_TYPE.End && ((key === 0 && (defaultMessages.length === 0 || (defaultMessages.length > 0 && !TimeUtility.isInSameDay(msg.createdon, defaultMessages[defaultMessages.length - 1].createdon))))
                    || (key > 0 && !TimeUtility.isInSameDay(msg.createdon, messages[key - 1].createdon)))) {
                    defaultMessages.push({
                        createdon: msg.createdon,
                        id: msg.id,
                        messagetype: C_MESSAGE_TYPE.Date,
                        senderid: msg.senderid,
                    });
                    msg.avatar = true;
                }

                if (messageReadId !== undefined && !this.newMessageFlag && (msg.id || 0) > messageReadId && !msg.me) {
                    defaultMessages.push({
                        createdon: msg.createdon,
                        id: (msg.id || 0) + 0.5,
                        messagetype: C_MESSAGE_TYPE.NewMessage,
                    });
                    this.newMessageFlag = true;
                    msg.avatar = true;
                }

                defaultMessages.push(msg);
            }

            if (!push) {
                if (defaultMessages.length > 0 && defaultMessages[0]) {
                    if (key === 0 && defaultMessages[0] && defaultMessages[0].messagetype === C_MESSAGE_TYPE.Date) {
                        if (TimeUtility.isInSameDay(msg.createdon, defaultMessages[0].createdon)) {
                            defaultMessages.splice(0, 1);
                        }
                    }

                    if (key === 0 && defaultMessages.length > 1 && defaultMessages[0].messagetype === C_MESSAGE_TYPE.Normal && defaultMessages[1].senderid === msg.senderid) {
                        defaultMessages[0].avatar = false;
                    }

                    // avatar breakpoint
                    defaultMessages[0].avatar = (msg.senderid !== defaultMessages[0].senderid || (defaultMessages[0].messageaction || 0) !== C_MESSAGE_ACTION.MessageActionNope);
                    msg.avatar = (messages.length - 1 === key);
                    // end of avatar breakpoint
                }

                defaultMessages.unshift(msg);
                // date breakpoint
                if (msg.messagetype !== C_MESSAGE_TYPE.End && (messages.length - 1 === key // End of message list
                    || (defaultMessages.length > 1 && !TimeUtility.isInSameDay(msg.createdon, defaultMessages[1].createdon)))) {
                    defaultMessages.unshift({
                        createdon: msg.createdon,
                        id: msg.id,
                        messagetype: C_MESSAGE_TYPE.Date,
                        senderid: msg.senderid,
                    });
                    if (defaultMessages.length > 1) {
                        defaultMessages[1].avatar = true;
                    }
                }
            }
        });
        return {
            maxId,
            maxReadId,
            minId,
            msgs: defaultMessages,
        };
    }

    private modifyMessagesBetween(defaultMessages: IMessage[], messages: IMessage[], id: number): { msgs: IMessage[], index: number, lastIndex: number } {
        const index = findIndex(defaultMessages, {id, messagetype: C_MESSAGE_TYPE.Gap});
        let cnt = 1;
        if (index !== -1 && defaultMessages[index].messagetype === C_MESSAGE_TYPE.Gap) {
            defaultMessages.splice(index, 1);
            cnt = 0;
        }
        let check = false;
        messages.forEach((msg) => {
            if (check || msg.messagetype === C_MESSAGE_TYPE.Gap) {
                return;
            }
            if (msg.id === defaultMessages[index + cnt].id) {
                if (defaultMessages[index + cnt].messagetype === C_MESSAGE_TYPE.Gap) {
                    defaultMessages.splice(index + cnt, 1);
                }
                check = true;
            }
            if (check) {
                return;
            }
            const iter = ((index + cnt) - 1);
            // avatar breakpoint
            msg.avatar = (iter === -1) || (iter > -1 && msg.senderid !== defaultMessages[iter].senderid);
            // date breakpoint
            if ((iter === -1) || (iter > -1 && !TimeUtility.isInSameDay(msg.createdon, defaultMessages[iter].createdon))) {
                defaultMessages.splice(index + cnt, 0, {
                    createdon: msg.createdon,
                    id: msg.id,
                    messagetype: C_MESSAGE_TYPE.Date,
                    senderid: msg.senderid,
                });
                msg.avatar = true;
                cnt++;
            }
            defaultMessages.splice(index + cnt, 0, msg);
            cnt++;
        });
        if (!check) {
            defaultMessages.splice(index + cnt, 0, {
                createdon: defaultMessages[(index + cnt) - 1].createdon,
                id: defaultMessages[(index + cnt) - 1].id,
                messagetype: C_MESSAGE_TYPE.Gap,
                senderid: defaultMessages[(index + cnt) - 1].senderid,
            });
        }
        return {
            index,
            lastIndex: (index + cnt) - 1,
            msgs: defaultMessages
        };
    }

    private chatInputTextMessageHandler = (text: string, param?: any) => {
        if (trimStart(text).length === 0) {
            return;
        }

        const {peer} = this.state;
        if (!peer) {
            if (this.messageRef) {
                this.messageRef.setLoading(false);
            }
            return;
        }

        if (param && param.mode === C_MSG_MODE.Edit) {
            const randomId = UniqueId.getRandomId();
            const messages = this.messages;
            const message: IMessage = param.message;
            message.body = text;
            message.editedon = this.riverTime.now();
            message.rtl = this.rtlDetector.direction(text || '');
            message.messagetype = C_MESSAGE_TYPE.Normal;

            let entities;
            if (param && param.entities) {
                message.entitiesList = param.entities.map((entity: core_types_pb.MessageEntity) => {
                    return entity.toObject();
                });
                entities = param.entities;
            }

            this.sdk.editMessage(randomId, message.id || 0, text, peer, entities).then(() => {
                if (this.messageRef) {
                    this.messageRef.setScrollMode('stay');
                    this.messageRef.takeSnapshot();
                }
                const index = findIndex(messages, (o) => {
                    return o.id === message.id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                });
                if (index > -1) {
                    messages[index] = message;
                    if (this.messageRef) {
                        this.messageRef.list.forceUpdateGrid();
                        this.messageRef.keepView();
                        this.messageRef.removeSnapshot(20);
                    }
                    if (this.chatInputComponent && index + 1 === this.messages.length) {
                        this.chatInputComponent.setLastMessage(message);
                    }
                }
                this.messageRepo.lazyUpsert([message]);
            }).catch((err) => {
                window.console.debug(err);
            });
        } else {
            const randomId = UniqueId.getRandomId();
            const id = -this.riverTime.milliNow();
            const message: IMessage = {
                body: text,
                createdon: this.riverTime.now(),
                id,
                me: true,
                messageaction: C_MESSAGE_ACTION.MessageActionNope,
                messagetype: C_MESSAGE_TYPE.Normal,
                peerid: this.state.selectedDialogId,
                peertype: peer.getType(),
                rtl: this.rtlDetector.direction(text || ''),
                senderid: this.connInfo.UserID,
            };

            const emLe = emojiLevel(text);
            if (emLe) {
                message.em_le = emLe;
            }

            let replyTo;
            if (param && param.mode === C_MSG_MODE.Reply) {
                message.replyto = param.message.id;
                replyTo = param.message.id;
                this.cachedMessageService.setMessage(param.message);
            }

            let entities;
            if (param && param.entities) {
                message.entitiesList = param.entities.map((entity: core_types_pb.MessageEntity) => {
                    return entity.toObject();
                });
                entities = param.entities;
            }

            this.pushMessage(message);

            this.messageRepo.addPending({
                id: randomId,
                message_id: id,
            });

            this.sdk.sendMessage(randomId, text, peer, replyTo, entities).then((res) => {
                // For double checking update message id
                this.updateManager.setMessageId(res.messageid || 0);
                this.modifyPendingMessage({
                    messageid: res.messageid,
                    randomid: randomId,
                }, true);
                message.id = res.messageid;
                this.messageRepo.lazyUpsert([message]);
                this.updateDialogs(message, '0');
                this.checkMessageOrder(message);
                if (this.messageRef) {
                    this.messageRef.list.forceUpdateGrid();
                }
                this.newMessageLoadThrottle();
            }).catch((err) => {
                const messages = this.messages;
                const index = findIndex(messages, (o) => {
                    return o.id === id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                });
                if (index > -1) {
                    messages[index].error = true;
                    this.messageRepo.importBulk([messages[index]], false);
                    this.messageRef.list.forceUpdateGrid();
                }
            });
        }
    }

    private pushMessage = (message: IMessage) => {
        if (!this.messageRef) {
            return;
        }
        const messages = this.messages;
        if (messages.length > 0 &&
            !TimeUtility.isInSameDay(message.createdon, messages[messages.length - 1].createdon)) {
            messages.push({
                createdon: message.createdon,
                id: message.id,
                messagetype: C_MESSAGE_TYPE.Date,
                senderid: message.senderid,
            });
        }
        if (messages.length > 0 && message.senderid !== messages[messages.length - 1].senderid) {
            message.avatar = true;
        } else if (messages.length === 0) {
            message.avatar = true;
        }
        messages.push(message);
        // this.isLoading = true;
        this.setScrollMode('end');
        this.messageRef.setMessages(messages);
        this.messageRepo.lazyUpsert([message]);
    }

    private checkMessageOrder(msg: IMessage) {
        if (!this.messageRef) {
            return;
        }
        const swap = (i1: number, i2: number) => {
            if (!this.messageRef) {
                return;
            }
            const hold = this.messages[i1];
            this.messages[i1] = this.messages[i2];
            this.messages[i2] = hold;
            if (this.messageRef) {
                this.messageRef.cache.clear(i1, 0);
                this.messageRef.cache.clear(i2, 0);
            }
        };
        const index = findLastIndex(this.messages, {id: msg.id});
        if (index < -1) {
            return false;
        }

        const findNewMessagePosition = (message: IMessage) => {
            let position = this.messages.length - 1;
            if (this.messages.length === 0) {
                return position;
            }

            while (position === 0) {
                if ((message.createdon || 0) < (this.messages[position].createdon || 0)) {
                    position--;
                    continue;
                } else if (message.createdon === this.messages[position].createdon) {
                    if ((message.id || 0) < (this.messages[position].id || 0)) {
                        position--;
                        continue;
                    }
                }

                return position;
            }
            return position;
        };

        const pos = findNewMessagePosition(msg);
        if (index !== pos) {
            swap(pos, index);
            return true;
        }
        return false;
    }

    private onNewMessageOpen = () => {
        this.setState({
            openNewMessage: true,
        });
    }

    private onNewMessageClose = () => {
        this.setState({
            openNewMessage: false,
        });
    }

    private onNewMessageHandler = (contacts: IUser[], text: string) => {
        contacts.forEach((contact) => {
            const randomId = UniqueId.getRandomId();
            const peer = new InputPeer();
            peer.setType(PeerType.PEERUSER);
            peer.setAccesshash(contact.accesshash || '');
            peer.setId(contact.id || '');
            this.sdk.sendMessage(randomId, text, peer).then((res) => {
                // For double checking update message id
                this.updateManager.setMessageId(res.messageid || 0);
                this.modifyPendingMessage({
                    messageid: res.messageid,
                    randomid: randomId,
                });
            });
        });
    }

    private onTyping = (typing: TypingAction) => {
        const {peer} = this.state;
        if (peer === null) {
            return;
        }

        this.sdk.typing(peer, typing).catch((err) => {
            window.console.debug(err);
        });
    }

    private getPeerByDialogId(id: string): InputPeer | null {
        const dialog = this.getDialogById(id);
        if (!dialog) {
            // Saved messages
            if (this.connInfo.UserID === id) {
                const contactPeer = new InputPeer();
                contactPeer.setType(PeerType.PEERUSER);
                contactPeer.setAccesshash('0');
                contactPeer.setId(id);
                return contactPeer;
            } else {
                const contact = this.userRepo.getInstantContact(id);
                if (contact) {
                    const contactPeer = new InputPeer();
                    contactPeer.setType(PeerType.PEERUSER);
                    contactPeer.setAccesshash(contact.accesshash || '0');
                    contactPeer.setId(contact.id || '');
                    return contactPeer;
                } else {
                    return null;
                }
            }
        }
        const peer = new InputPeer();
        peer.setType(dialog.peertype || 0);
        if (dialog.peertype === PeerType.PEERUSER && (!dialog.accesshash || dialog.accesshash === '0')) {
            const contact = this.userRepo.getInstantContact(id);
            if (contact) {
                dialog.accesshash = contact.accesshash;
            }
        }
        peer.setAccesshash(dialog.accesshash || '0');
        peer.setId(dialog.peerid || '');
        return peer;
    }

    private getDialogById(id: string): IDialog | null {
        if (this.dialogMap.hasOwnProperty(id)) {
            return this.dialogs[this.dialogMap[id]] || null;
        }
        return null;
    }

    private updateDialogs(msg: IMessage, accessHash: string, force?: boolean) {
        const id = msg.peerid || '';
        if (msg.peerid === '') {
            return;
        }
        const dialogs = this.dialogs;
        let toUpdateDialog: IDialog | null = null;
        const messageTitle = getMessageTitle(msg);
        if (this.dialogMap.hasOwnProperty(id)) {
            let index = this.dialogMap[id];
            // Double check
            if (dialogs[index].peerid !== msg.peerid) {
                index = findIndex(dialogs, {peerid: id});
                if (index === -1) {
                    return;
                }
            }
            if ((dialogs[index].topmessageid || 0) < (msg.id || 0) || force === true) {
                dialogs[index].action_code = msg.messageaction;
                dialogs[index].action_data = msg.actiondata;
                dialogs[index].topmessageid = msg.id;
                dialogs[index].preview = messageTitle.text;
                dialogs[index].preview_icon = messageTitle.icon;
                dialogs[index].preview_me = msg.me;
                dialogs[index].preview_rtl = msg.rtl;
                dialogs[index].sender_id = msg.senderid;
                dialogs[index].last_update = msg.createdon;
                dialogs[index].peerid = id;
                dialogs[index].peertype = msg.peertype;
                toUpdateDialog = dialogs[index];
                if (force) {
                    toUpdateDialog.force = force;
                }
            }
            if ((!dialogs[index].accesshash || dialogs[index].accesshash === '0') && accessHash !== '0') {
                dialogs[index].accesshash = accessHash;
                toUpdateDialog = dialogs[index];
            }
        } else {
            const dialog: IDialog = {
                action_code: msg.messageaction,
                action_data: msg.actiondata,
                last_update: msg.createdon,
                peerid: id,
                peertype: msg.peertype,
                preview: messageTitle.text,
                preview_icon: messageTitle.icon,
                preview_me: msg.me,
                preview_rtl: msg.rtl,
                saved_messages: (this.connInfo.UserID === id),
                sender_id: msg.senderid,
                topmessageid: msg.id,
                unreadcount: 0,
            };
            if (accessHash !== '0') {
                dialog.accesshash = accessHash;
            }
            toUpdateDialog = dialog;
            dialogs.push(dialog);
            this.dialogMap[id] = dialogs.length - 1;
        }
        this.dialogsSortThrottle(dialogs);
        if (toUpdateDialog) {
            this.dialogRepo.lazyUpsert([toUpdateDialog]);
        }
    }

    private updateDialogsNotifySettings(peerId: string, settings: PeerNotifySettings.AsObject) {
        if (!peerId || !this.dialogs) {
            return;
        }
        if (this.dialogMap.hasOwnProperty(peerId)) {
            const index = this.dialogMap[peerId];
            this.dialogs[index].notifysettings = settings;
            this.dialogsSortThrottle(this.dialogs);
            this.dialogRepo.lazyUpsert([this.dialogs[index]]);
        }
    }

    private updateDialogsCounter(peerId: string, {maxInbox, maxOutbox, unreadCounter, unreadCounterIncrease, mentionCounter, mentionCounterIncrease, scrollPos}: any) {
        if (this.dialogMap.hasOwnProperty(peerId)) {
            const dialogs = this.dialogs;
            let index = this.dialogMap[peerId];
            if (!dialogs[index]) {
                return;
            }
            // Double check
            if (dialogs[index].peerid !== peerId) {
                index = findIndex(dialogs, {peerid: peerId});
                if (index === -1) {
                    return;
                }
            }
            let shouldUpdate = false;
            if (maxInbox && maxInbox > (dialogs[index].readinboxmaxid || 0)) {
                dialogs[index].readinboxmaxid = maxInbox;
            }
            if (maxOutbox && maxOutbox > (dialogs[index].readoutboxmaxid || 0)) {
                dialogs[index].readoutboxmaxid = maxOutbox;
                if (this.dialogRef) {
                    this.dialogRef.forceRender();
                }
            }
            if (unreadCounterIncrease === 1) {
                shouldUpdate = true;
                if (dialogs[index].unreadcount) {
                    // @ts-ignore
                    dialogs[index].unreadcount++;
                } else {
                    dialogs[index].unreadcount = 1;
                }
            }
            if (unreadCounter !== undefined) {
                shouldUpdate = true;
                dialogs[index].unreadcount = unreadCounter;
            }
            if (mentionCounterIncrease === 1) {
                shouldUpdate = true;
                if (dialogs[index].mentionedcount) {
                    // @ts-ignore
                    dialogs[index].mentionedcount++;
                } else {
                    dialogs[index].mentionedcount = 1;
                }
            }
            if (mentionCounter !== undefined) {
                shouldUpdate = true;
                dialogs[index].mentionedcount = mentionCounter;
            }
            if (scrollPos !== undefined) {
                dialogs[index].scroll_pos = scrollPos;
            }
            if (shouldUpdate) {
                this.dialogsSort(dialogs, undefined, true);
            }
            if (unreadCounter === 0 && this.scrollInfo) {
                this.setEndOfMessage(this.messages.length - this.scrollInfo.stopIndex > 1);
            }
            this.dialogRepo.lazyUpsert([dialogs[index]]);
        }
    }

    private dialogsSort(dialogs: IDialog[], callback?: (ds: IDialog[]) => void, noSort?: boolean) {
        if (!dialogs) {
            return;
        }
        const td = clone(dialogs);
        if (noSort !== true) {
            if (td.length > 1) {
                td.sort((i1, i2) => {
                    const p1 = i1.pinned ? 1 : 0;
                    const p2 = i2.pinned ? 1 : 0;
                    if (p1 < p2) {
                        return 1;
                    }
                    if (p1 > p2) {
                        return -1;
                    }
                    if (!i1.last_update || !i2.last_update) {
                        return 0;
                    }
                    return (i2.last_update || 0) - (i1.last_update || 0);
                });
            }

            const tDialogMap: any = {};
            td.forEach((d, i) => {
                if (d) {
                    tDialogMap[d.peerid || ''] = i;
                }
            });
            this.dialogMap = tDialogMap;
            this.dialogs = td;
        }

        let unreadCounter = 0;
        td.forEach((d) => {
            if (d && d.unreadcount) {
                unreadCounter += d.unreadcount;
            }
        });

        if (this.dialogRef) {
            this.dialogRef.setDialogs(this.dialogs, () => {
                if (callback) {
                    callback(this.dialogs);
                }
            });
        }

        this.setState({
            unreadCounter,
        });

        this.iframeService.setUnreadCounter(unreadCounter);
        if (ElectronService.isElectron()) {
            this.electronService.setBadgeCounter(unreadCounter);
        }
    }

    private canSync(updateId?: number): Promise<any> {
        const lastId = this.syncManager.getLastUpdateId();
        return new Promise((resolve, reject) => {
            const fn = (id: number) => {
                if (id - lastId > C_MAX_UPDATE_DIFF) {
                    reject({
                        err: 'too_late',
                    });
                } else {
                    if (id - lastId > 0) {
                        resolve(lastId);
                        this.syncThemAll(lastId + 1, 100);
                    } else {
                        reject({
                            err: 'too_soon',
                        });
                    }
                }
            };
            if (updateId) {
                fn(updateId);
            } else {
                this.sdk.getUpdateState().then((res) => {
                    // TODO: check
                    fn(res.updateid || 0);
                }).catch(reject);
            }
        });
    }

    private syncThemAll(lastId: number, limit: number) {
        let tries = 0;
        this.sdk.getUpdateDifference(lastId, limit).then((res) => {
            tries = 0;
            this.syncManager.applyUpdate(res.toObject()).then((id) => {
                this.syncThemAll(id, limit);
            }).catch((err2) => {
                this.updateManager.enable();
                this.setState({
                    isUpdating: false,
                });
                if (err2.code === -1) {
                    this.canSync().then(() => {
                        this.updateManager.disable();
                        this.setState({
                            isUpdating: true,
                        });
                    }).catch(() => {
                        this.updateManager.enable();
                        if (this.state.isUpdating) {
                            this.setState({
                                isUpdating: false,
                            });
                        }
                    });
                }
            });
        }).catch((err) => {
            tries++;
            if (err.err === 'timeout' && tries < 3) {
                this.syncThemAll(lastId, limit);
            }
        });
    }

    private wasmInitHandler = () => {
        window.console.log('wasmInitHandler');
    }

    private wsOpenHandler = () => {
        this.setState({
            isConnecting: false,
        });
        this.sdk.recall('0').then((res) => {
            if (res.timestamp) {
                this.riverTime.setServerTime(res.timestamp);
                this.userRepo.getAllContacts();
            }
            if (this.firstTimeLoad) {
                this.firstTimeLoad = false;
                this.startSyncing(res.updateid || 0);
            } else {
                setTimeout(() => {
                    this.startSyncing(res.updateid || 0);
                }, 1000);
            }
        });
    }

    private startSyncing(updateId?: number) {
        const lastId = this.syncManager.getLastUpdateId();
        // Checks if it is the first time to sync
        if (lastId === 0) {
            this.snapshot();
            return;
        }
        // Normal syncing
        this.canSync(updateId).then(() => {
            this.updateManager.disable();
            this.setState({
                isUpdating: true,
            });
        }).catch((err) => {
            if (err.err !== 'too_soon') {
                this.snapshot();
            }
        });
    }

    private snapshot() {
        // this.messageRepo.truncate();
        if (this.state.isUpdating) {
            return;
        }
        this.updateManager.disable();
        this.setState({
            isUpdating: true,
        });
        this.dialogRepo.getManyCache({}).then((oldDialogs) => {
            this.dialogRepo.getSnapshot({}).then((res) => {
                // Insert holes on snapshot if it has difference
                const sameItems: IDialog[] = intersectionBy(cloneDeep(oldDialogs), res.dialogs, 'peerid');
                const newItems: IDialog[] = differenceBy(cloneDeep(res.dialogs), oldDialogs, 'peerid');
                sameItems.forEach((dialog) => {
                    const d = find(res.dialogs, {peerid: dialog.peerid});
                    if (d) {
                        this.messageRepo.clearHistory(d.peerid || '', d.topmessageid || 0);
                    }
                });
                newItems.forEach((dialog) => {
                    if (dialog.topmessageid) {
                        this.messageRepo.insertHole(dialog.peerid || '', dialog.topmessageid, false);
                    }
                });
                // Sorts dialogs by last update
                this.dialogRepo.lazyUpsert(res.dialogs.map((o) => {
                    o.force = true;
                    return o;
                }));
                this.dialogsSort(res.dialogs);
                this.syncManager.setLastUpdateId(res.updateid || 0);
                this.updateManager.enable();
                this.setState({
                    isUpdating: false,
                }, () => {
                    if (res.dialogs.length > 0) {
                        this.startSyncing();
                    }
                });
            }).catch(() => {
                this.updateManager.enable();
                this.setState({
                    isUpdating: false,
                });
            });
        });
    }

    private wsCloseHandler = () => {
        this.setState({
            isConnecting: true,
        });
    }

    private fnStartedHandler = () => {
        this.messageRepo.loadConnInfo();
        this.connInfo = this.sdk.getConnInfo();
        this.updateManager.setUserId(this.connInfo.UserID || '');
    }

    private networkStatusHandler = (event: any) => {
        const data = event.detail;
        this.setState({
            isOnline: data.online,
        });
    }

    private dialogDBUpdatedHandler = (event: any) => {
        const data = event.detail;
        this.dialogRepo.getManyCache({}).then((res) => {
            this.dialogsSort(res, (dialogs) => {
                if (data.counters) {
                    data.ids.forEach((id: string) => {
                        // window.console.debug('dialogDBUpdated data.id:', id);
                        if (this.dialogMap.hasOwnProperty(id) && dialogs[this.dialogMap[id]]) {
                            // window.console.debug('dialogDBUpdated peerId:', dialogs[this.dialogMap[id]].peerid);
                            const maxReadInbox = dialogs[this.dialogMap[id]].readinboxmaxid || 0;
                            // window.console.debug('dialogDBUpdated maxReadInbox:', maxReadInbox);
                            const dialog = cloneDeep(this.getDialogById(id));
                            if (dialog) {
                                this.messageRepo.getUnreadCount(id, maxReadInbox, dialog ? (dialog.topmessageid || 0) : 0).then((count) => {
                                    // window.console.debug('dialogDBUpdated getUnreadCount:', count);
                                    this.updateDialogsCounter(id, {
                                        mentionCounter: count.mention,
                                        unreadCounter: count.message,
                                    });
                                });
                            }
                        }
                    });
                }
            });
        });
    }

    private getValidAfter(offset?: number): number {
        const messages = this.messages;
        let after = 0;
        let tries = 1;
        if (offset && offset > 0) {
            tries = messages.length - offset;
        }
        if (messages.length > 0) {
            // Check if it is not pending message
            after = messages[messages.length - tries].id || 0;
            if (after < 0) {
                if (messages.length > 0) {
                    // Check if it is not pending message
                    while (true) {
                        tries++;
                        if (!messages[messages.length - tries]) {
                            return 0;
                        }
                        after = messages[messages.length - tries].id || 0;
                        if (after > 0 || tries >= messages.length) {
                            break;
                        }
                    }
                }
            }
        }
        return after;
    }

    private messageDBUpdatedHandler = (event: any) => {
        const data = event.detail;
        if (data.ids) {
            data.ids.forEach((id: any) => {
                if (typeof id === 'number') {
                    this.checkPendingMessage(id, true);
                } else {
                    this.checkPendingMessage(parseInt(id, 10), true);
                }
            });
        }
        const {peer} = this.state;
        if (!peer) {
            return;
        }
        if (data.peerids && data.peerids.indexOf(this.state.selectedDialogId) > -1) {
            // this.getMessagesByDialogId(this.state.selectedDialogId);
            const after = this.getValidAfter();
            this.messageRepo.getManyCache({after, limit: 100, ignoreMax: true}, peer).then((res) => {
                if (!this.messageRef) {
                    return;
                }
                if (!this.endOfMessage && this.isInChat) {
                    this.setScrollMode('end');
                } else {
                    this.setScrollMode('none');
                }
                const modifiedMsgs = this.modifyMessages(this.messages, res.messages, true);
                res.messages.forEach((msg) => {
                    this.downloadThumbnail(msg);
                    this.checkMessageOrder(msg);
                });
                this.messageRef.setMessages(modifiedMsgs.msgs);
            });
        }
    }

    /* Notify on new message received */
    private notifyMessage(data: INewMessageBulkUpdate) {
        if (!(!this.isInChat && data.senderIds.indexOf(this.connInfo.UserID || '') === -1 && data.messages.length > 0 && this.canNotify(data.messages[0].peerid || '')) && (data.messages.length === 1 && data.messages[0].mention_me !== true)) {
            return;
        }
        if (data.peertype === PeerType.PEERGROUP) {
            this.groupRepo.get(data.peerid).then((group) => {
                let groupTitle = 'Group';
                if (group) {
                    groupTitle = group.title || 'Group';
                }
                if (data.messages.length === 1) {
                    const messageTitle = getMessageTitle(data.messages[0]);
                    if (data.messages[0].mention_me === true) {
                        this.notify(
                            `${data.senders[0].firstname} ${data.senders[0].lastname} mentioned you in ${groupTitle}`,
                            messageTitle.text, data.messages[0].peerid || 'null');
                    } else if (!data.messages[0].me) {
                        this.notify(
                            `New message from ${data.senders[0].firstname} ${data.senders[0].lastname} in ${groupTitle}`,
                            messageTitle.text, data.messages[0].peerid || 'null');
                    }
                } else {
                    this.notify(
                        `${data.messages.length} new messages in ${groupTitle}`, '', data.messages[0].peerid || 'null');
                }
            });
        } else {
            if (data.messages.length > 0 && !data.messages[0].me) {
                if (data.messages.length === 1) {
                    const messageTitle = getMessageTitle(data.messages[0]);
                    this.notify(
                        `New message from ${data.senders[0].firstname} ${data.senders[0].lastname}`,
                        messageTitle.text, data.messages[0].peerid || 'null');
                } else {
                    this.notify(
                        `${data.messages.length} new messages from ${data.senders[0].firstname} ${data.senders[0].lastname}`, '', data.messages[0].peerid || 'null');
                }
            }
        }
    }

    private notify = (title: string, body: string, id: string) => {
        if (Notification.permission === 'granted') {
            const options = {
                body,
                icon: '/android-icon-192x192.png',
            };
            // @ts-ignore
            const notification = new Notification(title, options);
            notification.onclick = () => {
                window.focus();
                this.props.history.push(`/chat/${id}`);
            };
        }
    }

    private bottomBarSelectHandler = (item: string) => {
        switch (item) {
            case 'logout':
                this.setState({
                    confirmDialogMode: 'logout',
                    confirmDialogOpen: true,
                });
                break;
            default:
                this.setState({
                    leftMenu: item,
                });
                if (this.settingsMenuRef && this.state.leftMenu === 'settings') {
                    this.settingsMenuRef.navigateToPage('none', 'none');
                }
                break;
        }
    }

    private leftOverlayCloseHandler = () => {
        this.setState({
            leftOverlay: false,
        });
    }

    private onGroupCreateHandler = (contacts: IUser[], title: string, fileId: string) => {
        const users: InputUser[] = [];
        contacts.forEach((contact) => {
            const user = new InputUser();
            user.setAccesshash(contact.accesshash || '');
            user.setUserid(contact.id || '');
            users.push(user);
        });
        this.sdk.groupCreate(users, title).then((res) => {
            this.groupRepo.importBulk([res]);
            const dialog: IDialog = {
                accesshash: '0',
                action_code: C_MESSAGE_ACTION.MessageActionGroupCreated,
                action_data: null,
                last_update: res.createdon,
                peerid: res.id,
                peertype: PeerType.PEERGROUP,
                preview: 'Group created',
                sender_id: this.connInfo.UserID,
            };
            this.dialogs.push(dialog);
            this.dialogsSortThrottle(this.dialogs);
            this.props.history.push(`/chat/${res.id}`);
            if (fileId !== '') {
                const inputFile = new InputFile();
                inputFile.setFileid(fileId);
                inputFile.setFilename(`picture_${fileId}.jpg`);
                inputFile.setMd5checksum('');
                inputFile.setTotalparts(1);
                this.sdk.groupUploadPicture(res.id || '', inputFile);
            }
        });
    }

    private logOutHandler() {
        const wipe = () => {
            this.sdk.stopNetWork();
            this.sdk.resetConnInfo();
            this.mainRepo.destroyDB().then(() => {
                this.updateManager.setLastUpdateId(0);
                this.updateManager.flushLastUpdateId();
                window.location.href = '/';
                // window.location.reload();
            });
        };
        this.updateManager.disable();
        this.sdk.logout(this.connInfo.AuthID).then((res) => {
            wipe();
        }).catch(() => {
            wipe();
        });
    }

    private windowFocusHandler = () => {
        this.isInChat = true;
        // if (this.readHistoryMaxId) {
        //     const {peer} = this.state;
        //     this.sendReadHistory(peer, this.readHistoryMaxId);
        // }
        if (this.state.selectedDialogId !== 'null' && this.messages.length > 0) {
            if (this.scrollInfo && this.scrollInfo.stopIndex && this.messages[this.scrollInfo.stopIndex]) {
                this.sendReadHistory(this.state.peer, Math.floor(this.messages[this.scrollInfo.stopIndex].id || 0), this.scrollInfo.stopIndex);
            } else if (this.messages[this.messages.length - 1]) {
                this.sendReadHistory(this.state.peer, Math.floor(this.messages[this.messages.length - 1].id || 0));
            }
        }
    }

    private windowBlurHandler = () => {
        this.isInChat = false;
    }

    private sendReadHistory(inputPeer: InputPeer | null, msgId: number, endIndex?: number, showMoveDown?: boolean) {
        if (!inputPeer || !this.isInChat) {
            return;
        }
        const peerId = inputPeer.getId() || '';
        const dialog = this.getDialogById(peerId);
        if (msgId < 0 && this.state.selectedDialogId === peerId) {
            msgId = this.getValidAfter(endIndex);
        }
        if (dialog) {
            if (showMoveDown !== undefined) {
                if (showMoveDown || (dialog.unreadcount || 0) > 0) {
                    this.setMoveDownVisible(true);
                } else if (dialog.unreadcount === 0) {
                    this.setMoveDownVisible(false);
                }
            }
            const index = findLastIndex(this.messages, {id: msgId});
            if (index > -1) {
                if (this.messages[index].me) {
                    if (dialog && (dialog.unreadcount || 0) > 0 && (dialog.topmessageid || 0) === msgId) {
                        this.readMessageThrottle(inputPeer, msgId, dialog.topmessageid || 0);
                        this.updateDialogsCounter(peerId, {
                            mentionCounter: 0,
                            unreadCounter: 0,
                        });
                    }
                    return;
                }
            }
            if (this.updateReadInboxTimeout.hasOwnProperty(peerId) && this.updateReadInboxTimeout[peerId]) {
                clearTimeout(this.updateReadInboxTimeout[peerId]);
            }
            // Last message pointer must be greater than msgId
            if (dialog && (dialog.readinboxmaxid || 0) < msgId) {
                this.readMessageThrottle(inputPeer, msgId, dialog.topmessageid || 0);
            }
            // If unread counter was no correct we force it to be zero
            else if (dialog && (dialog.unreadcount || 0) > 0 && (dialog.topmessageid || 0) === msgId) {
                this.readMessageThrottle(inputPeer, msgId, dialog.topmessageid || 0);
                this.updateDialogsCounter(peerId, {
                    mentionCounter: 0,
                    unreadCounter: 0,
                });
            }
        }
    }

    private readMessageThrottle(inputPeer: InputPeer, id: number, topMessageId: number) {
        const peerId = inputPeer.getId() || '';
        if (!this.dialogReadMap.hasOwnProperty(peerId)) {
            this.dialogReadMap[peerId] = {
                id,
                peer: inputPeer,
            };
        } else {
            if (this.dialogReadMap[peerId].id < id) {
                this.dialogReadMap[peerId].id = id;
            }
        }
        const msgId = this.dialogReadMap[peerId].id;
        // Recompute dialog counter
        this.messageRepo.getUnreadCount(peerId, msgId, topMessageId).then((count) => {
            this.updateDialogsCounter(peerId, {
                maxInbox: msgId,
                mentionCounter: count.mention,
                unreadCounter: count.message,
            });
        }).catch(() => {
            this.updateDialogsCounter(peerId, {
                maxInbox: msgId,
            });
        });
        this.messageReadThrottle();
    }

    private readMessage = () => {
        const keys = Object.keys(this.dialogReadMap);
        if (keys.length === 0) {
            return;
        }
        keys.forEach((key) => {
            this.sdk.setMessagesReadHistory(this.dialogReadMap[key].peer, this.dialogReadMap[key].id);
            delete this.dialogReadMap[key];
        });
    }

    private messageContextMenuHandler = (cmd: string, message: IMessage) => {
        const {peer} = this.state;
        if (!peer) {
            return;
        }
        switch (cmd) {
            case 'reply':
                this.setState({
                    textInputMessage: message,
                    textInputMessageMode: C_MSG_MODE.Reply,
                });
                break;
            case 'edit':
                this.setState({
                    textInputMessage: message,
                    textInputMessageMode: C_MSG_MODE.Edit,
                });
                break;
            case 'remove':
                const messageSelectedIds = {};
                messageSelectedIds[message.id || 0] = true;
                let removeMode: any = 'remove_message';
                if ((this.riverTime.now() - (message.createdon || 0)) < 86400 && message.me === true) {
                    removeMode = 'remove_message_revoke';
                }
                this.setState({
                    confirmDialogMode: removeMode,
                    confirmDialogOpen: true,
                    messageSelectedIds,
                });
                return;
            case 'forward':
                this.setState({
                    messageSelectable: true,
                });
                break;
            case 'resend':
                this.resendMessage(message);
                break;
            case 'cancel':
                this.cancelSend(message.id || 0);
                break;
            case 'download':
                this.downloadFile(message);
                break;
            case 'save':
                this.saveFile(message);
                break;
            default:
                window.console.debug(cmd, message);
                break;
        }
    }

    /* ChatInput preview message change handler */
    private chatInputPreviewMessageChangeHandler = (previewMessage: IMessage, previewMessageMode: number) => {
        this.setState({
            textInputMessage: previewMessage,
            textInputMessageMode: previewMessageMode,
        });
    }

    /* PopUpDate show date handler */
    private messageShowDateHandler = (timestamp: number) => {
        this.popUpDateRef.updateDate(timestamp);
    }

    /* PopUpDate show date handler */
    private messageShowNewMessageHandler = (visible: boolean) => {
        this.popUpNewMessageRef.setVisible(visible);
    }

    /* Message Rendered Handler
     * We use it for scroll event in message list */
    private messageRenderedHandler = (info: any) => {
        const messages = this.messages;
        const diff = messages.length - info.stopIndex;
        this.scrollInfo = info;
        this.setEndOfMessage(diff > 2);
        // if (this.isLoading) {
        //     return;
        // }
        if (messages && messages[info.stopIndex]) {
            if (diff <= 2) {
                this.lastMessageId = -1;
            } else {
                this.lastMessageId = messages[info.stopIndex].id || -1;
            }
            if (messages[info.stopIndex].id !== -1) {
                // Update unread counter in dialog
                this.sendReadHistory(this.state.peer, Math.floor(messages[info.stopIndex].id || 0), info.stopIndex, diff > 1);
            }
        }
    }

    /* Message on drop files handler */
    private messageDropHandler = (files: File[]) => {
        if (this.chatInputComponent) {
            this.chatInputComponent.openUploader(files);
        }
    }

    /* Message on last message handler */
    private messageLastMessageHandler = (message: IMessage | null) => {
        if (this.chatInputComponent && message) {
            this.chatInputComponent.setLastMessage(message);
        }
        if (this.conversationRef) {
            if (!message && !this.conversationRef.classList.contains('no-result')) {
                this.conversationRef.classList.add('no-result');
            } else if (message && this.conversationRef.classList.contains('no-result')) {
                this.conversationRef.classList.remove('no-result');
            }
        }
    }

    /* Cancel us typing handler */
    private cancelIsTypingHandler = (id: string) => {
        if (this.isTypingList.hasOwnProperty(id)) {
            delete this.isTypingList[id];
            if (this.dialogRef) {
                this.dialogRef.setIsTypingList(this.isTypingList);
            }
            if (this.statusBarRef) {
                this.statusBarRef.setIsTypingList(this.isTypingList);
            }
        }
    }

    /* Back to chat handler, for mobile view */
    private backToChatsHandler = () => {
        clearTimeout(this.mobileBackTimeout);
        this.setChatView(false);
        this.setState({
            isChatView: false,
        }, () => {
            this.mobileBackTimeout = setTimeout(() => {
                this.props.history.push('/chat/null');
            }, 1000);
        });
    }

    /* SettingsMenu on update handler */
    private settingUpdateMessageHandler = (keep?: boolean) => {
        if (keep && this.messageRef) {
            this.messageRef.setScrollMode('stay');
            this.messageRef.takeSnapshot();
        }
        const {selectedDialogId} = this.state;
        if (selectedDialogId !== 'null') {
            this.messageRef.cache.clearAll();
            this.messageRef.list.recomputeRowHeights();
        }
        if (keep && this.messageRef) {
            this.messageRef.keepView();
            this.messageRef.removeSnapshot(50);
        }
    }

    /* SettingsMenu on reload dialog handler */
    private settingReloadDialogHandler = (peerIds: string[]) => {
        if (peerIds.indexOf(this.state.selectedDialogId) > -1) {
            setTimeout(() => {
                this.getMessagesByDialogId(this.state.selectedDialogId, true);
            }, 1000);
        }
    }

    /* SettingsMenu on update handler */
    private settingActionHandler = (cmd: 'logout') => {
        switch (cmd) {
            case 'logout':
                this.bottomBarSelectHandler('logout');
                break;
        }
    }

    private dialogRemove = (id: string) => {
        this.updateManager.disable();
        this.setState({
            isUpdating: true,
        });
        if (id) {
            const dialogMap = this.dialogMap;
            const index = this.dialogMap[id];
            this.dialogs.splice(index, 1);
            delete dialogMap[id];
            this.dialogsSort(this.dialogs);
            this.dialogRepo.remove(id).then(() => {
                if (this.state.selectedDialogId === id) {
                    this.props.history.push('/chat/null');
                }
                this.updateManager.enable();
                this.setState({
                    isUpdating: false,
                });
            }).catch(() => {
                this.updateManager.enable();
                this.setState({
                    isUpdating: false,
                });
            });
        }
    }

    private confirmDialogCloseHandler = () => {
        this.setState({
            confirmDialogMode: 'none',
            confirmDialogOpen: false,
            messageSelectable: false,
            messageSelectedIds: {},
        });
    }

    private confirmDialogAcceptHandler = () => {
        this.logOutHandler();
    }

    /* On message selected ids change */
    private messageSelectedIdsChangeHandler = (selectedIds: { [key: number]: number }) => {
        this.setState({
            messageSelectedIds: selectedIds,
        });
    }

    /* On message selectable change */
    private messageSelectableChangeHandler = (selectable: boolean) => {
        this.setState({
            messageSelectable: selectable,
        });
    }

    /* ChatInput bulk action handler */
    private chatInputBulkActionHandler = (cmd: string) => {
        switch (cmd) {
            case 'forward':
                if (this.forwardDialogRef) {
                    this.forwardDialogRef.openDialog();
                }
                break;
            case 'remove':
                let noRevoke = true;
                let allPending = true;
                const messages = this.messages;
                const now = this.riverTime.now();
                // Checks if revoke is unavailable
                for (const i in this.state.messageSelectedIds) {
                    if (this.state.messageSelectedIds.hasOwnProperty(i)) {
                        const msg = messages[this.state.messageSelectedIds[i]];
                        if (msg && ((msg.me !== true || (now - (msg.createdon || 0)) >= 86400) || (msg.id || 0) < 0)) {
                            noRevoke = false;
                            if (!allPending) {
                                break;
                            }
                        }
                        if (msg && (msg.id || 0) > 0) {
                            allPending = false;
                            if (!noRevoke) {
                                break;
                            }
                        }
                    }
                }
                let mode: any = 'remove_message';
                if (allPending) {
                    mode = 'remove_message_pending';
                }
                if (noRevoke) {
                    mode = 'remove_message_revoke';
                }
                this.setState({
                    confirmDialogMode: mode,
                    confirmDialogOpen: true,
                });
                break;
            case 'close':
                this.setState({
                    messageSelectable: false,
                    messageSelectedIds: {},
                });
                break;
            default:
                break;
        }
    }

    /* ChatInput action handler */
    private chatInputActionHandler = (cmd: string, message?: IMessage) => {
        const {peer} = this.state;
        if (!peer) {
            return;
        }
        switch (cmd) {
            case 'remove_dialog':
                const dialog = this.getDialogById(peer.getId() || '');
                if (dialog) {
                    this.sdk.clearMessage(peer, dialog.topmessageid || 0, true).then(() => {
                        this.dialogRemove(peer.getId() || '');
                    });
                }
                break;
            case 'edit':
                this.setState({
                    textInputMessage: message,
                    textInputMessageMode: C_MSG_MODE.Edit,
                });
                break;
            default:
                break;
        }
    }

    private forwardDialogCloseHandler = () => {
        this.setState({
            messageSelectable: false,
            messageSelectedIds: {},
        });
    }

    private forwardDialogDoneHandler = (forwardRecipients: IInputPeer[]) => {
        const promises: any[] = [];
        const {peer, messageSelectedIds} = this.state;
        if (!peer) {
            return;
        }
        // @ts-ignore
        const msgIds: number[] = Object.keys(messageSelectedIds).map((o) => {
            if (typeof o === 'string') {
                return parseInt(o, 10);
            } else {
                return o;
            }
        }).sort();
        forwardRecipients.forEach((recipient) => {
            const targetPeer = new InputPeer();
            targetPeer.setAccesshash(recipient.accesshash);
            targetPeer.setId(recipient.id);
            targetPeer.setType(recipient.type);
            promises.push(this.sdk.forwardMessage(peer, msgIds, UniqueId.getRandomId(), targetPeer, false));
        });
        this.forwardDialogCloseHandler();
        Promise.all(promises).catch((err) => {
            window.console.debug(err);
        });
    }

    private removeMessageHandler = (mode: number) => {
        const {peer, messageSelectedIds} = this.state;
        if (!peer) {
            return;
        }
        if (mode === 2) {
            this.messages.forEach((msg) => {
                if ((msg.id || 0) < 0) {
                    this.cancelSend(msg.id || 0);
                }
            });
        } else {
            const remoteMsgIds: number[] = [];
            Object.keys(messageSelectedIds).forEach((id) => {
                const nid = parseInt(id, 10);
                if (nid > 0) {
                    remoteMsgIds.push(nid);
                } else {
                    // Remove pending messages
                    this.cancelSend(nid);
                }
            });
            if (remoteMsgIds.length > 0) {
                this.sdk.removeMessage(peer, remoteMsgIds, mode === 1).catch((err) => {
                    window.console.debug(err);
                });
            }
        }
        this.confirmDialogCloseHandler();
    }

    /* Check if can notify user */
    private canNotify(peerId: string) {
        if (!peerId) {
            return;
        }
        const dialog = this.getDialogById(peerId);
        if (dialog) {
            return !isMuted(dialog.notifysettings);
        }
        return true;
    }

    /* Jump to message handler */
    private messageJumpToMessageHandler = (id: number, text?: string) => {
        if (this.isLoading) {
            return;
        }
        const messages = this.messages;
        const {peer} = this.state;
        if (!peer || !messages) {
            return;
        }

        const index = findIndex(messages, (o) => {
            return o.id === id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
        });
        if (index > 0) {
            this.messageRef.list.scrollToRow(index);
            setTimeout(() => {
                highlightMessage(id);
                if (typeof text === 'string' && text !== '') {
                    highlightMessageText(id, text);
                }
            }, 100);
        } else {
            // if ((messages[0].id || 0) < id) {
            this.setLoading(true);
            if (messages[0].messagetype !== C_MESSAGE_TYPE.Gap) {
                messages.unshift({
                    createdon: (messages[0].createdon || 0),
                    id: (messages[0].id || 0),
                    messagetype: C_MESSAGE_TYPE.Gap,
                    senderid: (messages[0].senderid || '')
                });
            }
            this.messageRef.cache.clear(0, 0);
            this.messageRef.list.forceUpdateGrid();
            this.messageRef.list.scrollToRow(0);

            const dialogId = peer.getId() || '';

            this.messageRepo.getMany({peer, after: id - 1, limit: 25}).then((res) => {
                if (this.state.selectedDialogId !== dialogId || res.length === 0 || !this.messageRef) {
                    this.setLoading(false);
                    return;
                }
                const dataMsg = this.modifyMessagesBetween(messages, res, id);
                this.setScrollMode('none');
                this.messageRef.setMessages(dataMsg.msgs);
                for (let i = dataMsg.index; i <= dataMsg.msgs.length; i++) {
                    this.messageRef.cache.clear(i, 0);
                }
                this.messageRef.list.recomputeGridSize();
                this.messageRef.list.scrollToRow(0);
                setTimeout(() => {
                    this.setLoading(false);
                    highlightMessage(id);
                    if (typeof text === 'string' && text !== '') {
                        highlightMessageText(id, text);
                    }
                    if (this.messageRef) {
                        this.messageRef.tryLoadBefore();
                    }
                }, 100);
            }).catch((err) => {
                this.setLoading(false);
            });
        }
    }

    /* Message load after */
    private messageLoadMoreAfterGapHandler = (id: number) => {
        if (this.isLoading) {
            return;
        }
        const messages = this.messages;
        const {peer} = this.state;
        if (!peer || !messages) {
            return;
        }

        const dialogId = peer.getId() || '';

        this.setLoading(true);

        this.messageRepo.getMany({peer, after: id, limit: 25}).then((res) => {
            if (this.state.selectedDialogId !== dialogId || res.length === 0 || !this.messageRef) {
                this.setLoading(false);
                return;
            }
            this.setScrollMode('none');
            const dataMsg = this.modifyMessagesBetween(messages, res, id);

            this.messageRef.setMessages(dataMsg.msgs);
            for (let i = dataMsg.index; i <= dataMsg.msgs.length; i++) {
                this.messageRef.cache.clear(i, 0);
            }
            this.messageRef.list.recomputeGridSize();
            setTimeout(() => {
                this.setLoading(false);
            }, 100);
        }).catch((err) => {
            this.setLoading(false);
        });
    }

    /* Set loading flag */
    private setLoading(loading: boolean) {
        this.isLoading = loading;
        if (this.messageRef) {
            this.messageRef.setLoading(loading);
        }
    }

    /* UserDialog ref handler */
    private userDialogRefHandler = (ref: any) => {
        this.userDialogComponent = ref;
    }

    /* ForwardDialog ref handler */
    private forwardDialogRefHandler = (ref: any) => {
        this.forwardDialogRef = ref;
    }

    /* AboutDialog ref handler */
    private aboutDialogRefHandler = (ref: any) => {
        this.aboutDialogRef = ref;
    }

    /* Context menu handler */
    private dialogContextMenuHandler = (cmd: string, dialog: IDialog) => {
        const peer = new InputPeer();
        if (dialog.peertype) {
            peer.setType(dialog.peertype);
        }
        peer.setId(dialog.peerid || '');
        peer.setAccesshash(dialog.accesshash || '0');
        switch (cmd) {
            case 'info':
                this.userDialogComponent.openDialog(peer);
                break;
            case 'block':
                break;
            case 'remove':
                this.setState({
                    confirmDialogMode: (dialog.peertype === PeerType.PEERGROUP) ? 'delete_exit_group' : 'delete_user',
                    confirmDialogOpen: true,
                    leftMenu: 'chat',
                    leftMenuSelectedDialogId: dialog.peerid || '',
                });
                break;
            case 'clear':
                if (dialog.topmessageid) {
                    this.sdk.clearMessage(peer, dialog.topmessageid, false);
                }
                break;
            case 'pin':
                this.sdk.dialogTogglePin(peer, true).then(() => {
                    this.pinDialog(peer.getId() || '', true);
                });
                break;
            case 'unpin':
                this.sdk.dialogTogglePin(peer, false).then(() => {
                    this.pinDialog(peer.getId() || '', false);
                });
                break;
            default:
                break;
        }
    }

    /* Set Message component scroll mode */
    private setScrollMode(mode: 'none' | 'end' | 'stay') {
        if (this.messageRef) {
            this.messageRef.setScrollMode(mode);
        }
    }

    /* Resend text message */
    private resendTextMessage(randomId: number, message: IMessage) {
        const {peer} = this.state;
        if (peer === null) {
            return;
        }

        const messageEntities: MessageEntity[] = [];
        if (message.entitiesList) {
            message.entitiesList.forEach((ent) => {
                const entity = new MessageEntity();
                entity.setUserid(ent.userid || '');
                entity.setType(ent.type || MessageEntityType.MESSAGEENTITYTYPEBOLD);
                entity.setLength(ent.length || 0);
                entity.setOffset(ent.offset || 0);
                messageEntities.push(entity);
            });
        }

        this.sdk.sendMessage(randomId, message.body || '', peer, message.replyto, messageEntities).then((res) => {
            // For double checking update message id
            this.updateManager.setMessageId(res.messageid || 0);
            this.modifyPendingMessage({
                messageid: res.messageid,
                randomid: randomId,
            });

            const messages = this.messages;
            const index = findIndex(messages, (o) => {
                return o.id === message.id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
            });
            if (index > -1) {
                this.messageRef.cache.clear(index, 0);
            }

            message.id = res.messageid;

            this.messageRepo.lazyUpsert([message]);
            this.updateDialogs(message, '0');

            // Force update messages
            this.messageRef.list.forceUpdateGrid();
        });
    }

    /* Resend media message */
    private resendMediaMessage(randomId: number, message: IMessage, fileId: string, data: any) {
        const {peer} = this.state;
        if (peer === null) {
            return;
        }

        this.fileManager.retry(fileId, (progress) => {
            this.progressBroadcaster.publish(message.id || 0, progress);
        }).then(() => {
            this.progressBroadcaster.remove(message.id || 0);
            this.sdk.sendMediaMessage(randomId, peer, InputMediaType.INPUTMEDIATYPEUPLOADEDDOCUMENT, data, message.replyto).then((res) => {
                // For double checking update message id
                this.updateManager.setMessageId(res.messageid || 0);
                this.modifyPendingMessage({
                    messageid: res.messageid,
                    randomid: randomId,
                });

                const messages = this.messages;
                const index = findIndex(messages, (o) => {
                    return o.id === message.id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                });
                if (index > -1) {
                    this.messageRef.cache.clear(index, 0);
                }

                message.id = res.messageid;
                message.downloaded = true;

                this.messageRepo.lazyUpsert([message]);
                this.updateDialogs(message, '0');

                // Force update messages
                this.messageRef.list.forceUpdateGrid();
            });
        }).catch((err) => {
            this.progressBroadcaster.remove(message.id || 0);
            if (err.code !== C_FILE_ERR_CODE.REQUEST_CANCELLED) {
                const messages = this.messages;
                const index = findIndex(messages, (o) => {
                    return o.id === message.id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                });
                if (index > -1) {
                    messages[index].error = true;
                    this.messageRepo.importBulk([messages[index]], false);
                    this.messageRef.list.forceUpdateGrid();
                }
            }
        });
    }

    /* update message id */
    private updateMessageIDHandler = (data: UpdateMessageID.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        this.modifyPendingMessage(data);
    }

    /* Modify pending message */
    private modifyPendingMessage(data: UpdateMessageID.AsObject, remove?: boolean) {
        if (!data.randomid) {
            return;
        }
        const randomId = data.randomid || 0;
        this.messageRepo.getPending(randomId).then((res) => {
            if (res) {
                this.messageRepo.removePending(randomId).then(() => {
                    if (!remove && res.file_ids && res.file_ids.length > 0) {
                        this.messageRepo.upsert([{
                            id: res.message_id,
                            pmodified: true,
                        }]);
                        this.messageRepo.addPending({
                            file_ids: res.file_ids,
                            id: data.messageid || 0,
                            message_id: res.message_id,
                        });
                    } else {
                        this.messageRepo.remove(res.message_id);
                    }
                });
            }
        });
    }

    /* Check pending message */
    private checkPendingMessage(id: number, instant?: boolean) {
        setTimeout(() => {
            this.messageRepo.getPending(id).then((res) => {
                if (res) {
                    this.messageRepo.remove(res.message_id);
                    this.messageRepo.removePending(res.id);
                    if (res.file_ids && res.file_ids.length > 0) {
                        this.messageRepo.get(id).then((msg) => {
                            if (msg && res.file_ids && res.file_ids.length > 0) {
                                this.modifyTempFiles(res.file_ids, msg);
                            }
                        });
                    }
                }
            });
        }, instant ? 0 : 200);
    }

    /* Modify temp chunks */
    private modifyTempFiles(ids: string[], message: IMessage) {
        switch (message.mediatype) {
            case MediaType.MEDIATYPEDOCUMENT:
                const mediaDocument: MediaDocument.AsObject = message.mediadata;
                if (mediaDocument && mediaDocument.doc && mediaDocument.doc.id) {
                    const persistFilePromises: any[] = [];
                    persistFilePromises.push(this.fileRepo.persistTempFiles(ids[0], mediaDocument.doc.id, mediaDocument.doc.mimetype || 'application/octet-stream'));
                    // Check thumbnail
                    if (ids.length > 1 && mediaDocument.doc.thumbnail) {
                        persistFilePromises.push(this.fileRepo.persistTempFiles(ids[1], mediaDocument.doc.thumbnail.fileid || '', 'image/jpeg'));
                    }
                    Promise.all(persistFilePromises).then(() => {
                        this.messageRepo.get(message.id || 0).then((msg) => {
                            if (msg) {
                                msg.downloaded = true;
                                if (this.messages) {
                                    const index = findIndex(this.messages, (o) => {
                                        return o.id === msg.id && o.messagetype === msg.messagetype;
                                    });
                                    if (index > -1) {
                                        this.messages[index] = msg;
                                        this.messageRef.list.forceUpdateGrid();
                                    }
                                }
                                this.messageRepo.lazyUpsert([msg]);
                            }
                        });
                    });
                }
                break;
        }
    }

    /* Resend message */
    private resendMessage(message: IMessage) {
        this.messageRepo.getPendingByMessageId(message.id || 0).then((res) => {
            if (res && res.file_ids && res.file_ids.length === 1) {
                const messages = this.messages;
                const index = findIndex(messages, (o) => {
                    return o.id === message.id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                });
                if (index > -1) {
                    messages[index].error = false;
                    this.messageRef.list.forceUpdateGrid();
                }
                if (message.mediatype !== MediaType.MEDIATYPEEMPTY && message.messagetype !== 0 && message.messagetype !== C_MESSAGE_TYPE.Normal) {
                    this.resendMediaMessage(res.id, message, res.file_ids[0], res.data);
                } else if (message.messagetype === 0 || message.messagetype === C_MESSAGE_TYPE.Normal) {
                    this.resendTextMessage(res.id, message);
                }
            }
        });
    }

    /* Attachment action handler */
    private messageAttachmentActionHandler = (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open' | 'read' | 'save_as' | 'preview', message: IMessage | number, fileId?: string) => {
        const execute = (msg: IMessage) => {
            switch (cmd) {
                case 'cancel':
                    this.cancelSend(msg.id || 0);
                    break;
                case 'download':
                    this.downloadFile(msg);
                    break;
                case 'cancel_download':
                    this.cancelDownloadFile(msg);
                    break;
                case 'view':
                    this.saveFile(msg);
                    break;
                case 'open':
                    this.openFile(msg);
                    break;
                case 'preview':
                    this.previewFile(msg);
                    break;
                case 'read':
                    this.readMessageContent(msg);
                    break;
                case 'save_as':
                    if (fileId) {
                        this.fileRepo.get(fileId).then((res) => {
                            if (res) {
                                saveAs(res.data, `downloaded_file_${Date.now()}.${getFileExtension(res.data.type)}`);
                            }
                        });
                    }
                    break;
            }
        };
        if (typeof message === 'number') {
            this.messageRepo.get(message).then((msg) => {
                if (msg) {
                    execute(msg);
                }
            });
        } else {
            execute(message);
        }
    }

    /* Cancel sending message */
    private cancelSend(id: number, noUpdate?: boolean) {
        const removeMessage = () => {
            this.messageRepo.remove(id).then(() => {
                const messages = this.messages;
                if (messages) {
                    const index = findIndex(messages, (o) => {
                        return o.id === id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                    });
                    if (index > -1) {
                        this.messageRef.cache.clear(index, 0);
                        messages.splice(index, 1);
                        if (noUpdate !== true) {
                            this.messageRef.list.forceUpdateGrid();
                            this.messageRef.list.recomputeGridSize();
                        }
                    }
                }
            }).catch((err) => {
                window.console.debug(err);
            });
        };
        this.messageRepo.getPendingByMessageId(id).then((res) => {
            if (res) {
                if (res.file_ids) {
                    res.file_ids.forEach((fileId) => {
                        this.fileManager.cancel(fileId);
                        this.fileRepo.removeTempsById(fileId);
                    });
                }
                this.messageRepo.removePending(res.id);
                removeMessage();
            } else {
                removeMessage();
            }
        });
    }

    /* Download file */
    private downloadFile(msg: IMessage) {
        switch (msg.mediatype) {
            case MediaType.MEDIATYPEDOCUMENT:
                const mediaDocument: MediaDocument.AsObject = msg.mediadata;
                if (mediaDocument && mediaDocument.doc && mediaDocument.doc.id) {
                    const fileLocation = new InputFileLocation();
                    fileLocation.setAccesshash(mediaDocument.doc.accesshash || '');
                    fileLocation.setClusterid(mediaDocument.doc.clusterid || 1);
                    fileLocation.setFileid(mediaDocument.doc.id);
                    fileLocation.setVersion(mediaDocument.doc.version || 0);
                    this.fileManager.receiveFile(fileLocation, mediaDocument.doc.md5checksum || '', mediaDocument.doc.filesize || 0, mediaDocument.doc.mimetype || 'application/octet-stream', (progress) => {
                        this.progressBroadcaster.publish(msg.id || 0, progress);
                    }).then(() => {
                        this.broadcastEvent('File_Downloaded', {id: msg.id});
                        this.progressBroadcaster.remove(msg.id || 0);
                        msg.downloaded = true;
                        this.messageRepo.lazyUpsert([msg]);
                        if (this.state.selectedDialogId === msg.peerid) {
                            const messages = this.messages;
                            const index = findIndex(messages, {id: msg.id, messagetype: msg.messagetype});
                            if (index > -1) {
                                messages[index].downloaded = true;
                                // Force update messages
                                this.messageRef.list.forceUpdateGrid();
                            }
                        }
                        if (msg.messagetype === C_MESSAGE_TYPE.File && this.downloadManager.getDownloadSettings().auto_save_files) {
                            this.saveFile(msg);
                        }
                    }).catch((err) => {
                        window.console.debug(err);
                        if (err.code !== C_FILE_ERR_CODE.ALREADY_IN_QUEUE) {
                            this.progressBroadcaster.failed(msg.id || 0);
                            this.progressBroadcaster.remove(msg.id || 0);
                        }
                    });
                }
                break;
        }
    }

    /* Cancel download file */
    private cancelDownloadFile(msg: IMessage) {
        switch (msg.mediatype) {
            case MediaType.MEDIATYPEDOCUMENT:
                const mediaDocument: MediaDocument.AsObject = msg.mediadata;
                if (mediaDocument && mediaDocument.doc && mediaDocument.doc.id) {
                    this.fileManager.cancel(mediaDocument.doc.id);
                }
                break;
        }
    }

    /* ChatInput send voice handler */
    private chatInputVoiceHandler = (item: IMediaItem, param?: any) => {
        this.sendMediaMessage('voice', item, param);
    }

    /* ChatInput media select handler */
    private chatInputMediaSelectHandler = (items: IMediaItem[], param?: any) => {
        items.forEach((item) => {
            this.sendMediaMessage(item.mediaType, item, param);
        });
    }

    private sendMediaMessage(type: 'image' | 'video' | 'file' | 'voice' | 'audio' | 'none', mediaItem: IMediaItem, param?: any) {
        if (type === 'none') {
            return;
        }
        const {peer} = this.state;
        if (!peer) {
            return;
        }

        const attributesList: DocumentAttribute[] = [];
        const attributesDataList: any[] = [];

        const now = this.riverTime.now();
        const randomId = UniqueId.getRandomId();
        const id = -this.riverTime.milliNow();

        const fileIds: string[] = [];
        fileIds.push(String(UniqueId.getRandomId()));
        let messageType: number = C_MESSAGE_TYPE.File;

        const inputFile = new InputFile();
        inputFile.setFileid(fileIds[0]);
        inputFile.setFilename(mediaItem.name);
        inputFile.setMd5checksum('');
        inputFile.setTotalparts(1);

        const mediaData = new InputMediaUploadedDocument();
        mediaData.setCaption(mediaItem.caption || '');
        mediaData.setMimetype(mediaItem.fileType);
        mediaData.setStickersList([]);
        mediaData.setAttributesList(attributesList);
        mediaData.setFile(inputFile);

        const tempDocument = new Document();
        tempDocument.setAccesshash('');
        tempDocument.setAttributesList(attributesList);
        tempDocument.setClusterid(0);
        tempDocument.setDate(now);
        tempDocument.setId(fileIds[0]);
        tempDocument.setFilesize(mediaItem.file.size);
        tempDocument.setMimetype(mediaItem.fileType);
        tempDocument.setVersion(0);

        switch (type) {
            case 'file':
                messageType = C_MESSAGE_TYPE.File;

                const attrFileData = new DocumentAttributeFile();
                attrFileData.setFilename(mediaItem.name);

                const attrFile = new DocumentAttribute();
                attrFile.setData(attrFileData.serializeBinary());
                attrFile.setType(DocumentAttributeType.ATTRIBUTETYPEFILE);

                attributesList.push(attrFile);
                attributesDataList.push(attrFileData.toObject());
                break;
            case 'image':
                messageType = C_MESSAGE_TYPE.Picture;
                const attrPhotoData = new DocumentAttributePhoto();
                if (mediaItem.thumb) {
                    attrPhotoData.setHeight(mediaItem.thumb.height);
                    attrPhotoData.setWidth(mediaItem.thumb.width);
                } else {
                    attrPhotoData.setHeight(0);
                    attrPhotoData.setWidth(0);
                }

                const attrPhoto = new DocumentAttribute();
                attrPhoto.setData(attrPhotoData.serializeBinary());
                attrPhoto.setType(DocumentAttributeType.ATTRIBUTETYPEPHOTO);

                attributesList.push(attrPhoto);
                attributesDataList.push(attrPhotoData.toObject());
                break;
            case 'video':
                messageType = C_MESSAGE_TYPE.Video;
                const attrVideoData = new DocumentAttributeVideo();
                if (mediaItem.thumb) {
                    attrVideoData.setHeight(mediaItem.thumb.height);
                    attrVideoData.setWidth(mediaItem.thumb.width);
                } else {
                    attrVideoData.setHeight(0);
                    attrVideoData.setWidth(0);
                }
                attrVideoData.setDuration(Math.floor(mediaItem.duration || 0));
                attrVideoData.setRound(false);

                const attrVideo = new DocumentAttribute();
                attrVideo.setData(attrVideoData.serializeBinary());
                attrVideo.setType(DocumentAttributeType.ATTRIBUTETYPEVIDEO);

                attributesList.push(attrVideo);
                attributesDataList.push(attrVideoData.toObject());
                break;
            case 'voice':
                messageType = C_MESSAGE_TYPE.Voice;
                const u8aWaveForm = new Uint8Array(mediaItem.waveform || []);

                const attrVoiceData = new DocumentAttributeAudio();
                attrVoiceData.setAlbum('');
                attrVoiceData.setDuration(Math.floor(mediaItem.duration || 0));
                attrVoiceData.setTitle('');
                attrVoiceData.setPerformer('');
                attrVoiceData.setVoice(true);
                attrVoiceData.setWaveform(u8aWaveForm);

                const attrVoice = new DocumentAttribute();
                attrVoice.setData(attrVoiceData.serializeBinary());
                attrVoice.setType(DocumentAttributeType.ATTRIBUTETYPEAUDIO);

                attributesList.push(attrVoice);
                attributesDataList.push(attrVoiceData.toObject());
                break;
            case 'audio':
                messageType = C_MESSAGE_TYPE.Audio;

                const attrAudioData = new DocumentAttributeAudio();
                attrAudioData.setAlbum(mediaItem.album || '');
                attrAudioData.setDuration(Math.floor(mediaItem.duration || 0));
                attrAudioData.setTitle(mediaItem.title || '');
                attrAudioData.setPerformer(mediaItem.performer || '');
                attrAudioData.setVoice(false);

                const attrAudio = new DocumentAttribute();
                attrAudio.setData(attrAudioData.serializeBinary());
                attrAudio.setType(DocumentAttributeType.ATTRIBUTETYPEAUDIO);

                attributesList.push(attrAudio);
                attributesDataList.push(attrAudioData.toObject());
                break;
        }

        switch (type) {
            case 'image':
            case 'video':
            case 'audio':
                if (mediaItem.thumb) {
                    fileIds.push(String(UniqueId.getRandomId()));

                    const inputThumbFile = new InputFile();
                    inputThumbFile.setFileid(fileIds[1]);
                    inputThumbFile.setFilename(`thumb_${mediaItem.name}`);
                    inputThumbFile.setMd5checksum('');
                    inputThumbFile.setTotalparts(1);

                    const tempThumbInputFile = new FileLocation();
                    tempThumbInputFile.setAccesshash('');
                    tempThumbInputFile.setClusterid(0);
                    tempThumbInputFile.setFileid(fileIds[1]);

                    tempDocument.setThumbnail(tempThumbInputFile);
                    mediaData.setThumbnail(inputThumbFile);
                }
                break;
        }

        const mediaDocument = new MediaDocument();
        mediaDocument.setTtlinseconds(0);
        mediaDocument.setCaption(mediaItem.caption || '');
        mediaDocument.setDoc(tempDocument);

        const message: IMessage = {
            attributes: attributesDataList,
            createdon: now,
            id,
            me: true,
            mediadata: mediaDocument.toObject(),
            mediatype: MediaType.MEDIATYPEDOCUMENT,
            messageaction: C_MESSAGE_ACTION.MessageActionNope,
            messagetype: messageType,
            peerid: this.state.selectedDialogId,
            peertype: peer.getType(),
            senderid: this.connInfo.UserID,
        };

        let replyTo: any;
        if (param && param.mode === C_MSG_MODE.Reply) {
            message.replyto = param.message.id;
            replyTo = param.message.id;
        }

        this.pushMessage(message);

        let data = mediaData.serializeBinary();

        const uploadPromises: any[] = [];

        this.messageRepo.addPending({
            data,
            file_ids: fileIds,
            id: randomId,
            message_id: id,
        });

        switch (type) {
            case 'file':
            case 'voice':
                uploadPromises.push(this.fileManager.sendFile(fileIds[0], mediaItem.file, (progress) => {
                    this.progressBroadcaster.publish(id, progress);
                }));
                break;
            case 'image':
            case 'video':
            case 'audio':
                uploadPromises.push(this.fileManager.sendFile(fileIds[0], mediaItem.file, (progress) => {
                    this.progressBroadcaster.publish(id, progress);
                }));
                if (mediaItem.thumb) {
                    uploadPromises.push(this.fileManager.sendFile(fileIds[1], mediaItem.thumb.file));
                }
                break;
        }

        Promise.all(uploadPromises).then((arr) => {
            this.progressBroadcaster.remove(id);
            if (arr.length !== 0) {
                inputFile.setMd5checksum(arr[0]);
                mediaData.setFile(inputFile);
                data = mediaData.serializeBinary();
                this.messageRepo.addPending({
                    data,
                    file_ids: fileIds,
                    id: randomId,
                    message_id: id,
                });
            }
            this.sdk.sendMediaMessage(randomId, peer, InputMediaType.INPUTMEDIATYPEUPLOADEDDOCUMENT, data, replyTo).then((res) => {
                // For double checking update message id
                this.updateManager.setMessageId(res.messageid || 0);
                this.modifyPendingMessage({
                    messageid: res.messageid,
                    randomid: randomId,
                });

                const messages = this.messages;
                const index = findIndex(messages, {id: message.id, messagetype: messageType});
                if (index > -1) {
                    this.messageRef.cache.clear(index, 0);
                }

                message.id = res.messageid;
                message.downloaded = true;

                this.messageRepo.lazyUpsert([message]);
                this.updateDialogs(message, '0');

                this.checkMessageOrder(message);
                // Force update messages
                if (this.messageRef) {
                    this.messageRef.list.forceUpdateGrid();
                }
                this.newMessageLoadThrottle();
            }).catch((err) => {
                const messages = this.messages;
                const index = findIndex(messages, (o) => {
                    return o.id === id && o.messagetype === messageType;
                });
                if (index > -1) {
                    messages[index].error = true;
                    this.messageRepo.importBulk([messages[index]], false);
                    if (this.messageRef) {
                        this.messageRef.list.forceUpdateGrid();
                    }
                }
            });
        }).catch((err) => {
            this.progressBroadcaster.remove(id);
            if (err.code !== C_FILE_ERR_CODE.REQUEST_CANCELLED) {
                const messages = this.messages;
                const index = findIndex(messages, (o) => {
                    return o.id === id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                });
                if (index > -1) {
                    messages[index].error = true;
                    this.messageRepo.importBulk([messages[index]], false);
                    if (this.messageRef) {
                        this.messageRef.list.forceUpdateGrid();
                    }
                }
            }
        });
    }

    /* ChatInput contact select handler */
    private chatInputContactSelectHandler = (users: IUser[], param?: any) => {
        users.forEach((user) => {
            this.sendMediaMessageWithNoFile('contact', user, param);
        });
    }

    /* ChatInput map select handler */
    private chatInputMapSelectHandler = (item: IGeoItem, param?: any) => {
        this.sendMediaMessageWithNoFile('location', item, param);
    }

    // Send media message with no file
    private sendMediaMessageWithNoFile(type: 'contact' | 'location' | 'none', item: IUser | IGeoItem, param?: any) {
        if (type === 'none') {
            return;
        }
        const {peer} = this.state;
        if (peer === null) {
            return;
        }

        const now = this.riverTime.now();
        const randomId = UniqueId.getRandomId();
        const id = -this.riverTime.milliNow();

        let messageType = C_MESSAGE_TYPE.Contact;
        let mediaData: any;
        let media: any;
        let mediaType: InputMediaType = InputMediaType.INPUTMEDIATYPECONTACT;
        let mediaType2: MediaType = MediaType.MEDIATYPECONTACT;
        let caption = '';
        if (type === 'contact') {
            const user = item as IUser;
            const contact = new InputMediaContact();
            contact.setFirstname(user.firstname || '');
            contact.setLastname(user.lastname || '');
            contact.setPhone(user.phone || '');
            contact.setVcard('');
            mediaData = contact.toObject();
            media = contact.serializeBinary();
            mediaType = InputMediaType.INPUTMEDIATYPECONTACT;
            messageType = C_MESSAGE_TYPE.Contact;
            mediaType2 = MediaType.MEDIATYPECONTACT;
        } else if (type === 'location') {
            const location = item as IGeoItem;
            const geoData = new InputMediaGeoLocation();
            geoData.setLat(location.lat);
            geoData.setLong(location.long);
            caption = location.caption;
            mediaData = geoData.toObject();
            media = geoData.serializeBinary();
            mediaType = InputMediaType.INPUTMEDIATYPEGEOLOCATION;
            messageType = C_MESSAGE_TYPE.Location;
            mediaType2 = MediaType.MEDIATYPEGEOLOCATION;
        }

        const message: IMessage = {
            createdon: now,
            id,
            me: true,
            mediadata: mediaData,
            mediatype: mediaType2,
            messageaction: C_MESSAGE_ACTION.MessageActionNope,
            messagetype: messageType,
            peerid: this.state.selectedDialogId,
            peertype: peer.getType(),
            senderid: this.connInfo.UserID,
        };

        let replyTo: any;
        if (param && param.mode === C_MSG_MODE.Reply) {
            message.replyto = param.message.id;
            replyTo = param.message.id;
        }

        this.pushMessage(message);

        this.messageRepo.addPending({
            id: randomId,
            message_id: id,
        });

        this.sdk.sendMediaMessage(randomId, peer, mediaType, media, replyTo).then((res) => {
            // For double checking update message id
            this.updateManager.setMessageId(res.messageid || 0);
            this.modifyPendingMessage({
                messageid: res.messageid,
                randomid: randomId,
            });

            const messages = this.messages;
            const index = findIndex(messages, {id: message.id, messagetype: messageType});
            if (index > -1) {
                this.messageRef.cache.clear(index, 0);
            }

            message.id = res.messageid;

            this.messageRepo.lazyUpsert([message]);
            this.updateDialogs(message, '0');

            this.checkMessageOrder(message);
            // Force update messages
            if (this.messageRef) {
                this.messageRef.list.forceUpdateGrid();
            }
            this.newMessageLoadThrottle();

            if (caption.length > 0) {
                this.chatInputTextMessageHandler(caption, {mode: C_MSG_MODE.Reply, message: {id: res.messageid}});
            }
        }).catch((err) => {
            const messages = this.messages;
            const index = findIndex(messages, (o) => {
                return o.id === id && o.messagetype === messageType;
            });
            if (index > -1) {
                messages[index].error = true;
                this.messageRepo.importBulk([messages[index]], false);
                if (this.messageRef) {
                    this.messageRef.list.forceUpdateGrid();
                }
            }
        });
    }

    /* ChatInput voice state change handler */
    private chatInputVoiceStateChangeHandler = (state: 'lock' | 'down' | 'up' | 'play') => {
        this.isRecording = (state === 'lock' || state === 'down');
    }

    /* Save file by type */
    private saveFile(msg: IMessage) {
        switch (msg.mediatype) {
            case MediaType.MEDIATYPEDOCUMENT:
                const mediaDocument: MediaDocument.AsObject = msg.mediadata;
                if (mediaDocument && mediaDocument.doc && mediaDocument.doc.id) {
                    this.fileRepo.get(mediaDocument.doc.id).then((res) => {
                        if (res) {
                            if (ElectronService.isElectron()) {
                                this.downloadWithElectron(res.data, msg);
                            } else {
                                saveAs(res.data, this.getFileName(msg));
                            }
                        }
                    });
                }
                break;
        }
    }

    private getFileName(message: IMessage) {
        let name = '';
        const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
        messageMediaDocument.doc.attributesList.forEach((attr, index) => {
            if (attr.type === DocumentAttributeType.ATTRIBUTETYPEFILE && message.attributes) {
                const docAttr: DocumentAttributeFile.AsObject = message.attributes[index];
                name = docAttr.filename || '';
            }
        });
        if (name.length === 0) {
            name = `${this.riverTime.milliNow()}`;
        }
        return name;
    }

    private downloadWithElectron(blob: Blob, message: IMessage) {
        const fileInfo = getFileInfo(message);
        if (fileInfo.name.length === 0) {
            fileInfo.name = `downloaded_${this.riverTime.now()}`;
        }
        const objectUrl = URL.createObjectURL(blob);
        this.electronService.download(objectUrl, fileInfo.name).then((res) => {
            const messages = this.messages;
            const index = findIndex(messages, {id: message.id, messagetype: C_MESSAGE_TYPE.File});
            if (index > -1) {
                this.messageRef.cache.clear(index, 0);
            }

            message.saved = true;
            message.savedPath = res.path;
            this.messageRepo.lazyUpsert([message]);
            // Force update messages
            this.messageRef.list.forceUpdateGrid();

            // Just to make sure subscribers will update their view
            this.broadcastEvent('File_Downloaded', {id: message.id});
        }).catch((err) => {
            window.console.log(err);
        });
    }

    /* Open file and focus on folder */
    private openFile(message: IMessage) {
        if (message && message.savedPath) {
            this.electronService.revealFile(message.savedPath);
        }
    }

    /* Preview file */
    private previewFile(message: IMessage) {
        if (message && message.savedPath) {
            this.electronService.previewFile(message.savedPath);
        }
    }

    /* Read message content */
    private readMessageContent(message: IMessage) {
        const {peer} = this.state;
        if (message && !message.contentread && !message.me && peer) {
            this.sdk.readMessageContent([message.id || 0], peer);
        }
    }

    private audioPlayerVisibleHandler = (visible: boolean) => {
        // setTimeout(() => {
        //     if (this.messageComponent) {
        //         this.messageComponent.fitList(true);
        //     }
        // }, 210);
    }

    /* Delete and exit group handler */
    private deleteAndExitGroupHandler = () => {
        const {leftMenuSelectedDialogId} = this.state;
        if (leftMenuSelectedDialogId === '') {
            return;
        }
        const peer = this.getPeerByDialogId(leftMenuSelectedDialogId);
        if (!peer) {
            return;
        }
        const id = this.sdk.getConnInfo().UserID || '';
        const user = new InputUser();
        user.setUserid(id);
        user.setAccesshash('');
        const dialogId = peer.getId() || '';
        this.sdk.groupRemoveMember(peer, user).then(() => {
            const dialog = this.getDialogById(dialogId);
            if (dialog && dialog.topmessageid) {
                this.sdk.clearMessage(peer, dialog.topmessageid, true);
            }
        });
        this.confirmDialogCloseHandler();
    }

    /* Delete user handler */
    private deleteUserHandler = () => {
        const {leftMenuSelectedDialogId} = this.state;
        if (leftMenuSelectedDialogId === '') {
            return;
        }
        const peer = this.getPeerByDialogId(leftMenuSelectedDialogId);
        if (!peer) {
            return;
        }
        const id = this.sdk.getConnInfo().UserID || '';
        const user = new InputUser();
        user.setUserid(id);
        user.setAccesshash('');
        const dialog = this.getDialogById(peer.getId() || '');
        if (dialog && dialog.topmessageid) {
            this.sdk.clearMessage(peer, dialog.topmessageid, true);
        }
        this.confirmDialogCloseHandler();
    }

    /* Cancel recording handler */
    private cancelRecordingHandler = () => {
        this.props.history.push(`/chat/${this.upcomingDialogId}`);
        this.upcomingDialogId = '!' + this.upcomingDialogId;
        this.confirmDialogCloseHandler();
    }

    /* GroupInfo delete and exit handler */
    private groupInfoDeleteAndExitHandler = () => {
        this.setState({
            confirmDialogMode: 'delete_exit_group',
            confirmDialogOpen: true,
            leftMenu: 'chat',
            leftMenuSelectedDialogId: this.state.selectedDialogId,
        });
    }

    /* Update force log out */
    private updateAuthorizationResetHandler = () => {
        this.logOutHandler();
    }

    /* Update dialog pinned handler */
    private updateDialogPinnedHandler = (data: UpdateDialogPinned.AsObject) => {
        this.pinDialog(data.peer.id || '', data.pinned);
    }

    private pinDialog(peerId: string, pinned?: boolean) {
        const dialogs = this.dialogs;
        const index = findIndex(dialogs, {peerid: peerId});
        if (index > -1) {
            let update = false;
            if (pinned === undefined) {
                dialogs[index].pinned = !(dialogs[index].pinned || false);
                update = true;
            } else {
                if (!dialogs[index].pinned && pinned) {
                    dialogs[index].pinned = pinned;
                    update = true;
                } else if (dialogs[index].pinned && !pinned) {
                    dialogs[index].pinned = pinned;
                    update = true;
                }
            }
            if (update) {
                this.dialogRepo.lazyUpsert([dialogs[index]]);
                this.dialogsSort(dialogs);
            }
        }
    }

    private getMoveDown() {
        const {selectedDialogId} = this.state;
        const dialog = this.getDialogById(selectedDialogId);
        if (dialog) {
            return (<div ref={this.moveDownRefHandler} className="move-down" onClick={this.moveDownClickHandler}>
                <Badge color="primary" badgeContent={dialog.unreadcount}
                       invisible={Boolean(dialog.unreadcount === 0)}>
                    <ExpandMoreRounded/>
                </Badge>
            </div>);
        } else {
            return '';
        }
    }

    private moveDownRefHandler = (ref: any) => {
        this.moveDownRef = ref;
    }

    private moveDownClickHandler = () => {
        if (!this.messageRef) {
            return;
        }
        const dialog = this.getDialogById(this.state.selectedDialogId);
        if (dialog) {
            const scrollDown = () => {
                if ((this.messages.length > 0 && this.messages[this.messages.length - 1].id === dialog.topmessageid) || !dialog.topmessageid) {
                    // Normal scroll down
                    this.messageRef.animateToEnd();
                } else {
                    // Load to the end
                    this.messageRef.takeSnapshot(true);
                    this.messageRef.setLoading(true, true);
                    this.getMessagesByDialogId(this.state.selectedDialogId, true, undefined, dialog.topmessageid + 1);
                }
            };
            if ((dialog.unreadcount || 0) > 0) {
                // New message breakpoint
                const before = Math.max((dialog.readinboxmaxid || 0), (dialog.readoutboxmaxid || 0));
                const index = findLastIndex(this.messages, {id: before});
                if (index > -1) {
                    if (this.scrollInfo && (this.messages[this.scrollInfo.stopIndex].id || 0) < before) {
                        this.messageJumpToMessageHandler(before);
                        setTimeout(() => {
                            if (this.messageRef) {
                                this.messageRef.focusOnNewMessage();
                            }
                        }, 200);
                    } else {
                        scrollDown();
                    }
                } else {
                    // Load until new message
                    this.messageRef.takeSnapshot(true);
                    this.messageRef.setLoading(true, true);
                    this.getMessagesByDialogId(this.state.selectedDialogId, true, undefined, before);
                }
            } else {
                scrollDown();
            }
        } else {
            // Normal scroll down
            this.messageRef.animateToEnd();
        }
    }

    private setEndOfMessage(end: boolean) {
        this.endOfMessage = end;
    }

    private setMoveDownVisible(visible: boolean) {
        if (!this.moveDownRef) {
            return;
        }
        if (visible && !this.moveDownVisible) {
            this.moveDownRef.classList.add('visible');
            this.moveDownVisible = true;
        } else if (!visible && this.moveDownVisible) {
            this.moveDownRef.classList.remove('visible');
            this.moveDownVisible = false;
        }
    }

    private conversationRefHandler = (ref: any) => {
        this.conversationRef = ref;
        this.backgroundService.setRef(ref);
    }

    private searchMessageFindHandler = (id: number, text: string) => {
        this.messageJumpToMessageHandler(id, text);
    }

    private searchMessageCloseHandler = () => {
        highlightMessageText(-1, '');
    }

    private broadcastEvent(name: string, data: any) {
        const event = new CustomEvent(name, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(event);
    }

    private closeIframeHandler = () => {
        this.iframeService.close();
    }

    private newMessageLoad = () => {
        // Force update messages
        this.messageRef.animateToEnd();
    }

    private downloadThumbnail = (message: IMessage) => {
        switch (message.messagetype) {
            case C_MESSAGE_TYPE.Picture:
            case C_MESSAGE_TYPE.Video:
                const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
                if (messageMediaDocument && messageMediaDocument.doc.thumbnail) {
                    const fileLocation = new InputFileLocation();
                    fileLocation.setFileid(messageMediaDocument.doc.thumbnail.fileid || '');
                    fileLocation.setAccesshash(messageMediaDocument.doc.thumbnail.accesshash || '');
                    fileLocation.setClusterid(messageMediaDocument.doc.thumbnail.clusterid || 0);
                    fileLocation.setVersion(0);
                    this.fileManager.receiveFile(fileLocation, '', 0, 'image/jpeg');
                }
                break;
        }
    }

    private audioPlayerErrorHandler = (info: IAudioInfo, err: any) => {
        this.messageRepo.lazyUpsert([{
            downloaded: false,
            id: info.messageId,
            saved: false,
        }]);
        if (this.state.selectedDialogId === info.peerId) {
            const index = findLastIndex(this.messages, (o) => {
                return o.id === info.messageId && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
            });
            if (index > -1 && this.messageRef) {
                this.messages[index].downloaded = false;
                this.messages[index].saved = false;
                this.messageRef.list.forceUpdateGrid();
                this.messageRef.forceUpdate();
            }
        }
    }

    private audioPlayerUpdateDurationHandler = (info: IAudioInfo, duration: number) => {
        this.messageRepo.get(info.messageId).then((res) => {
            if (res && res.messagetype === C_MESSAGE_TYPE.Audio && res.mediadata.doc && res.mediadata.doc.attributesList && res.attributes) {
                const index = findIndex(res.mediadata.doc.attributesList, {type: DocumentAttributeType.ATTRIBUTETYPEAUDIO});
                if (index > -1 && res.attributes[index]) {
                    res.attributes[index].duration = Math.floor(duration);
                    this.messageRepo.lazyUpsert([res]);
                }
            }
        });
    }

    /*private testHandler = () => {
        setTimeout(() => {
            this.messageComponent.disableScroll();
            window.console.log('disableScroll');
        }, 2000);
        // this.messageComponent.setScrollMode('stay');
        // this.messageComponent.takeSnapshot(true);
    }

    private test2Handler = () => {
        this.messageComponent.keepView();
    }*/
}

export default Chat;
