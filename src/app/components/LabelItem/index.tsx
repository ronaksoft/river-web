/*
    Creation Time: 2020 - May - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {useState} from "react";
import {IMessage} from "../../repository/message/interface";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import GroupAvatar from "../GroupAvatar";
import GroupName from "../GroupName";
import {PeerType} from "../../services/sdk/messages/core.types_pb";
import LiveDate from "../LiveDate";
import {C_MESSAGE_TYPE} from "../../repository/message/consts";
import {renderBody} from "../Message";
import {
    AddRounded,
    InsertDriveFileRounded,
    MusicNoteRounded,
    PersonRounded, PlayArrowRounded,
    RecordVoiceOverRounded, PageviewRounded,
} from "@material-ui/icons";
import LabelRepo from "../../repository/label";
import {Link} from "react-router-dom";
import {getDuration, getMediaInfo} from "../MessageMedia";
import CachedPhoto from "../CachedPhoto";
import {MediaContact} from "../../services/sdk/messages/chat.messages.medias_pb";
import {getFileExtension, getFileInfo, getHumanReadableSize} from "../MessageFile";
import {getMapLocation} from "../MessageLocation";
import i18n from "../../services/i18n";
import DocumentViewerService, {IDocument} from "../../services/documentViewerService";
import {IconButton} from '@material-ui/core';

import './style.scss';

interface IRootProps {
    teamId: string;
    message: IMessage;
    labelId: number;
    onAction?: (cmd: 'download', message: IMessage) => void;
}

interface IProps {
    teamId: string;
    message: IMessage;
    onAction?: (cmd: 'download', message: IMessage) => void;
}

interface IMediaProps {
    teamId: string;
    message: IMessage;
    labelId: number;
    onAction?: (cmd: 'download', message: IMessage) => void;
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
                <GroupAvatar id={message.peerid || ''} teamId={message.teamid || '0'} className="label-user-avatar"/>
                <div className="label-user">
                    <GroupName id={message.peerid || ''} teamId={message.teamid || '0'} className="label-user-name"/>
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
    const [mode, setMode] = useState(0);
    const info = getMediaInfo(message);
    const refHandler = (ref: any) => {
        if (ref && !mode && (info.caption || '').length > 10) {
            if (ref.scrollHeight > ref.clientHeight + 3) {
                setMode(1);
            }
        }
    };
    const toggleShowMoreHandler = (e: any) => {
        e.preventDefault();
        if (mode) {
            setMode(mode === 1 ? 2 : 1);
        }
    };
    return <>
        {Boolean(info.thumbFile && info.thumbFile.fileid !== '') ? <div className="label-message-media">
            <CachedPhoto className="thumbnail audio" fileLocation={info.thumbFile} mimeType="image/jpeg"/>
            <div className="icon">
                <MusicNoteRounded/>
            </div>
            <div className="duration">
                {getDuration(info.duration || 0)}
            </div>
            {(info.title || '').length > 0 && <div className="title">{info.title}</div>}
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
            <div className={'inner ' + (message.rtl ? ' rtl' : ' ltr') + (mode === 2 ? ' show-all' : '')}
                 ref={refHandler}>
                {message.peertype === PeerType.PEERGROUP &&
                <UserName id={message.senderid || ''} noDetail={true} noIcon={true} postfix=": " className="_bold"/>}
                {renderBody(info.caption || '', info.entityList || [], 1)}
                {Boolean(mode > 0) &&
                <span className="show-more"
                      onClick={toggleShowMoreHandler}>{i18n.t(mode === 1 ? 'label.show_more' : 'label.show_less')}</span>}
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
    const [mode, setMode] = useState(0);
    const info = getFileInfo(message);
    const refHandler = (ref: any) => {
        if (ref && !mode && (info.caption || '').length > 10) {
            if (ref.scrollHeight > ref.clientHeight + 3) {
                setMode(1);
            }
        }
    };
    const toggleShowMoreHandler = (e: any) => {
        e.preventDefault();
        if (mode) {
            setMode(mode === 1 ? 2 : 1);
        }
    };
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
            <div className={'inner ' + (message.rtl ? ' rtl' : ' ltr') + (mode === 2 ? ' show-all' : '')}
                 ref={refHandler}>
                {message.peertype === PeerType.PEERGROUP &&
                <UserName id={message.senderid || ''} noDetail={true} noIcon={true} postfix=": " className="_bold"/>}
                {renderBody(info.caption || '', info.entityList || [], 1)}
                {Boolean(mode > 0) &&
                <span className="show-more"
                      onClick={toggleShowMoreHandler}>{i18n.t(mode === 1 ? 'label.show_more' : 'label.show_less')}</span>}
            </div>
        </div>}
    </>;
};

const viewDocumentHandler = (labelId: number, message: IMessage) => (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    let el = e.target.querySelector('.thumbnail');
    if (!el) {
        el = e.target.parentElement.querySelector('.thumbnail');
    }
    const info = getMediaInfo(message);
    const doc: IDocument = {
        anchor: 'label',
        items: [{
            caption: info.caption,
            createdon: message.createdon,
            downloaded: (message.messagetype === C_MESSAGE_TYPE.Picture) ? true : (message.downloaded || false),
            duration: info.duration,
            entityList: info.entityList,
            fileLocation: info.file,
            fileSize: info.size,
            height: info.height,
            id: message.id || 0,
            md5: info.md5,
            mimeType: info.mimeType,
            orientation: info.orientation,
            rtl: message.rtl,
            thumbFileLocation: info.thumbFile,
            userId: message.senderid || '',
            width: info.width,
        }],
        labelId,
        peer: {id: message.peerid || '', peerType: message.peertype || 0},
        rect: el ? el.getBoundingClientRect() : undefined,
        stream: false,
        teamId: message.teamid || '0',
        type: message.messagetype === C_MESSAGE_TYPE.Video ? 'video' : 'picture',
    };
    DocumentViewerService.getInstance().loadDocument(doc);
};

const showHandler = (e: any) => {
    e.stopPropagation();
};

const LabelBodyMedia = ({labelId, message, onAction}: IMediaProps) => {
    const [mode, setMode] = useState(0);
    const info = getMediaInfo(message);
    const refHandler = (ref: any) => {
        if (ref && !mode && (info.caption || '').length > 10) {
            if (ref.scrollHeight > ref.clientHeight + 3) {
                setMode(1);
            }
        }
    };
    const toggleShowMoreHandler = (e: any) => {
        e.preventDefault();
        if (mode) {
            setMode(mode === 1 ? 2 : 1);
        }
    };
    const withBlur = (info.height / info.width) > 1 || Math.max(info.width, info.height) < 96;
    const ratio = info.height / info.width;
    let height = 96;
    if (ratio < C_MEDIA_RATIO) {
        height = Math.max(306 * ratio, 48);
    }
    const mediaLoadHandler = () => {
        if (onAction) {
            onAction('download', message);
        }
    };
    return <>
        <div className={`label-message-media item_${message.id || 0}`} style={{height: `${height}px`}}
             onClick={viewDocumentHandler(labelId, message)}>
            {withBlur ? <><CachedPhoto className="thumbnail-blur" fileLocation={info.thumbFile} blur={10}
                                       mimeType="image/jpeg"/>
                    <CachedPhoto className="thumbnail blur-top" onLoad={mediaLoadHandler}
                                 fileLocation={message.messagetype === C_MESSAGE_TYPE.Video ? info.thumbFile : info.file}
                                 mimeType={message.messagetype === C_MESSAGE_TYPE.Video ? 'image/jpeg' : (info.mimeType || 'image/jpeg')}
                    /></> :
                <CachedPhoto className="thumbnail" onLoad={mediaLoadHandler}
                             fileLocation={message.messagetype === C_MESSAGE_TYPE.Video ? info.thumbFile : info.file}
                             mimeType={message.messagetype === C_MESSAGE_TYPE.Video ? 'image/jpeg' : (info.mimeType || 'image/jpeg')}
                />}
            {message.messagetype === C_MESSAGE_TYPE.Video && <>
                <div className="duration">
                    {getDuration(info.duration || 0)}
                </div>
                <div className="icon">
                    <PlayArrowRounded/>
                </div>
            </>}
            <div className="media-actions">
                <IconButton size="small" onClick={showHandler}>
                    <PageviewRounded/>
                </IconButton>
            </div>
        </div>
        {Boolean((info.caption || '').length > 0) &&
        <div className="label-message-body">
            <div className={'inner ' + (message.rtl ? ' rtl' : ' ltr') + (mode === 2 ? ' show-all' : '')}
                 ref={refHandler}>
                {message.peertype === PeerType.PEERGROUP &&
                <UserName id={message.senderid || ''} noDetail={true} noIcon={true} postfix=": " className="_bold"/>}
                {renderBody(info.caption || '', info.entityList || [], 1)}
                {Boolean(mode > 0) &&
                <span className="show-more"
                      onClick={toggleShowMoreHandler}>{i18n.t(mode === 1 ? 'label.show_more' : 'label.show_less')}</span>}
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
    const [mode, setMode] = useState(0);
    const refHandler = (ref: any) => {
        if (ref && !mode) {
            if (ref.scrollHeight > ref.clientHeight + 3) {
                setMode(1);
            }
        }
    };
    const toggleShowMoreHandler = (e: any) => {
        e.preventDefault();
        if (mode) {
            setMode(mode === 1 ? 2 : 1);
        }
    };
    return <div className="label-message-body">
        <div className={'inner ' + (message.rtl ? ' rtl' : ' ltr') + (mode === 2 ? ' show-all' : '')} ref={refHandler}>
            {message.peertype === PeerType.PEERGROUP &&
            <UserName id={message.senderid || ''} noDetail={true} noIcon={true} postfix=": " className="_bold"/>}
            {renderBody(message.body || '', message.entitiesList || [], 1)}
            {Boolean(mode > 0) &&
            <span className="show-more"
                  onClick={toggleShowMoreHandler}>{i18n.t(mode === 1 ? 'label.show_more' : 'label.show_less')}</span>}
        </div>
    </div>;
};

const LabelBody = ({teamId, labelId, message, onAction}: IRootProps) => {
    switch (message.messagetype) {
        case C_MESSAGE_TYPE.Audio:
            return <LabelBodyAudio message={message} teamId={teamId}/>;
        case C_MESSAGE_TYPE.Contact:
            return <LabelBodyContact message={message} teamId={teamId}/>;
        case C_MESSAGE_TYPE.File:
            return <LabelBodyFile message={message} teamId={teamId}/>;
        case C_MESSAGE_TYPE.Location:
            return <LabelBodyLocation message={message} teamId={teamId}/>;
        case C_MESSAGE_TYPE.Picture:
        case C_MESSAGE_TYPE.Video:
        case C_MESSAGE_TYPE.Gif:
            return <LabelBodyMedia message={message} onAction={onAction} teamId={teamId} labelId={labelId}/>;
        case C_MESSAGE_TYPE.Voice:
        case C_MESSAGE_TYPE.VoiceMail:
            return <LabelBodyVoice message={message} teamId={teamId}/>;
        default:
            return <LabelBodyDefault message={message} teamId={teamId}/>;
    }
};

export const LabelMessageItem = ({teamId, labelId, message, onAction}: IRootProps) => {
    const dragStart = (e: any) => {
        e.dataTransfer.setData("message/id", message.id || '');
    };

    return (
        <Link className="label-message-item-href"
              to={`/chat/${teamId}/${message.peerid}_${message.peertype}/${message.id}`}>
            <div className="label-message-item" draggable={true} onDragStart={dragStart}>
                <LabelHeader message={message} teamId={teamId}/>
                <LabelBody message={message} teamId={teamId} onAction={onAction} labelId={labelId}/>
                <LabelIndicator labelIds={message.labelidsList || []}/>
            </div>
        </Link>
    );
};