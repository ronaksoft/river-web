/*
    Creation Time: 2018 - Sep - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import React, {useState} from 'react';
import UserAvatar from '../UserAvatar';
import UserName from '../UserName';
import {IDialog} from '../../repository/dialog/interface';
import LiveDate from '../LiveDate';
import {
    AlternateEmailRounded,
    DoneAllRounded,
    DoneRounded,
    ForwardOutlined,
    GifOutlined,
    InsertDriveFileOutlined,
    LocationOnOutlined,
    MoreVertRounded,
    MusicNoteOutlined,
    NotificationsOffRounded,
    PeopleOutlined,
    PhotoOutlined,
    RecordVoiceOverOutlined,
    ReplyOutlined,
    ScheduleRounded,
    VideocamOutlined,
    PlayArrowRounded,
    CallRounded,
    CallEndRounded,
} from '@material-ui/icons';
import {PeerType, TypingAction} from '../../services/sdk/messages/core.types_pb';
import GroupAvatar from '../GroupAvatar';
import GroupName from '../GroupName';
import {C_MESSAGE_ACTION} from '../../repository/message/consts';
import {isMuted} from '../UserInfoMenu';
import {C_MESSAGE_ICON} from '../Dialog/utils';
import i18n from '../../services/i18n';
import {localize} from '../../services/utilities/localize';
import {currentUserId} from '../../services/sdk';
import {Link} from "react-router-dom";
import {IUser} from "../../repository/user/interface";
import {GetPeerName} from "../../repository/dialog";
import {Doing} from "../SVG/doing";

import './style.scss';

export const getMessageIcon = (icon: number | undefined, tinyThumb?: string) => {
    if (tinyThumb) {
        return <>
            <div className="tiny-thumb">
                <img src={`data:image/jpeg;base64,${tinyThumb}`} alt=""/>
                {icon === C_MESSAGE_ICON.Video &&
                <div className="inner-cover"><PlayArrowRounded className="inner-icon"/></div>}
                {icon === C_MESSAGE_ICON.Audio &&
                <div className="inner-cover"><MusicNoteOutlined className="inner-icon"/></div>}
            </div>
            {icon === C_MESSAGE_ICON.GIF && <GifOutlined className="preview-icon gif"/>}
        </>;
    }
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
        case C_MESSAGE_ICON.GIF:
            return (<GifOutlined className="preview-icon gif"/>);
        case C_MESSAGE_ICON.Forwarded:
            return (<ForwardOutlined className="preview-icon"/>);
        case C_MESSAGE_ICON.Reply:
            return (<ReplyOutlined className="preview-icon"/>);
        default:
            return null;
    }
};

interface IProps {
    cancelIsTyping?: (id: string) => void;
    dialog: IDialog;
    isTyping: { [key: string]: { fn: any, action: TypingAction } };
    onContextMenuOpen?: (e: any) => void;
    onClick?: (e: any) => void;
    selectedPeerName: string;
    messageId?: number;
    onDrop?: (peerId: string, files: File[], hasData: boolean) => void;
}

const RenderPreviewMessage = ({dialog}: { dialog: IDialog }) => {
    if (dialog.draft && dialog.draft.peerid) {
        return (
            <span className="preview-message draft-message">
                <span className="preview-inner">
                    <span className="red-font">{i18n.t('message.draft')}</span>
                    &nbsp;{dialog.draft.body}
                </span>
            </span>
        );
    }
    if (dialog.action_code === C_MESSAGE_ACTION.MessageActionNope) {
        return (
            <span className="preview-message">
                {Boolean(dialog.peertype === PeerType.PEERGROUP && dialog.sender_id) && <span className="sender">
                    <UserName id={dialog.sender_id || ''} onlyFirstName={true} you={true}
                              noDetail={true} noIcon={true} postfix=":"/>&nbsp;
                </span>}
                {getMessageIcon(dialog.preview_icon, dialog.tiny_thumb)}
                {dialog.preview_icon !== C_MESSAGE_ICON.GIF &&
                <span className="preview-inner">{dialog.preview}</span>}
            </span>
        );
    }
    switch (dialog.action_code) {
        case C_MESSAGE_ACTION.MessageActionContactRegistered:
            return (<span className="preview-message system-message">
                    <UserName className="sender" id={dialog.sender_id || ''}
                              noDetail={true} noIcon={true} postfix=" "/> {i18n.t('message.joined_river')}</span>);
        case C_MESSAGE_ACTION.MessageActionGroupCreated:
            return (<span className="preview-message system-message">
                    <UserName className="sender"
                              id={dialog.sender_id || ''}
                              you={true} onlyFirstName={true} noIcon={true}
                              noDetail={true} postfix=" "/> {i18n.t('message.created_the_group')}</span>);
        case C_MESSAGE_ACTION.MessageActionGroupAddUser:
            if (!dialog.action_data) {
                return (<span className="preview-message system-message">
                        <UserName className="sender" id={dialog.sender_id || ''} you={true} onlyFirstName={true}
                                  noIcon={true} noDetail={true} postfix=" "/> {i18n.t('message.added_a_user')}</span>);
            } else {
                return (<span className="preview-message system-message">
                        <UserName className="sender" id={dialog.sender_id || ''}
                                  you={true} onlyFirstName={true} noIcon={true} postfix=" "
                                  noDetail={true}/> {i18n.t('message.added')} {dialog.action_data.useridsList.map((id: string, index: number) => {
                    return (<span key={index}>{index !== 0 ? ', ' : ''}
                        <UserName className="target-user" id={id} you={true} noDetail={true} postfix=" " noIcon={true}/>
                    </span>);
                })}</span>);
            }
        case C_MESSAGE_ACTION.MessageActionGroupDeleteUser:
            if (!dialog.action_data) {
                return (<span className="preview-message system-message">
                        <UserName className="sender"
                                  id={dialog.sender_id || ''}
                                  you={true} onlyFirstName={true} noIcon={true} postfix=" "
                                  noDetail={true}/> {i18n.t('message.removed_a_user')}</span>);
            } else {
                if (dialog.action_data.useridsList.indexOf(dialog.sender_id) > -1) {
                    return (
                        <span className="preview-message system-message">
                                <UserName className="sender"
                                          id={dialog.sender_id || ''} postfix=" "
                                          you={true} onlyFirstName={true} noIcon={true}
                                          noDetail={true}/> {i18n.t('message.left')}</span>);
                }
                return (<span className="preview-message system-message">
                    <UserName className="sender" id={dialog.sender_id || ''}
                              you={true} onlyFirstName={true} noIcon={true} postfix=" "
                              noDetail={true}/> {i18n.t('message.removed')} {dialog.action_data.useridsList.map((id: string, index: number) => {
                    return (
                        <span key={index}>
                            {index !== 0 ? ', ' : ''}
                            <UserName className="target-user" id={id} you={true} noDetail={true} postfix=" "
                                      noIcon={true}/></span>
                    );
                })}</span>);
            }
        case C_MESSAGE_ACTION.MessageActionGroupTitleChanged:
            if (!dialog.action_data) {
                return (<span className="preview-message system-message">
                        <UserName className="sender"
                                  id={dialog.sender_id || ''} you={true} onlyFirstName={true} noIcon={true} postfix=" "
                                  noDetail={true}/> {i18n.t('message.changed_the_title')}</span>);
            } else {
                return (<span className="preview-message system-message">
                        <UserName className="sender"
                                  id={dialog.sender_id || ''} you={true} onlyFirstName={true} noIcon={true} postfix=" "
                                  noDetail={true}/> {i18n.tf('message.changed_the_title_to', dialog.action_data.grouptitle)}</span>);
            }
        case C_MESSAGE_ACTION.MessageActionClearHistory:
            return (<span className="preview-message system-message bold">{i18n.t('message.history_cleared')}</span>);
        case C_MESSAGE_ACTION.MessageActionGroupPhotoChanged:
            if (!dialog.action_data) {
                return (<span className="preview-message system-message">
                        <UserName className="sender"
                                  id={dialog.sender_id || ''} you={true} onlyFirstName={true} noIcon={true} postfix=" "
                                  noDetail={true}/> {i18n.t('message.removed_the_group_photo')}</span>);
            } else {
                return (<span className="preview-message system-message">
                        <UserName className="sender"
                                  id={dialog.sender_id || ''} you={true} onlyFirstName={true} noIcon={true} postfix=" "
                                  noDetail={true}/> {i18n.t('message.changed_the_group_photo')}</span>);
            }
        case C_MESSAGE_ACTION.MessageActionScreenShot:
            return (<span className="preview-message system-message">
                        <UserName className="sender"
                                  id={dialog.sender_id || ''} you={true} onlyFirstName={true} noIcon={true} postfix=" "
                                  noDetail={true}/> {i18n.t('message.took_an_screenshot')}</span>);
        case C_MESSAGE_ACTION.MessageActionCallStarted:
            return (<span className="preview-message system-message">
                <CallRounded className="preview-icon"/>{i18n.t('message.call_from')}
                <UserName className="sender postfix" id={dialog.sender_id || ''} you={true} onlyFirstName={true}
                          noIcon={true} prefix=" " noDetail={true}/>
            </span>);
        case C_MESSAGE_ACTION.MessageActionCallEnded:
            return (<span className="preview-message system-message">
                <CallEndRounded className="preview-icon"/>{i18n.t('message.call_ended')}
            </span>);
        case C_MESSAGE_ACTION.MessageActionEmptyDialog:
            return (<span className="preview-message system-message bold">{i18n.t('message.no_message')}</span>);
        default:
            return (<span className="preview-message">
                {getMessageIcon(dialog.preview_icon, dialog.tiny_thumb)}
                {dialog.preview_icon !== C_MESSAGE_ICON.GIF &&
                <span className="preview-inner">{dialog.preview}</span>}
            </span>);
    }
};

const PinIcon = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24"
             fill="none" xmlns="http://www.w3.org/2000/svg" className="pin">
            <path fillRule="evenodd" clipRule="evenodd"
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM14.4619 6.25483L17.7444 9.50793C17.863 9.62542 17.863 9.81598 17.7444 9.9336L17.7305 9.94738C17.5293 10.1469 17.2617 10.2568 16.977 10.2568C16.7936 10.2568 16.6177 10.2106 16.4617 10.1248L13.5141 13.5286C13.7489 13.7891 13.8776 14.1216 13.8776 14.4738C13.8776 14.8533 13.7285 15.2101 13.4577 15.4784L13.4371 15.4988C13.3779 15.5576 13.3001 15.5869 13.2224 15.5869C13.1447 15.5869 13.067 15.5576 13.0077 15.4988L11.1466 13.6543L9.2345 15.5493C9.19205 15.5902 8.2579 16.4887 7.51463 17.0794C6.80228 17.6454 6.67559 17.7545 6.67055 17.7589C6.6131 17.8087 6.54167 17.8333 6.47043 17.8333C6.39227 17.8333 6.31435 17.8036 6.25525 17.7448C6.14247 17.6325 6.13664 17.4531 6.24201 17.3342C6.24784 17.3275 6.36008 17.199 6.92764 16.4976C7.52362 15.7609 8.43014 14.8351 8.46846 14.796L10.3836 12.898L8.4172 10.9491C8.29859 10.8317 8.29859 10.6411 8.4172 10.5236L8.43779 10.5032C8.70848 10.2349 9.06845 10.0871 9.45138 10.0871C9.80674 10.0871 10.1422 10.2145 10.4051 10.4473L13.8396 7.52607C13.7531 7.37144 13.7065 7.19706 13.7065 7.01535C13.7065 6.73329 13.8174 6.46803 14.0186 6.26862L14.0326 6.25483C14.151 6.13728 14.3434 6.13728 14.4619 6.25483Z"
                  fill="#C6C6C6"/>
        </svg>);
};

const GetStatus = ({id, readId, peerId, isBot, userId}: { id: number, readId: number, peerId: string, isBot: boolean, userId: string }) => {
    const forceDoubleTick = peerId === userId || isBot;
    if (id < 0) {
        return (<ScheduleRounded className="icon"/>);
    } else if ((id > 0 && readId >= id) || forceDoubleTick) {
        return (<DoneAllRounded className="icon"/>);
    } else if (id > 0 && readId < id) {
        return (<DoneRounded className="icon"/>);
    } else {
        return null;
    }
};

export const DialogMessage = ({cancelIsTyping, dialog, isTyping, onContextMenuOpen, onClick, selectedPeerName, messageId, onDrop}: IProps) => {
    const [isBot, setIsBot] = useState<boolean>(false);

    const userNameLoadHandler = (user?: IUser) => {
        if (user) {
            setIsBot(user.isbot || false);
        }
    };

    const dropHandler = (e: any) => {
        const files: File[] = [];
        let hasData = false;
        if (e.dataTransfer.items) {
            hasData = true;
            // Use DataTransferItemList interface to access the file(s)
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                if (e.dataTransfer.items[i].kind === 'file') {
                    const file = e.dataTransfer.items[i].getAsFile();
                    files.push(file);
                }
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
                files.push(e.dataTransfer.files[i]);
            }
        }
        if (onDrop) {
            onDrop(dialog.peerid || '', files, hasData);
        }
    };

    const ids = Object.keys(isTyping);
    const muted = isMuted(dialog.notifysettings);
    const hasCounter = Boolean(dialog.unreadcount && dialog.unreadcount > 0 && dialog.readinboxmaxid !== dialog.topmessageid && !dialog.preview_me);
    const hasMention = Boolean(dialog.mentionedcount && dialog.mentionedcount > 0 && dialog.readinboxmaxid !== dialog.topmessageid && !dialog.preview_me);
    const peerName = GetPeerName(dialog.peerid, dialog.peertype);
    return (
        <Link className="dialog-a" onClick={onClick} data-peerid={dialog.peerid}
              to={messageId ? `/chat/${dialog.teamid || '0'}/${peerName}/${messageId}` : `/chat/${dialog.teamid}/${dialog.peerid}_${dialog.peertype || 0}`}
              onDrop={dropHandler}
        >
            <div
                className={'dialog' + (peerName === selectedPeerName ? ' active' : '') + (dialog.pinned ? ' pinned' : '') + (muted ? ' muted' : '') + ((dialog.unreadcount || 0) > 0 ? ' has-unread' : '') + ((dialog.unreadcount || 0) > 99 ? ' has-many-unread' : '') + (hasMention ? ' has-mention' : '')}
            >
                <div className="dialog-wrapper">
                    {Boolean(dialog.peertype === PeerType.PEERUSER || dialog.peertype === PeerType.PEERSELF || dialog.peertype === PeerType.PEEREXTERNALUSER) &&
                    <UserAvatar className="avatar" id={dialog.peerid || ''} noDetail={true} peerType={dialog.peertype}
                                savedMessages={dialog.saved_messages} onlineIndicator={selectedPeerName !== ''}/>}
                    {Boolean(dialog.peertype === PeerType.PEERGROUP) &&
                    <GroupAvatar className="avatar" id={dialog.peerid || ''} teamId={dialog.teamid || '0'}/>}
                    {Boolean(dialog.activecallid && dialog.activecallid !== '0') && <div className="active-call">
                        <CallRounded/>
                    </div>}
                    <div className="dialog-top-bar">
                        {muted && <div className="muted-wrapper"><NotificationsOffRounded/></div>}
                        {Boolean(dialog.peertype === PeerType.PEERUSER || dialog.peertype === PeerType.PEERSELF || dialog.peertype === PeerType.PEEREXTERNALUSER) &&
                        <UserName className="name" id={dialog.peerid || ''} noDetail={true} peerType={dialog.peertype}
                                  you={dialog.saved_messages} onLoad={userNameLoadHandler}
                                  youPlaceholder={i18n.t('general.saved_messages')}/>}
                        {Boolean(dialog.peertype === PeerType.PEERGROUP) &&
                        <GroupName className="name" id={dialog.peerid || ''} teamId={dialog.teamid || '0'}/>}
                        {dialog.preview_me && dialog.action_code === C_MESSAGE_ACTION.MessageActionNope &&
                        <div className="status">
                            <GetStatus id={dialog.topmessageid || 0} isBot={isBot} readId={dialog.readoutboxmaxid || 0}
                                       userId={currentUserId} peerId={dialog.peerid || ''}/>
                        </div>}
                        {dialog.last_update && <LiveDate className="time" time={dialog.last_update || 0}/>}
                    </div>
                    {Boolean(ids.length === 0) && <div className={'preview ' + (dialog.preview_rtl ? 'rtl' : 'ltr')}>
                        <RenderPreviewMessage dialog={dialog}/>
                    </div>}
                    {isTypingRender(isTyping, dialog.peertype || PeerType.PEERUSER)}
                    {hasCounter && <div className="unread">
                        {(dialog.unreadcount || 0) > 99 ? localize('+99') : localize(dialog.unreadcount || 0)}
                    </div>}
                    {Boolean(!hasCounter && dialog.pinned) && <PinIcon/>}
                    {hasMention && <div className="mention"><AlternateEmailRounded/></div>}
                    {Boolean(dialog.only_contact !== true) &&
                    <div className="more" onClick={onContextMenuOpen}>
                        <MoreVertRounded/>
                    </div>}
                </div>
            </div>
        </Link>
    );
};

export const isTypingRender = (typingList: { [key: string]: { fn: any, action: TypingAction } }, peerType: PeerType, withAnimation?: boolean) => {
    const ids = Object.keys(typingList);
    if (ids.length === 0) {
        return null;
    }
    const getActionType = (action: number) => {
        switch (action) {
            default:
            case TypingAction.TYPINGACTIONTYPING:
                return i18n.t(withAnimation ? 'status.typing_2' : 'status.typing');
            case TypingAction.TYPINGACTIONRECORDINGVOICE:
                return i18n.t(withAnimation ? 'status.recording_voice_2' : 'status.recording_voice');
            case TypingAction.TYPINGACTIONUPLOADING:
                return i18n.t(withAnimation ? 'status.uploading_file_2' : 'status.uploading_file');
        }
    };
    if (peerType === PeerType.PEERUSER || peerType === PeerType.PEEREXTERNALUSER) {
        return (<span className={'preview' + (withAnimation ? ' with-animation' : '')}
        >{i18n.t('general.is')} {getActionType(typingList[ids[0]].action)}{withAnimation && <Doing/>}</span>);
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
        return (<span className={'preview' + (withAnimation ? ' with-animation' : '')}>
            {ids.slice(0, 2).map((id, index) => {
                const peerId = id.split('_')[0];
                return (<span key={index}>
                        {index !== 0 ? (ids.length - 1 === index ? i18n.t('status.type_and') : i18n.t('status.type_comma')) : ''}
                    <UserName id={peerId} onlyFirstName={true} noIcon={true} className="type-user"
                              noDetail={!withAnimation}/>
                    </span>);
            })}
            {Boolean(ids.length > 2) &&
            <span>{i18n.tf('status.and_n_more', String(localize(ids.length - 2)))}</span>}
            {ids.length === 1 ? ` ${i18n.t('general.is')} ` : ` ${i18n.t('general.are')} `}
            {distinct > 1 ? ` ${withAnimation ? '' : i18n.t('status.doing')}` : getActionType(typingList[ids[0]].action)}
            {withAnimation && <Doing/>}
            </span>);
    }
};