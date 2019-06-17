/*
    Creation Time: 2019 - Feb - 23
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import {CloseRounded, SendRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import ContactList from '../ContactList';
import {IUser} from '../../repository/user/interface';
import i18n from '../../services/i18n';

import './style.css';

interface IProps {
    onDone?: (contacts: IUser[], caption: string) => void;
}

interface IState {
    caption: string;
    open: boolean;
    page: string;
    phone: string;
    recipients: IUser[];
}

class ContactPicker extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            caption: '',
            open: false,
            page: '1',
            phone: '',
            recipients: [],
        };
    }

    public openDialog() {
        this.setState({
            open: true,
        });
    }

    public render() {
        const {page, open, recipients} = this.state;
        return (
            <Dialog
                className="contact-picker"
                open={this.state.open}
                onClose={this.handleClose}
            >
                {open && <div className="dialog-content">
                    <div className={'page-container page-' + page}>
                        <div className="page page-1">
                            <div className="page-content">
                                <div className="dialog-header">
                                    <IconButton
                                        aria-label="Close"
                                        aria-haspopup="true"
                                        onClick={this.handleClose}
                                        className="action"
                                    >
                                        <CloseRounded/>
                                    </IconButton>
                                    {i18n.t('general.choose_recipients')}
                                </div>
                                <ContactList onChange={this.addRecipientChangeHandler} mode="chip"/>
                                {Boolean(recipients.length > 0) && <div className="actions-bar">
                                    <div className="add-action send" onClick={this.doneHandler}>
                                        <SendRounded/>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>
                </div>}
            </Dialog>
        );
    }

    private handleClose = () => {
        this.setState({
            open: false,
            phone: '',
            recipients: [],
        });
    }

    private addRecipientChangeHandler = (users: IUser[]) => {
        this.setState({
            recipients: users,
        });
    }

    private doneHandler = () => {
        if (this.props.onDone) {
            this.props.onDone(this.state.recipients, this.state.caption);
            this.handleClose();
        }
    }
}

export default ContactPicker;
