/*
    Creation Time: 2018 - Aug - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import MessageDB from '../../services/db/message';
import {IMessage, IPendingMessage} from './interface';
import {cloneDeep, differenceBy, find, merge, throttle} from 'lodash';
import SDK from '../../services/sdk';
import UserRepo from '../user';
import RTLDetector from '../../services/utilities/rtl_detector';
import {InputPeer, MediaType, MessageEntityType, UserMessage} from '../../services/sdk/messages/chat.core.types_pb';
import Dexie from 'dexie';
import {DexieMessageDB} from '../../services/db/dexie/message';
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE} from './consts';
import GroupRepo from '../group';
import {
    DocumentAttribute,
    DocumentAttributeAudio,
    DocumentAttributeFile,
    DocumentAttributePhoto,
    DocumentAttributeType,
    DocumentAttributeVideo,
    MediaContact,
    MediaDocument, MediaGeoLocation,
    MediaPhoto
} from '../../services/sdk/messages/chat.core.message.medias_pb';
import {
    MessageActionClearHistory,
    MessageActionContactRegistered,
    MessageActionGroupAddUser,
    MessageActionGroupCreated,
    MessageActionGroupDeleteUser, MessageActionGroupPhotoChanged,
    MessageActionGroupTitleChanged,
} from '../../services/sdk/messages/chat.core.message.actions_pb';
import MediaRepo from '../media';
import {C_MEDIA_TYPE} from '../media/interface';

export default class MessageRepo {
    public static parseAttributes(attrs: DocumentAttribute.AsObject[], flags: { type: number }) {
        flags.type = C_MESSAGE_TYPE.Normal;
        const attrOut: any[] = [];
        attrs.forEach((attr) => {
            switch (attr.type) {
                case DocumentAttributeType.ATTRIBUTETYPEAUDIO:
                    // @ts-ignore
                    const audioAttr = DocumentAttributeAudio.deserializeBinary(attr.data).toObject();
                    attrOut.push(audioAttr);
                    if (audioAttr.voice) {
                        flags.type = C_MESSAGE_TYPE.Voice;
                    } else {
                        flags.type = C_MESSAGE_TYPE.Voice;
                    }
                    delete attr.data;
                    break;
                case DocumentAttributeType.ATTRIBUTETYPEFILE:
                    // @ts-ignore
                    attrOut.push(DocumentAttributeFile.deserializeBinary(attr.data).toObject());
                    if (flags.type === C_MESSAGE_TYPE.Normal) {
                        flags.type = C_MESSAGE_TYPE.File;
                    }
                    delete attr.data;
                    break;
                case DocumentAttributeType.ATTRIBUTETYPEPHOTO:
                    // @ts-ignore
                    attrOut.push(DocumentAttributePhoto.deserializeBinary(attr.data).toObject());
                    flags.type = C_MESSAGE_TYPE.Picture;
                    delete attr.data;
                    break;
                case DocumentAttributeType.ATTRIBUTETYPEVIDEO:
                    // @ts-ignore
                    attrOut.push(DocumentAttributeVideo.deserializeBinary(attr.data).toObject());
                    flags.type = C_MESSAGE_TYPE.Video;
                    delete attr.data;
                    break;
            }
        });
        return attrOut;
    }

    public static parseMessage(msg: UserMessage.AsObject, userId: string): IMessage {
        const out: IMessage = msg;
        if (msg.entitiesList && msg.entitiesList.length > 0) {
            out.mention_me = msg.entitiesList.some((entity) => {
                return entity.type === MessageEntityType.MESSAGEENTITYTYPEMENTION && entity.userid === userId;
            });
        }
        if (msg.media) {
            // @ts-ignore
            const mediaData: Uint8Array = msg.media;
            switch (msg.mediatype) {
                case MediaType.MEDIATYPEEMPTY:
                    break;
                case MediaType.MEDIATYPEPHOTO:
                    out.mediadata = MediaPhoto.deserializeBinary(mediaData).toObject();
                    break;
                case MediaType.MEDIATYPEDOCUMENT:
                    out.mediadata = MediaDocument.deserializeBinary(mediaData).toObject();
                    if (out.mediadata.doc && out.mediadata.doc.attributesList) {
                        const flags: { type: number } = {type: C_MESSAGE_TYPE.Normal};
                        out.attributes = this.parseAttributes(out.mediadata.doc.attributesList, flags);
                        out.messagetype = flags.type;
                    }
                    break;
                case MediaType.MEDIATYPECONTACT:
                    out.mediadata = MediaContact.deserializeBinary(mediaData).toObject();
                    out.messagetype = C_MESSAGE_TYPE.Contact;
                    break;
                case MediaType.MEDIATYPEGEOLOCATION:
                    out.mediadata = MediaGeoLocation.deserializeBinary(mediaData).toObject();
                    out.messagetype = C_MESSAGE_TYPE.Location;
                    break;
            }
            delete out.media;
        }
        if (msg.messageactiondata) {
            // @ts-ignore
            const actionData: Uint8Array = msg.messageactiondata;
            switch (msg.messageaction) {
                case C_MESSAGE_ACTION.MessageActionNope:
                    break;
                case C_MESSAGE_ACTION.MessageActionGroupTitleChanged:
                    out.actiondata = MessageActionGroupTitleChanged.deserializeBinary(actionData).toObject();
                    break;
                case C_MESSAGE_ACTION.MessageActionGroupCreated:
                    out.actiondata = MessageActionGroupCreated.deserializeBinary(actionData).toObject();
                    break;
                case C_MESSAGE_ACTION.MessageActionGroupDeleteUser:
                    out.actiondata = MessageActionGroupDeleteUser.deserializeBinary(actionData).toObject();
                    break;
                case C_MESSAGE_ACTION.MessageActionGroupAddUser:
                    out.actiondata = MessageActionGroupAddUser.deserializeBinary(actionData).toObject();
                    break;
                case C_MESSAGE_ACTION.MessageActionContactRegistered:
                    out.actiondata = MessageActionContactRegistered.deserializeBinary(actionData).toObject();
                    break;
                case C_MESSAGE_ACTION.MessageActionClearHistory:
                    out.actiondata = MessageActionClearHistory.deserializeBinary(actionData).toObject();
                    break;
                case C_MESSAGE_ACTION.MessageActionGroupPhotoChanged:
                    out.actiondata = MessageActionGroupPhotoChanged.deserializeBinary(actionData).toObject();
                    break;
            }
            delete out.messageactiondata;
        }
        let msgType: number = 0;
        switch (out.messagetype) {
            case C_MESSAGE_TYPE.Picture:
                msgType = C_MEDIA_TYPE.PHOTO;
                break;
            case C_MESSAGE_TYPE.Video:
                msgType = C_MEDIA_TYPE.VIDEO;
                break;
            case C_MESSAGE_TYPE.File:
                msgType = C_MEDIA_TYPE.FILE;
                break;
            case C_MESSAGE_TYPE.Music:
                msgType = C_MEDIA_TYPE.AUDIO;
                break;
            case C_MESSAGE_TYPE.Voice:
                msgType = C_MEDIA_TYPE.VOICE;
                break;
            case C_MESSAGE_TYPE.Location:
                msgType = C_MEDIA_TYPE.LOCATION;
                break;
        }
        if (msgType && out.id && (out.id || 0) > 0) {
            MediaRepo.getInstance().lazyUpsert([{
                id: out.id,
                peerid: out.peerid || '',
                type: msgType,
            }]);
        }
        return out;
    }

    public static parseMessageMany(msg: UserMessage.AsObject[], userId: string): IMessage[] {
        return msg.map((m) => {
            return this.parseMessage(m, userId);
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
    private groupRepo: GroupRepo;
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
        this.groupRepo = GroupRepo.getInstance();
        this.rtlDetector = RTLDetector.getInstance();
        this.updateThrottle = throttle(this.insertToDb, 300);
    }

    public loadConnInfo() {
        SDK.getInstance().loadConnInfo();
        this.userId = SDK.getInstance().getConnInfo().UserID || '0';
    }

    public getCurrentUserId(): string {
        return this.userId;
    }

    /* Add pending message */
    public addPending(pending: IPendingMessage) {
        return this.db.pendingMessages.put(pending);
    }

    /* Get pending message by randomId */
    public getPending(id: number) {
        return this.db.pendingMessages.get(id);
    }

    /* Get pending message by messageId */
    public getPendingByMessageId(id: number) {
        return this.db.pendingMessages.where('message_id').equals(id).first();
    }

    /* Remove pending message */
    public removePending(id: number) {
        return this.db.pendingMessages.delete(id);
    }

    public create(msg: IMessage) {
        return this.db.messages.put(msg);
    }

    public createMany(msgs: IMessage[]) {
        return this.db.messages.bulkPut(msgs);
    }

    public truncate() {
        return this.db.messages.clear();
    }

    public removeMany(ids: number[]) {
        ids.map((id) => {
            delete this.lazyMap[id];
        });
        MediaRepo.getInstance().removeMany(ids).catch(() => {
            //
        });
        return this.db.messages.bulkDelete(ids);
    }

    public getMany({peer, limit, before, after, ignoreMax}: any, callback?: (resMsgs: IMessage[]) => void): Promise<IMessage[]> {
        limit = limit || 30;
        let fnCallback = callback;
        if (ignoreMax && callback) {
            fnCallback = this.getPeerPendingMessage(peer, callback);
        }
        return new Promise((resolve, reject) => {
            this.getManyCache({limit, before, after, ignoreMax}, peer, fnCallback).then((res) => {
                const len = res.length;
                if (len < limit) {
                    let maxId = null;
                    let minId = null;
                    if (before !== undefined) {
                        maxId = before - 1;
                    }
                    if (after !== undefined) {
                        minId = after + 1;
                    }
                    if (len > 0 && before !== undefined) {
                        maxId = (res[len - 1].id || 0) - 1;
                    }
                    if (len > 0 && after !== undefined) {
                        minId = (res[len - 1].id || 0) + 1;
                    }
                    if (maxId === 0 || minId === 0) {
                        resolve(res);
                        return;
                    }
                    // if (typeof fnCallback === 'function') {
                    //     fnCallback(res);
                    // }
                    const lim = limit - len;
                    this.sdk.getMessageHistory(peer, {maxId, minId, limit: lim}).then((remoteRes) => {
                        this.userRepo.importBulk(false, remoteRes.usersList);
                        this.groupRepo.importBulk(remoteRes.groupsList);
                        remoteRes.messagesList = MessageRepo.parseMessageMany(remoteRes.messagesList, this.userId);
                        return this.transform(remoteRes.messagesList);
                    }).then((remoteRes) => {
                        this.importBulk(remoteRes, true);
                        resolve([...res, ...remoteRes]);
                    }).catch((err2) => {
                        if (fnCallback === undefined) {
                            reject(err2);
                        }
                    });
                } else {
                    resolve(res);
                }
            }).catch((err) => {
                let maxId = null;
                let minId = null;
                if (before !== undefined) {
                    maxId = before - 1;
                }
                if (after !== undefined) {
                    minId = after + 1;
                }
                this.sdk.getMessageHistory(peer, {maxId, minId, limit}).then((remoteRes) => {
                    this.userRepo.importBulk(false, remoteRes.usersList);
                    this.groupRepo.importBulk(remoteRes.groupsList);
                    remoteRes.messagesList = MessageRepo.parseMessageMany(remoteRes.messagesList, this.userId);
                    return this.transform(remoteRes.messagesList);
                }).then((remoteRes) => {
                    this.importBulk(remoteRes, true);
                    if (typeof fnCallback === 'function') {
                        fnCallback(remoteRes);
                        resolve([]);
                    } else {
                        resolve(remoteRes);
                    }
                }).catch((err2) => {
                    reject(err2);
                });
            });
        });
    }

    public getIn(ids: number[], asc: boolean) {
        const pipe = this.db.messages.where('id').anyOf(ids);
        if (asc) {
            return pipe.toArray();
        } else {
            return pipe.reverse().toArray();
        }
    }

    public getManyCache({limit, before, after, ignoreMax}: any, peer: InputPeer, fnCallback?: (resMsgs: IMessage[]) => void): Promise<IMessage[]> {
        ignoreMax = ignoreMax || false;
        const pipe = this.db.messages.where('[peerid+id]');
        let pipe2: Dexie.Collection<IMessage, number>;
        let mode = 0x0;
        if (before !== null && before !== undefined) {
            mode = mode | 0x1;
        }
        if (after !== null && after !== undefined) {
            mode = mode | 0x2;
        }
        limit = limit || 30;
        const peerId = peer.getId() || '';
        switch (mode) {
            // none
            default:
            case 0x0:
                pipe2 = pipe.between([peerId, Dexie.minKey], [peerId, Dexie.maxKey], true, true);
                break;
            // before
            case 0x1:
                before = (ignoreMax ? before - 1 : before);
                pipe2 = pipe.between([peerId, Dexie.minKey], [peerId, before], true, true);
                break;
            // after
            case 0x2:
                pipe2 = pipe.between([peerId, after], [peerId, Dexie.maxKey], true, true);
                break;
            // between
            case 0x3:
                pipe2 = pipe.between([peerId, after + 1], [peerId, before - 1], true, true);
                break;
        }
        if (mode !== 0x2) {
            pipe2 = pipe2.reverse();
        }
        pipe2 = pipe2.filter((item: IMessage) => {
            return item.temp !== true && (item.id || 0) > 0;
        });
        return pipe2.limit(limit + (ignoreMax ? 1 : 2)).toArray().then((res) => {
            const cacheMsgs: IMessage[] = [];
            const hasHole = res.some((msg) => {
                if (fnCallback && ignoreMax && mode === 0x1) {
                    if (msg.messagetype === C_MESSAGE_TYPE.Hole) {
                        fnCallback(cacheMsgs);
                        return true;
                    }
                    cacheMsgs.push(msg);
                }
                return (msg.messagetype === C_MESSAGE_TYPE.Hole);
            });
            window.console.log('has hole:', hasHole);
            if (!hasHole) {
                // Trims start of result
                if (res.length > 0) {
                    if (mode === 0x2) {
                        if (res[0].id === after) {
                            res.shift();
                        }
                    } else {
                        if (res[0].id === before && !ignoreMax) {
                            res.shift();
                        }
                    }
                }
                // Trims end of result
                if (res.length === limit + 1) {
                    res.pop();
                }

                if (fnCallback) {
                    fnCallback(res);
                    return [];
                } else {
                    return res;
                }
            } else {
                return this.checkHoles(peer, (mode === 0x2 ? after + 1 : before - (ignoreMax ? 0 : 1)), (mode === 0x2), limit, ignoreMax).then((remoteRes) => {
                    this.userRepo.importBulk(false, remoteRes.usersList);
                    this.groupRepo.importBulk(remoteRes.groupsList);
                    remoteRes.messagesList = MessageRepo.parseMessageMany(remoteRes.messagesList, this.userId);
                    return this.transform(remoteRes.messagesList);
                }).then((remoteRes) => {
                    this.importBulk(remoteRes, true);
                    return remoteRes;
                });
            }
        });
    }

    public get(id: number, peer?: InputPeer | null): Promise<IMessage | null> {
        return new Promise((resolve, reject) => {
            if (this.lazyMap.hasOwnProperty(id)) {
                resolve(this.lazyMap[id]);
                return;
            }
            this.db.messages.get(id).then((res: IMessage) => {
                if (res) {
                    resolve(res);
                } else {
                    throw Error('not found');
                }
            }).catch(() => {
                if (peer) {
                    this.sdk.getMessageHistory(peer, {minId: id, maxId: id}).then((remoteRes) => {
                        if (remoteRes.messagesList.length === 0) {
                            resolve(null);
                        } else {
                            const message = MessageRepo.parseMessage(remoteRes.messagesList[0], this.userId);
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
            if (msg.senderid) {
                msg.me = (msg.senderid === this.userId);
            }
            if (msg.body) {
                msg.rtl = this.rtlDetector.direction(msg.body || '');
            }
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

    public upsert(msgs: IMessage[], callerId?: number): Promise<any> {
        const peerIdMap: object = {};
        const newIds: number[] = [];
        const ids = msgs.map((msg) => {
            return msg.id || '';
        });
        return this.db.messages.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IMessage[] = differenceBy(msgs, result, 'id');
            const updateItems: IMessage[] = result;
            updateItems.map((msg: IMessage) => {
                const t = find(msgs, {id: msg.id});
                if (t && t.temp === true && msg.temp === false) {
                    const d = this.mergeCheck(msg, t);
                    d.temp = false;
                    return d;
                } else if (t) {
                    return this.mergeCheck(msg, t);
                } else {
                    return msg;
                }
            });
            createItems.forEach((msg) => {
                if (msg.peerid && !peerIdMap.hasOwnProperty(msg.peerid)) {
                    peerIdMap[msg.peerid] = true;
                }
                newIds.push(msg.id || 0);
            });
            return this.createMany([...createItems, ...updateItems]).then((res) => {
                this.broadcastEvent('Message_DB_Added', {ids: newIds, peerids: Object.keys(peerIdMap), callerId});
                return res;
            });
        });
    }

    public remove(id: number): Promise<any> {
        if (this.lazyMap.hasOwnProperty(id)) {
            delete this.lazyMap[id];
            return Promise.resolve();
        }
        return this.db.messages.delete(id);
    }

    public getUnreadCount(peerId: string, minId: number, topMessageId: number): Promise<{ message: number, mention: number }> {
        if (topMessageId === 0) {
            // @ts-ignore
            topMessageId = Dexie.maxKey;
        }
        if (minId === undefined) {
            return Promise.reject('bad input');
        }
        return new Promise((resolve, reject) => {
            let mention = 0;
            this.db.messages.where('[peerid+id]')
                .between([peerId, minId + 1], [peerId, topMessageId], true, true).filter((item) => {
                if (item.temp !== true && item.me !== true && ((item.id || 0) >= minId) && item.mention_me === true) {
                    mention += 1;
                }
                return item.temp !== true && item.me !== true && ((item.id || 0) >= minId) &&
                    (item.messagetype === C_MESSAGE_TYPE.Normal || item.messagetype !== C_MESSAGE_TYPE.System);
            }).count().then((count) => {
                resolve({
                    mention,
                    message: count
                });
            }).catch(reject);
        });
    }

    public clearHistory(peerId: string, messageId: number): Promise<any> {
        return this.db.messages.where('[peerid+id]').between([peerId, Dexie.minKey], [peerId, messageId], true, true).delete();
    }

    public flush() {
        return;
        // Disabling debouncer
        this.updateThrottle.cancel();
        this.insertToDb();
    }

    public lazyUpsert(messages: IMessage[], temp?: boolean) {
        if (this.userId === '0' || this.userId === '') {
            this.loadConnInfo();
        }
        // Start
        const msgs = cloneDeep(messages);
        msgs.forEach((message) => {
            if (message.senderid) {
                message.me = (message.senderid === this.userId);
            }
            if (message.body) {
                message.rtl = this.rtlDetector.direction(message.body || '');
            }
            message.temp = (temp === true);
        });
        this.upsert(msgs);
        // End
        return;
        // Disabling debouncer
        cloneDeep(messages).forEach((message) => {
            this.updateMap(message, temp);
        });
        this.updateThrottle();
    }

    public insertHole(peerId: string, id: number, asc: boolean) {
        return this.db.messages.put({
            id: id + (asc ? 0.5 : -0.5),
            messagetype: C_MESSAGE_TYPE.Hole,
            peerid: peerId,
        });
    }

    private getPeerPendingMessage(peer: InputPeer, fnCallback: (resMsgs: IMessage[]) => void) {
        const peerId = peer.getId() || '';
        const fn = (msg: IMessage[]) => {
            this.db.messages.where('[peerid+id]').between([peerId, Dexie.minKey], [peerId, -1], true, true).toArray().then((items) => {
                fnCallback(items.concat(msg));
            }).catch(() => {
                fnCallback(msg);
            });
        };
        return fn;
    }

    private updateMap = (message: IMessage, temp?: boolean) => {
        if (message.senderid) {
            message.me = (message.senderid === this.userId);
        }
        if (message.body) {
            message.rtl = this.rtlDetector.direction(message.body || '');
        }
        message.temp = (temp === true);
        if (this.lazyMap.hasOwnProperty(message.id || 0)) {
            const t = this.lazyMap[message.id || 0];
            if (t && t.temp === false && temp) {
                this.lazyMap[message.id || 0] = this.mergeCheck(message, t);
                this.lazyMap[message.id || 0].temp = false;
            } else {
                this.lazyMap[message.id || 0] = this.mergeCheck(message, t);
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
        });
    }

    private checkHoles(peer: InputPeer, id: number, asc: boolean, limit: number, ignoreMax: boolean) {
        let query = {};
        if (asc) {
            query = {
                limit,
                minId: id,
            };
        } else {
            query = {
                limit,
                maxId: id,
            };
        }
        return this.sdk.getMessageHistory(peer, query).then((remoteRes) => {
            return this.modifyHoles(peer.getId() || '', remoteRes.messagesList, asc, ignoreMax).then(() => {
                return remoteRes;
            });
        });
    }

    private modifyHoles(peerId: string, res: UserMessage.AsObject[], asc: boolean, ignoreMax: boolean) {
        let max = 0;
        let min = Infinity;
        res.forEach((item) => {
            if (item.id && item.id > max) {
                max = item.id;
            }
            if (item.id && item.id < min) {
                min = item.id;
            }
        });
        return this.removeHolesInRange(peerId, min, max, asc, ignoreMax);
    }

    private removeHolesInRange(peerId: string, min: number, max: number, asc: boolean, ignoreMax: boolean) {
        return this.db.messages.where('[peerid+id]').between([peerId, min - 1], [peerId, max + 1], true, true).filter((item) => {
            return (item.messagetype === C_MESSAGE_TYPE.Hole);
        }).delete().finally(() => {
            const promises: Array<Promise<IMessage | undefined>> = [];
            promises.push(this.db.messages.get(min - 1));
            promises.push(this.db.messages.get(max + 1));
            return new Promise((resolve) => {
                Promise.all(promises).then((resArr) => {
                    if (!resArr[0]) {
                        this.insertHole(peerId, min, false);
                    }
                    if (!resArr[1] && !ignoreMax) {
                        this.insertHole(peerId, max, true);
                    }
                    resolve();
                });
            });
        });
    }

    private mergeCheck(message: IMessage, newMessage: IMessage): IMessage {
        if (message.contentread) {
            newMessage.contentread = true;
        }
        message.entitiesList = newMessage.entitiesList;
        const d = merge(message, newMessage);
        return d;
    }

    private broadcastEvent(name: string, data: any) {
        const event = new CustomEvent(name, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(event);
    }
}
