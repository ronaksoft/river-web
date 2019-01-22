/*
    Creation Time: 2018 - Jan - 08
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {PlayArrowRounded, PauseRounded, CloseRounded, ArrowDownwardRounded} from '@material-ui/icons';
import ProgressBroadcaster from '../../services/progress';
import {IMessage} from '../../repository/message/interface';
import {IFileProgress} from '../../services/sdk/fileServer';
import AudioPlayer, {C_INSTANT_AUDIO, IAudioEvent} from '../../services/audioPlayer';

import './style.css';

interface IProps {
    className?: string;
    maxValue: number;
    sampleCount?: number;
    message?: IMessage;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download') => void;
}

interface IState {
    className: string;
    playState: 'play' | 'pause' | 'seek_play' | 'seek_pause' | 'progress' | 'download';
}

export interface IVoicePlayerData {
    bars: number[];
    duration: number;
    state: 'pause' | 'progress' | 'download';
    voice?: Blob;
    voiceId?: string;
}

class VoicePlayer extends React.Component<IProps, IState> {
    private bars: number[] = [];
    private voice: Blob;
    private duration: number;
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
    private timerRef: any = null;
    private audio: HTMLAudioElement;
    private playerInterval: any = null;
    private onSeek: boolean = false;
    private circleProgressRef: any = null;
    private eventReferences: any[] = [];
    private progressBroadcaster: ProgressBroadcaster;
    private voiceId: string | undefined;
    private audioPlayer: AudioPlayer;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            playState: 'pause',
        };

        this.progressBroadcaster = ProgressBroadcaster.getInstance();
        this.audioPlayer = AudioPlayer.getInstance();
    }

    public componentDidMount() {
        window.addEventListener('mouseup', this.windowMouseUpHandler);
        window.addEventListener('Theme_Changed', this.themeChangedHandler);
        if (this.props.message && (this.props.message.id || 0) > 0) {
            this.eventReferences.push(this.audioPlayer.listen(this.props.message.id || 0, this.audioPlayerHandler));
        }
    }

    public componentWillUnmount() {
        this.removeAllListeners();
        window.removeEventListener('mouseup', this.windowMouseUpHandler);
        window.removeEventListener('Theme_Changed', this.themeChangedHandler);
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
        }, 100);
        if (data.voice) {
            this.voice = data.voice;
            this.eventReferences.push(this.audioPlayer.listen(C_INSTANT_AUDIO, this.audioPlayerHandler));
            this.audioPlayer.setInstantVoice(this.voice);
        }
        this.setVoiceState(data.state);
        if (data.voiceId) {
            this.voiceId = data.voiceId;
            if (message) {
                this.audioPlayer.addToPlaylist(message.id || 0, message.peerid || '', this.voiceId, message.senderid || '', message.downloaded || false);
            }
        }
    }

    /* Set voice state */
    public setVoiceState(state: 'play' | 'pause' | 'seek_play' | 'seek_pause' | 'progress' | 'download') {
        this.setState({
            playState: state,
        });

        const {message} = this.props;
        if (!message) {
            return;
        }

        if (state === 'progress') {
            this.removeAllListeners();
            this.eventReferences.push(this.progressBroadcaster.listen(message.id || 0, this.uploadProgressHandler));
        } else {
            if (this.progressBroadcaster.isActive(message.id || 0)) {
                this.setState({
                    playState: 'progress',
                }, () => {
                    this.removeAllListeners();
                    this.eventReferences.push(this.progressBroadcaster.listen(message.id || 0, this.uploadProgressHandler));
                });
            }
        }
        if (state === 'pause') {
            this.removeAllListeners();
            this.eventReferences.push(this.audioPlayer.listen(message.id || 0, this.audioPlayerHandler));
            if (this.voiceId) {
                this.audioPlayer.addToPlaylist(message.id || 0, message.peerid || '', this.voiceId, message.senderid || '', message.downloaded || false);
            }
        }
    }

    /* Set voice Id */
    public setVoiceId(id?: string) {
        const {message} = this.props;
        this.voiceId = id;
        if (this.voiceId && message) {
            this.audioPlayer.addToPlaylist(message.id || 0, message.peerid || '', this.voiceId, message.senderid || '', message.downloaded || false);
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
                    {Boolean(playState === 'progress') && <React.Fragment>
                        <div className="progress">
                            <svg viewBox="0 0 32 32">
                                <circle ref={this.progressRefHandler} r="12" cx="16" cy="16"/>
                            </svg>
                        </div>
                        <CloseRounded className="action" onClick={this.cancelVoiceHandler}/>
                    </React.Fragment>}
                </div>
                <div className="play-preview" onMouseDown={this.barMouseDownHandler}
                     onMouseMove={this.barMouseMoveHandler}>
                    <canvas ref={this.canvasRefHandler}/>
                    <div ref={this.playVoiceBarRefHandler}
                         className={'play-preview-overlay ' + ((playState === 'seek_pause' || playState === 'seek_play') ? 'no-transition' : '')}>
                        <img ref={this.playVoiceBarImgRefHandler} draggable={false}/>
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
            this.canvasConfig.ratio = (this.canvasConfig.height - 1) / this.props.maxValue;
            this.canvasConfig.maxBars = Math.floor(this.canvasConfig.width / (this.canvasConfig.barWidth + this.canvasConfig.barSpace));
            const htmlEl = document.querySelector('html');
            if (htmlEl) {
                this.canvasConfig.color = htmlEl.getAttribute('theme') === 'light' ? '#1A1A1A' : '#E6E6E6';
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
            setTimeout(this.windowResizeHandler, 10);
        }
    }

    /* Voice bar ref handler */
    private playVoiceBarRefHandler = (ref: any) => {
        if (!ref) {
            return;
        }
        this.playVoiceBarRef = ref;
    }

    /* Voice bar img ref handler */
    private playVoiceBarImgRefHandler = (ref: any) => {
        if (!ref) {
            return;
        }
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
        duration = duration || this.duration;
        duration = Math.floor(duration);
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

        let barHeight;
        let x = 0;
        const ratio = (this.props.sampleCount || 200) / this.canvasConfig.maxBars;

        for (let i = 0; i < this.canvasConfig.maxBars; i++) {
            barHeight = Math.floor(this.bars[Math.floor(i * ratio)] * this.canvasConfig.ratio) + 1;

            this.canvasCtx.fillStyle = overlay ? this.canvasConfig.color : this.canvasConfig.color + '33';
            this.canvasCtx.fillRect(x, this.canvasConfig.height - barHeight, this.canvasConfig.barWidth, this.canvasConfig.height);

            x += this.canvasConfig.totalWith;
        }
        if (overlay) {
            this.playVoiceBarImgRef.src = this.canvasRef.toDataURL('image/png');
        }
    }

    /* Play voice handler */
    private playVoiceHandler = () => {
        const {message} = this.props;
        if (this.voice) {
            if (!this.audioPlayer.play(C_INSTANT_AUDIO)) {
                this.audioPlayer.setInstantVoice(this.voice, () => {
                    this.audioPlayer.play(C_INSTANT_AUDIO);
                });
            }
        } else if (this.voiceId && message) {
            this.audioPlayer.play(message.id || 0);
        }
    }

    /* Pause voice handler */
    private pauseVoiceHandler = () => {
        const {message} = this.props;
        if (this.voice) {
            this.audioPlayer.pause(C_INSTANT_AUDIO);
        } else if (this.voiceId && message) {
            this.audioPlayer.pause(message.id || 0);
        }
    }

    /* Seek voice */
    private seekAudio(ratio: number) {
        this.playVoiceBarRef.style.width = `${ratio * 100}%`;
        const {message} = this.props;
        if (this.voice) {
            this.audioPlayer.seekTo(C_INSTANT_AUDIO, ratio);
        } else if (this.voiceId && message) {
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
        if (!this.circleProgressRef) {
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
        }
        if (v < 3) {
            v = 3;
        }
        this.circleProgressRef.style.strokeDasharray = `${v} 75`;
    }

    /* Remove all listeners */
    private removeAllListeners() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
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

    private audioPlayerHandler = (event: IAudioEvent) => {
        this.playVoiceBarRef.style.width = `${event.progress * 100}%`;
        this.displayTimer(event.currentTime);
        if (this.state.playState !== event.state) {
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
