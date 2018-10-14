import * as React from 'react';
import Textarea from 'react-textarea-autosize';
import {Picker} from 'emoji-mart';
import PopUpMenu from '../PopUpMenu';
import {throttle} from 'lodash';
import {SentimentSatisfiedRounded, SendRounded} from '@material-ui/icons';

import 'emoji-mart/css/emoji-mart.css';
import './style.css';
import UserAvatar from '../UserAvatar';
import RTLDetector from "../../services/utilities/rtl_detector";

interface IProps {
    onMessage: (text: string) => void;
    onTyping?: (typing: boolean) => void;
    ref?: (ref: any) => void;
    userId?: string;
}

interface IState {
    emojiAnchorEl: any;
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
            rtl: false,
            userId: props.userId || '',
        };

        if (this.props.ref) {
            this.props.ref(this);
        }

        this.rtlDetector = RTLDetector.getInstance();
        this.rtlDetectorThrottle = throttle(this.detectRTL, 1000);
    }

    public render() {
        return (
            <div className="write">
                <div className="user">
                    <UserAvatar id={this.state.userId} className="user-avatar"/>
                </div>
                <div className={'input '+ (this.state.rtl ? 'rtl' : 'ltr')}>
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
        );
    }

    private submitMessage = () => {
        if (this.props.onMessage) {
            this.props.onMessage(this.textarea.value);
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
        this.rtlDetectorThrottle(e.target.value);
        if (e.key === 'Enter' && !e.shiftKey) {
            if (this.props.onMessage) {
                this.props.onMessage(e.target.value);
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
}

export default TextInput;