/*
    Creation Time: 2019 - Jan - 14
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {IFileProgress} from '../sdk/fileManager';

interface IProgressItem {
    fnQueue: { [key: number]: any };
    progress: IFileProgress;
}

export default class ProgressBroadcaster {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new ProgressBroadcaster();
        }

        return this.instance;
    }

    private static instance: ProgressBroadcaster;
    private fnIndex: number = 0;

    private listeners: { [key: number]: IProgressItem } = {};

    private constructor() {
    }

    public failed(id: number) {
        this.callHandlers(id, {
            active: true,
            download: 0,
            progress: 0,
            state: 'failed',
            totalDownload: 0,
            totalUpload: 0,
            upload: 0,
        });
    }

    public publish(id: number, progress: IFileProgress) {
        progress.active = true;
        this.callHandlers(id, progress);
    }

    public listen(id: number, fn: any): (() => void) | null {
        if (!id) {
            return null;
        }
        this.fnIndex++;
        if (!this.listeners.hasOwnProperty(id)) {
            this.listeners[id] = {
                fnQueue: [],
                progress: {
                    active: false,
                    download: 0,
                    progress: 0.0,
                    state: 'loading',
                    totalDownload: 0,
                    totalUpload: 0,
                    upload: 0,
                },
            };
        }
        this.listeners[id].fnQueue[this.fnIndex] = fn;
        fn(this.listeners[id].progress);
        return () => {
            if (this.listeners.hasOwnProperty(id)) {
                delete this.listeners[id].fnQueue[this.fnIndex];
            }
        };
    }

    /* Check if progress is active */
    public isActive(id: number) {
        if (!this.listeners.hasOwnProperty(id)) {
            return false;
        } else {
            if (this.listeners[id].progress.active) {
                return true;
            } else {
                return false;
            }
        }
    }

    public remove(id: number) {
        if (this.listeners.hasOwnProperty(id)) {
            delete this.listeners[id];
        }
    }

    private callHandlers(id: number, progress: IFileProgress) {
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
