import {UserMessage} from '../../services/sdk/messages/core.types_pb';

interface IMessage extends UserMessage.AsObject {
    me?: boolean;
    avatar?: boolean;
    rtl?: boolean;
    temp?: boolean;
    actiondata?: any;
}

export {IMessage};
