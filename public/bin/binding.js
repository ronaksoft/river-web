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

fetch('bin/river.wasm?v8').then((response) => {
    return response.arrayBuffer();
}).then((bytes) => {
    workerMessage('init', bytes);
});

let started = false;
let run;
let instance;
let socket = null;
let connected = false;
let pingCounter = 0;
let tryCounter = 0;
let initTimeout = null;

wasmWorker.onmessage = (e) => {
    const d = e.data;
    switch (d.cmd) {
        case 'saveConnInfo':
            localStorage.setItem('river.conn.info', d.data);
            break;
        case 'loadConnInfo':
            workerMessage('loadConnInfo', localStorage.getItem('river.conn.info'));
            initWebSocket();
            workerMessage('initSDK', {});
            setTimeout(() => {
                const event = new CustomEvent('wasmInit');
                window.dispatchEvent(event);
            }, 50);
            break;
        case 'fnCallback':
            const fnCallbackEvent = new CustomEvent('fnCallbackEvent', {
                bubbles: false,
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
                bubbles: false,
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
                bubbles: false,
                detail: {
                    reqId: d.data.reqId,
                    constructor: d.data.constructor,
                    data: d.data.data
                }
            });
            window.dispatchEvent(fnErrorEvent);
            break;
        case 'authProgress':
            const authProgress = new CustomEvent('authProgress', {
                bubbles: false,
                detail: d.data,
            });
            window.dispatchEvent(authProgress);
            break;
        case 'fnStarted':
            if (!started && connected) {
                const event = new CustomEvent('wsOpen');
                window.dispatchEvent(event);
            }
            started = true;
            const fnStarted = new CustomEvent('fnStarted', {
                bubbles: false,
                detail: d.data,
            });
            window.dispatchEvent(fnStarted);
            break;
    }
};

const ping = new Uint8Array([0x50, 0x49, 0x4e, 0x47]);

function fnCallback(reqId, constructor, data) {
    const fnCallbackEvent = new CustomEvent('fnCallbackEvent', {
        bubbles: false,
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

window.addEventListener('online', () => {
    initWebSocket();
});

window.addEventListener('offline', () => {
    closeWire();
});

const closeWire = () => {
    connected = false;
    const event = new CustomEvent('wsClose');
    window.dispatchEvent(event);
    if (tryCounter === 0) {
        initTimeout = setTimeout(() => {
            initWebSocket();
        }, 1000);
    } else {
        initTimeout = setTimeout(() => {
            initWebSocket();
        }, 5000 + Math.floor(Math.random() * 3000));
    }
};

function Uint8ToBase64(u8a) {
    const CHUNK_SZ = 0x8000;
    const c = [];
    for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    }
    return btoa(c.join(''));
}

const initWebSocket = () => {
    clearTimeout(initTimeout);

    tryCounter++;
    if (window.location.protocol === 'https:') {
        socket = new WebSocket('wss://' + window.location.host + '/ws');
    } else {
        socket = new WebSocket('ws://new.river.im');
    }
    socket.binaryType = 'arraybuffer';

    // Connection opened
    socket.onopen = () => {
        console.log('Hello Server!', new Date());
        socket.send(ping);
        pingCounter = 0;
        tryCounter = 0;
        connected = true;
        if (started) {
            const event = new CustomEvent('wsOpen');
            window.dispatchEvent(event);
        }
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
        closeWire();
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
        if (pingCounter > 2) {
            console.log('server ping is week');
            socket.close();
            initWebSocket()
        }
    }
}, 30000);
