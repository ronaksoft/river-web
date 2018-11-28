import * as React from 'react';
import {AutoSizer, CellMeasurer, CellMeasurerCache, List} from 'react-virtualized';
import {IMessage} from '../../repository/message/interface';
import './style.css';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {InputPeer, PeerType} from "../../services/sdk/messages/core.types_pb";
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE} from "../../repository/message/consts";
import TimeUtility from '../../services/utilities/time';
import UserAvatar from '../UserAvatar';
import MessagePreview from '../MessagePreview';
import MessageStatus from '../MessageStatus';
import {MoreVert} from '@material-ui/icons';
import UserName from '../UserName';

interface IProps {
    contextMenu?: (cmd: string, id: IMessage) => void;
    items: IMessage[];
    onLoadMore?: () => any;
    peer: InputPeer | null;
    readId: number;
    rendered?: (info: any) => void;
    showDate?: (timestamp: number | null) => void;
}

interface IState {
    items: IMessage[];
    listStyle?: React.CSSProperties;
    moreAnchorEl: any;
    moreIndex: number;
    noTransition: boolean;
    peer: InputPeer | null;
    readId: number;
    readIdInit: number;
    scrollIndex: number;
}

class Message extends React.Component<IProps, IState> {
    public list: List;
    public cache: CellMeasurerCache;
    private listCount: number;
    private topOfList: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: props.items,
            moreAnchorEl: null,
            moreIndex: -1,
            noTransition: false,
            peer: props.peer,
            readId: props.readId,
            readIdInit: -1,
            scrollIndex: -1,
        };
        this.cache = new CellMeasurerCache({
            fixedWidth: true,
            keyMapper: this.keyMapperHandler,
            minHeight: 35,
        });
    }

    public componentDidMount() {
        this.fitList(true);
        setTimeout(() => {
            this.setState({
                noTransition: false,
            });
        }, 50);
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
                noTransition: true,
                peer: newProps.peer,
                readIdInit: newProps.readId,
                scrollIndex: newProps.items.length - 1,
            }, () => {
                this.fitList(true);
                setTimeout(() => {
                    this.setState({
                        noTransition: false,
                    });
                }, 250);
            });
            this.listCount = newProps.items.length;
            this.topOfList = false;
        } else if (this.state.items === newProps.items && this.listCount < newProps.items.length) {
            if (!this.topOfList) {
                this.setState({
                    scrollIndex: -1,
                }, () => {
                    this.fitList();
                });
            } else {
                this.list.scrollToRow((newProps.items.length - this.listCount));
            }
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
    }

    public render() {
        const {items, moreAnchorEl} = this.state;
        return (
            <AutoSizer>
                {({width, height}: any) => (
                    <div>
                        <List
                            ref={this.refHandler}
                            deferredMeasurementCache={this.cache}
                            rowHeight={this.cache.rowHeight}
                            rowRenderer={this.rowRender}
                            rowCount={items.length}
                            overscanRowCount={8}
                            width={width}
                            height={height}
                            estimatedRowSize={41}
                            scrollToIndex={this.state.scrollIndex}
                            onRowsRendered={this.onRowsRenderedHandler}
                            onScroll={this.onScroll}
                            style={this.state.listStyle}
                            className={'chat active-chat' + (this.state.noTransition ? ' no-transition' : '')}
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
        };
        const menuTypes = {
            1: [1, 2, 3, 4],
            2: [1, 2],
            3: [5],
        };
        const menuItems: any[] = [];
        const id = items[moreIndex].id;
        const me = items[moreIndex].me;
        if (id && id < 0) {
            menuTypes[3].forEach((key) => {
                menuItems.push(menuItem[key]);
            });
        } else if (me === true && id && id > 0) {
            menuTypes[1].forEach((key) => {
                menuItems.push(menuItem[key]);
            });
        } else if (me === false && id && id > 0) {
            menuTypes[2].forEach((key) => {
                menuItems.push(menuItem[key]);
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
                {this.messageItem(index, message, this.state.peer, this.state.readId, style)}
            </CellMeasurer>
        );
    }

    private messageItem(index: number, message: IMessage, peer: InputPeer | null, readId: number, style: any) {
        switch (message.messagetype) {
            case C_MESSAGE_TYPE.NewMessage:
                return (
                    <div style={style} className="bubble-wrapper">
                        <span className="system-message divider">New Message</span>
                    </div>
                );
            case C_MESSAGE_TYPE.Date:
                return (
                    <div style={style} className="bubble-wrapper">
                        <span className="date">{TimeUtility.dynamicDate(message.createdon || 0)}</span>
                    </div>
                );
            case C_MESSAGE_TYPE.System:
                return (
                    <div style={style} className="bubble-wrapper">
                        {this.renderSystemMessage(message)}
                    </div>
                );
            case C_MESSAGE_TYPE.Normal:
            default:
                return (
                    <div style={style}
                         className={'bubble-wrapper ' + (message.me ? 'me' : 'you') + (message.avatar ? ' avatar' : '')}>
                        {(message.avatar && message.senderid && !message.me) && (
                            <UserAvatar id={message.senderid} className="avatar"/>
                        )}
                        {(message.avatar && message.senderid) && (<div className="arrow"/>)}
                        <div className={'bubble b_' + message.id + ((message.editedon || 0) > 0 ? ' edited' : '')}>
                            {Boolean(peer && peer.getType() === PeerType.PEERGROUP && message.avatar) &&
                            <UserName className="name" uniqueColor={true} id={message.senderid || ''}/>}
                            {Boolean(message.replyto && message.replyto !== 0) &&
                            <MessagePreview message={message} peer={peer}
                                            onDoubleClick={this.moreCmdHandler.bind(this, 'reply', index)}/>}
                            <div className={'inner ' + (message.rtl ? 'rtl' : 'ltr')}
                                 onDoubleClick={this.selectText}>{message.body}</div>
                            <MessageStatus status={message.me || false} id={message.id} readId={readId}
                                           time={message.createdon || 0} editedTime={message.editedon || 0}
                                           onDoubleClick={this.moreCmdHandler.bind(this, 'reply', index)}/>
                            <div className="more" onClick={this.contextMenuHandler.bind(this, index)}>
                                <MoreVert/>
                            </div>
                        </div>
                    </div>
                );
        }
    }

    private fitList(forceScroll?: boolean) {
        setTimeout(() => {
            if (this.state.items.length === 0) {
                this.setState({
                    listStyle: {
                        paddingTop: '460px',
                    },
                });
                return;
            }
            const list = document.querySelector('.chat.active-chat > div');
            if (list) {
                const diff = this.list.props.height - list.clientHeight;
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
                    paddingTop: '10px',
                },
            });
            if (forceScroll === true) {
                setTimeout(() => {
                    const el = document.querySelector('.chat.active-chat');
                    if (el) {
                        el.scroll({
                            behavior: 'instant',
                            top: 1000000,
                        });
                    }
                }, 55);
            }
        }, 50);
    }

    private onScroll = (params: any) => {
        if (params.clientHeight < params.scrollHeight && params.scrollTop > 200) {
            this.topOfList = false;
        }
        if (this.topOfList) {
            return;
        }
        if (params.clientHeight < params.scrollHeight && params.scrollTop < 2) {
            this.topOfList = true;
            if (typeof this.props.onLoadMore === 'function') {
                this.props.onLoadMore();
            }
        }
    }

    private contextMenuHandler = (index: number, e: any) => {
        if (index === -1) {
            return;
        }
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
        if (this.props.contextMenu && index > -1) {
            this.props.contextMenu(cmd, this.state.items[index]);
        }
        this.setState({
            moreAnchorEl: null,
        });
    }


    private onRowsRenderedHandler = (data: any) => {
        const {items} = this.state;
        if (data.startIndex > -1) {
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
        }

        if (this.props.rendered) {
            this.props.rendered(data);
        }
    }

    private selectText = (e: any) => {
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
        return `${items[rowIndex].id || 0}-${colIndex}-${items[rowIndex].messagetype || 0}`;
    }

    private renderSystemMessage(message: IMessage) {
        switch (message.messageaction) {
            case C_MESSAGE_ACTION.MessageActionContactRegistered:
                return (<span className="system-message">
                    <UserName className="user" id={message.senderid || ''}/> Joined River</span>);
            case C_MESSAGE_ACTION.MessageActionGroupCreated:
                return (<span className="system-message">Group Created</span>);
            case C_MESSAGE_ACTION.MessageActionJoined:
                return (<span className="system-message">
                    <UserName className="user" id={message.senderid || ''}/> Joined</span>);
            case C_MESSAGE_ACTION.MessageActionLeft:
                return (<span className="system-message">
                    <UserName className="user" id={message.senderid || ''}/> Left</span>);
            case C_MESSAGE_ACTION.MessageActionGroupTitleChanged:
                return (<span className="system-message">
                    <UserName className="user" id={message.senderid || ''}/> Changed the Group Title</span>);
            case C_MESSAGE_ACTION.MessageActionKicked:
                return (<span className="system-message">
                    <UserName className="user" id={message.senderid || ''}/> Was Kicked</span>);
            default:
                return '';
        }
    }
}

export default Message;
