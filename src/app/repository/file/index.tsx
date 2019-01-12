/*
    Creation Time: 2019 - Jan - 12
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import DB from '../../services/db/file';
import {ITempFile} from './interface';
import {DexieFileDB} from '../../services/db/dexie/file';

export default class FileRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new FileRepo();
        }

        return this.instance;
    }

    private static instance: FileRepo;

    private dbService: DB;
    private db: DexieFileDB;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
    }

    public getTemp(id: string, part: number): Promise<ITempFile> {
        return this.db.temps.where('[id+part]').equals([id, part]).filter((item) => {
            return item.part === part;
        }).first();
    }

    public setTemp(tempFile: ITempFile) {
        return this.db.temps.put(tempFile);
    }
}
