/*
    Creation Time: 2018 - Feb - 06
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import Dropzone, {FileWithPreview} from 'react-dropzone';
import Dialog from '@material-ui/core/Dialog/Dialog';
import {
    AddRounded, PlayCircleFilledRounded, ConfirmationNumberRounded,
    InsertDriveFileRounded, MusicNoteRounded, CloseRounded, BrushRounded, CropLandscapeRounded,
    PhotoOutlined, InsertDriveFileOutlined, SendRounded,
} from '@material-ui/icons';
import Scrollbars from 'react-custom-scrollbars';
// @ts-ignore
import readAndCompressImage from 'browser-image-resizer';
import {getFileExtension, getHumanReadableSize} from '../MessageFile';
import * as MusicMetadata from 'music-metadata-browser';
import {IconButton, Tabs, Tab, Switch} from '@material-ui/core';
import {IDimension} from '../Cropper';
import i18n from '../../services/i18n';
import RTLDetector from "../../services/utilities/rtl_detector";
import {throttle} from 'lodash';
import ImageEditor from "../ImageEditor";
import VideoFrameSelector from "../VideoFrameSelector";
import {getCodec} from "../StreamVideo/helper";
import {InputPeer, MessageEntity} from "../../services/sdk/messages/chat.core.types_pb";
import MentionInput, {IMention} from "../MentionInput";
import {measureNodeHeight} from "../ChatInput/measureHeight";
import {generateEntities} from "../ChatInput";
import {IMessage} from "../../repository/message/interface";
import {C_LOCALSTORAGE} from "../../services/sdk/const";

import './style.scss';

const thumbnailReadyMIMEs = 'image/png,image/jpeg,image/jpg,image/webp,video/webm,video/mp4,audio/mp4,audio/ogg,audio/mp3'.split(',');

export interface IUploaderOptions {
    accept?: string;
    isFile?: boolean;
    message?: IMessage | null;
    mode?: number;
    peer?: InputPeer | null;
}

interface IMediaThumb {
    file: Blob;
    fileType: string;
    height: number;
    width: number;
}

export interface IMediaItem {
    album?: string;
    animated?: boolean;
    caption?: string;
    duration?: number;
    entities?: MessageEntity[] | null;
    file: Blob;
    fileType: string;
    mediaType: 'image' | 'video' | 'file' | 'voice' | 'audio' | 'none';
    name: string;
    performer?: string;
    thumb?: IMediaThumb;
    title?: string;
    waveform?: number[];
}

export interface IUploaderFile extends FileWithPreview {
    album?: string;
    animated?: boolean;
    caption?: string;
    duration?: number;
    height?: number;
    mediaType?: 'image' | 'video' | 'audio' | 'none';
    mentionList?: IMention[];
    mimeType?: string;
    performer?: string;
    ready?: boolean;
    rtl?: boolean;
    tempThumb?: File;
    textarea?: string;
    title?: string;
    videoThumb?: string;
    width?: number;
}

interface IProps {
    onDone: (items: IMediaItem[], options: IUploaderOptions) => void;
}

interface IState {
    accept: string | undefined;
    dialogOpen: boolean;
    hasFile: boolean;
    isFile: boolean;
    items: IUploaderFile[];
    lastSelected: number;
    loading: boolean;
    peer: InputPeer | null;
    selected: number;
    show: boolean;
}

export const getUploaderInput = (mimeType: string) => {
    const arr = mimeType.split(';');
    if (arr.length > 0) {
        mimeType = arr[0];
    }
    switch (mimeType) {
        case 'image/png':
        case 'image/jpeg':
        case 'image/jpg':
        case 'image/webp':
        case 'video/webm':
        case 'video/mp4':
            return 'media';
        case 'audio/mp4':
        case 'audio/ogg':
        case 'audio/mp3':
            return 'music';
        default:
            return 'file';
    }
};

const mentionInputStyle = {
    input: {
        border: 'none',
        bottom: 'auto',
        lineHeight: '1.2em',
        minHeight: '20px',
        outline: 'none',
        padding: 0,
        position: 'relative',
    },
};

class Uploader extends React.Component<IProps, IState> {
    private dropzoneRef: Dropzone | undefined;
    private imageRef: any;
    private imageActionRef: any;
    private previewRefs: string[][] = [];
    private imageEditorRef: ImageEditor | undefined;
    private videoFrameSelectorRef: VideoFrameSelector | undefined;
    private rtl: boolean = localStorage.getItem(C_LOCALSTORAGE.Lang) === 'fa' || false;
    private rtlDetector: RTLDetector;
    private readonly rtlDetectorThrottle: any;
    private mentionContainer: any = null;
    private textarea: any = null;
    private options: IUploaderOptions = {};

    constructor(props: IProps) {
        super(props);

        this.state = {
            accept: undefined,
            dialogOpen: false,
            hasFile: false,
            isFile: false,
            items: [],
            lastSelected: 0,
            loading: false,
            peer: null,
            selected: 0,
            show: true,
        };

        this.rtlDetector = RTLDetector.getInstance();
        this.rtlDetectorThrottle = throttle(this.detectRTL, 250);
    }

    public openDialog(peer: InputPeer, items: File[], options: IUploaderOptions) {
        this.reset();
        this.options = options;
        const inputItems: IUploaderFile[] = items;
        inputItems.forEach((item) => {
            item.ready = false;
        });
        this.setState({
            accept: options.accept || undefined,
            dialogOpen: true,
            isFile: options.isFile || false,
            items: inputItems,
            peer,
        }, () => {
            if (!options.isFile) {
                this.initMedias();
                this.setImageActionSize();
            } else {
                this.initMedias(true);
            }
        });
    }

    public componentWillUnmount() {
        this.reset();
    }

    public render() {
        const {items, selected, lastSelected, dialogOpen, loading, isFile, hasFile} = this.state;
        return (
            <Dialog
                open={dialogOpen}
                onClose={this.dialogCloseHandler}
                className="uploader-dialog"
                disableBackdropClick={loading}
                classes={{
                    paper: 'uploader-dialog-paper',
                }}
            >
                {Boolean(items.length > 0 && items[selected].mediaType === 'image') &&
                <ImageEditor ref={this.imageEditorRefHandler} onImageReady={this.imageEditorImageReadyHandler}/>}
                {Boolean(items.length > 0 && items[selected].mediaType === 'video') &&
                <VideoFrameSelector ref={this.videoFrameSelectorRefHandler}
                                    onDone={this.videoFrameSelectorDoneHandler}/>}
                <div className="uploader-container">
                    {loading && <div className="uploader-loader">
                        <span>{i18n.t('uploader.converting')}</span>
                    </div>}
                    <div className="uploader-header">
                        {!hasFile && <Tabs className="uploader-tabs" value={isFile ? 1 : 0} indicatorColor="primary"
                                           textColor="primary" onChange={this.tabChangeHandler}>
                            <Tab icon={<PhotoOutlined/>} label={i18n.t('media.media')}
                                 disableRipple={true} classes={{selected: 'tab-selected'}}/>
                            <Tab icon={<InsertDriveFileOutlined/>} label={i18n.t('media.file')}
                                 disableRipple={true} classes={{selected: 'tab-selected'}}/>
                        </Tabs>}
                        <div className="uploader-gap"/>
                        <IconButton
                            className="header-icon"
                            onClick={this.dialogCloseHandler}
                        >
                            <CloseRounded/>
                        </IconButton>
                    </div>
                    <div className="attachment-preview-container">
                        {dialogOpen && <Dropzone
                            ref={this.dropzoneRefHandler}
                            onDrop={this.dropzoneDropHandler}
                            activeClassName="dropzone-active"
                            className="uploader-dropzone"
                            accept={isFile ? undefined : this.state.accept}
                        >
                            <div className="slider-attachment">
                                {items.length > 0 && this.state.show && (
                                    <div
                                        className={'slide' + (selected > lastSelected ? ' left' : ' right') + (isFile ? ' file-mode' : '')}
                                        onClick={this.slideClickHandler}>
                                        {Boolean(!isFile) && <React.Fragment>
                                            {Boolean(items[selected].mediaType === 'image') && <React.Fragment>
                                                <img ref={this.imageRefHandler} className="front"
                                                     src={items[selected].preview} alt="preview" draggable={false}/>
                                                <div ref={this.imageActionRefHandler} className="image-actions">
                                                    <BrushRounded
                                                        onClick={this.editImageHandler(items[selected].preview)}/>
                                                </div>
                                            </React.Fragment>}
                                            {Boolean(items[selected].mediaType === 'video') && <React.Fragment>
                                                <div ref={this.imageActionRefHandler} className="image-actions">
                                                    <CropLandscapeRounded
                                                        onClick={this.chooseFrameHandler(items[selected].preview)}/>
                                                </div>
                                            </React.Fragment>}
                                            {Boolean(items[selected].mediaType === 'video') &&
                                            <video ref={this.imageRefHandler} className="front" controls={true}>
                                                <source src={items[selected].preview}/>
                                            </video>}
                                            {Boolean(items[selected].mediaType === 'audio' && items[selected].preview) &&
                                            <img ref={this.imageRefHandler} className="front" draggable={false}
                                                 src={items[selected].preview} alt="preview"/>}
                                            {Boolean(items[selected].mediaType === 'audio' && !items[selected].preview) &&
                                            <div className="front audio-preview">
                                                <MusicNoteRounded/>
                                            </div>}
                                            {Boolean(lastSelected !== selected && items[lastSelected] && items[selected].mediaType === 'image') && (
                                                <img className="back" src={items[lastSelected].preview} alt="back"
                                                     draggable={false}/>
                                            )}
                                            {Boolean(lastSelected !== selected && items[lastSelected] && items[selected].mediaType === 'audio' && items[lastSelected].preview) && (
                                                <img className="back" src={items[lastSelected].preview} alt="back"
                                                     draggable={false}/>
                                            )}
                                            {Boolean(lastSelected !== selected && items[lastSelected] && items[selected].mediaType === 'audio' && !items[lastSelected].preview) && (
                                                <div className="back audio-preview">
                                                    <MusicNoteRounded/>
                                                </div>
                                            )}
                                        </React.Fragment>}
                                        {Boolean(isFile && items[selected]) && <div className="file-slide">
                                            <div className="file-container">
                                                <div className="icon">
                                                    {items[selected].mediaType === 'image' &&
                                                    <img src={items[selected].preview} alt="preview"
                                                         draggable={false}/>}
                                                    <InsertDriveFileRounded/>
                                                    <span className="extension">
                                                        {getFileExtension(items[selected].type, items[selected].name)}
                                                    </span>
                                                    {this.canAnimate(items[selected]) &&
                                                    <div className="animated-options">
                                                        <Switch
                                                            checked={items[selected].animated || false}
                                                            color="primary"
                                                            size="small"
                                                            onChange={this.animatedChangeHandler(selected)}
                                                        />
                                                        <div className="label">{i18n.t('uploader.animated')}</div>
                                                    </div>}
                                                </div>
                                                <div className="file-info">
                                                    {items[selected].name}<br/>
                                                    <span className="size">
                                                        {getHumanReadableSize(items[selected].size)}</span>
                                                </div>
                                            </div>
                                        </div>}
                                    </div>
                                )}
                                {Boolean(items.length === 0) && <div className="slide">
                                    {i18n.tf('uploader.drop_you_param_here', isFile ? '' : 'media ')}
                                </div>}
                            </div>
                            <div className="dropzone-placeholder">
                                {i18n.t('uploader.add_it')}
                            </div>
                        </Dropzone>}
                        <div className="attachment-details-container">
                            <div
                                className="caption-container">
                                <div className="suggestion-list-container-zero">
                                    <div ref={this.mentionContainerRefHandler} className="suggestion-list-container"/>
                                </div>
                                <div
                                    className={'caption-input-container ' + (items[selected] && items[selected].rtl ? 'rtl' : 'ltr')}>
                                    <MentionInput
                                        peer={this.state.peer || null}
                                        isBot={false}
                                        className="uploader-mention"
                                        style={mentionInputStyle}
                                        inputRef={this.textareaRefHandler}
                                        suggestionsPortalHost={this.mentionContainer}
                                        value={(items[selected] ? (items[selected].textarea || '') : '')}
                                        onChange={this.captionChangeHandler}
                                        placeholder={i18n.t('uploader.write_a_caption')}
                                    />
                                </div>
                            </div>
                            <div className="attachment-action" onClick={this.doneHandler}>
                                <SendRounded/>
                            </div>
                        </div>
                    </div>
                    <div className="attachments-slide-container">
                        <div className="add-file-container">
                            <div key="add-file" className="item add-file" onClick={this.addMediaHandler}>
                                <AddRounded/>
                                <span className="text">{i18n.t('uploader.add_media')}</span>
                            </div>
                        </div>
                        <div className="attachment-item-container">
                            <Scrollbars
                                autoHide={true}
                            >
                                <div className={'attachment-items' + (isFile ? ' file-mode' : '')}>
                                    {items.length > 0 && items.map((item, index) => {
                                        return (
                                            <div key={index}
                                                 className={'item' + (selected === index ? ' selected' : '')}
                                                 onClick={this.selectMediaHandler(index, undefined)}
                                            >
                                                {this.getSlideItem(item)}
                                                {Boolean(!item.ready) &&
                                                <div className="item-busy"><ConfirmationNumberRounded/></div>}
                                                <div className="remove" onClick={this.removeItemHandler(index)}>
                                                    <CloseRounded/>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Scrollbars>
                        </div>
                    </div>
                </div>
            </Dialog>
        );
    }

    private mentionContainerRefHandler = (ref: any) => {
        this.mentionContainer = ref;
    }

    private textareaRefHandler = (ref: any) => {
        this.textarea = ref;
    }

    private getSlideItem(item: IUploaderFile) {
        const {isFile} = this.state;
        switch (item.mediaType) {
            case 'image':
                return (
                    <>
                        <div className="preview" style={{backgroundImage: 'url(' + item.preview + ')'}}/>
                        {isFile && this.getFileItem(item)}
                    </>
                );
            case 'video':
                return (
                    <>
                        <div className="preview"
                             style={{backgroundImage: 'url(' + item.videoThumb + ')'}}/>
                        {!isFile ? <div className="preview-icon">
                            <PlayCircleFilledRounded/>
                        </div> : this.getFileItem(item)}
                    </>
                );
            case 'audio':
                return (<>
                    {item.preview && <div className="preview"
                                          style={{backgroundImage: 'url(' + item.preview + ')'}}/>}
                    {!isFile ? <div className="preview-icon">
                        <MusicNoteRounded/>
                    </div> : this.getFileItem(item)}
                </>);
            default:
                return this.getFileItem(item);

        }
    }

    private getFileItem(item: IUploaderFile) {
        return (<div className="file-preview">
                <InsertDriveFileRounded/>
                <span className="extension">{getFileExtension(item.type, item.name)}</span>
            </div>
        );
    }

    /* Dropzone ref handler */
    private dropzoneRefHandler = (ref: any) => {
        this.dropzoneRef = ref;
    }

    private tabChangeHandler = (e: any, val: number) => {
        const {hasFile} = this.state;
        this.setState({
            isFile: hasFile ? true : val === 1,
        });
    }

    /* On drop handler */
    private dropzoneDropHandler = (accepted: FileWithPreview[]) => {
        this.setState({
            items: [...this.state.items, ...accepted],
        }, () => {
            if (!this.state.isFile) {
                this.initMedias();
                this.setImageActionSize();
            } else {
                this.initMedias(true);
            }
        });
    }

    /* Select media handler */
    private selectMediaHandler = (index: number, callback?: () => void) => (e?: any) => {
        const {items, selected} = this.state;
        if (items[selected]) {
            items[selected].caption = (this.textarea ? this.textarea.value : '');
        }
        if (this.state.selected === index) {
            if (callback) {
                callback();
            }
            this.setState({
                items,
            });
            return;
        }
        this.setState({
            items,
            lastSelected: this.state.selected,
            selected: index,
            show: false,
        }, () => {
            this.setState({
                show: true,
            });
            if (callback) {
                callback();
            }
            if (!this.state.isFile) {
                this.setImageActionSize();
            }
        });
    }

    /* Close dialog handler */
    private dialogCloseHandler = () => {
        this.setState({
            dialogOpen: false,
            items: [],
            lastSelected: 0,
            loading: false,
            peer: null,
            selected: 0,
            show: true,
        });
    }

    /* Get media metadata and preview not exist */
    private initMedias(checkFormat?: boolean) {
        const {items} = this.state;
        let hasFile = false;
        items.map((item, index) => {
            item.mediaType = this.getTypeByMime(item.type);
            if (checkFormat) {
                if (thumbnailReadyMIMEs.indexOf(item.type) === -1) {
                    hasFile = true;
                    item.ready = true;
                    return item;
                } else {
                    if (item.ready) {
                        return item;
                    }
                    item.ready = false;
                }
            }
            if (!this.previewRefs[index]) {
                this.previewRefs[index] = [];
            }
            if (!item.preview && item.mediaType !== 'audio') {
                item.preview = URL.createObjectURL(item);
                this.previewRefs[index].push(item.preview);
            }
            if (item.mediaType === 'image' && item.preview) {
                this.getImageSize(item.preview, index);
            } else if (item.mediaType === 'video' && item.preview) {
                this.getVideoSizeAndThumb(item, index);
            } else if (item.mediaType === 'audio') {
                this.getAudioMetadata(item, index);
            } else {
                item.ready = true;
            }
            return item;
        });
        this.setState({
            hasFile,
            items,
        });
    }

    /* Get image size */
    private getImageSize(src: string, index: number) {
        const img = new Image();
        img.onload = () => {
            const {items} = this.state;
            if (items[index]) {
                items[index].height = img.height;
                items[index].width = img.width;
                items[index].ready = true;
                this.setState({
                    items,
                }, () => {
                    img.remove();
                });
            } else {
                img.remove();
            }
        };
        img.onerror = () => {
            img.remove();
        };
        img.src = src;
    }

    /* Get video size and thumbnail */
    private getVideoSizeAndThumb(item: IUploaderFile, index: number) {
        const src = item.preview || '';
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
            const {items} = this.state;
            if (items[index]) {
                items[index].height = video.videoHeight;
                items[index].width = video.videoWidth;
                items[index].duration = video.duration;
                let sampleTime: number = 0.1;
                if (video.duration > 4) {
                    sampleTime = 3.5;
                }
                video.onloadeddata = () => {
                    video.currentTime = sampleTime;
                    video.ontimeupdate = () => {
                        setTimeout(() => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                                ctx.canvas.height = video.videoHeight;
                                ctx.canvas.width = video.videoWidth;
                                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                                canvas.toBlob((blob) => {
                                    if (blob) {
                                        items[index].tempThumb = new File([blob], 'thumbnail.jpeg');
                                        items[index].videoThumb = URL.createObjectURL(blob);
                                        if (items[index].videoThumb) {
                                            this.previewRefs[index].push(items[index].videoThumb || '');
                                        }
                                    }
                                    video.remove();
                                    canvas.remove();
                                    getCodec(item.type, item).then((mime) => {
                                        item.mimeType = mime;
                                        items[index].ready = true;
                                        this.setState({
                                            items,
                                        });
                                    });
                                }, 'image/jpeg', '0.8');
                            } else {
                                video.remove();
                                canvas.remove();
                            }
                        }, 100);
                    };
                };
            } else {
                video.remove();
            }
        };
        video.onerror = () => {
            video.remove();
        };
        video.src = src;
        video.load();
    }

    /* Get audio metadata */
    private getAudioMetadata(file: IUploaderFile, index: number) {
        MusicMetadata.parseBlob(file).then((res) => {
            const {items} = this.state;
            items[index].duration = res.format.duration;
            if (!res.common.title || res.common.title.length === 0) {
                items[index].title = file.name;
            } else {
                items[index].title = res.common.title;
            }
            items[index].performer = res.common.artist;
            items[index].album = res.common.album;
            if (res.common.picture && res.common.picture.length > 0) {
                items[index].tempThumb = new File([new Uint8Array(res.common.picture[0].data)], 'thumbnail.jpeg');
                items[index].preview = URL.createObjectURL(items[index].tempThumb);
                if (!this.previewRefs[index]) {
                    this.previewRefs[index] = [];
                }
                this.previewRefs[index].push(items[index].preview || '');
            }
            items[index].ready = true;
            this.setState({
                items,
            });
        });
    }

    /* Add new media items at end of items */
    private addMediaHandler = (e: any) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.dropzoneRef) {
            this.dropzoneRef.open();
        }
    }

    /* Reset all data */
    private reset() {
        this.previewRefs.forEach((items) => {
            items.forEach((item) => {
                URL.revokeObjectURL(item);
            });
        });
        this.previewRefs = [];
    }

    /* Remove item handler */
    private removeItemHandler = (index: number) => (e: any) => {
        e.stopPropagation();
        const {items, selected} = this.state;
        const removeItem = () => {
            items.splice(index, 1);
            (this.previewRefs[index] || []).forEach((item) => {
                URL.revokeObjectURL(item);
            });
            this.previewRefs.splice(index, 1);
            const hasFile = items.some((item) => {
                return thumbnailReadyMIMEs.indexOf(item.type) === -1;
            });
            this.setState({
                hasFile,
                items,
            });
        };
        if (selected >= index && selected > 0) {
            if (selected === index) {
                this.selectMediaHandler(selected - 1, () => {
                    removeItem();
                })();
            } else {
                this.setState({
                    lastSelected: selected - 1,
                    selected: selected - 1
                }, () => {
                    removeItem();
                });
            }
        } else {
            removeItem();
        }
    }

    /* Caption change handler */
    private captionChangeHandler = (e: any, a: any, b: any, mentions: IMention[]) => {
        const {items, selected} = this.state;
        if (items[selected]) {
            const text = e.target.value;
            items[selected].textarea = text;
            items[selected].mentionList = mentions;
            items[selected].caption = (this.textarea ? this.textarea.value : '');
            this.rtlDetectorThrottle(text);
            this.setState({
                items,
            });
        }
    }

    /* To prevent dropzone click */
    private slideClickHandler = (e: any) => {
        e.stopPropagation();
    }

    /* Image ref handler */
    private imageRefHandler = (ref: any) => {
        this.imageRef = ref;
    }

    /* Image action ref handler */
    private imageActionRefHandler = (ref: any) => {
        this.imageActionRef = ref;
    }

    /* Resize action area to image size */
    private setImageActionSize() {
        const isVideo = this.state.items[this.state.selected] && this.state.items[this.state.selected].mediaType === 'video';
        setTimeout(() => {
            if (this.imageRef && this.imageActionRef) {
                this.imageActionRef.style.height = `${this.imageRef.clientHeight - (isVideo ? 96 : 0)}px`;
                this.imageActionRef.style.width = `${this.imageRef.clientWidth}px`;
                this.imageActionRef.style.marginTop = `${isVideo ? -48 : 0}px`;
            }
        }, isVideo ? 1000 : 50);
    }

    /* Get type by mime */
    private getTypeByMime(mime: string) {
        const a = mime.split(';');
        if (a.length > 0) {
            mime = a[0];
        }
        switch (mime) {
            case 'image/png':
            case 'image/jpeg':
            case 'image/jpg':
            case 'image/webp':
                return 'image';
            case 'video/webm':
            case 'video/mp4':
                return 'video';
            case 'audio/mp4':
            case 'audio/mp3':
            case 'audio/ogg':
            case 'audio/mpeg':
                return 'audio';
            default:
                return 'none';
        }
    }

    /* Convert file to blob */
    private convertFileToBlob(file: File) {
        return new Promise((resolve) => {
            const blob = new Blob([file], {type: file.type});
            resolve(blob);
        });
    }

    /* Check button click handler */
    private doneHandler = () => {
        const {items, isFile, selected} = this.state;
        if (items.some((item) => {
            return !item.ready;
        })) {
            return;
        }
        this.setState({
            loading: true,
        });
        if (items[selected]) {
            items[selected].caption = (this.textarea ? this.textarea.value : '');
        }
        const promise: any[] = [];
        items.forEach((item) => {
            if (item.mediaType === 'image') {
                const height = Math.round(item.height || 0);
                const width = Math.round(item.width || 0);
                const maxSize = Math.max(height, width);
                if (!isFile) {
                    const config = {
                        autoRotate: true,
                        maxHeight: Math.min(1280, maxSize),
                        maxWidth: Math.min(1280, maxSize),
                        quality: 0.85,
                    };
                    promise.push(readAndCompressImage(item, config));
                } else {
                    promise.push(this.convertFileToBlob(item));
                }
                const thumbConfig = {
                    autoRotate: true,
                    maxHeight: Math.min(160, maxSize),
                    maxWidth: Math.min(160, maxSize),
                    quality: 0.8,
                };
                promise.push(readAndCompressImage(item, thumbConfig));
            } else if (item.mediaType === 'video') {
                const videoThumbConfig = {
                    autoRotate: true,
                    maxHeight: 360,
                    maxWidth: 360,
                    quality: 0.9,
                };
                promise.push(this.convertFileToBlob(item));
                promise.push(readAndCompressImage(item.tempThumb, videoThumbConfig));
            } else if (item.mediaType === 'audio') {
                promise.push(this.convertFileToBlob(item));
                if (item.tempThumb) {
                    const coverThumbConfig = {
                        autoRotate: true,
                        maxHeight: 360,
                        maxWidth: 360,
                        quality: 0.9,
                    };
                    promise.push(readAndCompressImage(new Blob([item.tempThumb], {type: item.tempThumb.type}), coverThumbConfig));
                } else {
                    promise.push(new Promise((resolve) => {
                        resolve(item.tempThumb);
                    }));
                }
            } else if (isFile) {
                promise.push(this.convertFileToBlob(item));
                promise.push(new Promise((resolve) => {
                    resolve(item.tempThumb);
                }));
            }
        });
        Promise.all(promise).then((dist) => {
            const output: IMediaItem[] = [];
            for (let i = 0; i < items.length; i++) {
                const {entities, text} = generateEntities(items[i].caption || '', items[i].mentionList || []);
                output.push({
                    album: items[i].album,
                    animated: items[i].animated,
                    caption: text,
                    duration: items[i].duration ? Math.round(items[i].duration || 0) : undefined,
                    entities,
                    file: dist[i * 2],
                    fileType: items[i].mimeType || items[i].type,
                    mediaType: isFile ? 'file' : (items[i].mediaType || 'none'),
                    name: items[i].name,
                    performer: items[i].performer,
                    thumb: dist[i * 2 + 1] ? {
                        file: dist[i * 2 + 1],
                        fileType: 'image/jpeg',
                        height: Math.round(items[i].height || 0),
                        width: Math.round(items[i].width || 0),
                    } : undefined,
                    title: items[i].title,
                });
            }
            this.props.onDone(output, this.options);
            this.dialogCloseHandler();
            this.setState({
                loading: false,
            });
        });
    }

    /* ImageEditor ref handler */
    private imageEditorRefHandler = (ref: any) => {
        this.imageEditorRef = ref;
    }

    /* Edit image handler */
    private editImageHandler = (url: string | undefined) => (e: any) => {
        if (this.imageEditorRef && url) {
            this.imageEditorRef.openFile(url);
        }
    }

    /* ImageEditor image ready handler */
    private imageEditorImageReadyHandler = (blob: Blob, dimension: IDimension) => {
        const {items, selected} = this.state;
        const file = new File([blob], `cropped_file_${Date.now()}`, {type: blob.type, lastModified: Date.now()});
        const preview = URL.createObjectURL(blob);
        const hold = items[selected];
        items[selected] = file;
        items[selected].width = dimension.width;
        items[selected].height = dimension.height;
        items[selected].caption = hold.caption;
        items[selected].mediaType = hold.mediaType;
        items[selected].ready = hold.ready;
        items[selected].preview = preview;
        if (!this.previewRefs[selected]) {
            this.previewRefs[selected] = [];
        }
        this.previewRefs[selected].push(preview);
        this.setState({
            items,
        }, () => {
            this.setImageActionSize();
        });
    }

    private detectRTL = (text: string) => {
        const {selected, items} = this.state;
        if (items[selected]) {
            if (text.length === 0) {
                items[selected].rtl = this.rtl;
            } else {
                items[selected].rtl = this.rtlDetector.direction(text);
            }
            this.setState({
                items,
            });
            this.computeLines();
        }
    }

    /* Choose video frame handler */
    private chooseFrameHandler = (url: string | undefined) => (e: any) => {
        if (this.videoFrameSelectorRef && url) {
            this.videoFrameSelectorRef.openFile(url);
        }
    }

    /* VideoFrameSelector ref handler */
    private videoFrameSelectorRefHandler = (ref: any) => {
        this.videoFrameSelectorRef = ref;
    }

    /* VideoFrameSelector done handler */
    private videoFrameSelectorDoneHandler = (blob: Blob, url: string) => {
        const {items, selected} = this.state;
        items[selected].tempThumb = new File([blob], `frame_${Date.now()}`, {
            lastModified: Date.now(),
            type: blob.type,
        });
        items[selected].videoThumb = url;
        if (items[selected].videoThumb) {
            this.previewRefs[selected].push(items[selected].videoThumb || '');
        }
        this.setState({
            items,
        });
    }

    private computeLines() {
        if (!this.textarea) {
            return;
        }
        let lines = 1;
        const nodeInfo = measureNodeHeight(this.textarea, 234243, false, 1, 40);
        if (nodeInfo) {
            lines = nodeInfo.rowCount;
        } else {
            lines = this.textarea.value.split('\n').length;
        }
        lines++;
        this.textarea.style.height = `${lines * 1.2}em`;
    }

    private canAnimate(item: IUploaderFile) {
        return ['image/gif', 'image/webp', 'image/png'].indexOf(item.type) > -1;
    }

    private animatedChangeHandler = (index: number) => (e: any, checked: boolean) => {
        const {items} = this.state;
        if (items[index]) {
            items[index].animated = checked;
            this.setState({
                items,
            });
        }
    }
}

export default Uploader;
