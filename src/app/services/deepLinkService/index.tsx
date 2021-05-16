/*
    Creation Time: 2021 - May - 02
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2021
*/

/*
Must be logged out:
rvr://register?phone=00989016876040

Must be logged in:
rvr://open_chat?username=hamidrezakk

rvr://new_contact?first_name=Ali&last_name=Samaiee&phone=989016876040

rvr://new_contact?username=ali

rvr://settings_debug

rvr://settings

rvr://bot_start?username=godbot
 */

export const C_DEEP_LINK_EVENT = {
    BotStart: 5,
    NewContact: 2,
    OpenChat: 1,
    Register: 6,
    Settings: 4,
    SettingsDebug: 3,
};

interface IBroadcastItem {
    fnQueue: { [key: number]: any };
    data: any;
}

export default class DeepLinkService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new DeepLinkService();
        }

        return this.instance;
    }

    private static instance: DeepLinkService;
    private fnIndex: number = 0;
    private listeners: { [key: number]: IBroadcastItem } = {};

    private constructor() {
    }

    public parseLink(link: string) {
        if (link.indexOf('//') === 0) {
            link = link.slice(2);
        }
        const url = new URL(link);
        const params: any = {};
        url.search.slice(1).split('&').reduce((a, b) => {
            const [key, val] = b.split('=');
            a[key] = val;
            return a;
        }, params);
        switch (url.pathname.slice(2)) {
            case 'open_chat':
                this.callHandlers(C_DEEP_LINK_EVENT.OpenChat, params);
                break;
            case 'bot_start':
                this.callHandlers(C_DEEP_LINK_EVENT.BotStart, params);
                break;
            case 'new_contact':
                this.callHandlers(C_DEEP_LINK_EVENT.NewContact, params);
                break;
            case 'settings':
                this.callHandlers(C_DEEP_LINK_EVENT.Settings, params);
                break;
            case 'settings_debug':
                this.callHandlers(C_DEEP_LINK_EVENT.SettingsDebug, params);
                break;
            case 'register':
                this.callHandlers(C_DEEP_LINK_EVENT.Register, params);
                break;
        }
    }

    public listen(name: number, fn: any): (() => void) | null {
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

    private callHandlers(name: number, data: any) {
        if (!this.listeners.hasOwnProperty(name)) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            try {
                this.listeners[name].data = data;
                const keys = Object.keys(this.listeners[name].fnQueue);
                keys.forEach((key) => {
                    const fn = this.listeners[name].fnQueue[key];
                    if (fn) {
                        fn(data);
                    }
                });
                resolve(null);
            } catch (e) {
                reject(e);
            }
        });
    }
}
