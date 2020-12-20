/*
    Creation Time: 2020 - June - 13
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {DexieGifDB} from './dexie/gif';

export default class GifDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new GifDB();
        }

        return this.instance;
    }

    private static instance: GifDB;
    private readonly db: DexieGifDB;

    private constructor() {
        this.db = new DexieGifDB();
        this.db.open();
    }

    public getDB() {
        return this.db;
    }
}
