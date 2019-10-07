/*
    Creation Time: 2018 - 11 - 24
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {IUser} from '../../repository/user/interface';
import {trimStart} from 'lodash';
import {
    KeyboardBackspaceRounded,
    ArrowForwardRounded,
    CheckRounded,
    PhotoCameraRounded,
    CloseRounded
} from '@material-ui/icons';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton/IconButton';
import ContactList from '../ContactList';
import i18n from '../../services/i18n';
import FileManager, {IFileProgress} from "../../services/sdk/fileManager";
import AvatarCropper from "../AvatarCropper";
import UniqueId from "../../services/uniqueId";
import RiverTime from "../../services/utilities/river_time";
import ProgressBroadcaster from "../../services/progress";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import {TextAvatar} from "../UserAvatar";

import './style.css';

interface IProps {
    onClose?: () => void;
    onCreate: (contacts: IUser[], title: string, fileId: string) => void;
}

interface IState {
    avatarMenuAnchorEl: any;
    page: string;
    selectedContacts: IUser[];
    title: string;
    uploadingPhoto: boolean;
}

class NewGroupMenu extends React.Component<IProps, IState> {
    private photoBlob?: Blob;
    private profileTempPhoto: string = '';
    private circleProgressRef: any = null;
    private fileManager: FileManager;
    private fileId: string = '';
    private cropperRef: AvatarCropper;
    private riverTime: RiverTime;
    private progressBroadcaster: ProgressBroadcaster;

    constructor(props: IProps) {
        super(props);

        this.state = {
            avatarMenuAnchorEl: null,
            page: '1',
            selectedContacts: [],
            title: '',
            uploadingPhoto: false,
        };

        this.riverTime = RiverTime.getInstance();
        this.fileManager = FileManager.getInstance();
        this.progressBroadcaster = ProgressBroadcaster.getInstance();
    }

    public render() {
        const {page, selectedContacts, title, uploadingPhoto, avatarMenuAnchorEl} = this.state;
        return (
            <div className="new-group-menu">
                <AvatarCropper ref={this.cropperRefHandler} onImageReady={this.croppedImageReadyHandler} width={640}/>
                <div className={'page-container page-' + page}>
                    <div className="page page-1">
                        <div className="menu-header">
                            <IconButton
                                onClick={this.props.onClose}
                            >
                                <KeyboardBackspaceRounded/>
                            </IconButton>
                            <label>{i18n.t('contact.create_a_new_group')}</label>
                        </div>
                        <div className="contact-box">
                            <ContactList onChange={this.contactListChangeHandler} mode="chip"/>
                        </div>
                        {Boolean(selectedContacts.length > 0) && <div className="actions-bar">
                            <div className="add-action" onClick={this.onNextHandler}>
                                <ArrowForwardRounded/>
                            </div>
                        </div>}
                    </div>
                    <div className="page page-2">
                        <div className="menu-header">
                            <IconButton
                                onClick={this.onPrevHandler}
                            >
                                <KeyboardBackspaceRounded/>
                            </IconButton>
                            <label>{i18n.t('contact.group_settings')}</label>
                        </div>
                        <div className="avatar-container">
                            <div className="avatar" onClick={this.avatarMenuAnchorOpenHandler}>
                                {this.profileTempPhoto ?
                                    <img src={this.profileTempPhoto} className="avatar-image"/> : TextAvatar(title)}
                                <div className={'overlay' + (uploadingPhoto ? ' show' : '')}>
                                    {!uploadingPhoto && <React.Fragment>
                                        <PhotoCameraRounded/>
                                        <div className="text">
                                            {i18n.t('peer_info.CHANGE')}
                                            <br/>
                                            {i18n.t('peer_info.PROFILE')}
                                            <br/>
                                            {i18n.t('peer_info.PHOTO')}
                                        </div>
                                    </React.Fragment>}
                                    {uploadingPhoto &&
                                    <div className="progress-action">
                                        <div className="progress">
                                            <svg viewBox="0 0 32 32">
                                                <circle ref={this.progressRefHandler} r="14" cx="16" cy="16"/>
                                            </svg>
                                        </div>
                                        <CloseRounded className="action" onClick={this.cancelFileHandler}/>
                                    </div>}
                                </div>
                            </div>
                        </div>
                        <div className="input-container">
                            <TextField
                                label={i18n.t('contact.group_title')}
                                fullWidth={true}
                                value={title}
                                inputProps={{
                                    maxLength: 32,
                                }}
                                onChange={this.onTitleChangeHandler}
                            />
                        </div>
                        {Boolean(title.length > 0) && <div className="actions-bar no-bg">
                            <div className="add-action" onClick={this.onCreateHandler}>
                                <CheckRounded/>
                            </div>
                        </div>}
                    </div>
                </div>
                <Menu
                    anchorEl={avatarMenuAnchorEl}
                    open={Boolean(avatarMenuAnchorEl)}
                    onClose={this.avatarMenuAnchorCloseHandler}
                    className="kk-context-menu"
                >
                    {this.avatarContextMenuItem()}
                </Menu>
            </div>
        );
    }

    private contactListChangeHandler = (contacts: IUser[]) => {
        this.setState({
            selectedContacts: contacts,
        });
    }

    private onNextHandler = () => {
        const {selectedContacts} = this.state;
        if (!selectedContacts) {
            return;
        }
        this.setState({
            page: '2',
        });
    }

    private onPrevHandler = () => {
        this.setState({
            page: '1',
        });
    }

    private onTitleChangeHandler = (e: any) => {
        this.setState({
            title: trimStart(e.currentTarget.value),
        });
    }

    private onCreateHandler = () => {
        const {selectedContacts, title} = this.state;
        if (!selectedContacts) {
            return;
        }
        if (this.props.onCreate) {
            if (this.photoBlob) {
                this.uploadPhoto().then((fileId) => {
                    this.props.onCreate(selectedContacts, title, fileId);
                }).catch(() => {
                    this.props.onCreate(selectedContacts, title, '');
                }).finally(() => {
                    if (this.props.onClose) {
                        this.props.onClose();
                    }
                });
            } else {
                this.props.onCreate(selectedContacts, title, '');
                if (this.props.onClose) {
                    this.props.onClose();
                }
            }
        }
    }

    /* Avatar menu anchor open handler */
    private avatarMenuAnchorOpenHandler = (e: any) => {
        this.setState({
            avatarMenuAnchorEl: e.currentTarget,
        });
    }

    /* Progress circle ref handler */
    private progressRefHandler = (ref: any) => {
        this.circleProgressRef = ref;
    }

    /* Cancel file download/upload */
    private cancelFileHandler = () => {
        this.fileManager.cancel(this.fileId);
    }

    /* Cropper ref handler */
    private cropperRefHandler = (ref: any) => {
        this.cropperRef = ref;
    }

    /* Open file dialog */
    private openFileDialog = () => {
        if (this.cropperRef) {
            this.cropperRef.openFile();
        }
    }

    /* Context menu options */
    private avatarContextMenuItem() {
        const menuItems: Array<{cmd: 'remove' | 'change'; title: string}> = [{
            cmd: 'remove',
            title: i18n.t('settings.remove_photo'),
        }, {
            cmd: 'change',
            title: i18n.t('settings.change_photo'),
        }];
        return menuItems.filter((o) => {
            if (o.cmd === 'remove') {
                return Boolean(this.photoBlob);
            } else {
                return true;
            }
        }).map((item, index) => {
            return (<MenuItem key={index} onClick={this.avatarMoreCmdHandler(item.cmd)}
                              className="context-item">{item.title}</MenuItem>);
        });
    }

    private avatarMoreCmdHandler = (cmd: 'remove' | 'change') => (e: any) => {
        switch (cmd) {
            case 'remove':
                this.photoBlob = undefined;
                if (this.profileTempPhoto !== '') {
                    URL.revokeObjectURL(this.profileTempPhoto);
                }
                this.profileTempPhoto = '';
                this.forceUpdate();
                break;
            case 'change':
                this.openFileDialog();
                break;
        }
        this.avatarMenuAnchorCloseHandler();
    }

    /* Avatar menu anchor close handler */
    private avatarMenuAnchorCloseHandler = () => {
        this.setState({
            avatarMenuAnchorEl: null,
        });
    }

    /* Cropped image ready handler */
    private croppedImageReadyHandler = (blob: Blob) => {
        if (this.profileTempPhoto !== '') {
            URL.revokeObjectURL(this.profileTempPhoto);
        }
        this.profileTempPhoto = URL.createObjectURL(blob);
        this.photoBlob = blob;
        this.forceUpdate();
    }

    private uploadPhoto(): Promise<string> {
        if (!this.photoBlob) {
            return Promise.reject();
        }

        const id = -this.riverTime.milliNow();
        this.fileId = String(UniqueId.getRandomId());
        const fn = this.progressBroadcaster.listen(id, this.uploadProgressHandler);
        this.setState({
            uploadingPhoto: true,
        });

        return new Promise((resolve, reject) => {
            if (!this.photoBlob) {
                reject();
                return;
            }
            this.fileManager.sendFile(this.fileId, this.photoBlob, (progress) => {
                this.progressBroadcaster.publish(id, progress);
            }).then(() => {
                this.progressBroadcaster.remove(id);
                if (fn) {
                    fn();
                }
                this.setState({
                    uploadingPhoto: false,
                }, () => {
                    resolve(this.fileId);
                });
            }).catch((err) => {
                this.progressBroadcaster.remove(id);
                this.setState({
                    uploadingPhoto: false,
                });
                if (fn) {
                    fn();
                }
                reject(err);
            });
        });
    }

    /* Upload progress handler */
    private uploadProgressHandler = (progress: IFileProgress) => {
        let v = 3;
        if (progress.state === 'failed') {
            this.setState({
                uploadingPhoto: false,
            });
            return;
        } else if (progress.state !== 'complete' && progress.download > 0) {
            v = progress.progress * 85;
        } else if (progress.state === 'complete') {
            v = 88;
        }
        if (v < 3) {
            v = 3;
        }
        if (this.circleProgressRef) {
            this.circleProgressRef.style.strokeDasharray = `${v} 88`;
        }
    }
}

export default NewGroupMenu;
