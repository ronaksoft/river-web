/*
    Creation Time: 2018 - Sep - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {Dialog} from '../../services/sdk/messages/chat.core.types_pb';
import {IMessage} from '../message/interface';

interface IDialog extends Dialog.AsObject {
    action_code?: number;
    action_data?: any;
    force?: boolean;
    last_update?: number;
    preview?: string;
    preview_icon?: number;
    preview_me?: boolean;
    preview_rtl?: boolean;
    saved_messages?: boolean;
    sender_id?: string;
    target_id?: string;
}

interface IDialogWithUpdateId {
    dialogs: IDialog[];
    updateid: number;
}

interface IDraft {
    peerid: string;
    text: string;
    mode?: number;
    message?: IMessage;
}

export {IDialog, IDialogWithUpdateId, IDraft};
