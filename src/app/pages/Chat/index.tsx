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
import MessageRepo, {getMediaDocument} from '../../repository/message/index';
import DialogRepo from '../../repository/dialog/index';
import UniqueId from '../../services/uniqueId/index';
import ChatInput, {C_TYPING_INTERVAL, C_TYPING_INTERVAL_OFFSET, IMessageParam} from '../../components/ChatInput/index';
import {
    clone,
    cloneDeep,
    difference,
    differenceBy,
    find,
    findIndex,
    findLastIndex,
    intersectionBy,
    throttle,
    trimStart,
    uniq,
} from 'lodash';
import APIManager from '../../services/sdk/index';
import NewMessage from '../../components/NewMessage';
import {IConnInfo} from '../../services/sdk/interface';
import {IDialog} from '../../repository/dialog/interface';
import UpdateManager, {
    IDialogDBUpdated,
    IMessageDBRemoved,
    IMessageDBUpdated,
    IMessageIdDBUpdated
} from '../../services/sdk/updateManager';
import {C_ERR, C_ERR_ITEM, C_LOCALSTORAGE, C_MSG} from '../../services/sdk/const';
import UserName from '../../components/UserName';
import UserRepo from '../../repository/user';
import MainRepo from '../../repository';
import {C_MSG_MODE} from '../../components/ChatInput/consts';
import TimeUtility from '../../services/utilities/time';
import {C_BUTTON_ACTION, C_MESSAGE_ACTION, C_MESSAGE_TYPE, C_REPLY_ACTION} from '../../repository/message/consts';
import PopUpDate from '../../components/PopUpDate';
import GroupRepo from '../../repository/group';
import GroupName from '../../components/GroupName';
import {isMuted} from '../../components/UserInfoMenu';
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
import RiverTime from '../../services/utilities/river_time';
import FileRepo, {getFileLocation} from '../../repository/file';
import ProgressBroadcaster from '../../services/progress';
import {C_FILE_ERR_CODE} from '../../services/sdk/fileManager/const/const';
import {getMessageTitle} from '../../components/Dialog/utils';
import {saveAs} from 'file-saver';
import {getFileExtension, getFileInfo} from '../../components/MessageFile';
import AudioPlayerShell from '../../components/AudioPlayerShell';
import DocumentViewer from '../../components/DocumentViewer';
import {IUser} from '../../repository/user/interface';
import Uploader, {getUploaderInput, IMediaItem, IUploaderOptions} from '../../components/Uploader';
import {IGeoItem} from '../../components/MapPicker';
import RTLDetector from '../../services/utilities/rtl_detector';
import BackgroundService from '../../services/backgroundService';
import {C_CUSTOM_BG} from '../../components/SettingsMenu/vars/theme';
import SearchMessage from '../../components/SearchMessage';
import SettingsConfigManager from '../../services/settingsConfigManager';
import * as Sentry from '@sentry/browser';
import SelectPeerDialog from "../../components/SelectPeerDialog";
import AboutDialog from "../../components/AboutModal";
import StatusBar from "../../components/StatusBar";
import i18n from "../../services/i18n";
import IframeService, {C_IFRAME_SUBJECT} from '../../services/iframe';
import PopUpNewMessage from "../../components/PopUpNewMessage";
import CachedMessageService from "../../services/cachedMessageService";
import {C_VERSION, isProd} from "../../../App";
import {emojiLevel} from "../../services/utilities/emoji";
import AudioPlayer, {IAudioInfo} from "../../services/audioPlayer";
import LeftMenu, {menuAction} from "../../components/LeftMenu";
import {C_CUSTOM_BG_ID} from "../../components/SettingsMenu";
import RightMenu from "../../components/RightMenu";
import InfoBar from "../../components/InfoBar";
import MoveDown from "../../components/MoveDown";
import {OptionsObject, withSnackbar} from "notistack";
import {scrollFunc} from "../../services/kkwindow/utils";
import Landscape from "../../components/SVG";
import {isMobile} from "../../services/utilities/localize";
import LabelRepo from "../../repository/label";
import LabelDialog from "../../components/LabelDialog";
import AvatarService from "../../services/avatarService";
import {
    EventBlur,
    EventFocus,
    EventMouseWheel,
    EventNetworkStatus,
    EventWasmInit,
    EventWasmStarted,
    EventWebSocketClose,
    EventWebSocketOpen
} from "../../services/events";
import Smoother from "../../services/utilities/smoother";
import BufferProgressBroadcaster from "../../services/bufferProgress";
import TopPeerRepo, {C_TOP_PEER_LEN, TopPeerType} from "../../repository/topPeer";
import {
    InputPeer,
    MessageEntity,
    PeerType,
    TypingAction,
    Error as RiverError,
    PeerNotifySettings,
    InputUser,
    InputFile,
    MediaType,
    FileLocation,
    InputDocument,
    InputFileLocation,
    InputMediaType,
    MessageEntityType,
} from "../../services/sdk/messages/core.types_pb";
import {
    UpdateDialogPinned,
    UpdateDraftMessage,
    UpdateDraftMessageCleared,
    UpdateGroupPhoto, UpdateLabelDeleted, UpdateLabelItemsAdded, UpdateLabelItemsRemoved, UpdateLabelSet,
    UpdateMessageEdited, UpdateMessagesDeleted,
    UpdateNewMessage, UpdateNotifySettings,
    UpdateReadHistoryInbox, UpdateReadHistoryOutbox, UpdateReadMessagesContents, UpdateUsername, UpdateUserPhoto,
    UpdateUserTyping
} from "../../services/sdk/messages/updates_pb";
import {TopPeerCategory} from "../../services/sdk/messages/contacts_pb";
import {ButtonUrl, Button as BotButton, ButtonCallback} from "../../services/sdk/messages/chat.messages.markups_pb";
import {
    Document,
    DocumentAttribute,
    DocumentAttributeAnimated, DocumentAttributeAudio,
    DocumentAttributeFile,
    DocumentAttributePhoto,
    DocumentAttributeType,
    DocumentAttributeVideo, InputMediaContact,
    InputMediaDocument, InputMediaGeoLocation, InputMediaMessageDocument,
    InputMediaUploadedDocument,
    MediaContact, MediaDocument,
    MediaGeoLocation
} from "../../services/sdk/messages/chat.messages.medias_pb";
import GifRepo from "../../repository/gif";
import {IGif} from "../../repository/gif/interface";

import './style.scss';

export let notifyOptions: any[] = [];

interface IProps {
    history?: any;
    location?: any;
    match?: any;
    enqueueSnackbar?: (message: string | React.ReactNode, options?: OptionsObject) => OptionsObject['key'] | null;
}

interface IState {
    botAlertMessage: string;
    chatMoreAnchorEl: any;
    confirmDialogMode: 'none' | 'logout' | 'remove_message' | 'remove_message_revoke' | 'remove_message_pending' | 'delete_exit_group' | 'delete_user' | 'cancel_recording' | 'bot_alert' | 'bot_send_phone' | 'bot_send_location';
    confirmDialogOpen: boolean;
    forwardRecipientDialogOpen: boolean;
    iframeActive: boolean;
    leftMenuSelectedDialogId: string;
    openNewMessage: boolean;
    rightMenuShrink: boolean;
}

class Chat extends React.Component<IProps, IState> {
    private conversationRef: any = null;
    private containerRef: any = null;
    private isInChat: boolean = true;
    private rightMenuRef: RightMenu | undefined;
    private leftMenuRef: LeftMenu | undefined;
    private dialogRef: Dialog | undefined;
    private statusBarRef: StatusBar | undefined;
    private popUpDateRef: PopUpDate | undefined;
    private popUpNewMessageRef: PopUpNewMessage | undefined;
    private infoBarRef: InfoBar | undefined;
    private messageRef: Message | undefined;
    private chatInputRef: ChatInput | undefined;
    private messages: IMessage[] = [];
    private messageMap: { [key: number]: boolean } = {};
    private messageRepo: MessageRepo;
    private dialogRepo: DialogRepo;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;
    private fileRepo: FileRepo;
    private mainRepo: MainRepo;
    private labelRepo: LabelRepo;
    private topPeerRepo: TopPeerRepo;
    private gifRepo: GifRepo;
    private isLoading: boolean = false;
    private apiManager: APIManager;
    private updateManager: UpdateManager;
    private connInfo: IConnInfo;
    private eventReferences: any[] = [];
    private readonly dialogsSortThrottle: any = null;
    private isMobileView: boolean = false;
    private mobileBackTimeout: any = null;
    private forwardDialogRef: SelectPeerDialog | undefined;
    private userDialogRef: UserDialog | undefined;
    private fileManager: FileManager;
    private electronService: ElectronService;
    private riverTime: RiverTime;
    private progressBroadcaster: ProgressBroadcaster;
    private bufferProgressBroadcaster: BufferProgressBroadcaster;
    private firstTimeLoad: boolean = true;
    private rtlDetector: RTLDetector;
    private moveDownRef: MoveDown | undefined;
    private endOfMessage: boolean = false;
    private lastMessageId: number = -1;
    private dialogReadMap: { [key: string]: { peer: InputPeer, id: number } } = {};
    private readonly messageReadThrottle: any = null;
    private newMessageFlag: boolean = false;
    private backgroundService: BackgroundService;
    private searchMessageRef: SearchMessage | undefined;
    private settingsConfigManager: SettingsConfigManager;
    private aboutDialogRef: AboutDialog | undefined;
    private labelDialogRef: LabelDialog | undefined;
    private dialogMap: { [key: string]: number } = {};
    private dialogs: IDialog[] = [];
    private isTypingList: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } } = {};
    private iframeService: IframeService;
    private readonly newMessageLoadThrottle: any = null;
    private scrollInfo: {
        end: number;
        overscanEnd: number;
        overscanStart: number;
        start: number;
    } = {
        end: 0,
        overscanEnd: 0,
        overscanStart: 0,
        start: 0,
    };
    private cachedMessageService: CachedMessageService;
    private updateReadInboxTimeout: any = {};
    private isRecording: boolean = false;
    private upcomingDialogId: string = 'null';
    private selectedDialogId: string = 'null';
    private peer: InputPeer | null = null;
    private messageSelectable: boolean = false;
    private messageSelectedIds: { [key: number]: number } = {};
    private isConnecting: boolean = true;
    private isOnline: boolean = navigator.onLine === undefined ? true : navigator.onLine;
    private isUpdating: boolean = false;
    private shrunk: boolean = false;
    private isMobileBrowser = isMobile();
    private avatarService: AvatarService;
    private isBot: boolean = false;
    private smoother: Smoother;
    private uploaderRef: Uploader | undefined;
    private topPeerInitialized: boolean = false;
    private readonly userId: string = '0';

    constructor(props: IProps) {
        super(props);

        this.iframeService = IframeService.getInstance();

        this.state = {
            botAlertMessage: '',
            chatMoreAnchorEl: null,
            confirmDialogMode: 'none',
            confirmDialogOpen: false,
            forwardRecipientDialogOpen: false,
            iframeActive: this.iframeService.isActive(),
            leftMenuSelectedDialogId: '',
            openNewMessage: false,
            rightMenuShrink: false,
        };
        this.selectedDialogId = props.match.params.id;
        this.riverTime = RiverTime.getInstance();
        this.fileManager = FileManager.getInstance();
        this.apiManager = APIManager.getInstance();
        this.apiManager.loadConnInfo();
        this.connInfo = this.apiManager.getConnInfo();
        this.userId = this.connInfo.UserID || '0';
        this.messageRepo = MessageRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.dialogRepo = DialogRepo.getInstance();
        this.fileRepo = FileRepo.getInstance();
        this.mainRepo = MainRepo.getInstance();
        this.labelRepo = LabelRepo.getInstance();
        this.topPeerRepo = TopPeerRepo.getInstance();
        this.gifRepo = GifRepo.getInstance();
        this.updateManager = UpdateManager.getInstance();
        this.dialogsSortThrottle = throttle(this.dialogsSort, 256);
        this.isInChat = (document.visibilityState === 'visible');
        this.isMobileView = (window.innerWidth < 600);
        this.updateManager.setUserId(this.connInfo.UserID || '');
        this.progressBroadcaster = ProgressBroadcaster.getInstance();
        this.bufferProgressBroadcaster = BufferProgressBroadcaster.getInstance();
        this.electronService = ElectronService.getInstance();
        this.rtlDetector = RTLDetector.getInstance();
        this.messageReadThrottle = throttle(this.readMessage, 256);
        this.backgroundService = BackgroundService.getInstance();
        this.settingsConfigManager = SettingsConfigManager.getInstance();
        this.newMessageLoadThrottle = throttle(this.newMessageLoad, 128);
        this.cachedMessageService = CachedMessageService.getInstance();
        this.avatarService = AvatarService.getInstance();
        const audioPlayer = AudioPlayer.getInstance();
        audioPlayer.setErrorFn(this.audioPlayerErrorHandler);
        audioPlayer.setUpdateDurationFn(this.audioPlayerUpdateDurationHandler);
        this.smoother = new Smoother(2000, this.updateFunctionHandler);

        if (isProd) {
            Sentry.configureScope((scope) => {
                scope.setUser({
                    'app_version': C_VERSION,
                    'auth_id': this.connInfo.AuthID,
                    'user_id': this.userId
                });
            });
        }

        notifyOptions = [{
            title: i18n.t('general.enable'),
            val: '-1',
        }, {
            title: i18n.t('peer_info.disable_for_1_hour'),
            val: '60',
        }, {
            title: i18n.t('peer_info.disable_for_8_hours'),
            val: '480',
        }, {
            title: i18n.t('peer_info.disable_for_1_day'),
            val: '1440',
        }, {
            title: i18n.t('general.disable'),
            val: '-2',
        }];
    }

    public componentDidMount() {
        if (this.connInfo.AuthID === '0' || this.connInfo.UserID === '0') {
            this.props.history.push('/signup/null');
            return;
        }

        this.updateManager.enableLiveUpdate();

        // this.messageRepo.upsert([{
        //     id: 39397,
        //     temp: true,
        // }]);

        // Global event listeners
        window.addEventListener(EventFocus, this.windowFocusHandler);
        window.addEventListener(EventBlur, this.windowBlurHandler);
        window.addEventListener(EventMouseWheel, this.windowMouseWheelHandler);
        window.addEventListener(EventWasmInit, this.wasmInitHandler);
        window.addEventListener(EventWasmStarted, this.fnStartedHandler);
        window.addEventListener(EventWebSocketOpen, this.wsOpenHandler);
        window.addEventListener(EventWebSocketClose, this.wsCloseHandler);
        window.addEventListener(EventNetworkStatus, this.networkStatusHandler);

        // Get latest cached dialogs
        this.initDialogs();

        // Initialize peer
        const peer = this.getPeerByDialogId(this.selectedDialogId);
        if (peer.user) {
            this.isBot = peer.user.isbot || false;
        } else {
            this.userRepo.get(this.selectedDialogId).then((user) => {
                this.isBot = user ? (user.isbot || false) : false;
            });
        }
        this.setChatParams(this.selectedDialogId, peer.peer, false, {});

        // Update: New Message Received
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateNewMessage, this.updateNewMessageHandler));

        // Update: Message Dropped (internal)
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateNewMessageDrop, this.updateMessageDropHandler));

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

        // Update: User Photo
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateUserPhoto, this.updateUserPhotoHandler));

        // Update: Group Photo
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateGroupPhoto, this.updateGroupPhotoHandler));

        // Update: Force Log Out
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateAuthorizationReset, this.updateAuthorizationResetHandler));

        // Update: dialog pinned
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateDialogPinned, this.updateDialogPinnedHandler));

        // Update: dialog draft message
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateDraftMessage, this.updateDraftMessageHandler));

        // Update: dialog draft message cleared
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateDraftMessageCleared, this.updateDraftMessageClearedHandler));

        // Update: label set
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateLabelSet, this.updateLabelSetHandler));

        // Update: label deleted
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateLabelDeleted, this.updateLabelDeletedHandler));

        // Update: label items added
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateLabelItemsAdded, this.updateLabelItemsAddedHandler));

        // Update: label items removed
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateLabelItemsRemoved, this.updateLabelItemsRemovedHandler));

        // Update: sync status
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateManagerStatus, this.updateManagerStatusHandler));

        // Update: dialog db updated
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateDialogDB, this.updateDialogDBUpdatedHandler));

        // Update: message db updated
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateMessageDB, this.updateMessageDBUpdatedHandler));

        // Update: message db updated
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateMessageIdDB, this.updateMessageIdDBUpdatedHandler));

        // Update: message db removed
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateMessageDBRemoved, this.updateMessageDBRemovedHandler));

        // TODO: add timestamp to pending message


        // Electron events
        this.eventReferences.push(this.electronService.listen(C_ELECTRON_SUBJECT.Setting, this.electronSettingsHandler));
        this.eventReferences.push(this.electronService.listen(C_ELECTRON_SUBJECT.About, this.electronAboutHandler));
        this.eventReferences.push(this.electronService.listen(C_ELECTRON_SUBJECT.Logout, this.electronLogoutHandler));
        this.eventReferences.push(this.electronService.listen(C_ELECTRON_SUBJECT.SizeMode, this.electronSizeModeHandler));

        if (localStorage.getItem(C_LOCALSTORAGE.ThemeBg) === C_CUSTOM_BG) {
            this.backgroundService.getBackground(C_CUSTOM_BG_ID, true);
        }

        if (!this.state.iframeActive) {
            this.eventReferences.push(this.iframeService.listen(C_IFRAME_SUBJECT.IsLoaded, (e) => {
                this.setState({
                    iframeActive: true,
                });
            }));
        }

        this.setAppStatus({
            isConnecting: this.isConnecting,
            isOnline: this.isOnline,
            isUpdating: this.isUpdating,
        });
    }

    public componentWillReceiveProps(newProps: IProps) {
        const selectedId = newProps.match.params.id;
        const selectedMessageId = newProps.match.params.mid;
        if (selectedId === 'null') {
            if (this.isMobileView) {
                this.setChatView(false);
            }
        } else if (selectedId === this.selectedDialogId) {
            if (selectedMessageId && selectedMessageId !== 'null') {
                this.messageJumpToMessageHandler(parseInt(selectedMessageId, 10));
            }
            if (this.isMobileView) {
                this.setChatView(true);
            }
            return;
        }
        if (this.isRecording && this.upcomingDialogId !== '!' + selectedId) {
            this.props.history.push(`/chat/${this.selectedDialogId}`);
            this.upcomingDialogId = selectedId;
            this.setState({
                confirmDialogMode: 'cancel_recording',
                confirmDialogOpen: true,
            });
            return;
        }
        this.cachedMessageService.clearPeerId(this.selectedDialogId);
        this.newMessageLoadThrottle.cancel();
        this.updateDialogsCounter(this.selectedDialogId, {scrollPos: this.lastMessageId});
        if (selectedId === 'null') {
            this.setChatParams(selectedId, null);
        } else {
            if (this.isMobileView) {
                this.setChatView(true);
            }
            const peer = this.getPeerByDialogId(selectedId);
            this.isBot = peer.user ? (peer.user.isbot || false) : false;
            this.setLoading(true);
            const tempSelectedDialogId = this.selectedDialogId;
            this.setChatParams(selectedId, peer.peer, false, {});
            if (this.messageRef) {
                this.messageRef.setMessages([]);
            }
            const fn = () => {
                this.setLeftMenu('chat');
                this.getMessagesByDialogId(selectedId, true, selectedMessageId);
            };
            if (tempSelectedDialogId === 'null') {
                setTimeout(fn, 5);
            } else {
                fn();
            }
        }
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });

        this.updateManager.disableLiveUpdate();

        window.removeEventListener(EventFocus, this.windowFocusHandler);
        window.removeEventListener(EventBlur, this.windowBlurHandler);
        window.removeEventListener(EventMouseWheel, this.windowMouseWheelHandler);
        window.removeEventListener(EventWasmInit, this.wasmInitHandler);
        window.removeEventListener(EventWasmStarted, this.fnStartedHandler);
        window.removeEventListener(EventWebSocketOpen, this.wsOpenHandler);
        window.removeEventListener(EventWebSocketClose, this.wsCloseHandler);
        window.removeEventListener(EventNetworkStatus, this.networkStatusHandler);
    }

    public render() {
        const {confirmDialogMode, confirmDialogOpen, rightMenuShrink} = this.state;
        return (
            <div className="bg">
                <div className="wrapper">
                    <div key="container" ref={this.containerRefHandler}
                         className={'container' + (this.isMobileView ? ' mobile-view' : '')}>
                        <LeftMenu ref={this.leftMenuRefHandler} dialogRef={this.dialogRefHandler}
                                  cancelIsTyping={this.cancelIsTypingHandler}
                                  onContextMenu={this.dialogContextMenuHandler}
                                  onSettingsClose={this.bottomBarSelectHandler('chat')}
                                  onSettingsAction={this.settingActionHandler}
                                  onUpdateMessages={this.settingUpdateMessageHandler}
                                  onReloadDialog={this.settingReloadDialogHandler}
                                  onAction={this.leftMenuActionHandler}
                                  onGroupCreate={this.leftMenuGroupCreateHandler}
                                  onShrunk={this.leftMenuShrunkHandler}
                                  onError={this.textErrorHandler}
                                  iframeActive={this.state.iframeActive}
                                  mobileView={this.isMobileView}
                                  onDrop={this.leftMenuDropHandler}
                                  onMediaAction={this.messageAttachmentActionHandler}
                        />
                        {this.selectedDialogId !== 'null' &&
                        <div
                            className={'column-center' + (rightMenuShrink ? ' shrink' : '')}>
                            <div className="top">
                                <InfoBar key="info-bar" ref={this.infoBarRefHandler} onBack={this.backToChatsHandler}
                                         onClose={this.closePeerHandler} onAction={this.messageMoreActionHandler}
                                         statusBarRefHandler={this.statusBarRefHandler}
                                         isMobileView={this.isMobileView}/>
                                <AudioPlayerShell key="audio-player-shell" onVisible={this.audioPlayerVisibleHandler}
                                                  onAction={this.messageAttachmentActionHandler}/>
                            </div>
                            <div ref={this.conversationRefHandler} className="conversation">
                                <PopUpDate key="pop-up-date" ref={this.popUpDateRefHandler}/>
                                <PopUpNewMessage key="pop-up-new-message" ref={this.popUpNewMessageRefHandler}
                                                 onClick={this.popUpNewMessageClickHandler}/>
                                <SearchMessage key="search-message" ref={this.searchMessageHandler}
                                               onFind={this.searchMessageFindHandler}
                                               onClose={this.searchMessageCloseHandler}/>
                                <Message key="messages" ref={this.messageRefHandler}
                                         isMobileView={this.isMobileView}
                                         showDate={this.messageShowDateHandler}
                                         showNewMessage={this.messageShowNewMessageHandler}
                                         onContextMenu={this.messageContextMenuHandler}
                                         onSelectedIdsChange={this.messageSelectedIdsChangeHandler}
                                         onSelectableChange={this.messageSelectableChangeHandler}
                                         onJumpToMessage={this.messageJumpToMessageHandler}
                                         onLastMessage={this.messageLastMessageHandler}
                                         onLastIncomingMessage={this.messageLastIncomingMessageHandler}
                                         onLoadMoreBefore={this.messageLoadMoreBeforeHandler}
                                         onLoadMoreAfter={this.messageLoadMoreAfterHandler}
                                         onAttachmentAction={this.messageAttachmentActionHandler}
                                         onRendered={this.messageRenderedHandler}
                                         onDrop={this.messageDropHandler}
                                         onBotCommand={this.messageBotCommandHandler}
                                         onBotButtonAction={this.messageBotButtonActionHandler}
                                         onMessageDrop={this.messageMessageDropHandler}
                                         onError={this.textErrorHandler}
                                         userId={this.userId}
                                         isBot={this.isBot}
                                />
                                <MoveDown key="move-down" ref={this.moveDownRefHandler}
                                          onClick={this.moveDownClickHandler}/>
                            </div>
                            <ChatInput key="chat-input" ref={this.chatInputRefHandler}
                                       peer={this.peer}
                                       userId={this.userId}
                                       onTextSend={this.chatInputTextSendHandler}
                                       onTyping={this.chatInputTypingHandler}
                                       onBulkAction={this.chatInputBulkActionHandler}
                                       onAction={this.chatInputActionHandler}
                                       onVoiceSend={this.chatInputVoiceHandler}
                                       onFileSelect={this.chatInputFileSelectHandler}
                                       onContactSelect={this.chatInputContactSelectHandler}
                                       onMapSelect={this.chatInputMapSelectHandler}
                                       onVoiceStateChange={this.chatInputVoiceStateChangeHandler}
                                       getDialog={this.chatInputGetDialogHandler}
                                       onClearDraft={this.updateDraftMessageClearedHandler}
                                       onFocus={this.chatInputFocusHandler}
                                       onBotButtonAction={this.messageBotButtonActionHandler}
                                       onMessageDrop={this.chatInputMessageDropHandler}
                                       onGifSelect={this.chatInputGifSelectHandler}
                            />
                        </div>}
                        {this.selectedDialogId === 'null' && <div className="column-center">
                            <div className="start-messaging no-result">
                                <div className="start-messaging-header">
                                    {this.getConnectionStatus()}
                                </div>
                                <div className="start-messaging-img">
                                    <Landscape/>
                                </div>
                                <div className="start-messaging-title">{i18n.t('chat.chat_placeholder')}</div>
                                <div className="start-messaging-footer"/>
                            </div>
                        </div>}
                        <RightMenu key="right-menu" ref={this.rightMenuRefHandler}
                                   onChange={this.rightMenuChangeHandler}
                                   onMessageAttachmentAction={this.messageAttachmentActionHandler}
                                   onDeleteAndExitGroup={this.groupInfoDeleteAndExitHandler}
                                   onToggleMenu={this.rightMenuToggleMenuHandler}
                        />
                    </div>
                    <NewMessage key="new-message" open={this.state.openNewMessage} onClose={this.onNewMessageClose}
                                onMessage={this.onNewMessageHandler}/>
                </div>
                <OverlayDialog
                    key="overlay-dialog"
                    open={confirmDialogOpen}
                    onClose={this.confirmDialogCloseHandler}
                    className="confirm-dialog"
                    classes={{
                        paper: 'confirm-dialog-paper'
                    }}
                >
                    {Boolean(confirmDialogMode === 'bot_alert') && <>
                        <DialogTitle>{i18n.t('bot.alert')}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>{this.state.botAlertMessage}</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.confirmDialogCloseHandler} color="primary">
                                {i18n.t('general.ok')}
                            </Button>
                        </DialogActions>
                    </>}
                    {Boolean(confirmDialogMode === 'logout') && <>
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
                    </>}
                    {Boolean(confirmDialogMode === 'remove_message' || confirmDialogMode === 'remove_message_revoke' || confirmDialogMode === 'remove_message_pending') &&
                    <>
                        <DialogTitle>{i18n.t('chat.remove_message_dialog.title')}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {i18n.tf('chat.remove_message_dialog.content', String(Object.keys(this.messageSelectedIds).length))}<br/>
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                                {i18n.t('general.disagree')}
                            </Button>
                            <Button onClick={this.removeMessageHandler(0)} color="primary"
                                    autoFocus={true}>
                                {i18n.t('chat.remove_message_dialog.remove')}
                            </Button>
                            {Boolean(confirmDialogMode === 'remove_message_revoke' && this.selectedDialogId !== this.userId) &&
                            <Button onClick={this.removeMessageHandler(1)} color="primary">
                                {(this.peer && this.peer.getType() === PeerType.PEERUSER) ?
                                    <>{i18n.t('chat.remove_message_dialog.remove_for')}&nbsp;
                                        <UserName noDetail={true}
                                                  id={this.selectedDialogId}
                                                  noIcon={true}
                                        /></> : i18n.t('chat.remove_message_dialog.remove_for_all')}
                            </Button>}
                            {Boolean(confirmDialogMode === 'remove_message_pending') &&
                            <Button onClick={this.removeMessageHandler(2)} color="primary">
                                {i18n.t('chat.remove_message_dialog.remove_all_pending')}
                            </Button>}
                        </DialogActions>
                    </>}
                    {Boolean(confirmDialogMode === 'delete_exit_group') && <>
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
                    </>}
                    {Boolean(confirmDialogMode === 'delete_user') && <>
                        <DialogTitle>{i18n.t('chat.delete_dialog.title')}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {i18n.t('chat.delete_dialog.p1')}
                                <UserName className="group-name"
                                          id={this.state.leftMenuSelectedDialogId}
                                          you={this.state.leftMenuSelectedDialogId === this.userId}
                                          youPlaceholder={i18n.t('general.saved_messages')}
                                          noIcon={true}
                                          noDetail={true}
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
                    </>}
                    {Boolean(confirmDialogMode === 'cancel_recording') && <>
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
                    </>}
                    {Boolean(confirmDialogMode === 'bot_send_phone') && <>
                        <DialogTitle>{i18n.t('bot.alert')}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                <UserName id={this.selectedDialogId || ''} noIcon={true}
                                          noDetail={true}/> {i18n.t('bot.bot_wants_your_phone')}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                                {i18n.t('general.cancel')}
                            </Button>
                            <Button onClick={this.botSendPhoneHandler} color="primary" autoFocus={true}>
                                {i18n.t('general.send')}
                            </Button>
                        </DialogActions>
                    </>}
                    {Boolean(confirmDialogMode === 'bot_send_location') && <>
                        <DialogTitle>{i18n.t('bot.alert')}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                <UserName id={this.selectedDialogId || ''} noIcon={true}
                                          noDetail={true}/> {i18n.t('bot.bot_wants_your_location')}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                                {i18n.t('general.cancel')}
                            </Button>
                            <Button onClick={this.botSendLocationHandler} color="primary" autoFocus={true}>
                                {i18n.t('general.send')}
                            </Button>
                        </DialogActions>
                    </>}
                </OverlayDialog>
                <SelectPeerDialog key="forward-dialog" ref={this.forwardDialogRefHandler} enableTopPeer={true}
                                  onDone={this.forwardDialogDoneHandler} topPeerType={TopPeerType.Forward}
                                  onClose={this.forwardDialogCloseHandler} title={i18n.t('general.recipient')}/>
                <UserDialog key="user-dialog" ref={this.userDialogRefHandler} onAction={this.userDialogActionHandler}/>
                <DocumentViewer key="document-viewer" onAction={this.messageAttachmentActionHandler}
                                onJumpOnMessage={this.documentViewerJumpOnMessageHandler}
                                onError={this.textErrorHandler}/>
                <AboutDialog key="about-dialog" ref={this.aboutDialogRefHandler}/>
                <LabelDialog key="label-dialog" ref={this.labelDialogRefHandler} onDone={this.labelDialogDoneHandler}
                             onClose={this.forwardDialogCloseHandler}/>
                <Uploader ref={this.uploaderRefHandler} onDone={this.uploaderDoneHandler}/>
            </div>
        );
    }

    private containerRefHandler = (ref: any) => {
        this.containerRef = ref;
        if (this.shrunk) {
            this.leftMenuShrunkHandler(true);
        }
    }

    private chatInputRefHandler = (ref: any) => {
        this.chatInputRef = ref;
    }

    /* Set chat view
    *  For responsive view */
    private setChatView(enable: boolean) {
        if (!this.containerRef) {
            return;
        }
        if (enable && !this.containerRef.classList.contains('chat-view')) {
            this.containerRef.classList.add('chat-view');
        } else if (!enable && this.containerRef.classList.contains('chat-view')) {
            this.containerRef.classList.remove('chat-view');
        }
    }

    private getConnectionStatus() {
        const showIsConnecting = this.smoother.getState(this.isConnecting);
        if (this.isConnecting && showIsConnecting) {
            return (<span>{i18n.t('status.connecting')}</span>);
        } else if (this.isUpdating) {
            return (<span>{i18n.t('status.updating')}</span>);
        } else {
            return null;
        }
    }

    // private attachmentToggleHandler = () => {
    //     this.setState({
    //         toggleAttachment: !this.state.toggleAttachment,
    //     });
    // }

    private toggleRightMenu = () => {
        if (this.rightMenuRef) {
            this.rightMenuRef.toggleMenu();
        }
    }

    private rightMenuChangeHandler = (shrink: boolean) => {
        if (!shrink) {
            this.setState({
                rightMenuShrink: false,
            });
        }
        // setTimeout(() => {
        if (!this.messageRef) {
            return;
        }
        this.messageRef.clearAll();
        // this.messageRef.animateToEnd();
        if (shrink) {
            this.setState({
                rightMenuShrink: true,
            });
        }
        // }, 300);
    }

    private messageMoreActionHandler = (cmd: string) => (e: any) => {
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

    private leftMenuRefHandler = (ref: any) => {
        this.leftMenuRef = ref;
        if (this.leftMenuRef && this.isMobileView) {
            this.leftMenuRef.setStatus({
                isConnecting: this.isConnecting,
                isOnline: this.isOnline,
                isUpdating: this.isUpdating,
            });
        }
    }

    private dialogRefHandler = (ref: any) => {
        this.dialogRef = ref;
        if (this.dialogRef) {
            this.dialogRef.setSelectedId(this.selectedDialogId);
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
        if (this.searchMessageRef && this.peer) {
            this.searchMessageRef.setPeer(this.peer);
        }
    }

    private infoBarRefHandler = (ref: any) => {
        this.infoBarRef = ref;
        if (this.infoBarRef) {
            this.infoBarRef.setStatus({
                isConnecting: this.isConnecting,
                isOnline: this.isOnline,
                isUpdating: this.isUpdating,
                peer: this.peer,
                selectedDialogId: this.selectedDialogId
            });
        }
    }

    private messageRefHandler = (ref: any) => {
        this.messageRef = ref;
        if (this.messageRef) {
            this.messageRef.setPeer(this.peer);
        }
    }

    /* Init dialogs */
    private initDialogs = () => {
        this.dialogRepo.getManyCache({}).then((res) => {
            const selectedId = this.props.match.params.id;
            const selectedMessageId = this.props.match.params.mid;
            this.dialogsSort(res, () => {
                if (selectedId !== 'null') {
                    this.setLeftMenu('chat');
                    const peer = this.getPeerByDialogId(selectedId);
                    this.isBot = peer.user ? (peer.user.isbot || false) : false;
                    this.setChatParams(selectedId, peer.peer);
                    requestAnimationFrame(() => {
                        this.getMessagesByDialogId(selectedId, true, selectedMessageId);
                    });
                }
            });
            this.setLoading(false);
        }).catch(() => {
            this.setLoading(false);
        });
    }

    /* Update new message handler */
    private updateNewMessageHandler = (data: UpdateNewMessage.AsObject) => {
        const message: IMessage = data.message;
        let force = false;
        if (data.message.peerid === this.selectedDialogId && this.messageRef) {
            // Check if Top Message exits
            const dialog = this.getDialogById(this.selectedDialogId);
            if (dialog) {
                if (this.messages.length === 0 || (this.messages.length > 0 && (this.messages[this.messages.length - 1].id === dialog.topmessageid || (this.messages[this.messages.length - 1].id || 0) < 0))) {
                    const dataMsg = this.modifyMessages(this.messages, [data.message], true);
                    this.checkMessageOrder(data.message);
                    if (this.endOfMessage && this.isInChat) {
                        this.setScrollMode('end');
                    } else {
                        this.setScrollMode('none');
                    }
                    this.messageRef.setMessages(dataMsg.msgs, () => {
                        // Scroll down if possible
                        if (this.endOfMessage && this.isInChat) {
                            if (dataMsg.maxReadId !== -1) {
                                if (this.scrollInfo && this.scrollInfo.end && this.messages[this.scrollInfo.end]) {
                                    this.sendReadHistory(this.peer, Math.floor(this.messages[this.scrollInfo.end].id || 0), this.scrollInfo.end);
                                } else {
                                    this.sendReadHistory(this.peer, dataMsg.maxReadId);
                                }
                            }
                        }
                        if (this.messageRef) {
                            this.messageRef.updateList();
                        }
                    });
                } else {
                    force = true;
                }
            }
        }

        // Update dialogs
        if (data.accesshash) {
            this.updateDialogs(message, data.accesshash);
        }

        // Notify user if possible
        this.notifyMessage(data);
        /* Check message flags
         * In this section we check clear history and pending messages
         * Also counters will be increased here
         */
        if (!message || !message.id) {
            return;
        }
        this.downloadThumbnail(message);
        // Clear the message history
        if (message.messageaction === C_MESSAGE_ACTION.MessageActionClearHistory) {
            this.messageRepo.clearHistory(message.peerid || '', message.actiondata.maxid).then(() => {
                if (message.peerid === this.selectedDialogId && this.messages.length > 1 && this.messageRef) {
                    this.messageRef.clearAll();
                    this.messages.splice(0, this.messages.length - (message.actiondata.pb_delete ? 0 : 1));
                    this.messageRef.setMessages(this.messages);
                    this.messageRef.updateList();
                }
                this.updateDialogsCounter(message.peerid || '', {
                    mentionCounter: 0,
                    scrollPos: -1,
                    unreadCounter: 0,
                });
                if (message.actiondata.pb_delete) {
                    // Remove dialog
                    this.dialogRemove(message.peerid || '');
                }
            });
        } else
            // Increase counter when
            // 1. Current Dialog is different from message peerid
            // 2. Is not at the end of conversations
            // 3. Is not focused on the River app
        if (!message.me && (message.peerid !== this.selectedDialogId || force || !this.endOfMessage || !this.isInChat)) {
            this.messageRepo.exists(message.id || 0).then((exists) => {
                if (!exists) {
                    this.updateDialogsCounter(message.peerid || '', {
                        mentionCounterIncrease: (message.mention_me ? 1 : 0),
                        unreadCounterIncrease: 1,
                    });
                }
            });
        }
    }

    /* Update drop message */
    private updateMessageDropHandler = (data: UpdateNewMessage.AsObject) => {
        if (data.message) {
            this.updateDialogs(data.message, data.accesshash || '0');
        }
        // RandomId Error helper
        if (this.messages.length > 0 && this.messages[this.messages.length - 1] && (this.messages[this.messages.length - 1].id || 0) < 0) {
            const index = findLastIndex(this.messages, {random_id: data.senderrefid});
            if (index > -1) {
                this.messages[index].id = data.message.id;
            }
        }
        if (this.messageRef) {
            this.messageRef.updateList();
        }
    }

    /* Update message edit */
    private updateMessageEditHandler = (data: UpdateMessageEdited.AsObject) => {
        const dialog = this.getDialogById(data.message.peerid || '');
        if (dialog) {
            if (dialog.topmessageid === data.message.id) {
                this.updateDialogs(data.message, dialog.accesshash || '0', true);
            }
        }
        if (this.selectedDialogId === data.message.peerid) {
            // Update and broadcast changes in cache
            this.cachedMessageService.updateMessage(data.message);

            const messages = this.messages;
            const index = findIndex(messages, (o) => {
                return o.id === data.message.id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
            });
            if (index > -1) {
                const avatar = messages[index].avatar;
                messages[index] = data.message;
                messages[index].avatar = avatar;
                if (this.messageRef) {
                    this.messageRef.clear(index);
                    this.messageRef.updateList();
                }
            }
        }
    }

    /* Update user typing */
    private updateUserTypeHandler = (data: UpdateUserTyping.AsObject) => {
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
            }, C_TYPING_INTERVAL + C_TYPING_INTERVAL_OFFSET);
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
        const peerId = data.peer.id || '';
        const dialog = this.getDialogById(peerId);
        if (!dialog) {
            return;
        }
        const readinboxmaxid = dialog.readinboxmaxid || 0;
        const td = this.updateDialogsCounter(peerId, {maxInbox: data.maxid});
        const fn = () => {
            delete this.updateReadInboxTimeout[peerId];
            this.messageRepo.getUnreadCount(peerId, td ? (td.readinboxmaxid || 0) : (data.maxid || 0), dialog ? (dialog.topmessageid || 0) : 0).then((count) => {
                this.updateDialogsCounter(peerId, {
                    maxInbox: td ? (td.readinboxmaxid || 0) : (data.maxid || 0),
                    mentionCounter: count.mention,
                    unreadCounter: count.message,
                });
            });
        };
        if (this.selectedDialogId === (data.peer.id || '')) {
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
        this.updateDialogsCounter(data.peer.id || '', {maxOutbox: data.maxid});
        if (this.messageRef && data.peer.id === this.selectedDialogId) {
            this.messageRef.setReadId(data.maxid || 0);
            this.messageRef.updateList();
        }
    }

    /* Update message delete handler */
    private updateMessageDeleteHandler = (data: UpdateMessagesDeleted.AsObject) => {
        const peer = data.peer;
        if (!peer || peer.id !== this.selectedDialogId) {
            return;
        }

        data.messageidsList.sort((a, b) => a - b).forEach((id) => {
            if (this.messageRef) {
                // Update and broadcast changes in cache
                this.cachedMessageService.removeMessage(id);

                const messages = this.messages;
                let updateView = false;
                const index = findLastIndex(messages, (o) => {
                    return o.id === id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                });
                if (this.messageRef && index > -1) {
                    updateView = true;
                    // Delete visible message if possible
                    this.messageRef.clear(index);
                    messages.splice(index, 1);
                    // Clear date indicator if possible
                    const indexAlpha = index - 1;
                    if (indexAlpha > -1 && messages.length > index) {
                        // If date indicator were in current range boundaries
                        if (messages[indexAlpha].messagetype === C_MESSAGE_TYPE.Date && messages[index].messagetype === C_MESSAGE_TYPE.Date) {
                            this.messageRef.clear(indexAlpha);
                            messages.splice(indexAlpha, 1);
                        }
                    } else if (indexAlpha > -1 && messages.length === index) {
                        // If it was last message
                        if (messages[indexAlpha].messagetype === C_MESSAGE_TYPE.Date) {
                            this.messageRef.clear(indexAlpha);
                            messages.splice(indexAlpha, 1);
                        }
                    }
                }
                // Update current message list if visible
                if (this.messageRef && updateView) {
                    this.messageRef.forceUpdate(() => {
                        if (this.messageRef) {
                            this.messageRef.updateList();
                        }
                    });
                }
            }
        });
    }

    /* Update username handler */
    private updateUsernameHandler = (data: UpdateUsername.AsObject) => {
        //
    }

    /* Update notify settings handler */
    private updateNotifySettingsHandler = (data: UpdateNotifySettings.AsObject) => {
        this.updateDialogsNotifySettings(data.notifypeer.id || '', data.settings);
    }

    /* Update content read handler */
    private updateContentReadHandler = (data: UpdateReadMessagesContents.AsObject) => {
        let updateView = false;
        const messages = this.messages;
        data.messageidsList.forEach((id) => {
            if (this.selectedDialogId === data.peer.id) {
                const index = findIndex(messages, (o) => {
                    return o.id === id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                });
                if (index > -1) {
                    messages[index].contentread = true;
                    updateView = true;
                }
            }
        });
        if (updateView && this.messageRef) {
            this.messageRef.updateList();
        }
    }

    // /* Update user handler */
    // private updateUserHandler = (data: User[]) => {
    //     // @ts-ignore
    //     data.forEach((u: IUser) => {
    //         if (u.photo === undefined) {
    //             u.remove_photo = true;
    //             this.avatarService.remove(u.id || '');
    //         }
    //     });
    // }

    /* Update user photo handler */
    private updateUserPhotoHandler = (data: UpdateUserPhoto.AsObject) => {
        if (!data.photo) {
            this.userRepo.get(data.userid || '').then((res) => {
                if (res && res.photo) {
                    this.avatarService.remove(data.userid || '', res.photo.photosmall.fileid);
                    this.avatarService.remove(data.userid || '', res.photo.photobig.fileid);
                    this.fileRepo.remove(res.photo.photosmall.fileid || '');
                    this.fileRepo.remove(res.photo.photobig.fileid || '');
                }
            });
        }
    }


    /* Update group photo handler */
    private updateGroupPhotoHandler = (data: UpdateGroupPhoto.AsObject) => {
        if (!data.photo) {
            this.groupRepo.get(data.groupid || '').then((res) => {
                if (res && res.photo) {
                    this.avatarService.remove(data.groupid || '', res.photo.photosmall.fileid);
                    this.avatarService.remove(data.groupid || '', res.photo.photobig.fileid);
                    this.fileRepo.remove(res.photo.photosmall.fileid || '');
                    this.fileRepo.remove(res.photo.photobig.fileid || '');
                }
            });
        }
    }

    /* Electron preferences click handler */
    private electronSettingsHandler = () => {
        this.bottomBarSelectHandler('settings')();
    }

    /* Electron about click handler */
    private electronAboutHandler = (version: string) => {
        if (this.aboutDialogRef) {
            this.aboutDialogRef.openDialog(version);
        }
    }

    /* Electron log out click handler */
    private electronLogoutHandler = () => {
        this.bottomBarSelectHandler('logout')();
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

        const peer = this.peer;
        if (!peer) {
            this.setLoading(false);
            return;
        }

        this.messages = [];
        this.messageMap = {};

        if (this.chatInputRef) {
            this.chatInputRef.setLastMessage(null);
        }

        const dialog = this.getDialogById(dialogId);

        let before = 10000000000;
        // Scroll pos check
        if (beforeMsg !== undefined) {
            before = beforeMsg;
        } else {
            if (dialog) {
                if ((dialog.unreadcount || 0) > 1) {
                    this.updateDialogsCounter(this.selectedDialogId, {scrollPos: -1});
                    const tBefore = Math.max((dialog.readinboxmaxid || 0), (dialog.readoutboxmaxid || 0));
                    if (tBefore > 0) {
                        before = tBefore;
                    }
                } else if ((dialog.scroll_pos || -1) !== -1) {
                    before = dialog.scroll_pos || 1000000000;
                }
            }
        }

        let minId: number = 0;
        this.setChatView(true);

        const readyList: any[] = [null, null];
        const deferFn = () => {
            readyList.pop();
            if (readyList.length === 0) {
                this.setEndOfMessage(false);
                setTimeout(() => {
                    this.setLoading(false);
                    this.messageLoadMoreAfterHandler(0, 0);
                }, 100);

                setTimeout(() => {
                    this.setScrollMode('none');
                    if (messageId && messageId !== '0') {
                        this.messageJumpToMessageHandler(parseInt(messageId, 10));
                    }
                }, 500);
            }
        };

        if (this.messageRef) {
            this.messageRef.clearAll();
        }
        this.messageRepo.list({peer, limit: 40, before, withPending: true}, (data) => {
            // Checks peerid on transition
            if (this.selectedDialogId !== dialogId || !this.messageRef) {
                this.setLoading(false);
                return;
            }
            this.setChatView(true);

            let maxReadId = 0;
            let maxReadInbox = 0;
            if (dialog) {
                maxReadId = dialog.readoutboxmaxid || 0;
                maxReadInbox = dialog.readinboxmaxid || 0;
            }

            this.setScrollMode('end');
            const dataMsg = this.modifyMessages(this.messages, data.reverse(), true, maxReadInbox);
            minId = dataMsg.minId;

            this.messageRef.setReadId(maxReadId);
            if (dialog) {
                this.messageRef.setTopMessage(dialog.topmessageid || 0);
            }
            this.messageRef.setMessages(dataMsg.msgs, () => {
                clearTimeout(this.mobileBackTimeout);
                deferFn();
            });
        }).then((resMsgs) => {
            // Checks peerid on transition
            if (this.selectedDialogId !== dialogId) {
                this.setLoading(false);
                return;
            }

            if (this.chatInputRef && !this.isMobileBrowser) {
                this.chatInputRef.focus();
            }

            const minIdIndex = findIndex(resMsgs, {id: minId});
            if (minIdIndex > -1) {
                resMsgs.splice(0, minIdIndex + 1);
            }

            this.setScrollMode('end');
            const dataMsg = this.modifyMessages(this.messages, resMsgs, false);
            if (this.messages.length === 0) {
                if (this.moveDownRef) {
                    this.moveDownRef.setVisible(false);
                }
                deferFn();
                return;
            }

            if (this.messageRef) {
                this.messageRef.setMessages(dataMsg.msgs, () => {
                    deferFn();
                });
            }
        }).catch(() => {
            this.setChatView(true);
            clearTimeout(this.mobileBackTimeout);
            this.setLoading(false);
        });
    }

    private messageLoadMoreAfterHandler = (start: number, end: number) => {
        if (this.isLoading) {
            return;
        }
        const peer = this.peer;
        if (!peer) {
            return;
        }
        const peerId = peer.getId() || '';
        if (this.selectedDialogId !== peerId) {
            this.setLoading(false);
            return;
        }
        const dialog = this.getDialogById(peerId);
        if (!dialog) {
            return;
        }
        const after = this.getMaxId();
        if (((dialog.topmessageid || 0) <= after && (dialog.unreadcount || 0) === 0) || after <= 0) {
            return;
        }

        window.console.log('messageLoadMoreAfterHandler');
        this.setLoading(true);
        this.messageRepo.list({
            after,
            limit: 25,
            peer
        }).then((res) => {
            if (this.selectedDialogId !== peerId || !this.messageRef) {
                this.setLoading(false);
                return;
            }
            this.setScrollMode('none');
            if (this.moveDownRef) {
                this.moveDownRef.setVisible(res.length > 0);
            }
            this.setEndOfMessage(res.length > 0);
            setTimeout(() => {
                if (this.messageRef) {
                    const dataMsg = this.modifyMessages(this.messages, res, true, dialog.readinboxmaxid || 0);
                    this.messageRef.setMessages(dataMsg.msgs);
                }
                this.setLoading(false);
            }, 1);
        }).catch(() => {
            this.setLoading(false);
        });
    }

    private messageLoadMoreBeforeHandler = (before?: number) => {
        if (this.isLoading) {
            return;
        }

        const peer = this.peer;
        if (!peer) {
            return;
        }

        if ((!this.messages[0] || this.messages[0].id === 1) && !before) {
            return;
        }

        if (!before) {
            before = this.messages[0].id;
        }

        window.console.log('messageLoadMoreBeforeHandler');

        const dialogId = peer.getId() || '';

        this.setLoading(true);

        this.messageRepo.list({
            before,
            limit: 30,
            peer,
        }).then((data) => {
            // Checks peerid on transition
            if (this.selectedDialogId !== dialogId || data.length === 0 || !this.messageRef) {
                this.setLoading(false);
                return;
            }
            this.setScrollMode('stay');
            setTimeout(() => {
                if (!this.messageRef) {
                    return;
                }
                const messages = this.messages;
                const dataMsg = this.modifyMessages(messages, data, false);
                this.messageRef.setMessages(dataMsg.msgs, () => {
                    if (!this.messageRef) {
                        return;
                    }
                    this.messageRef.recomputeItemHeight(dataMsg.addition);
                    setTimeout(() => {
                        this.setLoading(false);
                    }, 100);
                }, true);
            }, 10);
        }).catch(() => {
            this.setLoading(false);
        });
    }

    private modifyMessages(defaultMessages: IMessage[], messages: IMessage[], push: boolean, messageReadId?: number): { maxId: number, maxReadId: number, minId: number, addition: number, msgs: IMessage[] } {
        let maxId = 0;
        let minId = Infinity;
        let maxReadId = -1;
        let addition = 0;
        if (!push) {
            messages = messages.reverse();
        }
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

            // date breakpoint
            if (msg.messagetype !== C_MESSAGE_TYPE.End && ((key === 0 && (defaultMessages.length === 0 || (defaultMessages.length > 0 && !TimeUtility.isInSameDay(msg.createdon, defaultMessages[defaultMessages.length - 1].createdon))))
                || (key > 0 && !TimeUtility.isInSameDay(msg.createdon, messages[key - 1].createdon)))) {
                const t: IMessage = {
                    createdon: msg.createdon,
                    id: msg.id,
                    messagetype: C_MESSAGE_TYPE.Date,
                    senderid: msg.senderid,
                };
                if (!this.messageMapExist(t)) {
                    if (push) {
                        defaultMessages.push(t);
                    } else {
                        defaultMessages.splice(addition, 0, t);
                    }
                    addition++;
                    msg.avatar = true;
                }
            }

            if (push && messageReadId !== undefined && !this.newMessageFlag && (msg.id || 0) > messageReadId && !msg.me) {
                const t = {
                    createdon: msg.createdon,
                    id: (msg.id || 0) + 0.5,
                    messagetype: C_MESSAGE_TYPE.NewMessage,
                };
                if (!this.messageMapExist(t)) {
                    defaultMessages.push(t);
                    addition++;
                    this.newMessageFlag = true;
                    msg.avatar = true;
                }
            }

            let unshiftCheck = false;
            if (push) {
                if (!this.messageMapExist(msg)) {
                    defaultMessages.push(msg);
                    let len = defaultMessages.length;
                    if (len > 0 && !msg.avatar) {
                        len--;
                        defaultMessages[len].avatar = this.isAvatar(len);
                    }
                }
            } else {
                if (!this.messageMapExist(msg)) {
                    defaultMessages.splice(addition, 0, msg);
                    if (addition > 0 && !msg.avatar) {
                        defaultMessages[addition].avatar = this.isAvatar(addition);
                    }
                    unshiftCheck = true;
                }
            }

            addition++;
            if (unshiftCheck && messages.length === key + 1) {
                if (defaultMessages[addition - 1] && defaultMessages[addition] && defaultMessages[addition].messagetype === C_MESSAGE_TYPE.Date && TimeUtility.isInSameDay(defaultMessages[addition - 1].createdon, defaultMessages[addition].createdon)) {
                    defaultMessages.splice(addition, 1);
                    addition--;
                }
                if (defaultMessages[addition + 1]) {
                    defaultMessages[addition + 1].avatar = this.isAvatar(addition + 1);
                } else if (defaultMessages[addition]) {
                    defaultMessages[addition].avatar = this.isAvatar(addition + 1);
                }
            }
        });

        return {
            addition,
            maxId,
            maxReadId,
            minId,
            msgs: defaultMessages,
        };
    }

    private chatInputTextSendHandler = (text: string, param: IMessageParam) => {
        if (trimStart(text).length === 0) {
            return;
        }

        const peer = param.peer ? param.peer : cloneDeep(this.peer);
        if (!peer) {
            if (this.messageRef) {
                this.messageRef.setLoading(false);
            }
            return;
        }

        if (param.mode === C_MSG_MODE.Edit && param.message) {
            const randomId = UniqueId.getRandomId();
            const messages = this.messages;
            const message: IMessage = param.message;
            message.body = text;
            message.editedon = this.riverTime.now();
            message.rtl = this.rtlDetector.direction(text || '');
            message.messagetype = C_MESSAGE_TYPE.Normal;

            let entities;
            if (param && param.entities) {
                message.entitiesList = param.entities.map((entity: MessageEntity) => {
                    return entity.toObject();
                });
                entities = param.entities;
            }

            this.apiManager.editMessage(randomId, message.id || 0, text, peer, entities).then(() => {
                if (this.messageRef) {
                    this.messageRef.setScrollMode('stay');
                }
                const index = findIndex(messages, (o) => {
                    return o.id === message.id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                });
                if (index > -1) {
                    messages[index] = message;
                    if (this.messageRef) {
                        this.messageRef.updateList();
                    }
                    if (this.chatInputRef && index + 1 === this.messages.length) {
                        this.chatInputRef.setLastMessage(message);
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
                peerid: this.selectedDialogId,
                peertype: peer.getType(),
                random_id: randomId,
                rtl: this.rtlDetector.direction(text || ''),
                senderid: this.userId,
            };

            const emLe = emojiLevel(text);
            if (emLe) {
                message.em_le = emLe;
            }

            let replyTo;
            if (param.mode === C_MSG_MODE.Reply && param.message) {
                message.replyto = param.message.id;
                replyTo = param.message.id;
                this.cachedMessageService.setMessage(param.message);
            }

            let entities;
            if (param.entities) {
                message.entitiesList = param.entities.map((entity: MessageEntity) => {
                    return entity.toObject();
                });
                entities = param.entities;
            }

            let index = -1;

            this.messageRepo.addPending({
                id: randomId,
                message_id: id,
            });

            // For double checking update message id
            this.updateManager.setRandomId(randomId);
            this.apiManager.sendMessage(randomId, text, peer, replyTo, entities, (reqId: number) => {
                message.req_id = reqId;
                index = this.pushMessage(message);
            }).then((res) => {
                message.id = res.messageid;
                this.messageMapAppend(message);
                this.messageRepo.lazyUpsert([message]);
                this.updateDialogs(message, '0');
                this.checkMessageOrder(message);
                if (this.messageRef && index > -1) {
                    this.messageRef.forceUpdate();
                }
                this.newMessageLoadThrottle();
            }).catch((err) => {
                if (!this.resolveRandomMessageIdError(err, randomId, id)) {
                    const messages = this.messages;
                    if (index > -1 && messages[index]) {
                        messages[index].error = true;
                        this.messageRepo.importBulk([messages[index]], false);
                        if (this.messageRef) {
                            this.messageRef.forceUpdate();
                        }
                    }
                }
            });
        }
    }

    private pushMessage = (message: IMessage): number => {
        if (!this.messageRef) {
            return -1;
        }
        const dialog = this.getDialogById(this.selectedDialogId);
        let gapNumber = 0;
        if (dialog && this.messages.length > 0) {
            const lastValid = this.getValidAfter();
            if (lastValid !== dialog.topmessageid && findLastIndex(this.messages, {id: dialog.topmessageid || 0}) === -1) {
                this.messageRef.clearAll();
                this.messages = [];
                this.messageMap = {};
                gapNumber = dialog.topmessageid || 0;
                this.messageRef.setLoading(true, true);
            }
        }
        if (this.messages.length > 0 &&
            !TimeUtility.isInSameDay(message.createdon, this.messages[this.messages.length - 1].createdon)) {
            const t = {
                createdon: message.createdon,
                id: message.id,
                messagetype: C_MESSAGE_TYPE.Date,
                senderid: message.senderid,
            };
            if (!this.messageMapExist(t)) {
                this.messages.push(t);
            }
        }
        if (this.messages.length > 0 && message.senderid !== this.messages[this.messages.length - 1].senderid) {
            message.avatar = true;
        } else if (this.messages.length === 0) {
            message.avatar = true;
        }
        if (!this.messageMapExist(message)) {
            this.messages.push(message);
        }
        if (gapNumber) {
            this.messageLoadMoreBeforeHandler(gapNumber);
        }
        this.setScrollMode('none');
        this.messageRef.setMessages(this.messages);
        this.messageRepo.lazyUpsert([message]);
        this.newMessageLoadThrottle();
        return this.messages.length - 1;
    }

    private resolveRandomMessageIdError(err: RiverError.AsObject, randomId: number, id: number) {
        if (err && err.code === C_ERR.ErrCodeAlreadyExists && err.items === C_ERR_ITEM.ErrItemRandomID) {
            this.messageRepo.removePending(randomId);
            if (id < 0) {
                this.messageRepo.remove(id);
            }
            const index = findLastIndex(this.messages, (o) => {
                return o.id === id;
            });
            if (index > -1) {
                this.messages[index].mark_as_sent = true;
                if (this.messageRef) {
                    this.messageRef.updateList();
                }
            }
            return true;
        }
        return false;
    }

    private isAvatar(index: number) {
        if (index === 0) {
            return true;
        }
        const beforeIndex = index - 1;
        if (!this.messages[beforeIndex]) {
            return true;
        }
        if (!this.messages[index]) {
            return true;
        }
        if (this.messages[beforeIndex].senderid !== this.messages[index].senderid) {
            return true;
        }
        if (this.messages[beforeIndex].messagetype === C_MESSAGE_TYPE.Date || this.messages[beforeIndex].messagetype === C_MESSAGE_TYPE.System || (this.messages[beforeIndex].messageaction && this.messages[beforeIndex].messageaction !== C_MESSAGE_ACTION.MessageActionNope)) {
            return true;
        }
        return false;
    }

    private checkMessageOrder(msg: IMessage) {
        if (!this.messageRef || (msg.id || 0) < 0) {
            return;
        }
        const swap = (i1: number, i2: number) => {
            if (!this.messageRef) {
                return;
            }
            const hold = this.messages[i1];
            this.messages[i1] = this.messages[i2];
            this.messages[i2] = hold;
            if (this.messages[i1]) {
                this.messages[i1].avatar = this.isAvatar(i1);
            }
            if (this.messages[i2]) {
                this.messages[i2].avatar = this.isAvatar(i2);
            }
            if (this.messageRef) {
                this.messageRef.clear(i1);
                this.messageRef.clear(i2);
            }
        };
        const index = findLastIndex(this.messages, {id: msg.id});
        if (index <= -1) {
            return false;
        }

        const findNewMessagePosition = (message: IMessage) => {
            let position = this.messages.length - 1;
            if (this.messages.length === 0) {
                return position;
            }

            while (position > 0) {
                if ((message.id || 0) < (this.messages[position].id || 0) || (this.messages[position].id || 0) < 0) {
                    position--;
                    continue;
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
            this.updateManager.setRandomId(randomId);
            this.apiManager.sendMessage(randomId, text, peer);
        });
    }

    private chatInputTypingHandler = (typing: TypingAction, forcePeer?: InputPeer) => {
        const peer = forcePeer || this.peer;
        if (peer === null) {
            return;
        }

        this.apiManager.typing(peer, typing).catch((err) => {
            window.console.debug(err);
        });
    }

    private getPeerByDialogId(id: string): { peer: InputPeer | null, user?: IUser } {
        let user: IUser | undefined;
        const contactPeer = new InputPeer();
        const dialog = this.getDialogById(id);
        if (!dialog) {
            // Saved messages
            if (this.userId === id) {
                contactPeer.setType(PeerType.PEERUSER);
                contactPeer.setAccesshash('0');
                contactPeer.setId(id);
            } else {
                const contact = this.userRepo.getInstantContact(id);
                if (contact) {
                    contactPeer.setType(PeerType.PEERUSER);
                    contactPeer.setAccesshash(contact.accesshash || '0');
                    contactPeer.setId(contact.id || '');
                    user = contact;
                } else {
                    return {peer: null, user: undefined};
                }
            }
        } else {
            contactPeer.setType(dialog.peertype || 0);
            if (dialog.peertype === PeerType.PEERUSER) {
                const contact = this.userRepo.getInstantContact(id);
                if (contact) {
                    dialog.accesshash = contact.accesshash;
                    user = contact;
                }
            }
            contactPeer.setAccesshash(dialog.accesshash || '0');
            contactPeer.setId(dialog.peerid || '');
        }
        return {peer: contactPeer, user};
    }

    private getDialogById(id: string): IDialog | null {
        if (this.dialogMap.hasOwnProperty(id)) {
            const dialog = this.dialogs[this.dialogMap[id]];
            if (dialog && dialog.peerid === id) {
                return dialog;
            } else {
                // double check
                const index = findIndex(this.dialogs, {peerid: id});
                if (index > -1) {
                    return this.dialogs[index];
                } else {
                    return null;
                }
            }
        }
        return null;
    }

    private updateDialogs(msg: IMessage, accessHash: string, force?: boolean) {
        return new Promise((resolve) => {
            const id = msg.peerid || '';
            if (msg.peerid === '') {
                return;
            }
            const dialogs = this.dialogs;
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
                }
                if ((!dialogs[index].accesshash || dialogs[index].accesshash === '0') && accessHash !== '0') {
                    dialogs[index].accesshash = accessHash;
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
                    saved_messages: (this.userId === id),
                    sender_id: msg.senderid,
                    topmessageid: msg.id,
                    unreadcount: 0,
                };
                if (accessHash !== '0') {
                    dialog.accesshash = accessHash;
                }
                dialogs.push(dialog);
                this.dialogMap[id] = dialogs.length - 1;
            }
            setTimeout(() => {
                this.dialogsSortThrottle(dialogs);
            }, 256);
            resolve();
        });
        // if (toUpdateDialog) {
        //     this.dialogRepo.lazyUpsert([toUpdateDialog]);
        // }
    }

    private updateDialogsNotifySettings(peerId: string, settings: PeerNotifySettings.AsObject, force?: boolean) {
        if (!peerId || !this.dialogs) {
            return;
        }
        if (this.dialogMap.hasOwnProperty(peerId)) {
            let index = this.dialogMap[peerId];
            if (this.dialogs[index].peerid !== peerId) {
                index = findIndex(this.dialogs, {peerid: peerId});
            }
            if (index > -1) {
                this.dialogs[index].notifysettings = settings;
                this.dialogsSortThrottle(this.dialogs);
                if (force) {
                    this.dialogRepo.lazyUpsert([this.dialogs[index]]);
                }
            }
        }
    }

    private updateDialogsCounter(peerId: string, {maxInbox, maxOutbox, unreadCounter, unreadCounterIncrease, mentionCounter, mentionCounterIncrease, scrollPos, draft}: any) {
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
            let counterAction = false;
            if (unreadCounter !== undefined) {
                shouldUpdate = true;
                counterAction = true;
                if (maxInbox) {
                    if ((dialogs[index].readinboxmaxid || 0) <= maxInbox) {
                        dialogs[index].unreadcount = unreadCounter;
                    }
                } else {
                    dialogs[index].unreadcount = unreadCounter;
                }
            }
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
                counterAction = true;
                if (dialogs[index].unreadcount) {
                    // @ts-ignore
                    dialogs[index].unreadcount++;
                } else {
                    dialogs[index].unreadcount = 1;
                }
            }
            if (mentionCounterIncrease === 1) {
                shouldUpdate = true;
                counterAction = true;
                if (dialogs[index].mentionedcount) {
                    // @ts-ignore
                    dialogs[index].mentionedcount++;
                } else {
                    dialogs[index].mentionedcount = 1;
                }
            }
            if (mentionCounter !== undefined) {
                shouldUpdate = true;
                counterAction = true;
                dialogs[index].mentionedcount = mentionCounter;
            }
            if (scrollPos !== undefined) {
                dialogs[index].scroll_pos = scrollPos;
            }
            if (draft !== undefined) {
                dialogs[index].draft = draft;
                shouldUpdate = true;
            }
            if (shouldUpdate) {
                this.dialogsSort(dialogs, undefined, true);
                if (this.dialogRef) {
                    this.dialogRef.forceRender();
                }
            }
            if (this.selectedDialogId === peerId) {
                if (unreadCounter === 0 && this.endOfMessage && this.moveDownRef) {
                    this.moveDownRef.setVisible(false);
                } else if (unreadCounter && this.endOfMessage && this.moveDownRef) {
                    this.moveDownRef.setVisible(true);
                }
            }
            if (counterAction && peerId === this.selectedDialogId && this.moveDownRef) {
                this.moveDownRef.setDialog(dialogs[index]);
            }
            this.dialogRepo.lazyUpsert([dialogs[index]]);
            return dialogs[index];
        }
        return null;
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
                    if (!i1.topmessageid || !i2.topmessageid) {
                        return 0;
                    }
                    return (i2.topmessageid || 0) - (i1.topmessageid || 0);
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
            if (d && d.unreadcount && d.unreadcount > 0 && d.readinboxmaxid !== d.topmessageid && !d.preview_me) {
                if (this.settingsConfigManager.getNotificationSettings().count_muted) {
                    unreadCounter += d.unreadcount;
                } else if (!isMuted(d.notifysettings)) {
                    unreadCounter += d.unreadcount;
                }
            }
        });

        if (this.dialogRef) {
            this.dialogRef.setDialogs(this.dialogs, () => {
                if (callback) {
                    callback(this.dialogs);
                }
            });
        }

        if (this.leftMenuRef) {
            this.leftMenuRef.setUnreadCounter(unreadCounter);
        }

        this.iframeService.setUnreadCounter(unreadCounter);
        if (ElectronService.isElectron()) {
            this.electronService.setBadgeCounter(unreadCounter);
        }
    }

    private wasmInitHandler = () => {
        window.console.log('wasmInitHandler');
    }

    private wsOpenHandler = () => {
        this.setAppStatus({
            isConnecting: false,
        });
        this.apiManager.authRecall().then((res) => {
            if (res.timestamp) {
                this.riverTime.setServerTime(res.timestamp);
            }
            if (this.firstTimeLoad) {
                this.firstTimeLoad = false;
                this.userRepo.getAllContacts();
                this.apiManager.getSystemConfig();
                this.startSyncing(res.updateid || 0);
            } else {
                setTimeout(() => {
                    this.startSyncing(res.updateid || 0);
                }, 2000);
            }
        });
    }

    private startSyncing(updateId?: number) {
        const lastId = this.updateManager.getLastUpdateId();
        // Checks if it is the first time to sync
        if (lastId === 0) {
            this.snapshot();
            return;
        }
        this.getRemoteTopPeers();
        // Normal syncing
        this.updateManager.canSync(updateId).then(() => {
            this.updateManager.disableLiveUpdate();
            this.setAppStatus({
                isUpdating: true,
            });
        }).catch((err) => {
            if (err.err === 'too_late') {
                this.snapshot();
            }
        });
    }

    private snapshot() {
        window.console.log('snapshot!');
        // this.messageRepo.truncate();
        if (this.isUpdating) {
            return;
        }
        this.updateManager.disableLiveUpdate();
        this.setAppStatus({
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
                this.updateManager.setLastUpdateId(res.updateid || 0);
                this.updateManager.enableLiveUpdate();
                this.setAppStatus({
                    isUpdating: false,
                });
                this.updateManager.flushLastUpdateId();
                requestAnimationFrame(() => {
                    if (res.dialogs.length > 0) {
                        this.startSyncing();
                    }
                });
            }).catch(() => {
                this.updateManager.enableLiveUpdate();
                this.setAppStatus({
                    isUpdating: false,
                });
            });
        });
        this.labelRepo.getLabels();
        this.getRemoteTopPeers();
    }

    private getRemoteTopPeers() {
        if (this.topPeerInitialized || localStorage.getItem(C_LOCALSTORAGE.TopPeerInit)) {
            return;
        }
        localStorage.setItem(C_LOCALSTORAGE.TopPeerInit, 'true');
        this.topPeerInitialized = true;
        this.apiManager.getTopPeer(TopPeerCategory.FORWARDS, 0, C_TOP_PEER_LEN).then((res) => {
            this.userRepo.importBulk(false, res.usersList);
            this.userRepo.importBulk(false, res.groupsList);
            this.topPeerRepo.insertFromRemote(TopPeerType.Forward, res.peersList);
        });
        this.apiManager.getTopPeer(TopPeerCategory.USERS, 0, C_TOP_PEER_LEN).then((res) => {
            this.userRepo.importBulk(false, res.usersList);
            this.topPeerRepo.insertFromRemote(TopPeerType.Search, res.peersList);
        });
        this.apiManager.getTopPeer(TopPeerCategory.GROUPS, 0, C_TOP_PEER_LEN).then((res) => {
            this.userRepo.importBulk(false, res.groupsList);
            this.topPeerRepo.insertFromRemote(TopPeerType.Search, res.peersList);
        });
    }

    private wsCloseHandler = () => {
        this.setAppStatus({
            isConnecting: true,
        });
    }

    private fnStartedHandler = () => {
        this.messageRepo.loadConnInfo();
        this.connInfo = this.apiManager.getConnInfo();
        this.updateManager.setUserId(this.userId);
    }

    private networkStatusHandler = (event: any) => {
        const data = event.detail;
        this.setAppStatus({
            isOnline: data.online,
        });
    }

    private updateDialogDBUpdatedHandler = (data: IDialogDBUpdated) => {
        this.dialogRepo.getManyCache({}).then((res) => {
            this.dialogsSort(res, (dialogs) => {
                if (data.counters) {
                    data.ids.forEach((id: string) => {
                        if (this.dialogMap.hasOwnProperty(id) && dialogs[this.dialogMap[id]]) {
                            const maxReadInbox = dialogs[this.dialogMap[id]].readinboxmaxid || 0;
                            const dialog = cloneDeep(this.getDialogById(id));
                            if (dialog) {
                                this.messageRepo.getUnreadCount(id, maxReadInbox, dialog ? (dialog.topmessageid || 0) : 0).then((count) => {
                                    this.updateDialogsCounter(id, {
                                        mentionCounter: count.mention,
                                        unreadCounter: count.message,
                                    });
                                });
                            }
                        }
                    });
                }
                if (!this.isInChat) {
                    data.ids.forEach((id: string) => {
                        const msgIds = data.incomingIds[id];
                        if (msgIds && msgIds.length > 0) {
                            const dialog = this.getDialogById(id);
                            if (dialog && this.canNotify(id, dialog)) {
                                const ids = msgIds.filter(o => (dialog && o > (dialog.readoutboxmaxid || 0)));
                                if (ids.length > 0) {
                                    if (dialog.peertype === PeerType.PEERUSER) {
                                        this.notifyUser(id, ids);
                                    } else if (dialog.peertype === PeerType.PEERGROUP) {
                                        this.notifyGroup(id, ids);
                                    }
                                }
                            }
                        }
                    });
                }
            });
        });
    }

    private notifyUser(peerId: string, ids: number[]) {
        const user = this.userRepo.getInstant(peerId);
        if (user) {
            if (ids.length === 1) {
                this.messageRepo.get(ids[0]).then((message) => {
                    if (message) {
                        const messageTitle = getMessageTitle(message);
                        this.notify(
                            `New message from ${user.firstname} ${user.lastname}`,
                            messageTitle.text, message.peerid || 'null');
                    }
                });
            } else {
                this.notify(`${ids.length} new messages from ${user.firstname} ${user.lastname}`, '', peerId);
            }
        }
    }

    private notifyGroup(peerId: string, ids: number[]) {
        this.groupRepo.get(peerId).then((group) => {
            if (group) {
                if (ids.length === 1) {
                    this.messageRepo.get(ids[0]).then((message) => {
                        if (message) {
                            const user = this.userRepo.getInstant(message.senderid || '0');
                            if (user) {
                                const messageTitle = getMessageTitle(message);
                                if (message.mention_me) {
                                    this.notify(
                                        `${user.firstname} ${user.lastname} mentioned you in ${group.title}`,
                                        messageTitle.text, peerId);
                                } else {
                                    this.notify(
                                        `New message from ${user.firstname} ${user.lastname} in ${group.title}`,
                                        messageTitle.text, peerId);
                                }
                            }
                        }
                    });
                } else {
                    this.notify(`${ids.length} new messages in ${group.title}`, '', peerId);
                }
            }
        });
    }

    private getValidAfter(): number {
        const messages = this.messages;
        let after = 0;
        let tries = 1;
        if (messages.length > 0) {
            if (!messages[messages.length - tries]) {
                return -1;
            }
            // Check if it is not pending message
            after = messages[messages.length - tries].id || 0;
            if (after < 0) {
                if (messages.length > 0) {
                    // Check if it is not pending message
                    while (true) {
                        tries++;
                        if (!messages[messages.length - tries] || tries > 64) {
                            return -1;
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

    private getMaxId() {
        let maxId: number = -1;
        for (let i = this.messages.length - 1, cnt = 0; i >= 0 && cnt < 100; i--, cnt++) {
            if (this.messages[i] && this.messages[i].id && maxId < (this.messages[i].id || 0)) {
                maxId = this.messages[i].id || 0;
            }
        }
        if (maxId <= 0) {
            maxId = this.getValidAfter();
        }
        if (maxId === -1) {
            window.console.debug(`%c bad max id, last message id:${this.messages.length > 0 ? this.messages[this.messages.length - 1].id : ''}`, 'color: #cc0000;');
        }
        return maxId;
    }

    private updateMessageDBUpdatedHandler = (data: IMessageDBUpdated) => {
        const peer = this.peer;
        if (!peer) {
            return;
        }
        if (data.peerIds && data.peerIds.indexOf(this.selectedDialogId) > -1) {
            // this.getMessagesByDialogId(this.selectedDialogId);
            const after = data.minIds[this.selectedDialogId] || this.getMaxId();
            if (after <= 0) {
                return;
            }
            this.messageRepo.list({after, limit: 100, peer}).then((res) => {
                if (!this.messageRef) {
                    return;
                }
                if (this.endOfMessage && this.isInChat) {
                    this.setScrollMode('end');
                } else {
                    this.setScrollMode('none');
                }
                const modifiedMsgs = this.modifyMessages(this.messages, res, true);
                res.forEach((msg) => {
                    this.downloadThumbnail(msg);
                    this.checkMessageOrder(msg);
                });
                this.messageRef.setMessages(modifiedMsgs.msgs, () => {
                    if (this.messageRef) {
                        this.messageRef.updateList();
                    }
                });
            });
            if (data.editedIds.length > 0) {
                this.messageRepo.getIn(data.editedIds, false).then((res) => {
                    let shouldUpdate = false;
                    res.forEach((msg) => {
                        const index = findLastIndex(this.messages, (o) => {
                            return o.id === msg.id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                        });
                        if (index > -1) {
                            shouldUpdate = true;
                            this.messages[index] = msg;
                        }
                    });
                    if (shouldUpdate && this.messageRef) {
                        this.messageRef.updateList();
                    }
                });
            }
        }
    }

    private updateMessageIdDBUpdatedHandler = (data: IMessageIdDBUpdated) => {
        if (this.messageRef && data.peerIds && data.peerIds.hasOwnProperty(this.selectedDialogId)) {
            const ids = data.peerIds[this.selectedDialogId].sort((a, b) => b - a);
            this.messageRepo.getIn(ids, true).then((res) => {
                let hasUpdate = false;
                for (let i = this.messages.length - 1; i >= 0 && ids.length > 0 && res.length > 0; i--) {
                    if (this.messages[i].id === ids[0] && res[0].id === ids[0]) {
                        hasUpdate = true;
                        this.messages[i] = res[0];
                        res.shift();
                        ids.shift();
                    }
                }
                if (hasUpdate && this.messageRef) {
                    this.messageRef.updateList();
                }
            });
        }
    }

    private updateMessageDBRemovedHandler = (data: IMessageDBRemoved) => {
        if (data.peerIds.indexOf(this.selectedDialogId) === -1) {
            return;
        }
        data.listPeer[this.selectedDialogId].sort((a, b) => a - b).forEach((id) => {
            if (!this.messageRef) {
                return;
            }
            // Update and broadcast changes in cache
            this.cachedMessageService.removeMessage(id);

            const messages = this.messages;
            let updateView = false;
            const index = findLastIndex(messages, (o) => {
                return o.id === id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
            });
            if (index > -1) {
                updateView = true;
                // Delete visible message if possible
                this.messageRef.clear(index);
                messages.splice(index, 1);
                // Clear date indicator if possible
                const indexAlpha = index - 1;
                if (indexAlpha > -1 && messages.length > index) {
                    // If date indicator were in current range boundaries
                    if (messages[indexAlpha].messagetype === C_MESSAGE_TYPE.Date && messages[index].messagetype === C_MESSAGE_TYPE.Date) {
                        this.messageRef.clear(indexAlpha);
                        messages.splice(indexAlpha, 1);
                    }
                } else if (indexAlpha > -1 && messages.length === index) {
                    // If it was last message
                    if (messages[indexAlpha].messagetype === C_MESSAGE_TYPE.Date) {
                        this.messageRef.clear(indexAlpha);
                        messages.splice(indexAlpha, 1);
                    }
                }
            }
            // Update current message list if visible
            if (this.messageRef && updateView) {
                this.messageRef.forceUpdate(() => {
                    if (this.messageRef) {
                        this.messageRef.updateList();
                    }
                });
            }
        });
    }

    /* Notify on new message received */
    private notifyMessage(data: UpdateNewMessage.AsObject) {
        const message: IMessage = data.message;
        if (!(!this.isInChat && data.sender.id !== this.userId && this.canNotify(message.peerid || '')) && (message.mention_me !== true)) {
            return;
        }
        if (message.peertype === PeerType.PEERGROUP) {
            this.groupRepo.get(message.peerid || '').then((group) => {
                let groupTitle = 'Group';
                if (group) {
                    groupTitle = group.title || 'Group';
                }
                // if (data.messages.length === 1) {
                const messageTitle = getMessageTitle(message);
                if (message.mention_me === true) {
                    this.notify(
                        `${data.sender.firstname} ${data.sender.lastname} mentioned you in ${groupTitle}`,
                        messageTitle.text, message.peerid || 'null');
                } else if (!message.me) {
                    this.notify(
                        `New message from ${data.sender.firstname} ${data.sender.lastname} in ${groupTitle}`,
                        messageTitle.text, message.peerid || 'null');
                }
                // } else {
                //     this.notify(
                //         `${data.messages.length} new messages in ${groupTitle}`, '', data.messages[0].peerid || 'null');
                // }
            });
        } else {
            if (!message.me) {
                const messageTitle = getMessageTitle(message);
                this.notify(
                    `New message from ${data.sender.firstname} ${data.sender.lastname}`,
                    messageTitle.text, message.peerid || 'null');
                // } else {
                //     this.notify(
                //         `${data.messages.length} new messages from ${data.senders[0].firstname} ${data.senders[0].lastname}`, '', data.messages[0].peerid || 'null');
                // }
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

    private bottomBarSelectHandler = (item: string) => (e?: any): void => {
        switch (item) {
            case 'logout':
                this.setState({
                    confirmDialogMode: 'logout',
                    confirmDialogOpen: true,
                });
                break;
            case 'chat':
            case 'settings':
            case 'contacts':
                this.setLeftMenu(item, 'none', 'none');
                break;
        }
    }

    private leftMenuGroupCreateHandler = (contacts: IUser[], title: string, fileId: string) => {
        const users: InputUser[] = [];
        contacts.forEach((contact) => {
            const user = new InputUser();
            user.setAccesshash(contact.accesshash || '');
            user.setUserid(contact.id || '');
            users.push(user);
        });
        this.apiManager.groupCreate(users, title).then((res) => {
            this.groupRepo.importBulk([res]);
            const dialog: IDialog = {
                accesshash: '0',
                action_code: C_MESSAGE_ACTION.MessageActionGroupCreated,
                action_data: null,
                last_update: res.createdon,
                peerid: res.id,
                peertype: PeerType.PEERGROUP,
                preview: `${i18n.t('general.you')}: ${i18n.t('message.created_the_group')}`,
                sender_id: this.userId,
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
                this.apiManager.groupUploadPicture(res.id || '', inputFile);
            }
        });
    }

    private leftMenuShrunkHandler = (shrunk: boolean) => {
        this.shrunk = shrunk;
        if (this.containerRef) {
            if (shrunk) {
                this.containerRef.classList.add('shrunk');
            } else {
                this.containerRef.classList.remove('shrunk');
            }
        }
    }

    private leftMenuDropHandler = (peerId: string, files: File[], hasData: boolean) => {
        if (files.length === 0 && hasData) {
            if (this.props.enqueueSnackbar) {
                this.props.enqueueSnackbar(i18n.t('message.unsupported_file'));
            }
        } else {
            const peer = this.getPeerByDialogId(peerId);
            if (peer && peer.peer && this.uploaderRef) {
                const isFile = files.some((o) => getUploaderInput(o.type) === 'file');
                this.uploaderRef.openDialog(peer.peer, files, {
                    isFile,
                    peer: peer.peer,
                });
            }
        }
    }

    private textErrorHandler = (text: string) => {
        if (this.props.enqueueSnackbar) {
            this.props.enqueueSnackbar(text);
        }
    }

    private logOutHandler() {
        const wipe = () => {
            this.apiManager.stopNetWork();
            this.apiManager.resetConnInfo();
            this.mainRepo.destroyDB().then(() => {
                this.updateManager.setLastUpdateId(0);
                this.updateManager.flushLastUpdateId();
                window.location.href = '/';
                // window.location.reload();
            }).catch((err) => {
                window.console.log(err);
            });
        };
        this.updateManager.disableLiveUpdate();
        this.apiManager.logout(this.connInfo.AuthID).then((res) => {
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
        if (this.selectedDialogId !== 'null' && this.messages.length > 0) {
            if (this.scrollInfo && this.scrollInfo.end && this.messages[this.scrollInfo.end]) {
                this.sendReadHistory(this.peer, Math.floor(this.messages[this.scrollInfo.end].id || 0), this.scrollInfo.end);
            } else if (this.messages[this.messages.length - 1]) {
                this.sendReadHistory(this.peer, Math.floor(this.messages[this.messages.length - 1].id || 0));
            }
        }
        if (this.chatInputRef && !this.isMobileBrowser) {
            this.chatInputRef.focus();
        }
    }

    private windowBlurHandler = () => {
        this.isInChat = false;
    }

    private windowMouseWheelHandler = () => {
        if (!this.isInChat) {
            this.windowFocusHandler();
        }
    }

    private sendReadHistory(inputPeer: InputPeer | null, msgId: number, endIndex?: number, showMoveDown?: boolean) {
        if (!inputPeer || !this.isInChat) {
            return;
        }
        const peerId = inputPeer.getId() || '';
        const dialog = this.getDialogById(peerId);
        if (msgId <= 0 && this.selectedDialogId === peerId) {
            msgId = this.getValidAfter();
        }
        if (dialog && msgId > 0) {
            if (showMoveDown !== undefined && this.moveDownRef) {
                if (showMoveDown || (dialog.unreadcount || 0) > 0) {
                    this.moveDownRef.setVisible(true);
                } else if (dialog.unreadcount === 0) {
                    this.moveDownRef.setVisible(false);
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
                        if (this.endOfMessage && this.moveDownRef) {
                            this.moveDownRef.setVisible(false);
                        }
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
            else if (dialog && ((dialog.unreadcount || 0) > 0 || (dialog.mentionedcount || 0) > 0) && (dialog.topmessageid || 0) === msgId) {
                this.readMessageThrottle(inputPeer, msgId, dialog.topmessageid || 0);
                this.updateDialogsCounter(peerId, {
                    mentionCounter: 0,
                    unreadCounter: 0,
                });
                if (this.endOfMessage && this.moveDownRef) {
                    this.moveDownRef.setVisible(false);
                }
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
            this.apiManager.setMessagesReadHistory(this.dialogReadMap[key].peer, this.dialogReadMap[key].id);
            delete this.dialogReadMap[key];
        });
    }

    private messageContextMenuHandler = (cmd: string, message: IMessage) => {
        const peer = this.peer;
        if (!peer) {
            return;
        }
        switch (cmd) {
            case 'reply':
                this.setChatInputParams(C_MSG_MODE.Reply, message);
                break;
            case 'edit':
                this.setChatInputParams(C_MSG_MODE.Edit, message);
                break;
            case 'remove':
                const messageSelectedIds = {};
                messageSelectedIds[message.id || 0] = true;
                let removeMode: any = 'remove_message';
                if ((this.riverTime.now() - (message.createdon || 0)) < 86400 && message.me === true) {
                    removeMode = 'remove_message_revoke';
                }
                this.messageSelectedIds = cloneDeep(messageSelectedIds);
                this.propagateSelectedMessage();
                this.setState({
                    confirmDialogMode: removeMode,
                    confirmDialogOpen: true,
                });
                return;
            case 'forward':
                this.messageSelectable = true;
                this.propagateSelectedMessage();
                break;
            case 'forward_dialog':
                if (this.forwardDialogRef) {
                    this.forwardDialogRef.openDialog();
                }
                break;
            case 'resend':
                this.resendMessage(message);
                break;
            case 'cancel':
                this.cancelSend(message.id || 0);
                break;
            case 'download':
            case 'download_stream':
                this.downloadFile(message, cmd === 'download_stream');
                break;
            case 'save':
                this.saveFile(message);
                break;
            case 'copy':
            case 'copy_all':
                break;
            case 'labels':
                if (this.labelDialogRef) {
                    this.labelDialogRef.openDialog([message.id || 0], [message.labelidsList || []]);
                }
                break;
            case 'save_gif':
                this.saveGifHandler(message);
                break;
        }
    }

    /* PopUpDate show date handler */
    private messageShowDateHandler = (timestamp: number | null) => {
        if (this.popUpDateRef) {
            this.popUpDateRef.updateDate(timestamp);
        }
    }

    /* PopUpDate show date handler */
    private messageShowNewMessageHandler = (visible: boolean) => {
        if (this.popUpNewMessageRef) {
            this.popUpNewMessageRef.setVisible(visible);
        }
    }

    /* Message Rendered Handler
     * We use it for scroll event in message list */
    private messageRenderedHandler: scrollFunc = ({start, end, overscanStart, overscanEnd}) => {
        const messages = this.messages;
        const diff = (messages.length - end) - 1;
        this.scrollInfo = {start, end, overscanStart, overscanEnd};
        this.setEndOfMessage(diff <= 1);
        // if (this.isLoading) {
        //     return;
        // }
        if (messages && messages[end]) {
            if (diff <= 2) {
                this.lastMessageId = -1;
            } else {
                this.lastMessageId = messages[end].id || -1;
            }
            if (messages[end].id !== -1) {
                // Update unread counter in dialog
                this.sendReadHistory(this.peer, Math.floor(messages[end].id || 0), end, diff > 1);
            }
        }
    }

    /* Message on drop files handler */
    private messageDropHandler = (files: File[]) => {
        if (this.uploaderRef && this.peer) {
            let options: IUploaderOptions = {};
            if (this.chatInputRef) {
                options = this.chatInputRef.getUploaderOptions();
            }
            options.isFile = files.some((o) => getUploaderInput(o.type) === 'file');
            this.uploaderRef.openDialog(this.peer, files, options);
        }
    }

    /* Message on bot command handler */
    private messageBotCommandHandler = (cmd: string, params?: any) => {
        this.chatInputTextSendHandler(cmd, params);
    }

    /* Message on message drop handler */
    private messageMessageDropHandler = (id: number) => {
        if (this.chatInputRef) {
            this.chatInputRef.loadMessage(id);
        }
    }

    /* Message on bot button click handler */
    private messageBotButtonActionHandler = (cmd: number, data: any, msgId?: number) => {
        if (!this.peer) {
            return;
        }
        switch (cmd) {
            case C_BUTTON_ACTION.Button:
                const button: BotButton.AsObject = data;
                this.chatInputTextSendHandler(button.text || '', {});
                break;
            case C_BUTTON_ACTION.ButtonUrl:
                const buttonUrl: ButtonUrl.AsObject = data;
                this.openLink(buttonUrl.url || '');
                break;
            // case C_BUTTON_ACTION.ButtonSwitchInline:
            //     const buttonSwitchInline: ButtonSwitchInline.AsObject = data;
            //     break;
            case C_BUTTON_ACTION.ButtonRequestPhone:
                this.setState({
                    confirmDialogMode: 'bot_send_phone',
                    confirmDialogOpen: true,
                });
                break;
            case C_BUTTON_ACTION.ButtonRequestGeoLocation:
                this.setState({
                    confirmDialogMode: 'bot_send_location',
                    confirmDialogOpen: true,
                });
                break;
            // case C_BUTTON_ACTION.ButtonBuy:
            //     const buttonBuy: ButtonBuy.AsObject = data;
            //     break;
            case C_BUTTON_ACTION.ButtonCallback:
                const buttonCallback: ButtonCallback.AsObject = data;
                this.apiManager.botGetCallbackAnswer(this.peer, buttonCallback.data, msgId).then((res) => {
                    if ((res.message || '').length > 0) {
                        this.setState({
                            botAlertMessage: res.message || '',
                            confirmDialogMode: 'bot_alert',
                            confirmDialogOpen: true,
                        });
                    }
                    this.openLink(res.url || '');
                });
                break;
        }
    }

    private chatInputMessageDropHandler = (message: IMessage, caption: string, params: IMessageParam) => {
        if (message.mediatype === MediaType.MEDIATYPEDOCUMENT) {
            this.sendUploadedMediaMessage(caption, message, params);
        } else {
            switch (message.messagetype) {
                case C_MESSAGE_TYPE.Location:
                    const location: MediaGeoLocation.AsObject = message.mediadata;
                    const geoItem: IGeoItem = {
                        caption,
                        lat: location.lat || 0,
                        long: location.pb_long || 0,
                    };
                    this.sendMediaMessageWithNoFile('location', geoItem, {
                        message: params.message,
                        mode: params.mode,
                    });
                    break;
                case C_MESSAGE_TYPE.Contact:
                    const contact: MediaContact.AsObject = message.mediadata;
                    const user: IUser = {
                        firstname: contact.firstname,
                        lastname: contact.lastname,
                        phone: contact.phone,
                    };
                    this.sendMediaMessageWithNoFile('contact', user, {
                        message: params.message,
                        mode: params.mode,
                    });
                    break;
                default:
                    this.chatInputTextSendHandler(caption, {
                        entities: params.entities,
                        message: params.message,
                        mode: params.mode,
                    });
                    break;
            }
        }
    }

    private openLink(link: string) {
        if (link.length > 0) {
            if (link.indexOf('http://') === -1 && link.indexOf('https://') === -1) {
                link = '//' + link;
            }
            if (ElectronService.isElectron()) {
                ElectronService.openExternal(link);
            } else {
                const win: any = window.open(link, '_blank');
                win.focus();
            }
        }
    }

    private botSendPhoneHandler = () => {
        this.confirmDialogCloseHandler();
        this.chatInputContactSelectHandler([{
            firstname: this.connInfo.FirstName || '',
            id: this.userId,
            lastname: this.connInfo.LastName || '',
            phone: this.connInfo.Phone || '',
        }], '', {});
    }

    private botSendLocationHandler = () => {
        this.confirmDialogCloseHandler();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                this.chatInputMapSelectHandler({
                    caption: '',
                    lat: pos.coords.latitude,
                    long: pos.coords.longitude,
                }, {});
            }, this.geoLocationErrorHandler);
        }
    }

    private geoLocationErrorHandler(error: any) {
        if (!this.props.enqueueSnackbar) {
            return;
        }
        switch (error.code) {
            case error.PERMISSION_DENIED:
                this.props.enqueueSnackbar('User denied the request for Geolocation.');
                break;
            case error.POSITION_UNAVAILABLE:
                this.props.enqueueSnackbar('Location information is unavailable.');
                break;
            case error.TIMEOUT:
                this.props.enqueueSnackbar('The request to get user location timed out.');
                break;
            case error.UNKNOWN_ERROR:
                this.props.enqueueSnackbar('An unknown error occurred.');
                break;
        }
    }

    /* Message on last message handler */
    private messageLastMessageHandler = (message: IMessage | null) => {
        if (this.chatInputRef && message) {
            const dialog = message.replymarkup ? this.getDialogById(this.selectedDialogId) : null;
            this.chatInputRef.setLastMessage(message, dialog ? ((dialog.topmessageid || 0) <= (message.id || 0)) : false);
        }
        if (this.conversationRef) {
            if (!message && !this.conversationRef.classList.contains('no-result')) {
                this.conversationRef.classList.add('no-result');
            } else if (message && this.conversationRef.classList.contains('no-result')) {
                this.conversationRef.classList.remove('no-result');
            }
        }
    }

    /* Message on last incoming message handler */
    private messageLastIncomingMessageHandler = (message: IMessage | null) => {
        if (this.chatInputRef) {
            if (message && message.replymarkup === C_REPLY_ACTION.ReplyKeyboardMarkup) {
                this.chatInputRef.setBot(this.peer, this.isBot, {
                    data: message.replydata || 0,
                    mode: message.replymarkup,
                    msgId: message.id || 0,
                });
            } else if (message) {
                this.chatInputRef.setBot(this.peer, this.isBot, {
                    data: undefined,
                    mode: message.replymarkup || 0,
                    msgId: message.id || 0,
                });
            } else {
                this.chatInputRef.setBot(this.peer, this.isBot, undefined);
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
        if (this.chatInputRef) {
            this.chatInputRef.applyDraft();
        }
        clearTimeout(this.mobileBackTimeout);
        this.setChatView(false);
        this.mobileBackTimeout = setTimeout(() => {
            this.props.history.push('/chat/null');
        }, 300);
    }

    /* Close peer handler */
    private closePeerHandler = () => {
        this.props.history.push('/chat/null');
    }

    /* SettingsMenu on update handler */
    private settingUpdateMessageHandler = (keep?: boolean) => {
        if (keep && this.messageRef) {
            this.messageRef.setScrollMode('stay');
        }
        if (this.selectedDialogId !== 'null' && this.messageRef) {
            this.messageRef.clearAll();
            this.messageRef.forceUpdate();
        }
    }

    /* SettingsMenu on reload dialog handler */
    private settingReloadDialogHandler = (peerIds: string[]) => {
        if (peerIds.indexOf(this.selectedDialogId) > -1) {
            setTimeout(() => {
                this.getMessagesByDialogId(this.selectedDialogId, true);
            }, 1000);
        }
    }

    private leftMenuActionHandler = (cmd: menuAction) => {
        switch (cmd) {
            case "close_iframe":
                this.iframeService.close();
                break;
            case "new_message":
                this.setState({
                    openNewMessage: true,
                });
                break;
            case "logout":
                this.setState({
                    confirmDialogMode: 'logout',
                    confirmDialogOpen: true,
                });
                break;
        }
    }

    /* SettingsMenu on update handler */
    private settingActionHandler = (cmd: 'logout' | 'count_dialog') => {
        switch (cmd) {
            case 'logout':
                this.bottomBarSelectHandler('logout')();
                break;
            case 'count_dialog':
                this.dialogsSort(this.dialogs);
                break;
        }
    }

    private dialogRemove = (id: string) => {
        // this.updateManager.disableLiveUpdate();
        // this.setAppStatus({
        //     isUpdating: true,
        // });
        if (id) {
            const dialogMap = this.dialogMap;
            const index = this.dialogMap[id];
            this.dialogs.splice(index, 1);
            delete dialogMap[id];
            this.dialogsSort(this.dialogs);
            if (this.selectedDialogId === id) {
                this.props.history.push('/chat/null');
            }
        }
    }

    private confirmDialogCloseHandler = () => {
        this.setState({
            confirmDialogMode: 'none',
            confirmDialogOpen: false,
        });
        this.resetSelectedMessages();
    }

    private confirmDialogAcceptHandler = () => {
        this.logOutHandler();
    }

    /* On message selected ids change */
    private messageSelectedIdsChangeHandler = (selectedIds: { [key: number]: number }) => {
        this.messageSelectedIds = selectedIds;
        this.propagateSelectedMessage(true);
    }

    /* On message selectable change */
    private messageSelectableChangeHandler = (selectable: boolean) => {
        this.messageSelectable = selectable;
        this.propagateSelectedMessage(true);
    }

    /* ChatInput bulk action handler */
    private chatInputBulkActionHandler = (cmd: string) => (e: any) => {
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
                for (const i in this.messageSelectedIds) {
                    if (this.messageSelectedIds.hasOwnProperty(i)) {
                        const msg = messages[this.messageSelectedIds[i]];
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
                this.resetSelectedMessages();
                break;
            case 'labels':
                if (this.labelDialogRef) {
                    const ids = Object.keys(this.messageSelectedIds).map(o => parseInt(o, 10));
                    this.messageRepo.getIn(ids, true).then((res) => {
                        const selectedIds = res.map(o => o.labelidsList || []);
                        if (this.labelDialogRef) {
                            this.labelDialogRef.openDialog(ids, selectedIds);
                        }
                    });
                }
                break;
            default:
                break;
        }
    }

    /* ChatInput action handler */
    private chatInputActionHandler = (cmd: string, message?: IMessage) => (e?: any) => {
        const peer = this.peer;
        if (!peer) {
            return;
        }
        switch (cmd) {
            case 'remove_dialog':
                const dialog = this.getDialogById(peer.getId() || '');
                if (dialog) {
                    this.apiManager.clearMessage(peer, dialog.topmessageid || 0, true).then(() => {
                        this.dialogRemove(peer.getId() || '');
                    });
                }
                break;
            case 'edit':
                this.setChatInputParams(C_MSG_MODE.Edit, message);
                break;
            case 'start_bot':
                const user = this.userRepo.getInstant(peer.getId() || '');
                if (user) {
                    this.startBot(user);
                }
                break;
            case 'reply':
                if (message) {
                    this.messageContextMenuHandler('reply', message);
                }
                break;
            default:
                break;
        }
    }

    private forwardDialogCloseHandler = () => {
        this.resetSelectedMessages();
    }

    private forwardDialogDoneHandler = (forwardRecipients: IInputPeer[]) => {
        const promises: any[] = [];
        const peer = this.peer;
        const messageSelectedIds = this.messageSelectedIds;
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
        }).sort((a, b) => a - b);
        forwardRecipients.forEach((recipient) => {
            const targetPeer = new InputPeer();
            targetPeer.setAccesshash(recipient.accesshash);
            targetPeer.setId(recipient.id);
            targetPeer.setType(recipient.type);
            promises.push(this.apiManager.forwardMessage(peer, msgIds, UniqueId.getRandomId(), targetPeer, false));
        });
        this.forwardDialogCloseHandler();
        Promise.all(promises).catch((err) => {
            window.console.debug(err);
        });
    }

    private removeMessageHandler = (mode: number) => (e: any) => {
        const peer = this.peer;
        const messageSelectedIds = this.messageSelectedIds;
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
                const listPeer: any = {};
                listPeer[peer.getId() || ''] = remoteMsgIds;
                this.updateMessageDBRemovedHandler({
                    ids: remoteMsgIds,
                    listPeer,
                    peerIds: [peer.getId() || ''],
                });
                this.apiManager.removeMessage(peer, remoteMsgIds, mode === 1).catch((err) => {
                    window.console.debug(err);
                });
            }
        }
        this.confirmDialogCloseHandler();
    }

    /* Check if can notify user */
    private canNotify(peerId: string, d?: IDialog) {
        if (!peerId) {
            return;
        }
        const dialog = d || this.getDialogById(peerId);
        if (dialog) {
            return !isMuted(dialog.notifysettings);
        }
        return true;
    }

    /* Jump to message handler */
    private messageJumpToMessageHandler = (id: number, text?: string) => {
        if (this.isLoading || !this.messageRef) {
            return;
        }
        const peer = this.peer;
        if (!peer || !this.messages) {
            return;
        }
        const index = findIndex(this.messages, (o) => {
            return o.id === id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
        });
        if (index > -1) {
            if (this.messageRef.list) {
                this.messageRef.list.scrollToItem(index, -1);
                setTimeout(() => {
                    highlightMessage(id);
                    if (typeof text === 'string' && text !== '') {
                        highlightMessageText(id, text);
                    }
                }, Math.abs(this.scrollInfo.end - index) < 20 ? 100 : 1500);
            }
        } else {
            this.setLoading(true, true);
            if (this.messageRef) {
                this.messageRef.setFitList(false);
            }

            const dialogId = peer.getId() || '';

            this.messageRepo.list({peer, after: id - 1, limit: 25}).then((res) => {
                if (this.selectedDialogId !== dialogId || res.length === 0 || !this.messageRef) {
                    this.setLoading(false);
                    return;
                }
                this.messages = [];
                this.messageMap = {};
                this.messageRef.clearAll();
                this.setScrollMode('top');
                const dataMsg = this.modifyMessages(this.messages, res, true);
                if (this.messages.length === 0) {
                    if (this.moveDownRef) {
                        this.moveDownRef.setVisible(false);
                    }
                    this.setEndOfMessage(false);
                    this.setLoading(false);
                }
                this.messageRef.setMessages(dataMsg.msgs);
                setTimeout(() => {
                    this.setLoading(false);
                    this.setScrollMode('none');
                    highlightMessage(id);
                    if (typeof text === 'string' && text !== '') {
                        highlightMessageText(id, text);
                    }
                    this.messageLoadMoreBeforeHandler();
                    if (this.messageRef) {
                        this.messageRef.setFitList(true);
                    }
                }, 100);
            }).catch((err) => {
                this.setLoading(false);
            });
        }
    }

    /* Set loading flag */
    private setLoading(loading: boolean, overlay?: boolean) {
        this.isLoading = loading;
        if (this.messageRef) {
            this.messageRef.setLoading(loading, overlay);
        }
    }

    /* UserDialog ref handler */
    private userDialogRefHandler = (ref: any) => {
        this.userDialogRef = ref;
    }

    /* SelectPeerDialog ref handler */
    private forwardDialogRefHandler = (ref: any) => {
        this.forwardDialogRef = ref;
    }

    /* AboutDialog ref handler */
    private aboutDialogRefHandler = (ref: any) => {
        this.aboutDialogRef = ref;
    }

    /* LabelDialog ref handler */
    private labelDialogRefHandler = (ref: any) => {
        this.labelDialogRef = ref;
    }

    /* Uploader ref handler */
    private uploaderRefHandler = (ref: any) => {
        this.uploaderRef = ref;
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
                if (this.userDialogRef) {
                    this.userDialogRef.openDialog(peer);
                }
                break;
            case 'block':
                break;
            case 'remove':
                this.setLeftMenu('chat');
                this.setState({
                    confirmDialogMode: (dialog.peertype === PeerType.PEERGROUP) ? 'delete_exit_group' : 'delete_user',
                    confirmDialogOpen: true,
                    leftMenuSelectedDialogId: dialog.peerid || '',
                });
                break;
            case 'clear':
                if (dialog.topmessageid) {
                    this.apiManager.clearMessage(peer, dialog.topmessageid, false);
                }
                break;
            case 'pin':
                this.apiManager.dialogTogglePin(peer, true).then(() => {
                    this.pinDialog(peer.getId() || '', true, true);
                }).catch((err) => {
                    if (err.code === C_ERR.ErrCodeInternal && err.items === 'max pinned dialogs reached') {
                        if (this.props.enqueueSnackbar) {
                            this.props.enqueueSnackbar(i18n.t('dialog.max_pin_alert'));
                        }
                    }
                });
                break;
            case 'unpin':
                this.apiManager.dialogTogglePin(peer, false).then(() => {
                    this.pinDialog(peer.getId() || '', false, true);
                });
                break;
            case 'mute':
                this.setNotifySettings(peer, -2);
                break;
            case 'unmute':
                this.setNotifySettings(peer, -1);
                break;
            default:
                break;
        }
    }

    /* Set Message component scroll mode */
    private setScrollMode(mode: 'none' | 'end' | 'top' | 'stay') {
        if (this.messageRef) {
            this.messageRef.setScrollMode(mode);
        }
    }

    /* Resend text message */
    private resendTextMessage(randomId: number, message: IMessage) {
        const peer = this.peer;
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

        // For double checking update message id
        this.updateManager.setRandomId(randomId);
        this.apiManager.sendMessage(randomId, message.body || '', peer, message.replyto, messageEntities).then((res) => {
            message.id = res.messageid;
            this.messageMapAppend(message);

            this.messageRepo.lazyUpsert([message]);
            this.updateDialogs(message, '0');

            // Force update messages
            if (this.messageRef) {
                this.messageRef.updateList();
            }
        });
    }

    /* Resend media message */
    private resendMediaMessage(randomId: number, message: IMessage, fileIds: string[], data: any, inputMediaType?: InputMediaType) {
        const peer = this.peer;
        if (peer === null) {
            return;
        }

        const fn = () => {
            // For double checking update message id
            this.updateManager.setRandomId(randomId);
            this.apiManager.sendMediaMessage(randomId, peer, inputMediaType || InputMediaType.INPUTMEDIATYPEUPLOADEDDOCUMENT, data, message.replyto).then((res) => {
                message.id = res.messageid;
                this.messageMapAppend(message);
                message.downloaded = true;

                this.messageRepo.lazyUpsert([message]);
                this.updateDialogs(message, '0');

                // Force update messages
                if (this.messageRef) {
                    this.messageRef.updateList();
                }
            });
        };

        const promises: any[] = [];
        fileIds.forEach((id, key) => {
            if (key === 0) {
                promises.push(this.fileManager.retry(id, (progress) => {
                    this.progressBroadcaster.publish(message.id || 0, progress);
                }));
            } else {
                promises.push(this.fileManager.retry(id));
            }
        });
        Promise.all(promises).then(() => {
            this.progressBroadcaster.remove(message.id || 0);
            fn();
        }).catch((errs) => {
            const err = errs.length ? errs[0] : errs;
            this.progressBroadcaster.remove(message.id || 0);
            if (err.code === C_FILE_ERR_CODE.NO_TEMP_FILES) {
                fn();
            } else if (err.code !== C_FILE_ERR_CODE.REQUEST_CANCELLED) {
                const messages = this.messages;
                const index = findIndex(messages, (o) => {
                    return o.id === message.id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                });
                if (index > -1) {
                    messages[index].error = true;
                    this.messageRepo.importBulk([messages[index]], false);
                    if (this.messageRef) {
                        this.messageRef.updateList();
                    }
                }
            }
        });
    }

    /* Resend message */
    private resendMessage(message: IMessage) {
        this.messageRepo.getPendingByMessageId(message.id || 0).then((res) => {
            if (res) {
                const messages = this.messages;
                const index = findIndex(messages, (o) => {
                    return o.id === message.id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                });
                if (index > -1) {
                    messages[index].error = false;
                    if (this.messageRef) {
                        this.messageRef.updateList();
                    }
                }
                if (res.file_ids && res.file_ids.length > 0 && message.mediatype !== MediaType.MEDIATYPEEMPTY && message.messagetype !== 0 && message.messagetype !== C_MESSAGE_TYPE.Normal) {
                    this.resendMediaMessage(res.id, message, res.file_ids, res.data, res.type);
                } else if (message.messagetype === 0 || message.messagetype === C_MESSAGE_TYPE.Normal) {
                    this.resendTextMessage(res.id, message);
                }
            } else {
                if ((message.id || 0) < 0) {
                    this.messageRepo.remove(message.id || 0);
                }
            }
        });
    }

    /* Attachment action handler */
    private messageAttachmentActionHandler = (cmd: 'cancel' | 'download' | 'download_stream' | 'cancel_download' | 'view' | 'open' | 'read' | 'save_as' | 'preview' | 'start_bot', message: IMessage | number, fileId?: string) => {
        const execute = (msg: IMessage) => {
            switch (cmd) {
                case 'cancel':
                    this.cancelSend(msg.id || 0);
                    break;
                case 'download':
                case 'download_stream':
                    this.downloadFile(msg, cmd === 'download_stream');
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
                case 'start_bot':
                    if (this.peer) {
                        const user = this.userRepo.getInstant(this.peer.getId() || '');
                        if (user) {
                            this.startBot(user);
                        }
                    }
                    break;
            }
        };
        if (typeof message === 'number') {
            if ((message === 0 && cmd === 'save_as') || cmd === 'start_bot') {
                execute({});
            } else {
                this.messageRepo.get(message).then((msg) => {
                    if (msg) {
                        execute(msg);
                    }
                }).catch((err) => {
                    window.console.log(message, err);
                });
            }
        } else {
            execute(message);
        }
    }

    /* Cancel sending message */
    private cancelSend(id: number, noUpdate?: boolean) {
        const removeMessage = () => {
            if (id > 0) {
                return;
            }
            this.messageRepo.get(id).then((msg) => {
                if (msg && msg.req_id) {
                    this.apiManager.cancelRequest(msg.req_id);
                }
                this.messageRepo.remove(id).then(() => {
                    const messages = this.messages;
                    if (messages) {
                        const index = findIndex(messages, (o) => {
                            return o.id === id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                        });
                        if (index > -1) {
                            if (this.messageRef) {
                                this.messageRef.clear(index);
                            }
                            messages.splice(index, 1);
                            if (noUpdate !== true && this.messageRef) {
                                this.messageRef.updateList();
                            }
                        }
                    }
                }).catch((err) => {
                    window.console.debug(err);
                });
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
    private downloadFile(msg: IMessage, userBuffer: boolean) {
        const mediaDocument = getMediaDocument(msg);
        if (mediaDocument && mediaDocument.doc && mediaDocument.doc.id) {
            const fileLocation = new InputFileLocation();
            fileLocation.setAccesshash(mediaDocument.doc.accesshash || '');
            fileLocation.setClusterid(mediaDocument.doc.clusterid || 1);
            fileLocation.setFileid(mediaDocument.doc.id);
            fileLocation.setVersion(mediaDocument.doc.version || 0);
            let downloadPromise: any = null;
            if (userBuffer) {
                downloadPromise = this.fileManager.downloadStreamFile(fileLocation, mediaDocument.doc.md5checksum || '', mediaDocument.doc.filesize || 0, mediaDocument.doc.mimetype || 'application/octet-stream', (bufferProgress) => {
                    this.bufferProgressBroadcaster.publish(msg.id || 0, bufferProgress);
                }, (progress) => {
                    this.progressBroadcaster.publish(msg.id || 0, progress);
                });
            } else {
                downloadPromise = this.fileManager.receiveFile(fileLocation, mediaDocument.doc.md5checksum || '', mediaDocument.doc.filesize || 0, mediaDocument.doc.mimetype || 'application/octet-stream', (progress) => {
                    this.progressBroadcaster.publish(msg.id || 0, progress);
                });
            }
            downloadPromise.then(() => {
                this.broadcastEvent('File_Downloaded', {id: msg.id});
                this.progressBroadcaster.remove(msg.id || 0);
                this.bufferProgressBroadcaster.remove(msg.id || 0);
                this.messageRepo.lazyUpsert([{
                    downloaded: true,
                    id: msg.id,
                }]);
                if (fileLocation) {
                    const fileLocationObject = fileLocation.toObject();
                    this.fileRepo.upsertFileMap([{
                        clusterid: fileLocationObject.clusterid || 0,
                        id: fileLocationObject.fileid || '',
                        msg_ids: [msg.id || 0],
                    }]);
                }
                if (this.selectedDialogId === msg.peerid) {
                    const messages = this.messages;
                    const index = findIndex(messages, {id: msg.id, messagetype: msg.messagetype});
                    if (index > -1) {
                        messages[index].downloaded = true;
                        // Force update messages
                        if (this.messageRef) {
                            this.messageRef.updateList();
                        }
                    }
                }
                if (msg.messagetype === C_MESSAGE_TYPE.File && this.settingsConfigManager.getDownloadSettings().auto_save_files) {
                    this.saveFile(msg);
                }
            }).catch((err: any) => {
                window.console.debug(err);
                if (err && err.code !== C_FILE_ERR_CODE.ALREADY_IN_QUEUE) {
                    this.progressBroadcaster.failed(msg.id || 0);
                    this.progressBroadcaster.remove(msg.id || 0);
                    this.bufferProgressBroadcaster.remove(msg.id || 0);
                }
            });
        }
    }

    /* Cancel download file */
    private cancelDownloadFile(msg: IMessage) {
        const mediaDocument = getMediaDocument(msg);
        if (mediaDocument && mediaDocument.doc && mediaDocument.doc.id) {
            this.fileManager.cancel(mediaDocument.doc.id);
        }
    }

    /* ChatInput send voice handler */
    private chatInputVoiceHandler = (item: IMediaItem, param: IMessageParam) => {
        this.sendMediaMessage('voice', item, param);
    }

    /* ChatInput file select handler */
    private chatInputFileSelectHandler = (files: File[], options: IUploaderOptions) => {
        if (this.uploaderRef && this.peer) {
            this.uploaderRef.openDialog(this.peer, files, options);
        }
    }

    private sendMediaMessage(type: 'image' | 'video' | 'file' | 'voice' | 'audio' | 'none', mediaItem: IMediaItem, param: IMessageParam) {
        if (type === 'none') {
            return;
        }
        const peer = param.peer ? param.peer : cloneDeep(this.peer);
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

        const tempDocument = new Document();
        tempDocument.setAccesshash('');
        tempDocument.setAttributesList(attributesList);
        tempDocument.setClusterid(0);
        tempDocument.setDate(now);
        tempDocument.setId(fileIds[0]);
        tempDocument.setFilesize(mediaItem.file.size);
        tempDocument.setMimetype(mediaItem.fileType);
        tempDocument.setVersion(0);

        let tempImageFile: Blob | undefined;

        switch (type) {
            case 'file':
                if (mediaItem.animated) {
                    messageType = C_MESSAGE_TYPE.Gif;
                    const attrAnimatedData = new DocumentAttributeAnimated();

                    const attrAnimated = new DocumentAttribute();
                    attrAnimated.setData(attrAnimatedData.serializeBinary());
                    attrAnimated.setType(DocumentAttributeType.ATTRIBUTETYPEANIMATED);

                    attributesList.push(attrAnimated);
                    attributesDataList.push(attrAnimatedData.toObject());

                    const attrGifPhotoData = new DocumentAttributePhoto();
                    if (mediaItem.thumb) {
                        attrGifPhotoData.setHeight(mediaItem.thumb.height);
                        attrGifPhotoData.setWidth(mediaItem.thumb.width);
                    } else {
                        attrGifPhotoData.setHeight(0);
                        attrGifPhotoData.setWidth(0);
                    }

                    const attrGifPhoto = new DocumentAttribute();
                    attrGifPhoto.setData(attrGifPhotoData.serializeBinary());
                    attrGifPhoto.setType(DocumentAttributeType.ATTRIBUTETYPEPHOTO);

                    attributesList.push(attrGifPhoto);
                    attributesDataList.push(attrGifPhotoData.toObject());
                } else {
                    messageType = C_MESSAGE_TYPE.File;
                    const attrFileData = new DocumentAttributeFile();
                    attrFileData.setFilename(mediaItem.name);

                    const attrFile = new DocumentAttribute();
                    attrFile.setData(attrFileData.serializeBinary());
                    attrFile.setType(DocumentAttributeType.ATTRIBUTETYPEFILE);

                    attributesList.push(attrFile);
                    attributesDataList.push(attrFileData.toObject());
                }

                if (mediaItem.thumb) {
                    tempImageFile = mediaItem.thumb.file;
                }
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

                tempImageFile = mediaItem.file;
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

                if (mediaItem.thumb) {
                    tempImageFile = mediaItem.thumb.file;
                }
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

        if (mediaItem.thumb) {
            fileIds.push(String(UniqueId.getRandomId()));

            const tempThumbInputFile = new FileLocation();
            tempThumbInputFile.setAccesshash('');
            tempThumbInputFile.setClusterid(0);
            tempThumbInputFile.setFileid(fileIds[1]);

            tempDocument.setThumbnail(tempThumbInputFile);
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
            peerid: peer.getId(),
            peertype: peer.getType(),
            random_id: randomId,
            senderid: this.userId,
            temp_file: tempImageFile,
        };

        let replyTo: any;
        if (param.mode === C_MSG_MODE.Reply && param.message) {
            message.replyto = param.message.id;
            replyTo = param.message.id;
        }

        if (mediaItem.entities && mediaItem.entities.length > 0) {
            message.entitiesList = mediaItem.entities.map((entity: MessageEntity) => {
                return entity.toObject();
            });
            mediaDocument.setEntitiesList(mediaItem.entities);

        }

        this.pushMessage(message);

        const sendDocument = (sha256FileLocation: FileLocation.AsObject | null) => {
            const inputMediaUploadedDocument = new InputMediaUploadedDocument();
            const inputMediaDocument = new InputMediaDocument();
            if (sha256FileLocation) {
                inputMediaDocument.setCaption(mediaItem.caption || '');
                inputMediaDocument.setAttributesList(attributesList);
                const inputDocument = new InputDocument();
                inputDocument.setAccesshash(sha256FileLocation.accesshash || '0');
                inputDocument.setClusterid(sha256FileLocation.clusterid || 0);
                inputDocument.setId(sha256FileLocation.fileid || '0');
                inputMediaDocument.setDocument(inputDocument);
                if (mediaItem.entities) {
                    inputMediaDocument.setEntitiesList(mediaItem.entities);
                }
            } else {
                inputMediaUploadedDocument.setCaption(mediaItem.caption || '');
                inputMediaUploadedDocument.setMimetype(mediaItem.fileType);
                inputMediaUploadedDocument.setStickersList([]);
                inputMediaUploadedDocument.setAttributesList(attributesList);
                inputMediaUploadedDocument.setFile(inputFile);
                if (mediaItem.entities) {
                    inputMediaUploadedDocument.setEntitiesList(mediaItem.entities);
                }
            }

            if (mediaItem.thumb) {
                const inputThumbFile = new InputFile();
                inputThumbFile.setFileid(fileIds[1]);
                inputThumbFile.setFilename(`thumb_${mediaItem.name}`);
                inputThumbFile.setMd5checksum('');
                inputThumbFile.setTotalparts(1);
                if (sha256FileLocation) {
                    inputMediaDocument.setThumbnail(inputThumbFile);
                } else {
                    inputMediaUploadedDocument.setThumbnail(inputThumbFile);
                }
            }

            let data = sha256FileLocation ? inputMediaDocument.serializeBinary() : inputMediaUploadedDocument.serializeBinary();

            const uploadPromises: any[] = [];

            const inputMediaType = sha256FileLocation ? InputMediaType.INPUTMEDIATYPEDOCUMENT : InputMediaType.INPUTMEDIATYPEUPLOADEDDOCUMENT;
            this.messageRepo.addPending({
                data,
                file_ids: fileIds,
                id: randomId,
                message_id: id,
                type: inputMediaType,
            });

            switch (type) {
                case 'file':
                case 'voice':
                case 'image':
                case 'video':
                case 'audio':
                    if (sha256FileLocation) {
                        uploadPromises.push(new Promise((resolve) => {
                            this.progressBroadcaster.publish(id, {
                                download: 10,
                                progress: 1,
                                state: 'complete',
                                totalDownload: 10,
                                totalUpload: 10,
                                upload: 10,
                            });
                            resolve('');
                        }));
                    } else {
                        uploadPromises.push(this.fileManager.sendFile(fileIds[0], mediaItem.file, (progress) => {
                            this.progressBroadcaster.publish(id, progress);
                        }));
                    }
                    break;
            }

            switch (type) {
                case 'image':
                case 'video':
                case 'audio':
                case 'file':
                    if (mediaItem.thumb) {
                        uploadPromises.push(this.fileManager.sendFile(fileIds[1], mediaItem.thumb.file));
                    }
                    break;
            }

            this.chatInputTypingHandler(TypingAction.TYPINGACTIONUPLOADING, peer);
            Promise.all(uploadPromises).then((arr) => {
                this.chatInputTypingHandler(TypingAction.TYPINGACTIONCANCEL, peer);
                this.progressBroadcaster.remove(id);
                if (!sha256FileLocation && arr.length !== 0) {
                    inputFile.setMd5checksum(arr[0]);
                    inputMediaUploadedDocument.setFile(inputFile);
                    data = inputMediaUploadedDocument.serializeBinary();
                    this.messageRepo.addPending({
                        data,
                        file_ids: fileIds,
                        id: randomId,
                        message_id: id,
                        type: inputMediaType,
                    });
                }
                // For double checking update message id
                this.updateManager.setRandomId(randomId);
                this.apiManager.sendMediaMessage(randomId, peer, inputMediaType, data, replyTo).then((res) => {
                    message.id = res.messageid;
                    this.messageMapAppend(message);
                    message.downloaded = true;

                    if (sha256FileLocation) {
                        tempDocument.setAccesshash(sha256FileLocation.accesshash || '');
                        tempDocument.setClusterid(sha256FileLocation.clusterid || 0);
                        tempDocument.setId(sha256FileLocation.fileid || '0');
                        mediaDocument.setDoc(tempDocument);
                        message.mediadata = mediaDocument.toObject();
                    }

                    this.messageRepo.lazyUpsert([message]);
                    this.updateDialogs(message, '0');

                    if (this.selectedDialogId === peer.getId()) {
                        this.checkMessageOrder(message);
                        // Force update messages
                        if (this.messageRef) {
                            this.messageRef.updateList();
                        }
                        this.newMessageLoadThrottle();
                    }
                }).catch((err) => {
                    window.console.warn(err);
                    if (!this.resolveRandomMessageIdError(err, randomId, id) && this.selectedDialogId === peer.getId()) {
                        const messages = this.messages;
                        const index = findLastIndex(messages, (o) => {
                            return o.id === id && o.messagetype === messageType;
                        });
                        if (index > -1) {
                            messages[index].error = true;
                            this.messageRepo.importBulk([messages[index]], false);
                            if (this.messageRef) {
                                this.messageRef.updateList();
                            }
                        }
                    }
                });
            }).catch((err) => {
                this.progressBroadcaster.remove(id);
                this.chatInputTypingHandler(TypingAction.TYPINGACTIONCANCEL, peer);
                if (err.code !== C_FILE_ERR_CODE.REQUEST_CANCELLED && this.selectedDialogId === peer.getId()) {
                    const messages = this.messages;
                    const index = findLastIndex(messages, (o) => {
                        return o.id === id && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
                    });
                    if (index > -1) {
                        messages[index].error = true;
                        this.messageRepo.importBulk([messages[index]], false);
                        if (this.messageRef) {
                            this.messageRef.updateList();
                        }
                    }
                }
            });
        };

        if (type === 'voice') {
            sendDocument(null);
        } else {
            this.fileManager.getFileLocationBySha256(mediaItem.file).then((fileLocation) => {
                sendDocument(fileLocation);
            }).catch(() => {
                sendDocument(null);
            });
        }
    }

    private chatInputGifSelectHandler = (item: IGif) => {
        const peer = cloneDeep(this.peer);
        if (!peer) {
            return;
        }

        const now = this.riverTime.now();
        const randomId = UniqueId.getRandomId();
        const id = -this.riverTime.milliNow();
        const message: IMessage = {
            attributes: item.attributes,
            createdon: now,
            downloaded: item.downloaded,
            id,
            me: true,
            mediadata: {
                caption: item.caption,
                doc: item.doc,
                entitiesList: item.entitiesList,
                ttlinseconds: item.ttlinseconds,
            },
            mediatype: MediaType.MEDIATYPEDOCUMENT,
            messageaction: C_MESSAGE_ACTION.MessageActionNope,
            messagetype: item.messagetype,
            peerid: peer.getId(),
            peertype: peer.getType(),
            random_id: randomId,
            senderid: this.userId,
        };

        let replyTo;
        if (this.chatInputRef) {
            const options = this.chatInputRef.getUploaderOptions();
            if (options.mode === C_MSG_MODE.Reply && options.message) {
                replyTo = options.message.id;
                message.replyto = replyTo;
            }
            this.chatInputRef.clearPreviewMessage(true)();
        }

        this.pushMessage(message);

        const inputMediaDocument = new InputMediaDocument();
        inputMediaDocument.setCaption(item.caption || '');
        const inputDocument = new InputDocument();
        inputDocument.setAccesshash(item.doc.accesshash || '0');
        inputDocument.setClusterid(item.doc.clusterid || 0);
        inputDocument.setId(item.doc.id || '0');
        inputMediaDocument.setDocument(inputDocument);

        const inputMediaType = InputMediaType.INPUTMEDIATYPEDOCUMENT;
        const data = inputMediaDocument.serializeBinary();

        this.messageRepo.addPending({
            data,
            file_ids: [],
            id: randomId,
            message_id: id,
            type: inputMediaType,
        });

        // For double checking update message id
        this.updateManager.setRandomId(randomId);
        this.apiManager.sendMediaMessage(randomId, peer, inputMediaType, data, replyTo).then((res) => {
            message.id = res.messageid;
            this.messageMapAppend(message);
            this.messageRepo.lazyUpsert([message]);
            this.updateDialogs(message, '0');

            if (this.selectedDialogId === peer.getId()) {
                this.checkMessageOrder(message);
                // Force update messages
                if (this.messageRef) {
                    this.messageRef.updateList();
                }
                this.newMessageLoadThrottle();
            }
        }).catch((err) => {
            window.console.warn(err);
            if (!this.resolveRandomMessageIdError(err, randomId, id) && this.selectedDialogId === peer.getId()) {
                const messages = this.messages;
                const index = findLastIndex(messages, (o) => {
                    return o.id === id && o.messagetype === item.messagetype;
                });
                if (index > -1) {
                    messages[index].error = true;
                    this.messageRepo.importBulk([messages[index]], false);
                    if (this.messageRef) {
                        this.messageRef.updateList();
                    }
                }
            }
        });
    }

    /* ChatInput contact select handler */
    private chatInputContactSelectHandler = (users: IUser[], caption: string, params: IMessageParam) => {
        if (this.chatInputRef) {
            this.chatInputRef.clearPreviewMessage(true)();
        }
        users.forEach((user) => {
            this.sendMediaMessageWithNoFile('contact', user, params);
        });
    }

    /* ChatInput map select handler */
    private chatInputMapSelectHandler = (item: IGeoItem, params: IMessageParam) => {
        if (this.chatInputRef) {
            this.chatInputRef.clearPreviewMessage(true)();
        }
        this.sendMediaMessageWithNoFile('location', item, params);
    }

    /* Send media message with no file */
    private sendMediaMessageWithNoFile(type: 'contact' | 'location' | 'none', item: IUser | IGeoItem, params: IMessageParam) {
        if (type === 'none') {
            return;
        }
        const peer = params.peer ? params.peer : cloneDeep(this.peer);
        if (!peer) {
            return;
        }

        const now = this.riverTime.now();
        const randomId = UniqueId.getRandomId();
        const id = -this.riverTime.milliNow();

        let messageType = C_MESSAGE_TYPE.Contact;
        let mediaData: any;
        let media: any;
        let mediaType = InputMediaType.INPUTMEDIATYPECONTACT;
        let mediaType2: MediaType = MediaType.MEDIATYPECONTACT;
        let rtl: boolean = false;
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
            geoData.setCaption(location.caption || '');
            geoData.setEntitiesList(location.entities || []);
            rtl = this.rtlDetector.direction(location.caption || '');
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
            peerid: peer.getId(),
            peertype: peer.getType(),
            rtl,
            senderid: this.userId,
        };

        let replyTo: any;
        if (params.mode === C_MSG_MODE.Reply && params.message) {
            message.replyto = params.message.id;
            replyTo = params.message.id;
        }

        this.pushMessage(message);

        this.messageRepo.addPending({
            id: randomId,
            message_id: id,
        });

        // For double checking update message id
        this.updateManager.setRandomId(randomId);
        this.apiManager.sendMediaMessage(randomId, peer, mediaType, media, replyTo).then((res) => {
            message.id = res.messageid;
            this.messageMapAppend(message);

            this.messageRepo.lazyUpsert([message]);
            this.updateDialogs(message, '0');

            this.checkMessageOrder(message);
            // Force update messages
            if (this.messageRef) {
                this.messageRef.updateList();
            }
            this.newMessageLoadThrottle();
        }).catch((err) => {
            window.console.warn(err);
            if (!this.resolveRandomMessageIdError(err, randomId, id)) {
                const messages = this.messages;
                const index = findLastIndex(messages, (o) => {
                    return o.id === id && o.messagetype === messageType;
                });
                if (index > -1) {
                    messages[index].error = true;
                    this.messageRepo.importBulk([messages[index]], false);
                    if (this.messageRef) {
                        this.messageRef.updateList();
                    }
                }
            }
        });
    }

    /* Send media message with label message */
    private sendUploadedMediaMessage(caption: string, msg: IMessage, params: IMessageParam) {
        const peer = params.peer ? params.peer : cloneDeep(this.peer);
        if (!peer) {
            return;
        }

        const now = this.riverTime.now();
        const randomId = UniqueId.getRandomId();
        const id = -this.riverTime.milliNow();

        const media = new InputMediaMessageDocument();
        const inputPeer = new InputPeer();
        inputPeer.setType(msg.peertype || PeerType.PEERUSER);
        inputPeer.setId(msg.peerid || '0');
        inputPeer.setAccesshash('0');
        media.setMessageid(msg.id || 0);
        media.setPeer(inputPeer);
        media.setCaption(caption);

        const message: IMessage = cloneDeep(msg);
        message.id = id;
        message.me = true;
        message.createdon = now;
        message.peerid = peer.getId();
        message.peertype = peer.getType();
        message.random_id = randomId;
        if (!message.mediadata) {
            message.mediadata = {};
        }
        message.mediadata.caption = caption;
        message.labelidsList = undefined;

        let replyTo: any;
        if (params.mode === C_MSG_MODE.Reply && params.message) {
            message.replyto = params.message.id;
            replyTo = params.message.id;
        }

        if (params.entities) {
            message.mediadata.entitiesList = params.entities.map(o => o.toObject());
            media.setEntitiesList(params.entities);
        }

        this.pushMessage(message);

        this.messageRepo.addPending({
            id: randomId,
            message_id: id,
        });

        // For double checking update message id
        this.updateManager.setRandomId(randomId);
        this.apiManager.sendMediaMessage(randomId, peer, InputMediaType.INPUTMEDIATYPEMESSAGEDOCUMENT, media.serializeBinary(), replyTo).then((res) => {
            message.id = res.messageid;
            this.messageMapAppend(message);

            this.messageRepo.lazyUpsert([message]);
            this.updateDialogs(message, '0');

            this.checkMessageOrder(message);
            // Force update messages
            if (this.messageRef) {
                this.messageRef.updateList();
            }
            this.newMessageLoadThrottle();
        }).catch((err) => {
            window.console.warn(err);
            if (!this.resolveRandomMessageIdError(err, randomId, id)) {
                const messages = this.messages;
                const index = findLastIndex(messages, (o) => {
                    return o.id === id;
                });
                if (index > -1) {
                    messages[index].error = true;
                    this.messageRepo.importBulk([messages[index]], false);
                    if (this.messageRef) {
                        this.messageRef.updateList();
                    }
                }
            }
        });
    }

    /* ChatInput voice state change handler */
    private chatInputVoiceStateChangeHandler = (state: 'lock' | 'down' | 'up' | 'play') => {
        this.isRecording = (state === 'lock' || state === 'down');
    }

    /* ChatInput get dialog handler */
    private chatInputGetDialogHandler = (id: string): IDialog | null => {
        return this.getDialogById(id);
    }

    /* ChatInput focus handler */
    private chatInputFocusHandler = () => {
        if (this.isMobileBrowser && this.messageRef) {
            this.messageRef.scrollDownIfPossible();
        }
    }

    /* Save file by type */
    private saveFile(msg: IMessage) {
        const mediaDocument = getMediaDocument(msg);
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
        const file = new File([blob], fileInfo.name, {type: blob.type});
        const objectUrl = URL.createObjectURL(file);
        this.electronService.download(objectUrl, fileInfo.name).then((res) => {
            message.saved = true;
            message.saved_path = res.path;
            this.messageRepo.lazyUpsert([message]);
            const fileLocation = getFileLocation(message);
            if (fileLocation) {
                const fileLocationObject = fileLocation.toObject();
                this.fileRepo.upsertFileMap([{
                    clusterid: fileLocationObject.clusterid || 0,
                    id: fileLocationObject.fileid || '',
                    saved: true,
                    saved_path: res.path,
                }]);
            }
            // Force update messages
            if (this.messageRef) {
                this.messageRef.updateList();
            }

            // Just to make sure subscribers will update their view
            this.broadcastEvent('File_Downloaded', {id: message.id});
        }).catch((err) => {
            window.console.log(err);
        });
    }

    /* Open file and focus on folder */
    private openFile(message: IMessage) {
        if (message && message.saved_path) {
            this.electronService.revealFile(message.saved_path);
        }
    }

    /* Preview file */
    private previewFile(message: IMessage) {
        if (message && message.saved_path) {
            this.electronService.previewFile(message.saved_path);
        }
    }

    /* Read message content */
    private readMessageContent(message: IMessage) {
        const peer = this.peer;
        if (message && !message.contentread && !message.me && peer) {
            this.apiManager.readMessageContent([message.id || 0], peer);
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
        const inputPeer = peer.peer;
        if (!inputPeer) {
            return;
        }
        const id = this.apiManager.getConnInfo().UserID || '';
        const user = new InputUser();
        user.setUserid(id);
        user.setAccesshash('');
        const dialogId = inputPeer.getId() || '';
        this.apiManager.groupRemoveMember(inputPeer, user).then(() => {
            const dialog = this.getDialogById(dialogId);
            if (dialog && dialog.topmessageid) {
                this.apiManager.clearMessage(inputPeer, dialog.topmessageid, true);
            }
        }).catch((err) => {
            if (err.code === C_ERR.ErrCodeUnavailable && err.items === C_ERR_ITEM.ErrItemMember) {
                const dialog = this.getDialogById(dialogId);
                if (dialog) {
                    this.dialogRepo.remove(dialogId);
                    this.messageRepo.clearHistory(dialogId, dialog.topmessageid || 0);
                }
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
        if (!peer.peer) {
            return;
        }
        const id = this.apiManager.getConnInfo().UserID || '';
        const user = new InputUser();
        user.setUserid(id);
        user.setAccesshash('');
        const dialog = this.getDialogById(peer.peer.getId() || '');
        if (dialog && dialog.topmessageid) {
            this.apiManager.clearMessage(peer.peer, dialog.topmessageid, true);
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
        this.setLeftMenu('chat');
        this.setState({
            confirmDialogMode: 'delete_exit_group',
            confirmDialogOpen: true,
            leftMenuSelectedDialogId: this.selectedDialogId,
        });
    }

    /* RightMenu toggle menu handler */
    private rightMenuToggleMenuHandler = () => {
        if (this.messageRef) {
            this.messageRef.resizeContainer();
        }
    }

    /* Update force log out */
    private updateAuthorizationResetHandler = () => {
        this.logOutHandler();
    }

    /* Update dialog pinned handler */
    private updateDialogPinnedHandler = (data: UpdateDialogPinned.AsObject) => {
        this.pinDialog(data.peer.id || '', data.pinned);
    }

    /* Update dialog draft message handler */
    private updateDraftMessageHandler = (data: UpdateDraftMessage.AsObject) => {
        this.updateDialogsCounter(data.message.peerid || '', {draft: data.message});
        if (this.chatInputRef && this.selectedDialogId === (data.message.peerid || '')) {
            this.chatInputRef.checkDraft();
        }
    }

    /* Update dialog draft message cleared handler */
    private updateDraftMessageClearedHandler = (data: UpdateDraftMessageCleared.AsObject) => {
        this.updateDialogsCounter(data.peer.id || '', {draft: {}});
        if (this.chatInputRef && this.selectedDialogId === (data.peer.id || '')) {
            this.chatInputRef.checkDraft();
        }
    }

    /* Update label set */
    private updateLabelSetHandler = (data: UpdateLabelSet.AsObject) => {
        // TODO:Check resolve
        if (this.messageRef) {
            this.messageRef.updateList();
        }
    }

    /* Update label deleted */
    private updateLabelDeletedHandler = (data: UpdateLabelDeleted.AsObject) => {
        if (this.messageRef) {
            this.messageRef.updateList();
        }
    }

    /* Update label items added */
    private updateLabelItemsAddedHandler = (data: UpdateLabelItemsAdded.AsObject) => {
        if (data.peer.id === this.selectedDialogId) {
            data.messageidsList.forEach((id) => {
                const index = findLastIndex(this.messages, {id});
                if (index > -1) {
                    this.messages[index].labelidsList = uniq([...(this.messages[index].labelidsList || []), ...data.labelidsList]);
                    if (this.messageRef) {
                        this.messageRef.clear(index);
                    }
                }
            });
            if (this.messageRef) {
                this.messageRef.updateList();
            }
        }
    }

    /* Update label items removed */
    private updateLabelItemsRemovedHandler = (data: UpdateLabelItemsRemoved.AsObject) => {
        if (data.peer.id === this.selectedDialogId) {
            data.messageidsList.forEach((id) => {
                const index = findLastIndex(this.messages, {id});
                if (index > -1) {
                    this.messages[index].labelidsList = difference(this.messages[index].labelidsList || [], data.labelidsList);
                    if (this.messageRef) {
                        this.messageRef.clear(index);
                    }
                }
            });
            if (this.messageRef) {
                this.messageRef.updateList();
            }
        }
    }

    private updateManagerStatusHandler = ({isUpdating}: { isUpdating: boolean }) => {
        this.setAppStatus({
            isUpdating,
        });
    }

    private pinDialog(peerId: string, pinned: boolean | undefined, force?: boolean) {
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
                if (force) {
                    this.dialogRepo.lazyUpsert([dialogs[index]]);
                }
                this.dialogsSort(dialogs);
            }
        }
    }

    private moveDownRefHandler = (ref: any) => {
        this.moveDownRef = ref;
    }

    private moveDownClickHandler = () => {
        if (!this.messageRef) {
            return;
        }
        const dialog = this.getDialogById(this.selectedDialogId);
        if (dialog) {
            const scrollDown = () => {
                if (!this.messageRef) {
                    return;
                }
                if ((this.messages.length > 0 && this.messages[this.messages.length - 1] && this.messages[this.messages.length - 1].id === dialog.topmessageid) || !dialog.topmessageid) {
                    // Normal scroll down
                    this.messageRef.animateToEnd();
                } else {
                    // Load to the end
                    this.messageRef.setLoading(true, true);
                    this.getMessagesByDialogId(this.selectedDialogId, true, undefined, dialog.topmessageid + 1);
                }
            };
            if ((dialog.unreadcount || 0) > 0) {
                // New message breakpoint
                const before = Math.max((dialog.readinboxmaxid || 0), (dialog.readoutboxmaxid || 0));
                const index = findLastIndex(this.messages, {id: before});
                if (index > -1) {
                    if (this.scrollInfo && this.messages[this.scrollInfo.end] && (this.messages[this.scrollInfo.end].id || 0) < before) {
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
                    this.messageRef.setLoading(true, true);
                    this.getMessagesByDialogId(this.selectedDialogId, true, undefined, before);
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

    private newMessageLoad = () => {
        setTimeout(() => {
            if (this.messageRef) {
                this.messageRef.animateToEnd();
            }
        }, 20);
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
        if (this.selectedDialogId === info.peerId) {
            const index = findLastIndex(this.messages, (o) => {
                return o.id === info.messageId && o.messagetype !== C_MESSAGE_TYPE.Date && o.messagetype !== C_MESSAGE_TYPE.NewMessage;
            });
            if (index > -1 && this.messageRef) {
                this.messages[index].downloaded = false;
                this.messages[index].saved = false;
                this.messageRef.updateList();
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

    private setNotifySettings(peer: InputPeer, mode: number) {
        if (!peer) {
            return;
        }
        const settings = new PeerNotifySettings();
        settings.setMuteuntil(mode);
        settings.setFlags(0);
        settings.setSound('');
        this.apiManager.setNotifySettings(peer, settings).then(() => {
            this.updateDialogsNotifySettings(peer.getId() || '', settings.toObject(), true);
        });
    }

    private setLeftMenu(menu: 'chat' | 'settings' | 'contacts', pageContent?: string, pageSubContent?: string) {
        if (this.leftMenuRef) {
            this.leftMenuRef.setMenu(menu, pageContent, pageSubContent);
        }
    }

    private setChatParams(id: string, peer: InputPeer | null, selectable?: boolean, selectedIds?: { [key: number]: number }) {
        this.selectedDialogId = id;
        this.peer = peer;
        if (selectable !== undefined) {
            this.messageSelectable = selectable;
        }
        if (selectedIds !== undefined) {
            this.messageSelectedIds = selectedIds;
        }

        if (this.infoBarRef) {
            this.infoBarRef.setPeer(this.peer, this.selectedDialogId);
        }

        if (this.dialogRef) {
            this.dialogRef.setSelectedId(this.selectedDialogId);
        }

        if (this.messageRef) {
            this.messageRef.setPeer(this.peer);
        }

        if (this.chatInputRef) {
            this.chatInputRef.setParams(this.peer, C_MSG_MODE.Normal, undefined);
        }

        if (this.rightMenuRef) {
            this.rightMenuRef.setPeer(this.peer);
        }

        if (this.searchMessageRef) {
            this.searchMessageRef.setPeer(this.peer);
        }

        if (this.moveDownRef) {
            this.moveDownRef.setDialog(this.getDialogById(this.selectedDialogId));
        }

        if (selectable !== undefined && selectedIds !== undefined) {
            if (this.messageRef) {
                this.messageRef.setSelectable(selectable, selectedIds);
            }
        }
    }

    private setChatInputParams(mode: number, message?: IMessage) {
        if (this.chatInputRef) {
            this.chatInputRef.setParams(this.peer, mode, message);
        }
    }

    private propagateSelectedMessage(ignoreMessage?: boolean) {
        if (this.messageSelectable !== undefined && this.messageSelectedIds !== undefined) {
            if (ignoreMessage !== true && this.messageRef) {
                this.messageRef.setSelectable(this.messageSelectable, this.messageSelectedIds);
            }
            if (this.chatInputRef) {
                this.chatInputRef.setSelectable(this.messageSelectable, Boolean(this.messageSelectable && Object.keys(this.messageSelectedIds).length === 0));
            }
        }
    }

    private resetSelectedMessages() {
        this.messageSelectable = false;
        this.messageSelectedIds = {};
        this.propagateSelectedMessage();
    }

    private setAppStatus({isConnecting, isOnline, isUpdating}: {
        isConnecting?: boolean;
        isOnline?: boolean;
        isUpdating?: boolean;
    }) {
        if (isConnecting !== undefined) {
            this.isConnecting = isConnecting;
        }
        if (isOnline !== undefined) {
            this.isOnline = isOnline;
        }
        if (isUpdating !== undefined) {
            this.isUpdating = isUpdating;
        }
        if (this.infoBarRef) {
            this.infoBarRef.setStatus({
                isConnecting,
                isOnline,
                isUpdating
            });
        } else {
            this.forceUpdate();
        }
        if (this.leftMenuRef && this.isMobileView) {
            this.leftMenuRef.setStatus({
                isConnecting: this.isConnecting,
                isOnline: this.isOnline,
                isUpdating: this.isUpdating,
            });
        }
    }

    /* Document jump on message handler */
    private documentViewerJumpOnMessageHandler = (id: number) => {
        this.messageJumpToMessageHandler(id);
    }

    /* LabelDialog done handler */
    private labelDialogDoneHandler = (ids: number[], addIds: number[], removeIds: number[]) => {
        if (!this.peer) {
            return;
        }
        const promises: any[] = [];
        if (addIds.length > 0) {
            promises.push(this.apiManager.labelAddToMessage(this.peer, addIds, ids));
        }
        if (removeIds.length > 0) {
            promises.push(this.apiManager.labelRemoveFromMessage(this.peer, removeIds, ids));
        }
        Promise.all(promises).then((res) => {
            ids.forEach((id) => {
                const index = findLastIndex(this.messages, {id});
                if (index > -1) {
                    if (addIds.length > 0) {
                        this.messages[index].labelidsList = uniq([...(this.messages[index].labelidsList || []), ...addIds]);
                    }
                    if (removeIds.length > 0) {
                        this.messages[index].labelidsList = difference(this.messages[index].labelidsList || [], removeIds);
                    }
                    if (this.messageRef) {
                        this.messageRef.clear(index);
                    }
                }
            });
            if (this.messageRef) {
                this.messageRef.updateList();
            }
        });
    }

    private uploaderDoneHandler = (items: IMediaItem[], options: IUploaderOptions) => {
        if (this.chatInputRef) {
            this.chatInputRef.clearPreviewMessage(true)();
        }
        items.forEach((item) => {
            this.sendMediaMessage(item.mediaType, item, {
                message: options.message,
                mode: options.mode,
                peer: options.peer,
            });
        });
    }

    private userDialogActionHandler = (cmd: string, user?: IUser) => {
        if (user && cmd === 'start_bot') {
            this.startBot(user);
        }
    }

    private startBot = (user: IUser) => {
        const randomId = UniqueId.getRandomId();
        const inputPeer = new InputPeer();
        inputPeer.setAccesshash(user.accesshash || '');
        inputPeer.setId(user.id || '');
        inputPeer.setType(PeerType.PEERUSER);
        this.apiManager.botStart(inputPeer, randomId).then(() => {
            user.is_bot_started = true;
            this.userRepo.importBulk(false, [user]);
            const entities: MessageEntity[] = [];
            const entity = new MessageEntity();
            entity.setOffset(0);
            entity.setLength(6);
            entity.setType(MessageEntityType.MESSAGEENTITYTYPEBOTCOMMAND);
            entity.setUserid('');
            entities.push(entity);
            this.chatInputTextSendHandler('/start', {
                entities,
            });
        });
    }

    private updateFunctionHandler = () => {
        this.forceUpdate();
    }

    private messageMapAppend(message: IMessage) {
        if (!message.id) {
            return;
        }
        this.messageMap[(message.id * 100) + (message.messagetype || 0)] = true;
    }

    private messageMapExist(message: IMessage) {
        if (!message.id) {
            return false;
        }
        if (this.messageMap[(message.id * 100) + (message.messagetype || 0)]) {
            return true;
        }
        this.messageMapAppend(message);
        return false;
    }

    private saveGifHandler(message: IMessage) {
        if (!message.mediadata || !message.mediadata.doc) {
            return;
        }
        const mediaDoc: MediaDocument.AsObject = message.mediadata;
        const inputDocument = new InputDocument();
        inputDocument.setId(mediaDoc.doc.id || '0');
        inputDocument.setClusterid(mediaDoc.doc.clusterid || 0);
        inputDocument.setAccesshash(mediaDoc.doc.accesshash || '0');
        this.apiManager.saveGif(inputDocument).then((res) => {
            this.gifRepo.upsert([{
                attributes: message.attributes,
                caption: mediaDoc.caption,
                doc: mediaDoc.doc,
                downloaded: message.downloaded,
                entitiesList: mediaDoc.entitiesList,
                id: mediaDoc.doc.id,
                last_used: this.riverTime.now(),
                messagetype: message.messagetype,
                ttlinseconds: mediaDoc.ttlinseconds,
            }]);
        });
    }
}

export default withSnackbar<any>(Chat);
