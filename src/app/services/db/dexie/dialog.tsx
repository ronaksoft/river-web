/*
    Creation Time: 2018 - Nov - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import Dexie from 'dexie';
import {IDialog, IDraft} from '../../../repository/dialog/interface';

export class DexieDialogDB extends Dexie {
    public dialogs: Dexie.Table<IDialog, string>;
    public drafts: Dexie.Table<IDraft, string>;

    constructor() {
        super('dialog_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            dialogs: `peerid,last_update`,
            drafts: `peerid`,
        });
    }
}
