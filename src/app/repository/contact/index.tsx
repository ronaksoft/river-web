import DB from '../../services/db/contact';
import {IContact} from './interface';
import {differenceBy, find, merge} from 'lodash';
import SDK from "../../services/sdk";

export default class ContactRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new ContactRepo();
        }

        return this.instance;
    }

    private static instance: ContactRepo;

    private dbService: DB;
    private db: any;
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
        this.db.put(contact);
    }

    public createMany(contacts: IContact[]) {
        return this.db.bulkDocs(contacts);
    }

    public get(id: string): Promise<IContact> {
        const contact = this.dbService.getContact(id);
        if (contact) {
            return Promise.resolve(contact);
        }
        return this.db.get(String(id)).then((c: IContact) => {
            this.dbService.setContact(c);
            return c;
        });
    }

    public getAll(): Promise<IContact[]> {
        return new Promise((resolve, reject) => {
            this.getManyCache({}).then((res) => {
                resolve(res);
                window.console.log(res);
            }).catch((err) => {
                window.console.log(err);
                this.sdk.getContacts().then((remoteRes) => {
                    window.console.log(remoteRes);
                    this.importBulk(remoteRes.contactsList);
                    resolve(remoteRes.contactsList);
                }).catch((err2) => {
                    reject(err2);
                });
            });
        });
    }

    public getManyCache({keyword, limit}: any): Promise<IContact[]> {
        const q: any = [
            {id: {'$exists': true}},
        ];
        if (keyword !== null && keyword !== undefined) {
            const rg = {$regex: RegExp(keyword, "i")};
            q.push(
                {
                    $or: [
                        {firstname: rg},
                        {lastname: rg},
                        {phone: rg},
                    ]
                }
            );
        }
        return this.db.find({
            limit: limit || 1000,
            selector: {
                $and: q,
            },
        }).then((result: any) => {
            return result.docs;
        });
    }

    public importBulk(contacts: IContact[]): Promise<any> {
        contacts = contacts.map((msg) => {
            msg._id = String(msg.id);
            return msg;
        });
        return this.upsert(contacts);
    }

    public upsert(contacts: IContact[]): Promise<any> {
        const ids = contacts.map((contact) => {
            this.dbService.setContact(contact);
            return contact._id;
        });
        return this.db.find({
            selector: {
                _id: {'$in': ids}
            },
        }).then((result: any) => {
            const createItems: IContact[] = differenceBy(contacts, result.docs, '_id');
            // @ts-ignore
            const updateItems: IContact[] = result.docs;
            updateItems.map((contact: IContact) => {
                const t = find(contacts, {_id: contact._id});
                return merge(contact, t);
            });
            return this.createMany([...createItems, ...updateItems]);
        });
    }
}
