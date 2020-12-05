/*
    Creation Time: 2019 - May - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import FileRepo, {GetDbFileName} from '../../repository/file/index';
import DialogRepo from '../../repository/dialog/index';
import MediaRepo from '../../repository/media/index';
import {PeerType} from '../sdk/messages/core.types_pb';
import MessageRepo from '../../repository/message';
import {IPeer} from "../../repository/dialog/interface";
import {C_MESSAGE_TYPE} from "../../repository/message/consts";

export interface IStorageProgress {
    done: number;
    fileCount: number;
    total: number;
}

interface IFileInfo {
    fileName: string;
    id: number;
    mediaType: number;
    size: number;
}

export interface IFileWithId {
    fileName: string;
    id: number;
}

interface IStorageInfo {
    fileIds: IFileWithId[];
    totalFile: number;
    totalSize: number;
}

export interface IDialogInfo {
    mediaTypes: { [key: number]: IStorageInfo };
    peer: IPeer;
    teamId: string;
    peerType: PeerType;
    totalFile: number;
    totalSize: number;
}

export default class StorageUsageService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new StorageUsageService();
        }
        return this.instance;
    }

    private static instance: StorageUsageService;

    private isStarted: boolean = false;

    private fileRepo: FileRepo;
    private dialogRepo: DialogRepo;
    private mediaRepo: MediaRepo;
    private messageRepo: MessageRepo;
    private computeQueue: IPeer[] = [];
    private dialogInfo: { [key: string]: IDialogInfo } = {};
    private totalComputations: number = 0;
    // Progress and promise
    private promise: { resolve: any, reject: any } = {reject: null, resolve: null};
    private progressFn?: (e: IStorageProgress) => void;

    public constructor() {
        this.fileRepo = FileRepo.getInstance();
        this.dialogRepo = DialogRepo.getInstance();
        this.mediaRepo = MediaRepo.getInstance();
        this.messageRepo = MessageRepo.getInstance();
    }

    public compute(teamId: string, progress?: (e: IStorageProgress) => void) {
        this.progressFn = progress;
        const promise = new Promise<IDialogInfo[]>((res, rej) => {
            this.promise.resolve = res;
            this.promise.reject = rej;
        });
        if (this.isStarted) {
            return promise;
        }
        this.isStarted = true;
        this.progressFn = progress;
        this.dialogInfo = {};
        this.computeQueue = [];
        this.dialogRepo.getManyCache(teamId, {}).then((dialogs) => {
            dialogs.forEach((dialog) => {
                this.computeQueue.push({id: dialog.peerid || '', peerType: dialog.peertype || 0});
            });
            this.totalComputations = dialogs.length;
            this.startComputing(teamId);
        });
        return promise;
    }

    public clearCache(infoList: IFileWithId[], progress?: (e: IStorageProgress) => void) {
        let resolve: any = null;
        let reject: any = null;
        const promise = new Promise<IDialogInfo[]>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        const limit: number = 50;
        let skip: number = 0;
        const fn = () => {
            this.clearChunk(infoList, skip, limit).then(() => {
                skip += limit;
                if (progress) {
                    progress({
                        done: Math.floor(skip / limit),
                        fileCount: 0,
                        total: infoList.length,
                    });
                }
                if (infoList.length > skip) {
                    fn();
                } else {
                    resolve();
                }
            }).catch((err) => {
                reject(err);
            });
        };
        fn();
        return promise;
    }

    private clearChunk(infoList: IFileWithId[], skip?: number, limit?: number) {
        const items = infoList.slice(skip, limit);
        const fileNames: string[] = [];
        items.forEach((file) => {
            fileNames.push(file.fileName);
        });
        return this.fileRepo.removeMany(fileNames).then(() => {
            return this.messageRepo.importBulk(items.map((item) => {
                return {
                    downloaded: false,
                    id: item.id,
                    saved: false,
                };
            }));
        });
    }

    private getMediaFiles(teamId: string, peer: IPeer, before?: number) {
        const limit = 50;
        return this.mediaRepo.getMany(teamId, peer, {before, limit}).then((res) => {
            const fileMap: {[key: string]: {id: number, mediaType: number}} = {};
            let peerType: PeerType = PeerType.PEERUSER;
            const more = res.count === limit;
            const names: string[] = [];
            res.messages.filter((o) => {
                peerType = o.peertype || PeerType.PEERUSER;
                return (o.mediadata && o.mediadata.doc && (o.mediadata.doc.id || (o.mediadata.doc.thumbnail && o.mediadata.doc.thumbnail.fileid)));
            }).forEach((o) => {
                if (o.mediadata.doc.id) {
                    const name = GetDbFileName(o.mediadata.doc.id, o.mediadata.doc.clusterid);
                    fileMap[name] = {
                        id: o.id || 0,
                        mediaType: o.messagetype || C_MESSAGE_TYPE.Normal,
                    };
                    names.push(name);
                }
                if (o.mediadata.doc.thumbnail && o.mediadata.doc.thumbnail.fileid) {
                    const name = GetDbFileName(o.mediadata.doc.thumbnail.fileid, o.mediadata.doc.thumbnail.clusterid);
                    fileMap[name] = {
                        id: o.id || 0,
                        mediaType: o.messagetype || C_MESSAGE_TYPE.Normal,
                    };
                    names.push(name);
                }
            });
            return this.fileRepo.getIn(names).then((files) => {
                return {
                    infoList: files.map((o) => {
                        return {
                            fileName: o.id,
                            id: fileMap[o.id].id,
                            mediaType: fileMap[o.id].mediaType,
                            size: o.size,
                        };
                    }),
                    minId: res.minId,
                    more,
                    peerId: peer.id,
                    peerType,
                };
            });
        }).then((res: { infoList: IFileInfo[], minId: number, more: boolean, peerId: string, peerType: PeerType }) => {
            return res;
        });
    }

    private getMediaListPart(teamId: string, peer: IPeer, before?: number) {
        return this.getMediaFiles(teamId, peer, before).then((res) => {
            const mapId = `${teamId}_${peer.id}_${peer.peerType}`;
            if (!this.dialogInfo.hasOwnProperty(mapId)) {
                this.dialogInfo[mapId] = {
                    mediaTypes: {},
                    peer,
                    peerType: res.peerType,
                    teamId,
                    totalFile: 0,
                    totalSize: 0,
                };
            }
            res.infoList.forEach((list) => {
                this.dialogInfo[mapId].totalFile++;
                this.dialogInfo[mapId].totalSize += list.size;
                if (!this.dialogInfo[mapId].mediaTypes[list.mediaType]) {
                    this.dialogInfo[mapId].mediaTypes[list.mediaType] = {
                        fileIds: [],
                        totalFile: 0,
                        totalSize: 0,
                    };
                }
                this.dialogInfo[mapId].mediaTypes[list.mediaType].fileIds.push({fileName: list.fileName, id: list.id});
                this.dialogInfo[mapId].mediaTypes[list.mediaType].totalFile++;
                this.dialogInfo[mapId].mediaTypes[list.mediaType].totalSize += list.size;
            });
            return res;
        });
    }

    private startComputing(teamId: string, peer?: IPeer, before?: number, total?: number) {
        if (!peer) {
            peer = this.computeQueue.shift();
        }
        if (teamId && peer) {
            this.getMediaListPart(teamId, peer, before).then((res) => {
                if (!total) {
                    total = 0;
                }
                total += res.infoList.length;
                if (res.more) {
                    this.startComputing(teamId, peer, res.minId - 1, total);
                } else {
                    this.startComputing(teamId, undefined, undefined, total);
                }
                if (this.progressFn) {
                    this.progressFn({
                        done: this.totalComputations - this.computeQueue.length,
                        fileCount: total || 0,
                        total: this.totalComputations,
                    });
                }
            }).catch((err) => {
                this.isStarted = false;
                if (this.promise.reject) {
                    this.promise.reject(err);
                }
            });
        } else {
            if (this.progressFn) {
                this.progressFn({
                    done: this.totalComputations,
                    fileCount: total || 0,
                    total: this.totalComputations,
                });
            }
            if (this.promise.resolve) {
                this.isStarted = false;
                this.promise.resolve(Object.keys(this.dialogInfo).map((key) => {
                    return this.dialogInfo[key];
                }).filter((o) => {
                    return o.totalFile;
                }).sort((i1, i2) => {
                    if (!i1.totalSize || !i2.totalSize) {
                        return 0;
                    }
                    return i2.totalSize - i1.totalSize;
                }));
            }
        }
    }
}
