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
import {FileSavePart} from '../messages/api.files_pb';
import {Bool} from '../messages/core.messages_pb';
import FileRepo from '../../../repository/file';
import {ITempFile} from '../../../repository/file/interface';
import {C_FILE_ERR_CODE, C_FILE_ERR_NAME} from './const/const';
import {findIndex} from 'lodash';

const C_FILE_SERVER_HTTP_WORKER_NUM = 1;

export interface IFileProgress {
    download: number;
    state: 'loading' | 'complete';
    totalDownload: number;
    totalUpload: number;
    upload: number;
}

interface IChunkUpdate {
    download: number;
    downloadSize: number;
    upload: number;
    uploadSize: number;
}

interface IChunk {
    cancel: any;
    id: string;
    last: boolean;
    part: number;
}

interface IChunksInfo {
    chunks: IChunk[];
    interval: any;
    onProgress?: (e: IFileProgress) => void;
    reject: any;
    resolve: any;
    retry: number;
    size: number;
    totalParts: number;
    updates: IChunkUpdate[];
    upload: boolean;
    uploaded: number;
}

const C_MAX_QUEUE_SIZE = 1;
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
    private queuedFile: string[] = [];
    private onWireFile: string[] = [];

    public constructor() {
        window.addEventListener('fnStarted', () => {
            if (!this.fileSeverInitialized) {
                this.initFileServer();
            }
        });
        this.fileRepo = FileRepo.getInstance();
    }

    /* send the whole file */
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

            this.prepareTransfer(id, chunks, blob.size, true, internalResolve, internalReject, onProgress);

            this.startQueue();

            return promise;
        });
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

                this.prepareTransfer(id, blobs, size, true, internalResolve, internalReject, onProgress);

                this.startQueue();

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
            this.fileTransferQueue[id].chunks.forEach((chunk) => {
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

    /* Start upload/download queue */
    private startQueue() {
        if (this.onWireFile.length < C_MAX_QUEUE_SIZE && this.queuedFile.length > 0) {
            const id = this.queuedFile.shift();
            if (id) {
                this.onWireFile.push(id);
                this.startUploading(id);
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
                this.startQueue();
                return;
            }
            const chunkInfo = this.fileTransferQueue[id];
            if (chunkInfo.chunks.length > 0) {
                let chunk = chunkInfo.chunks.shift();
                if (chunk) {
                    if (chunkInfo.chunks.length >= 1 && chunk.last) {
                        this.fileTransferQueue[id].chunks.push(chunk);
                        chunk = this.fileTransferQueue[id].chunks.shift();
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
                                const index = findIndex(this.fileTransferQueue[id].chunks, {part});
                                if (index > -1) {
                                    this.fileTransferQueue[id].chunks[index].cancel = fn;
                                }
                            }
                        };
                        this.upload(id, part, chunkInfo.totalParts, cancelHandler, uploadProgress, downloadProgress).then((res) => {
                            this.startUploading(id);
                            if (chunk) {
                                window.console.log(`${chunk.part}/${chunkInfo.totalParts} uploaded`, res);
                            }
                        }).catch((err) => {
                            if (err.code !== C_FILE_ERR_CODE.REQUEST_CANCELLED) {
                                if (chunk) {
                                    this.fileTransferQueue[id].chunks.push(chunk);
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

    /* Clear queue by id */
    private clearQueueById(id: string) {
        clearInterval(this.fileTransferQueue[id].interval);
        const index = this.queuedFile.indexOf(id);
        if (index > -1) {
            this.queuedFile.splice(index, 1);
        }
        const wireIndex = this.onWireFile.indexOf(id);
        if (wireIndex > -1) {
            this.onWireFile.splice(wireIndex, 1);
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
        const message = this.fileTransferQueue[id];
        if (!message.onProgress) {
            return;
        }
        let download = 0;
        let upload = 0;
        let totalDownload = 0;
        message.updates.forEach((update) => {
            upload += update.upload;
            download += update.download;
            totalDownload += update.downloadSize;
        });
        message.onProgress({
            download,
            state,
            totalDownload,
            totalUpload: this.fileTransferQueue[id].size,
            upload,
        });
    }

    /* Prepare transfer */
    private prepareTransfer(id: string, chunks: Blob[], size: number, upload: boolean, resolve: any, reject: any, onProgress?: (e: IFileProgress) => void) {
        this.fileTransferQueue[id] = {
            chunks: [],
            interval: null,
            onProgress,
            reject,
            resolve,
            retry: 0,
            size,
            totalParts: chunks.length,
            updates: [],
            upload,
            uploaded: 0,
        };
        chunks.forEach((chunk, index) => {
            this.fileTransferQueue[id].chunks.push({
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
        this.queuedFile.push(id);
        const message = this.fileTransferQueue[id];
        message.interval = setInterval(() => {
            this.dispatchProgress(id, 'loading');
        }, 500);
    }

    /* Send chunk over http */
    private sendFileChunk(id: string, partNum: number, totalParts: number, bytes: Uint8Array, cancel: any, onUploadProgress?: (e: any) => void, onDownloadProgress?: (e: any) => void): Promise<Bool.AsObject> {
        if (this.httpWorkers.length === 0) {
            return Promise.reject('file server is not started yet');
        }
        const data = new FileSavePart();
        data.setFileid(id);
        data.setPartid(partNum);
        data.setTotalparts(totalParts);
        data.setBytes(bytes);
        return this.httpWorkers[0].send(C_MSG.FileSavePart, data.serializeBinary(), cancel, onUploadProgress, onDownloadProgress);
    }

    /* Chunk File */
    private chunkBlob(blob: Blob): Blob[] {
        const chunks: Blob[] = [];
        const chunkSize = 256 * 1024;
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
            }
        });
    }
}
