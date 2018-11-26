import {IUser} from '../../repository/user/interface';
import {IContact} from '../../repository/contact/interface';
import {DexieUserDB} from './dexie/user';
import {IGroup} from '../../repository/group/interface';

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
    private groups: { [key: string]: IGroup } = {};

    private constructor() {
        this.db = new DexieUserDB();
        this.db.open();
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

    public setGroup(group: IGroup) {
        this.groups[group.id || 0] = group;
    }

    public getGroup(id: string): IGroup | null {
        return this.groups[id];
    }
}
