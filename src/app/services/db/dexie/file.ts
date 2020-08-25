/*
    Creation Time: 2019 - Jan - 12
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import Dexie from 'dexie';
import {IFile, IFileMap, ITempFile} from '../../../repository/file/interface';

export class DexieFileDB extends Dexie {
    // @ts-ignore
    public files: Dexie.Table<IFile, string>;
    // @ts-ignore
    public temps: Dexie.Table<ITempFile, [string, number]>;
    // @ts-ignore
    public fileMap: Dexie.Table<IFileMap, string>;

    constructor() {
        super('file_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            fileMap: `id,*msg_ids`,
            files: `id,hash`,
            temps: `[id+part]`,
        });

        this.files = this.table('files');
        this.temps = this.table('temps');
        this.fileMap = this.table('fileMap');
    }
}
