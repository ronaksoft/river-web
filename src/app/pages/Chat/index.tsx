import * as React from 'react';
import Dialog from '../../components/Dialog/index';
import {IMessage} from '../../repository/message/interface';
import Message, {highlighMessage} from '../../components/Message/index';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {
    InfoOutlined,
    KeyboardArrowLeftRounded,
    MessageRounded,
    MoreVertRounded,
    PersonAddRounded,
    SendRounded,
    SearchRounded,
} from '@material-ui/icons';
import MessageRepo from '../../repository/message/index';
import DialogRepo from '../../repository/dialog/index';
import UniqueId from '../../services/uniqueId/index';
import Uploader from '../../components/Uploader/index';
import TextInput from '../../components/TextInput/index';
import {clone, findIndex, throttle, trimStart, intersectionBy, differenceBy, find} from 'lodash';
import SDK from '../../services/sdk/index';
import NewMessage from '../../components/NewMessage';
import {
    Group,
    InputPeer,
    InputUser,
    PeerNotifySettings,
    PeerType,
    TypingAction,
    User
} from '../../services/sdk/messages/core.types_pb';
import {IConnInfo} from '../../services/sdk/interface';
import {IDialog} from '../../repository/dialog/interface';
import UpdateManager, {INewMessageBulkUpdate} from '../../services/sdk/server/updateManager';
import {C_MSG} from '../../services/sdk/const';
import {
    UpdateMessageEdited,
    UpdateMessagesDeleted, UpdateNotifySettings,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox,
    UpdateUsername,
    UpdateUserTyping
} from '../../services/sdk/messages/api.updates_pb';
import UserName from '../../components/UserName';
import SyncManager from '../../services/sdk/syncManager';
import UserRepo from '../../repository/user';
import RiverLogo from '../../components/RiverLogo';
import MainRepo from '../../repository';
import SettingMenu from '../../components/SettingMenu';
import {C_MSG_MODE} from '../../components/TextInput/consts';
import TimeUtililty from '../../services/utilities/time';
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE} from '../../repository/message/consts';
import PopUpDate from '../../components/PopUpDate';
import BottomBar from '../../components/BottomBar';
import ContactMenu from '../../components/ContactMenu';
import Tooltip from '@material-ui/core/Tooltip';
import NewGroupMenu from '../../components/NewGroupMenu';
import {IContact} from '../../repository/contact/interface';
import GroupRepo from '../../repository/group';
import GroupName from '../../components/GroupName';
import GroupInfoMenu from '../../components/GroupInfoMenu';
import UserInfoMenu, {isMuted} from '../../components/UserInfoMenu';
import ContactRepo from '../../repository/contact';
import {isTypingRender} from '../../components/DialogMessage';
import OverlayDialog from '@material-ui/core/Dialog/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import UserDialog from '../../components/UserDialog';
import {IGroup} from '../../repository/group/interface';
import SearchList, {IInputPeer} from '../../components/SearchList';
import * as core_types_pb from '../../services/sdk/messages/core.types_pb';

import './style.css';
import ElectronService, {C_ELECTRON_SUBJECT} from '../../services/electron';

interface IProps {
    history?: any;
    location?: any;
    match?: any;
}

interface IState {
    chatMoreAnchorEl: any;
    confirmDialogMode: 'none' | 'logout' | 'remove_message' | 'remove_message_revoke';
    confirmDialogOpen: boolean;
    dialogs: IDialog[];
    forwardRecipientDialogOpen: boolean;
    forwardRecipients: IInputPeer[];
    group: IGroup | null;
    isChatView: boolean;
    isConnecting: boolean;
    isTyping: boolean;
    isTypingList: { [key: string]: { [key: string]: any } };
    isUpdating: boolean;
    leftMenu: string;
    leftMenuSub: string;
    leftOverlay: boolean;
    maxReadId: number;
    messageSelectable: boolean;
    messageSelectedIds: { [key: number]: number };
    messages: IMessage[];
    moreInfoAnchorEl: any;
    openNewMessage: boolean;
    peer: InputPeer | null;
    rightMenu: boolean;
    selectedDialogId: string;
    textInputMessage?: IMessage;
    textInputMessageMode: number;
    toggleAttachment: boolean;
    unreadCounter: number;
}

class Chat extends React.Component<IProps, IState> {
    private isInChat: boolean = true;
    private rightMenu: any = null;
    private dialogComponent: Dialog;
    private popUpDateComponent: PopUpDate;
    private messageComponent: Message;
    private messageRepo: MessageRepo;
    private dialogRepo: DialogRepo;
    private userRepo: UserRepo;
    private contactRepo: ContactRepo;
    private groupRepo: GroupRepo;
    private mainRepo: MainRepo;
    private isLoading: boolean = false;
    private sdk: SDK;
    private updateManager: UpdateManager;
    private syncManager: SyncManager;
    private connInfo: IConnInfo;
    private eventReferences: any[] = [];
    private dialogMap: { [key: string]: number } = {};
    private dialogsSortThrottle: any = null;
    private readHistoryMaxId: number | null = null;
    private isMobileView: boolean = false;
    private mobileBackTimeout: any = null;
    private userDialogComponent: UserDialog;
    private electronService: ElectronService;

    constructor(props: IProps) {
        super(props);
        this.state = {
            chatMoreAnchorEl: null,
            confirmDialogMode: 'none',
            confirmDialogOpen: false,
            dialogs: [],
            forwardRecipientDialogOpen: false,
            forwardRecipients: [],
            group: null,
            isChatView: false,
            isConnecting: true,
            isTyping: false,
            isTypingList: {},
            isUpdating: false,
            leftMenu: 'chat',
            leftMenuSub: 'none',
            leftOverlay: false,
            maxReadId: 0,
            messageSelectable: false,
            messageSelectedIds: {},
            messages: [],
            moreInfoAnchorEl: null,
            openNewMessage: false,
            peer: null,
            rightMenu: false,
            selectedDialogId: props.match.params.id,
            textInputMessageMode: C_MSG_MODE.Normal,
            toggleAttachment: false,
            unreadCounter: 0,
        };
        this.sdk = SDK.getInstance();
        this.sdk.loadConnInfo();
        this.connInfo = this.sdk.getConnInfo();
        this.messageRepo = MessageRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.contactRepo = ContactRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.dialogRepo = DialogRepo.getInstance();
        this.mainRepo = MainRepo.getInstance();
        this.updateManager = UpdateManager.getInstance();
        this.syncManager = SyncManager.getInstance();
        this.dialogsSortThrottle = throttle(this.dialogsSort, 500);
        this.isInChat = (document.visibilityState === 'visible');
        this.isMobileView = (window.innerWidth < 600);
        this.updateManager.setUserId(this.connInfo.UserID || '');
        this.electronService = ElectronService.getInstance();
    }

    public componentDidMount() {
        if (this.connInfo.AuthID === '0' || this.connInfo.UserID === '0') {
            this.props.history.push('/signup');
            return;
        }

        // Global event listeners
        window.addEventListener('focus', this.windowFocusHandler);
        window.addEventListener('blur', this.windowBlurHandler);
        window.addEventListener('wasmInit', this.wasmInitHandler);
        window.addEventListener('wsOpen', this.wsOpenHandler);
        window.addEventListener('wsClose', this.wsCloseHandler);
        window.addEventListener('fnStarted', this.fnStartedHandler);
        window.addEventListener('Dialog_DB_Updated', this.dialogDBUpdatedHandler);
        window.addEventListener('Message_DB_Updated', this.messageDBUpdatedHandler);

        // Get latest cached dialogs
        this.initDialogs();

        // Update: Out of sync (internal)
        this.eventReferences.push(this.updateManager.listen(C_MSG.OutOfSync, this.outOfSyncHandler));

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

        // Update: Users
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateUsers, this.updateUserHandler));

        // Update: Groups
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateGroups, this.updateGroupHandler));

        // Electron events
        this.eventReferences.push(this.electronService.listen(C_ELECTRON_SUBJECT.Setting, this.electronSettingsHandler));
        this.eventReferences.push(this.electronService.listen(C_ELECTRON_SUBJECT.Logout, this.electronLogoutHandler));
        this.eventReferences.push(this.electronService.listen(C_ELECTRON_SUBJECT.SizeMode, this.electronSizeModeHandler));
    }

    public componentWillReceiveProps(newProps: IProps) {
        const selectedId = newProps.match.params.id;
        if (selectedId === 'null') {
            this.setState({
                group: null,
                peer: null,
                selectedDialogId: 'null',
            });
        } else {
            const peer = this.getPeerByDialogId(selectedId);
            // Clear read history in dialog change
            if (this.state.peer && peer && this.state.peer.getId() !== peer.getId()) {
                this.readHistoryMaxId = null;
            }
            this.setState({
                group: null,
                leftMenu: 'chat',
                messageSelectable: false,
                messageSelectedIds: {},
                peer,
                selectedDialogId: selectedId,
            }, () => {
                this.getMessagesByDialogId(selectedId, true);
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
        window.removeEventListener('Dialog_DB_Updated', this.dialogDBUpdatedHandler);
        window.removeEventListener('Message_DB_Updated', this.messageDBUpdatedHandler);
    }

    public render() {
        const {
            confirmDialogMode, confirmDialogOpen, moreInfoAnchorEl, chatMoreAnchorEl, isTypingList, leftMenu, leftMenuSub, leftOverlay,
            textInputMessage, textInputMessageMode, peer, selectedDialogId, messageSelectable,
            messageSelectedIds, forwardRecipientDialogOpen, forwardRecipients, unreadCounter,
        } = this.state;
        const leftMenuRender = () => {
            switch (leftMenu) {
                default:
                case 'chat':
                    return (<Dialog ref={this.dialogRefHandler} items={this.state.dialogs} selectedId={selectedDialogId}
                                    isTypingList={isTypingList}
                                    cancelIsTyping={this.cancelIsTypingHandler}
                                    onContextMenu={this.dialogContextMenuHandler}/>);
                case 'settings':
                    return (<SettingMenu updateMessages={this.settingUpdateMessage} subMenu={leftMenuSub}
                                         onClose={this.bottomBarSelectHandler.bind(this, 'chat')}
                                         onSubPlaceChange={this.leftMenuSubPageChangeHandler}/>);
                case 'contact':
                    return (<ContactMenu/>);
            }
        };
        const chatMoreMenuItem = [{
            cmd: 'new_group',
            title: 'New Group',
        }, {
            cmd: 'new_message',
            title: 'New Message',
        }, {
            cmd: 'account',
            title: 'Account Info',
        }, {
            cmd: 'settings',
            title: 'Settings',
        }];

        return (
            <div className="bg">
                <div className="wrapper">
                    <div
                        className={'container' + (this.isMobileView ? ' mobile-view' : '') + (this.state.isChatView ? ' chat-view' : '')}>
                        <div
                            className={'column-left ' + (leftMenu === 'chat' ? 'with-top-bar' : '') + (leftOverlay ? ' left-overlay-enable' : '')}>
                            <div className="top-bar">
                                <span className="new-message">
                                    <RiverLogo height={24} width={24}/>
                                </span>
                                <div className="actions">
                                    <Tooltip
                                        title="Search"
                                        placement="bottom"
                                    >
                                        <IconButton
                                            aria-label="Search"
                                            aria-haspopup="true"
                                            onClick={this.onSearchHandler}
                                        >
                                            <SearchRounded/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip
                                        title="New Message"
                                        placement="bottom"
                                    >
                                        <IconButton
                                            aria-label="New Message"
                                            aria-haspopup="true"
                                            onClick={this.onNewMessageOpen}
                                        >
                                            <MessageRounded/>
                                        </IconButton>
                                    </Tooltip>
                                    <IconButton
                                        aria-label="More"
                                        aria-owns={moreInfoAnchorEl ? 'long-menu' : undefined}
                                        aria-haspopup="true"
                                        onClick={this.chatMoreOpenHandler}
                                    >
                                        <MoreVertRounded/>
                                    </IconButton>
                                    <Menu
                                        anchorEl={chatMoreAnchorEl}
                                        open={Boolean(chatMoreAnchorEl)}
                                        onClose={this.chatMoreCloseHandler}
                                        className="kk-context-menu darker"
                                    >
                                        {chatMoreMenuItem.map((item, key) => {
                                            return (
                                                <MenuItem key={key}
                                                          onClick={this.chatMoreActionHandler.bind(this, item.cmd)}
                                                          className="context-item"
                                                >
                                                    {item.title}
                                                </MenuItem>
                                            );
                                        })}
                                    </Menu>
                                </div>
                            </div>
                            <div className="left-content">
                                {leftMenuRender()}
                            </div>
                            <BottomBar onSelect={this.bottomBarSelectHandler} selected={leftMenu}
                                       unreadCounter={unreadCounter}/>
                            <div className="left-overlay">
                                {leftOverlay && <NewGroupMenu onClose={this.leftOverlayCloseHandler}
                                                              onCreate={this.onGroupCreateHandler}/>}
                            </div>
                        </div>
                        {selectedDialogId !== 'null' && <div className="column-center">
                            <div className="top">
                                {this.isMobileView ? (<div className="back-to-chats" onClick={this.backToChatsHandler}>
                                    <KeyboardArrowLeftRounded/></div>) : ''}
                                {this.getChatTitle()}
                                <span className="buttons">
                                {/*<IconButton
                                    aria-label="Attachment"
                                    aria-haspopup="true"
                                    onClick={this.attachmentToggleHandler}
                                >
                                    <Attachment/>
                                </IconButton>*/}
                                    <Tooltip
                                        title={(peer && peer.getType() === PeerType.PEERGROUP) ? 'Group Info' : 'Contact Info'}>
                                    <IconButton
                                        aria-label="More"
                                        aria-owns={moreInfoAnchorEl ? 'long-menu' : undefined}
                                        aria-haspopup="true"
                                        onClick={this.toggleRightMenu}
                                    >
                                        <InfoOutlined/>
                                    </IconButton>
                                </Tooltip>
                            </span>
                            </div>
                            <div className="conversation" hidden={this.state.toggleAttachment}>
                                <PopUpDate ref={this.popUpDateRefHandler}/>
                                <Message ref={this.messageRefHandler}
                                         items={this.state.messages}
                                         onLoadMoreBefore={this.messageLoadMoreBeforeHandler}
                                         readId={this.state.maxReadId}
                                         contextMenu={this.messageContextMenuHandler}
                                         peer={peer}
                                         showDate={this.messageShowDateHandler}
                                         selectable={messageSelectable}
                                         selectedIds={messageSelectedIds}
                                         onSelectedIdsChange={this.messageSelectedIdsChangeHandler}
                                         onSelectableChange={this.messageSelectableChangeHandler}
                                         onJumpToMessage={this.messageJumpToMessageHandler}
                                         onLoadMoreAfter={this.messageLoadMoreAfterHandler}
                                />
                            </div>
                            <div className="attachments" hidden={!this.state.toggleAttachment}>
                                <Uploader/>
                            </div>
                            {Boolean(!this.state.toggleAttachment) &&
                            <TextInput onMessage={this.onMessageHandler} onTyping={this.onTyping}
                                       userId={this.connInfo.UserID} previewMessage={textInputMessage}
                                       previewMessageMode={textInputMessageMode}
                                       onPreviewMessageChange={this.textInputPreviewMessageChangeHandler}
                                       selectable={messageSelectable}
                                       selectableDisable={Boolean(messageSelectable && Object.keys(messageSelectedIds).length === 0)}
                                       onBulkAction={this.textInputBulkActionHandler}
                                       onAction={this.textInputActionHandler} peer={peer}
                            />}
                        </div>}
                        {selectedDialogId === 'null' && <div className="column-center">
                            <div className="start-messaging">
                                <div className="start-messaging-header"/>
                                <div className="start-messaging-img"/>
                                <div className="start-messaging-title">Choose a chat to start messaging!</div>
                                <div className="start-messaging-footer"/>
                            </div>
                        </div>}
                        <div ref={this.rightMenuRefHandler} className="column-right">
                            {(this.state.rightMenu && peer && peer.getType() === PeerType.PEERGROUP) &&
                            <GroupInfoMenu peer={peer} onClose={this.setRightMenu.bind(this, false)}/>}
                            {(this.state.rightMenu && peer && peer.getType() === PeerType.PEERUSER) &&
                            <UserInfoMenu peer={peer} onClose={this.setRightMenu.bind(this, false)}/>}
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
                        <DialogTitle>Log Out?</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                We are about to log out of River.<br/>
                                All databases will be removed!<br/>
                                Are you sure?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                                Disagree
                            </Button>
                            <Button onClick={this.confirmDialogAcceptHandler} color="primary" autoFocus={true}>
                                Agree
                            </Button>
                        </DialogActions>
                    </div>}
                    {Boolean(confirmDialogMode === 'remove_message' || confirmDialogMode === 'remove_message_revoke') &&
                    <div>
                        <DialogTitle>Remove Message?</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Remove {Object.keys(messageSelectedIds).length} message(s) <br/>
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                                Disagree
                            </Button>
                            <Button onClick={this.removeMessageHandler.bind(this, false)} color="primary"
                                    autoFocus={true}>
                                Remove
                            </Button>
                            {Boolean(confirmDialogMode === 'remove_message_revoke') &&
                            <Button onClick={this.removeMessageHandler.bind(this, true)} color="primary">
                                Remove (for all)
                            </Button>}
                        </DialogActions>
                    </div>}
                </OverlayDialog>
                <OverlayDialog
                    open={forwardRecipientDialogOpen}
                    onClose={this.forwardRecipientDialogCloseHandler}
                    className="forward-recipient-dialog"
                >
                    {forwardRecipientDialogOpen && <div className="dialog-content">
                        <div className="dialog-header">
                            <PersonAddRounded/> Recipients
                        </div>
                        <SearchList onChange={this.forwardRecipientChangeHandler}/>
                        {Boolean(forwardRecipients.length > 0) && <div className="actions-bar">
                            <div className="add-action send" onClick={this.forwardHandler}>
                                <SendRounded/>
                            </div>
                        </div>}
                    </div>}
                </OverlayDialog>
                <UserDialog ref={this.userDialogRefHandler}/>
            </div>
        );
    }

    private getChatTitle(placeholder?: boolean) {
        const {peer, selectedDialogId} = this.state;
        if (!peer) {
            return '';
        }
        const isGroup = peer.getType() === PeerType.PEERGROUP;
        return (
            <span className="chat-title">
                {Boolean(placeholder !== true && !isGroup) &&
                <UserName id={this.state.selectedDialogId} className="name"/>}
                {Boolean(placeholder !== true && isGroup) &&
                <GroupName id={this.state.selectedDialogId} className="name"/>}
                {this.getChatStatus(selectedDialogId)}
            </span>
        );
    }

    private getChatStatus(dialogId: string) {
        let dialog: IDialog | null = null;
        if (this.dialogMap.hasOwnProperty(dialogId)) {
            dialog = this.state.dialogs[this.dialogMap[dialogId]];
        }
        let ids: string[] = [];
        if (dialog && this.state.isTypingList.hasOwnProperty(dialog.peerid || '')) {
            ids = Object.keys(this.state.isTypingList[dialog.peerid || '']);
        }
        if (this.state.isConnecting) {
            return (<span>Connecting...</span>);
        } else if (this.state.isUpdating) {
            return (<span>Updating...</span>);
        } else if (dialog && ids.length > 0) {
            return (isTypingRender(ids, dialog));
        } else if (dialog && dialog.peertype === PeerType.PEERGROUP && this.state.group) {
            return (<span>{this.state.group.participants} members</span>);
        } else {
            return (<span>last seen recently</span>);
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
        if (force === undefined) {
            this.rightMenu.classList.toggle('active');
            if (this.rightMenu.classList.contains('active')) {
                this.setState({
                    rightMenu: true,
                });
            } else {
                this.setState({
                    rightMenu: false,
                });
            }
        } else {
            if (!force) {
                this.rightMenu.classList.remove('active');
                this.setState({
                    rightMenu: false,
                });
            } else {
                this.rightMenu.classList.add('active');
                this.setState({
                    rightMenu: true,
                });
            }
        }
        setTimeout(() => {
            this.messageComponent.cache.clearAll();
            this.messageComponent.list.recomputeRowHeights();
            this.messageComponent.list.recomputeGridSize();
            this.messageComponent.forceUpdate(() => {
                setTimeout(() => {
                    this.messageComponent.list.scrollToRow(this.state.messages.length - 1);
                }, 100);
            });
        }, 200);
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
                    leftMenuSub: 'account',
                });
                break;
            case 'settings':
                this.setState({
                    leftMenu: 'settings',
                });
                break;
        }
    }

    private dialogRefHandler = (ref: any) => {
        this.dialogComponent = ref;
    }

    private rightMenuRefHandler = (ref: any) => {
        this.rightMenu = ref;
    }

    private popUpDateRefHandler = (ref: any) => {
        this.popUpDateComponent = ref;
    }

    private messageRefHandler = (ref: any) => {
        this.messageComponent = ref;
    }

    /* Init dialogs */
    private initDialogs = () => {
        this.dialogRepo.getManyCache({}).then((res) => {
            let unreadCounter = 0;
            // Map indexes in order to to find them with O(1)
            res.forEach((dialog, index) => {
                this.dialogMap[dialog.peerid || ''] = index;
                if (dialog && dialog.unreadcount) {
                    unreadCounter += dialog.unreadcount;
                }
            });

            const selectedId = this.props.match.params.id;
            this.setState({
                dialogs: res,
                selectedDialogId: selectedId,
                unreadCounter,
            }, () => {
                if (selectedId !== 'null') {
                    const peer = this.getPeerByDialogId(selectedId);
                    this.setState({
                        leftMenu: 'chat',
                        peer,
                    }, () => {
                        this.getMessagesByDialogId(selectedId, true);
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
        window.console.log('snapshot!');
        this.checkSync().then(() => {
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
        data.messages.forEach((message) => {
            message.me = (this.connInfo.UserID === message.senderid);
        });
        if (data.peerid === this.state.selectedDialogId) {
            const dataMsg = this.modifyMessages(this.state.messages, data.messages.reverse(), true);
            this.setScrollMode('none');
            this.setState({
                messages: dataMsg.msgs,
            }, () => {
                setTimeout(() => {
                    this.messageComponent.animateToEnd();
                }, 200);
            });
            const {peer} = this.state;
            this.sendReadHistory(peer, dataMsg.maxId);
            if (!this.isInChat) {
                this.readHistoryMaxId = dataMsg.maxId;
            }
        }
        this.messageRepo.lazyUpsert(data.messages);
        this.userRepo.importBulk(data.senders);

        data.messages.forEach((message, index) => {
            this.updateDialogs(message, data.accessHashes[index] || '0');
        });

        this.notifyMessage(data);

        data.messages.forEach((message) => {
            // Clear the message history
            if (message.messageaction === C_MESSAGE_ACTION.MessageActionClearHistory) {
                this.messageRepo.clearHistory(message.peerid || '', message.actiondata.maxid).then(() => {
                    this.updateDialogsCounter(message.peerid || '', {
                        mentionCounter: 0,
                        unreadCounter: 0,
                    });
                    if (message.actiondata.pb_delete) {
                        this.dialogRemove(message.peerid || '');
                    } else if (data.peerid === this.state.selectedDialogId) {
                        this.props.history.push(`/chat/${data.peerid}`);
                    }
                });
            } else if (message.senderid !== this.connInfo.UserID && message.peerid !== this.state.selectedDialogId) {
                this.updateDialogsCounter(message.peerid || '', {
                    mentionCounterIncrease: (message.mention_me ? 1 : 0),
                    unreadCounterIncrease: 1,
                });
            }
        });
    }

    /* Update drop message */
    private updateMessageDropHandler = (data: INewMessageBulkUpdate) => {
        if (this.state.isUpdating) {
            return;
        }
        data.messages.forEach((message, index) => {
            this.updateDialogs(message, data.accessHashes[index] || '0');
        });
        this.messageRepo.lazyUpsert(data.messages);
        this.userRepo.importBulk(data.senders);
    }

    /* Update message edit */
    private updateMessageEditHandler = (data: UpdateMessageEdited.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        this.messageRepo.lazyUpsert([data.message]);
        if (this.dialogMap.hasOwnProperty(data.message.peerid || '')) {
            const {dialogs} = this.state;
            const index = this.dialogMap[data.message.peerid || ''];
            if (dialogs[index].topmessageid === data.message.id) {
                this.updateDialogs(data.message, dialogs[index].accesshash || '0');
            }
        }
        if (this.state.selectedDialogId === data.message.peerid) {
            const {messages} = this.state;
            const index = findIndex(messages, {id: data.message.id});
            if (index > -1) {
                messages[index] = data.message;
                messages[index].me = (this.connInfo.UserID === data.message.senderid);
                this.messageComponent.list.forceUpdateGrid();
            }
        }
    }

    /* Update user typing */
    private updateUserTypeHandler = (data: UpdateUserTyping.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        const {isTypingList} = this.state;
        if (data.action === TypingAction.TYPINGACTIONTYPING) {
            const fn = setTimeout(() => {
                if (isTypingList.hasOwnProperty(data.peerid || '')) {
                    if (isTypingList[data.peerid || ''].hasOwnProperty(data.userid || 0)) {
                        delete isTypingList[data.peerid || ''][data.userid || 0];
                        this.setState({
                            isTypingList,
                        });
                    }
                }
            }, 5000);
            if (!isTypingList.hasOwnProperty(data.peerid || '')) {
                isTypingList[data.peerid || ''] = {};
                isTypingList[data.peerid || ''][data.userid || 0] = fn;
            } else {
                if (isTypingList[data.peerid || ''].hasOwnProperty(data.userid || 0)) {
                    clearTimeout(isTypingList[data.peerid || ''][data.userid || 0]);
                }
                isTypingList[data.peerid || ''][data.userid || 0] = fn;
            }
            this.setState({
                isTypingList,
            });
        } else if (data.action === TypingAction.TYPINGACTIONCANCEL) {
            if (isTypingList.hasOwnProperty(data.peerid || '')) {
                if (isTypingList[data.peerid || ''].hasOwnProperty(data.userid || 0)) {
                    clearTimeout(isTypingList[data.peerid || ''][data.userid || 0]);
                    delete isTypingList[data.peerid || ''][data.userid || 0];
                    this.setState({
                        isTypingList,
                    });
                }
            }
        }
    }

    /* Update read history inbox handler */
    private updateReadInboxHandler = (data: UpdateReadHistoryInbox.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        window.console.log('UpdateMaxInbox:', data.maxid);
        const peerId = data.peer.id || '';
        this.updateDialogsCounter(peerId, {maxInbox: data.maxid});
        if (peerId !== this.state.selectedDialogId) {
            this.messageRepo.getUnreadCount(peerId, data.maxid || 0).then((count) => {
                this.updateDialogsCounter(peerId, {
                    mentionCounter: count.mention,
                    unreadCounter: count.message,
                });
            });
        } else {
            this.updateDialogsCounter(peerId, {
                mentionCounter: 0,
                unreadCounter: 0,
            });
        }
    }

    /* Update read history outbox handler */
    private updateReadOutboxHandler = (data: UpdateReadHistoryOutbox.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        window.console.log('UpdateMaxOutbox:', data.maxid, data.peer.id);
        this.updateDialogsCounter(data.peer.id || '', {maxOutbox: data.maxid});
        if (data.peer.id === this.state.selectedDialogId) {
            this.setState({
                maxReadId: data.maxid || 0,
            });
        }
    }

    /* Update message delete handler */
    private updateMessageDeleteHandler = (data: UpdateMessagesDeleted.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        let firstMessageId = 0;
        if (data.messageidsList.length > 0) {
            firstMessageId = data.messageidsList[0];
        }
        this.messageRepo.get(firstMessageId).then((res) => {
            this.messageRepo.removeMany(data.messageidsList).then(() => {
                if (firstMessageId && res) {
                    const dialogIndex = this.dialogMap[res.peerid || ''];
                    const dialog = dialogs[dialogIndex];
                    this.messageRepo.getUnreadCount(res.peerid || '', dialog.readinboxmaxid || 0).then((count) => {
                        this.updateDialogsCounter(res.peerid || '', {
                            mentionCounter: count.mention,
                            unreadCounter: count.message
                        });
                    });
                }
            });
        });
        const {messages, dialogs} = this.state;
        let updateView = false;
        // TODO: check server
        data.messageidsList.map((id) => {
            const dialogIndex = findIndex(dialogs, {topmessageid: id});
            if (dialogIndex > -1) {
                const peer = new InputPeer();
                peer.setId(dialogs[dialogIndex].peerid || '');
                peer.setAccesshash(dialogs[dialogIndex].accesshash || '0');
                if (id > 1) {
                    this.messageRepo.getMany({peer, before: id, limit: 1}).then((res) => {
                        if (res.length > 0) {
                            this.updateDialogs(res[0], dialogs[dialogIndex].accesshash || '0', true);
                        }
                    });
                }
            }
            const index = findIndex(messages, {id});
            if (index > -1) {
                updateView = true;
                this.messageComponent.cache.clear(index, 0);
                messages.splice(index, 1);
            }
        });
        if (updateView) {
            this.messageComponent.list.recomputeGridSize();
        }
    }

    /* Update username handler */
    private updateUsernameHandler = (data: UpdateUsername.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        this.userRepo.importBulk([{
            firstname: data.firstname,
            id: data.userid,
            lastname: data.lastname,
            username: data.username,
        }]);
    }

    /* Update notify settings handler */
    private updateNotifySettingsHandler = (data: UpdateNotifySettings.AsObject) => {
        if (this.state.isUpdating) {
            return;
        }
        this.updateDialogsNotifySettings(data.notifypeer.id || '', data.settings);
    }

    /* Update user handler */
    private updateUserHandler = (data: User[]) => {
        if (this.state.isUpdating) {
            return;
        }
        // @ts-ignore
        this.userRepo.importBulk(data);
    }

    /* Update group handler */
    private updateGroupHandler = (data: Group[]) => {
        if (this.state.isUpdating) {
            return;
        }
        // @ts-ignore
        this.groupRepo.importBulk(data);
    }

    /* Electron preferences click handler */
    private electronSettingsHandler = () => {
        this.bottomBarSelectHandler('settings');
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

    private getMessagesByDialogId(dialogId: string, force?: boolean) {
        // if (this.isLoading) {
        //     return;
        // }

        const {peer, dialogs} = this.state;
        if (!peer || !dialogs) {
            return;
        }

        let dialog: IDialog | null = null;
        if (this.dialogMap.hasOwnProperty(dialogId) && this.state.dialogs[this.dialogMap[dialogId]]) {
            dialog = this.state.dialogs[this.dialogMap[dialogId]];
            if (dialog.peertype === PeerType.PEERGROUP && dialog.peerid) {
                this.groupRepo.get(dialog.peerid || '').then((group) => {
                    this.setState({
                        group,
                    });
                }).catch(() => {
                    this.setState({
                        group: null,
                    });
                });
            } else {
                this.setState({
                    group: null,
                });
            }
        }

        this.setLoading(true);

        let messages: IMessage[] = [];

        const updateState = () => {
            this.messageComponent.cache.clearAll();
            this.messageComponent.list.recomputeRowHeights();
            this.messageComponent.list.recomputeGridSize();
            this.messageComponent.forceUpdate(() => {
                setTimeout(() => {
                    this.messageComponent.list.scrollToRow(messages.length - 1);
                }, 100);
            });
        };

        let before = 100000000;
        if (dialog) {
            before = (dialog.topmessageid || 0) + 1;
        }
        let minId: number = 0;
        this.messageRepo.getMany({peer, limit: 25, before, ignoreMax: true}, (data) => {
            // Checks peerid on transition
            if (this.state.selectedDialogId !== dialogId) {
                this.setLoading(false);
                return;
            }

            if (data.length === 0) {
                messages = [];
            } else {
                messages = data.reverse();
            }

            let maxReadId = 0;
            let maxReadInbox = 0;
            if (dialog) {
                maxReadId = dialog.readoutboxmaxid || 0;
                maxReadInbox = dialog.readinboxmaxid || 0;
            }

            const dataMsg = this.modifyMessages([], messages, true, maxReadInbox);
            minId = dataMsg.minId;

            this.setScrollMode('end');
            this.setState({
                isChatView: true,
                isTyping: false,
                maxReadId,
                messages: dataMsg.msgs,
            }, () => {
                if (messages.length > 0) {
                    window.console.log('maxReadId', maxReadId, 'maxId', dataMsg.maxId);
                }
                if (force === true) {
                    updateState();
                }
                if (messages.length > 0) {
                    this.sendReadHistory(peer, dataMsg.maxId);
                }
                this.setLoading(false);
            });
        }).then((resMsgs) => {
            // Checks peerid on transition
            if (this.state.selectedDialogId !== dialogId) {
                this.setLoading(false);
                return;
            }

            const minIdIndex = findIndex(resMsgs, {id: minId});
            if (minIdIndex > -1) {
                resMsgs.splice(0, minIdIndex + 1);
            }

            const dataMsg = this.modifyMessages(this.state.messages, resMsgs, false);
            this.setScrollMode('end');
            this.setState({
                messages: dataMsg.msgs,
            }, () => {
                this.messageComponent.list.recomputeRowHeights();
                this.messageComponent.list.forceUpdateGrid();
            });
        }).catch((err: any) => {
            window.console.warn(err);
            this.setState({
                group: null,
                isChatView: true,
                isTyping: false,
            });
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

        const dialogId = peer.getId() || '';

        this.setLoading(true);

        this.messageRepo.getMany({
            before: this.state.messages[0].id,
            limit: 20,
            peer,
        }).then((data) => {
            // Checks peerid on transition
            if (this.state.selectedDialogId !== dialogId || data.length === 0) {
                this.setLoading(false);
                return;
            }
            const messages = this.state.messages;
            const messsageSize = messages.length;
            const dataMsg = this.modifyMessages(messages, data, false);

            this.setScrollMode('stay');
            this.setState({
                messages: dataMsg.msgs,
            }, () => {
                // clears the gap between each message load
                for (let i = 0; i <= (dataMsg.msgs.length - messsageSize) + 1; i++) {
                    this.messageComponent.cache.clear(i, 0);
                }
                this.messageComponent.list.recomputeGridSize();
                setTimeout(() => {
                    this.setLoading(false);
                }, 100);
            });
        }).catch(() => {
            this.setLoading(false);
        });
    }

    private modifyMessages(defaultMessages: IMessage[], messages: IMessage[], push: boolean, messageReadId?: number): { maxId: number, minId: number, msgs: IMessage[] } {
        let maxId = 0;
        let minId = Infinity;
        let newMessageFlag = false;
        messages.forEach((msg, key) => {
            if (msg.id && msg.id > maxId) {
                maxId = msg.id;
            }
            if (msg.id && msg.id < minId) {
                minId = msg.id;
            }
            if (push) {
                // avatar breakpoint
                msg.avatar =
                    (key === 0 && (defaultMessages.length === 0 || (defaultMessages.length > 0 && msg.senderid !== defaultMessages[defaultMessages.length - 1].senderid))) ||
                    (key > 0 && msg.senderid !== messages[key - 1].senderid) ||
                    (key > 0 && messages[key - 1].messageaction !== C_MESSAGE_ACTION.MessageActionNope);

                // date breakpoint
                if ((key === 0 && (defaultMessages.length === 0 || (defaultMessages.length > 0 && !TimeUtililty.isInSameDay(msg.createdon, defaultMessages[defaultMessages.length - 1].createdon))))
                    || (key > 0 && !TimeUtililty.isInSameDay(msg.createdon, messages[key - 1].createdon))) {
                    defaultMessages.push({
                        createdon: msg.createdon,
                        id: msg.id,
                        messagetype: C_MESSAGE_TYPE.Date,
                        senderid: msg.senderid,
                    });
                    msg.avatar = true;
                }
                if (messageReadId !== undefined && !newMessageFlag && (msg.id || 0) > messageReadId) {
                    defaultMessages.push({
                        id: (msg.id || 0) + 0.5,
                        messagetype: C_MESSAGE_TYPE.NewMessage,
                    });
                    newMessageFlag = true;
                }
                defaultMessages.push(msg);
            }

            if (!push) {
                if (key === 0 && defaultMessages[0].messagetype === C_MESSAGE_TYPE.Date) {
                    if (TimeUtililty.isInSameDay(msg.createdon, defaultMessages[0].createdon)) {
                        defaultMessages.splice(0, 1);
                    }
                }

                if (key === 0 && defaultMessages.length > 1 && defaultMessages[0].messagetype === C_MESSAGE_TYPE.Normal && defaultMessages[1].senderid === msg.senderid) {
                    defaultMessages[0].avatar = false;
                }

                // avatar breakpoint
                defaultMessages[0].avatar = (msg.senderid !== defaultMessages[0].senderid || defaultMessages[0].messageaction !== C_MESSAGE_ACTION.MessageActionNope);
                msg.avatar = (messages.length - 1 === key);
                // end of avatar breakpoint

                defaultMessages.unshift(msg);
                // date breakpoint
                if (messages.length - 1 === key || !TimeUtililty.isInSameDay(msg.createdon, defaultMessages[0].createdon)) {
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
            if ((iter === -1) || (iter > -1 && !TimeUtililty.isInSameDay(msg.createdon, defaultMessages[iter].createdon))) {
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

    private onMessageHandler = (text: string, param?: any) => {
        if (trimStart(text).length === 0) {
            return;
        }

        const {peer} = this.state;
        if (peer === null) {
            return;
        }

        if (param && param.mode === C_MSG_MODE.Edit) {
            const {messages} = this.state;
            const message: IMessage = param.message;
            message.body = text;
            message.editedon = Math.floor(Date.now() / 1000);
            this.sdk.editMessage(message.id || 0, text, peer).then(() => {
                const index = findIndex(messages, {id: message.id});
                if (index > -1) {
                    messages[index] = message;
                    this.messageComponent.list.forceUpdateGrid();
                }
                this.messageRepo.lazyUpsert([message]);
            }).catch((err) => {
                window.console.log(err);
            });
        } else {
            const id = -UniqueId.getRandomId();
            const message: IMessage = {
                body: text,
                createdon: Math.floor(Date.now() / 1000),
                id,
                me: true,
                messageaction: C_MESSAGE_ACTION.MessageActionNope,
                peerid: this.state.selectedDialogId,
                peertype: peer.getType(),
                senderid: this.connInfo.UserID,
            };

            let replyTo;
            if (param && param.mode === C_MSG_MODE.Reply) {
                message.replyto = param.message.id;
                replyTo = param.message.id;
            }

            let entities;
            if (param && param.entities) {
                message.entitiesList = param.entities.map((entity: core_types_pb.MessageEntity) => {
                    return entity.toObject();
                });
                entities = param.entities;
            }

            this.pushMessage(message);

            this.sdk.sendMessage(text, peer, replyTo, entities).then((msg) => {
                const {messages} = this.state;
                const index = findIndex(messages, {id: message.id});
                if (index) {
                    this.messageComponent.cache.clear(index, 0);
                }
                this.messageRepo.remove(message.id || 0).catch(() => {
                    //
                });
                if (msg.messageid) {
                    this.sendReadHistory(peer, msg.messageid);
                }
                message.id = msg.messageid;
                this.messageRepo.lazyUpsert([message]);
                this.updateDialogs(message, '0');
                // Force update messages
                this.messageComponent.list.forceUpdateGrid();
            }).catch((err) => {
                window.console.log(err);
            });
        }
    }

    private pushMessage = (message: IMessage) => {
        const {messages} = this.state;
        if (messages.length > 0 &&
            !TimeUtililty.isInSameDay(message.createdon, messages[messages.length - 1].createdon)) {
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
        this.isLoading = true;
        this.setScrollMode('none');
        this.setState({
            messages,
        }, () => {
            setTimeout(() => {
                this.messageComponent.animateToEnd();
                setTimeout(() => {
                    this.isLoading = false;
                }, 1000);
            }, 200);
        });
        this.messageRepo.lazyUpsert([message]);
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

    private onNewMessageHandler = (contacts: IContact[], text: string) => {
        contacts.forEach((contact) => {
            const peer = new InputPeer();
            peer.setType(PeerType.PEERUSER);
            peer.setAccesshash(contact.accesshash || '');
            peer.setId(contact.id || '');
            this.sdk.sendMessage(text, peer).then((msg) => {
                window.console.log(msg);
            });
        });
    }

    private onTyping = (typing: boolean) => {
        const {peer} = this.state;
        if (peer === null) {
            return;
        }

        let action: TypingAction;
        if (typing) {
            action = TypingAction.TYPINGACTIONTYPING;
        } else {
            action = TypingAction.TYPINGACTIONCANCEL;
        }
        this.sdk.typing(peer, action).then((data) => {
            window.console.debug(data);
        }).catch((err) => {
            window.console.debug(err);
        });
    }

    private getPeerByDialogId(id: string): InputPeer | null {
        if (!this.dialogMap.hasOwnProperty(id)) {
            const contact = this.contactRepo.getInstant(id);
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
        const index = this.dialogMap[id];
        const {dialogs} = this.state;
        const peer = new InputPeer();
        peer.setType(dialogs[index].peertype || 0);
        if (dialogs[index].peertype === PeerType.PEERUSER && (!dialogs[index].accesshash || dialogs[index].accesshash === '0')) {
            const contact = this.contactRepo.getInstant(id);
            if (contact) {
                dialogs[index].accesshash = contact.accesshash;
            }
        }
        peer.setAccesshash(dialogs[index].accesshash || '0');
        peer.setId(dialogs[index].peerid || '');
        return peer;
    }

    private updateDialogs(msg: IMessage, accessHash: string, force?: boolean) {
        const id = msg.peerid || '';
        if (msg.peerid === '') {
            return;
        }
        const {dialogs} = this.state;
        const preview = (msg.body || '').substr(0, 64);
        const previewMe = (this.connInfo.UserID === msg.senderid);
        let toUpdateDialog: IDialog | null = null;
        if (this.dialogMap.hasOwnProperty(id)) {
            const index = this.dialogMap[id];
            if ((dialogs[index].topmessageid || 0) <= (msg.id || 0) || force === true) {
                dialogs[index].action_code = msg.messageaction;
                dialogs[index].action_data = msg.actiondata;
                dialogs[index].topmessageid = msg.id;
                dialogs[index].preview = preview;
                dialogs[index].preview_me = previewMe;
                dialogs[index].sender_id = msg.senderid;
                dialogs[index].target_id = msg.peerid;
                dialogs[index].last_update = msg.createdon;
                dialogs[index].peerid = id;
                dialogs[index].peertype = msg.peertype;
                toUpdateDialog = dialogs[index];
                if (force) {
                    toUpdateDialog.force = force;
                }
            }
        } else {
            const dialog: IDialog = {
                action_code: msg.messageaction,
                action_data: msg.actiondata,
                last_update: msg.createdon,
                peerid: id,
                peertype: msg.peertype,
                preview,
                preview_me: previewMe,
                sender_id: msg.senderid,
                target_id: msg.peerid,
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
        const {dialogs} = this.state;
        if (!peerId || !dialogs) {
            return;
        }
        if (this.dialogMap.hasOwnProperty(peerId)) {
            const index = this.dialogMap[peerId];
            dialogs[index].notifysettings = settings;
            this.dialogsSortThrottle(dialogs);
            this.dialogRepo.lazyUpsert([dialogs[index]]);
        }
    }

    private updateDialogsCounter(peerId: string, {maxInbox, maxOutbox, unreadCounter, unreadCounterIncrease, mentionCounter, mentionCounterIncrease}: any) {
        if (this.dialogMap.hasOwnProperty(peerId)) {
            const {dialogs} = this.state;
            const index = this.dialogMap[peerId];
            if (!dialogs[index]) {
                return;
            }
            if (maxInbox && maxInbox > (dialogs[index].readinboxmaxid || 0)) {
                dialogs[index].readinboxmaxid = maxInbox;
            }
            if (maxOutbox && maxOutbox > (dialogs[index].readoutboxmaxid || 0)) {
                dialogs[index].readoutboxmaxid = maxOutbox;
            }
            if (unreadCounterIncrease === 1) {
                if (dialogs[index].unreadcount) {
                    // @ts-ignore
                    dialogs[index].unreadcount++;
                } else {
                    dialogs[index].unreadcount = 1;
                }
            }
            if (unreadCounter !== null && unreadCounter !== undefined) {
                dialogs[index].unreadcount = unreadCounter;
            }
            if (mentionCounterIncrease === 1) {
                if (dialogs[index].mentionedcount) {
                    // @ts-ignore
                    dialogs[index].mentionedcount++;
                } else {
                    dialogs[index].mentionedcount = 1;
                }
            }
            if (mentionCounter !== null && mentionCounter !== undefined) {
                dialogs[index].mentionedcount = mentionCounter;
            }
            this.dialogsSortThrottle(dialogs);
            this.dialogRepo.lazyUpsert([dialogs[index]]);
        }
    }

    private dialogsSort(dialogs: IDialog[], callback?: (ds: IDialog[]) => void) {
        dialogs.sort((i1, i2) => {
            if (!i1.last_update || !i2.last_update) {
                return 0;
            }
            return i2.last_update - i1.last_update;
        });
        const td = clone(dialogs);
        let unreadCounter = 0;
        td.forEach((d) => {
            if (d && d.unreadcount) {
                unreadCounter += d.unreadcount;
            }
        });
        this.dialogMap = {};
        this.setState({
            dialogs: td,
            unreadCounter,
        }, () => {
            td.forEach((d, i) => {
                if (d) {
                    this.dialogMap[d.peerid || ''] = i;
                }
            });
            if (callback) {
                callback(td);
            }
        });
    }

    private checkSync(): Promise<any> {
        const lastId = this.syncManager.getLastUpdateId();
        return new Promise((resolve, reject) => {
            this.sdk.getUpdateState().then((res) => {
                // TODO: check
                if ((res.updateid || 0) - lastId > 1000) {
                    reject({
                        err: 'too_late',
                    });
                } else {
                    if ((res.updateid || 0) - lastId > 0) {
                        resolve(lastId);
                        this.syncThemAll(lastId + 1, 50);
                    } else {
                        reject({
                            err: 'too_soon',
                        });
                    }
                }
            }).catch(reject);
        });
    }

    private syncThemAll(lastId: number, limit: number) {
        let tries = 0;
        this.sdk.getUpdateDifference(lastId, limit).then((res) => {
            tries = 0;
            this.syncManager.applyUpdate(res.toObject()).then((id) => {
                this.syncThemAll(id, limit);
            }).catch((err2) => {
                window.console.log(err2);
                this.updateManager.enable();
                this.setState({
                    isUpdating: false,
                });
                if (err2.code === -1) {
                    this.checkSync().then(() => {
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
        this.sdk.recall('0').then(() => {
            this.startSyncing();
        }).catch((err) => {
            window.console.log(err);
        });
    }

    private startSyncing() {
        const lastId = this.syncManager.getLastUpdateId();
        // Checks if it is the first time to sync
        if (lastId === 0) {
            this.snapshot();
            return;
        }
        // Normal syncing
        this.checkSync().then(() => {
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
        this.updateManager.disable();
        this.setState({
            isUpdating: true,
        });
        this.dialogRepo.getManyCache({}).then((oldDialogs) => {
            this.dialogRepo.getSnapshot({}).then((res) => {
                // Insert holes on snapshot if it has difference
                const sameItems: IDialog[] = intersectionBy(oldDialogs, res.dialogs, 'peerid');
                const newItems: IDialog[] = differenceBy(res.dialogs, oldDialogs, 'peerid');
                sameItems.forEach((dialog) => {
                    const d = find(res.dialogs, {peerid: dialog.peerid});
                    if (d && dialog.topmessageid) {
                        if (dialog.topmessageid !== d.topmessageid) {
                            this.messageRepo.insertHole(dialog.peerid || '', dialog.topmessageid, true);
                        }
                    }
                });
                newItems.forEach((dialog) => {
                    if (dialog.topmessageid) {
                        this.messageRepo.insertHole(dialog.peerid || '', dialog.topmessageid, false);
                    }
                });
                // Sorts dialogs by last update
                this.dialogsSortThrottle(res.dialogs);
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

    private dialogDBUpdatedHandler = (event: any) => {
        const data = event.detail;
        this.dialogRepo.getManyCache({}).then((res) => {
            this.dialogsSort(res, (dialogs) => {
                data.ids.forEach((id: string) => {
                    window.console.log('dialogDBUpdated data.id:', id);
                    if (this.dialogMap.hasOwnProperty(id) && dialogs[this.dialogMap[id]]) {
                        window.console.log('dialogDBUpdated peerId:', dialogs[this.dialogMap[id]].peerid);
                        const maxReadInbox = dialogs[this.dialogMap[id]].readinboxmaxid || 0;
                        window.console.log('dialogDBUpdated maxReadInbox:', maxReadInbox);
                        this.messageRepo.getUnreadCount(id, maxReadInbox).then((count) => {
                            window.console.log('dialogDBUpdated getUnreadCount:', count);
                            this.updateDialogsCounter(id, {
                                mentionCounter: count.mention,
                                unreadCounter: count.message,
                            });
                        });
                    }
                });
            });
        });
    }

    private messageDBUpdatedHandler = (event: any) => {
        const {peer, messages} = this.state;
        if (!peer) {
            return;
        }
        const data = event.detail;
        if (data.peerids && data.peerids.indexOf(this.state.selectedDialogId) > -1) {
            // this.getMessagesByDialogId(this.state.selectedDialogId);
            let after = 0;
            if (messages.length > 0) {
                after = messages[messages.length - 1].id || 0;
            }
            this.messageRepo.getManyCache({after, limit: 100}, peer).then((msgs) => {
                const dataMsg = this.modifyMessages(this.state.messages, msgs, true);
                this.setScrollMode('none');
                this.setState({
                    messages: dataMsg.msgs,
                }, () => {
                    setTimeout(() => {
                        this.messageComponent.animateToEnd();
                    }, 200);
                });

                this.sendReadHistory(peer, dataMsg.maxId);
                if (!this.isInChat) {
                    this.readHistoryMaxId = dataMsg.maxId;
                }
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
                    if (data.messages[0].mention_me === true) {
                        this.notify(
                            `${data.senders[0].firstname} ${data.senders[0].lastname} mentioned you in ${groupTitle}`,
                            (data.messages[0].body || '').substr(0, 64), data.messages[0].peerid || 'null');
                    } else {
                        this.notify(
                            `New message from ${data.senders[0].firstname} ${data.senders[0].lastname} in ${groupTitle}`,
                            (data.messages[0].body || '').substr(0, 64), data.messages[0].peerid || 'null');
                    }
                } else {
                    this.notify(
                        `${data.messages.length} new messages in ${groupTitle}`, '', data.messages[0].peerid || 'null');
                }
            });
        } else {
            if (data.messages.length === 1) {
                this.notify(
                    `New message from ${data.senders[0].firstname} ${data.senders[0].lastname}`,
                    (data.messages[0].body || '').substr(0, 64), data.messages[0].peerid || 'null');
            } else {
                this.notify(
                    `${data.messages.length} new messages from ${data.senders[0].firstname} ${data.senders[0].lastname}`, '', data.messages[0].peerid || 'null');
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
                    leftMenu: 'chat',
                    leftMenuSub: 'none',
                });
                break;
            default:
                this.setState({
                    leftMenu: item,
                });
                break;
        }
    }

    private leftMenuSubPageChangeHandler = (subPage: string) => {
        this.setState({
            leftMenuSub: subPage,
        });
    }

    private leftOverlayCloseHandler = () => {
        this.setState({
            leftOverlay: false,
        });
    }

    private onGroupCreateHandler = (contacts: IContact[], title: string) => {
        const users: InputUser[] = [];
        contacts.forEach((contact) => {
            const user = new InputUser();
            user.setAccesshash(contact.accesshash || '');
            user.setUserid(contact.id || '');
            users.push(user);
        });
        this.sdk.groupCreate(users, title).then((res) => {
            this.groupRepo.importBulk([res]);
            const {dialogs} = this.state;
            const dialog: IDialog = {
                accesshash: '0',
                action_code: C_MESSAGE_ACTION.MessageActionGroupCreated,
                action_data: null,
                last_update: res.createdon,
                peerid: res.id,
                peertype: PeerType.PEERGROUP,
                preview: 'Group created',
                sender_id: this.connInfo.UserID,
                target_id: res.id,
            };
            dialogs.push(dialog);
            this.dialogsSortThrottle(dialogs);
            this.props.history.push(`/chat/${res.id}`);
        });
    }

    private logOutHandler() {
        this.sdk.logout(this.connInfo.AuthID).then((res) => {
            this.sdk.resetConnInfo();
            this.mainRepo.destroyDB().then(() => {
                this.updateManager.setLastUpdateId(0);
                this.updateManager.flushLastUpdateId();
                window.location.href = '/';
                // window.location.reload();
            });
        }).catch((err) => {
            window.console.log(err);
        });
    }

    private windowFocusHandler = () => {
        this.isInChat = true;
        if (this.readHistoryMaxId) {
            const {peer} = this.state;
            this.sendReadHistory(peer, this.readHistoryMaxId);
        }
    }

    private windowBlurHandler = () => {
        this.isInChat = false;
    }

    private sendReadHistory(peer: InputPeer | null, msgId: number) {
        if (!peer || !this.isInChat) {
            return;
        }
        const {selectedDialogId, dialogs} = this.state;
        if (this.dialogMap.hasOwnProperty(selectedDialogId)) {
            const dialog = dialogs[this.dialogMap[selectedDialogId]];
            const peerId = peer.getId() || '';
            if (dialog && ((dialog.readinboxmaxid || 0) < msgId || (dialog.unreadcount || 0) > 0)) {
                this.sdk.setMessagesReadHistory(peer, msgId);
                this.updateDialogsCounter(peerId, {maxInbox: msgId});
                this.messageRepo.getUnreadCount(peerId, msgId).then((count) => {
                    this.updateDialogsCounter(peerId, {
                        mentionCounter: count.mention,
                        unreadCounter: count.message,
                    });
                });
            }
        }
        this.readHistoryMaxId = null;
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
                if ((Math.floor(Date.now() / 1000) - (message.createdon || 0)) < 86400 && message.me === true) {
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
            default:
                window.console.log(cmd, message);
                break;
        }
    }

    private textInputPreviewMessageChangeHandler = (previewMessage: IMessage, previewMessageMode: number) => {
        this.setState({
            textInputMessage: previewMessage,
            textInputMessageMode: previewMessageMode,
        });
    }

    private messageShowDateHandler = (timestamp: number) => {
        this.popUpDateComponent.updateDate(timestamp);
    }

    private cancelIsTypingHandler = (id: string) => {
        const {isTypingList} = this.state;
        if (isTypingList.hasOwnProperty(id)) {
            delete isTypingList[id];
            this.setState({
                isTypingList,
            });
        }

    }

    private backToChatsHandler = () => {
        clearTimeout(this.mobileBackTimeout);
        this.setState({
            isChatView: false,
        }, () => {
            this.mobileBackTimeout = setTimeout(() => {
                this.props.history.push('/chat/null');
            }, 1000);
        });
    }

    private settingUpdateMessage = () => {
        const {selectedDialogId} = this.state;
        if (selectedDialogId !== 'null') {
            this.messageComponent.cache.clearAll();
            this.messageComponent.list.recomputeRowHeights();
            this.messageComponent.forceUpdate();
        }
    }

    private dialogRemove = (id: string) => {
        const {dialogs} = this.state;
        if (!dialogs) {
            return;
        }
        this.updateManager.disable();
        this.setState({
            isUpdating: true,
        });
        if (id) {
            const index = this.dialogMap[id];
            dialogs.splice(index, 1);
            delete this.dialogMap[id];
            this.setState({
                dialogs,
            });
            this.dialogRepo.remove(id).then(() => {
                this.props.history.push('/chat/null');
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

    /* TextInput bulk action handler */
    private textInputBulkActionHandler = (cmd: string) => {
        switch (cmd) {
            case 'forward':
                this.setState({
                    forwardRecipientDialogOpen: true,
                });
                break;
            case 'remove':
                let noRevoke = true;
                const {messages} = this.state;
                const now = Math.floor(Date.now() / 1000);
                // Checks if revoke is unavailable
                for (const i in this.state.messageSelectedIds) {
                    if (this.state.messageSelectedIds.hasOwnProperty(i)) {
                        const msg = messages[this.state.messageSelectedIds[i]];
                        if (msg && (msg.me !== true || (now - (msg.createdon || 0)) >= 86400)) {
                            noRevoke = false;
                            break;
                        }
                    }
                }
                this.setState({
                    confirmDialogMode: (noRevoke ? 'remove_message_revoke' : 'remove_message'),
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

    /* TextInput action handler */
    private textInputActionHandler = (cmd: string) => {
        const {peer, dialogs} = this.state;
        if (!peer || !dialogs) {
            return;
        }
        switch (cmd) {
            case 'remove_dialog':
                const index = this.dialogMap[peer.getId() || ''];
                if (dialogs[index].topmessageid) {
                    this.sdk.clearMessage(peer, dialogs[index].topmessageid || 0, true).then(() => {
                        this.dialogRemove(peer.getId() || '');
                    });
                }
                break;
            default:
                break;
        }
    }

    private forwardRecipientDialogCloseHandler = () => {
        this.setState({
            forwardRecipientDialogOpen: false,
            messageSelectable: false,
            messageSelectedIds: {},
        });
    }

    private forwardRecipientChangeHandler = (inputPeers: IInputPeer[]) => {
        this.setState({
            forwardRecipients: inputPeers,
        });
    }

    private forwardHandler = () => {
        const promises: any[] = [];
        const {peer, forwardRecipients, messageSelectedIds} = this.state;
        if (!peer) {
            return;
        }
        // @ts-ignore
        const msgIds: number[] = Object.keys(messageSelectedIds);
        forwardRecipients.forEach((recipient) => {
            const targetPeer = new InputPeer();
            targetPeer.setAccesshash(recipient.accesshash);
            targetPeer.setId(recipient.id);
            targetPeer.setType(recipient.type);
            promises.push(this.sdk.forwardMessage(peer, msgIds, UniqueId.getRandomId(), targetPeer, false));
        });
        this.forwardRecipientDialogCloseHandler();
        Promise.all(promises).then((res) => {
            window.console.log(res);
        }).catch((err) => {
            window.console.log(err);
        });
    }

    private removeMessageHandler = (revoke: boolean) => {
        const {peer, messageSelectedIds} = this.state;
        if (!peer) {
            return;
        }
        // @ts-ignore
        const msgIds: number[] = Object.keys(messageSelectedIds);
        this.sdk.removeMessage(peer, msgIds, revoke).then((res) => {
            window.console.log(res);
        }).catch((err) => {
            window.console.log(err);
        });
        this.confirmDialogCloseHandler();
    }

    /* Check if can notify user */
    private canNotify(peerId: string) {
        const {dialogs} = this.state;
        if (!peerId || !dialogs) {
            return;
        }
        if (this.dialogMap.hasOwnProperty(peerId)) {
            const index = this.dialogMap[peerId];
            return !isMuted(dialogs[index].notifysettings);
        }
        return true;
    }

    /* Jump to message handler */
    private messageJumpToMessageHandler = (id: number) => {
        if (this.isLoading) {
            return;
        }
        const {peer, messages} = this.state;
        if (!peer || !messages) {
            return;
        }

        window.console.log('messageJumpToMessageHandler', id);
        const index = findIndex(messages, {id});
        if (index > 0) {
            this.messageComponent.list.scrollToRow(index);
            setTimeout(() => {
                highlighMessage(id);
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
            this.messageComponent.cache.clear(0, 0);
            this.messageComponent.list.forceUpdateGrid();
            this.messageComponent.list.scrollToRow(0);

            const dialogId = peer.getId() || '';

            this.messageRepo.getMany({peer, after: id - 1, limit: 25}).then((res) => {
                if (this.state.selectedDialogId !== dialogId || res.length === 0) {
                    this.setLoading(false);
                    return;
                }
                const dataMsg = this.modifyMessagesBetween(messages, res, id);
                this.setScrollMode('none');
                this.setState({
                    messages: dataMsg.msgs,
                });
                for (let i = dataMsg.index; i <= dataMsg.msgs.length; i++) {
                    this.messageComponent.cache.clear(i, 0);
                }
                this.messageComponent.list.recomputeGridSize();
                this.messageComponent.list.scrollToRow(0);
                setTimeout(() => {
                    this.setLoading(false);
                    highlighMessage(id);
                }, 100);
            }).catch((err) => {
                window.console.log(err);
                this.setLoading(false);
            });
        }
    }

    /* Message load after */
    private messageLoadMoreAfterHandler = (id: number) => {
        if (this.isLoading) {
            return;
        }
        const {peer, messages} = this.state;
        if (!peer || !messages) {
            return;
        }

        const dialogId = peer.getId() || '';

        window.console.log('messageLoadMoreAfterHandler', id);
        this.setLoading(true);
        this.messageRepo.getMany({peer, after: id, limit: 25}).then((res) => {
            if (this.state.selectedDialogId !== dialogId || res.length === 0) {
                this.setLoading(false);
                return;
            }
            const dataMsg = this.modifyMessagesBetween(messages, res, id);
            this.setScrollMode('none');
            this.setState({
                messages: dataMsg.msgs,
            });
            for (let i = dataMsg.index; i <= dataMsg.msgs.length; i++) {
                this.messageComponent.cache.clear(i, 0);
            }
            this.messageComponent.list.recomputeGridSize();
            // if (dataMsg.lastIndex !== -1) {
            //     this.messageComponent.list.scrollToRow(dataMsg.lastIndex);
            // }
            setTimeout(() => {
                this.setLoading(false);
            }, 100);
        }).catch((err) => {
            window.console.log(err);
            this.setLoading(false);
        });
    }

    /* Set loading flag */
    private setLoading(loading: boolean) {
        this.isLoading = loading;
        if (this.messageComponent) {
            this.messageComponent.setLoading(loading);
        }
    }

    /* UserDialog ref handler */
    private userDialogRefHandler = (elem: any) => {
        this.userDialogComponent = elem;
    }

    /* Context menu handler */
    private dialogContextMenuHandler = (cmd: string, dialog: IDialog) => {
        const {dialogs} = this.state;
        if (!dialogs) {
            return;
        }
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
                if (dialog.topmessageid) {
                    this.sdk.clearMessage(peer, dialog.topmessageid, true);
                }
                break;
            case 'clear':
                if (dialog.topmessageid) {
                    this.sdk.clearMessage(peer, dialog.topmessageid, false);
                }
                break;
            default:
                break;
        }
    }

    /* Set Message component scroll mode */
    private setScrollMode(mode: 'none' | 'end' | 'stay') {
        if (this.messageComponent) {
            this.messageComponent.setScrollMode(mode);
        }
    }

    /* On search click handler */
    private onSearchHandler = () => {
        this.dialogComponent.toggleSearch();
    }
}

export default Chat;
