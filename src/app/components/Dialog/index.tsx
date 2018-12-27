import * as React from 'react';
import {List, AutoSizer} from 'react-virtualized';
import {Link} from 'react-router-dom';
import {findIndex} from 'lodash';
import {IDialog} from '../../repository/dialog/interface';
import DialogMessage from '../DialogMessage';
import {MessageRounded} from '@material-ui/icons';
import Menu from '@material-ui/core/Menu/Menu';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import {PeerType} from '../../services/sdk/messages/core.types_pb';

import './style.css';

interface IProps {
    cancelIsTyping: (id: string) => void;
    isTypingList: { [key: string]: { [key: string]: any } };
    items: IDialog[];
    onContextMenu?: (cmd: string, dialog: IDialog) => void;
    selectedId: string;
}

interface IState {
    isTypingList: { [key: string]: { [key: string]: any } };
    items: IDialog[];
    moreAnchorEl: any;
    moreIndex: number;
    selectedId: string;
    scrollIndex: number;
}

class Dialog extends React.Component<IProps, IState> {
    private list: List;

    constructor(props: IProps) {
        super(props);

        this.state = {
            isTypingList: props.isTypingList,
            items: props.items,
            moreAnchorEl: null,
            moreIndex: -1,
            scrollIndex: -1,
            selectedId: props.selectedId,
        };
    }

    public componentDidMount() {
        this.list.recomputeRowHeights();
        this.list.forceUpdateGrid();
        const index = findIndex(this.state.items, {peerid: this.state.selectedId});
        this.list.scrollToRow(index);
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.items !== newProps.items) {
            this.setState({
                isTypingList: newProps.isTypingList,
                items: newProps.items,
                scrollIndex: -1,
                selectedId: newProps.selectedId,
            }, () => {
                this.list.recomputeRowHeights();
            });
        } else {
            const index = findIndex(this.state.items, {peerid: newProps.selectedId});
            this.setState({
                isTypingList: newProps.isTypingList,
                items: newProps.items,
                scrollIndex: index,
                selectedId: newProps.selectedId,
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
                    <React.Fragment>
                        <List
                            ref={this.refHandler}
                            rowHeight={64}
                            rowRenderer={this.rowRender}
                            rowCount={items.length}
                            overscanRowCount={0}
                            scrollToIndex={this.state.scrollIndex}
                            width={width}
                            height={height}
                            className="dialog-container"
                            noRowsRenderer={this.noRowsRenderer}
                        />
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
        );
    }

    private refHandler = (value: any) => {
        this.list = value;
    }

    private rowRender = ({index, key, parent, style}: any): any => {
        const data = this.state.items[index];
        const isTyping = this.state.isTypingList.hasOwnProperty(data.peerid || '') ? this.state.isTypingList[data.peerid || ''] : {};
        return (
            <div style={style} key={data.peerid || key}>
                <Link to={`/conversation/${data.peerid}`}>
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
        const {items} = this.state;
        if (!items || index === -1) {
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
        const {items, moreIndex} = this.state;
        if (!items[moreIndex]) {
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
        const peerType = items[moreIndex].peertype;

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
}

export default Dialog;
