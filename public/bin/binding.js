const wasmWorker = new Worker('bin/worker.js');
wasmWorker.onerror = (e) => {
    console.log(e);
};
wasmWorker.onmessage = (e) => {
    const d = e.data;
    switch (d.cmd) {
        case 'init':

            break;
        case 'saveConnInfo':
            localStorage.setItem('river.conn.info', d.data);
            break;
        case 'wsOpen':
            wsOpen(d.data);
            break;
        case 'fnCall':
            wsOpen(d.data);
            break;
    }
};

workerMessage = (cmd, data) => {
    wasmWorker.postMessage({
        cmd,
        data,
    });
};

fetch('bin/test.wasm').then((response) => {
    return response.arrayBuffer();
}).then((bytes) => {
    workerMessage('init', bytes);
});

if (WebAssembly.instantiateStreaming) { // polyfill
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
    };
}

let run;
let instance;

let socket = null;
let connected = false;

(async function () {
    // const go = new Go();
    // const t = await WebAssembly.instantiateStreaming(fetch('bin/test.wasm'), go.importObject);
    // instance = t.instance;
    // run = go.run(instance);
    // initWebSocket();
})();

function wsSend(buffer) {
    if (connected) {
        socket.send(buffer);
    }
}

function wsError(reqId, constructor, data) {
    const fnCallbackEvent = new CustomEvent('fnErrorEvent', {
        bubbles: true,
        detail: {
            reqId: reqId,
            constructor: constructor,
            data: data
        }
    });
    window.dispatchEvent(fnCallbackEvent);
}

function saveConnInfo(data) {
    localStorage.setItem('river.conn.info', data);
}

function loadConnInfo(callback) {
    callback(localStorage.getItem('river.conn.info'))
}

function initSDK(callback) {
    callback();
}

function setFnCall(callback) {
    fnCall = callback;
}

function fnCallback(reqId, constructor, data) {
    const fnCallbackEvent = new CustomEvent('fnCallbackEvent', {
        bubbles: true,
        detail: {
            reqId: reqId,
            constructor: constructor,
            data: data
        }
    });
    window.dispatchEvent(fnCallbackEvent);
}

window.addEventListener('fnCallEvent', (event) => {
    // console.log(event.detail);
    const data = event.detail;
    workerMessage('fnCall', {
        reqId: data.reqId,
        constructor: data.constructor,
        payload: Uint8ToBase64(data.data)
    });
});

function Uint8ToBase64(u8a) {
    const CHUNK_SZ = 0x8000;
    const c = [];
    for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    }
    return btoa(c.join(''));
}

const initWebSocket = () => {
    socket = new WebSocket('ws://new.river.im');
    socket.binaryType = 'arraybuffer';

    // Connection opened
    socket.onopen = () => {
        console.log('Hello Server!', new Date());
        connected = true;
        const event = new CustomEvent('wsOpen');
        window.dispatchEvent(event);
        if (wsOpen) {
            workerMessage('wsOpen');
        }
    };

    // Listen for messages
    socket.onmessage = (event) => {
        workerMessage('receive', Uint8ToBase64(new Uint8Array(event.data)));
    };

    // Listen for messages
    socket.onclose = () => {
        connected = false;
        const event = new CustomEvent('wsClose');
        window.dispatchEvent(event);
        initWebSocket();
    };
};

// setInterval(() => {
//     wsSend(new Uint8Array([9]));
// }, 5000);