/*
    Creation Time: 2020 - June - 10
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import i18n from '../../services/i18n';
import Scrollbars from "react-custom-scrollbars";
import APIManager from "../../services/sdk";
import {range} from "lodash";

import './style.scss';

interface IProps {
    test?: boolean;
}

interface IState {
    list: any[];
}

class GifPicker extends React.Component<IProps, IState> {
    // public static getDerivedStateFromProps(props: IProps, state: IState) {
    //     return {
    //         selected: props.selected,
    //     };
    // }

    private apiManager: APIManager;

    constructor(props: IProps) {
        super(props);

        this.state = {
            list: [],
        };

        this.apiManager = APIManager.getInstance();
    }

    public componentDidMount() {
        this.getList();
    }

    public render() {
        const {list} = this.state;
        return (
            <div className="gif-picker">
                {i18n.t('general.settings')}
                <div className="gif-picker-list">
                    <Scrollbars hideTracksWhenNotNeeded={false} universal={true}>
                        <div className="slider" style={this.getHeight()}>
                            {list.map((item, index) => {
                                return <div key={index} className="gif-item">
                                    {i18n.t('general.settings')}
                                </div>;
                            })}
                        </div>
                    </Scrollbars>
                </div>
            </div>
        );
    }

    private getList() {
        this.apiManager.getGif().then((res) => {
            window.console.log(res);
            this.setState({
                list: range(30),
            });
        });
    }

    private getHeight() {
        const {list} = this.state;
        return {
            height: Math.ceil(list.length / 3) * 106,
        };
    }
}

export default GifPicker;
