export const enToFa = (str: string | number) => {
    if (str === null || str === undefined) {
        return '';
    }
    if (typeof str === 'number') {
        str = str.toString();
    }
    const fa = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '،'];
    const en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ','];
    for (let i = 0; i < fa.length; i++) {
        str = str.replace(new RegExp(en[i], 'g'), fa[i]);
    }
    return str;
};

export const faToEn = (str: string | number) => {
    if (str === null || str === undefined) {
        return '';
    }
    if (typeof str === 'number') {
        str = str.toString();
    }
    const fa = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '،'];
    const en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ','];
    for (let i = 0; i < en.length; i++) {
        str = str.replace(new RegExp(fa[i], 'g'), en[i]);
    }
    return str;
};

const lang: string = localStorage.getItem('river.lang') || 'en';

export const localize = (str: string | number) => {
    if (lang === 'fa') {
        return enToFa(str);
    }
    return str;
};

