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
import UniqueId from '../../uniqueId';
import {Bool} from '../messages/core.messages_pb';

const C_FILE_SERVER_HTTP_WORKER_NUM = 4;

export default class FileServer {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new FileServer();
        }

        return this.instance;
    }

    private static instance: FileServer;

    private fileSeverInitialized: boolean = false;
    private httpWorkers: Http[] = [];

    public constructor() {
        window.addEventListener('fnStarted', () => {
            if (!this.fileSeverInitialized) {
                this.initFileServer();
            }
        });
    }

    public sendFile(bytes: Uint8Array): Promise<Bool.AsObject> {
        if (this.httpWorkers.length === 0) {
            return Promise.reject('file server is not started yet');
        }
        const id = String(UniqueId.getRandomId());
        const data = new FileSavePart();
        data.setBytes(bytes);
        data.setPartid(1);
        data.setTotalparts(1);
        data.setFileid(id);
        return this.httpWorkers[0].send(C_MSG.FileSavePart, data.serializeBinary());
    }

    private initFileServer() {
        fetch('/bin/river.wasm?v7').then((response) => {
            return response.arrayBuffer();
        }).then((bytes) => {
            for (let i = 0; i < C_FILE_SERVER_HTTP_WORKER_NUM; i++) {
                this.httpWorkers[i] = new Http(bytes);
            }
        });
    }
}
