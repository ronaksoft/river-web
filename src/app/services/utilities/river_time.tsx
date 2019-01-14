/*
    Creation Time: 2019 - Jan - 14
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

export default class RiverTime {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new RiverTime();
        }
        return this.instance;
    }

    private static instance: RiverTime;
    private timeDiff: number = 0;

    public constructor() {
        this.timeDiff = 0;
    }

    /* Get time */
    public now(timestamp?: any) {
        if (timestamp) {
            return timestamp + this.timeDiff;
        } else {
            return Math.floor(Date.now() / 1000) + this.timeDiff;
        }
    }

    /* Get millisecond time */
    public milliNow() {
        return Date.now() + this.timeDiff * 1000;
    }

    public setServerTime(timestamp: number) {
        const t = Math.floor(Date.now() / 1000);
        this.timeDiff = timestamp - t;
    }
}
