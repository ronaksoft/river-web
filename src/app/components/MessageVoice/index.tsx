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
}

interface IState {
    message: IMessage;
}

class MessageVoice extends React.Component<IProps, IState> {
    private voicePlayerRef: VoicePlayer;
    private lastId: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            message: props.message,
        };

        if (props.message) {
            this.lastId = props.message.id || 0;
        }
    }

    public componentDidMount() {
        const {message} = this.state;
        const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
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
        this.voicePlayerRef.setData({
            bars: info.bars,
            duration: info.duration,
            state: this.getVoiceState(message),
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
            });
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
    private actionHandler = (cmd: 'cancel' | 'download') => {
        window.console.log(cmd);
    }
}

export default MessageVoice;
