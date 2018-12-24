import {IContact} from '../contact/interface';
import {IDialog} from '../dialog/interface';

export interface IDialogWithContact {
    dialogs: IDialog[];
    contacts: IContact[];
}
