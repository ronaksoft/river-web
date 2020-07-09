/*
    Creation Time: 2020 - June - 01
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import Dexie from 'dexie';
import {ITopPeer} from "../../../repository/topPeer/interface";

export class DexieTopPeerDB extends Dexie {
    // @ts-ignore
    public search: Dexie.Table<ITopPeer, [string, string]>;
    // @ts-ignore
    public forward: Dexie.Table<ITopPeer, [string, string]>;
    // @ts-ignore
    public botinline: Dexie.Table<ITopPeer, [string, string]>;
    // @ts-ignore
    public botmessage: Dexie.Table<ITopPeer, [string, string]>;

    constructor() {
        super('top_peer_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            botinline: `[teamid+id],[teamid+rate],[teamid+lastupdate]`,
            botmessage: `[teamid+id],[teamid+rate],[teamid+lastupdate]`,
            forward: `[teamid+id],[teamid+rate],[teamid+lastupdate]`,
            search: `[teamid+id],[teamid+rate],[teamid+lastupdate]`,
        });

        this.search = this.table('search');
        this.forward = this.table('forward');
        this.botinline = this.table('botinline');
        this.botmessage = this.table('botmessage');
    }
}
