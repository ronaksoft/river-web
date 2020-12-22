import React, {useEffect, useState} from 'react';

export function timerFormat(t: number) {
    const sec = Math.floor(t % 60);
    const min = Math.floor((t / 60) % 60);
    const hour = Math.floor((t / 3600) % 60);
    if (hour === 0) {
        return `${min < 10 ? `0${min}` : min} : ${sec < 10 ? `0${sec}` : sec}`;
    } else {
        return `${hour < 10 ? `0${hour}` : hour} : ${min < 10 ? `0${min}` : sec} : ${sec < 10 ? `0${sec}` : sec}`;
    }
}

export function CallTimer() {
    const [timer, setTimer] = useState<number>(0);

    useEffect(() => {
        const interval = setInterval(() => tick(), 1000);
        return function cleanup() {
            clearInterval(interval);
        };
    });

    function tick() {
        setTimer(timer + 1);
    }

    return (<div className="call-timer">{timerFormat(timer)}</div>);
}