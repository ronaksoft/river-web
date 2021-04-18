/*
    Creation Time: 2018 - Aug - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import MessageDB from '../../services/db/message';
import {
    IMessage,
    IMessageWithMedia,
    IMessageWithMediaMany,
    IPendingMessage,
    IReactionInfo
} from './interface';
import {cloneDeep, differenceBy, find, throttle, uniq, difference, groupBy} from 'lodash';
import APIManager, {currentUserId} from '../../services/sdk';
import UserRepo from '../user';
import RTLDetector from '../../services/utilities/rtl_detector';
import {
    InputPeer, MediaCategory,
    MediaType,
    MessageEntityType, ReactionCounter,
    UserMessage
} from '../../services/sdk/messages/core.types_pb';
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
    MediaGeoLocation, MediaWebDocument,
} from '../../services/sdk/messages/chat.messages.medias_pb';
import {
    MessageActionCallEnded,
    MessageActionCallStarted,
    MessageActionClearHistory,
    MessageActionContactRegistered,
    MessageActionGroupAddUser,
    MessageActionGroupCreated,
    MessageActionGroupDeleteUser,
    MessageActionGroupPhotoChanged,
    MessageActionGroupTitleChanged,
    MessageActionScreenShotTaken,
} from '../../services/sdk/messages/chat.messages.actions_pb';
import MediaRepo from '../media';
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
import DialogRepo from "../dialog";
import {IMedia} from "../media/interface";

interface IClearHistory {
    teamId: string;
    peerId: string;
    peerType: number;
    id: number;
}

interface IMessageAction {
    callerId?: number;
    msgs: IMessage[];
    clear?: IClearHistory;
    reject: any;
    resolve: any;
}

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
    teamId: string;
}

export const getMediaDocument = (msg: IMessage) => {
    let mediaDocument: MediaDocument.AsObject | undefined;
    if (msg.mediatype === MediaType.MEDIATYPEDOCUMENT) {
        mediaDocument = msg.mediadata;
    }
    return mediaDocument;
};

export const modifyReactions = (reactions: ReactionCounter.AsObject[]): ReactionCounter.AsObject[] => {
    return reactions.filter(o => o.reaction && o.reaction.length > 0 && o.total).sort((a, b) => {
        return (b.total || 0) - (a.total || 0);
    });
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
                // @ts-ignore
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
            // @ts-ignore
            delete attr.data;
        });
        return attrOut;
    }

    public static parseMessage(msg: Partial<UserMessage.AsObject>, userId: string): IMessageWithMedia {
        const out: IMessage = msg;
        if (msg.entitiesList && msg.entitiesList.length > 0) {
            out.mention_me = msg.entitiesList.some((entity) => {
                return (entity.type === MessageEntityType.MESSAGEENTITYTYPEMENTION && entity.userid === userId) ||
                    (entity.type === MessageEntityType.MESSAGEENTITYTYPEMENTIONALL && msg.senderid !== userId);
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
                    if (!out.mention_me && mediaDocument.entitiesList && mediaDocument.entitiesList.length > 0) {
                        out.mention_me = mediaDocument.entitiesList.some((entity) => {
                            return (entity.type === MessageEntityType.MESSAGEENTITYTYPEMENTION && entity.userid === userId) ||
                                (entity.type === MessageEntityType.MESSAGEENTITYTYPEMENTIONALL && msg.senderid !== userId);
                        });
                    }
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
                case MediaType.MEDIATYPEWEBDOCUMENT:
                    out.mediadata = MediaWebDocument.deserializeBinary(mediaData).toObject();
                    if (out.mediadata && out.mediadata.attributesList) {
                        out.attributes = this.parseAttributes(out.mediadata.attributesList, {type: C_MESSAGE_TYPE.Normal});
                    }
                    out.messagetype = C_MESSAGE_TYPE.WebDocument;
                    break;
            }
            delete out.media;
            delete msg.media;
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
                case C_MESSAGE_ACTION.MessageActionScreenShot:
                    out.actiondata = MessageActionScreenShotTaken.deserializeBinary(actionData).toObject();
                    break;
                case C_MESSAGE_ACTION.MessageActionCallStarted:
                    out.actiondata = MessageActionCallStarted.deserializeBinary(actionData).toObject();
                    break;
                case C_MESSAGE_ACTION.MessageActionCallEnded:
                    out.actiondata = MessageActionCallEnded.deserializeBinary(actionData).toObject();
                    break;
            }
            out.messagetype = C_MESSAGE_TYPE.System;
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
        let mediaType: MediaCategory = 0;
        switch (out.messagetype) {
            case C_MESSAGE_TYPE.Picture:
                mediaType = MediaCategory.MEDIACATEGORYMEDIA;
                break;
            case C_MESSAGE_TYPE.Video:
                mediaType = MediaCategory.MEDIACATEGORYMEDIA;
                break;
            case C_MESSAGE_TYPE.File:
                mediaType = MediaCategory.MEDIACATEGORYFILE;
                break;
            case C_MESSAGE_TYPE.Audio:
                mediaType = MediaCategory.MEDIACATEGORYAUDIO;
                break;
            case C_MESSAGE_TYPE.Voice:
                mediaType = MediaCategory.MEDIACATEGORYVOICE;
                break;
            case C_MESSAGE_TYPE.Location:
                mediaType = MediaCategory.MEDIACATEGORYLOCATION;
                break;
            case C_MESSAGE_TYPE.Gif:
                mediaType = MediaCategory.MEDIACATEGORYGIF;
                break;
            case C_MESSAGE_TYPE.Contact:
                mediaType = MediaCategory.MEDIACATEGORYCONTACT;
                break;
            case C_MESSAGE_TYPE.WebDocument:
                mediaType = MediaCategory.MEDIACATEGORYWEB;
                break;
        }
        // if (msgType && out.id && (out.id || 0) > 0) {
        //     MediaRepo.getInstance().importBulk([{
        //         id: out.id,
        //         peerid: out.peerid || '',
        //         peertype: out.peertype || 0,
        //         teamid: out.teamid || '0',
        //         type: msgType,
        //     }]);
        // }
        if (out.body && out.body.length > 0) {
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
        if (out.reactionsList) {
            out.reactionsList = modifyReactions(out.reactionsList || []);
            out.reaction_updated = true;
        }
        const d: IMessageWithMedia = {
            message: out,
        };
        if (mediaType) {
            d.media = {
                hole: false,
                id: out.id,
                peerid: out.peerid,
                peertype: out.peertype,
                teamid: out.teamid,
                timestamp: out.createdon,
                type: mediaType,
            };
        }
        return d;
    }

    public static parseMessageMany(msg: Partial<UserMessage.AsObject>[], userId: string): IMessageWithMediaMany {
        const messages: IMessage[] = [];
        const medias: IMedia[] = [];
        msg.forEach((m) => {
            const d = this.parseMessage(m, userId);
            messages.push(d.message);
            if (d.media && d.media.type) {
                medias.push(d.media);
            }
        });
        return {
            medias,
            messages,
        };
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
    private mediaRepo: MediaRepo;
    private messageBundle: { [key: string]: IMessageBundle } = {};
    private readonly getBundleMessageThrottle: any = null;
    private actionList: IMessageAction[] = [];
    private actionBusy: boolean = false;

    private constructor() {
        APIManager.getInstance().loadConnInfo();
        this.dbService = MessageDB.getInstance();
        this.db = this.dbService.getDB();
        this.apiManager = APIManager.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.mediaRepo = MediaRepo.getInstance();
        this.getBundleMessageThrottle = throttle(this.getMessageForBundle, 300);
    }

    public loadConnInfo() {
        APIManager.getInstance().loadConnInfo();
    }

    public getCurrentUserId(): string {
        return currentUserId;
    }

    public getValidPendingMessages() {
        return this.db.pendingMessages.toArray().then((res) => {
            const msgIds = res.map((item) => item.message_id || 0);
            return this.getIn(msgIds, true);
        });
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

    public getReactionList(inputPeer: InputPeer, id: number): Promise<IReactionInfo[]> {
        return this.get(id, inputPeer).then((message) => {
            if (!message) {
                throw Error('not found');
            }
            if (message.reaction_updated) {
                return this.apiManager.reactionList(inputPeer, id, 0).then((res) => {
                    const list = (res.listList || []).map((item: IReactionInfo) => {
                        const t = find(message.reactionsList || [], {reaction: item.reaction});
                        if (t) {
                            item.counter = t.total;
                        }
                        return item;
                    });
                    this.userRepo.importBulk(false, res.usersList || []);
                    this.importBulk([{
                        id,
                        reaction_list: list,
                        reaction_updated: false,
                    }]);
                    return list;
                });
            } else {
                return message.reaction_list || [];
            }
        });
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
        MediaRepo.getInstance().removeMany(ids).catch(() => {
            //
        });
        return this.db.messages.bulkDelete(ids).then((res) => {
            this.broadcastEvent('Message_DB_Removed', {callerId, ids});
            return res;
        });
    }

    public removeManyByRandomId(ids: number[]) {
        return this.db.messages.where('id').between(Dexie.minKey, 0, true, true).filter((o) => {
            return ids.indexOf(o.random_id || 0) > -1;
        }).toArray((res) => {
            return this.db.messages.bulkDelete(res.map(o => o.id || 0));
        });
    }

    public list(teamId: string, {peer, limit, before, after, withPending, localOnly}: { peer: InputPeer, limit?: number, before?: number, after?: number, withPending?: boolean, localOnly?: boolean }, earlyCallback?: (list: IMessage[]) => void): Promise<IMessage[]> {
        let fnEarlyCallback = earlyCallback;
        if (withPending && earlyCallback) {
            fnEarlyCallback = this.getPeerPendingMessage(teamId, peer, earlyCallback);
        }
        const pipe = this.db.messages.where('[teamid+peerid+peertype+id]');
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
        const peerType = peer.getType() || 0;
        switch (mode) {
            // none
            default:
            case 0x0:
                pipe2 = pipe.between([teamId, peerId, peerType, Dexie.minKey], [teamId, peerId, peerType, Dexie.maxKey], true, true);
                break;
            // before
            case 0x1:
                pipe2 = pipe.between([teamId, peerId, peerType, Dexie.minKey], [teamId, peerId, peerType, safeBefore], true, false);
                break;
            // after
            case 0x2:
                pipe2 = pipe.between([teamId, peerId, peerType, safeAfter], [teamId, peerId, peerType, Dexie.maxKey], false, true);
                break;
            // between
            case 0x3:
                pipe2 = pipe.between([teamId, peerId, peerType, safeAfter], [teamId, peerId, peerType, safeBefore], false, false);
                break;
        }
        // not before
        if (mode !== 0x2) {
            pipe2 = pipe2.reverse();
        }
        // filter pending messages
        pipe2 = pipe2.filter((item: IMessage) => {
            return (item.id || 0) > 0 && item.messagetype !== C_MESSAGE_TYPE.Date && item.messagetype !== C_MESSAGE_TYPE.NewMessage;
        });
        return pipe2.limit(safeLimit).toArray().then((list) => {
            const earlyMessages: IMessage[] = [];
            let earlyFnCalled = false;
            const hasHole = list.some((item) => {
                if (fnEarlyCallback && mode === 0x1) {
                    if (item.messagetype === C_MESSAGE_TYPE.Hole) {
                        fnEarlyCallback(earlyMessages);
                        earlyFnCalled = true;
                        return true;
                    }
                    earlyMessages.push(item);
                }
                return (item.messagetype === C_MESSAGE_TYPE.Hole);
            });
            window.console.debug('message: has hole:', hasHole);
            const asc = (mode === 0x2);
            let lastId: number = (asc ? safeAfter : safeBefore);
            if (localOnly && hasHole) {
                localOnly = false;
            }
            if (!hasHole) {
                if (list.length > 0) {
                    lastId = (list[list.length - 1].id || -1);
                    if (lastId !== -1) {
                        if (asc) {
                            lastId += 1;
                        } else {
                            lastId -= 1;
                        }
                    }
                }
                if (fnEarlyCallback && list.length > 0) {
                    fnEarlyCallback(list);
                    return this.completeMessagesLimitFromRemote(teamId, peer, [], lastId, asc, safeLimit - list.length, localOnly);
                } else {
                    if (fnEarlyCallback) {
                        fnEarlyCallback([]);
                    }
                    return this.completeMessagesLimitFromRemote(teamId, peer, list, lastId, asc, safeLimit - list.length, localOnly);
                }
            } else {
                if (!earlyFnCalled && fnEarlyCallback) {
                    fnEarlyCallback([]);
                }
                return this.completeMessagesLimitFromRemote(teamId, peer, [], lastId, asc, safeLimit, localOnly).then((res) => {
                    if (earlyFnCalled && earlyMessages.length > 0) {
                        const ids = earlyMessages.map(o => o.id);
                        return res.filter(o => ids.indexOf(o.id) === -1);
                    } else {
                        return res;
                    }
                });
            }
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

    public getLastMessage(teamId: string, peerId: string, peerType: number, mode?: 'in' | 'out') {
        return this.db.messages.where('[teamid+peerid+peertype+id]').between([teamId, peerId, peerType, Dexie.minKey], [teamId, peerId, peerType, Dexie.maxKey], true, true)
            .filter((item: IMessage) => {
                if (mode) {
                    const ok = mode === 'in' ? Boolean(item.senderid !== currentUserId) : Boolean(item.senderid === currentUserId);
                    return ok && (item.id || 0) > 0 && item.messagetype !== C_MESSAGE_TYPE.Hole;
                } else {
                    return (item.id || 0) > 0 && item.messagetype !== C_MESSAGE_TYPE.Hole;
                }
            }).last();
    }

    public get(id: number, peer?: InputPeer | null, teamId?: string): Promise<IMessage | null> {
        return new Promise((resolve, reject) => {
            const fn = () => {
                if (peer && teamId) {
                    this.getBundleMessage(teamId, peer, id).then((remoteRes) => {
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

    public getBundleMessage(teamId: string, peer: InputPeer, id: number): Promise<IMessage> {
        let internalResolve = null;
        let internalReject = null;

        const promise = new Promise<IMessage>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        const peerId = peer.getId() || '';
        const mapId = `${teamId}_${peerId}`;

        if (!this.messageBundle.hasOwnProperty(mapId)) {
            this.messageBundle[mapId] = {
                peer,
                reqs: {},
                teamId,
            };
        }

        const idStr = String(id);

        if (!this.messageBundle[mapId].reqs.hasOwnProperty(idStr)) {
            this.messageBundle[mapId].reqs[idStr] = {
                id,
                promises: [],
            };
        }

        this.messageBundle[mapId].reqs[idStr].promises.push({
            reject: internalReject,
            resolve: internalResolve,
        });

        setTimeout(() => {
            this.getBundleMessageThrottle();
        }, 100);

        return promise;
    }

    // Search message bodies
    public search(teamId: string, peerId: string, peerType: number, {keyword, labelIds, senderIds, before, after, limit}: { keyword: string, labelIds?: number[], senderIds?: string[], before?: number, after?: number, limit?: number }) {
        let mode = 0x0;
        if (before !== null && before !== undefined) {
            mode = mode | 0x1;
        }
        if (after !== null && after !== undefined) {
            mode = mode | 0x2;
        }
        const pipe = this.db.messages.where('[teamid+peerid+peertype+id]');
        let pipe2: Dexie.Collection<IMessage, number>;
        switch (mode) {
            // none
            default:
            case 0x0:
                pipe2 = pipe.between([teamId, peerId, peerType, Dexie.minKey], [teamId, peerId, peerType, Dexie.maxKey], true, true);
                break;
            // before
            case 0x1:
                pipe2 = pipe.between([teamId, peerId, peerType, Dexie.minKey], [teamId, peerId, peerType, before || 0], true, true);
                break;
            // after
            case 0x2:
                pipe2 = pipe.between([teamId, peerId, peerType, after || 0], [teamId, peerId, peerType, Dexie.maxKey], true, true);
                break;
            // between
            case 0x3:
                pipe2 = pipe.between([teamId, peerId, peerType, (after || 0) + 1], [teamId, peerId, peerType, (before || 0) - 1], true, true);
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
                    const hasFilter = labelIds.length > 0 || senderIds.length > 0;
                    if (labelIds && labelIds.length && item.labelidsList && item.labelidsList.length && difference(labelIds, item.labelidsList).length === 0) {
                        isMatched = true;
                    }
                    if (senderIds && senderIds.length && senderIds.indexOf(item.senderid || '0') > -1) {
                        isMatched = true;
                    }
                    if (((hasFilter && isMatched) || !hasFilter) && keyword.length > 0) {
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

    public importBulk(msgs: IMessage[], callerId?: number): Promise<any> {
        if (!msgs || msgs.length === 0) {
            return Promise.resolve();
        }

        if (currentUserId === '0' || currentUserId === '') {
            this.loadConnInfo();
        }

        const uniqMsgs = cloneDeep(msgs);

        if (this.actionList.length === 0 && !this.actionBusy) {
            this.actionBusy = true;
            return this.upsert(uniqMsgs, callerId).finally(() => {
                this.actionBusy = false;
                this.applyActions();
            });
        }

        let internalResolve = null;
        let internalReject = null;

        const promise = new Promise<any>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        this.actionList.push({
            callerId,
            msgs: uniqMsgs,
            reject: internalReject,
            resolve: internalResolve,
        });

        this.applyActions();
        return promise;
    }

    public remove(id: number, callerId?: number): Promise<any> {
        return this.db.messages.delete(id).then((res) => {
            this.broadcastEvent('Message_DB_Removed', {callerId, ids: [id]});
            return res;
        });
    }

    public getUnreadCount(teamId: string, peerId: string, peerType: number, minId: number, topMessageId: number): Promise<{ message: number, mention: number }> {
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
            this.db.messages.where('[teamid+peerid+peertype+id]')
                .between([teamId, peerId, peerType, minId + 1], [teamId, peerId, peerType, topMessageId], true, true).filter((item) => {
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

    public getUnreadCounterByTeam(teamId: string, recompute?: boolean): Promise<number> {
        return DialogRepo.getInstance().getManyCache(teamId, {}).then((dialogs) => {
            if (recompute) {
                const promises: any[] = [];
                dialogs.forEach((dialog) => {
                    promises.push(this.getUnreadCount(dialog.teamid || '0', dialog.peerid || '0', dialog.peertype || 0, dialog.readinboxmaxid || 0, dialog.topmessageid || 0).then((res) => {
                        return res.message;
                    }));
                });
                return Promise.all(promises).then((res) => {
                    let count: number = 0;
                    res.forEach((cnt) => {
                        count += cnt;
                    });
                    return count;
                });
            } else {
                let count: number = 0;
                dialogs.forEach((d) => {
                    if (d && d.unreadcount && d.unreadcount > 0 && d.readinboxmaxid !== d.topmessageid && !d.preview_me) {
                        count += d.unreadcount;
                    }
                });
                return count;
            }
        });
    }

    public clearHistory(teamId: string, peerId: string, peerType: number, id: number): Promise<any> {
        if (this.actionList.length === 0 && !this.actionBusy) {
            this.actionBusy = true;
            return this.executeClearHistory(teamId, peerId, peerType, id).finally(() => {
                this.actionBusy = false;
                this.applyActions();
            });
        }

        let internalResolve = null;
        let internalReject = null;

        const promise = new Promise<any>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        this.actionList.push({
            clear: {id, peerId, peerType, teamId},
            msgs: [],
            reject: internalReject,
            resolve: internalResolve,
        });

        this.applyActions();
        return promise;
    }

    public insertDiscrete(teamId: string, messages: IMessage[]) {
        if (messages.length === 0) {
            return Promise.resolve();
        }
        const ids = messages.map(o => o.id);
        return this.db.messages.where('id').anyOf(ids).toArray().then((res) => {
            if (res.length === 0) {
                return this.insertTrimmedDiscrete(teamId, messages) as any;
            }
            const listIds = res.map(o => o.id);
            const list = messages.filter((o) => listIds.indexOf(o.id) === -1);
            if (list.length > 0) {
                return this.insertTrimmedDiscrete(teamId, list) as any;
            } else {
                return Promise.resolve();
            }
        });
    }

    public insertHole(teamId: string, peerId: string, peerType: number, id: number, after: boolean) {
        return this.db.messages.put(this.getHoleMessage(teamId, peerId, peerType, id, after));
    }

    public insertMayHole(data: Array<{ teamId: string, peerId: string, peerType: number, id: number }>, after: boolean) {
        return this.db.messages.bulkPut(data.map(o => this.getHoleMessage(o.teamId, o.peerId, o.peerType, o.id, after)));
    }

    public insertEnd(teamId: string, peerId: string, peerType: number, id: number) {
        return this.db.messages.put({
            id: id - 0.5,
            messagetype: C_MESSAGE_TYPE.End,
            peerid: peerId,
            peertype: peerType,
            teamid: teamId,
        });
    }

    private applyActions() {
        if (!this.actionBusy && this.actionList.length > 0) {
            const action = this.actionList.shift();
            if (action) {
                this.actionBusy = true;
                let fn: any;
                if (action.clear) {
                    fn = this.executeClearHistory(action.clear.teamId, action.clear.peerId, action.clear.peerType, action.clear.id);
                } else {
                    fn = this.upsert(action.msgs, action.callerId);
                }
                fn.then((res: any) => {
                    action.resolve(res);
                }).catch((err: any) => {
                    action.reject(err);
                }).finally(() => {
                    this.actionBusy = false;
                    this.applyActions();
                });
            }
        }
    }

    private upsert(msgs: IMessage[], callerId?: number): Promise<any> {
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
                if (t) {
                    return this.mergeCheck(msg, t);
                } else {
                    return msg;
                }
            });
            const trimmedCreateItems: IMessage[] = [];
            createItems.forEach((msg) => {
                this.trimMessage(msg);
                if (!msg.teamid) {
                    msg.teamid = '0';
                }
                // remove corrupted data
                if (msg.id && msg.teamid && msg.peerid && msg.peertype !== undefined) {
                    if (msg.peerid) {
                        if (!peerIdMap.hasOwnProperty(msg.peerid)) {
                            peerIdMap[msg.peerid] = [];
                        }
                        peerIdMap[msg.peerid].push(msg.id || 0);
                    }
                    trimmedCreateItems.push(msg);
                }
            });
            return this.createMany([...trimmedCreateItems, ...updateItems]).then((res) => {
                this.broadcastEvent('Message_DB_Added', {callerId, newMsg: peerIdMap});
                return res;
            });
        });
    }

    private completeMessagesLimitFromRemote(teamId: string, peer: InputPeer, messages: IMessage[], id: number, asc: boolean, limit: number, localOnly?: boolean): Promise<IMessage[]> {
        if (id === -1) {
            return Promise.reject('bad message id');
        }
        if (limit === 0) {
            return Promise.resolve(messages);
        }
        if (localOnly) {
            return Promise.resolve(messages);
        }

        return this.checkHoles(teamId, peer, id, asc, limit).then((remoteMessages) => {
            this.userRepo.importBulk(false, remoteMessages.usersList);
            this.groupRepo.importBulk(remoteMessages.groupsList);
            const messageWithMediaMany = MessageRepo.parseMessageMany(remoteMessages.messagesList, currentUserId);
            remoteMessages.messagesList = messageWithMediaMany.messages as Array<UserMessage.AsObject>;
            if (messageWithMediaMany.medias.length > 0) {
                this.mediaRepo.importBulk(messageWithMediaMany.medias, true);
            }
            return this.importBulk(remoteMessages.messagesList).then(() => {
                if (asc) {
                    return [...messages, ...remoteMessages.messagesList];
                } else {
                    return [...messages, ...remoteMessages.messagesList.slice(1)];
                }
            });
        });
    }

    private getPeerPendingMessage(teamId: string, peer: InputPeer, fnCallback: (resMsgs: IMessage[]) => void) {
        const peerId = peer.getId() || '';
        const peerType = peer.getType() || 0;
        const fn = (msg: IMessage[]) => {
            this.db.messages.where('[teamid+peerid+peertype+id]').between([teamId, peerId, peerType, Dexie.minKey], [teamId, peerId, peerType, -1], true, true).toArray().then((items) => {
                fnCallback(items.concat(msg));
            }).catch(() => {
                fnCallback(msg);
            });
        };
        return fn;
    }

    private mergeCheck(message: IMessage, newMessage: IMessage): IMessage {
        if (message.contentread) {
            newMessage.contentread = true;
        }
        if (newMessage.entitiesList) {
            message.entitiesList = newMessage.entitiesList;
        }
        if (newMessage.reactionsList) {
            message.reactionsList = newMessage.reactionsList;
        }
        if (newMessage.yourreactionsList) {
            message.yourreactionsList = newMessage.yourreactionsList;
        }
        if (message.teamid && message.teamid !== '0') {
            newMessage.teamid = message.teamid;
        }
        if (message.peerid && message.peerid !== '0') {
            newMessage.peerid = message.peerid;
        }
        if (message.peertype) {
            newMessage.peertype = message.peertype;
        }
        // process added labels
        if (newMessage.added_labels) {
            message.labelidsList = uniq([...(message.labelidsList || []), ...newMessage.added_labels]);
            delete newMessage.added_labels;
            delete newMessage.labelidsList;
        }
        // process removed labels
        if (newMessage.removed_labels) {
            message.labelidsList = difference(message.labelidsList || [], newMessage.removed_labels);
            delete newMessage.removed_labels;
            delete newMessage.labelidsList;
        }
        const d = kMerge(message, newMessage);
        return d;
    }

    private getMessageForBundle = () => {
        Object.keys(this.messageBundle).forEach((mapId) => {
            const data = this.messageBundle[mapId];
            const peer = data.peer;
            const ids: number[] = [];
            Object.keys(data.reqs).forEach((idStr) => {
                ids.push(data.reqs[idStr].id);
            });
            if (ids.length === 0) {
                delete this.messageBundle[mapId];
                return;
            }
            delete this.messageBundle[mapId];
            this.apiManager.getManyMessage(peer, ids).then((res) => {
                const messages: IMessage[] = [];
                const dataIds = Object.keys(data.reqs);
                res.messagesList.forEach((msg) => {
                    const idStr = String(msg.id || 0);
                    const messageWithMedia = MessageRepo.parseMessage(msg, currentUserId);
                    if (messageWithMedia.media) {
                        this.mediaRepo.importBulk([messageWithMedia.media], false);
                    }
                    messages.push(messageWithMedia.message);
                    if (data.reqs[idStr]) {
                        data.reqs[idStr].promises.forEach((promise) => {
                            promise.resolve(messageWithMedia.message);
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
                this.insertDiscrete(data.teamId, messages);
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

    private getHoleMessage(teamId: string, peerId: string, peerType: number, id: number, after: boolean): IMessage {
        return {
            id: id + (after ? 0.5 : -0.5),
            messagetype: C_MESSAGE_TYPE.Hole,
            peerid: peerId,
            peertype: peerType,
            teamid: teamId,
        };
    }

    private checkHoles(teamId: string, peer: InputPeer, id: number, asc: boolean, limit: number) {
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
            return this.modifyHoles(teamId, peer.getId() || '', peer.getType() || 0, remoteRes.messagesList, asc, limit - 1).then(() => {
                return remoteRes;
            });
        });
    }

    private modifyHoles(teamId: string, peerId: string, peerType: number, res: UserMessage.AsObject[], asc: boolean, limit: number) {
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
        return this.db.messages.where('[teamid+peerid+peertype+id]').between([teamId, peerId, peerType, min - 1], [teamId, peerId, peerType, max + 1], true, true).filter((item) => {
            return (item.messagetype === C_MESSAGE_TYPE.Hole);
        }).delete().then((dres) => {
            const messageWithMediaMany = MessageRepo.parseMessageMany(res, currentUserId);
            if (messageWithMediaMany.medias.length > 0) {
                this.mediaRepo.importBulk(messageWithMediaMany.medias, true);
            }
            if (edgeMessage) {
                const messages: IMessage[] = [];
                return this.db.messages.where('id').equals(edgeMessage.id || 0).first().then((edgeRes) => {
                    if (!edgeRes && edgeMessage) {
                        messages.push(this.getHoleMessage(teamId, peerId, peerType, edgeMessage.id || 0, !asc));
                        // window.console.log('insert hole at', edgeMessage.id);
                    }
                    messages.push(...messageWithMediaMany.messages);
                    return this.upsert(messages);
                });
            } else {
                return this.upsert(messageWithMediaMany.messages);
            }
        });
    }

    private executeClearHistory(teamId: string, peerId: string, peerType: number, id: number) {
        return this.db.messages.where('[teamid+peerid+peertype+id]').between([teamId, peerId, peerType, Dexie.minKey], [teamId, peerId, peerType, id], true, true).toArray((res) => {
            const ids = res.map(o => o.id || 0);
            return this.db.messages.bulkDelete(ids);
        });
    }

    private insertTrimmedDiscrete(teamId: string, messages: IMessage[]) {
        const peerGroups = groupBy(messages, (o => `${o.peerid || ''}_${o.peertype || 0}`));
        const edgeIds: any[] = [];
        const holeIds: { [key: number]: { lower: boolean, peerId: string, peerType: number } } = {};
        for (const [peerId, msgs] of Object.entries(peerGroups)) {
            msgs.sort((a, b) => (a.id || 0) - (b.id || 0)).forEach((msg, index) => {
                const id = msg.id || 0;
                const d = peerId.split('_');
                const peerid: string = d[0];
                const peertype: number = parseInt(d[1], 10);
                if (id > 1 && (index === 0 || (index > 0 && ((msgs[index - 1].id || 0) + 1) !== msg.id))) {
                    edgeIds.push([teamId, peerid, peertype, id - 1]);
                    holeIds[id - 1] = {lower: true, peerId: peerid, peerType: peertype};
                }
                if ((msgs.length - 1 === index) || (msgs.length - 1 > index && ((msgs[index + 1].id || 0) - 1) !== msg.id)) {
                    edgeIds.push([teamId, peerid, peertype, id + 1]);
                    holeIds[id + 1] = {lower: false, peerId: peerid, peerType: peertype};
                }
            });
        }
        return this.db.messages.where('[teamid+peerid+peertype+id]').anyOf(edgeIds).toArray().then((msgs) => {
            const holes: IMessage[] = [];
            msgs.forEach((msg) => {
                const id = msg.id || 0;
                if (holeIds.hasOwnProperty(id)) {
                    delete holeIds[id];
                }
            });
            for (const [id, data] of Object.entries(holeIds)) {
                holes.push(this.getHoleMessage(teamId, data.peerId, data.peerType, parseInt(id, 10), data.lower));
            }
            return this.db.messages.bulkPut([...messages, ...holes]);
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
