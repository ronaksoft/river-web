import * as React from 'react';

import './success.scss';

export default function Success() {
    return (<div className="success-check-mark">
        <div className="check-icon">
            <span className="icon-line line-tip"/>
            <span className="icon-line line-long"/>
            <div className="icon-circle"/>
            <div className="icon-fix"/>
        </div>
    </div>);
}