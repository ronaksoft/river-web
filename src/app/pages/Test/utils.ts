import {VariableSizeList as List} from "react-window";
import ResizeObserver from "resize-observer-polyfill";
import {debounce} from 'lodash';

export class CellMeasurer {
    private list: List | undefined;
    private heightCache: { [key: number]: number } = {};
    private updateFn: any = null;
    private readonly keyMapperFn: any;
    private readonly updateList: any;
    private readonly estimatedItemSize: number = 40;

    public constructor({estimatedItemSize, keyMapper}: { estimatedItemSize: number, keyMapper: (index: number) => string }) {
        this.updateList = debounce(this.updateListHandler, 1);
        if (keyMapper) {
            this.keyMapperFn = keyMapper;
        } else {
            this.keyMapperFn = (index: number) => index;
        }
        if (estimatedItemSize) {
            this.estimatedItemSize = estimatedItemSize;
        }
    }

    public setUpdateFn(fn: any) {
        this.updateFn = fn;
    }

    public setRef = (ref: List) => {
        this.list = ref;
    }

    public cellRefHandler = (index: number) => (ref: any) => {
        if (this.heightCache.hasOwnProperty(index)) {
            return;
        }
        if (!ref) {
            return;
        }
        const handleResize = () => {
            if (!ref) {
                return;
            }
            if (!ref.firstElementChild) {
                return;
            }
            const rect = ref.firstElementChild.getBoundingClientRect();
            this.heightCache[this.keyMapperFn(index)] = rect.height;
            resizeObserver.disconnect();
            this.updateList();
        };
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(ref);
        return;
    }

    public getHeight = (index: number) => {
        const height = this.heightCache[this.keyMapperFn(index)];
        if (height) {
            return height;
        }
        return this.estimatedItemSize;
    }

    public clear(index: number) {
        delete this.heightCache[this.keyMapperFn(index)];
        if (this.list) {
            this.list.resetAfterIndex(0, true);
        }
    }

    public clearAll() {
        this.heightCache = {};
        if (this.list) {
            this.list.resetAfterIndex(0, true);
        }
    }

    private updateListHandler = () => {
        if (this.list) {
            this.list.resetAfterIndex(0, true);
        }
        if (this.updateFn) {
            this.updateFn();
        }
    }
}