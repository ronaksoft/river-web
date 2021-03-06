/*
    Creation Time: 2019 - Feb - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
import {IMessage} from '../../repository/message/interface';
import {FileLocation, InputPeer, MessageEntity, PeerType} from '../../services/sdk/messages/core.types_pb';
import {
    DocumentAttribute,
    DocumentAttributeAudio, DocumentAttributeFile,
    DocumentAttributePhoto,
    DocumentAttributeType, DocumentAttributeVideo,
    MediaDocument, MediaWebDocument
} from '../../services/sdk/messages/chat.messages.medias_pb';
import {CloseRounded, ArrowDownwardRounded, PlayArrowRounded, GifRounded} from '@material-ui/icons';
import {IFileProgress} from '../../services/sdk/fileManager';
import ProgressBroadcaster from '../../services/progress';
import CachedPhoto from '../CachedPhoto';
import {IDocument} from '../../services/documentViewerService';
import DocumentViewerService from '../../services/documentViewerService';
import {getHumanReadableSize} from '../MessageFile';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import SettingsConfigManager from '../../services/settingsConfigManager';
import {renderBody} from "../Message";
import ElectronService from "../../services/electron";
import {transformMimeType} from "../StreamVideo/helper";
import {GetDbFileName} from "../../repository/file";
import UserName from "../UserName";
import i18n from "../../services/i18n";
import Broadcaster from "../../services/broadcaster";
import {MESSAGE_ORIENTATION_UPDATED} from "../DocumentViewer";

import './style.scss';

export const C_MEDIA_BREAKPOINT = 1116;
const C_MIN_HEIGHT_TINY = 102;
const C_MIN_CAPTION_LEN_APPLIER = 10;
let C_MAX_HEIGHT = 256;
let C_MIN_HEIGHT = 96;
let C_MAX_WIDTH = 256;
let C_MAX_CAPTION_WIDTH = 256 + 6;
let C_MIN_WIDTH = 96;

export const initMediaSize = () => {
    const width = window.innerWidth || 640;
    const c = width < C_MEDIA_BREAKPOINT ? 1 : 1.5;
    C_MAX_HEIGHT = 256 * c;
    C_MIN_HEIGHT = 96 * c;
    C_MAX_WIDTH = 256 * c;
    C_MAX_CAPTION_WIDTH = 256 * c + 6;
    C_MIN_WIDTH = 96 * c;
};

export interface IMediaInfo {
    album?: string;
    animated?: boolean;
    caption: string;
    duration?: number;
    entityList?: MessageEntity.AsObject[];
    file: FileLocation.AsObject;
    fileName: string;
    hasRelation: boolean;
    height: number;
    md5?: string;
    mimeType?: string;
    orientation?: number;
    performer?: string;
    size: number;
    thumbFile: FileLocation.AsObject;
    tinyThumb?: string;
    title?: string;
    type: string;
    width: number;
}

export const getMediaInfo = (message: IMessage): IMediaInfo => {
    const info: IMediaInfo = {
        animated: false,
        caption: '',
        file: {
            accesshash: '',
            clusterid: 1,
            fileid: '',
        },
        fileName: '',
        hasRelation: false,
        height: 0,
        size: 0,
        thumbFile: {
            accesshash: '',
            clusterid: 1,
            fileid: '',
        },
        tinyThumb: undefined,
        type: '',
        width: 0,
    };
    if (message.orientation) {
        info.orientation = message.orientation;
    }
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
    if (messageMediaDocument.doc.tinythumbnail) {
        info.tinyThumb = messageMediaDocument.doc.tinythumbnail as string;
    }
    if ((message.replyto && message.deleted_reply !== true) || (message.fwdsenderid && message.fwdsenderid !== '0')) {
        info.hasRelation = true;
    }
    if (messageMediaDocument.entitiesList) {
        info.entityList = messageMediaDocument.entitiesList;
    }
    if (!message.attributes) {
        return info;
    }
    messageMediaDocument.doc.attributesList.forEach((attr, index) => {
        if (attr.type === DocumentAttributeType.ATTRIBUTETYPEPHOTO && message.attributes) {
            const docAttr: DocumentAttributePhoto.AsObject = message.attributes[index];
            if (docAttr) {
                info.height = docAttr.height || 0;
                info.width = docAttr.width || 0;
            }
        } else if (attr.type === DocumentAttributeType.ATTRIBUTETYPEVIDEO && message.attributes) {
            const docAttr: DocumentAttributeVideo.AsObject = message.attributes[index];
            if (docAttr) {
                info.height = docAttr.height || 0;
                info.width = docAttr.width || 0;
                info.duration = docAttr.duration;
            }
        } else if (attr.type === DocumentAttributeType.ATTRIBUTETYPEFILE && message.attributes) {
            const docAttr: DocumentAttributeFile.AsObject = message.attributes[index];
            info.fileName = docAttr.filename || '';
        } else if (attr.type === DocumentAttributeType.ATTRIBUTETYPEANIMATED && message.attributes) {
            info.animated = true;
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
    let attributesList: DocumentAttribute.AsObject[] = [];
    if (message.messagetype === C_MESSAGE_TYPE.WebDocument) {
        const messageMediaWebDocument: MediaWebDocument.AsObject = message.mediadata;
        if (!messageMediaWebDocument) {
            return null;
        }
        attributesList = messageMediaWebDocument.attributesList || [];
    } else {
        const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
        if (!messageMediaDocument || messageMediaDocument.doc) {
            return null;
        }
        attributesList = messageMediaDocument.doc.attributesList || [];
    }
    attributesList.forEach((attr, index) => {
        if (attr.type === DocumentAttributeType.ATTRIBUTETYPEPHOTO && message.attributes) {
            const docAttr: DocumentAttributePhoto.AsObject = message.attributes[index];
            if (docAttr) {
                info.height = docAttr.height || 0;
                info.width = docAttr.width || 0;
            }
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

/* Get duration with time format */
export const getDuration = (duration: number) => {
    let sec = String(duration % 60);
    if (sec.length === 1) {
        sec = '0' + sec;
    }
    return `${Math.floor(duration / 60)}:${sec}`;
};

interface IProps {
    measureFn: any;
    message: IMessage;
    onAction?: (cmd: 'cancel' | 'download' | 'download_stream' | 'cancel_download' | 'view' | 'open' | 'read', message: IMessage) => void;
    onBodyAction: (cmd: string, text: string) => void;
    parentEl: any;
    peer: InputPeer | null;
}

interface IState {
    fileState: 'download' | 'view' | 'progress' | 'open' | 'failed';
    info: IMediaInfo;
    message: IMessage;
    streamReady: boolean;
    transition: boolean;
}

class MessageMedia extends React.PureComponent<IProps, IState> {
    private ref: any;
    private messageMediaClass: string = '';
    private lastId: number = 0;
    private dbFileName: string = '';
    private downloaded: boolean = false;
    private saved: boolean = false;
    private circleProgressRef: any = null;
    private eventReferences: any[] = [];
    private progressBroadcaster: ProgressBroadcaster;
    private mediaSizeRef: any = null;
    private fileSize: number = 0;
    private documentViewerService: DocumentViewerService;
    private pictureContentSize: { height: string, maxWidth: string, nHeight: number, width: string } = {
        height: `${C_MIN_HEIGHT}px`,
        maxWidth: `${C_MIN_WIDTH}px`,
        nHeight: 0,
        width: `${C_MIN_WIDTH}px`,
    };
    private mediaBigRef: any = null;
    private blurredImageEnable: boolean = false;
    private contentRead: boolean = false;
    private settingsConfigManager: SettingsConfigManager;
    private transitionTimeout: any = null;
    private isElectron: boolean = ElectronService.isElectron();
    private broadcaster: Broadcaster;

    constructor(props: IProps) {
        super(props);

        const info = getMediaInfo(props.message);
        this.fileSize = info.size;

        this.pictureContentSize = this.getContentSize(info);
        // Resize parent cell (bubble max-width) for media messages with caption or reply
        if (this.blurredImageEnable) {
            requestAnimationFrame(() => {
                if (this.props.parentEl && this.props.parentEl.ref) {
                    this.props.parentEl.ref.style.maxWidth = this.pictureContentSize.maxWidth;
                    this.cachedPhotoLoadHandler(true);
                }
            });
        }

        this.state = {
            fileState: this.getFileState(props.message),
            info,
            message: props.message,
            streamReady: this.isStreamReady(info.mimeType || ''),
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
        this.settingsConfigManager = SettingsConfigManager.getInstance();
        this.broadcaster = Broadcaster.getInstance();
    }

    public componentDidMount() {
        const {message} = this.state;
        const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
        if (!message || !messageMediaDocument.doc) {
            return;
        }
        this.displayFileSize(0);
        this.dbFileName = GetDbFileName(messageMediaDocument.doc.id, messageMediaDocument.doc.clusterid);
        this.initProgress();
        // Orientation event
        this.eventReferences.push(this.broadcaster.listen(MESSAGE_ORIENTATION_UPDATED, this.messageOrientationUpdateHandler));
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
        // @ts-ignore
        const state: IState = {};
        let updateState: boolean = false;
        let forceUpdate: boolean = false;
        let initProgress: boolean = false;
        if (newProps.message && this.lastId !== newProps.message.id) {
            this.lastId = newProps.message.id || 0;
            this.downloaded = newProps.message.downloaded || false;
            this.saved = newProps.message.saved || false;
            this.contentRead = newProps.message.contentread || false;
            const info = getMediaInfo(newProps.message);
            this.fileSize = info.size;
            this.displayFileSize(0);
            state.fileState = this.getFileState(newProps.message);
            state.info = info;
            state.message = newProps.message;
            state.streamReady = this.isStreamReady(info.mimeType || '');
            updateState = true;
            initProgress = true;
        }
        const messageMediaDocument: MediaDocument.AsObject = newProps.message.mediadata;
        if (messageMediaDocument && messageMediaDocument.doc) {
            const fileName = GetDbFileName(messageMediaDocument.doc.id, messageMediaDocument.doc.clusterid);
            if (fileName !== this.dbFileName) {
                this.dbFileName = fileName;
                state.info = getMediaInfo(newProps.message);
                state.message = newProps.message;
                updateState = true;
            }
        }
        if ((newProps.message.downloaded || false) !== this.downloaded) {
            this.downloaded = (newProps.message.downloaded || false);
            state.fileState = this.getFileState(newProps.message);
            state.message = newProps.message;
            updateState = true;
            forceUpdate = true;
        }
        if ((newProps.message.saved || false) !== this.saved) {
            this.saved = newProps.message.saved || false;
            state.fileState = this.getFileState(newProps.message);
            state.message = newProps.message;
            updateState = true;
        }
        if ((newProps.message.contentread || false) !== this.contentRead) {
            this.contentRead = newProps.message.contentread || false;
            state.message = newProps.message;
            forceUpdate = true;
            updateState = true;
        }
        if (updateState) {
            this.setState(state, () => {
                if (initProgress) {
                    this.initProgress();
                }
                if (forceUpdate) {
                    this.forceUpdate();
                }
            });
        }
    }

    public componentWillUnmount() {
        this.removeAllListeners();
        clearTimeout(this.transitionTimeout);
    }

    /* View downloaded document */
    public viewDocumentHandler = () => {
        const {fileState, message, streamReady} = this.state;
        if (this.mediaBigRef && (fileState === 'view' || fileState === 'open' || (!message.downloaded && streamReady))) {
            this.showMediaHandler(this.mediaBigRef);
            if (!this.contentRead && this.props.onAction) {
                this.contentRead = true;
                this.props.onAction('read', message);
            }
        }
    }

    /* Check blur */
    public checkBlur = () => {
        if (!this.blurredImageEnable && this.ref && this.ref.firstElementChild) {
            if (this.ref.offsetWidth > this.ref.firstElementChild.offsetWidth) {
                const info = getMediaInfo(this.props.message);
                this.fileSize = info.size;
                this.pictureContentSize = this.getContentSize(info, true);
                this.forceUpdate();
            }
        }
    }

    public render() {
        const {fileState, info, message, transition, streamReady} = this.state;
        return (
            <div ref={this.refHandler} className={'message-media' + this.messageMediaClass}>
                <div className={'media-content' + (message.messagetype === C_MESSAGE_TYPE.Video ? ' video' : '')}
                     style={{
                         height: this.pictureContentSize.height,
                         maxWidth: this.pictureContentSize.maxWidth,
                         minWidth: this.pictureContentSize.width,
                     }}>
                    {this.durationContent()}
                    {Boolean(((fileState !== 'view' && fileState !== 'open') || transition) && (message.id || 0) > 0) &&
                    <div className="media-container">
                        {!Boolean(streamReady && !message.downloaded) &&
                        <div className="media-size" ref={this.mediaSizeRefHandler}>0 KB</div>}
                        {this.getContent()}
                    </div>}
                    {Boolean((fileState === 'view' || fileState === 'open') || transition || (message.id || 0) < 0) &&
                    <div className={'media-container downloaded-media' + (transition ? ' media-transition' : '')}>
                        {Boolean((message.id || 0) < 0) &&
                        <div className="media-size" ref={this.mediaSizeRefHandler}>0 KB</div>}
                        {this.getContent(true)}
                    </div>}
                </div>
                {Boolean(info.caption.length > 0) &&
                <div className={'media-caption ' + (message.rtl ? 'rtl' : 'ltr')}
                     style={{maxWidth: this.pictureContentSize.maxWidth, minWidth: this.pictureContentSize.width}}
                     onClick={this.captionClickHandler}
                >{renderBody(info.caption, info.entityList, this.isElectron, this.props.onBodyAction, this.props.measureFn)}</div>}
            </div>
        );
    }

    private getContent(downloaded?: boolean) {
        const {info, message} = this.state;
        return (<div ref={this.pictureBigRefHandler} className="media-big"
                     style={{height: this.pictureContentSize.height}}>
            {this.blurredImageEnable &&
            <CachedPhoto className="blurred-picture" blur={10}
                         fileLocation={info.thumbFile} mimeType="image/jpeg"
                         tempFile={(message.id || 0) < 0 ? message.temp_file : undefined}
                         tinyThumb={(message.id || 0) > 0 && !downloaded ? info.tinyThumb : undefined}
            />}
            <CachedPhoto className="picture"
                         fileLocation={((message.id || 0) < 0 || downloaded) && message.messagetype !== C_MESSAGE_TYPE.Video ? info.file : info.thumbFile}
                         mimeType={((message.id || 0) < 0 || downloaded) && message.messagetype !== C_MESSAGE_TYPE.Video ? (info.mimeType || 'image/jpeg') : 'image/jpeg'}
                         style={this.pictureContentSize}
                         onLoad={this.cachedPhotoLoadHandler} blur={downloaded ? undefined : 10} searchTemp={true}
                         tempFile={(message.id || 0) < 0 ? message.temp_file : undefined}
                         tinyThumb={(message.id || 0) > 0 && !downloaded ? info.tinyThumb : undefined}
            />
            {info.animated &&
            <div className={'gif-badge' + (message.viabotid && message.viabotid !== '0' ? ' with-via' : '')}>
                <GifRounded/>
                {message.viabotid && message.viabotid !== '0' &&
                <UserName className="via-user" id={message.viabotid} prefix={i18n.t('general.via_gif')} username={true}
                          noIcon={true}/>}
            </div>}
            {this.getMediaAction()}
        </div>);
    }

    private durationContent() {
        const {info, message, streamReady} = this.state;
        if (Boolean(info.duration) && (message.id || 0) > 0) {
            if (streamReady && !message.downloaded) {
                return (<div className="media-duration-container media-stream-ready">
                    {this.progressContent(true)}
                    <div className="stream-media-duration">{getDuration(info.duration || 0)}</div>
                    <div className="stream-media-size" ref={this.mediaSizeRefHandler}>0 KB</div>
                    {!message.contentread && <span className="unread-bullet"/>}
                </div>);
            } else {
                return (<div className="media-duration-container">
                    <PlayArrowRounded/><span>{getDuration(info.duration || 0)}</span>
                    {!message.contentread && <span className="unread-bullet"/>}
                </div>);
            }
        }
        return null;
    }

    /* Ref handler */
    private refHandler = (ref: any) => {
        this.ref = ref;
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

    private getMediaAction() {
        const {fileState, message, streamReady} = this.state;
        if ((message.id || 0) < 0 || fileState === 'download' || fileState === 'progress' || fileState === 'failed') {
            if (streamReady && !message.downloaded && (message.id || 0) > 0) {
                return (<div className="media-action" onClick={this.viewDocumentHandler}>
                    <PlayArrowRounded/>
                </div>);
            } else {
                return this.progressContent(false);
            }
        } else if (message.messagetype === C_MESSAGE_TYPE.Video) {
            return (<div className="media-action" onClick={this.viewDocumentHandler}>
                <PlayArrowRounded/>
            </div>);
        } else {
            return null;
        }
    }

    private progressContent(stream: boolean) {
        const {fileState} = this.state;
        return (<div className="media-action">
            {Boolean(fileState === 'download') &&
            <ArrowDownwardRounded onClick={this.downloadFileHandler(stream)}/>}
            {Boolean(fileState === 'progress') && <>
                <div className="progress">
                    <svg viewBox='0 0 32 32'>
                        <circle ref={this.progressRefHandler} r='14' cx='16' cy='16'/>
                    </svg>
                </div>
                <CloseRounded className="action" onClick={this.cancelFileHandler}/>
            </>}
        </div>);
    }

    /* Progress circle ref handler */
    private progressRefHandler = (ref: any) => {
        this.circleProgressRef = ref;
    }

    /* File progress handler */
    private fileProgressHandler = (progress: IFileProgress) => {
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
    private downloadFileHandler = (stream: boolean) => (e?: any) => {
        if (e) {
            e.stopPropagation();
        }
        if (this.props.onAction) {
            this.props.onAction(stream ? 'download_stream' : 'download', this.state.message);
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
                this.eventReferences.push(this.progressBroadcaster.listen(message.id || 0, this.fileProgressHandler));
            }
        } else {
            if (this.progressBroadcaster.isActive(message.id || 0)) {
                this.setState({
                    fileState: 'progress',
                }, () => {
                    this.removeAllListeners();
                    this.eventReferences.push(this.progressBroadcaster.listen(message.id || 0, this.fileProgressHandler));
                });
            } else {
                const {peer} = this.props;
                if (peer && message && !message.downloaded) {
                    const ds = this.settingsConfigManager.getDownloadSettings();
                    switch (peer.getType()) {
                        case PeerType.PEERUSER:
                        case PeerType.PEEREXTERNALUSER:
                            if ((message.messagetype === C_MESSAGE_TYPE.Picture && ds.chat_photos) || (message.messagetype === C_MESSAGE_TYPE.Gif && ds.chat_gifs) || (message.messagetype === C_MESSAGE_TYPE.Video && ds.chat_videos)) {
                                this.downloadFileHandler(false)();
                            }
                            break;
                        case PeerType.PEERGROUP:
                            if ((message.messagetype === C_MESSAGE_TYPE.Picture && ds.group_photos) || (message.messagetype === C_MESSAGE_TYPE.Gif && ds.group_gifs) || (message.messagetype === C_MESSAGE_TYPE.Video && ds.group_videos)) {
                                this.downloadFileHandler(false)();
                            }
                            break;
                    }
                }
            }
        }
    }

    /* Cancel file download/upload */
    private cancelFileHandler = (e: any) => {
        e.stopPropagation();
        if (this.props.onAction) {
            e.stopPropagation();
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
            this.props.measureFn();
        }
    }

    /* Picture big ref handler */
    private pictureBigRefHandler = (ref: any) => {
        this.mediaBigRef = ref;
    }

    /* Get content size */
    private getContentSize(info: IMediaInfo, force?: boolean): { height: string, maxWidth: string, nHeight: number, width: string } {
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
        if (info.caption.length > C_MIN_CAPTION_LEN_APPLIER || info.hasRelation || force) {
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
        const {info, message, streamReady} = this.state;
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
                createdon: message.createdon,
                downloaded: message.downloaded || false,
                duration: info.duration,
                entityList: info.entityList,
                fileLocation: info.file,
                fileSize: info.size,
                height: info.height,
                id: message.id || 0,
                md5: info.md5,
                mimeType: info.mimeType,
                orientation: info.orientation,
                rtl: message.rtl,
                thumbFileLocation: message.messagetype === C_MESSAGE_TYPE.Video ? undefined : info.thumbFile,
                userId: message.senderid || '',
                width: info.width,
            }],
            peer: {id: message.peerid || '', peerType: message.peertype || 0},
            rect: el.getBoundingClientRect(),
            stream: Boolean(streamReady && !message.downloaded),
            teamId: message.teamid || '0',
            type: message.messagetype === C_MESSAGE_TYPE.Video ? 'video' : 'picture',
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

    private captionClickHandler = (e: any) => {
        e.stopPropagation();
        e.preventDefault();
    }

    private isStreamReady(mimeType: string) {
        // @ts-ignore
        if (MediaSource === undefined) {
            return false;
        }
        return MediaSource.isTypeSupported(transformMimeType(mimeType));
    }

    private messageOrientationUpdateHandler = (data: { id: number, orientation: number }) => {
        if (this.props.message.id !== data.id) {
            return;
        }
        const {message} = this.state;
        message.orientation = data.orientation;
        this.setState({
            info: getMediaInfo(message),
            message,
        });
    }
}

export default MessageMedia;
