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
import {File, FileGet, FileSavePart} from '../messages/api.files_pb';
import {Bool} from '../messages/core.messages_pb';
import FileRepo from '../../../repository/file';
import {ITempFile} from '../../../repository/file/interface';
import {C_FILE_ERR_CODE, C_FILE_ERR_NAME} from './const/const';
import {findIndex} from 'lodash';
import * as core_types_pb from '../messages/core.types_pb';

export interface IFileProgress {
    download: number;
    state: 'loading' | 'complete';
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
    fileLocation?: core_types_pb.InputFileLocation;
    interval: any;
    mimeType?: string;
    onProgress?: (e: IFileProgress) => void;
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
const C_MAX_UPLOAD_QUEUE_SIZE = 1;
const C_UPLOAD_CHUNK_SIZE = 256 * 1024;
const C_MAX_DOWNLOAD_QUEUE_SIZE = 1;
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
        window.addEventListener('fnStarted', () => {
            if (!this.fileSeverInitialized) {
                this.initFileServer();
            }
        });
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
            window.console.log('saveFileToDBPromises');

            let internalResolve = null;
            let internalReject = null;

            const promise = new Promise((res, rej) => {
                internalResolve = res;
                internalReject = rej;
            });

            this.prepareUploadTransfer(id, chunks, blob.size, internalResolve, internalReject, onProgress);

            this.startUploadQueue();

            return promise;
        });
    }

    /* Receive the whole file */
    public receiveFile(location: core_types_pb.InputFileLocation, size: number, mimeType: string, onProgress?: (e: IFileProgress) => void) {
        let internalResolve = null;
        let internalReject = null;

        const promise = new Promise((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });

        this.prepareDownloadTransfer(location, size, mimeType, internalResolve, internalReject, onProgress);

        this.startDownloadQueue();

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
            this.clearQueueById(id);
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
        }
    }

    /* Start upload for selected queue */
    private startUploading(id: string) {
        if (this.fileTransferQueue.hasOwnProperty(id)) {
            if (this.fileTransferQueue[id].retry > C_MAX_RETRIES) {
                this.clearQueueById(id);
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
                        this.upload(id, part, chunkInfo.totalParts, cancelHandler, uploadProgress, downloadProgress).then((res) => {
                            this.startUploading(id);
                            if (chunk) {
                                window.console.log(`${chunk.part}/${chunkInfo.totalParts} uploaded`);
                            }
                        }).catch((err) => {
                            window.console.log(err);
                            if (err.code === C_FILE_ERR_CODE.NO_WORKER) {
                                if (chunk) {
                                    this.fileTransferQueue[id].sendChunks.unshift(chunk);
                                }
                                setTimeout(() => {
                                    this.startUploading(id);
                                }, 500);
                            } else if (err.code !== C_FILE_ERR_CODE.REQUEST_CANCELLED) {
                                if (chunk) {
                                    this.fileTransferQueue[id].sendChunks.push(chunk);
                                    this.fileTransferQueue[id].retry++;
                                    this.startUploading(id);
                                }
                            }
                        });
                    }
                }
            } else {
                this.clearQueueById(id);
                if (this.fileTransferQueue.hasOwnProperty(id)) {
                    this.dispatchProgress(id, 'complete');
                    this.fileTransferQueue[id].resolve();
                    delete this.fileTransferQueue[id];
                }
            }
        }
    }

    /* Start download for selected queue */
    private startDownloading(id: string) {
        if (this.fileTransferQueue.hasOwnProperty(id)) {
            if (this.fileTransferQueue[id].retry > C_MAX_RETRIES) {
                this.clearQueueById(id);
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
                            const index = findIndex(this.fileTransferQueue[id].receiveChunks, {part});
                            if (index > -1) {
                                this.fileTransferQueue[id].receiveChunks[index].cancel = fn;
                            }
                        }
                    };
                    if (chunkInfo.fileLocation) {
                        this.download(chunkInfo.fileLocation, chunk.part, chunk.offset, chunk.limit, cancelHandler, uploadProgress, downloadProgress).then((res) => {
                            window.console.log('download', chunk.part);
                            this.startDownloading(id);
                            if (chunk) {
                                window.console.log(`${chunk.part}/${chunkInfo.totalParts} downloaded`);
                            }
                        }).catch((err) => {
                            if (err.code === C_FILE_ERR_CODE.NO_WORKER) {
                                this.fileTransferQueue[id].receiveChunks.unshift(chunk);
                                setTimeout(() => {
                                    this.startDownloading(id);
                                }, 500);
                            } else if (err.code !== C_FILE_ERR_CODE.REQUEST_CANCELLED) {
                                this.fileTransferQueue[id].receiveChunks.push(chunk);
                                this.fileTransferQueue[id].retry++;
                                this.startDownloading(id);
                            }
                        });
                    }
                }
            } else {
                this.clearQueueById(id);
                if (this.fileTransferQueue.hasOwnProperty(id)) {
                    this.dispatchProgress(id, 'complete');
                    this.fileRepo.persistTempFiles(id, id, this.fileTransferQueue[id].mimeType || 'application/octet-stream').then(() => {
                        this.fileTransferQueue[id].resolve();
                        delete this.fileTransferQueue[id];
                    }).catch((err) => {
                        this.fileTransferQueue[id].reject(err);
                        delete this.fileTransferQueue[id];
                    });
                }
            }
        }
    }

    /* Clear queue by id */
    private clearQueueById(id: string) {
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
    private download(fileLocation: core_types_pb.InputFileLocation, part: number, offset: number, limit: number, cancel: any, onUploadProgress?: (e: any) => void, onDownloadProgress?: (e: any) => void): Promise<any> {
        return this.receiveFileChunk(fileLocation, offset, limit, cancel, onUploadProgress, onDownloadProgress).then((res) => {
            return this.fileRepo.setTemp({
                data: new Blob([res.getBytes_asU8()]),
                id: fileLocation.getFileid() || '',
                modifiedtime: res.getModifiedtime(),
                part,
                type: res.getType(),
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
            interval: null,
            onProgress,
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
    private prepareDownloadTransfer(file: core_types_pb.InputFileLocation, size: number, mimeType: string, resolve: any, reject: any, onProgress?: (e: IFileProgress) => void) {
        const id = file.getFileid() || '';
        const totalParts = Math.ceil(size / C_DOWNLOAD_CHUNK_SIZE);
        const chunks: IReceiveChunk[] = [];
        const updates: IChunkUpdate[] = [];
        for (let i = 0; i < totalParts; i++) {
            let limit = C_DOWNLOAD_CHUNK_SIZE;
            if (i === (totalParts - 1)) {
                limit = size - ((totalParts - 1) * C_DOWNLOAD_CHUNK_SIZE);
            }
            chunks.push({
                cancel: null,
                limit,
                offset: i * C_DOWNLOAD_CHUNK_SIZE,
                part: i + 1,
            });

            updates.push({
                download: 0,
                downloadSize: 0,
                upload: 0,
                uploadSize: limit,
            });
        }
        this.fileTransferQueue[id] = {
            fileLocation: file,
            interval: null,
            mimeType,
            onProgress,
            receiveChunks: chunks,
            reject,
            resolve,
            retry: 0,
            sendChunks: [],
            size,
            totalParts,
            updates,
            upload: true,
        };
        this.downloadQueue.push(id);
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
        fetch('/bin/river.wasm?v7').then((response) => {
            return response.arrayBuffer();
        }).then((bytes) => {
            for (let i = 0; i < C_FILE_SERVER_HTTP_WORKER_NUM; i++) {
                this.httpWorkers[i] = new Http(bytes, i + 1);
                // this.httpWorkers[i].ready(() => {
                //     this.startDownloadQueue();
                //     this.startUploadQueue();
                // });
            }
        });
    }
}
