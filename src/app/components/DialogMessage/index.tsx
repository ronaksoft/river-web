import * as React from 'react';

import 'emoji-mart/css/emoji-mart.css';
import './style.css';
import {IUser} from "../../repository/user/interface";
import {IMessage} from "../../repository/message/interface";
import MessageRepo from "../../repository/message";

interface IProps {
    messageId: number;
}

interface IState {
    user?: IUser;
    messageId: number;
    message?: IMessage;
}

class DialogMessage extends React.Component<IProps, IState> {
    private messageRepo: MessageRepo;

    constructor(props: IProps) {
        super(props);

        this.state = {
            messageId: props.messageId,
        };

        this.messageRepo = new MessageRepo();
        this.getMessage();
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            messageId: newProps.messageId,
        }, () => {
            this.getMessage();
        });
    }

    public render() {
        const {user, message} = this.state;
        return (
            <div className="dialog-wrapper">
                {user && <img src={user.avatar} alt=""/>}
                {user && <span className="name">{user.avatar}</span>}
                {message && <span className="time">{message.createdon}</span>}
                {message && <span className="preview">{message.body}</span>}
            </div>
        );
    }

    private getMessage() {
        this.messageRepo.getMessage(this.state.messageId).then((message) => {
            this.setState({
                message,
            });
        });
    }
}

export default DialogMessage;