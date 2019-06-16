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
import {PeerType, TypingAction} from '../../services/sdk/messages/chat.core.types_pb';
import Scrollbars from 'react-custom-scrollbars';
import SearchRepo from '../../repository/search';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import Input from '@material-ui/core/Input/Input';
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment';
import IconButton from '@material-ui/core/IconButton/IconButton';
import FormControl from '@material-ui/core/FormControl/FormControl';
import IsMobile from '../../services/isMobile';
import Divider from '@material-ui/core/Divider/Divider';
import i18n from '../../services/i18n';

import './style.css';

interface IProps {
    cancelIsTyping: (id: string) => void;
    onContextMenu?: (cmd: string, dialog: IDialog) => void;
    selectedId: string;
}

interface IState {
    ids: string[];
    isTypingList: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } };
    items: IDialog[];
    moreAnchorEl: any;
    moreIndex: number;
    searchEnable: boolean;
    searchItems: IDialog[];
    selectedId: string;
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
    private readonly isMobile: boolean = false;
    private readonly menuItem: any = {};

    constructor(props: IProps) {
        super(props);

        this.state = {
            ids: [],
            isTypingList: {},
            items: [],
            moreAnchorEl: null,
            moreIndex: -1,
            searchEnable: false,
            searchItems: [],
            selectedId: props.selectedId,
        };

        this.searchRepo = SearchRepo.getInstance();
        this.searchDebounce = debounce(this.search, 512);
        this.isMobile = IsMobile.isAny();

        this.menuItem = {
            0: {
                cmd: 'divider',
                title: '',
            },
            1: {
                cmd: 'clear',
                title: i18n.t('dialog.clear_history'),
            },
            2: {
                cmd: 'remove',
                color: '#cc0000',
                title: i18n.t('dialog.delete_and_exit'),
            },
            3: {
                cmd: 'block',
                color: '#cc0000',
                title: i18n.t('dialog.block'),
            },
            4: {
                cmd: 'info',
                title: i18n.t('dialog.info'),
            },
            5: {
                cmd: 'remove',
                color: '#cc0000',
                title: i18n.t('dialog.remove'),
            },
            6: {
                cmd: 'pin',
                title: i18n.t('dialog.pin'),
            },
            7: {
                cmd: 'unpin',
                title: i18n.t('dialog.unpin'),
            },
        };
    }

    public componentDidMount() {
        // const index = findIndex(this.state.items, {peerid: this.state.selectedId});
        // this.list.scrollToRow(index);
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            selectedId: newProps.selectedId,
        }, () => {
            this.filterItem();
        });
    }

    public setDialogs(dialogs: IDialog[], callback?: () => void) {
        this.setState({
            items: dialogs,
        }, () => {
            this.filterItem();
            if (callback) {
                callback();
            }
        });
    }

    public setIsTypingList(isTypingList: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } }) {
        this.setState({
            isTypingList,
        }, () => {
            this.list.forceUpdateGrid();
        });
    }

    public toggleSearch() {
        this.setState({
            searchEnable: !this.state.searchEnable,
        }, () => {
            if (!this.state.searchEnable) {
                this.searchDebounce.cancel();
                // this.keyword = '';
                this.filterItem();
            } else {
                const el: any = document.querySelector('#dialog-search');
                if (el) {
                    // el.value = '';
                    el.focus();
                }
            }
        });
    }

    public render() {
        const {searchEnable, moreAnchorEl} = this.state;
        return (
            <div className="dialogs">
                <div className={'dialog-search' + (searchEnable ? ' open' : '')}>
                    <FormControl fullWidth={true} className="title-edit">
                        <InputLabel htmlFor="dialog-search">{i18n.t('dialog.search')}</InputLabel>
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
                    {this.getWrapper()}
                </div>
                <Menu
                    anchorEl={moreAnchorEl}
                    open={Boolean(moreAnchorEl)}
                    onClose={this.moreCloseHandler}
                    className="kk-context-menu"
                >
                    {this.contextMenuItem()}
                </Menu>
            </div>
        );
    }

    private getWrapper() {
        const {searchItems} = this.state;
        if (this.isMobile) {
            return (
                <AutoSizer>
                    {({width, height}: any) => (
                        <List
                            ref={this.refHandler}
                            rowHeight={64}
                            rowRenderer={this.rowRender}
                            rowCount={searchItems.length}
                            overscanRowCount={30}
                            width={width}
                            height={height}
                            className="dialog-container"
                            noRowsRenderer={this.noRowsRenderer}
                        />
                    )}
                </AutoSizer>
            );
        } else {
            return (
                <AutoSizer>
                    {({width, height}: any) => (
                        <div>
                            <Scrollbars
                                autoHide={true}
                                style={{
                                    height: height + 'px',
                                    width: width + 'px',
                                }}
                                onScroll={this.handleScroll}
                                hideTracksWhenNotNeeded={true}
                                rtl={true}
                            >
                                <List
                                    ref={this.refHandler}
                                    rowHeight={64}
                                    rowRenderer={this.rowRender}
                                    rowCount={searchItems.length}
                                    overscanRowCount={30}
                                    width={width}
                                    height={height}
                                    className="dialog-container"
                                    noRowsRenderer={this.noRowsRenderer}
                                    style={listStyle}
                                />
                            </Scrollbars>
                        </div>
                    )}
                </AutoSizer>
            );
        }
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
        const dialog = this.state.searchItems[index];
        const isTyping = this.state.isTypingList.hasOwnProperty(dialog.peerid || '') ? this.state.isTypingList[dialog.peerid || ''] : {};
        return (
            <div style={style} key={dialog.peerid || key}>
                <Link to={`/chat/${dialog.peerid}`}>
                    <div
                        className={'dialog' + (dialog.peerid === this.state.selectedId ? ' active' : '') + (dialog.pinned ? ' pinned' : '')}>
                        <DialogMessage dialog={dialog} isTyping={isTyping}
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
                {i18n.t('dialog.compose_a_new_message')}
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
        const menuTypes = {
            1: [4, 0, 6, 7, 0, 1, 5],
            2: [1, 0, 6, 7, 0, 2],
        };
        const menuItems: any[] = [];
        const peerType = searchItems[moreIndex].peertype;
        const dialog = this.state.items[moreIndex];
        if (!dialog) {
            return;
        }
        if (peerType === PeerType.PEERUSER) {
            menuTypes[1].forEach((key) => {
                if (key === 6 || key === 7) {
                    if (key === 6 && !dialog.pinned) {
                        menuItems.push(this.menuItem[key]);
                    } else if (key === 7 && dialog.pinned) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else {
                    menuItems.push(this.menuItem[key]);
                }
            });
        } else if (peerType === PeerType.PEERGROUP) {
            menuTypes[2].forEach((key) => {
                if (key === 6 || key === 7) {
                    if (key === 6 && !dialog.pinned) {
                        menuItems.push(this.menuItem[key]);
                    } else if (key === 7 && dialog.pinned) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else {
                    menuItems.push(this.menuItem[key]);
                }
            });
        }
        return menuItems.map((item, key) => {
            let style = {};
            if (item.color) {
                style = {
                    color: item.color,
                };
            }
            if (item.cmd === 'divider') {
                return (<Divider key={key}/>);
            } else {
                return (<MenuItem key={key} onClick={this.moreCmdHandler.bind(this, item.cmd, dialog)}
                                  className="context-item" style={style}>{item.title}</MenuItem>);
            }
        });
    }

    private moreCmdHandler = (cmd: string, dialog: IDialog, e: any) => {
        e.stopPropagation();
        if (this.props.onContextMenu && dialog) {
            this.props.onContextMenu(cmd, dialog);
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
        });
    }

    /* Search close handler */
    private closeSearchHandler = () => {
        this.toggleSearch();
    }
}

export default Dialog;
