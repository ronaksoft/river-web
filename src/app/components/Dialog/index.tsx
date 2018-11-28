import * as React from 'react';
import {List, AutoSizer} from 'react-virtualized';
import {Link} from 'react-router-dom';
import {findIndex} from 'lodash';
import {IDialog} from '../../repository/dialog/interface';
import DialogMessage from '../DialogMessage';
import {MessageRounded} from '@material-ui/icons';

import './style.css';

interface IProps {
    cancelIsTyping: (id: string) => void;
    isTypingList: { [key: string]: boolean };
    items: IDialog[];
    selectedId: string;
}

interface IState {
    isTypingList: { [key: string]: boolean };
    items: IDialog[];
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
            scrollIndex: -1,
            selectedId: props.selectedId,
        };
    }

    public componentDidMount() {
        this.list.recomputeRowHeights();
        this.list.forceUpdateGrid();
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
            // @ts-ignore
            const index = findIndex(this.state.items, {id: newProps.selectedId});
            this.setState({
                isTypingList: newProps.isTypingList,
                items: newProps.items,
                scrollIndex: index,
                selectedId: newProps.selectedId,
            }, () => {
                this.list.recomputeRowHeights();
                this.list.forceUpdateGrid();
            });
        }
    }

    public render() {
        const {items} = this.state;
        return (
            <AutoSizer>
                {({width, height}: any) => (
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
                )}
            </AutoSizer>
        );
    }

    private refHandler = (value: any) => {
        this.list = value;
    }

    private rowRender = ({index, key, parent, style}: any): any => {
        const data = this.state.items[index];
        const isTyping = this.state.isTypingList.hasOwnProperty(data.peerid || '');
        return (
            <div style={style} key={index}>
                <Link to={`/conversation/${data.peerid}`}>
                    <div className={'dialog' + (data.peerid === this.state.selectedId ? ' active' : '')}>
                        <DialogMessage dialog={data} isTyping={isTyping} cancelIsTyping={this.props.cancelIsTyping}/>
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
}

export default Dialog;
