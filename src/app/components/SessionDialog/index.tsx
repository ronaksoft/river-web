/*
    Creation Time: 2020 - Sep - 09
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import SettingsModal from '../SettingsModal';
import {ClearAllRounded} from '@material-ui/icons';
import SettingsSession from "../SettingsSession";
import i18n from "../../services/i18n";

import './style.scss';

interface IState {
    limit: number;
    open: boolean;
}

class SessionDialog extends React.Component<any, IState> {
    private resolve: any = null;

    constructor(props: any) {
        super(props);

        this.state = {
            limit: 7,
            open: false,
        };
    }

    public openDialog(limit: number) {
        this.setState({
            limit,
            open: true,
        });
        return new Promise(resolve => {
            this.resolve = resolve;
        });
    }

    public render() {
        const {open, limit} = this.state;
        return (
            <SettingsModal open={open} title={i18n.t('settings.active_sessions')}
                           icon={<ClearAllRounded/>}
                           onClose={this.modalCloseHandler}
                           height="500px"
                           noScrollbar={true}
            >
                <div className="session-dialog">
                    <SettingsSession onDone={this.doneHandler} limit={limit}/>
                </div>
            </SettingsModal>
        );
    }

    private modalCloseHandler = () => {
        //
    }

    private doneHandler = () => {
        if (this.resolve) {
            this.resolve();
        }
    }
}

export default SessionDialog;
