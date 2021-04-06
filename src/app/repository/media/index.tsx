/*
    Creation Time: 2019 - Feb - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import DB from '../../services/db/media';
import Dexie from 'dexie';
import {IMedia} from './interface';
import {differenceBy, find, groupBy, uniqBy} from 'lodash';
import {DexieMediaDB} from '../../services/db/dexie/media';
import MessageRepo from '../message';
import {kMerge} from "../../services/utilities/kDash";
import {IMessage} from "../message/interface";
import {EventMediaDBUpdated} from "../../services/events";
import {InputPeer, MediaCategory, UserMessage} from "../../services/sdk/messages/core.types_pb";
import APIManager, {currentUserId} from "../../services/sdk";
import UserRepo from "../user";
import GroupRepo from "../group";
import {C_INFINITY} from "../index";

export interface IMediaWithCount {
    count: number;
    maxId: number;
    messages: IMessage[];
    minId: number;
}

export default class MediaRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new MediaRepo();
        }

        return this.instance;
    }

    private static instance: MediaRepo;

    private dbService: DB;
    private db: DexieMediaDB;
    private messageRepo: MessageRepo | undefined;
    private userRepo: UserRepo | undefined;
    private groupRepo: GroupRepo | undefined;
    private apiManager: APIManager;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.apiManager = APIManager.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        setTimeout(() => {
            this.messageRepo = MessageRepo.getInstance();
        }, 100);
    }

    public create(media: IMedia) {
        return this.db.medias.put(media);
    }

    public createMany(media: IMedia[]) {
        return this.db.medias.bulkPut(media);
    }

    public removeMany(ids: number[]) {
        return this.db.medias.bulkDelete(ids);
    }

    public get(id: number): Promise<IMedia | undefined> {
        return this.db.medias.get(id).then((g: IMedia | undefined) => {
            return g;
        });
    }

    public list(teamId: string, peer: InputPeer, type: MediaCategory, options: { limit?: number, before?: number, after?: number, localOnly?: boolean }, earlyCallback?: (list: IMediaWithCount) => void): Promise<IMediaWithCount> {
        const mode = this.getMode(options.before, options.after);
        const getMessage = (list: IMedia[]) => {
            if (list.length === 0) {
                return Promise.resolve({
                    count: 0,
                    maxId: 0,
                    messages: [],
                    minId: 0,
                });
            } else {
                const ids = list.map((media) => {
                    return media.id;
                });
                if (this.messageRepo) {
                    return this.messageRepo.getIn(ids, (mode === 0x2)).then((result) => {
                        return {
                            count: ids.length,
                            maxId: result.length > 0 ? (result[0].id || 0) : 0,
                            messages: result,
                            minId: result.length > 0 ? (result[result.length - 1].id || 0) : 0,
                        };
                    });
                } else {
                    return Promise.reject('no ready');
                }
            }
        };
        let fnEarlyCallback: any = undefined;
        if (earlyCallback) {
            fnEarlyCallback = (list: IMedia[]) => {
                getMessage(list).then((res) => {
                    earlyCallback(res);
                });
            };
        }
        return this.getMany(teamId, peer, type, options, fnEarlyCallback).then((list) => {
            return getMessage(list);
        });
    }

    public importBulk(medias: IMedia[], continues: boolean): Promise<any> {
        if (medias.length === 0) {
            return Promise.resolve();
        }
        const tempGroup = uniqBy(medias, 'id');
        return this.insertDiscrete(tempGroup[0].teamid, tempGroup, continues);
    }

    public upsert(medias: IMedia[], callerId?: number): Promise<any> {
        const peerIdMap: object = {};
        const newIds: number[] = [];
        const ids = medias.map((media) => {
            return media.id;
        });
        return this.db.medias.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IMedia[] = differenceBy(medias, result, 'id');
            const updateItems: IMedia[] = result.map((media: IMedia) => {
                const t = find(medias, {id: media.id});
                if (t) {
                    return this.mergeCheck(media, t);
                } else {
                    return media;
                }
            });
            const list = [...createItems, ...updateItems];
            createItems.forEach((msg) => {
                if (msg.peerid && !peerIdMap.hasOwnProperty(msg.peerid)) {
                    peerIdMap[msg.peerid] = true;
                }
                newIds.push(msg.id || 0);
            });
            return this.createMany(list);
        }).then((res) => {
            this.broadcastEvent(EventMediaDBUpdated, {callerId, ids: newIds, peerids: Object.keys(peerIdMap)});
            return res;
        });
    }

    public insertDiscrete(teamId: string, items: IMedia[], ignoreItemsGap: boolean) {
        const peerGroups = groupBy(items, (o => `${o.peerid || ''}_${o.peertype || 0}_${o.type}`));
        const edgeIds: any[] = [];
        const holeIds: { [key: number]: { lower: boolean, peerId: string, peerType: number, type: MediaCategory } } = {};
        for (const [peerId, medias] of Object.entries(peerGroups)) {
            medias.sort((a, b) => (a.id || 0) - (b.id || 0)).forEach((media, index) => {
                const id = media.id || 0;
                const d = peerId.split('_');
                const peerid: string = d[0];
                const peertype: number = parseInt(d[1], 10);
                const type: MediaCategory = parseInt(d[2], 10);
                if (id > 1 && (index === 0 || (index > 0 && !ignoreItemsGap && ((medias[index - 1].id || 0) + 1) !== media.id))) {
                    edgeIds.push([teamId, peerid, peertype, id - 1]);
                    holeIds[id - 1] = {lower: true, peerId: peerid, peerType: peertype, type};
                }
                if ((medias.length - 1 === index) || (medias.length - 1 > index && !ignoreItemsGap && ((medias[index + 1].id || 0) - 1) !== media.id)) {
                    edgeIds.push([teamId, peerid, peertype, id + 1]);
                    holeIds[id + 1] = {lower: false, peerId: peerid, peerType: peertype, type};
                }
            });
        }
        return this.db.medias.where('[teamid+peerid+peertype+type+id]').anyOf(edgeIds).toArray().then((medias) => {
            const holes: IMedia[] = [];
            medias.forEach((media) => {
                const id = media.id || 0;
                if (holeIds.hasOwnProperty(id)) {
                    delete holeIds[id];
                }
            });
            for (const [id, data] of Object.entries(holeIds)) {
                holes.push(this.getHoleMessage(teamId, data.peerId, data.peerType, data.type, parseInt(id, 10), data.lower));
            }
            return this.db.medias.bulkPut([...items, ...holes]);
        });
    }

    private completeMediasLimitFromRemote(teamId: string, peer: InputPeer, type: MediaCategory, medias: IMedia[], id: number, limit: number, localOnly?: boolean): Promise<IMedia[]> {
        if (id === -1) {
            return Promise.reject('bad message id');
        }
        if (limit === 0) {
            return Promise.resolve(medias);
        }
        if (localOnly) {
            return Promise.resolve(medias);
        }

        return this.checkHoles(teamId, peer, type, id, limit).then((remoteMessages) => {
            this.userRepo.importBulk(false, remoteMessages.usersList);
            this.groupRepo.importBulk(remoteMessages.groupsList);
            const messageWithMediaMany = MessageRepo.parseMessageMany(remoteMessages.messagesList, currentUserId);
            remoteMessages.messagesList = messageWithMediaMany.messages as Array<UserMessage.AsObject>;
            return this.messageRepo.insertDiscrete(teamId, messageWithMediaMany.messages).then(() => {
                if (messageWithMediaMany.medias.length > 0) {
                    return this.importBulk(messageWithMediaMany.medias, true).then(() => {
                        return [...medias, ...messageWithMediaMany.medias];
                    });
                } else {
                    return medias;
                }
            });
        });
    }

    private mergeCheck(media: IMedia, newMedia: IMedia): IMedia {
        return kMerge(media, newMedia);
    }

    private getMode(before: number | undefined, after: number | undefined) {
        let mode = 0x0;
        if (before !== undefined) {
            mode = mode | 0x1;
        }
        if (after !== undefined) {
            mode = mode | 0x2;
        }
        return mode;
    }

    private getMany(teamId: string, peer: InputPeer, type: MediaCategory, {limit, before, after, localOnly}: { limit?: number, before?: number, after?: number, localOnly?: boolean }, earlyCallback?: (list: IMessage[]) => void): Promise<IMedia[]> {
        let pipe2: Dexie.Collection<IMedia, number>;
        const mode = this.getMode(before, after);
        const safeLimit = limit || 30;
        const safeBefore = before || 0;
        const safeAfter = after || 0;
        const peerObj = peer.toObject();
        const pipe = this.db.medias.where('[teamid+peerid+peertype+type+id]');
        switch (mode) {
            // none
            default:
            case 0x0:
                pipe2 = pipe.between([teamId, peerObj.id, peerObj.type, type, Dexie.minKey], [teamId, peerObj.id, peerObj.type, type, Dexie.maxKey], true, true);
                break;
            // before
            case 0x1:
                pipe2 = pipe.between([teamId, peerObj.id, peerObj.type, type, Dexie.minKey], [teamId, peerObj.id, peerObj.type, type, before], true, true);
                break;
            // after
            case 0x2:
                pipe2 = pipe.between([teamId, peerObj.id, peerObj.type, type, after], [teamId, peerObj.id, peerObj.type, type, Dexie.maxKey], true, true);
                break;
            // between
            case 0x3:
                pipe2 = pipe.between([teamId, peerObj.id, peerObj.type, type, after], [teamId, peerObj.id, peerObj.type, type, before], true, true);
                break;
        }
        if (mode !== 0x2) {
            pipe2 = pipe2.reverse();
        }
        return pipe2.limit(safeLimit).toArray().then((list: IMedia[]) => {
            const earlyMessages: IMessage[] = [];
            const hasHole = list.some((item, index) => {
                const cond = ((safeBefore === C_INFINITY && index > 0) || safeBefore !== C_INFINITY) && item.hole;
                if (earlyCallback && (mode === 0x1)) {
                    if (cond) {
                        earlyCallback(earlyMessages);
                        return true;
                    }
                    earlyMessages.push(item);
                }
                return cond;
            });
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
                if (earlyCallback && list.length > 0) {
                    earlyCallback(list);
                    return this.completeMediasLimitFromRemote(teamId, peer, type, [], lastId, safeLimit - list.length, localOnly);
                } else {
                    if (earlyCallback) {
                        earlyCallback([]);
                    }
                    return this.completeMediasLimitFromRemote(teamId, peer, type, list, lastId, safeLimit - list.length, localOnly);
                }
            } else {
                if (earlyCallback) {
                    earlyCallback([]);
                }
                return this.completeMediasLimitFromRemote(teamId, peer, type, [], lastId, safeLimit, localOnly);
            }
        });
    }

    private getHoleMessage(teamId: string, peerId: string, peerType: number, type: MediaCategory, id: number, after: boolean): IMedia {
        return {
            hole: true,
            id: id + (after ? 0.5 : -0.5),
            peerid: peerId,
            peertype: peerType,
            teamid: teamId,
            type,
        };
    }

    // @ts-ignore
    private checkHoles(teamId: string, peer: InputPeer, type: MediaCategory, id: number, limit: number) {
        limit += 1;
        const query = {
            limit,
            maxId: id,
        };
        return this.apiManager.getMessageMediaHistory(peer, type, query).then((remoteRes) => {
            return this.modifyHoles(teamId, peer.getId() || '', peer.getType() || 0, type, remoteRes.messagesList, limit - 1).then(() => {
                return remoteRes;
            });
        });
    }

    private modifyHoles(teamId: string, peerId: string, peerType: number, type: MediaCategory, res: UserMessage.AsObject[], limit: number) {
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
        return this.db.medias.where('[teamid+peerid+peertype+type+id]').between([teamId, peerId, peerType, type, min - 1], [teamId, peerId, peerType, type, max + 1], true, true).filter((item) => {
            return item.hole;
        }).delete().then((dres) => {
            const messageWithMediaMany = MessageRepo.parseMessageMany(res, currentUserId);
            if (this.messageRepo) {
                this.messageRepo.insertDiscrete(teamId, messageWithMediaMany.messages);
            }
            if (edgeMessage) {
                const medias: IMedia[] = [];
                return this.db.medias.where('id').equals(edgeMessage.id || 0).first().then((edgeRes) => {
                    if (!edgeRes && edgeMessage) {
                        medias.push(this.getHoleMessage(teamId, peerId, peerType, type, edgeMessage.id || 0, true));
                        window.console.log('insert hole at', edgeMessage.id);
                    }
                    medias.push(...messageWithMediaMany.medias);
                    return this.upsert(medias);
                });
            } else {
                return this.upsert(messageWithMediaMany.medias);
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
}
