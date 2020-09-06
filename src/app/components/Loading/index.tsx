import * as React from 'react';
import {CircularProgress} from "@material-ui/core";

import './style.scss';

export const Loading = () => {
    return (
        <div className="river-loading">
            <div className="inner">
                <CircularProgress size={40} color="inherit"/>
            </div>
        </div>
    );
};


