/*
    Creation Time: 2020 - June - 01
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {DexieTopPeerDB} from "./dexie/top_peer";

export default class TopPeerDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new TopPeerDB();
        }

        return this.instance;
    }

    private static instance: TopPeerDB;
    private db: DexieTopPeerDB;

    private constructor() {
        this.db = new DexieTopPeerDB();
        this.db.open();
    }

    public getDB() {
        return this.db;
    }
}
