import {Dialog} from '../../services/sdk/messages/core.types_pb';

interface IDialog extends Dialog.AsObject {
    action_code?: number;
    action_data?: any;
    force?: boolean;
    last_update?: number;
    preview?: string;
    preview_me?: boolean;
    sender_id?: string;
    target_id?: string;
}

interface IDialogWithUpdateId {
    dialogs: IDialog[];
    updateid: number;
}

export {IDialog, IDialogWithUpdateId};
