/*
    Creation Time: 2020 - March - 30
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

export default class Smoother {
    private lastStateTime: number = 0;
    private lastState: boolean = false;
    private stateTimeout: any = null;
    private readonly timeout: number = 2000;
    private readonly updateFn: any;

    public constructor(timeout: number, updateFn: () => void) {
        this.timeout = timeout;
        this.updateFn = updateFn;
    }

    public getState(s: boolean) {
        let state = true;
        if (s !== this.lastState) {
            if (s) {
                const now = Date.now();
                if (this.stateTimeout) {
                    clearTimeout(this.stateTimeout);
                }
                if (this.lastStateTime === 0 || now - this.lastStateTime <= this.timeout) {
                    state = true;
                } else {
                    this.stateTimeout = setTimeout(() => {
                        this.updateFn();
                    }, this.timeout);
                    state = false;
                }
                this.lastStateTime = now;
            } else if (this.stateTimeout) {
                clearTimeout(this.stateTimeout);
                this.stateTimeout = null;
            }
        }
        this.lastState = s;
        return state;
    }

    public destroy() {
        if (this.stateTimeout) {
            clearTimeout(this.stateTimeout);
        }
    }
}
