import * as React from 'react';
import Dialog from '../../components/Dialog/index';
import {IMessage} from '../../repository/message/interface';
import Message from '../../components/Message/index';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {Attachment, MoreVert as MoreVertIcon} from '@material-ui/icons';
import * as faker from 'faker';
import MessageRepo from '../../repository/message/index';
import DialogRepo from '../../repository/dialog/index';
import UniqueId from '../../services/uniqueId/index';
import Uploader from '../../components/Uploader/index';
import TextInput from '../../components/TextInput/index';
import {trimStart, throttle, findIndex, cloneDeep} from 'lodash';
import SDK from '../../services/sdk/index';
import NewMessage from '../../components/NewMessage';
import {InputPeer, PeerType, PhoneContact, TypingAction} from '../../services/sdk/messages/core.types_pb';
import {IConnInfo} from '../../services/sdk/interface';
import {IDialog} from '../../repository/dialog/interface';
import UpdateManager from '../../services/sdk/server/updateManager';
import {C_MSG} from '../../services/sdk/const';
import {
    UpdateMessageEdited,
    UpdateNewMessage,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox,
    UpdateUserTyping
} from '../../services/sdk/messages/api.updates_pb';
import UserName from '../../components/UserName';
import SyncManager from '../../services/sdk/syncManager';
import UserRepo from '../../repository/user';
import RiverLogo from '../../components/RiverLogo';
import MainRepo from '../../repository';

import './style.css';
import SettingMenu from "../../components/SettingMenu";
import {C_MSG_MODE} from "../../components/TextInput/consts";
import TimeUtililty from '../../services/utilities/time';
import {C_MESSAGE_TYPE} from "../../repository/message/consts";
import PopUpDate from "../../components/PopUpDate";
import BottomBar from "../../components/BottomBar";
import ContactMenu from '../../components/ContactMenu';

interface IProps {
    history?: any;
    location?: any;
    match?: any;
}

interface IState {
    anchorEl: any;
    dialogs: IDialog[];
    inputVal: string;
    isConnecting: boolean;
    isTyping: boolean;
    isTypingList: { [key: string]: boolean };
    isUpdating: boolean;
    leftMenu: string;
    maxReadId: number;
    messages: IMessage[];
    openNewMessage: boolean;
    peer: InputPeer | null;
    popUpDate: number | null;
    rightMenu: boolean;
    selectedDialogId: string;
    textInputMessage?: IMessage;
    textInputMessageMode: number;
    toggleAttachment: boolean;
}

class Chat extends React.Component<IProps, IState> {
    private isInChat: boolean = true;
    private rightMenu: any = null;
    private messageComponent: any = null;
    private messageRepo: MessageRepo;
    private dialogRepo: DialogRepo;
    private userRepo: UserRepo;
    private mainRepo: MainRepo;
    private isLoading: boolean = false;
    private sdk: SDK;
    private updateManager: UpdateManager;
    private syncManager: SyncManager;
    private connInfo: IConnInfo;
    private eventReferences: any[] = [];
    private dialogMap: { [key: string]: number } = {};
    private typingTimeout: any = null;
    private dialogsSortThrottle: any = null;
    private readHistoryMaxId: number | null = null;
    private popUpDateTime: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            anchorEl: null,
            dialogs: [],
            inputVal: '',
            isConnecting: true,
            isTyping: false,
            isTypingList: {},
            isUpdating: false,
            leftMenu: 'chat',
            maxReadId: 0,
            messages: [],
            openNewMessage: false,
            peer: null,
            popUpDate: null,
            rightMenu: false,
            selectedDialogId: props.match.params.id,
            textInputMessageMode: C_MSG_MODE.Normal,
            toggleAttachment: false,
        };
        this.sdk = SDK.getInstance();
        this.sdk.loadConnInfo();
        this.connInfo = this.sdk.getConnInfo();
        this.messageRepo = MessageRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.dialogRepo = DialogRepo.getInstance();
        this.mainRepo = MainRepo.getInstance();
        this.updateManager = UpdateManager.getInstance();
        this.syncManager = SyncManager.getInstance();
        this.dialogsSortThrottle = throttle(this.dialogsSort, 500);
        this.isInChat = (document.visibilityState === 'visible');
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
        window.addEventListener('User_DB_Updated', this.userDBUpdatedHandler);

        // Get latest cached dialogs
        this.dialogRepo.getManyCache({}).then((res) => {
            // Map indexes in order to to find them with O(1)
            res.forEach((dialog, index) => {
                this.dialogMap[dialog.peerid || ''] = index;
            });

            this.setState({
                dialogs: res
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
                this.setState({
                    isUpdating: true,
                });
            }).catch(() => {
                if (this.state.isUpdating) {
                    this.setState({
                        isUpdating: false,
                    });
                }
            });
        }));

        // Update: New Message Received
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateNewMessage, (data: UpdateNewMessage.AsObject) => {
            if (this.state.isUpdating) {
                return;
            }
            const message: IMessage = data.message;
            message._id = String(message.id);
            message.me = (this.connInfo.UserID === message.senderid);
            if (data.message.peerid === this.state.selectedDialogId) {
                this.pushMessage(message);
                const {peer} = this.state;
                this.sendReadHistory(peer, message.id || 0);
                if (!this.isInChat) {
                    this.readHistoryMaxId = message.id || 0;
                }
            }
            this.messageRepo.lazyUpsert([data.message]);
            this.userRepo.importBulk([data.sender]);
            this.updateDialogs(data.message, data.accesshash || '0');
            if (!this.isInChat && data.message.senderid !== this.connInfo.UserID) {
                this.notify(
                    `Message from ${data.sender.firstname} ${data.sender.lastname}`,
                    (data.message.body || '').substr(0, 64));
            }
            if (data.message.senderid !== this.connInfo.UserID && data.message.peerid !== this.state.selectedDialogId) {
                this.updateDialogsCounter(data.message.peerid || '', {unreadCounterIncrease: 1});
            }
        }));

        // Update: Message Dropped (internal)
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateNewMessageDrop, (data: UpdateNewMessage.AsObject) => {
            if (this.state.isUpdating) {
                return;
            }
            this.updateDialogs(data.message, data.accesshash || '0');
            this.messageRepo.lazyUpsert([data.message]);
            this.userRepo.importBulk([data.sender]);
        }));

        // Update: Message Edited
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateMessageEdited, (data: UpdateMessageEdited.AsObject) => {
            if (this.state.isUpdating) {
                return;
            }
            this.messageRepo.lazyUpsert([data.message]);
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
            if (data.action === TypingAction.TYPING) {
                isTypingList[data.userid || ''] = true;
                this.setState({
                    isTypingList,
                });
            } else if (data.action === TypingAction.CANCEL) {
                if (isTypingList.hasOwnProperty(data.userid || '')) {
                    delete isTypingList[data.userid || ''];
                    this.setState({
                        isTypingList,
                    });
                }
            }
            if (data.userid !== this.state.selectedDialogId) {
                return;
            }
            const isTyping = data.userid === this.state.selectedDialogId && data.action === TypingAction.TYPING;
            if (this.state.isTyping !== isTyping) {
                this.setState({
                    isTyping,
                    isTypingList,
                });
            }
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                this.setState({
                    isTyping: false,
                });
            }, 5000);
        }));

        // Update: Read Inbox History
        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateReadHistoryInbox, (data: UpdateReadHistoryInbox.AsObject) => {
            if (this.state.isUpdating) {
                return;
            }
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
            window.console.log('UpdateMaxOutbox:', data.maxid);
            this.updateDialogsCounter(data.peer.id || '', {maxOutbox: data.maxid});
            if (data.peer.id === this.state.selectedDialogId) {
                this.setState({
                    maxReadId: data.maxid || 0,
                });
            }
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
        window.removeEventListener('User_DB_Updated', this.userDBUpdatedHandler);
    }

    public render() {
        const {anchorEl, isTypingList, leftMenu, textInputMessage, textInputMessageMode, peer, selectedDialogId, popUpDate} = this.state;
        const open = Boolean(anchorEl);
        const leftMenuRender = () => {
            switch (leftMenu) {
                default:
                case 'chat':
                    return (<Dialog items={this.state.dialogs} selectedId={selectedDialogId} isTypingList={isTypingList}
                                    cancelIsTyping={this.cancelIsTypingHandler}/>);
                case 'setting':
                    return (<SettingMenu/>);
                case 'contact':
                    return (<ContactMenu/>);
            }
        };
        return (
            <div className="bg">
                <div className="wrapper">
                    <div className="container">
                        <div className="column-left">
                            <div className="top-bar">
                                <span className="new-message" onClick={this.onNewMessageOpen}>
                                    <RiverLogo height={24} width={24}/>
                                    <span>New message</span>
                                </span>
                            </div>
                            <div className="left-content">
                                {leftMenuRender()}
                            </div>
                            <BottomBar onSelect={this.bottomBarSelectHandler} selected={leftMenu}/>
                        </div>
                        {selectedDialogId !== 'null' && <div className="column-center">
                            <div className="top">
                                {this.getChatTitle()}
                                <span className="buttons">
                                <IconButton
                                    aria-label="Attachment"
                                    aria-haspopup="true"
                                    onClick={this.toggleAttachment}
                                >
                                    <Attachment/>
                                </IconButton>
                                <IconButton
                                    aria-label="More"
                                    aria-owns={anchorEl ? 'long-menu' : undefined}
                                    aria-haspopup="true"
                                    onClick={this.handleContactInfoClick}
                                >
                                    <MoreVertIcon/>
                                </IconButton>
                                <Menu
                                    id="long-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={this.handleContactInfoClose}
                                >
                                  <MenuItem key={1}
                                            onClick={this.toggleRightMenu}
                                  >
                                      {"Contact Info"}
                                  </MenuItem>
                                </Menu>
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
                                />
                            </div>
                            <div className="attachments" hidden={!this.state.toggleAttachment}>
                                <Uploader/>
                            </div>
                            {!this.state.toggleAttachment &&
                            <TextInput onMessage={this.onMessageHandler} onTyping={this.onTyping}
                                       userId={this.connInfo.UserID} previewMessage={textInputMessage}
                                       previewMessageMode={textInputMessageMode}
                                       clearPreviewMessage={this.clearPreviewMessageHandler}/>}
                        </div>}
                        {selectedDialogId === 'null' && <div className="column-center">
                            <div className="start-messaging">
                                <div className="start-messaging-header">{this.getChatTitle(true)}</div>
                                <div className="start-messaging-img"/>
                                <div className="start-messaging-title">Choose a chat to start messaging!</div>
                                <div className="start-messaging-footer"/>
                            </div>
                        </div>}
                        <div ref={this.rightMenuRefHandler} className="column-right"/>
                    </div>
                    <NewMessage open={this.state.openNewMessage} onClose={this.onNewMessageClose}
                                onMessage={this.onNewMessage}/>
                </div>
            </div>
        );
    }

    private getChatTitle(placeholder?: boolean) {
        if (this.state.isConnecting) {
            return (<span>Connecting...</span>);
        } else if (this.state.isUpdating) {
            return (<span>Updating...</span>);
        } else if (this.state.isTyping) {
            return (<span><UserName id={this.state.selectedDialogId} className="name"/> is typing...</span>);
        } else if (placeholder !== true) {
            return (<span><UserName id={this.state.selectedDialogId} className="name"/></span>);
        } else {
            return '';
        }
    }

    private handleContactInfoClick = (event: any) => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    }

    private handleContactInfoClose = () => {
        this.setState({
            anchorEl: null,
        });
    }

    private toggleAttachment = () => {
        this.setState({
            toggleAttachment: !this.state.toggleAttachment,
        });
    }

    private toggleRightMenu = () => {
        this.setState({
            anchorEl: null,
        });
        this.rightMenu.classList.toggle('active');
        setTimeout(() => {
            this.messageComponent.cache.clearAll();
            this.messageComponent.list.recomputeRowHeights();
            this.messageComponent.forceUpdate(() => {
                setTimeout(() => {
                    this.messageComponent.list.scrollToRow(this.state.messages.length - 1);
                }, 100);
            });
        }, 200);
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
            this.messageComponent.forceUpdate(() => {
                setTimeout(() => {
                    this.messageComponent.list.scrollToRow(messages.length - 1);
                }, 100);
            });
        };

        this.messageRepo.getMany({peer, limit: 25}).then((data) => {
            if (data.length === 0) {
                messages = [];
            } else {
                messages = data.reverse();
            }

            const dataMsg = this.modifyMessages([], messages, true);

            let maxReadId = 0;
            if (this.dialogMap.hasOwnProperty(dialogId)) {
                maxReadId = this.state.dialogs[this.dialogMap[dialogId]].readoutboxmaxid || 0;
            }

            this.setState({
                isTyping: false,
                maxReadId,
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
        });
    }

    private onMessageScroll = () => {
        if (this.isLoading) {
            return;
        }
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
            // messages.unshift.apply(messages, data.reverse());
            // messages.map((msg, key) => {
            //     msg.avatar = (key > 0 && msg.senderid !== messages[key - 1].senderid || key === 0 && msg.senderid !== this.connInfo.UserID);
            //     return msg;
            // });

            const dataMsg = this.modifyMessages(messages, data, false);

            this.setState({
                messages: dataMsg.msgs,
            }, () => {
                this.messageComponent.cache.clearAll();
                this.messageComponent.list.recomputeRowHeights();
                this.messageComponent.forceUpdate(() => {
                    this.isLoading = false;
                });
            });
        }).catch(() => {
            this.isLoading = false;
        });
    }

    private modifyMessages(defaultMessages: IMessage[], messages: IMessage[], push: boolean): { maxId: number, msgs: IMessage[] } {
        let maxId = 0;
        messages.forEach((msg, key) => {
            if (msg.id && msg.id > maxId) {
                maxId = msg.id;
            }
            msg.type = C_MESSAGE_TYPE.Normal;
            if (push) {
                msg.avatar = (key > 0 && msg.senderid !== messages[key - 1].senderid) || (key === 0);
                if (key === 0 || (key > 0 && !TimeUtililty.isInSameDay(msg.createdon, messages[key - 1].createdon))) {
                    defaultMessages.push({
                        _id: msg._id,
                        createdon: msg.createdon,
                        id: msg.id,
                        senderid: msg.senderid,
                        type: C_MESSAGE_TYPE.Date,
                    });
                }
                defaultMessages.push(msg);
            }

            if (!push) {
                if (key === 0 && defaultMessages[0].type === C_MESSAGE_TYPE.Date) {
                    if (TimeUtililty.isInSameDay(msg.createdon, defaultMessages[0].createdon)) {
                        defaultMessages.splice(0, 1);
                    }
                }
                if (key === 0 && defaultMessages[0].type === C_MESSAGE_TYPE.Normal && defaultMessages[1].senderid === msg.senderid) {
                    defaultMessages[0].avatar = false;
                }
                defaultMessages[0].avatar = (msg.senderid !== defaultMessages[0].senderid);
                msg.avatar = (messages.length - 1 === key);
                defaultMessages.unshift(msg);
                if (messages.length - 1 === key || !TimeUtililty.isInSameDay(msg.createdon, defaultMessages[0].createdon)) {
                    defaultMessages.unshift({
                        _id: msg._id,
                        createdon: msg.createdon,
                        id: msg.id,
                        senderid: msg.senderid,
                        type: C_MESSAGE_TYPE.Date,
                    });
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
                _id: String(id),
                body: text,
                createdon: Math.floor(Date.now() / 1000),
                id,
                me: true,
                peerid: this.state.selectedDialogId,
                senderid: this.connInfo.UserID,
            };

            let replyTo;
            if (param && param.mode === C_MSG_MODE.Reply) {
                message.replyto = param.message.id;
                replyTo = param.message.id;
            }

            this.pushMessage(message);

            this.sdk.sendMessage(text, peer, replyTo).then((msg) => {
                this.messageRepo.remove(message._id || '').catch(() => {
                    //
                });
                message.id = msg.messageid;
                message._id = String(msg.messageid);
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
                _id: message._id,
                createdon: message.createdon,
                id: message.id,
                senderid: message.senderid,
                type: C_MESSAGE_TYPE.Date,
            });
        }
        if (messages.length > 0 && message.senderid !== messages[messages.length - 1].senderid) {
            message.avatar = true;
        } else if (messages.length === 0) {
            message.avatar = true;
        }
        messages.push(message);
        this.setState({
            inputVal: '',
            messages,
        }, () => {
            setTimeout(() => {
                this.animateToEnd();
            }, 100);
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

    private onNewMessage = (phone: string, text: string) => {
        const contacts: PhoneContact.AsObject[] = [];
        contacts.push({
            clientid: String(UniqueId.getRandomId()),
            firstname: faker.name.firstName(),
            lastname: faker.name.lastName(),
            phone,
        });
        this.sdk.contactImport(true, contacts).then((data) => {
            data.usersList.forEach((user) => {
                this.userRepo.importBulk([user]);
                const peer = new InputPeer();
                peer.setType(PeerType.PEERUSER);
                if (user.accesshash) {
                    peer.setAccesshash(user.accesshash);
                }
                if (user.id) {
                    peer.setId(user.id);
                }
                const dialogs = this.state.dialogs;
                const dialog: IDialog = {
                    accesshash: user.accesshash,
                    last_update: Math.floor(Date.now() / 1000),
                    peerid: user.id,
                    peertype: PeerType.PEERUSER,
                    preview: text.substr(0, 64),
                    user_id: user.id,
                };
                dialogs.push(dialog);
                this.dialogsSortThrottle(dialogs);
                this.sdk.sendMessage(text, peer).then((msg) => {
                    window.console.log(msg);
                }).catch((err) => {
                    window.console.log(err);
                });
            });
        }).catch((err) => {
            window.console.log(err);
        });
    }

    private onTyping = (typing: boolean) => {
        const {peer} = this.state;
        if (peer === null) {
            return;
        }

        let action: TypingAction;
        if (typing) {
            action = TypingAction.TYPING;
        } else {
            action = TypingAction.CANCEL;
        }
        this.sdk.typing(peer, action).then((data) => {
            window.console.debug(data);
        }).catch((err) => {
            window.console.debug(err);
        });
    }

    private getPeerByDialogId(id: string): InputPeer | null {
        if (!this.dialogMap.hasOwnProperty(id)) {
            return null;
        }
        const index = this.dialogMap[id];
        const {dialogs} = this.state;
        const peer = new InputPeer();
        peer.setType(PeerType.PEERUSER);
        peer.setAccesshash(dialogs[index].accesshash || '0');
        peer.setId(dialogs[index].peerid || '');
        return peer;
    }

    private updateDialogs(msg: IMessage, accessHash: string) {
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
            if ((dialogs[index].topmessageid || 0) < (msg.id || 0)) {
                dialogs[index].topmessageid = msg.id;
                dialogs[index].preview = preview;
                dialogs[index].preview_me = previewMe;
                dialogs[index].last_update = msg.createdon;
                dialogs[index].peerid = id;
                dialogs[index].peertype = msg.peertype;
                toUpdateDialog = dialogs[index];
            }
        } else {
            const dialog: IDialog = {
                _id: String(msg.id),
                last_update: msg.createdon,
                peerid: id,
                peertype: msg.peertype,
                preview,
                preview_me: previewMe,
                topmessageid: msg.id,
                unreadcount: 0,
                user_id: msg.peerid,
            };
            if (accessHash !== '0') {
                dialog.accesshash = accessHash;
            }
            toUpdateDialog = dialog;
            dialogs.push(dialog);
        }

        this.dialogsSortThrottle(dialogs);
        if (toUpdateDialog) {
            this.dialogRepo.lazyUpsert([toUpdateDialog]);
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
        this.dialogMap = {};
        this.setState({
            dialogs: td,
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
            this.syncManager.applyUpdate(res).then((id) => {
                this.syncThemAll(id, limit);
            }).catch((err2) => {
                window.console.log(err2);
                this.setState({
                    isUpdating: false,
                });
                if (err2.code === -1) {
                    this.checkSync().then(() => {
                        this.setState({
                            isUpdating: true,
                        });
                    }).catch(() => {
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
        this.setState({
            isUpdating: true,
        });
        this.dialogRepo.getSnapshot({}).then((res) => {
            this.dialogsSortThrottle(res.dialogs);
            this.syncManager.setLastUpdateId(res.updateid || 0);
            this.setState({
                isUpdating: false,
            }, () => {
                if (res.dialogs.length > 0) {
                    this.startSyncing();
                }
            });
        }).catch(() => {
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

    private dialogDBUpdatedHandler = () => {
        this.dialogRepo.getManyCache({}).then((res) => {
            this.dialogsSortThrottle(res);
        });
    }

    private messageDBUpdatedHandler = (event: any) => {
        const data = event.detail;
        if (data.peerids && data.peerids.indexOf(this.state.selectedDialogId) > -1) {
            this.getMessagesByDialogId(this.state.selectedDialogId);
        }
    }

    private userDBUpdatedHandler = () => {
        window.console.log('User_DB_Updated');
    }

    private notify = (title: string, body: string) => {
        if (Notification.permission === 'granted') {
            const options = {
                body,
                icon: '/android-icon-192x192.png',
            };
            // @ts-ignore
            const notification = new Notification(title, options);
        }
    }

    private bottomBarSelectHandler = (item: string) => {
        switch (item) {
            case 'logout':
                this.logOutHandler();
                break;
            default:
                this.setState({
                    leftMenu: item,
                });
                break;
        }
    }

    private logOutHandler() {
        this.sdk.logout(this.connInfo.AuthID).then((res) => {
            this.sdk.resetConnInfo();
            this.mainRepo.destroyDB().then(() => {
                this.syncManager.setLastUpdateId(0);
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
            if ((dialog.readinboxmaxid || 0) < msgId || (dialog.unreadcount || 0) > 0) {
                this.sdk.setMessagesReadHistory(peer, msgId);
            }
        }
        this.readHistoryMaxId = null;
    }

    private messageContextMenuHandler = (cmd: string, message: IMessage) => {
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
}

export default Chat;