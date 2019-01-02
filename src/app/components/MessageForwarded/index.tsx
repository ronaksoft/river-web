/*
    Creation Time: 2018 - Dec - 10
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {IMessage} from "../../repository/message/interface";
import {InputPeer} from "../../services/sdk/messages/core.types_pb";
import UserName from '../UserName';
import GroupName from '../GroupName';

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

class MessageForwarded extends React.Component<IProps, IState> {
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
                        {Boolean(mode === 'user') && <div className="preview-message">
                            <UserName id={message.fwdsenderid} you={true}
                                      prefix="Forwarded from " defaultString="Forwarded message"/>
                        </div>}
                        {Boolean(mode === 'group') && <div className="preview-message">
                            <GroupName id={message.fwdsenderid} prefix="Forwarded from "
                                       defaultString="Forwarded message" noIcon={true}/>
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
