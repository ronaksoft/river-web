/*
    Creation Time: 2020 - June - 13
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import Dexie from 'dexie';
import {IGif} from "../../../repository/gif/interface";

export class DexieGifDB extends Dexie {
    // @ts-ignore
    public gifs: Dexie.Table<IGif, string>;

    constructor() {
        super('gif_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            gifs: `id,last_used`,
        });

        this.gifs = this.table('gifs');
    }
}
