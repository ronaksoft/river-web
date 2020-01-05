/*
    Creation Time: 2018 - Aug - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import MessageDB from '../../services/db/message';
import {IMessage, IMessageWithCount, IPendingMessage} from './interface';
import {cloneDeep, differenceBy, find, throttle, findIndex, uniq, difference} from 'lodash';
import SDK from '../../services/sdk';
import UserRepo from '../user';
import RTLDetector from '../../services/utilities/rtl_detector';
import {InputPeer, MediaType, MessageEntityType, UserMessage} from '../../services/sdk/messages/chat.core.types_pb';
import Dexie from 'dexie';
import {DexieMessageDB} from '../../services/db/dexie/message';
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE} from './consts';
import GroupRepo from '../group';
import {
    DocumentAttribute, DocumentAttributeAudio, DocumentAttributeFile, DocumentAttributePhoto, DocumentAttributeType,
    DocumentAttributeVideo, MediaContact, MediaDocument, MediaGeoLocation, MediaPhoto,
} from '../../services/sdk/messages/chat.core.message.medias_pb';
import {
    MessageActionClearHistory, MessageActionContactRegistered, MessageActionGroupAddUser, MessageActionGroupCreated,
    MessageActionGroupDeleteUser, MessageActionGroupPhotoChanged, MessageActionGroupTitleChanged,
} from '../../services/sdk/messages/chat.core.message.actions_pb';
import MediaRepo from '../media';
import {C_MEDIA_TYPE} from '../media/interface';
import {kMerge} from "../../services/utilities/kDash";
import {emojiLevel} from "../../services/utilities/emoji";

interface IMessageBundlePromise {
    reject: any;
    resolve: any;
}

interface IMessageBundleReq {
    id: number;
    promises: IMessageBundlePromise[];
}

interface IMessageBundle {
    peer: InputPeer;
    reqs: { [key: string]: IMessageBundleReq };
}

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
                        flags.type = C_MESSAGE_TYPE.Audio;
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
            case C_MESSAGE_TYPE.Audio:
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
        if (out.body) {
            out.rtl = RTLDetector.getInstance().direction(out.body);
        }
        if (out.mediadata && out.mediadata.caption && out.mediadata.caption.length > 0) {
            out.rtl = RTLDetector.getInstance().direction(out.mediadata.caption);
        }
        const emLe = emojiLevel(out.body);
        if (emLe) {
            out.em_le = emLe;
        }
        out.me = (userId === out.senderid);
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
    private lazyMap: { [key: number]: IMessage } = {};
    private messageBundle: { [key: string]: IMessageBundle } = {};
    // @ts-ignore
    private readonly getBundleMessageThrottle: any = null;
    // @ts-ignore
    private readonly updateThrottle: any = null;

    private constructor() {
        SDK.getInstance().loadConnInfo();
        this.userId = SDK.getInstance().getConnInfo().UserID || '0';
        this.dbService = MessageDB.getInstance();
        this.db = this.dbService.getDB();
        this.sdk = SDK.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.updateThrottle = throttle(this.insertToDb, 300);
        this.getBundleMessageThrottle = throttle(this.getMessageForBundle, 300);
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

    public exists(id: number) {
        return new Promise((resolve) => {
            return this.db.messages.get(id).then((res) => {
                if (res) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(() => {
                resolve(false);
            });
        });
    }

    public removeMany(ids: number[], callerId?: number) {
        ids.forEach((id) => {
            delete this.lazyMap[id];
        });
        MediaRepo.getInstance().removeMany(ids).catch(() => {
            //
        });
        return this.db.messages.bulkDelete(ids).then((res) => {
            this.broadcastEvent('Message_DB_Removed', {ids, callerId});
            return res;
        });
    }

    public getMany({peer, limit, before, after, ignoreMax}: any, callback?: (resMsgs: IMessage[]) => void): Promise<IMessage[]> {
        limit = limit || 30;
        let fnCallback = callback;
        if (ignoreMax && callback) {
            fnCallback = this.getPeerPendingMessage(peer, callback);
        }
        return new Promise((resolve, reject) => {
            this.getManyCache({limit, before, after, ignoreMax}, peer, fnCallback).then((res) => {
                const len = res.count;
                if (len < limit) {
                    if (before !== undefined && len > 0) {
                        const index = findIndex(res.messages, {messagetype: C_MESSAGE_TYPE.End});
                        if (index > -1) {
                            resolve(res.messages);
                            return;
                        }
                    }
                    let maxId = null;
                    let minId = null;
                    if (before !== undefined) {
                        maxId = before - 1;
                    }
                    if (after !== undefined) {
                        minId = after + 1;
                    }
                    if (len > 0 && res.lastId !== -1 && before !== undefined) {
                        maxId = res.lastId - 1;
                    }
                    if (len > 0 && res.lastId !== -1 && after !== undefined) {
                        minId = res.lastId + 1;
                    }
                    if (maxId === 0 || minId === 0) {
                        resolve(res.messages);
                        return;
                    }
                    const lim = limit - len;
                    this.sdk.getMessageHistory(peer, {maxId, minId, limit: lim}).then((remoteRes) => {
                        this.userRepo.importBulk(false, remoteRes.usersList);
                        this.groupRepo.importBulk(remoteRes.groupsList);
                        remoteRes.messagesList = MessageRepo.parseMessageMany(remoteRes.messagesList, this.userId);
                        return this.transform(remoteRes.messagesList);
                    }).then((remoteRes) => {
                        this.checkBoundaries(peer.getId() || '', lim, res.messages, remoteRes, before !== undefined);
                        this.importBulk(remoteRes, true);
                        resolve([...res.messages, ...remoteRes]);
                    }).catch((err2) => {
                        if (fnCallback === undefined) {
                            reject(err2);
                        }
                    });
                } else {
                    resolve(res.messages);
                }
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

    public getManyCache({limit, before, after, ignoreMax}: any, peer: InputPeer, fnCallback?: (resMsgs: IMessage[]) => void): Promise<IMessageWithCount> {
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
            const hasHole = res.some((msg, key) => {
                if (fnCallback && ignoreMax && mode === 0x1) {
                    if (msg.messagetype === C_MESSAGE_TYPE.Hole) {
                        fnCallback(cacheMsgs);
                        return true;
                    }
                    cacheMsgs.push(msg);
                }
                return (msg.messagetype === C_MESSAGE_TYPE.Hole);
            });
            window.console.debug('has hole:', hasHole);
            const endIndex = findIndex(res, {messagetype: C_MESSAGE_TYPE.End});
            if (!hasHole || endIndex > -1) {
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
                    return {
                        count: res.length,
                        lastId: res.length > 0 ? res[res.length - 1].id : -1,
                        messages: [],
                    };
                } else {
                    return {
                        count: res.length,
                        lastId: res.length > 0 ? res[res.length - 1].id : -1,
                        messages: res,
                    };
                }
            } else {
                return this.checkHoles(peer, (mode === 0x2 ? after + 1 : before - (ignoreMax ? 0 : 1)), (mode === 0x2), limit, ignoreMax).then((remoteRes) => {
                    this.userRepo.importBulk(false, remoteRes.usersList);
                    this.groupRepo.importBulk(remoteRes.groupsList);
                    remoteRes.messagesList = MessageRepo.parseMessageMany(remoteRes.messagesList, this.userId);
                    return this.transform(remoteRes.messagesList);
                }).then((remoteRes) => {
                    this.importBulk(remoteRes, true);
                    return {
                        count: remoteRes.length,
                        lastId: remoteRes.length > 0 ? remoteRes[remoteRes.length - 1].id : -1,
                        messages: remoteRes,
                    };
                });
            }
        });
    }

    public getLastMessage(peerId: string) {
        return this.db.messages.where('[peerid+id]').between([peerId, Dexie.minKey], [peerId, Dexie.maxKey], true, true)
            .filter((item: IMessage) => {
                return item.temp !== true && (item.id || 0) > 0 && item.messagetype !== C_MESSAGE_TYPE.Hole;
            }).last();
    }

    public get(id: number, peer?: InputPeer | null): Promise<IMessage | null> {
        return new Promise((resolve, reject) => {
            if (this.lazyMap.hasOwnProperty(id)) {
                resolve(this.lazyMap[id]);
                return;
            }
            const fn = () => {
                if (peer) {
                    this.getBundleMessage(peer, id).then((remoteRes) => {
                        resolve(remoteRes);
                    }).catch((err) => {
                        reject(err);
                    });
                } else {
                    reject();
                }
            };
            this.db.messages.get(id).then((res: IMessage | undefined) => {
                if (res) {
                    resolve(res);
                } else {
                    fn();
                }
            }).catch(() => {
                fn();
            });
        });
    }

    public getBundleMessage(peer: InputPeer, id: number): Promise<IMessage> {
        let internalResolve = null;
        let internalReject = null;

        const promise = new Promise<IMessage>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        const peerId = peer.getId() || '';

        if (!this.messageBundle.hasOwnProperty(peerId)) {
            this.messageBundle[peerId] = {
                peer,
                reqs: {},
            };
        }

        const idStr = String(id);

        if (!this.messageBundle[peerId].reqs.hasOwnProperty(idStr)) {
            this.messageBundle[peerId].reqs[idStr] = {
                id,
                promises: [],
            };
        }

        this.messageBundle[peerId].reqs[idStr].promises.push({
            reject: internalReject,
            resolve: internalResolve,
        });

        setTimeout(() => {
            this.getBundleMessageThrottle();
        }, 100);

        return promise;
    }

    // Search message bodies
    public search(peerId: string, {keyword, labelIds, before, after, limit}: { keyword: string, labelIds?: number[], before?: number, after?: number, limit?: number }) {
        let mode = 0x0;
        if (before !== null && before !== undefined) {
            mode = mode | 0x1;
        }
        if (after !== null && after !== undefined) {
            mode = mode | 0x2;
        }
        const pipe = this.db.messages.where('[peerid+id]');
        let pipe2: Dexie.Collection<IMessage, number>;
        switch (mode) {
            // none
            default:
            case 0x0:
                pipe2 = pipe.between([peerId, Dexie.minKey], [peerId, Dexie.maxKey], true, true);
                break;
            // before
            case 0x1:
                pipe2 = pipe.between([peerId, Dexie.minKey], [peerId, before || 0], true, true);
                break;
            // after
            case 0x2:
                pipe2 = pipe.between([peerId, after || 0], [peerId, Dexie.maxKey], true, true);
                break;
            // between
            case 0x3:
                pipe2 = pipe.between([peerId, (after || 0) + 1], [peerId, (before || 0) - 1], true, true);
                break;
        }
        if (mode !== 0x2) {
            pipe2 = pipe2.reverse();
        }
        if (keyword.length > 0 || (labelIds && labelIds.length > 0)) {
            const reg = new RegExp(keyword || '', 'i');
            pipe2 = pipe2.filter((item: IMessage) => {
                if (item.messagetype !== C_MESSAGE_TYPE.Hole && item.messagetype !== C_MESSAGE_TYPE.End && item.temp !== true && (item.id || 0) > 0) {
                    let isMatched = false;
                    if (labelIds && labelIds.length && item.labelidsList && item.labelidsList.length && difference(labelIds, item.labelidsList).length === 0) {
                        isMatched = true;
                    }
                    if (keyword.length > 0) {
                        if (item.messagetype === 0 || item.messagetype === C_MESSAGE_TYPE.Normal) {
                            isMatched = reg.test(item.body || '');
                        } else {
                            if (item.mediadata && item.mediadata.caption) {
                                isMatched = reg.test(item.mediadata.caption || '');
                            }
                        }
                    }
                    return isMatched;
                } else {
                    return false;
                }
            });
        }
        return pipe2.limit(limit || 32).toArray();
    }

    public searchAll({keyword, labelIds}: { keyword?: string, labelIds?: number[] }, {after, limit, includeTemp}: { after?: number, limit?: number, includeTemp?: boolean }) {
        const pipe = this.db.messages;
        let pipe2: Dexie.Collection<IMessage, number>;
        if (after) {
            pipe2 = pipe.where('id').below(after);
        } else {
            pipe2 = pipe.reverse();
        }
        const term = keyword || '';
        if (term.length > 0 || (labelIds && labelIds.length > 0)) {
            const reg = new RegExp(term, 'i');
            pipe2 = pipe2.filter((item: IMessage) => {
                if (item.messagetype !== C_MESSAGE_TYPE.Hole && item.messagetype !== C_MESSAGE_TYPE.End && ((item.temp !== true && !includeTemp) || includeTemp) && (item.id || 0) > 0) {
                    let isMatched = false;
                    if (labelIds && labelIds.length && item.labelidsList && item.labelidsList.length && difference(labelIds, item.labelidsList).length === 0) {
                        isMatched = true;
                    }
                    if (term.length > 0) {
                        if (item.messagetype === 0 || item.messagetype === C_MESSAGE_TYPE.Normal) {
                            isMatched = reg.test(item.body || '');
                        } else {
                            if (item.mediadata && item.mediadata.caption) {
                                isMatched = reg.test(item.mediadata.caption || '');
                            }
                        }
                    }
                    return isMatched;
                } else {
                    return false;
                }
            });
        }
        return pipe2.limit(limit || 32).toArray();
    }

    public transform(msgs: IMessage[]) {
        return msgs.map((msg) => {
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
        return this.upsert(tempMsgs).catch((err) => {
            window.console.debug(err);
        });
    }

    public upsert(msgs: IMessage[], callerId?: number): Promise<any> {
        const peerIdMap: { [key: string]: number[] } = {};
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
                if (msg.peerid) {
                    if (!peerIdMap.hasOwnProperty(msg.peerid)) {
                        peerIdMap[msg.peerid] = [];
                    }
                    peerIdMap[msg.peerid].push(msg.id || 0);
                }
            });
            return this.createMany([...createItems, ...updateItems]).then((res) => {
                this.broadcastEvent('Message_DB_Added', {newMsg: peerIdMap, callerId});
                return res;
            });
        });
    }

    public remove(id: number, callerId?: number): Promise<any> {
        if (this.lazyMap.hasOwnProperty(id)) {
            delete this.lazyMap[id];
            // return Promise.resolve();
        }
        return this.db.messages.delete(id).then((res) => {
            this.broadcastEvent('Message_DB_Removed', {ids: [id], callerId});
            return res;
        });
    }

    public getUnreadCount(peerId: string, minId: number, topMessageId: number): Promise<{ message: number, mention: number }> {
        if (topMessageId === 0) {
            // @ts-ignore
            topMessageId = Dexie.maxKey;
        }
        if (minId === undefined) {
            return Promise.reject('bad input');
        }
        if (minId === topMessageId && topMessageId > 0) {
            return Promise.resolve({
                mention: 0,
                message: 0,
            });
        }
        return new Promise((resolve, reject) => {
            let mention = 0;
            this.db.messages.where('[peerid+id]')
                .between([peerId, minId + 1], [peerId, topMessageId], true, true).filter((item) => {
                if (item.temp !== true && item.me !== true && ((item.id || 0) >= minId) && item.mention_me === true) {
                    mention += 1;
                }
                return Boolean(
                    item.temp !== true && item.me !== true && ((item.id || 0) >= minId) && item.peerid === peerId &&
                    (item.messagetype !== C_MESSAGE_TYPE.Gap && item.messagetype !== C_MESSAGE_TYPE.Hole && item.messagetype !== C_MESSAGE_TYPE.End && item.messagetype !== C_MESSAGE_TYPE.Date && item.messagetype !== C_MESSAGE_TYPE.NewMessage));
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
        // this.updateThrottle.cancel();
        // this.insertToDb();
    }

    public lazyUpsert(messages: IMessage[], temp?: boolean) {
        if (this.userId === '0' || this.userId === '') {
            this.loadConnInfo();
        }
        // Start
        const msgs = cloneDeep(messages);
        msgs.forEach((message) => {
            message.temp = (temp === true);
        });
        return this.upsert(msgs);
        // End
        // Disabling debouncer
        // cloneDeep(messages).forEach((message) => {
        //     this.updateMap(message, temp);
        // });
        // this.updateThrottle();
        // return Promise.resolve();
    }

    public insertHole(peerId: string, id: number, asc: boolean) {
        return this.db.messages.put({
            id: id + (asc ? 0.5 : -0.5),
            messagetype: C_MESSAGE_TYPE.Hole,
            peerid: peerId,
        });
    }

    public insertEnd(peerId: string, id: number) {
        return this.db.messages.put({
            id: id - 0.5,
            messagetype: C_MESSAGE_TYPE.End,
            peerid: peerId,
        });
    }

    private getPeerPendingMessage(peer: InputPeer, fnCallback: (resMsgs: IMessage[]) => void) {
        const peerId = peer.getId() || '';
        const fn = (msg: IMessage[]) => {
            this.db.messages.where('[peerid+id]').between([peerId, Dexie.minKey], [peerId, -1], true, true).filter((o) => {
                return !Boolean(o.pmodified);
            }).toArray().then((items) => {
                fnCallback(items.concat(msg));
            }).catch(() => {
                fnCallback(msg);
            });
        };
        return fn;
    }

    /*private updateMap = (message: IMessage, temp?: boolean) => {
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
    }*/

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
        if (newMessage.added_labels) {
            message.labelidsList = uniq([...(message.labelidsList || []), ...newMessage.added_labels]);
            delete newMessage.added_labels;
        }
        if (newMessage.removed_labels) {
            message.labelidsList = difference(message.labelidsList || [], newMessage.removed_labels);
            delete newMessage.removed_labels;
        }
        const d = kMerge(message, newMessage);
        return d;
    }

    private getMessageForBundle = () => {
        Object.keys(this.messageBundle).forEach((peerid) => {
            const data = this.messageBundle[peerid];
            const peer = data.peer;
            const ids: number[] = [];
            Object.keys(data.reqs).forEach((idStr) => {
                ids.push(data.reqs[idStr].id);
            });
            if (ids.length === 0) {
                delete this.messageBundle[peerid];
                return;
            }
            delete this.messageBundle[peerid];
            this.sdk.getManyMessage(peer, ids).then((res) => {
                const messages: IMessage[] = [];
                const dataIds = Object.keys(data.reqs);
                res.messagesList.forEach((msg) => {
                    const idStr = String(msg.id || 0);
                    const message = MessageRepo.parseMessage(msg, this.userId);
                    messages.push(message);
                    if (data.reqs[idStr]) {
                        data.reqs[idStr].promises.forEach((promise) => {
                            promise.resolve(message);
                        });
                        const index = dataIds.indexOf(idStr);
                        if (index > -1) {
                            ids.splice(index, 0);
                        }
                    }
                });
                dataIds.forEach((id) => {
                    data.reqs[id].promises.forEach((promise) => {
                        promise.reject();
                    });
                });
                this.lazyUpsert(messages, true);
                this.userRepo.importBulk(false, res.usersList);
                this.groupRepo.importBulk(res.groupsList);
            }).catch((err) => {
                if (data.reqs) {
                    Object.keys(data.reqs).forEach((idStr) => {
                        data.reqs[idStr].promises.forEach((promise) => {
                            promise.reject(err);
                        });
                    });
                }
            });
        });
    }

    private checkBoundaries(peeId: string, limit: number, local: IMessage[], remote: IMessage[], before: boolean) {
        return;
        // if (local.length > 0) {
        //     let min = local[local.length - 1].id || 0;
        //     let max = local[0].id || 0;
        //     min = Math.min(min, max);
        //     if (remote.length > 0) {
        //         min = remote[remote.length - 1].id || 0;
        //         max = remote[0].id || 0;
        //         min = Math.min(min, max);
        //         if (before) {
        //             this.insertHole(peeId, min, true);
        //             if (remote.length < limit) {
        //                 this.insertEnd(peeId, min);
        //             }
        //         }
        //     } else {
        //         if (before && local.length < limit) {
        //             this.insertEnd(peeId, min);
        //         }
        //     }
        // } else if (before) {
        //     this.insertEnd(peeId, 1.5);
        // }
    }

    private broadcastEvent(name: string, data: any) {
        const event = new CustomEvent(name, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(event);
    }
}
