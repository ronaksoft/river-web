/*
    Creation Time: 2018 - Oct - 09
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {VariableSizeList as List} from "react-window";
import {random, range} from 'lodash';
import {CellMeasurer} from "./utils";

import './style.scss';

interface IProps {
    match?: any;
    location?: any;
    history?: any;
}

interface IState {
    items: any[];
    test: boolean;
}

const loremIpsum = `
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
  labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
  nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
  esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
  in culpa qui officia deserunt mollit anim id est laborum.
`;

const loremIpsumSplit = loremIpsum.split(" ");

class Test extends React.Component<IProps, IState> {
    private list: List | undefined;
    private cellMeasurer: CellMeasurer;
    private index: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: [],
            test: true,
        };

        this.cellMeasurer = new CellMeasurer({
            estimatedItemSize: 41,
            keyMapper: this.keyMapper,
        });
    }

    public componentDidMount() {
        const items = this.getItems(40);
        this.setState({
            items,
        }, () => {
            this.scrollToEnd();
        });
    }

    public componentWillUnmount() {
        //
    }

    public render() {
        const {items} = this.state;
        return (
            <div>
                <button onClick={this.prependHandler}>prepend</button>
                <button onClick={this.appendHandler}>append</button>
                <button onClick={this.updateHandler}>update</button>
                <List
                    ref={this.listRefHandler}
                    height={500}
                    width={300}
                    itemCount={items.length}
                    itemSize={this.cellMeasurer.getHeight}
                    itemKey={this.keyMapper}
                    overscanCount={60}
                    estimatedItemSize={40}
                >
                    {({index, style}) => {
                        const item = items[index];
                        return <div key={item.id} ref={this.cellMeasurer.cellRefHandler(index)} style={style}>{item.body}</div>;
                    }}
                </List>
            </div>
        );
    }

    private getItems(count: number) {
        return range(count).map((key) => {
            const rand = random(loremIpsumSplit.length);
            return ({
                body: <div key={key} style={{border: '1px solid #333'}}>
                    {loremIpsumSplit.slice(0, rand).join(" ")}
                    <img
                        src="https://i1.wp.com/blog.logrocket.com/wp-content/uploads/2019/10/npm-nocdn.png?fit=1240%2C700&ssl=1"
                        height={rand}/>
                </div>,
                id: this.index++,
            });
        });
    }

    private listRefHandler = (ref: any) => {
        this.list = ref;
        this.cellMeasurer.setRef(ref);
        this.scrollToEnd();
    }

    private scrollToEnd() {
        const {items} = this.state;
        if (items.length > 0 && this.list) {
            this.list.scrollToItem(items.length - 1, "end");
        }
    }

    private prependHandler = () => {
        const {items} = this.state;
        items.unshift.apply(items, this.getItems(30));
        this.setState({
            items,
        });
    }

    private appendHandler = () => {
        const {items} = this.state;
        items.push.apply(items, this.getItems(30));
        this.setState({
            items,
        });
    }

    private updateHandler = () => {
        const {items} = this.state;
        if (items.length > 0) {
            items[items.length - 1].body = '43344';
            this.cellMeasurer.clear(items.length - 1);
            this.setState({
                items,
            });
        }
    }

    private keyMapper = (index: number) => {
        const {items} = this.state;
        return String(items[index].id);
    }
}

export default Test;
