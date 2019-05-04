/*
    Creation Time: 2019 - Jan - 30
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import FileManager from '../sdk/fileManager/index';
import {InputFileLocation} from '../sdk/messages/chat.core.types_pb';
import FileRepo from '../../repository/file/index';
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
    public getFile(fileLocation: InputFileLocation.AsObject, size: number, searchTemp?: boolean, blurRadius?: number): Promise<string> {
        const id = fileLocation.fileid || '';
        return new Promise((resolve, reject) => {
            if (this.files.hasOwnProperty(id)) {
                if (this.files[id].retries > C_MAX_RETRY) {
                    reject();
                    return;
                }
                if (!blurRadius && this.files[id].src !== '') {
                    if (this.files[id].timeout !== null) {
                        clearTimeout(this.files[id].timeout);
                    }
                    resolve(this.files[id].src);
                    return;
                } else if (blurRadius && this.files[id].blurSrc.hasOwnProperty(blurRadius)) {
                    if (this.files[id].timeout !== null) {
                        clearTimeout(this.files[id].timeout);
                    }
                    resolve(this.files[id].blurSrc[blurRadius]);
                    return;
                }
            }
            if (id !== '0') {
                this.files[id] = {
                    blurSrc: {},
                    location: fileLocation,
                    retries: 0,
                    size,
                    src: '',
                    timeout: null,
                };
                const getFn = () => {
                    this.getLocalFile(id, searchTemp, blurRadius).then((res) => {
                        resolve(res);
                    }).catch(() => {
                        this.getRemoteFile(fileLocation, size, blurRadius).then((res) => {
                            resolve(res);
                        }).catch(() => {
                            reject();
                        });
                    });
                };
                if (blurRadius) {
                    this.getLocalBlurredFile(id, blurRadius).then((res) => {
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
    public unmountCache(id: string) {
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
            }, C_CACHE_TTL * 1000);
        }
    }

    /* Get blurred image */
    private getBlurredImage(id: string, blob: Blob, radius: number): Promise<Blob> {
        return this.fileRepo.get(this.getIdFormat(id, radius)).then((file) => {
            if (file) {
                return file.data;
            } else {
                return this.createBlurredImage(blob, radius).then((data) => {
                    this.fileRepo.createWithHash(this.getIdFormat(id, radius), data).catch(() => {
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
    private getRemoteFile(fileLoc: InputFileLocation.AsObject, size: number, blurRadius?: number): Promise<string> {
        const id = fileLoc.fileid || '';
        return new Promise((resolve, reject) => {
            const fileLocation = new InputFileLocation();
            fileLocation.setFileid(id);
            fileLocation.setAccesshash(fileLoc.accesshash || '');
            fileLocation.setClusterid(fileLoc.clusterid || 1);
            fileLocation.setVersion(fileLoc.version || 0);
            this.fileManager.receiveFile(fileLocation, size, 'image/jpeg').then(() => {
                this.fileRepo.get(fileLoc.fileid || '').then((fileRes) => {
                    if (fileRes && this.files[id]) {
                        this.files[id].retries = 0;
                        if (blurRadius && fileRes.data.size > 0) {
                            this.getBlurredImage(id, fileRes.data, blurRadius).then((blurredBlob) => {
                                this.files[id].blurSrc[blurRadius] = URL.createObjectURL(blurredBlob);
                                resolve(this.files[id].blurSrc[blurRadius]);
                            });
                        } else {
                            this.files[id].src = fileRes.data.size === 0 ? '' : URL.createObjectURL(fileRes.data);
                            resolve(this.files[id].src);
                        }
                    } else {
                        if (this.files[id]) {
                            this.files[id].retries++;
                        }
                        reject();
                    }
                });
            }).catch(() => {
                if (this.files[id]) {
                    this.files[id].retries++;
                }
                reject();
            });
        });
    }

    /* Get local file */
    private getLocalFile(id: string, searchTemp?: boolean, blurRadius?: number): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.files.hasOwnProperty(id)) {
                this.fileRepo.get(id).then((fileRes) => {
                    if (fileRes) {
                        if (blurRadius && fileRes.data.size > 0) {
                            this.getBlurredImage(id, fileRes.data, blurRadius).then((blurredBlob) => {
                                this.files[id].blurSrc[blurRadius] = URL.createObjectURL(blurredBlob);
                                resolve(this.files[id].blurSrc[blurRadius]);
                            });
                        } else {
                            this.files[id].src = fileRes.data.size === 0 ? '' : URL.createObjectURL(fileRes.data);
                            resolve(this.files[id].src);
                        }
                    } else if (searchTemp) {
                        this.fileRepo.getTempsById(id).then((tempFileRes) => {
                            if (tempFileRes.length === 0) {
                                reject();
                            } else {
                                const blobs: Blob[] = [];
                                tempFileRes.forEach((temp) => {
                                    blobs.push(temp.data);
                                });
                                const blob = new Blob(blobs, {type: tempFileRes[0].data.type || 'application/octet-stream'});
                                this.files[id].src = URL.createObjectURL(blob);
                                resolve(this.files[id].src);
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
