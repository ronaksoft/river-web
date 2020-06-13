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
import {InputAdornment} from "@material-ui/core";
import {MoreVert, SearchRounded} from "@material-ui/icons";
import TextField from "@material-ui/core/TextField";
import GifRepo from "../../repository/gif";
import {IGif} from "../../repository/gif/interface";
import CachedPhoto from "../CachedPhoto";
import {InputDocument, InputFileLocation} from "../../services/sdk/messages/core.types_pb";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import {findIndex} from 'lodash';

import './style.scss';
import FileDownloadProgress from "../FileDownloadProgress";

interface IProps {
    test?: boolean;
}

interface IState {
    list: IGif[];
    keyword: string;
    moreAnchorEl: any;
    moreAnchorPos: any;
    moreIndex: number;
}

class GifPicker extends React.Component<IProps, IState> {
    // public static getDerivedStateFromProps(props: IProps, state: IState) {
    //     return {
    //         selected: props.selected,
    //     };
    // }

    private gifRepo: GifRepo;
    private readonly searchThrottle: any;

    constructor(props: IProps) {
        super(props);

        this.state = {
            keyword: '',
            list: [],
            moreAnchorEl: null,
            moreAnchorPos: null,
            moreIndex: -1,
        };

        this.gifRepo = GifRepo.getInstance();
        this.searchThrottle = throttle(this.search, 512);
    }

    public componentDidMount() {
        this.getList();
    }

    public render() {
        const {list, keyword, moreAnchorEl, moreAnchorPos, moreIndex} = this.state;
        return (
            <div className="gif-picker">
                <div className="gif-search">
                    <TextField
                        placeholder={i18n.t('dialog.search')}
                        fullWidth={true}
                        InputProps={{
                            startAdornment:
                                <InputAdornment position="start" className="search-gif-adornment">
                                    <SearchRounded/>
                                </InputAdornment>
                        }}
                        value={keyword}
                        variant="outlined"
                        margin="dense"
                        onChange={this.searchChangeHandler}
                    />
                </div>
                <div className="gif-picker-list">
                    <Scrollbars hideTracksWhenNotNeeded={false} universal={true}>
                        <div className="slider" style={this.getHeight()}>
                            {list.map((item, index) => {
                                return <div key={index} className="gif-item"
                                            onContextMenu={this.messageContextMenuHandler(index)}>
                                    <div className="more">
                                        <MoreVert onClick={this.contextMenuHandler(index)}/>
                                    </div>
                                    {this.getGifContent(item)}
                                </div>;
                            })}
                        </div>
                    </Scrollbars>
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

    private getGifContent(gif: IGif) {
        const fileInput: InputFileLocation.AsObject = {
            accesshash: gif.doc.accesshash,
            clusterid: gif.doc.clusterid,
            fileid: gif.doc.id,
        };
        if (gif.downloaded) {
            return <CachedPhoto className="gif" blur={10} fileLocation={fileInput}/>;
        } else if (gif.doc.thumbnail) {
            return <>
                <CachedPhoto className="blurred-gif" blur={10}
                             fileLocation={gif.doc.thumbnail}
                />
                <FileDownloadProgress fileLocation={fileInput}/>
            </>;
        } else {
            return null;
        }
    }

    private getList() {
        this.gifRepo.list(0, 32, (list) => {
            this.setState({
                list,
            });
        }).then((list) => {
            if (list.length > 0) {
                this.setState({
                    list,
                });
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

    private messageContextMenuHandler = (index: number) => (e: any) => {
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
}

export default GifPicker;
