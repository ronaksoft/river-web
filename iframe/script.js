class RiverService {
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
    visible = false;

    constructor(params) {
        if (!!RiverService.instance) {
            return RiverService.instance;
        }

        this.init(params || {});

        RiverService.instance = this;

        this.iframeEl = `#river-iframe`;
        this.anchorEl = `#river-anchor`;

        this.iframe = document.querySelector(`${this.iframeEl} iframe`);

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
            this.visible = true;
            if (this.onload) {
                this.onload();
            }
        };

        return this;
    }

    init({url, icon, rtl}) {
        const css = `
        #river-embed.hide {
            display: none;
        }
        
        #river-iframe {
            position: fixed;
            width: 375px;
            height: 520px;
            bottom: 24px;
            right: 24px;
            border: none;
            padding: 0;
            margin: 0;
            overflow: hidden;
            border-radius: 5px;
            visibility: hidden;
        }
        
        #river-embed.rtl #river-iframe {
            right: auto;
            left: 24px;
        }

        #river-iframe.show {
            visibility: visible;
        }

        #river-iframe.show.fixed {
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }

        #river-iframe .river-mask {
            position: absolute;
            bottom: 24px;
            right: 24px;
            height: 0;
            width: 0;
            background: #ddddddcc;
            border-radius: 3px;
            z-index: 10;
            transition: all 0.3s;
        }
        
        #river-embed.rtl #river-iframe .river-mask {
            right: auto;
            left: 24px;
        }

        #river-iframe.show .river-mask {
            bottom: 0;
            right: 0;
            height: 100%;
            width: 100%;
        }
        
        #river-embed.rtl #river-iframe.show .river-mask {
            right: auto;
            left: 0;
        }

        #river-iframe.fixed .river-mask {
            visibility: hidden;
        }

        #river-iframe iframe {
            position: absolute;
            border: none;
            bottom: 0;
            right: 0;
            padding: 0;
            margin: 0;
            width: 375px;
            height: 520px;
            opacity: 0;
            z-index: 10;
        }
        
        #river-embed.rtl #river-iframe iframe {
            right: auto;
            left: 0;
        }

        #river-iframe.fixed iframe {
            opacity: 1;
        }

        #river-anchor {
            position: fixed;
            width: 48px;
            height: 48px;
            bottom: 24px;
            right: 24px;
            cursor: pointer;
        }

        #river-embed.rtl #river-anchor {
            right: auto;
            left: 24px;            
        }
        
        #river-anchor.hide {
            visibility: hidden;
        }

        #river-anchor img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
        }

        #river-anchor .badge {
            position: absolute;
            color: #fff;
            background-color: #f34;
            border-radius: 16px;
            display: flex;
            align-items: center;
            line-height: 12px;
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            top: -2px;
            right: -2px;
            padding: 3px 5px 1px;
            min-width: 16px;
            justify-content: center;
            transform: scale(0);
            transition: transform 0.2s;
        }
        
        #river-embed.rtl #river-anchor .badge {
            right: auto;
            left: -2px;            
        }

        #river-anchor .badge.show {
            transform: scale(1);
        }`;

        const style = document.createElement('style');
        style.innerHTML = css;
        document.body.appendChild(style);

        const div = document.createElement('div');
        div.setAttribute('id', 'river-embed');
        if (rtl) {
            div.classList.add('rtl');
        }
        div.innerHTML = `
            <div id="river-iframe">
                <div class="river-mask"></div>
                <iframe src="${url || 'https://web.river.im'}">
                    <p>Your browser does not support iframes.</p>
                </iframe>
            </div>
            <div id="river-anchor" class="hide">
                <div class="badge">0</div>
                <img src="${icon || 'icon.png'}"/>
            </div>`;
        document.body.appendChild(div);
    }

    toggleVisible(visible) {
        if (visible === undefined) {
            this.visible = !this.visible;
        } else {
            this.visible = visible;
        }
        const el = document.querySelector('#river-embed');
        if (el) {
            if (!this.visible) {
                el.classList.add('hide');
            } else {
                el.classList.remove('hide');
            }
        }
    }

    setRTL(enable) {
        const el = document.querySelector('#river-embed');
        if (el) {
            if (enable) {
                el.classList.add('rtl');
            } else {
                el.classList.remove('rtl');
            }
        }
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