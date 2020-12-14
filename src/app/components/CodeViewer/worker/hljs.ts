// @ts-ignore
interface IWorker extends Worker {
    hljs: any;
}
/* eslint-disable */
// @ts-ignore
const ctx: IWorker = self as any;

ctx.onmessage = ((e: any) => {
    const data: { cmd: string, payload: any } = e.data;
    if (data.cmd === 'compile') {
        importScripts('/bin/highlight.min.js?v2');

        ctx.hljs.configure({
            tabReplace: '    ', // 4 spaces
        });

        const result = ctx.hljs.highlightAuto(data.payload);
        const lines: string[] = [];
        result.value.split(/\r\n|\r|\n/g).forEach((item: string, i: number) => {
            lines.push(`<tr><td>${i + 1}</td><td>${item}</td></tr>`);
        });

        const res = `<table>${lines.join('\n')}</table>`;
        ctx.postMessage({cmd: 'highlight', payload: res, language: result.language});
    }
});