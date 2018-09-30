import DB from '../../services/db/dialog';
import {IDialog} from './interface';
import {differenceBy, intersectionBy} from 'lodash';

export default class Dialog {
    private dbService: DB;
    private db: any;

    public constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
    }

    public createDialog(dialog: IDialog) {
        this.db.put(dialog);
    }

    public createDialogs(dialogs: IDialog[]) {
        return this.db.bulkDocs(dialogs);
    }

    public getDialogs({skip, before, after}: any): Promise<IDialog[]> {
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
            const updateItems: IDialog[] = intersectionBy(result.docs, dialogs, '_id');
            return this.createDialogs([...createItems, ...updateItems]);
        });
    }
}
