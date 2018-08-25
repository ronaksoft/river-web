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
        const document: any = msg;
        document.col = 'msg';
        this.db.put(document);
    }

    public createMessages(msgs: IMessage[]) {
        let documents: any = msgs;
        documents = documents.map((document: any) => {
            document.col = 'msg';
            return document;
        });
        return this.db.bulkDocs(documents);
    }

    public getMessages(conversationId: string): Promise<IMessage[]> {
        return this.db.find({
            selector: {
                _id: {$exists: true},
                conversation_id: conversationId,
            },
            sort: [
                {_id: 'desc'},
            ],
        }).then((result: any) => {
            return result.docs;
        });
    }
}
