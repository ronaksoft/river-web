/*
    Creation Time: 2020 - Dec - 08
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {FormControlLabel, Switch} from "@material-ui/core";
import {MicOffRounded, MicRounded, VideocamOffRounded, VideocamRounded} from "@material-ui/icons";
import CallService, {C_CALL_EVENT} from "../../services/callService";
import i18n from '../../services/i18n';
import {clone} from "lodash";

export interface IMediaSettings {
    video: boolean;
    audio: boolean;
}

interface IProps {
    onMediaSettingsChange?: (settings: IMediaSettings) => void;
}

interface IState {
    mediaSettings: IMediaSettings;
    muteNotice?: boolean;
}

class CallSettings extends React.Component<IProps, IState> {
    private callService: CallService;
    private eventReferences: any[] = [];
    private audioContext: AudioContext | undefined;
    private audioAnalyserInterval: any;
    private audioStream: MediaStream | undefined;
    private mounted: boolean = true;

    constructor(props: IProps) {
        super(props);

        this.callService = CallService.getInstance();

        this.state = {
            mediaSettings: this.callService.getStreamState(),
            muteNotice: false,
        };
    }

    public componentDidMount() {
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.LocalStreamUpdate, this.eventLocalStreamUpdateHandler));
    }

    public componentWillUnmount() {
        this.mounted = false;
        this.stopAudioAnalyzer();
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public setMediaSettings({audio, video}: { audio: boolean, video: boolean }) {
        this.setState({
            mediaSettings: {
                audio,
                video,
            },
        });
        this.callService.toggleAudio(audio);
        this.callService.toggleVideo(video);
    }

    public startAudioAnalyzer() {
        window.console.log('here');
        if (this.audioContext || this.audioStream) {
            return;
        }
        this.initAudioAnalyzer();
    }

    public render() {
        const {mediaSettings, muteNotice} = this.state;
        return <>
            <div className="call-settings">
                <FormControlLabel
                    className="call-settings-switch"
                    control={
                        <Switch
                            checked={mediaSettings.video}
                            onChange={this.mediaSettingsChangeHandler('video')}
                            color="primary"
                        />
                    }
                    label={mediaSettings.video ? <VideocamRounded/> : <VideocamOffRounded/>}
                    labelPlacement="start"
                />
                <FormControlLabel
                    className="call-settings-switch"
                    control={
                        <Switch
                            checked={mediaSettings.audio}
                            onChange={this.mediaSettingsChangeHandler('audio')}
                            color="primary"
                        />
                    }
                    label={mediaSettings.audio ? <MicRounded/> : <MicOffRounded/>}
                    labelPlacement="start"
                />
            </div>
            {muteNotice && <div className="call-settings-notice">{i18n.t('call.audio_muted')}</div>}
        </>;
    }

    private mediaSettingsChangeHandler = (key: string) => (e: any, checked: boolean) => {
        const {mediaSettings} = this.state;
        mediaSettings[key] = checked;
        this.setState({
            mediaSettings,
        });
        window.console.log(mediaSettings);
        if (key === 'audio') {
            this.callService.toggleAudio(checked);
        } else if (key === 'video') {
            this.callService.toggleVideo(checked);
        }
        if (this.props.onMediaSettingsChange) {
            this.props.onMediaSettingsChange(clone(mediaSettings));
        }
    }

    private eventLocalStreamUpdateHandler = () => {
        window.console.log('here', this.callService.getStreamState());
        this.setState({
            mediaSettings: this.callService.getStreamState(),
        });
    }

    private initAudioAnalyzer = () => {
        if (!window.AudioContext) {
            return Promise.reject('no AudioContext');
        }
        return navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
            this.audioStream = stream;
            const tracks = stream.getAudioTracks();
            if (tracks.length === 0) {
                return Promise.reject('no audio track');
            }
            this.audioContext = new AudioContext();
            const source = this.audioContext.createMediaStreamSource(stream);
            const audioAnalyser = this.audioContext.createAnalyser();
            audioAnalyser.minDecibels = -100;
            audioAnalyser.fftSize = 256;
            audioAnalyser.smoothingTimeConstant = 0.1;
            source.connect(audioAnalyser);
            const data = new Uint8Array(audioAnalyser.frequencyBinCount);
            const analyze = () => {
                if (!this.mounted) {
                    clearInterval(this.audioAnalyserInterval);
                    return;
                }
                if (this.state.mediaSettings.audio) {
                    return;
                }
                audioAnalyser.getByteFrequencyData(data);
                this.normalizeAnalyze(data);
            };
            this.audioAnalyserInterval = setInterval(analyze, 767);
            analyze();
            return Promise.resolve();
        });
    }

    private normalizeAnalyze(data: Uint8Array) {
        const len = data.length;
        const step = Math.floor(len / 10);
        let val = 0;
        for (let i = 0; i < 10; i++) {
            val += data[i * step];
        }
        val = val / 10;
        const {muteNotice} = this.state;
        window.console.log(val);
        if (val > 40 && !muteNotice) {
            this.setState({
                muteNotice: true,
            });
        } else if (val < 35 && muteNotice) {
            this.setState({
                muteNotice: false,
            });
        }
    }

    private stopAudioAnalyzer() {
        clearInterval(this.audioAnalyserInterval);
        if (this.audioStream) {
            this.audioStream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        if (!this.audioContext) {
            return;
        }
        this.audioContext.close();
        this.audioContext = undefined;
    }
}

export default CallSettings;
