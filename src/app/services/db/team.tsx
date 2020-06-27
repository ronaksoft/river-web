/*
    Creation Time: 2020 - June - 27
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {DexieTeamDB} from './dexie/team';

export default class TeamDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new TeamDB();
        }

        return this.instance;
    }

    private static instance: TeamDB;
    private db: DexieTeamDB;

    private constructor() {
        this.db = new DexieTeamDB();
        this.db.open();
    }

    public getDB() {
        return this.db;
    }
}
