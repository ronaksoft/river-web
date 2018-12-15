import Dexie from 'dexie';
import {IMessage} from '../../../repository/message/interface';
import {IMessageHole} from '../../../repository/messageHole/interface';

export class DexieMessageDB extends Dexie {
    public messageHoles: Dexie.Table<IMessageHole, any>;
    public messages: Dexie.Table<IMessage, number>;

    constructor() {
        super('message_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            // messageHoles: `[peerid+min+max]`,
            messages: `id,peerid,[peerid+id]`,
        });
    }
}
