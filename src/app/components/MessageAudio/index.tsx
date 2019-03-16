/*
    Creation Time: 2019 - March - 16
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {IMessage} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/chat.core.types_pb';
import {
    PlayArrowRounded,
    PauseRounded,
} from '@material-ui/icons';
import DownloadProgress from '../DownloadProgress';
import {getMediaInfo, IMediaInfo} from '../MessageMedia';

import './style.css';

interface IProps {
    message: IMessage;
    peer: InputPeer | null;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open', message: IMessage) => void;
}

interface IState {
    mediaInfo: IMediaInfo;
    message: IMessage;
    playing: boolean;
}

class MessageAudio extends React.PureComponent<IProps, IState> {
    private downloaded: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            mediaInfo: getMediaInfo(props.message),
            message: props.message,
            playing: false,
        };

        this.downloaded = props.message.downloaded || false;
    }

    public componentDidMount() {
        //
    }

    public componentWillReceiveProps(newProps: IProps) {
        //
    }

    public render() {
        const {mediaInfo} = this.state;
        return (
            <div className="message-audio">
                <div className="audio-main">
                    <div className="audio-action-wrapper">
                        {this.getMediaAction(mediaInfo)}
                    </div>
                    <div className="audio-info">
                        <div className="audio-title">{mediaInfo.title}</div>
                        <div className="audio-album">{mediaInfo.album}</div>
                    </div>
                </div>
            </div>
        );
    }

    /* Get media action */
    private getMediaAction(info: IMediaInfo) {
        const {message, playing} = this.state;
        if (!this.downloaded) {
            return (
                <DownloadProgress className="audio-item-action" id={message.id || 0}
                                  fileSize={info.size}
                                  hideSizeIndicator={true} onAction={this.downloadProgressActionHandler}/>);
        } else {
            return (<div className="audio-item-action">
                <div className="audio-action" onClick={this.audioActionClickHandler.bind(this, message.id || 0)}>
                    {!playing && <PlayArrowRounded/>}
                    {playing && <PauseRounded/>}
                </div>
            </div>);
        }
    }

    /* DownloadProgress action handler */
    private downloadProgressActionHandler = (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open', messageId: number) => {
        if (this.props.onAction) {
            const {message} = this.state;
            this.props.onAction(cmd, message);
        }
    }

    /* Audio action handler */
    private audioActionClickHandler = (id: number) => {
        window.console.log(id);
    }
}

export default MessageAudio;
