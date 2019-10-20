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
import {FileLocation, InputPeer, PeerType} from '../../services/sdk/messages/chat.core.types_pb';
import {
    DocumentAttributeAudio,
    DocumentAttributeFile,
    DocumentAttributePhoto,
    DocumentAttributeType, DocumentAttributeVideo,
    MediaDocument
} from '../../services/sdk/messages/chat.core.message.medias_pb';
import {CloseRounded, CloudDownloadRounded, PlayArrowRounded} from '@material-ui/icons';
import {IFileProgress} from '../../services/sdk/fileManager';
import ProgressBroadcaster from '../../services/progress';
import CachedPhoto from '../CachedPhoto';
import {IDocument} from '../../services/documentViewerService';
import DocumentViewerService from '../../services/documentViewerService';
import {getHumanReadableSize} from '../MessageFile';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import DownloadManager from '../../services/downloadManager';

import './style.css';

const C_MAX_HEIGHT = 256;
const C_MIN_HEIGHT = 86;
const C_MIN_HEIGHT_TINY = 100;
const C_MAX_WIDTH = 256;
const C_MAX_CAPTION_WIDTH = 256 + 6;
const C_MIN_CAPTION_LEN_APPLIER = 10;
const C_MIN_WIDTH = 86;

export interface IMediaInfo {
    album?: string;
    caption: string;
    duration?: number;
    file: FileLocation.AsObject;
    fileName: string;
    hasRelation: boolean;
    height: number;
    md5?: string;
    mimeType?: string;
    performer?: string;
    size: number;
    thumbFile: FileLocation.AsObject;
    title?: string;
    type: string;
    width: number;
}

export const getMediaInfo = (message: IMessage): IMediaInfo => {
    const info: IMediaInfo = {
        caption: '',
        file: {
            accesshash: '',
            clusterid: 0,
            fileid: '',
        },
        fileName: '',
        hasRelation: false,
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
    if (!messageMediaDocument) {
        return info;
    }
    info.caption = messageMediaDocument.caption || '';
    if (!messageMediaDocument.doc) {
        return info;
    }
    info.size = messageMediaDocument.doc.filesize || 0;
    info.type = messageMediaDocument.doc.mimetype || '';
    info.file = {
        accesshash: messageMediaDocument.doc.accesshash,
        clusterid: messageMediaDocument.doc.clusterid,
        fileid: messageMediaDocument.doc.id,
    };
    info.mimeType = messageMediaDocument.doc.mimetype;
    info.md5 = messageMediaDocument.doc.md5checksum;
    if (messageMediaDocument.doc.thumbnail) {
        info.thumbFile = {
            accesshash: messageMediaDocument.doc.thumbnail.accesshash,
            clusterid: messageMediaDocument.doc.thumbnail.clusterid,
            fileid: messageMediaDocument.doc.thumbnail.fileid,
        };
    }
    if ((message.replyto && message.deleted_reply !== true) || (message.fwdsenderid && message.fwdsenderid !== '0')) {
        info.hasRelation = true;
    }
    if (!message.attributes) {
        return info;
    }
    messageMediaDocument.doc.attributesList.forEach((attr, index) => {
        if (attr.type === DocumentAttributeType.ATTRIBUTETYPEPHOTO && message.attributes) {
            const docAttr: DocumentAttributePhoto.AsObject = message.attributes[index];
            info.height = docAttr.height || 0;
            info.width = docAttr.width || 0;
        } else if (attr.type === DocumentAttributeType.ATTRIBUTETYPEVIDEO && message.attributes) {
            const docAttr: DocumentAttributeVideo.AsObject = message.attributes[index];
            info.height = docAttr.height || 0;
            info.width = docAttr.width || 0;
            info.duration = docAttr.duration;
        } else if (attr.type === DocumentAttributeType.ATTRIBUTETYPEAUDIO && message.attributes) {
            const docAttr: DocumentAttributeAudio.AsObject = message.attributes[index];
            info.duration = docAttr.duration;
            info.album = docAttr.album;
            if (docAttr.title && docAttr.title.length > 0) {
                info.title = docAttr.title;
            } else {
                info.title = 'Unknown';
            }
            if (docAttr.performer && docAttr.performer.length > 0) {
                info.performer = docAttr.performer;
            } else {
                info.performer = 'Unknown';
            }
        } else if (attr.type === DocumentAttributeType.ATTRIBUTETYPEFILE && message.attributes) {
            const docAttr: DocumentAttributeFile.AsObject = message.attributes[index];
            info.fileName = docAttr.filename || '';
        }
    });
    return info;
};

export const getContentSize = (message: IMessage): null | { height: number, width: number } => {
    const info: {
        height: number,
        width: number,
    } = {
        height: 0,
        width: 0,
    };
    const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
    if (!messageMediaDocument) {
        return null;
    }
    messageMediaDocument.doc.attributesList.forEach((attr, index) => {
        if (attr.type === DocumentAttributeType.ATTRIBUTETYPEPHOTO && message.attributes) {
            const docAttr: DocumentAttributePhoto.AsObject = message.attributes[index];
            info.height = docAttr.height || 0;
            info.width = docAttr.width || 0;
        } else if (attr.type === DocumentAttributeType.ATTRIBUTETYPEVIDEO && message.attributes) {
            const docAttr: DocumentAttributeVideo.AsObject = message.attributes[index];
            info.height = docAttr.height || 0;
            info.width = docAttr.width || 0;
        }
    });
    if (info.height === 0 || info.width === 0) {
        return null;
    }
    const ratio = info.height / info.width;
    let height = info.height;
    let width = info.width;
    if (ratio > 1.0) {
        if (info.height < C_MAX_HEIGHT) {
            height = info.height;
            width = info.height / ratio;
        } else {
            height = C_MAX_HEIGHT;
            width = C_MAX_HEIGHT / ratio;
        }
    } else {
        if (info.width < C_MAX_WIDTH) {
            width = info.width;
            height = info.width * ratio;
        } else {
            width = C_MAX_WIDTH;
            height = C_MAX_WIDTH * ratio;
        }
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
        height,
        width,
    };
};

interface IProps {
    measureFn: any;
    message: IMessage;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open' | 'read', message: IMessage) => void;
    parentEl: any;
    peer: InputPeer | null;
}

interface IState {
    fileState: 'download' | 'view' | 'progress' | 'open';
    info: IMediaInfo;
    message: IMessage;
    transition: boolean;
}

class MessageMedia extends React.PureComponent<IProps, IState> {
    private messageMediaClass: string = '';
    private lastId: number = 0;
    private fileId: string = '';
    private downloaded: boolean = false;
    private saved: boolean = false;
    private circleProgressRef: any = null;
    private eventReferences: any[] = [];
    private progressBroadcaster: ProgressBroadcaster;
    private mediaSizeRef: any = null;
    private fileSize: number = 0;
    private documentViewerService: DocumentViewerService;
    private readonly pictureContentSize: { height: string, maxWidth: string, nHeight: number, width: string } = {
        height: `${C_MIN_HEIGHT}px`,
        maxWidth: `${C_MIN_WIDTH}px`,
        nHeight: 0,
        width: `${C_MIN_WIDTH}px`,
    };
    private mediaBigRef: any = null;
    private blurredImageEnable: boolean = false;
    private contentRead: boolean = false;
    private downloadManager: DownloadManager;
    private transitionTimeout: any = null;

    constructor(props: IProps) {
        super(props);

        const info = getMediaInfo(props.message);
        this.fileSize = info.size;

        this.pictureContentSize = this.getContentSize(info);
        // Resize parent cell (bubble max-width) for media messages with caption
        // if (this.blurredImageEnable) {
        //     setTimeout(() => {
        //         if (this.props.parentEl && this.props.parentEl.ref) {
        //             this.props.parentEl.ref.style.maxWidth = this.pictureContentSize.maxWidth;
        //             this.cachedPhotoLoadHandler(true);
        //         }
        //     }, 1);
        // }

        this.state = {
            fileState: this.getFileState(props.message),
            info,
            message: props.message,
            transition: false,
        };

        if (props.message) {
            this.lastId = props.message.id || 0;
            this.downloaded = props.message.downloaded || false;
            this.saved = props.message.saved || false;
            this.contentRead = props.message.contentread || false;
        }

        this.progressBroadcaster = ProgressBroadcaster.getInstance();
        this.documentViewerService = DocumentViewerService.getInstance();
        this.downloadManager = DownloadManager.getInstance();
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
            this.downloaded = newProps.message.downloaded || false;
            this.saved = newProps.message.saved || false;
            this.contentRead = newProps.message.contentread || false;
            const info = getMediaInfo(newProps.message);
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
                message: newProps.message,
            }, () => {
                this.forceUpdate();
            });
        }
        if ((newProps.message.saved || false) !== this.saved) {
            this.saved = (newProps.message.saved || false);
            this.setState({
                fileState: this.getFileState(newProps.message),
                message: newProps.message,
            });
        }
        if ((newProps.message.contentread || false) !== this.contentRead) {
            this.contentRead = (newProps.message.contentread || false);
            this.setState({
                message: newProps.message,
            }, () => {
                this.forceUpdate();
            });
        }
    }

    public componentWillUnmount() {
        this.removeAllListeners();
        clearTimeout(this.transitionTimeout);
    }

    /* View downloaded document */
    public viewDocument = () => {
        const {fileState, message} = this.state;
        if (this.mediaBigRef && (fileState === 'view' || fileState === 'open')) {
            this.showMediaHandler(this.mediaBigRef);
            if (!this.contentRead && this.props.onAction) {
                this.contentRead = true;
                this.props.onAction('read', message);
            }
        }
    }

    public render() {
        const {fileState, info, message, transition} = this.state;
        return (
            <div className={'message-media' + this.messageMediaClass}>
                <div className={'media-content' + (message.messagetype === C_MESSAGE_TYPE.Video ? ' video' : '')}
                     style={{
                         height: this.pictureContentSize.height,
                         maxWidth: this.pictureContentSize.maxWidth,
                         minWidth: this.pictureContentSize.width,
                     }}>
                    {Boolean(info.duration) &&
                    <div className="media-duration">
                        <PlayArrowRounded/><span>{this.getDuration(info.duration || 0)}</span>
                        {!message.contentread && <span className="unread-bullet"/>}
                    </div>}
                    {Boolean(((fileState !== 'view' && fileState !== 'open') || transition) && (message.id || 0) > 0) &&
                    <div className="media-container">
                        <div className="media-size" ref={this.mediaSizeRefHandler}>0 KB</div>
                        <div className="media-big" style={{height: this.pictureContentSize.height}}>
                            {this.blurredImageEnable &&
                            <CachedPhoto className="blurred-picture" blur={10}
                                         fileLocation={info.thumbFile}/>}
                            <CachedPhoto className="picture"
                                         fileLocation={(message.id || 0) < 0 && message.messagetype === C_MESSAGE_TYPE.Picture ? info.file : info.thumbFile}
                                         style={this.pictureContentSize}
                                         onLoad={this.cachedPhotoLoadHandler} blur={10} searchTemp={true}/>
                            <div className="media-action">
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
                    </div>}
                    {Boolean((fileState === 'view' || fileState === 'open') || transition || (message.id || 0) < 0) &&
                    <div className={'media-container downloaded-media' + (transition ? ' media-transition' : '')}>
                        <div ref={this.pictureBigRefHandler} style={{height: this.pictureContentSize.height}}
                             className="media-big"
                             onClick={this.showMediaHandler}>
                            {this.blurredImageEnable &&
                            <CachedPhoto className="blurred-picture" blur={10}
                                         fileLocation={info.thumbFile} searchTemp={true}/>}
                            <CachedPhoto className="picture" style={this.pictureContentSize}
                                         fileLocation={message.messagetype === C_MESSAGE_TYPE.Picture ? info.file : info.thumbFile}
                                         onLoad={this.cachedPhotoLoadHandler} searchTemp={true}/>
                            {Boolean(message.messagetype === C_MESSAGE_TYPE.Video) &&
                            <div className="media-action" onClick={this.viewDocument}>
                                <PlayArrowRounded/>
                            </div>}
                        </div>
                    </div>}
                </div>
                {Boolean(info.caption.length > 0) &&
                <div className={'media-caption ' + (message.rtl ? 'rtl' : 'ltr')}
                     style={{minWidth: this.pictureContentSize.width, maxWidth: this.pictureContentSize.maxWidth}}
                     onClick={this.captionClickHandler}
                >{info.caption}</div>}
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
            message.downloaded = true;
            this.setState({
                fileState: 'view',
                message,
                transition: true,
            }, () => {
                this.transitionTimeout = setTimeout(() => {
                    this.setState({
                        transition: true,
                    });
                }, 800);
                this.forceUpdate();
            });
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
                            if ((message.messagetype === C_MESSAGE_TYPE.Picture && ds.chat_photos) || (message.messagetype === C_MESSAGE_TYPE.Video && ds.chat_videos)) {
                                this.downloadFileHandler();
                            }
                            break;
                        case PeerType.PEERGROUP:
                            if ((message.messagetype === C_MESSAGE_TYPE.Picture && ds.group_photos) || (message.messagetype === C_MESSAGE_TYPE.Video && ds.group_videos)) {
                                this.downloadFileHandler();
                            }
                            break;
                    }
                }
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

    /* CachedPhoto onLoad handler */
    private cachedPhotoLoadHandler = (force?: boolean) => {
        if (this.props.measureFn && (this.pictureContentSize.nHeight < 10 || force === true)) {
            window.console.log('cachedPhotoLoadHandler', this.pictureContentSize.nHeight, force);
            this.props.measureFn();
        }
    }

    /* Picture big ref handler */
    private pictureBigRefHandler = (ref: any) => {
        this.mediaBigRef = ref;
    }

    /* Get content size */
    private getContentSize(info: IMediaInfo): { height: string, maxWidth: string, nHeight: number, width: string } {
        const ratio = info.height / info.width;
        let height = info.height;
        let width = info.width;
        if (ratio > 1.0) {
            if (info.height < C_MAX_HEIGHT) {
                height = info.height;
                width = info.height / ratio;
            } else {
                height = C_MAX_HEIGHT;
                width = C_MAX_HEIGHT / ratio;
            }
        } else {
            if (info.width < C_MAX_WIDTH) {
                width = info.width;
                height = info.width * ratio;
            } else {
                width = C_MAX_WIDTH;
                height = C_MAX_WIDTH * ratio;
            }
        }
        if (isNaN(height)) {
            height = C_MIN_HEIGHT;
        }
        if (isNaN(width)) {
            width = C_MIN_WIDTH;
        }
        height = Math.max(height, C_MIN_HEIGHT);
        width = Math.max(width, C_MIN_WIDTH);
        let maxWidth = width;
        if (info.caption.length > C_MIN_CAPTION_LEN_APPLIER || info.hasRelation) {
            maxWidth = C_MAX_CAPTION_WIDTH;
            this.blurredImageEnable = true;
        }
        if (height < C_MIN_HEIGHT_TINY) {
            this.messageMediaClass = ' tiny-message';
        }
        return {
            height: `${height}px`,
            maxWidth: `${maxWidth}px`,
            nHeight: height,
            width: `${width}px`,
        };
    }

    /* Show media handler */
    private showMediaHandler = (e: any) => {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        const {info, message} = this.state;
        if (!info || !info.file) {
            return;
        }
        let el = (e.currentTarget || e);
        const picEl = el.querySelector('.picture');
        if (picEl) {
            el = picEl;
        }
        const doc: IDocument = {
            anchor: 'message',
            items: [{
                caption: info.caption,
                downloaded: message.downloaded || false,
                fileLocation: info.file,
                fileSize: info.size,
                height: info.height,
                id: message.id || 0,
                md5: info.md5,
                mimeType: info.mimeType,
                rtl: message.rtl,
                thumbFileLocation: message.messagetype !== C_MESSAGE_TYPE.Picture ? info.thumbFile : undefined,
                width: info.width,
            }],
            peerId: message.peerid || '',
            rect: el.getBoundingClientRect(),
            type: message.messagetype === C_MESSAGE_TYPE.Picture ? 'picture' : 'video',
        };
        this.documentViewerService.loadDocument(doc);
    }

    /* File size ref handler */
    private mediaSizeRefHandler = (ref: any) => {
        this.mediaSizeRef = ref;
    }

    /* Display file size */
    private displayFileSize(loaded: number) {
        if (!this.mediaSizeRef) {
            return;
        }
        if (loaded <= 0) {
            this.mediaSizeRef.innerText = `${getHumanReadableSize(this.fileSize)}`;
        } else {
            this.mediaSizeRef.innerText = `${getHumanReadableSize(loaded)} / ${getHumanReadableSize(this.fileSize)}`;
        }
    }

    /* Get duration with time format */
    private getDuration(duration: number) {
        let sec = String(duration % 60);
        if (sec.length === 1) {
            sec = '0' + sec;
        }
        return `${Math.floor(duration / 60)}:${sec}`;
    }

    private captionClickHandler = (e: any) => {
        e.stopPropagation();
        e.preventDefault();
    }
}

export default MessageMedia;
