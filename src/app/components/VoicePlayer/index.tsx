/*
    Creation Time: 2018 - Jan - 08
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import React from 'react';
import {ArrowDownwardRounded, CloseRounded, PauseRounded, PlayArrowRounded} from '@material-ui/icons';
import ProgressBroadcaster from '../../services/progress';
import {IMessage} from '../../repository/message/interface';
import {IFileProgress} from '../../services/sdk/fileManager';
import AudioPlayer, {C_INSTANT_AUDIO, IAudioEvent} from '../../services/audioPlayer';
import Broadcaster from '../../services/broadcaster';
import {MessageEntity, PeerType} from '../../services/sdk/messages/core.types_pb';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import SettingsConfigManager from '../../services/settingsConfigManager';
import {ThemeChanged} from "../SettingsMenu";
import {EventMouseUp, EventRightMenuToggled} from "../../services/events";
import {
    DocumentAttributeAudio,
    DocumentAttributeType, DocumentAttributeVoiceCall,
    MediaDocument
} from "../../services/sdk/messages/chat.messages.medias_pb";
import {from4bitResolution} from "../ChatInput/utils";
import {base64ToU8a} from "../../services/sdk/fileManager/http/utils";
import {GetDbFileName} from "../../repository/file";

import './style.scss';

interface IProps {
    className?: string;
    max: number;
    sampleCount?: number;
    message?: IMessage;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'play') => void;
}

interface IState {
    className: string;
    playState: 'play' | 'pause' | 'seek_play' | 'seek_pause' | 'progress' | 'download';
}

export interface IVoicePlayerData {
    bars: number[];
    caption?: string;
    duration: number;
    fileName?: string;
    entityList?: MessageEntity.AsObject[];
    state: 'pause' | 'progress' | 'download';
    voice?: Blob;
    isCall?: boolean;
    callAttempts?: number,
    callAttemptSleep?: number,
}

export const getVoiceInfo = (message: IMessage): IVoicePlayerData => {
    const info: IVoicePlayerData = {
        bars: [],
        caption: '',
        duration: 0,
        fileName: '',
        state: 'download',
    };
    const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
    if (!messageMediaDocument) {
        return info;
    }
    info.caption = messageMediaDocument.caption || '';
    if (messageMediaDocument.entitiesList) {
        info.entityList = messageMediaDocument.entitiesList;
    }
    info.fileName = GetDbFileName(messageMediaDocument.doc.id, messageMediaDocument.doc.clusterid);
    if (!message.attributes) {
        return info;
    }
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
        } else if (item.type === DocumentAttributeType.ATTRIBUTETYPEVOICECALL) {
            if (message.attributes && message.attributes[index]) {
                const attr: DocumentAttributeVoiceCall.AsObject = message.attributes[index];
                info.isCall = true;
                info.callAttempts = attr.maxcallattempts;
                info.callAttemptSleep = attr.callattemptsleep;
            }
        }
    });
    return info;
};

class VoicePlayer extends React.PureComponent<IProps, IState> {
    private bars: number[] = [];
    private voice: Blob | undefined;
    private duration: number = 0;
    private canvasConfig: { height: number, width: number, barWidth: number, barSpace: number, totalWith: number, ratio: number, maxBars: number, color: string } = {
        barSpace: 1,
        barWidth: 2,
        color: '#1A1A1A',
        height: 0,
        maxBars: 200,
        ratio: 1,
        totalWith: 3,
        width: 0,
    };
    private canvasRef: any = null;
    private canvasCtx: CanvasRenderingContext2D | null = null;
    private playVoiceBarRef: any = null;
    private playVoiceBarImgRef: any = null;
    private playVoiceBarBaseImgRef: any = null;
    private timerRef: any = null;
    private audio: HTMLAudioElement | undefined;
    private playerInterval: any = null;
    private onSeek: boolean = false;
    private circleProgressRef: any = null;
    private eventReferences: any[] = [];
    private progressBroadcaster: ProgressBroadcaster;
    private voiceFileName: string | undefined;
    private audioPlayer: AudioPlayer;
    private readSent: boolean = false;
    private broadcaster: Broadcaster;
    private settingsConfigManager: SettingsConfigManager;
    private objectUrlImages: string[] = [];
    private themeChangeEvent: any = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            playState: props.message && props.message.id > 0 ? (props.message.downloaded ? 'pause' : 'download') : 'progress',
        };

        this.progressBroadcaster = ProgressBroadcaster.getInstance();
        this.audioPlayer = AudioPlayer.getInstance();
        if (this.props.message) {
            this.readSent = this.props.message.contentread || false;
        }

        this.broadcaster = Broadcaster.getInstance();
        this.settingsConfigManager = SettingsConfigManager.getInstance();
    }

    public componentDidMount() {
        window.addEventListener(EventMouseUp, this.windowMouseUpHandler);
        window.addEventListener(EventRightMenuToggled, this.themeChangedHandler);
        this.themeChangeEvent = this.broadcaster.listen(ThemeChanged, this.themeChangedHandler);
        if (this.props.message && (this.props.message.id || 0) > 0) {
            this.eventReferences.push(this.audioPlayer.listen(this.props.message.id || 0, this.audioPlayerHandler));
        }
    }

    // public UNSAFE_componentWillReceiveProps(newProps: IProps) {
    //     if (newProps.message && (newProps.message.id || 0) < 0 && this.progressBroadcaster.isActive(newProps.message.id || 0)) {
    //         this.removeAllListeners();
    //         this.setState({
    //             playState: 'progress',
    //         }, () => {
    //             this.eventReferences.push(this.progressBroadcaster.listen(newProps.message.id || 0, this.uploadProgressHandler));
    //         });
    //     }
    // }

    public componentWillUnmount() {
        this.removeAllListeners();
        this.revokeUrlImages();
        if (this.themeChangeEvent) {
            this.themeChangeEvent();
        }
        window.removeEventListener(EventMouseUp, this.windowMouseUpHandler);
        window.removeEventListener(EventRightMenuToggled, this.themeChangedHandler);
        this.audioPlayer.remove(C_INSTANT_AUDIO);
    }

    /* Set voice metadata and file */
    public setData(data: IVoicePlayerData) {
        const {message} = this.props;
        this.duration = data.duration;
        this.displayTimer();
        this.bars = data.bars;
        setTimeout(() => {
            this.windowResizeHandler();
            this.displayCompleteBars(true);
            this.displayCompleteBars(false);
        }, 196);
        if (data.voice) {
            this.voice = data.voice;
            this.removeAllListeners();
            this.eventReferences.push(this.audioPlayer.listen(C_INSTANT_AUDIO, this.audioPlayerHandler));
            this.audioPlayer.setInstantVoice(this.voice);
        }
        this.setVoiceState(data.state);
        if (data.fileName) {
            this.voiceFileName = data.fileName;
            if (message) {
                this.audioPlayer.addToPlaylist(message.id || 0, {
                    id: message.peerid || '',
                    peerType: message.peertype || 0
                }, this.voiceFileName, message.senderid || '', message.downloaded || false);
                this.removeAllListeners();
                this.eventReferences.push(this.audioPlayer.listen(message.id || 0, this.audioPlayerHandler));
                if (message && !message.downloaded) {
                    this.eventReferences.push(this.progressBroadcaster.listen(message.id || 0, this.uploadProgressHandler));
                }
            }
        }
    }

    /* Set voice state */
    public setVoiceState(state: 'play' | 'pause' | 'seek_play' | 'seek_pause' | 'progress' | 'download') {
        // Prevent state change on buffer mode
        if (this.voice) {
            return;
        }

        if (this.state.playState !== state) {
            this.setState({
                playState: state,
            });
        }

        const {message} = this.props;
        if (!message) {
            return;
        }

        if (state === 'pause') {
            this.removeAllListeners();
            this.eventReferences.push(this.audioPlayer.listen(message.id || 0, this.audioPlayerHandler));
            if (this.voiceFileName) {
                this.audioPlayer.addToPlaylist(message.id || 0, {
                    id: message.peerid || '',
                    peerType: message.peertype || 0,
                }, this.voiceFileName, message.senderid || '', message.downloaded || false);
            }
            return;
        }

        if (state === 'progress') {
            this.removeAllListeners();
            if (message && !message.downloaded) {
                this.eventReferences.push(this.progressBroadcaster.listen(message.id || 0, this.uploadProgressHandler));
            }
        } else {
            if (this.progressBroadcaster.isActive(message.id || 0)) {
                this.setState({
                    playState: 'progress',
                }, () => {
                    this.removeAllListeners();
                    if (message && !message.downloaded) {
                        this.eventReferences.push(this.progressBroadcaster.listen(message.id || 0, this.uploadProgressHandler));
                    }
                });
            } else {
                if (message && !message.downloaded) {
                    const ds = this.settingsConfigManager.getDownloadSettings();
                    switch (message.peertype) {
                        case PeerType.PEERUSER:
                        case PeerType.PEEREXTERNALUSER:
                            if ((message.messagetype === C_MESSAGE_TYPE.Voice || message.messagetype === C_MESSAGE_TYPE.VoiceMail) && ds.chat_voices) {
                                this.downloadVoiceHandler();
                            }
                            break;
                        case PeerType.PEERGROUP:
                            if ((message.messagetype === C_MESSAGE_TYPE.Voice || message.messagetype === C_MESSAGE_TYPE.VoiceMail) && ds.group_voices) {
                                this.downloadVoiceHandler();
                            }
                            break;
                    }
                }
            }
        }
    }

    public render() {
        const {className, playState} = this.state;
        return (
            <div className={'voice-player ' + className} onDoubleClick={this.doubleClickHandler}>
                <div className="play-action">
                    {Boolean(playState === 'pause' || playState === 'seek_pause') &&
                    <PlayArrowRounded onClick={this.playVoiceHandler}/>}
                    {Boolean(playState === 'play' || playState === 'seek_play') &&
                    <PauseRounded onClick={this.pauseVoiceHandler}/>}
                    {Boolean(playState === 'download') &&
                    <ArrowDownwardRounded onClick={this.downloadVoiceHandler}/>}
                    {Boolean(playState === 'progress') && <>
                        <div className="progress">
                            <svg viewBox="0 0 32 32">
                                <circle ref={this.progressRefHandler} r="12" cx="16" cy="16"/>
                            </svg>
                        </div>
                        <CloseRounded className="action" onClick={this.cancelVoiceHandler}/>
                    </>}
                </div>
                <div className="play-preview" onMouseDown={this.barMouseDownHandler}
                     onMouseMove={this.barMouseMoveHandler}>
                    <canvas className="canvas-img" ref={this.canvasRefHandler}/>
                    <img className="base-img" ref={this.playVoiceBarBaseImgRefHandler} draggable={false} alt=""/>
                    <div ref={this.playVoiceBarRefHandler}
                         className={'play-preview-overlay ' + ((playState === 'seek_pause' || playState === 'seek_play') ? 'no-transition' : '')}>
                        <img className="top-img" ref={this.playVoiceBarImgRefHandler} draggable={false} alt=""/>
                    </div>
                </div>
                <div className="play-timer" ref={this.timerRefHandler}>00:00</div>
            </div>
        );
    }

    /* Window resize handler */
    private windowResizeHandler = () => {
        if (!this.canvasRef) {
            return;
        }
        const el = this.canvasRef.parentElement;
        if (el) {
            this.canvasConfig.height = el.clientHeight;
            this.canvasConfig.width = el.clientWidth;
            this.canvasConfig.totalWith = this.canvasConfig.barWidth + this.canvasConfig.barSpace;
            this.canvasConfig.ratio = (this.canvasConfig.height - 1) / this.props.max;
            this.canvasConfig.maxBars = Math.floor(this.canvasConfig.width / (this.canvasConfig.barWidth + this.canvasConfig.barSpace));
            const htmlEl = document.querySelector('html');
            if (htmlEl) {
                if (this.props.message) {
                    this.canvasConfig.color = (htmlEl.getAttribute('theme') === 'light' && htmlEl.getAttribute('gradient') !== '1') ? '#1A1A1A' : '#E6E6E6';
                } else {
                    this.canvasConfig.color = htmlEl.getAttribute('theme') === 'light' ? '#1A1A1A' : '#E6E6E6';
                }
            }
            if (this.canvasRef && this.canvasCtx) {
                this.canvasCtx.canvas.height = (this.canvasConfig.height);
                this.canvasCtx.canvas.width = (this.canvasConfig.width);
            }
        }
    }

    /* Canvas ref handler */
    private canvasRefHandler = (ref: any) => {
        if (!ref) {
            return;
        }
        this.canvasRef = ref;
        this.canvasCtx = ref.getContext('2d');
        if (this.canvasCtx) {
            requestAnimationFrame(this.windowResizeHandler);
        }
    }

    /* Voice bar ref handler */
    private playVoiceBarRefHandler = (ref: any) => {
        this.playVoiceBarRef = ref;
    }

    /* Voice bar base img ref handler */
    private playVoiceBarBaseImgRefHandler = (ref: any) => {
        this.playVoiceBarBaseImgRef = ref;
    }

    /* Voice bar img ref handler */
    private playVoiceBarImgRefHandler = (ref: any) => {
        this.playVoiceBarImgRef = ref;
    }

    /* Timer ref handler */
    private timerRefHandler = (ref: any) => {
        this.timerRef = ref;
    }

    /* Display voice recorder timer */
    private displayTimer(duration?: number) {
        if (!this.timerRef) {
            return;
        }
        duration = Math.floor(duration || this.duration);
        let sec: string | number = duration % 60;
        let min: string | number = Math.floor(duration / 60);
        if (sec < 10) {
            sec = `0${sec}`;
        }
        if (min < 10) {
            min = `0${min}`;
        }
        this.timerRef.innerHTML = `${min}:${sec}`;
    }

    /* Display bars and set overlay img */
    private displayCompleteBars(overlay: boolean) {
        if (!this.canvasCtx) {
            return;
        }

        this.canvasCtx.clearRect(0, 0, this.canvasConfig.width, this.canvasConfig.height);
        const canvasYMid = this.canvasConfig.height / 2;

        let x = 0;
        const ratio = (this.props.sampleCount || 200) / this.canvasConfig.maxBars;

        for (let i = 0; i < this.canvasConfig.maxBars; i++) {
            const barHeight = Math.floor(this.bars[Math.floor(i * ratio)] * this.canvasConfig.ratio) + 1;

            this.canvasCtx.fillStyle = overlay ? this.canvasConfig.color : this.canvasConfig.color + '33';
            this.canvasCtx.fillRect(x, canvasYMid - barHeight / 2, this.canvasConfig.barWidth, barHeight);

            x += this.canvasConfig.totalWith;
        }
        if (overlay) {
            if (this.playVoiceBarImgRef) {
                this.playVoiceBarImgRef.src = this.canvasRef.toDataURL('image/png');
                this.objectUrlImages.push(this.playVoiceBarImgRef.src);
            }
        } else {
            if (this.playVoiceBarBaseImgRef) {
                this.playVoiceBarBaseImgRef.src = this.canvasRef.toDataURL('image/png');
                this.objectUrlImages.push(this.playVoiceBarBaseImgRef.src);
            }
        }
    }

    /* Play voice handler */
    private playVoiceHandler = () => {
        const {message} = this.props;
        if (this.voice) {
            this.audioPlayer.play(C_INSTANT_AUDIO).catch(() => {
                if (!this.voice) {
                    return;
                }
                this.audioPlayer.setInstantVoice(this.voice, () => {
                    this.audioPlayer.play(C_INSTANT_AUDIO);
                });
            });
        } else if (this.voiceFileName && message) {
            this.audioPlayer.play(message.id || 0, true).catch((err) => {
                window.console.log(err, message);
            });
        }
    }

    /* Pause voice handler */
    private pauseVoiceHandler = () => {
        const {message} = this.props;
        if (this.voice) {
            this.audioPlayer.pause(C_INSTANT_AUDIO);
        } else if (this.voiceFileName && message) {
            this.audioPlayer.pause(message.id || 0);
        }
    }

    /* Seek voice */
    private seekAudio(ratio: number) {
        this.playVoiceBarRef.style.width = `${ratio * 100}%`;
        const {message} = this.props;
        if (this.voice) {
            this.audioPlayer.seekTo(C_INSTANT_AUDIO, ratio);
        } else if (this.voiceFileName && message) {
            this.audioPlayer.seekTo(message.id || 0, ratio);
        }
    }

    /* Start player interval */
    private startPlayerInterval() {
        clearInterval(this.playerInterval);
        this.playerInterval = setInterval(() => {
            if (!this.playVoiceBarRef || !this.audio) {
                return;
            }
            this.playVoiceBarRef.style.width = `${((this.audio.currentTime / this.audio.duration) * 100)}%`;
            this.displayTimer(this.audio.currentTime);
        }, 100);
    }

    /* Stop player interval */
    private stopPlayerInterval() {
        clearInterval(this.playerInterval);
    }

    /* Bar mouse down handler */
    private barMouseDownHandler = (e: any) => {
        const {playState} = this.state;
        if (playState === 'progress' || playState === 'download') {
            return;
        }
        if (this.audioPlayer.isSongPlaying()) {
            if (this.props.message && this.props.message.id !== this.audioPlayer.getCurrentTrack()) {
                return;
            }
        }
        this.onSeek = true;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        if (playState !== 'seek_play' && playState !== 'seek_pause') {
            if (playState === 'play') {
                this.setState({
                    playState: 'seek_play',
                });
            } else {
                this.setState({
                    playState: 'seek_pause',
                });
            }
        }
        this.stopPlayerInterval();
        this.seekAudio(ratio);
    }

    /* Bar mouse move handler */
    private barMouseMoveHandler = (e: any) => {
        if (this.onSeek) {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            this.seekAudio(ratio);
        }
    }

    /* Window mouse up handler */
    private windowMouseUpHandler = () => {
        this.onSeek = false;
        if (this.onSeek) {
            return;
        }
        const {playState} = this.state;
        if (playState === 'seek_play' || playState === 'seek_pause') {
            if (playState === 'seek_play') {
                this.setState({
                    playState: 'play',
                });
                this.startPlayerInterval();
            } else {
                this.setState({
                    playState: 'pause',
                });
            }
        }
    }

    /* Theme change handler */
    private themeChangedHandler = () => {
        this.windowResizeHandler();
        this.displayCompleteBars(true);
        this.displayCompleteBars(false);
    }

    /* Player double click handler */
    private doubleClickHandler = (e: any) => {
        e.stopPropagation();
    }

    /* Progress circle ref handler */
    private progressRefHandler = (ref: any) => {
        this.circleProgressRef = ref;
    }

    /* Upload progress handler */
    private uploadProgressHandler = (progress: IFileProgress) => {
        // Prevent state change on buffer mode
        if (!this.circleProgressRef || this.voice) {
            return;
        }
        let v = 3;
        if (progress.state === 'failed') {
            this.setState({
                playState: 'download',
            });
            return;
        } else if (progress.state !== 'complete' && progress.download > 0) {
            v = progress.progress * 73;
        } else if (progress.state === 'complete') {
            v = 75;
            this.setVoiceState('pause');
        }
        if (v < 3) {
            v = 3;
        }
        if (this.circleProgressRef) {
            this.circleProgressRef.style.strokeDasharray = `${v} 75`;
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

    /* Revoke url images */
    private revokeUrlImages() {
        this.objectUrlImages.forEach((item) => {
            URL.revokeObjectURL(item);
        });
    }

    /* Download voice handler */
    private downloadVoiceHandler = () => {
        if (this.props.onAction) {
            this.props.onAction('download');
        }
    }

    /* Cancel voice handler */
    private cancelVoiceHandler = () => {
        if (this.props.onAction) {
            if (this.props.message && (this.props.message.id || 0) < 0) {
                this.props.onAction('cancel');
            } else {
                this.props.onAction('cancel_download');
            }
        }
    }

    /* Audio player event handler */
    private audioPlayerHandler = (event: IAudioEvent) => {
        if (this.props.message && this.props.message.id < 0) {
            return;
        }
        this.playVoiceBarRef.style.width = `${event.progress * 100}%`;
        this.displayTimer(event.currentTime);
        if (this.state.playState !== event.state) {
            if (!this.readSent && this.props.onAction && (event.state === 'play' || event.state === 'seek_play')) {
                this.readSent = true;
                this.props.onAction('play');
            }
            this.setState({
                playState: event.state,
            });
        }
    }

    // /* Broadcast event */
    // private broadcastEvent(name: string, data: any) {
    //     const event = new CustomEvent(name, {
    //         bubbles: false,
    //         detail: data,
    //     });
    //     window.dispatchEvent(event);
    // }
}

export default VoicePlayer;
