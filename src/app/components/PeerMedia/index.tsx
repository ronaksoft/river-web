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

import './style.css';
import {C_MEDIA_TYPE} from '../../repository/media/interface';

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
    tab: number;
}

class PeerMedia extends React.PureComponent<IProps, IState> {
    private peerId: string = '';
    private mediaRepo: MediaRepo;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            items: [],
            tab: 0,
        };

        this.peerId = props.peer.getId() || '';
        this.mediaRepo = MediaRepo.getInstance();
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
        const {className, items, tab} = this.state;
        return (
            <div className={'peer-media ' + className}>
                {!this.props.full && <div className="peer-media-title">
                    <span className="peer-label">Shared Media</span>
                    <span className="more" onClick={this.props.onMore}>Show All</span>
                </div>}
                {this.props.full && <div className="peer-media-tab">
                    <Tabs indicatorColor="primary" textColor="primary" fullWidth={true} centered={true} value={tab}
                          onChange={this.tabChangeHandler}>
                        <Tab label="Picture & Video"/>
                        <Tab label="Music"/>
                        <Tab label="File"/>
                    </Tabs>
                </div>}
                <div className="peer-media-container">
                    {items.map((row, i) => {
                        return (
                            <div key={`r_${i}`} className="media-row">
                                {row.map((item, j) => {
                                    return (
                                        <div key={`i_${i}_${j}`} className="media-item">
                                            <CachedPhoto className="photo" fileLocation={item.info.thumbFile}
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
            </div>
        );
    }

    private getMedias() {
        this.mediaRepo.getMany({
            limit: this.props.full ? 128 : 4,
            type: C_MEDIA_TYPE.Media
        }, this.peerId).then((result) => {
            const items: IMedia[][] = [];
            let innerItems: IMedia[] = [];
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
        });
    }
}


export default PeerMedia;
