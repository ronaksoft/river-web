import PouchDB from 'pouchdb';

export default class DB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new DB();
        }

        return this.instance;
    }

    private static instance: DB;
    private db: any;

    private constructor() {
        this.db = new PouchDB("nested_chat");
        this.db.info().then((info: any) => {
            window.console.log(info);
        });
    }

    public getDB() {
        return this.db;
    }
}
