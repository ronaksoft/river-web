import DB from '../../services/db/dialog';
import {IDialog} from './interface';
import {differenceBy, find, merge} from 'lodash';

export default class DialogRepo {
    private dbService: DB;
    private db: any;

    public constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
    }

    public create(dialog: IDialog) {
        this.db.put(dialog);
    }

    public createMany(dialogs: IDialog[]) {
        return this.db.bulkDocs(dialogs);
    }

    public getMany({skip, before, after}: any): Promise<IDialog[]> {
        const q: any = [
            {last_update: {'$gt': true}},
        ];
        if (before) {
            q.push({last_update: {'$lt': before}});
        }
        if (after) {
            q.push({last_update: {'$gt': after}});
        }
        return this.db.find({
            limit: (skip || 30),
            selector: {
                $and: q,
            },
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
