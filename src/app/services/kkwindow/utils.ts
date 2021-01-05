import ResizeObserver from "resize-observer-polyfill";
import {throttle} from 'lodash';

interface IFragment {
    height: number;
    visible: boolean;
    setVisible?: (visible: boolean, force?: boolean) => void;
    width: number;
}

export type scrollFunc = ({overscanStart, start, end, overscanEnd}: { overscanStart: number, start: number, end: number, overscanEnd: number }) => void;

export class CellMeasurer {
    private fragmentList: { [key: string]: IFragment } = {};
    private newList: { [key: string]: boolean } = {};
    private offsetList: number[] = [];
    private updateFn: any = null;
    private scrollPosFn: scrollFunc | undefined;
    private scrollUpdatePosFn: scrollFunc | undefined;
    private rowCount: number = 0;
    // @ts-ignore
    private lastRowCount: number = 0;
    private start: number = 0;
    private end: number = 0;
    private lastStart: number = 0;
    private lastEnd: number = 0;
    private readonly overscan: number = 10;
    private updateHysteresis: number = 5;
    private scrollTop: number = 0;
    private readonly keyMapperFn: any;
    private readonly updateList: any;
    private readonly estimatedItemSize: number = 40;
    private readonly estimatedItemSizeFunc: ((index: number) => number) | undefined;
    private readonly cellPrefix: string;
    private totalHeight: number = 0;

    public constructor({cellPrefix, estimatedItemSize, estimatedItemSizeFunc, rowCount, defaultHeight, overscan, keyMapper}: { cellPrefix: string, estimatedItemSize: number, estimatedItemSizeFunc?: (index: number) => number, rowCount: number, defaultHeight?: number, overscan?: number, keyMapper?: (index: number) => string }) {
        this.overscan = overscan || 10;
        this.updateList = throttle(this.updateListHandler, 20);
        this.cellPrefix = cellPrefix;
        if (keyMapper) {
            this.keyMapperFn = keyMapper;
        } else {
            this.keyMapperFn = (index: number) => index;
        }
        if (estimatedItemSize) {
            this.estimatedItemSize = estimatedItemSize;
        }
        if (estimatedItemSizeFunc) {
            this.estimatedItemSizeFunc = estimatedItemSizeFunc;
        }
        if (rowCount) {
            this.rowCount = rowCount;
            this.lastRowCount = rowCount;
        }
        this.end = rowCount;
        this.lastEnd = rowCount;
    }

    public setUpdateFn(fn: any) {
        this.updateFn = fn;
    }

    public setScrollPositionFn(fn: any) {
        this.scrollPosFn = fn;
    }

    public setScrollUpdatePositionFn(fn: any) {
        this.scrollUpdatePosFn = fn;
    }

    public cellRefHandler = (index: number, id: string, force?: boolean) => (ref: any) => {
        const key = this.keyMapperFn(index);
        if (this.fragmentList.hasOwnProperty(key) && this.fragmentList[key].height !== -1 && force !== true) {
            if (ref && this.fragmentList[key].height > 0) {
                ref.style.height = `${this.fragmentList[key].height}px`;
            }
            return;
        }
        if (!ref || !ref.firstElementChild) {
            return;
        }
        this.newList[key] = true;
        let resizeObserver: ResizeObserver;
        const handleResize = (e: any) => {
            if (!ref || !ref.firstElementChild) {
                return;
            }
            const rect = (e && e[0] && e[0].contentRect) ? e[0].contentRect : ref.firstElementChild.getBoundingClientRect();
            if (rect.height === 0) {
                return;
            }
            if (!this.fragmentList.hasOwnProperty(key)) {
                this.fragmentList[key] = {
                    height: rect.height,
                    setVisible: undefined,
                    visible: true,
                    width: ref.firstElementChild?.firstElementChild?.lastElementChild.clientWidth,
                };
            } else {
                this.fragmentList[key].height = rect.height;
                this.fragmentList[key].width = ref.firstElementChild?.firstElementChild?.lastElementChild.clientWidth;
                this.fragmentList[key].visible = true;
            }
            ref.style.height = `${rect.height}px`;
            this.updateList();
            setTimeout(() => {
                resizeObserver.disconnect();
            }, 100);
        };
        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(ref.firstElementChild);
        return;
    }

    public getHeight = (index: number) => {
        const fragment = this.fragmentList[this.keyMapperFn(index)];
        if (fragment) {
            return fragment.height;
        }
        return this.estimatedItemSize;
    }

    public getWidth = (index: number) => {
        const fragment = this.fragmentList[this.keyMapperFn(index)];
        if (fragment) {
            return fragment.width;
        }
        return this.estimatedItemSize;
    }

    public clear(index: number, noWidthUpdate?: boolean) {
        const key = this.keyMapperFn(index);
        if (!this.fragmentList.hasOwnProperty(key)) {
            return;
        }
        if (noWidthUpdate !== true) {
            this.fragmentList[key].width = -1;
        }
        this.fragmentList[key].height = -1;
    }

    public clearAll() {
        this.fragmentList = {};
        this.offsetList = [];
    }

    public recomputeItemHeight(index: number) {
        const key = this.keyMapperFn(index);
        if (this.fragmentList.hasOwnProperty(key)) {
            const el = document.getElementById(`${this.cellPrefix}_${key}`);
            if (el) {
                this.cellRefHandler(index, '', true)(el);
            }
        }
    }

    public updateItem(index: number) {
        this.updateItemByKey(this.keyMapperFn(index));
    }

    public updateItemByKey(key: string) {
        if (this.fragmentList.hasOwnProperty(key)) {
            if (this.fragmentList[key].setVisible) {
                // @ts-ignore
                this.fragmentList[key].setVisible(true, true);
            }
        }
    }

    public getAllHeight() {
        return this.fragmentList;
    }

    public getAllOffset() {
        return this.offsetList;
    }

    public getOffset(index: number) {
        if (!this.offsetList[index]) {
            return -1;
        }
        return this.offsetList[index];
    }

    public setRowCount(count: number) {
        this.rowCount = count;
    }

    public hasCache(index: number) {
        return this.fragmentList.hasOwnProperty(this.keyMapperFn(index));
    }

    public isNew(index: number) {
        const key = this.keyMapperFn(index);
        const is = this.newList.hasOwnProperty(key);
        if (is) {
            delete this.newList[key];
        }
        return is;
    }

    public visibleHandler = (index: number) => (setVisible: any) => {
        const key = this.keyMapperFn(index);
        if (this.fragmentList.hasOwnProperty(key)) {
            this.fragmentList[key].setVisible = setVisible;
        } else {
            this.fragmentList[key] = {
                height: -1,
                setVisible,
                visible: true,
                width: -1,
            };
        }
    }

    public isVisible = (index: number) => {
        const key = this.keyMapperFn(index);
        if (this.fragmentList.hasOwnProperty(key)) {
            return this.fragmentList[key].visible;
        }
        return true;
    }

    public getCellOffset(index: number) {
        const key = this.keyMapperFn(index);
        if (this.fragmentList.hasOwnProperty(key)) {
            const offset = this.offsetList[index - 1];
            if (offset) {
                return this.scrollTop - offset;
            }
        }
        return 0;
    }

    public getTotalHeight() {
        return this.totalHeight;
    }

    public recomputeListHeight() {
        this.updateListHandler();
    }

    public scrollHandler = (height: number, scrollTop: number, force?: boolean) => {
        this.scrollTop = scrollTop;
        let start = 0;
        let end = this.offsetList.length - 1;
        for (let i = 0; i < this.offsetList.length; i++) {
            if (this.offsetList[i] > scrollTop) {
                start = i;
                break;
            }
        }
        for (let i = start; i < this.offsetList.length; i++) {
            if (this.offsetList[i] > scrollTop + height) {
                end = i;
                break;
            }
        }
        this.start = start;
        this.end = end;
        if (this.scrollPosFn) {
            this.dispatchFn(this.scrollPosFn);
        }
        requestAnimationFrame(() => {
            this.setVisibleList(force);
        });
    }

    public computeTotalHeight() {
        this.totalHeight = 0;
        for (let i = 0; i < this.rowCount; i++) {
            const fragment = this.fragmentList[this.keyMapperFn(i)];
            let height = fragment ? fragment.height : (this.estimatedItemSizeFunc ? this.estimatedItemSizeFunc(i) : this.estimatedItemSize);
            if (height < 0) {
                height = (this.estimatedItemSizeFunc ? this.estimatedItemSizeFunc(i) : this.estimatedItemSize);
            }
            if (i === 0) {
                this.offsetList[i] = height;
            } else {
                this.offsetList[i] = this.offsetList[i - 1] + height;
            }
            this.totalHeight += height;
        }
    }

    private setVisibleList(force?: boolean) {
        if (Math.abs(this.start - this.lastStart) > this.updateHysteresis || Math.abs(this.end - this.lastEnd) > this.updateHysteresis || force) {
            let fromT = this.lastStart;
            let toT = this.lastEnd;
            this.lastStart = this.start;
            this.lastEnd = this.end;
            fromT = 0;
            toT = this.offsetList.length;
            // if (fromT > this.start || toT > this.end) {
            //     fromT = this.start - this.overscan;
            // } else {
            //     toT = this.end + this.overscan;
            // }
            // if (fromT < 0) {
            //     fromT = 0;
            // }
            // if (this.lastRowCount !== this.rowCount) {
            //     fromT = 0;
            //     toT = this.offsetList.length - 1;
            //     this.lastRowCount = this.rowCount;
            // }
            if (this.scrollUpdatePosFn) {
                this.dispatchFn(this.scrollUpdatePosFn);
            }
            for (let i = fromT; i < this.offsetList.length && i <= toT; i++) {
                const key = this.keyMapperFn(i);
                if (this.fragmentList.hasOwnProperty(key)) {
                    let visible = (this.start - this.overscan <= i && i <= this.end + this.overscan);
                    if (this.isNew(i)) {
                        visible = true;
                    }
                    this.fragmentList[key].visible = visible;
                    if (this.fragmentList[key].setVisible) {
                        // @ts-ignore
                        this.fragmentList[key].setVisible(visible);
                    }
                }
            }
        }
    }

    private dispatchFn(fn: any) {
        if (fn) {
            let overscanStart: number = this.start - this.overscan;
            if (overscanStart < 0) {
                overscanStart = 0;
            }
            let overscanEnd: number = this.end + this.overscan;
            if (overscanEnd >= this.offsetList.length) {
                overscanEnd = this.offsetList.length - 1;
            }
            fn({
                end: this.end,
                overscanEnd,
                overscanStart,
                start: this.start,
            });
        }
    }

    private updateListHandler = () => {
        this.computeTotalHeight();
        this.setVisibleList();
        if (this.updateFn) {
            this.updateFn();
        }
    }
}