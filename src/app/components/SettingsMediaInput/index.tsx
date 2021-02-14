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
import VoiceActivityDetection from "../../services/vad";
import ElectronService from "../../services/electron";

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

export const getElectronMediaAccess = (deviceType: 'microphone' | 'camera' | 'screen', err: Error) => {
    if (!ElectronService.isElectron()) {
        return;
    }

    if (err.message.indexOf('Could not start') === -1) {
        return;
    }

    ElectronService.getInstance().askForMediaAccess(deviceType)
    return;
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
    private videoRef: HTMLVideoElement | undefined;
    private videoStream: MediaStream | undefined;
    private audioStream: MediaStream | undefined;
    private vad: VoiceActivityDetection | undefined;
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
        if (this.vad) {
            this.vad.setActive(false);
        }
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
            }).catch((err) => {
                getElectronMediaAccess('microphone', err);
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
            }).catch((err) => {
                getElectronMediaAccess('camera', err);
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

        this.vad = new VoiceActivityDetection({intervalTimeout: 63});
        this.vad.onActivity((val) => {
            if (this.barRef) {
                this.barRef.style.transform = `translateX(-${100 - val}%)`;
            }
        });
        return this.vad.setStream(this.audioStream, true);
    }

    private destroyAudioSteam() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach((track) => {
                track.stop();
            });
            this.audioStream = undefined;
        }
        if (this.vad) {
            this.vad.destroy(false);
        }
    }
}

export default SettingsMediaInput;
