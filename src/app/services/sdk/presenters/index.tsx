/*
    Creation Time: 2018 - Sep - 09
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {C_MSG} from '../const';
import {AuthSentCode, AuthCheckedPhone, AuthAuthorization, AuthRecalled} from '../messages/chat.api.auth_pb';
import {ContactsImported, ContactsMany} from '../messages/chat.api.contacts_pb';
import {Bool, Error} from '../messages/chat.core.types_pb';
import {MessagesDialogs, MessagesMany, MessagesSent} from '../messages/chat.api.messages_pb';
import {Dialog, Group, GroupFull, PeerNotifySettings, User} from '../messages/chat.core.types_pb';
import {
    UpdateDifference,
    UpdateNewMessage,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox, UpdateState,
    UpdateUserTyping
} from '../messages/chat.api.updates_pb';
import {File} from '../messages/chat.api.files_pb';
import {AccountAuthorizations} from '../messages/chat.api.accounts_pb';
import {SystemInfo, SystemServerTime} from '../messages/chat.api.system_pb';

export default class UniqueId {
    public static getMessage(constructor: number, data: Uint8Array): any {
        switch (constructor) {
            case C_MSG.AuthSentCode:
                return AuthSentCode.deserializeBinary(data);
            case C_MSG.AuthCheckedPhone:
                return AuthCheckedPhone.deserializeBinary(data);
            case C_MSG.AuthAuthorization:
                return AuthAuthorization.deserializeBinary(data);
            case C_MSG.AuthRecalled:
                return AuthRecalled.deserializeBinary(data);
            case C_MSG.ContactsImported:
                return ContactsImported.deserializeBinary(data);
            case C_MSG.Error:
                return Error.deserializeBinary(data);
            case C_MSG.ContactsMany:
                return ContactsMany.deserializeBinary(data);
            case C_MSG.MessagesDialogs:
                return MessagesDialogs.deserializeBinary(data);
            case C_MSG.Dialog:
                return Dialog.deserializeBinary(data);
            case C_MSG.MessagesSent:
                return MessagesSent.deserializeBinary(data);
            case C_MSG.MessagesMany:
                return MessagesMany.deserializeBinary(data);
            case C_MSG.Bool:
                return Bool.deserializeBinary(data);
            case C_MSG.UpdateState:
                return UpdateState.deserializeBinary(data);
            case C_MSG.UpdateDifference:
                return UpdateDifference.deserializeBinary(data);
            case C_MSG.Group:
                return Group.deserializeBinary(data);
            case C_MSG.GroupFull:
                return GroupFull.deserializeBinary(data);
            case C_MSG.User:
                return User.deserializeBinary(data);
            case C_MSG.PeerNotifySettings:
                return PeerNotifySettings.deserializeBinary(data);
            case C_MSG.File:
                return File.deserializeBinary(data);
            case C_MSG.AccountAuthorizations:
                return AccountAuthorizations.deserializeBinary(data);
            case C_MSG.SystemInfo:
                return SystemInfo.deserializeBinary(data);
            case C_MSG.SystemServerTime:
                return SystemServerTime.deserializeBinary(data);
            default:
                return null;
        }
    }

    public static getUpdate(constructor: number, data: Uint8Array): any {
        switch (constructor) {
            case C_MSG.UpdateNewMessage:
                return UpdateNewMessage.deserializeBinary(data);
            case C_MSG.UpdateReadHistoryInbox:
                return UpdateReadHistoryInbox.deserializeBinary(data);
            case C_MSG.UpdateReadHistoryOutbox:
                return UpdateReadHistoryOutbox.deserializeBinary(data);
            case C_MSG.UpdateUserTyping:
                return UpdateUserTyping.deserializeBinary(data);
            case C_MSG.UpdateMessageEdited:
            case C_MSG.UpdateMessageID:
            default:
                return null;
        }
    }
}
