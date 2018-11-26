import {IUser} from '../../../repository/user/interface';
import {IGroup} from '../../../repository/group/interface';
import {IContact} from '../../../repository/contact/interface';
import Dexie from 'dexie';

export class DexieUserDB extends Dexie {
    public contacts: Dexie.Table<IContact, string>;
    public groups: Dexie.Table<IGroup, string>;
    public users: Dexie.Table<IUser, string>;

    constructor() {
        super('user_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            contacts: `id,firstname,lastname,phone,username`,
            groups: `id,title`,
            users: `id,firstname,lastname`,
        });
    }
}
