/*
    Creation Time: 2018 - Dec - 31
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {IpcRenderer} from 'electron';
import DeepLinkService from "../deepLinkService";

export const C_ELECTRON_SUBJECT = {
    About: 'about',
    FnCall: 'fnCall',
    FnCallback: 'fnCallback',
    Logout: 'logout',
    Setting: 'settings',
    SizeMode: 'sizeMode',
};

export const C_ELECTRON_CMD = {
    AskForMediaAccess: 'askForMediaAccess',
    Download: 'download',
    Error: 'error',
    Focus: 'focus',
    GetLoadUrl: 'getLoadUrl',
    GetScreenCaptureList: 'getScreenCaptureList',
    GetVersion: 'getVersion',
    PreviewFile: 'previewFile',
    Ready: 'ready',
    RevealFile: 'revealFile',
    ScreenCapturePermission: 'screenCapturePermission',
    SetBadgeCounter: 'setBadgeCounter',
    SetLoadUrl: 'setLoadUrl',
    ToggleMenuBar: 'toggleMenuBar',
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

    public static isNewElectron() {
        // @ts-ignore
        return window.isNewElectron || false;
    }

    public static electronVersion() {
        if (!ElectronService.isElectron()) {
            return null;
        }
        const arr = window.navigator.userAgent.split(' ').filter(o => /electron/i.test(o));
        if (arr.length > 0) {
            try {
                return arr[0].split('/')[1];
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    public static openExternal(url: string) {
        // @ts-ignore
        return window.electronShell.openExternal(url);
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ElectronService();
        }

        return this.instance;
    }

    private static instance: ElectronService;

    private readonly ipcRenderer: IpcRenderer;
    private fnQueue: any = {};
    private fnIndex: number = 0;
    private reqId: number = 0;
    private messageListeners: { [key: number]: IMessageListener } = {};
    private deepLinkService: DeepLinkService;

    private constructor() {
        // @ts-ignore
        this.ipcRenderer = window.ipcRenderer;
        this.deepLinkService = DeepLinkService.getInstance();

        if (this.ipcRenderer) {
            this.ipcRenderer.on('settings', (event: any, msg: any) => {
                this.callHandlers(C_ELECTRON_SUBJECT.Setting, msg);
            });
            this.ipcRenderer.on('about', (event: any, msg: any) => {
                this.callHandlers(C_ELECTRON_SUBJECT.About, msg);
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
            this.ipcRenderer.on('deepLink', (event: any, data: any) => {
                this.deepLinkService.parseLink(data);
            });
            this.send(C_ELECTRON_CMD.Ready, {});
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
    public revealFile(path: string, lastModified: string) {
        return this.send(C_ELECTRON_CMD.RevealFile, {
            lastModified,
            path,
        });
    }

    /* Preview file */
    public previewFile(path: string, lastModified: string) {
        return this.send(C_ELECTRON_CMD.PreviewFile, {
            lastModified,
            path,
        });
    }

    /* Set Badge Counter */
    public setBadgeCounter(counter: number) {
        return this.send(C_ELECTRON_CMD.SetBadgeCounter, {
            counter,
        });
    }

    /* Toggle menu bar */
    public toggleMenuBar() {
        return this.send(C_ELECTRON_CMD.ToggleMenuBar, {});
    }

    /* Get Load URL */
    public getLoadUrl() {
        return this.send(C_ELECTRON_CMD.GetLoadUrl, {});
    }

    /* Set Load URL */
    public setLoadUrl(url: string) {
        return this.send(C_ELECTRON_CMD.SetLoadUrl, {
            url,
        });
    }

    /* Ask for media permission */
    public askForMediaAccess(deviceType: 'microphone' | 'camera' | 'screen') {
        return this.send(C_ELECTRON_CMD.AskForMediaAccess, {
            deviceType,
        });
    }

    /* Screen Capture Permission */
    public screenCapturePermission() {
        return this.send(C_ELECTRON_CMD.ScreenCapturePermission, {});
    }

    /* Get Screen Capture List */
    public getScreenCaptureList() {
        return this.send(C_ELECTRON_CMD.GetScreenCaptureList, {});
    }

    /* Get Version */
    public getVersion() {
        return this.send(C_ELECTRON_CMD.GetVersion, {});
    }

    /* Focus */
    public focus() {
        return this.send(C_ELECTRON_CMD.Focus, {});
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
        if (!this.ipcRenderer) {
            return Promise.reject('non ipcRenderer');
        }
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
