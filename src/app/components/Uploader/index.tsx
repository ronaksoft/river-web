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
import {AddRounded, CancelRounded, CheckRounded, CropRounded, PlayCircleFilledRounded} from '@material-ui/icons';
import Scrollbars from 'react-custom-scrollbars';
import TextField from '@material-ui/core/TextField/TextField';
// @ts-ignore
import readAndCompressImage from 'browser-image-resizer';

import './style.css';

interface IMediaThumb {
    file: Blob;
    fileType: string;
    height: number;
    width: number;
}

export interface IMediaItem {
    caption?: string;
    file: Blob;
    fileType: string;
    name: string;
    thumb?: IMediaThumb;
}

export interface IUploaderFile extends FileWithPreview {
    caption?: string;
    height?: number;
    mediaType?: 'image' | 'video' | 'none';
    ready?: boolean;
    tempThumb?: File;
    videoThumb?: string;
    width?: number;
}

interface IProps {
    accept: string;
    onDone: (items: IMediaItem[]) => void;
}

interface IState {
    dialogOpen: boolean;
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

    constructor(props: IProps) {
        super(props);

        this.state = {
            dialogOpen: false,
            items: [],
            lastSelected: 0,
            loading: false,
            selected: 0,
            show: true,
        };
    }

    public openDialog(items: File[]) {
        this.reset();
        this.setState({
            dialogOpen: true,
            items,
        }, () => {
            this.initImages();
            this.setImageActionSize();
        });
    }

    public componentWillUnmount() {
        this.reset();
    }

    public render() {
        const {items, selected, lastSelected, dialogOpen, loading} = this.state;
        return (
            <Dialog
                open={dialogOpen}
                onClose={this.dialogCloseHandler}
                className="uploader-dialog"
                disableBackdropClick={loading}
            >
                <div className="uploader-container">
                    {loading && <div className="uploader-loader">
                        <span>Converting...</span>
                    </div>}
                    <div className="uploader-header">
                        <span>Upload Media</span>
                    </div>
                    <div className="attachment-preview-container">
                        <Dropzone
                            ref={this.dropzoneRefHandler}
                            onDrop={this.onDrop}
                            className="uploader-dropzone"
                            // disableClick={true}
                            accept={this.props.accept}
                        >
                            <div className="slider-attachment">
                                {items.length > 0 && this.state.show && (
                                    <div className={'slide' + (selected > lastSelected ? ' left' : ' right')}
                                         onClick={this.slideClickHandler}>
                                        {Boolean(items[selected].mediaType === 'image') && <React.Fragment>
                                            <img ref={this.imageRefHandler} className="front"
                                                 src={items[selected].preview}/>
                                            <div ref={this.imageActionRefHandler} className="image-actions">
                                                <CropRounded/>
                                            </div>
                                        </React.Fragment>}
                                        {Boolean(items[selected].mediaType === 'video') &&
                                        <video ref={this.imageRefHandler} className="front" controls={true}>
                                            <source src={items[selected].preview}/>
                                        </video>}
                                        {Boolean(lastSelected !== selected && items[lastSelected] && items[selected].mediaType === 'image') && (
                                            <img className="back" src={items[lastSelected].preview}/>
                                        )}
                                    </div>
                                )}
                                {Boolean(items.length === 0) && <div className="slide">
                                    Drop your media files here
                                </div>}
                            </div>
                        </Dropzone>
                        <div className="attachment-details-container">
                            <TextField
                                className="caption-input"
                                label="Write a caption"
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
                                             onClick={this.selectImage.bind(this, index, null)}
                                        >
                                            {Boolean(item.mediaType === 'image') &&
                                            <div className="preview"
                                                 style={{backgroundImage: 'url(' + item.preview + ')'}}/>}
                                            {Boolean(item.mediaType === 'video') && <React.Fragment>
                                                <div className="preview"
                                                     style={{backgroundImage: 'url(' + item.videoThumb + ')'}}/>
                                                <div className="video-icon">
                                                    <PlayCircleFilledRounded/>
                                                </div>
                                            </React.Fragment>}
                                            <div className="remove" onClick={this.removeItemHandler.bind(this, index)}>
                                                <CancelRounded/>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div key="add-file" className="item add-file" onClick={this.addMediaHandler}>
                                    <AddRounded/>
                                    <span className="text">Add Media</span>
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
        // @ts-ignore
        this.setState({
            items: [...this.state.items, ...accepted],
        }, () => {
            this.initImages();
            this.setImageActionSize();
        });
    }

    /* Select image */
    private selectImage = (index: number, callback?: () => void) => {
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
            this.setImageActionSize();
        });
    }

    /* Close dialog handler */
    private dialogCloseHandler = () => {
        this.setState({
            dialogOpen: false,
        });
    }

    /* Get images metadata and preview not exist */
    private initImages() {
        const {items} = this.state;
        items.map((item, index) => {
            item.mediaType = this.getTypeByMime(item.type);
            if (!item.preview) {
                item.preview = URL.createObjectURL(item);
                if (!this.previewRefs[index]) {
                    this.previewRefs[index] = [];
                }
                this.previewRefs[index].push(item.preview);
            }
            if (item.mediaType === 'image') {
                this.getImageSize(item.preview, index);
            } else if (item.mediaType === 'video') {
                this.getVideoSizeAndThumb(item.preview, index);
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
                let sampleTime: number = 0;
                if (video.duration > 4) {
                    sampleTime = 3.5;
                }
                video.currentTime = sampleTime;
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
                this.selectImage(selected - 1, () => {
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
            default:
                return 'none';
        }
    }

    /* Check button click handler */
    private doneHandler = () => {
        const {items} = this.state;
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
        const promise: any[] = [];
        items.forEach((item) => {
            if (item.mediaType === 'image') {
                promise.push(readAndCompressImage(item, config));
                promise.push(readAndCompressImage(item, thumbConfig));
            } else if (item.mediaType === 'video') {
                promise.push(() => {
                    return Promise.resolve(item);
                });
                promise.push(readAndCompressImage(item.tempThumb, thumbConfig));
            }
        });
        Promise.all(promise).then((dist) => {
            const output: IMediaItem[] = [];
            for (let i = 0; i < items.length; i++) {
                output.push({
                    caption: items[i].caption,
                    file: dist[i * 2],
                    fileType: items[i].type,
                    name: items[i].name,
                    thumb: {
                        file: dist[i * 2 + 1],
                        fileType: 'image/jpeg',
                        height: items[i].height || 0,
                        width: items[i].width || 0,
                    },
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

export default MediaPreview;
