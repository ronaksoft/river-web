import React from 'react';

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

interface IProps {
}

interface IState {
    timer: number;
}

export class CallTimer extends React.Component<IProps, IState> {

    private interval: any = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            timer: 0,
        };
    }

    public setTime(timer: number) {
        this.setState({
            timer,
        });
    }

    public componentDidMount() {
        this.interval = setInterval(() => {
            this.setState({
                timer: this.state.timer + 1,
            });
        }, 1000);
    }

    public componentWillUnmount() {
        clearInterval(this.interval);
    }

    public render() {
        return (<div className="call-timer">{timerFormat(this.state.timer)}</div>);
    }
}