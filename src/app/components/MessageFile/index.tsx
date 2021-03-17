/*
    Creation Time: 2019 - Jan - 16
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
import {IMessage} from '../../repository/message/interface';
import {FileLocation, InputPeer, MessageEntity, PeerType} from '../../services/sdk/messages/core.types_pb';
import {
    DocumentAttributeFile, DocumentAttributeType, MediaDocument,
} from '../../services/sdk/messages/chat.messages.medias_pb';
import {CloseRounded, ArrowDownwardRounded, InsertDriveFileRounded} from '@material-ui/icons';
import {IFileProgress} from '../../services/sdk/fileManager';
import ProgressBroadcaster from '../../services/progress';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import SettingsConfigManager from '../../services/settingsConfigManager';
import i18n from '../../services/i18n';
import {renderBody} from "../Message";
import ElectronService from "../../services/electron";

import './style.scss';
import CachedPhoto from "../CachedPhoto";
import {GetDbFileName} from "../../repository/file";

/* Get human readable size */
export const getHumanReadableSize = (size: number) => {
    if (size < 1024) {
        return `${size} B`;
    } else if (size < 1048576) { // 1024 * 1024
        return `${(size / 1024).toFixed(1)} KB`;
    } else if (size < 1073741824) { // 1024 * 1024 * 1024
        return `${(size / 1048576).toFixed(1)} MB`;
    } else {
        return `${(size / 1073741824).toFixed(1)} GB`;
    }
};

interface IFileInfo {
    name: string;
    caption: string;
    size: number;
    type: string;
    entityList?: MessageEntity.AsObject[];
    thumbFile?: FileLocation.AsObject;
}

export const getFileInfo = (message: IMessage): IFileInfo => {
    const info: IFileInfo = {
        caption: '',
        name: '',
        size: 0,
        type: '',
    };
    const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
    info.caption = messageMediaDocument.caption || '';
    info.size = messageMediaDocument.doc.filesize || 0;
    info.type = messageMediaDocument.doc.mimetype || '';
    if (messageMediaDocument.doc.thumbnail) {
        info.thumbFile = {
            accesshash: messageMediaDocument.doc.thumbnail.accesshash,
            clusterid: messageMediaDocument.doc.thumbnail.clusterid,
            fileid: messageMediaDocument.doc.thumbnail.fileid,
        };
    }
    if (messageMediaDocument.entitiesList) {
        info.entityList = messageMediaDocument.entitiesList;
    }
    if (!message.attributes) {
        return info;
    }
    messageMediaDocument.doc.attributesList.forEach((attr, index) => {
        if (attr.type === DocumentAttributeType.ATTRIBUTETYPEFILE && message.attributes) {
            const docAttr: DocumentAttributeFile.AsObject = message.attributes[index];
            info.name = docAttr.filename || '';
        }
    });
    return info;
};

export const getFileExtension = (mime: string, name?: string) => {
    const arrs = mime.split(';');
    if (arrs.length > 0) {
        mime = arrs[0];
    }
    switch (mime) {
        case 'text/plain':
            return 'txt';
        case 'text/markdown':
            return 'md';
        case 'image/bmp':
            return 'bmp';
        case 'image/tiff':
            return 'tif';
        case 'image/jpeg':
            return 'jpg';
        case 'image/gif':
            return 'gif';
        case 'image/ief':
            return 'ief';
        case 'image/png':
            return 'png';
        case 'image/vnd.dwg':
            return 'dwg';
        case 'image/svg+xml':
            return 'svg';
        case 'image/webp':
            return 'webp';
        case 'audio/aac':
            return 'acc';
        case 'audio/mpeg':
            return 'mpg';
        case 'audio/wma':
            return 'wma';
        case 'audio/mp3':
            return 'mp3';
        case 'audio/mp4':
            return 'm4a';
        case 'audio/ogg':
            return 'ogg';
        case 'audio/x-matroska':
            return '.mka';
        case 'audio/flac':
            return 'flac';
        case 'video/mp4':
            return 'mp4';
        case 'video/3gp':
            return '3gp';
        case 'video/ogg':
            return 'ogv';
        case 'video/webm':
            return 'webm';
        case 'video/quicktime':
            return 'mov';
        case 'video/x-matroska':
            return 'mkv';
        case 'video/x-matroska-3d':
            return 'mk3d';
        case 'application/vnd.android.package-archive':
            return 'apk';
        case 'application/exe':
            return 'exe';
        case 'application/msword':
            return 'doc';
        case 'application/vnd.ms-excel':
            return 'xls';
        case 'application/pdf':
            return 'pdf';
        case 'application/x-rar-compressed':
            return 'rar';
        case 'application/zip':
            return 'zip';
        case 'application/ogg':
            return 'ogx';
        default:
            if (name) {
                const parts = name.split('.');
                if (parts.length > 1) {
                    return parts[parts.length - 1];
                }
            }
            return '';
    }
};

interface IProps {
    measureFn: any;
    message: IMessage;
    peer: InputPeer | null;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open' | 'preview', message: IMessage) => void;
    onBodyAction: (cmd: string, text: string) => void;
}

interface IState {
    fileState: 'download' | 'view' | 'progress' | 'open';
    info: IFileInfo;
    message: IMessage;
}

class MessageFile extends React.PureComponent<IProps, IState> {
    private lastId: number = 0;
    private dbFileName: string = '';
    private downloaded: boolean = false;
    private saved: boolean = false;
    private circleProgressRef: any = null;
    private eventReferences: any[] = [];
    private progressBroadcaster: ProgressBroadcaster;
    private fileSizeRef: any = null;
    private fileSize: number = 0;
    private settingsConfigManager: SettingsConfigManager;
    private readonly isMac: boolean = false;
    private isElectron: boolean = ElectronService.isElectron();

    constructor(props: IProps) {
        super(props);

        const info = getFileInfo(props.message);
        this.fileSize = info.size;

        this.state = {
            fileState: this.getFileState(props.message),
            info,
            message: props.message,
        };

        if (props.message) {
            this.lastId = props.message.id || 0;
            this.downloaded = props.message.downloaded || false;
            this.saved = props.message.saved || false;
        }

        this.progressBroadcaster = ProgressBroadcaster.getInstance();
        this.settingsConfigManager = SettingsConfigManager.getInstance();

        this.isMac = navigator.platform.indexOf('Mac') > -1;
    }

    public componentDidMount() {
        const {message} = this.state;
        const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
        if (!message || !messageMediaDocument.doc) {
            return;
        }
        this.displayFileSize(0);
        this.dbFileName = GetDbFileName(messageMediaDocument.doc.id, messageMediaDocument.doc.clusterid);
        this.initProgress();
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
        if (newProps.message && this.lastId !== newProps.message.id) {
            this.lastId = newProps.message.id || 0;
            const info = getFileInfo(newProps.message);
            this.fileSize = info.size;
            this.displayFileSize(0);
            this.setState({
                fileState: this.getFileState(newProps.message),
                info,
                message: newProps.message,
            }, () => {
                this.initProgress();
            });
        }
        const messageMediaDocument: MediaDocument.AsObject = newProps.message.mediadata;
        if (messageMediaDocument && messageMediaDocument.doc) {
            const fileName = GetDbFileName(messageMediaDocument.doc.id, messageMediaDocument.doc.clusterid);
            if (fileName !== this.dbFileName) {
                this.dbFileName = fileName;
                this.setState({
                    message: newProps.message,
                });
            }
        }
        if ((newProps.message.downloaded || false) !== this.downloaded) {
            this.downloaded = (newProps.message.downloaded || false);
            this.setState({
                fileState: this.getFileState(newProps.message),
            });
        }
        if ((newProps.message.saved || false) !== this.saved) {
            this.saved = (newProps.message.saved || false);
            this.setState({
                fileState: this.getFileState(newProps.message),
                message: newProps.message,
            });
        }
    }

    public componentWillUnmount() {
        this.removeAllListeners();
    }

    public render() {
        const {info, fileState, message} = this.state;
        const thumbFile = info.thumbFile && info.thumbFile.fileid !== '' ? info.thumbFile : null;
        return (
            <div
                className={'message-file' + (thumbFile ? ' has-thumbnail' : '') + (info.caption.length === 0 ? ' no-caption' : '')}>
                <div className="file-content">
                    {thumbFile && <CachedPhoto className="file-thumbnail" fileLocation={thumbFile}
                                               tempFile={(message.id || 0) < 0 ? message.temp_file : undefined}
                                               mimeType="image/jpeg"/>}
                    <div className="file-action">
                        {Boolean(fileState === 'view' || fileState === 'open') &&
                        <Tooltip
                            title={fileState === 'open' ? i18n.t('media.preview') : ''}
                            placement="top"
                            className="tooltip"
                        >
                            <div onClick={this.previewFileHandler}>
                                <InsertDriveFileRounded/>
                                <span className="extension">{getFileExtension(info.type)}</span>
                            </div>
                        </Tooltip>}
                        {Boolean(fileState === 'download') &&
                        <ArrowDownwardRounded onClick={this.downloadFileHandler}/>}
                        {Boolean(fileState === 'progress') && <>
                            <div className="progress">
                                <svg viewBox='0 0 32 32'>
                                    <circle ref={this.progressRefHandler} r='14' cx='16' cy='16'/>
                                </svg>
                            </div>
                            <CloseRounded className="action" onClick={this.cancelFileHandler}/>
                        </>}
                    </div>
                    <div className="file-info">
                        <div className="file-name">{info.name}</div>
                        <div className="file-row">
                            <div className="file-size" ref={this.fileSizeRefHandler}>0 KB</div>
                            {Boolean(fileState === 'view') &&
                            <div className="file-download"
                                 onClick={this.viewFileHandler}>{i18n.t('general.save')}</div>}
                            {Boolean(fileState === 'open') &&
                            <div className="file-download"
                                 onClick={this.openFileHandler}>{this.isMac ? i18n.t('general.show_in_finder') : i18n.t('general.show_in_folder')}</div>}
                        </div>
                    </div>
                </div>
                {Boolean(info.caption.length > 0) &&
                <div className={'file-caption ' + (message.rtl ? 'rtl' : 'ltr')}>
                    {renderBody(info.caption, info.entityList, this.isElectron, this.props.onBodyAction, this.props.measureFn)}
                </div>}
            </div>
        );
    }

    /* Remove all listeners */
    private removeAllListeners() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    /* Get file state */
    private getFileState(message: IMessage) {
        const id = message.id || 0;
        if (id <= 0) {
            return 'progress';
        } else if (id > 0 && !message.downloaded) {
            return 'download';
        } else if (id > 0 && !message.saved) {
            return 'view';
        } else {
            return 'open';
        }
    }

    /* Progress circle ref handler */
    private progressRefHandler = (ref: any) => {
        this.circleProgressRef = ref;
    }

    /* Upload progress handler */
    private uploadProgressHandler = (progress: IFileProgress) => {
        const {message} = this.state;
        if (progress.state === 'complete') {
            this.displayFileSize(0);
        } else if ((message.id || 0) > 0) {
            this.displayFileSize(progress.download);
        } else {
            this.displayFileSize(progress.upload);
        }
        if (!this.circleProgressRef) {
            return;
        }
        let v = 3;
        if (progress.state === 'failed') {
            this.setState({
                fileState: 'download',
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

    /* Download file handler */
    private downloadFileHandler = () => {
        if (this.props.onAction) {
            this.props.onAction('download', this.state.message);
            this.setState({
                fileState: 'progress',
            }, () => {
                this.initProgress();
            });
        }
    }

    /* Initialize progress bar */
    private initProgress() {
        const {message} = this.props;
        if (!message) {
            return;
        }
        if (this.state.fileState === 'progress') {
            if (message) {
                this.removeAllListeners();
                this.eventReferences.push(this.progressBroadcaster.listen(message.id || 0, this.uploadProgressHandler));
            }
        } else {
            if (this.progressBroadcaster.isActive(message.id || 0)) {
                this.setState({
                    fileState: 'progress',
                }, () => {
                    this.removeAllListeners();
                    this.eventReferences.push(this.progressBroadcaster.listen(message.id || 0, this.uploadProgressHandler));
                });
            } else {
                const {peer} = this.props;
                if (peer && message && !message.downloaded) {
                    const ds = this.settingsConfigManager.getDownloadSettings();
                    switch (peer.getType()) {
                        case PeerType.PEERUSER:
                        case PeerType.PEEREXTERNALUSER:
                            if (ds.chat_files) {
                                this.downloadFileHandler();
                            }
                            break;
                        case PeerType.PEERGROUP:
                            if (ds.group_files) {
                                this.downloadFileHandler();
                            }
                            break;
                    }
                }
            }
        }
    }

    /* View file */
    private viewFileHandler = () => {
        if (this.props.onAction) {
            this.props.onAction('view', this.state.message);
        }
    }

    /* Open file */
    private openFileHandler = () => {
        if (this.props.onAction) {
            this.props.onAction('open', this.state.message);
        }
    }

    /* Preview file */
    private previewFileHandler = () => {
        if (this.props.onAction && this.state.fileState === 'open') {
            this.props.onAction('preview', this.state.message);
        }
    }

    /* Cancel file download/upload */
    private cancelFileHandler = () => {
        if (this.props.onAction) {
            if (this.props.message && (this.props.message.id || 0) < 0) {
                this.props.onAction('cancel', this.state.message);
            } else {
                this.props.onAction('cancel_download', this.state.message);
            }
        }
    }

    /* File size ref handler */
    private fileSizeRefHandler = (ref: any) => {
        this.fileSizeRef = ref;
    }

    /* Display file size */
    private displayFileSize(loaded: number) {
        if (!this.fileSizeRef) {
            return;
        }
        if (loaded <= 0) {
            this.fileSizeRef.innerText = `${getHumanReadableSize(this.fileSize)}`;
        } else {
            this.fileSizeRef.innerText = `${getHumanReadableSize(loaded)} / ${getHumanReadableSize(this.fileSize)}`;
        }
    }
}

export default MessageFile;
