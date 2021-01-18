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
        });
    }

    public setVideoMute(mute: boolean) {
        if (this.state.videoMute === mute) {
            return;
        }
        this.setState({
            videoMute: mute,
        });
    }

    public render() {
        const {videoMute, audioMute, userId} = this.state;
        return <>
            {videoMute && userId && <UserAvatar className="video-user-placeholder" id={userId} noDetail={true}/>}
            {audioMute && <div className="video-audio-muted">
                <MicOffRounded/>
                {i18n.t('call.muted')}
            </div>}
        </>;
    }
}

export default CallVideoAugment;