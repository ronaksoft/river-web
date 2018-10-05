import {Dialog} from "../../services/sdk/messages/core.types_pb";

interface IDialog extends Dialog.AsObject {
    _id?: string;
    _rev?: string;
    last_update?: number;
    preview?: string;
    user_id?: number;
}

export {IDialog};