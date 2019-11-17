import ResizeObserver from "resize-observer-polyfill";
import {debounce} from 'lodash';

interface IFragment {
    height: number;
    ref: any;
}

export class CellMeasurer {
    private fragmentList: { [key: string]: IFragment } = {};
    private newList: { [key: string]: boolean } = {};
    private offsetList: number[] = [];
    private updateFn: any = null;
    private rowCount: number = 0;
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
        // window.console.log(index);
        if (this.fragmentList.hasOwnProperty(this.keyMapperFn(index))) {
            return;
        }
        if (!ref) {
            return;
        }
        if (!ref.firstElementChild) {
            return;
        }
        this.newList[this.keyMapperFn(index)] = true;
        let resizeObserver: ResizeObserver;
        const handleResize = () => {
            if (!ref) {
                return;
            }
            if (!ref.firstElementChild) {
                return;
            }
            const rect = ref.firstElementChild.getBoundingClientRect();
            this.fragmentList[this.keyMapperFn(index)] = {
                height: rect.height,
                ref,
            };
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
        if (this.updateFn) {
            this.updateFn();
        }
    }
}