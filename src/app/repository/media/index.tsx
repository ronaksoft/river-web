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
import {differenceBy, find, merge, uniqBy, clone, throttle} from 'lodash';
import {DexieMediaDB} from '../../services/db/dexie/media';
import {InputPeer} from '../../services/sdk/messages/chat.core.types_pb';

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

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.updateThrottle = throttle(this.insertToDb, 300);
    }

    public create(media: IMedia) {
        return this.db.medias.put(media);
    }

    public createMany(media: IMedia[]) {
        return this.db.medias.bulkPut(media);
    }

    public get(id: number): Promise<IMedia> {
        return this.db.medias.get(id).then((g: IMedia) => {
            return g;
        });
    }

    public getMany({limit, before, after, type}: any, peer: InputPeer): Promise<IMedia[]> {
        const pipe = this.db.medias.where('[peerid+id+type]');
        let pipe2: Dexie.Collection<IMedia, number>;
        let mode = 0x0;
        if (before !== null && before !== undefined) {
            mode = mode | 0x1;
        }
        if (after !== null && after !== undefined) {
            mode = mode | 0x2;
        }
        limit = limit || 30;
        let typeMin: any = Dexie.minKey;
        let typeMax: any = Dexie.maxKey;
        if (type) {
            typeMin = type;
            typeMax = type;
        }
        const peerId = peer.getId() || '';
        switch (mode) {
            // none
            default:
            case 0x0:
                pipe2 = pipe.between([peerId, Dexie.minKey, typeMin], [peerId, Dexie.maxKey, typeMax], true, true);
                break;
            // before
            case 0x1:
                pipe2 = pipe.between([peerId, Dexie.minKey, typeMin], [peerId, before, typeMax], true, true);
                break;
            // after
            case 0x2:
                pipe2 = pipe.between([peerId, after, typeMin], [peerId, Dexie.maxKey, typeMax], true, true);
                break;
            // between
            case 0x3:
                pipe2 = pipe.between([peerId, after, typeMin], [peerId, before, typeMax], true, true);
                break;
        }
        if (mode !== 0x2) {
            pipe2 = pipe2.reverse();
        }
        pipe2.limit(limit);
        return pipe2.toArray();
    }

    public lazyUpsert(medias: IMedia[]) {
        this.mediaList.push.apply(this.mediaList, clone(medias));
        this.updateThrottle();
    }

    public importBulk(medias: IMedia[]): Promise<any> {
        const tempGroup = uniqBy(medias, 'id');
        return this.upsert(tempGroup);
    }

    public upsert(medias: IMedia[]): Promise<any> {
        const ids = medias.map((media) => {
            return media.id;
        });
        return this.db.medias.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IMedia[] = differenceBy(medias, result, 'id');
            const updateItems: IMedia[] = result;
            updateItems.map((media: IMedia) => {
                const t = find(medias, {id: media.id});
                if (t) {
                    return this.mergeCheck(media, t);
                } else {
                    return media;
                }
            });
            const list = [...createItems, ...updateItems];
            return this.createMany(list);
        }).then((res) => {
            return res;
        });
    }

    private mergeCheck(media: IMedia, newMedia: IMedia): IMedia {
        return merge(media, newMedia);
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
}
