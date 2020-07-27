/*
    Creation Time: 2018 - Aug - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {IMessage} from '../../repository/message/interface';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    GroupPhoto, InputFileLocation, InputPeer, MediaType, MessageEntity, MessageEntityType, PeerType,
} from '../../services/sdk/messages/core.types_pb';
import {findLastIndex, throttle} from 'lodash';
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE, C_REPLY_ACTION} from '../../repository/message/consts';
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
import MessageMedia, {C_MEDIA_BREAKPOINT, getContentSize, initMediaSize} from '../MessageMedia';
import {MediaDocument} from '../../services/sdk/messages/chat.messages.medias_pb';
import MessageLocation from '../MessageLocation';
import Broadcaster from '../../services/broadcaster';
import UserRepo from '../../repository/user';
import MessageAudio from '../MessageAudio';
import ElectronService from '../../services/electron';
import i18n from '../../services/i18n';
import DocumentViewerService, {IDocument} from "../../services/documentViewerService";
import {Loading} from "../Loading";
import KKWindow from "../../services/kkwindow/kkwindow";
import {scrollFunc} from "../../services/kkwindow/utils";
import animateScrollTo from "animated-scroll-to";
import Landscape from "../SVG";
import MessageBot from "../MessageBot";
import {ThemeChanged} from "../SettingsMenu";
import CodeViewer from "../CodeViewer";
import {spanMessageEntities} from "../../services/utilities/entity";
import ResizeObserver from "resize-observer-polyfill";

import './style.scss';

/* Modify URL */
export const modifyURL = (url: string) => {
    if (url.indexOf('http://') > -1 || url.indexOf('https://') > -1) {
        return url;
    } else {
        return `//${url}`;
    }
};

/* Render body based on entities */
export const renderBody = (body: string, entityList: MessageEntity.AsObject[] | undefined, isElectron?: boolean | number, onAction?: (cmd: string, text: string) => void, measureFn?: any) => {
    if (!entityList || entityList.length === 0) {
        return body;
    } else {
        const elems = spanMessageEntities(body, entityList);
        const openExternalLinkHandler = (url: string) => (e: any) => {
            e.preventDefault();
            if (onAction) {
                onAction('open_external_link', url);
            }
        };
        const botCommandHandler = (text: string) => (e: any) => {
            if (onAction) {
                onAction('bot_command', text);
            }
        };
        const userNameClickHandler = (id: string) => {
            if (onAction) {
                onAction('user_name', id);
            }
        };
        const classMap = {
            [MessageEntityType.MESSAGEENTITYTYPEBOLD]: '_bold',
            [MessageEntityType.MESSAGEENTITYTYPEITALIC]: '_italic',
            [MessageEntityType.MESSAGEENTITYTYPEEMAIL]: '_mail',
            [MessageEntityType.MESSAGEENTITYTYPEHASHTAG]: '_hashtag',
        };
        const render = elems.map((elem, i) => {
            if (elem.type !== undefined) {
                switch (elem.type) {
                    case MessageEntityType.MESSAGEENTITYTYPEMENTION:
                        if (elem.str.indexOf('@') === 0) {
                            return (
                                <UserName key={i} className="_mention" id={elem.userId} username={true} prefix="@"
                                          noIcon={true} unsafe={true}
                                          defaultString={elem.str.substr(1)} onLoad={measureFn}
                                          onClick={userNameClickHandler}
                                />);
                        } else {
                            return (<UserName key={i} className="_mention" id={elem.userId} unsafe={true} noIcon={true}
                                              defaultString={elem.str} onLoad={measureFn}
                                              onClick={userNameClickHandler}
                            />);
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
                        const url = modifyURL(elem.str);
                        if (isElectron === 1) {
                            return (
                                <div key={i} className="_url">{elem.str}</div>);
                        } else {
                            if (isElectron) {
                                return (
                                    <a key={i} href={url} onClick={openExternalLinkHandler(url)}
                                       className="_url">{elem.str}</a>);
                            } else {
                                return (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                       className="_url">{elem.str}</a>);
                            }
                        }
                    case MessageEntityType.MESSAGEENTITYTYPEBOTCOMMAND:
                        return (<span key={i} className="_url"
                                      onClick={botCommandHandler(elem.str || '')}>{elem.str}</span>);
                    case MessageEntityType.MESSAGEENTITYTYPECODE:
                        return (<CodeViewer key={i} snippet={elem.str || ''} onDone={measureFn}/>);
                    default:
                        return (<span key={i}>{elem.str}</span>);
                }
            } else {
                return (
                    <span key={i} className={elem.types.map((o: string) => classMap[o]).join(' ')}>{elem.str}</span>);
            }
        });
        return render;
    }
};

interface IProps {
    onContextMenu: (cmd: string, id: IMessage) => void;
    onAttachmentAction?: (cmd: 'cancel' | 'cancel_download' | 'download' | 'download_stream' | 'view' | 'open' | 'read' | 'preview', message: IMessage) => void;
    onJumpToMessage: (id: number, e: any) => void;
    onLastMessage: (message: IMessage | null) => void;
    onLastIncomingMessage: (message: IMessage | null) => void;
    onLoadMoreAfter?: (start: number, end: number) => any;
    onLoadMoreBefore?: () => any;
    onSelectableChange: (selectable: boolean) => void;
    onSelectedIdsChange: (selectedIds: { [key: number]: number }) => void;
    onDrop: (files: File[]) => void;
    onRendered?: scrollFunc;
    onBotCommand?: (cmd: string, params?: any) => void;
    onBotButtonAction?: (cmd: number, data: any, msgId?: number) => void;
    onMessageDrop?: (id: number) => void;
    onError?: (text: string) => void;
    showDate: (timestamp: number | null) => void;
    showNewMessage?: (visible: boolean) => void;
    isMobileView: boolean;
    userId?: string;
    isBot: boolean;
}

interface IState {
    containerSize: {
        width: number,
        height: number,
    };
    enable: boolean;
    enableDrag: boolean;
    items: IMessage[];
    loading: boolean;
    loadingOverlay: boolean;
    loadingPersist: boolean;
    moreAnchorEl: any;
    moreAnchorPos: any;
    moreIndex: number;
    readIdInit: number;
    selectable: boolean;
    selectedIds: { [key: number]: number };
}

export const messageKey = (id: number, type: number) => {
    return `${id}_${type}`;
};

export const highlightMessage = (id: number) => {
    const el = document.querySelector(`.bubble-wrapper .bubble.b_${id}`);
    if (el) {
        let parentEl = el.parentElement;
        if (parentEl) {
            parentEl = parentEl.parentElement;
        }
        if (parentEl) {
            parentEl.classList.add('highlight');
            const inputEl = document.createElement('input');
            inputEl.style.display = 'none';
            parentEl.appendChild(inputEl);
            inputEl.focus();
            setTimeout(() => {
                if (parentEl) {
                    parentEl.classList.remove('highlight');
                }
                inputEl.remove();

            }, 1050);
        }
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

class Message extends React.Component<IProps, IState> {
    public list: KKWindow | undefined;
    private containerRef: any = null;
    private inputPeer: InputPeer | null = null;
    private listCount: number = 0;
    private loadingTimeout: any = null;
    // @ts-ignore
    private messageScroll: {
        end: number;
        overscanEnd: number;
        overscanStart: number;
        start: number;
    } = {
        end: 0,
        overscanEnd: 0,
        overscanStart: 0,
        start: 0,
    };
    private riverTime: RiverTime;
    private isSimplified: boolean = false;
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private readId: number = 0;
    private scrollDownTimeout: any = null;
    // @ts-ignore
    private topMessageId: number = 0;
    private isElectron: boolean = ElectronService.isElectron();
    private readonly menuItem: any = {};
    private documentViewerService: DocumentViewerService;
    // private readonly isMac: boolean = navigator.platform.indexOf('Mac') > -1;
    private newMessageIndex: number = -1;
    // @ts-ignore
    private hasEnd: boolean = false;
    private savedMessages: boolean = false;
    private resizeObserver: ResizeObserver | undefined;
    private readonly containerResizeThrottle: any;
    private isLarge?: boolean;

    constructor(props: IProps) {
        super(props);

        const height = window.innerHeight - 98;
        const width = window.innerWidth - 318;

        this.state = {
            containerSize: {
                height,
                width,
            },
            enable: false,
            enableDrag: false,
            items: [],
            loading: false,
            loadingOverlay: false,
            loadingPersist: false,
            moreAnchorEl: null,
            moreAnchorPos: null,
            moreIndex: -1,
            readIdInit: -1,
            selectable: false,
            selectedIds: {},
        };

        this.readId = -1;
        this.riverTime = RiverTime.getInstance();
        this.broadcaster = Broadcaster.getInstance();
        this.isSimplified = UserRepo.getInstance().getBubbleMode() === '5';
        this.documentViewerService = DocumentViewerService.getInstance();
        this.containerResizeThrottle = throttle(this.getContainerSize, 10);

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
            9: {
                cmd: 'select',
                title: i18n.t('general.select'),
            },
            10: {
                cmd: 'copy',
                title: i18n.t('general.copy'),
            },
            11: {
                cmd: 'copy_all',
                title: i18n.t('general.copy'),
            },
            12: {
                cmd: 'labels',
                title: i18n.t('chat.labels'),
            },
            13: {
                cmd: 'save_gif',
                title: i18n.t('general.save_gif'),
            },
        };
    }

    public componentDidMount() {
        this.resizeObserver = new ResizeObserver(this.containerResizeThrottle);
        const el = document.querySelector('.conversation');
        if (el) {
            this.resizeObserver.observe(el);
        }
        this.eventReferences.push(this.broadcaster.listen(ThemeChanged, this.themeChangeHandler));
        this.getContainerSize();
    }

    public setPeer(peer: InputPeer | null) {
        if (this.inputPeer !== peer) {
            this.inputPeer = peer;
            this.savedMessages = Boolean(peer && this.props.userId === peer.getId());
        }
    }

    public setReadId(readId: number) {
        if (this.readId !== readId) {
            this.readId = readId;
            this.setState({
                readIdInit: this.readId,
            });
        }
    }

    public setSelectable(enable: boolean, ids: { [key: number]: number }) {
        if (this.state.selectable !== enable || Object.keys(this.state.selectedIds).length !== Object.keys(ids).length) {
            this.setState({
                selectable: enable,
                selectedIds: ids,
            });
        }
    }

    public setTopMessage(topMessageId: number) {
        this.topMessageId = topMessageId;
    }

    public setMessages(items: IMessage[], callback?: () => void, ignoreLastUpdates?: boolean) {
        const fn = () => {
            this.newMessageIndex = findLastIndex(this.state.items, {messagetype: C_MESSAGE_TYPE.NewMessage});
        };

        if (this.state.items !== items) {
            fn();
            this.checkEnd(items);
            if (ignoreLastUpdates !== true) {
                if (items.length > 0) {
                    this.props.onLastMessage(items[items.length - 1]);
                } else {
                    this.props.onLastMessage(null);
                }
                this.getLastIncomingMessage(items);
            }
            this.setState({
                items,
                moreAnchorEl: null,
                moreAnchorPos: null,
                moreIndex: -1,
            }, () => {
                if (callback) {
                    callback();
                }
            });
            this.listCount = items.length;
        } else if (this.state.items === items && this.listCount !== items.length) {
            fn();
            this.checkEnd(items);
            this.listCount = items.length;
            if (ignoreLastUpdates !== true) {
                if (this.state.items.length > 0) {
                    this.props.onLastMessage(this.state.items[this.state.items.length - 1]);
                } else {
                    this.props.onLastMessage(null);
                }
                this.getLastIncomingMessage(this.state.items);
            }
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
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
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
                        });
                    }, 500);
                }
            });
        }
    }

    public animateToEnd() {
        const {items} = this.state;
        if (!items) {
            return;
        }
        clearTimeout(this.scrollDownTimeout);
        if (this.list && this.list.isSmallerThanContainer()) {
            return;
        }
        if (this.containerRef && !this.isAtEnd()) {
            const options: any = {
                // duration of the scroll per 1000px, default 500
                speed: 1000,

                // minimum duration of the scroll
                minDuration: 96,

                // maximum duration of the scroll
                maxDuration: 196,

                // @ts-ignore
                element: this.containerRef,

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

                onComplete: () => {
                    if (!this.isAtEnd()) {
                        this.animateToEnd();
                    } else {
                        this.scrollDownTimeout = setTimeout(() => {
                            if (!this.isAtEnd()) {
                                this.animateToEnd();
                            }
                        }, 100);
                    }
                }
            };
            animateScrollTo((this.containerRef.scrollHeight - this.containerRef.clientHeight) + 1, options);
        }
    }

    public setScrollMode(mode: 'none' | 'end' | 'top' | 'stay') {
        if (this.list) {
            this.list.setScrollMode(mode);
        }
    }

    public focusOnNewMessage() {
        const {items} = this.state;
        if (items) {
            const index = findLastIndex(items, {messagetype: C_MESSAGE_TYPE.NewMessage});
            if (index > -1 && this.list) {
                this.list.scrollToItem(index);
            }
        }
    }

    public clearAll() {
        if (this.list) {
            this.list.clearAll();
        }
    }

    public clear(index: number) {
        if (this.list) {
            this.list.cellMeasurer.clear(index);
        }
    }

    public recomputeItemHeight(index: number) {
        if (this.list) {
            this.list.forceUpdate();
            this.list.cellMeasurer.recomputeItemHeight(index);
        }
    }

    public updateItem(index: number) {
        if (this.list) {
            this.list.cellMeasurer.updateItem(index);
        }
    }

    public updateList(callback?: any) {
        if (this.list) {
            this.list.forceUpdate(callback);
        }
    }

    public setFitList(fit: boolean) {
        if (this.list) {
            this.list.setFitList(fit);
        }
    }

    public scrollDownIfPossible() {
        if (this.isAtEnd(30)) {
            setTimeout(() => {
                this.animateToEnd();
            }, 300);
        }
    }

    public resizeContainer() {
        // this.containerResizeThrottle();
    }

    public render() {
        const {items, moreAnchorEl, moreAnchorPos, selectable, loadingOverlay, containerSize, enable} = this.state;
        return (
            <div className="main-messages">
                <div
                    className={'messages-inner ' + (((this.inputPeer && this.inputPeer.getType() === PeerType.PEERGROUP) || this.isSimplified) ? 'group' : 'user') + (selectable ? ' selectable' : '') + (this.isLarge ? ' large-mode' : '')}
                    style={{height: `${containerSize.height}px`, width: `${containerSize.width}px`}}
                    onDragEnter={this.enableDragHandler}
                >
                    {enable && <KKWindow
                        ref={this.refHandler}
                        containerRef={this.containerRefHandler}
                        className="chat active-chat"
                        height={containerSize.height}
                        estimatedHeight={containerSize.height}
                        width={containerSize.width}
                        count={items.length}
                        overscan={30}
                        renderer={this.rowRenderHandler}
                        noRowsRenderer={this.noRowsRendererHandler}
                        keyMapper={this.keyMapperHandler}
                        estimatedItemSize={41}
                        estimatedItemSizeFunc={this.getHeight}
                        loadBeforeLimit={10}
                        onLoadBefore={this.kkWindowBeforeHandler}
                        onLoadAfter={this.props.onLoadMoreAfter}
                        onScrollPos={this.scrollPosHandler}
                    />}
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
                        {this.contextMenuItem()}
                    </Menu>
                    {this.state.enableDrag &&
                    <div style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, zIndex: 10000}}
                         ref={this.droppableAreaRefHandler}
                         onDrop={this.dropHandler}
                    />}
                    {this.state.enableDrag &&
                    <div className="messages-dropzone">
                        <div className="dropzone">{i18n.t('message.drop_here')}</div>
                    </div>}
                </div>
                {loadingOverlay && <div className="messages-overlay-loading">
                    <Loading/>
                </div>}
            </div>
        );
    }

    private kkWindowBeforeHandler = () => {
        if (this.props.onLoadMoreBefore) {
            this.props.onLoadMoreBefore();
        }
    }

    private getHeight = (index: number) => {
        const {items} = this.state;
        let height = 41;
        const message = items[index];
        if (!message) {
            return height;
        }
        switch (message.messagetype) {
            case C_MESSAGE_TYPE.Date:
                return 33;
            case C_MESSAGE_TYPE.Picture:
            case C_MESSAGE_TYPE.Video:
                const info = getContentSize(message);
                if (info) {
                    height = info.height + 10;
                }
                break;
            case C_MESSAGE_TYPE.Voice:
                height = 42;
                break;
            case C_MESSAGE_TYPE.System:
                return 41;
            case C_MESSAGE_TYPE.Location:
                if (this.isLarge) {
                    return 220;
                } else {
                    return 120;
                }
            case C_MESSAGE_TYPE.Normal:
            case undefined:
                if (message.em_le) {
                    if (message.em_le === 1) {
                        height = 74;
                    } else {
                        height = 62;
                    }
                }
                break;
        }
        if (((this.inputPeer && this.inputPeer.getType() === PeerType.PEERGROUP) || this.isSimplified) && message.avatar) {
            height += 20;
        }
        if (message.replyto && message.replyto !== 0 && message.deleted_reply !== true) {
            height += 41;
        }
        if (message.fwdsenderid && message.fwdsenderid !== '0') {
            height += 25;
        }
        if (message.avatar) {
            height += 6;
        }
        return height;
    }

    private contextMenuItem() {
        const {items, moreIndex} = this.state;
        if (!items[moreIndex]) {
            return null;
        }
        const menuTypes = {
            1: [1, 2, 3, 4, 13, 7, 12, 8, 9, 10, 11],
            2: [1, 2, 4, 13, 7, 12, 8, 9, 10, 11],
            3: [6, 5, 9, 10, 11],
        };
        const selection = window.getSelection();
        const hasCopy = Boolean(selection && selection.type === 'Range');
        const copiable = items[moreIndex] && (items[moreIndex].messagetype === C_MESSAGE_TYPE.Normal || !items[moreIndex].messagetype);
        const menuItems: any[] = [];
        const id = items[moreIndex].id;
        const me = items[moreIndex].me;
        const saveAndDownloadFilter = [C_MESSAGE_TYPE.File, C_MESSAGE_TYPE.Voice, C_MESSAGE_TYPE.Audio, C_MESSAGE_TYPE.Video];
        if (id && id < 0) {
            menuTypes[3].forEach((key) => {
                if (key === 6) {
                    if (items[moreIndex].error || (this.riverTime.now() - (items[moreIndex].createdon || 0)) > 30) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 10) {
                    if (copiable && hasCopy) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 11) {
                    if (copiable && !hasCopy) {
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
                    if (!items[moreIndex].downloaded && saveAndDownloadFilter.indexOf(items[moreIndex].messagetype || 0) > -1) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 8) {
                    if (items[moreIndex].downloaded && saveAndDownloadFilter.indexOf(items[moreIndex].messagetype || 0) > -1) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 10) {
                    if (copiable && hasCopy) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 11) {
                    if (copiable && !hasCopy) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 13) {
                    if (items[moreIndex].messagetype === C_MESSAGE_TYPE.Gif) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else {
                    menuItems.push(this.menuItem[key]);
                }
            });
        } else if (me === false && id && id > 0) {
            menuTypes[2].forEach((key) => {
                if (key === 7) {
                    if (!items[moreIndex].downloaded && saveAndDownloadFilter.indexOf(items[moreIndex].messagetype || 0) > -1) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 8) {
                    if (items[moreIndex].downloaded && saveAndDownloadFilter.indexOf(items[moreIndex].messagetype || 0) > -1) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 10) {
                    if (copiable && hasCopy) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 11) {
                    if (copiable && !hasCopy) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else if (key === 13) {
                    if (items[moreIndex].messagetype === C_MESSAGE_TYPE.Gif) {
                        menuItems.push(this.menuItem[key]);
                    }
                } else {
                    menuItems.push(this.menuItem[key]);
                }
            });
        }
        return menuItems.map((item, index) => {
            return (<MenuItem key={index} onClick={this.moreCmdHandler(item.cmd, moreIndex)}
                              className="context-item">{item.title}</MenuItem>);
        });
    }

    private refHandler = (value: any) => {
        this.list = value;
    }

    private containerRefHandler = (ref: any) => {
        this.containerRef = ref;
    }

    private isAtEnd(offset?: number) {
        if (this.containerRef) {
            return (this.containerRef.clientHeight + this.containerRef.scrollTop + (offset || 2) >= this.containerRef.scrollHeight);
        } else {
            return true;
        }
    }

    private noRowsRendererHandler = () => {
        if (this.state.loading || this.state.loadingPersist || this.props.isMobileView) {
            return (<div className="chat-placeholder with-loading">
                <Loading/>
            </div>);
        } else {
            return (<div className="chat-placeholder with-bg">
                <Landscape/>
                <div className="placeholder-label">{i18n.t('general.no_message')}</div>
            </div>);
        }
    }

    private rowRenderHandler = (index: number) => {
        const message = this.state.items[index];
        if (!message) {
            return null;
        }
        const peer = this.inputPeer;
        const readId = this.readId;
        const measureFn = () => {
            if (this.list) {
                this.list.cellMeasurer.recomputeItemHeight(index);
            }
        };
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
            if (messageMedia.ref && messageMedia.ref.viewDocumentHandler) {
                messageMedia.ref.viewDocumentHandler();
            }
        };
        const userNameLoadHandler = () => {
            if (messageMedia.ref && messageMedia.ref.checkBlur) {
                messageMedia.ref.checkBlur();
            }
        };
        switch (message.messagetype) {
            case C_MESSAGE_TYPE.Hole:
            case C_MESSAGE_TYPE.End:
                return null;
            case C_MESSAGE_TYPE.Gap:
                return (<div className="bubble-gap">
                    <div className="gap">
                        {Boolean(this.state.loading || this.state.loadingPersist) && <div className="loading">
                            <span className="loader"/>
                        </div>}
                    </div>
                </div>);
            case C_MESSAGE_TYPE.NewMessage:
                return (
                    <div className="bubble-wrapper">
                        <span className="system-message divider">{i18n.t('message.unread_messages')}</span>
                    </div>
                );
            case C_MESSAGE_TYPE.Date:
                return (
                    <div className="bubble-wrapper date-padding">
                        {!Boolean((this.state.loading || this.state.loadingPersist) && index === 0) &&
                        <span className="date">{TimeUtility.dynamicDate(message.createdon || 0)}</span>}
                        {Boolean((this.state.loading || this.state.loadingPersist) && index === 0) &&
                        <div className="loading">
                            <CircularProgress size={16} thickness={3} color="inherit"/>
                        </div>}
                    </div>
                );
            case C_MESSAGE_TYPE.Normal:
            default:
                if (message.messageaction !== C_MESSAGE_ACTION.MessageActionNope && message.messageaction !== undefined) {
                    return (
                        <div
                            className={'bubble-wrapper' + (this.state.selectedIds.hasOwnProperty(message.id || 0) ? ' selected' : '')}
                            onClick={this.toggleSelectHandler(message.id || 0, index)}
                            onDoubleClick={this.selectMessage(index)}>
                            {this.state.selectable && <Checkbox
                                className={'checkbox ' + (this.state.selectedIds.hasOwnProperty(message.id || 0) ? 'checked' : '')}
                                color="primary" checked={this.state.selectedIds.hasOwnProperty(message.id || 0)}
                                onChange={this.selectMessageHandler(message.id || 0, index, null)}/>}
                            {this.renderSystemMessage(message)}
                        </div>
                    );
                } else {
                    return (
                        <div
                            className={'bubble-wrapper _bubble' + (message.me && !this.isSimplified ? ' me' : ' you') + (message.avatar ? ' avatar' : '') + (this.state.selectedIds.hasOwnProperty(message.id || 0) ? ' selected' : '') + this.getMessageType(message) + ((message.me && message.error && (message.id || 0) < 0) ? ' has-error' : '') + ((message.em_le || 0) > 0 ? ' large-emoji' : '')}
                            onClick={this.toggleSelectHandler(message.id || 0, index)}
                            onDoubleClick={this.selectMessage(index)}
                        >
                            {(!this.state.selectable && message.avatar && message.senderid) && (
                                <UserAvatar id={message.senderid} className="avatar"/>
                            )}
                            {this.state.selectable && <Checkbox
                                className={'checkbox ' + (this.state.selectedIds.hasOwnProperty(message.id || 0) ? 'checked' : '')}
                                color="primary" checked={this.state.selectedIds.hasOwnProperty(message.id || 0)}
                                onChange={this.selectMessageHandler(message.id || 0, index, null)}/>}
                            {Boolean(message.avatar && message.senderid) && (<div className="arrow"/>)}
                            {Boolean(message.me && message.error && (message.id || 0) < 0) &&
                            <span className="error" onClick={this.contextMenuHandler(index)}><ErrorRounded/></span>}
                            <div className="message-container">
                                <div ref={parenElRefHandler}
                                     className={'bubble b_' + message.id + ((message.editedon || 0) > 0 ? ' edited' : '') + ((message.messagetype === C_MESSAGE_TYPE.Video || message.messagetype === C_MESSAGE_TYPE.Picture || message.messagetype === C_MESSAGE_TYPE.Gif) ? ' media-message' : '')}
                                     onContextMenu={this.messageContextMenuHandler(index)}>
                                    {Boolean((peer && peer.getType() === PeerType.PEERGROUP && message.avatar && !message.me && !message.em_le)
                                        || (this.isSimplified && message.avatar)) &&
                                    <UserName className="name" uniqueColor={true} id={message.senderid || ''}
                                              noIcon={true} noDetail={this.state.selectable}
                                              onLoad={userNameLoadHandler}/>}
                                    {Boolean(message.replyto && message.replyto !== 0 && message.deleted_reply !== true) &&
                                    <MessagePreview message={message} peer={peer} teamId={message.teamid || '0'}
                                                    onDoubleClick={this.moreCmdHandler('reply', index)}
                                                    onClick={this.props.onJumpToMessage}
                                                    disableClick={this.state.selectable}
                                    />}
                                    {Boolean(message.fwdsenderid && message.fwdsenderid !== '0') &&
                                    <MessageForwarded message={message} peer={peer}
                                                      onDoubleClick={this.moreCmdHandler('reply', index)}/>}
                                    <div className="bubble-body" onClick={bubbleClickHandler}>
                                        {this.renderMessageBody(message, peer, messageMedia, parentEl, measureFn)}
                                        <MessageStatus status={message.me || false} id={message.id} readId={readId}
                                                       time={message.createdon || 0} editedTime={message.editedon || 0}
                                                       labelIds={message.labelidsList} markAsSent={message.mark_as_sent}
                                                       onDoubleClick={this.moreCmdHandler('reply', index)}
                                                       forceDoubleTick={this.props.isBot || this.savedMessages}
                                        />
                                    </div>
                                    <div className="more" onClick={bubbleClickHandler}>
                                        <MoreVert onClick={this.contextMenuHandler(index)}/>
                                    </div>
                                </div>
                                {Boolean(message.replymarkup === C_REPLY_ACTION.ReplyInlineMarkup && message.replydata) &&
                                <MessageBot message={message} peer={peer} onAction={this.props.onBotButtonAction}/>}
                            </div>
                        </div>
                    );
                }
        }
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

    private moreCmdHandler = (cmd: string, index: number) => (e: any) => {
        e.stopPropagation();
        if (index > -1) {
            this.props.onContextMenu(cmd, this.state.items[index]);
        }
        if (cmd === 'forward') {
            this.selectMessageHandler(this.state.items[index].id || 0, index, () => {
                this.props.onContextMenu('forward_dialog', this.state.items[index]);
            })();
        } else if (cmd === 'select') {
            this.selectMessage(index)();
        } else if (cmd === 'copy') {
            this.copy();
        } else if (cmd === 'copy_all') {
            const el = document.querySelector(`.bubble-wrapper .bubble.b_${this.state.items[index].id || 0} .bubble-body .inner`);
            if (el) {
                this.selectAll(el);
                this.copy();
            }
        }
        this.setState({
            moreAnchorEl: null,
            moreAnchorPos: null,
        });
    }

    private selectMessage = (index: number) => (e?: any) => {
        if (e) {
            e.stopPropagation();
        }
        if (!this.state.selectable) {
            this.props.onSelectableChange(true);
            this.setState({
                selectable: true,
            });
        }
        this.selectMessageHandler(this.state.items[index].id || 0, index, null)();
    }

    private scrollPosHandler: scrollFunc = ({start, end, overscanStart, overscanEnd}) => {
        const {items} = this.state;
        if (items.length > 0 && start > -1 && items[start]) {
            // Show/Hide date
            if (this.props.showDate) {
                if ((items[start] && items[start].messagetype === C_MESSAGE_TYPE.Date) ||
                    ((items[start + 1] && items[start + 1].messagetype === C_MESSAGE_TYPE.Date))) {
                    this.props.showDate(null);
                } else {
                    this.props.showDate(items[start].createdon || 0);
                }
            }

            if (this.props.showNewMessage && this.newMessageIndex > -1) {
                if (items[end] && end <= this.newMessageIndex) {
                    this.props.showNewMessage(true);
                } else {
                    this.props.showNewMessage(false);
                }
            }
        }

        this.messageScroll = {start, end, overscanStart, overscanEnd};

        if (this.props.onRendered) {
            this.props.onRendered({start, end, overscanStart, overscanEnd});
        }
    }

    private doubleClickHandler = (e: any) => {
        e.stopPropagation();
    }

    private selectText = (e: any) => {
        if (e.detail === 4) {
            e.stopPropagation();
            this.selectAll(e.currentTarget);
        }
    }

    private selectAll(elem: any) {
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

    private keyMapperHandler = (index: number) => {
        const {items} = this.state;
        if (!items[index]) {
            return `null_${index}`;
        }
        return messageKey(items[index].id || 0, items[index].messagetype || 0);
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
                                             onClick={this.openAvatar(photo)}/>
                            </div>
                        );
                    }
                }
            case C_MESSAGE_ACTION.MessageActionScreenShot:
                return (<span className="system-message"><UserName className="sender" id={message.senderid || ''}
                                                                   you={true}/> {i18n.t('message.took_an_screenshot')}</span>);
            default:
                return (<span className="system-message">{i18n.t('message.unsupported_message')}</span>);
        }
    }

    /* Add/Remove selected id to selectedIds map */
    private selectMessageHandler = (id: number, index: number, cb: any) => (e?: any) => {
        const {selectedIds} = this.state;
        if (!e || (e && e.currentTarget.checked)) {
            selectedIds[id] = index;
        } else {
            delete selectedIds[id];
        }
        this.props.onSelectedIdsChange(selectedIds);
        this.setState({
            selectedIds,
        }, () => {
            if (cb) {
                cb();
            }
        });
    }

    /* Toggle selected id in selectedIds map */
    private toggleSelectHandler = (id: number, index: number) => (e: any) => {
        if (!this.state.selectable) {
            this.selectText(e);
            return;
        }
        e.stopPropagation();
        const {selectedIds} = this.state;
        if (!selectedIds.hasOwnProperty(id)) {
            selectedIds[id] = index;
        } else {
            delete selectedIds[id];
        }
        this.props.onSelectedIdsChange(selectedIds);
        this.setState({
            selectedIds,
        });
    }

    /* Message body renderer */
    private renderMessageBody(message: IMessage, peer: InputPeer | null, messageMedia: any, parentEl: any, measureFn?: any) {
        const refBindHandler = (ref: any) => {
            messageMedia.ref = ref;
        };
        if (message.mediatype !== MediaType.MEDIATYPEEMPTY && message.mediatype !== undefined) {
            switch (message.messagetype) {
                case C_MESSAGE_TYPE.Voice:
                    return (<MessageVoice key={message.id} message={message} peer={peer}
                                          onAction={this.props.onAttachmentAction}/>);
                case C_MESSAGE_TYPE.Audio:
                    return (<MessageAudio key={message.id} message={message} peer={peer}
                                          onAction={this.props.onAttachmentAction} measureFn={measureFn}
                                          onBodyAction={this.bodyActionHandler}/>);
                case C_MESSAGE_TYPE.File:
                    return (<MessageFile key={message.id} message={message} peer={peer}
                                         onAction={this.props.onAttachmentAction} measureFn={measureFn}
                                         onBodyAction={this.bodyActionHandler}/>);
                case C_MESSAGE_TYPE.Contact:
                    return (<MessageContact message={message} peer={peer} onAction={this.props.onAttachmentAction}/>);
                case C_MESSAGE_TYPE.Picture:
                case C_MESSAGE_TYPE.Video:
                case C_MESSAGE_TYPE.Gif:
                    return (<MessageMedia key={message.id} ref={refBindHandler} message={message} peer={peer}
                                          onAction={this.props.onAttachmentAction} onBodyAction={this.bodyActionHandler}
                                          parentEl={parentEl} measureFn={measureFn}/>);
                case C_MESSAGE_TYPE.Location:
                    return (<MessageLocation message={message} peer={peer} onBodyAction={this.bodyActionHandler}
                                             measureFn={measureFn}/>);
                default:
                    return (<div>{i18n.t('message.unsupported_message')}</div>);
            }
        } else {
            let emojiClass = '';
            if (message.em_le) {
                emojiClass = ` emoji_${message.em_le}`;
            }
            return (
                <div className={'inner ' + (message.rtl ? 'rtl' : 'ltr') + emojiClass}
                     onDoubleClick={this.doubleClickHandler}>{renderBody(message.body || '', message.entitiesList, this.isElectron, this.bodyActionHandler, measureFn)}</div>
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
            case C_MESSAGE_TYPE.Gif:
                type = 'media';
                break;
            case C_MESSAGE_TYPE.File:
                type = 'file';
                break;
            case C_MESSAGE_TYPE.Voice:
                type = 'voice';
                break;
            case C_MESSAGE_TYPE.Audio:
                type = 'audio';
                break;
        }
        if (type === 'media') {
            const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
            if ((messageMediaDocument.caption || '').length > 0) {
                type = 'media_caption';
            }
        }
        if (type === 'audio') {
            const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
            if ((messageMediaDocument.caption || '').length > 0) {
                type = 'audio_caption';
            }
        }
        let related = '';
        if ((message.replyto && message.deleted_reply !== true) || (message.fwdsenderid && message.fwdsenderid !== '0')) {
            related = 'related';
        }
        return ` ${type} ${related}`;
    }

    /* Theme change handler */
    private themeChangeHandler = () => {
        this.isSimplified = UserRepo.getInstance().getBubbleMode() === '5';
    }

    private dropHandler = (e: any) => {
        e.preventDefault();
        this.setState({
            enableDrag: false,
        });
        if (this.props.onMessageDrop) {
            const messageId = e.dataTransfer.getData('message/id');
            if (messageId) {
                this.props.onMessageDrop(parseInt(messageId, 10));
                return;
            }
        }
        const el = document.querySelector('.messages-dropzone .dropzone');
        if (!el) {
            return;
        }
        const rect = el.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        if (!(rect.left <= x && x <= rect.left + rect.width &&
            rect.top <= y && y <= rect.top + rect.height)) {
            return;
        }
        const files: File[] = [];
        let hasData = false;
        if (e.dataTransfer.items) {
            hasData = true;
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
        if (files.length > 0) {
            this.props.onDrop(files);
        } else if (hasData) {
            if (this.props.onError) {
                this.props.onError(i18n.t('message.unsupported_file'));
            }
        }
    }

    private openAvatar = (photo: GroupPhoto.AsObject) => (e: any) => {
        const doc: IDocument = {
            inputPeer: this.inputPeer ? this.inputPeer : undefined,
            items: [{
                caption: '',
                fileLocation: photo.photobig,
                thumbFileLocation: photo.photosmall,
            }],
            photoId: photo.photoid,
            teamId: '0',
            type: 'avatar',
        };
        this.documentViewerService.loadDocument(doc);
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

    private copy() {
        if (document.execCommand) {
            document.execCommand('Copy');
        }
    }

    private getLastIncomingMessage(items: IMessage[]) {
        const index = findLastIndex(items, o => o.senderid !== this.props.userId);
        if (index > -1) {
            this.props.onLastIncomingMessage(items[index]);
        } else {
            this.props.onLastIncomingMessage(null);
        }
    }

    private bodyActionHandler = (cmd: string, text: string) => {
        switch (cmd) {
            case 'open_external_link':
                ElectronService.openExternal(text);
                break;
            case 'bot_command':
                if (this.props.onBotCommand) {
                    const entities: MessageEntity[] = [];
                    const entity = new MessageEntity();
                    entity.setOffset(0);
                    entity.setLength(text.length);
                    entity.setType(MessageEntityType.MESSAGEENTITYTYPEBOTCOMMAND);
                    entity.setUserid('0');
                    entities.push(entity);
                    this.props.onBotCommand(text, {
                        entities,
                    });
                }
                break;
        }
    }

    private getContainerSize = () => {
        const el = document.querySelector('.conversation');
        if (el) {
            const rect = el.getBoundingClientRect();
            this.setState({
                containerSize: {
                    height: rect.height,
                    width: rect.width,
                },
            });
        } else {
            const height = window.innerHeight - 98;
            const width = window.innerWidth - 318;
            this.setState({
                containerSize: {
                    height,
                    width,
                },
            });
        }
        this.checkMediaSize();
    }

    private checkMediaSize() {
        const windowWidth = window.innerWidth || 640;
        const w = C_MEDIA_BREAKPOINT + (this.isLarge === undefined ? 0 : (this.isLarge ? -12 : 12));
        if (windowWidth > w && (this.isLarge === undefined || this.isLarge === false)) {
            initMediaSize();
            if (this.isLarge !== undefined && this.list) {
                this.list.clearAll();
            }
            this.toggleEnable();
            this.isLarge = true;
        } else if (windowWidth < w && (this.isLarge === undefined || this.isLarge === true)) {
            initMediaSize();
            if (this.isLarge !== undefined && this.list) {
                this.list.clearAll();
            }
            this.toggleEnable();
            this.isLarge = false;
        }
    }

    private toggleEnable() {
        this.setState({
            enable: false,
        }, () => {
            this.setState({
                enable: true,
            });
        });
    }

    private enableDragHandler = () => {
        this.setState({
            enableDrag: true,
        });
    }

    private droppableAreaRefHandler = (e: any) => {
        if (e) {
            e.addEventListener('dragenter', this.dragEnterHandler, false);
            e.addEventListener('dragleave', this.dragLeaveHandler, false);
        }
    }

    private dragEnterHandler = (e: any) => {
        if (!this.state.enableDrag) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
    }

    private dragLeaveHandler = (e: any) => {
        if (!this.state.enableDrag) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            enableDrag: false,
        });
    }
}

export default Message;
