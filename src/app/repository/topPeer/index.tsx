/*
    Creation Time: 2020 - June - 01
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import DB from '../../services/db/top_peer';
import {ITopPeer} from './interface';
import {differenceBy, find, groupBy} from 'lodash';
import APIManager from "../../services/sdk";
import RiverTime from "../../services/utilities/river_time";
import {DexieTopPeerDB} from "../../services/db/dexie/top_peer";
import {TopPeer} from "../../services/sdk/messages/chat.api.contacts_pb";
import Dexie from "dexie";

export const C_TOP_PEER_LEN = 20;
export const C_BASE_TIME = 1577836800;

export enum TopPeerType {
    BotInline = 0x03,
    BotMessage = 0x04,
    Forward = 0x02,
    Search = 0x01,
}

export interface ITopPeerWithType extends ITopPeer {
    type: TopPeerType;
}

interface ITopPeerAction {
    type: TopPeerType;
    topPeers: ITopPeer[];
    reject: any;
    resolve: any;
}

export default class TopPeerRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new TopPeerRepo();
        }

        return this.instance;
    }

    private static instance: TopPeerRepo;

    private dbService: DB;
    private db: DexieTopPeerDB;
    private apiManager: APIManager;
    private riverTime: RiverTime;
    private actionList: ITopPeerAction[][] = [];
    private actionBusyList: boolean[] = [];

    private constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.apiManager = APIManager.getInstance();
        this.riverTime = RiverTime.getInstance();
        for (let i = 1; i <= 4; i++) {
            this.actionList[i] = [];
            this.actionBusyList[i] = false;
        }
    }

    public create(type: TopPeerType, topPeer: ITopPeer) {
        return this.getDbByType(type).put(topPeer);
    }

    public createMany(type: TopPeerType, topPeers: ITopPeer[]) {
        return this.getDbByType(type).bulkPut(topPeers);
    }

    public remove(type: TopPeerType, id: string) {
        return this.getDbByType(type).delete(id);
    }

    public insertFromRemote(type: TopPeerType, remoteTopPeers: TopPeer.AsObject[]) {
        const topPeers = (remoteTopPeers as ITopPeer[]).map((tp: ITopPeer) => {
            if (tp.peer) {
                tp.id = tp.peer.id || '';
            }
            return tp;
        });
        return this.createMany(type, topPeers);
    }

    public get(type: TopPeerType, id: string): Promise<ITopPeer> {
        return this.getDbByType(type).get(id);
    }

    public list(type: TopPeerType, limit: number): Promise<ITopPeer[]> {
        return this.getDbByType(type).where('[rate+id]').between([Dexie.minKey, Dexie.minKey], [Dexie.maxKey, Dexie.maxKey]).reverse().limit(limit).toArray();
    }

    public importBulkEmbedType(topPeers: ITopPeerWithType[]): Promise<any> {
        if (topPeers.length === 0) {
            return Promise.resolve();
        }
        if (topPeers.length === 1) {
            const type = topPeers[0].type;
            delete topPeers[0].type;
            return this.importBulk(type, topPeers);
        } else {
            const topPeerGroups = groupBy(topPeers, (o => o.type));
            const promises: any[] = [];
            Object.values(topPeerGroups).forEach((tps) => {
                if (tps.length > 0) {
                    promises.push(this.importBulk(tps[0].type, tps));
                }
            });
            if (promises.length > 0) {
                return Promise.all(promises);
            }
        }
        return Promise.resolve();
    }

    public importBulk(type: TopPeerType, topPeers: ITopPeer[]): Promise<any> {
        if (!topPeers || topPeers.length === 0) {
            return Promise.resolve();
        }

        if (this.actionList[type].length === 0 && !this.actionBusyList[type]) {
            this.actionBusyList[type] = true;
            return this.upsert(type, topPeers).finally(() => {
                this.actionBusyList[type] = false;
            });
        }

        let internalResolve = null;
        let internalReject = null;

        const promise = new Promise<any>((res, rej) => {
            internalResolve = res;
            internalReject = rej;
        });
        this.actionList[type].push({
            reject: internalReject,
            resolve: internalResolve,
            topPeers,
            type,
        });
        this.applyActions(type);
        return promise;
    }

    private applyActions(type: TopPeerType) {
        if (!this.actionBusyList[type] && this.actionList[type].length > 0) {
            const action = this.actionList[type].shift();
            if (action) {
                this.actionBusyList[type] = true;
                this.upsert(action.type, action.topPeers).then((res) => {
                    action.resolve(res);
                }).catch((err) => {
                    action.reject(err);
                }).finally(() => {
                    this.actionBusyList[type] = false;
                    this.applyActions(type);
                });
            }
        }
    }

    private upsert(type: TopPeerType, topPeers: ITopPeer[]): Promise<any> {
        if (topPeers.length === 0) {
            return Promise.resolve();
        }
        const ids = topPeers.map((topPeer) => {
            // @ts-ignore
            delete topPeer.type;
            return topPeer.id || '';
        });
        return this.getDbByType(type).where('id').anyOf(ids).toArray().then((result) => {
            const createItems: ITopPeer[] = differenceBy(topPeers, result, 'id').map((t) => this.computeRate(t));
            const updateItems: ITopPeer[] = result.map((topPeer: ITopPeer) => {
                const t = find(topPeers, {id: topPeer.id});
                if (t) {
                    return this.computeRate(t, topPeer);
                } else {
                    return this.computeRate(topPeer);
                }
            });
            const list = [...createItems, ...updateItems];
            return this.createMany(type, list);
        });
    }

    private computeRate(topPeer: ITopPeer, lastTopPeer?: ITopPeer) {
        const config = this.apiManager.getInstantSystemConfig();
        const lastTime = lastTopPeer ? lastTopPeer.lastupdate : (C_BASE_TIME + this.riverTime.getDiff());
        topPeer.rate = lastTopPeer ? lastTopPeer.rate : 0;
        topPeer.rate += Math.min(Math.exp((topPeer.lastupdate - lastTime) / (config.toppeerdecayrate || 1)), (config.toppeermaxstep || 320));
        return topPeer;
    }

    private getDbByType(type: TopPeerType) {
        switch (type) {
            case TopPeerType.BotInline:
                return this.db.botinline;
            case TopPeerType.BotMessage:
                return this.db.botmessage;
            case TopPeerType.Forward:
                return this.db.forward;
            case TopPeerType.Search:
                return this.db.search;
        }
    }
}
