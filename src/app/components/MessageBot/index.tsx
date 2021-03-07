/*
    Creation Time: 2020 - Feb - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import {IMessage} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/core.types_pb';
import {C_REPLY_ACTION} from "../../repository/message/consts";
import {ReplyInlineMarkup,} from "../../services/sdk/messages/chat.messages.markups_pb";
import BotLayout from "../BotLayout";

import './style.scss';

export default function MessageBot({message, peer, onAction}: { message: IMessage, peer: InputPeer | null, onAction?: (cmd: number, data: any, msgId?: number) => void }) {
    const actionHandler = (cmd: number, data: any) => {
        if (onAction) {
            onAction(cmd, data, message.id || 0);
        }
    };

    if (message.replymarkup === C_REPLY_ACTION.ReplyInlineMarkup) {
        const replyInlineMarkup: ReplyInlineMarkup.AsObject = message.replydata;
        return (
            <BotLayout rows={replyInlineMarkup.rowsList} prefix="message-bot" onAction={actionHandler}/>
        );
    }
    return <div/>;
}