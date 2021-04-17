/*
    Creation Time: 2020 - Nov - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
// @ts-ignore
import glur from 'glur';
import CallVideoAugment from "../CallVideoAugment";
import {CallDeviceType} from "../../services/sdk/messages/chat.phone_pb";
import UserName from "../UserName";
import {
    DesktopMacRounded,
    DevicesOtherRounded,
    LaptopRounded,
    PhoneAndroidRounded,
    PhoneIphoneRounded,
    VolumeOffRounded,
    WifiRounded,
} from "@material-ui/icons";
import {IceState} from "../CallVideo";
import i18n from "../../services/i18n";

import './style.scss';

interface IProps {
    srcObject?: any;
    userId?: string | null;
    deviceType: CallDeviceType;
    className?: string;
    playsInline?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
    onClick?: (e: any) => void;
}

interface IState {
    deviceType: CallDeviceType;
    iceState: IceState;
    img: any;
    muted: boolean;
    userId: string;
    videoMute: boolean;
}

class CallVideoPlaceholder extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        if (props.userId === state.userId && props.deviceType === state.deviceType) {
            return null;
        }
        return {
            deviceType: props.deviceType,
            userId: props.userId,
        };
    }

    private loading: boolean = false;
    private callVideoAugmentRef: CallVideoAugment | undefined;
    private video: HTMLVideoElement | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            deviceType: props.deviceType,
            iceState: IceState.Connected,
            img: undefined,
            muted: props.muted || false,
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

    public destroyVOD() {
        if (this.callVideoAugmentRef) {
            this.callVideoAugmentRef.destroyVOD();
        }
    }

    public setVODEnable(enable: boolean) {
        if (this.callVideoAugmentRef) {
            this.callVideoAugmentRef.setVODEnable(enable);
        }
    }

    public setIceState(iceState: IceState) {
        window.console.log(iceState);
        this.setState({
            iceState,
        });
    }

    public setMute(muted: boolean) {
        this.setState({
            muted,
        });
    }

    public render() {
        const {className, playsInline, autoPlay} = this.props;
        const {videoMute, img, userId, muted} = this.state;
        return (<div className={'video-placeholder ' + (className || '') + (!img ? ' no-image' : '')}
                     onClick={this.props.onClick}>
            {this.getIndicatorContent()}
            {img && <img className={'video-img' + (videoMute ? ' upper' : '')} alt="" src={img}/>}
            <video key="video" ref={this.vidRef} playsInline={playsInline} autoPlay={autoPlay} muted={muted}
                   style={{visibility: userId && videoMute ? 'hidden' : 'visible'}}/>
            {this.getUserContent()}
            <CallVideoAugment ref={this.callVideoAugmentRefHandler} videoMute={videoMute} userId={userId}/>
        </div>);
    }

    private getIndicatorContent() {
        const {muted, iceState} = this.state;
        if (iceState === IceState.Connecting) {
            return <div className="video-ice-status">
                <WifiRounded/>
                <div className="status-label">{i18n.t('status.reconnecting')}</div>
            </div>;
        }
        if (muted) {
            return <div className="audio-muted">
                <VolumeOffRounded/>
            </div>;
        }
        return null;
    }

    private getUserContent() {
        const {deviceType, userId} = this.state;
        if (!userId) {
            return null;
        }
        return <div className="video-placeholder-user">
            <div className="device-type">{this.getDeviceType(deviceType)}</div>
            <UserName className="user" id={userId} noIcon={true} you={true} noDetail={true}/>
        </div>;
    }

    private getDeviceType(deviceType: CallDeviceType) {
        switch (deviceType) {
            case CallDeviceType.CALLDEVICEDESKTOP:
                return <DesktopMacRounded/>;
            case CallDeviceType.CALLDEVICEWEB:
                return <LaptopRounded/>;
            case CallDeviceType.CALLDEVICEIOS:
                return <PhoneIphoneRounded/>;
            case CallDeviceType.CALLDEVICEANDROID:
                return <PhoneAndroidRounded/>;
            case CallDeviceType.CALLDEVICEUNKNOWN:
                return <DevicesOtherRounded/>;
        }
        return null;
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