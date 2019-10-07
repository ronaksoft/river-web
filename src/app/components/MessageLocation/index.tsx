/*
    Creation Time: 2019 - March - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {IMessage} from '../../repository/message/interface';
import {InputPeer, MediaType} from '../../services/sdk/messages/chat.core.types_pb';
import DocumentViewerService, {IDocument} from '../../services/documentViewerService';
import {PlaceRounded} from '@material-ui/icons';
import {MediaGeoLocation} from '../../services/sdk/messages/chat.core.message.medias_pb';
// import {C_GOOGLE_MAP_KEY} from '../MapPicker';

import './style.css';

const getMapLocation = (message: IMessage) => {
    const location: google.maps.LatLngLiteral = {
        lat: 0,
        lng: 0,
    };
    if (message.mediatype === MediaType.MEDIATYPEGEOLOCATION) {
        const media: MediaGeoLocation.AsObject = message.mediadata;
        location.lat = media.lat || 0;
        location.lng = media.pb_long || 0;
    }
    return location;
};

interface IProps {
    message: IMessage;
    peer: InputPeer | null;
}

interface IState {
    lat: number;
    long: number;
    message: IMessage;
}

class MessageLocation extends React.PureComponent<IProps, IState> {
    private lastId: number;
    private documentViewerService: DocumentViewerService;

    constructor(props: IProps) {
        super(props);

        const location = getMapLocation(props.message);
        this.state = {
            lat: location.lat,
            long: location.lng,
            message: props.message,
        };

        this.documentViewerService = DocumentViewerService.getInstance();
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (newProps.message && this.lastId !== newProps.message.id) {
            this.lastId = newProps.message.id || 0;
            this.setState({
                message: newProps.message,
            });
        }
    }

    /* View downloaded document */
    public viewDocument = () => {
        return;
        // @ts-ignore
        this.documentViewerService.loadDocument({});
    }
    // https://maps.googleapis.com/maps/api/staticmap?center=35.76344299316406,51.37594985961914&zoom=15&size=300x300&maptype=roadmap&key=AIzaSyAxXaCNUveWAy2fxxv824mFe1n53sLUSL4
    // https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${long}&zoom=14&size=300x300&maptype=mapnik
    // https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${long}&zoom=14&size=300x300&maptype=mapnik
    // https://static-maps.yandex.ru/1.x/?lang=en-US&ll=-73.7638,42.6564&z=13&l=map&size=300,300
    public render() {
        const {lat, long} = this.state;
        return (
            <div className="message-location">
                <div className="location-content" onClick={this.showLocationHandler}>
                    <img
                        src={`https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${long},${lat}&z=14&l=map&size=300,300`}/>
                    <PlaceRounded/>
                </div>
            </div>
        );
    }

    /* Show location handler */
    private showLocationHandler = (e: any) => {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        const {lat, long, message} = this.state;
        const doc: IDocument = {
            anchor: 'message',
            items: [{
                caption: '',
                fileLocation: {},
                geo: {
                    lat,
                    lng: long,
                },
            }],
            peerId: message.peerid || '',
            type: 'location',
        };
        this.documentViewerService.loadDocument(doc);
    }
}

export default MessageLocation;
