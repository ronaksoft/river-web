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

const C_FILE_SERVER_HTTP_WORKER_NUM = 1;

interface IFileProgress {
    download: number;
    upload: number;
    state: 'loading' | 'complete';
}

interface IChunkUpdate {
    download: number;
    downloadSize: number;
    upload: number;
    uploadSize: number;
}

interface IChunk {
    id: string;
    last: boolean;
    part: number;
}

interface IChunksInfo {
    chunks: IChunk[];
    interval: any;
    onProgress?: (e: IFileProgress) => void;
    size: number;
    totalParts: number;
    updates: IChunkUpdate[];
    uploaded: number;
}

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
    private fileChunkQueue: { [key: string]: IChunksInfo } = {};
    private queuedFile: string[] = [];

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
        window.console.time('sendFile');
        Promise.all(saveFileToDBPromises).then(() => {
            window.console.log('saveFileToDBPromises');
            this.prepareChunks(id, chunks, blob.size, onProgress);
            this.startQueue(id);
        });
    }

    /* Start upload/download queue */
    private startQueue(id: string) {
        if (!this.fileChunkQueue.hasOwnProperty(id)) {
            return;
        }
        this.queuedFile.push(id);
        const message = this.fileChunkQueue[id];
        message.interval = setInterval(() => {
            this.dispatchProgress(id, 'loading');
        }, 500);
        this.startUploading(id);
    }

    /* Start upload for selected queue */
    private startUploading(id: string) {
        if (this.fileChunkQueue.hasOwnProperty(id)) {
            const chunkInfo = this.fileChunkQueue[id];
            if (chunkInfo.chunks.length > 0) {
                let chunk = chunkInfo.chunks.shift();
                if (chunk) {
                    if (chunkInfo.chunks.length >= 1 && chunk.last) {
                        this.fileChunkQueue[id].chunks.push(chunk);
                        chunk = this.fileChunkQueue[id].chunks.shift();
                    }
                    if (chunk) {
                        const part = chunk.part;
                        const uploadProgress = (e: any) => {
                            if (this.fileChunkQueue.hasOwnProperty(id)) {
                                const index = part - 1;
                                this.fileChunkQueue[id].updates[index].upload = e.loaded;
                                this.fileChunkQueue[id].updates[index].uploadSize = e.total;
                            }
                        };
                        const downloadProgress = (e: any) => {
                            if (this.fileChunkQueue.hasOwnProperty(id)) {
                                const index = part - 1;
                                this.fileChunkQueue[id].updates[index].download = e.loaded;
                                this.fileChunkQueue[id].updates[index].downloadSize = e.total;
                                window.console.log(this.fileChunkQueue[id].updates[index].download);
                            }
                        };
                        this.upload(id, part, chunkInfo.totalParts, uploadProgress, downloadProgress).then((res) => {
                            this.startUploading(id);
                            if (chunk) {
                                window.console.log(`${chunk.part}/${chunkInfo.totalParts} uploaded`, res);
                            }
                        }).catch(() => {
                            if (chunk) {
                                this.fileChunkQueue[id].chunks.push(chunk);
                            }
                        });
                    }
                }
            } else {
                const index = this.queuedFile.indexOf(id);
                if (index > -1) {
                    this.queuedFile.splice(index, 1);
                }
                if (this.fileChunkQueue.hasOwnProperty(id)) {
                    clearInterval(this.fileChunkQueue[id].interval);
                    this.dispatchProgress(id, 'complete');
                    delete this.fileChunkQueue[id];
                }
                window.console.timeEnd('sendFile');
            }
        }
    }

    /* Upload parts */
    private upload(id: string, part: number, totalParts: number, onUploadProgress?: (e: any) => void, onDownloadProgress?: (e: any) => void): Promise<any> {
        return this.fileRepo.getTemp(id, part).then((blob) => {
            if (blob) {
                return this.convertBlobToU8a(blob.data).then((u8a: Uint8Array) => {
                    return this.sendFileChunk(id, part, totalParts, u8a, onUploadProgress, onDownloadProgress);
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
        if (!this.fileChunkQueue.hasOwnProperty(id)) {
            return;
        }
        const message = this.fileChunkQueue[id];
        if (!message.onProgress) {
            return;
        }
        let download = 0;
        let upload = 0;
        message.updates.forEach((update) => {
            upload += update.upload;
            download += update.download;
        });
        message.onProgress({
            download,
            state,
            upload,
        });
    }

    /* Prepare chunks for queue */
    private prepareChunks(id: string, chunks: Blob[], size: number, onProgress?: (e: IFileProgress) => void) {
        this.fileChunkQueue[id] = {
            chunks: [],
            interval: null,
            onProgress,
            size,
            totalParts: chunks.length,
            updates: [],
            uploaded: 0,
        };
        chunks.forEach((chunk, index) => {
            this.fileChunkQueue[id].chunks.push({
                id,
                last: (chunks.length - 1 === index),
                part: index + 1,
            });
            this.fileChunkQueue[id].updates.push({
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
    }

    /* Send chunk over http */
    private sendFileChunk(id: string, partNum: number, totalParts: number, bytes: Uint8Array, onUploadProgress?: (e: any) => void, onDownloadProgress?: (e: any) => void): Promise<Bool.AsObject> {
        if (this.httpWorkers.length === 0) {
            return Promise.reject('file server is not started yet');
        }
        const data = new FileSavePart();
        data.setFileid(id);
        data.setPartid(partNum);
        data.setTotalparts(totalParts);
        data.setBytes(bytes);
        return this.httpWorkers[0].send(C_MSG.FileSavePart, data.serializeBinary(), onUploadProgress, onDownloadProgress);
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
