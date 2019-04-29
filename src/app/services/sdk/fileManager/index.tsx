/*
    Creation Time: 2019 - Jan - 09
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import Http from './http';
import {C_MSG} from '../const';
import {File, FileGet, FileSavePart} from '../messages/chat.api.files_pb';
import {Bool} from '../messages/chat.core.types_pb';
import FileRepo from '../../../repository/file';
import {ITempFile} from '../../../repository/file/interface';
import {C_FILE_ERR_CODE, C_FILE_ERR_NAME} from './const/const';
import {findIndex} from 'lodash';
import * as core_types_pb from '../messages/chat.core.types_pb';

export interface IFileProgress {
    active?: boolean;
    download: number;
    state: 'loading' | 'complete' | 'failed';
    totalDownload: number;
    totalUpload: number;
    upload: number;
    progress: number;
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

interface IChunksInfo {
    completed: boolean;
    doneParts: number;
    fileLocation?: core_types_pb.InputFileLocation;
    interval: any;
    mimeType?: string;
    onProgress?: (e: IFileProgress) => void;
    pipelines: number;
    receiveChunks: IReceiveChunk[];
    reject: any;
    resolve: any;
    retry: number;
    sendChunks: ISendChunk[];
    size: number;
    totalParts: number;
    updates: IChunkUpdate[];
    upload: boolean;
}

const C_FILE_SERVER_HTTP_WORKER_NUM = 2;
const C_MAX_UPLOAD_QUEUE_SIZE = 2;
const C_MAX_UPLOAD_PIPELINE_SIZE = 4;
const C_UPLOAD_CHUNK_SIZE = 256 * 1024;
const C_MAX_DOWNLOAD_QUEUE_SIZE = 4;
const C_MAX_DOWNLOAD_PIPELINE_SIZE = 4;
const C_DOWNLOAD_CHUNK_SIZE = 256 * 1024;
const C_MAX_RETRIES = 10;

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
    private fileTransferQueue: { [key: string]: IChunksInfo } = {};
    private uploadQueue: string[] = [];
    private onWireUploads: string[] = [];
    private downloadQueue: string[] = [];
    private onWireDownloads: string[] = [];

    public constructor() {
        if (localStorage.getItem('river.conn.info')) {
            if (!this.fileSeverInitialized) {
                this.initFileServer();
            }
        } else {
            if (!this.fileSeverInitialized) {
                window.addEventListener('fnStarted', () => {
                    this.initFileServer();
                });
            }
        }
        this.fileRepo = FileRepo.getInstance();
    }

    /* Send the whole file */
    public sendFile(id: string, blob: Blob, onProgress?: (e: IFileProgress) => void) {
        const chunks = this.chunkBlob(blob);
        const saveFileToDBPromises: any[] = [];
        chunks.forEach((chunk, index) => {
            const temp: ITempFile = {
                data: chunk,
                id,
                part: index + 1,
            };
            saveFileToDBPromises.push(this.fileRepo.setTemp(temp));
        });

        return Promise.all(saveFileToDBPromises).then(() => {
            let internalResolve = null;
            let internalReject = null;

            const promise = new Promise((res, rej) => {
                internalResolve = res;
                internalReject = rej;
            });

            this.prepareUploadTransfer(id, chunks, blob.size, internalResolve, internalReject, onProgress);

            if (this.httpWorkers[0] && this.httpWorkers[0].isReady()) {
                this.startUploadQueue();
            }

            return promise;
        });
    }

    /* Receive the whole file */
    public receiveFile(location: core_types_pb.InputFileLocation, size: number, mimeType: string, onProgress?: (e: IFileProgress) => void) {
        let internalResolve: any = null;
        let internalReject: any = null;

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        const download = () => {
            this.prepareDownloadTransfer(location, size, mimeType, internalResolve, internalReject, () => {
                if (this.httpWorkers[1] && this.httpWorkers[1].isReady()) {
                    this.startDownloadQueue();
                }
            }, onProgress);
        };

        this.fileRepo.get(location.getFileid() || '').then((res) => {
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

    /* Retry uploading/downloading file */
    public retry(id: string, onProgress?: (e: IFileProgress) => void): Promise<any> {
        return this.fileRepo.getTempsById(id).then((temps) => {
            if (temps.length > 0) {
                let internalResolve = null;
                let internalReject = null;

                const promise = new Promise((res, rej) => {
                    internalResolve = res;
                    internalReject = rej;
                });

                let size = 0;
                const blobs = temps.map((temp) => {
                    size += temp.data.size;
                    return temp.data;
                });

                this.prepareUploadTransfer(id, blobs, size, internalResolve, internalReject, onProgress);

                this.startUploadQueue();

                return promise;
            } else {
                return Promise.reject({
                    code: C_FILE_ERR_CODE.NO_TEMP_FILES,
                    message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.NO_TEMP_FILES],
                });
            }
        });
    }

    /* Cancel request */
    public cancel(id: string) {
        if (this.fileTransferQueue.hasOwnProperty(id)) {
            this.fileTransferQueue[id].sendChunks.forEach((chunk) => {
                if (chunk.cancel) {
                    chunk.cancel();
                }
            });
            this.fileTransferQueue[id].reject({
                code: C_FILE_ERR_CODE.REQUEST_CANCELLED,
                message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.REQUEST_CANCELLED],
            });
            if (this.fileTransferQueue[id].upload) {
                this.clearUploadQueueById(id);
            } else {
                this.clearDownloadQueueById(id);
            }
            delete this.fileTransferQueue[id];
        }
    }

    /* Start upload queue */
    private startUploadQueue() {
        if (this.onWireUploads.length < C_MAX_UPLOAD_QUEUE_SIZE && this.uploadQueue.length > 0) {
            const id = this.uploadQueue.shift();
            if (id) {
                this.onWireUploads.push(id);
                this.startUploading(id);
            }
            this.startUploadQueue();
        }
    }

    /* Start download queue */
    private startDownloadQueue() {
        if (this.onWireUploads.length < C_MAX_DOWNLOAD_QUEUE_SIZE && this.downloadQueue.length > 0) {
            const id = this.downloadQueue.shift();
            if (id) {
                this.onWireDownloads.push(id);
                this.startDownloading(id);
            }
            this.startDownloadQueue();
        }
    }

    /* Start upload for selected queue */
    private startUploading(id: string) {
        if (this.fileTransferQueue.hasOwnProperty(id)) {
            if (this.fileTransferQueue[id].retry > C_MAX_RETRIES) {
                this.clearUploadQueueById(id);
                this.fileTransferQueue[id].reject({
                    code: C_FILE_ERR_CODE.MAX_TRY,
                    message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.MAX_TRY],
                });
                this.startUploadQueue();
                return;
            }
            const chunkInfo = this.fileTransferQueue[id];
            if (chunkInfo.sendChunks.length > 0) {
                let chunk = chunkInfo.sendChunks.shift();
                if (chunk) {
                    if (chunkInfo.sendChunks.length >= 1 && chunk.last) {
                        this.fileTransferQueue[id].sendChunks.push(chunk);
                        chunk = this.fileTransferQueue[id].sendChunks.shift();
                    }
                    if (chunk) {
                        const part = chunk.part;
                        const uploadProgress = (e: any) => {
                            if (this.fileTransferQueue.hasOwnProperty(id)) {
                                const index = part - 1;
                                this.fileTransferQueue[id].updates[index].upload = e.loaded;
                                this.fileTransferQueue[id].updates[index].uploadSize = e.total;
                            }
                        };
                        const downloadProgress = (e: any) => {
                            if (this.fileTransferQueue.hasOwnProperty(id)) {
                                const index = part - 1;
                                this.fileTransferQueue[id].updates[index].download = e.loaded;
                                this.fileTransferQueue[id].updates[index].downloadSize = e.total;
                            }
                        };
                        const cancelHandler = (fn: any) => {
                            if (this.fileTransferQueue.hasOwnProperty(id)) {
                                const index = findIndex(this.fileTransferQueue[id].sendChunks, {part});
                                if (index > -1) {
                                    this.fileTransferQueue[id].sendChunks[index].cancel = fn;
                                }
                            }
                        };
                        this.fileTransferQueue[id].pipelines++;
                        this.upload(id, part, chunkInfo.totalParts, cancelHandler, uploadProgress, downloadProgress).then((res) => {
                            if (this.fileTransferQueue.hasOwnProperty(id)) {
                                this.fileTransferQueue[id].doneParts++;
                                this.fileTransferQueue[id].pipelines--;
                            }
                            this.startUploading(id);
                        }).catch((err) => {
                            if (this.fileTransferQueue.hasOwnProperty(id)) {
                                this.fileTransferQueue[id].pipelines--;

                                if (err.code === C_FILE_ERR_CODE.NO_WORKER) {
                                    if (chunk) {
                                        this.fileTransferQueue[id].sendChunks.unshift(chunk);
                                    }
                                    setTimeout(() => {
                                        this.startUploading(id);
                                    }, 1000);
                                } else if (err.code !== C_FILE_ERR_CODE.REQUEST_CANCELLED) {
                                    if (chunk) {
                                        this.fileTransferQueue[id].sendChunks.push(chunk);
                                        this.fileTransferQueue[id].retry++;
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
                if (this.fileTransferQueue.hasOwnProperty(id)) {
                    if (this.fileTransferQueue[id].completed) {
                        return;
                    }
                    this.fileTransferQueue[id].completed = true;
                    this.clearUploadQueueById(id);
                    this.dispatchProgress(id, 'complete');
                    this.fileTransferQueue[id].resolve();
                    delete this.fileTransferQueue[id];
                }
                this.startUploadQueue();
            }
        }
        if (this.httpWorkers.length > 1 && this.httpWorkers[1].isReady() && this.fileTransferQueue.hasOwnProperty(id)) {
            if (this.fileTransferQueue[id].sendChunks.length > 1 && this.fileTransferQueue[id].pipelines < C_MAX_UPLOAD_PIPELINE_SIZE) {
                this.startUploading(id);
            }
        }
    }

    /* Start download for selected queue */
    private startDownloading(id: string) {
        if (this.fileTransferQueue.hasOwnProperty(id)) {
            if (this.fileTransferQueue[id].retry > C_MAX_RETRIES) {
                this.clearDownloadQueueById(id);
                this.fileTransferQueue[id].reject({
                    code: C_FILE_ERR_CODE.MAX_TRY,
                    message: C_FILE_ERR_NAME[C_FILE_ERR_CODE.MAX_TRY],
                });
                this.startDownloadQueue();
                return;
            }
            const chunkInfo = this.fileTransferQueue[id];
            if (chunkInfo.receiveChunks.length > 0) {
                const chunk = chunkInfo.receiveChunks.shift();
                if (chunk) {
                    const part = chunk.part;
                    const uploadProgress = (e: any) => {
                        if (this.fileTransferQueue.hasOwnProperty(id) && this.fileTransferQueue[id].updates[part - 1]) {
                            const index = part - 1;
                            this.fileTransferQueue[id].updates[index].upload = e.loaded;
                            this.fileTransferQueue[id].updates[index].uploadSize = e.total;
                        }
                    };
                    const downloadProgress = (e: any) => {
                        if (this.fileTransferQueue.hasOwnProperty(id) && this.fileTransferQueue[id].updates[part - 1]) {
                            const index = part - 1;
                            this.fileTransferQueue[id].updates[index].download = e.loaded;
                            this.fileTransferQueue[id].updates[index].downloadSize = e.total;
                        }
                    };
                    const cancelHandler = (fn: any) => {
                        if (this.fileTransferQueue.hasOwnProperty(id)) {
                            const index = findIndex(this.fileTransferQueue[id].receiveChunks, {part});
                            if (index > -1) {
                                this.fileTransferQueue[id].receiveChunks[index].cancel = fn;
                            }
                        }
                    };
                    if (chunkInfo.fileLocation) {
                        this.fileTransferQueue[id].pipelines++;
                        this.download(chunkInfo.fileLocation, chunk.part, chunk.offset, chunk.limit, cancelHandler, uploadProgress, downloadProgress).then((res) => {
                            if (this.fileTransferQueue.hasOwnProperty(id)) {
                                this.fileTransferQueue[id].doneParts++;
                                this.fileTransferQueue[id].pipelines--;
                            }
                            this.startDownloading(id);
                        }).catch((err) => {
                            if (this.fileTransferQueue.hasOwnProperty(id)) {
                                this.fileTransferQueue[id].pipelines--;
                                if (err.code === C_FILE_ERR_CODE.NO_WORKER) {
                                    this.fileTransferQueue[id].receiveChunks.unshift(chunk);
                                    setTimeout(() => {
                                        this.startDownloading(id);
                                    }, 1000);
                                } else if (err.code === 'E00' && err.items === 'not found') {
                                    this.cancel(id);
                                } else if (err.code !== C_FILE_ERR_CODE.REQUEST_CANCELLED) {
                                    this.fileTransferQueue[id].receiveChunks.push(chunk);
                                    this.fileTransferQueue[id].retry++;
                                    this.startDownloading(id);
                                }
                            } else {
                                this.startDownloading(id);
                            }
                        });
                    }
                }
            } else if (chunkInfo.doneParts === chunkInfo.totalParts) {
                if (this.fileTransferQueue.hasOwnProperty(id)) {
                    if (this.fileTransferQueue[id].completed) {
                        return;
                    }
                    this.fileTransferQueue[id].completed = true;
                    this.clearDownloadQueueById(id);
                    this.dispatchProgress(id, 'complete');
                    this.fileRepo.persistTempFiles(id, id, this.fileTransferQueue[id].mimeType || 'application/octet-stream').then(() => {
                        if (this.fileTransferQueue.hasOwnProperty(id)) {
                            this.fileTransferQueue[id].resolve();
                            delete this.fileTransferQueue[id];
                        }
                    }).catch((err) => {
                        if (this.fileTransferQueue.hasOwnProperty(id)) {
                            this.fileTransferQueue[id].reject(err);
                            delete this.fileTransferQueue[id];
                        }
                    });
                }
                this.startDownloadQueue();
            }
        }
        if (this.httpWorkers.length > 0 && this.httpWorkers[0].isReady() && this.fileTransferQueue.hasOwnProperty(id)) {
            if (this.fileTransferQueue[id].receiveChunks.length > 0 && this.fileTransferQueue[id].pipelines < C_MAX_DOWNLOAD_PIPELINE_SIZE) {
                this.startDownloading(id);
            }
        }
    }

    /* Clear upload queue by id */
    private clearUploadQueueById(id: string) {
        clearInterval(this.fileTransferQueue[id].interval);
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
        clearInterval(this.fileTransferQueue[id].interval);
        const index = this.downloadQueue.indexOf(id);
        if (index > -1) {
            this.downloadQueue.splice(index, 1);
        }
        const wireIndex = this.onWireDownloads.indexOf(id);
        if (wireIndex > -1) {
            this.onWireDownloads.splice(wireIndex, 1);
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
                return Promise.reject();
            }
        });
    }

    /* Download parts */
    private download(fileLocation: core_types_pb.InputFileLocation, part: number, offset: number, limit: number, cancel: any, onUploadProgress?: (e: any) => void, onDownloadProgress?: (e: any) => void): Promise<number> {
        return this.receiveFileChunk(fileLocation, offset, limit, cancel, onUploadProgress, onDownloadProgress).then((res) => {
            return this.fileRepo.setTemp({
                data: new Blob([res.getBytes_asU8()]),
                id: fileLocation.getFileid() || '',
                modifiedtime: res.getModifiedtime(),
                part,
                type: res.getType(),
            }).then(() => {
                return res.getBytes_asU8().byteLength;
            });
        });
    }

    /* Convert blob to Uint8array */
    private convertBlobToU8a(blob: Blob): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = (e: any) => {
                if (e && e.target) {
                    resolve(e.target.result);
                } else {
                    reject();
                }
            };
            fileReader.readAsArrayBuffer(blob);
        });
    }

    /* Dispatch progress */
    private dispatchProgress(id: string, state: 'loading' | 'complete') {
        if (!this.fileTransferQueue.hasOwnProperty(id)) {
            return;
        }
        const queue = this.fileTransferQueue[id];
        if (!queue.onProgress) {
            return;
        }
        let download = 0;
        let upload = 0;
        let totalDownload = 0;
        let totalUpload = 0;
        queue.updates.forEach((update) => {
            upload += update.upload;
            download += update.download;
            totalDownload += update.downloadSize;
            totalUpload += update.uploadSize;
        });
        if (queue.upload) {
            queue.onProgress({
                download,
                progress: upload / this.fileTransferQueue[id].size,
                state,
                totalDownload,
                totalUpload: this.fileTransferQueue[id].size,
                upload,
            });
        } else {
            queue.onProgress({
                download,
                progress: download / this.fileTransferQueue[id].size,
                state,
                totalDownload: this.fileTransferQueue[id].size,
                totalUpload,
                upload,
            });
        }
    }

    /* Prepare upload transfer */
    private prepareUploadTransfer(id: string, chunks: Blob[], size: number, resolve: any, reject: any, onProgress?: (e: IFileProgress) => void) {
        this.fileTransferQueue[id] = {
            completed: false,
            doneParts: 0,
            interval: null,
            onProgress,
            pipelines: 0,
            receiveChunks: [],
            reject,
            resolve,
            retry: 0,
            sendChunks: [],
            size,
            totalParts: chunks.length,
            updates: [],
            upload: true,
        };
        chunks.forEach((chunk, index) => {
            this.fileTransferQueue[id].sendChunks.push({
                cancel: null,
                id,
                last: (chunks.length - 1 === index),
                part: index + 1,
            });
            this.fileTransferQueue[id].updates.push({
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
        this.uploadQueue.push(id);
        this.fileTransferQueue[id].interval = setInterval(() => {
            this.dispatchProgress(id, 'loading');
        }, 500);
    }

    /* Prepare download transfer */
    private prepareDownloadTransfer(file: core_types_pb.InputFileLocation, size: number, mimeType: string, resolve: any, reject: any, doneCallback: () => void, onProgress?: (e: IFileProgress) => void) {
        const id = file.getFileid() || '';
        const totalParts = (size === 0) ? 1 : Math.ceil(size / C_DOWNLOAD_CHUNK_SIZE);
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
                let limit = C_DOWNLOAD_CHUNK_SIZE;
                if (i === (totalParts - 1)) {
                    limit = (size - ((totalParts - 1) * C_DOWNLOAD_CHUNK_SIZE));
                }
                chunks.push({
                    cancel: null,
                    limit,
                    offset: i * C_DOWNLOAD_CHUNK_SIZE,
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
        this.fileTransferQueue[id] = {
            completed: false,
            doneParts: 0,
            fileLocation: file,
            interval: null,
            mimeType,
            onProgress,
            pipelines: 0,
            receiveChunks: chunks,
            reject,
            resolve,
            retry: 0,
            sendChunks: [],
            size,
            totalParts,
            updates,
            upload: false,
        };
        this.fileRepo.getTempsById(id).then((res) => {
            res.forEach((temp) => {
                const index = findIndex(this.fileTransferQueue[id].receiveChunks, {part: temp.part});
                if (index > -1) {
                    this.fileTransferQueue[id].receiveChunks.splice(index, 1);
                    this.fileTransferQueue[id].updates[temp.part - 1] = {
                        download: temp.data.size,
                        downloadSize: temp.data.size,
                        upload: 100,
                        uploadSize: 100,
                    };
                    this.fileTransferQueue[id].doneParts++;
                }
            });
            this.downloadQueue.push(id);
            doneCallback();
        }).catch(() => {
            this.downloadQueue.push(id);
            doneCallback();
        });
        this.fileTransferQueue[id].interval = setInterval(() => {
            this.dispatchProgress(id, 'loading');
        }, 500);
    }

    /* Send chunk over http */
    private sendFileChunk(id: string, partNum: number, totalParts: number, bytes: Uint8Array, cancel: any, onUploadProgress?: (e: any) => void, onDownloadProgress?: (e: any) => void): Promise<Bool> {
        if (this.httpWorkers.length === 0 || (this.httpWorkers.length >= 1 && !this.httpWorkers[1].isReady())) {
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
        return this.httpWorkers[1].send(C_MSG.FileSavePart, data.serializeBinary(), cancel, onUploadProgress, onDownloadProgress);
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
        return this.httpWorkers[0].send(C_MSG.FileGet, data.serializeBinary(), cancel, onUploadProgress, onDownloadProgress);
    }

    /* Chunk File */
    private chunkBlob(blob: Blob): Blob[] {
        const chunks: Blob[] = [];
        const chunkSize = C_UPLOAD_CHUNK_SIZE;
        for (let offset = 0; offset < blob.size; offset += chunkSize) {
            chunks.push(blob.slice(offset, offset + chunkSize));
        }
        return chunks;
    }

    /* Init file manager WASM worker */
    private initFileServer() {
        this.fileSeverInitialized = true;
        setTimeout(() => {
            for (let i = 0; i < C_FILE_SERVER_HTTP_WORKER_NUM; i++) {
                this.httpWorkers[i] = new Http('', i + 1);
                this.httpWorkers[i].ready(() => {
                    if (i === 1) {
                        this.startUploadQueue();
                    }
                    if (i === 0) {
                        this.startDownloadQueue();
                    }
                    window.console.log(`Http WASM worker ${i} is ready`);
                });
            }
        }, 110);
    }
}
