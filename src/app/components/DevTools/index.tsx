/*
    Creation Time: 2019 - Nov - 21
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import i18n from "../../services/i18n";
import ElectronService from "../../services/electron";
import {serverKeys} from "../../services/sdk/server";

import './style.scss';

interface IProps {
    className?: string;
}

interface IState {
    debugServerKeys: string;
    electronLoadUrl: string;
    fileUrl: string;
    open: boolean;
    throttleInterval: number;
    url: string;
}

class DevTools extends React.Component<IProps, IState> {
    private electronService: ElectronService;
    private electronLoadUrl: string = '';

    constructor(props: IProps) {
        super(props);

        this.state = {
            debugServerKeys: localStorage.getItem('river.server_keys') || serverKeys,
            electronLoadUrl: '',
            fileUrl: localStorage.getItem('river.workspace_url_file') || 'file.river.im',
            open: false,
            throttleInterval: parseInt(localStorage.getItem('river.debug.throttle_interval') || '200', 10),
            url: localStorage.getItem('river.workspace_url') || 'cyrus.river.im'
        };

        this.electronService = ElectronService.getInstance();
    }

    public componentDidMount() {
        if (ElectronService.isElectron()) {
            this.electronService.getLoadUrl().then((res) => {
                this.setState({
                    electronLoadUrl: res.url,
                });
                this.electronLoadUrl = res.url;
            });
        }
    }

    /* Open dialog */
    public open() {
        this.setState({
            open: true,
        });
    }

    public render() {
        const {open, url, fileUrl, throttleInterval, debugServerKeys, electronLoadUrl} = this.state;
        return (
            <Dialog
                open={open}
                onClose={this.debugModeCloseHandler}
                className="confirm-dialog dev-tools-dialog"
                disableBackdropClick={true}
            >
                <div>
                    <DialogTitle>{i18n.t('settings.debug_mode')}</DialogTitle>
                    <DialogContent>
                        <div style={{width: '300px'}}>
                            <DialogContentText>{i18n.t('settings.set_test_url')}</DialogContentText>
                            <TextField
                                margin="dense"
                                label={i18n.t('settings.test_url')}
                                type="text"
                                fullWidth={true}
                                value={url}
                                onChange={this.debugModeUrlChange}
                            />
                            <TextField
                                margin="dense"
                                label={i18n.t('settings.test_file_url')}
                                type="text"
                                fullWidth={true}
                                value={fileUrl}
                                onChange={this.debugModeFileUrlChange}
                            />
                            {ElectronService.isElectron() && <TextField
                                margin="dense"
                                label={i18n.t('settings.electron_load_url')}
                                type="text"
                                fullWidth={true}
                                value={electronLoadUrl}
                                onChange={this.debugModeElectronLoadUrlChange}
                            />}
                            <TextField
                                margin="dense"
                                label="Server Keys"
                                type="text"
                                fullWidth={true}
                                value={debugServerKeys}
                                onChange={this.debugServerKeysChange}
                            />
                            <TextField
                                margin="dense"
                                label={i18n.t('settings.throttle_interval')}
                                type="text"
                                fullWidth={true}
                                value={throttleInterval}
                                onChange={this.debugModeThrottleIntervalChange}
                            />
                            <Button onClick={this.debugModeClearAllDataHandler} variant="contained" color="secondary"
                                    fullWidth={true}>{i18n.t('settings.clear_all_data')}</Button>
                            {ElectronService.isElectron() &&
                            <Button onClick={this.toggleMenuBarHandler} style={{marginTop: '10px'}} variant="contained"
                                    color="secondary"
                                    fullWidth={true}>{i18n.t('settings.toggle_menu_bar')}</Button>}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.debugModeCloseHandler} color="secondary">
                            {i18n.t('general.cancel')}
                        </Button>
                        <Button onClick={this.debugModeApplyHandler} color="primary" autoFocus={true}>
                            {i18n.t('general.apply')}
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        );
    }

    private debugModeClearAllDataHandler = () => {
        const authErrorEvent = new CustomEvent('authErrorEvent', {});
        window.dispatchEvent(authErrorEvent);
    }

    /* Debug mode close handler */
    private debugModeCloseHandler = () => {
        this.setState({
            open: false,
        });
    }

    /* Debug mode apply handler */
    private debugModeApplyHandler = () => {
        localStorage.setItem('river.workspace_url', this.state.url);
        localStorage.setItem('river.workspace_url_file', this.state.fileUrl);
        localStorage.setItem('river.server_keys', this.state.debugServerKeys);
        localStorage.setItem('river.debug.throttle_interval', String(this.state.throttleInterval));
        if (ElectronService.isElectron() && this.state.electronLoadUrl !== this.electronLoadUrl) {
            this.electronService.setLoadUrl(this.state.electronLoadUrl);
        }
        if (serverKeys !== this.state.debugServerKeys) {
            const authErrorEvent = new CustomEvent('authErrorEvent', {});
            window.dispatchEvent(authErrorEvent);
        } else {
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }

    /* Debug mode url change handler */
    private debugModeUrlChange = (e: any) => {
        this.setState({
            url: e.currentTarget.value,
        });
    }

    /* Debug mode file url change handler */
    private debugModeFileUrlChange = (e: any) => {
        this.setState({
            fileUrl: e.currentTarget.value,
        });
    }

    /* Debug mode server keys change handler */
    private debugServerKeysChange = (e: any) => {
        this.setState({
            debugServerKeys: e.currentTarget.value,
        });
    }

    /* Debug mode Throttle Interval change handler */
    private debugModeThrottleIntervalChange = (e: any) => {
        this.setState({
            throttleInterval: e.currentTarget.value,
        });
    }

    /* Debug mode Electron Load URL change handler */
    private debugModeElectronLoadUrlChange = (e: any) => {
        this.setState({
            electronLoadUrl: e.currentTarget.value,
        });
    }

    /* Debug mode toggle menu bar handler */
    private toggleMenuBarHandler = () => {
        this.electronService.toggleMenuBar();
    }
}

export default DevTools;
