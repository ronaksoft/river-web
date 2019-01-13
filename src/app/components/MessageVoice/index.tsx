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
    error: boolean;
}

class MessageVoice extends React.Component<IProps, IState> {
    private voicePlayerRef: VoicePlayer;

    constructor(props: IProps) {
        super(props);

        this.state = {
            error: false,
        };
    }

    public componentDidMount() {
        const {message} = this.props;
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
            duration: info.duration / 1000,
            state: 'pause',
            voice: new Blob([]),
        });
    }

    // public componentWillReceiveProps(newProps: IProps) {
    //     //
    // }

    public render() {
        return (
            <div className="message-voice">
                <VoicePlayer ref={this.voicePlayerRefHandler} className="play-frame" maxValue={16.0}/>
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
}

export default MessageVoice;
