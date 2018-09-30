import {Dialog} from "../../services/sdk/messages/core.types_pb";

interface IDialog extends Dialog.AsObject {
    _id?: string;
    last_update?: number;
}

export {IDialog};