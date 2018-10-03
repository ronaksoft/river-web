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
    private users: { [key: number]: IUser } = {};

    private constructor() {
        PouchDB.plugin(PouchDBFind);
        this.db = new PouchDB("user");
    }

    public getDB() {
        return this.db;
    }

    public setUser(user: IUser) {
        this.users[user.id || 0] = user;
    }

    public getUser(id: number): IUser | null {
        return this.users[id];
    }

}
