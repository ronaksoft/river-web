/*
    Creation Time: 2018 - Aug - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

export default class UniqueId {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UniqueId();
        }

        return this.instance;
    }

    public static getRandomId(): number {
        return parseInt(Math.random().toFixed(10).split('.')[1], 10);
    }

    private static instance: UniqueId;
    private lastId: any = {};

    private constructor() {
    }

    public setLastId(domain: string, lastId: number) {
        this.lastId[domain] = lastId;
    }

    public getId(domain: string, prefix ?: string): string {
        let id = this.lastId[domain] || 0;
        this.lastId[domain] = ++id;
        if (prefix) {
            return prefix + String(id);
        } else {
            return String(id);
        }
    }
}
