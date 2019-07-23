/*
    Creation Time: 2018 - Aug - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {AutoSizer, CellMeasurer, CellMeasurerCache, List} from 'react-virtualized';
import {IMessage} from '../../repository/message/interface';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {
    GroupPhoto, InputFileLocation, InputPeer, MediaType, MessageEntityType, PeerType,
} from '../../services/sdk/messages/chat.core.types_pb';
import {clone, throttle, findIndex, findLastIndex} from 'lodash';
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE} from '../../repository/message/consts';
import TimeUtility from '../../services/utilities/time';
import UserAvatar from '../UserAvatar';
import MessagePreview from '../MessagePreview';
import MessageStatus from '../MessageStatus';
import {MoreVert} from '@material-ui/icons';
import UserName from '../UserName';
import Checkbox from '@material-ui/core/Checkbox';
import MessageForwarded from '../MessageForwarded';
import MessageVoice from '../MessageVoice';
import RiverTime from '../../services/utilities/river_time';
import {ErrorRounded} from '@material-ui/icons';
import MessageFile from '../MessageFile';
import MessageContact from '../MessageContact';
import CachedPhoto from '../CachedPhoto';
import MessageMedia, {getContentSize} from '../MessageMedia';
import {MediaDocument} from '../../services/sdk/messages/chat.core.message.medias_pb';
import MessageLocation from '../MessageLocation';
import Broadcaster from '../../services/broadcaster';
import UserRepo from '../../repository/user';
import MessageAudio from '../MessageAudio';
import animateScrollTo from 'animated-scroll-to';
import ElectronService from '../../services/electron';
import i18n from '../../services/i18n';
import DocumentViewerService, {IDocument} from "../../services/documentViewerService";
import {Loading} from "../Loading";
import getScrollbarWidth from "../../services/utilities/scrollbar_width";

import './style.css';

interface IProps {
    contextMenu?: (cmd: string, id: IMessage) => void;
    onAttachmentAction?: (cmd: 'cancel' | 'cancel_download' | 'download' | 'view' | 'open' | 'read' | 'preview', message: IMessage) => void;
    onJumpToMessage: (id: number, e: any) => void;
    onLastMessage: (message: IMessage | null) => void;
    onLoadMoreAfter?: () => any;
    onLoadMoreAfterGap?: (id: number) => any;
    onLoadMoreBefore?: () => any;
    onSelectableChange: (selectable: boolean) => void;
    onSelectedIdsChange: (selectedIds: { [key: number]: number }) => void;
    onDrop: (files: File[]) => void;
    peer: InputPeer | null;
    readId: number;
    rendered?: (info: any) => void;
    selectable: boolean;
    selectedIds: { [key: number]: number };
    showDate?: (timestamp: number | null) => void;
    showNewMessage?: (visible: boolean) => void;
}

interface IState {
    items: IMessage[];
    loading: boolean;
    loadingOverlay: boolean;
    loadingPersist: boolean;
    moreAnchorEl: any;
    moreIndex: number;
    readIdInit: number;
    selectable: boolean;
    selectedIds: { [key: number]: number };
}

export const highlightMessage = (id: number) => {
    const el = document.querySelector(`.bubble-wrapper .bubble.b_${id}`);
    if (el) {
        el.classList.add('highlight');
        setTimeout(() => {
            if (el) {
                el.classList.remove('highlight');
            }
        }, 1050);
    }
};

export const highlightMessageText = (id: number, text: string) => {
    document.querySelectorAll(`.bubble-wrapper .bubble .bubble-body .inner.text-highlight`).forEach((elem) => {
        elem.remove();
    });
    if (id < 0 || !text) {
        return;
    }
    const wrapperEl = document.querySelector(`.bubble-wrapper .bubble.b_${id} .bubble-body`);
    const el = document.querySelector(`.bubble-wrapper .bubble.b_${id} .bubble-body .inner`);
    let className: string = 'inner text-highlight';
    if (el && wrapperEl && el.innerHTML && wrapperEl.parentElement) {
        if (el.classList.contains('rtl')) {
            className += ' rtl';
        } else {
            className += ' ltr';
        }

        text = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(text, 'ig');

        if (text.length > 0) {
            const fragment = document.createElement('div');
            const childPos = el.getBoundingClientRect();
            const parentPos = wrapperEl.parentElement.getBoundingClientRect();
            const childOffset = {
                left: childPos.left - parentPos.left,
                top: childPos.top - parentPos.top,
            };
            fragment.classList.value = className;
            fragment.style.height = `${childPos.height}px`;
            fragment.style.left = `${childOffset.left}px`;
            fragment.style.top = `${childOffset.top}px`;
            fragment.style.width = `${childPos.width}px`;
            fragment.innerHTML = el.innerHTML.replace(re, `<mark>$&</mark>`);
            wrapperEl.appendChild(fragment);
        }
    }
};

interface IStayInfo {
    id: number;
    offset: number;
}

class Message extends React.Component<IProps, IState> {
    public list: List;
    public cache: CellMeasurerCache;
    private listCount: number;
    private topOfList: boolean = false;
    private bottomOfList: boolean = true;
    private loadingTimeout: any = null;
    private scrollMode: 'none' | 'end' | 'stay';
    private messageScroll: {
        overscanStartIndex: number;
        overscanStopIndex: number;
        startIndex: number;
        stopIndex: number;
    } = {
        overscanStartIndex: 0,
        overscanStopIndex: 0,
        startIndex: 0,
        stopIndex: 0,
    };
    private riverTime: RiverTime;
    private isSimplified: boolean = false;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private readonly loadMoreAfterThrottle: any = null;
    private readonly loadMoreBeforeThrottle: any = null;
    private readonly fitListCompleteThrottle: any = null;
    private enableLoadBefore: boolean = false;
    private messageInnerRef: any = null;
    private messageSnapshotRef: any = null;
    private removeSnapshotTimeout: any = null;
    private dropZoneRef: any = null;
    private readId: number = 0;
    private firstTimeLoadAfter: boolean = true;
    private stayInfo: IStayInfo = {
        id: -1,
        offset: 0,
    };
    // @ts-ignore
    private topMessageId: number = 0;
    private disableScrolling: boolean = false;
    private scrollToIndex?: number;
    private scrollDownTimeout: any = null;
    private isElectron: boolean = ElectronService.isElectron();
    private readonly menuItem: any = {};
    private documentViewerService: DocumentViewerService;
    private enableLoadBeforeTimeout: any = null;
    private hasEnd: boolean = false;
    private scrollContainerEl: any;
    private readonly isMac: boolean = navigator.platform.indexOf('Mac') > -1;
    private scrollThumbRef: any = null;
    private scrollbar: {
        clickPos: number,
        clickScrollTop: number,
        clickTop: number,
        dragged: boolean,
        enable: boolean,
        width: number,
    } = {
        clickPos: 0,
        clickScrollTop: 0,
        clickTop: 0,
        dragged: false,
        enable: false,
        width: 0,
    };

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: [],
            loading: false,
            loadingOverlay: false,
            loadingPersist: false,
            moreAnchorEl: null,
            moreIndex: -1,
            readIdInit: -1,
            selectable: props.selectable,
            selectedIds: props.selectedIds,
        };

        this.readId = props.readId;
        this.riverTime = RiverTime.getInstance();
        this.cache = new CellMeasurerCache({
            fixedWidth: true,
            keyMapper: this.keyMapperHandler,
            minHeight: 41,
        });
        this.broadcaster = Broadcaster.getInstance();
        this.isSimplified = UserRepo.getInstance().getBubbleMode() === '5';
        this.loadMoreAfterThrottle = throttle(this.loadMoreAfter, 50);
        this.loadMoreBeforeThrottle = throttle(this.loadMoreBefore, 50);
        this.fitListCompleteThrottle = throttle(this.fitListComplete, 250);
        this.documentViewerService = DocumentViewerService.getInstance();

        this.scrollbar.width = getScrollbarWidth();
        if (this.scrollbar.width > 0) {
            this.scrollbar.width++;
        }

        if (this.scrollbar.width > 0) {
            this.scrollbar.enable = true;
            this.modifyScrollThumb();
        }

        this.menuItem = {
            1: {
                cmd: 'reply',
                title: i18n.t('general.reply'),
            },
            2: {
                cmd: 'forward',
                title: i18n.t('general.forward'),
            },
            3: {
                cmd: 'edit',
                title: i18n.t('general.edit'),
            },
            4: {
                cmd: 'remove',
                title: i18n.t('general.remove'),
            },
            5: {
                cmd: 'cancel',
                title: i18n.t('general.cancel'),
            },
            6: {
                cmd: 'resend',
                title: i18n.t('general.resend'),
            },
            7: {
                cmd: 'download',
                title: i18n.t('general.download'),
            },
            8: {
                cmd: 'save',
                title: i18n.t('general.save'),
            },
        };
    }

    public componentDidMount() {
        this.topOfList = false;
        this.eventReferences.push(this.broadcaster.listen('Theme_Changed', this.themeChangeHandler));
        window.addEventListener('mouseup', this.dragLeaveHandler, true);

        this.scrollContainerEl = document.querySelector('.messages-inner .chat.active-chat');
        if (this.scrollContainerEl) {
            this.scrollContainerEl.addEventListener('mousewheel', this.scrollHandler, true);
        }
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.readId !== newProps.readId) {
            this.readId = newProps.readId;
            // this.list.forceUpdateGrid();
        }
        if (this.state.selectable !== newProps.selectable || Object.keys(this.state.selectedIds).length !== Object.keys(newProps.selectedIds).length) {
            this.setState({
                selectable: newProps.selectable,
                selectedIds: newProps.selectedIds,
            }, () => {
                this.list.forceUpdateGrid();
            });
        }
    }

    public setTopMessage(topMessageId: number) {
        this.topMessageId = topMessageId;
    }

    public setMessages(items: IMessage[], callback?: () => void, noRemoveSnapshot?: boolean) {
        if (this.state.items !== items) {
            this.hasEnd = false;
            this.checkEnd(items);
            this.loadMoreAfterThrottle.cancel();
            this.fitListCompleteThrottle.cancel();
            // this.cache.clearAll();
            this.bottomOfList = true;
            this.topOfList = true;
            this.firstTimeLoadAfter = true;
            this.scrollToIndex = items.length - 1;
            setTimeout(() => {
                this.scrollToIndex = undefined;
            }, 300);
            if (!noRemoveSnapshot) {
                this.removeSnapshot();
            }
            this.setState({
                items,
                moreAnchorEl: null,
                moreIndex: -1,
                readIdInit: this.props.readId,
            }, () => {
                clearTimeout(this.enableLoadBeforeTimeout);
                this.enableLoadBefore = false;
                if (!noRemoveSnapshot) {
                    this.modifyScroll(items);
                }
                if (this.state.items.length > 0) {
                    this.props.onLastMessage(this.state.items[this.state.items.length - 1]);
                } else {
                    this.props.onLastMessage(null);
                }
                this.fitList();
                if (callback) {
                    callback();
                }
            });
            this.listCount = items.length;
        } else if (this.state.items === items && this.listCount !== items.length) {
            this.checkEnd(items);
            setTimeout(() => {
                this.fitList(true);
            }, 100);
            this.modifyScroll(items);
            this.listCount = items.length;
            if (this.state.items.length > 0) {
                this.props.onLastMessage(this.state.items[this.state.items.length - 1]);
            } else {
                this.props.onLastMessage(null);
            }
            this.list.forceUpdateGrid();
            this.forceUpdate();
            if (callback) {
                callback();
            }
        } else {
            if (callback) {
                callback();
            }
        }
    }

    public componentWillUnmount() {
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });
        window.removeEventListener('mouseup', this.dragLeaveHandler, true);
        if (this.scrollContainerEl) {
            this.scrollContainerEl.addEventListener('mousewheel', this.scrollHandler, true);
        }
    }

    public setLoading(loading: boolean, overlay?: boolean) {
        if (overlay) {
            this.setState({
                loadingOverlay: loading,
            });
        } else {
            const state: any = {
                loading,
            };
            if (loading) {
                state.loadingPersist = true;
            }
            if (!loading) {
                state.loadingOverlay = false;
            }
            this.setState(state, () => {
                if (this.state.loading) {
                    clearTimeout(this.loadingTimeout);
                    this.loadingTimeout = setTimeout(() => {
                        this.setState({
                            loadingPersist: false,
                        }, () => {
                            this.list.forceUpdateGrid();
                        });
                    }, 500);
                }
                this.list.forceUpdateGrid();
            });
        }
    }

    public animateToEnd(instant?: boolean) {
        const {items} = this.state;
        if (!items) {
            return;
        }
        let jump = false;
        if (items.length <= this.messageScroll.stopIndex) {
            jump = true;
        } else {
            for (let i = this.messageScroll.startIndex; i < items.length; i++) {
                if (items[i] && items[i].messagetype === C_MESSAGE_TYPE.Gap) {
                    jump = true;
                    break;
                }
            }
        }
        if (this.list && jump) {
            this.list.scrollToRow(items.length);
        } else {
            if (instant) {
                if (this.list) {
                    this.list.scrollToRow(items.length);
                    if (this.list) {
                        if (this.scrollContainerEl) {
                            const eldiv = this.scrollContainerEl.firstElementChild;
                            if (eldiv) {
                                this.list.scrollToPosition((eldiv.scrollHeight - this.scrollContainerEl.clientHeight) + 10);
                                setTimeout(() => {
                                    if (!this.isAtEnd()) {
                                        this.animateToEnd(true);
                                    }
                                }, 50);
                                if (items.length > 40) {
                                    this.setEnableBefore();
                                }
                            }
                        }
                    }
                }
            } else {
                clearTimeout(this.scrollDownTimeout);
                if (this.scrollContainerEl) {
                    const options: any = {
                        // duration of the scroll per 1000px, default 500
                        speed: 500,

                        // minimum duration of the scroll
                        minDuration: 250,

                        // maximum duration of the scroll
                        maxDuration: 300,

                        // @ts-ignore
                        element: this.scrollContainerEl,

                        // Additional offset value that gets added to the desiredOffset.  This is
                        // useful when passing a DOM object as the desiredOffset and wanting to adjust
                        // for an fixed nav or to add some padding.
                        offset: 10,

                        // should animated scroll be canceled on user scroll/keypress
                        // if set to "false" user input will be disabled until animated scroll is complete
                        // (when set to false, "passive" will be also set to "false" to prevent Chrome errors)
                        cancelOnUserAction: true,

                        // Set passive event Listeners to be true by default. Stops Chrome from complaining.
                        passive: true,

                        // Scroll horizontally rather than vertically (which is the default)
                        horizontal: false,

                        onComplete: () => {
                            if (!this.isAtEnd()) {
                                this.animateToEnd();
                            } else {
                                this.scrollDownTimeout = setTimeout(() => {
                                    if (!this.isAtEnd()) {
                                        this.animateToEnd();
                                    }
                                }, 200);
                            }
                        }
                    };
                    animateScrollTo(this.scrollContainerEl.scrollHeight + 50, options);
                }
            }
        }
    }

    public setScrollMode(mode: 'none' | 'end' | 'stay') {
        if (mode === 'stay') {
            this.getTopMessageOffset();
        }
        this.scrollMode = mode;
    }

    public keepView() {
        this.modifyScroll(this.state.items);
    }

    public fitList(instant?: boolean) {
        setTimeout(() => {
            if (!this.scrollContainerEl || !this.scrollContainerEl.style) {
                return;
            }
            if (this.state.items.length === 0) {
                this.scrollContainerEl.style.paddingTop = '0px';
                return;
            }
            const list = this.scrollContainerEl.firstElementChild;
            if (list) {
                const diff = (this.list.props.height - 8) - list.clientHeight;
                if (diff > 0) {
                    this.scrollContainerEl.style.paddingTop = diff + 'px';
                    if (this.props.onLoadMoreAfter) {
                        this.props.onLoadMoreAfter();
                    }
                    this.fitListCompleteThrottle();
                    if (diff > 8 && !instant) {
                        setTimeout(() => {
                            this.fitList(true);
                        }, 100);
                    }
                    return;
                }
            }
            this.scrollContainerEl.style.paddingTop = '0px';
            this.modifyScrollThumb();
        }, instant ? 0 : 10);
    }

    public takeSnapshot(noRemove?: boolean) {
        clearTimeout(this.removeSnapshotTimeout);
        if (!this.messageInnerRef || !this.messageSnapshotRef) {
            return;
        }
        let className: string = '';
        if (this.messageInnerRef.classList.contains('group')) {
            className = 'group';
        } else if (this.messageInnerRef.classList.contains('user')) {
            className = 'user';
        }
        this.messageSnapshotRef.classList.remove('group', 'user', 'hidden');
        this.messageSnapshotRef.classList.add(className);
        this.messageInnerRef.classList.add('hidden');
        this.messageSnapshotRef.innerHTML = this.messageInnerRef.innerHTML;
        const scrollEl = this.messageSnapshotRef.querySelector(' div > div');
        const scrollTop = this.getScrollTop();
        if (scrollEl && scrollTop !== null) {
            scrollEl.scrollTop = scrollTop;
        }
        if (!noRemove) {
            this.removeSnapshotTimeout = setTimeout(() => {
                this.removeSnapshot();
            }, 1600);
        }
    }

    public removeSnapshot(instant?: boolean | number) {
        this.enableScroll();
        const timeout = instant ? ((typeof instant === 'boolean') ? 0 : instant) : 10;
        setTimeout(() => {
            clearTimeout(this.removeSnapshotTimeout);
            if (!this.messageInnerRef || !this.messageSnapshotRef) {
                return;
            }
            this.messageInnerRef.classList.remove('hidden');
            this.messageSnapshotRef.classList.remove('group', 'user');
            this.messageSnapshotRef.classList.add('hidden');
            this.messageSnapshotRef.innerHTML = '';
        }, timeout);
    }

    public disableScroll() {
        this.disableScrolling = true;
        if (this.isMac && this.scrollContainerEl) {
            this.scrollContainerEl.style.overflow = 'hidden';
        }
    }

    public enableScroll() {
        this.disableScrolling = false;
        if (this.isMac && this.scrollContainerEl) {
            this.scrollContainerEl.style.overflow = 'hidden auto';
        }
    }

    public tryLoadBefore() {
        this.loadMoreBeforeThrottle(true);
    }

    public focusOnNewMessage() {
        const {items} = this.state;
        if (items) {
            const index = findLastIndex(items, {messagetype: C_MESSAGE_TYPE.NewMessage});
            if (index > -1 && this.list) {
                this.list.scrollToRow(index);
            }
        }
    }

    public render() {
        const {peer} = this.props;
        const {items, moreAnchorEl, selectable, loadingOverlay} = this.state;
        return (
            <AutoSizer>
                {({width, height}: any) => (
                    <div className="main-messages">
                        <div ref={this.messageInnerRefHandler}
                             className={'messages-inner ' + ((peer && peer.getType() === PeerType.PEERGROUP || this.isSimplified) ? 'group' : 'user') + (selectable ? ' selectable' : '')}
                             onDragEnter={this.dragEnterHandler} onDragEnd={this.dragLeaveHandler}
                             style={{height: `${height}px`, width: `${width}px`}}
                        >
                            <List
                                ref={this.refHandler}
                                deferredMeasurementCache={this.cache}
                                rowHeight={this.getHeight}
                                rowRenderer={this.rowRender}
                                rowCount={items.length}
                                overscanRowCount={this.isMac ? 10 : 40}
                                width={width + this.scrollbar.width}
                                height={height}
                                estimatedRowSize={41}
                                onRowsRendered={this.onRowsRenderedHandler}
                                noRowsRenderer={this.noRowsRenderer}
                                scrollToAlignment={(this.scrollToIndex || -1) > -1 ? 'end' : 'start'}
                                className="chat active-chat"
                                scrollToIndex={this.scrollToIndex}
                            />
                            {this.scrollbar.enable &&
                            <div className="kk-scrollbar-track" onMouseDown={this.scrollbarTrackDownHandler}>
                                <div ref={this.scrollbarThumbRefHandler} className="kk-scrollbar-thumb"
                                     onMouseDown={this.scrollbarThumbDownHandler}/>
                            </div>}
                            <Menu
                                anchorEl={moreAnchorEl}
                                open={Boolean(moreAnchorEl)}
                                onClose={this.moreCloseHandler}
                                className="kk-context-menu"
                            >
                                {this.contextMenuItem()}
                            </Menu>
                        </div>
                        <div ref={this.messageSnapshotRefHandler} className="messages-snapshot hidden"/>
                        <div ref={this.dropZoneRefHandler} className="messages-dropzone hidden"
                             onDrop={this.dragLeaveHandler}>
                            <div className="dropzone" onDrop={this.dropHandler}>
                                Drop your files here
                            </div>
                        </div>
                        {loadingOverlay && <div className="messages-overlay-loading">
                            <Loading/>
                        </div>}
                    </div>
                )}
            </AutoSizer>
        );
    }

    private getHeight = (params: { index: number }) => {
        const {items} = this.state;
        const height = this.cache.rowHeight(params);
        if (height === 41 && items[params.index]) {
            switch (items[params.index].messagetype) {
                case C_MESSAGE_TYPE.Picture:
                case C_MESSAGE_TYPE.Video:
                    const info = getContentSize(items[params.index]);
                    if (info) {
                        return info.height + 4;
                    }
            }
        }
        return height;
    }

    private contextMenuItem() {
        const {items, moreIndex} = this.state;
        if (!items[moreIndex]) {
            return '';
        }
        const menuTypes = {
            1: [1, 2, 3, 4, 7, 8],
            2: [1, 2, 4, 7, 8],
            3: [5, 6],
        };
        const menuItems: any[] = [];
        const id = items[moreIndex].id;
        const me = items[moreIndex].me;
        if (id && id < 0) {
            menuTypes[3].forEach((key) => {
                if (key === 6) {
                    if (items[moreIndex].error) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else {
                    menuItems.push(this.menuItem[key]);
                }
            });
        } else if (me === true && id && id > 0) {
            menuTypes[1].forEach((key) => {
                if (key === 3) {
                    if ((this.riverTime.now() - (items[moreIndex].createdon || 0)) < 86400 &&
                        (items[moreIndex].fwdsenderid === '0' || !items[moreIndex].fwdsenderid) &&
                        (items[moreIndex].messagetype === C_MESSAGE_TYPE.Normal || (items[moreIndex].messagetype || 0) === 0)
                    ) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 7) {
                    if (!items[moreIndex].downloaded && [C_MESSAGE_TYPE.File, C_MESSAGE_TYPE.Voice].indexOf(items[moreIndex].messagetype || 0) > -1) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 8) {
                    if (items[moreIndex].downloaded && [C_MESSAGE_TYPE.File, C_MESSAGE_TYPE.Voice].indexOf(items[moreIndex].messagetype || 0) > -1) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else {
                    menuItems.push(this.menuItem[key]);
                }
            });
        } else if (me === false && id && id > 0) {
            menuTypes[2].forEach((key) => {
                if (key === 7) {
                    if (!items[moreIndex].downloaded && [C_MESSAGE_TYPE.File, C_MESSAGE_TYPE.Voice].indexOf(items[moreIndex].messagetype || 0) > -1) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 8) {
                    if (items[moreIndex].downloaded && [C_MESSAGE_TYPE.File, C_MESSAGE_TYPE.Voice].indexOf(items[moreIndex].messagetype || 0) > -1) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else {
                    menuItems.push(this.menuItem[key]);
                }
            });
        }
        return menuItems.map((item, index) => {
            return (<MenuItem key={index} onClick={this.moreCmdHandler.bind(this, item.cmd, moreIndex)}
                              className="context-item">{item.title}</MenuItem>);
        });
    }

    private refHandler = (value: any) => {
        this.list = value;
    }

    private isAtEnd() {
        if (this.scrollContainerEl) {
            return (this.scrollContainerEl.clientHeight + this.scrollContainerEl.scrollTop + 2 >= this.scrollContainerEl.scrollHeight);
        } else {
            return true;
        }
    }

    private rowRender = ({index, key, parent, style}: any): any => {
        const message = this.state.items[index];
        return (
            <CellMeasurer
                cache={this.cache}
                columnIndex={0}
                key={key}
                rowIndex={index}
                parent={parent}>
                {({measure}) => {
                    return this.messageItem(index, message, this.props.peer, this.readId, style, measure);
                }}
            </CellMeasurer>
        );
    }

    private noRowsRenderer = () => {
        if (this.state.loading || this.state.loadingPersist) {
            return (<div className="chat-placeholder">
                <Loading/>
            </div>);
        } else {
            return (<div className="chat-placeholder">
                <div className="placeholder"/>
            </div>);
        }
    }

    private messageItem(index: number, message: IMessage, peer: InputPeer | null, readId: number, style: any, measureFn?: any) {
        if (!message) {
            return '';
        }
        const messageMedia: any = {
            ref: null,
        };
        const parentEl: any = {
            ref: null,
        };
        const parenElRefHandler = (ref: any) => {
            parentEl.ref = ref;
        };
        /* Bubble click handler */
        const bubbleClickHandler = () => {
            if (messageMedia.ref && messageMedia.ref.viewDocument) {
                messageMedia.ref.viewDocument();
            }
        };
        switch (message.messagetype) {
            case C_MESSAGE_TYPE.Hole:
            case C_MESSAGE_TYPE.End:
                return '';
            case C_MESSAGE_TYPE.Gap:
                return (<div style={style} className="bubble-gap">
                    <div className="gap">
                        {Boolean(this.state.loading || this.state.loadingPersist) && <div className="loading">
                            <span className="loader"/>
                        </div>}
                    </div>
                </div>);
            case C_MESSAGE_TYPE.NewMessage:
                return (
                    <div style={style} className="bubble-wrapper">
                        <span className="system-message divider">{i18n.t('message.unread_messages')}</span>
                    </div>
                );
            case C_MESSAGE_TYPE.Date:
                return (
                    <div style={style} className="bubble-wrapper date-padding">
                        {!Boolean((this.state.loading || this.state.loadingPersist) && index === 0) &&
                        <span className="date">{TimeUtility.dynamicDate(message.createdon || 0)}</span>}
                        {Boolean((this.state.loading || this.state.loadingPersist) && index === 0) &&
                        <div className="loading">
                            <span className="loader"/>
                        </div>}
                    </div>
                );
            case C_MESSAGE_TYPE.Normal:
            default:
                if (message.messageaction !== C_MESSAGE_ACTION.MessageActionNope && message.messageaction !== undefined) {
                    return (
                        <div style={style}
                             className={'bubble-wrapper' + (this.state.selectedIds.hasOwnProperty(message.id || 0) ? ' selected' : '')}
                             onClick={this.toggleSelectHandler.bind(this, message.id || 0, index)}
                             onDoubleClick={this.selectMessage.bind(this, index)}>
                            {this.state.selectable && <Checkbox
                                className={'checkbox ' + (this.state.selectedIds.hasOwnProperty(message.id || 0) ? 'checked' : '')}
                                color="primary" checked={this.state.selectedIds.hasOwnProperty(message.id || 0)}
                                onChange={this.selectMessageHandler.bind(this, message.id || 0, index)}/>}
                            {this.renderSystemMessage(message)}
                        </div>
                    );
                } else {
                    return (
                        <div style={style}
                             className={'bubble-wrapper _bubble' + (message.me && !this.isSimplified ? ' me' : ' you') + (message.avatar ? ' avatar' : '') + (this.state.selectedIds.hasOwnProperty(message.id || 0) ? ' selected' : '') + this.getMessageType(message) + ((message.me && message.error) ? ' has-error' : '')}
                             onClick={this.toggleSelectHandler.bind(this, message.id || 0, index)}
                             onDoubleClick={this.selectMessage.bind(this, index)}
                        >
                            {(!this.state.selectable && message.avatar && message.senderid) && (
                                <UserAvatar id={message.senderid} className="avatar"/>
                            )}
                            {this.state.selectable && <Checkbox
                                className={'checkbox ' + (this.state.selectedIds.hasOwnProperty(message.id || 0) ? 'checked' : '')}
                                color="primary" checked={this.state.selectedIds.hasOwnProperty(message.id || 0)}
                                onChange={this.selectMessageHandler.bind(this, message.id || 0, index)}/>}
                            {Boolean(message.avatar && message.senderid) && (<div className="arrow"/>)}
                            {Boolean(message.me && message.error) &&
                            <span className="error" onClick={this.contextMenuHandler.bind(this, index)}><ErrorRounded/></span>}
                            <div ref={parenElRefHandler}
                                 className={'bubble b_' + message.id + ((message.editedon || 0) > 0 ? ' edited' : '')}>
                                {Boolean((peer && peer.getType() === PeerType.PEERGROUP && message.avatar && !message.me) || (this.isSimplified && message.avatar)) &&
                                <UserName className="name" uniqueColor={true} id={message.senderid || ''}
                                          hideBadge={true} noDetail={this.state.selectable}/>}
                                {Boolean(message.replyto && message.replyto !== 0) &&
                                <MessagePreview message={message} peer={peer}
                                                onDoubleClick={this.moreCmdHandler.bind(this, 'reply', index)}
                                                onClick={this.props.onJumpToMessage.bind(this, message.replyto)}
                                                disableClick={this.state.selectable}
                                />}
                                {Boolean(message.fwdsenderid && message.fwdsenderid !== '0') &&
                                <MessageForwarded message={message} peer={peer}
                                                  onDoubleClick={this.moreCmdHandler.bind(this, 'reply', index)}/>}
                                <div className="bubble-body" onClick={bubbleClickHandler}>
                                    {this.renderMessageBody(message, peer, messageMedia, parentEl, measureFn)}
                                    <MessageStatus status={message.me || false} id={message.id} readId={readId}
                                                   time={message.createdon || 0} editedTime={message.editedon || 0}
                                                   onDoubleClick={this.moreCmdHandler.bind(this, 'reply', index)}/>
                                </div>
                                <div className="more" onClick={bubbleClickHandler}>
                                    <MoreVert onClick={this.contextMenuHandler.bind(this, index)}/>
                                </div>
                            </div>
                        </div>
                    );
                }
        }
    }

    private contextMenuHandler = (index: number, e: any) => {
        if (index === -1) {
            return;
        }
        e.stopPropagation();
        this.setState({
            moreAnchorEl: e.currentTarget,
            moreIndex: index,
        });
    }

    private moreCloseHandler = () => {
        this.setState({
            moreAnchorEl: null,
        });
    }

    private moreCmdHandler = (cmd: string, index: number, e: any) => {
        e.stopPropagation();
        if (this.props.contextMenu && index > -1) {
            this.props.contextMenu(cmd, this.state.items[index]);
        }
        if (cmd === 'forward') {
            this.selectMessageHandler(this.state.items[index].id || 0, index);
        }
        this.setState({
            moreAnchorEl: null,
        });
    }

    private selectMessage = (index: number, e: any) => {
        e.stopPropagation();
        if (!this.state.selectable) {
            this.setState({
                selectable: true,
            }, () => {
                this.props.onSelectableChange(true);
            });
        }
        this.selectMessageHandler(this.state.items[index].id || 0, index);
    }

    private onRowsRenderedHandler = (data: any) => {
        const {items} = this.state;
        if (items.length > 0 && data.startIndex > -1 && items[data.startIndex]) {
            // Show/Hide date
            if (this.props.showDate) {
                if ((items[data.startIndex] && items[data.startIndex].messagetype === C_MESSAGE_TYPE.Date) ||
                    ((items[data.startIndex + 1] && items[data.startIndex + 1].messagetype === C_MESSAGE_TYPE.Date))) {
                    this.props.showDate(null);
                } else {
                    this.props.showDate(items[data.startIndex].createdon || 0);
                }
            }

            if (this.props.showNewMessage) {
                if ((items[data.stopIndex] && items[data.stopIndex].messagetype === C_MESSAGE_TYPE.NewMessage) ||
                    ((items[data.stopIndex + 1] && items[data.stopIndex + 1].messagetype === C_MESSAGE_TYPE.NewMessage))) {
                    this.props.showNewMessage(true);
                } else {
                    this.props.showNewMessage(false);
                }
            }

            // On load more after or before
            if (data.stopIndex > -1 && items[data.stopIndex]) {
                let check = false;
                if (data.startIndex < 3) {
                    this.bottomOfList = false;
                }
                if (this.enableLoadBefore && !this.hasEnd) {
                    if (data.startIndex < 9 && this.props.onLoadMoreBefore) {
                        this.loadMoreBeforeThrottle();
                    } else {
                        this.topOfList = false;
                    }
                }
                if (Math.abs(items.length - data.stopIndex) < 4 && items[data.stopIndex].id && this.props.onLoadMoreAfter) {
                    this.loadMoreAfterThrottle();
                    this.topOfList = false;
                    check = true;
                } else {
                    this.bottomOfList = false;
                }
                if (!check && items[data.stopIndex].messagetype === C_MESSAGE_TYPE.Gap && items[data.stopIndex].id && this.props.onLoadMoreAfterGap) {
                    this.props.onLoadMoreAfterGap(items[data.stopIndex].id || 0);
                }
            }
        }

        this.messageScroll = data;

        if (this.props.rendered) {
            this.props.rendered(data);
        }
    }

    private loadMoreAfter = () => {
        if (!this.bottomOfList && this.props.onLoadMoreAfter) {
            setTimeout(() => {
                if (this.props.onLoadMoreAfter) {
                    this.props.onLoadMoreAfter();
                    this.firstTimeLoadAfter = false;
                }
            }, this.firstTimeLoadAfter ? 250 : 0);
            this.bottomOfList = true;
        }
    }

    private loadMoreBefore = (force?: boolean) => {
        if ((!this.topOfList || force) && this.props.onLoadMoreBefore) {
            this.props.onLoadMoreBefore();
            this.enableLoadBefore = false;
            this.topOfList = true;
            this.setEnableBefore();
        }
    }

    private selectText = (e: any) => {
        e.stopPropagation();
        const elem = e.currentTarget;
        // @ts-ignore
        if (document.selection) { // IE
            // @ts-ignore
            const range = document.body.createTextRange();
            if (range) {
                range.moveToElementText(elem);
                range.select();
            }
        } else if (window.getSelection) {
            const range = document.createRange();
            range.selectNode(elem);
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    private keyMapperHandler = (rowIndex: number, colIndex: number) => {
        return this.getKey(rowIndex, colIndex);
    }

    private getKey = (rowIndex: number, colIndex: number) => {
        const {items} = this.state;
        if (!items[rowIndex]) {
            return 'null';
        }
        return `${items[rowIndex].id || 0}-${colIndex}-${items[rowIndex].messagetype || 0}`;
    }

    private renderSystemMessage(message: IMessage) {
        switch (message.messageaction) {
            case C_MESSAGE_ACTION.MessageActionContactRegistered:
                return (<span className="system-message">
                    <UserName className="user" id={message.senderid || ''}/> {i18n.t('message.joined_river')}</span>);
            case C_MESSAGE_ACTION.MessageActionGroupCreated:
                return (<span className="system-message"><UserName className="sender" id={message.senderid || ''}
                                                                   you={true}/> {i18n.t('message.created_the_group')}</span>);
            case C_MESSAGE_ACTION.MessageActionGroupAddUser:
                if (!message.actiondata) {
                    return (<span className="system-message">
                        <UserName className="user" id={message.senderid || ''}
                                  you={true}/> {i18n.t('message.added_a_user')}</span>);
                } else {
                    return (<span className="system-message">
                        <UserName className="user" id={message.senderid || ''}
                                  you={true}/> {i18n.t('message.added')} {message.actiondata.useridsList.map((id: string, index: number) => {
                        return (
                            <span key={index}>
                                {index !== 0 ? ', ' : ''}
                                <UserName className="target-user" id={id} you={true}/></span>
                        );
                    })}</span>);
                }
            case C_MESSAGE_ACTION.MessageActionGroupDeleteUser:
                if (!message.actiondata) {
                    return (<span className="system-message"><UserName className="user" id={message.senderid || ''}
                                                                       you={true}/> {i18n.t('message.removed_a_user')}</span>);
                } else {
                    if (message.actiondata.useridsList.indexOf(message.senderid) > -1) {
                        return (
                            <span className="system-message"><UserName className="user" id={message.senderid || ''}
                                                                       you={true}/> {i18n.t('message.left')}</span>);
                    }
                    return (<span className="system-message">
                    <UserName className="user" id={message.senderid || ''}
                              you={true}/> {i18n.t('message.removed')} {message.actiondata.useridsList.map((id: string, index: number) => {
                        return (
                            <span key={index}>
                            {index !== 0 ? ', ' : ''}
                                <UserName className="target-user" id={id} you={true}/></span>
                        );
                    })}</span>);
                }
            case C_MESSAGE_ACTION.MessageActionGroupTitleChanged:
                if (!message.actiondata) {
                    return (<span className="system-message"><UserName className="user" id={message.senderid || ''}
                                                                       you={true}/> {i18n.t('message.changed_the_title')}</span>);
                } else {
                    return (<span className="system-message"><UserName className="user" id={message.senderid || ''}
                                                                       you={true}/> {i18n.tf('message.changed_the_title_to', message.actiondata.grouptitle)}</span>);
                }
            case C_MESSAGE_ACTION.MessageActionClearHistory:
                return (<span className="system-message">{i18n.t('message.history_cleared')}</span>);
            case C_MESSAGE_ACTION.MessageActionGroupPhotoChanged:
                if (!message.actiondata) {
                    return (<span className="system-message"><UserName className="user" id={message.senderid || ''}
                                                                       you={true}/> {i18n.t('message.removed_the_group_photo')}</span>);
                } else {
                    const photo: GroupPhoto.AsObject = message.actiondata.photo;
                    const fileLocation = new InputFileLocation();
                    fileLocation.setVersion(0);
                    fileLocation.setAccesshash(photo.photosmall.accesshash || '');
                    fileLocation.setFileid(photo.photosmall.fileid || '');
                    fileLocation.setClusterid(photo.photosmall.clusterid || 1);
                    if (!photo || !photo.photosmall.fileid || photo.photosmall.fileid === '') {
                        return (
                            <div className="system-message-with-picture">
                                <span className="system-message">
                                    <UserName className="user" id={message.senderid || ''}
                                              you={true}/> {i18n.t('message.removed_the_group_photo')}
                                </span>
                            </div>
                        );
                    } else {
                        return (
                            <div className="system-message-with-picture">
                                <span className="system-message">
                                    <UserName className="user" id={message.senderid || ''}
                                              you={true}/> {i18n.t('message.changed_the_group_photo')}
                                </span>
                                <CachedPhoto className="picture" fileLocation={fileLocation.toObject()}
                                             onClick={this.openAvatar.bind(this, photo)}/>
                            </div>
                        );
                    }
                }
            default:
                return (<span className="system-message">{i18n.t('message.unsupported_message')}</span>);
        }
    }

    /* Add/Remove selected id to selectedIds map */
    private selectMessageHandler = (id: number, index: number, e?: any) => {
        const {selectedIds} = this.state;
        if (!e || (e && e.currentTarget.checked)) {
            selectedIds[id] = index;
        } else {
            delete selectedIds[id];
        }
        this.setState({
            selectedIds,
        }, () => {
            this.props.onSelectedIdsChange(selectedIds);
            this.list.forceUpdateGrid();
        });
    }

    /* Toggle selected id in selectedIds map */
    private toggleSelectHandler = (id: number, index: number, e: any) => {
        if (!this.state.selectable) {
            return;
        }
        e.stopPropagation();
        const {selectedIds} = this.state;
        if (!selectedIds.hasOwnProperty(id)) {
            selectedIds[id] = index;
        } else {
            delete selectedIds[id];
        }
        this.setState({
            selectedIds,
        }, () => {
            this.props.onSelectedIdsChange(selectedIds);
            this.list.forceUpdateGrid();
        });
    }

    /* Render body based on entities */
    private renderBody(message: IMessage, measureFn?: any) {
        if (!message.entitiesList || message.entitiesList.length === 0) {
            return message.body;
        } else {
            const sortedEntities = clone(message.entitiesList);
            // Sort fragments from entities
            sortedEntities.sort((i1, i2) => {
                if (i1.offset === undefined || i2.offset === undefined) {
                    return 0;
                }
                return i1.offset - i2.offset;
            });
            const elems: any[] = [];
            const body = message.body || '';
            const bodyLen = body.length - 1;
            // Put fragments in order
            sortedEntities.forEach((entity, i) => {
                if (i === 0 && entity.offset !== 0) {
                    elems.push({
                        str: body.substr(0, entity.offset),
                        type: -1,
                    });
                }
                if (i > 0 && i < bodyLen && ((sortedEntities[i - 1].offset || 0) + (sortedEntities[i - 1].length || 0)) !== (entity.offset || 0)) {
                    elems.push({
                        str: body.substr((sortedEntities[i - 1].offset || 0) + (sortedEntities[i - 1].length || 0), (entity.offset || 0) - ((sortedEntities[i - 1].offset || 0) + (sortedEntities[i - 1].length || 0))),
                        type: -1,
                    });
                }
                elems.push({
                    str: body.substr(entity.offset || 0, (entity.length || 0)),
                    type: entity.type,
                    userId: entity.userid,
                });
                if (i === (sortedEntities.length - 1) && (bodyLen) !== (entity.offset || 0) + (entity.length || 0)) {
                    elems.push({
                        str: body.substr((entity.offset || 0) + (entity.length || 0)),
                        type: -1,
                    });
                }
            });
            const render = elems.map((elem, i) => {
                switch (elem.type) {
                    case MessageEntityType.MESSAGEENTITYTYPEMENTION:
                        if (elem.str.indexOf('@') === 0) {
                            return (
                                <UserName key={i} className="_mention" id={elem.userId} username={true} prefix="@"
                                          unsafe={true} defaultString={elem.str.substr(1)} onLoad={measureFn}/>);
                        } else {
                            return (<UserName key={i} className="_mention" id={elem.userId} unsafe={true}
                                              defaultString={elem.str} onLoad={measureFn}/>);
                        }
                    case MessageEntityType.MESSAGEENTITYTYPEBOLD:
                        return (<span key={i} className="_bold">{elem.str}</span>);
                    case MessageEntityType.MESSAGEENTITYTYPEITALIC:
                        return (<span key={i} className="_italic">{elem.str}</span>);
                    case MessageEntityType.MESSAGEENTITYTYPEEMAIL:
                        return (<span key={i} className="_mail">{elem.str}</span>);
                    case MessageEntityType.MESSAGEENTITYTYPEHASHTAG:
                        return (<span key={i} className="_hashtag">{elem.str}</span>);
                    case MessageEntityType.MESSAGEENTITYTYPEURL:
                        const url = this.modifyURL(elem.str);
                        if (this.isElectron) {
                            return (
                                <a key={i} href={url} onClick={this.openExternalLink.bind(this, url)}
                                   className="_url">{elem.str}</a>);
                        } else {
                            return (
                                <a key={i} href={url} target="_blank"
                                   className="_url">{elem.str}</a>);
                        }
                    default:
                        return (<span key={i}>{elem.str}</span>);
                }
            });
            return render;
        }
    }

    /* Modify URL */
    private modifyURL(url: string) {
        if (url.indexOf('http://') > -1 || url.indexOf('https://') > -1) {
            return url;
        } else {
            return `//${url}`;
        }
    }

    /* Modify scroll position based on scroll mode */
    private modifyScroll(items: IMessage[]) {
        switch (this.scrollMode) {
            case 'stay':
                const index = findIndex(items, {id: this.stayInfo.id});
                if (index > -1) {
                    if (!(this.messageScroll.overscanStartIndex <= index + 1 && this.messageScroll.overscanStopIndex >= index)) {
                        this.list.scrollToRow(index);
                    }
                    setTimeout(() => {
                        this.checkScroll(this.stayInfo.id, index);
                    }, 1);
                } else {
                    this.removeSnapshot();
                    this.setEnableBefore();
                }
                return;
            case 'end':
                this.animateToEnd(true);
                return;
            default:
                break;
        }
    }

    private getCellElem(id: number) {
        return document.querySelector(`.messages-inner .bubble-wrapper .bubble.b_${id}`);
    }

    private getCellTop(id: number) {
        const el = this.getCellElem(id);
        if (el && el.parentElement) {
            return parseInt(window.getComputedStyle(el.parentElement).getPropertyValue('top').replace(/^\D+/g, ''), 10);
        }
        return null;
    }

    private getScrollTop() {
        if (this.scrollContainerEl) {
            return this.scrollContainerEl.scrollTop;
        }
        return null;
    }

    private getTopMessageOffset() {
        const {items} = this.state;
        let index;
        for (index = this.messageScroll.startIndex; index < this.messageScroll.startIndex + 3; index++) {
            if (items[index].messagetype !== C_MESSAGE_TYPE.Date && items[index].messagetype !== C_MESSAGE_TYPE.NewMessage) {
                break;
            }
        }
        const cellTop = this.getCellTop(Math.floor(items[index].id || 0));
        const scrollTop = this.getScrollTop();
        if (cellTop !== null && scrollTop !== null) {
            this.stayInfo = {
                id: items[index].id || 0,
                offset: cellTop - scrollTop,
            };
        }
    }

    /* Try to find correct position */
    private checkScroll(id: number, index: number, tries?: number) {
        const fn = (t?: number) => {
            if (!t) {
                t = 1;
            } else {
                t++;
            }
            if (t <= 60) {
                window.requestAnimationFrame(() => {
                    if (this.list) {
                        if (!(this.messageScroll.overscanStartIndex <= index && this.messageScroll.overscanStopIndex >= index)) {
                            this.list.scrollToRow(index);
                        }
                        this.checkScroll(id, index, t);
                    }
                });
            } else {
                this.removeSnapshot();
                this.setEnableBefore();
            }
        };
        const cellTop = this.getCellTop(Math.floor(id));
        if (cellTop) {
            this.list.scrollToPosition(cellTop - this.stayInfo.offset);
            setTimeout(() => {
                const cellTopCheck = this.getCellTop(Math.floor(id));
                if (cellTopCheck === cellTop) {
                    this.setEnableBefore();
                    this.removeSnapshot();
                } else {
                    fn(tries);
                }
            }, 1);
        } else {
            fn(tries);
        }
    }

    /* Message body renderer */
    private renderMessageBody(message: IMessage, peer: InputPeer | null, messageMedia: any, parentEl: any, measureFn?: any) {
        const refBindHandler = (ref: any) => {
            messageMedia.ref = ref;
        };
        if (message.mediatype !== MediaType.MEDIATYPEEMPTY && message.mediatype !== undefined) {
            switch (message.messagetype) {
                case C_MESSAGE_TYPE.Voice:
                    return (<MessageVoice message={message} peer={peer} onAction={this.props.onAttachmentAction}/>);
                case C_MESSAGE_TYPE.Audio:
                    return (<MessageAudio message={message} peer={peer} onAction={this.props.onAttachmentAction}/>);
                case C_MESSAGE_TYPE.File:
                    return (<MessageFile message={message} peer={peer} onAction={this.props.onAttachmentAction}/>);
                case C_MESSAGE_TYPE.Contact:
                    return (<MessageContact message={message} peer={peer} onAction={this.props.onAttachmentAction}/>);
                case C_MESSAGE_TYPE.Picture:
                case C_MESSAGE_TYPE.Video:
                    return (<MessageMedia ref={refBindHandler} message={message} peer={peer}
                                          onAction={this.props.onAttachmentAction}
                                          parentEl={parentEl} measureFn={measureFn}/>);
                case C_MESSAGE_TYPE.Location:
                    return (<MessageLocation ref={refBindHandler} message={message} peer={peer}/>);
                default:
                    return (<div>Unsupported message</div>);
            }
        } else {
            return (
                <div className={'inner ' + (message.rtl ? 'rtl' : 'ltr')}
                     onDoubleClick={this.selectText}>{this.renderBody(message, measureFn)}</div>
            );
        }
    }

    /* Get message type name */
    private getMessageType(message: IMessage) {
        let type = '';
        switch (message.messagetype) {
            case C_MESSAGE_TYPE.Picture:
            case C_MESSAGE_TYPE.Video:
            case C_MESSAGE_TYPE.Location:
                type = 'media';
                break;
            case C_MESSAGE_TYPE.File:
                type = 'file';
                break;
            case C_MESSAGE_TYPE.Voice:
                type = 'voice';
                break;
            case C_MESSAGE_TYPE.Audio:
                type = 'music';
                break;
        }
        if (type === 'media') {
            const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
            if ((messageMediaDocument.caption || '').length > 0) {
                type = 'media_caption';
            }
        }
        if (type === 'music') {
            const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
            if ((messageMediaDocument.caption || '').length > 0) {
                type = 'music_caption';
            }
        }
        let related = '';
        if (message.replyto || (message.fwdsenderid && message.fwdsenderid !== '0')) {
            related = 'related';
        }
        return ` ${type} ${related}`;
    }

    /* Theme change handler */
    private themeChangeHandler = () => {
        this.isSimplified = UserRepo.getInstance().getBubbleMode() === '5';
    }

    private fitListComplete = () => {
        setTimeout(() => {
            if (this.state.items && this.state.items.length > 0 && this.props.rendered) {
                this.props.rendered({
                    overscanStartIndex: 0,
                    overscanStopIndex: 0,
                    startIndex: 0,
                    stopIndex: this.state.items.length - 1,
                });
            }
        }, 200);
    }

    private messageInnerRefHandler = (ref: any) => {
        this.messageInnerRef = ref;
    }

    private messageSnapshotRefHandler = (ref: any) => {
        this.messageSnapshotRef = ref;
    }

    private dropZoneRefHandler = (ref: any) => {
        this.dropZoneRef = ref;
    }

    private dragEnterHandler = (e: any) => {
        if (!this.dropZoneRef) {
            return;
        }
        this.dropZoneRef.classList.remove('hidden');
    }

    private dragLeaveHandler = () => {
        if (!this.dropZoneRef) {
            return;
        }
        if (this.dropZoneRef.classList.contains('hidden')) {
            return;
        }
        this.dropZoneRef.classList.add('hidden');
    }

    private dropHandler = (e: any) => {
        e.preventDefault();
        this.dragLeaveHandler();
        const files: File[] = [];
        if (e.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                if (e.dataTransfer.items[i].kind === 'file') {
                    const file = e.dataTransfer.items[i].getAsFile();
                    files.push(file);
                }
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
                files.push(e.dataTransfer.files[i]);
            }
        }
        this.props.onDrop(files);
    }

    private scrollbarThumbRefHandler = (ref: any) => {
        this.scrollThumbRef = ref;
    }

    private scrollHandler = (e: any) => {
        if (!this.scrollbar.dragged && this.scrollbar.enable) {
            this.modifyScrollThumb();
        }
        if (this.disableScrolling) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    private modifyScrollThumb = () => {
        if (!this.scrollThumbRef) {
            return;
        }
        const eldiv = this.scrollContainerEl.firstElementChild;
        if (!eldiv) {
            return;
        }
        let top = (this.scrollContainerEl.scrollTop / eldiv.scrollHeight) * 100;
        const height = (this.scrollContainerEl.clientHeight / eldiv.scrollHeight) * 100;
        if (top + height > 100) {
            top = 100 - height;
        }
        this.scrollThumbRef.style.top = `${top}%`;
        this.scrollThumbRef.style.height = `${height}%`;
    }

    private scrollbarTrackDownHandler = (e: any) => {
        if (!this.scrollThumbRef || !this.scrollContainerEl) {
            return;
        }
        const rect = this.scrollThumbRef.getBoundingClientRect();
        const top = rect.top + rect.height / 2;
        const diff = Math.min(Math.max(Math.abs(top - e.pageY), 100), 400);
        if (top > e.pageY) {
            this.scrollToPosition(this.scrollContainerEl.scrollTop - diff);
        } else {
            this.scrollToPosition(this.scrollContainerEl.scrollTop + diff);
        }
        setTimeout(() => {
            this.modifyScrollThumb();
        }, 10);
    }

    private scrollbarThumbDownHandler = (e: any) => {
        if (!this.scrollContainerEl) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        const eldiv = this.scrollContainerEl.firstElementChild;
        if (eldiv) {
            this.scrollbar.dragged = true;
            this.scrollbar.clickPos = e.pageY;
            this.scrollbar.clickTop = (this.scrollContainerEl.scrollTop / eldiv.scrollHeight) * this.scrollContainerEl.clientHeight;
            this.scrollbar.clickScrollTop = this.scrollContainerEl.scrollTop;
            this.setupDragging();
        }
    }

    private scrollbarThumbMoveHandler = (e: any) => {
        if (!this.scrollThumbRef || !this.scrollContainerEl || !this.scrollbar.dragged) {
            return;
        }
        const eldiv = this.scrollContainerEl.firstElementChild;
        if (!eldiv) {
            return;
        }
        const offset = e.pageY - this.scrollbar.clickPos;
        const scrollTop = this.scrollbar.clickScrollTop + offset * (eldiv.scrollHeight / this.scrollContainerEl.clientHeight);
        this.scrollToPosition(scrollTop);
        let top = this.scrollbar.clickTop + offset;
        if (top < 0) {
            top = 0;
        }
        if (top > (this.scrollContainerEl.clientHeight - this.scrollThumbRef.clientHeight)) {
            top = this.scrollContainerEl.clientHeight - this.scrollThumbRef.clientHeight;
        }
        this.scrollThumbRef.style.top = `${top}px`;
    }

    private scrollbarThumbUpHandler = () => {
        this.scrollbar.dragged = false;
        this.teardownDragging();
    }

    private setupDragging() {
        if (!this.scrollContainerEl) {
            return;
        }
        this.scrollContainerEl.style.userSelect = 'none';
        document.addEventListener('mousemove', this.scrollbarThumbMoveHandler);
        document.addEventListener('mouseup', this.scrollbarThumbUpHandler);
        document.addEventListener('mousedown', this.teardownDragging);
    }

    private teardownDragging = () => {
        if (!this.scrollContainerEl) {
            return;
        }
        this.scrollContainerEl.style.userSelect = 'auto';
        document.removeEventListener('mousemove', this.scrollbarThumbMoveHandler);
        document.removeEventListener('mouseup', this.scrollbarThumbUpHandler);
        document.removeEventListener('mousedown', this.teardownDragging);
    }

    private scrollToPosition(pos: number) {
        if (pos < 0) {
            pos = 0;
        }
        if (this.scrollContainerEl) {
            const eldiv = this.scrollContainerEl.firstElementChild;
            if (!eldiv) {
                const lim = eldiv.scrollHeight - this.scrollContainerEl.clientHeight;
                if (pos > lim) {
                    pos = lim;
                }
            }
        }
        this.list.scrollToPosition(pos);
    }

    private openExternalLink = (url: string, e: any) => {
        e.preventDefault();
        ElectronService.openExternal(url);
    }

    private openAvatar(photo: GroupPhoto.AsObject) {
        const doc: IDocument = {
            items: [{
                caption: '',
                fileLocation: photo.photobig,
                thumbFileLocation: photo.photosmall,
            }],
            type: 'avatar'
        };
        this.documentViewerService.loadDocument(doc);
    }

    private setEnableBefore() {
        clearTimeout(this.enableLoadBeforeTimeout);
        this.enableLoadBeforeTimeout = setTimeout(() => {
            this.enableLoadBefore = true;
        }, 500);
    }

    private checkEnd(items: IMessage[]) {
        for (let i = 0; i < 5 || i < items.length; i++) {
            if (items[i] && items[i].messagetype === C_MESSAGE_TYPE.End) {
                this.hasEnd = true;
                return;
            }
        }
        this.hasEnd = false;
    }
}

export default Message;
