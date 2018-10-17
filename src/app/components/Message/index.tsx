import * as React from 'react';
import {List, CellMeasurer, CellMeasurerCache, AutoSizer} from 'react-virtualized';
import {IMessage} from '../../repository/message/interface';
import './style.css';
import UserAvatar from '../UserAvatar';
import MessageStatus from '../MessageStatus';
import {MoreVert} from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MessagePreview from "../MessagePreview";

interface IProps {
    contextMenu?: (cmd: string, id: IMessage) => void;
    items: IMessage[];
    onLoadMore?: () => any;
    readId: number;
    rendered?: () => void;
}

interface IState {
    items: IMessage[];
    listStyle?: React.CSSProperties;
    moreAnchorEl: any;
    moreIndex: number;
    noTransition: boolean;
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
            readId: props.readId,
            scrollIndex: -1,
        };
        this.cache = new CellMeasurerCache({
            fixedWidth: true,
            minHeight: 35,
        });
    }

    public componentDidMount() {
        this.setState({
            items: this.props.items,
            moreAnchorEl: null,
            moreIndex: -1,
            noTransition: true,
            scrollIndex: this.props.items.length - 1,
        }, () => {
            this.fitList();
            setTimeout(() => {
                this.setState({
                    noTransition: false,
                });
            }, 50);
        });
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
                            overscanRowCount={5}
                            width={width}
                            height={height}
                            scrollToIndex={this.state.scrollIndex}
                            onRowsRendered={this.props.rendered}
                            onScroll={this.onScroll}
                            style={this.state.listStyle}
                            className={'chat active-chat' + (this.state.noTransition ? ' no-transition' : '')}
                        />
                        <Menu
                            id="simple-menu"
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

    private formatText(text: string | undefined) {
        text = text || '';
        return text.split('\n').join('<br/>');
    }

    private rowRender = ({index, key, parent, style}: any): any => {
        const data = this.state.items[index];
        return (
            <CellMeasurer
                cache={this.cache}
                columnIndex={0}
                key={key}
                rowIndex={index}
                parent={parent}>
                <div style={style} key={data.id}
                     className={'bubble-wrapper ' + (data.me ? 'me' : 'you') + (data.avatar ? ' avatar' : '')}>
                    {(data.avatar && data.senderid && !data.me) && (
                        <UserAvatar id={data.senderid} className="avatar"/>
                    )}
                    {(data.avatar && data.senderid) && (<div className="arrow"/>)}
                    <div className={'bubble b_' + data._id}>
                        <MessagePreview message={data}/>
                        <div className={'inner' + (data.rtl ? ' rtl' : '')}
                             dangerouslySetInnerHTML={{__html: this.formatText(data.body)}}/>
                        <MessageStatus status={data.me || false} id={data.id} readId={this.state.readId}
                                       time={data.createdon || 0}/>
                        <div className="more" onClick={this.contextMenuHandler.bind(this, index)}>
                            <MoreVert/>
                        </div>
                    </div>
                </div>
            </CellMeasurer>
        );
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
                }, 52);
            }
        }, 10);
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

    private moreCmdHandler = (cmd: string, index: number) => {
        if (this.props.contextMenu && index > -1) {
            this.props.contextMenu(cmd, this.state.items[index]);
        }
        this.setState({
            moreAnchorEl: null,
        });
    }
}

export default Message;