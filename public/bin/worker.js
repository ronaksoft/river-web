importScripts('wasm_exec.js');

let run;
let initSDK = null;
let loadConnInfo = null;
let fnCall = null;
let receive = null;
let wsOpen = null;

const go = new Go();

workerMessage = (cmd, data) => {
    self.postMessage({
        cmd,
        data,
    });
};

self.onmessage = function (e) {
    const d = e.data;
    switch (d.cmd) {
        case 'init':
            WebAssembly.instantiate(d.data, go.importObject).then((res) => {
                run = go.run(res.instance);
            });
            break;
        case 'initSDK':
            if (initSDK) {
                initSDK();
            }
            break;
        case 'receive':
            if (receive) {
                receive(d.data);
            }
            break;
        case 'wsOpen':
            if (wsOpen) {
                wsOpen(d.data);
            }
            break;
        case 'fnCall':
            if (fnCall) {
                fnCall(d.data.reqId, d.data.constructor, d.data.payload);
            }
            break;
        case 'loadConnInfo':
            if (loadConnInfo) {
                loadConnInfo(d.data);
            }
            break;
    }
};

saveConnInfo = (data) => {
    workerMessage('saveConnInfo', data);
};

setLoadConnInfo = (callback) => {
    loadConnInfo = callback;
    workerMessage('loadConnInfo', {});
};

setInitSDK = (callback) => {
    initSDK = callback;
};

wsSend = (b64) => {
    workerMessage('wsSend', b64);
};

fnUpdate = (b64) => {
    workerMessage('fnUpdate', b64);
};

wsError = (reqId, constructor, data) => {
    workerMessage('wsError', {reqId, constructor, data});
};

authProgress = (progress) => {
    workerMessage('authProgress', {progress});
};

setReceive = (callback) => {
    receive = callback;
};

setWsOpen = (callback) => {
    wsOpen = callback;
};

setFnCall = (callback) => {
    fnCall = callback;
};

fnCallback = (reqId, constructor, data) => {
    workerMessage('fnCallback', {
        reqId,
        constructor,
        data,
    });
};