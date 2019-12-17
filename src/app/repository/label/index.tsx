/*
    Creation Time: 2019 - Dec - 15
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import DB from '../../services/db/label';
import {ILabel} from './interface';
import {differenceBy, find, uniqBy} from 'lodash';
import {DexieLabelDB} from '../../services/db/dexie/label';
import Broadcaster from '../../services/broadcaster';
import {kMerge} from "../../services/utilities/kDash";
import SDK from "../../services/sdk";

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
    private broadcaster: Broadcaster;
    private sdk: SDK;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
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

    private broadcastEvent(name: string, data: any) {
        this.broadcaster.publish(name, data);
    }

    private mergeCheck(label: ILabel, newLabel: ILabel): ILabel {
        const d = kMerge(label, newLabel);
        return d;
    }
}
