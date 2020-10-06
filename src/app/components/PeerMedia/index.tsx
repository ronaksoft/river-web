/*
    Creation Time: 2019 - Feb - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import MediaRepo from '../../repository/media';
import {InputPeer} from '../../services/sdk/messages/core.types_pb';
import {getDuration, getMediaInfo, IMediaInfo} from '../MessageMedia';
import CachedPhoto from '../CachedPhoto';
import {
    PlayCircleFilledRounded,
    InsertDriveFileTwoTone,
    HeadsetTwoTone,
    KeyboardVoiceTwoTone,
    PlayArrowRounded,
    PauseRounded,
} from '@material-ui/icons';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import {Tabs, Tab} from '@material-ui/core';
import {C_MEDIA_TYPE} from '../../repository/media/interface';
import DocumentViewerService, {IDocument} from '../../services/documentViewerService';
import Scrollbars from 'react-custom-scrollbars';
import {getFileExtension, getHumanReadableSize} from '../MessageFile';
import DownloadProgress from '../DownloadProgress';
import {IMessage} from '../../repository/message/interface';
import AudioPlayer, {IAudioEvent, IAudioInfo} from '../../services/audioPlayer';
import ProgressBroadcaster from '../../services/progress';
import {IFileProgress} from '../../services/sdk/fileManager';
import i18n from '../../services/i18n';
import {IPeer} from "../../repository/dialog/interface";
import {GetDbFileName} from "../../repository/file";
import ElectronService from "../../services/electron";
import {findIndex} from "lodash";
import SettingsConfigManager from "../../services/settingsConfigManager";
import {EventFileDownloaded, EventMediaDBUpdated} from "../../services/events";

import './style.scss';

interface IMedia {
    _modified?: boolean;
    createdon?: number;
    download: boolean;
    id: number;
    info: IMediaInfo;
    peerId: string;
    peerType: number;
    playing?: boolean;
    saved: boolean;
    type: number;
    userId: string;
    teamId: string;
}

interface IProps {
    className?: string;
    full: boolean;
    onAction: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open', messageId: number) => void;
    onMore?: () => void;
    peer: InputPeer;
    teamId: string;
}

interface IState {
    className: string;
    items: IMedia[];
    loading: boolean;
    tab: number;
}

class PeerMedia extends React.Component<IProps, IState> {
    private eventReferences: any[] = [];
    private downloadEventReferences: any[] = [];
    private peer: IPeer = {peerType: 0, id: ''};
    private mediaRepo: MediaRepo;
    private documentViewerService: DocumentViewerService;
    private itemMap: { [key: number]: number } = {};
    private audioPlayer: AudioPlayer;
    private progressBroadcaster: ProgressBroadcaster;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            items: [],
            loading: true,
            tab: 0,
        };

        this.peer = {
            id: props.peer.getId() || '',
            peerType: props.peer.getType() || 0,
        };
        this.mediaRepo = MediaRepo.getInstance();
        this.documentViewerService = DocumentViewerService.getInstance();
        this.audioPlayer = AudioPlayer.getInstance();
        this.progressBroadcaster = ProgressBroadcaster.getInstance();
    }

    public componentDidMount() {
        this.getMedias();
        window.addEventListener(EventFileDownloaded, this.fileDownloadedHandler);
        window.addEventListener(EventMediaDBUpdated, this.mediaDBUpdatedHandler);
        this.eventReferences.push(this.audioPlayer.globalListen(this.audioPlayerHandler));
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.peer.id !== (newProps.peer.getId() || '') || this.peer.peerType !== (newProps.peer.getType() || 0)) {
            this.peer = {
                id: newProps.peer.getId() || '',
                peerType: newProps.peer.getType() || 0,
            };
            this.getMedias();
        }
    }

    public componentWillUnmount() {
        window.removeEventListener(EventFileDownloaded, this.fileDownloadedHandler);
        window.removeEventListener(EventMediaDBUpdated, this.mediaDBUpdatedHandler);
        this.removeAllListeners();
    }

    public render() {
        const {className, tab, items} = this.state;
        return (
            <div className={`peer-media ${(this.props.full ? ' full' : '')} ${className}`}>
                {!this.props.full && <div className="peer-media-title">
                    <span className="peer-label">{i18n.t('peer_info.shared_media')}</span>
                    {Boolean(items.length > 0) &&
                    <span className="more" onClick={this.props.onMore}>{i18n.t('peer_info.show_all')}</span>}
                </div>}
                {this.props.full && <div className="peer-media-tab">
                    <Tabs indicatorColor="primary" textColor="primary" variant="scrollable" value={tab}
                          onChange={this.tabChangeHandler}>
                        <Tab value={0} label={i18n.t('peer_info.photo_video')} className="peer-media-tab-item"/>
                        <Tab value={1} label={i18n.t('peer_info.audio')} className="peer-media-tab-item"/>
                        <Tab value={2} label={i18n.t('peer_info.file')} className="peer-media-tab-item"/>
                        <Tab value={3} label={i18n.t('peer_info.gif')} className="peer-media-tab-item"/>
                    </Tabs>
                </div>}
                <div className="peer-media-container">
                    {this.getContent()}
                </div>
            </div>
        );
    }

    /* Get media list content */
    private getContent() {
        const {items, tab, loading} = this.state;
        if (loading) {
            return (<div className="media-loading">{i18n.t('general.loading')}</div>);
        }
        if (!this.props.full) {
            if (items.length > 0) {
                return this.getGridView();
            } else {
                return (<div className="media-placeholder"><span>{i18n.t('peer_info.no_shared_media')}</span></div>);
            }
        } else {
            switch (tab) {
                default:
                case 0:
                    if (items.length > 0) {
                        return (
                            <Scrollbars
                                autoHide={true}
                            >
                                {this.getGridView()}
                            </Scrollbars>
                        );
                    } else {
                        return (<div className="media-placeholder"><span className="img media"/></div>);
                    }
                case 1:
                case 2:
                    if (items.length > 0) {
                        return (
                            <Scrollbars
                                autoHide={true}
                            >
                                {this.getListView()}
                            </Scrollbars>
                        );
                    } else {
                        if (tab === 1) {
                            return (<div className="media-placeholder"><span className="img audio"/></div>);
                        } else if (tab === 2) {
                            return (<div className="media-placeholder"><span className="img file"/></div>);
                        } else {
                            return (<div className="media-placeholder"><span className="img media"/></div>);
                        }
                    }
            }
        }
    }

    /* Get grid view */
    private getGridView() {
        const {items} = this.state;
        return (
            <div className="media-grid-view">
                {items.map((item, i) => {
                    return (
                        <div key={item.id} className={`media-item item_${item.id}`}
                             onClick={this.showMediaHandler(i)}>
                            {this.getFileIcon(item)}
                            {Boolean(item.type === C_MESSAGE_TYPE.Video) &&
                            <div className="video-icon">
                                <PlayCircleFilledRounded/>
                            </div>}
                            {Boolean(item.type === C_MESSAGE_TYPE.Audio || item.type === C_MESSAGE_TYPE.Voice) &&
                            <div className="video-icon" onClick={this.audioActionClickHandler(item.id)}>
                                {!item.playing && <PlayArrowRounded/>}
                                {item.playing && <PauseRounded/>}
                            </div>}
                            {Boolean(item.type === C_MESSAGE_TYPE.Video || item.type === C_MESSAGE_TYPE.Audio || item.type === C_MESSAGE_TYPE.Voice) &&
                            <div className="media-duration-container">{getDuration(item.info.duration || 0)}</div>}
                        </div>
                    );
                })}
            </div>
        );
    }

    /* Get list view */
    private getListView() {
        const {items} = this.state;
        return (
            <div className="media-list-view">
                {items.map((item, i) => {
                    return (
                        <div key={item.id} className={`media-item item_${item.id}`}
                             onClick={this.showMediaHandler(i)}>
                            {this.getFileIcon(item)}
                            <div className="media-item-info">
                                <div
                                    className="media-name">{this.getName(item)}</div>
                                {!(item.type === C_MESSAGE_TYPE.Voice || item.type === C_MESSAGE_TYPE.Audio) &&
                                <div className="media-size">{getHumanReadableSize(item.info.size)}</div>}
                                {(item.type === C_MESSAGE_TYPE.Voice || item.type === C_MESSAGE_TYPE.Audio) &&
                                <div className="media-size">{getDuration(item.info.duration || 0)}</div>}
                            </div>
                            {this.getMediaAction(item)}
                        </div>
                    );
                })}
            </div>
        );
    }

    private getName(item: IMedia) {
        switch (item.type) {
            case C_MESSAGE_TYPE.Voice:
                return i18n.t('media.audio');
            case C_MESSAGE_TYPE.Audio:
                return item.info.title;
            default:
                return item.info.fileName;
        }
    }

    /* Get file icon */
    private getFileIcon(item: IMedia) {
        if (item.info.thumbFile.fileid !== '') {
            return (<CachedPhoto className="picture"
                                 fileLocation={(item.download && item.type === C_MESSAGE_TYPE.Picture) ? item.info.file : item.info.thumbFile}
                                 mimeType={(item.download && item.type === C_MESSAGE_TYPE.Picture) ? (item.info.mimeType || 'image/jpeg') : 'image/jpeg'}
                                 blur={item.download ? 0 : 10}/>);
        } else {
            switch (item.type) {
                default:
                case C_MESSAGE_TYPE.File:
                    return (
                        <div className="file-icon">
                            <InsertDriveFileTwoTone/>
                            <span
                                className="file-extension">{getFileExtension(item.info.type, item.info.fileName)}</span>
                        </div>);
                case C_MESSAGE_TYPE.Audio:
                    return (
                        <div className="file-icon music">
                            <HeadsetTwoTone/>
                        </div>);
                case C_MESSAGE_TYPE.Voice:
                    return (
                        <div className="file-icon voice">
                            <KeyboardVoiceTwoTone/>
                        </div>);
            }
        }
    }

    /* Get media from repository */
    private getMedias() {
        this.setState({
            loading: true,
        });
        let mediaType = C_MEDIA_TYPE.MEDIA;
        switch (this.state.tab) {
            case 0:
                mediaType = C_MEDIA_TYPE.PHOTOVIDEO;
                break;
            case 1:
                mediaType = C_MEDIA_TYPE.MUSIC;
                break;
            case 2:
                mediaType = C_MEDIA_TYPE.FILE;
                break;
            case 3:
                mediaType = C_MEDIA_TYPE.GIF;
                break;
        }
        this.mediaRepo.getMany(this.props.teamId, this.peer, {
            limit: this.props.full ? 128 : 8,
            type: this.props.full ? mediaType : undefined,
        }).then((result) => {
            if (!this.props.full) {
                result.messages = result.messages.slice(0, 4);
            }
            this.setState({
                items: this.modifyMediaList(result.messages),
                loading: false,
            });
        });
    }

    /* Tab change handler */
    private tabChangeHandler = (e: any, tab: number) => {
        this.setState({
            tab,
        }, () => {
            this.getMedias();
        });
    }

    /* Show media handler */
    private showMediaHandler = (i: number) => (e: any) => {
        try {
            const {items} = this.state;
            const item = items[i];
            if (!(item.type === C_MESSAGE_TYPE.Picture || item.type === C_MESSAGE_TYPE.Video || item.type === C_MESSAGE_TYPE.Gif)) {
                return;
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            const doc: IDocument = {
                anchor: this.props.full ? 'shared_media_full' : 'shared_media',
                items: [{
                    caption: item.info.caption,
                    createdon: 0,
                    downloaded: item.download,
                    duration: item.info.duration,
                    fileLocation: item.info.file,
                    fileSize: item.info.size,
                    height: item.info.height,
                    id: item.id || 0,
                    md5: item.info.md5,
                    mimeType: item.info.mimeType,
                    thumbFileLocation: item.info.thumbFile,
                    userId: item.userId || '',
                    width: item.info.width,
                }],
                peer: {id: item.peerId || '', peerType: item.peerType || 0},
                rect: (e.currentTarget || e).getBoundingClientRect(),
                teamId: item.teamId,
                type: item.type === C_MESSAGE_TYPE.Video ? 'video' : 'picture',
            };
            this.documentViewerService.loadDocument(doc);
        } catch (e) {
            window.console.debug(e);
        }
    }

    /* File downloaded handler */
    private fileDownloadedHandler = (data: any) => {
        if (!data.detail.id) {
            return;
        }
        const id = data.detail.id;
        if (!this.itemMap.hasOwnProperty(id)) {
            return;
        }
        const {items} = this.state;
        const index = this.itemMap[id];
        items[index].download = true;
        if (items[index].type === C_MESSAGE_TYPE.File && ElectronService.isElectron() && SettingsConfigManager.getInstance().getDownloadSettings().auto_save_files) {
            items[index].saved = true;
        }
        this.setState({
            items,
        });
    }

    /* Get media action */
    private getMediaAction(item: IMedia) {
        const {tab} = this.state;
        if (!item.download) {
            return (
                <DownloadProgress className="media-item-action" id={item.id}
                                  fileSize={item.info.size}
                                  hideSizeIndicator={true} onAction={this.props.onAction}/>);
        } else {
            switch (tab) {
                case 1:
                    return (<div className="media-item-action">
                        <div className="audio-action" onClick={this.audioActionClickHandler(item.id)}>
                            {!item.playing && <PlayArrowRounded/>}
                            {item.playing && <PauseRounded/>}
                        </div>
                    </div>);
                case 2:
                default:
                    if (!item.saved) {
                        return (<div className="media-file-action">
                            <span
                                onClick={this.mediaActionClickHandler(item.id, 'view')}>{i18n.t('general.save')}</span>
                        </div>);
                    } else {
                        return (<div className="media-file-action">
                            <span
                                onClick={this.mediaActionClickHandler(item.id, 'open')}>{i18n.t('general.open')}</span>
                        </div>);
                    }
            }
        }
    }

    private mediaActionClickHandler = (id: number, cmd: 'view' | 'open') => (e: any) => {
        if (this.props.onAction) {
            this.props.onAction(cmd, id);
            if (cmd === 'view') {
                this.updateItemSaveStatus(id);
            }
        }
    }

    private updateItemSaveStatus(id: number) {
        if (!ElectronService.isElectron()) {
            return;
        }
        const {items} = this.state;
        const index = findIndex(items, {id});
        if (index > -1) {
            items[index].saved = true;
            this.setState({
                items,
            });
        }
    }

    /* Media repo updated handler */
    private mediaDBUpdatedHandler = (event: any) => {
        const data = event.detail;
        if (data.peerids && data.peerids.indexOf(this.props.peer.getId() || '') > -1) {
            setTimeout(() => {
                this.loadMediaList(false, 32);
            }, 600);
        }
    }

    /* Update media list */
    private loadMediaList(append: boolean, limit: number) {
        this.setState({
            loading: true,
        });
        let {items} = this.state;
        let breakPoint = 0;
        if (items.length > 0) {
            if (append) {
                breakPoint = items[items.length - 1].id - 1;
            } else {
                breakPoint = items[0].id + 1;
            }
        }
        let mediaType;
        if (this.props.full) {
            switch (this.state.tab) {
                case 0:
                    mediaType = C_MEDIA_TYPE.MEDIA;
                    break;
                case 1:
                    mediaType = C_MEDIA_TYPE.MUSIC;
                    break;
                case 2:
                    mediaType = C_MEDIA_TYPE.FILE;
                    break;
            }
        }
        this.mediaRepo.getMany(this.props.teamId, this.peer, {
            after: !append ? breakPoint : undefined,
            before: append ? breakPoint : undefined,
            limit,
            type: mediaType,
        }).then((result) => {
            if (result.messages.length === 0) {
                this.setState({
                    loading: false,
                });
                return;
            }
            if (append) {
                // @ts-ignore
                items.push.apply(items, result.messages);
            } else {
                // @ts-ignore
                items.unshift.apply(items, result.messages);
            }
            if (!this.props.full) {
                items = items.slice(0, 4);
            }
            this.setState({
                items: this.modifyMediaList(items),
                loading: false,
            });
        });
    }

    /* Modify media list */
    private modifyMediaList(list: Array<IMessage | IMedia>): IMedia[] {
        const items: IMedia[] = [];
        this.itemMap = {};
        this.removeAllDownloadListeners();
        list.forEach((item, index) => {
            // @ts-ignore
            if (item._modified) {
                // @ts-ignore
                items.push(item);
            } else {
                item = item as IMessage;
                items.push({
                    _modified: true,
                    createdon: item.createdon,
                    download: item.downloaded || false,
                    id: item.id || 0,
                    info: getMediaInfo(item),
                    peerId: item.peerid || '0',
                    peerType: item.peertype || 0,
                    saved: item.saved || false,
                    teamId: item.teamid || '0',
                    type: item.messagetype || C_MESSAGE_TYPE.Normal,
                    userId: item.senderid || '',
                });
            }
            this.itemMap[item.id || 0] = index;
            // @ts-ignore
            if (!item.download) {
                this.downloadEventReferences.push(this.progressBroadcaster.listen(item.id || 0, this.downloadProgressHandler));
            }
        });
        return items;
    }

    /* Audio player handler */
    private audioPlayerHandler = (info: IAudioInfo, e: IAudioEvent) => {
        if (info.peer.id !== this.peer.id || !this.itemMap.hasOwnProperty(info.messageId)) {
            return;
        }
        const index = this.itemMap[info.messageId];
        const {items} = this.state;
        if ((e.state === 'play' || e.state === 'seek_play') && !items[index].playing) {
            items[index].playing = true;
            this.setState({
                items,
            });
        } else if ((e.state === 'pause' || e.state === 'seek_pause') && items[index].playing) {
            items[index].playing = false;
            this.setState({
                items,
            });
        }
    }

    /* Audio action click handler */
    private audioActionClickHandler = (id: number) => (e: any) => {
        if (!this.itemMap.hasOwnProperty(id)) {
            return;
        }
        const index = this.itemMap[id];
        const {items} = this.state;
        const item = items[index];
        if (!item.playing) {
            this.audioPlayer.addToPlaylist(id, this.peer, GetDbFileName(item.info.file.fileid, item.info.file.clusterid), item.userId, true, item.type === C_MESSAGE_TYPE.Voice ? undefined : item.info);
            this.audioPlayer.play(id);
        } else {
            this.audioPlayer.pause(id);
        }
    }

    /* Remove all listeners */
    private removeAllListeners() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    /* Remove all download listeners */
    private removeAllDownloadListeners() {
        this.downloadEventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }

    /* Download progress handler */
    private downloadProgressHandler = (progress: IFileProgress) => {
        if (this.itemMap.hasOwnProperty(progress.msgId || 0) && progress.state === 'complete') {
            const index = this.itemMap[progress.msgId || 0];
            const {items} = this.state;
            if (index > -1 && items[index]) {
                items[index].download = true;
                this.setState({
                    items,
                }, () => {
                    this.forceUpdate();
                });
            }
        }
    }
}


export default PeerMedia;
