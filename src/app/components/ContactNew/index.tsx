/*
    Creation Time: 2021 - May - 02
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2021
*/

import React from 'react';
import TextField from '@material-ui/core/TextField/TextField';
import {CheckRounded, PersonAddRounded} from '@material-ui/icons';
import SettingsModal from '../SettingsModal';
import i18n from '../../services/i18n';
import {extractPhoneNumber} from "../../services/utilities/localize";

import './style.scss';

interface IProps {
    onDone: (phone: string, firstname: string, lastname: string) => void;
}

interface IState {
    open: boolean;
    firstName: string;
    lastName: string;
    phone: string;
}

class ContactNew extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            firstName: '',
            lastName: '',
            open: false,
            phone: '',
        };
    }

    public open({phone, firstname, lastname}: {phone?: string, firstname?: string, lastname?: string}) {
        this.setState({
            firstName: firstname || '',
            lastName: lastname || '',
            open: true,
            phone: phone || '',
        });
    }

    public render() {
        const {firstName, lastName, phone, open} = this.state;
        return (<SettingsModal open={open} title={i18n.t('contact.new_contact')}
                               icon={<PersonAddRounded/>}
                               onClose={this.closeHandler}
                               noScrollbar={true}
                               height="280px">
            <div className="new-contact-dialog">
                <TextField
                    autoFocus={true}
                    fullWidth={true}
                    label={i18n.t('general.first_name')}
                    margin="dense"
                    onChange={this.firstNameHandleChange}
                    value={firstName}
                    onKeyDown={this.confirmKeyDown}
                    error={firstName.length <= 0}
                />
                <TextField
                    fullWidth={true}
                    label={i18n.t('general.last_name')}
                    margin="dense"
                    onChange={this.lastNameHandleChange}
                    value={lastName}
                    onKeyDown={this.confirmKeyDown}
                />
                <TextField
                    fullWidth={true}
                    label={i18n.t('general.phone')}
                    inputProps={{
                        inputMode: "tel",
                        maxLength: 32,
                    }}
                    margin="dense"
                    onChange={this.phoneHandleChange}
                    value={phone}
                    type="tel"
                    onKeyDown={this.confirmKeyDown}
                />
                <div className="actions-bar">
                    <div
                        className={'add-action' + (((firstName.length > 0 || lastName.length > 0) && phone.length > 5) ? '' : ' disabled')}
                        onClick={this.doneHandler}>
                        <CheckRounded/>
                    </div>
                </div>
            </div>
        </SettingsModal>);
    }

    private closeHandler = () => {
        this.setState({
            firstName: '',
            lastName: '',
            open: false,
            phone: '',
        });
    }

    private firstNameHandleChange = (e: any) => {
        this.setState({
            firstName: e.currentTarget.value,
        });
    }

    private lastNameHandleChange = (e: any) => {
        this.setState({
            lastName: e.currentTarget.value,
        });
    }

    private phoneHandleChange = (e: any) => {
        this.setState({
            phone: extractPhoneNumber(e.currentTarget.value),
        });
    }

    private confirmKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            this.doneHandler();
        }
    }

    private doneHandler = () => {
        const {firstName, lastName, phone} = this.state;
        if (firstName.length > 0 && lastName.length > 0 && phone.length > 5) {
            this.props.onDone(phone, firstName, lastName);
            this.closeHandler();
        }
    }
}

export default ContactNew;
