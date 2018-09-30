import UserMessageDB from '../../services/db/user_message';
import {IMessage} from './interface';

export default class Message {
    private dbService: UserMessageDB;
    private db: any;

    public constructor() {
        this.dbService = UserMessageDB.getInstance();
        this.db = this.dbService.getDB();
    }

    public createMessage(msg: IMessage) {
        this.db.put(msg);
    }

    public createMessages(msgs: IMessage[]) {
        return this.db.bulkDocs(msgs);
    }

    public getMessages({peerId, skip, before, after}: any): Promise<IMessage[]> {
        const q: any = [
            {peerid: peerId},
        ];
        if (before) {
            q.push({_id: {'$lt': before}});
        }
        if (after) {
            q.push({_id: {'$gt': after}});
        }
        return this.db.find({
            limit: (skip || 30),
            selector: {
                $and: q,
            },
            sort: [
                {peerid: 'desc'},
                {_id: 'desc'},
            ],
        }).then((result: any) => {
            return result.docs;
        });
    }

    public getMessage(id: number): Promise<IMessage> {
        return this.db.get(id);
    }

    public getMessagesWithTimestamp({peerId, skip, before, after}: any): Promise<IMessage[]> {
        const q: any = [
            {peerid: peerId},
            {createdon: {'$exists': true}},
        ];
        if (before) {
            q.push({createdon: {'$lt': before}});
        }
        if (after) {
            q.push({createdon: {'$gt': after}});
        }
        return this.db.find({
            limit: (skip || 30),
            selector: {
                $and: q,
            },
            sort: [
                {conversation_id: 'desc'},
                {createdon: 'desc'},
            ],
        }).then((result: any) => {
            return result.docs;
        });
    }

    public importBulk(msgs: IMessage[]): Promise<any> {
        msgs = msgs.map((msg) => {
            msg._id = String(msg.id);
            return msg;
        });
        return this.createMessages(msgs);
    }
}
