/*
    Creation Time: 2019 - Jan - 30
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
// @ts-ignore
import ReactCrop from 'react-image-crop';
import {CheckRounded} from '@material-ui/icons';
import i18n from '../../services/i18n';

import './style.scss';

export interface IDimension {
    height: number;
    width: number;
}

interface IProps {
    className?: string;
    onImageReady: (blob: Blob, dimension: IDimension) => void;
}

interface IState {
    className?: string;
    profileCropperOpen: boolean;
    profilePictureCrop: any;
    profilePictureFile?: string;
}

class Cropper extends React.Component<IProps, IState> {
    private fileInputRef: any = null;
    private imageRef: any = null;
    private pixelCrop: any;
    private lastObjectURLImage: string = '';

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            profileCropperOpen: false,
            profilePictureCrop: {
                unit: 'px',
            },
        };

    }

    /* Open file dialog */
    public openFile(url?: string) {
        if (url) {
            this.setState({
                profileCropperOpen: true,
                profilePictureFile: url,
            });
        } else if (this.fileInputRef) {
            this.fileInputRef.click();
        }
    }

    public render() {
        const {profileCropperOpen, profilePictureFile, profilePictureCrop} = this.state;
        return (
            <>
                <input ref={this.fileInputRefHandler} type="file" style={{display: 'none'}}
                       onChange={this.fileChangeHandler} accept="image/jpg, image/jpeg, image/png"/>
                <Dialog
                    open={profileCropperOpen}
                    onClose={this.profileCropperCloseHandler}
                    className="picture-crop-dialog"
                    classes={{
                        paper: 'picture-crop-dialog-paper'
                    }}
                >
                    <div className="picture-crop-header">{i18n.t('uploader.crop_picture')}</div>
                    {Boolean(profilePictureFile) &&
                    <ReactCrop
                        src={profilePictureFile || ''} crop={profilePictureCrop}
                        onChange={this.cropperChangeHandler}
                        onImageLoaded={this.imageLoadedHandler}
                    />}
                    <div className="picture-crop-footer">
                        <div className="picture-action" onClick={this.cropPictureHandler}>
                            <CheckRounded/>
                        </div>
                    </div>
                </Dialog>
            </>
        );
    }

    /* File input ref handler */
    private fileInputRefHandler = (ref: any) => {
        this.fileInputRef = ref;
    }

    /* File change handler */
    private fileChangeHandler = (e: any) => {
        if (e.currentTarget.files.length > 0) {
            const fileReader = new FileReader();
            fileReader.addEventListener('load', () => {
                // @ts-ignore
                this.lastObjectURLImage = fileReader.result;
                this.setState({
                    profileCropperOpen: true,
                    profilePictureFile: this.lastObjectURLImage,
                });
            });
            fileReader.readAsDataURL(e.target.files[0]);
        }
    }

    /* Profile cropper close handler */
    private profileCropperCloseHandler = () => {
        this.setState({
            profileCropperOpen: false,
        });
        if (this.fileInputRef) {
            this.fileInputRef.value = '';
        }
        URL.revokeObjectURL(this.lastObjectURLImage);
    }

    /* Profile crop handler */
    private cropperChangeHandler = (crop: any, pixelCrop: any) => {
        this.pixelCrop = crop;
        this.setState({
            profilePictureCrop: pixelCrop,
        });
    }

    /* Image loaded handler */
    private imageLoadedHandler = (ref: any) => {
        this.imageRef = ref;
    }

    /* Crop image handler */
    private cropPictureHandler = () => {
        const {profilePictureCrop} = this.state;
        if (this.imageRef && profilePictureCrop.width && profilePictureCrop.height && this.pixelCrop) {
            this.getCroppedImg(this.imageRef, this.pixelCrop, 'newFile.jpeg').then((blob) => {
                this.setState({
                    profileCropperOpen: false,
                });
                if (this.fileInputRef) {
                    this.fileInputRef.value = '';
                }
                this.props.onImageReady(blob, {
                    height: this.pixelCrop.height,
                    width: this.pixelCrop.width,
                });
            });
        }
    }

    /* Crop final image */
    private getCroppedImg(image: any, pixelCrop: any, fileName: string): Promise<Blob> {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            ctx.drawImage(
                image,
                pixelCrop.x * scaleX,
                pixelCrop.y * scaleY,
                pixelCrop.width * scaleX,
                pixelCrop.height * scaleY,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            );

            return new Promise((resolve, reject) => {
                canvas.toBlob((blob: Blob | null) => {
                    if (!blob) {
                        reject();
                        return;
                    }
                    resolve(blob);
                }, 'image/jpeg', 1);
            });
        } else {
            return Promise.reject();
        }
    }
}

export default Cropper;
