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
    FnCall: 'fnCall',
    FnCallback: 'fnCallback',
    Logout: 'logout',
    Setting: 'settings',
    SizeMode: 'sizeMode',
};

export const C_ELECTRON_CMD = {
    Download: 'download',
    Error: 'error',
    RevealFile: 'revealFile',
};

interface IMessageListener {
    cmd: string;
    reject: any;
    resolve: any;
}

export default class ElectronService {
    public static isElectron() {
        // @ts-ignore
        return window.isElectron || false;
    }

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
    private reqId: number = 0;
    private messageListeners: { [key: number]: IMessageListener } = {};

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
            this.ipcRenderer.on('fnCallback', (event: any, data: any) => {
                this.response(data);
            });
        }
    }

    /* Listen to event */
    public listen(subject: string, fn: any): (() => void) | null {
        if (!subject) {
            return null;
        }
        this.fnIndex++;
        const fnIndex = this.fnIndex;
        if (!this.fnQueue.hasOwnProperty(subject)) {
            this.fnQueue[subject] = {};
        }
        this.fnQueue[subject][fnIndex] = fn;
        return () => {
            delete this.fnQueue[subject][fnIndex];
        };
    }

    /* Download */
    public download(url: string, fileName: string) {
        return this.send(C_ELECTRON_CMD.Download, {
            fileName,
            url,
        });
    }

    /* Reveal file in folder */
    public revealFile(path: string) {
        return this.send(C_ELECTRON_CMD.RevealFile, {
            path,
        });
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

    private send(cmd: string, data: any) {
        let internalResolve = null;
        let internalReject = null;

        const reqId = ++this.reqId;

        const promise = new Promise<any>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        this.messageListeners[reqId] = {
            cmd,
            reject: internalReject,
            resolve: internalResolve,
        };

        this.ipcRenderer.send('fnCall', {
            cmd,
            data,
            reqId,
        });

        return promise;
    }

    private response(data: any) {
        if (!this.messageListeners.hasOwnProperty(data.reqId)) {
            return;
        }
        if (data.cmd === C_ELECTRON_CMD.Error) {
            this.messageListeners[data.reqId].reject(data.data);
        } else {
            this.messageListeners[data.reqId].resolve(data.data);
        }
        delete this.messageListeners[data.reqId];
    }
}
