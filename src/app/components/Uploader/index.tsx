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
    AddRounded,
    CancelRounded,
    CheckRounded,
    CropRounded,
    PlayCircleFilledRounded,
    ConfirmationNumberRounded, InsertDriveFileRounded,
    MusicNoteRounded, CloseRounded,
} from '@material-ui/icons';
import Scrollbars from 'react-custom-scrollbars';
import TextField from '@material-ui/core/TextField/TextField';
// @ts-ignore
import readAndCompressImage from 'browser-image-resizer';
import {getFileExtension, getHumanReadableSize} from '../MessageFile';
import * as MusicMetadata from 'music-metadata-browser';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Cropper, {IDimension} from '../Cropper';
import i18n from '../../services/i18n';

import './style.css';

interface IMediaThumb {
    file: Blob;
    fileType: string;
    height: number;
    width: number;
}

export interface IMediaItem {
    album?: string;
    caption?: string;
    duration?: number;
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
    caption?: string;
    duration?: number;
    height?: number;
    mediaType?: 'image' | 'video' | 'audio' | 'none';
    performer?: string;
    ready?: boolean;
    tempThumb?: File;
    title?: string;
    videoThumb?: string;
    width?: number;
}

interface IProps {
    accept: string;
    onDone: (items: IMediaItem[]) => void;
}

interface IState {
    dialogOpen: boolean;
    isFile: boolean;
    items: IUploaderFile[];
    lastSelected: number;
    loading: boolean;
    selected: number;
    show: boolean;
}

class MediaPreview extends React.Component<IProps, IState> {
    private dropzoneRef: Dropzone;
    private imageRef: any;
    private imageActionRef: any;
    private previewRefs: string[][] = [];
    private cropperRef: Cropper;

    constructor(props: IProps) {
        super(props);

        this.state = {
            dialogOpen: false,
            isFile: false,
            items: [],
            lastSelected: 0,
            loading: false,
            selected: 0,
            show: true,
        };
    }

    public openDialog(items: File[], isFile?: boolean) {
        this.reset();
        const inputItems: IUploaderFile[] = items;
        if (isFile) {
            inputItems.forEach((item) => {
                item.ready = true;
            });
        }
        this.setState({
            dialogOpen: true,
            isFile: isFile || false,
            items: inputItems,
        }, () => {
            if (!isFile) {
                this.initMedias();
                this.setImageActionSize();
            }
        });
    }

    public componentWillUnmount() {
        this.reset();
    }

    public render() {
        const {items, selected, lastSelected, dialogOpen, loading, isFile} = this.state;
        return (
            <Dialog
                open={dialogOpen}
                onClose={this.dialogCloseHandler}
                className="uploader-dialog"
                disableBackdropClick={loading}
            >
                {Boolean(items.length > 0 && items[selected].mediaType === 'image') &&
                <Cropper ref={this.cropperRefHandler} onImageReady={this.cropperImageReadyHandler}/>}
                <div className="uploader-container">
                    {loading && <div className="uploader-loader">
                        <span>{i18n.t('uploader.converting')}</span>
                    </div>}
                    <div className="uploader-header">
                        <span className="header-title">{i18n.t('uploader.upload_media')}</span>
                        <IconButton
                            className="header-icon"
                            onClick={this.dialogCloseHandler}
                        >
                            <CloseRounded/>
                        </IconButton>
                    </div>
                    <div className="attachment-preview-container">
                        <Dropzone
                            ref={this.dropzoneRefHandler}
                            onDrop={this.onDrop}
                            className="uploader-dropzone"
                            accept={isFile ? undefined : this.props.accept}
                        >
                            <div className="slider-attachment">
                                {items.length > 0 && this.state.show && (
                                    <div className={'slide' + (selected > lastSelected ? ' left' : ' right')}
                                         onClick={this.slideClickHandler}>
                                        {Boolean(!isFile) && <React.Fragment>
                                            {Boolean(items[selected].mediaType === 'image') && <React.Fragment>
                                                <img ref={this.imageRefHandler} className="front"
                                                     src={items[selected].preview}/>
                                                <div ref={this.imageActionRefHandler} className="image-actions">
                                                    <CropRounded
                                                        onClick={this.cropHandler.bind(this, items[selected].preview)}/>
                                                </div>
                                            </React.Fragment>}
                                            {Boolean(items[selected].mediaType === 'video') &&
                                            <video ref={this.imageRefHandler} className="front" controls={true}>
                                                <source src={items[selected].preview}/>
                                            </video>}
                                            {Boolean(items[selected].mediaType === 'audio' && items[selected].preview) &&
                                            <img ref={this.imageRefHandler} className="front"
                                                 src={items[selected].preview}/>}
                                            {Boolean(items[selected].mediaType === 'audio' && !items[selected].preview) &&
                                            <div className="front audio-preview">
                                                <MusicNoteRounded/>
                                            </div>}
                                            {Boolean(lastSelected !== selected && items[lastSelected] && items[selected].mediaType === 'image') && (
                                                <img className="back" src={items[lastSelected].preview}/>
                                            )}
                                            {Boolean(lastSelected !== selected && items[lastSelected] && items[selected].mediaType === 'audio' && items[lastSelected].preview) && (
                                                <img className="back" src={items[lastSelected].preview}/>
                                            )}
                                            {Boolean(lastSelected !== selected && items[lastSelected] && items[selected].mediaType === 'audio' && !items[lastSelected].preview) && (
                                                <div className="back audio-preview">
                                                    <MusicNoteRounded/>
                                                </div>
                                            )}
                                        </React.Fragment>}
                                        {Boolean(isFile && items[selected]) && <div className="file-slide">
                                            <div className="icon">
                                                <div className="extension">
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
                        </Dropzone>
                        <div className="attachment-details-container">
                            <TextField
                                className="caption-input"
                                label={i18n.t('uploader.write_a_caption')}
                                fullWidth={true}
                                multiline={true}
                                rowsMax={2}
                                inputProps={{
                                    maxLength: 512,
                                }}
                                value={(items[selected] ? (items[selected].caption || '') : '')}
                                onChange={this.captionChangeHandler}
                            />
                            <div className="attachment-action" onClick={this.doneHandler}>
                                <CheckRounded/>
                            </div>
                        </div>
                    </div>
                    <div className="attachments-slide-container">
                        <Scrollbars
                            autoHide={true}
                        >
                            <div className="attachment-items">
                                {items.length > 0 && items.map((item, index) => {
                                    return (
                                        <div key={index}
                                             className={'item' + (selected === index ? ' selected' : '')}
                                             onClick={this.selectMedia.bind(this, index, null)}
                                        >
                                            {Boolean(!isFile && item.mediaType === 'image') &&
                                            <div className="preview"
                                                 style={{backgroundImage: 'url(' + item.preview + ')'}}/>}
                                            {Boolean(!isFile && item.mediaType === 'video') && <React.Fragment>
                                                <div className="preview"
                                                     style={{backgroundImage: 'url(' + item.videoThumb + ')'}}/>
                                                <div className="preview-icon">
                                                    <PlayCircleFilledRounded/>
                                                </div>
                                            </React.Fragment>}
                                            {Boolean(!isFile && item.mediaType === 'audio') && <React.Fragment>
                                                {item.preview && <div className="preview"
                                                                      style={{backgroundImage: 'url(' + item.preview + ')'}}/>}
                                                <div className="preview-icon">
                                                    <MusicNoteRounded/>
                                                </div>
                                            </React.Fragment>}
                                            {Boolean(isFile) && <div className="file-preview">
                                                <InsertDriveFileRounded/>
                                                <span className="extension">{getFileExtension(item.type)}</span>
                                            </div>}
                                            {Boolean(!item.ready) &&
                                            <div className="item-busy"><ConfirmationNumberRounded/></div>}
                                            <div className="remove" onClick={this.removeItemHandler.bind(this, index)}>
                                                <CancelRounded/>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div key="add-file" className="item add-file" onClick={this.addMediaHandler}>
                                    <AddRounded/>
                                    <span className="text">{i18n.t('uploader.add_media')}</span>
                                </div>
                            </div>
                        </Scrollbars>
                    </div>
                </div>
            </Dialog>
        );
    }

    /* Dropzone ref handler */
    private dropzoneRefHandler = (ref: any) => {
        this.dropzoneRef = ref;
    }

    /* On drop handler */
    private onDrop = (accepted: FileWithPreview[]) => {
        if (this.state.isFile) {
            accepted.forEach((item: any) => {
                item.ready = true;
            });
        }
        this.setState({
            items: [...this.state.items, ...accepted],
        }, () => {
            if (!this.state.isFile) {
                this.initMedias();
                this.setImageActionSize();
            }
        });
    }

    /* Select media */
    private selectMedia = (index: number, callback?: () => void) => {
        if (this.state.selected === index) {
            return;
        }
        this.setState({
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
        });
    }

    /* Get media metadata and preview not exist */
    private initMedias() {
        const {items} = this.state;
        items.map((item, index) => {
            item.mediaType = this.getTypeByMime(item.type);
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
                this.getVideoSizeAndThumb(item.preview, index);
            } else if (item.mediaType === 'audio') {
                this.getAudioMetadata(item, index);
            }
            return item;
        });
        this.setState({
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
    private getVideoSizeAndThumb(src: string, index: number) {
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
                                        items[index].ready = true;
                                    }
                                    this.setState({
                                        items,
                                    }, () => {
                                        video.remove();
                                        canvas.remove();
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
    private addMediaHandler = () => {
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
    private removeItemHandler = (index: number, e: any) => {
        e.stopPropagation();
        const {items, selected} = this.state;
        const removeItem = () => {
            items.splice(index, 1);
            this.previewRefs[index].forEach((item) => {
                URL.revokeObjectURL(item);
            });
            this.previewRefs.splice(index, 1);
            this.setState({
                items,
            });
        };
        if (selected >= index && selected > 0) {
            if (selected === index) {
                this.selectMedia(selected - 1, () => {
                    removeItem();
                });
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
    private captionChangeHandler = (e: any) => {
        const {items, selected} = this.state;
        if (items[selected]) {
            items[selected].caption = e.currentTarget.value;
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
        setTimeout(() => {
            if (this.imageRef && this.imageActionRef) {
                this.imageActionRef.style.height = `${this.imageRef.clientHeight}px`;
                this.imageActionRef.style.width = `${this.imageRef.clientWidth}px`;
            }
        }, 50);
    }

    /* Get type by mime */
    private getTypeByMime(mime: string) {
        switch (mime) {
            case 'image/png':
            case 'image/jpeg':
            case 'image/jpg':
                return 'image';
            case 'video/webm':
            case 'video/mp4':
                return 'video';
            case 'audio/mp4':
            case 'audio/mp3':
            case 'audio/ogg':
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
        const {items, isFile} = this.state;
        if (items.some((item) => {
            return !item.ready;
        })) {
            return;
        }
        this.setState({
            loading: true,
        });
        const config = {
            autoRotate: true,
            maxHeight: 1280,
            maxWidth: 1280,
            quality: 0.8,
        };
        const thumbConfig = {
            autoRotate: true,
            maxHeight: 160,
            maxWidth: 160,
            quality: 0.8,
        };
        const videoThumbConfig = {
            autoRotate: true,
            maxHeight: 250,
            maxWidth: 250,
            quality: 0.8,
        };
        const promise: any[] = [];
        items.forEach((item) => {
            if (item.mediaType === 'image') {
                promise.push(readAndCompressImage(item, config));
                promise.push(readAndCompressImage(item, thumbConfig));
            } else if (item.mediaType === 'video') {
                promise.push(this.convertFileToBlob(item));
                promise.push(readAndCompressImage(item.tempThumb, videoThumbConfig));
            } else if (item.mediaType === 'audio') {
                promise.push(this.convertFileToBlob(item));
                if (item.tempThumb) {
                    promise.push(readAndCompressImage(new Blob([item.tempThumb], {type: item.tempThumb.type}), videoThumbConfig));
                } else {
                    promise.push(new Promise((resolve) => {
                        resolve(item.tempThumb);
                    }));
                }
            } else if (isFile) {
                promise.push(this.convertFileToBlob(item));
            }
        });
        if (isFile) {
            Promise.all(promise).then((dist) => {
                const output: IMediaItem[] = [];
                for (let i = 0; i < items.length; i++) {
                    output.push({
                        caption: items[i].caption,
                        file: dist[i],
                        fileType: items[i].type,
                        mediaType: 'file',
                        name: items[i].name,
                    });
                }
                this.props.onDone(output);
                this.dialogCloseHandler();
                this.setState({
                    loading: false,
                });
            });
        } else {
            Promise.all(promise).then((dist) => {
                const output: IMediaItem[] = [];
                for (let i = 0; i < items.length; i++) {
                    output.push({
                        album: items[i].album,
                        caption: items[i].caption,
                        duration: items[i].duration,
                        file: dist[i * 2],
                        fileType: items[i].type,
                        mediaType: items[i].mediaType || 'none',
                        name: items[i].name,
                        performer: items[i].performer,
                        thumb: dist[i * 2 + 1] ? {
                            file: dist[i * 2 + 1],
                            fileType: 'image/jpeg',
                            height: items[i].height || 0,
                            width: items[i].width || 0,
                        } : undefined,
                        title: items[i].title,
                    });
                }
                this.props.onDone(output);
                this.dialogCloseHandler();
                this.setState({
                    loading: false,
                });
            });
        }
    }

    /* Cropper ref handler */
    private cropperRefHandler = (ref: any) => {
        this.cropperRef = ref;
    }

    /* Crop handler */
    private cropHandler = (url: string) => {
        if (this.cropperRef) {
            this.cropperRef.openFile(url);
        }
    }

    /* Cropper image ready handler */
    private cropperImageReadyHandler = (blob: Blob, dimension: IDimension) => {
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
        });
    }
}

export default MediaPreview;
