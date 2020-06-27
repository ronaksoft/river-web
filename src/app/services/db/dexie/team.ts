/*
    Creation Time: 2020 - June - 27
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import Dexie from 'dexie';
import {ITeam} from "../../../repository/team/interface";

export class DexieTeamDB extends Dexie {
    // @ts-ignore
    public teams: Dexie.Table<ITeam, string>;

    constructor() {
        super('team_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            teams: `id`,
        });

        this.teams = this.table('teams');
    }
}
