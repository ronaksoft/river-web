/*
    Creation Time: 2019 - Jan - 12
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import DB from '../../services/db/file';
import {IFile, ITempFile} from './interface';
import {DexieFileDB} from '../../services/db/dexie/file';
import Dexie from 'dexie';
import {arrayBufferToBase64} from '../../services/sdk/fileServer/http/utils';

export default class FileRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new FileRepo();
        }

        return this.instance;
    }

    private static instance: FileRepo;

    private dbService: DB;
    private db: DexieFileDB;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
    }

    public getTemp(id: string, part: number): Promise<ITempFile> {
        return this.db.temps.where('[id+part]').equals([id, part]).filter((item) => {
            return item.part === part;
        }).first();
    }

    public getTempsById(id: string): Promise<ITempFile[]> {
        return this.db.temps.where('[id+part]').between([id, Dexie.minKey], [id, Dexie.maxKey], true, true).toArray();
    }

    public removeTempsById(id: string) {
        return this.db.temps.where('[id+part]').between([id, Dexie.minKey], [id, Dexie.maxKey], true, true).delete();
    }

    public setTemp(tempFile: ITempFile) {
        return this.db.temps.put(tempFile);
    }

    public persistTempFiles(id: string, docId: string, mimeType: string) {
        return this.getTempsById(id).then((temps) => {
            const blobs: Blob[] = [];
            temps.forEach((temp) => {
                blobs.push(temp.data);
            });
            const blob = new Blob(blobs, {type: mimeType});
            this.removeTempsById(id);
            return this.createWithHash(docId, blob);
        });
    }

    public createWithHash(id: string, blob: Blob) {
        return this.createHash(blob).then((res) => {
            const file: IFile = {
                data: blob,
                hash: res,
                id,
                size: blob.size,
            };
            return this.create(file);
        });
    }

    public create(file: IFile) {
        return this.db.files.add(file);
    }

    private createHash(blob: Blob): Promise<string> {
        return new Promise((resolve) => {
            const fileReader = new FileReader();
            fileReader.onload = (event) => {
                // @ts-ignore
                const data: ArrayBuffer = event.target.result;
                window.crypto.subtle.digest('SHA-256', data).then((res) => {
                    window.console.log(res);
                    resolve(arrayBufferToBase64(res));
                });
            };
            fileReader.readAsArrayBuffer(blob);
        });
    }
}
