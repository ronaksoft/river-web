if (WebAssembly.instantiateStreaming) { // polyfill
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
    };
}

let run;
let instance;
let fistTimeLoad = true;


let socket = null;
let fnCall = null;
let receive = null;
let wsOpen = null;

(async function () {
    const go = new Go();
    const t = await WebAssembly.instantiateStreaming(fetch("bin/test.wasm"), go.importObject);
    instance = t.instance;
    run = go.run(instance);
})();

function wsSend(buffer) {
    socket.send(buffer);
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
    const event = new CustomEvent('wasmInit');
    setTimeout(function () {
        window.dispatchEvent(event);
    }, 50);
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
    fnCall(data.reqId, data.constructor, Uint8ToBase64(data.data))
});

function setReceive(callback) {
    receive = callback;
}
function setWsOpen(callback) {
    wsOpen = callback;
}

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
        const event = new CustomEvent('wsOpen');
        window.dispatchEvent(event);
        if (wsOpen) {
            wsOpen();
        }
        if (fistTimeLoad) {
            fistTimeLoad = false;
        }
    };

    // Listen for messages
    socket.onmessage = (event) => {
        receive(Uint8ToBase64(new Uint8Array(event.data)));
    };

    // Listen for messages
    socket.onclose = () => {
        initWebSocket();
    };
};

initWebSocket();