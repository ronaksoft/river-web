/*
    Creation Time: 2020 - Nov - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
// @ts-ignore
import glur from 'glur';
import CallVideoAugment from "../CallVideoAugment";

import './style.scss';

interface IProps {
    srcObject?: any;
    userId?: string | null;
    className?: string;
    playsInline?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
    onClick?: (e: any) => void;
}

interface IState {
    img: any;
    userId: string;
    videoMute: boolean;
}

class CallVideoPlaceholder extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        if (props.userId === state.userId) {
            return null;
        }
        return {
            userId: props.userId,
        };
    }

    private loading: boolean = false;
    private callVideoAugmentRef: CallVideoAugment | undefined;
    private video: HTMLVideoElement | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            img: undefined,
            userId: props.userId,
            videoMute: false,
        };
    }

    public componentWillUnmount() {
        if (this.state.img) {
            URL.revokeObjectURL(this.state.img);
        }
    }

    public setSettings({video, audio}: { video?: boolean, audio?: boolean }) {
        if (this.callVideoAugmentRef && audio !== undefined) {
            this.callVideoAugmentRef.setAudioMute(!audio);
        }
        if (video !== undefined && this.state.videoMute === video) {
            this.setState({
                videoMute: !video,
            });
            if (this.callVideoAugmentRef) {
                this.callVideoAugmentRef.setVideoMute(!video);
            }
        }
    }

    public setVideo(src: any) {
        if (this.video) {
            this.video.srcObject = src;
        }
        if (this.callVideoAugmentRef) {
            this.callVideoAugmentRef.setStream(src);
        }
    }

    public render() {
        const {className, muted, playsInline, autoPlay} = this.props;
        const {videoMute, img, userId} = this.state;
        return (<div className={'video-placeholder ' + (className || '') + (!img ? ' no-image' : '')}
                     onClick={this.props.onClick}>
            {img && <img className={'video-img' + (videoMute ? ' upper' : '')} alt="" src={img}/>}
            <video key="video" ref={this.vidRef} playsInline={playsInline} autoPlay={autoPlay} muted={muted}
                   style={{visibility: userId && videoMute ? 'hidden' : 'visible'}}/>
            <CallVideoAugment ref={this.callVideoAugmentRefHandler} videoMute={videoMute} userId={userId}/>
        </div>);
    }

    private callVideoAugmentRefHandler = (ref: any) => {
        this.callVideoAugmentRef = ref;
        if (this.callVideoAugmentRef && this.props.srcObject) {
            this.callVideoAugmentRef.setStream(this.props.srcObject);
        }
    }

    private vidRef = (video: HTMLVideoElement | null) => {
        this.video = video;
        const {img} = this.state;
        if (video && !img && !this.loading) {
            this.loading = true;
            video.addEventListener('playing', () => {
                this.takeScreenShot(video);
            }, {once: true});
        }
        if (video && this.props.srcObject) {
            video.srcObject = this.props.srcObject;
        }
    }

    private takeScreenShot = (video: HTMLVideoElement) => {
        if (!video.videoWidth || !video.videoHeight) {
            return;
        }

        const draw = (ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D) => {
            ctx.canvas.height = video.videoHeight;
            ctx.canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const imageData = ctx.getImageData(0, 0, video.videoWidth, video.videoHeight);
            glur(imageData.data, video.videoWidth, video.videoHeight, 10);
            ctx.putImageData(imageData, 0, 0);
        };

        if (window.OffscreenCanvas) {
            const canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight);
            const ctx = canvas.getContext('2d');
            if (ctx) {
                draw(ctx);
                canvas.convertToBlob({
                    quality: 0.8,
                    type: 'image/jpeg',
                }).then((blob) => {
                    if (blob) {
                        this.setState({
                            img: URL.createObjectURL(blob),
                        });
                    }
                });
            }
        } else {
            const canvas = document.createElement('canvas');
            canvas.width = video.width;
            canvas.height = video.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                draw(ctx);
                canvas.toBlob((blob) => {
                    if (blob) {
                        this.setState({
                            img: URL.createObjectURL(blob),
                        });
                    }
                    canvas.remove();
                }, 'image/jpeg', 0.8);
            }
        }
    }
}

export default CallVideoPlaceholder;