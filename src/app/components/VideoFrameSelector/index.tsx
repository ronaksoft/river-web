/*
    Creation Time: 2020 - March - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {Dialog, Slider, CircularProgress} from '@material-ui/core';
import {CheckRounded, CloseRounded} from "@material-ui/icons";
import i18n from "../../services/i18n";
import {getDuration} from "../MessageMedia";
import Scrollbars from "react-custom-scrollbars";
import {range} from 'lodash';

import './style.scss';

interface IFrame {
    time: number;
    url: string;
}

interface IProps {
    className?: string;
    onDone: (blob: Blob, url: string) => void;
}

interface IState {
    className?: string;
    disable: boolean;
    file: string | null;
    loading: boolean;
    open: boolean;
    frames: Array<IFrame | null>;
    time: number;
}

class VideoFrameSelector extends React.Component<IProps, IState> {
    private videoInfo: {
        containerHeight: number,
        containerWidth: number,
        duration: number,
        frameWidth: number,
        ratio: number,
        videoStyle?: any,
    } = {
        containerHeight: 600,
        containerWidth: 600,
        duration: 1,
        frameWidth: 90,
        ratio: 1,
    };
    private video: HTMLVideoElement | undefined;
    private canvas: HTMLCanvasElement | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            disable: false,
            file: '',
            frames: [],
            loading: false,
            open: false,
            time: 0,
        };

    }

    public componentDidMount() {
        this.setLayoutSize();
    }

    /* Open file dialog */
    public openFile(url: string) {
        this.setLayoutSize();
        this.setState({
            disable: false,
            file: url,
            frames: [],
            loading: true,
            open: true,
        });
    }

    public render() {
        const {open, loading, file, frames, time} = this.state;
        return (
            <Dialog
                open={open}
                onClose={this.closeHandler}
                className="video-frame-selector-dialog"
                classes={{
                    paper: 'video-frame-selector-dialog-paper'
                }}
            >
                <div className="video-frame-selector-dialog-header">{i18n.t('uploader.select_video_frame')}</div>
                <div className="video-frame-selector-dialog-footer">
                    <div className={'picture-action' + (loading ? ' disabled' : '')} onClick={this.doneHandler}>
                        <CheckRounded/>
                    </div>
                    <div className="picture-action cancel" onClick={this.closeHandler}>
                        <CloseRounded/>
                    </div>
                </div>
                <div className={'video-frame-selector-dialog-container' + (loading ? ' loading' : '')}
                     style={{
                         height: `${this.videoInfo.containerHeight}px`,
                         width: `${this.videoInfo.containerWidth}px`
                     }}>
                    <div className="video-container">
                        {Boolean(file) &&
                        <video ref={this.videoRefHandler} controls={false} style={this.videoInfo.videoStyle}>
                            <source src={file || ''}/>
                        </video>}
                    </div>
                    <div className="video-slider">
                        <div className="slider-time">
                            {getDuration(0)}
                        </div>
                        <div className="slider-container">
                            <Slider
                                value={time}
                                min={0}
                                max={this.videoInfo.duration}
                                step={0.25}
                                onChange={this.timeChangeHandler}
                            />
                        </div>
                        <div className="slider-time">
                            {getDuration(Math.floor(time))}
                        </div>
                    </div>
                    <div className="frame-container">
                        <Scrollbars
                            autoHide={true}
                        >
                            <div className="frame-wrapper">
                                {frames.map((frame, key) => {
                                    if (frame) {
                                        return (
                                            <div key={key}
                                                 className={'frame-item' + (frame && frame.time === time ? ' selected' : '')}
                                                 onClick={this.setTimeHandler(frame ? frame.time : 0)}>
                                                <div className="inner"
                                                     style={{width: `${this.videoInfo.frameWidth}px`}}>
                                                    <img src={frame.url} alt="" draggable={false}/>
                                                    <div className="frame-time">{getDuration(Math.floor(frame.time))}</div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (<div key={key} className="frame-item">
                                            <div className="inner" style={{width: `${this.videoInfo.frameWidth}px`}}>
                                                <CircularProgress size={24} thickness={3} color="inherit"/>
                                            </div>
                                        </div>);
                                    }
                                })}
                            </div>
                        </Scrollbars>
                    </div>
                </div>
            </Dialog>
        );
    }

    /* Dialog close handler */
    private closeHandler = () => {
        this.state.frames.forEach((f) => {
            if (f) {
                URL.revokeObjectURL(f.url);
            }
        });
        this.setState({
            disable: false,
            file: null,
            frames: [],
            loading: false,
            open: false,
            time: 0,
        });
        if (this.canvas) {
            this.canvas.remove();
        }
    }

    private setLayoutSize() {
        const h = window.innerHeight;
        const w = window.innerWidth;
        if (w <= 640) {
            this.videoInfo = {
                containerHeight: h,
                containerWidth: w,
                duration: 1,
                frameWidth: 90,
                ratio: 1,
            };
        } else {
            this.videoInfo = {
                containerHeight: 600,
                containerWidth: 600,
                duration: 1,
                frameWidth: 90,
                ratio: 1,
            };
        }
    }

    private videoRefHandler = (ref: any) => {
        this.video = ref;
        this.analyzeVideo();
    }

    private timeChangeHandler = (e: any, value: any) => {
        this.setState({
            time: value,
        });
        this.seekVideo(value);
    }

    private setTimeHandler = (time: number) => () => {
        this.setState({
            time,
        });
        this.seekVideo(time);
    }

    private seekVideo(time: number) {
        if (this.video) {
            this.video.currentTime = time;
        }
    }

    private analyzeVideo() {
        const video = this.video;
        if (!video) {
            return;
        }
        video.onloadedmetadata = () => {
            this.videoInfo.duration = video.duration;
            this.videoInfo.ratio = video.videoHeight / video.videoWidth;
            this.videoInfo.frameWidth = Math.max(114, 64 / this.videoInfo.ratio);
            const ratio = (this.videoInfo.containerHeight - 124) / this.videoInfo.containerWidth;
            const step = Math.max(this.videoInfo.duration / 30, 0.25);
            if (ratio <= this.videoInfo.ratio) {
                this.videoInfo.videoStyle = {
                    height: `${this.videoInfo.containerHeight - 144}px`,
                };
            } else {
                this.videoInfo.videoStyle = {
                    width: `${this.videoInfo.containerWidth - 20}px`,
                };
            }
            const tempFrames = range(Math.floor(this.videoInfo.duration / step)).map(o => null);
            this.setState({
                frames: tempFrames,
            });
            video.onloadeddata = () => {
                this.canvas = document.createElement('canvas');
                let sampleTime = 0;
                let index = 0;
                const {frames} = this.state;
                const fn = () => {
                    if (sampleTime <= video.duration) {
                        this.getFrame(sampleTime).then((res) => {
                            frames[index] = {
                                time: sampleTime,
                                url: res.url,
                            };
                            index++;
                            sampleTime += step;
                            this.setState({
                                frames,
                            });
                            fn();
                        });
                    } else {
                        this.setState({
                            frames,
                            loading: false,
                        });
                        this.setTimeHandler(0)();
                    }
                };
                fn();
            };
        };
        video.onerror = () => {
            video.remove();
        };
        video.load();
    }

    private getFrame(time: number): Promise<{ blob: Blob, url: string }> {
        if (!this.video) {
            return Promise.reject('video is not ready');
        }
        if (!this.canvas) {
            return Promise.reject('canvas is not ready');
        }
        const video = this.video;
        const canvas = this.canvas;
        return new Promise((resolve, reject) => {
            video.currentTime = time;
            video.ontimeupdate = () => {
                setTimeout(() => {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.canvas.height = video.videoHeight;
                        ctx.canvas.width = video.videoWidth;
                        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                        canvas.toBlob((blob) => {
                            if (blob) {
                                resolve({
                                    blob,
                                    url: URL.createObjectURL(blob)
                                });
                            } else {
                                reject('can\'t get frame');
                            }
                        }, 'image/jpeg', '0.8');
                    }
                }, 10);
            };
        });
    }

    private doneHandler = () => {
        this.getFrame(this.state.time).then((res) => {
            this.props.onDone(res.blob, res.url);
            this.closeHandler();
        });
    }
}

export default VideoFrameSelector;
