/*
    Creation Time: 2018 - Nov - 26
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import DB from '../../services/db/user';
import {IGroup, IGroupParticipant} from './interface';
import {differenceWith, find, throttle, uniq, uniqBy} from 'lodash';
import {DexieUserDB} from '../../services/db/dexie/user';
import Broadcaster from '../../services/broadcaster';
import {kMerge} from "../../services/utilities/kDash";
import {InputPeer, PeerType} from "../../services/sdk/messages/core.types_pb";
import APIManager from "../../services/sdk";
import RiverTime from "../../services/utilities/river_time";
import Dexie from "dexie";
import UserRepo from "../user";
import {IUser} from "../user/interface";

export const GroupDBUpdated = 'Group_DB_Updated';

interface IGroupAction {
    callerId?: number;
    groups: IGroup[];
    reject: any;
    resolve: any;
}

export const mergeParticipant = (participants: IGroupParticipant[], users: IUser[]) => {
    const userMap: { [key: string]: IUser } = {};
    users.forEach((user) => {
        userMap[user.id] = user;
    });
    return  participants.map((participant) => {
        if (userMap[participant.userid]) {
            participant.deleted = userMap[participant.userid].deleted;
        }
        return participant;
    });
};

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
    private userRepo: UserRepo;
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
        this.userRepo = UserRepo.getInstance();
    }

    public create(group: IGroup) {
        return this.db.groups.put(group);
    }

    public createMany(group: IGroup[]) {
        return this.db.groups.bulkPut(group);
    }

    public get(teamId: string, id: string): Promise<IGroup | undefined> {
        const group = this.dbService.getGroup(teamId, id);
        if (group) {
            return Promise.resolve(group);
        }
        return this.db.groups.get([teamId, id]).then((g: IGroup | undefined) => {
            if (g) {
                this.dbService.setGroup(g);
            }
            return g;
        });
    }

    public findInArray(teamId: string, ids: string[], skip: number, limit: number): Promise<IGroup[]> {
        if (ids.length === 0) {
            return Promise.resolve([]);
        }
        const queries: any[] = ids.map((id) => {
            return [teamId, id];
        });
        return this.db.groups.where('[teamid+id]').anyOf(queries).offset(skip || 0).limit(limit).toArray();
    }

    public getFull(teamId: string, id: string, cacheCB?: (gs: IGroup) => void, options?: {checkLastUpdate?: boolean, callerId?: number}): Promise<IGroup> {
        return new Promise<IGroup>((resolve, reject) => {
            this.get(teamId, id).then((group) => {
                if (group) {
                    if (cacheCB) {
                        cacheCB(group);
                    }
                    if (options && options.checkLastUpdate && group.last_updated && (this.riverTime.now() - (group.last_updated || 0)) < 60) {
                        resolve(group);
                        return;
                    }
                    const input: InputPeer = new InputPeer();
                    input.setType(PeerType.PEERGROUP);
                    input.setId(id);
                    input.setAccesshash('0');
                    this.apiManager.groupGetFull(input).then((res) => {
                        let g: IGroup | undefined = res.group;
                        if (res.participantsList && res.participantsList.length > 0) {
                            g.participantsList = mergeParticipant(res.participantsList as any, res.usersList);
                        }
                        if (res.usersList) {
                            this.userRepo.importBulk(false, res.usersList);
                        }
                        g.photogalleryList = res.photogalleryList;
                        if (g) {
                            g = this.mergeCheck(group, g);
                            g.last_updated = this.riverTime.now();
                            this.importBulk([g], options ? options.callerId : undefined);
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

    public getManyCache(teamId: string, {keyword, limit}: any): Promise<IGroup[]> {
        if (!keyword) {
            return this.db.groups.limit(limit || 100).toArray();
        }
        const reg = new RegExp(keyword || '', 'gi');
        return this.db.groups.where('[teamid+id]').between([teamId, Dexie.minKey], [teamId, Dexie.maxKey], true, true).filter((g) => {
            return reg.test(g.title || '');
        }).limit(limit || 12).toArray();
    }

    public importBulk(groups: IGroup[], callerId?: number): Promise<any> {
        if (!groups || groups.length === 0) {
            return Promise.resolve();
        }

        const uniqueGroup = uniqBy(groups, 'id');
        if (this.actionList.length === 0 && !this.actionBusy) {
            this.actionBusy = true;
            return this.upsert(groups, callerId).finally(() => {
                this.actionBusy = false;
                this.applyActions();
            });
        }

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
        const ids: string[] = [];
        const pairs: Array<[string, string]> = groups.map((group) => {
            group.teamid = group.teamid || '0';
            ids.push(`${group.teamid}_${group.id || '0'}`);
            return [group.teamid, group.id || ''];
        });
        return this.db.groups.where('[teamid+id]').anyOf(pairs).toArray().then((result) => {
            const createItems: IGroup[] = differenceWith(groups, result, (o1, o2) => {
                return o1.teamid === o2.teamid && o1.id === o2.id;
            });
            createItems.map((item) => {
                if (item.participantsList) {
                    item.participantsList = uniqBy(item.participantsList, 'userid');
                }
                return item;
            });
            const updateItems: IGroup[] = result.map((group: IGroup) => {
                const t = find(groups, {id: group.id, teamid: group.teamid});
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
                this.broadcastEvent(GroupDBUpdated, {callerId, ids});
            } else {
                this.throttleBroadcast(ids);
            }
            return res;
        });
    }

    private mergeCheck(group: IGroup, newGroup: IGroup): IGroup {
        if (newGroup.participantsList && newGroup.participantsList.length > 0) {
            group.participantsList = uniqBy(newGroup.participantsList, 'userid');
        }
        if (newGroup.photogalleryList) {
            group.photogalleryList = newGroup.photogalleryList;
        }
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
