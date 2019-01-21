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

import './App.css';

const theme = createMuiTheme({
    palette: {
        primary: {
            contrastText: '#FFF',
            dark: '#2E8F57',
            light: '#29c16d',
            main: '#27AE60',
        },
    },
});

interface IState {
    alertOpen: boolean;
    clearingSiteData: boolean;
    errorMessage: string;
}

class App extends React.Component<{}, IState> {
    private mainRepo: MainRepo;
    private isElectron: boolean = false;

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

    public componentDidMount() {
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
            el.setAttribute('bubble', localStorage.getItem('river.theme.bubble') || '1');
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
            const testUrl = localStorage.getItem('river.test_url') || '';
            localStorage.clear();
            localStorage.setItem('river.test_url', testUrl);
            this.setState({
                alertOpen: false,
            }, () => {
                window.location.reload();
            });
        });
    }
}

export default App;
