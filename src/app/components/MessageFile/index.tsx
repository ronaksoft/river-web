/*
    Creation Time: 2019 - Jan - 16
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {IMessage} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/core.types_pb';
import {MediaDocument} from '../../services/sdk/messages/core.message.medias_pb';
import {ArrowDownwardRounded, CloseRounded} from '@material-ui/icons';
import {IFileProgress} from '../../services/sdk/fileServer';
import ProgressBroadcaster from '../../services/progress';

import './style.css';

interface IProps {
    message: IMessage;
    peer: InputPeer | null;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view', message: IMessage) => void;
}

interface IState {
    fileState: 'download' | 'view' | 'progress';
    message: IMessage;
}

class MessageFile extends React.Component<IProps, IState> {
    private lastId: number = 0;
    private fileId: string = '';
    private downloaded: boolean = false;
    private circleProgressRef: any = null;
    private eventReferences: any[] = [];
    private progressBroadcaster: ProgressBroadcaster;

    constructor(props: IProps) {
        super(props);

        this.state = {
            fileState: this.getFileState(props.message),
            message: props.message,
        };

        if (props.message) {
            this.lastId = props.message.id || 0;
            this.downloaded = props.message.downloaded || false;
        }

        this.progressBroadcaster = ProgressBroadcaster.getInstance();
    }

    public componentDidMount() {
        const {message} = this.state;
        const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
        if (!message || !messageMediaDocument.doc) {
            return;
        }
        this.fileId = messageMediaDocument.doc.id || '';
        this.initProgress();
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (newProps.message && this.lastId !== newProps.message.id) {
            this.lastId = newProps.message.id || 0;
            this.setState({
                fileState: this.getFileState(newProps.message),
                message: newProps.message,
            }, () => {
                this.getVoiceId();
                this.initProgress();
            });
        }
        const messageMediaDocument: MediaDocument.AsObject = newProps.message.mediadata;
        if (messageMediaDocument && messageMediaDocument.doc && messageMediaDocument.doc.id !== this.fileId) {
            this.fileId = messageMediaDocument.doc.id || '';

        }
        if ((newProps.message.downloaded || false) !== this.downloaded) {
            this.downloaded = (newProps.message.downloaded || false);
        }
    }

    public componentWillUnmount() {
        this.removeAllListeners();
    }

    public render() {
        const {fileState} = this.state;
        return (
            <div className="message-file">
                <div className="file-action">
                    {Boolean(fileState === 'view') &&
                    <ArrowDownwardRounded onClick={this.viewFileHandler}/>}
                    {Boolean(fileState === 'download') &&
                    <ArrowDownwardRounded onClick={this.downloadFileHandler}/>}
                    {Boolean(fileState === 'progress') && <React.Fragment>
                        <div className="progress">
                            <svg viewBox="0 0 32 32">
                                <circle ref={this.progressRefHandler} r="12" cx="16" cy="16"/>
                            </svg>
                        </div>
                        <CloseRounded className="action" onClick={this.cancelFileHandler}/>
                    </React.Fragment>}
                </div>
            </div>
        );
    }

    /* Remove all listeners */
    private removeAllListeners() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    /* Get voice data */
    private getVoiceId() {
        const {message} = this.state;
        window.console.log(message);
    }

    /* Get file state */
    private getFileState(message: IMessage) {
        window.console.log(message);
        const id = message.id || 0;
        if (id <= 0) {
            return 'progress';
        } else if (id > 0 && !message.downloaded) {
            return 'download';
        } else {
            return 'view';
        }
    }

    /* Progress circle ref handler */
    private progressRefHandler = (ref: any) => {
        this.circleProgressRef = ref;
    }

    /* Upload progress handler */
    private uploadProgressHandler = (progress: IFileProgress) => {
        if (!this.circleProgressRef) {
            return;
        }
        let v = 3;
        if (progress.state !== 'complete' && progress.download > 0) {
            v = progress.progress * 73;
        } else if (progress.state === 'complete') {
            v = 75;
        }
        if (v < 3) {
            v = 3;
        }
        this.circleProgressRef.style.strokeDasharray = `${v} 75`;
    }

    private downloadFileHandler = () => {
        if (this.props.onAction) {
            this.props.onAction('download', this.state.message);
            this.initProgress();
        }
    }

    private initProgress() {
        if (this.state.fileState === 'progress') {
            const {message} = this.props;
            if (message) {
                this.removeAllListeners();
                this.eventReferences.push(this.progressBroadcaster.listen(message.id || 0, this.uploadProgressHandler));
            }
        }
    }

    private viewFileHandler = () => {
        if (this.props.onAction) {
            this.props.onAction('view', this.state.message);
        }
    }

    private cancelFileHandler = () => {
        if (this.props.onAction) {
            if (this.props.message && (this.props.message.id || 0) < 0) {
                this.props.onAction('cancel', this.state.message);
            } else {
                this.props.onAction('cancel_download', this.state.message);
            }
        }
    }
}

export default MessageFile;
