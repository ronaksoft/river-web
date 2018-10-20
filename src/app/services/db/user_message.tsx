import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import UniqueId from '../uniqueId';

export default class UserMessageDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UserMessageDB();
        }

        return this.instance;
    }

    private static instance: UserMessageDB;
    private db: any;
    private uniqueId: UniqueId;

    private constructor() {
        this.uniqueId = UniqueId.getInstance();
        PouchDB.plugin(PouchDBFind);
        this.db = new PouchDB("user_message", {
            auto_compaction: true,
        });
        this.db.info().then((info: any) => {
            this.uniqueId.setLastId('msg', info.doc_count);
        });
        this.db.createIndex({
            index: {
                fields: ['peerid'],
            }
        }).then((result: any) => {
            // window.console.warn(result);
        });
        this.db.createIndex({
            index: {
                fields: ['id'],
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
            window.console.log('Message viewCleanup', err);
        });
    }
}
