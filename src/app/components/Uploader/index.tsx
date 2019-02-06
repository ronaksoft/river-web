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
import {DragEvent} from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import {AddRounded, CancelRounded, CheckRounded, CropRounded} from '@material-ui/icons';
import Scrollbars from 'react-custom-scrollbars';
import TextField from '@material-ui/core/TextField/TextField';
// @ts-ignore
import readAndCompressImage from 'browser-image-resizer';

import './style.css';

export interface IMediaItem {
    caption?: string;
    file: Blob;
    fileType: string;
    name: string;
    thumb?: Blob;
    thumbType?: string;
}

export interface IUploaderFile extends FileWithPreview {
    caption?: string;
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
    private previewRefs: string[] = [];

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

    // public componentWillReceiveProps(newProps: IProps) {
    //     //
    // }

    public openDialog(items: File[]) {
        this.reset();
        this.setState({
            dialogOpen: true,
            items,
        }, () => {
            this.generatePreview();
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
                                        <img ref={this.imageRefHandler} className="front"
                                             src={items[selected].preview}/>
                                        <div ref={this.imageActionRefHandler} className="image-actions">
                                            <CropRounded/>
                                        </div>
                                        {Boolean(lastSelected !== selected && items[lastSelected]) && (
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
                                {items.length > 0 && items.map((file, index) => {
                                    return (
                                        <div key={index}
                                             className={'item' + (selected === index ? ' selected' : '')}
                                             onClick={this.selectImage.bind(this, index, null)}
                                        >
                                            <div className="preview"
                                                 style={{backgroundImage: 'url(' + file.preview + ')'}}/>
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

    private dropzoneRefHandler = (ref: any) => {
        this.dropzoneRef = ref;
    }

    private onDrop = (accepted: FileWithPreview[], rejected: FileWithPreview[], event: DragEvent<HTMLDivElement>) => {
        window.console.log(accepted, rejected, event);
        // @ts-ignore
        this.setState({
            items: [...this.state.items, ...accepted],
        });
    }

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

    private dialogCloseHandler = () => {
        this.setState({
            dialogOpen: false,
        });
    }

    private generatePreview() {
        const {items} = this.state;
        items.map((item, index) => {
            if (!item.preview) {
                item.preview = URL.createObjectURL(item);
                this.previewRefs[index] = item.preview;
            }
            return items;
        });
        this.setState({
            items,
        });
    }

    private addMediaHandler = () => {
        if (this.dropzoneRef) {
            this.dropzoneRef.open();
        }
    }

    private reset() {
        this.previewRefs.forEach((item) => {
            URL.revokeObjectURL(item);
        });
        this.previewRefs = [];
    }

    private removeItemHandler = (index: number, e: any) => {
        e.stopPropagation();
        const {items, selected} = this.state;
        const removeItem = () => {
            items.splice(index, 1);
            URL.revokeObjectURL(this.previewRefs[index]);
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

    private captionChangeHandler = (e: any) => {
        const {items, selected} = this.state;
        if (items[selected]) {
            items[selected].caption = e.currentTarget.value;
            this.setState({
                items,
            });
        }
    }

    private slideClickHandler = (e: any) => {
        e.stopPropagation();
    }

    private imageRefHandler = (ref: any) => {
        this.imageRef = ref;
    }

    private imageActionRefHandler = (ref: any) => {
        this.imageActionRef = ref;
    }

    private setImageActionSize() {
        setTimeout(() => {
            if (this.imageRef && this.imageActionRef) {
                this.imageActionRef.style.height = `${this.imageRef.clientHeight}px`;
                this.imageActionRef.style.width = `${this.imageRef.clientWidth}px`;
            }
        }, 50);
    }

    private doneHandler = () => {
        const {items} = this.state;
        this.setState({
            loading: true,
        });
        const thumbConfig = {
            autoRotate: true,
            maxHeight: 100,
            maxWidth: 100,
            quality: 0.8,
        };
        const config = {
            autoRotate: true,
            maxHeight: 1000,
            maxWidth: 1000,
            quality: 0.8,
        };
        const promise: any[] = [];
        items.forEach((item) => {
            promise.push(readAndCompressImage(item, thumbConfig));
            promise.push(readAndCompressImage(item, config));
        });
        Promise.all(promise).then((dist) => {
            const output: IMediaItem[] = [];
            for (let i = 0; i < items.length; i++) {
                output.push({
                    caption: items[i].caption,
                    file: dist[i * 2],
                    fileType: items[i].type,
                    name: items[i].name,
                    thumb: dist[i * 2 + 1],
                    thumbType: items[i].type,
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
