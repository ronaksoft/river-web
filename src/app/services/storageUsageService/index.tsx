/*
    Creation Time: 2019 - May - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import FileRepo from '../../repository/file/index';
import DialogRepo from '../../repository/dialog/index';
import MediaRepo from '../../repository/media/index';
import {PeerType} from '../sdk/messages/chat.core.types_pb';

export interface IStorageProgress {
    done: number;
    total: number;
}

interface IFileInfo {
    fileId: string;
    id: string;
    mediaType: number;
    size: number;
}

interface IFileWithId {
    fileId: string;
    id: string;
}

interface IStorageInfo {
    fileIds: IFileWithId[];
    totalFile: number;
    totalSize: number;
}

export interface IDialogInfo {
    mediaTypes: { [key: number]: IStorageInfo };
    peerId: string;
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
    private computeQueue: string[] = [];
    private dialogInfo: { [key: string]: IDialogInfo } = {};
    private totalComputations: number = 0;
    // Progress and promise
    private promise: { resolve: any, reject: any } = {resolve: null, reject: null};
    private progressFn?: (e: IStorageProgress) => void;

    public constructor() {
        this.fileRepo = FileRepo.getInstance();
        this.dialogRepo = DialogRepo.getInstance();
        this.mediaRepo = MediaRepo.getInstance();
    }

    public compute(progress?: (e: IStorageProgress) => void) {
        if (this.isStarted) {
            return Promise.reject('already started');
        }
        this.isStarted = true;
        this.progressFn = progress;
        this.dialogInfo = {};
        this.computeQueue = [];
        return new Promise<IDialogInfo[]>((res, rej) => {
            this.promise.resolve = res;
            this.promise.reject = rej;
            this.dialogRepo.getManyCache({}).then((dialogs) => {
                dialogs.forEach((dialog) => {
                    this.computeQueue.push(dialog.peerid || '');
                });
                this.totalComputations = dialogs.length;
                this.startComputing();
            });
        });
    }

    private getMediaFiles(peerId: string, before?: number) {
        const limit = 50;
        return this.mediaRepo.getMany({limit, before}, peerId).then((res) => {
            const fileMap: any = {};
            let peerType: PeerType = PeerType.PEERUSER;
            const more = res.count === limit;
            const ids = res.messages.filter((o) => {
                peerType = o.peertype || PeerType.PEERUSER;
                return (o.mediadata && o.mediadata.doc && o.mediadata.doc.id);
            }).map((o) => {
                fileMap[o.mediadata.doc.id] = {
                    id: o.id,
                    mediaType: o.messagetype,
                };
                return o.mediadata.doc.id;
            });
            return this.fileRepo.getIn(ids).then((files) => {
                return {
                    infoList: files.map((o) => {
                        return {
                            fileId: o.id,
                            id: fileMap[o.id].id,
                            mediaType: fileMap[o.id].mediaType,
                            size: o.size,
                        };
                    }),
                    minId: res.minId,
                    more,
                    peerId,
                    peerType,
                };
            });
        }).then((res: { infoList: IFileInfo[], minId: number, more: boolean, peerId: string, peerType: PeerType }) => {
            return res;
        });
    }

    private getMediaListPart(peerId: string, before?: number) {
        return this.getMediaFiles(peerId, before).then((res) => {
            if (!this.dialogInfo.hasOwnProperty(peerId)) {
                this.dialogInfo[peerId] = {
                    mediaTypes: {},
                    peerId,
                    peerType: res.peerType,
                    totalFile: 0,
                    totalSize: 0,
                };
            }
            res.infoList.forEach((list) => {
                this.dialogInfo[peerId].totalFile++;
                this.dialogInfo[peerId].totalSize += list.size;
                if (!this.dialogInfo[peerId].mediaTypes[list.mediaType]) {
                    this.dialogInfo[peerId].mediaTypes[list.mediaType] = {
                        fileIds: [],
                        totalFile: 0,
                        totalSize: 0,
                    };
                }
                this.dialogInfo[peerId].mediaTypes[list.mediaType].fileIds.push({fileId: list.fileId, id: list.id});
                this.dialogInfo[peerId].mediaTypes[list.mediaType].totalFile++;
                this.dialogInfo[peerId].mediaTypes[list.mediaType].totalSize += list.size;
            });
            return res;
        });
    }

    private startComputing(peerId?: string, before?: number) {
        if (!peerId) {
            peerId = this.computeQueue.shift();
        }
        if (peerId) {
            this.getMediaListPart(peerId, before).then((res) => {
                if (res.more) {
                    this.startComputing(peerId, res.minId - 1);
                } else {
                    this.startComputing();
                    if (this.progressFn) {
                        this.progressFn({
                            done: this.totalComputations - this.computeQueue.length,
                            total: this.totalComputations,
                        });
                    }
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
