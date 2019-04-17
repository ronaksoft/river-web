/*
    Creation Time: 2019 - April - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import {
    AppsRounded,
    CloseRounded,
} from '@material-ui/icons';
import Scrollbars from 'react-custom-scrollbars';

import './style.css';

interface IProps {
    icon?: any;
    onClose?: () => void;
    open: boolean;
    title: string;
}

interface IState {
    className?: string;
    open: boolean;
}

class SettingsModal extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            open: props.open,
        };

    }

    public componentDidMount() {
        //
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            open: newProps.open,
        });
    }

    public render() {
        const {icon, title} = this.props;
        const {open} = this.state;
        return (
            <Dialog
                open={open}
                onClose={this.props.onClose}
                className="settings-modal"
            >
                <React.Fragment>
                    <div className="settings-modal-header">
                        <div className="modal-icon">
                            {icon || <AppsRounded/>}
                        </div>
                        <div className="modal-title">{title}</div>
                        <div className="modal-close">
                            <CloseRounded onClick={this.props.onClose}/>
                        </div>
                    </div>
                    <div className="setting-content">
                        <Scrollbars
                            style={{
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            {this.props.children}
                        </Scrollbars>
                    </div>
                </React.Fragment>
            </Dialog>
        );
    }
}

export default SettingsModal;
