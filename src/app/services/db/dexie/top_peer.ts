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
    public search: Dexie.Table<ITopPeer, string>;
    // @ts-ignore
    public forward: Dexie.Table<ITopPeer, string>;
    // @ts-ignore
    public botinline: Dexie.Table<ITopPeer, string>;
    // @ts-ignore
    public botmessage: Dexie.Table<ITopPeer, string>;

    constructor() {
        super('top_peer_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            botinline: `id,[rate+id],[lastupdate+id]`,
            botmessage: `id,[rate+id],[lastupdate+id]`,
            forward: `id,[rate+id],[lastupdate+id]`,
            search: `id,[rate+id],[lastupdate+id]`,
        });

        this.search = this.table('search');
        this.forward = this.table('forward');
        this.botinline = this.table('botinline');
        this.botmessage = this.table('botmessage');
    }
}
