/*
    Creation Time: 2018 - Sep - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {DexieDialogDB} from './dexie/dialog';

export default class DialogDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new DialogDB();
        }

        return this.instance;
    }

    private static instance: DialogDB;
    private db: DexieDialogDB;

    private constructor() {
        this.db = new DexieDialogDB();
        this.db.open();
        // setInterval(this.viewCleanup, 60000);
    }

    public getDB() {
        return this.db;
    }
    //
    // private viewCleanup = () => {
    //     //
    // }
}
