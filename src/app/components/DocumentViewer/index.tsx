/*
    Creation Time: 2019 - Feb - 03
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {
    KeyboardArrowLeftRounded,
    KeyboardArrowRightRounded,
    MoreVertRounded,
    RotateLeftRounded,
    RotateRightRounded,
    ZoomInRounded,
    ZoomOutRounded,
    CropFreeRounded, CloudDownloadRounded, CloseRounded,
} from '@material-ui/icons';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DocumentViewService, {IDocument} from '../../services/documentViewerService';
import CachedPhoto from '../CachedPhoto';
import CachedVideo from '../CachedVideo';
import {IMessage} from '../../repository/message/interface';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import {getMediaInfo} from '../MessageMedia';
import {IFileProgress} from '../../services/sdk/fileManager';
import {getHumanReadableSize} from '../MessageFile';
import ProgressBroadcaster from '../../services/progress';
import Scrollbars from 'react-custom-scrollbars';

import './style.css';

const C_MAX_WIDTH = 800;
const C_MAX_HEIGHT = 600;
const C_CONTAINER_RATIO = C_MAX_HEIGHT / C_MAX_WIDTH;

interface ISize {
    height: string;
    width: string;
}

interface IProps {
    className?: string;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open', messageId: number) => void;
}

interface IState {
    className: string;
    dialogOpen: boolean;
    doc: IDocument | null;
    fileState: 'download' | 'view' | 'progress' | 'open';
    next: IMessage | null;
    prev: IMessage | null;
    size?: ISize;
}

class DocumentViewer extends React.Component<IProps, IState> {
    private documentViewerService: DocumentViewService;
    private pictureWrapperRef: any = null;
    private floatPictureRef: any = null;
    private animated: boolean = false;
    private documentContainerRef: any = null;
    private circleProgressRef: any = null;
    private mediaSizeRef: any = null;
    private progressBroadcaster: ProgressBroadcaster;
    private eventReferences: any[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            dialogOpen: false,
            doc: null,
            fileState: 'view',
            next: null,
            prev: null,
        };

        this.documentViewerService = DocumentViewService.getInstance();
        this.progressBroadcaster = ProgressBroadcaster.getInstance();
    }

    public componentDidMount() {
        this.documentViewerService.setDocumentReady(this.documentReadyHandler);
        window.addEventListener('keydown', this.windowKeyDownHandler, true);
    }

    public componentWillUnmount() {
        window.removeEventListener('keydown', this.windowKeyDownHandler, true);
    }

    public render() {
        const {className, dialogOpen} = this.state;
        return (
            <Dialog
                open={dialogOpen}
                onClose={this.dialogCloseHandler}
                className={'document-viewer-dialog ' + className}
            >
                <div ref={this.documentContainerRefHandler} className="document-container">
                    {this.getContent()}
                </div>
                {this.initCaption()}
                {this.initPagination()}
                {this.initControls()}
                {this.getFloatObj()}
            </Dialog>
        );
    }

    private documentContainerRefHandler = (ref: any) => {
        this.documentContainerRef = ref;
    }

    private getContent() {
        const {doc, size} = this.state;
        if (!doc) {
            return '';
        }
        switch (doc.type) {
            case 'avatar':
                return (<div className="avatar-container">
                    {doc.items.map((item, index) => {
                        return (
                            <React.Fragment key={index}>
                                {item.thumbFileLocation && <div className="thumbnail">
                                    <CachedPhoto fileLocation={item.thumbFileLocation}/>
                                </div>}
                                <div className="photo">
                                    <CachedPhoto fileLocation={item.fileLocation}/>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>);
            case 'picture':
                return (<div className="picture-container">
                    {doc.items.map((item, index) => {
                        return (
                            <React.Fragment key={index}>
                                <div ref={this.pictureWrapperRefHandler} className="picture-wrapper hide"
                                     style={size ? size : {}}>
                                    {item.thumbFileLocation && <div className="thumbnail">
                                        <CachedPhoto fileLocation={item.thumbFileLocation} blur={10}/>
                                    </div>}
                                    {this.getDownloadAction()}
                                    {Boolean(item.downloaded !== false) &&
                                    <CachedPhoto className="picture" fileLocation={item.fileLocation}/>}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>);
            case 'video':
                return (<div className="video-container">
                    {doc.items.map((item, index) => {
                        return (
                            <React.Fragment key={index}>
                                <div ref={this.pictureWrapperRefHandler} className="picture-wrapper hide"
                                     style={size ? size : {}}>
                                    {item.thumbFileLocation && <div className="thumbnail">
                                        <CachedPhoto fileLocation={item.thumbFileLocation}
                                                     blur={item.downloaded === false ? 10 : 0}/>
                                    </div>}
                                    {Boolean(item.downloaded !== false) &&
                                    <CachedVideo className="video" fileLocation={item.fileLocation} autoPlay={false}
                                                 timeOut={200}/>}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>);
            default:
                return '';
        }
    }

    private pictureWrapperRefHandler = (ref: any) => {
        this.pictureWrapperRef = ref;
    }

    private getDownloadAction() {
        const {fileState} = this.state;
        return (
            <div className="media-action">
                <div className="media-size" ref={this.mediaSizeRefHandler}>0 KB</div>
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
        );
    }

    private initPagination() {
        const {prev, next} = this.state;
        return (
            <div className="document-viewer-pagination">
                <div className="pagination-item prev" hidden={!Boolean(prev)} onClick={this.prevHandler}>
                    <KeyboardArrowLeftRounded/>
                </div>
                <div className="pagination-item next" hidden={!Boolean(next)} onClick={this.nextHandler}>
                    <KeyboardArrowRightRounded/>
                </div>
            </div>
        );
    }

    private initControls() {
        return (
            <div className="document-viewer-controls">
                <div className="controls">
                    <div className="item">
                        <MoreVertRounded/>
                    </div>
                    <div className="item">
                        <RotateRightRounded/>
                    </div>
                    <div className="item">
                        <RotateLeftRounded/>
                    </div>
                    <div className="item">
                        <ZoomOutRounded/>
                    </div>
                    <div className="item">
                        <ZoomInRounded/>
                    </div>
                    <div className="item">
                        <CropFreeRounded/>
                    </div>
                </div>
            </div>
        );
    }

    private initCaption() {
        const {doc} = this.state;
        if (!doc || doc.items.length === 0 || (doc.items[0].caption || '').length === 0) {
            return '';
        }
        return (
            <div className="document-viewer-caption">
                <div className="caption-wrapper">
                    <Scrollbars
                        autoHide={true}
                    >
                        <div>
                            <div className="caption">{doc.items[0].caption}</div>
                        </div>
                    </Scrollbars>
                </div>
            </div>
        );
    }

    private reset() {
        this.setState({
            doc: null,
        });
        this.removeAllListeners();
        if (!this.documentContainerRef) {
            return;
        }
        this.documentContainerRef.classList.remove('prev', 'next', 'animate');
    }

    private getFloatObj() {
        const {doc, size} = this.state;
        if (!size || !doc || !doc.rect || doc.items.length === 0 || (doc.type === 'video' && !doc.items[0].thumbFileLocation)) {
            if (this.pictureWrapperRef) {
                this.pictureWrapperRef.classList.remove('hide');
            }
            return '';
        }
        if (this.state.dialogOpen && !this.animated) {
            this.animated = true;
            setTimeout(() => {
                this.animateInFloatPicture(size);
            }, 10);
        }
        const fileLocation: any = doc.type === 'video' ? doc.items[0].thumbFileLocation : doc.items[0].fileLocation;
        return (<div ref={this.floatPictureRefHandler} className="float-picture" style={{
            height: `${doc.rect.height}px`,
            left: `${doc.rect.left}px`,
            top: `${doc.rect.top}px`,
            width: `${doc.rect.width}px`,
        }}>
            <CachedPhoto className="picture" fileLocation={fileLocation}/>
        </div>);
    }

    private floatPictureRefHandler = (ref: any) => {
        this.floatPictureRef = ref;
    }

    private animateInFloatPicture(size: ISize) {
        const showMedia = () => {
            if (this.pictureWrapperRef) {
                this.pictureWrapperRef.classList.remove('hide');
            }
            if (this.floatPictureRef) {
                this.floatPictureRef.classList.add('hide');
            }
        };
        if (!this.floatPictureRef) {
            showMedia();
            return;
        }
        this.floatPictureRef.style.height = size.height;
        this.floatPictureRef.style.width = size.width;
        this.floatPictureRef.style.top = `50%`;
        this.floatPictureRef.style.left = `50%`;
        this.floatPictureRef.style.transform = `translate(-50%, -50%)`;
        this.floatPictureRef.style.borderRadius = `0`;
        setTimeout(() => {
            showMedia();
        }, 300);
    }

    private animateOutFloatPicture(callback: any) {
        const {doc} = this.state;
        if (!this.floatPictureRef || !doc || doc.items.length === 0) {
            callback();
            return;
        }
        const el = document.querySelector(`.bubble-wrapper .bubble.b_${doc.items[0].id} .message-media .media-big .picture`);
        if (!el) {
            callback();
            return;
        }
        if (this.pictureWrapperRef) {
            this.pictureWrapperRef.classList.add('hide');
        }
        if (this.floatPictureRef) {
            this.floatPictureRef.classList.remove('hide');
        }
        const rect = el.getBoundingClientRect();
        this.floatPictureRef.style.height = `${rect.height}px`;
        this.floatPictureRef.style.width = `${rect.width}px`;
        this.floatPictureRef.style.top = `${rect.top}px`;
        this.floatPictureRef.style.left = `${rect.left}px`;
        this.floatPictureRef.style.transform = ``;
        this.floatPictureRef.style.borderRadius = ``;
        setTimeout(() => {
            callback();
        }, 300);
    }

    private dialogCloseHandler = () => {
        const closeDialog = () => {
            this.setState({
                dialogOpen: false,
                size: undefined,
            });
            this.animated = false;
        };
        const {doc} = this.state;
        this.reset();
        if (doc && (doc.type === 'picture' || doc.type === 'video')) {
            this.animateOutFloatPicture(() => {
                closeDialog();
            });
        } else {
            closeDialog();
        }
    }

    private dialogOpen = (doc: IDocument) => {
        const download = (doc.items.length > 0 && doc.items[0].downloaded === false);
        this.setState({
            dialogOpen: true,
            doc,
            fileState: download ? 'download' : 'view',
        }, () => {
            if (doc.type === 'picture' || doc.type === 'video') {
                this.calculateImageSize();
                this.initPaginationHandlers();
                if (download) {
                    this.displayFileSize(-1);
                }
            }
        });
    }

    private documentReadyHandler = (doc: IDocument) => {
        this.dialogOpen(doc);
    }

    private calculateImageSize() {
        const {doc} = this.state;
        if (!doc || doc.items.length === 0) {
            return;
        }
        let height = (doc.items[0].height || 1);
        let width = (doc.items[0].width || 1);
        const ratio = height / width;
        if (ratio > C_CONTAINER_RATIO) {
            if (height > C_MAX_HEIGHT) {
                height = C_MAX_HEIGHT;
                width = C_MAX_HEIGHT / ratio;
            }
        } else {
            if (width > C_MAX_WIDTH) {
                width = C_MAX_WIDTH;
                height = C_MAX_WIDTH * ratio;
            }
        }
        this.setState({
            size: {
                height: `${height}px`,
                width: `${width}px`,
            }
        });
    }

    private initPaginationHandlers() {
        this.documentViewerService.setDocumentPrev((item: any) => {
            this.setState({
                prev: item,
            });
        });
        this.documentViewerService.setDocumentNext((item: any) => {
            this.setState({
                next: item,
            });
        });
    }

    private animateSlide(next: boolean, callback?: any) {
        if (!this.documentContainerRef) {
            return;
        }
        this.documentContainerRef.classList.remove('prev', 'next', 'animate');
        if (next) {
            this.documentContainerRef.classList.add('next', 'animate');
        } else {
            this.documentContainerRef.classList.add('prev', 'animate');
        }
        setTimeout(() => {
            this.reset();
            if (callback) {
                callback();
            }
        }, 200);
    }

    private prevHandler = () => {
        this.animateSlide(false, () => {
            if (this.state.prev) {
                this.loadMedia(this.state.prev);
            }
        });
    }

    private nextHandler = () => {
        this.animateSlide(true, () => {
            if (this.state.next) {
                this.loadMedia(this.state.next);
            }
        });
    }

    private windowKeyDownHandler = (e: any) => {
        if (!this.state.dialogOpen) {
            return;
        }
        if (e.keyCode === 39) {
            if (this.state.next) {
                this.nextHandler();
            }
        } else if (e.keyCode === 37) {
            if (this.state.prev) {
                this.prevHandler();
            }
        }
    }

    private loadMedia(message: IMessage) {
        const info = getMediaInfo(message);
        const doc: IDocument = {
            items: [{
                caption: info.caption,
                downloaded: message.downloaded || false,
                fileLocation: info.file,
                fileSize: info.size,
                height: info.height,
                id: message.id || 0,
                thumbFileLocation: info.thumbFile,
                width: info.width,
            }],
            peerId: message.peerid || '',
            type: message.messagetype === C_MESSAGE_TYPE.Picture ? 'picture' : 'video',
        };
        this.documentViewerService.loadDocument(doc);
    }

    /* Progress circle ref handler */
    private progressRefHandler = (ref: any) => {
        this.circleProgressRef = ref;
    }

    /* Download progress handler */
    private downloadProgressHandler = (progress: IFileProgress) => {
        const {doc} = this.state;
        if (!doc || doc.items.length === 0) {
            return;
        }
        if ((doc.items[0].id || 0) > 0) {
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
            doc.items[0].downloaded = true;
            this.setState({
                doc,
            });
        }
        if (v < 3) {
            v = 3;
        }
        this.circleProgressRef.style.strokeDasharray = `${v} 88`;
    }

    /* Download file handler */
    private downloadFileHandler = () => {
        const {doc} = this.state;
        if (!doc || doc.items.length === 0) {
            return;
        }
        if (this.props.onAction) {
            this.props.onAction('download', doc.items[0].id || 0);
            this.setState({
                fileState: 'progress',
            }, () => {
                this.initProgress();
            });
        }
    }

    /* Cancel file download/upload */
    private cancelFileHandler = () => {
        const {doc} = this.state;
        if (!doc || doc.items.length === 0) {
            return;
        }
        if (this.props.onAction) {
            this.props.onAction('cancel_download', doc.items[0].id || 0);
        }
    }

    /* Initialize progress bar */
    private initProgress() {
        const {doc} = this.state;
        if (!doc || doc.items.length === 0) {
            return;
        }
        if (this.state.fileState === 'progress') {
            this.removeAllListeners();
            this.eventReferences.push(this.progressBroadcaster.listen(doc.items[0].id || 0, this.downloadProgressHandler));
        } else {
            if (this.progressBroadcaster.isActive(doc.items[0].id || 0)) {
                this.setState({
                    fileState: 'progress',
                }, () => {
                    this.removeAllListeners();
                    this.eventReferences.push(this.progressBroadcaster.listen(doc.items[0].id || 0, this.downloadProgressHandler));
                });
            }
        }
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
        const {doc} = this.state;
        if (!doc || doc.items.length === 0) {
            return;
        }
        if (loaded <= 0) {
            this.mediaSizeRef.innerText = `${getHumanReadableSize(doc.items[0].fileSize || 0)}`;
        } else {
            this.mediaSizeRef.innerText = `${getHumanReadableSize(loaded)} / ${getHumanReadableSize(doc.items[0].fileSize || 0)}`;
        }
    }

    /* Remove all listeners */
    private removeAllListeners() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }
}

export default DocumentViewer;
