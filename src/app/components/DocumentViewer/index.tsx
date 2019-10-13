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
    KeyboardArrowLeftRounded, KeyboardArrowRightRounded, MoreVertRounded, RotateLeftRounded, RotateRightRounded,
    ZoomInRounded, ZoomOutRounded, CropFreeRounded,
} from '@material-ui/icons';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DocumentViewService, {IDocument} from '../../services/documentViewerService';
import CachedPhoto from '../CachedPhoto';
import CachedVideo from '../CachedVideo';
import {IMessage} from '../../repository/message/interface';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import {getMediaInfo} from '../MessageMedia';
import DownloadProgress from '../DownloadProgress';
import {C_GOOGLE_MAP_KEY} from '../MapPicker';
import {MapComponent} from '../MapPicker/map';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import Menu from '@material-ui/core/Menu/Menu';
import {ClickAwayListener} from "@material-ui/core";
import i18n from '../../services/i18n';
import {Loading} from "../Loading";
import SDK from "../../services/sdk";
import {InputPeer, PeerType, UserPhoto} from "../../services/sdk/messages/chat.core.types_pb";
import UserRepo from "../../repository/user";
import GroupRepo from "../../repository/group";
import {IUser} from "../../repository/user/interface";
import {IGroup} from "../../repository/group/interface";
import Tooltip from "@material-ui/core/Tooltip";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {hasAuthority} from "../GroupInfoMenu";
import {findIndex} from "lodash";

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
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open' | 'save_as', messageId: number, fileId?: string) => void;
}

interface IState {
    className: string;
    confirmDialogIndex: number;
    confirmDialogOpen: boolean;
    contextMenuAnchorEl: any;
    dialogOpen: boolean;
    doc: IDocument | null;
    fileState: 'download' | 'view' | 'progress' | 'open';
    galleryList: UserPhoto.AsObject[];
    gallerySelect: number;
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
    private inControls: boolean = false;
    private firstTimeLoad: boolean = true;
    private sdk: SDK;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;
    private userId: string = '';
    private hasAccess: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            confirmDialogIndex: -1,
            confirmDialogOpen: false,
            contextMenuAnchorEl: null,
            dialogOpen: false,
            doc: null,
            fileState: 'view',
            galleryList: [],
            gallerySelect: 0,
            next: null,
            prev: null,
        };

        this.documentViewerService = DocumentViewService.getInstance();
        this.sdk = SDK.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
    }

    public componentDidMount() {
        this.userId = this.userRepo.getCurrentUserId();
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
                disableBackdropClick={true}
            >
                <ClickAwayListener onClickAway={this.dialogCloseHandler}>
                    <div ref={this.documentContainerRefHandler} className="document-container"
                         onMouseDown={this.mediaDocumentMouseDownHandler}
                         onWheelCapture={this.mediaDocumentWheelHandler}>
                        {this.getContent()}
                        {this.initPagination()}
                    </div>
                </ClickAwayListener>
                {this.initCaption()}
                {this.initControls()}
                {this.getFloatObj()}
                {this.initSlideShow()}
            </Dialog>
        );
    }

    private documentContainerRefHandler = (ref: any) => {
        this.documentContainerRef = ref;
    }

    private getContent() {
        const {doc, size, galleryList, gallerySelect} = this.state;
        if (!doc) {
            return '';
        }
        switch (doc.type) {
            case 'avatar':
                if ((galleryList.length === 0 || gallerySelect === 0) && !doc.photoId) {
                    return (<div className="avatar-container">
                        {doc.items.map((item, index) => {
                            return (
                                <React.Fragment key={item.fileLocation ? (item.fileLocation.fileid || index) : index}>
                                    {item.thumbFileLocation && <div className="thumbnail">
                                        <CachedPhoto className="thumb-picture" fileLocation={item.thumbFileLocation}/>
                                        <Loading/>
                                    </div>}
                                    <div className="photo">
                                        <CachedPhoto fileLocation={item.fileLocation}/>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>);
                } else {
                    const picture = galleryList[gallerySelect];
                    if (picture) {
                        return (
                            <div className="avatar-container">
                                {picture.photosmall && <div className="thumbnail">
                                    <CachedPhoto className="thumb-picture" fileLocation={picture.photosmall}/>
                                    <Loading/>
                                </div>}
                                <div className="photo" key={picture.photoid}>
                                    <CachedPhoto fileLocation={picture.photobig}/>
                                </div>
                            </div>
                        );
                    } else {
                        return '';
                    }
                }
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
                                    <CachedVideo className="video" fileLocation={item.fileLocation}
                                                 autoPlay={this.firstTimeLoad}
                                                 timeOut={200} onPlay={this.cachedVideoPlayHandler}/>}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>);
            case 'location':
                return (<div className="location-container">
                    {doc.items.map((item, index) => {
                        if (!item.geo) {
                            return '';
                        } else {
                            return (
                                <MapComponent
                                    googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${C_GOOGLE_MAP_KEY}&v=3.exp&libraries=geometry,drawing,places`}
                                    loadingElement={<div style={{height: `100%`}}/>}
                                    containerElement={<div style={{height: `100%`}}/>}
                                    mapElement={<div style={{height: `100%`}}/>}
                                    defPos={{
                                        lat: item.geo.lat,
                                        lng: item.geo.lng
                                    }}
                                    defZoom={16}
                                    pos={{
                                        lat: item.geo.lat,
                                        lng: item.geo.lng
                                    }}
                                />
                            );
                        }
                    })}
                </div>);
            default:
                return '';
        }
    }

    private hasControl() {
        const {doc} = this.state;
        if (!doc || doc.type === 'location') {
            return false;
        }
        return true;
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
        const {doc, prev, next, galleryList, gallerySelect} = this.state;
        if (!doc || doc.type === 'location') {
            return '';
        }
        if (doc.type === 'avatar' && galleryList.length > 0) {
            return (
                <div className="document-viewer-pagination">
                    <div className="pagination-item prev" hidden={Boolean(gallerySelect === 0)}
                         onClick={this.prevGalleryHandler}>
                        <KeyboardArrowLeftRounded/>
                    </div>
                    <div className="pagination-item next" hidden={Boolean(gallerySelect === (galleryList.length - 1))}
                         onClick={this.nextGalleryHandler}>
                        <KeyboardArrowRightRounded/>
                    </div>
                </div>
            );
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
        const {doc, contextMenuAnchorEl} = this.state;
        if (!doc || doc.type === 'location') {
            return '';
        }
        const contextMenuItems = [{
            cmd: 'download',
            title: i18n.t('general.download'),
        }];
        if (doc.type === 'avatar' && this.hasAccess) {
            contextMenuItems.push({
                cmd: 'remove_photo',
                title: i18n.t('settings.remove_photo'),
            });
        }
        return (
            <div className="document-viewer-controls" onMouseEnter={this.controlMouseEnterHandler}
                 onMouseLeave={this.controlMouseLeaveHandler}>
                <div className="controls">
                    <div className="item" onClick={this.openContextMenuHandler}>
                        <MoreVertRounded/>
                    </div>
                    <div className="item" onClick={this.transformHandler('rotate-cw')}>
                        <RotateRightRounded/>
                    </div>
                    <div className="item" onClick={this.transformHandler('rotate-ccw')}>
                        <RotateLeftRounded/>
                    </div>
                    <div className="item" onClick={this.transformHandler('zoom-out')}>
                        <ZoomOutRounded/>
                    </div>
                    <div className="item" onClick={this.transformHandler('zoom-in')}>
                        <ZoomInRounded/>
                    </div>
                    <div className="item" onClick={this.transformHandler('reset')}>
                        <CropFreeRounded/>
                    </div>
                </div>
                <Menu
                    anchorEl={contextMenuAnchorEl}
                    open={Boolean(contextMenuAnchorEl)}
                    onClose={this.contextMenuCloseHandler}
                    className="kk-context-menu darker"
                >
                    {contextMenuItems.map((item, key) => {
                        return (
                            <MenuItem key={key}
                                      onClick={this.contextMenuActionHandler(item.cmd)}
                                      className="context-item"
                            >{item.title}</MenuItem>
                        );
                    })}
                </Menu>
                <Dialog
                    open={this.state.confirmDialogOpen}
                    onClose={this.confirmDialogCloseHandler}
                    className="confirm-dialog"
                >
                    <DialogTitle>{i18n.t('settings.remove_photo')}</DialogTitle>
                    <DialogActions>
                        <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                            {i18n.t('general.cancel')}
                        </Button>
                        <Button onClick={this.removePhotoHandler} color="primary" autoFocus={true}>
                            {i18n.t('general.yes')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

    private controlMouseEnterHandler = () => {
        this.inControls = true;
    }

    private controlMouseLeaveHandler = () => {
        this.inControls = false;
    }

    private initCaption() {
        const {doc} = this.state;
        if (!doc || doc.items.length === 0 || (doc.items[0].caption || '').length === 0) {
            return '';
        }
        return (
            <div className="document-viewer-caption">
                <div className="caption-wrapper">
                    <div className={'caption ' + (doc.items[0].rtl ? 'rtl' : 'ltr')}>{doc.items[0].caption}</div>
                </div>
            </div>
        );
    }

    private reset(classOnly?: boolean) {
        if (classOnly !== true) {
            this.setState({
                doc: null,
            });
            this.mediaTransform = {
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
            if (!this.documentContainerRef) {
                return;
            }
        }
        this.documentContainerRef.classList.remove('prev', 'next', 'animate');
    }

    private getFloatObj() {
        const {doc, size} = this.state;
        if (!doc || doc.type === 'location') {
            return '';
        }
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
        if (this.inControls) {
            return;
        }
        const closeDialog = () => {
            this.setState({
                dialogOpen: false,
                galleryList: [],
                gallerySelect: 0,
                next: null,
                prev: null,
                size: undefined,
            });
            this.animated = false;
            this.reset();
            this.firstTimeLoad = true;
            this.hasAccess = false;
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
                this.hasAccess = false;
            } else if (doc.type === 'avatar') {
                this.initAvatar(doc.photoId);
                this.checkAccess();
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

    private animateSlide(next: boolean, callback?: any, classOnly?: boolean) {
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
            this.reset(classOnly);
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
        if (!this.state.dialogOpen || !this.hasControl()) {
            return;
        }
        const {doc} = this.state;
        if (e.keyCode === 39) {
            if (doc && doc.type === 'avatar') {
                this.nextGalleryHandler();
            } else {
                if (this.state.next) {
                    this.nextHandler();
                }
            }
        } else if (e.keyCode === 37) {
            if (doc && doc.type === 'avatar') {
                this.prevGalleryHandler();
            } else {
                if (this.state.prev) {
                    this.prevHandler();
                }
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
                md5: info.md5,
                mimeType: info.mimeType,
                thumbFileLocation: info.thumbFile,
                width: info.width,
            }],
            peerId: message.peerid || '',
            type: message.messagetype === C_MESSAGE_TYPE.Picture ? 'picture' : 'video',
        };
        this.documentViewerService.loadDocument(doc);
    }

    /* Document transform handler */
    private transformHandler = (cmd: string) => (e: any) => {
        switch (cmd) {
            case 'zoom-in':
                this.mediaTransform.zoom += 0.15;
                break;
            case 'zoom-out':
                this.mediaTransform.zoom -= 0.15;
                break;
            case 'rotate-cw':
                this.mediaTransform.rotate += 90;
                this.mediaTransform.origin.x = 50;
                this.mediaTransform.origin.y = 50;
                break;
            case 'rotate-ccw':
                this.mediaTransform.rotate -= 90;
                this.mediaTransform.origin.x = 50;
                this.mediaTransform.origin.y = 50;
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
        if (e.button !== 0 || !this.hasControl()) {
            return;
        }
        this.mediaTransform.startPan = true;
        this.mediaTransform.panStartPos.x = e.pageX - this.mediaTransform.pan.x;
        this.mediaTransform.panStartPos.y = e.pageY - this.mediaTransform.pan.y;
        this.applyMediaTransform(false);
    }

    /* Document mouse move handler */
    private mediaDocumentMouseMoveHandler = (e: any) => {
        if (!this.mediaTransform.startPan || !this.hasControl()) {
            return;
        }
        e.preventDefault();
        this.mediaTransform.pan.x = (e.pageX - this.mediaTransform.panStartPos.x);
        this.mediaTransform.pan.y = (e.pageY - this.mediaTransform.panStartPos.y);
        this.applyMediaTransform(false);
    }

    /* Document mouse up handler */
    private mediaDocumentMouseUpHandler = (e: any) => {
        if (!this.hasControl()) {
            return;
        }
        if (this.mediaTransform.startPan) {
            e.preventDefault();
            this.mediaTransform.startPan = false;
        }
    }

    /* Document wheel handler */
    private mediaDocumentWheelHandler = (e: any) => {
        if (!this.hasControl()) {
            return;
        }
        if (!e.ctrlKey && !e.metaKey) {
            this.mediaTransform.zoom += e.deltaY / 100;
        } else {
            this.mediaTransform.pan.x -= e.deltaX;
            this.mediaTransform.pan.y -= e.deltaY;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        this.mediaTransform.origin.x = ((e.pageX - rect.left) / rect.width) * 100;
        this.mediaTransform.origin.y = ((e.pageY - rect.top) / rect.height) * 100;
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
        this.documentContainerRef.style.transformOrigin = `${this.mediaTransform.origin.x}% ${this.mediaTransform.origin.y}%`;
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

    /* Open context menu handler */
    private openContextMenuHandler = (e: any) => {
        this.setState({
            contextMenuAnchorEl: e.currentTarget,
        });
    }

    /* Close context menu handler */
    private contextMenuCloseHandler = () => {
        this.setState({
            contextMenuAnchorEl: null,
        });
    }

    /* Context menu action handler */
    private contextMenuActionHandler = (cmd: string) => (e: any) => {
        this.contextMenuCloseHandler();
        const {doc} = this.state;
        switch (cmd) {
            case 'download':
                if (this.props.onAction && doc && doc.items && doc.items.length > 0 && doc.items[0].downloaded) {
                    this.props.onAction('save_as', doc.items[0].id || 0, doc.items[0].fileLocation.fileid);
                }
                break;
            case 'remove_photo':
                this.setState({
                    confirmDialogIndex: this.state.gallerySelect,
                    confirmDialogOpen: true,
                });
                break;
            default:
                break;
        }
    }

    /* CachedVideo Play handler */
    private cachedVideoPlayHandler = () => {
        if (this.firstTimeLoad) {
            this.firstTimeLoad = false;
        }
    }

    /* Init Avatar */
    private initAvatar(id?: string) {
        const {doc} = this.state;
        if (!doc || !doc.peer) {
            return;
        }
        switch (doc.peer.getType()) {
            case PeerType.PEERUSER:
                this.initUserAvatar(doc.peer);
                break;
            case PeerType.PEERGROUP:
                this.initGroupAvatar(doc.peer, id);
                break;
        }
    }

    /* Init user avatar */
    private initUserAvatar(peer: InputPeer) {
        const fn = (user: IUser) => {
            this.setState({
                galleryList: user.photogalleryList || [],
            });
        };
        this.userRepo.getFull(peer.getId() || '', fn).then(fn);
    }

    /* Init group avatar */
    private initGroupAvatar(peer: InputPeer, id?: string) {
        const fn = (group: IGroup) => {
            let index = 0;
            if (id) {
                index = findIndex(group.photogalleryList, {photoid: id});
            }
            this.setState({
                galleryList: group.photogalleryList || [],
                gallerySelect: index === -1 ? 0 : index,
            });
        };
        this.groupRepo.getFull(peer.getId() || '', fn).then(fn);
    }

    /* Init slide show */
    private initSlideShow() {
        const {doc, galleryList, gallerySelect} = this.state;
        if (!doc || doc.type !== 'avatar') {
            return '';
        }
        if (galleryList.length === 0) {
            return '';
        }
        return (
            <div className="document-viewer-slide-show" onMouseEnter={this.controlMouseEnterHandler}
                 onMouseLeave={this.controlMouseLeaveHandler}>
                {galleryList.map((gallery, key) => {
                    if (this.hasAccess) {
                        return (
                            <Tooltip key={gallery.photoid || key} interactive={true} enterDelay={500} leaveDelay={200}
                                     title={<span className="document-viewer-slide-show-remove"
                                                  onClick={this.confirmRemovePhotoHandler(key)}>{i18n.t('general.remove')}</span>}>
                                <div className={'slide' + (gallerySelect === key ? ' selected' : '')}
                                     onClick={this.selectGalleryIndexHandler(key)}>

                                    <CachedPhoto className="thumbnail" fileLocation={gallery.photosmall}/>
                                </div>
                            </Tooltip>);
                    } else {
                        return (<div key={gallery.photoid || key}
                                     className={'slide' + (gallerySelect === key ? ' selected' : '')}
                                     onClick={this.selectGalleryIndexHandler(key)}>

                            <CachedPhoto className="thumbnail" fileLocation={gallery.photosmall}/>
                        </div>);
                    }
                })}
            </div>
        );
    }

    /* Gallery select gallery by index */
    private selectGalleryIndexHandler = (index: number) => (e: any) => {
        const {galleryList, gallerySelect} = this.state;
        if (index < 0) {
            return;
        }
        if (index >= galleryList.length) {
            return;
        }
        if (index === gallerySelect) {
            return;
        }
        this.animateSlide((index > gallerySelect), () => {
            this.setState({
                gallerySelect: index,
            });
        }, true);
    }

    /* Gallery prev gallery handler */
    private prevGalleryHandler = () => {
        const {gallerySelect} = this.state;
        if (gallerySelect <= 0) {
            return;
        }
        this.animateSlide(false, () => {
            this.setState({
                gallerySelect: gallerySelect - 1,
            });
        }, true);
    }

    /* Gallery next gallery handler */
    private nextGalleryHandler = () => {
        const {galleryList, gallerySelect} = this.state;
        if (gallerySelect >= (galleryList.length - 1)) {
            return;
        }
        this.animateSlide(true, () => {
            this.setState({
                gallerySelect: gallerySelect + 1,
            });
        }, true);
    }

    /* Confirm dialog close handler */
    private confirmDialogCloseHandler = () => {
        this.setState({
            confirmDialogIndex: -1,
            confirmDialogOpen: false,
        });
    }

    /* Confirm remove photo handler */
    private confirmRemovePhotoHandler = (index: number) => (e: any) => {
        this.setState({
            confirmDialogIndex: index,
            confirmDialogOpen: true,
        });
        this.inControls = false;
    }

    /* Remove photo handler */
    private removePhotoHandler = () => {
        const index = this.state.confirmDialogIndex;
        const {galleryList, gallerySelect, doc} = this.state;
        if (!doc || !doc.peer || !galleryList[index]) {
            return;
        }
        const fn = (group: boolean) => {
            galleryList.splice(index, 1);
            let offset = 0;
            if (index < gallerySelect) {
                offset = -1;
            }
            if (index === 0 && galleryList.length > 0) {
                doc.items[0].fileLocation = galleryList[0].photobig;
                doc.items[0].thumbFileLocation = galleryList[0].photosmall;
            }
            if (doc.peer) {
                const id = doc.peer.getId() || '';
                if (group) {
                    this.groupRepo.upsert([{
                        id,
                        photogalleryList: galleryList,
                    }]);
                } else {
                    this.userRepo.upsert(false, [{
                        id,
                        photogalleryList: galleryList,
                    }]);
                }
            }
            this.setState({
                doc,
                galleryList,
                gallerySelect: gallerySelect + offset,
            });
            this.confirmDialogCloseHandler();
        };
        switch (doc.peer.getType()) {
            case PeerType.PEERUSER:
                this.sdk.removeProfilePicture(galleryList[index].photoid || '0').then(() => {
                    fn(false);
                });
                break;
            case PeerType.PEERGROUP:
                this.sdk.groupRemovePicture(doc.peer.getId() || '', galleryList[index].photoid || '0').then(() => {
                    fn(true);
                });
                break;
        }
    }

    private checkAccess() {
        const {doc} = this.state;
        if (!doc || !doc.peer) {
            this.hasAccess = false;
            return;
        }
        if (doc.peer.getType() === PeerType.PEERUSER) {
            this.hasAccess = (doc.peer.getId() === this.userId);
        } else if (doc.peer.getType() === PeerType.PEERGROUP) {
            this.groupRepo.get(doc.peer.getId() || '').then((group) => {
                this.hasAccess = hasAuthority(group);
                this.forceUpdate();
            }).catch(() => {
                this.hasAccess = false;
            });
        }
    }
}

export default DocumentViewer;
