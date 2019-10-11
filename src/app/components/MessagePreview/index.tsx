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
import CachedMessageService, {ICachedMessageServiceBroadcastItemData} from '../../services/cachedMessageService';
import i18n from '../../services/i18n';

import './style.css';

interface IProps {
    disableClick: boolean;
    message: IMessage;
    onClick?: (id: number, e: any) => void;
    onDoubleClick?: (e: any) => void;
    peer: InputPeer | null;
}

interface IState {
    error: boolean;
    message: IMessage;
    previewMessage?: IMessage | null;
}

class MessagePreview extends React.PureComponent<IProps, IState> {
    private messageRepo: MessageRepo;
    private userId: string;
    private cachedMessageService: CachedMessageService;
    private eventReferences: any[] = [];
    private lastId: number = 0;

    constructor(props: IProps) {
        super(props);

        this.cachedMessageService = CachedMessageService.getInstance();

        let message = null;
        if (this.props.message && this.props.message.replyto !== 0 && this.props.message.deleted_reply !== true) {
            this.lastId = this.props.message.replyto || 0;
            message = this.cachedMessageService.getMessage(this.props.message.peerid || '', this.props.message.replyto || 0);
            this.eventReferences.push(this.cachedMessageService.listen(this.props.message.replyto || 0, this.cachedMessageServiceHandler));
        }
        this.state = {
            error: false,
            message: props.message,
            previewMessage: message,
        };

        this.messageRepo = MessageRepo.getInstance();
    }

    public componentDidMount() {
        this.userId = this.messageRepo.getCurrentUserId();
        if (!this.state.previewMessage && this.state.message.replyto && this.state.message.replyto !== 0) {
            this.getMessage();
        }
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.lastId !== newProps.message.replyto) {
            this.lastId = newProps.message.replyto || 0;
            this.cachedMessageService.unmountCache(this.state.message.replyto || 0);
            this.removeAllListeners();
            this.setState({
                message: newProps.message,
            }, () => {
                if (this.state.message.replyto && this.state.message.replyto !== 0 && this.state.message.deleted_reply !== true) {
                    this.eventReferences.push(this.cachedMessageService.listen(this.state.message.replyto, this.cachedMessageServiceHandler));
                    const message = this.cachedMessageService.getMessage(this.state.message.peerid || '', this.state.message.replyto || 0);
                    if (message) {
                        this.setState({
                            error: false,
                            previewMessage: message,
                        });
                    } else {
                        this.getMessage();
                    }
                }
            });
        }
    }

    public componentWillUnmount() {
        if (this.state.message) {
            this.cachedMessageService.unmountCache(this.state.message.replyto || 0);
        }
        this.removeAllListeners();
    }

    public render() {
        const {message, previewMessage, error} = this.state;
        if (!message.replyto || message.replyto === 0) {
            return '';
        }
        if (!previewMessage && error) {
            return (
                <div className="message-preview" onDoubleClick={this.props.onDoubleClick} onClick={this.clickHandler}>
                    <div className="preview-container">
                        <div className="preview-message-wrapper reply-you">
                            <span className="preview-bar"/>
                            <div className="preview-message">
                                <span className="preview-message-user">{i18n.t('general.error')}</span>
                                <div className="preview-message-body">
                                    <div className="inner ltr">{i18n.t('message.replied_message')}</div>
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
            <div className="message-preview" onDoubleClick={this.props.onDoubleClick} onClick={this.clickHandler}>
                <div className="preview-container">
                    <div className={'preview-message-wrapper ' + this.getPreviewCN(previewMessage)}>
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

    private getPreviewCN(msg: IMessage) {
        if (!msg) {
            return '';
        }
        let cn = '';
        if (msg.senderid === this.userId) {
            cn = 'reply-you';
        } else {
            cn = 'reply';
        }
        switch (msg.messagetype) {
            case C_MESSAGE_TYPE.Picture:
            case C_MESSAGE_TYPE.Video:
                cn += ' with-thumbnail';
                break;
        }
        return cn;
    }

    private getMessage() {
        const {peer} = this.props;
        const {message} = this.state;
        this.messageRepo.get(message.replyto || 0, peer).then((res) => {
            if (res) {
                this.setState({
                    error: false,
                    previewMessage: res,
                });
                this.cachedMessageService.setMessage(res);
            } else {
                this.setState({
                    error: true,
                    previewMessage: null,
                });
            }
        }).catch((err) => {
            this.setState({
                error: true,
                previewMessage: null,
            });
            if (message.id) {
                this.messageRepo.lazyUpsert([{
                    deleted_reply: true,
                    id: message.id,
                }]);
            }
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

    private clickHandler = (e: any) => {
        if (!this.props.disableClick && this.props.onClick && !this.state.error) {
            this.props.onClick(this.props.message.replyto || 0, e);
        }
    }

    /* Remove all listeners */
    private removeAllListeners() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    private cachedMessageServiceHandler = (data: ICachedMessageServiceBroadcastItemData) => {
        if (data.mode === 'removed') {
            this.setState({
                error: true,
                previewMessage: null,
            });
        } else if (data.mode === 'updated') {
            if (this.props.message && this.props.message.replyto !== 0 && this.props.message.deleted_reply !== true) {
                const previewMessage = this.cachedMessageService.getMessage(this.props.message.peerid || '', this.props.message.replyto || 0);
                if (previewMessage) {
                    this.setState({
                        previewMessage,
                    });
                }
            }
        }
    }
}

export default MessagePreview;
