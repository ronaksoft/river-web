import * as React from 'react';

import 'emoji-mart/css/emoji-mart.css';
import './style.css';
import {IUser} from "../../repository/user/interface";
import {IMessage} from "../../repository/message/interface";
import MessageRepo from "../../repository/message";
import TimeUtililty from "../../services/utilities/time";
import UserRepo from '../../repository/user';

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
    private userRepo: UserRepo;

    constructor(props: IProps) {
        super(props);

        this.state = {
            messageId: props.messageId,
        };

        this.messageRepo = new MessageRepo();
        this.userRepo = new UserRepo();
    }

    public componentDidMount() {
        this.getMessage();
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.messageId === newProps.messageId) {
            return;
        }
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
                {user && <span className="name">{user.firstname + ' ' + user.lastname}</span>}
                {message && <span className="time">{TimeUtililty.dynamic(message.createdon)}</span>}
                {message && <span className="preview">{message.body}</span>}
            </div>
        );
    }

    private getMessage() {
        this.messageRepo.get(this.state.messageId).then((message) => {
            this.setState({
                message,
            });
            this.userRepo.get(message.senderid || 0).then((user) => {
                this.setState({
                    user,
                });
            }).catch((err) => {
                window.console.log(err);
            });
        }).catch((err) => {
            window.console.log(err);
        });
    }
}

export default DialogMessage;