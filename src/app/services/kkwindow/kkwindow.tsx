import * as React from "react";
import Fragment from "./fragment";
import {CellMeasurer, scrollFunc} from "./utils";
import {range} from 'lodash';
import getScrollbarWidth from "../../services/utilities/scrollbar_width";

interface IProps {
    className?: string;
    height: number;
    estimatedHeight?: number;
    width: number;
    count: number;
    renderer: (index: number) => any;
    noRowsRenderer?: any;
    containerRef?: (ref: any) => void;
    keyMapper: (index: number) => string;
    estimatedItemSize?: number;
    estimatedItemSizeFunc?: (index: number) => number;
    overscan?: number;
    fitList?: boolean;
    onUpdate?: () => void;
    onScrollPos?: scrollFunc;
    onScrollUpdatePos?: scrollFunc;
    scrollMode?: 'end' | 'stay' | 'top' | 'none';
    cellPrefix?: string;
    loadBeforeLimit?: number;
    onLoadBefore?: (start: number, end: number) => void;
    loadAfterLimit?: number;
    onLoadAfter?: (start: number, end: number) => void;
}

interface IState {
    items: any[];
}

const containerStyle: any = {
    display: 'block',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    zIndex: '2',
};

const snapshotStyle: any = {
    bottom: '0',
    display: 'none',
    left: '0',
    overflow: 'hidden',
    position: 'absolute',
    right: '0',
    top: '0',
    zIndex: '100',
};

const scrollbarStyle: any = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: '0',
    display: 'block',
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

const C_TRY_SCROLL_TOP = 20;

// TODO: measure width as well for better reaction render
class KKWindow extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        if (props.count === state.items.length) {
            return null;
        }
        return {
            items: range(props.count),
        };
    }

    public cellMeasurer: CellMeasurer;
    private containerRef: any | undefined;
    private scrollRef: any = null;
    private scrollThumbRef: any = null;
    private snapshotRef: any | undefined;
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
    private scrollMode: 'end' | 'stay' | 'top' | 'none' = 'end';
    private fitList: boolean = true;
    private readonly cellPrefix: string = 'cell';
    private loadMoreReady: boolean = false;
    private loadBeforeTriggered: number = 0;
    private readonly loadBeforeLimit: number = 5;
    private loadAfterTriggered: boolean = false;
    private readonly loadAfterLimit: number = 5;
    private loadBeforeTimeout: any = null;
    private paddingTop: string = '0';
    private smallerThanContainer: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: range(props.count),
        };

        if (props.cellPrefix) {
            this.cellPrefix = props.cellPrefix;
        }

        if (props.loadBeforeLimit) {
            this.loadBeforeLimit = props.loadBeforeLimit;
        }

        if (props.loadAfterLimit) {
            this.loadAfterLimit = props.loadAfterLimit;
        }

        this.cellMeasurer = new CellMeasurer({
            cellPrefix: this.cellPrefix,
            estimatedItemSize: props.estimatedItemSize || 41,
            estimatedItemSizeFunc: props.estimatedItemSizeFunc,
            keyMapper: this.props.keyMapper,
            overscan: props.overscan,
            rowCount: props.count,
        });

        this.cellMeasurer.setUpdateFn(this.updateHandler);

        this.cellMeasurer.setScrollPositionFn(this.scrollPosHandler);

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

        this.fitList = props.fitList || true;
    }

    public shouldComponentUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>, nextContext: any): boolean {
        if (nextProps.count !== this.props.count && this.loadBeforeTriggered) {
            if (this.containerRef && this.containerRef.scrollTop < 5) {
                this.containerRef.scrollTop = 5;
            }
            if (this.cellMeasurer && nextProps.count > this.props.count) {
                this.cellMeasurer.clear((nextProps.count - this.props.count) + 1);
            }
        }
        return true;
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>) {
        if (prevProps.count !== this.props.count) {
            if (!this.loadMoreReady && this.props.count < (this.props.overscan || 10)) {
                this.takeSnapshot();
            }
            this.loadMoreReady = false;
            this.cellMeasurer.setRowCount(this.props.count);
            if (this.smallerThanContainer && this.fitList) {
                this.cellMeasurer.recomputeListHeight();
            }
        }
    }

    public scrollToItem(index: number, offset?: number) {
        if (!this.containerRef) {
            return;
        }
        const scrollTop = this.cellMeasurer.getOffset(index - 1);
        if (scrollTop !== -1) {
            if (offset === -1) {
                offset = -(this.getHeight() - this.cellMeasurer.getHeight(index)) / 2;
            }
            this.containerRef.scrollTo({
                behavior: 'smooth',
                top: scrollTop + (offset || 0),
            });
        }
    }

    public setScrollMode(mode: 'end' | 'stay' | 'top' | 'none') {
        this.scrollMode = mode;
    }

    public getCellOffset(index: number) {
        return this.cellMeasurer.getCellOffset(index);
    }

    public getWidth(index: number) {
        return this.cellMeasurer.getWidth(index);
    }

    public takeSnapshot(noRemove?: boolean) {
        if (this.snapshotRef && this.containerRef) {
            const html = this.containerRef.innerHTML;
            this.snapshotRef.innerHTML = html.replace(/id="/g, 'sid="');
            if (this.scrollbar.enable) {
                this.snapshotRef.style.right = `-1px`;
            } else {
                this.snapshotRef.style.right = '0';
            }
            this.snapshotRef.style.display = 'block';
            const styles = window.getComputedStyle(this.containerRef);
            if (styles) {
                this.snapshotRef.style.padding = styles.padding;
            }
            this.containerRef.style.opacity = '0';
            this.snapshotRef.scrollTop = this.containerRef.scrollTop;
            if (noRemove !== true) {
                setTimeout(() => {
                    this.revertSnapshot();
                }, 100);
            }
        }
    }

    public revertSnapshot() {
        if (this.snapshotRef && this.containerRef) {
            this.snapshotRef.style.display = 'none';
            this.containerRef.style.opacity = '1';
            this.snapshotRef.innerHTML = '';
        }
    }

    public setFitList(fitList: boolean) {
        this.fitList = fitList;
    }

    public clearAll() {
        this.loadMoreReady = false;
        this.loadBeforeTriggered = 0;
        this.loadAfterTriggered = false;
        clearTimeout(this.loadBeforeTimeout);
        this.loadBeforeTimeout = null;
        if (this.cellMeasurer) {
            this.cellMeasurer.clearAll();
        }
    }

    public isSmallerThanContainer() {
        return this.smallerThanContainer;
    }

    public render() {
        const {width, height} = this.props;
        return (
            <div style={containerStyle}>
                <div ref={this.snapshotRefHandler} style={snapshotStyle} className="snapshot"/>
                <div ref={this.containerRefHandler}
                     className={this.props.className}
                     style={{
                         height: `${height}px`,
                         overflowY: 'scroll',
                         paddingTop: this.paddingTop,
                         width: `${width + (this.scrollbar.enable ? this.scrollbar.width : 0)}px`
                     }}
                     onScroll={this.scrollHandler} onWheel={this.wheelHandler}>
                    {this.getContent()}
                </div>
                {this.getNoContent()}
                {this.scrollbar.enable &&
                <div ref={this.scrollbarRefHandler} style={scrollbarStyle} onMouseDown={this.scrollbarTrackDownHandler}>
                    <div ref={this.scrollbarThumbRefHandler} style={scrollbarThumbStyle}
                         onMouseDown={this.scrollbarThumbDownHandler}/>
                </div>}
            </div>
        );
    }

    private getContent() {
        const {items} = this.state;
        if (items.length === 0) {
            return null;
        }

        return items.map((item, index) => {
            const key = this.props.keyMapper(index);
            const id = `${this.cellPrefix}_${key}`;
            return (<div key={key} id={id}
                         ref={this.cellMeasurer.cellRefHandler(index, id)}>
                <Fragment visFn={this.cellMeasurer.visibleHandler(index)}
                          defaultVisible={this.cellMeasurer.isVisible(index)}
                          body={this.props.renderer(index)}/>
            </div>);
        });
    }

    private getNoContent() {
        const {items} = this.state;
        if (items.length === 0) {
            if (this.props.noRowsRenderer) {
                return this.props.noRowsRenderer();
            }
        }
        return;
    }

    private snapshotRefHandler = (ref: any) => {
        this.snapshotRef = ref;
    }

    private containerRefHandler = (ref: any) => {
        this.containerRef = ref;
        if (this.props.containerRef) {
            this.props.containerRef(ref);
        }
    }

    private scrollHandler = (e: any) => {
        if (this.scrollbar.noScroll) {
            return;
        }
        const scrollTop = e.target.scrollTop;
        this.cellMeasurer.scrollHandler(this.getHeight(), scrollTop);
        if (this.loadMoreReady && this.loadBeforeTriggered >= 1 && this.loadBeforeTriggered <= 3 && scrollTop < C_TRY_SCROLL_TOP) {
            this.loadBeforeTimeout = setTimeout(() => {
                this.tryLoadBefore();
            }, 500);
        }
    }

    private scrollbarRefHandler = (ref: any) => {
        this.scrollRef = ref;
    }

    private scrollbarThumbRefHandler = (ref: any) => {
        this.scrollThumbRef = ref;
    }

    private wheelHandler = (e: any) => {
        if (this.scrollbar.enable && !this.scrollbar.noScroll && !this.scrollbar.dragged) {
            this.modifyScrollThumb();
        }
    }

    private modifyScrollThumb = () => {
        if (!this.scrollThumbRef || !this.containerRef) {
            return;
        }
        if (!this.scrollbar.noScroll) {
            let top = (this.containerRef.scrollTop / this.containerRef.scrollHeight) * 100;
            const height = (this.getHeight() / this.containerRef.scrollHeight) * 100;
            if (top + height > 100) {
                top = 100 - height;
            }
            this.scrollThumbRef.style.top = `${top}%`;
            this.scrollThumbRef.style.height = `${height}%`;
        }
        this.scrollActivate(!this.scrollbar.noScroll);
    }

    private scrollActivate(active: boolean) {
        if (this.scrollRef) {
            const display = this.scrollRef.style.display;
            if (display === 'none' && active) {
                this.scrollRef.style.display = 'block';
            } else if (display === 'block' && !active) {
                this.scrollRef.style.display = 'none';
            }
        }
    }

    private scrollbarTrackDownHandler = (e: any) => {
        if (!this.scrollThumbRef || !this.containerRef) {
            return;
        }
        const rect = this.scrollThumbRef.getBoundingClientRect();
        const top = rect.top + rect.height / 2;
        const diff = Math.min(Math.max(Math.abs(top - e.pageY), 100), this.getHeight() - 20);
        if (top > e.pageY) {
            this.containerRef.scrollTop = this.containerRef.scrollTop - diff;
        } else {
            this.containerRef.scrollTop = this.containerRef.scrollTop + diff;
        }
        if (this.scrollbar.enable) {
            setTimeout(() => {
                this.modifyScrollThumb();
            }, 10);
        }
    }

    private scrollbarThumbDownHandler = (e: any) => {
        if (!this.containerRef) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();

        this.scrollbar.dragged = true;
        this.scrollbar.clickPos = e.pageY;
        this.scrollbar.clickTop = (this.containerRef.scrollTop / this.containerRef.scrollHeight) * this.getHeight();
        this.scrollbar.clickScrollTop = this.containerRef.scrollTop;
        this.setupDragging();
    }

    private scrollbarThumbMoveHandler = (e: any) => {
        if (!this.scrollThumbRef || !this.containerRef || !this.scrollbar.dragged) {
            return;
        }
        const height = this.getHeight();
        const offset = e.pageY - this.scrollbar.clickPos;
        this.containerRef.scrollTop = this.scrollbar.clickScrollTop + offset * (this.containerRef.scrollHeight / height);
        let top = this.scrollbar.clickTop + offset;
        if (top < 0) {
            top = 0;
        }
        if (top > (height - this.scrollThumbRef.clientHeight)) {
            top = height - this.scrollThumbRef.clientHeight;
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
        if (this.props.onUpdate) {
            this.props.onUpdate();
        }
        const height = this.getHeight();
        if (this.containerRef) {
            this.scrollbar.noScroll = (height >= this.cellMeasurer.getTotalHeight());
            if (!this.scrollbar.noScroll) {
                this.containerRef.style.paddingTop = '0';
                setTimeout(() => {
                    this.loadMoreReady = true;
                }, 100);
            }
        }
        if (this.fitList) {
            this.fitListToBottom();
            // this.setNativeScroll(!this.scrollbar.noScroll);
        }
        if (this.containerRef) {
            if (this.scrollMode === 'end') {
                this.cellMeasurer.scrollHandler(height, this.containerRef.scrollTop, true);
                this.loadAfterTriggered = true;
                this.containerRef.scrollTop = this.containerRef.scrollHeight - height;
            } else if (this.scrollMode === 'stay') {
                //
            } else if (this.scrollMode === 'top') {
                this.containerRef.scrollTop = 10;
            }
        }
        if (this.scrollbar.enable) {
            this.modifyScrollThumb();
        }
    }

    private fitListToBottom() {
        if (this.containerRef) {
            const gap = (this.getHeight() - 11) - this.cellMeasurer.getTotalHeight();
            this.smallerThanContainer = gap > 0;
            if (gap > 0) {
                this.paddingTop = `${gap}px`;
                if (this.props.onScrollPos && this.props.count > 0) {
                    this.props.onScrollPos({
                        end: this.props.count - 1,
                        overscanEnd: this.props.count - 1,
                        overscanStart: 0,
                        start: 0
                    });
                }
            } else {
                this.paddingTop = '0';
            }
            this.containerRef.style.paddingTop = this.paddingTop;
        }
    }

    // @ts-ignore
    private setNativeScroll(enable: boolean) {
        if (this.containerRef) {
            this.containerRef.overflowY = enable ? 'scroll' : 'hidden';
            this.containerRef.setAttribute('kk', enable ? 'check' : 'uncheck');
        }
    }

    private scrollPosHandler: scrollFunc = ({start, end, overscanStart, overscanEnd}) => {
        if (this.props.onScrollPos) {
            this.props.onScrollPos({end, overscanEnd, overscanStart, start});
        }
        if (this.loadMoreReady) {
            if (start <= this.loadBeforeLimit && this.loadBeforeTriggered < 15) {
                if (this.props.onLoadBefore) {
                    if (this.loadBeforeTimeout) {
                        clearTimeout(this.loadBeforeTimeout);
                        this.loadBeforeTimeout = null;
                    }
                    this.props.onLoadBefore(start, end);
                }
                this.loadBeforeTriggered++;
            } else if (start > this.loadBeforeLimit + 4) {
                this.loadBeforeTriggered = 0;
            }
            const toEnd = this.props.count - (end + 1);
            if (toEnd <= this.loadAfterLimit && !this.loadAfterTriggered) {
                if (this.props.onLoadAfter) {
                    this.props.onLoadAfter(start, end);
                }
                this.loadAfterTriggered = true;
            } else if (toEnd > this.loadAfterLimit + 4) {
                this.loadAfterTriggered = false;
            }
        }
    }

    private tryLoadBefore() {
        if (this.containerRef && this.loadMoreReady && this.containerRef.scrollTop < C_TRY_SCROLL_TOP) {
            if (this.props.onLoadBefore) {
                this.props.onLoadBefore(0, 10);
            }
            this.loadBeforeTriggered++;
            if (this.loadMoreReady && this.loadBeforeTriggered >= 1 && this.loadBeforeTriggered <= 3) {
                this.loadBeforeTimeout = setTimeout(() => {
                    if (this.containerRef && this.containerRef.scrollTop < C_TRY_SCROLL_TOP) {
                        this.tryLoadBefore();
                    }
                }, 500);
            }
        }
    }

    private getHeight() {
        const {height} = this.props;
        if (height < 100) {
            return this.props.estimatedHeight || height;
        }
        return height;
    }
}

export default KKWindow;