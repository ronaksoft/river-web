import * as React from 'react';
import {SortableElement} from 'react-sortable-hoc';
import {List, CellMeasurer, CellMeasurerCache} from 'react-virtualized';

interface IProps {
    items: any;
}

interface IState {
    items: any;
}

const SortableItem = SortableElement(({index, style, data}: any) => {
    return (
        <div key={'order' + index}
             style={style}
             className="kk-sortable-row"
        >
            {data.value}
        </div>
    );
});

/**
 * @class FullName
 * @classdesc Component renders the FullName html element as an span
 * @extends {React.Component<IProps, IState>}
 */
class VirtualList extends React.Component<IProps, IState> {
    private list: any;
    private cache: any;

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: props.items,
        };
        window.console.log(this.list);
        this.cache = new CellMeasurerCache({
            fixedWidth: true,
            minHeight: 25,
        });
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            items: newProps.items,
        }, () => {
            this.cache.clearAll();
        });
    }

    public render() {
        const {items} = this.state;
        return (
            <List
                ref={this.refHandler}
                deferredMeasurementCache={this.cache}
                rowHeight={this.cache.rowHeight}
                rowRenderer={this.rowRender}
                rowCount={items.length}
                overscanRowCount={0}
                width={300}
                height={500}
                className="kk-list"
            />
        );
    }

    private refHandler = (value: any) => {
        this.list = value;
    };
    //
    // private getHeight = (params: any): any => {
    //     return this.state.items[params.index].height;
    // };

    private rowRender = ({index, key, parent, style}: any): any => {
        const data = this.state.items[index];
        return (
            <CellMeasurer
                cache={this.cache}
                columnIndex={0}
                key={key}
                rowIndex={index}
                parent={parent}>
                <SortableItem key={key} style={style} index={index} data={data}/>
            </CellMeasurer>
        );
    };
}

export default VirtualList;