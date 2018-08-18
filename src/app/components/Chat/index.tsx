import * as React from 'react';
import './style.css';

interface IProps {
    items: any;
}

interface IState {
    items: any;
}

class Chat extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: props.items,
        };
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            items: newProps.items,
        });
    }

    public componentDidMount() {
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
                        <ul className="people">
                            <li className="person" data-chat="person1">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/382994/thomas.jpg" alt=""/>
                                <span className="name">Thomas Bangalter</span>
                                <span className="time">2:09 PM</span>
                                <span className="preview">I was wondering...</span>
                            </li>
                            <li className="person active" data-chat="person2">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/382994/dog.png" alt=""/>
                                <span className="name">Dog Woofson</span>
                                <span className="time">1:44 PM</span>
                                <span className="preview">I've forgotten how it felt before</span>
                            </li>
                            <li className="person" data-chat="person3">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/382994/louis-ck.jpeg" alt=""/>
                                <span className="name">Louis CK</span>
                                <span className="time">2:09 PM</span>
                                <span className="preview">But we’re probably gonna need a new carpet.</span>
                            </li>
                            <li className="person" data-chat="person4">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/382994/bo-jackson.jpg" alt=""/>
                                <span className="name">Bo Jackson</span>
                                <span className="time">2:09 PM</span>
                                <span className="preview">It’s not that bad...</span>
                            </li>
                            <li className="person" data-chat="person5">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/382994/michael-jordan.jpg"
                                     alt=""/>
                                <span className="name">Michael Jordan</span>
                                <span className="time">2:09 PM</span>
                                <span className="preview">Wasup for the third time like is 
you blind bitch</span>
                            </li>
                            <li className="person" data-chat="person6">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/382994/drake.jpg" alt=""/>
                                <span className="name">Drake</span>
                                <span className="time">2:09 PM</span>
                                <span className="preview">howdoyoudoaspace</span>
                            </li>
                        </ul>
                    </div>
                    <div className="column-center">
                        <div className="top"><span>To: <span className="name">Dog Woofson</span></span></div>
                        <div className="chat" data-chat="person1">
                            <div className="conversation-start">
                                <span>Today, 6:48 AM</span>
                            </div>
                            <div className="bubble you">
                                Hello,
                            </div>
                            <div className="bubble you">
                                it's me.
                            </div>
                            <div className="bubble you">
                                I was wondering...
                            </div>
                        </div>
                        <div className="chat active-chat" data-chat="person2">
                            <div className="conversation-start">
                                <span>Today, 5:38 PM</span>
                            </div>
                            <div className="bubble you">
                                Hello, can you hear me?
                            </div>
                            <div className="bubble you">
                                I'm in California dreaming
                            </div>
                            <div className="bubble me">
                                ... about who we used to be.
                            </div>
                            <div className="bubble me">
                                Are you serious?
                            </div>
                            <div className="bubble you">
                                When we were younger and free...
                            </div>
                            <div className="bubble you">
                                I've forgotten how it felt before
                            </div>
                        </div>
                        <div className="chat" data-chat="person3">
                            <div className="conversation-start">
                                <span>Today, 3:38 AM</span>
                            </div>
                            <div className="bubble you">
                                Hey human!
                            </div>
                            <div className="bubble you">
                                Umm... Someone took a shit in the hallway.
                            </div>
                            <div className="bubble me">
                                ... what.
                            </div>
                            <div className="bubble me">
                                Are you serious?
                            </div>
                            <div className="bubble you">
                                I mean...
                            </div>
                            <div className="bubble you">
                                It’s not that bad...
                            </div>
                            <div className="bubble you">
                                But we’re probably gonna need a new carpet.
                            </div>
                        </div>
                        <div className="chat" data-chat="person4">
                            <div className="conversation-start">
                                <span>Yesterday, 4:20 PM</span>
                            </div>
                            <div className="bubble me">
                                Hey human!
                            </div>
                            <div className="bubble me">
                                Umm... Someone took a shit in the hallway.
                            </div>
                            <div className="bubble you">
                                ... what.
                            </div>
                            <div className="bubble you">
                                Are you serious?
                            </div>
                            <div className="bubble me">
                                I mean...
                            </div>
                            <div className="bubble me">
                                It’s not that bad...
                            </div>
                        </div>
                        <div className="chat" data-chat="person5">
                            <div className="conversation-start">
                                <span>Today, 6:28 AM</span>
                            </div>
                            <div className="bubble you">
                                Wasup
                            </div>
                            <div className="bubble you">
                                Wasup
                            </div>
                            <div className="bubble you">
                                Wasup for the third time like is <br/>you blind bitch
                            </div>

                        </div>
                        <div className="chat" data-chat="person6">
                            <div className="conversation-start">
                                <span>Monday, 1:27 PM</span>
                            </div>
                            <div className="bubble you">
                                So, how's your new phone?
                            </div>
                            <div className="bubble you">
                                You finally have a smartphone :D
                            </div>
                            <div className="bubble me">
                                Drake?
                            </div>
                            <div className="bubble me">
                                Why aren't you answering?
                            </div>
                            <div className="bubble you">
                                howdoyoudoaspace
                            </div>
                        </div>
                        <div className="write">
                            <a href="javascript:;" className="write-link attach"/>
                            <input type="text"/>
                            <a href="javascript:;" className="write-link smiley"/>
                            <a href="javascript:;" className="write-link send"/>
                        </div>
                    </div>
                    <div className="column-right"/>
                </div>
            </div>
        );
    }
}

export default Chat;