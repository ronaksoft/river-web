/*
    Creation Time: 2020 - Sep - 09
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {Button, DialogActions, DialogTitle, IconButton} from "@material-ui/core";
import {KeyboardBackspaceRounded} from "@material-ui/icons";
import i18n from "../../services/i18n";
import Scrollbars from "react-custom-scrollbars";
import {C_LOCALSTORAGE} from "../../services/sdk/const";
import APIManager from "../../services/sdk";
import {Loading} from "../Loading";
import {findIndex} from "lodash";
import {AccountAuthorization} from "../../services/sdk/messages/accounts_pb";
import TimeUtility from "../../services/utilities/time";
import OverlayDialog from "@material-ui/core/Dialog/Dialog";

import './style.scss';

interface IProps {
    onPrev?: (e: any) => void;
    onDone?: () => void;
    limit?: number;
    onSetCount?: (count: number) => void;
}

interface IState {
    confirmDialogOpen: boolean;
    confirmDialogSelectedId: string;
    loading: boolean;
    sessions: AccountAuthorization.AsObject[];
}


class SettingsSession extends React.Component<IProps, IState> {
    private readonly rtl: boolean = false;
    private readonly currentAuthID: string;
    private apiManager: APIManager;

    constructor(props: IProps) {
        super(props);

        this.state = {
            confirmDialogOpen: false,
            confirmDialogSelectedId: '',
            loading: false,
            sessions: [],
        };

        this.rtl = localStorage.getItem(C_LOCALSTORAGE.LangDir) === 'rtl';
        this.apiManager = APIManager.getInstance();
        this.currentAuthID = this.apiManager.getConnInfo().AuthID;
    }

    public componentDidMount() {
        this.getSessions();
    }

    public render() {
        const {sessions, loading, confirmDialogOpen} = this.state;
        return (
            <>
                {Boolean(this.props.onPrev) && <div className="menu-header">
                    <IconButton
                        onClick={this.props.onPrev}
                    >
                        <KeyboardBackspaceRounded/>
                    </IconButton>
                    <label>{i18n.t('settings.active_sessions')}</label>
                </div>}
                {sessions && <div className="menu-content session-container">
                    {Boolean(sessions.length > 0 && !loading) && <Scrollbars
                        autoHide={true}
                        rtl={this.rtl}
                    >
                        <div>
                            {sessions.map((item, key) => {
                                // @ts-ignore
                                if (item.type === 'terminate_all') {
                                    if (sessions.length > 2) {
                                        return (
                                            <div key={key} className="session-item terminate-all">
                                                <span
                                                    onClick={this.terminateSessionConfirmHandler('0')}>{i18n.t('settings.terminate_all_other_sessions')}</span>
                                            </div>
                                        );
                                    } else {
                                        return null;
                                    }
                                } else {
                                    return (
                                        <div key={key} className="session-item">
                                            {Boolean(this.currentAuthID === item.authid) &&
                                            <div
                                                className="session-current">{i18n.t('settings.current')}</div>}
                                            <div className="session-info">
                                                <div className="session-row">
                                                    <div
                                                        className="session-col">{`Client: ${(item.model || '').split(':-').join(' ')}`}</div>
                                                </div>
                                                <div
                                                    className="session-row">
                                                    <div
                                                        className="session-col">{i18n.tf('settings.ip_at', [item.clientip || '', TimeUtility.dynamic(item.createdat)])}</div>
                                                </div>
                                                <div className="session-row">
                                                    <div
                                                        className={'session-col' + (this.currentAuthID === item.authid ? ' online' : '')}>{this.currentAuthID === item.authid ? i18n.t('status.online') : i18n.tf('settings.last_active', TimeUtility.timeAgo(item.activeat || item.createdat))}</div>
                                                </div>
                                            </div>
                                            <div className="session-action">
                                                            <span className="action-terminate"
                                                                  onClick={this.terminateSessionConfirmHandler(item.authid)}>{i18n.t('settings.terminate')}</span>
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </Scrollbars>}
                    {Boolean(sessions.length === 0) &&
                    <div
                        className="session-placeholder">{i18n.t('settings.you_have_no_active_sessions')}</div>}
                    {Boolean(this.props.onDone) && <div className="session-done-container">
                        <Button color="secondary" variant="outlined" onClick={this.doneHandler} fullWidth={true}
                                disabled={sessions.length > (this.props.limit || 0) + 1}>
                            {i18n.t('general.next')}
                        </Button>
                    </div>}
                </div>}
                {loading && <Loading/>}
                <OverlayDialog
                    open={confirmDialogOpen}
                    onClose={this.confirmDialogCloseHandler}
                    className="confirm-dialog"
                    classes={{
                        paper: 'confirm-dialog-paper'
                    }}
                >
                    <DialogTitle>{this.state.confirmDialogSelectedId === '0' ? i18n.t('settings.terminate_all_other_sessions') : i18n.t('settings.terminate_session')}</DialogTitle>
                    <DialogActions>
                        <Button onClick={this.confirmDialogCloseHandler} color="secondary">
                            {i18n.t('general.disagree')}
                        </Button>
                        <Button onClick={this.terminateSessionHandler} color="primary" autoFocus={true}>
                            {i18n.t('general.agree')}
                        </Button>
                    </DialogActions>
                </OverlayDialog>
            </>
        );
    }

    /* Modify Sessions */
    private modifySessions(sessions: AccountAuthorization.AsObject[]) {
        const index = findIndex(sessions, {authid: this.currentAuthID});
        if (index > 0) {
            const currentSession = sessions[index];
            sessions.splice(index, 1);
            // @ts-ignore
            sessions.unshift({type: 'terminate_all'});
            sessions.unshift(currentSession);
        } else {
            // @ts-ignore
            sessions.splice(1, 0, {type: 'terminate_all'});
        }
        for (let i = 2; i < sessions.length; i++) {
            for (let j = i; j < sessions.length; j++) {
                if ((sessions[i].activeat || 0) < (sessions[j].activeat || 0)) {
                    const hold = sessions[i];
                    sessions[i] = sessions[j];
                    sessions[j] = hold;
                }
            }
        }
        return sessions;
    }

    /* Get All Sessions */
    private getSessions() {
        if (this.state.loading) {
            return;
        }
        this.setState({
            loading: true,
        });

        this.apiManager.sessionGetAll().then((res) => {
            if (this.props.onSetCount) {
                this.props.onSetCount(res.authorizationsList.length);
            }
            this.setState({
                loading: false,
                sessions: this.modifySessions(res.authorizationsList),
            });
        }).catch(() => {
            this.setState({
                loading: false,
            });
        });
    }

    /* Open confirm dialog for terminate session by Id */
    private terminateSessionConfirmHandler = (id: string | undefined) => (e: any) => {
        if (!id) {
            return;
        }
        this.setState({
            confirmDialogOpen: true,
            confirmDialogSelectedId: id
        });
    }

    /* Terminate session selected session */
    private terminateSessionHandler = () => {
        const {confirmDialogSelectedId} = this.state;
        if (confirmDialogSelectedId !== '') {
            this.apiManager.sessionTerminate(confirmDialogSelectedId).then(() => {
                const {sessions} = this.state;
                if (confirmDialogSelectedId !== '0') {
                    const index = findIndex(sessions, {authid: confirmDialogSelectedId});
                    if (sessions && index > -1) {
                        sessions.splice(index, 1);
                        this.setState({
                            sessions,
                        });
                    }
                } else {
                    const index = findIndex(sessions, {authid: this.currentAuthID});
                    if (sessions && index > -1) {
                        this.setState({
                            sessions: [sessions[index]],
                        });
                    }
                }
            });
        }
        this.confirmDialogCloseHandler();
    }

    /* Confirm dialog close handler */
    private confirmDialogCloseHandler = () => {
        this.setState({
            confirmDialogOpen: false,
        });
    }

    private doneHandler = () => {
        if (this.props.onDone) {
            this.props.onDone();
        }
    }
}

export default SettingsSession;
