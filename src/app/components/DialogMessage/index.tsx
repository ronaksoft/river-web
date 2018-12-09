import * as React from 'react';
import UserAvatar from '../UserAvatar';
import UserName from '../UserName';
import {IDialog} from '../../repository/dialog/interface';
import LiveDate from '../LiveDate';
import {DoneAllRounded, DoneRounded, ScheduleRounded} from '@material-ui/icons';
import {PeerType} from '../../services/sdk/messages/core.types_pb';
import GroupAvatar from '../GroupAvatar';
import GroupName from '../GroupName';
import {C_MESSAGE_ACTION} from '../../repository/message/consts';

import './style.css';

interface IProps {
    cancelIsTyping?: (id: string) => void;
    dialog: IDialog;
    isTyping: { [key: string]: any };
}

interface IState {
    dialog: IDialog;
    isTyping: { [key: string]: any };
}

class DialogMessage extends React.Component<IProps, IState> {
    // private isTypingTimout: any = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            dialog: props.dialog,
            isTyping: props.isTyping,
        };
    }

    public componentDidMount() {
        // this.handleTypingTimeout();
    }

    public componentWillReceiveProps(newProps: IProps) {
        // if (this.state.dialog === newProps.dialog) {
        //     return;
        // }
        this.setState({
            dialog: newProps.dialog,
            isTyping: newProps.isTyping,
        }, () => {
            // this.handleTypingTimeout();
        });
    }

    public render() {
        const {dialog, isTyping} = this.state;
        const ids = Object.keys(isTyping);
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
                {Boolean(ids.length === 0) && <span className="preview">
                    {dialog.preview_me && <span className="status">
                        {this.getStatus(dialog.topmessageid || 0, dialog.readoutboxmaxid || 0)}
                    </span>}
                    {this.renderPreviewMessage(dialog)}
                </span>}
                {isTypingRender(ids, dialog)}
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

    private renderPreviewMessage(dialog: IDialog) {
        if (dialog.action_code === C_MESSAGE_ACTION.MessageActionNope) {
            return (
                <span className="preview-message">
                    {Boolean(dialog.peertype === PeerType.PEERGROUP && dialog.sender_id) && <span className="sender">
                    <UserName id={dialog.sender_id || ''} onlyFirstName={true} you={true}/>: </span>}
                    {dialog.preview}
                </span>
            );
        }
        switch (dialog.action_code) {
            case C_MESSAGE_ACTION.MessageActionContactRegistered:
                return (<span className="preview-message">
                    <UserName className="sender" id={dialog.sender_id || ''}/> joined River</span>);
            case C_MESSAGE_ACTION.MessageActionGroupCreated:
                return (<span className="preview-message"><UserName className="sender" id={dialog.sender_id || ''}
                                                                    you={true} onlyFirstName={true}/> created the Group</span>);
            case C_MESSAGE_ACTION.MessageActionGroupAddUser:
                if (!dialog.action_data) {
                    return (<span className="preview-message">
                        <UserName className="sender" id={dialog.sender_id || ''} you={true} onlyFirstName={true}/> added a User</span>);
                } else {
                    return (<span className="preview-message">
                        <UserName className="sender" id={dialog.sender_id || ''}
                                  you={true}
                                  onlyFirstName={true}/> added {dialog.action_data.useridsList.map((id: string, index: number) => {
                        return (
                            <span key={index}>
                                {index !== 0 ? ', ' : ''}
                                <UserName className="target-user" id={id} you={true}/></span>
                        );
                    })}</span>);
                }
            case C_MESSAGE_ACTION.MessageActionGroupDeleteUser:
                if (!dialog.action_data) {
                    return (<span className="preview-message"><UserName className="sender" id={dialog.sender_id || ''}
                                                                        you={true} onlyFirstName={true}/> removed a User</span>);
                } else {
                    if (dialog.action_data.useridsList.indexOf(dialog.sender_id) > -1) {
                        return (
                            <span className="preview-message"><UserName className="sender" id={dialog.sender_id || ''}
                                                                        you={true} onlyFirstName={true}/> left</span>);
                    }
                    return (<span className="preview-message">
                    <UserName className="sender" id={dialog.sender_id || ''}
                              you={true}
                              onlyFirstName={true}/> removed {dialog.action_data.useridsList.map((id: string, index: number) => {
                        return (
                            <span key={index}>
                            {index !== 0 ? ', ' : ''}
                                <UserName className="target-user" id={id} you={true}/></span>
                        );
                    })}</span>);
                }
            case C_MESSAGE_ACTION.MessageActionGroupTitleChanged:
                if (!dialog.action_data) {
                    return (<span className="preview-message"><UserName className="sender" id={dialog.sender_id || ''}
                                                                        you={true} onlyFirstName={true}/> changed the Title</span>);
                } else {
                    return (<span className="preview-message"><UserName className="sender" id={dialog.sender_id || ''}
                                                                        you={true} onlyFirstName={true}/> changed the Title to '{dialog.action_data.grouptitle}'</span>);
                }
            default:
                return (<span className="preview-message">{dialog.preview}</span>);
        }
    }
}

export const isTypingRender = (ids: string[], dialog: IDialog) => {
    if (ids.length === 0) {
        return '';
    }
    if (dialog.peertype === PeerType.PEERUSER) {
        return (<span className="preview">is typing...</span>);
    } else {
        return (<span className="preview">
                {ids.slice(0, 2).map((id, index) => {
                    return (<span key={index}>
                        {index !== 0 ? (ids.length - 1 === index ? ' & ' : ', ') : ''}
                        <UserName id={id} onlyFirstName={true}/>
                    </span>);
                })}
            {Boolean(ids.length > 2) && <span> & {ids.length - 2} more</span>}
            {ids.length === 1 ? ' is ' : ' are '}
            typing...
            </span>);
    }
};

export default DialogMessage;
