/*
    Creation Time: 2018 - Dec - 10
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {IMessage} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/chat.core.types_pb';
import UserName from '../UserName';
import GroupName from '../GroupName';
import i18n from '../../services/i18n';

import './style.css';

interface IProps {
    message: IMessage;
    onDoubleClick?: (e: any) => void;
    peer: InputPeer | null;
}

interface IState {
    message: IMessage;
    mode: 'user' | 'group';
    peer: InputPeer | null;
}

class MessageForwarded extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        const id = props.message.fwdsenderid || '';
        this.state = {
            message: props.message,
            mode: (id.indexOf('-') === -1 ? 'user' : 'group'),
            peer: props.peer,
        };
    }

    public componentWillReceiveProps(newProps: IProps) {
        if (this.state.message !== newProps.message) {
            this.setState({
                message: newProps.message,
            });
        }
    }

    public render() {
        const {message, mode} = this.state;
        if (!message.fwdsenderid || message.fwdsenderid === '0') {
            return '';
        }
        return (
            <div className="message-forwarded" onDoubleClick={this.onDoubleClickHandler}>
                <div className="forwarded-container">
                    <div className="forwarded-message-wrapper">
                        <span className="forwarded-bar"/>
                        {Boolean(mode === 'user') && <div className="forward-message-detail">
                            <UserName id={message.fwdsenderid} you={true}
                                      prefix={i18n.t('message.forwarded_message_from')} defaultString="Forwarded message"/>
                        </div>}
                        {Boolean(mode === 'group') && <div className="forward-message-detail">
                            <GroupName id={message.fwdsenderid} prefix="Forwarded from "
                                       defaultString={i18n.t('message.forwarded_message')} noIcon={true}/>
                        </div>}
                    </div>
                </div>
            </div>
        );
    }


    private onDoubleClickHandler = (e: any) => {
        if (this.props.onDoubleClick) {
            this.props.onDoubleClick(e);
        }
    }
}

export default MessageForwarded;
