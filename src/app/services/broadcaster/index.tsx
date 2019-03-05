/*
    Creation Time: 2019 - March - 04
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

interface IBroadcastItem {
    fnQueue: { [key: number]: any };
    data: any;
}

export default class Broadcaster {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new Broadcaster();
        }

        return this.instance;
    }

    private static instance: Broadcaster;
    private fnIndex: number = 0;

    private listeners: { [key: string]: IBroadcastItem } = {};

    private constructor() {
    }

    public publish(name: string, item: IBroadcastItem) {
        this.callHandlers(name, item);
    }

    public listen(name: string, fn: any): (() => void) | null {
        if (!name) {
            return null;
        }
        this.fnIndex++;
        const fnIndex = this.fnIndex;
        if (!this.listeners.hasOwnProperty(name)) {
            this.listeners[name] = {
                data: null,
                fnQueue: [],
            };
        }
        this.listeners[name].fnQueue[fnIndex] = fn;
        return () => {
            if (this.listeners.hasOwnProperty(name)) {
                delete this.listeners[name].fnQueue[fnIndex];
            }
        };
    }

    public remove(name: string) {
        if (this.listeners.hasOwnProperty(name)) {
            delete this.listeners[name];
        }
    }

    private callHandlers(name: string, data: any) {
        if (!this.listeners.hasOwnProperty(name)) {
            return;
        }
        this.listeners[name].data = data;
        const keys = Object.keys(this.listeners[name].fnQueue);
        keys.forEach((key) => {
            const fn = this.listeners[name].fnQueue[key];
            if (fn) {
                fn(data);
            }
        });
    }
}
