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
import AutoSizer from "react-virtualized-auto-sizer";
// @ts-ignore
import pic from "../../../asset/image/about/river.png";

import './style.scss';
import KKWindow from "../../services/kkwindow/kkwindow";
import {scrollFunc} from "../../services/kkwindow/utils";

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
    private index: number = 0;
    private kkWindowRef: KKWindow | undefined;
    private containerRef: any | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: [],
            test: true,
        };
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
                            <div style={{width: `${width}px`}}>
                                <KKWindow
                                    ref={this.kkWindowRefHandler}
                                    height={height}
                                    width={width}
                                    count={items.length}
                                    renderer={this.renderer}
                                    onUpdate={this.updateFnHandler}
                                    onScrollPos={this.scrollPosHandler}
                                    onScrollUpdatePos={this.scrollPosUpdateHandler}
                                    keyMapper={this.keyMapper}
                                    containerRef={this.containerRefHandler}
                                />
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
                body: <div key={key} style={{border: '1px solid #333'}} onClick={this.clickHandler(this.index - 1)}>
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

    private renderer = (index: number) => {
        const {items} = this.state;
        return items[index].body;
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
            // if (this.kkWindowRef) {
            //     this.kkWindowRef.cellMeasurer.clear(items.length - 1);
            // }
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
            window.console.log('updateFnHandler');
        }
        if (this.kkWindowRef) {
            this.kkWindowRef.setScrollMode('none');
        }
    }

    private kkWindowRefHandler = (ref: any) => {
        this.kkWindowRef = ref;
    }

    private containerRefHandler = (ref: any) => {
        this.containerRef = ref;
    }

    private clickHandler = (index: number) => (e: any) => {
        const {items} = this.state;
        if (items.length > 0) {
            items[index].body = '43344';
            if (this.kkWindowRef) {
                this.kkWindowRef.cellMeasurer.clear(index);
            }
            this.setState({
                items,
            }, () => {
                if (this.kkWindowRef) {
                    this.kkWindowRef.recomputeItem(index);
                }
            });
        }
    }

    private scrollPosHandler: scrollFunc = ({start, end, overscanStart, overscanEnd}) => {
        window.console.log(overscanStart, start, end, overscanEnd);
    }

    private scrollPosUpdateHandler: scrollFunc = ({start, end, overscanStart, overscanEnd}) => {
        window.console.warn(overscanStart, start, end, overscanEnd);
    }
}

export default Test;
