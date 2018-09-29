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
        this.db = new PouchDB("user_message");
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
        // this.db.createIndex({
        //     index: {
        //         fields: ['peerid', 'createdon'],
        //     }
        // }).then((result: any) => {
        //     // window.console.warn(result);
        // });
    }

    public getDB() {
        return this.db;
    }

}
