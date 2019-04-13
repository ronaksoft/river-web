import * as React from 'react';
import {withScriptjs, withGoogleMap, GoogleMap, Marker} from 'react-google-maps';

export const MapComponent = withScriptjs(withGoogleMap((props: any) =>
    <GoogleMap
        defaultZoom={props.defZoom}
        defaultCenter={props.defPos}
        onClick={props.onMapClick}
    >
        {Boolean(props.pos) && <Marker position={props.pos}/>}
    </GoogleMap>
));
