/*
    Creation Time: 2019 - March - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
import {IMessage} from '../../repository/message/interface';
import {InputPeer, MediaType, MessageEntity} from '../../services/sdk/messages/core.types_pb';
import DocumentViewerService, {IDocument} from '../../services/documentViewerService';
import {PlaceRounded} from '@material-ui/icons';
import {MediaGeoLocation} from '../../services/sdk/messages/chat.messages.medias_pb';
import {renderBody} from "../Message";
import ElectronService from "../../services/electron";

import './style.scss';

interface ILocationInfo {
    caption: string;
    entityList?: MessageEntity.AsObject[];
    lat: number;
    lng: number;
}

export const getMapLocation = (message: IMessage) => {
    const location: ILocationInfo = {
        caption: '',
        lat: 0,
        lng: 0,
    };
    if (message.mediatype === MediaType.MEDIATYPEGEOLOCATION) {
        const media: MediaGeoLocation.AsObject = message.mediadata;
        location.lat = media.lat || 0;
        location.lng = media.pb_long || 0;
        location.caption = media.caption || '';
        location.entityList = media.entitiesList;
    }
    return location;
};

interface IProps {
    measureFn: any;
    message: IMessage;
    peer: InputPeer | null;
    onBodyAction: (cmd: string, text: string) => void;
}

const showLocationHandler = (lat: number, long: number, message: IMessage) => (e: any) => {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    const doc: IDocument = {
        anchor: 'message',
        items: [{
            caption: '',
            fileLocation: {
                accesshash: '0',
                clusterid: 0,
                fileid: '0',
            },
            geo: {
                lat,
                lng: long,
            },
        }],
        peer: {id: message.peerid || '', peerType: message.peertype || 0},
        teamId: message.teamid || '0',
        type: 'location',
    };
    DocumentViewerService.getInstance().loadDocument(doc);
};

const isElectron = ElectronService.isElectron();

const MessageLocation = ({peer, message, onBodyAction, measureFn}: IProps) => {
    const locationInfo = getMapLocation(message);
    return (
        <div className="message-location">
            <div className="location-content" onClick={showLocationHandler(locationInfo.lat, locationInfo.lng, message)}>
                <img
                    src={`https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${locationInfo.lng},${locationInfo.lat}&z=14&l=map&size=390,390`}
                    alt={`location: ${locationInfo.lat}, ${locationInfo.lng}`} draggable={false}/>
                <PlaceRounded/>
            </div>
            {Boolean(locationInfo.caption.length > 0) &&
            <div className={'location-caption ' + (message.rtl ? 'rtl' : 'ltr')}>
                {renderBody(locationInfo.caption, locationInfo.entityList, isElectron, onBodyAction, measureFn)}
            </div>}
        </div>
    );
};

export default MessageLocation;
