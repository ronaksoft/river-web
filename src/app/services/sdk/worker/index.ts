importScripts('/bin/wasm_exec.js?v6');

// @ts-ignore
interface IWorker extends Worker {
    wasmLoad: (connInfo: string, serverKeys: string) => string | undefined;
    wasmSetServerTime: (time: number) => void;
    wasmAuthStep1: (arg: string) => void;
    wasmAuthStep2: (arg: string) => void;
    wasmAuthStep3: (arg: string) => void;
    wasmDecode: (arg: string) => void;
    wasmEncode: (reqId: number, constructor: number, msg: string, teamId?: string, teamAccessHash?: string) => void;
    wasmGenSrpHash: (id: number, pass: string, algorithm: number, algorithmData: string) => void;
    wasmGenInputPassword: (id: number, pass: string, accountPass: string) => void;
    jsAuthStep1: (arg: string) => void;
    jsAuthStep2: (arg: string) => void;
    jsAuthStep3: (arg: string) => void;
    jsDecode: (reqId: number, constructor: number, msg: string) => void;
    jsEncode: (reqId: number, msg: string) => void;
    jsGenSrpHash: (reqId: number, msg: string) => void;
    jsGenInputPassword: (reqId: number, msg: string) => void;
    jsAuthProgress: (progress: number) => void;
    jsSave: (data: string) => void;
}

/* eslint-disable */
// @ts-ignore
const ctx: IWorker = self as any;

const workerMessage = (cmd: string, data: any) => {
    ctx.postMessage({
        cmd,
        data,
    });
};

ctx.onmessage = ((e: any) => {

});
