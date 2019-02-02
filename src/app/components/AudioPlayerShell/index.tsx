/*
    Creation Time: 2019 - Jan - 22
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import AudioPlayer, {IAudioEvent, IAudioInfo} from '../../services/audioPlayer';
import {CloseRounded, PauseRounded, PlayArrowRounded, SlowMotionVideoRounded} from '@material-ui/icons';
import UserName from '../UserName';
import {Link} from 'react-router-dom';

import './style.css';

interface IProps {
    className?: string;
    onVisible: (visible: boolean) => void;
}

interface IState {
    className: string;
    fast: boolean;
    messageId: number;
    peerId: string;
    playState: 'play' | 'pause' | 'seek_play' | 'seek_pause';
    userId: string;
}

class AudioPlayerShell extends React.Component<IProps, IState> {
    private audioPlayer: AudioPlayer;
    private eventReferences: any[] = [];
    private shellRef: any = null;
    private messageId: number = 0;
    private open: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            fast: false,
            messageId: 0,
            peerId: '',
            playState: 'pause',
            userId: '',
        };

        this.audioPlayer = AudioPlayer.getInstance();
    }

    public componentDidMount() {
        this.eventReferences.push(this.audioPlayer.globalListen(this.audioProgressHandler));
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {className, fast, messageId, peerId, playState, userId} = this.state;
        return (
            <div ref={this.shellRefHandler} className={'audio-player-shell ' + className}>
                <div className="shell">
                    <div className="audio-player-play-action">
                        {Boolean(playState === 'pause' || playState === 'seek_pause') &&
                        <PlayArrowRounded onClick={this.playHandler}/>}
                        {Boolean(playState === 'play' || playState === 'seek_play') &&
                        <PauseRounded onClick={this.pauseHandler}/>}
                    </div>
                    <div className="audio-player-content">
                        {Boolean(userId !== '') && <div className="audio-player-anchor">
                            <Link to={`/chat/${peerId}/${messageId}`}>
                                Playing from: <UserName className="user" id={userId} unsafe={true} noDetail={true}/>
                            </Link>
                        </div>}
                    </div>
                    <div className="audio-player-action">
                        <SlowMotionVideoRounded className={(fast ? 'enable' : '')} onClick={this.fastToggleHandler}/>
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
        this.audioPlayer.play(this.messageId);
    }

    private pauseHandler = () => {
        this.setState({
            playState: 'pause',
        });
        this.audioPlayer.pause(this.messageId);
    }

    private cancelHandler = () => {
        this.openPlayer(false);
        if (this.state.playState === 'play') {
            this.audioPlayer.pause(this.messageId);
        }
    }

    private fastToggleHandler = () => {
        this.setState({
            fast: !this.state.fast,
        }, () => {
            this.audioPlayer.fast(this.state.fast);
        });
    }

    private openPlayer(open?: boolean) {
        if (!this.shellRef) {
            return;
        }
        if (open === undefined) {
            this.shellRef.classList.toggle('open');
            this.open = !this.open;
        } else {
            if (open && !this.open) {
                this.shellRef.classList.add('open');
                this.open = true;
            } else if (!open && this.open) {
                this.shellRef.classList.remove('open');
                this.open = false;
            }
        }
        this.props.onVisible(this.open);
    }

    private setPlayState(e: IAudioEvent) {
        if (e.state === 'play' || e.state === 'seek_play') {
            this.openPlayer(true);
        }
        if (this.state.playState !== e.state) {
            this.setState({
                playState: e.state,
            });
        }
    }

    private audioProgressHandler = (info: IAudioInfo, e: IAudioEvent) => {
        this.messageId = info.messageId;
        if (info.userId !== '' && this.state.userId !== info.userId) {
            this.setState({
                userId: info.userId,
            });
        }
        if (info.peerId !== '' && this.state.peerId !== info.peerId) {
            this.setState({
                peerId: info.peerId,
            });
        }
        if (info.messageId !== 0 && this.state.messageId !== info.messageId) {
            this.setState({
                messageId: info.messageId,
            });
        }
        if (this.state.fast !== info.fast) {
            this.setState({
                fast: info.fast,
            });
        }
        this.setPlayState(e);
    }
}

export default AudioPlayerShell;
