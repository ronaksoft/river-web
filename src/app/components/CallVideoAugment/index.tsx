/*
    Creation Time: 2021 - Jan - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2021
*/

import * as React from 'react';
import UserAvatar from "../UserAvatar";
import i18n from '../../services/i18n';
import {MicOffRounded} from '@material-ui/icons';
import VoiceActivityDetection from "../../services/vad";

interface IProps {
    userId: string;
    videoMute: boolean;
}

interface IState {
    audioMute: boolean;
    videoMute: boolean;
    userId: string;
}

class CallVideoAugment extends React.Component<IProps, IState> {
    private mediaStream: MediaStream | undefined;
    private vod: VoiceActivityDetection | undefined;
    private vodWave: HTMLElement | undefined;
    private vodWaveSmooth: HTMLElement | undefined;
    private vodEnable: boolean = true;

    public static getDerivedStateFromProps(props: IProps, state: IState) {
        if (props.userId === state.userId) {
            return null;
        }
        return {
            userId: props.userId,
        };
    }

    constructor(props: IProps) {
        super(props);

        this.state = {
            audioMute: false,
            userId: props.userId,
            videoMute: props.videoMute,
        };
    }

    public setAudioMute(mute: boolean) {
        if (this.state.audioMute === mute) {
            return;
        }
        this.setState({
            audioMute: mute,
        }, () => {
            this.checkVOD();
        });
    }

    public setVideoMute(mute: boolean) {
        if (this.state.videoMute === mute) {
            return;
        }
        this.setState({
            videoMute: mute,
        }, () => {
            this.checkVOD();
        });
    }

    public setStream(stream: MediaStream) {
        if (this.vod && this.mediaStream !== stream) {
            this.destroyVOD();
        }
        this.mediaStream = stream;
        this.checkVOD();
    }

    public destroyVOD() {
        if (this.vod) {
            this.vod.destroy(false);
            this.vod = undefined;
        }
    }

    public setVODEnable(enable: boolean) {
        this.vodEnable = enable;
    }

    public componentWillUnmount() {
        this.destroyVOD();
    }

    public render() {
        const {videoMute, audioMute, userId} = this.state;
        return <>
            {videoMute && userId && <div className="vod-wave">
                <div ref={this.vodWaveSmoothRefHandler} className="inner-smooth"/>
                <div ref={this.vodWaveRefHandler} className="inner"/>
            </div>}
            {videoMute && userId && <UserAvatar className="video-user-placeholder" id={userId} noDetail={true}/>}
            {audioMute && <div className="video-audio-muted">
                <MicOffRounded/>
                {i18n.t('call.muted')}
            </div>}
        </>;
    }

    private checkVOD() {
        if (!this.vodEnable) {
            return;
        }
        const {videoMute, audioMute, userId} = this.state;
        if (!window.AudioContext || !videoMute || audioMute || !userId) {
            this.destroyVOD();
            return;
        }
        if (!this.mediaStream || this.vod) {
            return;
        }
        this.vod = new VoiceActivityDetection({
            intervalTimeout: 96,
            maxVal: 100,
            sampleAmount: 6,
            smoothingTimeConstant: 0.3,
        });
        this.vod.onActivity((val) => {
            if (this.vodWave) {
                this.vodWave.style.transform = `scale(${1 + (val / 190)})`;
            }
            if (this.vodWaveSmooth) {
                this.vodWaveSmooth.style.transform = `scale(${1 + (val / 250)})`;
            }
        });
        this.vod.setStream(this.mediaStream, true).catch(() => {
            //
        });
    }

    private vodWaveRefHandler = (ref: any) => {
        this.vodWave = ref;
    }

    private vodWaveSmoothRefHandler = (ref: any) => {
        this.vodWaveSmooth = ref;
    }
}

export default CallVideoAugment;