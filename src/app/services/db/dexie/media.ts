/*
    Creation Time: 2018 - Nov - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import Dexie from 'dexie';
import {IMedia} from '../../../repository/media/interface';

export class DexieMediaDB extends Dexie {
    // @ts-ignore
    public medias: Dexie.Table<IMedia, number>;

    constructor() {
        super('media_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            medias: `id,[teamid+peerid+peertype+id],[teamid+peerid+peertype+type+id]`,
        });

        this.medias = this.table('medias');
    }
}
