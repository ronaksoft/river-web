import {DexieDialogDB} from './dexie/dialog';

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
        this.db.open();
        // setInterval(this.viewCleanup, 60000);
    }

    public getDB() {
        return this.db;
    }
    //
    // private viewCleanup = () => {
    //     //
    // }
}
