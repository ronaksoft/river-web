importScripts('wasm_exec.js');

let run;
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
        case 'receive':
            receive(d.data);
            break;
        case 'wsOpen':
            wsOpen(d.data);
            break;
        case 'fnCall':
            wsOpen(d.data);
            break;
    }
};

saveConnInfo = (data) => {
    workerMessage('saveConnInfo', data);
};

setLoadConnInfo = (callback) => {
    loadConnInfo = callback;
};

initSDK = (callback) => {
    callback();
    workerMessage('initSDK', {});
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
    wasmWorker.postMessage({
        cmd: 'fnCallback',
        reqId,
        constructor,
        data,
    });
};