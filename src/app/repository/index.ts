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

    private constructor() {
        this.userDB = UserDB.getInstance().getDB();
        this.messageDB = MessageDB.getInstance().getDB();
        this.dialogDB = DialogDB.getInstance().getDB();
        this.fileDB = FileDB.getInstance().getDB();
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
        return Promise.all(promises);
    }
}
