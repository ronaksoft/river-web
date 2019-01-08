/*
    Creation Time: 2018 - Jan - 08
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {PlayArrowRounded, PauseRounded} from '@material-ui/icons';

import './style.css';

interface IProps {
    className?: string;
    maxValue: number;
    sampleCount?: number;
}

interface IState {
    className: string;
    playState: 'play' | 'pause' | 'seek_play' | 'seek_pause';
}

export interface IVoicePlayerData {
    bars: number[];
    voice: Blob;
    duration: number;
}

class VoicePlayer extends React.Component<IProps, IState> {
    private bars: number[] = [];
    private voice: Blob;
    private duration: number;
    private canvasConfig: { height: number, width: number, barWidth: number, barSpace: number, totalWith: number, ratio: number, maxBars: number, color: string } = {
        barSpace: 2,
        barWidth: 2,
        color: '#1A1A1A',
        height: 0,
        maxBars: 200,
        ratio: 1,
        totalWith: 4,
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
    private perciseDuration: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            playState: 'pause',
        };
    }

    public componentDidMount() {
        window.addEventListener('mouseup', this.windowMouseUpHandler);
        window.addEventListener('Theme_Changed', this.themeChangedHandler);
    }

    public componentWillUnmount() {
        window.removeEventListener('mouseup', this.windowMouseUpHandler);
        window.removeEventListener('Theme_Changed', this.themeChangedHandler);
    }

    public setData(data: IVoicePlayerData) {
        this.duration = data.duration;
        this.perciseDuration = data.duration;
        this.displayTimer();
        this.bars = data.bars;
        setTimeout(() => {
            this.windowResizeHandler();
            this.displayCompleteBars(true);
            this.displayCompleteBars(false);
        }, 100);
        this.voice = data.voice;
        this.prepareVoice();
    }

    public render() {
        const {className, playState} = this.state;
        return (
            <div className={'voice-player ' + className}>
                <div className="play-action">
                    {Boolean(playState === 'pause' || playState === 'seek_pause') &&
                    <PlayArrowRounded onClick={this.playVoiceHandler}/>}
                    {Boolean(playState === 'play' || playState === 'seek_play') &&
                    <PauseRounded onClick={this.pauseVoiceHandler}/>}
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

    /* Play voice */
    private prepareVoice() {
        this.audio = document.createElement('audio');
        this.audio.src = URL.createObjectURL(this.voice);
        this.audio.onloadedmetadata = () => {
            this.perciseDuration = this.audio.duration;
        };
        this.audio.load();
    }

    /* Play voice handler */
    private playVoiceHandler = () => {
        this.audio.play().then(() => {
            this.setState({
                playState: 'play',
            });
            this.startPlayerInterval();
            this.audio.onended = () => {
                this.stopPlayerInterval();
                this.seekAudio(0);
                this.displayTimer(this.perciseDuration);
                this.setState({
                    playState: 'pause',
                });
            };
        });
    }

    /* Pause voice handler */
    private pauseVoiceHandler = () => {
        this.setState({
            playState: 'pause',
        });
        this.audio.pause();
        this.stopPlayerInterval();
    }

    /* Seek voice */
    private seekAudio(ratio: number) {
        this.playVoiceBarRef.style.width = `${ratio * 100}%`;
        if (this.audio) {
            const time = this.perciseDuration * ratio;
            this.audio.currentTime = time;
        }
    }

    /* Start player interval */
    private startPlayerInterval() {
        clearInterval(this.playerInterval);
        this.playerInterval = setInterval(() => {
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
        const {playState} = this.state;
        this.onSeek = false;
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
}

export default VoicePlayer;
