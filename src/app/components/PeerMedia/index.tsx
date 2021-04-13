/*
    Creation Time: 2019 - Feb - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
import MediaRepo, {IMediaWithCount} from '../../repository/media';
import {InputPeer, MediaCategory} from '../../services/sdk/messages/core.types_pb';
import {getDuration, getMediaInfo, IMediaInfo} from '../MessageMedia';
import CachedPhoto from '../CachedPhoto';
import {
    CheckCircleRounded,
    CloseRounded,
    ForwardRounded,
    ForwardToInboxRounded,
    HeadsetTwoTone,
    InsertDriveFileTwoTone,
    KeyboardVoiceTwoTone,
    MoreVertRounded,
    PauseRounded,
    PlayArrowRounded,
    PlayCircleFilledRounded,
    RadioButtonUncheckedRounded,
} from '@material-ui/icons';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import {IconButton, Menu, MenuItem, Tab, Tabs, Tooltip} from '@material-ui/core';
import DocumentViewerService, {IDocument} from '../../services/documentViewerService';
import Scrollbars from 'react-custom-scrollbars';
import {getFileExtension, getHumanReadableSize} from '../MessageFile';
import DownloadProgress from '../DownloadProgress';
import {IMessage} from '../../repository/message/interface';
import AudioPlayer, {IAudioEvent, IAudioInfo} from '../../services/audioPlayer';
import ProgressBroadcaster from '../../services/progress';
import {IFileProgress} from '../../services/sdk/fileManager';
import i18n from '../../services/i18n';
import {GetDbFileName} from "../../repository/file";
import ElectronService from "../../services/electron";
import {findIndex} from "lodash";
import SettingsConfigManager from "../../services/settingsConfigManager";
import {EventFileDownloaded} from "../../services/events";
import {IPeer} from "../../repository/dialog/interface";
import {C_INFINITY} from "../../repository";

import './style.scss';

const C_LIMIT = 64;

interface IMenuItem {
    cmd: string;
    icon?: any;
    title: string;
}

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
    selected: boolean;
    type: number;
    userId: string;
    teamId: string;
}

interface IProps {
    className?: string;
    full: boolean;
    onAction: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open' | 'view_in_chat' | 'forward', messageId: number) => void;
    onBulkAction: (cmd: 'forward', messageIds: number[]) => void;
    onMore?: () => void;
    peer: InputPeer;
    teamId: string;
}

interface IState {
    anchorEl: any;
    className: string;
    items: IMedia[];
    loading: boolean;
    selectable: boolean;
    selectedIds: number[];
    tab: number;
}

class PeerMedia extends React.Component<IProps, IState> {
    private eventReferences: any[] = [];
    private downloadEventReferences: any[] = [];
    private peer: InputPeer;
    private mediaRepo: MediaRepo;
    private documentViewerService: DocumentViewerService;
    private itemMap: { [key: number]: number } = {};
    private audioPlayer: AudioPlayer;
    private progressBroadcaster: ProgressBroadcaster;
    private menuItems: IMenuItem[] = [];
    private actionsItems: IMenuItem[] = [];
    private scrollbarRef: Scrollbars | undefined;
    private hasMore: boolean = false;
    private atEnd: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            anchorEl: null,
            className: props.className || '',
            items: [],
            loading: false,
            selectable: false,
            selectedIds: [],
            tab: 0,
        };

        this.peer = this.props.peer;
        this.mediaRepo = MediaRepo.getInstance();
        this.documentViewerService = DocumentViewerService.getInstance();
        this.audioPlayer = AudioPlayer.getInstance();
        this.progressBroadcaster = ProgressBroadcaster.getInstance();

        this.menuItems.push({
            cmd: 'select',
            title: i18n.t('general.select'),
        }, {
            cmd: 'view',
            title: i18n.t('general.save'),
        }, {
            cmd: 'download',
            title: i18n.t('general.download'),
        }, {
            cmd: 'forward',
            title: i18n.t('general.forward'),
        }, {
            cmd: 'view_in_chat',
            title: i18n.t('general.view_in_chat'),
        });

        this.actionsItems.push({
            cmd: 'forward',
            icon: <ForwardRounded/>,
            title: i18n.t('general.forward'),
        }, {
            cmd: 'view_in_chat',
            icon: <ForwardToInboxRounded/>,
            title: i18n.t('general.view_in_chat'),
        });
    }

    public componentDidMount() {
        this.getMedias();
        window.addEventListener(EventFileDownloaded, this.fileDownloadedHandler);
        this.eventReferences.push(this.audioPlayer.globalListen(this.audioPlayerHandler));
    }

    public UNSAFE_componentWillReceiveProps(newProps: IProps) {
        if (this.peer.getId() !== (newProps.peer.getId() || '') || this.peer.getType() !== (newProps.peer.getType() || 0)) {
            this.peer = newProps.peer;
            this.getMedias();
        }
    }

    public componentWillUnmount() {
        window.removeEventListener(EventFileDownloaded, this.fileDownloadedHandler);
        this.removeAllListeners();
    }

    public render() {
        const {className, tab, anchorEl, selectedIds, selectable, loading, items} = this.state;
        return (
            <div className={`peer-media ${(this.props.full ? ' full' : '')} ${className}`}>
                {!this.props.full && <div className="peer-media-title">
                    <span className="peer-label">{i18n.t('peer_info.shared_media')}</span>
                    <span className="more" onClick={this.props.onMore}>{i18n.t('peer_info.show_all')}</span>
                </div>}
                {this.props.full && <div className="peer-media-tab">
                    {selectable && selectedIds.length > 0 ?
                        <div className="peer-media-action">
                            <IconButton className="item" onClick={this.cancelSelectedHandler}>
                                <CloseRounded/>
                            </IconButton>
                            <div className="action-gap"/>
                            {this.getActionContent()}
                        </div> :
                        <Tabs indicatorColor="primary" textColor="primary" variant="scrollable" value={tab}
                              onChange={this.tabChangeHandler}>
                            <Tab value={0} label={i18n.t('peer_info.photo_video')} className="peer-media-tab-item"/>
                            <Tab value={1} label={i18n.t('peer_info.audio')} className="peer-media-tab-item"/>
                            <Tab value={2} label={i18n.t('peer_info.voice')} className="peer-media-tab-item"/>
                            <Tab value={3} label={i18n.t('peer_info.file')} className="peer-media-tab-item"/>
                            <Tab value={4} label={i18n.t('peer_info.gif')} className="peer-media-tab-item"/>
                        </Tabs>}
                </div>}
                <div className="peer-media-container">
                    {loading && items.length > 0 && this.props.full &&
                    <div className="media-load-more">{i18n.t('general.loading')}</div>}
                    {this.getContent()}
                </div>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.menuCloseHandler}
                    className="kk-context-menu"
                    anchorOrigin={{
                        horizontal: 'right',
                        vertical: 'center',
                    }}
                    transformOrigin={{
                        horizontal: 'right',
                        vertical: 'top',
                    }}
                    classes={{
                        paper: 'kk-context-menu-paper'
                    }}
                >
                    {this.contextMenuContent()}
                </Menu>
            </div>
        );
    }

    private menuCloseHandler = () => {
        this.setState({
            anchorEl: null,
        });
    }

    private contextMenuContent() {
        const {selectedIds, items} = this.state;
        if (selectedIds.length === 0) {
            return null;
        }
        const index = findIndex(items, {id: selectedIds[0]});
        if (index === -1) {
            return null;
        }
        const actions: IMenuItem[] = [];
        this.menuItems.forEach((item, i) => {
            if (i === 1) {
                if (items[index].download && !items[index].saved) {
                    actions.push(item);
                }
            } else if (i === 2) {
                if (!items[index].download) {
                    actions.push(item);
                }
            } else {
                actions.push(item);
            }
        });
        return actions.map((item, index) => {
            return (<MenuItem key={index} onClick={this.cmdHandler(item.cmd)}
                              className="context-item">{item.title}</MenuItem>);
        });
    }

    private cmdHandler = (cmd: string) => (e: any) => {
        const {selectedIds, items} = this.state;
        if (selectedIds.length === 0) {
            return;
        }
        switch (cmd) {
            case 'select':
                const index = findIndex(items, {id: selectedIds[0]});
                items[index].selected = !items[index].selected;
                this.setState({
                    items,
                    selectable: true,
                });
                break;
            case 'view':
            case 'download':
            case 'forward':
            case 'view_in_chat':
                this.props.onAction(cmd, selectedIds[0]);
                this.setState({
                    selectedIds: [],
                });
                break;
        }
        this.menuCloseHandler();
    }

    private getActionContent() {
        const actions: IMenuItem[] = [];
        const {selectedIds} = this.state;
        actions.push(this.actionsItems[0]);
        if (selectedIds.length === 1) {
            actions.push(this.actionsItems[1]);
        }
        return actions.map((action) => {
            return <Tooltip key={action.cmd} title={action.title}>
                <IconButton className="item" onClick={this.actionHandler(action.cmd as any)}>{action.icon}</IconButton>
            </Tooltip>;
        });
    }

    private actionHandler = (cmd: 'forward' | 'view_in_chat') => () => {
        const {selectedIds} = this.state;
        if (selectedIds.length === 1) {
            this.props.onAction(cmd as any, selectedIds[0]);
        } else {
            this.props.onBulkAction(cmd as any, selectedIds);
        }
        this.cancelSelectedHandler();
    }

    private cancelSelectedHandler = () => {
        const {items} = this.state;
        items.forEach((item) => {
            item.selected = false;
        });
        this.setState({
            items,
            selectable: false,
            selectedIds: [],
        });
    }

    /* Get media list content */
    private getContent() {
        const {items, tab, loading} = this.state;
        if (loading && items.length === 0) {
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
                case 4:
                    if (items.length > 0) {
                        return (
                            <Scrollbars
                                ref={this.scrollRefHandler}
                                onScroll={this.scrollHandler}
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
                case 3:
                    if (items.length > 0) {
                        return (
                            <Scrollbars
                                ref={this.scrollRefHandler}
                                onScroll={this.scrollHandler}
                                autoHide={true}
                            >
                                {this.getListView()}
                            </Scrollbars>
                        );
                    } else {
                        if (tab === 1 || tab === 2) {
                            return (<div className="media-placeholder"><span className="img audio"/></div>);
                        } else if (tab === 3) {
                            return (<div className="media-placeholder"><span className="img file"/></div>);
                        } else {
                            return (<div className="media-placeholder"><span className="img media"/></div>);
                        }
                    }
            }
        }
    }

    private scrollRefHandler = (ref: any) => {
        this.scrollbarRef = ref;
    }

    private scrollHandler = (e: any) => {
        if (!this.state.loading && this.hasMore && this.scrollbarRef) {
            const {scrollTop} = e.target;
            const {items} = this.state;
            const pos = (this.scrollbarRef.getScrollHeight() - this.scrollbarRef.getClientHeight() - 64);
            if (pos < scrollTop && items.length > 0 && !this.atEnd) {
                this.atEnd = true;
                this.getMedias(items[items.length - 1].id - 1);
            } else if (pos - 24 > scrollTop && this.atEnd) {
                this.atEnd = false;
            }
        }
    }

    /* Get grid view */
    private getGridView() {
        const {items, selectedIds} = this.state;
        return (
            <div className={'media-grid-view' + (selectedIds.length > 0 ? ' has-selected' : '')}>
                {items.map((item, i) => {
                    return (
                        <div key={`${item.id}_${item.download ? 'd' : 'u'}`}
                             className={`media-item item_${item.id}`}
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
                            {this.getMoreContent(i)}
                        </div>
                    );
                })}
            </div>
        );
    }

    /* Get list view */
    private getListView() {
        const {items, selectedIds, selectable} = this.state;
        return (
            <div className={'media-list-view' + (selectedIds.length > 0 ? ' has-selected' : '')}>
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
                            {this.getMoreContent(i)}
                            {!selectable ? this.getMediaAction(item) : null}
                        </div>
                    );
                })}
            </div>);
    }

    private getMoreContent(index: number) {
        if (!this.props.full) {
            return null;
        }
        const {items, selectable} = this.state;
        const item = items[index];
        if (!item) {
            return null;
        }
        return <div className={'media-more' + (selectable ? ' select-mode' : '')}
                    onClick={this.moreClickHandler(index)}>
            {selectable ? item.selected ? <CheckCircleRounded/> : <RadioButtonUncheckedRounded/> : <MoreVertRounded/>}
        </div>;
    }

    private moreClickHandler = (index: number) => (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        const {items, selectable, selectedIds} = this.state;
        if (selectable && items[index]) {
            if (!items[index].selected) {
                selectedIds.push(items[index].id);
            } else {
                const idx = findIndex(items, {id: items[index].id});
                if (idx > -1) {
                    selectedIds.splice(idx, 1);
                }
            }
            items[index].selected = !items[index].selected;
            this.setState({
                items,
                selectable: selectedIds.length > 0,
                selectedIds,
            });
        } else {
            if (items[index]) {
                selectedIds.push(items[index].id);
            }
            this.setState({
                anchorEl: e.currentTarget,
                selectedIds,
            });
        }
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
        const isPicture = item.type === C_MESSAGE_TYPE.Picture || item.type === C_MESSAGE_TYPE.Gif;
        if (item.info.thumbFile.fileid !== '' || (item.download && isPicture)) {
            return (<CachedPhoto className="picture"
                                 fileLocation={(item.download && isPicture) ? item.info.file : item.info.thumbFile}
                                 mimeType={(item.download && isPicture) ? (item.info.mimeType || 'image/jpeg') : 'image/jpeg'}
                                 blur={item.download ? 0 : 10}
                                 tinyThumb={!item.download? item.info.tinyThumb : undefined}
            />);
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

    private getMediaCategory(): MediaCategory {
        if (!this.props.full) {
            return MediaCategory.MEDIACATEGORYMEDIA;
        }
        switch (this.state.tab) {
            case 0:
                return MediaCategory.MEDIACATEGORYMEDIA;
            case 1:
                return MediaCategory.MEDIACATEGORYAUDIO;
            case 2:
                return MediaCategory.MEDIACATEGORYVOICE;
            case 3:
                return MediaCategory.MEDIACATEGORYFILE;
            case 4:
                return MediaCategory.MEDIACATEGORYGIF;
        }
        return MediaCategory.MEDIACATEGORYMEDIA;
    }

    /* Get media from repository */
    private getMedias(before?: number) {
        if (this.state.loading) {
            return;
        }

        this.setState({
            loading: true,
        });

        const currentTab = this.state.tab;

        const earlyFn = before ? undefined : (earlyItems: IMediaWithCount) => {
            if (currentTab !== this.state.tab) {
                return;
            }
            if (!this.props.full) {
                earlyItems.messages = earlyItems.messages.slice(0, 4);
            }
            this.setState({
                items: this.modifyMediaList(earlyItems.messages),
            });
        };
        const mediaCategory = this.getMediaCategory();
        this.mediaRepo.list(this.props.teamId, this.peer, mediaCategory, {
            before: before || C_INFINITY,
            limit: this.props.full ? C_LIMIT : 8,
            localOnly: !this.props.full,
        }, earlyFn).then((result) => {
            if (currentTab !== this.state.tab) {
                this.setState({
                    loading: false,
                    selectable: false,
                    selectedIds: [],
                });
            }
            let {items} = this.state;
            // @ts-ignore
            items.push.apply(items, result.messages);
            if (!this.props.full) {
                items = items.slice(0, 4);
            }
            items = this.modifyMediaList(items);
            if (before) {
                this.setState({
                    items,
                    loading: false,
                });
            } else {
                this.setState({
                    items,
                    loading: false,
                    selectable: false,
                    selectedIds: [],
                });
            }
            this.hasMore = this.props.full && items.length >= C_LIMIT;
        }).catch(() => {
            this.setState({
                loading: false,
            });
        });
    }

    /* Tab change handler */
    private tabChangeHandler = (e: any, tab: number) => {
        this.setState({
            items: [],
            loading: false,
            tab,
        }, () => {
            this.atEnd = false;
            this.getMedias();
        });
    }

    /* Show media handler */
    private showMediaHandler = (i: number) => (e: any) => {
        const {selectedIds, items} = this.state;
        if (selectedIds.length > 0) {
            this.moreClickHandler(i)(e);
            return;
        }
        try {
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
                    orientation: item.info.orientation,
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
                case 2:
                    return (<div className="media-item-action">
                        <div className="audio-action" onClick={this.audioActionClickHandler(item.id)}>
                            {!item.playing && <PlayArrowRounded/>}
                            {item.playing && <PauseRounded/>}
                        </div>
                    </div>);
                case 3:
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
                    selected: false,
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
        if (info.peer.id !== this.peer.getId() || !this.itemMap.hasOwnProperty(info.messageId)) {
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
            const peer: IPeer = {
                id: this.peer.getId(),
                peerType: this.peer.getType(),
            };
            this.audioPlayer.addToPlaylist(id, peer, GetDbFileName(item.info.file.fileid, item.info.file.clusterid), item.userId, true, item.type === C_MESSAGE_TYPE.Voice ? undefined : item.info);
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
