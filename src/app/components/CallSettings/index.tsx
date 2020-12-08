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

export interface IMediaSettings {
    video: boolean;
    audio: boolean;
}

interface IProps {
    onMediaSettingsChange?: (settings: IMediaSettings) => void;
}

interface IState {
    mediaSettings: IMediaSettings;
}

class CallSettings extends React.Component<IProps, IState> {
    private callService: CallService;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.callService = CallService.getInstance();

        this.state = {
            mediaSettings: this.callService.getStreamState(),
        };
    }

    public componentDidMount() {
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.LocalStreamUpdate, this.eventLocalStreamUpdateHandler));
    }

    public componentWillUnmount() {
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

    public render() {
        const {mediaSettings} = this.state;
        return <div className="call-settings">
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
        </div>;
    }

    private mediaSettingsChangeHandler = (key: string) => (e: any, checked: boolean) => {
        const {mediaSettings} = this.state;
        mediaSettings[key] = checked;
        this.setState({
            mediaSettings,
        });
        if (key === 'audio') {
            this.callService.toggleAudio(checked);
        } else if (key === 'video') {
            this.callService.toggleVideo(checked);
        }
        if (this.props.onMediaSettingsChange) {
            this.props.onMediaSettingsChange(mediaSettings);
        }
    }

    private eventLocalStreamUpdateHandler = () => {
        this.setState({
            mediaSettings: this.callService.getStreamState(),
        });
    }
}

export default CallSettings;
