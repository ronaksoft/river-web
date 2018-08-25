import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import UniqueId from '../uniqueId';

export default class DB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new DB();
        }

        return this.instance;
    }

    private static instance: DB;
    private db: any;
    private uniqueId: UniqueId;

    private constructor() {
        this.uniqueId = UniqueId.getInstance();
        PouchDB.plugin(PouchDBFind);
        this.db = new PouchDB("nested_chat");
        this.db.info().then((info: any) => {
            this.uniqueId.setLastId('msg', info.doc_count);
        });
        this.db.createIndex({
            index: {
                fields: ['conversation_id'],
            }
        }).then((result: any) => {
            window.console.warn(result);
        });
        this.db.createIndex({
            index: {
                fields: ['timestamp'],
            }
        }).then((result: any) => {
            window.console.warn(result);
        });
    }

    public getDB() {
        return this.db;
    }

}
