import {Dialog} from '../../services/sdk/messages/core.types_pb';
import {IMessage} from '../message/interface';

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

interface IDraft {
    peerid: string;
    text: string;
    mode?: number;
    message?: IMessage;
}

export {IDialog, IDialogWithUpdateId, IDraft};
