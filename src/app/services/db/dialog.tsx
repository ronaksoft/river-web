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
        this.db = new PouchDB("dialogs");
        this.db.createIndex({
            index: {
                fields: ['last_update'],
            }
        }).then((result: any) => {
            // window.console.warn(result);
        });
    }

    public getDB() {
        return this.db;
    }

}
