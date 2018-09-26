import * as React from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import './style.css';

interface IProps {
    onMessage?: (phone: string, text: string) => void;
    open: boolean;
    onClose: () => void;
}

interface IState {
    open: boolean;
    phone: string;
    text: string;
}

class NewMessage extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            open: false,
            phone: '',
            text: '',
        };
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            open: newProps.open,
        });
    }

    public render() {
        return (
            <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">New message</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus={true}
                        fullWidth={true}
                        label="Phone"
                        margin="normal"
                        onChange={this.phoneHandleChange}
                        value={this.state.phone}
                    />
                    <TextField
                        fullWidth={true}
                        label="Your message"
                        margin="dense"
                        multiline={true}
                        onChange={this.textHandleChange}
                        rows={2}
                        rowsMax={4}
                        type="text"
                        value={this.state.text}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.compose} color="primary">
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    private handleClose = () => {
        this.setState({
            open: false,
        });
        this.props.onClose();
    }

    private phoneHandleChange = (e: any) => {
        this.setState({
            phone: e.target.value,
        });
    }

    private textHandleChange = (e: any) => {
        this.setState({
            text: e.target.value,
        });
    }

    private compose = () => {
        if (this.props.onMessage) {
            this.props.onMessage(this.state.phone, this.state.text);
            this.handleClose();
        }
    }
}

export default NewMessage;