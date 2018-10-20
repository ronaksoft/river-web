import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

export default class UserMessageDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UserMessageDB();
        }

        return this.instance;
    }

    private static instance: UserMessageDB;
    private db: any;

    private constructor() {
        PouchDB.plugin(PouchDBFind);
        this.db = new PouchDB("dialogs", {
            auto_compaction: true,
        });
        this.db.createIndex({
            index: {
                fields: ['last_update'],
            }
        }).then((result: any) => {
            // window.console.warn(result);
        });
        this.db.createIndex({
            index: {
                fields: ['_id'],
            }
        }).then((result: any) => {
            // window.console.warn(result);
        });

        setInterval(this.viewCleanup, 60000);
    }

    public getDB() {
        return this.db;
    }

    private viewCleanup = () => {
        this.db.viewCleanup().then(() => {
            // window.console.log(err);
        }).catch((err: any) => {
            window.console.log('Dialog viewCleanup', err);
        });
    }
}
