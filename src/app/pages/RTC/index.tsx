/*
    Creation Time: 2020 - Oct - 11
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';

import './style.scss';

interface IProps {
    match?: any;
    location?: any;
    history?: any;
}

interface IState {
    test: boolean;
}

class RTC extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            test: true,
        };
    }

    public componentDidMount() {
    }

    public componentWillUnmount() {
        //
    }

    public render() {
        return (
            <div>
                Web RTC Test
            </div>
        );
    }
}

export default RTC;
