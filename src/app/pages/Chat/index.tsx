import * as React from 'react';
import Dialog from '../../components/Dialog/index';
import {IMessage} from '../../repository/message/interface';
import Message from '../../components/Message/index';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {Attachment, MoreVert as MoreVertIcon, /*Settings,*/ ExitToApp} from '@material-ui/icons';
import * as faker from 'faker';
import MessageRepo from '../../repository/message/index';
import DialogRepo from '../../repository/dialog/index';
import UniqueId from '../../services/uniqueId/index';
import Uploader from '../../components/Uploader/index';
import TextInput from '../../components/TextInput/index';
import {trimStart, throttle} from 'lodash';
import SDK from '../../services/sdk/index';

import './style.css';
import NewMessage from "../../components/NewMessage";
import {InputPeer, PeerType, PhoneContact, TypingAction} from "../../services/sdk/messages/core.types_pb";
import {IConnInfo} from "../../services/sdk/interface";
import {IDialog} from "../../repository/dialog/interface";
import UpdateManager from '../../services/sdk/server/updateManager';
import {C_MSG} from '../../services/sdk/const';
import {
    UpdateNewMessage,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox,
    UpdateUserTyping
} from '../../services/sdk/messages/api.updates_pb';
import UserName from '../../components/UserName';
import SyncManager from '../../services/sdk/syncManager';
import UserRepo from '../../repository/user';
import RiverLogo from '../../components/RiverLogo';
import MainRepo from "../../repository";

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
    isUpdating: boolean;
    maxReadId: number;
    messages: IMessage[];
    openNewMessage: boolean;
    rightMenu: boolean;
    selectedDialogId: number;
    toggleAttachment: boolean;
}

class Chat extends React.Component<IProps, IState> {
    private isInChat: boolean = true;
    private rightMenu: any = null;
    private message: any = null;
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
    private dialogMap: { [key: number]: number } = {};
    private typingTimeout: any = null;
    private dialogsSortThrottle: any = null;

    constructor(props: IProps) {
        super(props);
        this.state = {
            anchorEl: null,
            dialogs: [],
            inputVal: '',
            isConnecting: true,
            isTyping: false,
            isUpdating: false,
            maxReadId: 0,
            messages: [],
            openNewMessage: false,
            rightMenu: false,
            selectedDialogId: props.match.params.id === 'null' ? -1 : props.match.params.id,
            toggleAttachment: false,
        };
        this.sdk = SDK.getInstance();
        this.sdk.loadConnInfo();
        this.connInfo = this.sdk.getConnInfo();
        this.messageRepo = new MessageRepo();
        this.userRepo = UserRepo.getInstance();
        this.dialogRepo = DialogRepo.getInstance();
        this.mainRepo = MainRepo.getInstance();
        // this.uniqueId = UniqueId.getInstance();
        this.updateManager = UpdateManager.getInstance();
        this.syncManager = SyncManager.getInstance();
        this.dialogsSortThrottle = throttle(this.dialogsSort, 500);
    }

    public componentDidMount() {
        if (this.connInfo.AuthID === '0' || this.connInfo.UserID === 0) {
            this.props.history.push('/signup');
            return;
        }

        window.addEventListener('focus', this.windowFocusHandler);
        window.addEventListener('blur', this.windowBlurHandler);
        window.addEventListener('wasmInit', this.wasmInitHandler);
        window.addEventListener('wsOpen', this.wsOpenHandler);
        window.addEventListener('wsClose', this.wsCloseHandler);
        window.addEventListener('fnStarted', this.fnStartedHandler);
        window.addEventListener('Dialog_DB_Updated', this.dialogDBUpdatedHandler);
        window.addEventListener('Message_DB_Updated', this.messageDBUpdatedHandler);
        window.addEventListener('User_DB_Updated', this.userDBUpdatedHandler);

        this.dialogRepo.getManyCache({}).then((res) => {
            res.forEach((dialog, index) => {
                this.dialogMap[dialog.peerid || 0] = index;
            });

            window.console.log(res);

            this.setState({
                dialogs: res
            }, () => {
                const selectedId = this.props.match.params.id;
                if (selectedId !== 'null') {
                    this.getMessagesByDialogId(parseInt(selectedId, 10), true);
                }
            });

            this.isLoading = false;
        }).catch(() => {
            this.isLoading = false;
        });

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

        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateNewMessage, (data: UpdateNewMessage.AsObject) => {
            if (this.state.isUpdating) {
                return;
            }
            const message: IMessage = data.message;
            message._id = String(message.id);
            message.me = (this.connInfo.UserID === message.senderid);
            if (data.sender.id === this.state.selectedDialogId) {
                this.pushMessage(message);
                const peer = this.getPeerByDialogId(this.state.selectedDialogId);
                if (peer) {
                    this.sdk.setMessagesReadHistory(peer, data.message.id || 0);
                }
            }
            this.messageRepo.importBulk([data.message]);
            this.userRepo.importBulk([data.sender]);
            this.updateDialogs(data.message, data.accesshash || 0);
            if (!this.isInChat && data.message.senderid !== this.connInfo.UserID) {
                this.notify(
                    `Message from ${data.sender.firstname} ${data.sender.lastname}`,
                    (data.message.body || '').substr(0, 64));
            }
            if (data.message.senderid !== this.connInfo.UserID && data.message.peerid !== this.state.selectedDialogId) {
                this.updateDialogsCounter(data.message.peerid || 0, {unreadCounterIncrease: 1});
            }
        }));

        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateUserTyping, (data: UpdateUserTyping.AsObject) => {
            if (this.state.isUpdating) {
                return;
            }
            if (data.userid !== this.state.selectedDialogId) {
                return;
            }
            const isTyping = data.userid === this.state.selectedDialogId && data.action === TypingAction.TYPING;
            if (this.state.isTyping !== isTyping) {
                this.setState({
                    isTyping,
                });
            }
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                this.setState({
                    isTyping: false,
                });
            }, 5000);
        }));

        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateReadHistoryInbox, (data: UpdateReadHistoryInbox.AsObject) => {
            if (this.state.isUpdating) {
                return;
            }
            this.updateDialogsCounter(data.peer.id || 0, {maxInbox: data.maxid});
            if (data.peer.id !== this.state.selectedDialogId) {
                this.messageRepo.getUnreadCount(data.peer.id || 0, data.maxid || 0).then((res) => {
                    this.updateDialogsCounter(data.peer.id || 0, {unreadCounter: res});
                });
            } else {
                this.updateDialogsCounter(data.peer.id || 0, {unreadCounter: 0});
            }
        }));

        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateReadHistoryOutbox, (data: UpdateReadHistoryOutbox.AsObject) => {
            if (this.state.isUpdating) {
                return;
            }
            this.updateDialogsCounter(data.peer.id || 0, {maxOutbox: data.maxid});
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
                selectedDialogId: -1,
            });
        } else {
            this.getMessagesByDialogId(parseInt(selectedId, 10), true);
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
        const {anchorEl} = this.state;
        const open = Boolean(anchorEl);
        return (
            <div className="bg">
                <div className="wrapper">
                    <div className="container">
                        <div className="column-left">
                            <div className="top">
                                <span className="new-message" onClick={this.onNewMessageOpen}>
                                    <RiverLogo height={24} width={24}/>
                                    <span>New message</span>
                                </span>
                            </div>
                            <Dialog items={this.state.dialogs} selectedId={this.state.selectedDialogId}/>
                            <div className="setting">
                                {/*<a>
                                    <Settings/>
                                </a>*/}
                                <a onClick={this.logOutHandler}>
                                    <ExitToApp/>
                                </a>
                                <div className="version">
                                    v0.23.1
                                </div>
                            </div>
                        </div>
                        {this.state.selectedDialogId !== -1 && <div className="column-center">
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
                                <Message ref={this.messageRefHandler}
                                         items={this.state.messages}
                                         onLoadMore={this.onMessageScroll}
                                         readId={this.state.maxReadId}
                                />
                            </div>
                            <div className="attachments" hidden={!this.state.toggleAttachment}>
                                <Uploader/>
                            </div>
                            {!this.state.toggleAttachment &&
                            <TextInput onMessage={this.onMessage} onTyping={this.onTyping}
                                       userId={this.connInfo.UserID}/>}
                        </div>}
                        {this.state.selectedDialogId === -1 && <div className="column-center">
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
            this.message.cache.clearAll();
            this.message.list.recomputeRowHeights();
            this.message.forceUpdate(() => {
                setTimeout(() => {
                    this.message.list.scrollToRow(this.state.messages.length - 1);
                }, 100);
            });
        }, 200);
    }

    private rightMenuRefHandler = (value: any) => {
        this.rightMenu = value;
    }

    private messageRefHandler = (value: any) => {
        this.message = value;
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

    private getMessagesByDialogId(dialogId: number, force?: boolean) {
        const peer = this.getPeerByDialogId(dialogId);
        if (peer === null) {
            return;
        }

        let messages: IMessage[] = [];

        const updateState = () => {
            this.message.cache.clearAll();
            this.message.list.recomputeRowHeights();
            this.message.forceUpdate(() => {
                setTimeout(() => {
                    this.message.list.scrollToRow(messages.length - 1);
                }, 100);
            });
        };

        this.messageRepo.getMany({peer, limit: 20}).then((data) => {
            let maxId = 0;
            if (data.length === 0) {
                messages = [];
            } else {
                messages = data.reverse();
            }
            messages.map((msg, key) => {
                if (msg.id && msg.id > maxId) {
                    maxId = msg.id;
                }
                msg.avatar = (key > 0 && msg.senderid !== messages[key - 1].senderid || key === 0 && msg.senderid !== this.connInfo.UserID);
                return msg;
            });
            let maxReadId = 0;
            if (this.dialogMap.hasOwnProperty(dialogId)) {
                maxReadId = this.state.dialogs[this.dialogMap[dialogId]].readoutboxmaxid || 0;
            }
            this.setState({
                isTyping: false,
                maxReadId,
                messages,
                selectedDialogId: dialogId,
            }, () => {
                if (messages.length > 0) {
                    window.console.log('maxReadId', maxReadId, 'maxId', maxId);
                }
                if (force === true) {
                    updateState();
                }
                if (messages.length > 0) {
                    this.sdk.setMessagesReadHistory(peer, maxId);
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
        const peer = this.getPeerByDialogId(this.state.selectedDialogId);
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
            messages.unshift.apply(messages, data.reverse());
            messages.map((msg, key) => {
                msg.avatar = (key > 0 && msg.senderid !== messages[key - 1].senderid || key === 0 && msg.senderid !== this.connInfo.UserID);
                return msg;
            });
            this.setState({
                messages,
            }, () => {
                this.message.cache.clearAll();
                this.message.list.recomputeRowHeights();
                this.message.forceUpdate(() => {
                    this.isLoading = false;
                });
            });
        }).catch(() => {
            this.isLoading = false;
        });
    }

    private onMessage = (text: string) => {
        if (trimStart(text).length === 0) {
            return;
        }

        const peer = this.getPeerByDialogId(this.state.selectedDialogId);
        if (peer === null) {
            return;
        }

        const id = -UniqueId.getRandomId();
        const message: IMessage = {
            _id: String(id),
            body: text,
            createdon: Date.now() / 1000,
            id,
            me: true,
            peerid: this.state.selectedDialogId,
            senderid: this.connInfo.UserID,
        };
        this.pushMessage(message);

        this.sdk.sendMessage(text, peer).then((msg) => {
            this.messageRepo.remove(message._id || '');
            message.id = msg.messageid;
            this.messageRepo.importBulk([message]);
            this.updateDialogs(message, 0);
        }).catch((err) => {
            window.console.log(err);
        });
    }

    private pushMessage = (message: IMessage) => {
        const messages = this.state.messages;
        if (messages.length > 0 && message.me !== messages[messages.length - 1].me) {
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
        this.messageRepo.create(message);
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
            clientid: UniqueId.getRandomId(),
            firstname: faker.name.firstName(),
            lastname: faker.name.lastName(),
            phone,
        });
        this.sdk.contactImport(true, contacts).then((data) => {
            data.usersList.forEach((user) => {
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
                    last_update: Date.now() / 1000,
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
        const peer = this.getPeerByDialogId(this.state.selectedDialogId);
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

    private getPeerByDialogId(id: number): InputPeer | null {
        if (!this.dialogMap.hasOwnProperty(id)) {
            return null;
        }
        const index = this.dialogMap[id];
        const {dialogs} = this.state;
        const peer = new InputPeer();
        peer.setType(PeerType.PEERUSER);
        peer.setAccesshash(dialogs[index].accesshash || 0);
        peer.setId(dialogs[index].peerid || 0);
        return peer;
    }

    private updateDialogs(msg: IMessage, accessHash: number) {
        const id = msg.peerid || 0;
        const {dialogs} = this.state;
        const preview = (msg.body || '').substr(0, 64);
        let toUpdateDialog: IDialog;
        if (this.dialogMap.hasOwnProperty(id)) {
            const index = this.dialogMap[id];
            dialogs[index].topmessageid = msg.id;
            dialogs[index].preview = preview;
            dialogs[index].last_update = msg.createdon;
            toUpdateDialog = dialogs[index];
        } else {
            const dialog: IDialog = {
                _id: String(msg.id),
                accesshash: accessHash,
                last_update: msg.createdon,
                peerid: msg.peerid,
                peertype: msg.peertype,
                preview,
                topmessageid: msg.id,
                unreadcount: 0,
                user_id: msg.peerid,
            };
            toUpdateDialog = dialog;
            dialogs.push(dialog);
        }

        this.dialogsSortThrottle(dialogs);

        if (accessHash > -1) {
            this.dialogRepo.lazyUpsert([toUpdateDialog]);
        }
    }

    private updateDialogsCounter(peerid: number, {maxInbox, maxOutbox, unreadCounter, unreadCounterIncrease}: any) {
        const {dialogs} = this.state;
        if (this.dialogMap.hasOwnProperty(peerid)) {
            const index = this.dialogMap[peerid];
            if (maxInbox && dialogs[index].readinboxmaxid && maxInbox > (dialogs[index].readinboxmaxid || 0)) {
                dialogs[index].readinboxmaxid = maxInbox;
            }
            if (maxOutbox && dialogs[index].readoutboxmaxid && maxOutbox > (dialogs[index].readoutboxmaxid || 0)) {
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
        this.dialogMap = {};
        this.setState({
            dialogs,
        }, () => {
            dialogs.forEach((d, i) => {
                this.dialogMap[d.peerid || 0] = i;
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
        this.sdk.recall(0).then(() => {
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
        }
        // Normal syncing
        this.checkSync().then(() => {
            this.setState({
                isUpdating: true,
            });
        }).catch((err) => {
            window.console.log(err);
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
        window.console.log('Message_DB_Updated');
    }

    private notify = (title: string, body: string) => {
        if (Notification.permission === 'granted') {
            const options = {
                body,
                icon: '/android-icon-192x192.png',
            };
            const notification = new Notification(title, options);
            window.console.log(notification);
        }
    }

    private logOutHandler = () => {
        this.sdk.logout(this.connInfo.AuthID).then((res) => {
            window.console.log(res);
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
    }

    private windowBlurHandler = () => {
        this.isInChat = false;
    }
}

export default Chat;