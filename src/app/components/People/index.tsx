import * as React from 'react';
import {List, CellMeasurer, CellMeasurerCache} from 'react-virtualized';
import {Link} from 'react-router-dom';
import './style.css';

interface IProps {
    items: any[];
    selectedId: string;
}

interface IState {
    items: any[];
    selectedId: string;
}

class People extends React.Component<IProps, IState> {
    private list: any;
    private cache: any;

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: props.items,
            selectedId: props.selectedId,
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
            selectedId: newProps.selectedId,
        }, () => {
            this.list.recomputeRowHeights();
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
                width={318}
                height={550}
                className="people"
            />
        );
    }

    private refHandler = (value: any) => {
        this.list = value;
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
                <div style={style} key={index}>
                    <Link to={`/conversation/${data.id}`}>
                        <div className={'person' + (data.id === this.state.selectedId ? ' active' : '')}>
                            <img src={data.image} alt=""/>
                            <span className="name">{data.name}</span>
                            <span className="time">{data.date}</span>
                            <span className="preview">{data.message}</span>
                        </div>
                    </Link>
                </div>
            </CellMeasurer>
        );
    }
}

export default People;