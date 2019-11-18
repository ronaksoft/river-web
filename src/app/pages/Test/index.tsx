/*
    Creation Time: 2018 - Oct - 09
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {random, range} from 'lodash';
import {CellMeasurer} from "./utils";
import Fragment from "./fragment";
import AutoSizer from "react-virtualized-auto-sizer";
// @ts-ignore
import pic from "../../../asset/image/about/river.png";

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
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
  labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
  nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
  esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
  in culpa qui officia deserunt mollit anim id est laborum.
`;

const loremIpsumSplit = loremIpsum.split(" ");

class Test extends React.Component<IProps, IState> {
    private cellMeasurer: CellMeasurer;
    private index: number = 0;
    private containerRef: any = undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: [],
            test: true,
        };

        this.cellMeasurer = new CellMeasurer({
            estimatedItemSize: 41,
            keyMapper: this.keyMapper,
            rowCount: 50,
        });

        this.cellMeasurer.setUpdateFn(this.updateFnHandler);
    }

    public componentDidMount() {
        const items = this.getItems(50);
        this.setState({
            items,
        });
    }

    public componentWillUnmount() {
        //
    }

    public render() {
        const {items} = this.state;
        return (
            <div>
                <div className="fixed">
                    <button onClick={this.prependHandler}>prepend</button>
                    <button onClick={this.appendHandler}>append</button>
                    <button onClick={this.updateHandler}>update</button>
                </div>
                <div className="chat-container">
                    <AutoSizer>
                        {({width, height}: any) => (
                            <div ref={this.containerRefHandler} className="scroll-view"
                                 style={{width: `${width}px`, height: `${height}px`}}
                                 onScroll={this.scrollHandler(height)}>
                                {items.map((item, index) => {
                                    return (<div key={item.id} ref={this.cellMeasurer.cellRefHandler(index)}>
                                        <Fragment visFn={this.cellMeasurer.visibleHandler(index)} body={item.body}/>
                                    </div>);
                                })}
                            </div>
                        )}
                    </AutoSizer>
                </div>
            </div>
        );
    }

    private getItems(count: number) {
        return range(count).map((key) => {
            const rand = random(loremIpsumSplit.length);
            this.index++;
            return ({
                body: <div key={key} style={{border: '1px solid #333'}}>
                    {loremIpsumSplit.slice(0, rand).join(" ")}
                    {range(random(4)).map((tt) => {
                        const rnd = random(loremIpsumSplit.length);
                        return (<img key={tt} src={pic} height={rnd} alt=""/>);
                    })}
                </div>,
                id: this.index,
            });
        });
    }

    private prependHandler = () => {
        const {items} = this.state;
        items.unshift.apply(items, this.getItems(30));
        this.cellMeasurer.setRowCount(items.length);
        window.console.log(items);
        this.setState({
            items,
        });
    }

    private appendHandler = () => {
        const {items} = this.state;
        items.push.apply(items, this.getItems(30));
        this.cellMeasurer.setRowCount(items.length);
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

    private updateFnHandler = () => {
        if (this.containerRef) {
            window.console.log(this.containerRef.scrollHeight, this.containerRef.clientHeight);
            this.containerRef.scrollTop = this.containerRef.scrollHeight - this.containerRef.clientHeight;
        }
    }

    private scrollHandler = (height: number) => (e: any) => {
        this.cellMeasurer.scrollHandler(height, e.target.scrollTop);
    }

    private containerRefHandler = (ref: any) => {
        this.containerRef = ref;
    }
}

export default Test;
