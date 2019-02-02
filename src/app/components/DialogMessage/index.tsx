/*
    Creation Time: 2018 - Sep - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import UserAvatar from '../UserAvatar';
import UserName from '../UserName';
import {IDialog} from '../../repository/dialog/interface';
import LiveDate from '../LiveDate';
import {
    AlternateEmailRounded,
    DoneAllRounded,
    DoneRounded,
    MoreVert,
    NotificationsOffRounded,
    ScheduleRounded
} from '@material-ui/icons';
import {PeerNotifySettings, PeerType, TypingAction} from '../../services/sdk/messages/chat.core.types_pb';
import GroupAvatar from '../GroupAvatar';
import GroupName from '../GroupName';
import {C_MESSAGE_ACTION} from '../../repository/message/consts';
import {isMuted} from '../UserInfoMenu';
import {isEqual} from 'lodash';

import './style.css';

interface IProps {
    cancelIsTyping?: (id: string) => void;
    dialog: IDialog;
    isTyping: { [key: string]: { fn: any, action: TypingAction } };
    onContextMenuOpen: (e: any) => void;
}

interface IState {
    dialog: IDialog;
    isTyping: { [key: string]: { fn: any, action: TypingAction } };
}

class DialogMessage extends React.Component<IProps, IState> {
    private lastUpdate: number | undefined;
    private notifySetting: PeerNotifySettings.AsObject | undefined;
    private isTyping: { [key: string]: any };

    constructor(props: IProps) {
        super(props);

        this.state = {
            dialog: props.dialog,
            isTyping: props.isTyping,
        };
    }

    public componentDidMount() {
        //
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.dialog !== newProps.dialog || this.lastUpdate !== newProps.dialog.last_update || !isEqual(this.notifySetting, newProps.dialog.notifysettings)) {
            this.setState({
                dialog: newProps.dialog,
                isTyping: newProps.isTyping,
            });
            this.lastUpdate = newProps.dialog.last_update;
            this.notifySetting = newProps.dialog.notifysettings;
            this.isTyping = newProps.isTyping;
        } else if (!isEqual(this.isTyping, newProps.isTyping)) {
            this.setState({
                isTyping: newProps.isTyping,
            });
            this.isTyping = newProps.isTyping;
        }
    }

    public render() {
        const {dialog, isTyping} = this.state;
        const ids = Object.keys(isTyping);
        const muted = isMuted(dialog.notifysettings);
        return (
            <div
                className={'dialog-wrapper' + (muted ? ' muted' : '') + ((dialog.mentionedcount && dialog.mentionedcount > 0) ? ' has-mention' : '')}>
                {Boolean(dialog.peertype === PeerType.PEERUSER || dialog.peertype === PeerType.PEERSELF) &&
                <UserAvatar className="avatar" id={dialog.target_id || ''} noDetail={true}
                            savedMessages={dialog.saved_messages}/>}
                {Boolean(dialog.peertype === PeerType.PEERGROUP) &&
                <GroupAvatar className="avatar" id={dialog.target_id || ''}/>}
                <div className="dialog-top-bar">
                    {muted && <div className="muted-wrapper"><NotificationsOffRounded/></div>}
                    {Boolean(dialog.peertype === PeerType.PEERUSER || dialog.peertype === PeerType.PEERSELF) &&
                    <UserName className="name" id={dialog.target_id || ''} noDetail={true} you={dialog.saved_messages}
                              youPlaceholder="Saved Messages"/>}
                    {Boolean(dialog.peertype === PeerType.PEERGROUP) &&
                    <GroupName className="name" id={dialog.target_id || ''}/>}
                    <LiveDate className="time" time={dialog.last_update || 0}/>
                </div>
                {Boolean(ids.length === 0) && <span className="preview">
                    {dialog.preview_me && <span className="status">
                        {this.getStatus(dialog.topmessageid || 0, dialog.readoutboxmaxid || 0)}
                    </span>}
                    {this.renderPreviewMessage(dialog)}
                </span>}
                {isTypingRender(isTyping, dialog)}
                {(dialog.unreadcount && dialog.unreadcount > 0) ? (
                    <span className="unread">{dialog.unreadcount > 99 ? '+99' : dialog.unreadcount}</span>) : ''}
                {Boolean(dialog.mentionedcount && dialog.mentionedcount > 0) &&
                <span className="mention"><AlternateEmailRounded/></span>}
                <div className="more" onClick={this.props.onContextMenuOpen}>
                    <MoreVert/>
                </div>
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
                    <UserName id={dialog.sender_id || ''} onlyFirstName={true} you={true} noDetail={true}/>: </span>}
                    {dialog.preview}
                </span>
            );
        }
        switch (dialog.action_code) {
            case C_MESSAGE_ACTION.MessageActionContactRegistered:
                return (<span className="preview-message">
                    <UserName className="sender" id={dialog.sender_id || ''} noDetail={true}/> joined River</span>);
            case C_MESSAGE_ACTION.MessageActionGroupCreated:
                return (<span className="preview-message"><UserName className="sender" id={dialog.sender_id || ''}
                                                                    you={true} onlyFirstName={true} noDetail={true}/> created the Group</span>);
            case C_MESSAGE_ACTION.MessageActionGroupAddUser:
                if (!dialog.action_data) {
                    return (<span className="preview-message">
                        <UserName className="sender" id={dialog.sender_id || ''} you={true} onlyFirstName={true}
                                  noDetail={true}/> added a User</span>);
                } else {
                    return (<span className="preview-message">
                        <UserName className="sender" id={dialog.sender_id || ''}
                                  you={true} onlyFirstName={true}
                                  noDetail={true}/> added {dialog.action_data.useridsList.map((id: string, index: number) => {
                        return (
                            <span key={index}>
                                {index !== 0 ? ', ' : ''}
                                <UserName className="target-user" id={id} you={true} noDetail={true}/></span>
                        );
                    })}</span>);
                }
            case C_MESSAGE_ACTION.MessageActionGroupDeleteUser:
                if (!dialog.action_data) {
                    return (<span className="preview-message"><UserName className="sender" id={dialog.sender_id || ''}
                                                                        you={true} onlyFirstName={true}
                                                                        noDetail={true}/> removed a User</span>);
                } else {
                    if (dialog.action_data.useridsList.indexOf(dialog.sender_id) > -1) {
                        return (
                            <span className="preview-message"><UserName className="sender" id={dialog.sender_id || ''}
                                                                        you={true} onlyFirstName={true}
                                                                        noDetail={true}/> left</span>);
                    }
                    return (<span className="preview-message">
                    <UserName className="sender" id={dialog.sender_id || ''}
                              you={true} onlyFirstName={true}
                              noDetail={true}/> removed {dialog.action_data.useridsList.map((id: string, index: number) => {
                        return (
                            <span key={index}>
                            {index !== 0 ? ', ' : ''}
                                <UserName className="target-user" id={id} you={true} noDetail={true}/></span>
                        );
                    })}</span>);
                }
            case C_MESSAGE_ACTION.MessageActionGroupTitleChanged:
                if (!dialog.action_data) {
                    return (<span className="preview-message"><UserName className="sender" id={dialog.sender_id || ''}
                                                                        you={true} onlyFirstName={true}
                                                                        noDetail={true}/> changed the Title</span>);
                } else {
                    return (<span className="preview-message"><UserName className="sender" id={dialog.sender_id || ''}
                                                                        you={true} onlyFirstName={true}
                                                                        noDetail={true}/> changed the Title to '{dialog.action_data.grouptitle}'</span>);
                }
            case C_MESSAGE_ACTION.MessageActionClearHistory:
                return (<span className="preview-message">History cleared</span>);
            case C_MESSAGE_ACTION.MessageActionGroupPhotoChanged:
                return (<span className="preview-message"><UserName className="sender" id={dialog.sender_id || ''}
                                                                    you={true} onlyFirstName={true}
                                                                    noDetail={true}/> changed the Group Photo</span>);
            default:
                return (<span className="preview-message">{dialog.preview}</span>);
        }
    }
}

export const isTypingRender = (typingList: { [key: string]: { fn: any, action: TypingAction } }, dialog: IDialog) => {
    const ids = Object.keys(typingList);
    if (ids.length === 0) {
        return '';
    }
    const getActionType = (action: number) => {
        switch (action) {
            default:
            case TypingAction.TYPINGACTIONTYPING:
                return 'typing...';
            case TypingAction.TYPINGACTIONRECORDINGVOICE:
                return 'recording voice...';
            case TypingAction.TYPINGACTIONUPLOADING:
                return 'uploading file...';
        }
    };
    if (dialog.peertype === PeerType.PEERUSER) {
        return (<span className="preview">is {getActionType(typingList[ids[0]].action)}</span>);
    } else {
        const types = {};
        let distinct = 0;
        ids.forEach((id) => {
            if (!types.hasOwnProperty(typingList[id].action)) {
                types[typingList[id].action] = 1;
                distinct++;
            } else {
                types[typingList[id].action]++;
            }
        });
        return (<span className="preview">
                {ids.slice(0, 2).map((id, index) => {
                    return (<span key={index}>
                        {index !== 0 ? (ids.length - 1 === index ? ' & ' : ', ') : ''}
                        <UserName id={id} onlyFirstName={true}/>
                    </span>);
                })}
            {Boolean(ids.length > 2) && <span> & {ids.length - 2} more</span>}
            {ids.length === 1 ? ' is ' : ' are '}
            {distinct > 1 ? ' doing ...' : getActionType(typingList[ids[0]].action)}
            </span>);
    }
};

export default DialogMessage;
