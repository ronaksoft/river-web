import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import {ArrowForwardRounded, KeyboardBackspaceRounded, CloseRounded, SendRounded} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton/IconButton';
import ContactList from '../ContactList';
import {IContact} from '../../repository/contact/interface';
import TextField from '@material-ui/core/TextField';
import {trimStart} from 'lodash';

import './style.css';

interface IProps {
    onMessage?: (contacts: IContact[], text: string) => void;
    open: boolean;
    onClose: () => void;
}

interface IState {
    open: boolean;
    page: string;
    phone: string;
    recipients: IContact[];
    text: string;
}

class NewMessage extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            open: false,
            page: '1',
            phone: '',
            recipients: [],
            text: '',
        };
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            open: newProps.open,
        });
    }

    public render() {
        const {page, recipients, text} = this.state;
        return (
            <Dialog
                className="compose-new-message"
                open={this.state.open}
                onClose={this.handleClose}
            >
                <div className="dialog-content">
                    <div className={'page-container page-' + page}>
                        <div className="page page-1">
                            <div className="page-content">
                                <div className="dialog-header">
                                    <IconButton
                                        aria-label="Close"
                                        aria-haspopup="true"
                                        onClick={this.props.onClose}
                                        className="action"
                                    >
                                        <CloseRounded/>
                                    </IconButton>
                                    Choose Recipient(s)
                                </div>
                                <ContactList onChange={this.addRecipientChangeHandler}/>
                                {Boolean(recipients.length > 0) && <div className="actions-bar">
                                    <div className="add-action" onClick={this.nextStepHandler}>
                                        <ArrowForwardRounded/>
                                    </div>
                                </div>}
                            </div>
                        </div>
                        <div className="page page-2">
                            <div className="page-content">
                                <div className="dialog-header">
                                    <IconButton
                                        aria-label="Close"
                                        aria-haspopup="true"
                                        onClick={this.prevStepHandler}
                                        className="action"
                                    >
                                        <KeyboardBackspaceRounded/>
                                    </IconButton> Compose a Message
                                </div>
                                <div className="compose-area">
                                    <TextField
                                        fullWidth={true}
                                        label="Your message"
                                        margin="dense"
                                        multiline={true}
                                        onChange={this.textHandleChange}
                                        rows={2}
                                        rowsMax={8}
                                        type="text"
                                        value={text}
                                    />
                                </div>
                                {Boolean(recipients.length > 0 && text.length > 0) && <div className="actions-bar no-bg">
                                    <div className="add-action send" onClick={this.composeHandler}>
                                        <SendRounded/>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        );
    }

    private handleClose = () => {
        this.setState({
            open: false,
            page: '1',
            phone: '',
            recipients: [],
            text: '',
        });
        this.props.onClose();
    }

    private addRecipientChangeHandler = (users: IContact[]) => {
        this.setState({
            recipients: users,
        });
    }

    private nextStepHandler = () => {
        this.setState({
            page: '2'
        });
    }

    private prevStepHandler = () => {
        this.setState({
            page: '1'
        });
    }

    private textHandleChange = (e: any) => {
        this.setState({
            text: trimStart(e.target.value),
        });
    }

    private composeHandler = () => {
        if (this.props.onMessage) {
            this.props.onMessage(this.state.recipients, this.state.text);
            this.handleClose();
        }
    }
}

export default NewMessage;
