/*
    Creation Time: 2020 - Nov - 04
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {Dialog, Paper, PaperProps, IconButton} from '@material-ui/core';
import Draggable from 'react-draggable';
import {InputPeer} from "../../services/sdk/messages/core.types_pb";
import CallService from "../../services/call";
import {CallEndRounded, CloseRounded, FullscreenRounded, FullscreenExitRounded} from "@material-ui/icons";

import './style.scss';

interface IProps {
    height?: string;
}

interface IState {
    fullscreen: boolean;
    open: boolean;
}

function PaperComponent(props: PaperProps) {
    return (
        <Draggable handle="#draggable-call-modal" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}

class CallModal extends React.Component<IProps, IState> {
    private peer: InputPeer | null = null;
    private callService: CallService;
    private videoRef: HTMLVideoElement | undefined;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
            fullscreen: false,
            open: false,
        };

        this.callService = CallService.getInstance();
    }

    public openDialog(peer: InputPeer | null) {
        this.peer = peer;
        this.setState({
            open: true,
        }, () => {
            this.callService.initVideo().then((stream) => {
                if (this.videoRef) {
                    this.videoRef.srcObject = stream;
                }
            });
        });
    }

    public componentDidMount() {
        this.eventReferences.push(this.callService.listen('hi', this.callStartHandler));
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {open, fullscreen} = this.state;
        return (
            <Dialog
                open={open}
                onClose={this.closeHandler}
                className={'call-modal' + (fullscreen ? ' fullscreen' : '')}
                classes={{
                    paper: 'call-modal-paper',
                }}
                disableBackdropClick={true}
                disableEnforceFocus={true}
                PaperComponent={PaperComponent}
                fullScreen={fullscreen}
            >
                <div id="draggable-call-modal" className="call-modal-content">
                    <video ref={this.videoRefHandler} playsInline={true} autoPlay={true} muted={true}/>
                    <div className="call-modal-header">
                        <IconButton className="call-action-item" onClick={this.closeHandler}>
                            <CloseRounded/>
                        </IconButton>
                        <IconButton className="call-action-item" onClick={this.toggleFullscreenHandler}>
                            {fullscreen ? <FullscreenExitRounded/> : <FullscreenRounded/>}
                        </IconButton>
                    </div>
                    <div className="call-modal-action">
                        <div className="call-end" onClick={this.callHandler}>
                            <CallEndRounded/>
                        </div>
                    </div>
                </div>
            </Dialog>
        );
    }

    private closeHandler = () => {
        this.callService.destroy();
        this.setState({
            open: false,
        });
    }

    private callHandler = () => {
        if (this.peer) {
            this.callService.call(this.peer);
        }
    }

    private callStartHandler = () => {
        //
    }

    private videoRefHandler = (ref: any) => {
        this.videoRef = ref;
        const stream = this.callService.getLocalStream();
        if (this.videoRef && stream) {
            this.videoRef.srcObject = stream;
        }
    }

    private toggleFullscreenHandler = () => {
        this.setState({
            fullscreen: !this.state.fullscreen,
        });
    }
}

export default CallModal;
