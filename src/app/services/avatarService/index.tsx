/*
    Creation Time: 2019 - Jan - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import FileManager from '../sdk/fileManager/index';
import UserRepo from '../../repository/user/index';
import {InputFileLocation} from '../sdk/messages/chat.core.types_pb';
import FileRepo from '../../repository/file/index';
import GroupRepo from '../../repository/group';
import Broadcaster from '../broadcaster';
import {throttle, uniqWith} from "lodash";

interface IAvatar {
    fileId: string;
    retries: number;
    retryRemote?: boolean;
    src: string;
}

const C_MAX_RETRY = 3;

export const AvatarSrcUpdated = 'Avatar_SRC_Updated';

export default class AvatarService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new AvatarService();
        }
        return this.instance;
    }

    private static instance: AvatarService;

    private fileManager: FileManager;
    private fileRepo: FileRepo;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;
    private avatars: { [key: string]: IAvatar } = {};
    private broadcaster: Broadcaster;
    private throttleBroadcastList: any[] = [];
    private readonly throttleBroadcastExecute: any = undefined;

    public constructor() {
        this.fileManager = FileManager.getInstance();
        this.fileRepo = FileRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.broadcaster = Broadcaster.getInstance();
        this.throttleBroadcastExecute = throttle(this.broadcastThrottledList, 255);
    }

    /* Get avatar picture */
    public getAvatar(id: string, fileId: string, retires?: number): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.avatars.hasOwnProperty(id)) {
                if (this.avatars[id].retries > C_MAX_RETRY) {
                    reject();
                    return;
                }
                if (this.avatars[id].fileId === fileId && this.avatars[id].src !== '') {
                    resolve(this.avatars[id].src);
                    return;
                }
            }
            if (fileId !== '0') {
                this.avatars[id] = {
                    fileId,
                    retries: 0,
                    src: '',
                };
                this.getLocalFile(id, fileId).then((res) => {
                    resolve(res);
                }).catch(() => {
                    this.getRemoteFile(id, fileId).then((res) => {
                        resolve(res);
                    }).catch(() => {
                        remoteRetryFn();
                    });
                });
                const remoteRetryFn = () => {
                    if (this.avatars.hasOwnProperty(id)) {
                        // Retry remote server
                        if (!retires) {
                            retires = 1;
                        } else {
                            retires++;
                        }
                        if (retires <= C_MAX_RETRY || !this.avatars[id].retryRemote) {
                            this.avatars[id].retryRemote = true;
                            setTimeout(() => {
                                this.getAvatar(id, fileId, retires).then((getAvatarRes) => {
                                    resolve(getAvatarRes);
                                }).catch(() => {
                                    remoteRetryFn();
                                });
                            }, 255 * retires);
                        } else {
                            this.remove(id, fileId);
                            reject('not found');
                        }
                    } else {
                        reject('not found');
                    }
                };
            }
        });
    }

    /* Reset retries */
    public resetRetries(id: string) {
        if (this.avatars.hasOwnProperty(id)) {
            this.avatars[id].retries = 0;
        }
    }

    /* Remove image */
    public remove(id: string, fileId?: string) {
        if (this.avatars.hasOwnProperty(id)) {
            if (!fileId) {
                fileId = this.avatars[id].fileId;
            }
            delete this.avatars[id];
        }
        if (fileId) {
            return this.fileRepo.remove(fileId);
        } else {
            return Promise.resolve();
        }
    }

    /* Get photo location */
    private getPhotoLocation(id: string) {
        if (id.indexOf('-') === 0) {
            return this.groupRepo.get(id).then((res) => {
                if (res) {
                    return res.photo;
                } else {
                    return null;
                }
            });
        } else {
            return this.userRepo.get(id).then((res) => {
                if (res) {
                    return res.photo;
                } else {
                    return null;
                }
            });
        }
    }

    /* Get remote file */
    private getRemoteFile(id: string, fileId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.avatars.hasOwnProperty(id)) {
                this.getPhotoLocation(id).then((res) => {
                    if (res) {
                        const fileLocation = new InputFileLocation();
                        fileLocation.setAccesshash(res.photosmall.accesshash || '');
                        fileLocation.setClusterid(res.photosmall.clusterid || 1);
                        fileLocation.setFileid(res.photosmall.fileid || '');
                        fileLocation.setVersion(0);
                        this.fileManager.receiveFile(fileLocation, '', 0, 'image/jpeg').then(() => {
                            this.fileRepo.get(fileId).then((fileRes) => {
                                if (fileRes) {
                                    this.removeCache(id, fileId);
                                    if (this.avatars[id]) {
                                        this.avatars[id].fileId = fileId;
                                        this.avatars[id].src = fileRes.data.size === 0 ? '' : URL.createObjectURL(fileRes.data);
                                        this.avatars[id].retries = 0;
                                    }
                                    this.broadcastEvent(AvatarSrcUpdated, {items: [{id, fileId}]});
                                    this.throttleBroadcast([{id, fileId}]);
                                    resolve(this.avatars[id].src);
                                } else {
                                    if (this.avatars[id]) {
                                        this.avatars[id].retries++;
                                    }
                                    reject();
                                }
                            });
                        }).catch(() => {
                            this.avatars[id].retries++;
                            reject();
                        });
                    } else {
                        this.avatars[id].retries++;
                        reject();
                    }
                }).catch(() => {
                    this.avatars[id].retries++;
                    reject();
                });
            } else {
                this.avatars[id].retries++;
                reject();
            }
        });
    }

    /* Get local file */
    private getLocalFile(id: string, fileId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.avatars.hasOwnProperty(id)) {
                this.fileRepo.get(fileId).then((fileRes) => {
                    if (fileRes) {
                        this.avatars[id].src = fileRes.data.size === 0 ? '' : URL.createObjectURL(fileRes.data);
                        this.throttleBroadcast([{id, fileId}]);
                        resolve(this.avatars[id].src);
                    } else {
                        reject();
                    }
                }).catch(() => {
                    reject();
                });
            } else {
                reject();
            }
        });
    }

    /* Remove URL cache */
    private removeCache(id: string, fileId: string) {
        if (this.avatars.hasOwnProperty(id)) {
            if (this.avatars[id].fileId !== fileId && this.avatars[id].src !== '') {
                URL.revokeObjectURL(this.avatars[id].src);
            }
        }
    }

    private throttleBroadcast(idPairs: any[]) {
        if (idPairs.length > 0) {
            this.throttleBroadcastList.push(...idPairs);
            this.throttleBroadcastList = uniqWith(this.throttleBroadcastList, (i1, i2) => i1.id === i2 && i1.fileId === i2.fileId);
        }
        setTimeout(() => {
            this.throttleBroadcastExecute();
        }, 50);
    }

    private broadcastThrottledList = () => {
        if (this.throttleBroadcastList.length === 0) {
            return;
        }
        this.broadcastEvent(AvatarSrcUpdated, {items: this.throttleBroadcastList});
        this.throttleBroadcastList = [];
    }

    /* Broadcast global event */
    private broadcastEvent(name: string, data: any) {
        this.broadcaster.publish(name, data);
    }
}
