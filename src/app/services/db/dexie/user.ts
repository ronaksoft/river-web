/*
    Creation Time: 2018 - Nov - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {IUser} from '../../../repository/user/interface';
import {IGroup} from '../../../repository/group/interface';
import Dexie from 'dexie';

export class DexieUserDB extends Dexie {
    public groups: Dexie.Table<IGroup, string>;
    public users: Dexie.Table<IUser, string>;

    constructor() {
        super('user_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            groups: `id,title`,
            users: `id,[is_contact+username]`,
        });
    }
}
