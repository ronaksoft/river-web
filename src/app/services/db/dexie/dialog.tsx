import Dexie from 'dexie';
import {IDialog} from '../../repository/dialog/interface';

export class DexieDialogDB extends Dexie {
    public dialogs: Dexie.Table<IDialog, string>;

    constructor() {
        super('dialog_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            messages: `id,peerid,type`,
        });
    }
}

export default class DialogDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new DialogDB();
        }

        return this.instance;
    }

    private static instance: DialogDB;
    private db: DexieDialogDB;

    private constructor() {
        this.db = new DexieDialogDB();

        setInterval(this.viewCleanup, 60000);
    }

    public getDB() {
        return this.db;
    }

    private viewCleanup = () => {
        //
    }
}
