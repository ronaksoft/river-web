/*
    Creation Time: 2018 - Dec - 10
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {IMessage} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/core.types_pb';
import UserName from '../UserName';
import i18n from '../../services/i18n';

import './style.scss';

interface IProps {
    message: IMessage;
    onDoubleClick?: (e: any) => void;
    peer: InputPeer | null;
}

const MessageForwarded = ({message, peer, onDoubleClick}: IProps) => {
    if ((!message.fwdsenderid || message.fwdsenderid === '0') && !message.fwd) {
        return null;
    }
    return (
        <div className="message-forwarded" onDoubleClick={onDoubleClick}>
            <div className="forwarded-container">
                <div className="forwarded-message-wrapper">
                    <span className="forwarded-bar"/>
                    <div className="forward-message-detail">
                        {Boolean(!message.fwdsenderid || message.fwdsenderid === '0') ?
                            <span>{i18n.t('message.forwarded_message')}</span>
                            : <UserName id={message.fwdsenderid} you={true} noIcon={true}
                                        prefix={i18n.t('message.forwarded_message_from')}
                                        defaultString={i18n.t('message.forwarded_message')}/>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageForwarded;
