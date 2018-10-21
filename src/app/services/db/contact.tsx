import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import {IContact} from "../../repository/contact/interface";

export default class ContactDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new ContactDB();
        }

        return this.instance;
    }

    private static instance: ContactDB;
    private db: any;
    private contacts: { [key: string]: IContact } = {};

    private constructor() {
        PouchDB.plugin(PouchDBFind);
        this.db = new PouchDB("user", {
            auto_compaction: true,
        });
    }

    public getDB() {
        return this.db;
    }

    public setContact(user: IContact) {
        this.contacts[user.id || 0] = user;
    }

    public getContact(id: string): IContact | null {
        return this.contacts[id];
    }

}
