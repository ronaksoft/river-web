/*
    Creation Time: 2018 - Oct - 16
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {IMessage} from '../../repository/message/interface';
import UserName from '../UserName';
import MessageRepo from '../../repository/message';
import {InputPeer} from '../../services/sdk/messages/chat.core.types_pb';
import {getMessageTitle} from '../Dialog/utils';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import {getMediaInfo} from '../MessageMedia';
import CachedPhoto from '../CachedPhoto';

import './style.css';

interface IProps {
    message: IMessage;
    onClick?: (e: any) => void;
    onDoubleClick?: (e: any) => void;
    peer: InputPeer | null;
}

interface IState {
    error: boolean;
    message: IMessage;
    peer: InputPeer | null;
    previewMessage?: IMessage | null;
}

class MessagePreview extends React.PureComponent<IProps, IState> {
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
                <div className="message-preview" onDoubleClick={this.props.onDoubleClick} onClick={this.props.onClick}>
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
            return (<div className="message-preview">
                <div className="preview-container">
                    <div className="preview-message-wrapper">
                        <span className="preview-bar"/>
                        <div className="preview-message">
                            <span className="preview-message-user">&nbsp;</span>
                            <div className="preview-message-body">
                                <div className="inner ltr">&nbsp;</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
        }
        return (
            <div className="message-preview" onDoubleClick={this.props.onDoubleClick} onClick={this.props.onClick}>
                <div className="preview-container">
                    <div className={'preview-message-wrapper ' + this.getPreviewCN(previewMessage.senderid || '')}>
                        <span className="preview-bar"/>
                        {this.getThumbnail()}
                        <div className="preview-message">
                            <div className="preview-message-user">
                                <UserName id={previewMessage.senderid || ''} you={true}/>
                            </div>
                            <div className="preview-message-body">
                                {this.getMessageBody(previewMessage)}
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
            if (res) {
                this.setState({
                    error: false,
                    previewMessage: res,
                });
            } else {
                this.setState({
                    error: true,
                    previewMessage: res,
                });
            }
        }).catch(() => {
            this.setState({
                error: true,
                previewMessage: null,
            });
        });
    }

    /* Get message body */
    private getMessageBody(msg: IMessage) {
        if ((msg.body || '').length > 0) {
            return (<div className={'inner ' + (msg.rtl ? 'rtl' : 'ltr')}>{msg.body}</div>);
        } else {
            return (<div className={'inner'}>{getMessageTitle(msg).text}</div>);
        }
    }

    private getThumbnail() {
        const {previewMessage} = this.state;
        if (!previewMessage) {
            return '';
        }
        switch (previewMessage.messagetype) {
            case C_MESSAGE_TYPE.Picture:
            case C_MESSAGE_TYPE.Video:
                const info = getMediaInfo(previewMessage);
                return (
                    <div className="preview-thumbnail">
                        <CachedPhoto className="thumbnail" fileLocation={info.thumbFile}/>
                    </div>
                );
            default:
                return '';
        }
    }
}

export default MessagePreview;
