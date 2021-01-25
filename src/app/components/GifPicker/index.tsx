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
import {debounce} from "lodash";
import {MoreVertRounded} from "@material-ui/icons";
import GifRepo from "../../repository/gif";
import {IGif} from "../../repository/gif/interface";
import CachedPhoto from "../CachedPhoto";
import {InputDocument, InputFileLocation, InputPeer} from "../../services/sdk/messages/core.types_pb";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import FileDownloadProgress from "../FileDownloadProgress";
import SettingsConfigManager from "../../services/settingsConfigManager";
import {Loading} from "../Loading";

import './style.scss';
import {SetOptional} from "type-fest";

const C_LIMIT = 18;

interface IProps {
    onSelect: (item: IGif, viaBotId?: string) => void;
    inputPeer: InputPeer | null;
}

interface IState {
    isRemote: boolean;
    keyword: string;
    list: IGif[];
    loading: boolean;
    moreAnchorEl: any;
    moreAnchorPos: any;
    moreIndex: number;
}

class GifPicker extends React.Component<IProps, IState> {
    private gifRepo: GifRepo;
    private scrollbarRef: Scrollbars | undefined;
    private readonly searchDebounce: any;
    private hasMore: boolean = false;
    private downloadList: string[] = [];
    private settingsConfigManager: SettingsConfigManager;
    private botId: string = '0';

    constructor(props: IProps) {
        super(props);

        this.state = {
            isRemote: false,
            keyword: '',
            list: [],
            loading: false,
            moreAnchorEl: null,
            moreAnchorPos: null,
            moreIndex: -1,
        };

        this.gifRepo = GifRepo.getInstance();
        this.searchDebounce = debounce(this.search, 511);
        this.settingsConfigManager = SettingsConfigManager.getInstance();
    }

    public componentDidMount() {
        this.getList();
    }

    public render() {
        const {list, keyword, moreAnchorEl, moreAnchorPos, loading} = this.state;
        return (
            <div className="gif-picker">
                <div className="gif-search">
                    <section className="emoji-mart-search" aria-label="Search">
                        <input type="search" placeholder="Search" value={keyword} onChange={this.searchChangeHandler}/>
                        <label className="emoji-mart-sr-only"
                               htmlFor="emoji-mart-search-1">{i18n.t('dialog.search')}</label>
                        <button className="emoji-mart-search-icon" aria-label="Clear">
                            {loading && keyword.length > 0 ? <CircularProgress size={13} color="inherit"/> :
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 20 20"
                                     opacity="0.5">
                                    <path
                                        d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
                                </svg>}
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
                                return <div key={item.id} className="gif-item"
                                            onContextMenu={this.gifContextMenuHandler(index)}
                                            onClick={this.gifClickHandler(index)}>
                                    {!item.remote && <div className="more">
                                        <MoreVertRounded onClick={this.contextMenuHandler(index)}/>
                                    </div>}
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
                    <MenuItem onClick={this.moreCmdHandler('remove')}
                              className="context-item">{i18n.t('general.remove')}</MenuItem>
                </Menu>
            </div>
        );
    }

    private scrollbarRefHandler = (ref: any) => {
        this.scrollbarRef = ref;
    }

    private getGifContent(item: IGif, index: number) {
        const fileInput: SetOptional<InputFileLocation.AsObject, 'version'> = {
            accesshash: item.doc.accesshash,
            clusterid: item.doc.clusterid,
            fileid: item.doc.id,
        };
        if (item.downloaded) {
            return <CachedPhoto className="gif" fileLocation={fileInput} mimeType={item.doc.mimetype || 'image/jpeg'}/>;
        } else if (item.doc.thumbnail) {
            return <>
                <CachedPhoto className="blurred-gif" blur={10}
                             fileLocation={item.doc.thumbnail} mimeType="image/jpeg"
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
                    isRemote: false,
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
                    isRemote: false,
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
                this.searchDebounce.cancel();
                this.search();
            } else {
                this.searchDebounce();
            }
        });
    }

    private search = () => {
        const {keyword, isRemote} = this.state;
        if (keyword.length > 1) {
            this.searchGif(this.state.keyword);
        } else if (keyword.length === 0 && isRemote) {
            this.getList();
        }
    }

    private searchGif(keyword: string) {
        const {inputPeer} = this.props;
        if (inputPeer && !this.state.loading) {
            this.setState({
                loading: true,
            });
            this.gifRepo.searchRemote(inputPeer, keyword, '').then((res) => {
                this.botId = res.botId;
                this.setState({
                    isRemote: true,
                    list: res.list,
                    loading: false,
                }, this.checkAutoDownload);
            }).catch(() => {
                this.setState({
                    loading: false,
                });
            });
        }
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

    private moreCmdHandler = (cmd: string) => () => {
        const {list, moreIndex} = this.state;
        const item = list[moreIndex];
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
                if (moreIndex > -1) {
                    list.splice(moreIndex, 1);
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
        this.gifRepo.download(inputFile, item.doc.md5checksum || '', item.doc.filesize || 0, item.doc.mimetype || 'image/gif', item.remote).then((res) => {
            list[index].downloaded = true;
            this.setState({
                list,
            });
            const idx = this.downloadList.indexOf(item.id || '0');
            if (idx > -1) {
                this.downloadList.splice(idx, 1);
            }
        }).catch((err) => {
            window.console.warn(err);
        });
    }

    private gifClickHandler = (index: number) => () => {
        if (this.props.onSelect) {
            const {list} = this.state;
            const item = list[index];
            if (!item) {
                return;
            }
            if (!item.remote) {
                this.props.onSelect(item);
                this.gifRepo.useGif({
                    clusterid: item.doc.clusterid,
                    id: item.doc.id,
                });
            } else {
                this.props.onSelect(item, this.botId);
            }
        }
    }

    private scrollHandler = (e: any) => {
        if (!this.state.loading && this.hasMore && this.scrollbarRef && !this.state.isRemote) {
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
