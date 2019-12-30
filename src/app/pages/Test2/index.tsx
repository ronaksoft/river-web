/*
    Creation Time: 2018 - Oct - 09
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import DialogRepo from "../../repository/dialog";

import './style.scss';

interface IProps {
    match?: any;
    location?: any;
    history?: any;
}

interface IState {
    items: any[];
    test: boolean;
}

class Test extends React.Component<IProps, IState> {
    private dialogRepo: DialogRepo | undefined;
    private count: number = 0;

    constructor(props: IProps) {
        super(props);

        this.state = {
            items: [],
            test: true,
        };

        this.dialogRepo = DialogRepo.getInstance();
    }

    public componentDidMount() {
    }

    public componentWillUnmount() {
        //
    }

    public render() {
        return (
            <div>
                <button onClick={this.testHandler}>get dialogs</button>
            </div>
        );
    }

    private testHandler =() => {
        if (!this.dialogRepo) {
            return;
        }
        this.dialogRepo.getSnapshot({}).then((res) => {
           window.console.log(res.dialogs.length, res.updateid);
           if (this.count < 20) {
               this.testHandler();
           }
           this.count++;
        });
    }
}

export default Test;
