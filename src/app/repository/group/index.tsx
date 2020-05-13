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
import {differenceBy, find, throttle, uniq, uniqBy} from 'lodash';
import {DexieUserDB} from '../../services/db/dexie/user';
import Broadcaster from '../../services/broadcaster';
import {kMerge} from "../../services/utilities/kDash";
import {InputPeer, PeerType} from "../../services/sdk/messages/chat.core.types_pb";
import APIManager from "../../services/sdk";
import RiverTime from "../../services/utilities/river_time";

export const GroupDBUpdated = 'Group_DB_Updated';

interface IGroupAction {
    callerId?: number;
    groups: IGroup[];
    reject: any;
    resolve: any;
}

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
    private apiManager: APIManager;
    private riverTime: RiverTime;
    private throttleBroadcastList: string[] = [];
    private readonly throttleBroadcastExecute: any = undefined;
    private actionList: IGroupAction[] = [];
    private actionBusy: boolean = false;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.broadcaster = Broadcaster.getInstance();
        this.apiManager = APIManager.getInstance();
        this.throttleBroadcastExecute = throttle(this.broadcastThrottledList, 255);
        this.riverTime = RiverTime.getInstance();
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

    public getFull(id: string, cacheCB?: (gs: IGroup) => void, checkLastUpdate?: boolean): Promise<IGroup> {
        return new Promise<IGroup>((resolve, reject) => {
            this.get(id).then((group) => {
                if (group) {
                    if (cacheCB) {
                        cacheCB(group);
                    }
                    if (checkLastUpdate && group.last_updated && (this.riverTime.now() - (group.last_updated || 0)) < 60) {
                        resolve(group);
                        return;
                    }
                    const input: InputPeer = new InputPeer();
                    input.setType(PeerType.PEERGROUP);
                    input.setId(id);
                    input.setAccesshash('0');
                    this.apiManager.groupGetFull(input).then((res) => {
                        let g: IGroup | undefined = res.group;
                        g.participantList = res.participantsList;
                        g.photogalleryList = res.photogalleryList;
                        if (g) {
                            g = kMerge(group, g);
                            g.last_updated = this.riverTime.now();
                            this.importBulk([g]);
                            resolve(g);
                        } else {
                            reject('not_found');
                        }
                    }).catch((err) => {
                        reject(err);
                    });
                } else {
                    reject('not_found');
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
        const uniqueGroup = uniqBy(groups, 'id');
        let internalResolve = null;
        let internalReject = null;

        const promise = new Promise<any>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });
        this.actionList.push({
            callerId,
            groups: uniqueGroup,
            reject: internalReject,
            resolve: internalResolve,
        });
        this.applyActions();
        return promise;
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
            if (callerId) {
                this.broadcastEvent(GroupDBUpdated, {ids, callerId});
            } else {
                this.throttleBroadcast(ids);
            }
            return res;
        });
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

    private throttleBroadcast(ids: string[]) {
        if (ids.length > 0) {
            this.throttleBroadcastList.push(...ids);
            this.throttleBroadcastList = uniq(this.throttleBroadcastList);
        }
        setTimeout(() => {
            this.throttleBroadcastExecute();
        }, 50);
    }

    private broadcastThrottledList = () => {
        if (this.throttleBroadcastList.length === 0) {
            return;
        }
        this.broadcastEvent(GroupDBUpdated, {ids: this.throttleBroadcastList});
        this.throttleBroadcastList = [];
    }

    private applyActions() {
        if (!this.actionBusy && this.actionList.length > 0) {
            const action = this.actionList.shift();
            if (action) {
                this.actionBusy = true;
                this.upsert(action.groups, action.callerId).then((res) => {
                    action.resolve(res);
                }).catch((err) => {
                    action.reject(err);
                }).finally(() => {
                    this.actionBusy = false;
                    this.applyActions();
                });
            }
        }
    }

    private broadcastEvent(name: string, data: any) {
        this.broadcaster.publish(name, data);
    }
}
