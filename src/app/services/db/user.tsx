import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import {IUser} from "../../repository/user/interface";

export default class UserDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UserDB();
        }

        return this.instance;
    }

    private static instance: UserDB;
    private db: any;
    private users: object = {};

    private constructor() {
        PouchDB.plugin(PouchDBFind);
        this.db = new PouchDB("user");
    }

    public getDB() {
        return this.db;
    }

    public setUser(user: IUser) {
        if (user._id) {
            this.users[user._id] = user;
        }
    }

    public getUser(id: number) {
        return this.users[id];
    }

}
