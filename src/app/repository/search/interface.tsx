/*
    Creation Time: 2018 - Dec - 24
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {IUser} from '../user/interface';
import {IDialog} from '../dialog/interface';

export interface IDialogWithContact {
    dialogs: IDialog[];
    contacts: IUser[];
}
