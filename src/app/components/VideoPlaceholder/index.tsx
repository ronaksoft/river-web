/*
    Creation Time: 2020 - Nov - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {useState} from "react";
import UserAvatar from "../UserAvatar";
import i18n from '../../services/i18n';
import {MicOffRounded} from '@material-ui/icons';

import './style.scss';

export interface IVideoPlaceholderRef {
    video: HTMLVideoElement | null;
    setSettings: ({video, audio}: { video?: boolean, audio?: boolean }) => void;
}

export default function VideoPlaceholder({innerRef, userId, srcObject, className, playsInline, autoPlay, muted, onClick}: { innerRef: (ref: IVideoPlaceholderRef) => void, srcObject?: any, userId?: string | null, className?: string, playsInline?: boolean, autoPlay?: boolean, muted?: boolean, onClick?: (e: any) => void }) {
    const [audioMute, setAudioMute] = useState(false);
    const [videoMute, setVideoMute] = useState(false);

    const setSettings = ({video, audio}: { video?: boolean, audio?: boolean }) => {
        if (video !== undefined) {
            setVideoMute(!video);
        }
        if (audio !== undefined) {
            setAudioMute(!audio);
        }
    };

    const vidRef = (video: HTMLVideoElement | null) => {
        innerRef({
            setSettings,
            video,
        });
    };

    return <div className={'video-placeholder ' + (className || '')} onClick={onClick}>
        {videoMute && userId && <UserAvatar className="video-user-placeholder" id={userId}/>}
        <video ref={vidRef} playsInline={playsInline} autoPlay={autoPlay} muted={muted}
               hidden={Boolean(userId) && videoMute} src={srcObject}/>
        {audioMute && <div className="video-audio-muted">
            <MicOffRounded/>
            {i18n.t('call.muted')}
        </div>}
    </div>;
}