/*
    Creation Time: 2018 - 11 - 24
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {IUser} from '../../repository/user/interface';
import {trimStart} from 'lodash';
import {KeyboardBackspaceRounded, ArrowForwardRounded, CheckRounded} from '@material-ui/icons';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton/IconButton';
import ContactList from '../ContactList';
import i18n from '../../services/i18n';

import './style.css';

interface IProps {
    onClose?: () => void;
    onCreate?: (contacts: IUser[], title: string) => void;
}

interface IState {
    page: string;
    selectedContacts: IUser[];
    title: string;
}

class NewGroupMenu extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            page: '1',
            selectedContacts: [],
            title: '',
        };
    }

    public componentDidMount() {
        //
    }

    public render() {
        const {page, selectedContacts, title} = this.state;
        return (
            <div className="new-group-menu">
                <div className={'page-container page-' + page}>
                    <div className="page page-1">
                        <div className="menu-header">
                            <IconButton
                                onClick={this.props.onClose}
                            >
                                <KeyboardBackspaceRounded/>
                            </IconButton>
                            <label>{i18n.t('contact.create_a_new_group')}</label>
                        </div>
                        <div className="contact-box">
                            <ContactList onChange={this.contactListChangeHandler} mode="chip"/>
                        </div>
                        {Boolean(selectedContacts.length > 0) && <div className="actions-bar">
                            <div className="add-action" onClick={this.onNextHandler}>
                                <ArrowForwardRounded/>
                            </div>
                        </div>}
                    </div>
                    <div className="page page-2">
                        <div className="menu-header">
                            <IconButton
                                onClick={this.onPrevHandler}
                            >
                                <KeyboardBackspaceRounded/>
                            </IconButton>
                            <label>{i18n.t('contact.group_settings')}</label>
                        </div>
                        <div className="input-container">
                            <TextField
                                label={i18n.t('contact.group_title')}
                                fullWidth={true}
                                value={title}
                                inputProps={{
                                    maxLength: 32,
                                }}
                                onChange={this.onTitleChangeHandler}
                            />
                        </div>
                        {Boolean(title.length > 0) && <div className="actions-bar no-bg">
                            <div className="add-action" onClick={this.onCreateHandler}>
                                <CheckRounded/>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        );
    }

    private contactListChangeHandler = (contacts: IUser[]) => {
        this.setState({
            selectedContacts: contacts,
        });
    }

    private onNextHandler = () => {
        const {selectedContacts} = this.state;
        if (!selectedContacts) {
            return;
        }
        this.setState({
            page: '2',
        });
    }

    private onPrevHandler = () => {
        this.setState({
            page: '1',
        });
    }

    private onTitleChangeHandler = (e: any) => {
        this.setState({
            title: trimStart(e.currentTarget.value),
        });
    }

    private onCreateHandler = () => {
        const {selectedContacts, title} = this.state;
        if (!selectedContacts) {
            return;
        }
        if (this.props.onClose) {
            this.props.onClose();
        }
        if (this.props.onCreate) {
            this.props.onCreate(selectedContacts, title);
        }
    }
}

export default NewGroupMenu;
