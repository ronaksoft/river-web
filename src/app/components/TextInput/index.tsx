import * as React from 'react';
import Textarea from 'react-textarea-autosize';
import {Picker} from 'emoji-mart';
import PopUpMenu from '../PopUpMenu';
import {throttle, cloneDeep} from 'lodash';
import {SentimentSatisfiedRounded, SendRounded, ClearRounded} from '@material-ui/icons';
import {IconButton} from '@material-ui/core';
import UserAvatar from '../UserAvatar';
import RTLDetector from '../../services/utilities/rtl_detector';
import {IMessage} from '../../repository/message/interface';
import UserName from '../UserName';
import {C_MSG_MODE} from './consts';

import 'emoji-mart/css/emoji-mart.css';
import './style.css';

interface IProps {
    clearPreviewMessage?: () => void;
    onMessage: (text: string, {mode, message}?: any) => void;
    onTyping?: (typing: boolean) => void;
    previewMessage?: IMessage;
    previewMessageMode?: number;
    ref?: (ref: any) => void;
    text?: string;
    userId?: string;
}

interface IState {
    emojiAnchorEl: any;
    previewMessage: IMessage | null;
    previewMessageHeight: number;
    previewMessageMode: number;
    rtl: boolean;
    userId: string;
}

class TextInput extends React.Component<IProps, IState> {
    private textarea: any = null;
    private typingThrottle: any = null;
    private typingTimeout: any = null;
    private rtlDetector: RTLDetector;
    private rtlDetectorThrottle: any = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            emojiAnchorEl: null,
            previewMessage: this.props.previewMessage || null,
            previewMessageHeight: 0,
            previewMessageMode: this.props.previewMessageMode || C_MSG_MODE.Normal,
            rtl: false,
            userId: props.userId || '',
        };

        if (this.props.ref) {
            this.props.ref(this);
        }

        this.rtlDetector = RTLDetector.getInstance();
        this.rtlDetectorThrottle = throttle(this.detectRTL, 1000);
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            previewMessage: newProps.previewMessage || null,
            previewMessageMode: newProps.previewMessageMode || C_MSG_MODE.Normal,
            userId: newProps.userId || '',
        }, () => {
            this.animatePreviewMessage();
        });
        if (newProps.previewMessageMode === C_MSG_MODE.Edit && newProps.previewMessage) {
            this.textarea.value = newProps.previewMessage.body;
        }
    }

    public render() {
        const {previewMessage, previewMessageMode, previewMessageHeight} = this.state;
        return (
            <div className="write">
                {previewMessage && <div className="previews" style={{height: previewMessageHeight + 'px'}}>
                    <div className="preview-container">
                        <div
                            className={'preview-message-wrapper ' + this.getPreviewCN(previewMessageMode, previewMessage.senderid || '')}>
                            <span className="preview-bar"/>
                            {Boolean(previewMessageMode === C_MSG_MODE.Reply) && <div className="preview-message">
                                <UserName className="preview-message-user" id={previewMessage.senderid || ''} you={true}/>
                                <div className="preview-message-body">
                                    <div className={'inner ' + (previewMessage.rtl ? 'rtl' : 'ltr')}
                                    >{previewMessage.body}</div>
                                </div>
                            </div>}
                            {Boolean(previewMessageMode === C_MSG_MODE.Edit) && <div className="preview-message">
                                <div className="preview-message-user">Edit message</div>
                            </div>}
                        </div>
                    </div>
                    <div className="preview-clear">
                        <span onClick={this.clearPreviewMessage}>
                            <IconButton aria-label="Delete" className="btn-clear">
                                <ClearRounded/>
                            </IconButton>
                        </span>
                    </div>
                </div>}
                <div className="inputs">
                    <div className="user">
                        <UserAvatar id={this.state.userId} className="user-avatar"/>
                    </div>
                    <div className={'input ' + (this.state.rtl ? 'rtl' : 'ltr')}>
                        <Textarea
                            inputRef={this.textareaRefHandler}
                            maxRows={5}
                            placeholder="Type your message here..."
                            onKeyUp={this.sendMessage}
                            onKeyDown={this.inputKeyDown}
                            style={{direction: (this.state.rtl ? 'rtl' : 'ltr')}}
                        />
                        <div className="write-link">
                            <a href="javascript:;"
                               className="smiley"
                               aria-owns="emoji-menu"
                               aria-haspopup="true"
                               onClick={this.emojiHandleClick}>
                                <SentimentSatisfiedRounded/>
                            </a>
                            <PopUpMenu anchorEl={this.state.emojiAnchorEl} onClose={this.emojiHandleClose}>
                                <Picker custom={[]} onSelect={this.emojiSelect} native={true} showPreview={false}/>
                            </PopUpMenu>
                            <a href="javascript:;" className="send" onClick={this.submitMessage}>
                                <SendRounded/>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private getPreviewCN(mode: number, senderid: string) {
        if (mode === C_MSG_MODE.Edit) {
            return 'edit';
        } else if (mode === C_MSG_MODE.Reply && senderid === this.props.userId) {
            return 'reply-you';
        } else if (mode === C_MSG_MODE.Reply && senderid !== this.props.userId) {
            return 'reply';
        }
        return '';
    }

    private submitMessage = () => {
        const {previewMessage, previewMessageMode} = this.state;
        if (this.props.onMessage) {
            if (this.props.onMessage) {
                if (previewMessageMode === C_MSG_MODE.Normal) {
                    this.props.onMessage(this.textarea.value);
                } else if (previewMessageMode !== C_MSG_MODE.Normal) {
                    const message = cloneDeep(previewMessage);
                    this.props.onMessage(this.textarea.value, {
                        message,
                        mode: previewMessageMode,
                    });
                    this.clearPreviewMessage();
                }
            }
        }
        this.textarea.value = '';
        this.setState({
            emojiAnchorEl: null,
        });
        if (this.props.onTyping) {
            this.props.onTyping(false);
            if (this.typingThrottle !== null) {
                this.typingThrottle.cancel();
            }
            this.typingThrottle = null;
        }
    }

    private sendMessage = (e: any) => {
        const {previewMessage, previewMessageMode} = this.state;
        this.rtlDetectorThrottle(e.target.value);
        if (e.key === 'Enter' && !e.shiftKey) {
            if (this.props.onMessage) {
                if (previewMessageMode === C_MSG_MODE.Normal) {
                    this.props.onMessage(e.target.value);
                } else if (previewMessageMode !== C_MSG_MODE.Normal) {
                    const message = cloneDeep(previewMessage);
                    this.props.onMessage(e.target.value, {
                        message,
                        mode: previewMessageMode,
                    });
                    this.clearPreviewMessage();
                }
            }
            e.target.value = '';
            this.setState({
                emojiAnchorEl: null,
            });
        }
        if (this.props.onTyping) {
            if (e.target.value.length === 0) {
                this.props.onTyping(false);
                if (this.typingThrottle !== null) {
                    this.typingThrottle.cancel();
                }
                this.typingThrottle = null;
            } else {
                if (this.typingThrottle === null) {
                    this.typingThrottle = throttle(() => {
                        if (this.props.onTyping) {
                            this.props.onTyping(true);
                        } else {
                            if (this.typingThrottle !== null) {
                                this.typingThrottle.cancel();
                            }
                        }
                    }, 5000);
                } else {
                    this.typingThrottle();
                    clearTimeout(this.typingTimeout);
                    this.typingTimeout = setTimeout(() => {
                        if (this.typingThrottle !== null) {
                            this.typingThrottle.cancel();
                        }
                        if (this.props.onTyping) {
                            this.props.onTyping(false);
                        }
                    }, 5000);
                }
            }
        }
    }

    private textareaRefHandler = (value: any) => {
        this.textarea = value;
    }

    private inputKeyDown = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    private emojiHandleClick = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({
            emojiAnchorEl: event.currentTarget,
        });
    }

    private emojiSelect = (data: any) => {
        this.textarea.value += data.native;
    }

    private emojiHandleClose = () => {
        this.setState({
            emojiAnchorEl: null,
        });
    }

    private detectRTL = (text: string) => {
        const rtl = this.rtlDetector.direction(text);
        this.setState({
            rtl,
        });
    }

    private clearPreviewMessage = () => {
        this.setState({
            previewMessageHeight: 0,
        });
        setTimeout(() => {
            this.setState({
                previewMessage: null,
                previewMessageMode: C_MSG_MODE.Normal,
            });
            if (this.props.clearPreviewMessage) {
                this.props.clearPreviewMessage();
            }
        }, 102);
    }

    private animatePreviewMessage() {
        setTimeout(() => {
            const el = document.querySelector('.write .previews .preview-message-wrapper');
            if (el && this.state.previewMessage) {
                const targetEl = document.querySelector('.write .previews');
                if (targetEl) {
                    this.setState({
                        previewMessageHeight: (el.clientHeight + 8)
                    });
                } else {
                    this.setState({
                        previewMessageHeight: 0,
                    });
                }
            } else {
                this.setState({
                    previewMessageHeight: 0,
                });
            }
        }, 50);
    }
}

export default TextInput;
