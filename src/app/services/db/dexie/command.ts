/*
    Creation Time: 2020 - Dec - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {ICommand} from '../../../repository/command/interface';
import Dexie from 'dexie';

export class DexieCommandDB extends Dexie {
    // @ts-ignore
    public commands: Dexie.Table<ICommand, number>;

    constructor() {
        super('command_db');
        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            commands: `++id`,
        });

        this.commands = this.table('commands');
    }
}
