/*
    Creation Time: 2018 - Oct - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import TimeUtility from '../../services/utilities/time';

import './style.scss';

interface IProps {
    className?: string;
}

interface IState {
    className: string;
    timestamp: number | null;
}

class PopUpDate extends React.PureComponent<IProps, IState> {
    private popUpDateTimeout: any;
    private lastTimestamp: number | null | undefined;
    private ref: any;

    constructor(props: IProps) {
        super(props);

        this.state = {
            className: props.className || '',
            timestamp: 0,
        };

        this.lastTimestamp = 0;
    }

    public componentWillUnmount() {
        if (this.popUpDateTimeout) {
            clearTimeout(this.popUpDateTimeout);
        }
    }

    public updateDate(timestamp: number | null) {
        if (this.lastTimestamp !== timestamp) {
            this.setState({
                timestamp,
            }, () => {
                this.lastTimestamp = timestamp;
                clearTimeout(this.popUpDateTimeout);
                this.popUpDateTimeout = setTimeout(() => {
                    this.setState({
                        timestamp: null,
                    });
                }, 3000);
            });
        }
    }

    public addReaction(reaction: string) {
        if (this.ref) {
            const el = document.createElement('div');
            el.classList.add('offscreen-reaction');
            el.innerHTML = reaction;
            setTimeout(() => {
                el.remove();
            }, 1950);
            this.ref.appendChild(el);
        }
    }

    public render() {
        const {className, timestamp} = this.state;
        return (
            <div className="pop-up-date" ref={this.refHandler}>
                <div className="pop-up-date-container">
                <span className={'pop-up-date ' + className + (timestamp ? ' down' : '')}>
                    {timestamp ? TimeUtility.dynamicDate(timestamp) : TimeUtility.dynamicDate(this.lastTimestamp || 0)}
                </span>
                </div>
            </div>
        );
    }

    private refHandler = (ref: any) => {
        this.ref = ref;
    }
}

export default PopUpDate;
