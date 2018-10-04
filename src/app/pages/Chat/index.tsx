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
import {trimStart, throttle} from 'lodash';
import SDK from '../../services/sdk/index';

import './style.css';
import NewMessage from "../../components/NewMessage";
import {InputPeer, PeerType, PhoneContact, TypingAction} from "../../services/sdk/messages/core.types_pb";
import {IConnInfo} from "../../services/sdk/interface";
import {IDialog} from "../../repository/dialog/interface";
import UpdateManager from '../../services/sdk/server/updateManager';
import {C_MSG} from '../../services/sdk/const';
import {UpdateNewMessage, UpdateUserTyping} from '../../services/sdk/messages/api.updates_pb';
import UserName from '../../components/UserName';

interface IProps {
    match?: any;
    location?: any;
    history?: any;
}

interface IState {
    anchorEl: any;
    dialogs: IDialog[];
    inputVal: string;
    messages: IMessage[];
    openNewMessage: boolean;
    rightMenu: boolean;
    selectedDialogId: number;
    toggleAttachment: boolean;
    isTyping: boolean;
}

class Chat extends React.Component<IProps, IState> {
    private rightMenu: any = null;
    private message: any = null;
    // private idToIndex: any = {};
    private messageRepo: MessageRepo;
    private dialogRepo: DialogRepo;
    private isLoading: boolean = false;
    private sdk: SDK;
    private updateManager: UpdateManager;
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
            isTyping: false,
            messages: [],
            openNewMessage: false,
            rightMenu: false,
            selectedDialogId: props.match.params.id === 'null' ? -1 : props.match.params.id,
            toggleAttachment: false,
        };
        this.messageRepo = new MessageRepo();
        this.dialogRepo = new DialogRepo();
        // this.uniqueId = UniqueId.getInstance();
        this.sdk = SDK.getInstance();
        this.connInfo = this.sdk.getConnInfo();
        this.updateManager = UpdateManager.getInstance();
        this.dialogsSortThrottle = throttle(this.dialogsSort, 500);
        // setInterval(() => {
        //     const messages = this.state.messages;
        //     const message: IMessage = {
        //         _id: this.uniqueId.getId('msg', 'msg_'),
        //         avatar: undefined,
        //         conversation_id: this.state.selectedDialogId,
        //         me: false,
        //         message: faker.lorem.words(15),
        //         timestamp: new Date().getTime(),
        //     };
        //     if (messages.length > 0) {
        //         if (!message.me && messages[messages.length-1].me !== message.me) {
        //             message.avatar = faker.image.avatar();
        //         }
        //     } else {
        //         message.avatar = faker.image.avatar();
        //     }
        //     messages.push(message);
        //     this.setState({
        //         messages,
        //     }, () => {
        //         setTimeout(() => {
        //             this.animateToEnd();
        //         }, 50);
        //     });
        //     this.messageRepo.create(message);
        // }, 3000);
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

    public componentDidMount() {
        if (this.connInfo.AuthID === '0') {
            this.props.history.push('/signup');
        }
        window.addEventListener('wasmInit', () => {
            this.dialogRepo.getMany({limit: 100}).then((res) => {
                this.setState({
                    dialogs: res
                });
            }).catch((err) => {
                window.console.log(err);
            });
        });

        window.addEventListener('wsOpen', () => {
            this.sdk.recall(0).then((data) => {
                window.console.log(data);
            }).catch((err) => {
                window.console.log(err);
            });
        });

        this.dialogRepo.getManyCache({}).then((res) => {
            res.forEach((dialog, index) => {
                this.dialogMap[dialog.peerid || 0] = index;
            });

            this.setState({
                dialogs: res
            }, () => {
                const selectedId = this.props.match.params.id;
                if (selectedId !== 'null') {
                    this.getMessagesByDialogId(parseInt(selectedId, 10), true);
                }
            });
        });

        // this.dialogRepo.getMany({limit: 100}).then((dialogs) => {
        //     dialogs.forEach((dialog, index) => {
        //         this.dialogMap[dialog.peerid || 0] = index;
        //     });
        //     this.setState({
        //         dialogs,
        //     });
        // }).catch((err) => {
        //     window.console.log(err);
        // });

        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateNewMessage, (data: UpdateNewMessage.AsObject) => {
            window.console.log(data);
            const message: IMessage = data.message;
            message._id = String(message.id);
            message.me = (this.connInfo.UserID === message.senderid);
            this.pushMessage(message);
            this.messageRepo.importBulk([data.message]);
            this.updateDialogs(data.message, data.accesshash || 0);
        }));

        this.eventReferences.push(this.updateManager.listen(C_MSG.UpdateUserTyping, (data: UpdateUserTyping.AsObject) => {
            const isTyping = data.userid === this.state.selectedDialogId && data.action === TypingAction.TYPING;
            window.console.log(isTyping);
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
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {anchorEl, isTyping} = this.state;
        const open = Boolean(anchorEl);
        return (
            <div className="wrapper">
                <div className="container">
                    <div className="column-left">
                        <div className="top">
                            <span className="new-message" onClick={this.onNewMessageOpen}>New message</span>
                        </div>
                        <Dialog items={this.state.dialogs} selectedId={this.state.selectedDialogId}/>
                    </div>
                    {this.state.selectedDialogId !== -1 && <div className="column-center">
                        <div className="top">
                            {!isTyping &&
                            <span>To: <UserName id={this.state.selectedDialogId} className="name"/></span>}
                            {isTyping && <span>isTyping...</span>}
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
                                    onClick={this.handleClick}
                                >
                                    <MoreVertIcon/>
                                </IconButton>
                                <Menu
                                    id="long-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={this.handleClose}
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
                            />
                        </div>
                        <div className="attachments" hidden={!this.state.toggleAttachment}>
                            <Uploader/>
                        </div>
                        {!this.state.toggleAttachment &&
                        <TextInput onMessage={this.onMessage} onTyping={this.onTyping} userId={this.connInfo.UserID}/>}
                    </div>}
                    {this.state.selectedDialogId === -1 && <div className="column-center">
                        <div className="start-messaging">
                            <div className="start-messaging-header"/>
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
        );
    }

    private handleClick = (event: any) => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    }

    private handleClose = () => {
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
                }, 50);
            });
        }, 200);
    }

    private rightMenuRefHandler = (value: any) => {
        this.rightMenu = value;
    }

    private messageRefHandler = (value: any) => {
        this.message = value;
    }

    // private getMany(conversationId: string): IMessage[] {
    //     const messages: IMessage[] = [];
    //     for (let i = 0; i < 100; i++) {
    //         const me = faker.random.boolean();
    //         if (messages.length > 0) {
    //             if (!messages[0].me && messages[0].me !== me) {
    //                 messages[0].avatar = faker.image.avatar();
    //             }
    //         }
    //         messages.unshift({
    //             _id: this.uniqueId.getId('msg', 'msg_'),
    //             avatar: undefined,
    //             conversation_id: conversationId,
    //             me,
    //             message: faker.lorem.words(15),
    //             timestamp: new Date().getTime(),
    //         });
    //     }
    //     return messages;
    // }

    // private getName = (id: number) => {
    //     if (this.idToIndex.hasOwnProperty(id)) {
    //         return this.state.dialogs[this.idToIndex[id]]._id;
    //     }
    //     return '';
    // }

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

    //
    // private createFakeMessage(conversationId: string) {
    //     const messages = this.getMany(conversationId);
    //     this.messageRepo.createMany(messages).then((data: any) => {
    //         window.console.log('new', data);
    //     }).catch((err: any) => {
    //         window.console.log('new', err);
    //     });
    //     return messages;
    // }

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
                }, 50);
            });
        };

        this.messageRepo.getMany({peer, limit: 20}).then((data) => {
            window.console.log(data);
            if (data.length === 0) {
                // messages = this.createFakeMessage(dialogId);
                messages = [];
            } else {
                messages = data.reverse();
            }
            messages = messages.map((msg, key) => {
                if (msg.senderid === this.connInfo.UserID) {
                    msg.me = true;
                }
                if (key > 0 && msg.me !== messages[key - 1].me) {
                    msg.avatar = true;
                }
                return msg;
            });
            this.setState({
                messages,
                selectedDialogId: dialogId,
            }, () => {
                if (force === true) {
                    updateState();
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
        this.messageRepo.getMany({
            before: this.state.messages[0].id,
            conversationId: this.state.selectedDialogId
        }).then((data) => {
            if (data.length === 0) {
                return;
            }
            const messages = this.state.messages;
            messages.unshift.apply(messages, data.reverse());
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

        const message: IMessage = {
            _id: String(UniqueId.getRandomId()),
            body: text,
            createdon: new Date().getTime(),
            me: true,
            peerid: this.state.selectedDialogId,
            senderid: this.connInfo.UserID,
        };
        this.pushMessage(message);

        this.sdk.sendMessage(text, peer).then((msg) => {
            this.messageRepo.remove(message._id || '');
            message.id = msg.messageid;
            this.messageRepo.importBulk([message]);
            this.updateDialogs(msg, 0);
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
            }, 50);
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

        this.dialogsSort(dialogs);

        if (accessHash > -1) {
            this.dialogRepo.importBulk([toUpdateDialog]);
        }
    }

    private dialogsSort(dialogs: IDialog[]) {
        dialogs.sort((i1, i2) => {
            if (!i1.last_update || !i2.last_update) {
                return 0;
            }
            return i2.last_update - i1.last_update;
        });
        dialogs.forEach((d, i) => {
            this.dialogMap[d.peerid || 0] = i;
        });
        this.setState({
            dialogs,
        });
    }
}

export default Chat;