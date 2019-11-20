import * as React from "react";
import Fragment from "./fragment";
import {CellMeasurer, scrollFunc} from "./utils";
import {range} from 'lodash';
import getScrollbarWidth from "../../services/utilities/scrollbar_width";

interface IProps {
    height: number;
    width: number;
    count: number;
    renderer: (index: number) => any;
    containerRef?: (ref: any) => void;
    keyMapper: (index: number) => string;
    onUpdate?: () => void;
    onScrollPos?: scrollFunc;
    onScrollUpdatePos?: scrollFunc;
    scrollMode?: 'end' | 'stay' | 'none';
    cellPrefix?: string;
}

interface IState {
    items: any[];
}

const containerStyle: any = {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    zIndex: '2',
};

const scrollbarStyle: any = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: '0',
    position: 'absolute',
    right: '0',
    top: '0',
    width: '10px',
};

const scrollbarThumbStyle: any = {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '8px',
    cursor: 'pointer',
    height: '10%',
    left: '2px',
    position: 'absolute',
    right: '2px',
    top: '10%',
    transform: 'scaleY(0.95)',
    transformOrigin: 'center center',
};

class KKWindow extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        return {
            items: range(props.count),
        };
    }

    public cellMeasurer: CellMeasurer;
    private containerRef: any | undefined;
    private scrollThumbRef: any = null;
    private scrollbar: {
        clickPos: number,
        clickScrollTop: number,
        clickTop: number,
        dragged: boolean,
        enable: boolean,
        noScroll: boolean,
        width: number,
    } = {
        clickPos: 0,
        clickScrollTop: 0,
        clickTop: 0,
        dragged: false,
        enable: false,
        noScroll: false,
        width: 0,
    };
    private scrollMode: 'end' | 'stay' | 'none' = 'end';
    private cellPrefix: string = 'cell';

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: range(props.count),
        };

        if (props.cellPrefix) {
            this.cellPrefix = props.cellPrefix;
        }

        this.cellMeasurer = new CellMeasurer({
            cellPrefix: this.cellPrefix,
            estimatedItemSize: 41,
            keyMapper: this.props.keyMapper,
            rowCount: 50,
        });

        this.cellMeasurer.setUpdateFn(this.updateHandler);

        if (this.props.onScrollPos) {
            this.cellMeasurer.setScrollPositionFn(this.props.onScrollPos);
        }

        if (this.props.onScrollUpdatePos) {
            this.cellMeasurer.setScrollUpdatePositionFn(this.props.onScrollUpdatePos);
        }

        this.scrollbar.width = getScrollbarWidth();
        if (this.scrollbar.width > 0) {
            this.scrollbar.width++;
        }

        if (this.scrollbar.width > 0) {
            this.scrollbar.enable = true;
            this.modifyScrollThumb();
        }

        if (props.scrollMode) {
            this.scrollMode = props.scrollMode;
        }
    }

    public componentDidMount() {
        //
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>) {
        this.cellMeasurer.setRowCount(this.props.count);
    }

    public componentWillUnmount() {
        //
    }

    public scrollToItem(index: number, offset?: number) {
        const scrollTop = this.cellMeasurer.getOffset(index - 1);
        if (scrollTop !== -1) {
            this.containerRef.scrollTop = scrollTop + (offset || 0);
        }
    }

    public setScrollMode(mode: 'end' | 'stay' | 'none' = 'end') {
        this.scrollMode = mode;
    }

    public recomputeItem(index: number) {
        this.cellMeasurer.updateItem(index);
    }

    public render() {
        const {width, height} = this.props;
        const {items} = this.state;
        return (
            <div style={containerStyle}>
                <div ref={this.containerRefHandler}
                     style={{
                         height: `${height}px`,
                         overflowY: 'scroll',
                         width: `${width + (this.scrollbar.noScroll ? 0 : this.scrollbar.width)}px`
                     }}
                     onScroll={this.scrollHandler} onWheel={this.wheelHandler}>
                    {items.map((item, index) => {
                        const key = this.props.keyMapper(index);
                        return (<div key={key} id={`${this.cellPrefix}_${key}`} ref={this.cellMeasurer.cellRefHandler(index)}>
                            <Fragment visFn={this.cellMeasurer.visibleHandler(index)}
                                      body={this.props.renderer(index)}/>
                        </div>);
                    })}
                </div>
                {this.scrollbar.enable &&
                <div style={scrollbarStyle} onMouseDown={this.scrollbarTrackDownHandler}
                     hidden={this.scrollbar.noScroll}>
                    <div ref={this.scrollbarThumbRefHandler} style={scrollbarThumbStyle}
                         onMouseDown={this.scrollbarThumbDownHandler}/>
                </div>}
            </div>
        );
    }

    private containerRefHandler = (ref: any) => {
        this.containerRef = ref;
        if (this.props.containerRef) {
            this.props.containerRef(ref);
        }
    }

    private scrollHandler = (e: any) => {
        this.cellMeasurer.scrollHandler(this.props.height, e.target.scrollTop);
    }

    private scrollbarThumbRefHandler = (ref: any) => {
        this.scrollThumbRef = ref;
    }

    private wheelHandler = (e: any) => {
        if (this.scrollbar.enable && !this.scrollbar.dragged) {
            this.modifyScrollThumb();
        }
        // if (this.disableScrolling) {
        //     e.preventDefault();
        //     e.stopPropagation();
        // }
    }

    private modifyScrollThumb = () => {
        if (!this.scrollThumbRef || !this.containerRef) {
            return;
        }
        this.scrollbar.noScroll = (this.containerRef.clientHeight > this.containerRef.scrollHeight);
        if (!this.scrollbar.noScroll) {
            let top = (this.containerRef.scrollTop / this.containerRef.scrollHeight) * 100;
            const height = (this.containerRef.clientHeight / this.containerRef.scrollHeight) * 100;
            if (top + height > 100) {
                top = 100 - height;
            }
            this.scrollThumbRef.style.top = `${top}%`;
            this.scrollThumbRef.style.height = `${height}%`;
        }
        // if (this.scrollbar.noScroll) {
        //     this.forceUpdate();
        // }
    }

    private scrollbarTrackDownHandler = (e: any) => {
        if (!this.scrollThumbRef || !this.containerRef) {
            return;
        }
        const rect = this.scrollThumbRef.getBoundingClientRect();
        const top = rect.top + rect.height / 2;
        const diff = Math.min(Math.max(Math.abs(top - e.pageY), 100), 400);
        if (top > e.pageY) {
            this.containerRef.scrollTop = this.containerRef.scrollTop - diff;
        } else {
            this.containerRef.scrollTop = this.containerRef.scrollTop + diff;
        }
        setTimeout(() => {
            this.modifyScrollThumb();
        }, 10);
    }

    private scrollbarThumbDownHandler = (e: any) => {
        if (!this.containerRef) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();

        this.scrollbar.dragged = true;
        this.scrollbar.clickPos = e.pageY;
        this.scrollbar.clickTop = (this.containerRef.scrollTop / this.containerRef.scrollHeight) * this.containerRef.clientHeight;
        this.scrollbar.clickScrollTop = this.containerRef.scrollTop;
        this.setupDragging();
    }

    private scrollbarThumbMoveHandler = (e: any) => {
        if (!this.scrollThumbRef || !this.containerRef || !this.scrollbar.dragged) {
            return;
        }
        const offset = e.pageY - this.scrollbar.clickPos;
        const scrollTop = this.scrollbar.clickScrollTop + offset * (this.containerRef.scrollHeight / this.containerRef.clientHeight);
        this.containerRef.scrollTop = scrollTop;
        let top = this.scrollbar.clickTop + offset;
        if (top < 0) {
            top = 0;
        }
        if (top > (this.containerRef.clientHeight - this.scrollThumbRef.clientHeight)) {
            top = this.containerRef.clientHeight - this.scrollThumbRef.clientHeight;
        }
        this.scrollThumbRef.style.top = `${top}px`;
    }

    private scrollbarThumbUpHandler = () => {
        this.scrollbar.dragged = false;
        this.teardownDragging();
    }

    private setupDragging() {
        if (!this.containerRef) {
            return;
        }
        this.containerRef.style.userSelect = 'none';
        document.addEventListener('mousemove', this.scrollbarThumbMoveHandler);
        document.addEventListener('mouseup', this.scrollbarThumbUpHandler);
        document.addEventListener('mousedown', this.teardownDragging);
    }

    private teardownDragging = () => {
        if (!this.containerRef) {
            return;
        }
        this.containerRef.style.userSelect = 'auto';
        document.removeEventListener('mousemove', this.scrollbarThumbMoveHandler);
        document.removeEventListener('mouseup', this.scrollbarThumbUpHandler);
        document.removeEventListener('mousedown', this.teardownDragging);
    }

    private updateHandler = () => {
        this.modifyScrollThumb();
        if (this.containerRef) {
            this.cellMeasurer.scrollHandler(this.props.height, this.containerRef.scrollTop, true);
            if (this.scrollMode === 'end') {
                this.containerRef.scrollTop = this.containerRef.scrollHeight - this.containerRef.clientHeight;
            } else if (this.scrollMode === 'stay') {
                //
            }
        }
        if (this.props.onUpdate) {
            this.props.onUpdate();
        }
    }
}

export default KKWindow;