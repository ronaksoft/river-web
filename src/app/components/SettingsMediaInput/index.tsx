/*
    Creation Time: 2021 - Jan - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2021
*/

import * as React from 'react';
import {IconButton, MenuItem, Select} from "@material-ui/core";
import {KeyboardBackspaceRounded} from "@material-ui/icons";
import i18n from "../../services/i18n";
import {C_LOCALSTORAGE} from "../../services/sdk/const";

import './style.scss';

export const getDefaultAudio = (): (boolean | MediaTrackConstraintSet) => {
    const val = localStorage.getItem(C_LOCALSTORAGE.SettingsDefaultAudio);
    if (val) {
        return {
            deviceId: val,
        };
    } else {
        return true;
    }
};

export const getDefaultVideo = (): (boolean | MediaTrackConstraintSet) => {
    const val = localStorage.getItem(C_LOCALSTORAGE.SettingsDefaultVideo);
    if (val) {
        return {
            deviceId: val,
        };
    } else {
        return true;
    }
};

interface IDevice {
    id: string;
    label: string;
}

interface IMediaDevice {
    audios: IDevice[];
    videos: IDevice[];
}

interface IProps {
    onPrev?: (e: any) => void;
    onError?: (message: string) => void;
}

interface IState {
    audios: IDevice[];
    loading: boolean;
    page: number;
    selectedAudio: string;
    selectedVideo: string;
    showAudio: boolean;
    showVideo: boolean;
    videos: IDevice[];
}

class SettingsMediaInput extends React.Component<IProps, IState> {
    private mounted: boolean = true;
    private videoRef: HTMLVideoElement | undefined;
    private videoStream: MediaStream | undefined;
    private audioContext: AudioContext | undefined;
    private audioAnalyserInterval: any;
    private audioStream: MediaStream | undefined;
    private barRef: any | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            audios: [],
            loading: false,
            page: 1,
            selectedAudio: localStorage.getItem(C_LOCALSTORAGE.SettingsDefaultAudio) || '_',
            selectedVideo: localStorage.getItem(C_LOCALSTORAGE.SettingsDefaultVideo) || '_',
            showAudio: false,
            showVideo: false,
            videos: [],
        };
    }

    public componentDidMount() {
        const {selectedAudio, selectedVideo} = this.state;
        this.mounted = true;
        this.getMediaInput().then((res) => {
            this.setState({
                audios: res.audios,
                videos: res.videos,
            });
        });
        if (selectedAudio !== '_') {
            this.loadMedia('selectedAudio')();
        }
        if (selectedVideo !== '_') {
            this.loadMedia('selectedVideo')();
        }
    }

    public componentWillUnmount() {
        this.mounted = false;
        this.destroyAudioSteam();
        this.destroyVideoSteam();
    }

    public render() {
        const {page, audios, videos, selectedAudio, selectedVideo, showVideo, showAudio} = this.state;
        return (
            <div className={`page-container page-${page}`}>
                <div className="page page-1">
                    {Boolean(this.props.onPrev) && <div className="menu-header">
                        <IconButton
                            onClick={this.prevHandler}
                        >
                            <KeyboardBackspaceRounded/>
                        </IconButton>
                        <label>{i18n.t('settings.media_input.title')}</label>
                    </div>}
                    <div className="menu-content media-input-settings-section">
                        <div className="sub-page-header-alt">{i18n.t('settings.media_input.audio')}</div>
                        <div className="select-input">
                            <Select
                                value={selectedAudio}
                                onChange={this.selectChangeHandler('selectedAudio')}
                                margin="dense"
                                variant="outlined"
                                fullWidth={true}
                                classes={{
                                    select: 'media-input-select',
                                }}
                            >
                                <MenuItem value="_">
                                    <em>{i18n.t('general.none')}</em>
                                </MenuItem>
                                {audios.map((option, key) => {
                                    return (<MenuItem key={key} value={option.id}>{option.label}</MenuItem>);
                                })}
                            </Select>
                        </div>
                        {showAudio && <div className="audio-input-preview">
                            <div className="audio-container">
                                <div ref={this.barRefHandler} className="inner"/>
                            </div>
                        </div>}
                        <div className="sub-page-header-alt">{i18n.t('settings.media_input.video')}</div>
                        <div className="select-input">
                            <Select
                                value={selectedVideo}
                                onChange={this.selectChangeHandler('selectedVideo')}
                                margin="dense"
                                variant="outlined"
                                fullWidth={true}
                                classes={{
                                    select: 'media-input-select',
                                }}
                            >
                                <MenuItem value="_">
                                    <em>{i18n.t('general.none')}</em>
                                </MenuItem>
                                {videos.map((option, key) => {
                                    return (<MenuItem key={key} value={option.id}>{option.label}</MenuItem>);
                                })}
                            </Select>
                        </div>
                        {showVideo && <div className="video-input-preview">
                            <video ref={this.videoRefHandler} playsInline={true} autoPlay={true} muted={true}/>
                        </div>}
                    </div>
                </div>
            </div>
        );
    }

    private prevHandler = (e: any) => {
        if (this.props.onPrev) {
            this.props.onPrev(e);
        }
    }

    private getMediaInput() {
        const out: IMediaDevice = {
            audios: [],
            videos: [],
        };
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return Promise.resolve(out);
        }

        return navigator.mediaDevices.enumerateDevices().then((res) => {
            res.forEach((item) => {
                if (item.kind === 'audioinput') {
                    out.audios.push({
                        id: item.deviceId,
                        label: item.label,
                    });
                } else if (item.kind === 'videoinput') {
                    out.videos.push({
                        id: item.deviceId,
                        label: item.label,
                    });
                }
            });
            return out;
        });
    }

    private selectChangeHandler = (name: string) => (e: any) => {
        const id = e.target.value;
        const state: any = {};
        state[name] = id;
        if (name === 'selectedAudio') {
            if (id === '_') {
                localStorage.removeItem(C_LOCALSTORAGE.SettingsDefaultAudio);
            } else {
                localStorage.setItem(C_LOCALSTORAGE.SettingsDefaultAudio, id);
            }
        } else if (name === 'selectedVideo') {
            if (id === '_') {
                localStorage.removeItem(C_LOCALSTORAGE.SettingsDefaultVideo);
            } else {
                localStorage.setItem(C_LOCALSTORAGE.SettingsDefaultVideo, id);
            }
        }
        this.setState(state, this.loadMedia(name));
    }

    private videoRefHandler = (ref: any) => {
        this.videoRef = ref;
        if (this.videoRef && this.videoStream) {
            this.videoRef.srcObject = this.videoStream;
        }
    }

    private loadMedia = (name: string) => () => {
        if (name === 'selectedAudio') {
            const {selectedAudio} = this.state;
            this.destroyAudioSteam();
            if (selectedAudio === '_') {
                this.setState({
                    showAudio: false,
                });
                localStorage.removeItem(C_LOCALSTORAGE.SettingsDefaultAudio);
                return;
            }
            localStorage.setItem(C_LOCALSTORAGE.SettingsDefaultAudio, selectedAudio);
            navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: selectedAudio,
                },
            }).then((stream) => {
                this.audioStream = stream;
                this.initAudioAnalyzer().then(() => {
                    this.setState({
                        showAudio: true,
                    });
                });
            });
        } else if (name === 'selectedVideo') {
            const {selectedVideo} = this.state;
            this.destroyVideoSteam();
            if (selectedVideo === '_') {
                this.setState({
                    showVideo: false,
                });
                localStorage.removeItem(C_LOCALSTORAGE.SettingsDefaultVideo);
                return;
            }
            localStorage.setItem(C_LOCALSTORAGE.SettingsDefaultVideo, selectedVideo);
            this.setState({
                showVideo: true,
            });
            navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: selectedVideo,
                },
            }).then((stream) => {
                this.videoStream = stream;
                if (this.videoRef) {
                    this.videoRef.srcObject = stream;
                }
            });
        }
    }

    private destroyVideoSteam() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach((track) => {
                track.stop();
            });
            this.videoStream = undefined;
        }
    }

    private barRefHandler = (ref: any) => {
        this.barRef = ref;
    }

    private initAudioAnalyzer = () => {
        if (!this.audioStream) {
            return Promise.reject('no audio stream');
        }

        if (!window.AudioContext) {
            return Promise.reject('no AudioContext');
        }

        const tracks = this.audioStream.getAudioTracks();
        if (tracks.length === 0) {
            return Promise.reject('no audio track');
        }

        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaStreamSource(this.audioStream);
        const audioAnalyser = this.audioContext.createAnalyser();
        audioAnalyser.minDecibels = -70;
        audioAnalyser.fftSize = 128;
        audioAnalyser.smoothingTimeConstant = 0.3;
        source.connect(audioAnalyser);
        const data = new Uint8Array(audioAnalyser.frequencyBinCount);
        const analyze = () => {
            if (!this.mounted) {
                clearInterval(this.audioAnalyserInterval);
                return;
            }
            audioAnalyser.getByteFrequencyData(data);
            this.normalizeAnalyze(data);
        };
        this.audioAnalyserInterval = setInterval(analyze, 64);
        analyze();
        return Promise.resolve();
    }

    private normalizeAnalyze(data: Uint8Array) {
        const len = data.length;
        const step = Math.floor(len / 10);
        let val = 0;
        for (let i = 0; i < 10; i++) {
            val += data[i * step];
        }
        val = val / 10;
        val = Math.min(val, 100);
        if (this.barRef) {
            this.barRef.style.transform = `translateX(-${100 - val}%)`;
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

    private destroyAudioSteam() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach((track) => {
                track.stop();
            });
            this.audioStream = undefined;
        }
        this.stopAudioAnalyzer();
    }
}

export default SettingsMediaInput;
