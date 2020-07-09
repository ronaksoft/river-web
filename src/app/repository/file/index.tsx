/*
    Creation Time: 2019 - Jan - 12
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import DB from '../../services/db/file';
import {IFile, IFileMap, ITempFile} from './interface';
import {DexieFileDB} from '../../services/db/dexie/file';
import Dexie from 'dexie';
import {arrayBufferToBase64} from '../../services/sdk/fileManager/http/utils';
import {sha256} from 'js-sha256';
import md5 from "md5-webworker";
import {InputFileLocation} from "../../services/sdk/messages/core.types_pb";
import {find, differenceWith, uniq} from "lodash";
import {kMerge} from "../../services/utilities/kDash";
import {IMessage} from "../message/interface";
import {getMediaDocument} from "../message";
import {MediaDocument} from "../../services/sdk/messages/chat.messages.medias_pb";

export const md5FromBlob = (theBlob: Blob): Promise<string> => {
    const b: any = theBlob;
    b.lastModifiedDate = new Date();
    b.name = 'tempfile';
    return md5(theBlob as File);
};

export const getFileLocation = (msg: IMessage) => {
    let fileLocation: InputFileLocation | undefined;
    const mediaDocument = getMediaDocument(msg);
    if (mediaDocument && mediaDocument.doc && mediaDocument.doc.id) {
        fileLocation = new InputFileLocation();
        fileLocation.setAccesshash(mediaDocument.doc.accesshash || '');
        fileLocation.setClusterid(mediaDocument.doc.clusterid || 0);
        fileLocation.setFileid(mediaDocument.doc.id);
        fileLocation.setVersion(mediaDocument.doc.version || 0);
    }
    return fileLocation;
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

    public getTemp(id: string, part: number): Promise<ITempFile | undefined> {
        return this.db.temps.where('[id+part]').equals([id, part]).filter((item) => {
            return item.part === part;
        }).first();
    }

    public getTempsById(id: string): Promise<ITempFile[]> {
        return this.db.temps.where('[id+part]').between([id, Dexie.minKey], [id, Dexie.maxKey], true, true).toArray();
    }

    public getTempsRangeById(id: string, from: number, to: number): Promise<ITempFile[]> {
        return this.db.temps.where('[id+part]').between([id, from], [id, to], true, true).toArray();
    }

    public removeTempsById(id: string) {
        return this.db.temps.where('[id+part]').between([id, Dexie.minKey], [id, Dexie.maxKey], true, true).delete();
    }

    public setTemp(tempFile: ITempFile) {
        return this.db.temps.put(tempFile);
    }

    public getIn(names: string[]) {
        const pipe = this.db.files.where('id').anyOf(names);
        return pipe.toArray();
    }

    public persistTempFiles(id: string, docName: string, mimeType: string, useBuffer?: boolean) {
        return this.get(docName).then((file) => {
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
                    setTimeout(() => {
                        this.removeTempsById(id);
                    }, useBuffer ? 10000 : 1000);
                    return this.createWithHash(docName, blob);
                });
            }
        });
    }

    public createWithHash(name: string, blob: Blob) {
        return this.createHash(blob).then((res) => {
            const file: IFile = {
                data: blob,
                hash: res.sha256,
                id: name,
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

    public remove(name: string) {
        return this.db.files.delete(name);
    }

    public removeMany(names: string[]) {
        return this.db.files.bulkDelete(names);
    }

    public upsertFile(name: string, blob: Blob) {
        return this.createHash(blob).then((res) => {
            const file: IFile = {
                data: blob,
                hash: res.sha256,
                id: name,
                md5: res.md5,
                size: blob.size,
            };
            return this.db.files.put(file);
        });
    }

    public get(name: string) {
        return this.db.files.get(name);
    }

    public upsertFileMap(fileMaps: IFileMap[]) {
        const ids: string[] = fileMaps.map((f) => {
            return f.id;
        });
        return this.db.fileMap.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IFileMap[] = differenceWith(fileMaps, result, 'id');
            const updateItems: IFileMap[] = result.map((fileMap: IFileMap) => {
                const t = find(fileMaps, {id: fileMap.id});
                if (t) {
                    if (t.msg_ids && fileMap.msg_ids) {
                        t.msg_ids = uniq([...t.msg_ids, ...fileMap.msg_ids]);
                    }
                    return kMerge(fileMap, t);
                } else {
                    return fileMap;
                }
            });
            return this.db.fileMap.bulkPut([...createItems, ...updateItems]);
        }).catch((err: any) => {
            window.console.debug('fileMap upsert', err);
        });
    }

    public getFileMapByMediaDocument(mediaDocument: MediaDocument.AsObject): Promise<IFileMap | undefined> {
        return this.getFileMap({
            clusterid: mediaDocument.doc.clusterid,
            fileid: mediaDocument.doc.id,
        });
    }

    private getFileMap(inputFile: InputFileLocation.AsObject): Promise<IFileMap | undefined> {
        return this.db.fileMap.get(GetDbFileName(inputFile.fileid, inputFile.clusterid ));
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

export function GetDbFileName(id: string | undefined, clusterId: number | undefined) {
    return `${id || ''}_${clusterId || 0}`;
}
