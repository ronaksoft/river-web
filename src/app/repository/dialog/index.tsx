import DB from '../../services/db/dialog';
import {IDialog} from './interface';

export default class Conversation {
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
            {last_update: {'$exists': true}},
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
}
