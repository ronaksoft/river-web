import {UserMessage} from "../../services/sdk/messages/core.types_pb";

interface IMessage extends UserMessage.AsObject {
    _id?: number;
    me?: boolean;
}

export {IMessage};