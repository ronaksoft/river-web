import * as React from 'react';
import TimeUtililty from '../../services/utilities/time';

import './style.css';

interface IProps {
    className?: string;
    timestamp: number | null;
}

interface IState {
    className: string;
    timestamp: number | null;
}

class PopUpDate extends React.Component<IProps, IState> {
    private lastTimestamp: number | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            timestamp: props.timestamp,
        };

        this.lastTimestamp = props.timestamp || 0;
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            timestamp: newProps.timestamp,
        }, () => {
            this.lastTimestamp = newProps.timestamp || 0;
        });
    }

    public render() {
        const {className, timestamp} = this.state;
        return (
            <div className="pop-up-date-container">
                <span className={'pop-up-date ' + className + (timestamp ? ' down' : '')}>
                    {timestamp ? TimeUtililty.dynamicDate(timestamp) : TimeUtililty.dynamicDate(this.lastTimestamp)}
                </span>
            </div>
        );
    }
}

export default PopUpDate;