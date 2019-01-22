/*
    Creation Time: 2019 - Jan - 22
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import AudioPlayer from '../../services/audioPlayer';
import {CloseRounded, PauseRounded, PlayArrowRounded, SlowMotionVideoRounded} from '@material-ui/icons';

import './style.css';

interface IProps {
    className?: string;
}

interface IState {
    className: string;
    playState: 'play' | 'pause' | 'seek_play' | 'seek_pause';
}

class AudioPlayerShell extends React.Component<IProps, IState> {
    // @ts-ignore
    private audioPlayer: AudioPlayer;
    // @ts-ignore
    private eventReferences: any[] = [];
    private shellRef: any = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            playState: 'pause',
        };

        this.audioPlayer = AudioPlayer.getInstance();
    }

    public componentDidMount() {
        //
    }

    public componentWillUnmount() {
        //
    }

    public render() {
        const {className, playState} = this.state;
        return (
            <div ref={this.shellRefHandler} className={'audio-player-shell open ' + className}>
                <div className="shell">
                    <div className="audio-player-play-action">
                        {Boolean(playState === 'pause' || playState === 'seek_pause') &&
                        <PlayArrowRounded onClick={this.playHandler}/>}
                        {Boolean(playState === 'play' || playState === 'seek_play') &&
                        <PauseRounded onClick={this.pauseHandler}/>}
                    </div>
                    <div className="audio-player-content"/>
                    <div className="audio-player-action">
                        <SlowMotionVideoRounded/>
                        <CloseRounded className="action" onClick={this.cancelHandler}/>
                    </div>
                </div>
            </div>
        );
    }

    private shellRefHandler = (ref: any) => {
        this.shellRef = ref;
    }

    private playHandler = () => {
        this.setState({
            playState: 'play',
        });
    }

    private pauseHandler = () => {
        this.setState({
            playState: 'pause',
        });
    }

    private cancelHandler = () => {
        //
        this.openPlayer();
    }

    private openPlayer() {
        if (!this.shellRef) {
            return;
        }
        this.shellRef.classList.toggle('open');
    }
}

export default AudioPlayerShell;
