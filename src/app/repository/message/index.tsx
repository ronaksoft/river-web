import UserMessageDB from '../../services/db/user_message';
import {IMessage} from './interface';
import {differenceBy, find, merge, clone, cloneDeep, throttle} from 'lodash';
import SDK from '../../services/sdk';
import UserRepo from '../user';
import RTLDetector from '../../services/utilities/rtl_detector';
import {IDialog} from "../dialog/interface";

export default class MessageRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new MessageRepo();
        }

        return this.instance;
    }

    private static instance: MessageRepo;

    private dbService: UserMessageDB;
    private db: any;
    private sdk: SDK;
    private userRepo: UserRepo;
    private userId: string;
    private rtlDetector: RTLDetector;
    private lazyMap: { [key: number]: IDialog } = {};
    private readonly updateThrottle: any = null;

    private constructor() {
        SDK.getInstance().loadConnInfo();
        this.userId = SDK.getInstance().getConnInfo().UserID || '0';
        this.dbService = UserMessageDB.getInstance();
        this.db = this.dbService.getDB();
        this.sdk = SDK.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.rtlDetector = RTLDetector.getInstance();
        this.updateThrottle = throttle(this.insertToDb, 2000);
    }

    public loadConnInfo() {
        SDK.getInstance().loadConnInfo();
        this.userId = SDK.getInstance().getConnInfo().UserID || '0';
    }

    public getCurrentUserId(): string {
        return this.userId;
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
                        this.userRepo.importBulk(remoteRes.usersList);
                        return this.transform(remoteRes.messagesList);
                    }).then((remoteRes) => {
                        this.importBulk(remoteRes, true);
                        resolve([...res, ...remoteRes]);
                    }).catch((err2) => {
                        reject(err2);
                    });
                } else {
                    resolve(res);
                }
            }).catch((err) => {
                window.console.log(err);
                this.sdk.getMessageHistory(peer, {minId: before, limit}).then((remoteRes) => {
                    this.userRepo.importBulk(remoteRes.usersList);
                    return this.transform(remoteRes.messagesList);
                }).then((remoteRes) => {
                    this.importBulk(remoteRes, true);
                    resolve(remoteRes);
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

    public transform(msgs: IMessage[]) {
        return msgs.map((msg) => {
            msg._id = String(msg.id);
            msg.me = (msg.senderid === this.userId);
            msg.rtl = this.rtlDetector.direction(msg.body || '');
            return msg;
        });
    }

    public importBulk(msgs: IMessage[], noTransform?: boolean): Promise<any> {
        if (this.userId === '0' || this.userId === '') {
            this.loadConnInfo();
        }
        let tempMsgs = cloneDeep(msgs);
        if (noTransform !== true) {
            tempMsgs = this.transform(tempMsgs);
        }
        return this.upsert(tempMsgs).then((data) => {
            // window.console.log(data);
        }).catch((err) => {
            window.console.log(err);
        });
    }

    public upsert(msgs: IMessage[]): Promise<any> {
        const ids = msgs.map((msg) => {
            msg.avatar = undefined;
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

    public getUnreadCount(peerid: string, minId: number): Promise<any> {
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

    public lazyUpsert(messages: IMessage[]) {
        if (this.userId === '0' || this.userId === '') {
            this.loadConnInfo();
        }
        clone(messages).forEach((dialog) => {
            this.updateMap(dialog);
        });
        this.updateThrottle();
    }

    private updateMap = (message: IMessage) => {
        message.me = (message.senderid === this.userId);
        message.rtl = this.rtlDetector.direction(message.body || '');
        if (this.lazyMap.hasOwnProperty(message.id || 0)) {
            const t = this.lazyMap[message.id || 0];
            this.lazyMap[message.id || 0] = merge(message, t);
        } else {
            message._id = String(message.id);
            this.lazyMap[message.id || 0] = message;
        }
    }

    private insertToDb = () => {
        const messages: IMessage[] = [];
        Object.keys(this.lazyMap).forEach((key) => {
            messages.push(this.lazyMap[key]);
        });
        this.upsert(messages).then(() => {
            this.lazyMap = {};
        });
    }
}
