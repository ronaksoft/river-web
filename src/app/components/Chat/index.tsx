import * as React from 'react';
import Textarea from 'react-textarea-autosize';
import People from './../People';
import Conversation from './../Conversation'
import * as faker from  'faker';

import './style.css';

interface IProps {
    items: any;
}

interface IState {
    conversation: any[];
    items: any;
    people: any[];
}

class Chat extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            conversation: [],
            items: props.items,
            people: [],
        };
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            items: newProps.items,
        });
    }

    public componentDidMount() {
        const people = [];
        for (let i = 0; i < 3000; i++) {
            people.push({
                date: '10:23 PM',
                image: faker.image.avatar(),
                message: faker.lorem.lines(),
                name: faker.name.findName(),
            });
        }
        const conversation: any[] = [];
        for (let i = 0; i < 1000; i++) {
            const me = faker.random.boolean();
            let avatar = false;
            if (conversation.length > 0) {
                if (conversation[conversation.length-1].me !== me) {
                    avatar = true;
                }
            }
            conversation.unshift({
                avatar,
                date: '10:23 PM',
                me,
                message: faker.lorem.lines(3),
            });
        }
        window.console.log(conversation);
        this.setState({
            conversation,
            people,
        });
        // window.document.querySelector('.chat[data-chat=person2]').classList.add('active-chat');
        // window.document.querySelector('.person[data-chat=person2]').classList.add('active');
        //
        // const friends = {
        //     list: document.querySelector('ul.people'),
        //     all: document.querySelectorAll('.left .person'),
        //     name: ''
        // };
        //
        // const chat = {
        //     container: document.querySelector('.container .right'),
        //     current: null,
        //     person: null,
        //     name: document.querySelector('.container .right .top .name')
        // };
        //
        //
        // friends.all.forEach(function (f) {
        //     f.addEventListener('mousedown', function () {
        //         f.classList.contains('active') || setActiveChat(f);
        //     });
        // });
        //
        // const setActiveChat = (f: any) => {
        //     friends.list.querySelector('.active').classList.remove('active');
        //     f.classList.add('active');
        //     chat.current = chat.container.querySelector('.active-chat');
        //     chat.person = f.getAttribute('data-chat');
        //     chat.current.classList.remove('active-chat');
        //     chat.container.querySelector('[data-chat="' + chat.person + '"]').classList.add('active-chat');
        //     friends.name = f.querySelector('.name').innerText;
        //     chat.name.innerHTML = friends.name;
        // }
    }

    public render() {
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
                        <div className="top"><span>To: <span className="name">Dog Woofson</span></span></div>
                        <div className="conversation">
                            <Conversation items={this.state.conversation}/>
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
                    <div className="column-right"/>
                </div>
            </div>
        );
    }
}

export default Chat;