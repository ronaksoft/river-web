import {IUser} from '../../repository/user/interface';
import {IContact} from '../../repository/contact/interface';
import Dexie from 'dexie';

export class DexieUserDB extends Dexie {
    public users: Dexie.Table<IUser, string>;
    public contacts: Dexie.Table<IContact, string>;

    constructor() {
        super('user_db');

        //
        // Define tables and indexes
        // (Here's where the implicit table props are dynamically created)
        //
        this.version(1).stores({
            users: `id,firstname,lastname`,
            contacts: `id,firstname,lastname,phone,username`,
        });
    }
}

export default class UserDB {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UserDB();
        }

        return this.instance;
    }

    private static instance: UserDB;
    private db: DexieUserDB;
    private users: { [key: string]: IUser } = {};
    private contacts: { [key: string]: IContact } = {};

    private constructor() {
        this.db = new DexieUserDB();
    }

    public getDB() {
        return this.db;
    }

    public setUser(user: IUser) {
        this.users[user.id || 0] = user;
    }

    public getUser(id: string): IUser | null {
        return this.users[id];
    }

    public setContact(user: IContact) {
        this.contacts[user.id || 0] = user;
    }

    public getContact(id: string): IContact | null {
        return this.contacts[id];
    }
}
