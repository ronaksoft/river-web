import {Dialog} from "../../services/sdk/messages/core.types_pb";

interface IDialog extends Dialog.AsObject {
    _id?: number;
    last_update?: number;
}

export {IDialog};