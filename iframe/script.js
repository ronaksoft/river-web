class IframeService {
    iframe = null;
    anchor = null;
    fnQueue = {};
    fnIndex = 0;
    reqId = 0;
    messageListeners = {};
    iframeEl = '';
    anchorEl = '';
    riverOpen = false;
    onload = null;

    constructor(el, anchorEl) {
        if (!!IframeService.instance) {
            return IframeService.instance;
        }

        IframeService.instance = this;

        this.iframeEl = el;
        this.anchorEl = anchorEl;

        this.iframe = document.querySelector(`${el} iframe`);

        window.addEventListener('message', (e) => {
            if (e.data) {
                try {
                    const data = JSON.parse(e.data);
                    if (['river_web'].indexOf(data.client) > -1) {
                        if (data.mode === 'res') {
                            this.response(data);
                        } else if (data.mode === 'req') {
                            this.callHandlers(data.cmd, data);
                        }
                    }
                } catch (e) {
                    window.console.warn(e);
                }
            }
        });

        this.iframe.onload = () => {
            this.riverLoaded();
            this.anchor = document.querySelector(this.anchorEl);
            if (this.anchor) {
                this.anchor.addEventListener('click', () => {
                    this.openChat();
                });
                this.anchor.classList.remove('hide');
            }
            if (this.onload) {
                this.onload();
            }
        };

        return this;
    }

    riverLoaded() {
        this.isLoaded().catch((err) => {
            if (err === 'timeout') {
                this.riverLoaded();
            }
        });

        this.listen('unread_counter', (e) => {
            this.bool(e.reqId);
            this.setUnread(e.data.unread);
        });

        this.listen('close', (e) => {
            this.bool(e.reqId);
            this.closeChat();
        });
    }

    listen(subject, fn) {
        if (!subject) {
            return null;
        }
        this.fnIndex++;
        const fnIndex = this.fnIndex;
        if (!this.fnQueue.hasOwnProperty(subject)) {
            this.fnQueue[subject] = {};
        }
        this.fnQueue[subject][fnIndex] = fn;
        return () => {
            delete this.fnQueue[subject][fnIndex];
        };
    }

    isLoaded() {
        return this.send('is_loaded', {}, 2000);
    }

    bool(reqId) {
        this.sendResponse({
            cmd: 'bool',
            data: true,
            reqId,
        });
    }

    setUnread(unread) {
        unread = isNaN(unread) ? 0 : unread;
        const anchorUnreadEl = document.querySelector(`${this.anchorEl} .badge`);
        if (!anchorUnreadEl) {
            return;
        }
        if (unread > 0) {
            anchorUnreadEl.classList.add('show');
        } else {
            anchorUnreadEl.classList.remove('show');
        }
        anchorUnreadEl.innerHTML = unread > 99 ? '+99' : unread;
    }

    openChat() {
        if (this.riverOpen) {
            return;
        }
        const el = document.querySelector(this.iframeEl);
        if (el) {
            el.classList.add('show');
            setTimeout(() => {
                el.classList.add('fixed');
                this.riverOpen = true
            }, 290);
        }

        if (this.anchor) {
            this.anchor.classList.add('hide');
        }
    }

    closeChat() {
        if (!this.riverOpen) {
            return;
        }
        const el = document.querySelector(this.iframeEl);
        if (el) {
            el.classList.remove('fixed');
            setTimeout(() => {
                this.riverOpen = false;
                el.classList.remove('show');
                if (this.anchor) {
                    this.anchor.classList.remove('hide');
                }
            }, 30);
        }
    }

    setUserInfo(data) {
        return this.send('user_info', data);
    }

    callHandlers(subject, payload) {
        if (!this.fnQueue[subject]) {
            return;
        }
        const keys = Object.keys(this.fnQueue[subject]);
        keys.forEach((key) => {
            const fn = this.fnQueue[subject][key];
            if (fn) {
                fn(payload);
            }
        });
    }

    sendResponse(data) {
        this.iframe.contentWindow.postMessage(JSON.stringify({
            client: 'nested_web',
            cmd: data.cmd,
            data: data.data,
            mode: 'res',
            reqId: data.reqId,
        }), '*');
    }

    send(cmd, data, timeout) {
        let internalResolve = null;
        let internalReject = null;

        const reqId = ++this.reqId;

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        this.messageListeners[reqId] = {
            cmd,
            reject: internalReject,
            resolve: internalResolve,
        };

        this.iframe.contentWindow.postMessage(JSON.stringify({
            client: 'nested_web',
            cmd,
            data,
            mode: 'req',
            reqId,
        }), '*');

        this.messageListeners[reqId].timeout = setTimeout(() => {
            this.dispatchTimeout(reqId);
        }, timeout || 10000);

        return promise;
    }

    response(data) {
        if (!this.messageListeners.hasOwnProperty(data.reqId)) {
            return false;
        }
        if (data.cmd === 'error') {
            this.messageListeners[data.reqId].reject(data.data);
        } else {
            this.messageListeners[data.reqId].resolve(data.data);
        }
        if (this.messageListeners[data.reqId].timeout) {
            clearTimeout(this.messageListeners[data.reqId].timeout);
        }
        delete this.messageListeners[data.reqId];
        return true;
    }

    dispatchTimeout(reqId) {
        const item = this.messageListeners[reqId];
        if (!item) {
            return;
        }
        if (item.reject) {
            item.reject({
                err: 'timeout',
                reqId,
            });
        }
    }
};