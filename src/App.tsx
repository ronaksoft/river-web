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
}

class App extends React.Component<{}, IState> {
    private mainRepo: MainRepo;

    constructor(props: {}) {
        super(props);

        this.state = {
            alertOpen: false,
            clearingSiteData: false,
        };

        this.mainRepo = MainRepo.getInstance();
    }

    public componentDidMount() {
        // @ts-ignore
        if (window.Notification) {
            Notification.requestPermission();
        }

        window.addEventListener('authErrorEvent', (event: any) => {
            this.setState({
                alertOpen: true,
            });
        });

        const el = document.querySelector('html');
        if (el) {
            el.setAttribute('theme', localStorage.getItem('river.theme.color') || 'normal');
            el.setAttribute('font', localStorage.getItem('river.theme.font') || '2');
            el.setAttribute('bg', localStorage.getItem('river.theme.bg') || '2');
        }
    }

    public render() {
        const {alertOpen, clearingSiteData} = this.state;
        return (
            <div className="App">
                <MuiThemeProvider theme={theme}>
                    {Routes}
                </MuiThemeProvider>
                <Dialog
                    open={alertOpen}
                    onClose={this.alertCloseHandler}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle>Auth Error</DialogTitle>
                    <DialogContent>
                        {!clearingSiteData && <DialogContentText>
                            You are receiving "Auth Error", do you like to clear all site data?
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
                    {clearingSiteData && <DialogActions>
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
            localStorage.clear();
            this.setState({
                alertOpen: false,
            }, () => {
                window.location.reload();
            });
        });
    }
}

export default App;
