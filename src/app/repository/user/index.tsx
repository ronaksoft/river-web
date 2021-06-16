/*
    Creation Time: 2018 - Sep - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import DB from '../../services/db/user';
import {IContact, IUser} from './interface';
import {differenceBy, find, throttle, uniq} from 'lodash';
import APIManager, {currentUserId} from "../../services/sdk";
import {DexieUserDB} from '../../services/db/dexie/user';
import {Int64BE} from 'int64-buffer';
// @ts-ignore
import CRC from 'js-crc/build/crc.min';
import {InputUser, User, UserStatus} from '../../services/sdk/messages/core.types_pb';
import RiverTime from '../../services/utilities/river_time';
import Broadcaster from '../../services/broadcaster';
import {kMerge, kUserMerge} from "../../services/utilities/kDash";
import {C_ERR, C_ERR_ITEM, C_LOCALSTORAGE} from "../../services/sdk/const";
import Dexie from 'dexie';

export const UserDBUpdated = 'User_DB_Updated';

export const getContactsCrc = (users: IUser[]) => {
    const ids = users.map((user) => {
        const space = '                    ';
        const id = user.id || '';
        const wLen = 20 - id.length;
        return {
            id: new Int64BE(id),
            wid: space.slice(0, wLen) + id
        };
    });
    ids.sort((i1, i2) => {
        return i1.wid < i2.wid ? -1 : 1;
    });
    const data: number[] = [];
    ids.forEach((id) => {
        data.push(...id.id.toArray());
    });
    return parseInt(CRC.crc32(data), 16);
};

interface IUserAction {
    callerId?: number;
    force?: boolean;
    isContact: boolean;
    reject: any;
    resolve: any;
    teamId?: string;
    users: IUser[];
}

export default class UserRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new UserRepo();
        }

        return this.instance;
    }

    private static instance: UserRepo;

    private dbService: DB;
    private db: DexieUserDB;
    private apiManager: APIManager;
    private lastContactTimestamp: { [key: number]: number } = {};
    private riverTime: RiverTime;
    private broadcaster: Broadcaster;
    private bubbleMode: string = localStorage.getItem(C_LOCALSTORAGE.ThemeBubble) || '4';
    private throttleBroadcastList: string[] = [];
    private readonly throttleBroadcastExecute: any = undefined;
    private actionList: IUserAction[] = [];
    private actionBusy: boolean = false;

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.apiManager = APIManager.getInstance();
        this.broadcaster = Broadcaster.getInstance();
        this.throttleBroadcastExecute = throttle(this.broadcastThrottledList, 255);
        this.riverTime = RiverTime.getInstance();
    }

    public getBubbleMode() {
        return this.bubbleMode;
    }

    public setBubbleMode(mode: string) {
        this.bubbleMode = mode;
    }

    public getCurrentUserId(): string {
        return this.apiManager.getConnInfo().userid || '0';
    }

    public create(user: IUser) {
        return this.db.users.put(user);
    }

    public createMany(users: IUser[]) {
        return this.db.users.bulkPut(users);
    }

    public get(id: string): Promise<IUser | undefined> {
        if (!id || id === '') {
            return Promise.reject();
        }
        const user = this.dbService.getUser(id);
        if (user) {
            return Promise.resolve(user);
        }
        return this.db.users.get(id).then((u: IUser | undefined) => {
            if (u) {
                this.dbService.setUser(u);
            }
            return u;
        });
    }

    public findInArray(ids: string[], skip: number, limit: number): Promise<IUser[]> {
        if (ids.length === 0) {
            return Promise.resolve([]);
        }
        return this.db.users.where('id').anyOf(ids).offset(skip || 0).limit(limit).toArray();
    }

    public getFull(id: string, cacheCB?: (us: IUser) => void, callerId?: number, checkLastUpdate?: boolean): Promise<IUser> {
        return new Promise<IUser>((resolve, reject) => {
            this.get(id).then((user) => {
                if (user) {
                    if (cacheCB) {
                        cacheCB(user);
                    }
                    if (checkLastUpdate && user.last_updated && (this.riverTime.now() - (user.last_updated || 0)) < 60) {
                        resolve(user);
                        return;
                    }
                    const input: InputUser = new InputUser();
                    input.setUserid(user.id || '');
                    input.setAccesshash(user.accesshash || '');
                    this.apiManager.getUserFull([input]).then((res) => {
                        let u: IUser | undefined = find(res.usersList, {id});
                        if (u) {
                            u.is_contact = user.is_contact;
                            if (user.phone && user.phone.length > 0) {
                                u.phone = user.phone;
                            }
                            u = kUserMerge(user, u);
                            u.last_updated = this.riverTime.now();
                            this.importBulk(false, [u], false, callerId);
                            resolve(u);
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

    public getInstantContact(id: string): IUser | null {
        const contact = this.dbService.getUser(id);
        if (contact && (contact.is_contact || contact.accesshash !== '')) {
            return contact;
        } else {
            return null;
        }
    }

    public getInstant(id: string): IUser | null {
        return this.dbService.getUser(id);
    }

    public getManyInstant(ids: string[]): Array<IUser | null> {
        return ids.map(o => this.dbService.getUser(o));
    }

    public getManyCache(teamId: string, isContact: boolean, {keyword, limit, filterDeleted}: { keyword?: string, limit?: number, filterDeleted?: boolean }): Promise<IUser[]> {
        if (keyword) {
            keyword = keyword.replace('\\', '');
        }
        const reg = new RegExp(keyword || '', 'gi');
        const searchFilter = (u: IUser) => {
            if (u.id === currentUserId && reg.test('Saved Messages')) {
                return true;
            }
            if (filterDeleted && u.deleted) {
                return false;
            }
            if (!keyword) {
                return true;
            }
            return (reg.test(u.phone || '') || reg.test(u.username || '') || reg.test(`${u.firstname} ${u.lastname}`));
        };
        if (isContact || teamId !== '0') {
            return this.searchTeamContacts(teamId, keyword || filterDeleted ? searchFilter : undefined);
        } else {
            if (!keyword && !filterDeleted) {
                return this.db.users.limit(limit || 1000).toArray();
            }
            return this.db.users.filter(searchFilter).limit(limit || 12).toArray();
        }
    }

    public getByUsername(username: string) {
        return this.db.users.where('[is_contact+username]').between([0, username], [1, username], true, true).first().then((res) => {
            if (res && res.username === username) {
                return res;
            } else {
                return this.apiManager.contactSearch(username).then((remoteRes) => {
                    if (remoteRes.usersList.length > 0) {
                        this.importBulk(false, remoteRes.usersList);
                        return remoteRes.usersList[0] as IUser;
                    } else {
                        throw Error('not found');
                    }
                });
            }
        });
    }

    public computeHash(teamId: string) {
        this.getContactList(teamId).then((list) => {
            this.storeContactsCrc(teamId, list);
            this.lastContactTimestamp[teamId] = 0;
        });
    }

    public importBulk(isContact: boolean, users: IUser[], force?: boolean, callerId?: number, teamId?: string): Promise<any> {
        if (!users || users.length === 0) {
            return Promise.resolve();
        }

        // TODO merge user
        // const uniqUsers = uniqBy(users, 'id');
        const uniqUsers = users;

        if (this.actionList.length === 0 && !this.actionBusy) {
            this.actionBusy = true;
            return this.upsert(isContact, uniqUsers, force, callerId, teamId).finally(() => {
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
            force,
            isContact,
            reject: internalReject,
            resolve: internalResolve,
            teamId,
            users: uniqUsers,
        });
        this.applyActions();
        return promise;
    }

    public upsert(isContact: boolean, users: IUser[], force?: boolean, callerId?: number, teamId?: string): Promise<any> {
        const ids = users.map((user) => {
            if (isContact) {
                user.is_contact = 1;
            }
            return user.id || '';
        });
        if (users.length === 0) {
            return Promise.resolve();
        }
        return this.db.users.where('id').anyOf(ids).toArray().then((result) => {
            const createItems: IUser[] = differenceBy(users, result, 'id');
            const now = this.riverTime.now();
            const updateItems: IUser[] = result.map((user: IUser) => {
                if (user.dont_update_last_modified) {
                    delete user.dont_update_last_modified;
                } else {
                    user.last_modified = now;
                }
                return this.mergeUser(users, user, force);
            });
            createItems.forEach((user: IUser) => {
                if (user.dont_update_last_modified) {
                    delete user.dont_update_last_modified;
                } else {
                    user.last_modified = now;
                }
                if (user.status === UserStatus.USERSTATUSONLINE && !user.status_last_modified) {
                    user.status_last_modified = now;
                } else if (user.lastseen) {
                    user.status_last_modified = user.lastseen;
                }
                if (user.remove_photo) {
                    delete user.remove_photo;
                }
            });
            const list = [...createItems, ...updateItems];
            list.forEach((item) => {
                this.dbService.setUser(item);
            });
            if (isContact && teamId) {
                this.setContactList(users.map((o) => {
                    return {
                        id: o.id || '0',
                        teamid: teamId,
                    };
                }));
            }
            return this.createMany(list);
        }).then((res) => {
            if (callerId) {
                this.broadcastEvent(UserDBUpdated, {callerId, ids});
            } else {
                this.throttleBroadcast(ids);
            }
            return res;
        });
    }

    public invalidateCacheByTeamId(teamId: string) {
        delete this.lastContactTimestamp[teamId];
    }

    public getAllContacts(teamId: string, cb?: (users: IUser[]) => void, filter?: { filterDeleted?: boolean }): Promise<IUser[]> {
        const searchParam = {filterDeleted: filter ? filter.filterDeleted : undefined};
        if (cb) {
            this.getManyCache(teamId, true, searchParam).then((res) => {
                cb(res);
            });
        }
        return new Promise((resolve, reject) => {
            const now = Math.floor(Date.now() / 1000);
            if (now - (this.lastContactTimestamp[teamId] || 0) < 1800) {
                this.getManyCache(teamId, true, searchParam).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            } else {
                const crc32 = this.getContactsCrc(teamId);
                this.apiManager.getContacts(crc32, teamId).then((remoteRes) => {
                    if (remoteRes.modified) {
                        const promises = [
                            this.importBulk(true, remoteRes.contactusersList),
                            this.importBulk(false, remoteRes.usersList),
                        ];
                        this.removeContactList(teamId).then(() => {
                            this.setContactList(remoteRes.usersList.map((o) => {
                                return {
                                    id: o.id || '0',
                                    teamid: teamId,
                                };
                            }));
                        });
                        this.storeContactsCrc(teamId, remoteRes.contactusersList);
                        this.lastContactTimestamp[teamId] = now;
                        Promise.all(promises).then(() => {
                            this.getManyCache(teamId, true, searchParam).then((res) => {
                                resolve(res);
                            });
                        });
                    } else {
                        this.lastContactTimestamp[teamId] = now;
                        this.getManyCache(teamId, true, searchParam).then((res) => {
                            resolve(res);
                        });
                    }
                });
            }
        });
    }

    public removeContact(teamId: string, id: string) {
        return this.db.users.where('id').equals(id).first().then((user) => {
            if (user) {
                user.is_contact = 0;
                this.dbService.setUser(user);
                this.createMany([user]);
                this.db.contacts.delete([teamId, id]);
            }
        });
    }

    public removeManyContacts(teamId: string) {
        return this.getContactList(teamId).then((res) => {
            const ids = res.map(o => o.id);
            return this.db.users.where('id').anyOf(ids).toArray().then((users) => {
                const t = users.map((user) => {
                    user.is_contact = 0;
                    return user;
                });
                return this.createMany(t).then(() => {
                    return this.removeContactList(teamId);
                });
            });
        });
    }

    public contactSearch(query: string) {
        return this.apiManager.contactSearch(query).then((res) => {
            this.importBulk(false, res.usersList);
            return res.usersList;
        }).catch((err) => {
            if (err.code === C_ERR.ErrCodeUnavailable && err.items === C_ERR_ITEM.ErrItemUsername) {
                return [] as User.AsObject[];
            } else {
                throw err;
            }
        });
    }

    public isTeamMember(teamId: string, userId: string) {
        return this.db.contacts.where('[teamid+id]').equals([teamId, userId]).first().then((res) => {
            return Boolean(res);
        });
    }

    public addManyTeamMember(teamId: string, users: IUser[]) {
        return this.importBulk(true, users, undefined, undefined, teamId);
    }

    public removeManyTeamMember(list: Array<[string, string]>) {
        return this.db.contacts.where('[teamid+id]').anyOf(list).delete();
    }

    private mergeUser(users: IUser[], user: IUser, force?: boolean) {
        const t = find(users, {id: user.id});
        if (user.remove_photo) {
            if (t) {
                delete t.remove_photo;
                t.photo = undefined;
            }
            delete user.remove_photo;
            user.photo = undefined;
        }
        const modifyUser = (u1: IUser, u2: IUser): IUser => {
            if (u2.status === UserStatus.USERSTATUSONLINE && !u2.status_last_modified) {
                u2.status_last_modified = RiverTime.getInstance().now();
            }
            if (u1.status !== undefined && u2.status === undefined) {
                u2.status = u1.status;
            }
            // if (u1.status_last_modified !== undefined && u2.status_last_modified === undefined) {
            //     u2.status_last_modified = u1.status_last_modified;
            // }
            if (!force && u1.username && u1.username.length > 0 && (!u2.username || (u2.username && u2.username.length === 0))) {
                u2.username = u1.username;
            }
            if (!force && u1.bio && u1.bio.length > 0 && (!u2.bio || (u2.bio && u2.bio.length === 0))) {
                u2.bio = u1.bio;
            }
            if (!force && u1.phone && u1.phone.length > 0 && (!u2.phone || (u2.phone && u2.phone.length === 0))) {
                u2.phone = u1.phone;
            }
            if ((u2.status_last_modified || 0) < (u2.lastseen || 0)) {
                u2.status_last_modified = u2.lastseen;
            }
            if (u2.status === UserStatus.USERSTATUSOFFLINE) {
                u2.status_last_modified = 0;
                u2.lastseen = 0;
            }
            if (u2.photogalleryList) {
                u1.photogalleryList = u2.photogalleryList;
            }
            if (u1.accesshash !== '0' && u2.accesshash === '0') {
                u2.accesshash = u1.accesshash;
            }
            return kMerge(u1, u2);
        };
        if (t && user.is_contact === 1) {
            t.is_contact = 1;
            return modifyUser(user, t);
        } else if (t) {
            return modifyUser(user, t);
        } else {
            return user;
        }
    }

    private getContactsCrc(teamId: string) {
        const crc = localStorage.getItem(C_LOCALSTORAGE.ContactsHash);
        if (!crc) {
            return 0;
        }
        const crcData = JSON.parse(crc);
        if (crcData[teamId]) {
            return parseInt(crcData[teamId], 10);
        } else {
            return 0;
        }
    }

    private storeContactsCrc(teamId: string, users: IUser[]) {
        const crc = localStorage.getItem(C_LOCALSTORAGE.ContactsHash);
        const crcData = crc ? JSON.parse(crc) : {};
        crcData[teamId] = getContactsCrc(users);
        localStorage.setItem(C_LOCALSTORAGE.ContactsHash, JSON.stringify(crcData));
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
        this.broadcastEvent(UserDBUpdated, {ids: this.throttleBroadcastList});
        this.throttleBroadcastList = [];
    }

    private applyActions() {
        if (!this.actionBusy && this.actionList.length > 0) {
            const action = this.actionList.shift();
            if (action) {
                this.actionBusy = true;
                this.upsert(action.isContact, action.users, action.force, action.callerId, action.teamId).then((res) => {
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

    private setContactList(contacts: IContact[]) {
        return this.db.contacts.bulkPut(contacts);
    }

    private getContactList(teamId: string) {
        return this.db.contacts.where('[teamid+id]').between([teamId, Dexie.minKey], [teamId, Dexie.maxKey], true, true).toArray();
    }

    private removeContactList(teamId: string) {
        return this.db.contacts.where('[teamid+id]').between([teamId, Dexie.minKey], [teamId, Dexie.maxKey], true, true).toArray((res) => {
            const ids: any[] = res.map(o => [o.teamid, o.id]);
            return this.db.contacts.bulkDelete(ids);
        });
    }

    private searchTeamContacts(teamId: string, filterFn?: any): Promise<IUser[]> {
        return this.getContactList(teamId).then((res) => {
            const p = this.db.users.where('id').anyOf(res.map(o => o.id));
            if (filterFn) {
                return p.filter(filterFn).toArray();
            } else {
                return p.toArray();
            }
        });
    }
}
