/*
    Creation Time: 2018 - Aug - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {AutoSizer, CellMeasurer, CellMeasurerCache, List, ScrollParams} from 'react-virtualized';
import {IMessage} from '../../repository/message/interface';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {
    GroupPhoto,
    InputFileLocation,
    InputPeer,
    MediaType,
    MessageEntityType,
    PeerType
} from '../../services/sdk/messages/chat.core.types_pb';
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE} from '../../repository/message/consts';
import TimeUtility from '../../services/utilities/time';
import UserAvatar from '../UserAvatar';
import MessagePreview from '../MessagePreview';
import MessageStatus from '../MessageStatus';
import {MoreVert} from '@material-ui/icons';
import UserName from '../UserName';
import Checkbox from '@material-ui/core/Checkbox';
import MessageForwarded from '../MessageForwarded';
import {clone} from 'lodash';
import MessageVoice from '../MessageVoice';
import RiverTime from '../../services/utilities/river_time';
import {ErrorRounded} from '@material-ui/icons';
import MessageFile from '../MessageFile';
import MessageContact from '../MessageContact';
import CachedPhoto from '../CachedPhoto';
import MessageMedia from '../MessageMedia';
import {MediaDocument} from '../../services/sdk/messages/chat.core.message.medias_pb';

import './style.css';
import MessageLocation from '../MessageLocation';

interface IProps {
    contextMenu?: (cmd: string, id: IMessage) => void;
    items: IMessage[];
    onAttachmentAction?: (cmd: 'cancel' | 'cancel_download' | 'download' | 'view' | 'open' | 'read', message: IMessage) => void;
    onJumpToMessage: (id: number, e: any) => void;
    onLoadMoreAfter?: (id: number) => any;
    onLoadMoreBefore?: () => any;
    onSelectableChange: (selectable: boolean) => void;
    onSelectedIdsChange: (selectedIds: { [key: number]: number }) => void;
    peer: InputPeer | null;
    readId: number;
    rendered?: (info: any) => void;
    selectable: boolean;
    selectedIds: { [key: number]: number };
    showDate?: (timestamp: number | null) => void;
}

interface IState {
    items: IMessage[];
    listStyle?: React.CSSProperties;
    loading: boolean;
    loadingPersist: boolean;
    moreAnchorEl: any;
    moreIndex: number;
    peer: InputPeer | null;
    readId: number;
    readIdInit: number;
    selectable: boolean;
    selectedIds: { [key: number]: number };
}

export const highlighMessage = (id: number) => {
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

class Message extends React.Component<IProps, IState> {
    public list: List;
    public cache: CellMeasurerCache;
    private listCount: number;
    private topOfList: boolean = false;
    private loadingTimeout: any = null;
    private scrollMode: 'none' | 'end' | 'stay';
    private scrollTop: number;
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

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: props.items,
            loading: false,
            loadingPersist: false,
            moreAnchorEl: null,
            moreIndex: -1,
            peer: props.peer,
            readId: props.readId,
            readIdInit: -1,
            selectable: props.selectable,
            selectedIds: props.selectedIds,
        };
        this.riverTime = RiverTime.getInstance();
        this.cache = new CellMeasurerCache({
            fixedWidth: true,
            keyMapper: this.keyMapperHandler,
            minHeight: 35,
        });
    }

    public componentDidMount() {
        this.fitList(true);
        this.listCount = this.props.items.length;
        this.topOfList = false;
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.items !== newProps.items) {
            this.cache.clearAll();
            this.setState({
                items: newProps.items,
                moreAnchorEl: null,
                moreIndex: -1,
                peer: newProps.peer,
                readIdInit: newProps.readId,
            }, () => {
                this.fitList(true);
                this.modifyScroll(newProps.items);
            });
            this.listCount = newProps.items.length;
            this.topOfList = false;
        } else if (this.state.items === newProps.items && this.listCount !== newProps.items.length) {
            if (!this.topOfList) {
                setTimeout(() => {
                    this.fitList();
                }, 100);
            }
            this.modifyScroll(newProps.items);
            this.listCount = newProps.items.length;
            this.topOfList = false;
        }
        if (this.state.readId !== newProps.readId) {
            this.setState({
                readId: newProps.readId,
            }, () => {
                this.list.forceUpdateGrid();
            });
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

    public setLoading(loading: boolean) {
        const state: any = {
            loading,
        };
        if (loading) {
            state.loadingPersist = true;
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
            this.list.scrollToRow(items.length - 1);
        } else {
            this.list.scrollToRow(items.length - 1);
            setTimeout(() => {
                if (instant) {
                    this.list.scrollToPosition(100000);
                } else {
                    const el = document.querySelector('.chat.active-chat');
                    if (el) {
                        const eldiv = el.querySelector('.chat.active-chat > div');
                        if (eldiv) {
                            el.scroll({
                                behavior: 'smooth',
                                top: eldiv.clientHeight + 1000,
                            });
                        }
                    }
                }
            }, 200);
        }
    }

    public setScrollMode(mode: 'none' | 'end' | 'stay') {
        this.scrollMode = mode;
    }

    public fitList(forceScroll?: boolean, instant?: boolean) {
        setTimeout(() => {
            if (this.state.items.length === 0) {
                this.setState({
                    listStyle: {
                        paddingTop: '0px',
                    },
                });
                return;
            }
            const list = document.querySelector('.chat.active-chat > div');
            if (list) {
                const diff = (this.list.props.height - 8) - list.scrollHeight;
                if (diff > 0) {
                    this.setState({
                        listStyle: {
                            paddingTop: diff + 'px',
                        },
                    });
                    return;
                }
            }
            this.setState({
                listStyle: {
                    paddingTop: '0px',
                },
            });
            if (forceScroll === true) {
                this.animateToEnd(true);
            }
        }, instant ? 0 : 200);
    }

    public render() {
        const {items, moreAnchorEl, peer, selectable, listStyle} = this.state;
        return (
            <AutoSizer>
                {({width, height}: any) => (
                    <div
                        className={((peer && peer.getType() === PeerType.PEERGROUP) ? 'group' : 'user') + (selectable ? ' selectable' : '')}>
                        <List
                            ref={this.refHandler}
                            deferredMeasurementCache={this.cache}
                            rowHeight={this.cache.rowHeight}
                            rowRenderer={this.rowRender}
                            rowCount={items.length}
                            overscanRowCount={10}
                            width={width}
                            height={height}
                            estimatedRowSize={41}
                            onRowsRendered={this.onRowsRenderedHandler}
                            noRowsRenderer={this.noRowsRenderer}
                            onScroll={this.onScroll}
                            style={listStyle}
                            className="chat active-chat"
                        />
                        <Menu
                            anchorEl={moreAnchorEl}
                            open={Boolean(moreAnchorEl)}
                            onClose={this.moreCloseHandler}
                            className="kk-context-menu"
                        >
                            {this.contextMenuItem()}
                        </Menu>
                    </div>
                )}
            </AutoSizer>
        );
    }

    private contextMenuItem() {
        const {items, moreIndex} = this.state;
        if (!items[moreIndex]) {
            return '';
        }
        const menuItem = {
            1: {
                cmd: 'reply',
                title: 'Reply',
            },
            2: {
                cmd: 'forward',
                title: 'Forward',
            },
            3: {
                cmd: 'edit',
                title: 'Edit',
            },
            4: {
                cmd: 'remove',
                title: 'Remove',
            },
            5: {
                cmd: 'cancel',
                title: 'Cancel',
            },
            6: {
                cmd: 'resend',
                title: 'Resend',
            },
            7: {
                cmd: 'download',
                title: 'Download',
            },
            8: {
                cmd: 'save',
                title: 'Save',
            },
        };
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
                        menuItems.push(menuItem[key]);
                    }
                } else {
                    menuItems.push(menuItem[key]);
                }
            });
        } else if (me === true && id && id > 0) {
            menuTypes[1].forEach((key) => {
                if (key === 3) {
                    if ((this.riverTime.now() - (items[moreIndex].createdon || 0)) < 86400 &&
                        (items[moreIndex].fwdsenderid === '0' || !items[moreIndex].fwdsenderid) &&
                        (items[moreIndex].messagetype === C_MESSAGE_TYPE.Normal || (items[moreIndex].messagetype || 0) === 0)
                    ) {
                        menuItems.push(menuItem[key]);
                    }
                } else if (key === 7) {
                    if (!items[moreIndex].downloaded && [C_MESSAGE_TYPE.File, C_MESSAGE_TYPE.Voice].indexOf(items[moreIndex].messagetype || 0) > -1) {
                        menuItems.push(menuItem[key]);
                    }
                } else if (key === 8) {
                    if (items[moreIndex].downloaded && [C_MESSAGE_TYPE.File, C_MESSAGE_TYPE.Voice].indexOf(items[moreIndex].messagetype || 0) > -1) {
                        menuItems.push(menuItem[key]);
                    }
                } else {
                    menuItems.push(menuItem[key]);
                }
            });
        } else if (me === false && id && id > 0) {
            menuTypes[2].forEach((key) => {
                if (key === 7) {
                    if (!items[moreIndex].downloaded && [C_MESSAGE_TYPE.File, C_MESSAGE_TYPE.Voice].indexOf(items[moreIndex].messagetype || 0) > -1) {
                        menuItems.push(menuItem[key]);
                    }
                } else if (key === 8) {
                    if (items[moreIndex].downloaded && [C_MESSAGE_TYPE.File, C_MESSAGE_TYPE.Voice].indexOf(items[moreIndex].messagetype || 0) > -1) {
                        menuItems.push(menuItem[key]);
                    }
                } else {
                    menuItems.push(menuItem[key]);
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
                    return this.messageItem(index, message, this.state.peer, this.state.readId, style, measure);
                }}
            </CellMeasurer>
        );
    }

    private noRowsRenderer = () => {
        if (this.state.loading) {
            return (<div className="chat-placeholder"/>);
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
                        <span className="system-message divider">New Message</span>
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
                             className={'bubble-wrapper _bubble' + (message.me ? ' me' : ' you') + (message.avatar ? ' avatar' : '') + (this.state.selectedIds.hasOwnProperty(message.id || 0) ? ' selected' : '') + this.getMessageType(message) + ((message.me && message.error) ? ' has-error' : '')}
                             onClick={this.toggleSelectHandler.bind(this, message.id || 0, index)}
                             onDoubleClick={this.selectMessage.bind(this, index)}
                        >
                            {(!this.state.selectable && message.avatar && message.senderid && !message.me) && (
                                <UserAvatar id={message.senderid} className="avatar"/>
                            )}
                            {this.state.selectable && <Checkbox
                                className={'checkbox ' + (this.state.selectedIds.hasOwnProperty(message.id || 0) ? 'checked' : '')}
                                color="primary" checked={this.state.selectedIds.hasOwnProperty(message.id || 0)}
                                onChange={this.selectMessageHandler.bind(this, message.id || 0, index)}/>}
                            {Boolean(message.avatar && message.senderid) && (<div className="arrow"/>)}
                            {Boolean(message.me && message.error) && <span className="error"><ErrorRounded/></span>}
                            <div ref={parenElRefHandler}
                                 className={'bubble b_' + message.id + ((message.editedon || 0) > 0 ? ' edited' : '')}>
                                {Boolean(peer && peer.getType() === PeerType.PEERGROUP && message.avatar && !message.me) &&
                                <UserName className="name" uniqueColor={false} id={message.senderid || ''}/>}
                                {Boolean(message.replyto && message.replyto !== 0) &&
                                <MessagePreview message={message} peer={peer}
                                                onDoubleClick={this.moreCmdHandler.bind(this, 'reply', index)}
                                                onClick={this.props.onJumpToMessage.bind(this, message.replyto)}
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

    private onScroll = (params: ScrollParams) => {
        this.scrollTop = params.scrollTop;
        if (params.clientHeight < params.scrollHeight && params.scrollTop > 200) {
            this.topOfList = false;
        }
        if (this.topOfList) {
            return;
        }
        if (params.clientHeight < params.scrollHeight && params.scrollTop < 2) {
            this.topOfList = true;
            if (typeof this.props.onLoadMoreBefore === 'function') {
                this.props.onLoadMoreBefore();
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
        if (data.startIndex > -1 && items[data.startIndex]) {
            // Show/Hide date
            if (items[data.startIndex].messagetype === C_MESSAGE_TYPE.Date ||
                (items[data.startIndex + 1] && items[data.startIndex + 1].messagetype === C_MESSAGE_TYPE.Date)) {
                if (this.props.showDate) {
                    this.props.showDate(null);
                }
            } else {
                if (this.props.showDate) {
                    this.props.showDate(items[data.startIndex].createdon || 0);
                }
            }

            // On load more after
            if (data.stopIndex > -1 && items[data.stopIndex]) {
                if (items[data.stopIndex].messagetype === C_MESSAGE_TYPE.Gap && items[data.stopIndex].id && this.props.onLoadMoreAfter) {
                    this.props.onLoadMoreAfter(items[data.stopIndex].id || 0);
                }
            }
        }

        this.messageScroll = data;

        if (this.props.rendered) {
            this.props.rendered(data);
        }
    }

    private selectText = (e: any) => {
        e.stopPropagation();
        const elem = e.currentTarget;
        // @ts-ignore
        if (document.selection) { // IE
            // @ts-ignore
            const range = document.body.createTextRange();
            range.moveToElementText(elem);
            range.select();
        } else if (window.getSelection) {
            const range = document.createRange();
            range.selectNode(elem);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
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
                    <UserName className="user" id={message.senderid || ''}/> Joined River</span>);
            case C_MESSAGE_ACTION.MessageActionGroupCreated:
                return (<span className="system-message"><UserName className="sender" id={message.senderid || ''}
                                                                   you={true}/> created the Group</span>);
            case C_MESSAGE_ACTION.MessageActionGroupAddUser:
                if (!message.actiondata) {
                    return (<span className="system-message">
                        <UserName className="user" id={message.senderid || ''} you={true}/> Added a User</span>);
                } else {
                    return (<span className="system-message">
                        <UserName className="user" id={message.senderid || ''}
                                  you={true}/> Added {message.actiondata.useridsList.map((id: string, index: number) => {
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
                                                                       you={true}/> Removed a User</span>);
                } else {
                    if (message.actiondata.useridsList.indexOf(message.senderid) > -1) {
                        return (
                            <span className="system-message"><UserName className="user" id={message.senderid || ''}
                                                                       you={true}/> Left</span>);
                    }
                    return (<span className="system-message">
                    <UserName className="user" id={message.senderid || ''}
                              you={true}/> Removed {message.actiondata.useridsList.map((id: string, index: number) => {
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
                                                                       you={true}/> Changed the Title</span>);
                } else {
                    return (<span className="system-message"><UserName className="user" id={message.senderid || ''}
                                                                       you={true}/> Changed the Title to '{message.actiondata.grouptitle}'</span>);
                }
            case C_MESSAGE_ACTION.MessageActionClearHistory:
                return (<span className="system-message">History cleared</span>);
            case C_MESSAGE_ACTION.MessageActionGroupPhotoChanged:
                if (!message.actiondata) {
                    return (<span className="system-message"><UserName className="user" id={message.senderid || ''}
                                                                       you={true}/> Removed the Group Photo</span>);
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
                                    <UserName className="user" id={message.senderid || ''} you={true}/> Removed Group Photo
                                </span>
                            </div>
                        );
                    } else {
                        return (
                            <div className="system-message-with-picture">
                                <span className="system-message">
                                    <UserName className="user" id={message.senderid || ''} you={true}/> Changed Group Photo
                                </span>
                                <CachedPhoto className="picture" fileLocation={fileLocation.toObject()}/>
                            </div>
                        );
                    }
                }
            default:
                return (<span className="system-message">Unsupported system message</span>);
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
    private renderBody(message: IMessage) {
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
            return elems.map((elem, i) => {
                switch (elem.type) {
                    case MessageEntityType.MESSAGEENTITYTYPEMENTION:
                        if (elem.str.indexOf('@') === 0) {
                            return (
                                <UserName key={i} className="_mention" id={elem.userId} username={true} prefix="@"
                                          unsafe={true} defaultString={elem.str.substr(1)}/>);
                        } else {
                            return (<UserName key={i} className="_mention" id={elem.userId} unsafe={true}
                                              defaultString={elem.str}/>);
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
                        return (<a key={i} href={elem.str} target="_blank" className="_url">{elem.str}</a>);
                    default:
                        return (<span key={i}>{elem.str}</span>);
                }
            });
        }
    }

    /* Modify scroll position based on scroll mode */
    private modifyScroll(items: IMessage[]) {
        switch (this.scrollMode) {
            case 'stay':
                const index = (items.length - this.listCount) + 1;
                const msg = items[index];
                setTimeout(() => {
                    this.list.scrollToRow(index);
                    if (msg) {
                        this.checkScroll(msg.id || 0);
                    }
                }, 10);
                return;
            case 'end':
                this.animateToEnd(true);
                return;
            default:
                break;
        }
    }

    /* Try to find correct position */
    private checkScroll(id: number, tries?: number) {
        const el = document.querySelector(`.bubble-wrapper .bubble.b_${Math.floor(id)}`);
        if (this.scrollTop > 0 && el) {
            if (el.parentElement) {
                const scroll = parseInt(window.getComputedStyle(el.parentElement).getPropertyValue('top').replace(/^\D+/g, ''), 10);
                this.list.scrollToPosition(scroll);
            }
        } else {
            if (!tries) {
                tries = 1;
            } else {
                tries++;
            }
            if (tries <= 60) {
                window.requestAnimationFrame(() => {
                    this.checkScroll(id, tries);
                });
            }
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
                    return 'Unsupported message';
            }
        } else {
            return (
                <div className={'inner ' + (message.rtl ? 'rtl' : 'ltr')}
                     onDoubleClick={this.selectText}>{this.renderBody(message)}</div>
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
            case C_MESSAGE_TYPE.Music:
                type = 'music';
                break;
        }
        if (type === 'media') {
            const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
            if ((messageMediaDocument.caption || '').length > 0) {
                type = 'media_caption';
            }
        }
        let related = '';
        if (message.replyto || (message.fwdsenderid && message.fwdsenderid !== '0')) {
            related = 'related';
        }
        return ` ${type} ${related}`;
    }
}

export default Message;
