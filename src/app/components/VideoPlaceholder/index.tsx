/*
    Creation Time: 2020 - Nov - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {useEffect, useRef, useState} from "react";
import UserAvatar from "../UserAvatar";
import i18n from '../../services/i18n';
import {MicOffRounded} from '@material-ui/icons';
import {IMediaSettings} from "../../services/callService";
// @ts-ignore
import glur from 'glur';

import './style.scss';

function VideoAugment({videoMute, userId, innerRef}: { innerRef: any, videoMute: boolean, userId?: string | null }) {
    const [audioMute, setAudioMute] = useState(false);

    innerRef.current = ({audio}: { audio?: boolean }) => {
        if (audio !== undefined && audio === audioMute) {
            setAudioMute(!audio);
        }
    };

    return <>
        {videoMute && userId && <UserAvatar className="video-user-placeholder" id={userId} noDetail={true}/>}
        {audioMute && <div className="video-audio-muted">
            <MicOffRounded/>
            {i18n.t('call.muted')}
        </div>}
    </>;
}

export interface IVideoPlaceholderRef {
    video: HTMLVideoElement | null;
    setSettings: ({video, audio}: Partial<IMediaSettings>) => void;
}

export default function VideoPlaceholder({innerRef, userId, srcObject, className, playsInline, autoPlay, muted, onClick}: { innerRef: (ref: IVideoPlaceholderRef) => void, srcObject?: any, userId?: string | null, className?: string, playsInline?: boolean, autoPlay?: boolean, muted?: boolean, onClick?: (e: any) => void }) {
    const [videoMute, setVideoMute] = useState(false);
    const [img, setImg] = useState<any>(undefined);
    const loading = useRef(false);
    const controls = useRef<any>(null);

    useEffect(() => {
        return () => {
            URL.revokeObjectURL(img);
        };
    }, [img]);

    const setSettings = ({video, audio}: { video?: boolean, audio?: boolean }) => {
        if (video !== undefined && video === videoMute) {
            setVideoMute(!video);
        }
        if (controls.current) {
            controls.current({audio});
        }
    };

    const vidRef = (video: HTMLVideoElement | null) => {
        if (video && !img && !loading.current) {
            loading.current = true;
            video.addEventListener('playing', () => {
                takeScreenShot(video);
            }, {once: true});
        }
        if (video && srcObject) {
            video.srcObject = srcObject;
        }
        innerRef({
            setSettings,
            video,
        });
    };

    const takeScreenShot = (video: HTMLVideoElement) => {
        if (!video.videoWidth || !video.videoHeight) {
            return;
        }
        const canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight);
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.canvas.height = video.videoHeight;
            ctx.canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const imageData = ctx.getImageData(0, 0, video.videoWidth, video.videoHeight);
            glur(imageData.data, video.videoWidth, video.videoHeight, 10);
            ctx.putImageData(imageData, 0, 0);
            canvas.convertToBlob({
                quality: 0.8,
                type: 'image/jpeg',
            }).then((blob) => {
                if (blob) {
                    setImg(URL.createObjectURL(blob));
                }
            });
        }
    };

    return <div className={'video-placeholder ' + (className || '') + (!img ? ' no-image' : '')} onClick={onClick}>
        {img && <img className={'video-img' + (videoMute ? ' upper' : '')} alt="" src={img}/>}
        <video key="video" ref={vidRef} playsInline={playsInline} autoPlay={autoPlay} muted={muted}
               style={{visibility: userId && videoMute ? 'hidden' : 'visible'}}/>
        <VideoAugment innerRef={controls} videoMute={videoMute} userId={userId}/>
    </div>;
}