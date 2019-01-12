/*
    Creation Time: 2019 - Jan - 12
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import Dexie from 'dexie';
import {IFile, ITempFile} from '../../../repository/file/interface';

export class DexieFileDB extends Dexie {
    public files: Dexie.Table<IFile, string>;
    public temps: Dexie.Table<ITempFile, string>;

    constructor() {
        super('file_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            files: `id`,
            temps: `[id+part]`,
        });
    }
}
