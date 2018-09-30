import {UserMessage} from "../../services/sdk/messages/core.types_pb";

interface IMessage extends UserMessage.AsObject {
    _id?: string;
    _rev?: string;
    me?: boolean;
}

export {IMessage};