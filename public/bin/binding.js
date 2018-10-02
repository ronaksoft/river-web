const Base64Binary = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    /* will return a  Uint8Array type */
    decodeArrayBuffer: function (input) {
        var bytes = (input.length / 4) * 3;
        var ab = new ArrayBuffer(bytes);
        this.decode(input, ab);

        return ab;
    },

    removePaddingChars: function (input) {
        var lkey = this._keyStr.indexOf(input.charAt(input.length - 1));
        if (lkey == 64) {
            return input.substring(0, input.length - 1);
        }
        return input;
    },

    decode: function (input, arrayBuffer) {
        //get last chars to see if are valid
        input = this.removePaddingChars(input);
        input = this.removePaddingChars(input);

        var bytes = parseInt((input.length / 4) * 3, 10);

        var uarray;
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        var j = 0;

        if (arrayBuffer)
            uarray = new Uint8Array(arrayBuffer);
        else
            uarray = new Uint8Array(bytes);

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        for (i = 0; i < bytes; i += 3) {
            //get the 3 octects in 4 ascii chars
            enc1 = this._keyStr.indexOf(input.charAt(j++));
            enc2 = this._keyStr.indexOf(input.charAt(j++));
            enc3 = this._keyStr.indexOf(input.charAt(j++));
            enc4 = this._keyStr.indexOf(input.charAt(j++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            uarray[i] = chr1;
            if (enc3 != 64) uarray[i + 1] = chr2;
            if (enc4 != 64) uarray[i + 2] = chr3;
        }

        return uarray;
    }
};

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
            workerMessage('initSDK', {});
            initWebSocket();
            break;
        case 'fnCallback':
            const fnCallbackEvent = new CustomEvent('fnCallbackEvent', {
                bubbles: true,
                detail: {
                    reqId: d.data.reqId,
                    constructor: d.data.constructor,
                    data: Uint8Array.from(atob(d.data), c => c.charCodeAt(0))
                }
            });
            window.dispatchEvent(fnCallbackEvent);
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

fetch('bin/test.wasm').then((response) => {
    return response.arrayBuffer();
}).then((bytes) => {
    workerMessage('init', bytes);
});

let run;
let instance;
let socket = null;
let connected = false;


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
    socket = new WebSocket('ws://new.river.im');
    socket.binaryType = 'arraybuffer';

    // Connection opened
    socket.onopen = () => {
        console.log('Hello Server!', new Date());
        connected = true;
        const event = new CustomEvent('wsOpen');
        window.dispatchEvent(event);
        workerMessage('wsOpen');
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