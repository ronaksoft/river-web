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
    CropFreeRounded,
} from '@material-ui/icons';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DocumentViewService, {IDocument} from '../../services/documentViewerService';
import CachedPhoto from '../CachedPhoto';
import CachedVideo from '../CachedVideo';
import {IMessage} from '../../repository/message/interface';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import {getMediaInfo} from '../MessageMedia';
import DownloadProgress from '../DownloadProgress';

import './style.css';

const C_MAX_WIDTH = 800;
const C_MAX_HEIGHT = 600;
const C_CONTAINER_RATIO = C_MAX_HEIGHT / C_MAX_WIDTH;

interface IXY {
    x: number;
    y: number;
}

interface IMediaTransform {
    origin: IXY;
    pan: IXY;
    panStartPos: IXY;
    rotate: number;
    startPan: boolean;
    zoom: number;
}

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
    private mediaTransformTimeout: any = null;
    private mediaTransform: IMediaTransform = {
        origin: {
            x: 50,
            y: 50,
        },
        pan: {
            x: 0,
            y: 0,
        },
        panStartPos: {
            x: 0,
            y: 0,
        },
        rotate: 0,
        startPan: false,
        zoom: 1,
    };
    private lastAnchorType?: 'message' | 'shared_media' | 'shared_media_full';

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
    }

    public componentDidMount() {
        this.documentViewerService.setDocumentReady(this.documentReadyHandler);
        window.addEventListener('keydown', this.windowKeyDownHandler, true);
        window.addEventListener('mousemove', this.mediaDocumentMouseMoveHandler);
        window.addEventListener('mouseup', this.mediaDocumentMouseUpHandler);
    }

    public componentWillUnmount() {
        window.removeEventListener('keydown', this.windowKeyDownHandler, true);
        window.removeEventListener('mousemove', this.mediaDocumentMouseMoveHandler);
        window.removeEventListener('mouseup', this.mediaDocumentMouseUpHandler);
    }

    public render() {
        const {className, dialogOpen} = this.state;
        return (
            <Dialog
                open={dialogOpen}
                onClose={this.dialogCloseHandler}
                className={'document-viewer-dialog ' + className}
            >
                <div ref={this.documentContainerRefHandler} className="document-container"
                     onMouseDown={this.mediaDocumentMouseDownHandler} onWheel={this.mediaDocumentWheelHandler}>
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
                                    <CachedPhoto className="thumb-picture" fileLocation={item.thumbFileLocation}/>
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
                                        <CachedPhoto className="thumb-picture" fileLocation={item.thumbFileLocation}
                                                     blur={10}/>
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
                                        <CachedPhoto className="thumb-picture" fileLocation={item.thumbFileLocation}
                                                     blur={item.downloaded === false ? 10 : 0}/>
                                    </div>}
                                    {this.getDownloadAction()}
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
        const {doc} = this.state;
        if (!doc || !(doc.items.length > 0 && doc.items[0].downloaded === false)) {
            return '';
        }

        return (<DownloadProgress id={doc.items[0].id || 0} fileSize={doc.items[0].fileSize || 0}
                                  onAction={this.props.onAction} onComplete={this.downloadCompleteHandler}/>);
    }

    private initPagination() {
        const {doc, prev, next} = this.state;
        if (!doc || doc.type === 'avatar') {
            return '';
        }
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
                    <div className="item" onClick={this.transformHandler.bind(this, 'rotate-cw')}>
                        <RotateRightRounded/>
                    </div>
                    <div className="item" onClick={this.transformHandler.bind(this, 'rotate-ccw')}>
                        <RotateLeftRounded/>
                    </div>
                    <div className="item" onClick={this.transformHandler.bind(this, 'zoom-out')}>
                        <ZoomOutRounded/>
                    </div>
                    <div className="item" onClick={this.transformHandler.bind(this, 'zoom-in')}>
                        <ZoomInRounded/>
                    </div>
                    <div className="item" onClick={this.transformHandler.bind(this, 'reset')}>
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
                    <div className="caption">{doc.items[0].caption}</div>
                </div>
            </div>
        );
    }

    private reset() {
        this.setState({
            doc: null,
        });
        if (!this.documentContainerRef) {
            return;
        }
        this.documentContainerRef.classList.remove('prev', 'next', 'animate');
    }

    private getFloatObj() {
        const {doc, size} = this.state;
        if (!size || !doc || doc.items.length === 0 || (doc.type === 'video' && !doc.items[0].thumbFileLocation)) {
            if (this.pictureWrapperRef) {
                this.pictureWrapperRef.classList.remove('hide');
            }
            return '';
        }
        const downloaded = !(doc.items.length > 0 && doc.items[0].downloaded === false);
        const fileLocation: any = (doc.type === 'video' ? doc.items[0].thumbFileLocation : (downloaded ? doc.items[0].fileLocation : doc.items[0].thumbFileLocation));
        const fromMedia = (doc.anchor !== "message");
        if (!doc.rect) {
            if (this.pictureWrapperRef) {
                this.pictureWrapperRef.classList.remove('hide');
            }
            if (size) {
                return (<div ref={this.floatPictureRefHandler}
                             className={`float-picture hide ${fromMedia ? 'from-media' : ''}`} style={{
                    borderRadius: `0`,
                    height: `${size.height}px`,
                    left: `50%`,
                    top: `50%`,
                    transform: `translate(-50%, -50%)`,
                    width: `${size.width}px`,
                }}>
                    <CachedPhoto className="picture"
                                 fileLocation={downloaded ? fileLocation : doc.items[0].thumbFileLocation}
                                 blur={downloaded ? 0 : 10}/>
                </div>);
            } else {
                return '';
            }
        }
        if (this.state.dialogOpen && !this.animated) {
            this.animated = true;
            setTimeout(() => {
                this.animateInFloatPicture(size);
            }, 10);
        }
        return (
            <div ref={this.floatPictureRefHandler} className={`float-picture ${fromMedia ? 'from-media' : ''}`} style={{
                height: `${doc.rect.height}px`,
                left: `${doc.rect.left}px`,
                top: `${doc.rect.top}px`,
                width: `${doc.rect.width}px`,
            }}>
                <CachedPhoto className="picture" fileLocation={fileLocation} blur={downloaded ? 0 : 10}/>
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
        let el: Element | null;
        switch (doc.anchor) {
            case 'shared_media':
                el = document.querySelector(`.peer-media .media-item.item_${doc.items[0].id} .picture`);
                break;
            case 'shared_media_full':
                el = document.querySelector(`.peer-media.full .media-item.item_${doc.items[0].id} .picture`);
                break;
            default:
            case 'message':
                el = document.querySelector(`.bubble-wrapper .bubble.b_${doc.items[0].id} .message-media .media-big .picture`);
                break;
        }
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
                next: null,
                prev: null,
                size: undefined,
            });
            this.animated = false;
            this.reset();
        };
        const {doc} = this.state;
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
        this.lastAnchorType = doc.anchor;
        this.setState({
            dialogOpen: true,
            doc,
            fileState: download ? 'download' : 'view',
        }, () => {
            if (doc.type === 'picture' || doc.type === 'video') {
                this.calculateImageSize();
                this.initPaginationHandlers();
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
            anchor: this.lastAnchorType,
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

    /* Document transform handler */
    private transformHandler = (cmd: string) => {
        switch (cmd) {
            case 'zoom-in':
                this.mediaTransform.zoom += 0.15;
                break;
            case 'zoom-out':
                this.mediaTransform.zoom -= 0.15;
                break;
            case 'rotate-cw':
                this.mediaTransform.rotate += 90;
                break;
            case 'rotate-ccw':
                this.mediaTransform.rotate -= 90;
                break;
            case 'reset':
                this.mediaTransform.zoom = 1.0;
                this.mediaTransform.pan.x = 0;
                this.mediaTransform.pan.y = 0;
                this.mediaTransform.origin.x = 50;
                this.mediaTransform.origin.y = 50;
                this.mediaTransform.rotate = 0;
                break;
        }
        this.applyMediaTransform(true);
    }

    /* Document mouse down handler */
    private mediaDocumentMouseDownHandler = (e: any) => {
        if (e.button !== 0) {
            return;
        }
        this.mediaTransform.startPan = true;
        this.mediaTransform.panStartPos.x = e.pageX - this.mediaTransform.pan.x;
        this.mediaTransform.panStartPos.y = e.pageY - this.mediaTransform.pan.y;
        this.applyMediaTransform(false);
    }

    /* Document mouse move handler */
    private mediaDocumentMouseMoveHandler = (e: any) => {
        if (!this.mediaTransform.startPan) {
            return;
        }
        e.preventDefault();
        this.mediaTransform.pan.x = (e.pageX - this.mediaTransform.panStartPos.x);
        this.mediaTransform.pan.y = (e.pageY - this.mediaTransform.panStartPos.y);
        this.applyMediaTransform(false);
    }

    /* Document mouse up handler */
    private mediaDocumentMouseUpHandler = (e: any) => {
        if (this.mediaTransform.startPan) {
            e.preventDefault();
            this.mediaTransform.startPan = false;
        }
    }

    /* Document wheel handler */
    private mediaDocumentWheelHandler = (e: any) => {
        if (!e.ctrlKey && !e.metaKey) {
            this.mediaTransform.zoom += e.deltaY / 100;
        } else {
            this.mediaTransform.pan.x -= e.deltaX;
            this.mediaTransform.pan.y -= e.deltaY;
        }
        this.applyMediaTransform(false);
    }

    /* Apply media transform */
    private applyMediaTransform(animate: boolean) {
        if (!this.documentContainerRef) {
            return;
        }
        if (this.mediaTransform.zoom < 0.1) {
            this.mediaTransform.zoom = 0.1;
        }
        if (this.mediaTransform.zoom > 10) {
            this.mediaTransform.zoom = 10;
        }
        this.mediaTransform.rotate = this.mediaTransform.rotate % 360;
        if (animate) {
            clearTimeout(this.mediaTransformTimeout);
            this.documentContainerRef.style.transition = `all 0.2s`;
            this.mediaTransformTimeout = setTimeout(() => {
                this.documentContainerRef.style.transition = `none`;
            }, 200);
        }
        this.documentContainerRef.style.transform = `translate(${this.mediaTransform.pan.x}px, ${this.mediaTransform.pan.y}px) scale(${this.mediaTransform.zoom}) rotate(${this.mediaTransform.rotate}deg)`;
    }

    /* Download complete handler */
    private downloadCompleteHandler = () => {
        const {doc} = this.state;
        if (!doc || doc.items.length === 0) {
            return;
        }
        doc.items[0].downloaded = true;
        this.setState({
            doc,
        });
    }
}

export default DocumentViewer;
