import * as React from 'react';
import {InputPeer} from "../../services/sdk/messages/core.types_pb";

import './style.scss';

export default function VideoPlaceholder({videoRef, peer, className, playsInline, autoPlay, muted, onClick}: { videoRef: (ref: any) => void, peer?: InputPeer, className?: string, playsInline?: boolean, autoPlay?: boolean, muted?: boolean, onClick?: (e: any) => void }) {
    // @ts-ignore
    let video: HTMLVideoElement | null = null;

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         window.console.log(video);
    //         if (!video || !video.srcObject) {
    //             return;
    //         }
    //         window.console.log((video.srcObject as MediaStream).getVideoTracks()[0]);
    //         window.console.log((video.srcObject as MediaStream).getAudioTracks()[0]);
    //     }, 1000);
    //     return () => {
    //         clearInterval(interval);
    //     };
    // }, [video]);

    const vidRef = (ref: HTMLVideoElement | null) => {
        videoRef(ref);
        if (!ref) {
            return;
        }
        video = ref;
        if (ref.srcObject) {
            (ref.srcObject as MediaStream).onaddtrack = (e) => {
                window.console.log(e);
            };
            (ref.srcObject as MediaStream).onremovetrack = (e) => {
                window.console.log(e);
            };
            // @ts-ignore
            (ref.srcObject as MediaStream).getVideoTracks()[0].onmute = (e) => {
                window.console.log(e);
            };
            // @ts-ignore
            (ref.srcObject as MediaStream).getVideoTracks()[0].onunmute = (e) => {
                window.console.log(e);
            };
        }
    };

    return <div className={'video-placeholder ' + (className || '')} onClick={onClick}>
        <video ref={vidRef} playsInline={playsInline} autoPlay={autoPlay} muted={muted}/>
    </div>;
}