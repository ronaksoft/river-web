/*
    Creation Time: 2019 - Dec - 15
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import Dexie from 'dexie';
import {ILabel} from "../../../repository/label/interface";

export class DexieLabelDB extends Dexie {
    // @ts-ignore
    public labels: Dexie.Table<ILabel, number>;

    constructor() {
        super('label_db');
        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            labels: `id`,
        });

        this.labels = this.table('labels');
    }
}
