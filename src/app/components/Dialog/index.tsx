/*
    Creation Time: 2018 - Aug - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import AutoSizer from "react-virtualized-auto-sizer";
import {Link} from 'react-router-dom';
import {debounce, intersectionBy, clone, differenceBy} from 'lodash';
import {IDialog} from '../../repository/dialog/interface';
import DialogMessage from '../DialogMessage';
import {LabelOutlined, LabelRounded, MessageRounded} from '@material-ui/icons';
import Menu from '@material-ui/core/Menu/Menu';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import {PeerType, TypingAction} from '../../services/sdk/messages/chat.core.types_pb';
import Scrollbars from 'react-custom-scrollbars';
import SearchRepo from '../../repository/search';
import IsMobile from '../../services/isMobile';
import Divider from '@material-ui/core/Divider/Divider';
import i18n from '../../services/i18n';
import {IUser} from "../../repository/user/interface";
import {isMuted} from "../UserInfoMenu";
import {FixedSizeList} from "react-window";
import getScrollbarWidth from "../../services/utilities/scrollbar_width";
import animateScrollTo from "animated-scroll-to";
import {getMessageTitle} from "./utils";
import UserRepo from "../../repository/user";
import ChipInput from "material-ui-chip-input";
import Chip from "@material-ui/core/Chip";
import LabelRepo from "../../repository/label";
import Broadcaster from "../../services/broadcaster";
import {ILabel} from "../../repository/label/interface";
import IconButton from "@material-ui/core/IconButton/IconButton";
import LabelPopover from "../LabelPopover";

import './style.scss';

interface IProps {
    cancelIsTyping: (id: string) => void;
    onContextMenu?: (cmd: string, dialog: IDialog) => void;
}

interface IState {
    appliedSelectedLabelIds: number[];
    ids: string[];
    items: IDialog[];
    labelActive: boolean;
    labelList: ILabel[];
    moreAnchorPos: any;
    moreIndex: number;
    searchAddedItems: IDialog[];
    searchEnable: boolean;
    searchItems: IDialog[];
    searchMessageItems: IDialog[];
    selectedId: string;
}

const listStyle: React.CSSProperties = {
    overflowX: 'visible',
    overflowY: 'visible',
};

class Dialog extends React.PureComponent<IProps, IState> {
    private list: FixedSizeList | undefined;
    private searchRepo: SearchRepo;
    private readonly searchDebounce: any;
    private keyword: string = '';
    private readonly isMobile: boolean = false;
    private readonly menuItem: any = {};
    private readonly rtl: boolean = false;
    private firstTimeLoad: boolean = true;
    private firstTimeTimeout: any = null;
    private readonly hasScrollbar: boolean = false;
    private containerRef: any;
    private isTypingList: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } } = {};
    private readonly userId: string = '';
    private labelRepo: LabelRepo;
    private labelMap: { [key: number]: number } = {};
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private labelPopoverRef: LabelPopover | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            appliedSelectedLabelIds: [],
            ids: [],
            items: [],
            labelActive: false,
            labelList: [],
            moreAnchorPos: null,
            moreIndex: -1,
            searchAddedItems: [],
            searchEnable: false,
            searchItems: [],
            searchMessageItems: [],
            selectedId: 'null',
        };

        this.searchRepo = SearchRepo.getInstance();
        this.searchDebounce = debounce(this.search, 512);
        this.isMobile = IsMobile.isAny();
        this.hasScrollbar = getScrollbarWidth() > 0;
        this.userId = UserRepo.getInstance().getCurrentUserId();
        this.labelRepo = LabelRepo.getInstance();
        this.broadcaster = Broadcaster.getInstance();


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
            8: {
                cmd: 'mute',
                title: i18n.t('peer_info.mute'),
            },
            9: {
                cmd: 'unmute',
                title: i18n.t('peer_info.unmute'),
            },
        };

        this.rtl = localStorage.getItem('river.lang.dir') === 'rtl';
    }

    public componentDidMount() {
        // const index = findIndex(this.state.items, {peerid: this.state.selectedId});
        // this.list.scrollToRow(index);
        this.getLabelList();
        this.eventReferences.push(this.broadcaster.listen('Label_DB_Updated', this.getLabelList));
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
    }


    public setSelectedId(id: string) {
        this.setState({
            selectedId: id,
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
            if (dialogs.length > 0) {
                this.firstTimeLoad = false;
                clearTimeout(this.firstTimeTimeout);
            } else if (this.firstTimeLoad) {
                this.firstTimeTimeout = setTimeout(() => {
                    this.firstTimeLoad = false;
                    this.forceUpdate();
                }, 5000);
            }
        });
    }

    public forceRender() {
        this.forceUpdate();
    }

    public setIsTypingList(isTypingList: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } }) {
        this.isTypingList = isTypingList;
        this.forceUpdate();
    }

    public toggleSearch() {
        this.setState({
            searchEnable: !this.state.searchEnable,
        }, () => {
            if (this.state.searchEnable) {
                this.searchDebounce.cancel();
                // this.keyword = '';
                this.setState({
                    appliedSelectedLabelIds: [],
                });
            } else {
                const el: any = document.querySelector('#dialog-search');
                if (el) {
                    // el.value = '';
                    el.focus();
                }
                this.filterItem();
            }
        });
    }

    public scrollTop() {
        // const el = document.querySelector((this.isMobile || !this.hasScrollbar) ? '.dialog-container' : '.dialogs-inner > div > div:first-child');
        const el = document.querySelector('.dialogs-inner > div > div:first-child');
        if (el) {
            const options: any = {
                // duration of the scroll per 1000px, default 500
                speed: 500,

                // minimum duration of the scroll
                minDuration: 128,

                // maximum duration of the scroll
                maxDuration: 256,

                // @ts-ignore
                element: el,

                // Additional offset value that gets added to the desiredOffset.  This is
                // useful when passing a DOM object as the desiredOffset and wanting to adjust
                // for an fixed nav or to add some padding.
                offset: 0,

                // should animated scroll be canceled on user scroll/keypress
                // if set to "false" user input will be disabled until animated scroll is complete
                // (when set to false, "passive" will be also set to "false" to prevent Chrome errors)
                cancelOnUserAction: true,

                // Set passive event Listeners to be true by default. Stops Chrome from complaining.
                passive: true,

                // Scroll horizontally rather than vertically (which is the default)
                horizontal: false,
            };
            animateScrollTo(0, options);
        }
    }

    public render() {
        const {moreAnchorPos, appliedSelectedLabelIds, searchEnable, labelActive} = this.state;
        return (
            <div className="dialogs">
                <div ref={this.containerRefHandler} className={'dialog-search' + (searchEnable ? ' open' : '')}>
                    <ChipInput
                        placeholder={i18n.t('dialog.search')}
                        className="search-chip-input"
                        id="dialog-search"
                        value={appliedSelectedLabelIds}
                        chipRenderer={this.chipRenderer}
                        fullWidth={true}
                        onUpdateInput={this.searchChangeHandler}
                        onDelete={this.removeItemHandler}
                        classes={{
                            'chip': 'chip-chip',
                            'chipContainer': 'chip-container',
                            'input': 'chip-input',
                            'inputRoot': 'chip-input-root',
                            'label': 'chip-label',
                            'root': 'chip-root',
                        }}
                        variant="outlined"
                    />
                    <div className="search-label">
                        <IconButton
                            onClick={this.labelOpenHandler}
                        >
                            {labelActive ? <LabelRounded/> : <LabelOutlined/>}
                        </IconButton>
                    </div>
                    {searchEnable && <LabelPopover ref={this.labelPopoverRefHandler} labelList={this.state.labelList}
                                                   onApply={this.labelPopoverApplyHandler}
                                                   onCancel={this.labelPopoverCancelHandler}/>}
                </div>
                <div className="dialog-list">
                    {/*{this.getWrapper()}*/}
                    <AutoSizer>
                        {({width, height}: any) => (
                            <div className="dialogs-inner" style={{
                                height: height + 'px',
                                width: width + 'px',
                            }}>
                                <Scrollbars
                                    autoHide={true}
                                    style={{
                                        height: height + 'px',
                                        width: width + 'px',
                                    }}
                                    hideTracksWhenNotNeeded={true}
                                    universal={true}
                                    rtl={!this.rtl}
                                >
                                    <div className="dialog-container">
                                        {this.getContent()}
                                    </div>
                                </Scrollbars>
                            </div>
                        )}
                    </AutoSizer>
                </div>
                <Menu
                    anchorReference="anchorPosition"
                    anchorPosition={moreAnchorPos}
                    open={Boolean(moreAnchorPos)}
                    onClose={this.moreCloseHandler}
                    className="kk-context-menu"
                >
                    {this.contextMenuItem()}
                </Menu>
            </div>
        );
    }

    private labelPopoverRefHandler = (ref: any) => {
        this.labelPopoverRef = ref;
    }

    private getContent() {
        const {searchItems, searchAddedItems, searchMessageItems, appliedSelectedLabelIds} = this.state;
        if ((searchItems.length + searchAddedItems.length + searchMessageItems.length) === 0) {
            return this.noRowsRenderer();
        } else {
            return (<>
                {Boolean(appliedSelectedLabelIds.length === 0) && <>
                    {searchItems.map((dialog, index) => {
                        const isTyping = this.isTypingList.hasOwnProperty(dialog.peerid || '') ? this.isTypingList[dialog.peerid || ''] : {};
                        return (
                            <DialogMessage key={dialog.peerid || index} dialog={dialog}
                                           isTyping={isTyping} selectedId={this.state.selectedId}
                                           onContextMenuOpen={this.contextMenuOpenHandler(index)}/>
                        );
                    })}
                    {searchAddedItems.map((dialog, index) => {
                        return (
                            <DialogMessage key={dialog.peerid || index} dialog={dialog}
                                           isTyping={{}} selectedId={this.state.selectedId}/>
                        );
                    })}
                </>}
                {Boolean(searchMessageItems.length > 0) &&
                <div className="search-label">{i18n.t('dialog.messages')}</div>}
                {searchMessageItems.map((dialog, index) => {
                    return (
                        <DialogMessage key={dialog.topmessageid || dialog.peerid || index}
                                       dialog={dialog} isTyping={{}} selectedId=""
                                       messageId={dialog.topmessageid}/>
                    );
                })}
            </>);
        }
    }

    // @ts-ignore
    private getWrapper() {
        const {searchItems, searchAddedItems} = this.state;
        if ((searchItems.length + searchAddedItems.length) === 0) {
            return (<div className="dialog-container">{this.noRowsRenderer()}</div>);
        } else {
            if (this.isMobile || !this.hasScrollbar) {
                return (
                    <AutoSizer>
                        {({width, height}: any) => {
                            return (<FixedSizeList
                                ref={this.refHandler}
                                itemSize={64}
                                itemCount={searchItems.length + searchAddedItems.length}
                                overscanCount={30}
                                width={width}
                                height={height}
                                className="dialog-container"
                                direction={this.rtl ? 'ltr' : 'rtl'}
                            >
                                {({index, style}) => {
                                    return this.rowRender({index, style, key: index});
                                }}
                            </FixedSizeList>);
                        }}
                    </AutoSizer>
                );
            } else {
                return (
                    <AutoSizer>
                        {({width, height}: any) => (
                            <div className="dialogs-inner" style={{
                                height: height + 'px',
                                width: width + 'px',
                            }}>
                                <Scrollbars
                                    autoHide={true}
                                    style={{
                                        height: height + 'px',
                                        width: width + 'px',
                                    }}
                                    onScroll={this.handleScroll}
                                    hideTracksWhenNotNeeded={true}
                                    universal={true}
                                    rtl={!this.rtl}
                                >
                                    <FixedSizeList
                                        ref={this.refHandler}
                                        itemSize={64}
                                        itemCount={searchItems.length + searchAddedItems.length}
                                        overscanCount={30}
                                        width={width}
                                        height={height}
                                        className="dialog-container"
                                        style={listStyle}
                                    >
                                        {({index, style}) => {
                                            return this.rowRender({index, style, key: index});
                                        }}
                                    </FixedSizeList>
                                </Scrollbars>
                            </div>
                        )}
                    </AutoSizer>
                );
            }
        }
    }

    /* Custom Scrollbars handler */
    private handleScroll = (e: any) => {
        const {scrollTop} = e.target;
        if (this.list) {
            this.list.scrollTo(scrollTop);
        }
    }

    private refHandler = (ref: any) => {
        this.list = ref;
    }

    private rowRender = ({index, key, style}: any): any => {
        if (this.state.searchItems.length > index) {
            const dialog = this.state.searchItems[index];
            const isTyping = this.isTypingList.hasOwnProperty(dialog.peerid || '') ? this.isTypingList[dialog.peerid || ''] : {};
            return (
                <div style={style} key={dialog.peerid || key}>
                    <Link to={`/chat/${dialog.peerid}`}>
                        <div
                            className={'dialog' + (dialog.peerid === this.state.selectedId ? ' active' : '') + (dialog.pinned ? ' pinned' : '')}>
                            <DialogMessage dialog={dialog} isTyping={isTyping}
                                           onContextMenuOpen={this.contextMenuOpenHandler(index)} selectedId=""/>
                        </div>
                    </Link>
                </div>
            );
        } else {
            const dialog = this.state.searchAddedItems[(this.state.searchItems.length - index) + 1];
            if (dialog) {
                return (
                    <div style={style} key={dialog.peerid || key} onClick={this.closeSearchHandler}>
                        <Link to={`/chat/${dialog.peerid}`}>
                            <div className="dialog">
                                <DialogMessage dialog={dialog} isTyping={{}} selectedId=""/>
                            </div>
                        </Link>
                    </div>
                );
            } else {
                return '';
            }
        }
    }

    /* No Rows Renderer */
    private noRowsRenderer = () => {
        if (this.firstTimeLoad) {
            return (
                <div className="no-result skeleton-wrapper">
                    {[0, 0, 0, 0, 0, 0, 0].map((i, key) => (
                        <div key={key} className="dialog-skeleton">
                            <div className="skeleton-avatar"/>
                            <div className="skeleton-name"/>
                            <div className="skeleton-preview"/>
                            <div className="skeleton-date"/>
                        </div>)
                    )}
                </div>);
        }
        return (
            <div className="no-result">
                <MessageRounded/>
                {i18n.t('dialog.compose_a_new_message')}
            </div>);
    }

    /* Context menu open handler */
    private contextMenuOpenHandler = (index: number) => (e: any) => {
        const {searchItems} = this.state;
        if (!searchItems || index === -1) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const rect = e.target.getBoundingClientRect();
        this.setState({
            moreAnchorPos: {
                left: rect.left,
                top: rect.top,
            },
            moreIndex: index,
        });
    }

    /* Context menu close handler */
    private moreCloseHandler = () => {
        this.setState({
            moreAnchorPos: null,
        });
    }

    /* Context menu items renderer */
    private contextMenuItem() {
        const {searchItems, moreIndex} = this.state;
        if (!searchItems[moreIndex]) {
            return '';
        }
        const menuTypes = {
            1: [4, 8, 9, 0, 6, 7, 0, 1, 5],
            2: [8, 9, 0, 1, 0, 6, 7, 0, 2],
        };
        const menuItems: any[] = [];
        const peerType = searchItems[moreIndex].peertype;
        const dialog = this.state.items[moreIndex];
        if (!dialog) {
            return;
        }
        const muted = isMuted(dialog.notifysettings);
        if (peerType === PeerType.PEERUSER) {
            menuTypes[1].forEach((key) => {
                if (key === 6 || key === 7) {
                    if (key === 6 && !dialog.pinned) {
                        menuItems.push(this.menuItem[key]);
                    } else if (key === 7 && dialog.pinned) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 8 || key === 9) {
                    if (key === 8 && !muted) {
                        menuItems.push(this.menuItem[key]);
                    } else if (key === 9 && muted) {
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
                } else if (key === 8 || key === 9) {
                    if (key === 8 && !muted) {
                        menuItems.push(this.menuItem[key]);
                    } else if (key === 9 && muted) {
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
                return (<MenuItem key={key} onClick={this.moreCmdHandler(item.cmd, dialog)}
                                  className="context-item" style={style}>{item.title}</MenuItem>);
            }
        });
    }

    private moreCmdHandler = (cmd: string, dialog: IDialog) => (e: any) => {
        e.stopPropagation();
        if (this.props.onContextMenu && dialog) {
            this.props.onContextMenu(cmd, dialog);
        }
        this.setState({
            moreAnchorPos: null,
        });
    }

    private searchChangeHandler = (e: any) => {
        const text = e.currentTarget.value;
        if (!this.state.searchEnable || text.length === 0) {
            this.searchDebounce.cancel();
            this.keyword = '';
            this.setState({
                ids: [],
                searchMessageItems: [],
            }, () => {
                this.filterItem();
            });
        } else {
            this.searchDebounce(text);
        }
    }

    private search = (keyword: string) => {
        this.keyword = keyword;
        const {appliedSelectedLabelIds} = this.state;
        if (appliedSelectedLabelIds.length === 0) {
            this.searchRepo.search({keyword, limit: 100}).then((res) => {
                this.setState({
                    ids: res.dialogs.map(o => (o.peerid || '')),
                }, () => {
                    this.filterItem(res.contacts);
                });
            });
        }
        this.searchRepo.searchAllMessages({keyword, labelIds: appliedSelectedLabelIds}, {}).then((res) => {
            const searchMessageItems: IDialog[] = res.map((msg) => {
                const messageTitle = getMessageTitle(msg);
                return {
                    label_ids: msg.labelidsList,
                    last_update: msg.createdon,
                    only_contact: true,
                    peerid: msg.peerid,
                    peertype: msg.peertype,
                    preview: messageTitle.text,
                    preview_icon: messageTitle.icon,
                    preview_me: msg.me,
                    preview_rtl: msg.rtl,
                    saved_messages: msg.peerid === this.userId,
                    sender_id: msg.senderid,
                    topmessageid: msg.id,
                };
            });
            this.setState({
                searchMessageItems,
            });
        });
    }

    private filterItem(users?: IUser[]) {
        const {ids, items} = this.state;
        let searchItems: IDialog[] = [];
        let searchAddedItems: IDialog[] = [];
        if ((ids.length === 0 && this.keyword.length === 0) || !this.state.searchEnable) {
            searchItems = clone(items);
        } else {
            const peerIds = ids.map((id) => {
                return {
                    peerid: id,
                };
            });
            searchItems = intersectionBy(items, peerIds, 'peerid');
            const noMessageText = i18n.t('general.no_message');
            searchAddedItems = (users ? users.map((u) => {
                return {
                    accesshash: u.accesshash,
                    only_contact: true,
                    peerid: u.id,
                    peertype: PeerType.PEERUSER,
                    preview: noMessageText,
                    preview_me: false,
                };
            }) : []);
            searchAddedItems = differenceBy(searchAddedItems, searchItems, 'peerid');
        }
        this.setState({
            searchAddedItems,
            searchItems,
        });
    }

    /* Search close handler */
    private closeSearchHandler = () => {
        this.toggleSearch();
        this.setState({
            searchAddedItems: [],
            searchMessageItems: [],
        });
        if (this.containerRef) {
            const el = this.containerRef.querySelector('input');
            if (el) {
                el.value = '';
            }
        }
    }

    private containerRefHandler = (ref: any) => {
        this.containerRef = ref;
    }

    private getLabelList = () => {
        this.labelRepo.search({}).then((res) => {
            res.forEach((item, key) => {
                this.labelMap[item.id || 0] = key;
            });
            this.setState({
                labelList: res,
            });
        });
    }

    private chipRenderer = ({value, text}: any, key: any): React.ReactNode => {
        if (this.labelMap.hasOwnProperty(value)) {
            const index = this.labelMap[value];
            const label = this.state.labelList[index];
            return (
                <Chip key={key} avatar={<LabelRounded style={{color: label.colour}}/>} tabIndex={-1} label={label.name}
                      onDelete={this.removeItemHandler(value)} className="chip"/>);
        }
        return (<span/>);
    }

    private removeItemHandler = (id: number) => (e: any) => {
        const {appliedSelectedLabelIds} = this.state;
        const index = appliedSelectedLabelIds.indexOf(id);
        if (index > -1) {
            appliedSelectedLabelIds.splice(index, 1);
            this.setState({
                appliedSelectedLabelIds,
            }, () => {
                this.search('');
            });
        }
    }

    private labelOpenHandler = (e: any) => {
        if (!this.labelPopoverRef) {
            return;
        }
        const rect = e.target.getBoundingClientRect();
        this.labelPopoverRef.open({
            left: rect.left - 126,
            top: rect.top + 30,
        }, clone(this.state.appliedSelectedLabelIds));
        this.setState({
            labelActive: true,
        });
    }

    private labelPopoverApplyHandler = (ids: number[]) => {
        this.setState({
            appliedSelectedLabelIds: ids,
        }, () => {
            this.search(this.keyword);
        });
    }

    private labelPopoverCancelHandler = () => {
        this.setState({
            labelActive: false,
        });
    }
}

export default Dialog;