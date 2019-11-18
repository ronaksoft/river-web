import ResizeObserver from "resize-observer-polyfill";
import {debounce} from 'lodash';

interface IFragment {
    height: number;
    visible: boolean;
    setVisible?: (visible: boolean) => void;
}

export class CellMeasurer {
    private fragmentList: { [key: string]: IFragment } = {};
    private newList: { [key: string]: boolean } = {};
    private offsetList: number[] = [];
    private updateFn: any = null;
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

    public constructor({estimatedItemSize, rowCount, defaultHeight, keyMapper}: { estimatedItemSize: number, rowCount: number, defaultHeight?: number, keyMapper: (index: number) => string }) {
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
                    setVisible: undefined,
                    visible: true,
                };
            } else {
                this.fragmentList[key].height = rect.height;
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

    public getAllHeight() {
        return this.fragmentList;
    }

    public getAllOffset() {
        return this.offsetList;
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
                visible: false,
            };
        }
    }

    public scrollHandler = (height: number, scrollTop: number) => {
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
        this.setVisibleList();
    }

    private setVisibleList() {
        if (Math.abs(this.start - this.lastStart) > this.updateHysteresis || Math.abs(this.end - this.lastEnd) > this.updateHysteresis) {
            this.lastStart = this.start;
            this.lastEnd = this.end;
            for (let i = 0; i < this.offsetList.length; i++) {
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