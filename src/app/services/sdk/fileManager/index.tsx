/*
    Creation Time: 2019 - Jan - 09
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import Http from './http';
import {C_ERR, C_ERR_ITEM, C_LOCALSTORAGE, C_MSG} from '../const';
import {File, FileGet, FileSavePart} from '../messages/files_pb';
import {Bool, FileLocation, InputTeam} from '../messages/core.types_pb';
import FileRepo, {GetDbFileName, md5FromBlob} from '../../../repository/file';
import {ITempFile} from '../../../repository/file/interface';
import {C_FILE_ERR_CODE, C_FILE_ERR_NAME} from './const/const';
import {findIndex, throttle} from 'lodash';
import * as core_types_pb from '../messages/core.types_pb';
import * as Sentry from '@sentry/browser';
import {isProd} from "../../../../index";
import IframeService from "../../iframe";
import {isMobile} from "../../utilities/localize";
import Presenter from "../presenters";
import APIManager from "../index";
import {MessageContainer, MessageEnvelope} from "../messages/rony_pb";
import {EventSocketReady} from "../../events";

export interface IFileProgress {
    active?: boolean;
    download: number;
    msgId?: number;
    progress: number;
    state: 'loading' | 'complete' | 'failed';
    totalDownload: number;
    totalUpload: number;
    upload: number;
}

export interface IFileBuffer {
    cache: boolean;
    completed: boolean;
    part: number;
}

interface IChunkUpdate {
    download: number;
    downloadSize: number;
    upload: number;
    uploadSize: number;
}

interface ISendChunk {
    cancel: any;
    id: string;
    last: boolean;
    part: number;
}

interface IReceiveChunk {
    cancel: any;
    limit: number;
    offset: number;
    part: number;
}

interface IFilePromise {
    reject: any;
    resolve: any;
}

interface IChunksInfo {
    bufferCurrentPart: number;
    bufferedParts: number[];
    completed: boolean;
    doneParts: number;
    fileLocation?: core_types_pb.InputFileLocation;
    interval: any;
    md5: string;
    mimeType?: string;
    onBuffer?: (e: IFileBuffer) => void;
    onProgress?: (e: IFileProgress) => void;
    pipelines: number;
    promises: IFilePromise[];
    receiveChunks: IReceiveChunk[];
    retry: number;
    sendChunks: ISendChunk[];
    size: number;
    totalParts: number;
    updates: IChunkUpdate[];
}

interface ITempReq {
    req: FileGet;
    reqId: number;
    reject: any;
    resolve: any;
}

interface IFileBundle {
    reject: any;
    resolve: any;
    req: FileGet;
    reqId: number;
}

export const convertBlobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
    // @ts-ignore
    if (blob.arrayBuffer) {
        // @ts-ignore
        return blob.arrayBuffer();
    } else {
        return new Promise((resolve) => {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                resolve(fileReader.result as ArrayBuffer);
            };
            fileReader.readAsArrayBuffer(blob);
        });
    }
};

const C_FILE_SERVER_HTTP_WORKER_NUM = 1;
const C_MAX_UPLOAD_QUEUE_SIZE = 2;
const C_MAX_UPLOAD_PIPELINE_SIZE = 8;
const C_UPLOAD_CHUNK_SIZE = 256 * 1024;
const C_MAX_DOWNLOAD_QUEUE_SIZE = 4;
const C_MAX_INSTANT_DOWNLOAD_QUEUE_SIZE = 20;
const C_MAX_DOWNLOAD_PIPELINE_SIZE = 8;
const C_DOWNLOAD_CHUNK_SIZE = 512 * 1024;
const C_MAX_RETRIES = 63;
const C_USER_THROTTLE = true;

export default class FileManager {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new FileManager();
        }

        return this.instance;
    }

    private static instance: FileManager;

    private fileSeverInitialized: boolean = false;
    private httpWorkers: Http[] = [];
    private fileRepo: FileRepo;
    private fileUploadQueue: { [key: string]: IChunksInfo } = {};
    private fileDownloadQueue: { [key: string]: IChunksInfo } = {};
    private uploadQueue: string[] = [];
    private onWireUploads: string[] = [];
    private downloadQueue: string[] = [];
    private instantDownloadQueue: string[] = [];
    private onWireDownloads: string[] = [];
    private onWireInstantDownloads: string[] = [];
    private fileBundle: IFileBundle[] = [];
    private reqId: number = 0;
    private readonly fileGetManyThrottle: any = null;
    private apiManager: APIManager;

    public constructor() {
        if (localStorage.getItem(C_LOCALSTORAGE.ConnInfo)) {
            if (!this.fileSeverInitialized) {
                this.initFileServer();
            }
        } else {
            if (!this.fileSeverInitialized) {
                window.addEventListener(EventSocketReady, () => {
                    this.initFileServer();
                });
            }
        }
        this.fileRepo = FileRepo.getInstance();
        this.fileGetManyThrottle = throttle(this.downloadMany, 100);
        this.apiManager = APIManager.getInstance();
    }

    public setUrl(url: string) {
        this.httpWorkers.forEach((file) => {
            file.setUrl(url);
        });
    }

    public setTeam(team: InputTeam.AsObject | undefined) {
        this.httpWorkers.forEach((worker) => {
            worker.setTeam(team);
        });
    }

    public getFileLocationBySha256(blob: Blob): Promise<FileLocation.AsObject> {
        if (crypto && crypto.subtle && crypto.subtle.digest) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsArrayBuffer(blob);
                reader.onloadend = () => {
                    crypto.subtle.digest('SHA-256', reader.result as ArrayBuffer).then((sha256) => {
                        const ui8Sha256 = new Uint8Array(sha256);
                        this.apiManager.getFileBySha256(ui8Sha256, blob.size).then((fileLocation) => {
                            resolve(fileLocation);
                        }).catch((err: any) => {
                            reject(err);
                        });
                    });
                };
            });
        } else {
            return Promise.reject('sha256 is not supported');
        }
    }

    /* Send the whole file */
    public sendFile(id: string, blob: Blob, onProgress?: (e: IFileProgress) => void) {
        let internalResolve: any = null;
        let internalReject: any = null;

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        this.chunkBlob(blob).then((chunks) => {
            const saveFileToDBPromises: any[] = [];
            saveFileToDBPromises.push(md5FromBlob(blob));
            const temps: ITempFile[] = [];
            chunks.forEach((chunk, index) => {
                temps.push({
                    data: chunk,
                    id,
                    part: index + 1,
                });
            });
            if (temps.length > 0) {
                saveFileToDBPromises.push(this.fileRepo.setManyTemp(temps));
            }

            Promise.all(saveFileToDBPromises).then((arr) => {
                this.prepareUploadTransfer(id, arr.length === 0 ? '' : arr[0], chunks, blob.size, internalResolve, internalReject, onProgress);

                if (this.httpWorkers[0] && this.httpWorkers[0].isReady()) {
                    this.startUploadQueue();
                }
            }).catch((err) => {
                window.console.log(err);
            });
        });

        return promise;
    }

    /* Receive the whole file */
    public receiveFile(location: core_types_pb.InputFileLocation, md5: string, size: number, mimeType: string, onProgress?: (e: IFileProgress) => void) {
        const fileName = GetDbFileName(location.getFileid(), location.getClusterid());
        let internalResolve: any = null;
        let internalReject: any = null;

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        if (this.fileDownloadQueue.hasOwnProperty(fileName)) {
            this.fileDownloadQueue[fileName].promises.push({reject: internalReject, resolve: internalResolve});
            return promise;
        }

        const download = () => {
            this.prepareDownloadTransfer(location, md5, size, mimeType, internalResolve, internalReject, () => {
                if (this.httpWorkers[0] && this.httpWorkers[0].isReady()) {
                    if (size === 0) {
                        this.startInstanceDownloadQueue();
                    } else {
                        this.startDownloadQueue();
                    }
                }
            }, onProgress);
        };

        this.fileRepo.get(fileName).then((res) => {
            if (res) {
                if (onProgress) {
                    onProgress({
                        download: 10,
                        progress: 1,
                        state: 'complete',
                        totalDownload: 10,
                        totalUpload: 10,
                        upload: 10,
                    });
                }
                internalResolve();
            } else {
                download();
            }
        }).catch(() => {
            download();
        });

        return promise;
    }

    /* Download stream file */
    public downloadStreamFile(location: core_types_pb.InputFileLocation, md5: string, size: number, mimeType: string, onBuffer: (e: IFileBuffer) => void, onProgress?: (e: IFileProgress) => void) {
        const fileName = GetDbFileName(location.getFileid(), location.getClusterid());

        let internalResolve: any = null;
        let internalReject: any = null;

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        if (this.fileDownloadQueue.hasOwnProperty(fileName)) {
            this.fileDownloadQueue[fileName].promises.push({reject: internalReject, resolve: internalResolve});
            return promise;
        }

        const download = () => {
            this.prepareDownloadTransfer(location, md5, size, mimeType, internalResolve, internalReject, () => {
                if (this.httpWorkers[0] && this.httpWorkers[0].isReady()) {
                    this.startDownloadQueue();
                }
            }, onProgress, onBuffer);
        };

        this.fileRepo.get(fileName).then((res) => {
            if (res) {
                if (onProgress) {
                    onProgress({
                        download: 10,
                        progress: 1,
                        state: 'complete',
                        totalDownload: 10,
                        totalUpload: 10,
                        upload: 10,
                    });
                }
                onBuffer({
                    cache: true,
                    completed: true,
                    part: 0,
                });
                internalResolve();
            } else {
                download();
            }
        }).catch(() => {
            download();
        });

        return promise;
    }

    /* Retry uploading/downloading file */
    public retry(name: string, onProgress?: (e: IFileProgress) => void): Promise<any> {
        let internalResolve: any = null;
        let internalReject: any = null;

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        this.fileRepo.getTempsById(name).then((temps) => {
            if (temps && temps.length > 0) {
                let size = 0;
                const blobs = temps.map((temp) => {
                    size += temp.data.size;
                    return temp.data;
                });

                this.prepareUploadTransfer(name, '', blobs, size, internalResolve, internalReject, onProgress);

                this.startUploadQueue();
            } else {
                internalReject({
                    code: C_FILE_ERR_CODE.NO_TEMP_FILES,
                    message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.NO_TEMP_FILES],
                });
            }
        });

        return promise;
    }

    /* Cancel request */
    public cancel(id: string) {
        if (this.fileUploadQueue.hasOwnProperty(id)) {
            this.fileUploadQueue[id].sendChunks.forEach((chunk) => {
                if (chunk.cancel) {
                    chunk.cancel();
                }
            });
            this.fileUploadQueue[id].promises.forEach((promise) => {
                promise.reject({
                    code: C_FILE_ERR_CODE.REQUEST_CANCELLED,
                    message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.REQUEST_CANCELLED],
                });
            });
            this.clearUploadQueueById(id);
            delete this.fileUploadQueue[id];
        }
        if (this.fileDownloadQueue.hasOwnProperty(id)) {
            this.fileDownloadQueue[id].sendChunks.forEach((chunk) => {
                if (chunk.cancel) {
                    chunk.cancel();
                }
            });
            this.fileDownloadQueue[id].promises.forEach((promise) => {
                promise.reject({
                    code: C_FILE_ERR_CODE.REQUEST_CANCELLED,
                    message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.REQUEST_CANCELLED],
                });
            });
            this.clearDownloadQueueById(id);
            delete this.fileDownloadQueue[id];
        }
    }

    /* Start upload queue */
    private startUploadQueue() {
        if (this.onWireUploads.length < C_MAX_UPLOAD_QUEUE_SIZE && this.uploadQueue.length > 0) {
            const id = this.uploadQueue.shift();
            if (id) {
                if (this.onWireUploads.indexOf(id) === -1) {
                    this.onWireUploads.push(id);
                }
                setTimeout(() => {
                    this.startUploading(id);
                }, 1);
            }
            this.startUploadQueue();
        }
    }

    /* Start download queue */
    private startDownloadQueue() {
        if (this.onWireDownloads.length < C_MAX_DOWNLOAD_QUEUE_SIZE && this.downloadQueue.length > 0) {
            const id = this.downloadQueue.pop();
            if (id) {
                if (this.onWireDownloads.indexOf(id) === -1) {
                    this.onWireDownloads.push(id);
                }
                setTimeout(() => {
                    this.startDownloading(id);
                }, 1);
            }
            this.startDownloadQueue();
        }
    }

    private startInstanceDownloadQueue() {
        if (this.onWireInstantDownloads.length < C_MAX_INSTANT_DOWNLOAD_QUEUE_SIZE && this.instantDownloadQueue.length > 0) {
            const id = this.instantDownloadQueue.pop();
            if (id) {
                if (this.onWireInstantDownloads.indexOf(id) === -1) {
                    this.onWireInstantDownloads.push(id);
                }
                setTimeout(() => {
                    this.startDownloading(id);
                }, 1);
            }
            this.startInstanceDownloadQueue();
        }
    }

    /* Start upload for selected queue */
    private startUploading(id: string) {
        if (this.fileUploadQueue.hasOwnProperty(id)) {
            if (this.fileUploadQueue[id].retry > C_MAX_RETRIES) {
                this.clearUploadQueueById(id);
                this.fileUploadQueue[id].promises.forEach((promise) => {
                    promise.reject({
                        code: C_FILE_ERR_CODE.MAX_TRY,
                        message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.MAX_TRY],
                    });
                });
                delete this.fileUploadQueue[id];
                this.startUploadQueue();
                return;
            }
            const chunkInfo = this.fileUploadQueue[id];
            if (chunkInfo.sendChunks.length > 0) {
                let chunk = chunkInfo.sendChunks.shift();
                if (chunk) {
                    if (chunkInfo.sendChunks.length >= 1 && chunk.last) {
                        this.fileUploadQueue[id].sendChunks.push(chunk);
                        chunk = this.fileUploadQueue[id].sendChunks.shift();
                    }
                    if (chunk && chunk.last && (chunkInfo.doneParts + 1) !== chunkInfo.totalParts) {
                        this.fileUploadQueue[id].sendChunks.push(chunk);
                        chunk = undefined;
                    }
                    if (chunk) {
                        const part = chunk.part;
                        const uploadProgress = (e: any) => {
                            if (this.fileUploadQueue.hasOwnProperty(id)) {
                                const index = part - 1;
                                this.fileUploadQueue[id].updates[index].upload = e.loaded;
                                this.fileUploadQueue[id].updates[index].uploadSize = e.total;
                            }
                        };
                        const downloadProgress = (e: any) => {
                            if (this.fileUploadQueue.hasOwnProperty(id)) {
                                const index = part - 1;
                                this.fileUploadQueue[id].updates[index].download = e.loaded;
                                this.fileUploadQueue[id].updates[index].downloadSize = e.total;
                            }
                        };
                        const cancelHandler = (fn: any) => {
                            if (this.fileUploadQueue.hasOwnProperty(id)) {
                                const index = findIndex(this.fileUploadQueue[id].sendChunks, {part});
                                if (index > -1) {
                                    this.fileUploadQueue[id].sendChunks[index].cancel = fn;
                                }
                            }
                        };
                        this.fileUploadQueue[id].pipelines++;
                        this.upload(id, part, chunkInfo.totalParts, cancelHandler, uploadProgress, downloadProgress).then((res) => {
                            if (this.fileUploadQueue.hasOwnProperty(id)) {
                                this.fileUploadQueue[id].doneParts++;
                                this.fileUploadQueue[id].pipelines--;
                            }
                            this.startUploading(id);
                            if (chunk) {
                                window.console.debug(`${chunk.part}/${chunkInfo.totalParts} uploaded, res: ${res}`);
                            }
                        }).catch((err) => {
                            window.console.log(err);
                            if (this.fileUploadQueue.hasOwnProperty(id)) {
                                this.fileUploadQueue[id].pipelines--;

                                if (err.code === C_FILE_ERR_CODE.NO_WORKER) {
                                    if (chunk) {
                                        this.fileUploadQueue[id].sendChunks.unshift(chunk);
                                    }
                                    setTimeout(() => {
                                        this.startUploading(id);
                                    }, 1000);
                                } else if (err.code !== C_FILE_ERR_CODE.REQUEST_CANCELLED) {
                                    if (chunk) {
                                        this.fileUploadQueue[id].sendChunks.push(chunk);
                                        this.fileUploadQueue[id].retry++;
                                        this.startUploading(id);
                                    }
                                }
                            } else {
                                this.startUploading(id);
                            }
                        });
                    }
                }
            } else if (chunkInfo.doneParts === chunkInfo.totalParts) {
                if (this.fileUploadQueue.hasOwnProperty(id)) {
                    if (this.fileUploadQueue[id].completed) {
                        return;
                    }
                    this.fileUploadQueue[id].completed = true;
                    this.clearUploadQueueById(id);
                    this.dispatchUploadProgress(id, 'complete');
                    this.fileUploadQueue[id].promises.forEach((promise) => {
                        promise.resolve(this.fileUploadQueue[id].md5);
                    });
                    delete this.fileUploadQueue[id];
                }
                this.startUploadQueue();
            }
        }
        if (this.httpWorkers.length > 0 && this.httpWorkers[0].isReady() && this.fileUploadQueue.hasOwnProperty(id)) {
            if (this.fileUploadQueue[id].sendChunks.length > 1 && this.fileUploadQueue[id].pipelines < C_MAX_UPLOAD_PIPELINE_SIZE) {
                this.startUploading(id);
            }
        }
    }

    /* Start download for selected queue */
    private startDownloading(name: string) {
        if (this.fileDownloadQueue.hasOwnProperty(name)) {
            const chunkInfo = this.fileDownloadQueue[name];
            if (chunkInfo.retry > C_MAX_RETRIES) {
                this.clearDownloadQueueById(name);
                if (chunkInfo.promises) {
                    chunkInfo.promises.forEach((promise) => {
                        promise.reject({
                            code: C_FILE_ERR_CODE.MAX_TRY,
                            message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.MAX_TRY],
                        });
                    });
                }
                if (chunkInfo.size === 0) {
                    this.startInstanceDownloadQueue();
                } else {
                    this.startDownloadQueue();
                }
                this.cancel(name);
                return;
            }
            if (chunkInfo.receiveChunks.length > 0) {
                const chunk = chunkInfo.receiveChunks.shift();
                if (chunk) {
                    const part = chunk.part;
                    const uploadProgress = (e: any) => {
                        if (this.fileDownloadQueue.hasOwnProperty(name) && this.fileDownloadQueue[name].updates[part - 1]) {
                            const index = part - 1;
                            this.fileDownloadQueue[name].updates[index].upload = e.loaded;
                            this.fileDownloadQueue[name].updates[index].uploadSize = e.total;
                        }
                    };
                    const downloadProgress = (e: any) => {
                        if (this.fileDownloadQueue.hasOwnProperty(name) && this.fileDownloadQueue[name].updates[part - 1]) {
                            const index = part - 1;
                            this.fileDownloadQueue[name].updates[index].download = e.loaded;
                            this.fileDownloadQueue[name].updates[index].downloadSize = e.total;
                        }
                    };
                    const cancelHandler = (fn: any) => {
                        if (this.fileDownloadQueue.hasOwnProperty(name)) {
                            const index = findIndex(this.fileDownloadQueue[name].receiveChunks, {part});
                            if (index > -1) {
                                this.fileDownloadQueue[name].receiveChunks[index].cancel = fn;
                            }
                        }
                    };
                    if (chunkInfo.fileLocation) {
                        this.fileDownloadQueue[name].pipelines++;
                        this.download(chunkInfo.fileLocation, chunk.part, chunk.offset, chunk.limit, cancelHandler, uploadProgress, downloadProgress, chunkInfo.onBuffer !== undefined).then((res) => {
                            if (chunk.limit !== 0 && chunk.limit !== res && chunkInfo.fileLocation && isProd) {
                                Sentry.captureMessage(`Files' size are not match, offset: ${chunk.offset}, limit: ${chunk.limit}, size: ${res}, parts: ${chunk.part}/${chunkInfo.totalParts}, location: ${JSON.stringify(chunkInfo.fileLocation.toObject())}`, Sentry.Severity.Warning);
                            }
                            if (this.fileDownloadQueue.hasOwnProperty(name)) {
                                this.fileDownloadQueue[name].doneParts++;
                                this.fileDownloadQueue[name].pipelines--;
                            }
                            this.startDownloading(name);
                            if (chunk) {
                                window.console.debug(`${chunk.part}/${chunkInfo.totalParts} downloaded, size: ${res}`);
                            }
                        }).catch((err) => {
                            window.console.log(err, chunkInfo.fileLocation.toObject());
                            if (this.fileDownloadQueue.hasOwnProperty(name)) {
                                this.fileDownloadQueue[name].pipelines--;
                                if (err.code === C_FILE_ERR_CODE.NO_WORKER) {
                                    this.fileDownloadQueue[name].receiveChunks.unshift(chunk);
                                    setTimeout(() => {
                                        this.startDownloading(name);
                                    }, 1000);
                                } else if (err.code === C_ERR.ErrCodeUnavailable && err.items === C_ERR_ITEM.ErrItemDocument) {
                                    this.cancel(name);
                                } else if (err.code === C_ERR.ErrCodeInternal && err.items === C_ERR_ITEM.ErrItemServer) {
                                    this.cancel(name);
                                } else if (err.code !== C_FILE_ERR_CODE.REQUEST_CANCELLED) {
                                    this.fileDownloadQueue[name].receiveChunks.push(chunk);
                                    this.fileDownloadQueue[name].retry++;
                                    this.startDownloading(name);
                                }
                            } else {
                                this.startDownloading(name);
                            }
                        });
                    }
                }
            } else if (chunkInfo.doneParts === chunkInfo.totalParts) {
                if (this.fileDownloadQueue.hasOwnProperty(name)) {
                    const downloadInfo = this.fileDownloadQueue[name];
                    if (downloadInfo.completed) {
                        return;
                    }
                    const instant = downloadInfo.size === 0;
                    this.fileDownloadQueue[name].completed = true;
                    this.clearDownloadQueueById(name);
                    this.fileRepo.persistTempFiles(name, name, downloadInfo.mimeType || 'application/octet-stream', downloadInfo.onBuffer !== undefined).then((res) => {
                        if (this.fileDownloadQueue.hasOwnProperty(name)) {
                            const downloadInfo2 = this.fileDownloadQueue[name];
                            if (res && downloadInfo2.md5 && downloadInfo2.md5 !== '' && res.md5 !== '' && downloadInfo2.md5 !== res.md5) {
                                this.fileRepo.remove(name).finally(() => {
                                    downloadInfo2.promises.forEach((promise) => {
                                        promise.reject(`md5 hashes are not match. ${downloadInfo2.md5}, ${res.md5}`);
                                    });
                                    delete this.fileDownloadQueue[name];
                                });
                            } else {
                                this.dispatchDownloadProgress(name, 'complete');
                                downloadInfo2.promises.forEach((promise) => {
                                    promise.resolve();
                                });
                                delete this.fileDownloadQueue[name];
                            }
                        }
                    }).catch((err) => {
                        if (this.fileDownloadQueue.hasOwnProperty(name)) {
                            this.fileDownloadQueue[name].promises.forEach((promise) => {
                                promise.reject(err);
                            });
                            delete this.fileDownloadQueue[name];
                        }
                    });
                    if (instant) {
                        this.startInstanceDownloadQueue();
                    } else {
                        this.startDownloadQueue();
                    }
                } else {
                    this.startInstanceDownloadQueue();
                    this.startDownloadQueue();
                }
            }
        }
        if (this.httpWorkers.length > 0 && this.httpWorkers[0].isReady() && this.fileDownloadQueue.hasOwnProperty(name)) {
            if (this.fileDownloadQueue[name].receiveChunks.length > 0 && this.fileDownloadQueue[name].pipelines < C_MAX_DOWNLOAD_PIPELINE_SIZE) {
                this.startDownloading(name);
            }
        }
    }

    /* Clear upload queue by id */
    private clearUploadQueueById(id: string) {
        clearInterval(this.fileUploadQueue[id].interval);
        const index = this.uploadQueue.indexOf(id);
        if (index > -1) {
            this.uploadQueue.splice(index, 1);
        }
        const wireIndex = this.onWireUploads.indexOf(id);
        if (wireIndex > -1) {
            this.onWireUploads.splice(wireIndex, 1);
        }
    }

    /* Clear download queue by id */
    private clearDownloadQueueById(id: string) {
        if (!this.fileDownloadQueue.hasOwnProperty(id)) {
            return;
        }
        clearInterval(this.fileDownloadQueue[id].interval);
        if (this.fileDownloadQueue[id].size === 0) {
            const index = this.instantDownloadQueue.indexOf(id);
            if (index > -1) {
                this.instantDownloadQueue.splice(index, 1);
            }
            const wireIndex = this.onWireInstantDownloads.indexOf(id);
            if (wireIndex > -1) {
                this.onWireInstantDownloads.splice(wireIndex, 1);
            }
        } else {
            const index = this.downloadQueue.indexOf(id);
            if (index > -1) {
                this.downloadQueue.splice(index, 1);
            }
            const wireIndex = this.onWireDownloads.indexOf(id);
            if (wireIndex > -1) {
                this.onWireDownloads.splice(wireIndex, 1);
            }
        }
    }

    /* Upload parts */
    private upload(id: string, part: number, totalParts: number, cancel: any, onUploadProgress?: (e: any) => void, onDownloadProgress?: (e: any) => void): Promise<any> {
        return this.fileRepo.getTemp(id, part).then((blob) => {
            if (blob) {
                return this.convertBlobToU8a(blob.data).then((u8a: Uint8Array) => {
                    return this.sendFileChunk(id, part, totalParts, u8a, cancel, onUploadProgress, onDownloadProgress);
                });
            } else {
                return Promise.reject({
                    code: C_FILE_ERR_CODE.NO_TEMP_FILES,
                    message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.NO_TEMP_FILES],
                });
            }
        });
    }

    /* Download parts */
    private download(fileLocation: core_types_pb.InputFileLocation, part: number, offset: number, limit: number, cancel: any, onUploadProgress: (e: any) => void, onDownloadProgress: (e: any) => void, useBuffer: boolean): Promise<number> {
        return this.receiveFileChunk(fileLocation, offset, limit, cancel, onUploadProgress, onDownloadProgress).then((res) => {
            const fileName = GetDbFileName(fileLocation.getFileid(), fileLocation.getClusterid());
            return this.fileRepo.setTemp({
                data: new Blob([res.getBytes_asU8()]),
                id: fileName,
                modifiedtime: res.getModifiedtime(),
                part,
                type: res.getType(),
            }).then(() => {
                if (useBuffer) {
                    if (this.fileDownloadQueue.hasOwnProperty(fileName)) {
                        this.fileDownloadQueue[fileName].bufferedParts.push(part);
                    }
                    this.dispatchBuffer(fileName);
                }
                return res.getBytes_asU8().byteLength;
            });
        }).catch((err) => {
            if (err && err.constructor === C_MSG.Error) {
                return Promise.reject(err.data);
            } else {
                return Promise.reject(err);
            }
        });
    }

    /* Convert blob to Uint8array */
    private convertBlobToU8a(blob: Blob): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            if (blob.arrayBuffer) {
                blob.arrayBuffer().then((res) => {
                    resolve(new Uint8Array(res));
                });
            } else {
                const fileReader = new FileReader();
                fileReader.onload = (e: any) => {
                    if (e && e.target) {
                        resolve(new Uint8Array(e.target.result));
                    } else {
                        reject();
                    }
                };
                fileReader.readAsArrayBuffer(blob);
            }
        });
    }

    /* Dispatch upload progress */
    private dispatchUploadProgress(id: string, state: 'loading' | 'complete') {
        if (!this.fileUploadQueue.hasOwnProperty(id)) {
            return;
        }
        const queue = this.fileUploadQueue[id];
        if (!queue.onProgress) {
            return;
        }
        let download = 0;
        let upload = 0;
        let totalDownload = 0;
        queue.updates.forEach((update) => {
            upload += update.upload;
            download += update.download;
            totalDownload += update.downloadSize;
        });
        queue.onProgress({
            download,
            progress: upload / this.fileUploadQueue[id].size,
            state,
            totalDownload,
            totalUpload: this.fileUploadQueue[id].size,
            upload,
        });
    }

    /* Dispatch download progress */
    private dispatchDownloadProgress(name: string, state: 'loading' | 'complete') {
        if (!this.fileDownloadQueue.hasOwnProperty(name)) {
            return;
        }
        const queue = this.fileDownloadQueue[name];
        if (!queue.onProgress) {
            return;
        }
        let download = 0;
        let upload = 0;
        let totalUpload = 0;
        queue.updates.forEach((update) => {
            upload += update.upload;
            download += update.download;
            totalUpload += update.uploadSize;
        });

        queue.onProgress({
            download,
            progress: download / this.fileDownloadQueue[name].size,
            state,
            totalDownload: this.fileDownloadQueue[name].size,
            totalUpload,
            upload,
        });
    }

    /* Prepare upload transfer */
    private prepareUploadTransfer(id: string, md5: string, chunks: Blob[], size: number, resolve: any, reject: any, onProgress?: (e: IFileProgress) => void) {
        if (this.fileUploadQueue.hasOwnProperty(id)) {
            this.fileUploadQueue[id].onProgress = onProgress;
            this.fileUploadQueue[id].promises.push({reject, resolve});
            if (this.uploadQueue.indexOf(id) === -1) {
                this.uploadQueue.push(id);
            }
            return;
        }
        this.fileUploadQueue[id] = {
            bufferCurrentPart: 0,
            bufferedParts: [],
            completed: false,
            doneParts: 0,
            interval: null,
            md5,
            onProgress,
            pipelines: 0,
            promises: [{reject, resolve}],
            receiveChunks: [],
            retry: 0,
            sendChunks: [],
            size,
            totalParts: chunks.length,
            updates: [],
        };
        chunks.forEach((chunk, index) => {
            this.fileUploadQueue[id].sendChunks.push({
                cancel: null,
                id,
                last: (chunks.length - 1 === index),
                part: index + 1,
            });
            this.fileUploadQueue[id].updates.push({
                download: 0,
                downloadSize: 0,
                upload: 0,
                uploadSize: chunk.size,
            });
        });
        // Clear the allocated chunks in RAM
        while (chunks.length > 0) {
            chunks.pop();
        }
        if (this.uploadQueue.indexOf(id) === -1) {
            this.uploadQueue.push(id);
        }
        this.fileUploadQueue[id].interval = setInterval(() => {
            this.dispatchUploadProgress(id, 'loading');
        }, 500);
    }

    /* Prepare download transfer */
    private prepareDownloadTransfer(file: core_types_pb.InputFileLocation, md5: string, size: number, mimeType: string, resolve: any, reject: any, doneCallback: () => void, onProgress: ((e: IFileProgress) => void) | undefined, onBuffer?: (e: IFileBuffer) => void) {
        // const id = file.getFileid() || '';
        const fileName = GetDbFileName(file.getFileid(), file.getClusterid());
        if (this.fileDownloadQueue.hasOwnProperty(fileName)) {
            this.fileDownloadQueue[fileName].onProgress = onProgress;
            this.fileDownloadQueue[fileName].onBuffer = onBuffer;
            this.fileDownloadQueue[fileName].promises.push({reject, resolve});
            return;
        }
        const chunkSize = C_DOWNLOAD_CHUNK_SIZE;
        const totalParts = (size === 0) ? 1 : Math.ceil(size / chunkSize);
        const chunks: IReceiveChunk[] = [];
        const updates: IChunkUpdate[] = [];
        if (size === 0) {
            chunks.push({
                cancel: null,
                limit: 0,
                offset: 0,
                part: 1,
            });

            updates.push({
                download: 0,
                downloadSize: 3 * 1024,
                upload: 0,
                uploadSize: 0,
            });
        } else {
            for (let i = 0; i < totalParts; i++) {
                let limit = chunkSize;
                if (i === (totalParts - 1)) {
                    limit = (size - ((totalParts - 1) * chunkSize));
                }
                chunks.push({
                    cancel: null,
                    limit,
                    offset: i * chunkSize,
                    part: i + 1,
                });

                updates.push({
                    download: 0,
                    downloadSize: limit,
                    upload: 0,
                    uploadSize: 0,
                });
            }
        }
        this.fileDownloadQueue[fileName] = {
            bufferCurrentPart: 0,
            bufferedParts: [],
            completed: false,
            doneParts: 0,
            fileLocation: file,
            interval: null,
            md5,
            mimeType,
            onBuffer,
            onProgress,
            pipelines: 0,
            promises: [{reject, resolve}],
            receiveChunks: chunks,
            retry: 0,
            sendChunks: [],
            size,
            totalParts,
            updates,
        };
        this.fileRepo.getTempsById(fileName).then((res) => {
            res.forEach((temp) => {
                const index = findIndex(this.fileDownloadQueue[fileName].receiveChunks, {part: temp.part});
                if (index > -1) {
                    this.fileDownloadQueue[fileName].receiveChunks.splice(index, 1);
                    this.fileDownloadQueue[fileName].updates[temp.part - 1] = {
                        download: temp.data.size,
                        downloadSize: temp.data.size,
                        upload: 100,
                        uploadSize: 100,
                    };
                    this.fileDownloadQueue[fileName].doneParts++;
                    if (this.fileDownloadQueue[fileName].onBuffer !== undefined) {
                        this.fileDownloadQueue[fileName].bufferedParts.push(temp.part);
                    }
                }
            });
            if (size === 0) {
                if (this.instantDownloadQueue.indexOf(fileName) === -1) {
                    this.instantDownloadQueue.push(fileName);
                }
            } else {
                if (this.downloadQueue.indexOf(fileName) === -1) {
                    this.downloadQueue.push(fileName);
                }
            }
            if (this.fileDownloadQueue[fileName].onBuffer !== undefined && res.length > 0) {
                this.dispatchBuffer(fileName);
            }
            doneCallback();
        }).catch(() => {
            if (size === 0) {
                if (this.instantDownloadQueue.indexOf(fileName) === -1) {
                    this.instantDownloadQueue.push(fileName);
                }
            } else {
                if (this.downloadQueue.indexOf(fileName) === -1) {
                    this.downloadQueue.push(fileName);
                }
            }
            doneCallback();
        });
        this.fileDownloadQueue[fileName].interval = setInterval(() => {
            this.dispatchDownloadProgress(fileName, 'loading');
        }, 500);
    }

    /* Send chunk over http */
    private sendFileChunk(id: string, partNum: number, totalParts: number, bytes: Uint8Array, cancel: any, onUploadProgress?: (e: any) => void, onDownloadProgress?: (e: any) => void): Promise<Bool> {
        if (this.httpWorkers.length === 0 || !this.httpWorkers[0].isReady()) {
            return Promise.reject({
                code: C_FILE_ERR_CODE.NO_WORKER,
                message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.NO_WORKER],
            });
        }
        const data = new FileSavePart();
        data.setFileid(id);
        data.setPartid(partNum);
        data.setTotalparts(totalParts);
        data.setBytes(bytes);
        return this.httpWorkers[0].send(C_MSG.FileSavePart, data.serializeBinary(), cancel, onUploadProgress, onDownloadProgress).then((res) => {
            return res.data as Bool;
        });
    }

    /* Receive chunk over http */
    private receiveFileChunk(location: core_types_pb.InputFileLocation, offset: number, limit: number, cancel: any, onUploadProgress?: (e: any) => void, onDownloadProgress?: (e: any) => void): Promise<File> {
        if (this.httpWorkers.length === 0 || (this.httpWorkers.length >= 0 && !this.httpWorkers[0].isReady())) {
            return Promise.reject({
                code: C_FILE_ERR_CODE.NO_WORKER,
                message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.NO_WORKER],
            });
        }
        const data = new FileGet();
        data.setOffset(offset);
        data.setLimit(limit);
        data.setLocation(location);
        if (C_USER_THROTTLE && offset === 0 && limit === 0) {
            return this.receiveBundleFileChunk(data);
        } else {
            return this.httpWorkers[0].send(C_MSG.FileGet, data.serializeBinary(), cancel, onUploadProgress, onDownloadProgress).then((res) => {
                return res.data as File;
            });
        }
    }

    /* Receive bundle chunk over http */
    private receiveBundleFileChunk(file: FileGet) {
        let internalResolve = null;
        let internalReject = null;

        const promise = new Promise<any>((res, rej) => {
            internalResolve = res;
            internalReject = rej;

            this.reqId++;
            this.fileBundle.push({
                reject: internalReject,
                req: file,
                reqId: this.reqId,
                resolve: internalResolve,
            });

            setTimeout(() => {
                this.fileGetManyThrottle();
            }, 50);
        });

        return promise;
    }

    /* Download many files */
    private downloadMany = () => {
        if (this.fileBundle.length === 0) {
            return;
        }
        const tempInputs: { [key: number]: ITempReq } = {};
        const limits: boolean[] = [];
        while (this.fileBundle.length && limits.length < C_MAX_INSTANT_DOWNLOAD_QUEUE_SIZE) {
            const file = this.fileBundle.shift();
            if (file) {
                tempInputs[file.reqId] = {
                    reject: file.reject,
                    req: file.req,
                    reqId: file.reqId,
                    resolve: file.resolve,
                };
                limits.push(true);
            } else {
                break;
            }
        }

        const len = limits.length;

        const data = new MessageContainer();
        // tslint:disable-next-line:forin
        for (const key in tempInputs) {
            const t = tempInputs[key];
            const me = new MessageEnvelope();
            me.setConstructor(C_MSG.FileGet);
            me.setMessage(t.req.serializeBinary());
            me.setRequestid(t.reqId);

            data.addEnvelopes(me);
        }
        data.setLength(len);


        this.httpWorkers[0].send(C_MSG.MessageContainer, data.serializeBinary()).then((res) => {
            if (res.constructor === C_MSG.File) {
                if (len !== 1) {
                    throw Error('please check rony http dispatcher');
                } else {
                    const ri = data.getEnvelopesList()[0].getRequestid();
                    if (tempInputs[ri] && tempInputs[ri].resolve) {
                        tempInputs[ri].resolve(res.data);
                    }
                }
            } else if (res.constructor === C_MSG.MessageContainer) {
                (res.data as MessageContainer).getEnvelopesList().forEach((msgEnv) => {
                    const c = msgEnv.getConstructor() || 0;
                    const ri = msgEnv.getRequestid() || 0;
                    const msg = Presenter.getMessage(c, msgEnv.getMessage_asU8());
                    if (c === C_MSG.File) {
                        if (tempInputs[ri] && tempInputs[ri].resolve) {
                            tempInputs[ri].resolve(msg);
                        }
                    } else if (c === C_MSG.Error) {
                        if (tempInputs[ri] && tempInputs[ri].reject) {
                            tempInputs[ri].reject(msg.toObject());
                        }
                    }
                });
            }
        }).catch((err) => {
            // tslint:disable-next-line:forin
            for (const key in tempInputs) {
                if (tempInputs[key].reject) {
                    tempInputs[key].reject(err);
                }
            }
        });
    }

    /* Chunk File */
    private chunkBlob(blob: Blob): Promise<Blob[]> {
        return new Promise<Blob[]>((resolve) => {
            const chunks: Blob[] = [];
            const chunkSize = C_UPLOAD_CHUNK_SIZE;
            for (let offset = 0; offset < blob.size; offset += chunkSize) {
                chunks.push(blob.slice(offset, offset + chunkSize));
            }
            resolve(chunks);
        });
    }

    /* Init file manager WASM worker */
    private initFileServer() {
        this.fileSeverInitialized = true;
        setTimeout(() => {
            if ((isMobile() && IframeService.getInstance().isActive()) || !navigator.userAgent.search("Chrome")) {
                this.httpWorkers[0] = new Http(true, 1);
                this.httpWorkers[0].ready(() => {
                    this.startDownloadQueue();
                    this.startInstanceDownloadQueue();
                    this.startUploadQueue();
                    window.console.log(`Http shared worker is attached`);
                });
            } else {
                for (let i = 0; i < C_FILE_SERVER_HTTP_WORKER_NUM; i++) {
                    this.httpWorkers[i] = new Http(false, i + 1);
                    this.httpWorkers[i].ready(() => {
                        this.startDownloadQueue();
                        this.startInstanceDownloadQueue();
                        this.startUploadQueue();
                        window.console.log(`Http WASM worker ${i} is ready`);
                    });
                }
            }
        }, 110);
    }

    private dispatchBuffer(name: string) {
        if (this.fileDownloadQueue.hasOwnProperty(name)) {
            const fileInfo = this.fileDownloadQueue[name];
            const parts = fileInfo.bufferedParts.sort((i1, i2) => i1 - i2);
            if (parts.length > 0) {
                while (true) {
                    const part = parts[0];
                    if (fileInfo.bufferCurrentPart + 1 === part) {
                        if (fileInfo.onBuffer) {
                            fileInfo.onBuffer({
                                cache: false,
                                completed: (fileInfo.totalParts === part),
                                part,
                            });
                        }
                        if (this.fileDownloadQueue.hasOwnProperty(name)) {
                            this.fileDownloadQueue[name].bufferCurrentPart = part;
                        }
                        fileInfo.bufferedParts.shift();
                        if (fileInfo.bufferedParts.length === 0) {
                            break;
                        }
                    } else {
                        break;
                    }
                }
            }
        }
    }
}
