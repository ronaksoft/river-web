/*
    Creation Time: 2018 - Nov - 18
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import Dexie from 'dexie';
import {IMessage, IPendingMessage} from '../../../repository/message/interface';

export class DexieMessageDB extends Dexie {
    // @ts-ignore
    public messages: Dexie.Table<IMessage, number>;
    // @ts-ignore
    public pendingMessages: Dexie.Table<IPendingMessage, number>;

    constructor() {
        super('message_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //

        this.version(1).stores({
            messages: `id,[teamid+peerid+peertype+id]`,
            pendingMessages: `id,message_id`,
        });

        this.messages = this.table('messages');
        this.pendingMessages = this.table('pendingMessages');
    }
}
