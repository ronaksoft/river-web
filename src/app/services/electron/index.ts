/*
    Creation Time: 2018 - Dec - 31
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {IpcRenderer} from 'electron';

export const C_ELECTRON_SUBJECT = {
    Logout: 'logout',
    Setting: 'settings',
    SizeMode: 'sizeMode',
};

export default class ElectronService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new ElectronService();
        }

        return this.instance;
    }

    private static instance: ElectronService;

    private ipcRenderer: IpcRenderer;
    private fnQueue: any = {};
    private fnIndex: number = 0;

    private constructor() {
        // @ts-ignore
        this.ipcRenderer = window.ipcRenderer;

        if (this.ipcRenderer) {
            this.ipcRenderer.on('settings', (event: any, msg: any) => {
                this.callHandlers(C_ELECTRON_SUBJECT.Setting, msg);
            });
            this.ipcRenderer.on('logout', (event: any, msg: any) => {
                this.callHandlers(C_ELECTRON_SUBJECT.Logout, msg);
            });
            this.ipcRenderer.on('sizeMode', (event: any, msg: any) => {
                this.callHandlers(C_ELECTRON_SUBJECT.SizeMode, msg);
            });
        }
    }

    /* Listen to event */
    public listen(subject: string, fn: any): (() => void) | null {
        if (!subject) {
            return null;
        }
        this.fnIndex++;
        if (!this.fnQueue.hasOwnProperty(subject)) {
            this.fnQueue[subject] = {};
        }
        this.fnQueue[subject][this.fnIndex] = fn;
        return () => {
            delete this.fnQueue[subject][this.fnIndex];
        };
    }

    /* Call queue handler */
    private callHandlers(subject: string, payload: any) {
        if (!this.fnQueue[subject]) {
            return;
        }
        const keys = Object.keys(this.fnQueue[subject]);
        keys.forEach((key) => {
            const fn = this.fnQueue[subject][key];
            if (fn) {
                fn(payload);
            }
        });
    }
}
