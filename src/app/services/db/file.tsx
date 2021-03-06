/*
    Creation Time: 2019 - Jan - 12
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {DexieFileDB} from './dexie/file';
import {dbHealthCheck} from "./index";

export default class FileDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new FileDB();
        }

        return this.instance;
    }

    private static instance: FileDB;
    private readonly db: DexieFileDB;

    private constructor() {
        this.db = new DexieFileDB();
        this.db.open();
        dbHealthCheck(this.db);
    }

    public getDB() {
        return this.db;
    }
}
