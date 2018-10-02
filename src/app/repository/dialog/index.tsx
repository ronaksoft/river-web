import DB from '../../services/db/dialog';
import {IDialog} from './interface';
import {differenceBy, find, merge} from 'lodash';
import SDK from '../../services/sdk';
import UserRepo from '../user';
import MessageRepo from '../message';

export default class DialogRepo {
    private dbService: DB;
    private db: any;
    private sdk: SDK;
    private messageRepo: MessageRepo;
    private userRepo: UserRepo;

    public constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.sdk = SDK.getInstance();
        this.messageRepo = new MessageRepo();
        this.userRepo = new UserRepo();
    }

    public create(dialog: IDialog) {
        this.db.put(dialog);
    }

    public createMany(dialogs: IDialog[]) {
        return this.db.bulkDocs(dialogs);
    }

    public getMany({skip, limit}: any): Promise<IDialog[]> {
        return this.sdk.getDialogs(skip || 0, limit || 30).then((remoteRes) => {
            this.importBulk(remoteRes.dialogsList);
            this.messageRepo.importBulk(remoteRes.messagesList);
            this.userRepo.importBulk(remoteRes.usersList);
            return remoteRes.dialogsList;
        });
    }

    public getManyCache({skip, limit}: any): Promise<IDialog[]> {
        const q: any = [
            {last_update: {'$gt': true}},
        ];
        return this.db.find({
            limit: (limit || 30),
            selector: {
                $and: q,
            },
            skip: (skip || 0),
            sort: [
                {last_update: 'desc'},
            ],
        }).then((result: any) => {
            return result.docs;
        });
    }

    public importBulk(dialogs: IDialog[]): Promise<any> {
        dialogs = dialogs.map((dialog) => {
            dialog._id = String(dialog.peerid);
            dialog.last_update = Date.now();
            return dialog;
        });
        return this.upsert(dialogs);
    }

    public upsert(dialogs: IDialog[]): Promise<any> {
        const ids = dialogs.map((dialog) => {
            return dialog._id;
        });
        return this.db.find({
            selector: {
                _id: {'$in': ids}
            },
        }).then((result: any) => {
            const createItems: IDialog[] = differenceBy(dialogs, result.docs, '_id');
            // @ts-ignore
            const updateItems: IDialog[] = result.docs;
            updateItems.map((dialog: IDialog) => {
                const t = find(dialogs, {_id: dialog._id});
                return merge(t, dialog);
            });
            return this.createMany([...createItems, ...updateItems]);
        });
    }
}
