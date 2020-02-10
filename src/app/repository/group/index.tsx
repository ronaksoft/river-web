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
import {InputPeer, PeerType} from "../../services/sdk/messages/chat.core.types_pb";
import SDK from "../../services/sdk";

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
    private sdk: SDK;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.broadcaster = Broadcaster.getInstance();
        this.sdk = SDK.getInstance();
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
        return this.db.groups.get(id).then((g: IGroup | undefined) => {
            if (g) {
                this.dbService.setGroup(g);
            }
            return g;
        });
    }

    public getFull(id: string, cacheCB?: (gs: IGroup) => void): Promise<IGroup> {
        return new Promise<IGroup>((resolve, reject) => {
            this.get(id).then((group) => {
                if (group) {
                    if (cacheCB) {
                        cacheCB(group);
                    }
                    const input: InputPeer = new InputPeer();
                    input.setType(PeerType.PEERGROUP);
                    input.setId(id);
                    input.setAccesshash('0');
                    this.sdk.groupGetFull(input).then((res) => {
                        if (res) {
                            this.upsert([res]);
                            resolve(res);
                        } else {
                            reject('none found');
                        }
                    }).catch((err) => {
                        reject(err);
                    });
                } else {
                    reject('none found');
                }
            });
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
        groups = groups.filter(g => g.id);
        if (groups.length === 0) {
            return Promise.resolve();
        }
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
        if (newGroup.remove_photo) {
            delete d.remove_photo;
            d.photo = undefined;
        }
        return d;
    }
}
