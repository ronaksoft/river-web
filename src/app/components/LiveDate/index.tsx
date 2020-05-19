/*
    Creation Time: 2018 - Oct - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import React, {useEffect, useState} from 'react';
import TimeUtility from '../../services/utilities/time';
import RiverTime from '../../services/utilities/river_time';

interface IProps {
    className?: string;
    time: number;
}

const riverTime = RiverTime.getInstance();

const getIntervalTime = (time: number) => {
    const diff = riverTime.now() - time;
    if (diff < 86400) {
        return 10000;
    } else {
        return -1; // 3600000;
    }
};

export const LiveDate = ({time, className}: IProps) => {
    const [t, setT] = useState(time);

    useEffect(() => {
        setT(time);
        let interval: any;
        const intervalTime = getIntervalTime(time);
        if (intervalTime !== -1) {
            interval = setInterval(() => {
                setT(time);
            }, intervalTime);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [time]);

    return (
        <span className={className || ''}>{TimeUtility.dynamic(t)}</span>
    );
};

export default LiveDate;
