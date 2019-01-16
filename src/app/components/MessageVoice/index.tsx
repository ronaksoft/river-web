/*
    Creation Time: 2019 - Jan - 13
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {IMessage} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/core.types_pb';
import VoicePlayer from '../VoicePlayer';
import {
    DocumentAttributeAudio,
    DocumentAttributeType,
    MediaDocument
} from '../../services/sdk/messages/core.message.medias_pb';
import {base64ToU8a} from '../../services/sdk/fileServer/http/utils';
import {from4bitResolution} from '../TextInput/utils';

import './style.css';

interface IProps {
    message: IMessage;
    peer: InputPeer | null;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download', message: IMessage) => void;
}

interface IState {
    message: IMessage;
}

class MessageVoice extends React.Component<IProps, IState> {
    private voicePlayerRef: VoicePlayer;
    private lastId: number = 0;
    private voiceId: string = '';
    private downloaded: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            message: props.message,
        };

        if (props.message) {
            this.lastId = props.message.id || 0;
            this.downloaded = props.message.downloaded || false;
        }
    }

    public componentDidMount() {
        const {message} = this.state;
        const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
        if (!message || !messageMediaDocument.doc) {
            return;
        }
        const info: {
            bars: number[],
            duration: number,
        } = {
            bars: [],
            duration: 0,
        };
        messageMediaDocument.doc.attributesList.forEach((item, index) => {
            if (item.type === DocumentAttributeType.ATTRIBUTETYPEAUDIO) {
                if (message.attributes && message.attributes[index]) {
                    const attr: DocumentAttributeAudio.AsObject = message.attributes[index];
                    info.duration = attr.duration || 0;
                    if (attr.waveform) {
                        // @ts-ignore
                        info.bars = from4bitResolution(Array.from(base64ToU8a(attr.waveform)));
                    }
                }
            }
        });
        this.voiceId = messageMediaDocument.doc.id || '';
        this.voicePlayerRef.setData({
            bars: info.bars,
            duration: info.duration,
            state: this.getVoiceState(message),
            voiceId: messageMediaDocument.doc.id,
        });
    }

    public componentWillReceiveProps(newProps: IProps) {
        const {message} = this.state;
        if (newProps.message && this.lastId !== newProps.message.id) {
            this.lastId = newProps.message.id || 0;
            this.setState({
                message: newProps.message,
            }, () => {
                this.voicePlayerRef.setVoiceState(this.getVoiceState(message));
                this.getVoiceId();
            });
        }
        const messageMediaDocument: MediaDocument.AsObject = newProps.message.mediadata;
        if (messageMediaDocument && messageMediaDocument.doc && messageMediaDocument.doc.id !== this.voiceId) {
            this.voiceId = messageMediaDocument.doc.id || '';
            this.voicePlayerRef.setVoiceId(this.voiceId);
        }
        if ((newProps.message.downloaded || false) !== this.downloaded) {
            this.downloaded = (newProps.message.downloaded || false);
            this.voicePlayerRef.setVoiceState(this.getVoiceState(newProps.message));
        }
    }

    public render() {
        return (
            <div className="message-voice">
                <VoicePlayer ref={this.voicePlayerRefHandler} className="play-frame"
                             maxValue={16.0} message={this.state.message} onAction={this.actionHandler}/>
            </div>
        );
    }

    /* Get voice data */
    private getVoiceId() {
        const {message} = this.state;
        const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
        this.voicePlayerRef.setVoiceId(messageMediaDocument.doc.id);
    }

    /* Voice Player ref handler */
    private voicePlayerRefHandler = (ref: any) => {
        if (!ref) {
            return;
        }
        this.voicePlayerRef = ref;
    }

    /* Get voice state for player */
    private getVoiceState(message: IMessage) {
        const id = message.id || 0;
        if (id <= 0) {
            return 'progress';
        } else if (id > 0 && !message.downloaded) {
            return 'download';
        } else {
            return 'pause';
        }
    }

    /* Voice action handler */
    private actionHandler = (cmd: 'cancel' | 'download' | 'cancel_download') => {
        if (this.props.onAction) {
            this.props.onAction(cmd, this.state.message);
            if (cmd === 'download') {
                this.voicePlayerRef.setVoiceState('progress');
            } else if (cmd === 'cancel_download') {
                this.voicePlayerRef.setVoiceState('download');
            }
        }
    }
}

export default MessageVoice;
