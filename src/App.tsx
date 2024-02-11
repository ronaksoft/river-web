/*
    Creation Time: 2018 - Aug - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import React from 'react';
import {HashRouter} from 'react-router-dom';
import Routes from './app/routes';
import {CircularProgress, DialogContentText} from '@material-ui/core';
import MainRepo from './app/repository';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import i18n from "./app/services/i18n";
import IframeService, {C_IFRAME_SUBJECT} from "./app/services/iframe";
import UniqueId from "./app/services/uniqueId";
import Server from "./app/services/sdk/server";
import {SnackbarProvider} from 'notistack';
// @ts-ignore
import md from 'markdown-it';
import {
    EventAuthError,
    EventBeforeUnload,
    EventBlur,
    EventDragOver,
    EventDrop,
    EventFocus,
    EventMessage,
    EventShowChangelog
} from "./app/services/events";
import ElectronService from "./app/services/electron";
import {C_LOCALSTORAGE} from "./app/services/sdk/const";
import {ThemeChanged} from "./app/components/SettingsMenu";
import Broadcaster from "./app/services/broadcaster";
import {Modality, ModalityService} from "kk-modality";
import CallModal from "./app/components/CallModal";
import {C_APP_VERSION, C_ELECTRON_VERSIONS, C_VERSION, isProd} from "./index";
import APIManager from "./app/services/sdk";

import './App.scss';

if (isProd) {
    // Sentry.init({
    //     autoSessionTracking: true,
    //     dsn: "https://65e6ffeb9e96400c8d8100cd1e6678b5@sentry.ronaksoft.com/5",
    //     ignoreErrors: [
    //         /Non-Error/g
    //     ],
    //     integrations: [
    //         new Integrations.BrowserTracing(),
    //     ],
    // });
}

const getTheme = (forceDark?: boolean) => {
    return createMuiTheme({
        direction: localStorage.getItem(C_LOCALSTORAGE.LangDir) === 'rtl' ? 'rtl' : 'ltr',
        palette: {
            primary: {
                contrastText: '#FFF',
                dark: '#2E8F57',
                light: '#29c16d',
                main: '#27AE60',
            },
            type: forceDark ? 'dark' : (localStorage.getItem(C_LOCALSTORAGE.ThemeColor) || 'light') === 'light' ? 'light' : 'dark',
        },
        typography: {
            fontFamily: `'YekanBakh', 'OpenSans'`,
        },
    });
};

interface IState {
    clearingSiteData: boolean;
    hasUpdate: boolean;
    updateContent: string;
    updateMode: string;
    desktopDownloadLink: string;
}

i18n.init({
    defLang: localStorage.getItem(C_LOCALSTORAGE.Lang) || 'en',
    dictionaries: {
        en: require('./app/locales/en.json'),
        fa: require('./app/locales/fa.json'),
    },
});

class App extends React.Component<{}, IState> {
    private mainRepo: MainRepo;
    private readonly isElectron: boolean = ElectronService.isElectron();
    private iframeService: IframeService;
    private readonly broadcastChannel: BroadcastChannel | undefined;
    private readonly sessionId: number = 0;
    private multipleSession: boolean = false;
    private sessionsIds: number[] = [];
    private broadcaster: Broadcaster;
    private eventReferences: any[] = [];
    private updateModalVisible: boolean = false;

    constructor(props: {}) {
        super(props);

        this.state = {
            clearingSiteData: false,
            desktopDownloadLink: '',
            hasUpdate: false,
            updateContent: '',
            updateMode: '',
        };

        this.broadcaster = Broadcaster.getInstance();

        this.mainRepo = MainRepo.getInstance();

        this.iframeService = IframeService.getInstance();

        this.sessionId = UniqueId.getRandomId();
        // @ts-ignore
        if (window.BroadcastChannel) {
            this.broadcastChannel = new BroadcastChannel('river_channel');
        }
    }

    // public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    //     if (isProd) {
    //         Sentry.withScope((scope) => {
    //             scope.setExtra("extra", errorInfo);
    //             const eventId = Sentry.captureException(error);
    //             Sentry.showReportDialog({eventId});
    //         });
    //     }
    // }

    public componentDidMount() {
        document.addEventListener(EventDrop, (e) => e.preventDefault(), false);
        document.addEventListener(EventDragOver, (e) => e.preventDefault(), false);
        window.addEventListener(EventFocus, this.windowFocusHandler);
        window.addEventListener(EventBlur, this.windowBlurHandler);
        window.addEventListener(EventBeforeUnload, this.windowBeforeUnloadHandler);
        window.addEventListener(EventShowChangelog, this.updateDialog);
        window.addEventListener(EventAuthError, this.decryptErrorHandler);

        this.eventReferences.push(this.broadcaster.listen(ThemeChanged, this.themeChangeHandler));

        const el = document.querySelector('html');
        if (el) {
            el.setAttribute('theme', localStorage.getItem(C_LOCALSTORAGE.ThemeColor) || 'light');
            el.setAttribute('font', localStorage.getItem(C_LOCALSTORAGE.ThemeFont) || '2');
            el.setAttribute('bg', localStorage.getItem(C_LOCALSTORAGE.ThemeBg) || '15');
            el.setAttribute('bubble', localStorage.getItem(C_LOCALSTORAGE.ThemeBubble) || '4');
            el.setAttribute('gradient', localStorage.getItem(C_LOCALSTORAGE.ThemeGradient) || '0');
            el.setAttribute('reaction', localStorage.getItem(C_LOCALSTORAGE.ThemeReaction) || '1');
            el.setAttribute('direction', localStorage.getItem(C_LOCALSTORAGE.LangDir) || 'ltr');
            el.setAttribute('mac', navigator.platform.indexOf('Mac') > -1 ? '1' : '0');
        }

        const refreshEl = document.querySelector('#refresh');
        if (refreshEl) {
            refreshEl.remove();
        }

        this.iframeService.listen(C_IFRAME_SUBJECT.IsLoaded, (e) => {
            this.iframeService.loaded(e.reqId);
        });

        if (this.broadcastChannel) {
            this.broadcastChannel.addEventListener(EventMessage, this.channelMessageHandler);
            this.sendSessionMessage('loaded', {version: C_VERSION});
        }
    }

    public componentWillUnmount() {
        window.removeEventListener(EventFocus, this.windowFocusHandler);
        window.removeEventListener(EventBlur, this.windowBlurHandler);
        window.removeEventListener(EventBeforeUnload, this.windowBeforeUnloadHandler);
        window.removeEventListener(EventShowChangelog, this.updateDialog);
        window.removeEventListener(EventAuthError, this.decryptErrorHandler);
        this.eventReferences.forEach((canceller) => {
            if (typeof canceller === 'function') {
                canceller();
            }
        });

        if (this.broadcastChannel) {
            this.broadcastChannel.removeEventListener(EventMessage, this.channelMessageHandler);
            this.broadcastChannel.close();
        }
    }

    public updateDialog = () => {
        fetch(`/changelog.md?${Date.now()}`).then((res) => {
            return res.text();
        }).then((text) => {
            this.getDesktopLink().then(() => {
                this.setState({
                    updateContent: md().render(text),
                    updateMode: 'notif',
                }, () => {
                    setTimeout(() => {
                        const el = document.querySelector('.confirm-dialog .markdown-body h2:first-child');
                        if (el && C_VERSION === el.textContent) {
                            const elTitle = document.querySelector('.confirm-dialog .update-title');
                            if (elTitle) {
                                elTitle.remove();
                            }
                            const updateButtonEl = document.getElementById('update-button');
                            if (updateButtonEl) {
                                updateButtonEl.remove();
                            }
                            this.setState({
                                updateMode: 'changelog',
                            });
                        }
                    }, 10);
                    this.showUpdateDialog();
                });
            });
        }).catch(() => {
            this.getDesktopLink().then(() => {
                this.setState({
                    updateContent: '',
                    updateMode: 'notif',
                }, () => {
                    this.showUpdateDialog();
                });
            });
        });
    }

    public onSuccess() {
        this.setState({
            hasUpdate: true,
            updateContent: '',
            updateMode: 'reload',
        });
    }

    public render() {
        return (
            <HashRouter>
                <div className={'App' + (this.isElectron ? ' is-electron' : '')}>
                    <MuiThemeProvider theme={getTheme()}>
                        <SnackbarProvider maxSnack={5} anchorOrigin={{
                            horizontal: 'center',
                            vertical: 'top',
                        }} disableWindowBlurListener={true}>
                            {Routes}
                        </SnackbarProvider>
                        <CallModal/>
                        <Modality queueSize={5}
                                  dialogClasses={{paper: 'confirm-dialog-paper', root: 'confirm-dialog'}}/>
                    </MuiThemeProvider>
                </div>
            </HashRouter>
        );
    }

    private clearSiteDataHandler = (clear: boolean) => {
        this.setState({
            clearingSiteData: true,
        });
        const fnClear = () => {
            const serverMode = localStorage.getItem(C_LOCALSTORAGE.ServerMode) || 'prod';
            const testUrl = localStorage.getItem(C_LOCALSTORAGE.WorkspaceUrl) || '';
            const serverKeys = localStorage.getItem(C_LOCALSTORAGE.ServerKeys) || '';
            const verboseMode = localStorage.getItem(C_LOCALSTORAGE.DebugVerboseAPI) || '';
            localStorage.clear();
            localStorage.setItem(C_LOCALSTORAGE.ServerMode, serverMode);
            localStorage.setItem(C_LOCALSTORAGE.WorkspaceUrl, testUrl);
            if (serverKeys) {
                localStorage.setItem(C_LOCALSTORAGE.ServerKeys, serverKeys);
            }
            localStorage.setItem(C_LOCALSTORAGE.DebugVerboseAPI, verboseMode);
        };
        if (clear) {
            this.mainRepo.destroyDB().then(() => {
                fnClear();
                window.location.reload();
            });
        } else {
            const connInfo = APIManager.getInstance().getConnInfo();
            fnClear();
            if (connInfo) {
                localStorage.setItem(C_LOCALSTORAGE.LastPhone, connInfo.phone);
            }
            window.location.reload();
        }
    }

    private channelMessageHandler = (e: any) => {
        const data = e.data;
        if (data.uuid === this.sessionId) {
            return;
        }
        switch (data.cmd) {
            case 'loaded':
                Server.getInstance().stopNetwork();
                IframeService.getInstance().newSession();
                this.multipleSession = true;
                if (this.sessionsIds.indexOf(data.uuid) === -1) {
                    this.sessionsIds.push(data.uuid);
                }
                this.sendSessionMessage('loaded_res', {id: this.sessionId});
                break;
            case 'loaded_res':
                if (data.payload.id === this.sessionId) {
                    this.multipleSession = true;
                    if (this.sessionsIds.indexOf(data.uuid) === -1) {
                        this.sessionsIds.push(data.uuid);
                    }
                }
                break;
            case 'close_session':
                const index = this.sessionsIds.indexOf(data.uuid);
                if (index > -1) {
                    this.sessionsIds.splice(index, 1);
                }
                if (this.sessionsIds.length === 0) {
                    this.multipleSession = false;
                }
                break;
        }
    }

    private windowFocusHandler = () => {
        if (!this.multipleSession) {
            return;
        }
        Server.getInstance().startNetwork();
    }

    private windowBlurHandler = () => {
        if (!this.multipleSession) {
            return;
        }
        Server.getInstance().stopNetwork();
    }

    private windowBeforeUnloadHandler = () => {
        this.sendSessionMessage('close_session', {});
    }

    private sendSessionMessage(cmd: string, payload: any) {
        if (!this.broadcastChannel) {
            return;
        }
        this.broadcastChannel.postMessage({
            cmd,
            payload,
            uuid: this.sessionId,
        });
    }

    private updateDialogCloseHandler = () => {
        this.setState({
            hasUpdate: false,
        });
    }

    private updateDialogAcceptHandler = () => {
        this.updateModalVisible = false;
        window.location.reload();
    }

    private getDesktopLink() {
        if (!this.isElectron) {
            return Promise.resolve();
        }

        const fn = () => {
            const userAgent = window.navigator.userAgent;
            const platform = window.navigator.platform;
            const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
            const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
            const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
            let os = null;

            if (macosPlatforms.indexOf(platform) !== -1) {
                os = 'mac';
            } else if (iosPlatforms.indexOf(platform) !== -1) {
                os = 'ios';
            } else if (windowsPlatforms.indexOf(platform) !== -1) {
                os = 'windows';
            } else if (/Android/.test(userAgent)) {
                os = 'android';
            } else if (!os && /Linux/.test(platform)) {
                os = 'linux';
            }

            switch (os) {
                case 'mac':
                    return 'https://drive.ronaksoft.com/latest_direct/River/MacOS';
                case 'windows':
                    return 'https://drive.ronaksoft.com/latest_direct/River/Windows';
                case 'linux':
                    return 'https://drive.ronaksoft.com/latest_direct/River/Linux';
            }
            return '';
        };

        if (!ElectronService.isNewElectron() && C_ELECTRON_VERSIONS.indexOf(ElectronService.electronVersion() || '') === -1) {
            this.setState({
                desktopDownloadLink: fn(),
            });
            return Promise.resolve();
        } else {
            return ElectronService.getInstance().getVersion().then((res) => {
                if (res.version !== C_APP_VERSION) {
                    this.setState({
                        desktopDownloadLink: fn(),
                    });
                }
                return Promise.resolve();
            });
        }
    }

    private downloadDesktopHandler = (link: string) => () => {
        this.updateModalVisible = false;
        ElectronService.getInstance().loadUrl(link);
        this.updateDialogCloseHandler();
    }

    private themeChangeHandler = () => {
        this.forceUpdate();
    }

    private decryptErrorHandler = (e: any) => {
        const clear = e.detail.clear;
        ModalityService.getInstance().open({
            cancelText: i18n.t('general.cancel'),
            confirmText: i18n.t('general.agree'),
            description: <>{this.state.clearingSiteData ? <CircularProgress/> : <DialogContentText>
                {`You are receiving "Auth Error", ${clear ? 'do you like to clear all site data' : 'do you want to logout'}?`}<br/>
                <i>{`This probably will fix your problem!`}</i>
            </DialogContentText>}</>,
            title: 'Critical Error',
        }).then((modalRes) => {
            if (modalRes === 'confirm') {
                this.clearSiteDataHandler(clear);
            }
        });
    }

    private showUpdateDialog() {
        if (this.updateModalVisible) {
            return;
        }
        const {updateMode, desktopDownloadLink, updateContent} = this.state;
        const isUpdate = (updateMode === 'notif' || updateMode === 'changelog');
        this.updateModalVisible = true;
        ModalityService.getInstance().open({
            buttons: desktopDownloadLink !== '' ? [{
                action: 'download_electron',
                props: {
                    color: 'secondary'
                },
                text: i18n.t('chat.update_dialog.download_desktop_version'),
            }] : undefined,
            cancelText: i18n.t('general.cancel'),
            confirmProps: {
                id: 'update-button',
            },
            confirmText: i18n.t(isUpdate ? 'chat.update_dialog.update' : 'chat.update_dialog.reload'),
            description: isUpdate ? <><DialogContentText
                className="update-title">{i18n.t('chat.update_dialog.body')}</DialogContentText>
                {Boolean(updateContent !== '') && <DialogContentText>
                    <div className="markdown-body" dangerouslySetInnerHTML={{__html: updateContent}}/>
                </DialogContentText>}</> : <DialogContentText>
                {i18n.t('chat.update_dialog.reload_text')}
            </DialogContentText>,
            title: i18n.t('chat.update_dialog.title'),
        }).then((modalRes) => {
            if (modalRes === 'confirm') {
                if (isUpdate) {
                    this.updateDialogAcceptHandler();
                } else {
                    this.updateDialogAcceptHandler();
                }
            } else if (modalRes === 'download_electron') {
                this.downloadDesktopHandler(desktopDownloadLink)();
            } else {
                this.updateModalVisible = false;
            }
        });
    }
}

export default App;
