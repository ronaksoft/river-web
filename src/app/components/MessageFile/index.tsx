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
import {
    DocumentAttributeFile,
    DocumentAttributeType,
    MediaDocument
} from '../../services/sdk/messages/core.message.medias_pb';
import {CloseRounded, CloudDownloadRounded, InsertDriveFileRounded} from '@material-ui/icons';
import {IFileProgress} from '../../services/sdk/fileServer';
import ProgressBroadcaster from '../../services/progress';

import './style.css';

interface IProps {
    message: IMessage;
    peer: InputPeer | null;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view', message: IMessage) => void;
}

interface IState {
    caption: string;
    fileName: string;
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

        const info = this.getFileInfo(props.message);

        this.state = {
            caption: info.caption,
            fileName: info.name,
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
            const info = this.getFileInfo(newProps.message);
            this.setState({
                caption: info.caption,
                fileName: info.name,
                fileState: this.getFileState(newProps.message),
                message: newProps.message,
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
    }

    public componentWillUnmount() {
        this.removeAllListeners();
    }

    public render() {
        const {caption, fileName, fileState} = this.state;
        return (
            <div className="message-file">
                <div className="file-content">
                    <div className="file-action">
                        {Boolean(fileState === 'view') &&
                        <InsertDriveFileRounded/>}
                        {Boolean(fileState === 'download') &&
                        <CloudDownloadRounded onClick={this.downloadFileHandler}/>}
                        {Boolean(fileState === 'progress') && <React.Fragment>
                            <div className="progress">
                                <svg viewBox="0 0 32 32">
                                    <circle ref={this.progressRefHandler} r="12" cx="16" cy="16"/>
                                </svg>
                            </div>
                            <CloseRounded className="action" onClick={this.cancelFileHandler}/>
                        </React.Fragment>}
                    </div>
                    <div className="file-info">
                        <div className="file-name">{fileName}</div>
                        {Boolean(fileState === 'view') &&
                        <div className="file-download" onClick={this.viewFileHandler}>Save</div>}
                    </div>
                </div>
                {Boolean(caption.length > 0) && <div className="file-caption">{caption}</div>}
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
        if (progress.state === 'failed') {
            this.setState({
                fileState: 'download',
            });
            return;
        } else if (progress.state !== 'complete' && progress.download > 0) {
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
            this.setState({
                fileState: 'progress',
            }, () => {
                this.initProgress();
            });
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

    private getFileInfo(message: IMessage): { name: string, caption: string } {
        const info: { name: string, caption: string } = {
            caption: '',
            name: '',
        };
        const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
        info.caption = messageMediaDocument.caption || '';
        if (!message.attributes) {
            return info;
        }
        messageMediaDocument.doc.attributesList.forEach((attr, index) => {
            if (attr.type === DocumentAttributeType.ATTRIBUTETYPEFILE && message.attributes) {
                const docAttr: DocumentAttributeFile.AsObject = message.attributes[index];
                info.name = docAttr.filename || '';
            }
        });
        return info;
    }
}

export default MessageFile;
