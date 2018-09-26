import * as React from 'react';
import People from '../../components/People/index';
import {IMessage} from '../../repository/message/interface';
import Message from '../../components/Message/index';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {MoreVert as MoreVertIcon, Attachment} from '@material-ui/icons';
import * as faker from 'faker';
import MessageRepo from '../../repository/message/index';
import UniqueId from '../../services/uniqueId/index';
import Uploader from '../../components/Uploader/index';
import TextInput from '../../components/TextInput/index';
import {trimStart} from 'lodash';
import SDK from '../../services/sdk/index';

import './style.css';
import NewMessage from "../../components/NewMessage";
import {PhoneContact} from "../../services/sdk/messages/core.types_pb";

interface IProps {
    match?: any;
    location?: any;
}

interface IState {
    anchorEl: any;
    conversations: any[];
    inputVal: string;
    messages: IMessage[];
    openNewMessage: boolean;
    rightMenu: boolean;
    selectedConversationId: string;
    toggleAttachment: boolean;
}

class Chat extends React.Component<IProps, IState> {
    private rightMenu: any = null;
    private message: any = null;
    private idToIndex: any = {};
    private messageRepo: MessageRepo;
    private uniqueId: UniqueId;
    private isLoading: boolean = false;
    private sdk: SDK;

    constructor(props: IProps) {
        super(props);
        this.state = {
            anchorEl: null,
            conversations: [],
            inputVal: '',
            messages: [],
            openNewMessage: false,
            rightMenu: false,
            selectedConversationId: props.match.params.id,
            toggleAttachment: false,
        };
        this.messageRepo = new MessageRepo();
        this.uniqueId = UniqueId.getInstance();
        this.sdk = SDK.getInstance();

        // setInterval(() => {
        //     const messages = this.state.messages;
        //     const message: IMessage = {
        //         _id: this.uniqueId.getId('msg', 'msg_'),
        //         avatar: undefined,
        //         conversation_id: this.state.selectedConversationId,
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
        //     this.messageRepo.createMessage(message);
        // }, 3000);
    }

    public componentWillReceiveProps(newProps: IProps) {
        const selectedId = newProps.match.params.id;
        this.getMessageByConversationId(selectedId, true);
    }

    public componentDidMount() {
        const selectedId = this.props.match.params.id;
        const conversations: any[] = [];
        for (let i = 0; i < 3000; i++) {
            const id = String(i + 1000);
            conversations.push({
                date: '10:23 PM',
                id,
                image: faker.image.avatar(),
                message: faker.lorem.lines(),
                name: faker.name.findName(),
            });
            this.idToIndex[String(id)] = i;
        }
        this.getMessageByConversationId(selectedId);
        this.setState({
            conversations,
        });
        window.addEventListener('wasm_init', () => {
            const info = this.sdk.getConnInfo();
            if (info && info.UserID) {
                this.sdk.recall(info.UserID).then((data) => {
                    window.console.log(data);
                });
            }
        });
    }

    public render() {
        const {anchorEl} = this.state;
        const open = Boolean(anchorEl);
        return (
            <div className="wrapper">
                <div className="container">
                    <div className="column-left">
                        <div className="top">
                            <span className="new-message" onClick={this.onNewMessageOpen}>New message</span>
                        </div>
                        <People items={this.state.conversations} selectedId={this.state.selectedConversationId}/>
                    </div>
                    <div className="column-center">
                        <div className="top">
                            <span>To: <span
                                className="name">{this.getName(this.state.selectedConversationId)}</span></span>
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
                        {!this.state.toggleAttachment && <TextInput onMessage={this.onMessage}/>}
                    </div>
                    <div ref={this.rightMenuRefHandler} className="column-right"/>
                </div>
                <NewMessage open={this.state.openNewMessage} onClose={this.onNewMessageClose} onMessage={this.onNewMessage}/>
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

    // private getMessages(conversationId: string): IMessage[] {
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

    private getName = (id: string) => {
        if (this.idToIndex.hasOwnProperty(id)) {
            return this.state.conversations[this.idToIndex[id]].name;
        }
        return '';
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

    //
    // private createFakeMessage(conversationId: string) {
    //     const messages = this.getMessages(conversationId);
    //     this.messageRepo.createMessages(messages).then((data: any) => {
    //         window.console.log('new', data);
    //     }).catch((err: any) => {
    //         window.console.log('new', err);
    //     });
    //     return messages;
    // }

    private getMessageByConversationId(conversationId: string, force?: boolean) {
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

        this.messageRepo.getMessages({conversationId}).then((data) => {
            if (data.length === 0) {
                // messages = this.createFakeMessage(conversationId);
                messages = [];
            } else {
                messages = data.reverse();
            }
            this.setState({
                messages,
                selectedConversationId: conversationId,
            }, () => {
                if (force === true) {
                    updateState();
                }
            });
        }).catch((err: any) => {
            window.console.warn(err);
            // messages = this.createFakeMessage(conversationId);
            this.setState({
                messages,
                selectedConversationId: conversationId,
            }, () => {
                if (force === true) {
                    updateState();
                }
            });
        });
    }

    private onMessageScroll = () => {
        if (this.isLoading) {
            return;
        }
        this.messageRepo.getMessages({
            before: this.state.messages[0].timestamp,
            conversationId: this.state.selectedConversationId
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
        const messages = this.state.messages;
        const message: IMessage = {
            _id: this.uniqueId.getId('msg', 'msg_'),
            avatar: undefined,
            conversation_id: this.state.selectedConversationId,
            me: true,
            message: text,
            timestamp: new Date().getTime(),
        };
        messages.push(message);
        this.setState({
            inputVal: '',
            messages,
        }, () => {
            setTimeout(() => {
                this.animateToEnd();
            }, 50);
        });
        this.messageRepo.createMessage(message);
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
        window.console.log(phone, text);
        const contacts: PhoneContact.AsObject[] = [];
        this.sdk.contactImport(true, contacts).then((data) => {
            window.console.log(data);
        });

    }
}

export default Chat;