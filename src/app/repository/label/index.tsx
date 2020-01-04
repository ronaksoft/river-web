/*
    Creation Time: 2019 - Dec - 15
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import DB from '../../services/db/label';
import {ILabel, ILabelItem, ILabelItemList} from './interface';
import {differenceBy, find, uniqBy} from 'lodash';
import {DexieLabelDB} from '../../services/db/dexie/label';
import Broadcaster from '../../services/broadcaster';
import {kMerge} from "../../services/utilities/kDash";
import SDK from "../../services/sdk";
import Dexie from 'dexie';
import MessageRepo from "../message";
import {IMessage} from "../message/interface";
import UserRepo from "../user";
import GroupRepo from "../group";

export default class LabelRepo {
    public static labelColors: { [key: number]: string } = {};

    public static getInstance() {
        if (!this.instance) {
            this.instance = new LabelRepo();
        }

        return this.instance;
    }

    private static instance: LabelRepo;

    private dbService: DB;
    private db: DexieLabelDB;
    private messageRepo: MessageRepo;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;
    private broadcaster: Broadcaster;
    private sdk: SDK;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.messageRepo = MessageRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.broadcaster = Broadcaster.getInstance();
        this.sdk = SDK.getInstance();
        this.db.labels.toArray().then((items) => {
            items.forEach((item) => {
                LabelRepo.labelColors[item.id || 0] = item.colour || '';
            });
        });
    }

    public create(label: ILabel) {
        return this.db.labels.put(label);
    }

    public createMany(labels: ILabel[]) {
        return this.db.labels.bulkPut(labels);
    }

    public get(id: number): Promise<ILabel> {
        const label = this.dbService.getLabel(id);
        if (label) {
            return Promise.resolve(label);
        }
        return this.db.labels.get(id).then((l: ILabel | undefined) => {
            if (l) {
                this.dbService.setLabel(l);
                LabelRepo.labelColors[l.id || 0] = l.colour || '';
            }
            return l;
        });
    }

    public getLabels(): Promise<ILabel[]> {
        return this.sdk.labelGet().then((res) => {
            this.upsert(res.labelsList);
            return res.labelsList;
        });
    }

    public search({keyword, limit}: { keyword?: string, limit?: number }): Promise<ILabel[]> {
        if (!keyword) {
            return this.db.labels.limit(limit || 100).toArray();
        }
        const reg = new RegExp(keyword || '', 'gi');
        return this.db.labels.filter((g) => {
            return reg.test(g.name || '');
        }).limit(limit || 12).toArray();
    }

    public importBulk(labels: ILabel[], callerId?: number): Promise<any> {
        if (!labels || labels.length === 0) {
            return Promise.resolve();
        }
        const tempLabels = uniqBy(labels, 'id');
        return this.upsert(tempLabels, callerId);
    }

    public removeMany(ids: number[], callerId?: number): Promise<any> {
        const promises: any[] = [];
        ids.forEach((id) => {
            this.dbService.removeLabel(id);
            promises.push(this.db.labels.delete(id));
        });
        return Promise.all(promises).then((res) => {
            this.broadcastEvent('Label_DB_Updated', {ids, callerId});
            return res;
        });
    }

    public getMessageByItem(id: number, {max, limit}: { min?: number, max?: number, limit?: number }, cacheCallback?: (cacheList: IMessage[]) => void): Promise<ILabelItemList> {
        let lim = limit || 1000;
        return new Promise((resolve, reject) => {
            this.getCachedMessageByItem(id, {max, limit: lim}).then((cacheRes) => {
                if (cacheRes.labelCount < lim) {
                    if (cacheCallback) {
                        cacheCallback(cacheRes.messageList);
                    }
                    lim = lim - cacheRes.labelCount;
                    if (cacheRes.messageList.length > 0) {
                        max = (cacheRes.messageList[cacheRes.messageList.length - 1].id || 0) - 1;
                    }
                    this.getRemoteMessageByItem(id, {max: max || 0, limit: lim}).then((remoteRes) => {
                        resolve({
                            labelCount: cacheRes.labelCount + remoteRes.length,
                            messageList: [...cacheRes.messageList, ...MessageRepo.parseMessageMany(remoteRes, this.userRepo.getCurrentUserId())]
                        });
                    }).catch((remoteErr) => {
                        reject(remoteErr);
                    });
                } else {
                    resolve(cacheRes);
                }
            }).catch((cacheErr) => {
                reject(cacheErr);
            });
        });
    }

    public getCachedMessageByItem(id: number, {max, limit}: { min?: number, max?: number, limit?: number }): Promise<ILabelItemList> {
        const pipe = this.db.labelItems.where('[lid+mid]');
        let pipe2: Dexie.Collection<ILabelItem, number>;
        if (max) {
            pipe2 = pipe.between([id, Dexie.minKey], [id, (max || 0) - 1], true, true);
        } else {
            pipe2 = pipe.between([id, Dexie.minKey], [id, Dexie.maxKey], true, true);
        }
        return pipe2.limit(limit || 100).reverse().toArray().then((res) => {
            const ids = res.map((item) => {
                return item.mid || 0;
            });
            return this.messageRepo.getIn(ids, false).then((msgList) => {
                return {
                    labelCount: ids.length,
                    messageList: msgList,
                };
            });
        });
    }

    public getRemoteMessageByItem(id: number, {min, max, limit}: { min?: number, max?: number, limit?: number }): Promise<IMessage[]> {
        return this.sdk.labelList(id, min || 0, max || 0, limit || 0).then((remoteRes) => {
            this.insertManyLabelItem(id, remoteRes.messagesList);
            this.messageRepo.lazyUpsert(remoteRes.messagesList, true);
            this.userRepo.importBulk(false, remoteRes.usersList);
            this.groupRepo.importBulk(remoteRes.groupsList);
            return remoteRes.messagesList;
        });
    }

    public upsert(labels: ILabel[], callerId?: number): Promise<any> {
        labels = labels.filter(g => g.id);
        if (labels.length === 0) {
            return Promise.resolve();
        }
        const ids = labels.map((label) => {
            return label.id || 0;
        });
        return this.db.labels.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: ILabel[] = differenceBy(labels, result, 'id');
            const updateItems: ILabel[] = result;
            updateItems.map((label: ILabel) => {
                const t = find(labels, {id: label.id});
                if (t) {
                    return this.mergeCheck(label, t);
                } else {
                    return label;
                }
            });
            const list = [...createItems, ...updateItems];
            list.forEach((item) => {
                this.dbService.setLabel(item);
                LabelRepo.labelColors[item.id || 0] = item.colour || '';
            });
            return this.createMany(list);
        }).then((res) => {
            this.broadcastEvent('Label_DB_Updated', {ids, callerId});
            return res;
        });
    }

    public insertInRange(labelId: number, peerid: string, peertype: number, msgIds: number[]) {
        const label = this.dbService.getLabel(labelId);
        if (!label) {
            return;
        }
        const labelItems: ILabelItem[] = [];
        msgIds.forEach((id) => {
            if ((label.min || 0) <= id && id <= (label.max || 0)) {
                labelItems.push({
                    lid: labelId,
                    mid: id,
                    peerid,
                    peertype,
                });
            }
        });
        if (labelItems.length > 0) {
            return this.db.labelItems.bulkPut(labelItems);
        }
        return Promise.reject();
    }

    public removeFromRange(labelId: number, msgIds: number[]) {
        const label = this.dbService.getLabel(labelId);
        if (!label) {
            return;
        }
        const labelItems: any[] = [];
        msgIds.forEach((id) => {
            if ((label.min || 0) <= id && id <= (label.max || 0)) {
                labelItems.push({
                    lid: labelId,
                    mid: id,
                });
            }
        });
        if (labelItems.length > 0) {
            return this.db.labelItems.where('lid+mid').anyOf(labelItems).delete();
        }
        return Promise.reject();
    }

    private insertManyLabelItem(labelId: number, messageList: IMessage[]) {
        if (messageList.length > 0) {
            this.db.labels.get(labelId).then((label) => {
                if (!label) {
                    return;
                }
                let min = messageList[0].id || 0;
                let max = messageList[messageList.length - 1].id || 0;
                const labelMin = label.min || 0;
                const labelMax = label.max || 0;
                if (min > max) {
                    const hold = max;
                    max = min;
                    min = hold;
                }
                min = Math.min(min, labelMin);
                max = Math.max(max, labelMax);
                if (min !== 0 && max !== 0) {
                    this.upsert([{
                        id: labelId,
                        max,
                        min,
                    }]);
                }
            });
        }
        return this.db.labelItems.bulkPut(messageList.map((message) => {
            return {
                lid: labelId,
                mid: message.id,
                peerid: message.peerid,
                peertype: message.peertype,
            };
        }));
    }

    private broadcastEvent(name: string, data: any) {
        this.broadcaster.publish(name, data);
    }

    private mergeCheck(label: ILabel, newLabel: ILabel): ILabel {
        if (newLabel.increase_counter) {
            newLabel.count = (label.count || 0) + newLabel.increase_counter;
        }
        const d = kMerge(label, newLabel);
        return d;
    }
}
