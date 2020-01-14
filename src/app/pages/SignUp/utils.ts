import {codeLen, codePlaceholder} from "./index";

export const modifyCode = (str: string, remove?: boolean): { code: string, len: number } => {
    const s = codePlaceholder.split('');
    let nums = str.match(/\d+/g);
    const len = nums ? nums.join('').length : 0;
    if (nums) {
        nums = nums.join('').split('').slice(0, codeLen);
        nums.forEach((val, key) => {
            if (remove && nums && nums.length > 0 && nums.length - 1 === key) {
                s[key] = '_';
            } else {
                s[key] = val;
            }
        });
    }
    return {code: s.join(''), len};
};