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
import {arrayBufferToBase64} from '../../services/sdk/fileManager/http/utils';
import {sha256} from 'js-sha256';
import md5 from "md5-webworker";

export const md5FromBlob = (theBlob: Blob): Promise<string> => {
    const b: any = theBlob;
    b.lastModifiedDate = new Date();
    b.name = 'tempfile';
    return md5(theBlob as File);
};

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

    public getIn(ids: string[]) {
        const pipe = this.db.files.where('id').anyOf(ids);
        return pipe.toArray();
    }

    public persistTempFiles(id: string, docId: string, mimeType: string) {
        return this.get(docId).then((file) => {
            if (file) {
                return {
                    md5: file.md5,
                    sha256: file.hash,
                };
            } else {
                return this.getTempsById(id).then((temps) => {
                    if (temps.length === 0) {
                        return {
                            md5: '',
                            sha256: '',
                        };
                    }
                    const blobs: Blob[] = [];
                    temps.forEach((temp) => {
                        blobs.push(temp.data);
                    });
                    const blob = new Blob(blobs, {type: mimeType});
                    this.removeTempsById(id);
                    return this.createWithHash(docId, blob);
                });
            }
        });
    }

    public createWithHash(id: string, blob: Blob) {
        return this.createHash(blob).then((res) => {
            const file: IFile = {
                data: blob,
                hash: res.sha256,
                id,
                md5: res.md5,
                size: blob.size,
            };
            return this.create(file).then(() => {
                return {
                    md5: res.md5,
                    sha256: res.sha256,
                };
            });
        });
    }

    public create(file: IFile) {
        return this.db.files.add(file);
    }

    public remove(id: string) {
        return this.db.files.delete(id);
    }

    public removeMany(ids: string[]) {
        return this.db.files.bulkDelete(ids);
    }

    public upsertFile(id: string, blob: Blob) {
        return this.createHash(blob).then((res) => {
            const file: IFile = {
                data: blob,
                hash: res.sha256,
                id,
                md5: res.md5,
                size: blob.size,
            };
            return this.db.files.put(file);
        });
    }

    public get(id: string) {
        return this.db.files.get(id);
    }

    private createSha256(blob: Blob): Promise<string> {
        return new Promise((resolve) => {
            const fileReader = new FileReader();
            fileReader.onload = (event) => {
                // @ts-ignore
                const data: ArrayBuffer = event.target.result;
                try {
                    window.crypto.subtle.digest('SHA-256', data).then((res) => {
                        resolve(arrayBufferToBase64(res));
                    });
                } catch (e) {
                    resolve(arrayBufferToBase64(sha256.arrayBuffer(data)));
                }
            };
            fileReader.readAsArrayBuffer(blob);
        });
    }

    private createHash(blob: Blob): Promise<{ md5: string, sha256: string }> {
        return new Promise<{ md5: string, sha256: string }>((resolve, reject) => {
            const promise: any[] = [];
            promise.push(md5FromBlob(blob));
            promise.push(this.createSha256(blob));
            Promise.all(promise).then((res) => {
                resolve({
                    md5: res[0],
                    sha256: res[1],
                });
            }).catch(reject);
        });
    }
}
