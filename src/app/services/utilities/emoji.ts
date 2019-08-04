import {toArray} from "stringz/dist";

const isEmoji = (str: string) => {
    const reg = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;
    return reg.test(str);
};

export const emojiLevel = (str: string | undefined) => {
    if (!str) {
        return 0;
    }
    const len = str.length;
    if (len > 12 || len === 0) {
        return 0;
    }
    let emojiLen = 0;
    const arr = toArray(str);
    arr.forEach((s) => {
        if (isEmoji(s)) {
            emojiLen++;
        }
    });
    if (emojiLen === 1 && arr.length === 1) {
        return 2;
    }
    if (emojiLen > 1 && emojiLen < 4 && arr.length === emojiLen) {
        return 1;
    }
    return 0;
};