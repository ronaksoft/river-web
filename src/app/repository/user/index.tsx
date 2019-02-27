/*
    Creation Time: 2018 - Sep - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import DB from '../../services/db/user';
import {IUser} from './interface';
import {differenceBy, find, merge, uniqBy} from 'lodash';
import SDK from "../../services/sdk";
import {DexieUserDB} from '../../services/db/dexie/user';
import Dexie from 'dexie';

export default class UserRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UserRepo();
        }

        return this.instance;
    }

    private static instance: UserRepo;

    private dbService: DB;
    private db: DexieUserDB;
    private sdk: SDK;
    private contactImported: boolean = false;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.sdk = SDK.getInstance();
    }

    public getCurrentUserId(): string {
        return this.sdk.getConnInfo().UserID || '';
    }

    public create(user: IUser) {
        return this.db.users.put(user);
    }

    public createMany(users: IUser[]) {
        return this.db.users.bulkPut(users);
    }

    public get(id: string): Promise<IUser> {
        const user = this.dbService.getUser(id);
        if (user) {
            return Promise.resolve(user);
        }
        return this.db.users.get(id).then((u: IUser) => {
            if (u) {
                this.dbService.setUser(u);
            }
            return u;
        });
    }

    public getInstantContact(id: string): IUser | null {
        const contact = this.dbService.getUser(id);
        if (contact && contact.is_contact) {
            return contact;
        } else {
            return null;
        }
    }

    public getManyCache(isContact: boolean, {keyword, limit}: any): Promise<IUser[]> {
        const searchFilter = (u: IUser) => {
            const reg = new RegExp(keyword || '', 'i');
            return (reg.test(u.phone || '') || reg.test(u.username || '') || reg.test(u.firstname || '') || reg.test(u.lastname || ''));
        };
        if (isContact) {
            if (!keyword) {
                return this.db.users.where('[is_contact+username]').between([1, Dexie.minKey], [1, Dexie.maxKey], true, true).limit(limit || 1000).toArray();
            }
            return this.db.users.where('[is_contact+username]').between([1, Dexie.minKey], [1, Dexie.maxKey], true, true).filter(searchFilter).limit(limit || 12).toArray();
        } else {
            if (!keyword) {
                return this.db.users.limit(limit || 1000).toArray();
            }
            return this.db.users.filter(searchFilter).limit(limit || 12).toArray();
        }
    }

    public importBulk(isContact: boolean, users: IUser[], force?: boolean): Promise<any> {
        const tempUsers = uniqBy(users, 'id');
        return this.upsert(isContact, tempUsers, force);
    }

    public upsert(isContact: boolean, users: IUser[], force?: boolean): Promise<any> {
        const ids = users.map((user) => {
            user.is_contact = isContact ? 1 : 0;
            return user.id || '';
        });
        return this.db.users.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IUser[] = differenceBy(users, result, 'id');
            const updateItems: IUser[] = result;
            updateItems.map((user: IUser) => {
                return this.mergeUser(users, user, force);
            });
            const list = [...createItems, ...updateItems];
            list.forEach((item) => {
                this.dbService.setUser(item);
            });
            return this.createMany(list);
        }).then((res) => {
            this.broadcastEvent('User_DB_Updated', {ids});
            return res;
        });
    }

    public getAllContacts(): Promise<IUser[]> {
        return new Promise((resolve, reject) => {
            if (this.contactImported) {
                this.getManyCache(true, {}).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    this.sdk.getContacts().then((remoteRes) => {
                        this.importBulk(true, remoteRes.usersList);
                        resolve(remoteRes.usersList);
                    }).catch((err2) => {
                        reject(err2);
                    });
                });
            } else {
                this.contactImported = true;
                this.sdk.getContacts().then((remoteRes) => {
                    this.importBulk(true, remoteRes.usersList);
                    resolve(remoteRes.usersList);
                }).catch((err2) => {
                    reject(err2);
                });
            }
        });
    }

    public removeContact(id: string) {
        return this.db.users.where('id').equals(id).first().then((user) => {
            if (user) {
                user.is_contact = 0;
                this.dbService.setUser(user);
                this.createMany([user]);
            }
        });
    }

    private mergeUser(users: IUser[], user: IUser, force?: boolean) {
        const t = find(users, {id: user.id});
        const modifyUser = (u1: IUser, u2: IUser): IUser => {
            if (!force && u1.username && u1.username.length > 0 && (!u2.username || (u2.username && u2.username.length === 0))) {
                u2.username = u1.username;
            }
            if (!force && u1.bio && u1.bio.length > 0 && (!u2.bio || (u2.bio && u2.bio.length === 0))) {
                u2.bio = u1.bio;
            }
            return merge(u1, u2);
        };
        if (t && user.is_contact === 1) {
            t.is_contact = 1;
            return modifyUser(user, t);
        } else if (t) {
            return modifyUser(user, t);
        } else {
            return user;
        }
    }

    private broadcastEvent(name: string, data: any) {
        const event = new CustomEvent(name, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(event);
    }
}
