/* eslint-disable */
// @ts-ignore
self.onmessage = ((e: any) => {
    const data: { cmd: string, payload: any } = e.data;
    if (data.cmd === 'compile') {
        // @ts-ignore
        console.log(self.hljs);
        self.importScripts('/bin/highlight.min.js?v2');
        // @ts-ignore
        console.log(self.hljs);
        // @ts-ignore
        self.hljs.configure({
            tabReplace: '    ', // 4 spaces
        });
        // @ts-ignore
        const result = self.hljs.highlightAuto(data.payload);
        console.log(result);
        const lines: string[] = [];
        result.value.split(/\r\n|\r|\n/g).forEach((item: string, i: number) => {
            lines.push(`<tr><td>${i + 1}</td><td>${item}</td></tr>`);
        });
        const res = `<table>${lines.join('\n')}</table>`;
        self.postMessage({cmd: 'highlight', payload: res, language: result.language});
    }
});