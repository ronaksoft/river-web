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
import {C_MEDIA_TYPE, IMedia} from './interface';
import {differenceBy, find, uniqBy, clone, throttle} from 'lodash';
import {DexieMediaDB} from '../../services/db/dexie/media';
import MessageRepo from '../message';
import {kMerge} from "../../services/utilities/kDash";
import {IMessage} from "../message/interface";

interface IMediaWithCount {
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
    private mediaList: IMedia[] = [];
    private readonly updateThrottle: any = null;
    private messageRepo: MessageRepo;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.updateThrottle = throttle(this.insertToDb, 300);
        this.messageRepo = MessageRepo.getInstance();
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

    public getMany(teamId: string, peerId: string, {limit, before, after, type}: { limit?: number, before?: number, after?: number, type?: number }): Promise<IMediaWithCount> {
        return new Promise<IMediaWithCount>((resolve, reject) => {
            const pipe = this.db.medias.where('[teamid+peerid+id]');
            let pipe2: Dexie.Collection<IMedia, number>;
            let mode = 0x0;
            if (before !== null && before !== undefined) {
                mode = mode | 0x1;
            }
            if (after !== null && after !== undefined) {
                mode = mode | 0x2;
            }
            limit = limit || 30;
            const typeRangeArr: any[] = [];
            if (type === C_MEDIA_TYPE.MEDIA) {
                typeRangeArr.push([C_MEDIA_TYPE.PHOTO, C_MEDIA_TYPE.VIDEO]);
                typeRangeArr.push([C_MEDIA_TYPE.GIF, C_MEDIA_TYPE.GIF]);
            } else if (type === C_MEDIA_TYPE.PHOTOVIDEO) {
                typeRangeArr.push([C_MEDIA_TYPE.PHOTO, C_MEDIA_TYPE.VIDEO]);
            } else if (type === C_MEDIA_TYPE.MUSIC) {
                typeRangeArr.push([C_MEDIA_TYPE.AUDIO, C_MEDIA_TYPE.VOICE]);
            } else if (type) {
                typeRangeArr.push([type, type]);
            } else {
                typeRangeArr.push([Dexie.minKey, Dexie.maxKey]);
            }

            switch (mode) {
                // none
                default:
                case 0x0:
                    pipe2 = pipe.between([teamId, peerId, Dexie.minKey], [teamId, peerId, Dexie.maxKey], true, true);
                    break;
                // before
                case 0x1:
                    pipe2 = pipe.between([teamId, peerId, Dexie.minKey], [teamId, peerId, before], true, true);
                    break;
                // after
                case 0x2:
                    pipe2 = pipe.between([teamId, peerId, after], [teamId, peerId, Dexie.maxKey], true, true);
                    break;
                // between
                case 0x3:
                    pipe2 = pipe.between([teamId, peerId, after], [teamId, peerId, before], true, true);
                    break;
            }
            if (mode !== 0x2) {
                pipe2 = pipe2.reverse();
            }
            if (type) {
                pipe2 = pipe2.filter((item: IMedia) => {
                    return typeRangeArr.some((typeRange) => {
                        return item.type >= typeRange[0] && item.type <= typeRange[1];
                    });
                });
            }
            pipe2.limit(limit).toArray().then((list: IMedia[]) => {
                if (list.length === 0) {
                    resolve({
                        count: 0,
                        maxId: 0,
                        messages: [],
                        minId: 0,
                    });
                } else {
                    const ids = list.map((media) => {
                        return media.id;
                    });
                    this.messageRepo.getIn(ids, (mode === 0x2)).then((result) => {
                        resolve({
                            count: ids.length,
                            maxId: result.length > 0 ? (result[0].id || 0) : 0,
                            messages: result,
                            minId: result.length > 0 ? (result[result.length - 1].id || 0) : 0,
                        });
                    }).then((err) => {
                        reject(err);
                    });
                }
            }).catch((err: any) => {
                reject(err);
            });
        });
    }

    public lazyUpsert(medias: IMedia[]) {
        this.mediaList.push.apply(this.mediaList, clone(medias));
        this.updateThrottle();
    }

    public importBulk(medias: IMedia[]): Promise<any> {
        const tempGroup = uniqBy(medias, 'id');
        return this.upsert(tempGroup);
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
            this.broadcastEvent('Media_DB_Updated', {ids: newIds, peerids: Object.keys(peerIdMap), callerId});
            return res;
        });
    }

    private mergeCheck(media: IMedia, newMedia: IMedia): IMedia {
        return kMerge(media, newMedia);
    }

    private insertToDb = () => {
        const execute = (medias: IMedia[]) => {
            if (medias.length === 0) {
                return;
            }
            this.upsert(medias);
        };
        let tempMedias: IMedia[] = [];
        while (this.mediaList.length > 0) {
            const media = this.mediaList.shift();
            if (media) {
                tempMedias.push(media);
            }
            if (tempMedias.length >= 50) {
                execute(tempMedias);
                tempMedias = [];
            }
        }
        execute(tempMedias);
    }

    private broadcastEvent(name: string, data: any) {
        const event = new CustomEvent(name, {
            bubbles: false,
            detail: data,
        });
        window.dispatchEvent(event);
    }
}
