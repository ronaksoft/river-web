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
import {FileLocation, InputPeer} from '../../services/sdk/messages/chat.core.types_pb';
import {
    DocumentAttributePhoto,
    DocumentAttributeType,
    MediaDocument
} from '../../services/sdk/messages/chat.core.message.medias_pb';
import {CloseRounded, CloudDownloadRounded} from '@material-ui/icons';
import {IFileProgress} from '../../services/sdk/fileManager';
import ProgressBroadcaster from '../../services/progress';

import './style.css';
import CachedPhoto from '../CachedPhoto';
import {IDocument} from '../../services/documentViewerService';
import DocumentViewerService from '../../services/documentViewerService';

const C_MAX_HEIGHT = 256;
const C_MIN_HEIGHT = 64;
const C_MAX_WIDTH = 256;
const C_MIN_WIDTH = 64;

export interface IPictureInfo {
    caption: string;
    file: FileLocation.AsObject;
    height: number;
    size: number;
    thumbFile: FileLocation.AsObject;
    type: string;
    width: number;
}

export const getPictureInfo = (message: IMessage): IPictureInfo => {
    const info: IPictureInfo = {
        caption: '',
        file: {
            accesshash: '',
            clusterid: 0,
            fileid: '',
        },
        height: 0,
        size: 0,
        thumbFile: {
            accesshash: '',
            clusterid: 0,
            fileid: '',
        },
        type: '',
        width: 0,
    };
    const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
    info.caption = messageMediaDocument.caption || '';
    info.size = messageMediaDocument.doc.filesize || 0;
    info.type = messageMediaDocument.doc.mimetype || '';
    info.file = {
        accesshash: messageMediaDocument.doc.accesshash,
        clusterid: messageMediaDocument.doc.clusterid,
        fileid: messageMediaDocument.doc.id,
    };
    if (messageMediaDocument.doc.thumbnail) {
        info.thumbFile = {
            accesshash: messageMediaDocument.doc.thumbnail.accesshash,
            clusterid: messageMediaDocument.doc.thumbnail.clusterid,
            fileid: messageMediaDocument.doc.thumbnail.fileid,
        };
    }
    if (!message.attributes) {
        return info;
    }
    messageMediaDocument.doc.attributesList.forEach((attr, index) => {
        if (attr.type === DocumentAttributeType.ATTRIBUTETYPEPHOTO && message.attributes) {
            const docAttr: DocumentAttributePhoto.AsObject = message.attributes[index];
            info.height = docAttr.height || 0;
            info.width = docAttr.width || 0;
        }
    });
    return info;
};

interface IProps {
    measureFn: any;
    message: IMessage;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open', message: IMessage) => void;
    peer: InputPeer | null;
}

interface IState {
    fileState: 'download' | 'view' | 'progress' | 'open';
    info: IPictureInfo;
    message: IMessage;
}

class MessagePicture extends React.PureComponent<IProps, IState> {
    private lastId: number = 0;
    private fileId: string = '';
    private downloaded: boolean = false;
    private saved: boolean = false;
    private circleProgressRef: any = null;
    private eventReferences: any[] = [];
    private progressBroadcaster: ProgressBroadcaster;
    private fileSizeRef: any = null;
    private fileSize: number = 0;
    private documentViewerService: DocumentViewerService;
    private readonly pictureContentSize: { height: string, width: string } = {
        height: `${C_MIN_HEIGHT}px`,
        width: `${C_MIN_WIDTH}px`
    };

    constructor(props: IProps) {
        super(props);

        const info = getPictureInfo(props.message);
        this.fileSize = info.size;

        this.pictureContentSize = this.getContentSize(info);

        this.state = {
            fileState: this.getFileState(props.message),
            info,
            message: props.message,
        };

        if (props.message) {
            this.lastId = props.message.id || 0;
            this.downloaded = props.message.downloaded || false;
            this.saved = props.message.saved || false;
        }

        this.progressBroadcaster = ProgressBroadcaster.getInstance();
        this.documentViewerService = DocumentViewerService.getInstance();
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
            const info = getPictureInfo(newProps.message);
            this.fileSize = info.size;
            this.displayFileSize(0);
            this.setState({
                fileState: this.getFileState(newProps.message),
                info,
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
        const {fileState, info, message} = this.state;
        return (
            <div className="message-picture">
                <div className="picture-content" style={this.pictureContentSize}>
                    {Boolean(fileState !== 'view' && fileState !== 'open') &&
                    <div className="picture-thumb">
                        <CachedPhoto className="picture"
                                     fileLocation={(message.id || 0) > 0 ? info.thumbFile : info.file}
                                     onLoad={this.cachedPhotoLoadHandler} blur={10} searchTemp={true}/>
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
                    </div>}
                    {Boolean(fileState === 'view' || fileState === 'open') &&
                    <div className="picture-big" onClick={this.showPictureHandler}>
                        <CachedPhoto className="picture" fileLocation={info.file}
                                     onLoad={this.cachedPhotoLoadHandler}/>
                    </div>}
                </div>
                {Boolean(info.caption.length > 0) && <div className="picture-caption">{info.caption}</div>}
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

    /* CachedPhoto onLoad handler */
    private cachedPhotoLoadHandler = () => {
        if (this.props.measureFn) {
            this.props.measureFn();
        }
    }

    /* Get content size */
    private getContentSize(info: IPictureInfo): { height: string, width: string } {
        const ratio = info.height / info.width;
        let height = info.height;
        let width = info.width;
        if (ratio > 1.0) {
            height = C_MAX_HEIGHT;
            width = C_MAX_HEIGHT / ratio;
        } else {
            width = C_MAX_WIDTH;
            height = C_MAX_WIDTH * ratio;
        }
        if (isNaN(height)) {
            height = C_MIN_HEIGHT;
        }
        if (isNaN(width)) {
            width = C_MIN_WIDTH;
        }
        height = Math.max(height, C_MIN_HEIGHT);
        width = Math.max(width, C_MIN_WIDTH);
        return {
            height: `${height}px`,
            width: `${width}px`,
        };
    }

    /* Show picture handler */
    private showPictureHandler = (e: any) => {
        const {info, message} = this.state;
        if (!info || !info.file) {
            return;
        }
        const doc: IDocument = {
            items: [{
                caption: info.caption,
                fileLocation: info.file,
                height: info.height,
                id: message.id || 0,
                width: info.width,
            }],
            peerId: message.peerid || '',
            rect: e.currentTarget.getBoundingClientRect(),
            type: 'picture',
        };
        this.documentViewerService.loadDocument(doc);
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
