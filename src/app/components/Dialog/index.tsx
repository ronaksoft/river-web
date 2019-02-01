/*
    Creation Time: 2018 - Aug - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {List, AutoSizer} from 'react-virtualized';
import {Link} from 'react-router-dom';
import {debounce, intersectionBy, clone} from 'lodash';
import {IDialog} from '../../repository/dialog/interface';
import DialogMessage from '../DialogMessage';
import {CloseRounded, MessageRounded} from '@material-ui/icons';
import Menu from '@material-ui/core/Menu/Menu';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import {PeerType, TypingAction} from '../../services/sdk/messages/core.types_pb';
import Scrollbars from 'react-custom-scrollbars';
import SearchRepo from '../../repository/search';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import Input from '@material-ui/core/Input/Input';
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment';
import IconButton from '@material-ui/core/IconButton/IconButton';
import FormControl from '@material-ui/core/FormControl/FormControl';

import './style.css';

interface IProps {
    cancelIsTyping: (id: string) => void;
    isTypingList: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } };
    items: IDialog[];
    onContextMenu?: (cmd: string, dialog: IDialog) => void;
    selectedId: string;
}

interface IState {
    ids: string[];
    isTypingList: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } };
    items: IDialog[];
    moreAnchorEl: any;
    moreIndex: number;
    selectedId: string;
    searchEnable: boolean;
    searchItems: IDialog[];
    scrollIndex: number;
}

const listStyle: React.CSSProperties = {
    overflowX: 'visible',
    overflowY: 'visible',
};

class Dialog extends React.Component<IProps, IState> {
    private list: List;
    private searchRepo: SearchRepo;
    private readonly searchDebounce: any;
    private keyword: string = '';

    constructor(props: IProps) {
        super(props);

        this.state = {
            ids: [],
            isTypingList: props.isTypingList,
            items: props.items,
            moreAnchorEl: null,
            moreIndex: -1,
            scrollIndex: -1,
            searchEnable: false,
            searchItems: clone(props.items),
            selectedId: props.selectedId,
        };

        this.searchRepo = SearchRepo.getInstance();
        this.searchDebounce = debounce(this.search, 512);
    }

    public componentDidMount() {
        this.list.recomputeRowHeights();
        this.list.forceUpdateGrid();
        // const index = findIndex(this.state.items, {peerid: this.state.selectedId});
        // this.list.scrollToRow(index);
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.items !== newProps.items) {
            this.setState({
                isTypingList: newProps.isTypingList,
                items: newProps.items,
                scrollIndex: -1,
                selectedId: newProps.selectedId,
            }, () => {
                this.filterItem();
            });
        } else {
            // const index = findIndex(this.state.items, {peerid: newProps.selectedId});
            this.setState({
                isTypingList: newProps.isTypingList,
                items: newProps.items,
                scrollIndex: -1,
                selectedId: newProps.selectedId,
            }, () => {
                this.filterItem();
            });
        }
    }

    public toggleSearch() {
        this.setState({
            searchEnable: !this.state.searchEnable,
        }, () => {
            if (!this.state.searchEnable) {
                this.searchDebounce.cancel();
                this.keyword = '';
                this.filterItem();
            } else {
                const el: any = document.querySelector('#dialog-search');
                if (el) {
                    el.value = '';
                    el.focus();
                }
            }
        });
    }

    public render() {
        const {searchItems, searchEnable, moreAnchorEl} = this.state;
        return (
            <div className="dialogs">
                <div className={'dialog-search' + (searchEnable ? ' open' : '')}>
                    <FormControl fullWidth={true} className="title-edit">
                        <InputLabel htmlFor="adornment-title">Search...</InputLabel>
                        <Input
                            id="dialog-search"
                            type="text"
                            inputProps={{
                                maxLength: 32,
                            }}
                            onChange={this.searchChangeHandler}
                            endAdornment={
                                <InputAdornment position="end" className="adornment">
                                    <IconButton
                                        aria-label="Confirm changes"
                                        onClick={this.closeSearchHandler}
                                    >
                                        <CloseRounded/>
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </FormControl>
                </div>
                <div className="dialog-list">
                    <AutoSizer>
                        {({width, height}: any) => (
                            <React.Fragment>
                                <Scrollbars
                                    autoHide={true}
                                    style={{
                                        height: height + 'px',
                                        width: width + 'px',
                                    }}
                                    onScroll={this.handleScroll}
                                >
                                    <List
                                        ref={this.refHandler}
                                        rowHeight={64}
                                        rowRenderer={this.rowRender}
                                        rowCount={searchItems.length}
                                        overscanRowCount={30}
                                        scrollToIndex={this.state.scrollIndex}
                                        width={width}
                                        height={height}
                                        className="dialog-container"
                                        noRowsRenderer={this.noRowsRenderer}
                                        style={listStyle}
                                    />
                                </Scrollbars>
                                <Menu
                                    anchorEl={moreAnchorEl}
                                    open={Boolean(moreAnchorEl)}
                                    onClose={this.moreCloseHandler}
                                    className="kk-context-menu"
                                >
                                    {this.contextMenuItem()}
                                </Menu>
                            </React.Fragment>
                        )}
                    </AutoSizer>
                </div>
            </div>
        );
    }

    /* Custom Scrollbars handler */
    private handleScroll = (e: any) => {
        const {scrollTop} = e.target;
        if (this.list.Grid) {
            this.list.Grid.handleScrollEvent({scrollTop});
        }
    }

    private refHandler = (value: any) => {
        this.list = value;
    }

    private rowRender = ({index, key, parent, style}: any): any => {
        const data = this.state.searchItems[index];
        const isTyping = this.state.isTypingList.hasOwnProperty(data.peerid || '') ? this.state.isTypingList[data.peerid || ''] : {};
        return (
            <div style={style} key={data.peerid || key}>
                <Link to={`/chat/${data.peerid}`}>
                    <div className={'dialog' + (data.peerid === this.state.selectedId ? ' active' : '')}>
                        <DialogMessage dialog={data} isTyping={isTyping}
                                       onContextMenuOpen={this.contextMenuOpenHandler.bind(this, index)}/>
                    </div>
                </Link>
            </div>
        );
    }

    private noRowsRenderer = () => {
        return (
            <div className="no-result">
                <MessageRounded/>
                compose a new message : )
            </div>);
    }

    /* Context menu open handler */
    private contextMenuOpenHandler = (index: number, e: any) => {
        const {searchItems} = this.state;
        if (!searchItems || index === -1) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            moreAnchorEl: e.currentTarget,
            moreIndex: index,
        });
    }

    /* Context menu close handler */
    private moreCloseHandler = () => {
        this.setState({
            moreAnchorEl: null,
        });
    }

    /* Context menu items renderer */
    private contextMenuItem() {
        const {searchItems, moreIndex} = this.state;
        if (!searchItems[moreIndex]) {
            return '';
        }
        const menuItem = {
            1: {
                cmd: 'clear',
                title: 'Clear history',
            },
            2: {
                cmd: 'remove',
                color: '#cc0000',
                title: 'Remove and Exit',
            },
            3: {
                cmd: 'block',
                color: '#cc0000',
                title: 'Block',
            },
            4: {
                cmd: 'info',
                title: 'Info',
            },
            5: {
                cmd: 'remove',
                color: '#cc0000',
                title: 'Remove',
            },
        };
        const menuTypes = {
            1: [4, 1, 3, 5],
            2: [1, 2],
        };
        const menuItems: any[] = [];
        const peerType = searchItems[moreIndex].peertype;

        if (peerType === PeerType.PEERUSER) {
            menuTypes[1].forEach((key) => {
                menuItems.push(menuItem[key]);
            });
        } else if (peerType === PeerType.PEERGROUP) {
            menuTypes[2].forEach((key) => {
                menuItems.push(menuItem[key]);
            });
        }
        return menuItems.map((item, index) => {
            let style = {};
            if (item.color) {
                style = {
                    color: item.color,
                };
            }
            return (<MenuItem key={index} onClick={this.moreCmdHandler.bind(this, item.cmd, moreIndex)}
                              className="context-item" style={style}>{item.title}</MenuItem>);
        });
    }

    private moreCmdHandler = (cmd: string, index: number, e: any) => {
        e.stopPropagation();
        if (this.props.onContextMenu && index > -1) {
            this.props.onContextMenu(cmd, this.state.items[index]);
        }
        this.setState({
            moreAnchorEl: null,
        });
    }

    private searchChangeHandler = (e: any) => {
        const text = e.currentTarget.value;
        if (!this.state.searchEnable || text.length === 0) {
            this.searchDebounce.cancel();
            this.keyword = '';
            this.setState({
                ids: [],
            }, () => {
                this.filterItem();
            });
        } else {
            this.searchDebounce(text);
        }
    }

    private search = (keyword: string) => {
        this.keyword = keyword;
        this.searchRepo.searchIds({keyword, limit: 100}).then((ids) => {
            this.setState({
                ids,
            }, () => {
                this.filterItem();
            });
        });
    }

    private filterItem(currentItems?: IDialog[]) {
        const {ids, items} = this.state;
        if (!currentItems) {
            currentItems = items;
        }
        let searchItems: IDialog[] = [];
        if (ids.length === 0 && this.keyword.length === 0 || !this.state.searchEnable) {
            searchItems = clone(currentItems);
        } else {
            const peerIds = ids.map((id) => {
                return {
                    peerid: id,
                };
            });
            searchItems = intersectionBy(currentItems, peerIds, 'peerid');
        }
        this.setState({
            searchItems,
        }, () => {
            this.list.recomputeRowHeights();
            this.list.forceUpdateGrid();
            this.list.scrollToPosition(0);
        });
    }

    /* Search close handler */
    private closeSearchHandler = () => {
        this.toggleSearch();
    }
}

export default Dialog;
