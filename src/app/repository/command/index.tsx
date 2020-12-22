/*
    Creation Time: 2020 - Dec - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import DB from '../../services/db/command';
import {DexieCommandDB} from "../../services/db/dexie/command";
import {ICommand} from "./interface";

export default class CommandRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new CommandRepo();
        }

        return this.instance;
    }

    private static instance: CommandRepo;

    private dbService: DB;
    private db: DexieCommandDB;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
    }

    public create(command: ICommand) {
        return this.db.commands.put(command);
    }

    public remove(id: number) {
        return this.db.commands.delete(id);
    }

    public removeMany(ids: number[]) {
        return this.db.commands.bulkDelete(ids);
    }

    public list(timestamp: number) {
        return this.db.commands.filter((o) => {
            return o.timestamp < timestamp;
        }).toArray();
    }
}
