importScripts('wasm_exec.js?v1');

let run;
let initSDK = null;
let loadConnInfo = null;
let fnCall = null;
let fnEncrypt = null;
let fnDecrypt = null;
let receive = null;
let wsOpen = null;

const go = new Go();

workerMessage = (cmd, data) => {
    self.postMessage({
        cmd,
        data,
    });
};

const base64ToBuffer = (base64) => {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;
};

if (!WebAssembly.instantiateStreaming) { // polyfill
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
    };
}


self.onmessage = function (e) {
    const d = e.data;
    switch (d.cmd) {
        case 'init':
            console.time('init');
            fetch('river.wasm?v17').then((response) => {
                WebAssembly.instantiateStreaming(response, go.importObject).then((res) => {
                    console.timeEnd('init');
                    run = go.run(res.instance);
                }).catch(() => {
                    response.arrayBuffer().then((data) => {
                        WebAssembly.instantiate(data, go.importObject).then((res) => {
                            console.timeEnd('init');
                            run = go.run(res.instance);
                        });
                    });
                });
            });
            break;
        case 'initSDK':
            if (initSDK) {
                initSDK(d.data || 0);
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
        case 'fnEncrypt':
            if (fnEncrypt) {
                fnEncrypt(d.data.reqId, d.data.constructor, d.data.payload);
            }
            break;
        case 'fnDecrypt':
            if (fnDecrypt) {
                fnDecrypt(d.data);
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

fnStarted = (duration) => {
    workerMessage('fnStarted', {
        duration,
    });
};

setFnEncrypt = (callback) => {
    fnEncrypt = callback;
};

fnEncryptCallback = (reqId, b64) => {
    workerMessage('fnEncryptCallback', {
        reqId,
        data: b64,
    });
};

setFnDecrypt = (callback) => {
    fnDecrypt = callback;
};

fnDecryptCallback = (reqId, constructor, data) => {
    workerMessage('fnDecryptCallback', {
        reqId,
        constructor,
        data,
    });
};

fnDecryptError = () => {
    workerMessage('fnDecryptError', null);
};
