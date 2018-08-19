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

// interface IProps {
// }

interface IState {
    anchorEl: any;
    conversation: any[];
    people: any[];
    rightMenu: boolean;
}

// const options = [
//     {
//         title: 'Contact Info',
//     },
//     {
//         title: 'Delete Conversation',
//         onClick: null,
//     },
//     {
//         title: 'Mute',
//     },
//     {
//         title: 'Media',
//     },
// ];

class Chat extends React.Component<{}, IState> {
    private rightMenu: any = null;
    private conversation: any = null;

    constructor(props: any) {
        super(props);

        this.state = {
            anchorEl: null,
            conversation: [],
            people: [],
            rightMenu: false,
        };
    }

    public componentDidMount() {
        const people = [];
        for (let i = 0; i < 3000; i++) {
            people.push({
                date: '10:23 PM',
                id: faker.random.number(1000000),
                image: faker.image.avatar(),
                message: faker.lorem.lines(),
                name: faker.name.findName(),
            });
        }
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
        this.setState({
            conversation,
            people,
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
                            <span>To: <span className="name">Dog Woofson</span></span>
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
                                    PaperProps={{
                                        style: {
                                            fontSize: '12px',
                                            transformOrigin: 'right top',
                                            width: 170,
                                        },
                                    }}
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
                            <Conversation ref={this.conversationRefHandler} items={this.state.conversation}/>
                        </div>
                        <div className="write">
                            <div className="user">
                                <span className="user-avatar"/>
                            </div>
                            <div className="input">
                                <Textarea maxRows={5} placeholder="Type your message here..."/>
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
           const instance =  this.conversation;
           instance.cache.clearAll();
           instance.list.recomputeRowHeights();
           instance.forceUpdate();
        }, 200);
    };

    private rightMenuRefHandler = (value: any) => {
        this.rightMenu = value;
    };

    private conversationRefHandler = (value: any) => {
        this.conversation = value;
    };
}

export default Chat;