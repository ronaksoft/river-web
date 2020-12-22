/*
    Creation Time: 2019 - May - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import riverLogo from '../../../asset/image/about/river.png';
import ronakLogo from '../../../asset/image/about/ronak.png';
import {C_VERSION} from "../../../App";

import './style.scss';

interface IProps {
    height?: string;
}

interface IState {
    className?: string;
    open: boolean;
    version: string;
}

class AboutDialog extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            open: false,
            version: '0.6',
        };

    }

    public openDialog(version: string) {
        this.setState({
            open: true,
            version,
        });
    }

    public render() {
        const {open, version} = this.state;
        return (
            <Dialog
                open={open}
                onClose={this.closeHandler}
                className="about-dialog"
                classes={{
                    paper: 'about-dialog-paper'
                }}
            >
                <div className="about-dialog-content">
                    <div className="logo-container">
                        <img src={riverLogo} alt="logo"/>
                    </div>
                    <div className="version-container">{`${C_VERSION} (${version})`}</div>
                    <div className="about-container">
                        River is free messaging app for desktop focuses on security and speed.
                    </div>
                    <div className="copyright-container">
                        <img src={ronakLogo} alt="ronak-logo"/>
                        <span>Copyright © 2016 - 2020 Ronak Software Group</span>
                    </div>
                </div>
            </Dialog>
        );
    }

    private closeHandler = () => {
        this.setState({
            open: false,
        });
    }

}

export default AboutDialog;
