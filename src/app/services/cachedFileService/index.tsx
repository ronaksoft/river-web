/*
    Creation Time: 2019 - Jan - 30
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import FileManager from '../sdk/fileManager/index';
import {InputFileLocation} from '../sdk/messages/core.types_pb';
import FileRepo, {GetDbFileName} from '../../repository/file/index';
// @ts-ignore
import glur from 'glur';

interface IFile {
    blurSrc: object;
    location: InputFileLocation.AsObject;
    retries: number;
    size: number;
    src: string;
    timeout: null;
}

const C_MAX_RETRY = 3;
const C_CACHE_TTL = 67;

export default class CachedFileService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new CachedFileService();
        }
        return this.instance;
    }

    private static instance: CachedFileService;

    private fileManager: FileManager;
    private fileRepo: FileRepo;
    private files: { [key: number]: IFile } = {};

    public constructor() {
        this.fileManager = FileManager.getInstance();
        this.fileRepo = FileRepo.getInstance();
    }

    /* Get file */
    public getFile(fileLocation: InputFileLocation.AsObject, md5: string, size: number, mimeType: string, searchTemp?: boolean, blurRadius?: number): Promise<string> {
        if (!fileLocation) {
            return Promise.reject();
        }
        const fileName = GetDbFileName(fileLocation.fileid, fileLocation.clusterid);
        return new Promise((resolve, reject) => {
            if (this.files.hasOwnProperty(fileName)) {
                if (this.files[fileName].retries > C_MAX_RETRY) {
                    reject();
                    return;
                }
                if (!blurRadius && this.files[fileName].src !== '') {
                    if (this.files[fileName].timeout !== null) {
                        clearTimeout(this.files[fileName].timeout);
                    }
                    resolve(this.files[fileName].src);
                    return;
                } else if (blurRadius && this.files[fileName].blurSrc.hasOwnProperty(blurRadius)) {
                    if (this.files[fileName].timeout !== null) {
                        clearTimeout(this.files[fileName].timeout);
                    }
                    resolve(this.files[fileName].blurSrc[blurRadius]);
                    return;
                }
            }
            if (fileName !== '0_0') {
                this.files[fileName] = {
                    blurSrc: {},
                    location: fileLocation,
                    retries: 0,
                    size,
                    src: '',
                    timeout: null,
                };
                const getFn = () => {
                    this.getLocalFile(fileName, searchTemp, blurRadius).then((res) => {
                        resolve(res);
                    }).catch(() => {
                        this.getRemoteFile(fileLocation, md5, size, mimeType, blurRadius).then((res) => {
                            resolve(res);
                        }).catch(() => {
                            reject();
                        });
                    });
                };
                if (blurRadius) {
                    this.getLocalBlurredFile(fileName, blurRadius).then((res) => {
                        resolve(res);
                    }).catch(() => {
                        getFn();
                    });
                } else {
                    getFn();
                }
            }
        });
    }

    /* Reset retries */
    public resetRetries(id: string) {
        if (this.files.hasOwnProperty(id)) {
            this.files[id].retires = 0;
        }
    }

    /* Start cache clear timeout */
    public unmountCache(id: string, ttl?: number) {
        if (this.files.hasOwnProperty(id)) {
            this.files[id].timeout = setTimeout(() => {
                if (this.files.hasOwnProperty(id)) {
                    if (this.files[id].src !== '') {
                        URL.revokeObjectURL(this.files[id].src);
                    }
                    Object.keys(this.files[id].blurSrc).forEach((key) => {
                        URL.revokeObjectURL(this.files[id].blurSrc[key]);
                    });
                    delete this.files[id];
                }
            }, ttl !== undefined ? ttl : (C_CACHE_TTL * 1000));
        }
    }

    public swap(id: string, targetLocation: InputFileLocation.AsObject) {
        if (this.files.hasOwnProperty(id)) {
            const file = this.files[id];
            file.location = targetLocation;
            const newId = targetLocation.fileid || '';
            this.files[newId] = file;
        }
    }

    public remove(id: string) {
        this.unmountCache(id, 0);
        return this.fileRepo.remove(id);
    }

    /* Get blurred image */
    private getBlurredImage(name: string, blob: Blob, radius: number): Promise<Blob> {
        return this.fileRepo.get(this.getIdFormat(name, radius)).then((file) => {
            if (file) {
                return file.data;
            } else {
                return this.createBlurredImage(blob, radius).then((data) => {
                    this.fileRepo.createWithHash(this.getIdFormat(name, radius), data).catch(() => {
                        //
                    });
                    return data;
                });
            }
        });
    }

    /* Create blurred image */
    private createBlurredImage(blob: Blob, radius: number): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject('no ctx');
            }
            const img = new Image();
            img.onload = () => {
                ctx.canvas.height = img.height;
                ctx.canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                glur(imageData.data, img.width, img.height, radius);
                ctx.putImageData(imageData, 0, 0);
                canvas.toBlob((data) => {
                    if (data) {
                        resolve(data);
                    } else {
                        reject('cannot create blob');
                    }
                    URL.revokeObjectURL(img.src);
                    img.remove();
                }, 'image/jpeg', 0.9);
            };
            img.src = URL.createObjectURL(blob);
        });
    }

    /* Get remote file */
    private getRemoteFile(fileLoc: InputFileLocation.AsObject, md5: string, size: number, mimeType: string, blurRadius?: number): Promise<string> {
        const fileName = GetDbFileName(fileLoc.fileid, fileLoc.clusterid);
        return new Promise((resolve, reject) => {
            if (fileLoc.accesshash === '') {
                if (this.files[fileName]) {
                    this.files[fileName].retries++;
                }
                reject();
                return;
            }
            const fileLocation = new InputFileLocation();
            fileLocation.setFileid(fileLoc.fileid || '0');
            fileLocation.setAccesshash(fileLoc.accesshash || '');
            fileLocation.setClusterid(fileLoc.clusterid || 1);
            fileLocation.setVersion(fileLoc.version || 0);
            this.fileManager.receiveFile(fileLocation, md5, size, mimeType).then(() => {
                this.fileRepo.get(fileLoc.fileid || '').then((fileRes) => {
                    if (fileRes && this.files[fileName]) {
                        this.files[fileName].retries = 0;
                        if (blurRadius && fileRes.data.size > 0) {
                            this.getBlurredImage(fileName, fileRes.data, blurRadius).then((blurredBlob) => {
                                this.files[fileName].blurSrc[blurRadius] = URL.createObjectURL(blurredBlob);
                                resolve(this.files[fileName].blurSrc[blurRadius]);
                            });
                        } else {
                            this.files[fileName].src = fileRes.data.size === 0 ? '' : URL.createObjectURL(fileRes.data);
                            resolve(this.files[fileName].src);
                        }
                    } else {
                        if (this.files[fileName]) {
                            this.files[fileName].retries++;
                        }
                        reject();
                    }
                });
            }).catch(() => {
                if (this.files[fileName]) {
                    this.files[fileName].retries++;
                }
                reject();
            });
        });
    }

    /* Get local file */
    private getLocalFile(fileName: string, searchTemp?: boolean, blurRadius?: number): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.files.hasOwnProperty(fileName)) {
                this.fileRepo.get(fileName).then((fileRes) => {
                    if (fileRes) {
                        if (blurRadius && fileRes.data.size > 0) {
                            this.getBlurredImage(fileName, fileRes.data, blurRadius).then((blurredBlob) => {
                                if (this.files[fileName]) {
                                    this.files[fileName].blurSrc[blurRadius] = URL.createObjectURL(blurredBlob);
                                    resolve(this.files[fileName].blurSrc[blurRadius]);
                                } else {
                                    reject();
                                }
                            });
                        } else {
                            this.files[fileName].src = fileRes.data.size === 0 ? '' : URL.createObjectURL(fileRes.data);
                            resolve(this.files[fileName].src);
                        }
                    } else if (searchTemp) {
                        this.fileRepo.getTempsById(fileName).then((tempFileRes) => {
                            if (tempFileRes.length === 0) {
                                reject();
                            } else {
                                const blobs: Blob[] = [];
                                tempFileRes.forEach((temp) => {
                                    blobs.push(temp.data);
                                });
                                const blob = new Blob(blobs, {type: tempFileRes[0].data.type || 'application/octet-stream'});
                                if (blurRadius && blob.size > 0) {
                                    this.getBlurredImage(fileName, blob, blurRadius).then((blurredBlob) => {
                                        this.files[fileName].blurSrc[blurRadius] = URL.createObjectURL(blurredBlob);
                                        resolve(this.files[fileName].blurSrc[blurRadius]);
                                    });
                                } else {
                                    this.files[fileName].src = URL.createObjectURL(blob);
                                    resolve(this.files[fileName].src);
                                }
                            }
                        });
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

    /* Get local blurred file */
    private getLocalBlurredFile(id: string, blurRadius: number): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.files.hasOwnProperty(id)) {
                this.fileRepo.get(this.getIdFormat(id, blurRadius)).then((fileRes) => {
                    if (fileRes) {
                        this.files[id].blurSrc[blurRadius] = fileRes.data.size === 0 ? '' : URL.createObjectURL(fileRes.data);
                        resolve(this.files[id].blurSrc[blurRadius]);
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

    /* Get id with format */
    private getIdFormat(id: string, radius: number) {
        return `b_${radius}_${id}`;
    }
}
