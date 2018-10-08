import UserMessageDB from '../../services/db/user_message';
import {IMessage} from './interface';
import {differenceBy, find, merge} from 'lodash';
import SDK from "../../services/sdk";
import UserRepo from '../user';

export default class MessageRepo {
    private dbService: UserMessageDB;
    private db: any;
    private sdk: SDK;
    private userRepo: UserRepo;
    private userId: number;

    public constructor() {
        SDK.getInstance().loadConnInfo();
        this.userId = SDK.getInstance().getConnInfo().UserID || 0;
        this.dbService = UserMessageDB.getInstance();
        this.db = this.dbService.getDB();
        this.sdk = SDK.getInstance();
        this.userRepo = UserRepo.getInstance();
    }

    public loadConnInfo() {
        SDK.getInstance().loadConnInfo();
        this.userId = SDK.getInstance().getConnInfo().UserID || 0;
    }

    public create(msg: IMessage) {
        this.db.put(msg);
    }

    public createMany(msgs: IMessage[]) {
        return this.db.bulkDocs(msgs);
    }

    public getMany({peer, limit, before, after}: any): Promise<IMessage[]> {
        limit = limit || 30;
        return new Promise((resolve, reject) => {
            this.getManyCache({peerId: peer.getId(), limit, before, after}).then((res) => {
                const len = res.length;
                if (len < limit) {
                    let maxId = null;
                    if (before !== undefined) {
                        maxId = before - 1;
                    }
                    if (len > 0) {
                        maxId = (res[len - 1].id || 0) - 1;
                    }
                    if (maxId === 0) {
                        resolve(res);
                        return;
                    }
                    const lim = limit - len;
                    this.sdk.getMessageHistory(peer, {maxId, limit: lim}).then((remoteRes) => {
                        this.importBulk(remoteRes.messagesList);
                        this.userRepo.importBulk(remoteRes.usersList);
                        resolve([...res, ...remoteRes.messagesList]);
                    }).catch((err2) => {
                        reject(err2);
                    });
                } else {
                    resolve(res);
                }
            }).catch((err) => {
                window.console.log(err);
                this.sdk.getMessageHistory(peer, {minId: before, limit}).then((remoteRes) => {
                    this.importBulk(remoteRes.messagesList);
                    this.userRepo.importBulk(remoteRes.usersList);
                    resolve(remoteRes.messagesList);
                }).catch((err2) => {
                    reject(err2);
                });
            });
        });
    }

    public getManyCache({peerId, limit, before, after}: any): Promise<IMessage[]> {
        const q: any = [
            {peerid: peerId},
            {id: {'$gt': 0}}
        ];
        if (before !== null && before !== undefined) {
            q.push({id: {'$lt': before}});
        }
        if (after !== null && before !== undefined) {
            q.push({id: {'$gt': after}});
        }
        return this.db.find({
            limit: (limit || 30),
            selector: {
                $and: q,
            },
            sort: [
                {id: 'desc'},
            ],
        }).then((result: any) => {
            return result.docs;
        });
    }

    public get(id: number): Promise<IMessage> {
        return this.db.get(String(id));
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
        if (this.userId === 0) {
            this.loadConnInfo();
        }
        msgs = msgs.map((msg) => {
            msg._id = String(msg.id);
            msg.me = (msg.senderid === this.userId);
            return msg;
        });
        return this.upsert(msgs).then((data) => {
            // window.console.log(data);
        }).catch((err) => {
            window.console.log(err);
        });
    }

    public upsert(msgs: IMessage[]): Promise<any> {
        const ids = msgs.map((msg) => {
            return msg._id;
        });
        return this.db.find({
            selector: {
                _id: {'$in': ids}
            },
        }).then((result: any) => {
            const createItems: IMessage[] = differenceBy(msgs, result.docs, '_id');
            // @ts-ignore
            const updateItems: IMessage[] = result.docs;
            updateItems.map((msg: IMessage) => {
                const t = find(msgs, {_id: msg._id});
                return merge(msg, t);
            });
            return this.createMany([...createItems, ...updateItems]);
        });
    }

    public remove(id: string): Promise<any> {
        return this.db.get(id).then((result: any) => {
            return this.db.remove(result._id, result._rev);
        });
    }

    public getUnreadCount(peerid: number, minId: number): Promise<any> {
        return this.db.find({
            selector: {
                $and: [
                    {peerid},
                    {id: {'$gt': minId}},
                ]
            },
        }).then((result: any) => {
            return result.docs.length;
        });
    }
}
