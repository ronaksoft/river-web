import UserDB from '../services/db/user';
import MessageDB from '../services/db/message';
import DialogDB from '../services/db/dialog';
import {DexieUserDB} from '../services/db/dexie/user';
import {DexieMessageDB} from '../services/db/dexie/message';
import {DexieDialogDB} from '../services/db/dexie/dialog';

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

    private constructor() {
        this.userDB = UserDB.getInstance().getDB();
        this.messageDB = MessageDB.getInstance().getDB();
        this.dialogDB = DialogDB.getInstance().getDB();
    }

    public destroyDB(): Promise<any> {
        const promises = [];
        // @ts-ignore
        promises.push(this.userDB.delete());
        // @ts-ignore
        promises.push(this.messageDB.delete());
        // @ts-ignore
        promises.push(this.dialogDB.delete());
        return Promise.all(promises);
    }
}
