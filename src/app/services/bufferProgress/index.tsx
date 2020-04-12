/*
    Creation Time: 2020 - April - 13
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {IFileBuffer} from '../sdk/fileManager';

interface IBufferProgressItem {
    fnQueue: { [key: number]: any };
    progress: IFileBuffer;
}

export default class BufferProgressBroadcaster {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new BufferProgressBroadcaster();
        }

        return this.instance;
    }

    private static instance: BufferProgressBroadcaster;
    private fnIndex: number = 0;

    private listeners: { [key: number]: IBufferProgressItem } = {};

    private constructor() {
    }

    public publish(id: number, progress: IFileBuffer) {
        this.callHandlers(id, progress);
    }

    public listen(id: number, fn: any): (() => void) | null {
        if (!id) {
            return null;
        }
        this.fnIndex++;
        const fnIndex = this.fnIndex;
        if (!this.listeners.hasOwnProperty(id)) {
            this.listeners[id] = {
                fnQueue: [],
                progress: {
                    cache: false,
                    completed: false,
                    part: 0,
                },
            };
        }
        this.listeners[id].fnQueue[fnIndex] = fn;
        fn(this.listeners[id].progress);
        return () => {
            if (this.listeners.hasOwnProperty(id)) {
                delete this.listeners[id].fnQueue[fnIndex];
            }
        };
    }

    public remove(id: number) {
        if (this.listeners.hasOwnProperty(id)) {
            delete this.listeners[id];
        }
    }

    private callHandlers(id: number, progress: IFileBuffer) {
        if (!this.listeners.hasOwnProperty(id)) {
            return;
        }
        this.listeners[id].progress = progress;
        const keys = Object.keys(this.listeners[id].fnQueue);
        keys.forEach((key) => {
            const fn = this.listeners[id].fnQueue[key];
            if (fn) {
                fn(progress);
            }
        });
    }
}
