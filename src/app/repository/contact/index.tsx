/*
    Creation Time: 2018 - Oct - 21
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import DB from '../../services/db/user';
import {IContact} from './interface';
import SDK from '../../services/sdk';
import {differenceBy, find, merge} from 'lodash';
import {DexieUserDB} from '../../services/db/dexie/user';

export default class ContactRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new ContactRepo();
            this.instance.getAll();
        }

        return this.instance;
    }

    private static instance: ContactRepo;

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

    public create(contact: IContact) {
        return this.db.contacts.put(contact);
    }

    public createMany(contacts: IContact[]) {
        return this.db.contacts.bulkPut(contacts);
    }

    public getInstant(id: string): IContact | null {
        return this.dbService.getContact(id);
    }

    public remove(id: string) {
        this.dbService.removeContact(id);
        return this.db.contacts.delete(id);
    }

    public get(id: string, unsafe?: boolean): Promise<IContact> {
        const contact = this.dbService.getContact(id);
        if (unsafe === true) {
            if (contact) {
                return Promise.resolve(contact);
            }
        } else {
            if (contact && contact.temp !== true) {
                return Promise.resolve(contact);
            }
        }
        return this.db.contacts.get(id).then((c: IContact) => {
            if (c) {
                if (unsafe === true) {
                    this.dbService.setContact(c);
                } else {
                    if (c && c.temp !== true) {
                        return Promise.resolve(c);
                    } else {
                        return Promise.reject();
                    }
                }
            } else {
                return Promise.reject();
            }
            return c;
        });
    }

    public getAll(): Promise<IContact[]> {
        return new Promise((resolve, reject) => {
            if (this.contactImported) {
                this.getManyCache({}).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    this.sdk.getContacts().then((remoteRes) => {
                        this.importBulk(remoteRes.usersList);
                        resolve(remoteRes.usersList);
                    }).catch((err2) => {
                        reject(err2);
                    });
                });
            } else {
                this.contactImported = true;
                this.sdk.getContacts().then((remoteRes) => {
                    this.importBulk(remoteRes.usersList);
                    resolve(remoteRes.usersList);
                }).catch((err2) => {
                    reject(err2);
                });
            }
        });
    }

    public getManyCache({keyword, limit}: any): Promise<IContact[]> {
        if (!keyword) {
            return this.db.contacts.orderBy('firstname').limit(limit || 100).toArray();
        }
        return this.db.contacts
            .where('firstname').startsWithIgnoreCase(keyword)
            .or('lastname').startsWithIgnoreCase(keyword)
            .or('phone').startsWithIgnoreCase(keyword).filter((item) => {
                return item.temp !== true;
            }).limit(limit || 100).toArray();
    }

    public importBulk(contacts: IContact[]): Promise<any> {
        return this.upsert(contacts);
    }

    public upsert(contacts: IContact[]): Promise<any> {
        const ids = contacts.map((contact) => {
            return contact.id || '';
        });
        return this.db.contacts.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IContact[] = differenceBy(contacts, result, 'id');
            const updateItems: IContact[] = result;
            updateItems.map((contact: IContact) => {
                const t = find(contacts, {id: contact.id});
                if (t && t.temp === true && contact.temp === false) {
                    const d = merge(contact, t);
                    d.temp = false;
                    return d;
                } else {
                    return merge(contact, t);
                }
            });
            const list = [...createItems, ...updateItems];
            list.forEach((item) => {
                this.dbService.setContact(item);
            });
            return this.createMany(list);
        }).then((res) => {
            this.broadcastEvent('User_DB_Updated', {ids});
            return res;
        });
    }

    private broadcastEvent(name: string, data: any) {
        const event = new CustomEvent(name, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(event);
    }
}
