/*
    Creation Time: 2019 - Jan - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import FileManager from '../../../services/sdk/fileServer';
import UserRepo from '../../../repository/user';
import {InputFileLocation} from '../../../services/sdk/messages/core.types_pb';
import FileRepo from '../../../repository/file';

interface IAvatar {
    fileId: string;
    retries: number;
    src: string;
}

const C_MAX_RETRY = 3;

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
    private avatars: { [key: number]: IAvatar } = {};

    public constructor() {
        this.fileManager = FileManager.getInstance();
        this.fileRepo = FileRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
    }

    /* Get avatar picture */
    public getAvatar(id: string, fileId: string): Promise<string> {
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
            } else {
                this.avatars[id] = {
                    fileId,
                    retries: 0,
                    src: '',
                };
            }
            this.getLocalFile(id, fileId).then((res) => {
                resolve(res);
            }).catch(() => {
                reject();
                this.getRemoteFile(id, fileId).then((res) => {
                    resolve(res);
                }).catch(() => {
                    reject();
                });
            });
        });
    }

    /* Reset retries */
    public resetRetries(id: string) {
        if (this.avatars.hasOwnProperty(id)) {
            this.avatars[id].retires = 0;
        }
    }

    /* Get remote file */
    private getRemoteFile(id: string, fileId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.avatars.hasOwnProperty(id)) {
                this.userRepo.get(id).then((res) => {
                    if (res && res.photo) {
                        const fileLocation = new InputFileLocation();
                        fileLocation.setAccesshash(res.photo.photosmall.accesshash || '');
                        fileLocation.setClusterid(res.photo.photosmall.clusterid || 0);
                        fileLocation.setFileid(res.photo.photosmall.fileid || '');
                        fileLocation.setVersion(0);
                        this.fileManager.receiveFile(fileLocation, 0, 'image/jpeg').then(() => {
                            this.fileRepo.get(fileId).then((fileRes) => {
                                if (fileRes) {
                                    this.removeCache(id, fileId);
                                    this.avatars[id].fileId = fileId;
                                    this.avatars[id].src = fileRes.data.size === 0 ? '' : URL.createObjectURL(fileRes.data);
                                    this.avatars[id].retries = 0;
                                    resolve(this.avatars[id].src);
                                } else {
                                    this.avatars[id].retries++;
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
}
