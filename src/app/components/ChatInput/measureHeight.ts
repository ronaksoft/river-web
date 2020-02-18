const HIDDEN_TEXTAREA_STYLE = {
    'height': '0',
    'max-height': 'none',
    'min-height': '0',
    'overflow': 'hidden',
    'position': 'absolute',
    'right': '0',
    'top': '0',
    'visibility': 'hidden',
    'z-index': '-1000',
};

const SIZING_STYLE = [
    'letter-spacing',
    'line-height',
    'font-family',
    'font-weight',
    'font-size',
    'font-style',
    'tab-size',
    'text-rendering',
    'text-transform',
    'width',
    'text-indent',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'box-sizing',
];

const computedStyleCache: any = {};

const hiddenDiv = document.createElement('div');
const hiddenTextarea = document.createElement('textarea');

const forceHiddenStyles = (node: any) => {
    Object.keys(HIDDEN_TEXTAREA_STYLE).forEach(key => {
        node.style.setProperty(key, HIDDEN_TEXTAREA_STYLE[key], 'important');
    });
};

forceHiddenStyles(hiddenTextarea);

export const measureNodeHeight = (
    uiTextNode: any,
    uid: any,
    useCache: boolean = false,
    minRows: number | null = null,
    maxRows: number | null = null,
) => {
    if (hiddenDiv.parentNode === null) {
        document.body.appendChild(hiddenDiv);
        hiddenDiv.appendChild(hiddenTextarea);
    }

    // Copy all CSS properties that have an impact on the height of the content in
    // the textbox
    const nodeStyling = calculateNodeStyling(uiTextNode, uid, useCache);

    if (nodeStyling === null) {
        return null;
    }

    const {paddingSize, borderSize, boxSizing, sizingStyle} = nodeStyling;

    // Need to have the overflow attribute to hide the scrollbar otherwise
    // text-lines will not calculated properly as the shadow will technically be
    // narrower for content
    Object.keys(sizingStyle).forEach(key => {
        hiddenTextarea.style[key] = sizingStyle[key];
    });
    forceHiddenStyles(hiddenTextarea);
    hiddenTextarea.value = uiTextNode.value || uiTextNode.placeholder || 'x';

    let minHeight = -Infinity;
    let maxHeight = Infinity;
    let height = hiddenTextarea.scrollHeight;

    if (boxSizing === 'border-box') {
        // border-box: add border, since height = content + padding + border
        height = height + borderSize;
    } else if (boxSizing === 'content-box') {
        // remove padding, since height = content
        height = height - paddingSize;
    }

    // measure height of a textarea with a single row
    hiddenTextarea.value = 'x';
    const singleRowHeight = hiddenTextarea.scrollHeight - paddingSize;

    // Stores the value's rows count rendered in `hiddenTextarea`,
    // regardless if `maxRows` or `minRows` props are passed
    const valueRowCount = Math.floor(height / singleRowHeight);

    if (minRows !== null) {
        minHeight = singleRowHeight * minRows;
        if (boxSizing === 'border-box') {
            minHeight = minHeight + paddingSize + borderSize;
        }
        height = Math.max(minHeight, height);
    }

    if (maxRows !== null) {
        maxHeight = singleRowHeight * maxRows;
        if (boxSizing === 'border-box') {
            maxHeight = maxHeight + paddingSize + borderSize;
        }
        height = Math.min(maxHeight, height);
    }

    const rowCount = Math.floor(height / singleRowHeight + 0.5);

    return {height, minHeight, maxHeight, rowCount, valueRowCount};
};

const calculateNodeStyling = (node: any, uid: any, useCache: boolean = false) => {
    if (useCache && computedStyleCache[uid]) {
        return computedStyleCache[uid];
    }

    const style = window.getComputedStyle(node);

    if (style === null) {
        return null;
    }

    const sizingStyle = SIZING_STYLE.reduce((obj, name) => {
        obj[name] = style.getPropertyValue(name);
        return obj;
    }, {});

    const boxSizing = sizingStyle['box-sizing'];

    // probably node is detached from DOM, can't read computed dimensions
    if (boxSizing === '') {
        return null;
    }

    const paddingSize =
        parseFloat(sizingStyle['padding-bottom']) +
        parseFloat(sizingStyle['padding-top']);

    const borderSize =
        parseFloat(sizingStyle['border-bottom-width']) +
        parseFloat(sizingStyle['border-top-width']);

    const nodeInfo = {
        borderSize,
        boxSizing,
        paddingSize,
        sizingStyle,
    };

    if (useCache) {
        computedStyleCache[uid] = nodeInfo;
    }

    return nodeInfo;
};

export const purgeCache = (uid: any) => {
    delete computedStyleCache[uid];
};
