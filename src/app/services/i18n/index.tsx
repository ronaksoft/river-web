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

class I18n {
    public static I() {
        if (!this.instance) {
            this.instance = new I18n();
        }

        return this.instance;
    }

    private static instance: I18n;
    private lang: string = 'en';
    private translations: { [key: string]: string } = {};
    private dictionaryList: { [key: string]: any } = {};

    private constructor() {

    }

    public init(config: IConfig) {
        this.lang = config.defLang;
        this.dictionaryList = {};
        for (const [key, value] of Object.entries(config.dictionaries)) {
            this.dictionaryList[key] = this.flatten(value);
        }
        if (this.dictionaryList.hasOwnProperty(this.lang)) {
            this.translations = this.dictionaryList[this.lang];
        }
    }

    public t(key: string) {
        return this.translate(key);
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
        return this.translations[key] || key;
    }

    /* Thanks to https://github.com/hughsk/flat/blob/master/index.js */
    private flatten(target: any) {
        const delimiter = '.';
        const output: any = {};

        const fn = (object: any, prev?: any) => {
            Object.keys(object).forEach((key) => {
                const value = object[key];
                const isArray = Array.isArray(value);
                const type = Object.prototype.toString.call(value);
                const isObject = (type === '[object Object]' || type === '[object Array]');
                const newKey = prev ? prev + delimiter + key : key;
                if (!isArray && isObject && Object.keys(value).length) {
                    return fn(value, newKey);
                }
                output[newKey] = value;
            });
        };

        fn(target);

        return output;
    }
}

export default I18n.I();
