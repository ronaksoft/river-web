/*
    Creation Time: 2018 - Aug - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import Routes from './app/routes';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import MainRepo from './app/repository';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import {ErrorInfo} from 'react';
import * as Sentry from '@sentry/browser';
import I18n from "./app/services/i18n";
import IframeService, {C_IFRAME_SUBJECT} from "./app/services/iframe";
import UniqueId from "./app/services/uniqueId";
import Server from "./app/services/sdk/server";
import {SnackbarProvider} from 'notistack';
// @ts-ignore
import md from 'markdown-it';
import {EventBeforeUnload, EventBlur, EventDragOver, EventDrop, EventFocus, EventMessage} from "./app/services/events";
import ElectronService from "./app/services/electron";
import {C_LOCALSTORAGE} from "./app/services/sdk/const";

import './App.scss';

export const C_VERSION = '0.34.14';
export const C_ELECTRON_VERSION = '9.0.5';

export const isProd = (!process || !process.env || process.env.NODE_ENV !== 'development');
if (isProd) {
    Sentry.init({
        dsn: "https://ec65e55c384f43f2ac2ed7c66e319b1a@sentry.ronaksoftware.com/4",
        ignoreErrors: [
            /Non-Error/g
        ]
    });
}

const theme = createMuiTheme({
    direction: localStorage.getItem(C_LOCALSTORAGE.LangDir) === 'rtl' ? 'rtl' : 'ltr',
    palette: {
        primary: {
            contrastText: '#FFF',
            dark: '#2E8F57',
            light: '#29c16d',
            main: '#27AE60',
        },
    },
    typography: {
        fontFamily: `'YekanBakh', 'OpenSans'`,
    },
});

interface IState {
    alertOpen: boolean;
    clearingSiteData: boolean;
    errorMessage: string;
    hasUpdate: boolean;
    updateContent: string;
    updateMode: string;
    desktopDownloadLink: string;
}

I18n.init({
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

    constructor(props: {}) {
        super(props);

        this.state = {
            alertOpen: false,
            clearingSiteData: false,
            desktopDownloadLink: '',
            errorMessage: `You are receiving "Auth Error", do you like to clear all site data?`,
            hasUpdate: false,
            updateContent: '',
            updateMode: '',
        };

        this.mainRepo = MainRepo.getInstance();

        this.iframeService = IframeService.getInstance();

        this.sessionId = UniqueId.getRandomId();
        // @ts-ignore
        if (window.BroadcastChannel) {
            this.broadcastChannel = new BroadcastChannel('river_channel');
        }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (isProd) {
            Sentry.withScope((scope) => {
                scope.setExtras(errorInfo);
                const eventId = Sentry.captureException(error);
                Sentry.showReportDialog({eventId});
            });
        }
    }

    public componentDidMount() {
        document.addEventListener(EventDrop, (e) => e.preventDefault(), false);
        document.addEventListener(EventDragOver, (e) => e.preventDefault(), false);
        window.addEventListener(EventFocus, this.windowFocusHandler);
        window.addEventListener(EventBlur, this.windowBlurHandler);
        window.addEventListener(EventBeforeUnload, this.windowBeforeUnloadHandler);
        window.addEventListener('authErrorEvent', (event: any) => {
            this.setState({
                alertOpen: true,
                errorMessage: `You are receiving "Auth Error", do you like to clear all site data?`,
            });
        });

        window.addEventListener('fnDecryptError', (event: any) => {
            this.setState({
                alertOpen: true,
                errorMessage: `You are receiving "Decrypt Error", do you like to clear all site data?`,
            });
        });

        const el = document.querySelector('html');
        if (el) {
            el.setAttribute('theme', localStorage.getItem(C_LOCALSTORAGE.ThemeColor) || 'light');
            el.setAttribute('font', localStorage.getItem(C_LOCALSTORAGE.ThemeFont) || '2');
            el.setAttribute('bg', localStorage.getItem(C_LOCALSTORAGE.ThemeBg) || '15');
            el.setAttribute('bubble', localStorage.getItem(C_LOCALSTORAGE.ThemeBubble) || '4');
            el.setAttribute('gradient', localStorage.getItem(C_LOCALSTORAGE.ThemeGradient) || '0');
            el.setAttribute('direction', localStorage.getItem(C_LOCALSTORAGE.LangDir) || 'ltr');
        }

        const refreshEl = document.querySelector('#refresh');
        if (refreshEl) {
            refreshEl.remove();
        }

        // @ts-ignore
        if (window.clearLoading) {
            // @ts-ignore
            window.clearLoading();
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

        if (this.broadcastChannel) {
            this.broadcastChannel.removeEventListener(EventMessage, this.channelMessageHandler);
            this.broadcastChannel.close();
        }
    }

    public updateDialog() {
        fetch(`/changelog.md?${Date.now()}`).then((res) => {
            return res.text();
        }).then((text) => {
            this.setState({
                desktopDownloadLink: this.getDesktopLink(),
                hasUpdate: true,
                updateContent: md().render(text),
                updateMode: 'notif',
            });
        }).catch(() => {
            this.setState({
                desktopDownloadLink: this.getDesktopLink(),
                hasUpdate: true,
                updateContent: '',
                updateMode: 'notif',
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
        const {alertOpen, clearingSiteData, errorMessage, hasUpdate, updateContent, desktopDownloadLink, updateMode} = this.state;
        return (
            <div className={'App' + (this.isElectron ? ' is-electron' : '')}>
                <MuiThemeProvider theme={theme}>
                    <SnackbarProvider maxSnack={3}>
                        {Routes}
                    </SnackbarProvider>
                    <Dialog open={alertOpen} onClose={this.alertCloseHandler}>
                        <DialogTitle>Critical Error</DialogTitle>
                        <DialogContent>
                            {!clearingSiteData && <DialogContentText>
                                {errorMessage}<br/>
                                <i>This probably fix your problem!</i>
                            </DialogContentText>}
                        </DialogContent>
                        {!clearingSiteData && <DialogActions>
                            <Button onClick={this.alertCloseHandler}
                                    color="secondary">{I18n.t('general.disagree')}</Button>
                            <Button onClick={this.clearSiteDataHandler} color="primary"
                                    autoFocus={true}>{I18n.t('general.agree')}</Button>
                        </DialogActions>}
                        {clearingSiteData &&
                        <DialogActions style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <CircularProgress/>
                        </DialogActions>}
                    </Dialog>
                    <Dialog
                        key="overlay-dialog"
                        open={hasUpdate}
                        onClose={this.updateDialogCloseHandler}
                        className="confirm-dialog"
                        disableBackdropClick={true}
                        disableEscapeKeyDown={true}
                        classes={{
                            paper: 'confirm-dialog-paper'
                        }}
                    >
                        {updateMode === 'notif' ? <>
                            <DialogTitle>{I18n.t('chat.update_dialog.title')}</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    {I18n.t('chat.update_dialog.body')}
                                </DialogContentText>
                                {Boolean(updateContent !== '') && <DialogContentText>
                                    <div className="markdown-body" dangerouslySetInnerHTML={{__html: updateContent}}/>
                                </DialogContentText>}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.updateDialogCloseHandler} color="secondary">
                                    {I18n.t('general.cancel')}
                                </Button>
                                <Button onClick={this.updateDialogAcceptHandler} color="primary" autoFocus={true}>
                                    {I18n.t('chat.update_dialog.update')}
                                </Button>
                                {Boolean(desktopDownloadLink !== '') &&
                                <Button color="primary" onClick={this.downloadDesktopHandler(desktopDownloadLink)}>
                                    {I18n.tf('chat.update_dialog.download_desktop_version', '0.20.0')}
                                </Button>}
                            </DialogActions>
                        </> : <>
                            <DialogTitle>{I18n.t('chat.update_dialog.title')}</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    {I18n.t('chat.update_dialog.reload_text')}
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.updateDialogCloseHandler} color="secondary">
                                    {I18n.t('general.cancel')}
                                </Button>
                                <Button onClick={this.updateDialogAcceptHandler} color="primary" autoFocus={true}>
                                    {I18n.t('chat.update_dialog.reload')}
                                </Button>
                            </DialogActions>
                        </>}
                    </Dialog>
                </MuiThemeProvider>
            </div>
        );
    }

    private alertCloseHandler = () => {
        this.setState({
            alertOpen: false,
        });
    }

    private clearSiteDataHandler = () => {
        this.setState({
            clearingSiteData: true,
        });
        this.mainRepo.destroyDB().then(() => {
            const testUrl = localStorage.getItem(C_LOCALSTORAGE.WorkspaceUrl) || '';
            const testFileUrl = localStorage.getItem(C_LOCALSTORAGE.WorkspaceFileUrl) || '';
            const serverKeys = localStorage.getItem(C_LOCALSTORAGE.ServerKeys) || '';
            localStorage.clear();
            localStorage.setItem(C_LOCALSTORAGE.WorkspaceUrl, testUrl);
            localStorage.setItem(C_LOCALSTORAGE.WorkspaceFileUrl, testFileUrl);
            if (serverKeys) {
                localStorage.setItem(C_LOCALSTORAGE.ServerKeys, serverKeys);
            }
            this.setState({
                alertOpen: false,
            }, () => {
                window.location.reload();
            });
        });
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
        window.location.reload();
    }

    private getDesktopLink() {
        if (!this.isElectron) {
            return '';
        }
        if (ElectronService.electronVersion() === C_ELECTRON_VERSION) {
            return '';
        }
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
    }

    private downloadDesktopHandler = (link: string) => () => {
        ElectronService.openExternal(link);
        this.updateDialogCloseHandler();
    }
}

export default App;
