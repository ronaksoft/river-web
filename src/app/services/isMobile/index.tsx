/*
    Creation Time: 2019 - March - 04
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

export default class IsMobile {
    public static isAndroid() {
        return Boolean(navigator.userAgent.match(/Android/i));
    }

    public static isBlackBerry() {
        return Boolean(navigator.userAgent.match(/BlackBerry/i));
    }

    public static isIOS() {
        return Boolean(navigator.userAgent.match(/iPhone|iPad|iPod/i));
    }

    public static isOpera() {
        return Boolean(navigator.userAgent.match(/Opera Mini/i));
    }

    public static isWindowsPhone() {
        return Boolean(navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i));
    }

    public static isAny() {
        return Boolean(IsMobile.isAndroid() || IsMobile.isBlackBerry() || IsMobile.isIOS() || IsMobile.isOpera() || IsMobile.isWindowsPhone());
    }
}

export const IsMobileView = () => {
    return (window.innerWidth < 600);
};