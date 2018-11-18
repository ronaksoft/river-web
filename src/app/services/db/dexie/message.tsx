import Dexie from 'dexie';
import {IMessage} from '../../../repository/message/interface';

export class DexieMessageDB extends Dexie {
    public messages: Dexie.Table<IMessage, number>;

    constructor() {
        super('message_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            messages: `id,peerid,type`,
        });
    }
}
