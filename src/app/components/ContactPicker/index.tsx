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

import './style.scss';
import {localize} from "../../services/utilities/localize";

interface IProps {
    onDone: (contacts: IUser[], caption: string) => void;
    teamId: string;
    title?: string;
    groupId?: string;
    sendIcon?: any;
    limit?: number;
    selectAll?: boolean;
}

interface IState {
    caption: string;
    defaultCount: number;
    hiddenContacts: IUser[];
    open: boolean;
    page: string;
    recipients: IUser[];
}

class ContactPicker extends React.Component<IProps, IState> {
    private contactListRef: ContactList | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            caption: '',
            defaultCount: 0,
            hiddenContacts: [],
            open: false,
            page: '1',
            recipients: [],
        };
    }

    public openDialog(selectedUser?: IUser[]) {
        this.setState({
            hiddenContacts: selectedUser || [],
            open: true,
        });
    }

    public render() {
        const {page, open, recipients, hiddenContacts, defaultCount} = this.state;
        const showSelectAll = Boolean(defaultCount && (this.props.limit || 0) >= defaultCount && recipients.length !== defaultCount);
        const limit = this.props.limit || 0;
        return (
            <Dialog
                className="contact-picker"
                open={this.state.open}
                onClose={this.handleClose}
                classes={{
                    paper: 'contact-picker-paper'
                }}
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
                                    {this.props.title || i18n.t('general.choose_recipients')}
                                </div>
                                <ContactList ref={this.contactListRefHandler} onChange={this.addRecipientChangeHandler}
                                             mode="chip" groupId={this.props.groupId} teamId={this.props.teamId}
                                             hiddenContacts={hiddenContacts} hideYou={Boolean(this.props.groupId)}
                                             onDefaultLoad={this.contactListDefaultLoadHandler}
                                             disableCheckSelected={this.props.selectAll}/>
                                {Boolean(recipients.length > 0 && (!limit || limit >= recipients.length)) &&
                                <div className="actions-bar">
                                    <div
                                        className={'add-action send' + (Boolean(this.props.sendIcon) ? ' no-animation' : '')}
                                        onClick={this.doneHandler}>
                                        {this.props.sendIcon || <SendRounded/>}
                                    </div>
                                </div>}
                                {Boolean(limit && this.props.selectAll) && <div className="dialog-footer">
                                    <div
                                        className={'counter' + (recipients.length > limit ? ' exceeded' : '')}>{`${localize(recipients.length)}/${localize(this.props.limit || 0)}`}</div>
                                    {showSelectAll && this.props.selectAll &&
                                    <div className="select-all"
                                         onClick={this.selectAllHandler}>{i18n.t('general.select_all')}</div>}
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
            hiddenContacts: [],
            open: false,
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

    private contactListDefaultLoadHandler = (count: number) => {
        if (!this.props.selectAll) {
            return;
        }
        this.setState({
            defaultCount: count - 1,
        });
    }

    private contactListRefHandler = (ref: any) => {
        this.contactListRef = ref;
    }

    private selectAllHandler = () => {
        if (this.contactListRef) {
            this.contactListRef.selectAll();
        }
    }
}

export default ContactPicker;
