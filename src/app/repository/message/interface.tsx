/*
    Creation Time: 2018 - Aug - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {UserMessage} from '../../services/sdk/messages/chat.core.types_pb';

interface IMessage extends UserMessage.AsObject {
    actiondata?: any;
    attributes?: any[];
    avatar?: boolean;
    downloaded?: boolean;
    error?: boolean;
    me?: boolean;
    mediadata?: any;
    mention_me?: boolean;
    rtl?: boolean;
    saved?: boolean;
    savedPath?: string;
    temp?: boolean;
}

interface IPendingMessage {
    id: number;
    message_id: number;
    file_ids?: string[];
    data?: any;
}

interface IMessageWithCount {
    count: number;
    lastId: number;
    messages: IMessage[];
}

export {IMessage, IPendingMessage, IMessageWithCount};
