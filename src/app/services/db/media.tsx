/*
    Creation Time: 2019 - Feb - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {DexieMediaDB} from './dexie/media';

export default class MediaDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new MediaDB();
        }

        return this.instance;
    }

    private static instance: MediaDB;
    private readonly db: DexieMediaDB;

    private constructor() {
        this.db = new DexieMediaDB();
        this.db.open();
    }

    public getDB() {
        return this.db;
    }
}
