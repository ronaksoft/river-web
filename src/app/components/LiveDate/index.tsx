import * as React from 'react';

import TimeUtility from '../../services/utilities/time';

interface IProps {
    className?: string;
    time: number;
}

interface IState {
    className: string;
    time: number;
}

class LiveDate extends React.Component<IProps, IState> {
    private interval: any = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            time: props.time,
        };
    }

    public componentDidMount() {
        this.runInterval();
    }

    public componentWillUnmount() {
        clearInterval(this.interval);
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.time === newProps.time) {
            return;
        }
        this.setState({
            time: newProps.time,
        }, () => {
            this.runInterval();
        });
    }

    public render() {
        return (
            <span className={this.state.className}>{TimeUtility.dynamic(this.state.time)}</span>
        );
    }

    private getIntervalTime(time: number) {
        const diff = Math.floor(Date.now() / 1000) - time;
        if (diff < 86400) {
            return 10000;
        } else {
            return 3600000;
        }
    }

    private runInterval() {
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            this.setState({
                time: this.state.time,
            });
        }, this.getIntervalTime(this.state.time));
    }
}

export default LiveDate;
