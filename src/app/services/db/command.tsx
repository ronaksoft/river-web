/*
    Creation Time: 2020 - Dec - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {DexieCommandDB} from "./dexie/command";

export default class CommandDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new CommandDB();
        }

        return this.instance;
    }

    private static instance: CommandDB;
    private readonly db: DexieCommandDB;

    private constructor() {
        this.db = new DexieCommandDB();
        this.db.open();
    }

    public getDB() {
        return this.db;
    }
}
