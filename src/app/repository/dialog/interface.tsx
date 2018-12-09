import {Dialog} from '../../services/sdk/messages/core.types_pb';

interface IDialog extends Dialog.AsObject {
    action_code?: number;
    action_data?: any;
    last_update?: number;
    preview?: string;
    target_id?: string;
    preview_me?: boolean;
    sender_id?: string;
}

export {IDialog};
