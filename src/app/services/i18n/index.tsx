/*
    Creation Time: 2019 - June - 15
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

interface IConfig {
    defLang: string;
    dictionaries: { [key: string]: any };
}

const C_CACHE_SIZE = 100;

class I18n {
    public static I() {
        if (!this.instance) {
            this.instance = new I18n();
        }

        return this.instance;
    }

    private static instance: I18n;
    private lang: string = 'en';
    private translations: any = {};
    private dictionaryList: { [key: string]: any };
    private lastTranslations: string[] = [];
    private lastTransMap: { [key: string]: string } = {};

    private constructor() {

    }

    public init(config: IConfig) {
        this.lang = config.defLang;
        this.dictionaryList = config.dictionaries;
        if (this.dictionaryList.hasOwnProperty(this.lang)) {
            this.translations = this.dictionaryList[this.lang];
        }
    }

    public t(key: string) {
        const v = this.getCache(key);
        if (v) {
            return v;
        }
        const val = this.translate(key);
        this.storeCache(key, val);
        return val;
    }

    public tf(key: string, args: string | string[]) {
        const val = this.t(key);
        if (val === key) {
            return val;
        }
        if (typeof args === 'string') {
            return val.replace(`{0}`, args);
        } else {
            return this.format(val, args);
        }
    }

    public changeLang(lang: string) {
        this.lang = lang;
    }

    public getTranslation() {
        return this.translations;
    }

    private format(text: string, args: string[]) {
        return text.replace(/{(\d+)}/g, (match: any, i: number) => {
            return typeof args[i] !== undefined ? args[i] : match;
        });
    }

    private translate(key: string) {
        if (key.indexOf('.') === -1) {
            return this.translations[key] || key;
        } else {
            const keys = key.split('.');
            let q: any = this.translations;
            const len = keys.length - 1;
            for (let i = 0; i < keys.length; i++) {
                if (q.hasOwnProperty(keys[i])) {
                    if (i === len) {
                        return q[keys[i]];
                    } else {
                        q = q[keys[i]];
                    }
                } else {
                    return key;
                }
            }
        }
    }

    private storeCache(key: string, val: string) {
        this.lastTranslations.push(key);
        this.lastTransMap[key] = val;
        if (this.lastTranslations.length > C_CACHE_SIZE) {
            const last = this.lastTranslations.shift();
            if (last) {
                delete this.lastTransMap[last];
            }
        }
    }

    private getCache(key: string) {
        if (this.lastTransMap.hasOwnProperty(key)) {
            return this.lastTransMap[key];
        } else {
            return null;
        }
    }
}

export default I18n.I();
