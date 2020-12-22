/*
    Creation Time: 2018 - Sep - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {IMessage} from '../message/interface';
import {Dialog} from "../../services/sdk/messages/core.types_pb";
import {PartialDeep} from "type-fest";

export interface IDialog extends PartialDeep<Dialog.AsObject> {
    action_code?: number;
    action_data?: any;
    force?: boolean;
    last_update?: number;
    pinned?: boolean;
    preview?: string;
    preview_icon?: number;
    preview_me?: boolean;
    preview_rtl?: boolean;
    saved_messages?: boolean;
    scroll_pos?: number;
    sender_id?: string;
    only_contact?: boolean;
    tiny_thumb?: string;
    add_unread_count?: number;
    add_mention_count?: number;
}

export interface IDialogWithUpdateId {
    dialogs: IDialog[];
    updateid: number;
}

export interface IDraft {
    peerid: string;
    text: string;
    mode?: number;
    message?: IMessage;
}

export interface IPeer {
    id: string;
    peerType: number;
}