/*
    Creation Time: 2018 - Oct - 16
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import React from 'react';
import {IMessage} from '../../repository/message/interface';
import UserName from '../UserName';
import MessageRepo from '../../repository/message';
import {InputPeer} from '../../services/sdk/messages/core.types_pb';
import {getMessageTitle} from '../Dialog/utils';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import {getMediaInfo, IMediaInfo} from '../MessageMedia';
import CachedPhoto from '../CachedPhoto';
import CachedMessageService, {ICachedMessageServiceBroadcastItemData} from '../../services/cachedMessageService';
import i18n from '../../services/i18n';
import {GetPeerName} from "../../repository/dialog";
import {currentUserId} from "../../services/sdk";

import './style.scss';

interface IProps {
    disableClick: boolean;
    message: IMessage;
    onClick?: (id: number, e: any) => void;
    onDoubleClick?: (e: any) => void;
    peer: InputPeer | null;
    teamId: string;
    pinnedMessage?: boolean;
}

interface IState {
    error: boolean;
    message: IMessage;
    previewMessage?: IMessage | null;
}

class MessagePreview extends React.PureComponent<IProps, IState> {
    private messageRepo: MessageRepo;
    private cachedMessageService: CachedMessageService;
    private eventReferences: any[] = [];
    private lastId: number = 0;
    private mounted: boolean = true;

    constructor(props: IProps) {
        super(props);

        this.cachedMessageService = CachedMessageService.getInstance();

        let message = null;
        if (!this.props.pinnedMessage && this.props.message && this.props.message.replyto !== 0 && this.props.message.deleted_reply !== true) {
            this.lastId = this.props.message.replyto || 0;
            message = this.cachedMessageService.getMessage(GetPeerName(this.props.message.peerid, this.props.message.peertype), this.props.message.replyto || 0);
            this.eventReferences.push(this.cachedMessageService.listen(this.props.message.replyto || 0, this.cachedMessageServiceHandler));
        } else if (this.props.pinnedMessage && this.props.message.id !== 0 && props.peer) {
            this.lastId = this.props.message.id || 0;
            message = this.cachedMessageService.getMessage(GetPeerName(props.peer.getId(), props.peer.getType()), this.props.message.id || 0);
            this.eventReferences.push(this.cachedMessageService.listen(this.props.message.id || 0, this.cachedMessageServiceHandler));
        }
        this.state = {
            error: false,
            message: props.message,
            previewMessage: message,
        };

        this.messageRepo = MessageRepo.getInstance();
    }

    public componentDidMount() {
        if (!this.state.previewMessage && this.state.message.replyto && this.state.message.replyto !== 0) {
            this.getMessage();
        } else if (this.props.pinnedMessage && this.state.message.id !== 0) {
            this.getMessage();
        }
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
        if ((!this.props.pinnedMessage && this.lastId !== newProps.message.replyto) || (this.props.pinnedMessage && this.lastId !== newProps.message.id)) {
            this.lastId = this.props.pinnedMessage ? (newProps.message.id || 0) : (newProps.message.replyto || 0);
            this.cachedMessageService.unmountCache(this.state.message.replyto || 0);
            this.removeAllListeners();
            this.setState({
                message: newProps.message,
            }, () => {
                if (!this.props.pinnedMessage && this.state.message.replyto && this.state.message.replyto !== 0 && this.state.message.deleted_reply !== true) {
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
                } else if (this.props.pinnedMessage && this.props.peer && this.state.message.id && this.state.message.id !== 0) {
                    this.eventReferences.push(this.cachedMessageService.listen(this.state.message.id, this.cachedMessageServiceHandler));
                    const message = this.cachedMessageService.getMessage(GetPeerName(this.props.peer.getId(), this.props.peer.getType()), this.state.message.id || 0);
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
        this.mounted = false;
        if (this.state.message) {
            if (this.props.pinnedMessage) {
                this.cachedMessageService.unmountCache(this.state.message.id || 0);
            } else {
                this.cachedMessageService.unmountCache(this.state.message.replyto || 0);
            }
        }
        this.removeAllListeners();
    }

    public render() {
        const {pinnedMessage} = this.props;
        const {message, previewMessage, error} = this.state;
        if ((pinnedMessage && (!message.id || message.id === 0)) || (!pinnedMessage && (!message.replyto || message.replyto === 0))) {
            return null;
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
                                    <div
                                        className="preview-inner ltr">{i18n.t(this.props.pinnedMessage ? 'message.replied_message' : 'message.replied_message')}</div>
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
                                <div className="preview-inner ltr">&nbsp;</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
        }
        const mediaInfo = getMediaInfo(previewMessage);
        return (
            <div
                className={'message-preview' + (mediaInfo.thumbFile && mediaInfo.thumbFile.fileid !== '' ? ' has-thumbnail' : '')}
                onDoubleClick={this.props.onDoubleClick} onClick={this.clickHandler}>
                <div className="preview-container">
                    <div className={'preview-message-wrapper ' + this.getPreviewCN(previewMessage)}>
                        <span className="preview-bar"/>
                        {this.getThumbnail(mediaInfo)}
                        <div className="preview-message">
                            <div className="preview-message-user">
                                <UserName id={previewMessage.senderid || ''} you={true} noIcon={true}/>
                            </div>
                            <div className="preview-message-body">
                                {this.getMessageBody(previewMessage, 128)}
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
        if (msg.senderid === currentUserId) {
            cn = 'reply-you';
        } else {
            cn = 'reply';
        }
        switch (msg.messagetype) {
            case C_MESSAGE_TYPE.Picture:
            case C_MESSAGE_TYPE.Video:
            case C_MESSAGE_TYPE.Gif:
                cn += ' with-thumbnail';
                break;
        }
        return cn;
    }

    private getMessage() {
        const {teamId, peer, pinnedMessage} = this.props;
        const {message} = this.state;
        this.messageRepo.get(pinnedMessage ? (message.id || 0) : (message.replyto || 0), peer, teamId).then((res) => {
            if (!this.mounted) {
                return;
            }
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
            if (message.id && !this.props.pinnedMessage) {
                this.messageRepo.importBulk([{
                    deleted_reply: true,
                    id: message.id,
                }]);
            }
        });
    }

    /* Get message body */
    private getMessageBody(msg: IMessage, maxChars?: number) {
        if ((msg.body || '').length > 0) {
            return (<div
                className={'preview-inner ' + (msg.rtl ? 'rtl' : 'ltr')}>{(msg.body || '').substr(0, maxChars)}{maxChars && (msg.body || '').length > maxChars ? '...' : ''}</div>);
        } else {
            return (<div className={'preview-inner'}>{getMessageTitle(msg).text}</div>);
        }
    }

    private getThumbnail(mediaInfo: IMediaInfo) {
        const {previewMessage} = this.state;
        if (!previewMessage) {
            return null;
        }
        switch (previewMessage.messagetype) {
            case C_MESSAGE_TYPE.Picture:
            case C_MESSAGE_TYPE.Video:
            case C_MESSAGE_TYPE.File:
            case C_MESSAGE_TYPE.Gif:
                if (mediaInfo.thumbFile && mediaInfo.thumbFile.fileid !== '') {
                    return (
                        <div className="preview-thumbnail">
                            <CachedPhoto key="reply-thumbnail" className="thumbnail"
                                         fileLocation={mediaInfo.thumbFile} mimeType="image/jpeg"/>
                        </div>
                    );
                } else {
                    return null;
                }
            case C_MESSAGE_TYPE.Audio:
                if (mediaInfo.thumbFile && mediaInfo.thumbFile.fileid !== '') {
                    return (
                        <div className="preview-thumbnail">
                            <CachedPhoto key="reply-thumbnail" className="thumbnail"
                                         fileLocation={mediaInfo.thumbFile} mimeType="image/jpeg"/>
                        </div>
                    );
                } else {
                    return null;
                }
            default:
                return null;
        }
    }

    private clickHandler = (e: any) => {
        if (!this.props.disableClick && this.props.onClick && !this.state.error) {
            this.props.onClick(this.props.pinnedMessage ? this.props.message.id || 0 : this.props.message.replyto || 0, e);
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
            if (!this.props.pinnedMessage && this.props.message && this.props.message.replyto !== 0 && this.props.message.deleted_reply !== true) {
                const previewMessage = this.cachedMessageService.getMessage(this.props.message.peerid || '', this.props.message.replyto || 0);
                if (previewMessage) {
                    this.setState({
                        previewMessage,
                    });
                }
            } else if (this.props.pinnedMessage && this.props.peer && this.props.message && this.props.message.id !== 0) {
                const previewMessage = this.cachedMessageService.getMessage(GetPeerName(this.props.peer.getId(), this.props.peer.getType()), this.props.message.id || 0);
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
