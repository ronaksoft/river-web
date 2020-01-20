/*
    Creation Time: 2020 - Jan - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

// @ts-ignore
import css from 'dom-css';

let scrollbarWidth: any = false;

export default function getScrollbarWidth() {
    if (scrollbarWidth !== false) {
        return scrollbarWidth;
    }
    /* istanbul ignore else */
    if (typeof document !== 'undefined') {
        const div = document.createElement('div');
        css(div, {
            MsOverflowStyle: 'scrollbar',
            height: 100,
            overflow: 'scroll',
            position: 'absolute',
            top: -9999,
            width: 100,
        });
        document.body.appendChild(div);
        scrollbarWidth = (div.offsetWidth - div.clientWidth);
        document.body.removeChild(div);
    } else {
        scrollbarWidth = 0;
    }
    return scrollbarWidth || 0;
}