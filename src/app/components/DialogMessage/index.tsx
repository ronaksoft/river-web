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
    AlternateEmailRounded, DoneAllRounded, DoneRounded, InsertDriveFileOutlined, LocationOnOutlined, MoreVert,
    MusicNoteOutlined, NotificationsOffRounded, PeopleOutlined, PhotoOutlined, RecordVoiceOverOutlined, ScheduleRounded,
    VideocamOutlined, ForwardOutlined, ReplyOutlined, AddRounded,
} from '@material-ui/icons';
import {PeerNotifySettings, PeerType, TypingAction} from '../../services/sdk/messages/chat.core.types_pb';
import GroupAvatar from '../GroupAvatar';
import GroupName from '../GroupName';
import {C_MESSAGE_ACTION} from '../../repository/message/consts';
import {isMuted} from '../UserInfoMenu';
import {isEqual} from 'lodash';
import {C_MESSAGE_ICON} from '../Dialog/utils';
import i18n from '../../services/i18n';
import {localize} from '../../services/utilities/localize';
import sdk from '../../services/sdk';
import {Link} from "react-router-dom";
import LabelRepo from "../../repository/label";
import {IUser} from "../../repository/user/interface";

import './style.scss';

interface IProps {
    cancelIsTyping?: (id: string) => void;
    dialog: IDialog;
    isTyping: { [key: string]: { fn: any, action: TypingAction } };
    onContextMenuOpen?: (e: any) => void;
    onClick?: (e: any) => void;
    selectedId: string;
    messageId?: number;
}

interface IState {
    dialog: IDialog;
    isBot: boolean;
    isTyping: { [key: string]: { fn: any, action: TypingAction } };
    selectedId: string;
}

class DialogMessage extends React.Component<IProps, IState> {
    private lastUpdate: number | undefined;
    private notifySetting: PeerNotifySettings.AsObject | undefined;
    private isTyping: { [key: string]: any } = {};
    private readonly userId: string;
    private labelColors = LabelRepo.labelColors;

    constructor(props: IProps) {
        super(props);

        this.state = {
            dialog: props.dialog,
            isBot: false,
            isTyping: props.isTyping,
            selectedId: props.selectedId,
        };

        this.userId = sdk.getInstance().getConnInfo().UserID || '';
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.dialog !== newProps.dialog || this.lastUpdate !== newProps.dialog.last_update || !isEqual(this.notifySetting, newProps.dialog.notifysettings)) {
            this.setState({
                dialog: newProps.dialog,
                isBot: false,
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
        if (this.state.selectedId !== newProps.selectedId) {
            this.setState({
                selectedId: newProps.selectedId,
            });
        }
    }

    public render() {
        const {messageId} = this.props;
        const {dialog, isTyping, selectedId} = this.state;
        const ids = Object.keys(isTyping);
        const muted = isMuted(dialog.notifysettings);
        const hasCounter = Boolean(dialog.unreadcount && dialog.unreadcount > 0 && dialog.readinboxmaxid !== dialog.topmessageid && !dialog.preview_me);
        const hasMention = Boolean(dialog.mentionedcount && dialog.mentionedcount > 0 && dialog.readinboxmaxid !== dialog.topmessageid && !dialog.preview_me);
        const labelIds = dialog.label_ids || [];
        let labelCnt = 0;
        return (
            <Link className="dialog-a" onClick={this.props.onClick}
                  to={messageId ? `/chat/${dialog.peerid}/${messageId}` : `/chat/${dialog.peerid}`}>
                <div
                    className={'dialog' + (dialog.peerid === selectedId ? ' active' : '') + (dialog.pinned ? ' pinned' : '')}
                    onDragEnter={this.dragEnterHandler} onDragLeave={this.dragLeaveHandler}
                >
                    <div
                        className={'dialog-wrapper' + (muted ? ' muted' : '') + (hasMention ? ' has-mention' : '')}>
                        {Boolean(dialog.peertype === PeerType.PEERUSER || dialog.peertype === PeerType.PEERSELF) &&
                        <UserAvatar className="avatar" id={dialog.peerid || ''} noDetail={true}
                                    savedMessages={dialog.saved_messages} onlineIndicator={selectedId !== ''}/>}
                        {Boolean(dialog.peertype === PeerType.PEERGROUP) &&
                        <GroupAvatar className="avatar" id={dialog.peerid || ''}/>}
                        <div className="dialog-top-bar">
                            {muted && <div className="muted-wrapper"><NotificationsOffRounded/></div>}
                            {Boolean(dialog.peertype === PeerType.PEERUSER || dialog.peertype === PeerType.PEERSELF) &&
                            <UserName className="name" id={dialog.peerid || ''} noDetail={true}
                                      you={dialog.saved_messages} onLoad={this.userNameLoadHandler}
                                      youPlaceholder="Saved Messages"/>}
                            {Boolean(dialog.peertype === PeerType.PEERGROUP) &&
                            <GroupName className="name" id={dialog.peerid || ''}/>}
                            {dialog.preview_me && <span
                                className="status">{this.getStatus(dialog.topmessageid || 0, dialog.readoutboxmaxid || 0, dialog.peerid || '')}</span>}
                            {dialog.last_update && <LiveDate className="time" time={dialog.last_update || 0}/>}
                        </div>
                        {Boolean(ids.length === 0) && <span
                            className={'preview ' + (dialog.preview_rtl ? 'rtl' : 'ltr')}>{this.renderPreviewMessage(dialog)}</span>}
                        {isTypingRender(isTyping, dialog.peertype || PeerType.PEERUSER)}
                        {hasCounter && <span
                            className="unread">{(dialog.unreadcount || 0) > 99 ? localize('+99') : localize(dialog.unreadcount || 0)}</span>}
                        {Boolean(!hasCounter && dialog.pinned) &&
                        this.getPinIcon()}
                        {hasMention && <span className="mention"><AlternateEmailRounded/></span>}
                        {Boolean(dialog.only_contact !== true) &&
                        <div className="more" onClick={this.props.onContextMenuOpen}>
                            <MoreVert/>
                        </div>}
                        {Boolean(labelIds.length > 0) &&
                        <div className={'message-label ' + (labelIds.length > 1 ? 'single-label' : 'many-label')}>
                            {labelIds.slice(0, 3).map((id, key) => {
                                if (this.labelColors.hasOwnProperty(id)) {
                                    return (<div key={id} className={`circle-label label-${labelCnt++}`}
                                                 style={{backgroundColor: this.labelColors[id]}}>
                                        {key === 0 && labelIds.length > 3 ? <AddRounded/> : ''}
                                    </div>);
                                }
                                return '';
                            })}
                        </div>}
                    </div>
                </div>
            </Link>
        );
    }

    private getStatus(id: number, readId: number, peerId: string) {
        const forceDoubleTick = peerId === this.userId || this.state.isBot;
        if (id < 0) {
            return (<ScheduleRounded className="icon"/>);
        } else if ((id > 0 && readId >= id) || forceDoubleTick) {
            return (<DoneAllRounded className="icon"/>);
        } else if (id > 0 && readId < id) {
            return (<DoneRounded className="icon"/>);
        } else {
            return '';
        }
    }

    private getPinIcon() {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24"
                 fill="none" xmlns="http://www.w3.org/2000/svg" className="pin">
                <path fillRule="evenodd" clipRule="evenodd"
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM14.4619 6.25483L17.7444 9.50793C17.863 9.62542 17.863 9.81598 17.7444 9.9336L17.7305 9.94738C17.5293 10.1469 17.2617 10.2568 16.977 10.2568C16.7936 10.2568 16.6177 10.2106 16.4617 10.1248L13.5141 13.5286C13.7489 13.7891 13.8776 14.1216 13.8776 14.4738C13.8776 14.8533 13.7285 15.2101 13.4577 15.4784L13.4371 15.4988C13.3779 15.5576 13.3001 15.5869 13.2224 15.5869C13.1447 15.5869 13.067 15.5576 13.0077 15.4988L11.1466 13.6543L9.2345 15.5493C9.19205 15.5902 8.2579 16.4887 7.51463 17.0794C6.80228 17.6454 6.67559 17.7545 6.67055 17.7589C6.6131 17.8087 6.54167 17.8333 6.47043 17.8333C6.39227 17.8333 6.31435 17.8036 6.25525 17.7448C6.14247 17.6325 6.13664 17.4531 6.24201 17.3342C6.24784 17.3275 6.36008 17.199 6.92764 16.4976C7.52362 15.7609 8.43014 14.8351 8.46846 14.796L10.3836 12.898L8.4172 10.9491C8.29859 10.8317 8.29859 10.6411 8.4172 10.5236L8.43779 10.5032C8.70848 10.2349 9.06845 10.0871 9.45138 10.0871C9.80674 10.0871 10.1422 10.2145 10.4051 10.4473L13.8396 7.52607C13.7531 7.37144 13.7065 7.19706 13.7065 7.01535C13.7065 6.73329 13.8174 6.46803 14.0186 6.26862L14.0326 6.25483C14.151 6.13728 14.3434 6.13728 14.4619 6.25483Z"
                      fill="#C6C6C6"/>
            </svg>);
    }

    private getIcon(icon?: number) {
        switch (icon) {
            case C_MESSAGE_ICON.Location:
                return (<LocationOnOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.File:
                return (<InsertDriveFileOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.Video:
                return (<VideocamOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.Contact:
                return (<PeopleOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.Voice:
                return (<RecordVoiceOverOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.Photo:
                return (<PhotoOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.Audio:
                return (<MusicNoteOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.Forwarded:
                return (<ForwardOutlined className="preview-icon"/>);
            case C_MESSAGE_ICON.Reply:
                return (<ReplyOutlined className="preview-icon"/>);
            default:
                return '';
        }
    }

    private renderPreviewMessage(dialog: IDialog) {
        if (dialog.draft && dialog.draft.peerid) {
            return (
                <span className="preview-message draft-message">
                    <span className="preview-inner"><span
                        className="red-font">{i18n.t('message.draft')}</span>&nbsp;{dialog.draft.body}</span>
                </span>
            );
        }
        if (dialog.action_code === C_MESSAGE_ACTION.MessageActionNope) {
            return (
                <span className="preview-message">
                    {Boolean(dialog.peertype === PeerType.PEERGROUP && dialog.sender_id) && <span className="sender">
                    <UserName id={dialog.sender_id || ''} onlyFirstName={true} you={true} noDetail={true} noIcon={true}
                              postfix=":"/>&nbsp;</span>}
                    {this.getIcon(dialog.preview_icon)}<span
                    className="preview-inner">{dialog.preview}</span>
                </span>
            );
        }
        switch (dialog.action_code) {
            case C_MESSAGE_ACTION.MessageActionContactRegistered:
                return (<span className="preview-message system-message">
                    <UserName className="sender" id={dialog.sender_id || ''}
                              noDetail={true} noIcon={true}/> {i18n.t('message.joined_river')}</span>);
            case C_MESSAGE_ACTION.MessageActionGroupCreated:
                return (<span className="preview-message system-message">
                    <UserName className="sender"
                              id={dialog.sender_id || ''}
                              you={true} onlyFirstName={true} noIcon={true}
                              noDetail={true}/> {i18n.t('message.created_the_group')}</span>);
            case C_MESSAGE_ACTION.MessageActionGroupAddUser:
                if (!dialog.action_data) {
                    return (<span className="preview-message system-message">
                        <UserName className="sender" id={dialog.sender_id || ''} you={true} onlyFirstName={true}
                                  noIcon={true} noDetail={true}/> {i18n.t('message.added_a_user')}</span>);
                } else {
                    return (<span className="preview-message system-message">
                        <UserName className="sender" id={dialog.sender_id || ''}
                                  you={true} onlyFirstName={true} noIcon={true}
                                  noDetail={true}/> {i18n.t('message.added')} {dialog.action_data.useridsList.map((id: string, index: number) => {
                        return (
                            <span key={index}>
                                {index !== 0 ? ', ' : ''}
                                <UserName className="target-user" id={id} you={true} noDetail={true}
                                          noIcon={true}/></span>
                        );
                    })}</span>);
                }
            case C_MESSAGE_ACTION.MessageActionGroupDeleteUser:
                if (!dialog.action_data) {
                    return (<span className="preview-message system-message">
                        <UserName className="sender"
                                  id={dialog.sender_id || ''}
                                  you={true} onlyFirstName={true} noIcon={true}
                                  noDetail={true}/> {i18n.t('message.removed_a_user')}</span>);
                } else {
                    if (dialog.action_data.useridsList.indexOf(dialog.sender_id) > -1) {
                        return (
                            <span className="preview-message system-message">
                                <UserName className="sender"
                                          id={dialog.sender_id || ''}
                                          you={true} onlyFirstName={true} noIcon={true}
                                          noDetail={true}/> {i18n.t('message.left')}</span>);
                    }
                    return (<span className="preview-message system-message">
                    <UserName className="sender" id={dialog.sender_id || ''}
                              you={true} onlyFirstName={true} noIcon={true}
                              noDetail={true}/> {i18n.t('message.removed')} {dialog.action_data.useridsList.map((id: string, index: number) => {
                        return (
                            <span key={index}>
                            {index !== 0 ? ', ' : ''}
                                <UserName className="target-user" id={id} you={true} noDetail={true}
                                          noIcon={true}/></span>
                        );
                    })}</span>);
                }
            case C_MESSAGE_ACTION.MessageActionGroupTitleChanged:
                if (!dialog.action_data) {
                    return (<span className="preview-message system-message">
                        <UserName className="sender"
                                  id={dialog.sender_id || ''} you={true} onlyFirstName={true} noIcon={true}
                                  noDetail={true}/> {i18n.t('message.changed_the_title')}</span>);
                } else {
                    return (<span className="preview-message system-message">
                        <UserName className="sender"
                                  id={dialog.sender_id || ''} you={true} onlyFirstName={true} noIcon={true}
                                  noDetail={true}/> {i18n.tf('message.changed_the_title_to', dialog.action_data.grouptitle)}</span>);
                }
            case C_MESSAGE_ACTION.MessageActionClearHistory:
                return (<span className="preview-message system-message">{i18n.t('message.history_cleared')}</span>);
            case C_MESSAGE_ACTION.MessageActionGroupPhotoChanged:
                if (!dialog.action_data) {
                    return (<span className="preview-message system-message">
                        <UserName className="sender"
                                  id={dialog.sender_id || ''} you={true} onlyFirstName={true} noIcon={true}
                                  noDetail={true}/> {i18n.t('message.removed_the_group_photo')}</span>);
                } else {
                    return (<span className="preview-message system-message">
                        <UserName className="sender"
                                  id={dialog.sender_id || ''} you={true} onlyFirstName={true} noIcon={true}
                                  noDetail={true}/> {i18n.t('message.changed_the_group_photo')}</span>);
                }
            default:
                return (<span className="preview-message">{this.getIcon(dialog.preview_icon)}<span
                    className="preview-inner">{dialog.preview}</span></span>);
        }
    }

    private userNameLoadHandler = (user?: IUser) => {
        if (user) {
            this.setState({
                isBot: user.isbot || false,
            });
        }
    }

    private dragEnterHandler = (e: any) => {
        // e.currentTarget.style.cursor = 'copy';
    }

    private dragLeaveHandler = (e: any) => {
        // e.currentTarget.style.cursor = 'default';
        // e.dataTransfer.dropEffect = "copy";
    }
}

export const isTypingRender = (typingList: { [key: string]: { fn: any, action: TypingAction } }, peerType: PeerType) => {
    const ids = Object.keys(typingList);
    if (ids.length === 0) {
        return '';
    }
    const getActionType = (action: number) => {
        switch (action) {
            default:
            case TypingAction.TYPINGACTIONTYPING:
                return i18n.t('status.typing');
            case TypingAction.TYPINGACTIONRECORDINGVOICE:
                return i18n.t('status.recording_voice');
            case TypingAction.TYPINGACTIONUPLOADING:
                return i18n.t('status.uploading_file');
        }
    };
    if (peerType === PeerType.PEERUSER) {
        return (<span className="preview">{i18n.t('general.is')} {getActionType(typingList[ids[0]].action)}</span>);
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
                        <UserName id={id} onlyFirstName={true} noIcon={true}/>
                    </span>);
                })}
            {Boolean(ids.length > 2) && <span> & {ids.length - 2} more</span>}
            {ids.length === 1 ? ` ${i18n.t('general.is')} ` : ` ${i18n.t('general.are')} `}
            {distinct > 1 ? ` ${i18n.t('status.doing')}` : getActionType(typingList[ids[0]].action)}
            </span>);
    }
};

export default DialogMessage;
