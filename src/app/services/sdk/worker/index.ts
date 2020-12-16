// @ts-ignore
importScripts('/bin/wasm_exec.js?v7');

// @ts-ignore
interface IWorker extends Worker {
    wasmLoad: (connInfo: string, serverKeys: string) => string | undefined;
    wasmSetServerTime: (time: number) => void;
    wasmAuth: (reqId: number, step: number, data?: string) => void;
    wasmDecode: (withParse: boolean, arg: string, reqId: number) => void;
    wasmEncode: (withSend: boolean, reqId: number, constructor: number, msg: string, teamId?: string, teamAccessHash?: string) => void;
    wasmGenSrpHash: (reqId: number, pass: string, algorithm: number, algorithmData: string) => void;
    wasmGenInputPassword: (reqId: number, pass: string, accountPass: string) => void;
    jsAuth: (reqId: number, step: number, arg: string) => void;
    jsDecode: (withParse: boolean, reqId: number, constructor: number, msg: string) => void;
    jsEncode: (withSend: number, reqId: number, msg: string) => void;
    jsUpdate: (msg: string) => void;
    jsGenSrpHash: (reqId: number, msg: string) => void;
    jsGenInputPassword: (reqId: number, msg: string) => void;
    jsAuthProgress: (progress: number) => void;
    jsSave: (data: string) => void;
    jsLoaded: () => void;
}

interface IWorkerMessage {
    cmd: string;
    data: any;
}

const C_NO_AUTH_KEY = "no auth key";

/* eslint-disable */
// @ts-ignore
const ctx: IWorker = self as any;

// @ts-ignore
const go = new Go();
/* eslint-enable */

const workerMessage = (cmd: string, data: any) => {
    ctx.postMessage({
        cmd,
        data,
    });
};

ctx.onmessage = ((e) => {
    const d = e.data as IWorkerMessage;
    messageHandler(d.cmd, d.data);
});

const messageHandler = (cmd: string, data: any) => {
    switch (cmd) {
        case 'init':
            console.time('wasm init');
            fetch('/bin/river.wasm?v32').then((response) => {
                WebAssembly.instantiateStreaming(response, go.importObject).then((res) => {
                    console.timeEnd('wasm init');
                    go.run(res.instance);
                }).catch((err) => {
                    console.warn(err);
                    response.arrayBuffer().then((data) => {
                        WebAssembly.instantiate(data, go.importObject).then((res) => {
                            console.timeEnd('wasm init');
                            go.run(res.instance);
                        });
                    });
                });
            });
            break;
        case 'load':
            if (ctx.wasmLoad) {
                if (ctx.wasmLoad(data.connInfo, data.serverKeys) === C_NO_AUTH_KEY) {
                    workerMessage('createAuthKey', {});
                } else {
                    workerMessage('getServerTime', {});
                }
                workerMessage('ready', {});
            }
            break;
        case 'setServerTime':
            if (ctx.wasmSetServerTime) {
                ctx.wasmSetServerTime(data);
            }
            break;
        case 'auth':
            if (ctx.wasmAuth) {
                ctx.wasmAuth(data.reqId, data.step, data.data);
            }
            break;
        case 'decode':
            if (ctx.wasmDecode) {
                ctx.wasmDecode(data.withParse, data.data, data.reqId || 0);
            }
            break;
        case 'encode':
            if (ctx.wasmEncode) {
                if (data.teamId && data.teamAccessHash) {
                    ctx.wasmEncode(data.withSend, data.reqId, data.constructor, data.payload, data.teamId, data.teamAccessHash);
                } else {
                    ctx.wasmEncode(data.withSend, data.reqId, data.constructor, data.payload);
                }
            }
            break;
        case 'genSrpHash':
            if (ctx.wasmGenSrpHash) {
                ctx.wasmGenSrpHash(data.reqId, data.pass, data.algorithm, data.algorithmData);
            }
            break;
        case 'genInputPassword':
            if (ctx.wasmGenInputPassword) {
                ctx.wasmGenInputPassword(data.reqId, data.pass, data.accountPass);
            }
            break;
    }
};

ctx.jsAuth = (reqId, step, data) => {
    workerMessage('auth', {data, reqId, step});
};

ctx.jsDecode = (withParse, reqId, constructor, msg) => {
    workerMessage('decode', {constructor, msg, reqId, withParse});
};

ctx.jsEncode = (withSend, reqId, msg) => {
    workerMessage('encode', {msg, reqId, withSend});
};

ctx.jsUpdate = (msg) => {
    workerMessage('update', msg);
};

ctx.jsGenSrpHash = (reqId, msg) => {
    workerMessage('genSrpHash', {msg, reqId});
};

ctx.jsGenInputPassword = (reqId, msg) => {
    workerMessage('genInputPassword', {msg, reqId});
};

ctx.jsSave = (data) => {
    workerMessage('save', data);
};

ctx.jsAuthProgress = (progress) => {
    workerMessage('authProgress', progress);
};

ctx.jsLoaded = () => {
    workerMessage('wasmLoaded', {});
};