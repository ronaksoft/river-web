const wasmWorker = new Worker('bin/worker.js');
wasmWorker.onerror = (e) => {
    console.log(e);
};

workerMessage = (cmd, data) => {
    wasmWorker.postMessage({
        cmd,
        data,
    });
};

wasmWorker.onmessage = (e) => {
    const d = e.data;
    switch (d.cmd) {
        case 'saveConnInfo':
            localStorage.setItem('river.conn.info', d.data);
            break;
        case 'loadConnInfo':
            workerMessage('loadConnInfo', localStorage.getItem('river.conn.info'));
            initWebSocket();
            const event = new CustomEvent('wasmInit');
            setTimeout(() => {
                workerMessage('initSDK', {});
                window.dispatchEvent(event);
            }, 50);
            break;
        case 'fnCallback':
            const fnCallbackEvent = new CustomEvent('fnCallbackEvent', {
                bubbles: true,
                detail: {
                    reqId: d.data.reqId,
                    constructor: d.data.constructor,
                    data: d.data.data
                }
            });
            window.dispatchEvent(fnCallbackEvent);
            break;
        case 'fnUpdate':
            const fnUpdateEvent = new CustomEvent('fnUpdate', {
                bubbles: true,
                detail: d.data,
            });
            window.dispatchEvent(fnUpdateEvent);
            break;
        case 'wsSend':
            if (connected) {
                socket.send(Uint8Array.from(atob(d.data), c => c.charCodeAt(0)));
            }
            break;
        case 'wsError':
            const fnErrorEvent = new CustomEvent('fnErrorEvent', {
                bubbles: true,
                detail: {
                    reqId: d.data.reqId,
                    constructor: d.data.constructor,
                    data: d.data.data
                }
            });
            window.dispatchEvent(fnErrorEvent);
            break;
    }
};

fetch('bin/river.wasm').then((response) => {
    return response.arrayBuffer();
}).then((bytes) => {
    workerMessage('init', bytes);
});

let run;
let instance;
let socket = null;
let connected = false;
let pingCounter = 0;

const ping = new Uint8Array([0x50, 0x49, 0x4e, 0x47]);

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
    // socket = new WebSocket('ws://192.168.1.110');
    socket = new WebSocket('ws://new.river.im');
    socket.binaryType = 'arraybuffer';

    // Connection opened
    socket.onopen = () => {
        console.log('Hello Server!', new Date());
        pingCounter = 0;
        connected = true;
        const event = new CustomEvent('wsOpen');
        window.dispatchEvent(event);
        workerMessage('wsOpen');
    };

    // Listen for messages
    socket.onmessage = (event) => {
        if (checkPong(event.data)) {
            pingCounter = 0;
        } else {
            workerMessage('receive', Uint8ToBase64(new Uint8Array(event.data)));
        }
    };

    // Listen for messages
    socket.onclose = () => {
        connected = false;
        const event = new CustomEvent('wsClose');
        window.dispatchEvent(event);
        initWebSocket();
    };
};

checkPong = (data) => {
    if (data.byteLength === 4) {
        if (String.fromCharCode.apply(null, new Uint8Array(data)) === 'PONG') {
            return true;
        }
    }
    return false
};

setInterval(() => {
    if (connected) {
        socket.send(ping);
        pingCounter++;
        if (pingCounter > 4) {
            console.log('server ping is week');
        }
    }
}, 10000);