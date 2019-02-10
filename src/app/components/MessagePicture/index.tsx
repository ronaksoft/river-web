/*
    Creation Time: 2019 - Feb - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {IMessage} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/chat.core.types_pb';
import {MediaDocument} from '../../services/sdk/messages/chat.core.message.medias_pb';
import {CloseRounded, CloudDownloadRounded} from '@material-ui/icons';
import {IFileProgress} from '../../services/sdk/fileManager';
import ProgressBroadcaster from '../../services/progress';
import {getFileInfo} from '../MessageFile';

import './style.css';

interface IProps {
    message: IMessage;
    peer: InputPeer | null;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open', message: IMessage) => void;
}

interface IState {
    caption: string;
    fileName: string;
    fileState: 'download' | 'view' | 'progress' | 'open';
    message: IMessage;
    type: string;
}

class MessagePicture extends React.Component<IProps, IState> {
    private lastId: number = 0;
    private fileId: string = '';
    private downloaded: boolean = false;
    private saved: boolean = false;
    private circleProgressRef: any = null;
    private eventReferences: any[] = [];
    private progressBroadcaster: ProgressBroadcaster;
    private fileSizeRef: any = null;
    private fileSize: number = 0;

    constructor(props: IProps) {
        super(props);

        const info = getFileInfo(props.message);
        this.fileSize = info.size;

        this.state = {
            caption: info.caption,
            fileName: info.name,
            fileState: this.getFileState(props.message),
            message: props.message,
            type: info.type,
        };

        if (props.message) {
            this.lastId = props.message.id || 0;
            this.downloaded = props.message.downloaded || false;
            this.saved = props.message.saved || false;
        }

        this.progressBroadcaster = ProgressBroadcaster.getInstance();
    }

    public componentDidMount() {
        const {message} = this.state;
        const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
        if (!message || !messageMediaDocument.doc) {
            return;
        }
        this.displayFileSize(0);
        this.fileId = messageMediaDocument.doc.id || '';
        this.initProgress();
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (newProps.message && this.lastId !== newProps.message.id) {
            this.lastId = newProps.message.id || 0;
            const info = getFileInfo(newProps.message);
            this.fileSize = info.size;
            this.displayFileSize(0);
            this.setState({
                caption: info.caption,
                fileName: info.name,
                fileState: this.getFileState(newProps.message),
                message: newProps.message,
                type: info.type,
            }, () => {
                this.initProgress();
            });
        }
        const messageMediaDocument: MediaDocument.AsObject = newProps.message.mediadata;
        if (messageMediaDocument && messageMediaDocument.doc && messageMediaDocument.doc.id !== this.fileId) {
            this.fileId = messageMediaDocument.doc.id || '';
            this.setState({
                message: newProps.message,
            });
        }
        if ((newProps.message.downloaded || false) !== this.downloaded) {
            this.downloaded = (newProps.message.downloaded || false);
            this.setState({
                fileState: this.getFileState(newProps.message),
            });
        }
        if ((newProps.message.saved || false) !== this.saved) {
            this.saved = (newProps.message.saved || false);
            this.setState({
                fileState: this.getFileState(newProps.message),
                message: newProps.message,
            });
        }
    }

    public componentWillUnmount() {
        this.removeAllListeners();
    }

    public render() {
        const {caption, fileState} = this.state;
        return (
            <div className="message-picture">
                <div className="picture-content">
                    <div className="picture-thumb">
                        <div className="picture-action">
                            {Boolean(fileState === 'download') &&
                            <CloudDownloadRounded onClick={this.downloadFileHandler}/>}
                            {Boolean(fileState === 'progress') && <React.Fragment>
                                <div className="progress">
                                    <svg viewBox='0 0 32 32'>
                                        <circle ref={this.progressRefHandler} r='14' cx='16' cy='16'/>
                                    </svg>
                                </div>
                                <CloseRounded className="action" onClick={this.cancelFileHandler}/>
                            </React.Fragment>}
                        </div>
                    </div>
                    {/*<div className="picture-big">
                        hey
                    </div>*/}
                </div>
                {Boolean(caption.length > 0) && <div className="picture-caption">{caption}</div>}
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

    /* Get file state */
    private getFileState(message: IMessage) {
        const id = message.id || 0;
        if (id <= 0) {
            return 'progress';
        } else if (id > 0 && !message.downloaded) {
            return 'download';
        } else if (id > 0 && !message.saved) {
            return 'view';
        } else {
            return 'open';
        }
    }

    /* Progress circle ref handler */
    private progressRefHandler = (ref: any) => {
        this.circleProgressRef = ref;
    }

    /* Upload progress handler */
    private uploadProgressHandler = (progress: IFileProgress) => {
        const {message} = this.state;
        if ((message.id || 0) > 0) {
            this.displayFileSize(progress.download);
        } else {
            this.displayFileSize(progress.upload);
        }
        if (!this.circleProgressRef) {
            return;
        }
        let v = 3;
        if (progress.state === 'failed') {
            this.setState({
                fileState: 'download',
            });
            return;
        } else if (progress.state !== 'complete' && progress.download > 0) {
            v = progress.progress * 85;
        } else if (progress.state === 'complete') {
            v = 88;
        }
        if (v < 3) {
            v = 3;
        }
        this.circleProgressRef.style.strokeDasharray = `${v} 88`;
    }

    /* Download file handler */
    private downloadFileHandler = () => {
        if (this.props.onAction) {
            this.props.onAction('download', this.state.message);
            this.setState({
                fileState: 'progress',
            }, () => {
                this.initProgress();
            });
        }
    }

    /* Initialize progress bar */
    private initProgress() {
        const {message} = this.props;
        if (!message) {
            return;
        }
        if (this.state.fileState === 'progress') {
            if (message) {
                this.removeAllListeners();
                this.eventReferences.push(this.progressBroadcaster.listen(message.id || 0, this.uploadProgressHandler));
            }
        } else {
            if (this.progressBroadcaster.isActive(message.id || 0)) {
                this.setState({
                    fileState: 'progress',
                }, () => {
                    this.removeAllListeners();
                    this.eventReferences.push(this.progressBroadcaster.listen(message.id || 0, this.uploadProgressHandler));
                });
            }
        }
    }

    /* Cancel file download/upload */
    private cancelFileHandler = () => {
        if (this.props.onAction) {
            if (this.props.message && (this.props.message.id || 0) < 0) {
                this.props.onAction('cancel', this.state.message);
            } else {
                this.props.onAction('cancel_download', this.state.message);
            }
        }
    }

    /* Display file size */
    private displayFileSize(loaded: number) {
        if (!this.fileSizeRef) {
            return;
        }
        if (loaded <= 0) {
            this.fileSizeRef.innerText = `${this.getHumanReadableSize(this.fileSize)}`;
        } else {
            this.fileSizeRef.innerText = `${this.getHumanReadableSize(loaded)} / ${this.getHumanReadableSize(this.fileSize)}`;
        }
    }

    /* Get human readable size */
    private getHumanReadableSize(size: number) {
        if (size < 1024) {
            return `${size} B`;
        } else if (size < 1048576) { // 1024 * 1024
            return `${(size / 1024).toFixed(1)} KB`;
        } else if (size < 1073741824) { // 1024 * 1024 * 1024
            return `${(size / 1048576).toFixed(1)} MB`;
        } else {
            return `${(size / 1073741824).toFixed(1)} GB`;
        }
    }
}

export default MessagePicture;
