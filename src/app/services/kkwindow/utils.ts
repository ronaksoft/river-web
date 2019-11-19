import ResizeObserver from "resize-observer-polyfill";
import {debounce} from 'lodash';

interface IFragment {
    height: number;
    ref: any;
    visible: boolean;
    setVisible?: (visible: boolean) => void;
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
    private start: number = 0;
    private end: number = 50;
    private lastStart: number = 0;
    private lastEnd: number = 50;
    private offset: number = 10;
    private updateHysteresis: number = 3;
    private readonly keyMapperFn: any;
    private readonly updateList: any;
    private readonly estimatedItemSize: number = 40;

    public constructor({estimatedItemSize, rowCount, defaultHeight, keyMapper}: { estimatedItemSize: number, rowCount: number, defaultHeight?: number, keyMapper?: (index: number) => string }) {
        this.updateList = debounce(this.updateListHandler, 1);
        if (keyMapper) {
            this.keyMapperFn = keyMapper;
        } else {
            this.keyMapperFn = (index: number) => index;
        }
        if (estimatedItemSize) {
            this.estimatedItemSize = estimatedItemSize;
        }
        if (rowCount) {
            this.rowCount = rowCount;
        }
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

    public cellRefHandler = (index: number) => (ref: any) => {
        const key = this.keyMapperFn(index);
        if (this.fragmentList.hasOwnProperty(key) && this.fragmentList[key].height !== -1) {
            return;
        }
        if (!ref) {
            return;
        }
        if (!ref.firstElementChild) {
            return;
        }
        this.newList[key] = true;
        let resizeObserver: ResizeObserver;
        const handleResize = () => {
            if (!ref) {
                return;
            }
            if (!ref.firstElementChild) {
                return;
            }
            const rect = ref.firstElementChild.getBoundingClientRect();
            if (!this.fragmentList.hasOwnProperty(key)) {
                this.fragmentList[key] = {
                    height: rect.height,
                    ref,
                    setVisible: undefined,
                    visible: true,
                };
            } else {
                this.fragmentList[key].height = rect.height;
                this.fragmentList[key].ref = ref;
                this.fragmentList[key].visible = true;
            }
            ref.style.height = `${rect.height}px`;
            this.updateList();
            setTimeout(() => {
                if (resizeObserver) {
                    resizeObserver.disconnect();
                }
            }, 1000);
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

    public clear(index: number) {
        delete this.fragmentList[this.keyMapperFn(index)];
    }

    public clearAll() {
        this.fragmentList = {};
    }

    public updateItem(index: number) {
        const key = this.keyMapperFn(index);
        if (this.fragmentList.hasOwnProperty(key) && this.fragmentList[key].setVisible) {
            // @ts-ignore
            this.fragmentList[key].setVisible(!this.fragmentList[key].visible);
            // @ts-ignore
            this.fragmentList[key].setVisible(this.fragmentList[key].visible);
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
                ref: undefined,
                setVisible,
                visible: false,
            };
        }
    }

    public scrollHandler = (height: number, scrollTop: number, force?: boolean) => {
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
        this.setVisibleList(force);
        if (this.scrollPosFn) {
            this.dispatchFn(this.scrollPosFn);
        }
    }

    private setVisibleList(force?: boolean) {
        if (Math.abs(this.start - this.lastStart) > this.updateHysteresis || Math.abs(this.end - this.lastEnd) > this.updateHysteresis || force) {
            let fromT = this.lastStart;
            let toT = this.lastEnd;
            this.lastStart = this.start;
            this.lastEnd = this.end;
            if (fromT > this.start || toT > this.end) {
                fromT = this.start;
            } else {
                toT = this.end;
            }
            if (fromT < 0) {
                fromT = 0;
            }
            if (this.scrollUpdatePosFn) {
                this.dispatchFn(this.scrollUpdatePosFn);
            }
            for (let i = fromT; i < this.offsetList.length && i <= toT; i++) {
                const key = this.keyMapperFn(i);
                if (this.fragmentList.hasOwnProperty(key)) {
                    const visible = (this.start - this.offset <= i && i <= this.end + this.offset);
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
            let overscanStart: number = this.start - this.offset;
            if (overscanStart < 0) {
                overscanStart = 0;
            }
            let overscanEnd: number = this.end + this.offset;
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
        for (let i = 0; i < this.rowCount; i++) {
            const fragment = this.fragmentList[this.keyMapperFn(i)];
            const height = fragment ? fragment.height : this.estimatedItemSize;
            if (i === 0) {
                this.offsetList[i] = height;
            } else {
                this.offsetList[i] = this.offsetList[i - 1] + height;
            }
        }
        this.setVisibleList();
        if (this.updateFn) {
            this.updateFn();
        }
    }
}