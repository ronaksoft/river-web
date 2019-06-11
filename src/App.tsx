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

import './App.css';

if (!process || !process.env || process.env.NODE_ENV !== 'development') {
    Sentry.init({
        dsn: "https://7f5b41c4b12d473bbe8db09fe0420c8a@sentry.ronaksoftware.com/8"
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
}

class App extends React.Component<{}, IState> {
    private mainRepo: MainRepo;
    private readonly isElectron: boolean = false;

    constructor(props: {}) {
        super(props);

        this.state = {
            alertOpen: false,
            clearingSiteData: false,
            errorMessage: `You are receiving "Auth Error", do you like to clear all site data?`,
        };

        this.mainRepo = MainRepo.getInstance();

        // @ts-ignore
        if (window.isElectron) {
            this.isElectron = true;
        }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (!process || !process.env || process.env.NODE_ENV !== 'development') {
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
        }

        const refreshEl = document.querySelector('#refresh');
        if (refreshEl) {
            refreshEl.remove();
        }
    }

    public render() {
        const {alertOpen, clearingSiteData, errorMessage} = this.state;
        return (
            <div className={'App' + (this.isElectron ? ' is-electron' : '')}>
                <MuiThemeProvider theme={theme}>
                    {Routes}
                </MuiThemeProvider>
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
                        <Button onClick={this.alertCloseHandler} color="primary">
                            Disagree
                        </Button>
                        <Button onClick={this.clearSiteDataHandler} color="primary" autoFocus={true}>
                            Agree
                        </Button>
                    </DialogActions>}
                    {clearingSiteData &&
                    <DialogActions style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <CircularProgress/>
                    </DialogActions>}
                </Dialog>
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
}

export default App;
