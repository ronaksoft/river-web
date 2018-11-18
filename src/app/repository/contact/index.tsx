import DB from '../../services/db/user';
import {IContact} from './interface';
import SDK from '../../services/sdk';
import {differenceBy, find, merge} from 'lodash';
import {DexieUserDB} from '../../services/db/dexie/user';

export default class ContactRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new ContactRepo();
        }

        return this.instance;
    }

    private static instance: ContactRepo;

    private dbService: DB;
    private db: DexieUserDB;
    private sdk: SDK;

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

    public get(id: string): Promise<IContact> {
        const contact = this.dbService.getContact(id);
        if (contact) {
            return Promise.resolve(contact);
        }
        return this.db.contacts.get(id).then((c: IContact) => {
            this.dbService.setContact(c);
            return c;
        });
    }

    public getAll(): Promise<IContact[]> {
        return new Promise((resolve, reject) => {
            this.getManyCache({}).then((res) => {
                resolve(res);
            }).catch((err) => {
                this.sdk.getContacts().then((remoteRes) => {
                    this.importBulk(remoteRes.contactsList);
                    resolve(remoteRes.contactsList);
                }).catch((err2) => {
                    reject(err2);
                });
            });
        });
    }

    public getManyCache({keyword, limit}: any): Promise<IContact[]> {
        return this.db.contacts
            .where('firstname').startsWithIgnoreCase(keyword)
            .or('lastname').startsWithIgnoreCase(keyword)
            .or('phone').startsWithIgnoreCase(keyword).limit(limit).toArray().then((result: any) => {
                return result.docs;
            });
    }

    public importBulk(contacts: IContact[]): Promise<any> {
        return this.upsert(contacts);
    }

    public upsert(contacts: IContact[]): Promise<any> {
        const ids = contacts.map((contact) => {
            this.dbService.setContact(contact);
            return contact.id || '';
        });
        return this.db.contacts.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IContact[] = differenceBy(contacts, result, 'id');
            const updateItems: IContact[] = result;
            updateItems.map((contact: IContact) => {
                const t = find(contacts, {id: contact.id});
                return merge(contact, t);
            });
            return this.createMany([...createItems, ...updateItems]);
        });
    }
}
