import * as React from 'react';

import 'emoji-mart/css/emoji-mart.css';
import './style.css';
import TimeUtililty from "../../services/utilities/time";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import {IDialog} from "../../repository/dialog/interface";

interface IProps {
    dialog: IDialog;
}

interface IState {
    dialog: IDialog;
}

class DialogMessage extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            dialog: props.dialog,
        };
    }

    // public componentDidMount() {
    // }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.dialog === newProps.dialog) {
            return;
        }
        this.setState({
            dialog: newProps.dialog,
        });
    }

    public render() {
        const {dialog} = this.state;
        return (
            <div className="dialog-wrapper">
                <UserAvatar id={dialog.user_id || 0}/>
                <UserName id={dialog.user_id || 0} className="name"/>
                <span className="time">{TimeUtililty.dynamic(dialog.last_update)}</span>
                <span className="preview">{dialog.preview}</span>
            </div>
        );
    }
}

export default DialogMessage;