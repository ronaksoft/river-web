/*
    Creation Time: 2020 - June - 10
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import i18n from '../../services/i18n';
import Scrollbars from "react-custom-scrollbars";
import {throttle} from "lodash";
import {MoreVert} from "@material-ui/icons";
import GifRepo from "../../repository/gif";
import {IGif} from "../../repository/gif/interface";
import CachedPhoto from "../CachedPhoto";
import {InputDocument, InputFileLocation} from "../../services/sdk/messages/core.types_pb";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import {findIndex} from 'lodash';
import FileDownloadProgress from "../FileDownloadProgress";
import SettingsConfigManager from "../../services/settingsConfigManager";
import {Loading} from "../Loading";

import './style.scss';

const C_LIMIT = 18;

interface IProps {
    onSelect: (item: IGif) => void;
}

interface IState {
    list: IGif[];
    loading: boolean;
    keyword: string;
    moreAnchorEl: any;
    moreAnchorPos: any;
    moreIndex: number;
}

class GifPicker extends React.Component<IProps, IState> {
    private gifRepo: GifRepo;
    private scrollbarRef: Scrollbars | undefined;
    private readonly searchThrottle: any;
    private hasMore: boolean = false;
    private downloadList: string[] = [];
    private settingsConfigManager: SettingsConfigManager;

    constructor(props: IProps) {
        super(props);

        this.state = {
            keyword: '',
            list: [],
            loading: false,
            moreAnchorEl: null,
            moreAnchorPos: null,
            moreIndex: -1,
        };

        this.gifRepo = GifRepo.getInstance();
        this.searchThrottle = throttle(this.search, 512);
        this.settingsConfigManager = SettingsConfigManager.getInstance();
    }

    public componentDidMount() {
        this.getList();
    }

    public render() {
        const {list, keyword, moreAnchorEl, moreAnchorPos, moreIndex, loading} = this.state;
        return (
            <div className="gif-picker">
                <div className="gif-search">
                    <section className="emoji-mart-search" aria-label="Search">
                        <input type="search" placeholder="Search" value={keyword} onChange={this.searchChangeHandler}/>
                        <label className="emoji-mart-sr-only"
                               htmlFor="emoji-mart-search-1">{i18n.t('dialog.search')}</label>
                        <button className="emoji-mart-search-icon" aria-label="Clear">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 20 20"
                                 opacity="0.5">
                                <path
                                    d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
                            </svg>
                        </button>
                    </section>
                </div>
                <div className="gif-picker-list">
                    {list.length === 0 && <div className="gif-placeholder">
                        {loading ? <Loading/> : <>
                            <div className="gif-text">¯\_(ツ)_/¯</div>
                            <div className="gif-desc">{i18n.t('picker.there_is_no_gif')}</div>
                        </>}
                    </div>}
                    {list.length > 0 && <Scrollbars
                        hideTracksWhenNotNeeded={false}
                        universal={true}
                        onScroll={this.scrollHandler}
                        ref={this.scrollbarRefHandler}
                    >
                        <div className="slider" style={this.getHeight()}>
                            {list.map((item, index) => {
                                return <div key={index} className="gif-item"
                                            onContextMenu={this.gifContextMenuHandler(index)}
                                            onClick={this.gifClickHandler(index)}>
                                    <div className="more">
                                        <MoreVert onClick={this.contextMenuHandler(index)}/>
                                    </div>
                                    {this.getGifContent(item, index)}
                                </div>;
                            })}
                        </div>
                    </Scrollbars>}
                </div>
                <Menu
                    anchorEl={moreAnchorEl}
                    anchorPosition={moreAnchorPos}
                    anchorReference={moreAnchorPos ? 'anchorPosition' : 'anchorEl'}
                    open={Boolean(moreAnchorEl || moreAnchorPos)}
                    onClose={this.moreCloseHandler}
                    className="kk-context-menu"
                    classes={{
                        paper: 'kk-context-menu-paper'
                    }}
                >
                    <MenuItem onClick={this.moreCmdHandler('remove', moreIndex)}
                              className="context-item">{i18n.t('general.remove')}</MenuItem>
                </Menu>
            </div>
        );
    }

    private scrollbarRefHandler = (ref: any) => {
        this.scrollbarRef = ref;
    }

    private getGifContent(item: IGif, index: number) {
        const fileInput: InputFileLocation.AsObject = {
            accesshash: item.doc.accesshash,
            clusterid: item.doc.clusterid,
            fileid: item.doc.id,
        };
        if (item.downloaded) {
            return <CachedPhoto className="gif" fileLocation={fileInput}/>;
        } else if (item.doc.thumbnail) {
            return <>
                <CachedPhoto className="blurred-gif" blur={10}
                             fileLocation={item.doc.thumbnail}
                />
                <FileDownloadProgress fileLocation={fileInput} onAction={this.progressActionHandler(index)}
                                      fileSize={item.doc.filesize || 0}/>
            </>;
        } else {
            return null;
        }
    }

    private getList(offset?: number) {
        if (this.state.loading) {
            return;
        }
        this.setState({
            loading: true,
        });
        this.gifRepo.list(offset || 0, C_LIMIT, (res) => {
            this.hasMore = res.length >= C_LIMIT;
            if (offset) {
                const {list} = this.state;
                list.push(...res);
                this.setState({
                    list,
                    loading: false,
                }, this.checkAutoDownload);
            } else {
                this.setState({
                    list: res,
                });
            }
        }).then((list) => {
            if (!offset && list.length > 0) {
                this.hasMore = list.length >= C_LIMIT;
                this.setState({
                    list,
                    loading: false,
                }, this.checkAutoDownload);
            } else if (!offset) {
                this.setState({
                    loading: false,
                }, this.checkAutoDownload);
            }
        });
    }

    private getHeight() {
        const {list} = this.state;
        return {
            height: Math.ceil(list.length / 3) * 106,
        };
    }

    private searchChangeHandler = (e: any) => {
        this.setState({
            keyword: e.currentTarget.value,
        }, () => {
            if (this.state.keyword.length === 0) {
                this.searchThrottle.cancel();
                this.search();
            } else {
                this.searchThrottle();
            }
        });
    }

    private search = () => {
        this.searchGif(this.state.keyword);
    }

    private searchGif(keyword: string) {
        //
    }

    private gifContextMenuHandler = (index: number) => (e: any) => {
        if (index === -1) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        this.setState({
            moreAnchorEl: null,
            moreAnchorPos: {
                left: e.pageX,
                top: e.pageY,
            },
            moreIndex: index,
        });
    }

    private contextMenuHandler = (index: number) => (e: any) => {
        if (index === -1) {
            return;
        }
        e.stopPropagation();
        this.setState({
            moreAnchorEl: e.currentTarget,
            moreAnchorPos: null,
            moreIndex: index,
        });
    }

    private moreCloseHandler = () => {
        this.setState({
            moreAnchorEl: null,
            moreAnchorPos: null,
        });
    }

    private moreCmdHandler = (cmd: string, index: number) => () => {
        const {list} = this.state;
        const item = list[index];
        this.moreCloseHandler();
        if (!item) {
            return;
        }
        switch (cmd) {
            case 'remove':
                const inputDocument = new InputDocument();
                inputDocument.setId(item.doc.id || '0');
                inputDocument.setClusterid(item.doc.clusterid || 0);
                inputDocument.setAccesshash(item.doc.accesshash || '0');
                this.gifRepo.remove(inputDocument);
                const idx = findIndex(list, {id: item.id || '0'});
                if (idx > -1) {
                    list.splice(idx, 1);
                    this.setState({
                        list,
                    });
                }
                break;
        }
    }

    private progressActionHandler = (index: number) => (action: 'cancel' | 'download') => {
        if (action === 'download') {
            this.download(index);
        }
    }

    private download(index: number) {
        const {list} = this.state;
        const item = list[index];
        if (!item) {
            return;
        }
        const inputFile = new InputFileLocation();
        inputFile.setAccesshash(item.doc.accesshash || '0');
        inputFile.setClusterid(item.doc.clusterid || 0);
        inputFile.setFileid(item.doc.id || '0');
        inputFile.setVersion(item.doc.version || 0);
        this.gifRepo.download(inputFile, item.doc.md5checksum || '', item.doc.filesize || 0, item.doc.mimetype || 'image/gif').then((res) => {
            list[index].downloaded = true;
            this.setState({
                list,
            });
            const idx = this.downloadList.indexOf(item.id || '0');
            if (idx > -1) {
                this.downloadList.splice(idx, 1);
            }
        });
    }

    private gifClickHandler = (index: number) => () => {
        if (this.props.onSelect) {
            const {list} = this.state;
            const item = list[index];
            if (!item) {
                return;
            }
            this.props.onSelect(item);
            const inputDocument = new InputDocument();
            inputDocument.setId(item.doc.id || '0');
            inputDocument.setClusterid(item.doc.clusterid || 0);
            inputDocument.setAccesshash(item.doc.accesshash || '0');
            this.gifRepo.useGif(inputDocument);
        }
    }

    private scrollHandler = (e: any) => {
        if (!this.state.loading && this.hasMore && this.scrollbarRef) {
            const {scrollTop} = e.target;
            const {list} = this.state;
            const pos = (this.scrollbarRef.getScrollHeight() - this.scrollbarRef.getClientHeight() - 64);
            if (pos < scrollTop && list.length > 0) {
                this.getList(list.length);
            }
        }
    }

    private checkAutoDownload = () => {
        const ds = this.settingsConfigManager.getDownloadSettings();
        if (ds.chat_gifs || ds.group_gifs) {
            const {list} = this.state;
            list.forEach((item, index) => {
                if (!item.downloaded && this.downloadList.indexOf(item.id || '0') === -1) {
                    this.downloadList.push(item.id || '0');
                    this.download(index);
                }
            });
        }
    }
}

export default GifPicker;
