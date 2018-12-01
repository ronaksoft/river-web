import {UserMessage} from '../../services/sdk/messages/core.types_pb';
import {
    MessageActionClearHistory,
    MessageActionContactRegistered,
    MessageActionGroupAddUser,
    MessageActionGroupCreated,
    MessageActionGroupDeleteUser,
    MessageActionGroupTitleChanged
} from '../../services/sdk/messages/core.message_actions_pb';

interface IMessage extends UserMessage.AsObject {
    me?: boolean;
    avatar?: boolean;
    rtl?: boolean;
    temp?: boolean;
    actiondata?: MessageActionClearHistory.AsObject |
        MessageActionContactRegistered.AsObject |
        MessageActionGroupAddUser.AsObject |
        MessageActionGroupCreated.AsObject |
        MessageActionGroupDeleteUser.AsObject |
        MessageActionGroupTitleChanged.AsObject;
}

export {IMessage};
