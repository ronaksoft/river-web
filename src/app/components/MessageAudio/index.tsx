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
import {InputPeer} from '../../services/sdk/messages/core.types_pb';
import {
    PlayArrowRounded,
    PauseRounded,
} from '@material-ui/icons';
import DownloadProgress from '../DownloadProgress';
import {getMediaInfo, IMediaInfo} from '../MessageMedia';
import AudioPlayer, {IAudioEvent} from '../../services/audioPlayer';

import './style.scss';
import CachedPhoto from "../CachedPhoto";
import {renderBody} from "../Message";
import ElectronService from "../../services/electron";

interface IProps {
    measureFn: any;
    message: IMessage;
    peer: InputPeer | null;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open', message: IMessage) => void;
    onBodyAction: (cmd: string, text: string) => void;
}

interface IState {
    mediaInfo: IMediaInfo;
    message: IMessage;
    playing: boolean;
}

class MessageAudio extends React.PureComponent<IProps, IState> {
    private lastId: number = 0;
    private fileId: string = '';
    private eventReferences: any[] = [];
    private downloaded: boolean = false;
    private audioPlayer: AudioPlayer;
    private isElectron: boolean = ElectronService.isElectron();

    constructor(props: IProps) {
        super(props);

        this.state = {
            mediaInfo: getMediaInfo(props.message),
            message: props.message,
            playing: false,
        };

        this.downloaded = props.message.downloaded || false;
        this.lastId = props.message.id || 0;
        this.fileId = this.state.mediaInfo.file.fileid || '';
        this.audioPlayer = AudioPlayer.getInstance();
    }

    public componentDidMount() {
        const {message, mediaInfo} = this.state;
        if (this.props.peer) {
            this.audioPlayer.addToPlaylist(message.id || 0, this.props.peer.getId() || '', mediaInfo.file.fileid || '', message.senderid || '', message.downloaded || false, mediaInfo);
        }
        this.eventReferences.push(this.audioPlayer.listen(message.id || 0, this.audioPlayerHandler));
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
        if (newProps.message) {
            const mInfo = getMediaInfo(newProps.message);
            if (this.lastId !== newProps.message.id || this.fileId !== mInfo.file.fileid) {
                if (this.lastId !== newProps.message.id && this.lastId < 0) {
                    this.audioPlayer.removeFromPlaylist(this.lastId);
                    this.removeAllListeners();
                    this.eventReferences.push(this.audioPlayer.listen(newProps.message.id || 0, this.audioPlayerHandler));
                }
                this.lastId = newProps.message.id || 0;
                this.fileId = mInfo.file.fileid || '';
                this.setState({
                    mediaInfo: mInfo,
                    message: newProps.message,
                }, () => {
                    const {message, mediaInfo} = this.state;
                    if (this.props.peer) {
                        this.audioPlayer.addToPlaylist(message.id || 0, this.props.peer.getId() || '', mediaInfo.file.fileid || '', message.senderid || '', message.downloaded || false, mediaInfo);
                    }
                });
            }
        }
    }

    public componentWillUnmount() {
        this.removeAllListeners();
    }

    public render() {
        const {mediaInfo, message} = this.state;
        return (
            <div className="message-audio">
                <div className="audio-main">
                    <div className="audio-action-wrapper">
                        {this.getMediaAction(mediaInfo)}
                    </div>
                    <div className="audio-info">
                        <div className="audio-title">{mediaInfo.title}</div>
                        {this.downloaded && <div className="audio-performer">{mediaInfo.performer}</div>}
                        {!this.downloaded && <div className="audio-performer">&nbsp;</div>}
                    </div>
                </div>
                {Boolean(mediaInfo.caption.length > 0) &&
                <div
                    className={'audio-caption ' + (message.rtl ? 'rtl' : 'ltr')}
                >{renderBody(mediaInfo.caption, mediaInfo.entityList, this.isElectron, this.props.onBodyAction, this.props.measureFn)}</div>}
            </div>
        );
    }

    /* Get media action */
    private getMediaAction(info: IMediaInfo) {
        const {message, playing} = this.state;
        if (!this.downloaded || (message.id || 0) < 0) {
            return (
                <DownloadProgress className="audio-item-action" id={message.id || 0}
                                  fileSize={info.size} onComplete={this.downloadCompleteHandler}
                                  onAction={this.downloadProgressActionHandler}
                                  thumbFile={info.thumbFile}
                />);
        } else {
            return (<div
                className={'audio-item-action' + (info.thumbFile && info.thumbFile.fileid !== '' ? ' has-cover' : '')}>
                <CachedPhoto className="audio-thumbnail" fileLocation={info.thumbFile}/>
                <div className="audio-action" onClick={this.audioActionClickHandler(message.id || 0)}>
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
    private audioActionClickHandler = (id: number) => (e: any) => {
        const {playing} = this.state;
        if (!playing) {
            this.audioPlayer.play(id, true);
        } else {
            this.audioPlayer.pause(id);
        }
    }

    /* Audio player handler */
    private audioPlayerHandler = (e: IAudioEvent) => {
        const {playing} = this.state;
        if ((e.state === 'play' || e.state === 'seek_play') && !playing) {
            this.setState({
                playing: true,
            });
        } else if ((e.state === 'pause' || e.state === 'seek_pause') && playing) {
            this.setState({
                playing: false,
            });
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

    /* Download complete handler */
    private downloadCompleteHandler = (id: number) => {
        this.downloaded = true;
        this.forceUpdate();
    }
}

export default MessageAudio;
