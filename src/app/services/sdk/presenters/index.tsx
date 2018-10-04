import {C_MSG} from '../const';
import {AuthSentCode, AuthCheckedPhone, AuthAuthorization, AuthRecalled} from '../messages/api.auth_pb';
import {ContactsImported, ContactsMany} from '../messages/api.contacts_pb';
import {Bool, Error} from '../messages/core.messages_pb';
import {MessagesDialogs, MessagesMany, MessagesSent} from '../messages/api.messages_pb';
import {Dialog} from '../messages/core.types_pb';
import {
    UpdateDifference,
    UpdateNewMessage,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox, UpdateState,
    UpdateUserTyping
} from '../messages/api.updates_pb';

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
