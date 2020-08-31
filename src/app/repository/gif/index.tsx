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
import {IGif, IGifWithBot} from "./interface";
import MessageRepo from "../message";
import {DexieGifDB} from "../../services/db/dexie/gif";
import Dexie from "dexie";
import {differenceBy, find} from "lodash";
import {kMerge} from "../../services/utilities/kDash";
import {MediaDocument} from "../../services/sdk/messages/chat.messages.medias_pb";
import {InputDocument, InputFileLocation, InputPeer, InputUser} from "../../services/sdk/messages/core.types_pb";
import FileManager from "../../services/sdk/fileManager";
import ProgressBroadcaster from "../../services/progress";
import FileDownloadProgress from "../../components/FileDownloadProgress";
import FileRepo, {GetDbFileName} from "../file";
import {Int64BE} from "int64-buffer";
// @ts-ignore
import CRC from 'js-crc/build/crc.min';
import {IGifUse} from "../../services/sdk/updateManager";
import UserRepo from "../user";

export const getGifsCrc = (list: IGif[]) => {
    const ids = list.map((item) => {
        const space = '                    ';
        const id = item.id || '';
        const wLen = 20 - id.length;
        return {
            id: new Int64BE(id),
            wid: space.slice(0, wLen) + id
        };
    });
    ids.sort((i1, i2) => {
        return i1.wid < i2.wid ? -1 : 1;
    });
    const data: number[] = [];
    ids.forEach((id) => {
        data.push(...id.id.toArray());
    });
    return parseInt(CRC.crc32(data), 16);
};

export default class GifRepo {
    public static parseGif(gifDoc: MediaDocument.AsObject): IGif {
        const out: IGif = gifDoc;
        if (gifDoc && gifDoc.doc) {
            const flags: { type: number } = {type: C_MESSAGE_TYPE.Normal};
            out.attributes = MessageRepo.parseAttributes(gifDoc.doc.attributesList, flags);
            out.messagetype = flags.type;
        }
        out.id = GetDbFileName(gifDoc.doc.id, gifDoc.doc.clusterid);
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
    private db: DexieGifDB;
    private apiManager: APIManager;
    private userRepo: UserRepo;
    private fileRepo: FileRepo;
    private fileManager: FileManager;
    private progressBroadcaster: ProgressBroadcaster;
    private riverTime: RiverTime;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.apiManager = APIManager.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.fileRepo = FileRepo.getInstance();
        this.fileManager = FileManager.getInstance();
        this.progressBroadcaster = ProgressBroadcaster.getInstance();
        this.riverTime = RiverTime.getInstance();
    }

    public searchRemote(userPeer: InputPeer, query: string, offset: string): Promise<IGifWithBot> {
        if (query.length === 0) {
            return Promise.reject('no keywords');
        }
        const config = this.apiManager.getInstantSystemConfig();
        return this.userRepo.getByUsername(config.gifbot || 'gif').then((res) => {
            const inputUser = new InputUser();
            inputUser.setAccesshash(res.accesshash || '0');
            inputUser.setUserid(res.id || '0');
            return this.apiManager.botGetInlineResults(inputUser, userPeer, query, offset).then((remoteRes) => {
                const gifts: IGif[] = [];
                remoteRes.resultsList.forEach((o) => {
                    const item = MessageRepo.parseMessage({
                        media: o.message.mediadata,
                        mediatype: o.type,
                    }, '0');
                    if (item.messagetype === C_MESSAGE_TYPE.Gif) {
                        const mediaDocument = item.mediadata as MediaDocument.AsObject;
                        gifts.push({
                            attributes: item.attributes,
                            caption: mediaDocument.caption,
                            doc: mediaDocument.doc,
                            downloaded: false,
                            entitiesList: mediaDocument.entitiesList,
                            id: mediaDocument.doc.id,
                            last_used: this.riverTime.now(),
                            messagetype: item.messagetype,
                            queryId: remoteRes.queryid,
                            remote: true,
                            resultId: o.id,
                        });
                    }
                });
                return {
                    botId: res.id || '0',
                    list: gifts,
                };
            });
        });
    }

    public list(skip: number, limit: number, callback: (list: IGif[]) => void): Promise<IGif[]> {
        this.db.gifs.where('last_used').between(Dexie.minKey, Dexie.maxKey).reverse().offset(skip).limit(limit).toArray().then((res) => {
            if (callback) {
                callback(res);
            }
        });
        if (!skip) {
            const hash = this.getHash();
            return this.apiManager.getGif(hash).then((res) => {
                if (!res.notmodified) {
                    res.docsList = GifRepo.parseGifMany(res.docsList || []);
                    this.setHash(res.hash || 0);
                    this.upsert(res.docsList, true);
                    const list = res.docsList.slice(skip, skip + limit) as IGif[];
                    return this.checkDownloaded(list.map(o => o.id || '0'), list);
                } else {
                    return [] as IGif[];
                }
            });
        } else {
            return Promise.resolve([]);
        }
    }

    public createMany(gifs: IGif[]) {
        return this.db.gifs.bulkPut(gifs);
    }

    public updateGifUseBulk(list: IGifUse[]) {
        const timeList: number[] = [];
        const ids: string[] = [];
        list.forEach((o) => {
            const fileName = GetDbFileName(o.doc.id, o.doc.clusterid);
            timeList[fileName] = o.time;
            ids.push(GetDbFileName(o.doc.id, o.doc.clusterid));
        });
        return this.db.gifs.where('id').anyOf(ids).toArray().then((result) => {
            const ls: IGif[] = result.map((item) => {
                if (timeList[item.id || 0]) {
                    item.last_used = timeList[item.id || 0];
                }
                return item;
            });
            return this.createMany(ls);
        });
    }

    public download(inputFile: InputFileLocation, md5: string, size: number, mimeType: string, temp?: boolean) {
        const fileName = GetDbFileName(inputFile.getFileid(), inputFile.getClusterid());
        const progressSubject = FileDownloadProgress.getUid(inputFile.toObject());
        return this.fileManager.receiveFile(inputFile, md5, size, mimeType, (progress) => {
            this.progressBroadcaster.publish(progressSubject || 0, progress);
        }).then(() => {
            if (temp) {
                return true;
            } else {
                return this.markAsDownloaded(fileName);
            }
        });
    }

    public remove(inputDocument: InputDocument) {
        return this.apiManager.removeGif(inputDocument).then(() => {
            return this.db.gifs.delete(inputDocument.getId() || '').then(() => {
                this.computeHash();
            });
        });
    }

    public useGif(inputDocument: InputDocument.AsObject) {
        const fileName = GetDbFileName(inputDocument.id, inputDocument.clusterid);
        return this.db.gifs.where('id').equals(fileName).first().then((result) => {
            if (result) {
                result.last_used = this.riverTime.now();
                return this.db.gifs.put(result);
            } else {
                throw Error('not found');
            }
        });
    }

    public upsert(gifs: IGif[], fromRemote?: boolean): Promise<any> {
        const ids = gifs.map((gif, index) => {
            if (fromRemote) {
                gif.last_used = this.riverTime.now();
            }
            return gif.id || '';
        });
        const checkDownloadIds: string[] = [];
        return this.db.gifs.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IGif[] = differenceBy(gifs, result, 'id');
            createItems.forEach((gif) => {
                checkDownloadIds.push(gif.id || '0');
            });
            const updateItems: IGif[] = result.map((gif: IGif) => {
                if (!gif.downloaded) {
                    checkDownloadIds.push(gif.id || '0');
                }
                const t = find(gifs, {id: gif.id});
                if (t) {
                    if (fromRemote && gif.last_used) {
                        t.last_used = gif.last_used;
                    }
                    return this.mergeCheck(gif, t);
                } else {
                    return gif;
                }
            });
            const list = [...createItems, ...updateItems];
            if (checkDownloadIds.length > 0) {
                return this.checkDownloaded(checkDownloadIds, list).then((newList) => {
                    return this.createMany(newList);
                });
            } else {
                return this.createMany(list);
            }
        }).then((res) => {
            if (!fromRemote) {
                this.computeHash();
            }
            return res;
        });
    }

    private markAsDownloaded(name: string): Promise<any> {
        return this.db.gifs.where('id').equals(name).first().then((result) => {
            if (result) {
                result.downloaded = true;
                return this.db.gifs.put(result);
            } else {
                throw Error('not found');
            }
        });
    }

    private checkDownloaded(ids: string[], list: IGif[]) {
        const itemMap: { [key: string]: number } = {};
        list.forEach((item, index) => {
            itemMap[item.id || '0'] = index;
        });
        return this.fileRepo.getIn(ids).then((res) => {
            res.forEach((item) => {
                const index = itemMap[item.id];
                if (index) {
                    list[index].downloaded = true;
                }
            });
            return list;
        });
    }

    private computeHash() {
        this.db.gifs.where('last_used').between(Dexie.minKey, Dexie.maxKey).toArray().then((res) => {
            this.setHash(getGifsCrc(res));
        });
    }

    private mergeCheck(gif: IGif, newGif: IGif): IGif {
        if (gif.downloaded || newGif.downloaded) {
            newGif.downloaded = true;
            gif.downloaded = true;
        }
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
