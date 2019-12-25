/*
    Creation Time: 2019 - Dec - 15
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import Dexie from 'dexie';
import {ILabel, ILabelItem} from "../../../repository/label/interface";

export class DexieLabelDB extends Dexie {
    // @ts-ignore
    public labels: Dexie.Table<ILabel, number>;
    // @ts-ignore
    public labelItems: Dexie.Table<ILabelItem, number>;

    constructor() {
        super('label_db');
        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            labelItems: `++id,[lid+mid]`,
            labels: `id`,
        });

        this.labels = this.table('labels');
        this.labelItems = this.table('labelItems');
    }
}
