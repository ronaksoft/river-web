/*
    Creation Time: 2020 - May - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from "react";
import {IMessage} from "../../repository/message/interface";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import GroupAvatar from "../GroupAvatar";
import GroupName from "../GroupName";
import {PeerType} from "../../services/sdk/messages/chat.core.types_pb";
import LiveDate from "../LiveDate";
import {C_MESSAGE_TYPE} from "../../repository/message/consts";
import {renderBody} from "../Message";
import {
    AddRounded,
    InsertDriveFileRounded,
    MusicNoteRounded,
    PersonRounded, PlayArrowRounded,
    RecordVoiceOverRounded, VisibilityRounded,
} from "@material-ui/icons";
import LabelRepo from "../../repository/label";
import {Link} from "react-router-dom";
import {getDuration, getMediaInfo} from "../MessageMedia";
import CachedPhoto from "../CachedPhoto";
import {MediaContact} from "../../services/sdk/messages/chat.core.message.medias_pb";
import {getFileExtension, getFileInfo, getHumanReadableSize} from "../MessageFile";
import {getMapLocation} from "../MessageLocation";
import i18n from "../../services/i18n";
import DocumentViewerService, {IDocument} from "../../services/documentViewerService";
import {IconButton} from '@material-ui/core';

import './style.scss';

interface IProps {
    message: IMessage;
}

const C_MEDIA_RATIO = 96 / 306;
const labelColors = LabelRepo.labelColors;

const LabelHeader = ({message}: IProps) => {
    const info = getMediaInfo(message);
    let id: string = '';
    switch (message.messagetype) {
        case C_MESSAGE_TYPE.Contact:
        case C_MESSAGE_TYPE.Location:
            id = message.senderid || '';
            break;
        case C_MESSAGE_TYPE.Audio:
        case C_MESSAGE_TYPE.File:
        case C_MESSAGE_TYPE.Picture:
        case C_MESSAGE_TYPE.Video:
            if (info.caption.length === 0) {
                id = message.senderid || '';
            }
            break;
    }
    return (
        <div
            className={'label-message-item-header' + (message.peertype === PeerType.PEERGROUP && id !== '' ? ' with-sender' : '')}>
            {message.peertype === PeerType.PEERGROUP ? <>
                <GroupAvatar id={message.peerid || ''} className="label-user-avatar"/>
                <div className="label-user">
                    <GroupName id={message.peerid || ''} className="label-user-name"/>
                    {id !== '' && <UserName id={id} noDetail={true} noIcon={true} className="label-user-sender"/>}
                </div>
            </> : <>
                <UserAvatar id={message.peerid || ''} noDetail={true} className="label-user-avatar"/>
                <UserName id={message.peerid || ''} noDetail={true} className="label-user-name"/>
            </>}
            <div className="user-gap"/>
            <LiveDate className="label-date" time={message.createdon || 0}/>
        </div>
    );
};

const LabelIndicator = ({labelIds}: { labelIds: number[] }) => {
    let labelCnt: number = 0;
    if (labelIds.length > 0) {
        return <div className={'label-indicator ' + (labelIds.length > 1 ? 'single-label' : 'many-label')}>
            {labelIds.slice(0, 3).map((id, key) => {
                if (labelColors.hasOwnProperty(id)) {
                    return (<div key={id} className={`circle-label label-${labelCnt++}`}
                                 style={{backgroundColor: labelColors[id]}}>
                        {key === 0 && labelIds.length > 3 ? <AddRounded/> : ''}
                    </div>);
                }
                return null;
            })}
        </div>;
    }
    return null;
};

const LabelBodyAudio = ({message}: IProps) => {
    const info = getMediaInfo(message);
    return <>
        {Boolean(info.thumbFile && info.thumbFile.fileid !== '') ? <div className="label-message-media">
            <CachedPhoto className="thumbnail audio" fileLocation={info.thumbFile}/>
            <div className="icon">
                <MusicNoteRounded/>
            </div>
            <div className="duration">
                {getDuration(info.duration || 0)}
            </div>
        </div> : <div className="label-message-info">
            <div className="icon">
                <MusicNoteRounded/>
            </div>
            <div className="info">
                <div className="name">{info.title}</div>
                <div className="size">{getDuration(info.duration || 0)}</div>
            </div>
        </div>}
        {Boolean((info.caption || '').length > 0) &&
        <div className="label-message-body">
            <div className={'inner ' + (message.rtl ? ' rtl' : ' ltr')}>
                {message.peertype === PeerType.PEERGROUP &&
                <UserName id={message.senderid || ''} noDetail={true} noIcon={true} postfix=": " className="_bold"/>}
                {renderBody(info.caption || '', info.entityList || [], 1)}
            </div>
        </div>}
    </>;
};

const LabelBodyContact = ({message}: IProps) => {
    const contact: MediaContact.AsObject = message.mediadata;
    return <div className="label-message-info">
        <div className="icon">
            <PersonRounded/>
        </div>
        <div className="info">
            <div className="name">{`${contact.firstname} ${contact.lastname}`}</div>
            <div className="phone">{contact.phone}</div>
        </div>
    </div>;
};

const LabelBodyFile = ({message}: IProps) => {
    const info = getFileInfo(message);
    return <>
        <div className="label-message-info">
            <div className="icon">
                <InsertDriveFileRounded/>
                <span className="extension">{getFileExtension(info.type, info.name)}</span>
            </div>
            <div className="info">
                <div className="name">{info.name}</div>
                <div className="size">{getHumanReadableSize(info.size)}</div>
            </div>
        </div>
        {Boolean((info.caption || '').length > 0) &&
        <div className="label-message-body">
            <div className={'inner ' + (message.rtl ? ' rtl' : ' ltr')}>
                {message.peertype === PeerType.PEERGROUP &&
                <UserName id={message.senderid || ''} noDetail={true} noIcon={true} postfix=": " className="_bold"/>}
                {renderBody(info.caption || '', info.entityList || [], 1)}
            </div>
        </div>}
    </>;
};

const viewDocumentHandler = (message: IMessage) => (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    // @ts-ignore
    const el = e.currentTarget.parentElement.parentElement.querySelector('.thumbnail');
    const info = getMediaInfo(message);
    const doc: IDocument = {
        anchor: 'label',
        items: [{
            caption: info.caption,
            createdon: message.createdon,
            downloaded: message.downloaded || false,
            duration: info.duration,
            entityList: info.entityList,
            fileLocation: info.file,
            fileSize: info.size,
            height: info.height,
            id: message.id || 0,
            md5: info.md5,
            mimeType: info.mimeType,
            rtl: message.rtl,
            thumbFileLocation: message.messagetype !== C_MESSAGE_TYPE.Picture ? info.thumbFile : undefined,
            userId: message.senderid || '',
            width: info.width,
        }],
        peerId: message.peerid || '',
        rect: el ? el.getBoundingClientRect() : undefined,
        stream: false,
        type: message.messagetype === C_MESSAGE_TYPE.Picture ? 'picture' : 'video',
    };
    DocumentViewerService.getInstance().loadDocument(doc);
};

const LabelBodyMedia = ({message}: IProps) => {
    const info = getMediaInfo(message);
    const withBlur = (info.height / info.width) > 1 || Math.max(info.width, info.height) < 96;
    const ratio = info.height / info.width;
    let height = 96;
    if (ratio < C_MEDIA_RATIO) {
        height = Math.max(306 * ratio, 48);
    }
    return <>
        <div className={`label-message-media item_${message.id || 0}`} style={{height: `${height}px`}}>
            {withBlur ? <><CachedPhoto className="thumbnail-blur" fileLocation={info.thumbFile} blur={10}/>
                    <CachedPhoto className="thumbnail blur-top"
                                 fileLocation={message.messagetype === C_MESSAGE_TYPE.Video ? info.thumbFile : info.file}/></> :
                <CachedPhoto className="thumbnail"
                             fileLocation={message.messagetype === C_MESSAGE_TYPE.Video ? info.thumbFile : info.file}/>}
            {message.messagetype === C_MESSAGE_TYPE.Video && <>
                <div className="duration">
                    {getDuration(info.duration || 0)}
                </div>
                <div className="icon">
                    <PlayArrowRounded/>
                </div>
            </>}
            <div className="media-actions">
                <IconButton onClick={viewDocumentHandler(message)}>
                    <VisibilityRounded/>
                </IconButton>
            </div>
        </div>
        {Boolean((info.caption || '').length > 0) &&
        <div className="label-message-body">
            <div className={'inner ' + (message.rtl ? ' rtl' : ' ltr')}>
                {message.peertype === PeerType.PEERGROUP &&
                <UserName id={message.senderid || ''} noDetail={true} noIcon={true} postfix=": " className="_bold"/>}
                {renderBody(info.caption || '', info.entityList || [], 1)}
            </div>
        </div>}
    </>;
};

const LabelBodyLocation = ({message}: IProps) => {
    const info = getMapLocation(message);
    return <div className="label-message-media">
        <div className="thumbnail map">
            <img
                src={`https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${info.lng},${info.lat}&z=14&l=map&size=306,96`}
                alt={`location: ${info.lat},${info.lng}`} draggable={false}/>
        </div>
    </div>;
};

const LabelBodyVoice = ({message}: IProps) => {
    const info = getMediaInfo(message);
    return <div className="label-message-info">
        <div className="icon small">
            <RecordVoiceOverRounded/>
        </div>
        <div className="info">
            <div className="name">{i18n.t('message.voice_message')}</div>
            <div className="size">{getDuration(info.duration || 0)}</div>
        </div>
    </div>;
};

const LabelBodyDefault = ({message}: IProps) => {
    return <div className="label-message-body">
        <div className={'inner ' + (message.rtl ? ' rtl' : ' ltr')}>
            {message.peertype === PeerType.PEERGROUP &&
            <UserName id={message.senderid || ''} noDetail={true} noIcon={true} postfix=": " className="_bold"/>}
            {renderBody(message.body || '', message.entitiesList || [], 1)}
        </div>
    </div>;
};

const LabelBody = ({message}: IProps) => {
    switch (message.messagetype) {
        case C_MESSAGE_TYPE.Audio:
            return <LabelBodyAudio message={message}/>;
        case C_MESSAGE_TYPE.Contact:
            return <LabelBodyContact message={message}/>;
        case C_MESSAGE_TYPE.File:
            return <LabelBodyFile message={message}/>;
        case C_MESSAGE_TYPE.Location:
            return <LabelBodyLocation message={message}/>;
        case C_MESSAGE_TYPE.Picture:
        case C_MESSAGE_TYPE.Video:
            return <LabelBodyMedia message={message}/>;
        case C_MESSAGE_TYPE.Voice:
            return <LabelBodyVoice message={message}/>;
        default:
            return <LabelBodyDefault message={message}/>;
    }
};

export const LabelMessageItem = ({message}: IProps) => {
    const dragStart = (e: any) => {
        e.dataTransfer.setData("message/id", message.id || '');
    };

    return (
        <Link className="label-message-item-href" to={`/chat/${message.peerid}/${message.id}`}>
            <div className="label-message-item" draggable={true} onDragStart={dragStart}>
                <LabelHeader message={message}/>
                <LabelBody message={message}/>
                <LabelIndicator labelIds={message.labelidsList || []}/>
            </div>
        </Link>
    );
};