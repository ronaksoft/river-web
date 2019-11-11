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
import {C_VERSION} from "./app/components/SettingsMenu";
import Server from "./app/services/sdk/server";
import {SnackbarProvider} from 'notistack';
// @ts-ignore
import md from 'markdown-it';

import './App.scss';

export const isProd = (!process || !process.env || process.env.NODE_ENV !== 'development');
if (isProd) {
    Sentry.init({
        dsn: "https://ec65e55c384f43f2ac2ed7c66e319b1a@sentry.ronaksoftware.com/4"
    });
}

const theme = createMuiTheme({
    palette: {
        primary: {
            contrastText: '#FFF',
            dark: '#2E8F57',
            light: '#29c16d',
            main: '#27AE60',
        },
    },
    typography: {
        fontFamily: "'YekanBakh', 'OpenSans'",
    },
});

interface IState {
    alertOpen: boolean;
    clearingSiteData: boolean;
    errorMessage: string;
    hasUpdate: boolean;
    updateContent: string;
}

I18n.init({
    defLang: localStorage.getItem('river.lang') || 'en',
    dictionaries: {
        en: require('./app/locales/en.json'),
        fa: require('./app/locales/fa.json'),
    },
});

class App extends React.Component<{}, IState> {
    private mainRepo: MainRepo;
    private readonly isElectron: boolean = false;
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
            errorMessage: `You are receiving "Auth Error", do you like to clear all site data?`,
            hasUpdate: false,
            updateContent: '',
        };

        this.mainRepo = MainRepo.getInstance();

        // @ts-ignore
        if (window.isElectron) {
            this.isElectron = true;
        }

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
        document.addEventListener('drop', (e) => e.preventDefault(), false);
        document.addEventListener('dragover', (e) => e.preventDefault(), false);
        window.addEventListener('focus', this.windowFocusHandler);
        window.addEventListener('blur', this.windowBlurHandler);
        window.addEventListener('beforeunload', this.windowBeforeUnloadHandler);
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
            el.setAttribute('theme', localStorage.getItem('river.theme.color') || 'light');
            el.setAttribute('font', localStorage.getItem('river.theme.font') || '2');
            el.setAttribute('bg', localStorage.getItem('river.theme.bg') || '2');
            el.setAttribute('bubble', localStorage.getItem('river.theme.bubble') || '4');
            el.setAttribute('direction', localStorage.getItem('river.lang.dir') || 'ltr');
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
            this.broadcastChannel.addEventListener('message', this.channelMessageHandler);
            this.sendSessionMessage('loaded', {version: C_VERSION});
        }
    }

    public componentWillUnmount() {
        window.removeEventListener('focus', this.windowFocusHandler);
        window.removeEventListener('blur', this.windowBlurHandler);

        if (this.broadcastChannel) {
            this.broadcastChannel.removeEventListener('message', this.channelMessageHandler);
            this.broadcastChannel.close();
        }
    }

    public updateDialog() {
        fetch(`/changelog.md?${Date.now()}`).then((res) => {
            return res.text();
        }).then((text) => {
            this.setState({
                hasUpdate: true,
                updateContent: md().render(text),
            });
        });
        this.setState({
            hasUpdate: true,
        });
    }

    public onSuccess() {
       //
    }

    public render() {
        const {alertOpen, clearingSiteData, errorMessage, hasUpdate, updateContent} = this.state;
        return (
            <div className={'App' + (this.isElectron ? ' is-electron' : '')}>
                <MuiThemeProvider theme={theme}>
                    <SnackbarProvider maxSnack={3}>
                        {Routes}
                    </SnackbarProvider>
                    <Dialog
                        open={alertOpen}
                        onClose={this.alertCloseHandler}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle>Critical Error</DialogTitle>
                        <DialogContent>
                            {!clearingSiteData && <DialogContentText>
                                {errorMessage}<br/>
                                <i>This probably fix your problem!</i>
                            </DialogContentText>}
                        </DialogContent>
                        {!clearingSiteData && <DialogActions>
                            <Button onClick={this.alertCloseHandler}
                                    color="primary">{I18n.t('general.disagree')}</Button>
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
                    >
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
                        </DialogActions>
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
            const testUrl = localStorage.getItem('river.workspace_url') || '';
            localStorage.clear();
            localStorage.setItem('river.workspace_url', testUrl);
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
}

export default App;
