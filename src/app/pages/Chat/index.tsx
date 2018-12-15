import * as React from 'react';
import Dialog from '../../components/Dialog/index';
import {IMessage} from '../../repository/message/interface';
import Message from '../../components/Message/index';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {
    InfoOutlined,
    KeyboardArrowLeftRounded,
    MessageRounded,
    MoreVertRounded,
    PersonAddRounded,
    SendRounded
} from '@material-ui/icons';
import MessageRepo from '../../repository/message/index';
import DialogRepo from '../../repository/dialog/index';
import UniqueId from '../../services/uniqueId/index';
import Uploader from '../../components/Uploader/index';
import TextInput from '../../components/TextInput/index';
import {cloneDeep, findIndex, throttle, trimStart} from 'lodash';
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
import ContactList from '../../components/ContactList';

import './style.css';

interface IProps {
    history?: any;
    location?: any;
    match?: any;
}

interface IState {
    chatMoreAnchorEl: any;
    confirmDialogMode: 'none' | 'logout' | 'remove_message';
    confirmDialogOpen: boolean;
    dialogs: IDialog[];
    forwardRecipientDialogOpen: boolean;
    forwardRecipients: IContact[];
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
    messageSelectedIds: { [key: number]: boolean };
    messages: IMessage[];
    moreInfoAnchorEl: any;
    openNewMessage: boolean;
    peer: InputPeer | null;
    popUpDate: number | null;
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
    private popUpDateTime: any;
    private isMobileView: boolean = false;
    private mobileBackTimeout: any = null;

    constructor(props: IProps) {
        super(props);
        this.state = {
            chatMoreAnchorEl: null,
            confirmDialogMode: 'none',
            confirmDialogOpen: false,
            dialogs: [],
            forwardRecipientDialogOpen: false,
            forwardRecipients: [],
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
            popUpDate: null,
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
        this.dialogRepo.getManyCache({}).then((res) => {
            let unreadCounter = 0;
            // Map indexes in order to to find them with O(1)
            res.forEach((dialog, index) => {
                this.dialogMap[dialog.peerid || ''] = index;
                if (dialog && dialog.unreadcount) {
                    unreadCounter += dialog.unreadcount;
                }
            });

            this.setState({
                dialogs: res,
                unreadCounter,
            }, () => {
                const selectedId = this.props.match.params.id;
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

            this.isLoading = false;
        }).catch(() => {
            this.isLoading = false;
        });

        // Update: Out of sync (internal)
        this.eventReferences.push(this.updateManager.listen(C_MSG.OutOfSync, () => {
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
                if (this.state.isUpdating) {
                    this.updateManager.enable();
                    this.setState({
                        isUpdating: false,
                    });
                }
            });
        }));

        // Update: New Message Received
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateNewMessage, (data: INewMessageBulkUpdate) => {
            if (this.state.isUpdating) {
                return;
            }
            data.messages.forEach((message) => {
                message.me = (this.connInfo.UserID === message.senderid);
            });
            if (data.peerid === this.state.selectedDialogId) {
                const dataMsg = this.modifyMessages(this.state.messages, data.messages.reverse(), true);

                this.setState({
                    messages: dataMsg.msgs,
                }, () => {
                    setTimeout(() => {
                        this.animateToEnd();
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

            if (!this.isInChat && data.senderIds.indexOf(this.connInfo.UserID || '') === -1 && data.messages.length > 0 && this.canNotify(data.messages[0].peerid || '')) {
                if (data.messages.length === 1) {
                    this.notify(
                        `Message from ${data.senders[0].firstname} ${data.senders[0].lastname}`,
                        (data.messages[0].body || '').substr(0, 64), data.messages[0].peerid || 'null');
                } else {
                    this.notify(
                        `${data.messages.length} messages in ${data.messages[0].peerid}`, '', data.messages[0].peerid || 'null');
                }
            }
            data.messages.forEach((message) => {
                if (message.senderid !== this.connInfo.UserID && message.peerid !== this.state.selectedDialogId) {
                    this.updateDialogsCounter(message.peerid || '', {unreadCounterIncrease: 1});
                }
                // Clear the message history
                if (message.messageaction === C_MESSAGE_ACTION.MessageActionClearHistory) {
                    this.messageRepo.clearHistory(message.peerid || '', message.actiondata.maxid).then(() => {
                        if (message.actiondata.pb_delete) {
                            this.dialogRemove(message.peerid || '');
                        }
                    });
                }
            });
        }));

        // Update: Message Dropped (internal)
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateNewMessageDrop, (data: INewMessageBulkUpdate) => {
            if (this.state.isUpdating) {
                return;
            }
            data.messages.forEach((message, index) => {
                this.updateDialogs(message, data.accessHashes[index] || '0');
            });
            this.messageRepo.lazyUpsert(data.messages);
            this.userRepo.importBulk(data.senders);
        }));

        // Update: Message Edited
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateMessageEdited, (data: UpdateMessageEdited.AsObject) => {
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
        }));

        // Update: User is typing
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateUserTyping, (data: UpdateUserTyping.AsObject) => {
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
        }));

        // Update: Read Inbox History
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateReadHistoryInbox, (data: UpdateReadHistoryInbox.AsObject) => {
            if (this.state.isUpdating) {
                return;
            }
            window.console.log('UpdateMaxInbox:', data.maxid);
            this.updateDialogsCounter(data.peer.id || '', {maxInbox: data.maxid});
            if (data.peer.id !== this.state.selectedDialogId) {
                this.messageRepo.getUnreadCount(data.peer.id || '', data.maxid || 0).then((res) => {
                    this.updateDialogsCounter(data.peer.id || '', {unreadCounter: res});
                });
            } else {
                this.updateDialogsCounter(data.peer.id || '', {unreadCounter: 0});
            }
        }));

        // Update: Read Outbox History
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateReadHistoryOutbox, (data: UpdateReadHistoryOutbox.AsObject) => {
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
        }));

        // Update: Message Delete
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateMessagesDeleted, (data: UpdateMessagesDeleted.AsObject) => {
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
                            this.updateDialogsCounter(res.peerid || '', {unreadCounter: count});
                        });
                    }
                });
            });
            const {messages, dialogs} = this.state;
            let updateView = false;
            data.messageidsList.map((id) => {
                const dialogIndex = findIndex(dialogs, {topmessageid: id});
                if (dialogIndex > -1) {
                    const peer = new InputPeer();
                    peer.setId(dialogs[dialogIndex].peerid || '');
                    peer.setAccesshash(dialogs[dialogIndex].accesshash || '0');
                    if (id > 1) {
                        this.messageRepo.getMany({peer, before: (id - 1), limit: 1}).then((res) => {
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
        }));

        // Update: Username
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateUsername, (data: UpdateUsername.AsObject) => {
            if (this.state.isUpdating) {
                return;
            }
            this.userRepo.importBulk([{
                firstname: data.firstname,
                id: data.userid,
                lastname: data.lastname,
                username: data.username,
            }]);
        }));

        // Update: Notify Settings
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateNotifySettings, (data: UpdateNotifySettings.AsObject) => {
            if (this.state.isUpdating) {
                return;
            }
            this.updateDialogsNotifySettings(data.notifypeer.id || '', data.settings);
        }));

        // Update: Users
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateUsers, (data: User[]) => {
            if (this.state.isUpdating) {
                return;
            }
            // @ts-ignore
            this.userRepo.importBulk(data);
        }));

        // Update: Groups
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateGroups, (data: Group[]) => {
            if (this.state.isUpdating) {
                return;
            }
            // @ts-ignore
            this.groupRepo.importBulk(data);
        }));
    }

    public componentWillReceiveProps(newProps: IProps) {
        const selectedId = newProps.match.params.id;
        if (selectedId === 'null') {
            this.setState({
                peer: null,
                selectedDialogId: 'null',
            });
        } else {
            const peer = this.getPeerByDialogId(selectedId);
            this.setState({
                leftMenu: 'chat',
                peer,
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
            textInputMessage, textInputMessageMode, peer, selectedDialogId, popUpDate, messageSelectable,
            messageSelectedIds, forwardRecipientDialogOpen, forwardRecipients, unreadCounter,
        } = this.state;
        const leftMenuRender = () => {
            switch (leftMenu) {
                default:
                case 'chat':
                    return (<Dialog items={this.state.dialogs} selectedId={selectedDialogId} isTypingList={isTypingList}
                                    cancelIsTyping={this.cancelIsTypingHandler}/>);
                case 'setting':
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
            cmd: 'setting',
            title: 'Settings',
        }];
        let inputDisable: number = 0x0;
        if (this.state.messages.length > 0) {
            const lastMessage = this.state.messages[this.state.messages.length - 1];
            if (lastMessage.messageaction === C_MESSAGE_ACTION.MessageActionGroupDeleteUser) {
                if (lastMessage.actiondata && lastMessage.actiondata.useridsList && lastMessage.actiondata.useridsList.indexOf(this.connInfo.UserID) > -1) {
                    if (lastMessage.senderid === this.connInfo.UserID) {
                        inputDisable = 0x1;
                    } else {
                        inputDisable = 0x2;
                    }
                }
            }
        }
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
                                        title="New Message"
                                        placement="bottom"
                                    >
                                        <IconButton
                                            aria-label="Attachment"
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
                                <PopUpDate timestamp={popUpDate}/>
                                <Message ref={this.messageRefHandler}
                                         items={this.state.messages}
                                         onLoadMore={this.onMessageScroll}
                                         readId={this.state.maxReadId}
                                         contextMenu={this.messageContextMenuHandler}
                                         peer={peer}
                                         showDate={this.messageShowDateHandler}
                                         selectable={messageSelectable}
                                         selectedIds={messageSelectedIds}
                                         onSelectedIdsChange={this.messageSelectedIdsChangeHandler}
                                         onSelectableChange={this.messageSelectableChangeHandler}
                                />
                            </div>
                            <div className="attachments" hidden={!this.state.toggleAttachment}>
                                <Uploader/>
                            </div>
                            {Boolean(!this.state.toggleAttachment) &&
                            <TextInput onMessage={this.onMessageHandler} onTyping={this.onTyping}
                                       userId={this.connInfo.UserID} previewMessage={textInputMessage}
                                       previewMessageMode={textInputMessageMode}
                                       clearPreviewMessage={this.clearPreviewMessageHandler}
                                       selectable={messageSelectable}
                                       selectableDisable={Boolean(messageSelectable && Object.keys(messageSelectedIds).length === 0)}
                                       onBulkAction={this.textInputBulkActionHandler}
                                       disableMode={inputDisable} onAction={this.textInputActionHandler}
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
                    {Boolean(confirmDialogMode === 'remove_message') && <div>
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
                            <Button onClick={this.removeMessageHandler.bind(this, true)} color="primary">
                                Remove (for all)
                            </Button>
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
                        <ContactList onChange={this.forwardRecipientChangeHandler}/>
                        {Boolean(forwardRecipients.length > 0) && <div className="actions-bar">
                            <div className="add-action send" onClick={this.forwardHandler}>
                                <SendRounded/>
                            </div>
                        </div>}
                    </div>}
                </OverlayDialog>
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
                    leftMenu: 'setting',
                    leftMenuSub: 'account',
                });
                break;
            case 'setting':
                this.setState({
                    leftMenu: 'setting',
                });
                break;
        }
    }

    private rightMenuRefHandler = (value: any) => {
        this.rightMenu = value;
    }

    private messageRefHandler = (value: any) => {
        this.messageComponent = value;
    }

    private animateToEnd() {
        const el = document.querySelector('.chat.active-chat');
        if (el) {
            const eldiv = el.querySelector('.chat.active-chat > div');
            if (eldiv) {
                el.scroll({
                    behavior: 'smooth',
                    top: eldiv.clientHeight,
                });
            }
        }
    }

    private getMessagesByDialogId(dialogId: string, force?: boolean) {
        const {peer} = this.state;
        if (peer === null) {
            return;
        }

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

        window.console.time('DB benchmark:');
        this.messageRepo.getMany({peer, limit: 25}, (resMsgs) => {
            const dataMsg = this.modifyMessages(this.state.messages, resMsgs, false);
            this.setState({
                messages: dataMsg.msgs,
            }, () => {
                this.messageComponent.list.recomputeRowHeights();
                this.messageComponent.forceUpdate(() => {
                    this.isLoading = false;
                });
            });
        }).then((data) => {
            window.console.timeEnd('DB benchmark:');
            if (data.length === 0) {
                messages = [];
            } else {
                messages = data.reverse();
            }

            let maxReadId = 0;
            let maxReadInbox = 0;
            if (this.dialogMap.hasOwnProperty(dialogId) && this.state.dialogs[this.dialogMap[dialogId]]) {
                maxReadId = this.state.dialogs[this.dialogMap[dialogId]].readoutboxmaxid || 0;
                maxReadInbox = this.state.dialogs[this.dialogMap[dialogId]].readinboxmaxid || 0;
            }

            const dataMsg = this.modifyMessages([], messages, true, maxReadInbox);

            this.setState({
                isChatView: true,
                isTyping: false,
                maxReadId,
                messageSelectable: false,
                messageSelectedIds: {},
                messages: dataMsg.msgs,
                selectedDialogId: dialogId,
                textInputMessage: undefined,
                textInputMessageMode: C_MSG_MODE.Normal,
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
            });
        }).catch((err: any) => {
            window.console.warn(err);
            this.setState({
                isChatView: true,
                isTyping: false,
                maxReadId: 0,
                messageSelectable: false,
                messageSelectedIds: {},
                messages: [],
                selectedDialogId: dialogId,
                textInputMessage: undefined,
                textInputMessageMode: C_MSG_MODE.Normal,
            });
        });
    }

    private onMessageScroll = () => {
        if (this.isLoading) {
            return;
        }
        this.isLoading = true;
        const {peer} = this.state;
        if (peer === null) {
            return;
        }
        this.messageRepo.getMany({
            before: this.state.messages[0].id,
            limit: 20,
            peer,
        }).then((data) => {
            if (data.length === 0) {
                return;
            }
            const messages = this.state.messages;
            const messsageSize = messages.length;
            const dataMsg = this.modifyMessages(messages, data, false);

            this.setState({
                messages: dataMsg.msgs,
            }, () => {
                // clears the gap between each message load
                for (let i = 0; i <= (dataMsg.msgs.length - messsageSize) + 1; i++) {
                    this.messageComponent.cache.clear(i, 0);
                }
                this.messageComponent.list.recomputeGridSize();
                setTimeout(() => {
                    this.isLoading = false;
                }, 100);
            });
        }).catch(() => {
            this.isLoading = false;
        });
    }

    private modifyMessages(defaultMessages: IMessage[], messages: IMessage[], push: boolean, messageReadId?: number): { maxId: number, msgs: IMessage[] } {
        let maxId = 0;
        let newMessageFlag = false;
        messages.forEach((msg, key) => {
            if (msg.id && msg.id > maxId) {
                maxId = msg.id;
            }
            if (push) {
                // avatar breakpoint
                msg.avatar = (key === 0 && (defaultMessages.length === 0 || (defaultMessages.length > 0 && msg.senderid !== defaultMessages[defaultMessages.length - 1].senderid))) || (key > 0 && msg.senderid !== messages[key - 1].senderid);

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
                defaultMessages[0].avatar = (msg.senderid !== defaultMessages[0].senderid);
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
            msgs: defaultMessages,
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

            this.pushMessage(message);

            this.sdk.sendMessage(text, peer, replyTo).then((msg) => {
                const {messages} = this.state;
                const index = findIndex(messages, {id: message.id});
                if (index) {
                    this.messageComponent.cache.clear(index, 0);
                }
                this.messageRepo.remove(message.id || 0).catch(() => {
                    //
                });
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
        this.setState({
            messages,
        }, () => {
            setTimeout(() => {
                this.animateToEnd();
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

    private updateDialogsCounter(peerid: string, {maxInbox, maxOutbox, unreadCounter, unreadCounterIncrease}: any) {
        const {dialogs} = this.state;
        if (this.dialogMap.hasOwnProperty(peerid)) {
            const index = this.dialogMap[peerid];
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
            this.dialogsSortThrottle(dialogs);
            this.dialogRepo.lazyUpsert([dialogs[index]]);
        }
    }

    private dialogsSort(dialogs: IDialog[]) {
        dialogs.sort((i1, i2) => {
            if (!i1.last_update || !i2.last_update) {
                return 0;
            }
            return i2.last_update - i1.last_update;
        });
        const td = cloneDeep(dialogs);
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
        });
    }

    private checkSync(): Promise<any> {
        const lastId = this.syncManager.getLastUpdateId();
        return new Promise((resolve, reject) => {
            this.sdk.getUpdateState().then((res) => {
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
                        if (this.state.isUpdating) {
                            this.updateManager.enable();
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
        this.updateManager.disable();
        this.setState({
            isUpdating: true,
        });
        this.dialogRepo.getSnapshot({}).then((res) => {
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
        return;
    }

    private wsCloseHandler = () => {
        this.setState({
            isConnecting: true,
        });
    }

    private fnStartedHandler = () => {
        this.messageRepo.loadConnInfo();
    }

    private dialogDBUpdatedHandler = (event: any) => {
        const {dialogs} = this.state;
        const data = event.detail;
        this.dialogRepo.getManyCache({}).then((res) => {
            this.dialogsSortThrottle(res);
            data.ids.forEach((id: string) => {
                if (this.dialogMap.hasOwnProperty(id) && dialogs[this.dialogMap[id]]) {
                    const maxReadInbox = dialogs[this.dialogMap[id]].readinboxmaxid || 0;
                    this.messageRepo.getUnreadCount(id, maxReadInbox).then((count) => {
                        this.updateDialogsCounter(id, {unreadCounter: count});
                    });
                }
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
            this.messageRepo.getManyCache({after}, peer).then((msgs) => {
                const dataMsg = this.modifyMessages(this.state.messages, msgs, true);

                this.setState({
                    messages: dataMsg.msgs,
                }, () => {
                    setTimeout(() => {
                        this.animateToEnd();
                    }, 200);
                });

                this.sendReadHistory(peer, dataMsg.maxId);
                if (!this.isInChat) {
                    this.readHistoryMaxId = dataMsg.maxId;
                }
            });
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
                this.props.history.push(`/conversation/${id}`);
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
            this.props.history.push(`/conversation/${res.id}`);
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
            if (dialog && ((dialog.readinboxmaxid || 0) < msgId || (dialog.unreadcount || 0) > 0)) {
                this.sdk.setMessagesReadHistory(peer, msgId);
                this.updateDialogsCounter(peer.getId() || '', {maxInbox: msgId});
                this.messageRepo.getUnreadCount(peer.getId() || '', msgId).then((res) => {
                    this.updateDialogsCounter(peer.getId() || '', {unreadCounter: res});
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
                this.setState({
                    confirmDialogMode: 'remove_message',
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

    private clearPreviewMessageHandler = () => {
        this.setState({
            textInputMessage: undefined,
            textInputMessageMode: C_MSG_MODE.Normal,
        });
    }

    private messageShowDateHandler = (timestamp: number) => {
        if (this.state.popUpDate !== timestamp) {
            this.setState({
                popUpDate: timestamp,
            });
        }
        clearTimeout(this.popUpDateTime);
        this.popUpDateTime = setTimeout(() => {
            this.setState({
                popUpDate: null,
            });
        }, 3000);
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
                this.props.history.push('/conversation/null');
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
                this.props.history.push('/conversation/null');
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
    private messageSelectedIdsChangeHandler = (selectedIds: { [key: number]: boolean }) => {
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
                this.setState({
                    confirmDialogMode: 'remove_message',
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

    private forwardRecipientChangeHandler = (contacts: IContact[]) => {
        this.setState({
            forwardRecipients: contacts,
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
            targetPeer.setAccesshash(recipient.accesshash || '');
            targetPeer.setId(recipient.id || '');
            targetPeer.setType(PeerType.PEERUSER);
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
}

export default Chat;
