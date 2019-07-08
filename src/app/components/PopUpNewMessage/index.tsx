/*
    Creation Time: 2019 - Oct - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import i18n from "../../services/i18n";
import {ExpandMoreRounded} from '@material-ui/icons';

import './style.css';

interface IProps {
    onClick?: () => void;
}

interface IState {
    hidden: boolean;
    visible: boolean;
}

class PopUpNewMessage extends React.PureComponent<IProps, IState> {
    private popUpNewMessageTimeout: any;
    private popUpNewMessageTimeout2: any;

    constructor(props: IProps) {
        super(props);

        this.state = {
            hidden: true,
            visible: false,
        };
    }

    public setVisible(visible: boolean) {
        if (this.state.visible !== visible) {
            if (visible) {
                this.setState({
                    hidden: false,
                    visible: true,
                }, () => {
                    clearTimeout(this.popUpNewMessageTimeout);
                    clearTimeout(this.popUpNewMessageTimeout2);
                    this.popUpNewMessageTimeout = setTimeout(() => {
                        this.setState({
                            visible: false,
                        });
                        this.popUpNewMessageTimeout2 = setTimeout(() => {
                            this.setState({
                                hidden: true,
                            });
                        }, 500);
                    }, 5000);
                });
            } else {
                clearTimeout(this.popUpNewMessageTimeout);
                clearTimeout(this.popUpNewMessageTimeout2);
                this.setState({
                    visible: false,
                });
                this.popUpNewMessageTimeout2 = setTimeout(() => {
                    this.setState({
                        hidden: true,
                    });
                }, 500);
            }
        }
    }

    public render() {
        const {visible, hidden} = this.state;
        return (
            <div className={'pop-up-new-message-container' + (visible ? ' up' : '') + (hidden ? ' hidden' : '')}>
                <span className="pop-up-new-message" onClick={this.props.onClick}>
                    {i18n.t('message.unread_messages')}
                </span>
                <div className="arrow-icon">
                    <ExpandMoreRounded/>
                </div>
            </div>
        );
    }
}

export default PopUpNewMessage;
