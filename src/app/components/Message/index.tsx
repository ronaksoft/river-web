import * as React from 'react';
import {List, CellMeasurer, CellMeasurerCache, AutoSizer} from 'react-virtualized';
import {IMessage} from '../../repository/message/interface';
import './style.css';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {InputPeer} from "../../services/sdk/messages/core.types_pb";
import {C_MESSAGE_TYPE} from "../../repository/message/consts";
import TimeUtililty from '../../services/utilities/time';
import UserAvatar from '../UserAvatar';
import MessagePreview from '../MessagePreview';
import MessageStatus from '../MessageStatus';
import {MoreVert} from '@material-ui/icons';

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
    scrollIndex: number;
}

class Message extends React.Component<IProps, IState> {
    private list: any;
    private cache: any;
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
            scrollIndex: -1,
        };
        this.cache = new CellMeasurerCache({
            fixedWidth: true,
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
            this.setState({
                items: newProps.items,
                moreAnchorEl: null,
                moreIndex: -1,
                noTransition: true,
                peer: newProps.peer,
                scrollIndex: newProps.items.length - 1,
            }, () => {
                this.fitList(true);
                setTimeout(() => {
                    this.setState({
                        noTransition: false,
                    });
                }, 50);
            });
            this.listCount = newProps.items.length;
            this.topOfList = false;
        } else if (this.state.items === newProps.items && this.listCount < newProps.items.length) {
            if (!this.topOfList) {
                this.setState({
                    scrollIndex: this.listCount - 2,
                }, () => {
                    this.fitList();
                });
            } else {
                this.setState({
                    scrollIndex: (newProps.items.length - this.listCount) + 2,
                });
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
                            className="context-menu"
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
                {/*<MessageItem index={index} message={message} peer={this.state.peer} readId={this.state.readId}
                             style={style} moreCmdHandler={this.moreCmdHandler}
                             contextMenuHandler={this.contextMenuHandler}/>*/}
            </CellMeasurer>
        );
    }

    private messageItem(index: number, message: IMessage, peer: InputPeer | null, readId: number, style: any) {
        switch (message.type) {
            case C_MESSAGE_TYPE.Date:
                return (
                    <div style={style} className="bubble-wrapper">
                        <span className="date">{TimeUtililty.dynamicDate(message.createdon || 0)}</span>
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
                        <div className={'bubble b_' + message._id + ((message.editedon || 0) > 0 ? ' edited' : '')}
                             onDoubleClick={this.moreCmdHandler.bind(this, 'reply', index)}>
                            {Boolean(message.replyto && message.replyto !== 0) &&
                            <MessagePreview message={message} peer={peer}/>}
                            <div className={'inner ' + (message.rtl ? 'rtl' : 'ltr')}>{message.body}</div>
                            <MessageStatus status={message.me || false} id={message.id} readId={readId}
                                           time={message.createdon || 0} editedTime={message.editedon || 0}/>
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
            if (items[data.startIndex].type === C_MESSAGE_TYPE.Date ||
                (items[data.startIndex + 1] && items[data.startIndex + 1].type === C_MESSAGE_TYPE.Date)) {
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

}

export default Message;