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
import {cloneDeep, differenceBy, find, throttle, uniq, difference, groupBy} from 'lodash';
import APIManager from '../../services/sdk';
import UserRepo from '../user';
import RTLDetector from '../../services/utilities/rtl_detector';
import {InputPeer, MediaType, MessageEntityType, UserMessage} from '../../services/sdk/messages/core.types_pb';
import Dexie from 'dexie';
import {DexieMessageDB} from '../../services/db/dexie/message';
import {C_BUTTON_ACTION, C_MESSAGE_ACTION, C_MESSAGE_TYPE, C_REPLY_ACTION} from './consts';
import GroupRepo from '../group';
import {
    DocumentAttribute,
    DocumentAttributeAnimated,
    DocumentAttributeAudio,
    DocumentAttributeFile,
    DocumentAttributePhoto,
    DocumentAttributeType,
    DocumentAttributeVideo,
    MediaContact,
    MediaDocument,
    MediaGeoLocation,
} from '../../services/sdk/messages/chat.messages.medias_pb';
import {
    MessageActionClearHistory, MessageActionContactRegistered, MessageActionGroupAddUser, MessageActionGroupCreated,
    MessageActionGroupDeleteUser, MessageActionGroupPhotoChanged, MessageActionGroupTitleChanged,
} from '../../services/sdk/messages/chat.messages.actions_pb';
import MediaRepo from '../media';
import {C_MEDIA_TYPE} from '../media/interface';
import {kMerge} from "../../services/utilities/kDash";
import {emojiLevel} from "../../services/utilities/emoji";
import FileRepo from "../file";
import {
    Button,
    ButtonBuy,
    ButtonCallback,
    ButtonRequestGeoLocation,
    ButtonRequestPhone,
    ButtonSwitchInline,
    ButtonUrl,
    ReplyInlineMarkup, ReplyKeyboardForceReply, ReplyKeyboardHide,
    ReplyKeyboardMarkup
} from "../../services/sdk/messages/chat.messages.markups_pb";

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

export const getMediaDocument = (msg: IMessage) => {
    let mediaDocument: MediaDocument.AsObject | undefined;
    if (msg.mediatype === MediaType.MEDIATYPEDOCUMENT) {
        mediaDocument = msg.mediadata;
    }
    return mediaDocument;
};

export default class MessageRepo {
    public static parseButton(replyInline: ReplyInlineMarkup.AsObject) {
        replyInline.rowsList.forEach((r1, i) => {
            r1.buttonsList.forEach((r2, j) => {
                // @ts-ignore
                const data: Uint8Array = r2.data;
                switch (replyInline.rowsList[i].buttonsList[j].constructor) {
                    case C_BUTTON_ACTION.Button:
                        // @ts-ignore
                        replyInline.rowsList[i].buttonsList[j].buttondata = Button.deserializeBinary(data).toObject();
                        break;
                    case C_BUTTON_ACTION.ButtonBuy:
                        // @ts-ignore
                        replyInline.rowsList[i].buttonsList[j].buttondata = ButtonBuy.deserializeBinary(data).toObject();
                        break;
                    case C_BUTTON_ACTION.ButtonCallback:
                        // @ts-ignore
                        replyInline.rowsList[i].buttonsList[j].buttondata = ButtonCallback.deserializeBinary(data).toObject();
                        break;
                    case C_BUTTON_ACTION.ButtonRequestGeoLocation:
                        // @ts-ignore
                        replyInline.rowsList[i].buttonsList[j].buttondata = ButtonRequestGeoLocation.deserializeBinary(data).toObject();
                        break;
                    case C_BUTTON_ACTION.ButtonRequestPhone:
                        // @ts-ignore
                        replyInline.rowsList[i].buttonsList[j].buttondata = ButtonRequestPhone.deserializeBinary(data).toObject();
                        break;
                    case C_BUTTON_ACTION.ButtonSwitchInline:
                        // @ts-ignore
                        replyInline.rowsList[i].buttonsList[j].buttondata = ButtonSwitchInline.deserializeBinary(data).toObject();
                        break;
                    case C_BUTTON_ACTION.ButtonUrl:
                        // @ts-ignore
                        replyInline.rowsList[i].buttonsList[j].buttondata = ButtonUrl.deserializeBinary(data).toObject();
                        break;
                }
                delete r2.data;
            });
        });
        return replyInline;
    }

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
                    break;
                case DocumentAttributeType.ATTRIBUTETYPEFILE:
                    // @ts-ignore
                    attrOut.push(DocumentAttributeFile.deserializeBinary(attr.data).toObject());
                    if (flags.type === C_MESSAGE_TYPE.Normal) {
                        flags.type = C_MESSAGE_TYPE.File;
                    }
                    break;
                case DocumentAttributeType.ATTRIBUTETYPEPHOTO:
                    // @ts-ignore
                    attrOut.push(DocumentAttributePhoto.deserializeBinary(attr.data).toObject());
                    if (flags.type !== C_MESSAGE_TYPE.Gif) {
                        flags.type = C_MESSAGE_TYPE.Picture;
                    }
                    break;
                case DocumentAttributeType.ATTRIBUTETYPEVIDEO:
                    // @ts-ignore
                    attrOut.push(DocumentAttributeVideo.deserializeBinary(attr.data).toObject());
                    flags.type = C_MESSAGE_TYPE.Video;
                    break;
                case DocumentAttributeType.ATTRIBUTETYPEANIMATED:
                    // @ts-ignore
                    attrOut.push(DocumentAttributeAnimated.deserializeBinary(attr.data).toObject());
                    flags.type = C_MESSAGE_TYPE.Gif;
                    break;
            }
            delete attr.data;
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
                case MediaType.MEDIATYPEDOCUMENT:
                    out.mediadata = MediaDocument.deserializeBinary(mediaData).toObject();
                    if (out.mediadata.doc && out.mediadata.doc.attributesList) {
                        const flags: { type: number } = {type: C_MESSAGE_TYPE.Normal};
                        out.attributes = this.parseAttributes(out.mediadata.doc.attributesList, flags);
                        out.messagetype = flags.type;
                    }
                    const mediaDocument: MediaDocument.AsObject = out.mediadata;
                    // Check downloaded documents
                    if (mediaDocument && mediaDocument.doc && mediaDocument.doc.id) {
                        FileRepo.getInstance().getFileMapByMediaDocument(mediaDocument).then((res) => {
                            if (res) {
                                setTimeout(() => {
                                    MessageRepo.getInstance().importBulk([{
                                        downloaded: true,
                                        id: msg.id,
                                        saved: res.saved,
                                        saved_path: res.saved_path,
                                    }]);
                                }, 1000);
                                FileRepo.getInstance().upsertFileMap([{
                                    clusterid: res.clusterid,
                                    id: res.id,
                                    msg_ids: [msg.id || 0],
                                }]);
                            }
                        });
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
        if (msg.replymarkupdata) {
            // @ts-ignore
            const replyData: Uint8Array = msg.replymarkupdata;
            switch (msg.replymarkup) {
                case C_REPLY_ACTION.ReplyInlineMarkup:
                    out.replydata = this.parseButton(ReplyInlineMarkup.deserializeBinary(replyData).toObject());
                    break;
                case C_REPLY_ACTION.ReplyKeyboardMarkup:
                    out.replydata = this.parseButton(ReplyKeyboardMarkup.deserializeBinary(replyData).toObject());
                    break;
                case C_REPLY_ACTION.ReplyKeyboardHide:
                    out.replydata = ReplyKeyboardHide.deserializeBinary(replyData).toObject();
                    break;
                case C_REPLY_ACTION.ReplyKeyboardForceReply:
                    out.replydata = ReplyKeyboardForceReply.deserializeBinary(replyData).toObject();
                    break;
            }
            delete out.replymarkupdata;
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
            case C_MESSAGE_TYPE.Gif:
                msgType = C_MEDIA_TYPE.GIF;
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
    private apiManager: APIManager;
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
        APIManager.getInstance().loadConnInfo();
        this.userId = APIManager.getInstance().getConnInfo().UserID || '0';
        this.dbService = MessageDB.getInstance();
        this.db = this.dbService.getDB();
        this.apiManager = APIManager.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.updateThrottle = throttle(this.insertToDb, 300);
        this.getBundleMessageThrottle = throttle(this.getMessageForBundle, 300);
    }

    public loadConnInfo() {
        APIManager.getInstance().loadConnInfo();
        this.userId = APIManager.getInstance().getConnInfo().UserID || '0';
    }

    public getCurrentUserId(): string {
        return this.userId;
    }

    /* Add pending message */
    public addPending(pending: IPendingMessage) {
        return this.db.pendingMessages.put(pending);
    }

    /* Add pending message */
    public addPendingMany(list: IPendingMessage[]) {
        return this.db.pendingMessages.bulkPut(list);
    }

    /* Get pending message by randomId */
    public getPending(id: number) {
        return this.db.pendingMessages.get(id);
    }

    /* Get pending message by randomId */
    public getPendingByIds(ids: number[]): Promise<IPendingMessage[]> {
        return this.db.pendingMessages.where('id').anyOf(ids).toArray();
    }

    /* Get pending message by messageId */
    public getPendingByMessageId(id: number) {
        return this.db.pendingMessages.where('message_id').equals(id).first();
    }

    /* Remove pending message */
    public removePending(id: number) {
        return this.db.pendingMessages.delete(id);
    }

    /* Remove pending messages by ids */
    public removePendingByIds(ids: number[]) {
        return this.db.pendingMessages.bulkDelete(ids);
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

    public removeManyByRandomId(ids: number[]) {
        return this.db.messages.where('id').between(Dexie.minKey, 0, true, true).filter((o) => {
            return ids.indexOf(o.random_id || 0) > -1;
        }).delete();
    }

    public list({peer, limit, before, after, withPending}: { peer: InputPeer, limit?: number, before?: number, after?: number, withPending?: boolean }, earlyCallback?: (list: IMessage[]) => void): Promise<IMessage[]> {
        let fnEarlyCallback = earlyCallback;
        if (withPending && earlyCallback) {
            fnEarlyCallback = this.getPeerPendingMessage(peer, earlyCallback);
        }
        const pipe = this.db.messages.where('[peerid+id]');
        let pipe2: Dexie.Collection<IMessage, number>;
        let mode = 0x0;
        if (before !== undefined) {
            mode = mode | 0x1;
        }
        if (after !== undefined) {
            mode = mode | 0x2;
        }
        const safeLimit = limit || 30;
        const safeBefore = before || 0;
        const safeAfter = after || 0;
        const peerId = peer.getId() || '';
        switch (mode) {
            // none
            default:
            case 0x0:
                pipe2 = pipe.between([peerId, Dexie.minKey], [peerId, Dexie.maxKey], true, true);
                break;
            // before
            case 0x1:
                pipe2 = pipe.between([peerId, Dexie.minKey], [peerId, safeBefore], true, false);
                break;
            // after
            case 0x2:
                pipe2 = pipe.between([peerId, safeAfter], [peerId, Dexie.maxKey], false, true);
                break;
            // between
            case 0x3:
                pipe2 = pipe.between([peerId, safeAfter], [peerId, safeBefore], false, false);
                break;
        }
        // not before
        if (mode !== 0x2) {
            pipe2 = pipe2.reverse();
        }
        // filter pending messages
        pipe2 = pipe2.filter((item: IMessage) => {
            return (item.id || 0) > 0;
        });
        return pipe2.limit(safeLimit).toArray().then((res) => {
            const earlyMessages: IMessage[] = [];
            const hasHole = res.some((item) => {
                if (fnEarlyCallback && mode === 0x1) {
                    if (item.messagetype === C_MESSAGE_TYPE.Hole) {
                        fnEarlyCallback(earlyMessages);
                        return true;
                    }
                    earlyMessages.push(item);
                }
                return (item.messagetype === C_MESSAGE_TYPE.Hole);
            });
            window.console.debug('has hole:', hasHole);
            let lastId: number = (mode === 0x2 ? safeAfter : safeBefore);
            const asc = (mode === 0x2);
            if (!hasHole) {
                if (res.length > 0) {
                    lastId = (res[res.length - 1].id || -1);
                    if (lastId !== -1) {
                        if (asc) {
                            lastId += 1;
                        } else {
                            lastId -= 1;
                        }
                    }
                }
                if (fnEarlyCallback && res.length > 0) {
                    fnEarlyCallback(res);
                    return this.completeMessagesLimitFromRemote(peer, [], lastId, asc, safeLimit - res.length);
                } else {
                    if (fnEarlyCallback) {
                        fnEarlyCallback([]);
                    }
                    return this.completeMessagesLimitFromRemote(peer, res, lastId, asc, safeLimit - res.length);
                }
            } else {
                if (fnEarlyCallback) {
                    fnEarlyCallback([]);
                }
                return this.completeMessagesLimitFromRemote(peer, [], lastId, asc, safeLimit);
            }
        });
    }

    public completeMessagesLimitFromRemote(peer: InputPeer, messages: IMessage[], id: number, asc: boolean, limit: number): Promise<IMessage[]> {
        if (id === -1) {
            return Promise.reject('bad message id');
        }
        if (limit === 0) {
            return Promise.resolve(messages);
        }

        return this.checkHoles(peer, id, asc, limit).then((remoteMessages) => {
            this.userRepo.importBulk(false, remoteMessages.usersList);
            this.groupRepo.importBulk(remoteMessages.groupsList);
            remoteMessages.messagesList = MessageRepo.parseMessageMany(remoteMessages.messagesList, this.userId);
            return this.importBulk(remoteMessages.messagesList, true).then(() => {
                return [...messages, ...remoteMessages.messagesList];
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

    public getLastMessage(peerId: string) {
        return this.db.messages.where('[peerid+id]').between([peerId, Dexie.minKey], [peerId, Dexie.maxKey], true, true)
            .filter((item: IMessage) => {
                return (item.id || 0) > 0 && item.messagetype !== C_MESSAGE_TYPE.Hole;
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
    public search(peerId: string, {keyword, labelIds, senderIds, before, after, limit}: { keyword: string, labelIds?: number[], senderIds?: string[], before?: number, after?: number, limit?: number }) {
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
        if (keyword.length > 0 || (labelIds && labelIds.length > 0) || (senderIds && senderIds.length > 0)) {
            const reg = new RegExp(keyword || '', 'i');
            pipe2 = pipe2.filter((item: IMessage) => {
                if (item.messagetype !== C_MESSAGE_TYPE.Hole && item.messagetype !== C_MESSAGE_TYPE.End && (item.id || 0) > 0) {
                    let isMatched = false;
                    if (labelIds && labelIds.length && item.labelidsList && item.labelidsList.length && difference(labelIds, item.labelidsList).length === 0) {
                        isMatched = true;
                    }
                    if (senderIds && senderIds.length && senderIds.indexOf(item.senderid || '0') > -1) {
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

    public searchAll({keyword, labelIds}: { keyword?: string, labelIds?: number[] }, {after, limit}: { after?: number, limit?: number }) {
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
                if (item.messagetype !== C_MESSAGE_TYPE.Hole && item.messagetype !== C_MESSAGE_TYPE.End && (item.id || 0) > 0) {
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

    public importBulk(msgs: IMessage[], noTransform?: boolean): Promise<any> {
        if (this.userId === '0' || this.userId === '') {
            this.loadConnInfo();
        }
        const tempMsgs = cloneDeep(msgs);
        return this.upsert(tempMsgs).catch((err) => {
            window.console.debug(err);
        });
    }

    public upsert(msgs: IMessage[], callerId?: number): Promise<any> {
        const peerIdMap: { [key: string]: number[] } = {};
        const ids = msgs.map((msg) => {
            this.trimMessage(msg);
            return msg.id || '';
        });
        return this.db.messages.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IMessage[] = differenceBy(msgs, result, 'id');
            const updateItems: IMessage[] = result.map((msg: IMessage) => {
                this.trimMessage(msg);
                const t = find(msgs, {id: msg.id});
                if (t && t.temp === true && msg.temp === false) {
                    const d = this.mergeCheck(msg, t);
                    // d.temp = false;
                    return d;
                } else if (t) {
                    return this.mergeCheck(msg, t);
                } else {
                    return msg;
                }
            });
            createItems.forEach((msg) => {
                this.trimMessage(msg);
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
                if (item.me !== true && ((item.id || 0) >= minId) && item.mention_me === true) {
                    mention += 1;
                }
                return Boolean(item.me !== true && ((item.id || 0) >= minId) && item.peerid === peerId &&
                    (item.messagetype !== C_MESSAGE_TYPE.Gap && item.messagetype !== C_MESSAGE_TYPE.Hole && item.messagetype !== C_MESSAGE_TYPE.End && item.messagetype !== C_MESSAGE_TYPE.Date && item.messagetype !== C_MESSAGE_TYPE.NewMessage));
            }).count().then((count) => {
                resolve({
                    mention,
                    message: count
                });
            }).catch(reject);
        });
    }

    public getLastIncomingMessage(peerId: string): Promise<IMessage | undefined> {
        return this.db.messages.where('[peerid+id]')
            .between([peerId, Dexie.minKey], [peerId, Dexie.maxKey], true, true).filter((item) => {
                return (item.messagetype !== C_MESSAGE_TYPE.Hole && item.messagetype !== C_MESSAGE_TYPE.End && (item.id || 0) > 0 && item.senderid !== this.userId);
            }).reverse().first();
    }

    public clearHistory(peerId: string, id: number): Promise<any> {
        return this.db.messages.where('[peerid+id]').between([peerId, Dexie.minKey], [peerId, id], true, true).delete();
    }

    public flush() {
        return;
        // Disabling debouncer
        // this.updateThrottle.cancel();
        // this.insertToDb();
    }

    public lazyUpsert(messages: IMessage[]) {
        if (this.userId === '0' || this.userId === '') {
            this.loadConnInfo();
        }
        // Start
        const msgs = cloneDeep(messages);
        return this.upsert(msgs);
    }

    public insertDiscrete(messages: IMessage[]) {
        const peerGroups = groupBy(messages, (o => o.peerid || ''));
        const edgeIds: any[] = [];
        const holeIds: { [key: number]: { lower: boolean, peerId: string } } = {};
        for (const [peerId, msgs] of Object.entries(peerGroups)) {
            msgs.sort((a, b) => (a.id || 0) - (b.id || 0)).forEach((msg, index) => {
                const id = msg.id || 0;
                if (id > 1 && (index === 0 || (index > 0 && ((msgs[index - 1].id || 0) + 1) !== msg.id))) {
                    edgeIds.push([peerId, id - 1]);
                    holeIds[id - 1] = {lower: true, peerId};
                }
                if ((msgs.length - 1 === index) || (msgs.length - 1 > index && ((msgs[index + 1].id || 0) - 1) !== msg.id)) {
                    edgeIds.push([peerId, id + 1]);
                    holeIds[id + 1] = {lower: false, peerId};
                }
            });
        }
        return this.db.messages.where('[peerid+id]').anyOf(edgeIds).toArray().then((msgs) => {
            const holes: IMessage[] = [];
            msgs.forEach((msg) => {
                const id = msg.id || 0;
                if (holeIds.hasOwnProperty(id)) {
                    delete holeIds[id];
                }
            });
            for (const [id, data] of Object.entries(holeIds)) {
                holes.push(this.getHoleMessage(data.peerId, parseInt(id, 10), data.lower));
            }
            return this.db.messages.bulkPut([...messages, ...holes]);
        });
    }

    // Get all temp messages
    // For migration purposes
    public getAllTemps() {
        return this.db.messages.filter((item) => {
            return (item.temp === true);
        }).toArray();
    }

    public insertHole(peerId: string, id: number, asc: boolean) {
        return this.db.messages.put({
            id: id + (asc ? 0.5 : -0.5),
            messagetype: C_MESSAGE_TYPE.Hole,
            peerid: peerId,
        });
    }

    public getHoleMessage(peerId: string, id: number, asc: boolean): IMessage {
        return {
            id: id + (asc ? 0.5 : -0.5),
            messagetype: C_MESSAGE_TYPE.Hole,
            peerid: peerId,
        };
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
            this.apiManager.getManyMessage(peer, ids).then((res) => {
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
                this.insertDiscrete(messages);
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

    private checkHoles(peer: InputPeer, id: number, asc: boolean, limit: number) {
        let query: any = {};
        limit += 1;
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
        return this.apiManager.getMessageHistory(peer, query).then((remoteRes) => {
            return this.modifyHoles(peer.getId() || '', remoteRes.messagesList, asc, limit - 1).then(() => {
                return remoteRes;
            });
        });
    }

    private modifyHoles(peerId: string, res: UserMessage.AsObject[], asc: boolean, limit: number) {
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
        let edgeMessage: IMessage | undefined;
        if (res.length === limit + 1) {
            edgeMessage = res.pop();
        }
        return this.db.messages.where('[peerid+id]').between([peerId, min - 1], [peerId, max + 1], true, true).filter((item) => {
            return (item.messagetype === C_MESSAGE_TYPE.Hole);
        }).delete().then((dres) => {
            if (edgeMessage) {
                const messages: IMessage[] = [];
                return this.db.messages.where('[peerid+id]').equals([peerId, edgeMessage.id || 0]).first().then((edgeRes) => {
                    if (!edgeRes && edgeMessage) {
                        messages.push(this.getHoleMessage(peerId, edgeMessage.id || 0, !asc));
                        // window.console.log('insert hole at', edgeMessage.id);
                    }
                    messages.push(...MessageRepo.parseMessageMany(res, this.userId));
                    return this.upsert(messages);
                });
            } else {
                return this.upsert(res);
            }
        });
    }

    private broadcastEvent(name: string, data: any) {
        const event = new CustomEvent(name, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(event);
    }

    private trimMessage(msg: IMessage) {
        if (msg) {
            delete msg.avatar;
        }
    }
}
