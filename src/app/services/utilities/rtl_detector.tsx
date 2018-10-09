export default class RTLDetector {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new RTLDetector();
        }
        return this.instance;
    }

    private static instance: RTLDetector;
    private numberRange: string = '[\u06F0-\u06F9]';
    private charRange: string = ['[\\s,\u06A9\u06AF\u06C0\u06CC\u060C',
        '\u062A\u062B\u062C\u062D\u062E\u062F',
        '\u063A\u064A\u064B\u064C\u064D\u064E',
        '\u064F\u067E\u0670\u0686\u0698\u200C',
        '\u0621-\u0629\u0630-\u0639\u0641-\u0654]'].join();
    private rtlPunctuations: string = '(،|؟|«|»|؛|٬)';
    private rtl = new RegExp('^' + this.combineRegExps([this.charRange, this.numberRange, this.rtlPunctuations])
        + '+$');

    public direction(str: string): boolean {
        if (!str && typeof str !== 'string') {
            return false;
        }
        return this.decideRtl(str);
    }

    private decideRtl(str: string) {
        if (str.length === 0 || str === 'undefined') {
            return false;
        }
        const emojiRanges = [
            '\ud83c[\udf00-\udfff]', // u+1F300 to U+1F3FF
            '\ud83d[\udc00-\ude4f]', // u+1F400 to U+1F64F
            '\ud83d[\ude80-\udeff]',  // u+1F680 to U+1F6FF
        ];
        str = str.replace(new RegExp(emojiRanges.join('|'), 'g'), '');
        // detects mentions :
        str = str.replace(/(^|\s)@(\w+)/g, '');
        str = str.trim();
        str = str.substring(0, 1);
        return this.rtl.test(str);
    }

    private combineRegExps(array: string[]): any {
        let combined = '(';
        for (let i = 0; i < array.length; i++) {
            combined += '(';
            if (i !== array.length - 1) {
                combined += array[i] + ')|';
            } else {
                combined += array[i] + ')';
            }
        }
        return combined + ')';
    }
}
