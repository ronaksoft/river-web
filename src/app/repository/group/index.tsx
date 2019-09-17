/*
    Creation Time: 2018 - Nov - 26
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import DB from '../../services/db/user';
import {IGroup} from './interface';
import {differenceBy, find, uniqBy} from 'lodash';
import {DexieUserDB} from '../../services/db/dexie/user';
import Broadcaster from '../../services/broadcaster';
import {kMerge} from "../../services/utilities/kDash";

export default class GroupRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new GroupRepo();
        }

        return this.instance;
    }

    private static instance: GroupRepo;

    private dbService: DB;
    private db: DexieUserDB;
    private broadcaster: Broadcaster;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.broadcaster = Broadcaster.getInstance();
    }

    public create(group: IGroup) {
        return this.db.groups.put(group);
    }

    public createMany(group: IGroup[]) {
        return this.db.groups.bulkPut(group);
    }

    public get(id: string): Promise<IGroup> {
        const group = this.dbService.getGroup(id);
        if (group) {
            return Promise.resolve(group);
        }
        return this.db.groups.get(id).then((g: IGroup) => {
            if (g) {
                this.dbService.setGroup(g);
            }
            return g;
        });
    }

    public getManyCache({keyword, limit}: any): Promise<IGroup[]> {
        if (!keyword) {
            return this.db.groups.limit(limit || 100).toArray();
        }
        const reg = new RegExp(keyword || '', 'gi');
        return this.db.groups.filter((g) => {
            return reg.test(g.title || '');
        }).limit(limit || 12).toArray();
    }

    public importBulk(groups: IGroup[], callerId?: number): Promise<any> {
        if (!groups || groups.length === 0) {
            return Promise.resolve();
        }
        const tempGroup = uniqBy(groups, 'id');
        return this.upsert(tempGroup, callerId);
    }

    public upsert(groups: IGroup[], callerId?: number): Promise<any> {
        const ids = groups.map((group) => {
            return group.id || '';
        });
        return this.db.groups.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IGroup[] = differenceBy(groups, result, 'id');
            const updateItems: IGroup[] = result;
            updateItems.map((group: IGroup) => {
                const t = find(groups, {id: group.id});
                if (t) {
                    return this.mergeCheck(group, t);
                } else {
                    return group;
                }
            });
            const list = [...createItems, ...updateItems];
            list.forEach((item) => {
                this.dbService.setGroup(item);
            });
            return this.createMany(list);
        }).then((res) => {
            this.broadcastEvent('Group_DB_Updated', {ids, callerId});
            return res;
        });
    }

    private broadcastEvent(name: string, data: any) {
        this.broadcaster.publish(name, data);
    }

    private mergeCheck(group: IGroup, newGroup: IGroup): IGroup {
        const d = kMerge(group, newGroup);
        d.flagsList = newGroup.flagsList || [];
        if (newGroup.delete_photo) {
            delete d.delete_photo;
            d.photo = undefined;
        }
        return d;
    }
}
