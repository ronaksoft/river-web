import * as React from 'react';

import './style.css';
import {IMessage} from "../../repository/message/interface";
import UserName from "../UserName";
import MessageRepo from "../../repository/message";

interface IProps {
    message: IMessage;
}

interface IState {
    message: IMessage;
    previewMessage?: IMessage;
}

class MessagePreview extends React.Component<IProps, IState> {
    private messageRepo: MessageRepo;
    private userId: string;

    constructor(props: IProps) {
        super(props);

        this.state = {
            message: props.message,
        };

        this.messageRepo = MessageRepo.getInstance();
    }

    public componentDidMount() {
        this.userId = this.messageRepo.getCurrentUserId();
        if (this.state.message.replyto && this.state.message.replyto !== 0) {
            this.getMessage();
        }
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.message !== newProps.message) {
            this.setState({
                message: newProps.message,
            }, () => {
                if (this.state.message.replyto && this.state.message.replyto !== 0) {
                    this.getMessage();
                }
            });
        }
    }

    public render() {
        const {message, previewMessage} = this.state;
        if (!message.replyto || message.replyto === 0) {
            return '';
        }
        if (!previewMessage) {
            return (<div className="message-preview"/>);
        }
        return (
            <div className="message-preview">
                <div className="preview-container">
                    <div className={'preview-message-wrapper ' + this.getPreviewCN(previewMessage.senderid || '')}>
                        <span className="preview-bar"/>
                        <div className="preview-message">
                            <UserName className="preview-message-user" id={previewMessage.senderid || ''} you={true}/>
                            <div className="preview-message-body">
                                <div
                                    className={'inner ' + (previewMessage.rtl ? 'rtl' : 'ltr')}>{previewMessage.body}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private getPreviewCN(senderid: string) {
        if (senderid === this.userId) {
            return 'reply-you';
        } else if (senderid !== this.userId) {
            return 'reply';
        }
        return '';
    }

    private getMessage() {
        this.messageRepo.get(this.state.message.replyto || 0).then((message) => {
            this.setState({
                previewMessage: message,
            });
        }).catch((err) => {
            window.console.log(err);
        });
    }
}

export default MessagePreview;