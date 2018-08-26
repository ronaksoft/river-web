import DB from './../../services/db';
import {IMessage} from './interface';

export default class Conversation {
    private dbService: DB;
    private db: any;

    public constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
    }

    public createMessage(msg: IMessage) {
        this.db.put(msg);
    }

    public createMessages(msgs: IMessage[]) {
        return this.db.bulkDocs(msgs);
    }

    public getMessages({conversationId, skip, before, after}: any): Promise<IMessage[]> {
        const q: any = [
            {conversation_id: conversationId},
            {timestamp: {'$exists': true}},
        ];
        if (before) {
            q.push({timestamp: {'$lt': before}});
        }
        if (after) {
            q.push({timestamp: {'$gt': after}});
        }
        return this.db.find({
            limit: (skip || 30),
            selector: {
                $and: q,
            },
            sort: [
                {conversation_id: 'desc'},
                {timestamp: 'desc'},
            ],
        }).then((result: any) => {
            return result.docs;
        });
    }
}
