/*
    Creation Time: 2019 - Jan - 30
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import ReactCrop, {Crop, PixelCrop} from 'react-image-crop';
import {CheckRounded} from '@material-ui/icons';

import './style.css';

interface IProps {
    className?: string;
    onImageReady: (blob: Blob) => void;
    width: number;
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
    private pixelCrop: PixelCrop;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            profileCropperOpen: false,
            profilePictureCrop: {
                aspect: 1,
                width: this.props.width,
                x: 0,
                y: 0,
            },
        };

    }

    public componentDidMount() {
        //
    }

    public componentWillReceiveProps(newProps: IProps) {
        const {profilePictureCrop} = this.state;
        profilePictureCrop.width = newProps.width;
        this.setState({
            profilePictureCrop,
        });
    }

    /* Open file dialog */
    public openFile() {
        if (this.fileInputRef) {
            this.fileInputRef.click();
        }
    }

    public render() {
        const {profileCropperOpen, profilePictureFile, profilePictureCrop} = this.state;
        return (
            <React.Fragment>
                <input ref={this.fileInputRefHandler} type="file" style={{display: 'none'}}
                       onChange={this.fileChangeHandler} accept="image/gif, image/jpeg, image/png"/>
                <Dialog
                    open={profileCropperOpen}
                    onClose={this.profileCropperCloseHandler}
                    className="picture-crop-dialog"
                >
                    <div className="picture-crop-header">
                        Crop Picture
                    </div>
                    {Boolean(profilePictureFile) &&
                    <ReactCrop src={profilePictureFile || ''} crop={profilePictureCrop}
                               onChange={this.cropperChangeHandler}
                               onImageLoaded={this.imageLoadedHandler}
                    />
                    }
                    <div className="picture-crop-footer">
                        <div className="picture-action" onClick={this.cropPictureHandler}>
                            <CheckRounded/>
                        </div>
                    </div>
                </Dialog>
            </React.Fragment>
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
                this.setState({
                    profileCropperOpen: true,
                    profilePictureFile: fileReader.result,
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
    }

    /* Profile crop handler */
    private cropperChangeHandler = (crop: Crop, pixelCrop: PixelCrop) => {
        this.pixelCrop = pixelCrop;
        this.setState({
            profilePictureCrop: crop,
        });
    }

    /* Image loaded handler */
    private imageLoadedHandler = (ref: any) => {
        this.imageRef = ref;
    }

    /* Crop image handler */
    private cropPictureHandler = () => {
        const {profilePictureCrop} = this.state;
        if (this.imageRef && profilePictureCrop.width && profilePictureCrop.height) {
            this.getCroppedImg(this.imageRef, this.pixelCrop, 'newFile.jpeg').then((blob) => {
                this.setState({
                    profileCropperOpen: false,
                    profilePictureCrop: {
                        aspect: 1,
                        width: 50,
                        x: 0,
                        y: 0,
                    },
                });
                if (this.fileInputRef) {
                    this.fileInputRef.value = '';
                }
                this.props.onImageReady(blob);
            });
        }
    }

    /* Crop final image */
    private getCroppedImg(image: any, pixelCrop: PixelCrop, fileName: string): Promise<Blob> {
        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height,
            );

            return new Promise((resolve, reject) => {
                canvas.toBlob((blob: Blob) => {
                    if (!blob) {
                        reject();
                        return;
                    }
                    resolve(blob);
                }, 'image/jpeg');
            });
        } else {
            return Promise.reject();
        }
    }
}

export default Cropper;
