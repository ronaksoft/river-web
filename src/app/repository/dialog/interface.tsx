import {Dialog} from '../../services/sdk/messages/core.types_pb';

interface IDialog extends Dialog.AsObject {
    last_update?: number;
    preview?: string;
    target_id?: string;
    preview_me?: boolean;
}

export {IDialog};
