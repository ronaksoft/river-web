import {IUser} from '../../../repository/user/interface';
import {IContact} from '../../../repository/contact/interface';
import Dexie from 'dexie';

export class DexieUserDB extends Dexie {
    public users: Dexie.Table<IUser, string>;
    public contacts: Dexie.Table<IContact, string>;

    constructor() {
        super('user_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            contacts: `id,firstname,lastname,phone,username`,
            users: `id,firstname,lastname`,
        });
    }
}
