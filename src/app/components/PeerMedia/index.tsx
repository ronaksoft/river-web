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
import {InputPeer} from '../../services/sdk/messages/chat.core.types_pb';
import {getMediaInfo, IMediaInfo} from '../MessageMedia';
import CachedPhoto from '../CachedPhoto';
import {PlayCircleFilledRounded} from '@material-ui/icons';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {C_MEDIA_TYPE} from '../../repository/media/interface';
import DocumentViewerService, {IDocument} from '../../services/documentViewerService';

import './style.css';
import Scrollbars from 'react-custom-scrollbars';

interface IMedia {
    download: boolean;
    id: number;
    info: IMediaInfo;
    peerId: string;
    type: number;
}

interface IProps {
    className?: string;
    full: boolean;
    onMore?: () => void;
    peer: InputPeer;
}

interface IState {
    className: string;
    items: IMedia[][];
    loading: boolean;
    tab: number;
}

class PeerMedia extends React.PureComponent<IProps, IState> {
    private peerId: string = '';
    private mediaRepo: MediaRepo;
    private documentViewerService: DocumentViewerService;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            items: [],
            loading: true,
            tab: 0,
        };

        this.peerId = props.peer.getId() || '';
        this.mediaRepo = MediaRepo.getInstance();
        this.documentViewerService = DocumentViewerService.getInstance();
    }

    public componentDidMount() {
        this.getMedias();
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.peerId !== (newProps.peer.getId() || '')) {
            this.peerId = newProps.peer.getId() || '';
            this.getMedias();
        }
    }

    public componentWillUnmount() {
        //
    }

    public render() {
        const {className, tab, items} = this.state;
        return (
            <div className={`peer-media ${(this.props.full ? ' full' : '')} ${className}`}>
                {!this.props.full && <div className="peer-media-title">
                    <span className="peer-label">Shared Media</span>
                    {Boolean(items.length > 0) && <span className="more" onClick={this.props.onMore}>Show All</span>}
                </div>}
                {this.props.full && <div className="peer-media-tab">
                    <Tabs indicatorColor="primary" textColor="primary" fullWidth={true} centered={true} value={tab}
                          onChange={this.tabChangeHandler}>
                        <Tab label="Photo & Video"/>
                        <Tab label="Audio"/>
                        <Tab label="File"/>
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
            return (<div className="media-loading">Loading</div>);
        }
        if (!this.props.full) {
            if (items.length > 0) {
                return this.getGridView();
            } else {
                return (<div className="media-placeholder"><span>No Shared Media Here!</span></div>);
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
                        return (<div className="media-placeholder"><span>No Photo/Video Here!</span></div>);
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
                            return (<div className="media-placeholder"><span>No Audio Here!</span></div>);
                        } else if (tab === 2) {
                            return (<div className="media-placeholder"><span>No File Here!</span></div>);
                        } else {
                            return (<div className="media-placeholder"><span>No Shared Media Here!</span></div>);
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
                {items.map((row, i) => {
                    return (
                        <div key={`r_${i}`} className="media-row">
                            {row.map((item, j) => {
                                return (
                                    <div key={`i_${i}_${j}`} className={`media-item item_${item.id}`}
                                         onClick={this.showMediaHandler.bind(this, i, j)}>
                                        <CachedPhoto className="picture" fileLocation={item.info.thumbFile}
                                                     blur={item.download ? 0 : 10}/>
                                        {Boolean(item.type === C_MESSAGE_TYPE.Video) && <React.Fragment>
                                            <div className="video-icon">
                                                <PlayCircleFilledRounded/>
                                            </div>
                                            <div className="media-duration">
                                                {this.getDuration(item.info.duration || 0)}</div>
                                        </React.Fragment>}
                                    </div>
                                );
                            })}
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
                {items.map((row, i) => {
                    return row.map((item, j) => {
                        return (
                            <div key={`i_${i}_${j}`} className={`media-item item_${item.id}`}
                                 onClick={this.showMediaHandler.bind(this, i, j)}>
                                <CachedPhoto className="picture" fileLocation={item.info.thumbFile}
                                             blur={item.download ? 0 : 10}/>
                                {Boolean(item.type === C_MESSAGE_TYPE.Video) && <React.Fragment>
                                    <div className="video-icon">
                                        <PlayCircleFilledRounded/>
                                    </div>
                                    <div className="media-duration">
                                        {this.getDuration(item.info.duration || 0)}</div>
                                </React.Fragment>}
                            </div>
                        );
                    });
                })}
            </div>
        );
    }

    /* Get media from repository */
    private getMedias() {
        this.setState({
            loading: true,
        });
        let mediaType = C_MEDIA_TYPE.Media;
        switch (this.state.tab) {
            case 0:
                mediaType = C_MEDIA_TYPE.Media;
                break;
            case 1:
                mediaType = C_MEDIA_TYPE.Music;
                break;
            case 2:
                mediaType = C_MEDIA_TYPE.FILE;
                break;
        }
        this.mediaRepo.getMany({
            limit: this.props.full ? 128 : 8,
            type: this.props.full ? mediaType : C_MEDIA_TYPE.Media,
        }, this.peerId).then((result) => {
            const items: IMedia[][] = [];
            let innerItems: IMedia[] = [];
            if (!this.props.full) {
                result = result.slice(0, 4);
            }
            result.forEach((item, index) => {
                if (index % 4 === 0) {
                    innerItems = [];
                }
                innerItems.push({
                    download: item.downloaded || false,
                    id: item.id || 0,
                    info: getMediaInfo(item),
                    peerId: item.peerid || '',
                    type: item.messagetype || C_MESSAGE_TYPE.Normal,
                });
                if (index % 4 === 3 || index === (result.length - 1)) {
                    items.push(innerItems);
                }
            });
            this.setState({
                items,
                loading: false,
            });
        });
    }

    /* Get duration with time format */
    private getDuration(duration: number) {
        let sec = String(duration % 60);
        if (sec.length === 1) {
            sec = '0' + sec;
        }
        return `${Math.floor(duration / 60)}:${sec}`;
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
    private showMediaHandler = (i: number, j: number, e: any) => {
        try {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            const {items} = this.state;
            const item = items[i][j];
            const doc: IDocument = {
                anchor: this.props.full ? 'shared_media_full' : 'shared_media',
                items: [{
                    caption: item.info.caption,
                    downloaded: item.download,
                    fileLocation: item.info.file,
                    fileSize: item.info.size,
                    height: item.info.height,
                    id: item.id || 0,
                    thumbFileLocation: item.info.thumbFile,
                    width: item.info.width,
                }],
                peerId: item.peerId || '',
                rect: (e.currentTarget || e).getBoundingClientRect(),
                type: item.type === C_MESSAGE_TYPE.Picture ? 'picture' : 'video',
            };
            this.documentViewerService.loadDocument(doc);
        } catch (e) {
            window.console.log(e);
        }
    }
}


export default PeerMedia;
