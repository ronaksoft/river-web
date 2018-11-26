import * as React from 'react';
import UserAvatar from '../UserAvatar';
import UserName from '../UserName';
import {IDialog} from '../../repository/dialog/interface';
import LiveDate from '../LiveDate';
import {DoneAllRounded, DoneRounded, ScheduleRounded} from '@material-ui/icons';

import './style.css';
import {PeerType} from '../../services/sdk/messages/core.types_pb';
import GroupAvatar from '../GroupAvatar';
import GroupName from '../GroupName';

interface IProps {
    cancelIsTyping: (id: string) => void;
    dialog: IDialog;
    isTyping: boolean;
}

interface IState {
    dialog: IDialog;
    isTyping: boolean;
}

class DialogMessage extends React.Component<IProps, IState> {
    private isTypingTimout: any = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            dialog: props.dialog,
            isTyping: false,
        };
    }

    public componentDidMount() {
        this.handleTypingTimeout();
    }

    public componentWillReceiveProps(newProps: IProps) {
        // if (this.state.dialog === newProps.dialog) {
        //     return;
        // }
        this.setState({
            dialog: newProps.dialog,
            isTyping: newProps.isTyping,
        }, () => {
            this.handleTypingTimeout();
        });
    }

    public render() {
        const {dialog, isTyping} = this.state;
        return (
            <div className="dialog-wrapper">
                {Boolean(dialog.peertype === PeerType.PEERUSER || dialog.peertype === PeerType.PEERSELF) &&
                <UserAvatar className="avatar" id={dialog.target_id || ''}/>}
                {Boolean(dialog.peertype === PeerType.PEERUSER || dialog.peertype === PeerType.PEERSELF) &&
                <UserName className="name" id={dialog.target_id || ''}/>}
                {Boolean(dialog.peertype === PeerType.PEERGROUP) &&
                <GroupAvatar className="avatar" id={dialog.target_id || ''}/>}
                {Boolean(dialog.peertype === PeerType.PEERGROUP) &&
                <GroupName className="name" id={dialog.target_id || ''}/>}
                <LiveDate className="time" time={dialog.last_update || 0}/>
                {!isTyping && <span className="preview">
                    {dialog.preview_me && <span className="status">
                        {this.getStatus(dialog.topmessageid || 0, dialog.readoutboxmaxid || 0)}
                    </span>}
                    {dialog.preview}
                </span>}
                {isTyping && <span className="preview">is typing...</span>}
                {(dialog.unreadcount && dialog.unreadcount > 0) ? (
                    <span className="unread">{dialog.unreadcount > 99 ? '+99' : dialog.unreadcount}</span>) : ''}
            </div>
        );
    }

    private getStatus(id: number, readId: number) {
        if (id < 0) {
            return (<ScheduleRounded className="icon"/>);
        } else if (id > 0 && readId >= id) {
            return (<DoneAllRounded className="icon"/>);
        } else if (id > 0 && readId < id) {
            return (<DoneRounded className="icon"/>);
        } else {
            return '';
        }
    }

    private handleTypingTimeout = () => {
        clearTimeout(this.isTypingTimout);
        if (this.state.isTyping) {
            this.isTypingTimout = setTimeout(() => {
                this.setState({
                    isTyping: false,
                });
                if (this.props.isTyping) {
                    this.props.cancelIsTyping(this.state.dialog.peerid || '');
                }
            }, 5000);
        }
    }
}

export default DialogMessage;
