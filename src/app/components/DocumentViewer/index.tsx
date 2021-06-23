/*
    Creation Time: 2019 - Feb - 03
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
import {
    KeyboardArrowLeftRounded, KeyboardArrowRightRounded, MoreVertRounded, RotateLeftRounded, RotateRightRounded,
    ZoomInRounded, ZoomOutRounded, CropFreeRounded, ForwardToInboxRounded, PlayArrowRounded, ForwardRounded,
} from '@material-ui/icons';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DocumentViewService, {IDocument} from '../../services/documentViewerService';
import CachedPhoto from '../CachedPhoto';
import CachedVideo from '../CachedVideo';
import {IMessage} from '../../repository/message/interface';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import {getDuration, getMediaInfo} from '../MessageMedia';
import DownloadProgress from '../DownloadProgress';
import {C_GOOGLE_MAP_KEY} from '../MapPicker';
import {MapComponent} from '../MapPicker/map';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import Menu from '@material-ui/core/Menu/Menu';
import {ClickAwayListener} from "@material-ui/core";
import i18n from '../../services/i18n';
import {Loading} from "../Loading";
import APIManager, {currentUserId} from "../../services/sdk";
import {InputPeer, PeerType, UserPhoto} from "../../services/sdk/messages/core.types_pb";
import UserRepo from "../../repository/user";
import GroupRepo from "../../repository/group";
import {IUser} from "../../repository/user/interface";
import {IGroup} from "../../repository/group/interface";
import Tooltip from "@material-ui/core/Tooltip";
import {hasAuthority} from "../GroupInfoMenu";
import {findIndex} from "lodash";
import UserName from "../UserName";
import TimeUtility from "../../services/utilities/time";
import {Swipeable, EventData} from "react-swipeable";
import {C_AVATAR_SIZE} from "../SettingsMenu";
import Scrollbars from "react-custom-scrollbars";
import {EventKeyDown, EventMouseMove, EventMouseUp} from "../../services/events";
import StreamVideo from "../StreamVideo";
import {renderBody} from "../Message";
import ElectronService from "../../services/electron";
import {GetDbFileName} from "../../repository/file";
import {ModalityService} from "kk-modality";
import UserAvatar from "../UserAvatar";
import MessageRepo from "../../repository/message";
import Broadcaster from "../../services/broadcaster";
import {IsMobileView} from "../../services/isMobile";
import DeepLinkService from "../../services/deepLinkService";

import './style.scss';

export const MESSAGE_ORIENTATION_UPDATED = 'Message_Orientation_Updated';

const C_MAX_WIDTH = 800;
const C_MAX_HEIGHT = 600;
const swipeConfig = {
    delta: 10,                             // min distance(px) before a swipe starts
    preventDefaultTouchmoveEvent: false,   // preventDefault on touchmove, *See Details*
    rotationAngle: 0,                      // set a rotation angle
    trackMouse: false,                     // track mouse input
    trackTouch: true,                      // track touch input
};

// const C_CONTAINER_RATIO = C_MAX_HEIGHT / C_MAX_WIDTH;

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
    onAction: (cmd: 'cancel' | 'download' | 'download_stream' | 'cancel_download' | 'view' | 'open' | 'save_as', messageId: number, fileName?: string) => void;
    onMessageAction: (action: 'view' | 'forward', id: number) => void;
    onError: (text: string) => void;
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
    // private dialogBackdropEl: HTMLElement | undefined;
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
    private lastAnchorType?: 'message' | 'shared_media' | 'shared_media_full' | 'label';
    private preventClose: boolean = false;
    private firstTimeLoad: boolean = true;
    private apiManager: APIManager;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;
    private hasAccess: boolean = false;
    private isTransitioning: boolean = false;
    private removeTooltipTimeout: any = null;
    private downloadProgressRef: DownloadProgress | undefined;
    private isElectron: boolean = ElectronService.isElectron();
    private modalityService: ModalityService;
    private messageRepo: MessageRepo;
    private isMobileView = IsMobileView();

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
        this.apiManager = APIManager.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.modalityService = ModalityService.getInstance();
        this.messageRepo = MessageRepo.getInstance();
    }

    public componentDidMount() {
        this.documentViewerService.setDocumentReady(this.documentReadyHandler);
        window.addEventListener(EventKeyDown, this.windowKeyDownHandler, true);
        window.addEventListener(EventMouseMove, this.mediaDocumentMouseMoveHandler);
        window.addEventListener(EventMouseUp, this.mediaDocumentMouseUpHandler);
    }

    public componentWillUnmount() {
        // this.destroyBackdropEvent();
        window.removeEventListener(EventKeyDown, this.windowKeyDownHandler, true);
        window.removeEventListener(EventMouseMove, this.mediaDocumentMouseMoveHandler);
        window.removeEventListener(EventMouseUp, this.mediaDocumentMouseUpHandler);
        if (this.removeTooltipTimeout) {
            clearTimeout(this.removeTooltipTimeout);
        }
    }

    public render() {
        const {className, dialogOpen} = this.state;
        return (
            <Dialog
                open={dialogOpen}
                onClose={this.dialogCloseHandler()}
                className={'document-viewer-dialog ' + className}
                disableBackdropClick={true}
                disableEscapeKeyDown={true}
                classes={{
                    paper: 'document-viewer-dialog-paper',
                }}
            >
                <ClickAwayListener disableReactTree={true} onClickAway={this.dialogCloseHandler()}>
                    <div ref={this.documentContainerRefHandler} className="document-container"
                         onMouseDown={this.mediaDocumentMouseDownHandler}
                         onWheelCapture={this.mediaDocumentWheelHandler}>
                        <Swipeable onSwiped={this.swipeEventHandler} {...swipeConfig} >
                            {this.getContent()}
                        </Swipeable>
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
        if (this.mediaTransform.rotate) {
            this.documentContainerRef.style.transform = `translate(${this.mediaTransform.pan.x}px, ${this.mediaTransform.pan.y}px) scale(${this.mediaTransform.zoom}) rotate(${this.mediaTransform.rotate}deg)`;
        }
    }

    private getContent() {
        const {doc, size, galleryList, gallerySelect} = this.state;
        if (!doc) {
            return null;
        }
        if (doc.web) {
            switch (doc.type) {
                case 'picture':
                    return (<div className="picture-container">
                        {doc.items.map((item, index) => {
                            return (
                                <div key={index} ref={this.pictureWrapperRefHandler} className="picture-wrapper hide"
                                     style={size ? size : {}}>
                                    <div className="picture">
                                        <img src={item.url || ''} alt="web-document"/>
                                    </div>
                                </div>);
                        })}
                    </div>);
                case 'video':
                    return (<div className="video-container">
                        {doc.items.map((item, index) => {
                            return (
                                <div key={index} ref={this.pictureWrapperRefHandler} className="picture-wrapper hide"
                                     style={size ? size : {}}>
                                    <div className="video">
                                        <video src={item.url || ''} controls={true}/>
                                    </div>
                                </div>);
                        })}
                    </div>);
            }
            return null;
        }
        switch (doc.type) {
            case 'avatar':
                if ((galleryList.length === 0 || gallerySelect === 0) && !doc.photoId) {
                    return (<div className="avatar-container" style={size ? size : {}}>
                        {doc.items.map((item, index) => {
                            return (
                                <React.Fragment
                                    key={item.fileLocation ? (item.fileLocation.fileid || index) : index}>
                                    {item.thumbFileLocation && <div className="thumbnail">
                                        <CachedPhoto className="thumb-picture" fileLocation={item.thumbFileLocation}
                                                     mimeType="image/jpeg"/>
                                        <Loading/>
                                    </div>}
                                    <div className="photo">
                                        <CachedPhoto fileLocation={item.fileLocation} mimeType="image/jpeg"/>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>);
                } else {
                    const picture = galleryList[gallerySelect];
                    if (picture) {
                        return (
                            <div className="avatar-container" style={size ? size : {}}>
                                {picture.photosmall && <div className="thumbnail">
                                    <CachedPhoto className="thumb-picture" fileLocation={picture.photosmall}
                                                 mimeType="image/jpeg"/>
                                    <Loading/>
                                </div>}
                                <div className="photo" key={picture.photoid}>
                                    <CachedPhoto fileLocation={picture.photobig} mimeType="image/jpeg"/>
                                </div>
                            </div>
                        );
                    } else {
                        return null;
                    }
                }
            case 'picture':
                return (<div className="picture-container">
                    {doc.items.map((item, index) => {
                        return (
                            <div key={index} ref={this.pictureWrapperRefHandler} className="picture-wrapper hide"
                                 style={size ? size : {}}>
                                {item.thumbFileLocation && <div className="thumbnail">
                                    <CachedPhoto className="thumb-picture" fileLocation={item.thumbFileLocation}
                                                 blur={10} mimeType="image/jpeg"/>
                                </div>}
                                {this.getDownloadAction()}
                                {Boolean(item.downloaded !== false) &&
                                <CachedPhoto className="picture" fileLocation={item.fileLocation}
                                             mimeType={item.mimeType || 'image/jpeg'}/>}
                            </div>);
                    })}
                </div>);
            case 'video':
                return (<div className="video-container">
                    {doc.items.map((item, index) => {
                        return (
                            <div key={index} ref={this.pictureWrapperRefHandler} className="picture-wrapper hide"
                                 style={size ? size : {}}>
                                {item.thumbFileLocation && <div className="thumbnail">
                                    <CachedPhoto className="thumb-picture" fileLocation={item.thumbFileLocation}
                                                 blur={item.downloaded === false ? 10 : 0} mimeType="image/jpeg"/>
                                </div>}
                                {Boolean(!item.downloaded && item.duration && !doc.stream) &&
                                <div className="media-duration-container">
                                    <PlayArrowRounded/><span>{getDuration(item.duration || 0)}</span>
                                </div>}
                                {!Boolean(doc.stream) && this.getDownloadAction()}
                                {Boolean(item.downloaded !== false && !doc.stream) &&
                                <CachedVideo className="video" fileLocation={item.fileLocation}
                                             mimeType={item.mimeType} autoPlay={this.firstTimeLoad}
                                             timeOut={200} onPlay={this.cachedVideoPlayHandler}/>}
                                {Boolean(doc.stream) &&
                                <StreamVideo className="video" fileLocation={item.fileLocation}
                                             size={item.fileSize || 0} mimeType={item.mimeType}
                                             autoPlay={this.firstTimeLoad} msgId={item.id || 0}
                                             onPlay={this.cachedVideoPlayHandler}
                                             onStartDownload={this.videoStreamStartDownloadHandler}
                                             onError={this.videoStreamErrorHandler}
                                />}
                            </div>);
                    })}
                </div>);
            case 'location':
                return (<div className="location-container">
                    {doc.items.map((item, index) => {
                        if (!item.geo) {
                            return null;
                        } else {
                            return (
                                <MapComponent
                                    key={index}
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
                return null;
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
            return null;
        }
        return (<DownloadProgress ref={this.downloadProgressRefHandler} id={doc.items[0].id || 0}
                                  fileSize={doc.items[0].fileSize || 0}
                                  onAction={this.props.onAction} onComplete={this.downloadCompleteHandler}/>);
    }

    private downloadProgressRefHandler = (ref: any) => {
        this.downloadProgressRef = ref;
    }

    private videoStreamStartDownloadHandler = (msgId: number) => {
        if (this.props.onAction) {
            this.props.onAction('download_stream', msgId);
        }
    }

    private videoStreamErrorHandler = (err: any) => {
        const {doc} = this.state;
        if (doc) {
            if (err === 'already_downloaded') {
                this.props.onError(i18n.t('media.this_video_is_already_downloaded'));
                if (doc.items.length > 0) {
                    doc.items[0].downloaded = true;
                    this.setState({
                        doc,
                    });
                }
            } else {
                this.props.onError(i18n.t('media.cannot_stream_video'));
                doc.stream = false;
                setTimeout(() => {
                    if (this.downloadProgressRef) {
                        this.downloadProgressRef.setFileState('progress');
                    }
                }, 100);
            }
            this.setState({
                doc,
            });
        }
    }

    private initPagination() {
        const {doc, prev, next, galleryList, gallerySelect} = this.state;
        if (!doc || doc.type === 'location' || doc.web) {
            return null;
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
            return null;
        }
        const contextMenuItems = [{
            cmd: 'download',
            title: i18n.t('general.download'),
        }];
        if (doc.type === 'avatar' && this.hasAccess) {
            contextMenuItems.push({
                cmd: 'set_as_avatar',
                title: i18n.t('settings.set_as_avatar'),
            }, {
                cmd: 'remove_photo',
                title: i18n.t('settings.remove_photo'),
            });
        } else if (doc.type !== 'avatar') {
            contextMenuItems.push({
                cmd: 'forward',
                title: i18n.t('general.forward'),
            }, {
                cmd: 'view',
                title: i18n.t('general.view_in_chat'),
            });
        }
        const viewActions = [{
            cmd: 'rotate-cw',
            icon: <RotateRightRounded/>,
            title: i18n.t('uploader.rotate-cw'),
        }, {
            cmd: 'rotate-ccw',
            icon: <RotateLeftRounded/>,
            title: i18n.t('uploader.rotate-ccw'),
        }, {
            cmd: 'zoom-out',
            icon: <ZoomOutRounded/>,
            title: i18n.t('uploader.zoom_out'),
        }, {
            cmd: 'zoom-in',
            icon: <ZoomInRounded/>,
            title: i18n.t('uploader.zoom_in'),
        }, {
            cmd: 'reset',
            icon: <CropFreeRounded/>,
            title: i18n.t('uploader.reset'),
        }];
        const messageActions = [{
            cmd: 'forward',
            icon: <ForwardRounded/>,
            title: i18n.t('general.forward'),
        }, {
            cmd: 'view',
            icon: <ForwardToInboxRounded/>,
            title: i18n.t('general.view_in_chat'),
        }];
        return (
            <div className="document-viewer-controls">
                <div className="controls">
                    <div className="item" onClick={this.openContextMenuHandler}>
                        <MoreVertRounded/>
                    </div>
                    {viewActions.map((action) => {
                        return <Tooltip key={action.cmd} title={action.title}>
                            <div className="item" onClick={this.transformHandler(action.cmd)}>
                                {action.icon}
                            </div>
                        </Tooltip>;
                    })}
                    {Boolean(!this.isMobileView && doc.type !== 'avatar') && <>
                        <div className="item-divider"/>
                        {messageActions.map((action) => {
                            return <Tooltip key={action.cmd} title={action.title}>
                                <div className="item" onClick={this.messageActionHandler(action.cmd as any)}>
                                    {action.icon}
                                </div>
                            </Tooltip>;
                        })}
                    </>}
                </div>
                {Boolean(doc.type !== 'avatar') && <div className="sender-container">
                    {Boolean(doc.items[0].userId) && <div className="sender-container">
                        <UserAvatar className="sender-avatar" id={doc.items[0].userId || '0'}/>
                        <div className="sender-info">
                            <UserName className="sender-user" id={doc.items[0].userId || ''} noIcon={true} you={true}/>
                            <div className="sender-date">{TimeUtility.dynamicDate(doc.items[0].createdon || 0)}</div>
                        </div>
                    </div>}
                </div>}
                <Menu
                    anchorEl={contextMenuAnchorEl}
                    open={Boolean(contextMenuAnchorEl)}
                    onClose={this.contextMenuCloseHandler}
                    className="kk-context-menu darker"
                    classes={{
                        paper: 'kk-context-menu-paper'
                    }}
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
            </div>
        );
    }

    private initCaption() {
        const {doc} = this.state;
        if (!doc || doc.items.length === 0 || ((doc.items[0].caption || '').length === 0)) {
            return null;
        }
        return (
            <div className="document-viewer-caption" onClick={this.preventClosing}>
                <div className="caption-wrapper">
                    <div className={'caption ' + (doc.items[0].rtl ? 'rtl' : 'ltr')}>
                        {renderBody(doc.items[0].caption, doc.items[0].entityList, this.isElectron, this.bodyActionHandler, undefined)}
                    </div>
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
            return null;
        }
        if (!size || !doc || doc.items.length === 0 || (doc.type === 'video' && !doc.items[0].thumbFileLocation)) {
            if (this.pictureWrapperRef) {
                this.pictureWrapperRef.classList.remove('hide');
            }
            return null;
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
                    {doc.web ? <div className="picture">
                            {doc.type === 'video' ? <audio src={doc.items[0].url || ''} controls={false}/> :
                                <img src={doc.items[0].url || ''} alt="web-document"/>}
                        </div>
                        : <CachedPhoto className="picture"
                                       fileLocation={downloaded ? fileLocation : doc.items[0].thumbFileLocation}
                                       blur={downloaded ? 0 : 10} mimeType="image/jpeg"/>}
                </div>);
            } else {
                return null;
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
                {doc.web ? <div className="picture">
                        {doc.type === 'video' ? <video src={doc.items[0].url || ''} controls={false}/> :
                            <img src={doc.items[0].url || ''} alt="web-document"/>}
                    </div>
                    : <CachedPhoto className="picture" fileLocation={fileLocation} blur={downloaded ? 0 : 10}
                                   mimeType="image/jpeg"/>}
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
        this.floatPictureRef.style.transform = `translate(-50%, -50%) rotate(${this.mediaTransform.rotate}deg)`;
        this.floatPictureRef.style.borderRadius = `0`;
        this.floatPictureRef.style.opacity = '1';
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
            case 'label':
                el = document.querySelector(`.label-message-item .label-message-media.item_${doc.items[0].id} .thumbnail`);
                break;
            case 'shared_media':
                el = document.querySelector(`.peer-media .media-item.item_${doc.items[0].id} .picture`);
                break;
            case 'shared_media_full':
                el = document.querySelector(`.peer-media.full .media-item.item_${doc.items[0].id} .picture`);
                break;
            default:
            case 'message':
                if (doc.web) {
                    el = document.querySelector(`.chat .bubble-wrapper .bubble.b_${doc.items[0].id} .message-web .web-image`);
                } else {
                    el = document.querySelector(`.chat .bubble-wrapper .bubble.b_${doc.items[0].id} .message-media .media-big .picture`);
                }
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
        this.floatPictureRef.style.opacity = '0.2';
        this.floatPictureRef.style.transform = ``;
        this.floatPictureRef.style.borderRadius = ``;
        setTimeout(() => {
            callback();
        }, 300);
    }

    private dialogCloseHandler = (force?: boolean) => (e?: any) => {
        if ((this.preventClose && force !== true) || this.state.confirmDialogOpen || this.documentViewerService.getPreventClosing()) {
            return;
        }
        const closeDialog = () => {
            // this.destroyBackdropEvent();
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
            this.storeOrientation();
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
        if (doc.items.length > 0 && doc.items[0].orientation) {
            this.mediaTransform.rotate = doc.items[0].orientation;
        }
        this.preventClose = true;
        this.setState({
            dialogOpen: true,
            doc,
            fileState: download ? 'download' : 'view',
        }, () => {
            // this.initBackdropEvent();
            if (doc.type === 'picture' || doc.type === 'video') {
                this.calculateImageSize();
                this.initPaginationHandlers();
                this.hasAccess = false;
            } else if (doc.type === 'avatar') {
                this.calculateImageSize();
                this.initAvatar(doc.photoId);
                this.checkAccess();
            }
            setTimeout(() => {
                this.preventClose = false;
            }, 255);
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
        let height = (doc.items[0].height || C_AVATAR_SIZE);
        let width = (doc.items[0].width || C_AVATAR_SIZE);
        const ratio = height / width;
        const screenHeight = window.innerHeight - 200;
        const screenRation = screenHeight / window.innerWidth;
        const maxWidth = window.innerWidth < C_MAX_WIDTH ? window.innerWidth : C_MAX_WIDTH;
        const maxHeight = screenHeight < C_MAX_HEIGHT ? screenHeight : C_MAX_HEIGHT;
        if (ratio > screenRation) {
            if (height > maxHeight) {
                height = maxHeight;
                width = maxHeight / ratio;
            }
        } else {
            if (width > maxWidth) {
                width = maxWidth;
                height = maxWidth * ratio;
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
        this.isTransitioning = true;
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
            this.isTransitioning = false;
        }, 200);
    }

    private prevHandler = () => {
        if (this.isTransitioning) {
            return;
        }
        this.storeOrientation();
        this.animateSlide(false, () => {
            if (this.state.prev) {
                this.loadMedia(this.state.prev);
            }
        });
    }

    private nextHandler = () => {
        if (this.isTransitioning) {
            return;
        }
        this.storeOrientation();
        this.animateSlide(true, () => {
            if (this.state.next) {
                this.loadMedia(this.state.next);
            }
        });
    }

    private storeOrientation() {
        const {doc} = this.state;
        if (doc && doc.items.length > 0 && (doc.type === 'picture' || doc.type === 'video') && (doc.items[0].orientation || 0) !== this.mediaTransform.rotate) {
            this.messageRepo.importBulk([{
                id: doc.items[0].id,
                orientation: this.mediaTransform.rotate,
            }]);
            Broadcaster.getInstance().publish(MESSAGE_ORIENTATION_UPDATED, {
                id: doc.items[0].id,
                orientation: this.mediaTransform.rotate,
            });
        }
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
        } else if (e.keyCode === 27) {
            this.dialogCloseHandler(true)();
        }
    }

    private loadMedia(message: IMessage) {
        const info = getMediaInfo(message);
        const doc: IDocument = {
            anchor: this.lastAnchorType,
            items: [{
                caption: info.caption,
                createdon: message.createdon,
                downloaded: message.downloaded || false,
                duration: info.duration,
                fileLocation: info.file,
                fileSize: info.size,
                height: info.height,
                id: message.id || 0,
                md5: info.md5,
                mimeType: info.mimeType,
                orientation: info.orientation,
                thumbFileLocation: info.thumbFile,
                userId: message.senderid || '',
                width: info.width,
            }],
            peer: {id: message.peerid || '', peerType: message.peertype || 0},
            teamId: message.teamid || '0',
            type: message.messagetype === C_MESSAGE_TYPE.Video ? 'video' : 'picture',
        };
        this.documentViewerService.loadDocument(doc);
    }

    /* Document transform handler */
    private transformHandler = (cmd: string) => (e: any) => {
        this.preventClosing();
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
        window.console.log(e);
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
        // this.documentContainerRef.style.transformOrigin = `${this.mediaTransform.origin.x}% ${this.mediaTransform.origin.y}%`;
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
        this.preventClosing();
        this.setState({
            contextMenuAnchorEl: e.currentTarget,
        });
    }

    /* Close context menu handler */
    private contextMenuCloseHandler = () => {
        this.preventClosing();
        this.setState({
            contextMenuAnchorEl: null,
        });
    }

    /* Context menu action handler */
    private contextMenuActionHandler = (cmd: string) => (e: any) => {
        this.preventClosing();
        this.contextMenuCloseHandler();
        const {doc} = this.state;
        switch (cmd) {
            case 'download':
                if (this.props.onAction && doc && doc.items && doc.items.length > 0) {
                    const fileName = GetDbFileName(doc.items[0].fileLocation.fileid, doc.items[0].fileLocation.clusterid);
                    if (doc.items[0].downloaded) {
                        this.props.onAction('save_as', doc.items[0].id || 0, fileName);
                    } else {
                        this.props.onAction('save_as', 0, fileName);
                    }
                }
                break;
            case 'remove_photo':
                this.modalityService.open({
                    cancelText: i18n.t('general.cancel'),
                    confirmText: i18n.t('general.yes'),
                    title: i18n.t('settings.remove_photo'),
                }).then((modalRes) => {
                    if (modalRes === 'confirm') {
                        this.removePhotoHandler(this.state.gallerySelect);
                    } else {
                        this.setState({
                            confirmDialogOpen: false,
                        });
                    }
                });
                break;
            case 'set_as_avatar':
                this.updatePhotoHandler(this.state.gallerySelect);
                break;
            case 'view':
                this.messageActionHandler('view')();
                break;
            case 'forward':
                this.messageActionHandler('forward')();
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
        if (!doc || !doc.inputPeer) {
            return;
        }
        switch (doc.inputPeer.getType()) {
            case PeerType.PEERUSER:
            case PeerType.PEEREXTERNALUSER:
                this.initUserAvatar(doc.inputPeer);
                break;
            case PeerType.PEERGROUP:
                this.initGroupAvatar(doc.teamId, doc.inputPeer, id);
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
    private initGroupAvatar(teamId: string, peer: InputPeer, id?: string) {
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
        this.groupRepo.getFull(teamId, peer.getId() || '', fn).then(fn);
    }

    /* Init slide show */
    private initSlideShow() {
        const {doc, galleryList, gallerySelect} = this.state;
        if (!doc || doc.type !== 'avatar' || galleryList.length === 0) {
            return null;
        }
        const totalWith = galleryList.length * 54;
        let maxWidth = totalWith + 6;
        if (maxWidth > window.innerWidth) {
            maxWidth = window.innerWidth;
        }
        if (maxWidth > 800) {
            maxWidth = 800;
        }
        return (
            <div className="document-viewer-slide-show" style={{width: `${maxWidth}px`}} onClick={this.preventClosing}>
                <Scrollbars
                    autoHide={true}
                    hideTracksWhenNotNeeded={true}
                    universal={true}
                    style={{
                        width: `${maxWidth - 9}px`,
                    }}
                >
                    <div className="slider" style={{width: `${totalWith}px`}}>
                        {galleryList.map((gallery, key) => {
                            if (this.hasAccess) {
                                return (
                                    <Tooltip key={gallery.photoid || key} interactive={true} enterDelay={300}
                                             leaveDelay={200}
                                             title={<div className="document-viewer-slide-tooltip-container">
                                                 <span className="document-viewer-slide-show-item"
                                                       onClick={this.confirmRemovePhotoHandler(key)}>{i18n.t('general.remove')}</span>
                                             </div>}>
                                        <div className={'slide' + (gallerySelect === key ? ' selected' : '')}
                                             onClick={this.selectGalleryIndexHandler(key)}>

                                            <CachedPhoto className="thumbnail" fileLocation={gallery.photosmall}
                                                         mimeType="image/jpeg"/>
                                        </div>
                                    </Tooltip>);
                            } else {
                                return (<div key={gallery.photoid || key}
                                             className={'slide' + (gallerySelect === key ? ' selected' : '')}
                                             onClick={this.selectGalleryIndexHandler(key)}>

                                    <CachedPhoto className="thumbnail" fileLocation={gallery.photosmall}
                                                 mimeType="image/jpeg"/>
                                </div>);
                            }
                        })}
                    </div>
                </Scrollbars>
            </div>
        );
    }

    private preventClosing = () => {
        this.preventClose = true;
        if (this.removeTooltipTimeout) {
            clearTimeout(this.removeTooltipTimeout);
        }
        this.removeTooltipTimeout = setTimeout(() => {
            this.preventClose = false;
            this.removeTooltipTimeout = null;
        }, 200);
    }

    /* Gallery select gallery by index */
    private selectGalleryIndexHandler = (index: number) => (e: any) => {
        this.preventClosing();
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
        this.preventClosing();
        this.setState({
            confirmDialogIndex: -1,
            confirmDialogOpen: false,
        });
    }

    /* Confirm remove photo handler */
    private confirmRemovePhotoHandler = (index: number) => (e: any) => {
        this.preventClosing();
        this.setState({
            confirmDialogIndex: index,
            confirmDialogOpen: true,
        });
    }

    /* Update photo handler */
    private updatePhotoHandler = (index: number) => {
        const {galleryList, gallerySelect, doc} = this.state;
        if (!doc || !doc.inputPeer || !galleryList[index]) {
            return;
        }
        const asPicture = galleryList[index];
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
            galleryList.unshift(asPicture);
            if (doc.inputPeer) {
                const id = doc.inputPeer.getId() || '';
                if (group) {
                    this.groupRepo.importBulk([{
                        id,
                        photogalleryList: galleryList,
                    }]);
                } else {
                    this.userRepo.importBulk(false, [{
                        dont_update_last_modified: true,
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
        };
        switch (doc.inputPeer.getType()) {
            case PeerType.PEERUSER:
            case PeerType.PEEREXTERNALUSER:
                this.apiManager.updateProfilePicture(galleryList[index].photoid || '0').then(() => {
                    fn(false);
                });
                break;
            case PeerType.PEERGROUP:
                this.apiManager.groupUpdatePicture(doc.inputPeer.getId() || '', galleryList[index].photoid || '0').then(() => {
                    fn(true);
                });
                break;
        }
    }

    /* Remove photo handler */
    private removePhotoHandler = (index: number) => {
        const {galleryList, gallerySelect, doc} = this.state;
        if (!doc || !doc.inputPeer || !galleryList[index]) {
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
            if (doc.inputPeer) {
                const id = doc.inputPeer.getId() || '';
                if (group) {
                    this.groupRepo.importBulk([{
                        id,
                        photogalleryList: galleryList,
                    }]);
                } else {
                    this.userRepo.importBulk(false, [{
                        dont_update_last_modified: true,
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
        switch (doc.inputPeer.getType()) {
            case PeerType.PEERUSER:
            case PeerType.PEEREXTERNALUSER:
                this.apiManager.removeProfilePicture(galleryList[index].photoid || '0').then(() => {
                    fn(false);
                });
                break;
            case PeerType.PEERGROUP:
                this.apiManager.groupRemovePicture(doc.inputPeer.getId() || '', galleryList[index].photoid || '0').then(() => {
                    fn(true);
                });
                break;
        }
    }

    private checkAccess() {
        const {doc} = this.state;
        if (!doc || !doc.inputPeer) {
            this.hasAccess = false;
            return;
        }
        if (doc.inputPeer.getType() === PeerType.PEERUSER || doc.inputPeer.getType() === PeerType.PEEREXTERNALUSER) {
            this.hasAccess = (doc.inputPeer.getId() === currentUserId);
        } else if (doc.inputPeer.getType() === PeerType.PEERGROUP) {
            this.groupRepo.get(doc.teamId, doc.inputPeer.getId() || '').then((group) => {
                if (group) {
                    this.hasAccess = hasAuthority(group, true);
                    this.forceUpdate();
                }
            }).catch(() => {
                this.hasAccess = false;
            });
        }
    }

    /* Swipe event handler */
    private swipeEventHandler = (e: EventData) => {
        const {doc} = this.state;
        if (!doc) {
            return;
        }
        if (e.dir === 'Left') {
            if (doc.type === 'avatar') {
                this.nextGalleryHandler();
            } else {
                if (this.state.next) {
                    this.nextHandler();
                }
            }
        } else if (e.dir === 'Right') {
            if (doc.type === 'avatar') {
                this.prevGalleryHandler();
            } else {
                if (this.state.prev) {
                    this.prevHandler();
                }
            }
        } else if (e.dir === 'Down') {
            this.dialogCloseHandler()();
        } else if (e.dir === 'Up') {
            this.messageActionHandler('view')();
        }
    }

    /* Open message handler */
    private messageActionHandler = (action: 'view' | 'forward') => () => {
        this.preventClosing();
        const {doc} = this.state;
        if (doc && doc.type !== 'avatar' && doc.items.length > 0) {
            this.props.onMessageAction(action, doc.items[0].id || 0);
            if (action === 'view') {
                this.dialogCloseHandler(true)();
            }
        }
    }

    private bodyActionHandler = (cmd: string, text: string) => {
        switch (cmd) {
            case 'open_external_link':
                ElectronService.getInstance().loadUrl(text);
                break;
            case'open_deep_link':
                DeepLinkService.getInstance().parseLink(text);
                break;
            default:
                this.preventClosing();
                break;
        }
    }

    // private initBackdropEvent() {
    //     setTimeout(() => {
    //         this.dialogBackdropEl = document.querySelector('.document-viewer-dialog .MuiBackdrop-root');
    //         if (this.dialogBackdropEl) {
    //             this.dialogBackdropEl.addEventListener(EventWheel, this.mediaDocumentWheelHandler);
    //         }
    //     }, 300);
    // }
    //
    // private destroyBackdropEvent() {
    //     if (!this.dialogBackdropEl) {
    //         return;
    //     }
    //     this.dialogBackdropEl.removeEventListener(EventWheel, this.mediaDocumentWheelHandler);
    // }
}

export default DocumentViewer;
