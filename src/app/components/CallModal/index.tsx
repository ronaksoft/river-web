/*
    Creation Time: 2020 - Nov - 04
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {Dialog, Paper, PaperProps, IconButton, Grow} from '@material-ui/core';
import {TransitionProps} from '@material-ui/core/transitions';
import Draggable from 'react-draggable';
import {InputPeer} from "../../services/sdk/messages/core.types_pb";
import CallService, {C_CALL_EVENT, IUpdatePhoneCall} from "../../services/callService";
import {CallEndRounded, CloseRounded, FullscreenRounded, FullscreenExitRounded, CallRounded} from "@material-ui/icons";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import i18n from '../../services/i18n';

import './style.scss';

interface IProps {
    height?: string;
}

interface IState {
    callId: string;
    callUserId: string | null;
    fullscreen: boolean;
    mode: 'call_init' | 'call_requested';
    open: boolean;
}

const TransitionEffect = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Grow ref={ref} {...props} />;
});

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
            callId: '0',
            callUserId: null,
            fullscreen: false,
            mode: 'call_init',
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
        this.eventReferences.push(this.callService.listen(C_CALL_EVENT.CallRequest, this.callRequestHandler));
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    public render() {
        const {open, fullscreen, mode} = this.state;
        return (
            <Dialog
                open={open}
                onClose={this.closeHandler}
                className={'call-modal ' + mode + (fullscreen ? ' fullscreen' : '')}
                classes={{
                    paper: 'call-modal-paper',
                }}
                disableBackdropClick={true}
                disableEnforceFocus={true}
                PaperComponent={PaperComponent}
                fullScreen={fullscreen}
                TransitionComponent={TransitionEffect}
            >
                {this.getContent()}
            </Dialog>
        );
    }

    private closeHandler = () => {
        this.callService.destroy();
        this.setState({
            open: false,
        });
    }

    private getContent() {
        const {mode} = this.state;
        switch (mode) {
            case 'call_requested':
                return this.getRequestedContent();
            default:
                return this.getCallContent();
        }
    }

    private getRequestedContent() {
        const {callUserId} = this.state;
        return <div className="call-modal-content">
            {callUserId && <UserAvatar className="call-user-avatar" id={callUserId} noDetail={true}/>}
            <div className="call-info">
                {callUserId && <UserName className="call-user-name" id={callUserId} noDetail={true}/>}
                <div className="call-status">
                    {i18n.t('call.is_calling')}
                </div>
            </div>
            <div className="call-modal-action">
                <div className="call-item call-end" onClick={this.callHandler}>
                    <CallEndRounded/>
                </div>
                <div className="call-item call-accept" onClick={this.callAcceptHandler}>
                    <CallRounded/>
                </div>
            </div>
        </div>;
    }

    private getCallContent() {
        const {fullscreen} = this.state;
        return <div id="draggable-call-modal" className="call-modal-content">
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
                <div className="call-item call-end" onClick={this.callHandler}>
                    <CallEndRounded/>
                </div>
            </div>
        </div>;
    }

    private callHandler = () => {
        if (this.peer) {
            this.callService.call(this.peer);
        }
    }

    private callAcceptHandler = () => {
        this.callService.accept(this.state.callId);
    }

    private callRequestHandler = (data: IUpdatePhoneCall) => {
        window.console.log(data);
        this.setState({
            callId: data.callid || '0',
            callUserId: data.userid || '0',
            mode: 'call_requested',
            open: true,
        });
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
