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
import DocumentViewerService from '../../services/documentViewerService';
import {PlaceRounded} from '@material-ui/icons';
import {MediaGeoLocation} from '../../services/sdk/messages/chat.core.message.medias_pb';
import {Coords} from 'google-map-react';
// import {C_GOOGLE_MAP_KEY} from '../MapPicker';

import './style.css';

const getMapLocation = (message: IMessage) => {
    const location: Coords = {
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

    public componentDidMount() {
        //
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (newProps.message && this.lastId !== newProps.message.id) {
            this.lastId = newProps.message.id || 0;
            this.setState({
                message: newProps.message,
            });
        }
    }

    public componentWillUnmount() {
        //
    }

    /* View downloaded document */
    public viewDocument = () => {
        return;
        // @ts-ignore
        this.documentViewerService.loadDocument({});
    }
    // https://maps.googleapis.com/maps/api/staticmap?center=35.76344299316406,51.37594985961914&zoom=15&size=300x300&maptype=roadmap&key=AIzaSyAxXaCNUveWAy2fxxv824mFe1n53sLUSL4
    // https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${long}&zoom=14&size=300x300&maptype=mapnik
    public render() {
        const {lat, long} = this.state;
        return (
            <div className="message-location">
                <div className="location-content">
                    <img
                        src={`https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${long}&zoom=14&size=300x300&maptype=mapnik`}/>
                    <PlaceRounded/>
                </div>
            </div>
        );
    }
}

export default MessageLocation;
