/*
    Creation Time: 2018 - March - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import {CheckRounded} from '@material-ui/icons';
import {MapComponent} from './map';
import i18n from '../../services/i18n';
import {InputPeer, MessageEntity} from "../../services/sdk/messages/core.types_pb";
import MentionInput, {IMention} from "../MentionInput";
import RTLDetector from "../../services/utilities/rtl_detector";
import {throttle} from "lodash";
import {measureNodeHeight} from "../ChatInput/measureHeight";
import {generateEntities} from "../ChatInput";

import './style.scss';

export const C_GOOGLE_MAP_KEY = 'AIzaSyC5e9DrKC2gHS9UD1sbHGI-H0wfzCgK58U';

export interface IPos {
    lat: number;
    lng: number;
}

export interface IGeoItem {
    caption: string;
    entities?: MessageEntity[] | null;
    lat: number;
    long: number;
}

interface IProps {
    onDone: (item: IGeoItem) => void;
}

interface IState {
    caption: string;
    defPos: google.maps.LatLngLiteral;
    dialogOpen: boolean;
    loading: boolean;
    peer: InputPeer | null;
    pos: google.maps.LatLngLiteral;
    rtl: boolean;
    zoom: number;
}

const mentionInputStyle = {
    input: {
        border: 'none',
        bottom: 'auto',
        lineHeight: '1.2em',
        minHeight: '20px',
        outline: 'none',
        padding: 0,
        position: 'relative',
    },
};

class MapPicker extends React.Component<IProps, IState> {
    private teamId: string = '0';
    private mentionContainer: any = null;
    private textarea: any = null;
    private rtlDetector: RTLDetector;
    private readonly rtlDetectorThrottle: any;
    private mentions: IMention[] = [];

    constructor(props: IProps) {
        super(props);

        this.state = {
            caption: '',
            defPos: {
                lat: 35.772361,
                lng: 51.3849373,
            },
            dialogOpen: false,
            loading: false,
            peer: null,
            pos: {
                lat: 35.772361,
                lng: 51.3849373,
            },
            rtl: false,
            zoom: 14,
        };

        this.rtlDetector = RTLDetector.getInstance();
        this.rtlDetectorThrottle = throttle(this.detectRTL, 250);
    }

    public openDialog(teamId: string, peer: InputPeer | null) {
        this.teamId = teamId;
        this.setState({
            dialogOpen: true,
            peer,
        }, () => {
            this.initMap();
        });
    }

    public render() {
        const {caption, dialogOpen, defPos, loading, pos, zoom, rtl} = this.state;
        return (
            <Dialog
                open={dialogOpen}
                onClose={this.dialogCloseHandler}
                className="map-picker-dialog"
                disableBackdropClick={loading}
                classes={{
                    paper: 'map-picker-dialog-paper'
                }}
            >
                <div className="map-picker-container">
                    {loading && <div className="map-picker-loader">
                        <span>{i18n.t('general.loading')}</span>
                    </div>}
                    <div className="map-picker-header">
                        <span>{i18n.t('uploader.share_location')}</span>
                    </div>
                    <div className="map-picker-preview-container">
                        <div className="map-picker-canvas">
                            <MapComponent
                                googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${C_GOOGLE_MAP_KEY}&v=3.exp&libraries=geometry,drawing,places`}
                                loadingElement={<div style={{height: `100%`}}/>}
                                containerElement={<div style={{height: `100%`}}/>}
                                mapElement={<div style={{height: `100%`}}/>}
                                defPos={defPos}
                                defZoom={zoom}
                                pos={pos}
                                onMapClick={this.mapClickHandler}
                            />
                        </div>
                        <div className="map-picker-details-container">
                            <div
                                className="caption-container">
                                <div className="suggestion-list-container-zero">
                                    <div ref={this.mentionContainerRefHandler} className="suggestion-list-container"/>
                                </div>
                                <div
                                    className={'caption-input-container ' + (rtl ? 'rtl' : 'ltr')}>
                                    <MentionInput
                                        peer={this.state.peer}
                                        isBot={false}
                                        className="uploader-mention"
                                        style={mentionInputStyle}
                                        inputRef={this.textareaRefHandler}
                                        suggestionsPortalHost={this.mentionContainer}
                                        value={caption}
                                        onChange={this.captionChangeHandler}
                                        placeholder={i18n.t('uploader.write_a_caption')}
                                        teamId={this.teamId}
                                    />
                                </div>
                            </div>
                            <div className="map-picker-action" onClick={this.doneHandler}>
                                <CheckRounded/>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        );
    }

    private mentionContainerRefHandler = (ref: any) => {
        this.mentionContainer = ref;
    }

    private textareaRefHandler = (ref: any) => {
        this.textarea = ref;
    }

    /* Init google map */
    private initMap() {
        if ("geolocation" in navigator) {
            const options = {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000,
            };
            navigator.geolocation.getCurrentPosition((pos) => {
                this.setState({
                    pos: {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    },
                });
            }, (err) => {
                window.console.debug(err);
            }, options);
        }
    }

    /* Caption change handler */
    private captionChangeHandler = (e: any, a: any, b: any, mentions: IMention[]) => {
        const text = e.target.value;
        this.mentions = mentions;
        this.rtlDetectorThrottle(text);
        this.setState({
            caption: text,
        });
    }

    private detectRTL = (text: string) => {
        this.setState({
            rtl: this.rtlDetector.direction(text),
        });
        this.computeLines();
    }

    private computeLines() {
        if (!this.textarea) {
            return;
        }
        let lines = 1;
        const nodeInfo = measureNodeHeight(this.textarea, 87845, false, 1, 40);
        if (nodeInfo) {
            lines = nodeInfo.rowCount;
        } else {
            lines = this.textarea.value.split('\n').length;
        }
        lines++;
        this.textarea.style.height = `${lines * 1.2}em`;
    }

    /* Close dialog handler */
    private dialogCloseHandler = () => {
        this.mentions = [];
        this.setState({
            caption: '',
            dialogOpen: false,
        });
    }

    private mapClickHandler = (e: google.maps.MouseEvent) => {
        this.setState({
            pos: e.latLng.toJSON(),
        });
    }

    /* Check button click handler */
    private doneHandler = () => {
        const {entities, text} = generateEntities(this.textarea ? this.textarea.value : '', this.mentions);
        if (this.props.onDone) {
            this.props.onDone({
                caption: text,
                entities,
                lat: this.state.pos.lat,
                long: this.state.pos.lng,
            });
        }
        this.dialogCloseHandler();
    }
}

export default MapPicker;
