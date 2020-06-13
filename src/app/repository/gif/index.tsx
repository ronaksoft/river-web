/*
    Creation Time: 2020 - June - 13
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import DB from '../../services/db/gif';
import APIManager from "../../services/sdk";
import RiverTime from "../../services/utilities/river_time";
import {C_LOCALSTORAGE} from "../../services/sdk/const";
import {C_MESSAGE_TYPE} from "../message/consts";
import {IGif} from "./interface";
import MessageRepo from "../message";
import {DexieGifDB} from "../../services/db/dexie/gif";
import Dexie from "dexie";
import {differenceBy, find} from "lodash";
import {kMerge} from "../../services/utilities/kDash";
import {MediaDocument} from "../../services/sdk/messages/chat.messages.medias_pb";
import {InputDocument} from "../../services/sdk/messages/core.types_pb";

export default class GifRepo {
    public static parseGif(gifDoc: MediaDocument.AsObject): IGif {
        const out: IGif = gifDoc;
        if (gifDoc && gifDoc.doc) {
            const flags: { type: number } = {type: C_MESSAGE_TYPE.Normal};
            out.attributes = MessageRepo.parseAttributes(gifDoc.doc.attributesList, flags);
            out.messagetype = flags.type;
            delete out.doc.attributesList;
        }
        delete out.entitiesList;
        return out;
    }

    public static parseGifMany(msg: MediaDocument.AsObject[]): IGif[] {
        return msg.map((m) => {
            return this.parseGif(m);
        });
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new GifRepo();
        }

        return this.instance;
    }

    private static instance: GifRepo;

    private dbService: DB;
    // @ts-ignore
    private db: DexieGifDB;
    // @ts-ignore
    private apiManager: APIManager;
    // @ts-ignore
    private riverTime: RiverTime;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.apiManager = APIManager.getInstance();
        this.riverTime = RiverTime.getInstance();
    }

    public list(skip: number, limit: number, callback: (list: IGif[]) => void): Promise<IGif[]> {
        this.db.gifs.where('last_used').between(Dexie.minKey, Dexie.maxKey).offset(skip).limit(limit).reverse().toArray().then((res) => {
            if (callback) {
                callback(res);
            }
        });
        const hash = this.getHash();
        window.console.log(hash);
        return this.apiManager.getGif(hash).then((res) => {
            window.console.log(res);
            if (!res.notmodified) {
                res.docsList = GifRepo.parseGifMany(res.docsList || []);
                this.setHash(res.hash || 0);
                this.upsert(res.docsList, true);
                return res.docsList.slice(skip, skip + limit) as IGif[];
            } else {
                return [] as IGif[];
            }
        });
    }

    public createMany(gifs: IGif[]) {
        return this.db.gifs.bulkPut(gifs);
    }

    public remove(inputDocument: InputDocument) {
        return this.apiManager.removeGif(inputDocument).then(() => {
            this.setHash(0);
            return this.db.gifs.delete(inputDocument.getId() || '');
        });
    }

    public upsert(gifs: IGif[], fromRemote?: boolean): Promise<any> {
        const ids = gifs.map((gif, index) => {
            gif.id = gif.doc.id;
            if (fromRemote) {
                gif.last_used = gifs.length - index;
            }
            return gif.id || '';
        });
        return this.db.gifs.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IGif[] = differenceBy(gifs, result, 'id');
            const updateItems: IGif[] = result.map((gif: IGif) => {
                const t = find(gifs, {id: gif.id});
                if (t) {
                    return this.mergeCheck(gif, t);
                } else {
                    return gif;
                }
            });
            window.console.log(createItems, updateItems);
            return this.createMany([...createItems, ...updateItems]);
        });
    }

    private mergeCheck(gif: IGif, newGif: IGif): IGif {
        return kMerge(gif, newGif);
    }

    private getHash() {
        const d = localStorage.getItem(C_LOCALSTORAGE.GifHash);
        if (!d) {
            return 0;
        }
        return parseInt(d, 10);
    }

    private setHash(hash: number) {
        localStorage.setItem(C_LOCALSTORAGE.GifHash, String(hash));
    }
}
