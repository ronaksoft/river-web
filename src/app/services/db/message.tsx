import {DexieMessageDB} from './dexie/message';

export default class MessageDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new MessageDB();
        }

        return this.instance;
    }

    private static instance: MessageDB;
    private db: DexieMessageDB;

    private constructor() {
        this.db = new DexieMessageDB();

        // setInterval(this.viewCleanup, 60000);
    }

    public getDB() {
        return this.db;
    }

    // private viewCleanup = () => {
    //     //
    // }
}
