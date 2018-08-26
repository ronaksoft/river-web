import * as React from 'react';
import {List} from 'react-virtualized';

import 'react-virtualized/styles.css';

interface IProps {
    items: any;
}

interface IState {
    items: any;
}

class OptimizedList extends React.Component<IProps, IState> {
    private List: any;

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: props.items,
        };
        window.console.log(this.List);
    }

    public render() {
        const {items} = this.props;
        return (
            <List
                ref={this.refHandler}
                rowHeight={this.getHeight}
                rowRenderer={this.rowRender}
                rowCount={items.length}
                width={300}
                height={500}
                className="kk-list"
            />
        );
    }

    private refHandler = (value: any) => {
        this.List = value;
    }

    private getHeight = (params: any): any => {
        return this.state.items[params.index].height;
    }

    private rowRender = ({index, key, style}: any): any => {
        const data = this.state.items[index];
        return (
            <div key={key} style={style}>{data.value}</div>
        );
    }
}

export default OptimizedList;