/*
    Creation Time: 2019 - Dec - 15
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import DB from '../../services/db/label';
import {ILabel, ILabelItem} from './interface';
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

    public removeMany(ids: number[]): Promise<any> {
        const promises: any[] = [];
        ids.forEach((id) => {
            this.dbService.removeLabel(id);
            promises.push(this.db.labels.delete(id));
        });
        return Promise.all(promises);
    }

    public getMessageByItem(id: number, {max, limit}: { min?: number, max?: number, limit?: number }): Promise<IMessage[]> {
        let lim = limit || 1000;
        return new Promise((resolve, reject) => {
            this.getCachedMessageByItem(id, {max, limit: lim}).then((cacheRes) => {
                if (cacheRes.length < lim) {
                    lim = lim - cacheRes.length;
                    if (cacheRes.length > 0) {
                        max = (cacheRes[cacheRes.length - 1].id || 0) - 1;
                    }
                    this.sdk.labelList(id, 0, max || 0, lim).then((remoteRes) => {
                        this.insertManyLabelItem(id, remoteRes.messagesList);
                        this.messageRepo.lazyUpsert(remoteRes.messagesList, true);
                        this.userRepo.importBulk(false, remoteRes.usersList);
                        this.groupRepo.importBulk(remoteRes.groupsList);
                        resolve([...cacheRes, ...MessageRepo.parseMessageMany(remoteRes.messagesList, this.userRepo.getCurrentUserId())]);
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

    public getCachedMessageByItem(id: number, {max, limit}: { min?: number, max?: number, limit?: number }): Promise<IMessage[]> {
        const pipe = this.db.labelItems.where('[lid+mid]');
        let pipe2: Dexie.Collection<ILabelItem, number>;
        if (max) {
            pipe2 = pipe.between([id, Dexie.minKey], [id, (max || 0) - 1], true, true);
        } else {
            pipe2 = pipe.between([id, Dexie.minKey], [id, Dexie.maxKey], true, true);
        }
        return pipe2.reverse().toArray().then((res) => {
            const ids = res.map((item) => {
                return item.mid || 0;
            });
            return this.messageRepo.getIn(ids, false);
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

    private insertManyLabelItem(labelId: number, messageList: IMessage[]) {
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
