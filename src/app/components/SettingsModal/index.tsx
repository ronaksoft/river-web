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

import './style.scss';

interface IProps {
    fit?: boolean;
    height?: string;
    icon?: any;
    noScrollbar?: boolean;
    onClose?: () => void;
    onDone?: () => void;
    open: boolean;
    title: any;
}

interface IState {
    className?: string;
    open: boolean;
}

class SettingsModal extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        return {
            open: props.open,
        };
    }

    constructor(props: IProps) {
        super(props);

        this.state = {
            open: props.open,
        };
    }

    public render() {
        const {icon, title, noScrollbar, fit} = this.props;
        const {open} = this.state;
        return (
            <Dialog
                open={open}
                onClose={this.props.onClose}
                className={'settings-modal' + (fit ? ' fit' : '')}
            >
                <React.Fragment>
                    <div className="settings-modal-header">
                        <div className="modal-icon" onClick={this.props.onDone}>
                            {icon || <AppsRounded/>}
                        </div>
                        <div className="modal-title">{title}</div>
                        <div className="modal-close">
                            <CloseRounded onClick={this.props.onClose}/>
                        </div>
                    </div>
                    {Boolean(!noScrollbar) && <div className="setting-content" style={{height: this.props.height}}>
                        <Scrollbars
                            style={{
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            {this.props.children}
                        </Scrollbars>
                    </div>}
                    {Boolean(noScrollbar) && <div className="setting-content" style={{height: this.props.height}}>
                        {this.props.children}
                    </div>}
                </React.Fragment>
            </Dialog>
        );
    }
}

export default SettingsModal;
