/*
    Creation Time: 2020 - Dec - 06
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import i18n from "../../services/i18n";
import Smoother from "../../services/utilities/smoother";
import {isNil, omitBy} from "lodash";
import APIManager from "../../services/sdk";

interface IProps {
    teamId: string;
}

interface IState {
    isConnecting: boolean;
    isOnline: boolean;
    isUpdating: boolean;
}

class ConnectionStatus extends React.Component<IProps, IState> {
    private smoother: Smoother;

    constructor(props: IProps) {
        super(props);

        this.state = {
            isConnecting: false,
            isOnline: false,
            isUpdating: false,
        };

        this.smoother = new Smoother(2000, this.updateFunctionHandler);
    }

    public componentWillUnmount() {
        this.smoother.destroy();
    }

    public setStatus(state: {
        isConnecting?: boolean;
        isOnline?: boolean;
        isUpdating?: boolean;
    }) {
        // @ts-ignore
        this.setState(omitBy(state, isNil));
    }

    public render() {
        const {isConnecting, isOnline, isUpdating} = this.state;
        const showIsConnecting = this.smoother.getState(isConnecting);
        if (!isOnline) {
            return (<span>{i18n.t('status.waiting_for_network')}</span>);
        } else if (isConnecting && showIsConnecting) {
            return (<span className="try-again-container"><span>{i18n.t('status.connecting')}</span><span
                className="try-again" onClick={this.tryAgainHandler}>{i18n.t('status.try_again')}</span></span>);
        } else if (isUpdating) {
            return (<span>{i18n.t('status.updating')}</span>);
        }
        return null;
    }

    private tryAgainHandler = (e: any) => {
        e.stopPropagation();
        e.preventDefault();
        APIManager.getInstance().checkNetwork();
    };

    private updateFunctionHandler = () => {
        this.forceUpdate();
    }
}

export default ConnectionStatus;
