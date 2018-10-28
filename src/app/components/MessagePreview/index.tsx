import * as React from 'react';

import './style.css';
import {IMessage} from "../../repository/message/interface";
import UserName from "../UserName";
import MessageRepo from "../../repository/message";
import {InputPeer} from "../../services/sdk/messages/core.types_pb";

interface IProps {
    message: IMessage;
    onDoubleClick?: () => void;
    peer: InputPeer | null;
}

interface IState {
    error: boolean;
    message: IMessage;
    peer: InputPeer | null;
    previewMessage?: IMessage | null;
}

class MessagePreview extends React.Component<IProps, IState> {
    private messageRepo: MessageRepo;
    private userId: string;

    constructor(props: IProps) {
        super(props);

        this.state = {
            error: false,
            message: props.message,
            peer: props.peer,
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
        const {message, previewMessage, error} = this.state;
        if (!message.replyto || message.replyto === 0) {
            return '';
        }
        if (!previewMessage && error) {
            return (
                <div className="message-preview">
                    <div className="preview-container">
                        <div className="preview-message-wrapper reply-you">
                            <span className="preview-bar"/>
                            <div className="preview-message">
                                <span className="preview-message-user">Error</span>
                                <div className="preview-message-body">
                                    <div className="inner ltr">Replied message</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        if (!previewMessage) {
            return (<div className="message-preview"/>);
        }
        return (
            <div className="message-preview" onDoubleClick={this.onDoubleClickHandler}>
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
        const {message, peer} = this.state;
        this.messageRepo.get(message.replyto || 0, peer).then((res) => {
            this.setState({
                error: false,
                previewMessage: res,
            });
        }).catch(() => {
            this.setState({
                error: true,
                previewMessage: null,
            });
        });
    }

    private onDoubleClickHandler = () => {
        if (this.props.onDoubleClick) {
            this.props.onDoubleClick();
        }
    }
}

export default MessagePreview;
