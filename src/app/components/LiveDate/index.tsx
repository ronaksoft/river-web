import * as React from 'react';

import TimeUtility from '../../services/utilities/time';

interface IProps {
    className?: string;
    time: number;
}

interface IState {
    className: string;
    toggle: boolean;
    time: number;
}

class LiveDate extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            time: props.time,
            toggle: true,
        };
    }

    public componentDidMount() {
        setInterval(() => {
            this.setState({
                toggle: false,
            }, () => {
                this.setState({
                    toggle: true,
                });
            });
        }, 10000);
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.time === newProps.time) {
            return;
        }
        this.setState({
            time: newProps.time,
        });
    }

    public render() {
        return (
            this.state.toggle && <span className={this.state.className}>{TimeUtility.dynamic(this.state.time)}</span>
        );
    }
}

export default LiveDate;
