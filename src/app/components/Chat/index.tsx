import * as React from 'react';
import Textarea from 'react-textarea-autosize';
import People from './../People';
import Conversation from './../Conversation'
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import * as faker from 'faker';

import './style.css';

interface IProps {
    match?: any;
    location?: any;
}

interface IState {
    anchorEl: any;
    conversation: any[];
    people: any[];
    rightMenu: boolean;
    selectedConversationId: string;
    inputVal: string;
}

class Chat extends React.Component<IProps, IState> {
    private rightMenu: any = null;
    private conversation: any = null;
    private idToIndex: any = {};
    private store: any = {};

    constructor(props: IProps) {
        super(props);
        this.state = {
            anchorEl: null,
            conversation: [],
            inputVal: '',
            people: [],
            rightMenu: false,
            selectedConversationId: props.match.params.id,
        };
    }

    public componentWillReceiveProps(newProps: IProps) {
        const selectedId = newProps.match.params.id;
        let conversation: any[];
        if (!this.store.hasOwnProperty(selectedId)) {
            conversation = this.getConversation();
        } else {
            conversation = this.store[selectedId];
        }
        this.setState({
            conversation,
            selectedConversationId: newProps.match.params.id,
        }, () => {
            this.conversation.cache.clearAll();
            this.conversation.list.recomputeRowHeights();
            this.conversation.forceUpdate(() => {
                setTimeout(() => {
                    this.conversation.list.scrollToRow(conversation.length - 1);
                }, 50);
            });
        });
    }

    public componentDidMount() {
        const selectedId = this.props.match.params.id;
        const people = [];
        for (let i = 0; i < 3000; i++) {
            const id = i + 1000;
            people.push({
                date: '10:23 PM',
                id,
                image: faker.image.avatar(),
                message: faker.lorem.lines(),
                name: faker.name.findName(),
            });
            this.idToIndex[String(id)] = i;
        }
        const conversation = this.getConversation();
        this.store[selectedId] = conversation;
        this.setState({
            conversation,
            people,
            selectedConversationId: selectedId,
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
                            <span className="new-message">New message</span>
                        </div>
                        <People items={this.state.people}/>
                    </div>
                    <div className="column-center">
                        <div className="top">
                            <span>To: <span
                                className="name">{this.getName(this.state.selectedConversationId)}</span></span>
                            <span className="buttons">
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
                        <div className="conversation">
                            <Conversation ref={this.conversationRefHandler}
                                          items={this.state.conversation}/>
                        </div>
                        <div className="write">
                            <div className="user">
                                <span className="user-avatar"/>
                            </div>
                            <div className="input">
                                <Textarea maxRows={5}
                                          placeholder="Type your message here..."
                                          onKeyUp={this.sendMessage}
                                          onKeyDown={this.inputKeyDown}
                                />
                                <div className="write-link">
                                    <a href="javascript:;" className="attach"/>
                                    <a href="javascript:;" className="smiley"/>
                                    <a href="javascript:;" className="send"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div ref={this.rightMenuRefHandler} className="column-right"/>
                </div>
            </div>
        );
    }

    private handleClick = (event: any) => {
        this.setState({
            anchorEl: event.currentTarget,
        });
    };

    private handleClose = () => {
        this.setState({
            anchorEl: null,
        });
    };

    private toggleRightMenu = () => {
        this.setState({
            anchorEl: null,
        });
        this.rightMenu.classList.toggle('active');
        setTimeout(() => {
            this.conversation.cache.clearAll();
            this.conversation.list.recomputeRowHeights();
            this.conversation.forceUpdate(() => {
                setTimeout(() => {
                    this.conversation.list.scrollToRow(this.state.conversation.length - 1);
                }, 50);
            });
        }, 200);
    };

    private rightMenuRefHandler = (value: any) => {
        this.rightMenu = value;
    };

    private conversationRefHandler = (value: any) => {
        this.conversation = value;
    };

    private getConversation() {
        const conversation: any[] = [];
        for (let i = 0; i < 1000; i++) {
            const me = faker.random.boolean();
            if (conversation.length > 0) {
                if (conversation[0].me !== me) {
                    conversation[0].avatar = faker.image.avatar();
                }
            }
            conversation.unshift({
                avatar: false,
                date: '10:23 PM',
                me,
                message: faker.lorem.words(15),
            });
        }
        return conversation
    }

    private getName = (id: string) => {
        if (this.idToIndex.hasOwnProperty(id)) {
            return this.state.people[this.idToIndex[id]].name;
        }
        return '';
    };

    private sendMessage = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const conversation = this.state.conversation;
            conversation.push({
                avatar: false,
                date: '10:23 PM',
                me: true,
                message: e.target.value,
            });
            e.target.value = '';
            this.setState({
                conversation,
                inputVal: '',
            }, () => {
                setTimeout(() => {
                    this.animateToEnd();
                    this.conversation.list.recomputeRowHeights();
                }, 50);
            });
        } else {
            this.setState({
                inputVal: e.target.value,
            });
        }
    };

    private inputKeyDown = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
        }
    };

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
}

export default Chat;