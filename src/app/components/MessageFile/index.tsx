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
import {InputPeer, PeerType} from '../../services/sdk/messages/chat.core.types_pb';
import {
    DocumentAttributeFile, DocumentAttributeType, MediaDocument,
} from '../../services/sdk/messages/chat.core.message.medias_pb';
import {CloseRounded, CloudDownloadRounded, InsertDriveFileRounded} from '@material-ui/icons';
import {IFileProgress} from '../../services/sdk/fileManager';
import ProgressBroadcaster from '../../services/progress';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import DownloadManager from '../../services/downloadManager';
import i18n from '../../services/i18n';

import './style.css';

/* Get human readable size */
export const getHumanReadableSize = (size: number) => {
    if (size < 1024) {
        return `${size} B`;
    } else if (size < 1048576) { // 1024 * 1024
        return `${(size / 1024).toFixed(1)} KB`;
    } else if (size < 1073741824) { // 1024 * 1024 * 1024
        return `${(size / 1048576).toFixed(1)} MB`;
    } else {
        return `${(size / 1073741824).toFixed(1)} GB`;
    }
};

export const getFileInfo = (message: IMessage): IFileInfo => {
    const info: IFileInfo = {
        caption: '',
        name: '',
        size: 0,
        type: '',
    };
    const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
    info.caption = messageMediaDocument.caption || '';
    info.size = messageMediaDocument.doc.filesize || 0;
    info.type = messageMediaDocument.doc.mimetype || '';
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
};

export const getFileExtension = (type: string, name?: string) => {
    switch (type) {
        case 'text/plain':
            return 'txt';
        case 'text/markdown':
            return 'md';
        case 'image/bmp':
            return 'bmp';
        case 'image/tiff':
            return 'tif';
        case 'image/jpeg':
            return 'jpg';
        case 'image/gif':
            return 'gif';
        case 'image/ief':
            return 'ief';
        case 'image/png':
            return 'png';
        case 'image/vnd.dwg':
            return 'dwg';
        case 'image/svg+xml':
            return 'svg';
        case 'image/webp':
            return 'webp';
        case 'audio/aac':
            return 'acc';
        case 'audio/mpeg':
            return 'mpg';
        case 'audio/wma':
            return 'wma';
        case 'audio/mp3':
            return 'mp3';
        case 'audio/mp4':
            return 'm4a';
        case 'audio/ogg':
            return 'ogg';
        case 'audio/x-matroska':
            return '.mka';
        case 'audio/flac':
            return 'flac';
        case 'video/mp4':
            return 'mp4';
        case 'video/3gp':
            return '3gp';
        case 'video/ogg':
            return 'ogv';
        case 'video/webm':
            return 'webm';
        case 'video/quicktime':
            return 'mov';
        case 'video/x-matroska':
            return 'mkv';
        case 'video/x-matroska-3d':
            return 'mk3d';
        case 'application/vnd.android.package-archive':
            return 'apk';
        case 'application/exe':
            return 'exe';
        case 'application/msword':
            return 'doc';
        case 'application/vnd.ms-excel':
            return 'xls';
        case 'application/pdf':
            return 'pdf';
        case 'application/x-rar-compressed':
            return 'rar';
        case 'application/zip':
            return 'zip';
        case 'application/ogg':
            return 'ogx';
        default:
            if (name) {
                const parts = name.split('.');
                if (parts.length > 1) {
                    return parts[parts.length - 1];
                }
            }
            return '';
    }
};

interface IProps {
    message: IMessage;
    peer: InputPeer | null;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open' | 'preview', message: IMessage) => void;
}

interface IState {
    caption: string;
    fileName: string;
    fileState: 'download' | 'view' | 'progress' | 'open';
    message: IMessage;
    type: string;
}

interface IFileInfo {
    name: string;
    caption: string;
    size: number;
    type: string;
}

class MessageFile extends React.PureComponent<IProps, IState> {
    private lastId: number = 0;
    private fileId: string = '';
    private downloaded: boolean = false;
    private saved: boolean = false;
    private circleProgressRef: any = null;
    private eventReferences: any[] = [];
    private progressBroadcaster: ProgressBroadcaster;
    private fileSizeRef: any = null;
    private fileSize: number = 0;
    private downloadManager: DownloadManager;
    private readonly isMac: boolean = false;

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
        this.downloadManager = DownloadManager.getInstance();

        this.isMac = navigator.platform.indexOf('Mac') > -1;
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
        const {caption, type, fileName, fileState, message} = this.state;
        return (
            <div className="message-file">
                <div className="file-content">
                    <div className="file-action">
                        {Boolean(fileState === 'view' || fileState === 'open') &&
                        <Tooltip
                            title={fileState === 'open' ? i18n.t('media.preview') : ''}
                            placement="top"
                            className="tooltip"
                        >
                            <div onClick={this.previewFileHandler}>
                                <InsertDriveFileRounded/>
                                <span className="extension">{getFileExtension(type)}</span>
                            </div>
                        </Tooltip>}
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
                    <div className="file-info">
                        <div className="file-name">{fileName}</div>
                        <div className="file-row">
                            <div className="file-size" ref={this.fileSizeRefHandler}>0 KB</div>
                            {Boolean(fileState === 'view') &&
                            <div className="file-download"
                                 onClick={this.viewFileHandler}>{i18n.t('general.save')}</div>}
                            {Boolean(fileState === 'open') &&
                            <div className="file-download"
                                 onClick={this.openFileHandler}>{this.isMac ? i18n.t('general.show_in_finder') : i18n.t('general.show_in_folder')}</div>}
                        </div>
                    </div>
                </div>
                {Boolean(caption.length > 0) &&
                <div className={'file-caption ' + (message.rtl ? 'rtl' : 'ltr')}>{caption}</div>}
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
        if (progress.state === 'complete') {
            this.displayFileSize(0);
        } else if ((message.id || 0) > 0) {
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
        if (this.circleProgressRef) {
            this.circleProgressRef.style.strokeDasharray = `${v} 88`;
        }
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
            } else {
                const {peer} = this.props;
                if (peer && message && !message.downloaded) {
                    const ds = this.downloadManager.getDownloadSettings();
                    switch (peer.getType()) {
                        case PeerType.PEERUSER:
                            if (ds.chat_files) {
                                this.downloadFileHandler();
                            }
                            break;
                        case PeerType.PEERGROUP:
                            if (ds.group_files) {
                                this.downloadFileHandler();
                            }
                            break;
                    }
                }
            }
        }
    }

    /* View file */
    private viewFileHandler = () => {
        if (this.props.onAction) {
            this.props.onAction('view', this.state.message);
        }
    }

    /* Open file */
    private openFileHandler = () => {
        if (this.props.onAction) {
            this.props.onAction('open', this.state.message);
        }
    }

    /* Preview file */
    private previewFileHandler = () => {
        if (this.props.onAction && this.state.fileState === 'open') {
            this.props.onAction('preview', this.state.message);
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

    /* File size ref handler */
    private fileSizeRefHandler = (ref: any) => {
        this.fileSizeRef = ref;
    }

    /* Display file size */
    private displayFileSize(loaded: number) {
        if (!this.fileSizeRef) {
            return;
        }
        if (loaded <= 0) {
            this.fileSizeRef.innerText = `${getHumanReadableSize(this.fileSize)}`;
        } else {
            this.fileSizeRef.innerText = `${getHumanReadableSize(loaded)} / ${getHumanReadableSize(this.fileSize)}`;
        }
    }
}

export default MessageFile;
