/*
    Creation Time: 2019 - Feb - 09
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import {CheckRounded, RotateLeftRounded, RotateRightRounded, ZoomInRounded, ZoomOutRounded} from '@material-ui/icons';
import AvatarEditor from 'react-avatar-editor';

import './style.css';

interface IProps {
    className?: string;
    onImageReady: (blob: Blob) => void;
    width: number;
}

interface IState {
    className?: string;
    profileCropperOpen: boolean;
    profilePictureFile?: string;
    rotate: number;
    zoom: number;
}

class AvatarCropper extends React.Component<IProps, IState> {
    private fileInputRef: any = null;
    private editor: AvatarEditor;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            profileCropperOpen: false,
            rotate: 0,
            zoom: 1.0,
        };

    }

    public componentDidMount() {
        //
    }

    public componentWillReceiveProps(newProps: IProps) {
        //
    }

    /* Open file dialog */
    public openFile() {
        if (this.fileInputRef) {
            this.fileInputRef.click();
        }
    }

    public render() {
        const {width} = this.props;
        const {profileCropperOpen, profilePictureFile, rotate, zoom} = this.state;
        return (
            <React.Fragment>
                <input ref={this.fileInputRefHandler} type="file" style={{display: 'none'}}
                       onChange={this.fileChangeHandler} accept="image/gif, image/jpeg, image/png"/>
                <Dialog
                    open={profileCropperOpen}
                    onClose={this.profileCropperCloseHandler}
                    className="avatar-cropper-dialog"
                >
                    <div className="avatar-cropper-header">
                        <span>Crop Picture</span>
                    </div>
                    {Boolean(profilePictureFile) &&
                    <div className="avatar-cropper-area" onWheelCapture={this.wheelMoveHandler}>
                        <AvatarEditor
                            ref={this.editorRefHandler}
                            image={profilePictureFile || ''}
                            width={width}
                            height={width}
                            borderRadius={width / 2}
                            border={[72, 36]}
                            color={[0, 0, 0, 0.6]} // RGBA
                            scale={zoom}
                            rotate={rotate}
                        />
                    </div>
                    }
                    <div className="avatar-cropper-footer">
                        <div className="avatar-cropper-action" onClick={this.cropPictureHandler}>
                            <CheckRounded/>
                        </div>
                        <div className="avatar-cropper-edit-action">
                            <div className="action-item" onClick={this.rotateLeftHandler}>
                                <RotateLeftRounded/>
                            </div>
                            <div className="action-item" onClick={this.rotateRightHandler}>
                                <RotateRightRounded/>
                            </div>
                            <div className="action-item" onClick={this.zoomInHandler}>
                                <ZoomInRounded/>
                            </div>
                            <div className="action-item" onClick={this.zoomOutHandler}>
                                <ZoomOutRounded/>
                            </div>
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

    /* Editor ref handler */
    private editorRefHandler = (ref: any) => {
        this.editor = ref;
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

    /* Crop image handler */
    private cropPictureHandler = () => {
        this.editor.getImage().toBlob((blob: Blob) => {
            if (!blob) {
                this.profileCropperCloseHandler();
                return;
            }
            this.props.onImageReady(blob);
            this.profileCropperCloseHandler();
        }, 'image/jpeg', 0.8);
    }

    /* Rotate left handler */
    private rotateLeftHandler = () => {
        let {rotate} = this.state;
        rotate = (rotate + 270) % 360;
        this.setState({
            rotate,
        });
    }

    /* Rotate right handler */
    private rotateRightHandler = () => {
        let {rotate} = this.state;
        rotate = (rotate + 90) % 360;
        this.setState({
            rotate,
        });
    }

    /* Zoom in handler */
    private zoomInHandler = () => {
        let {zoom} = this.state;
        zoom += 0.1;
        zoom = Math.min(zoom, 3.0);
        this.setState({
            zoom,
        });
    }

    /* Zoom out handler */
    private zoomOutHandler = () => {
        let {zoom} = this.state;
        zoom -= 0.1;
        zoom = Math.max(zoom, 0.1);
        this.setState({
            zoom,
        });
    }

    /* Wheel move handler */
    private wheelMoveHandler = (e: any) => {
        let {zoom} = this.state;
        zoom -= e.deltaY * 0.01;
        zoom = Math.min(Math.max(zoom, 0.1), 3.0);
        this.setState({
            zoom,
        });
    }
}

export default AvatarCropper;
