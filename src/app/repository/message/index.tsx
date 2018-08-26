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

    public getMessages(conversationId: string): Promise<IMessage[]> {
        return this.db.find({
            limit: 5,
            selector: {
                $and: [
                    {conversation_id: conversationId},
                    {timestamp: {'$exists': true}},
                ],
            },
            sort: [
                {conversation_id: 'asc'},
                {timestamp: 'desc'},
            ],
        }).then((result: any) => {
            return result.docs;
        });
    }
}
