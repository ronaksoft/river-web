/*
    Creation Time: 2018 - March - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import Dialog from '@material-ui/core/Dialog/Dialog';
import {CheckRounded} from '@material-ui/icons';
import TextField from '@material-ui/core/TextField/TextField';
import {MapComponent} from './map';

import './style.css';

export const C_GOOGLE_MAP_KEY = 'AIzaSyC5e9DrKC2gHS9UD1sbHGI-H0wfzCgK58U';

export interface IPos {
    lat: number;
    lng: number;
}

export interface IGeoItem {
    caption: string;
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
    pos: google.maps.LatLngLiteral;
    zoom: number;
}

class MapPicker extends React.Component<IProps, IState> {

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
            pos: {
                lat: 35.772361,
                lng: 51.3849373,
            },
            zoom: 14,
        };
    }

    public openDialog() {
        this.setState({
            dialogOpen: true,
        }, () => {
            this.initMap();
        });
    }

    public componentWillUnmount() {
        //
    }

    public render() {
        const {caption, dialogOpen, defPos, loading, pos, zoom} = this.state;
        return (
            <Dialog
                open={dialogOpen}
                onClose={this.dialogCloseHandler}
                className="map-picker-dialog"
                disableBackdropClick={loading}
            >
                <div className="map-picker-container">
                    {loading && <div className="map-picker-loader">
                        <span>Loading...</span>
                    </div>}
                    <div className="map-picker-header">
                        <span>Share Location</span>
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
                            <TextField
                                className="caption-input"
                                label="Write a caption"
                                fullWidth={true}
                                multiline={true}
                                rowsMax={2}
                                inputProps={{
                                    maxLength: 512,
                                }}
                                value={caption}
                                onChange={this.captionChangeHandler}
                            />
                            <div className="map-picker-action" onClick={this.doneHandler}>
                                <CheckRounded/>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        );
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

    /* Caption change change handler */
    private captionChangeHandler = (e: any) => {
        this.setState({
            caption: e.currentTarget.value,
        });
    }

    /* Close dialog handler */
    private dialogCloseHandler = () => {
        this.setState({
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
        if (this.props.onDone) {
            this.props.onDone({
                caption: this.state.caption,
                lat: this.state.pos.lat,
                long: this.state.pos.lng,
            });
        }
        this.dialogCloseHandler();
    }
}

export default MapPicker;
