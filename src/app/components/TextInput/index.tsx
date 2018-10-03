import * as React from 'react';
import Textarea from 'react-textarea-autosize';
import {Picker} from 'emoji-mart';
import PopUpMenu from '../PopUpMenu';
import {throttle} from 'lodash';

import 'emoji-mart/css/emoji-mart.css';
import './style.css';

interface IProps {
    onMessage: (text: string) => void;
    ref?: (ref: any) => void;
    onTyping?: (typing: boolean) => void;
}

interface IState {
    emojiAnchorEl: any;
}

class TextInput extends React.Component<IProps, IState> {
    private textarea: any = null;
    private typingThrottle: any = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            emojiAnchorEl: null,
        };

        if (this.props.ref) {
            this.props.ref(this);
        }
    }

    public render() {
        return (
            <div className="write">
                <div className="user">
                    <span className="user-avatar"/>
                </div>
                <div className="input">
                                <Textarea
                                    inputRef={this.textareaRefHandler}
                                    maxRows={5}
                                    placeholder="Type your message here..."
                                    onKeyUp={this.sendMessage}
                                    onKeyDown={this.inputKeyDown}
                                />
                    <div className="write-link">
                        <a href="javascript:;"
                           className="smiley"
                           aria-owns="emoji-menu"
                           aria-haspopup="true"
                           onClick={this.emojiHandleClick}/>
                        <PopUpMenu anchorEl={this.state.emojiAnchorEl} onClose={this.emojiHandleClose}>
                            <Picker custom={[]} onSelect={this.emojiSelect} showPreview={false}/>
                        </PopUpMenu>
                        <a href="javascript:;" className="send"/>
                    </div>
                </div>
            </div>
        );
    }

    private sendMessage = (e: any) => {
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
}

export default TextInput;