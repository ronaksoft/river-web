/*
    Creation Time: 2020 - Feb - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {IMessage} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/chat.core.types_pb';
import {C_REPLY_ACTION} from "../../repository/message/consts";
import {ReplyInlineMarkup,} from "../../services/sdk/messages/chat.core.message.markups_pb";
import BotLayout from "../BotLayout";

import './style.scss';

interface IProps {
    message: IMessage;
    peer: InputPeer | null;
}

interface IState {
    fileName: string;
}

class MessageBot extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            fileName: '',
        };
    }

    public render() {
        const {message} = this.props;
        if (!message.replydata) {
            return '';
        }
        if (message.replymarkup === C_REPLY_ACTION.ReplyInlineMarkup) {
            const replyInlineMarkup: ReplyInlineMarkup.AsObject = message.replydata;
            return (
                <BotLayout rows={replyInlineMarkup.rowsList} prefix="message-bot"/>
            );
        }
        return '';
    }
}

export default MessageBot;
