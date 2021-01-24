/*
    Creation Time: 2018 - Aug - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {InputMediaType, UserMessage} from "../../services/sdk/messages/core.types_pb";
import {ReactionList} from "../../services/sdk/messages/chat.messages_pb";

export interface IMessage extends Partial<UserMessage.AsObject> {
    actiondata?: any;
    added_labels?: number[];
    attributes?: any[];
    avatar?: boolean;
    deleted_reply?: boolean;
    downloaded?: boolean;
    em_le?: number;
    error?: boolean;
    mark_as_sent?: boolean;
    me?: boolean;
    mediadata?: any;
    mention_me?: boolean;
    orientation?: number;
    random_id?: number;
    reacted?: boolean;
    reaction_list?: IReactionInfo[];
    reaction_updated?: boolean;
    removed_labels?: number[];
    replydata?: any;
    req_id?: number;
    rtl?: boolean;
    saved?: boolean;
    saved_path?: string;
    last_modified?: string;
    temp_file?: Blob;
}

export interface IPendingMessage {
    id: number;
    message_id: number;
    file_ids?: string[];
    data?: any;
    type?: InputMediaType;
}

export interface IMessageWithCount {
    count: number;
    lastId: number;
    messages: IMessage[];
}

export interface IMessageBotCol {
    constructor?: number;
    buttondata?: any;
}

export interface IReactionInfo extends Partial<ReactionList.AsObject> {
    counter?: number;
}