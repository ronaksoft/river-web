import * as React from 'react';

import './style.css';
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import {IDialog} from "../../repository/dialog/interface";
import LiveDate from '../LiveDate';

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
                <UserAvatar className="avatar" id={dialog.user_id || 0}/>
                <UserName className="name" id={dialog.user_id || 0} />
                <LiveDate className="time" time={dialog.last_update || 0}/>
                <span className="preview">{dialog.preview}</span>
            </div>
        );
    }
}

export default DialogMessage;