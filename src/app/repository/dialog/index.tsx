import DB from '../../services/db/dialog';
import {IDialog} from './interface';

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
            dialog._id = dialog.peerid;
            dialog.last_update = Date.now();
            return dialog;
        });
        return this.createDialogs(dialogs);
    }
}
