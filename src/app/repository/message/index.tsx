import MessageDB from '../../services/db/message';
import {IMessage} from './interface';
import {differenceBy, find, merge, cloneDeep, throttle} from 'lodash';
import SDK from '../../services/sdk';
import UserRepo from '../user';
import RTLDetector from '../../services/utilities/rtl_detector';
import {InputPeer, UserMessage} from '../../services/sdk/messages/core.types_pb';
import Dexie from 'dexie';
import {DexieMessageDB} from '../../services/db/dexie/message';
import {C_MESSAGE_ACTION} from './consts';
import {
    MessageActionClearHistory,
    MessageActionContactRegistered,
    MessageActionGroupAddUser,
    MessageActionGroupCreated,
    MessageActionGroupDeleteUser,
    MessageActionGroupTitleChanged
} from '../../services/sdk/messages/core.message_actions_pb';

export default class MessageRepo {
    public static parseMessage(msg: UserMessage.AsObject): IMessage {
        if (!msg.messageactiondata) {
            return msg;
        }
        // @ts-ignore
        const data: Uint8Array = msg.messageactiondata;
        const out: IMessage = msg;
        switch (msg.messageaction) {
            case C_MESSAGE_ACTION.MessageActionNope:
                break;
            case C_MESSAGE_ACTION.MessageActionGroupTitleChanged:
                out.actiondata = MessageActionGroupTitleChanged.deserializeBinary(data).toObject();
                break;
            case C_MESSAGE_ACTION.MessageActionGroupCreated:
                out.actiondata = MessageActionGroupCreated.deserializeBinary(data).toObject();
                break;
            case C_MESSAGE_ACTION.MessageActionGroupDeleteUser:
                out.actiondata = MessageActionGroupDeleteUser.deserializeBinary(data).toObject();
                break;
            case C_MESSAGE_ACTION.MessageActionGroupAddUser:
                out.actiondata = MessageActionGroupAddUser.deserializeBinary(data).toObject();
                break;
            case C_MESSAGE_ACTION.MessageActionContactRegistered:
                out.actiondata = MessageActionContactRegistered.deserializeBinary(data).toObject();
                break;
            case C_MESSAGE_ACTION.MessageActionClearHistory:
                out.actiondata = MessageActionClearHistory.deserializeBinary(data).toObject();
                break;
        }
        delete out.messageactiondata;
        return out;
    }

    public static parseMessageMany(msg: UserMessage.AsObject[]): IMessage[] {
        return msg.map((m) => {
            return this.parseMessage(m);
        });
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new MessageRepo();
        }

        return this.instance;
    }

    private static instance: MessageRepo;

    private dbService: MessageDB;
    private db: DexieMessageDB;
    private sdk: SDK;
    private userRepo: UserRepo;
    private userId: string;
    private rtlDetector: RTLDetector;
    private lazyMap: { [key: number]: IMessage } = {};
    private readonly updateThrottle: any = null;

    private constructor() {
        SDK.getInstance().loadConnInfo();
        this.userId = SDK.getInstance().getConnInfo().UserID || '0';
        this.dbService = MessageDB.getInstance();
        this.db = this.dbService.getDB();
        this.sdk = SDK.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.rtlDetector = RTLDetector.getInstance();
        this.updateThrottle = throttle(this.insertToDb, 1000);
    }

    public loadConnInfo() {
        SDK.getInstance().loadConnInfo();
        this.userId = SDK.getInstance().getConnInfo().UserID || '0';
    }

    public getCurrentUserId(): string {
        return this.userId;
    }

    public create(msg: IMessage) {
        return this.db.messages.put(msg);
    }

    public createMany(msgs: IMessage[]) {
        return this.db.messages.bulkPut(msgs);
    }

    public getMany({peer, limit, before, after}: any, fnCallback?: (resMsgs: IMessage[]) => void): Promise<IMessage[]> {
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
                    if (typeof fnCallback === 'function') {
                        resolve(res);
                    }
                    const lim = limit - len;
                    this.sdk.getMessageHistory(peer, {maxId, limit: lim}).then((remoteRes) => {
                        this.userRepo.importBulk(remoteRes.usersList);
                        remoteRes.messagesList = MessageRepo.parseMessageMany(remoteRes.messagesList);
                        return this.transform(remoteRes.messagesList);
                    }).then((remoteRes) => {
                        this.importBulk(remoteRes, true);
                        if (typeof fnCallback === 'function') {
                            fnCallback(remoteRes);
                        } else {
                            resolve([...res, ...remoteRes]);
                        }
                    }).catch((err2) => {
                        if (fnCallback === undefined) {
                            reject(err2);
                        }
                    });
                } else {
                    resolve(res);
                }
            }).catch((err) => {
                this.sdk.getMessageHistory(peer, {maxId: before - 1, limit}).then((remoteRes) => {
                    this.userRepo.importBulk(remoteRes.usersList);
                    remoteRes.messagesList = MessageRepo.parseMessageMany(remoteRes.messagesList);
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
        const pipe = this.db.messages.where('[peerid+id]');
        let pipe2: Dexie.Collection<IMessage, number>;
        let mode = 0x0;
        if (before !== null && before !== undefined) {
            mode = mode | 0x1;
        }
        if (after !== null && after !== undefined) {
            mode = mode | 0x2;
        }
        switch (mode) {
            // none
            default:
            case 0x0:
                pipe2 = pipe.between([peerId, Dexie.minKey], [peerId, Dexie.maxKey], true, true);
                break;
            // before
            case 0x1:
                pipe2 = pipe.between([peerId, Dexie.minKey], [peerId, before - 1], true, true);
                break;
            // after
            case 0x2:
                pipe2 = pipe.between([peerId, after + 1], [peerId, Dexie.maxKey], true, true);
                break;
            // between
            case 0x3:
                pipe2 = pipe.between([peerId, after + 1], [peerId, before - 1], true, true);
                break;
        }
        if (mode !== 0x2) {
            pipe2 = pipe2.reverse();
        }
        pipe2.filter((item: IMessage) => {
            return item.temp !== true && (item.id || 0) > 0;
        });
        return pipe2.limit(limit).toArray();
    }

    public get(id: number, peer?: InputPeer | null): Promise<IMessage> {
        return new Promise((resolve, reject) => {
            this.db.messages.get(id).then((res: IMessage) => {
                resolve(res);
            }).catch(() => {
                if (this.lazyMap.hasOwnProperty(id)) {
                    resolve(cloneDeep(this.lazyMap[id]));
                    return;
                }
                if (peer) {
                    this.sdk.getMessageHistory(peer, {minId: id, maxId: id}).then((remoteRes) => {
                        if (remoteRes.messagesList.length === 0) {
                            reject();
                        } else {
                            const message = MessageRepo.parseMessage(remoteRes.messagesList[0]);
                            this.lazyUpsert([message], true);
                            resolve(message);
                        }
                    }).catch((err) => {
                        reject(err);
                    });
                } else {
                    reject();
                }
            });
        });
    }

    public transform(msgs: IMessage[]) {
        return msgs.map((msg) => {
            // msg = MessageRepo.parseMessage(msg);
            msg.me = (msg.senderid === this.userId);
            msg.rtl = this.rtlDetector.direction(msg.body || '');
            msg.temp = false;
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
            return msg.id || '';
        });
        return this.db.messages.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IMessage[] = differenceBy(msgs, result, 'id');
            const updateItems: IMessage[] = result;
            updateItems.map((msg: IMessage) => {
                const t = find(msgs, {id: msg.id});
                if (t && t.temp === true && msg.temp === false) {
                    const d = merge(msg, t);
                    d.temp = false;
                    return d;
                } else {
                    return merge(msg, t);
                }
            });
            return this.createMany([...createItems, ...updateItems]);
        });
    }

    public remove(id: number): Promise<any> {
        if (this.lazyMap.hasOwnProperty(id)) {
            delete this.lazyMap[id];
            return Promise.resolve();
        }
        return this.db.messages.delete(id);
    }

    public getUnreadCount(peerId: string, minId: number): Promise<any> {
        return this.db.messages.where('[peerid+id]')
            .between([peerId, minId + 1], [peerId, Dexie.maxKey], true, true).filter((item) => {
                return item.temp !== true && item.me !== true;
            }).count();
    }

    public flush() {
        this.updateThrottle.cancel();
        this.insertToDb();
    }

    public lazyUpsert(messages: IMessage[], temp?: boolean) {
        if (this.userId === '0' || this.userId === '') {
            this.loadConnInfo();
        }
        cloneDeep(messages).forEach((message) => {
            this.updateMap(message, temp);
        });
        this.updateThrottle();
    }

    private updateMap = (message: IMessage, temp?: boolean) => {
        message.me = (message.senderid === this.userId);
        message.rtl = this.rtlDetector.direction(message.body || '');
        message.temp = (temp === true);
        if (this.lazyMap.hasOwnProperty(message.id || 0)) {
            const t = this.lazyMap[message.id || 0];
            if (t && t.temp === false && temp) {
                this.lazyMap[message.id || 0] = merge(message, t);
                this.lazyMap[message.id || 0].temp = false;
            } else {
                this.lazyMap[message.id || 0] = merge(message, t);
            }
        } else {
            this.lazyMap[message.id || 0] = message;
        }
    }

    private insertToDb = () => {
        const messages: IMessage[] = [];
        Object.keys(this.lazyMap).forEach((key) => {
            messages.push(cloneDeep(this.lazyMap[key]));
        });
        if (messages.length === 0) {
            return;
        }
        this.lazyMap = {};
        this.upsert(messages).then(() => {
            //
        }).catch((err) => {
            window.console.log(err);
        });
    }
}
