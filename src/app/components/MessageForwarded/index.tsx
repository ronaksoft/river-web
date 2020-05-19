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

import './style.scss';

interface IProps {
    message: IMessage;
    onDoubleClick?: (e: any) => void;
    peer: InputPeer | null;
}

const MessageForwarded = ({message, peer, onDoubleClick}: IProps) => {
    const mode = ((message.fwdsenderid || '').indexOf('-') === -1 ? 'user' : 'group');
    if (!message.fwdsenderid || message.fwdsenderid === '0') {
        return null;
    }
    return (
        <div className="message-forwarded" onDoubleClick={onDoubleClick}>
            <div className="forwarded-container">
                <div className="forwarded-message-wrapper">
                    <span className="forwarded-bar"/>
                    {Boolean(mode === 'user') && <div className="forward-message-detail">
                        <UserName id={message.fwdsenderid} you={true} noIcon={true}
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

export default MessageForwarded;
