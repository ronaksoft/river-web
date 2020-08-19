/*
    Creation Time: 2018 - Oct - 10
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import UserDB from '../services/db/user';
import MessageDB from '../services/db/message';
import DialogDB from '../services/db/dialog';
import FileDB from '../services/db/file';
import {DexieUserDB} from '../services/db/dexie/user';
import {DexieMessageDB} from '../services/db/dexie/message';
import {DexieDialogDB} from '../services/db/dexie/dialog';
import {DexieFileDB} from '../services/db/dexie/file';
import {DexieLabelDB} from "../services/db/dexie/label";
import {DexieMediaDB} from "../services/db/dexie/media";
import MediaDB from "../services/db/media";
import LabelDB from "../services/db/label";
import {DexieTopPeerDB} from "../services/db/dexie/top_peer";
import TopPeerDB from "../services/db/top_peer";
import {DexieGifDB} from "../services/db/dexie/gif";
import GifDB from "../services/db/gif";

export default class MainRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new MainRepo();
        }

        return this.instance;
    }

    private static instance: MainRepo;

    private userDB: DexieUserDB;
    private messageDB: DexieMessageDB;
    private dialogDB: DexieDialogDB;
    private fileDB: DexieFileDB;
    private mediaDB: DexieMediaDB;
    private labelDB: DexieLabelDB;
    private topPeerDB: DexieTopPeerDB;
    private gifDB: DexieGifDB;

    private constructor() {
        this.userDB = UserDB.getInstance().getDB();
        this.messageDB = MessageDB.getInstance().getDB();
        this.dialogDB = DialogDB.getInstance().getDB();
        this.fileDB = FileDB.getInstance().getDB();
        this.mediaDB = MediaDB.getInstance().getDB();
        this.labelDB = LabelDB.getInstance().getDB();
        this.topPeerDB = TopPeerDB.getInstance().getDB();
        this.gifDB = GifDB.getInstance().getDB();
    }

    public destroyDB(): Promise<any> {
        const promises = [];
        // @ts-ignore
        promises.push(this.userDB.delete());
        // @ts-ignore
        promises.push(this.messageDB.delete());
        // @ts-ignore
        promises.push(this.dialogDB.delete());
        // @ts-ignore
        promises.push(this.fileDB.delete());
        // @ts-ignore
        promises.push(this.mediaDB.delete());
        // @ts-ignore
        promises.push(this.labelDB.delete());
        // @ts-ignore
        promises.push(this.topPeerDB.delete());
        // @ts-ignore
        promises.push(this.gifDB.delete());
        return Promise.all(promises);
    }

    public destroyMessageRelatedDBs(): Promise<any> {
        const promises = [];
        // @ts-ignore
        promises.push(this.messageDB.delete());
        // @ts-ignore
        promises.push(this.dialogDB.delete());
        return Promise.all(promises);
    }
}
