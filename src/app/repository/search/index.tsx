/*
    Creation Time: 2018 - Dec - 24
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {IDialogWithContact} from './interface';
import DialogRepo, {SortFn} from '../dialog';
import UserRepo from '../user';
import GroupRepo from '../group';
import {IUser} from '../user/interface';
import MessageRepo from "../message";
import {differenceBy, find, uniqBy} from "lodash";
import {ITopPeerItem} from "../topPeer/interface";
import TopPeerRepo, {C_TOP_PEER_LEN, TopPeerType} from "../topPeer";
import {GroupFlags, PeerType} from "../../services/sdk/messages/core.types_pb";

export default class SearchRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new SearchRepo();
        }

        return this.instance;
    }

    private static instance: SearchRepo;

    private dialogRepo: DialogRepo;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;
    private messageRepo: MessageRepo;
    private topPeerRepo: TopPeerRepo;

    public constructor() {
        this.dialogRepo = DialogRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.messageRepo = MessageRepo.getInstance();
        this.topPeerRepo = TopPeerRepo.getInstance();
    }

    public searchIds(teamId: string, {skip, limit, keyword}: any): Promise<string[]> {
        const promises: any[] = [];
        limit = limit || 12;
        promises.push(this.userRepo.getManyCache(teamId, false, {keyword, limit}));
        promises.push(this.groupRepo.getManyCache(teamId, {keyword, limit}));
        return new Promise<string[]>((resolve, reject) => {
            const ids: { [key: string]: boolean } = {};
            Promise.all(promises).then((arrRes) => {
                arrRes.forEach((res) => {
                    res.forEach((item: any) => {
                        if (!ids.hasOwnProperty(item.id)) {
                            ids[item.id] = true;
                        }
                    });
                });
                resolve(Object.keys(ids));
            }).catch(reject);
        });
    }

    public search = (teamId: string, {skip, limit, keyword}: { skip?: number, limit?: number, keyword?: string }): Promise<IDialogWithContact> => {
        const promises: any[] = [];
        const safeLimit = limit || 128;
        const safeSkip = skip || 0;
        promises.push(this.userRepo.getManyCache(teamId, false, {keyword, limit}));
        promises.push(this.groupRepo.getManyCache(teamId, {keyword, limit}));
        return new Promise<IDialogWithContact>((resolve, reject) => {
            const ids: { [key: string]: boolean } = {};
            const peers: Array<[string, number]> = [];
            Promise.all(promises).then((arrRes) => {
                arrRes.forEach((res) => {
                    res.forEach((item: any) => {
                        if (!ids.hasOwnProperty(item.id)) {
                            ids[item.id] = true;
                            if (item.title) {
                                if (!item.flagsList || item.flagsList.indexOf(GroupFlags.GROUPFLAGSNONPARTICIPANT) === -1) {
                                    peers.push([item.id, PeerType.PEERGROUP]);
                                }
                            } else {
                                peers.push([item.id, PeerType.PEERUSER]);
                                peers.push([item.id, PeerType.PEEREXTERNALUSER]);
                                peers.push([item.id, PeerType.PEERSELF]);
                            }
                        }
                    });
                });
                this.dialogRepo.findInArray(teamId, peers, safeSkip, safeLimit).then((res) => {
                    resolve({
                        contacts: (arrRes[0] || []).filter((user: IUser) => {
                            return user.is_contact === 1;
                        }),
                        dialogs: res.sort(SortFn).slice(0, 16),
                    });
                });
            }).catch(reject);
        });
    }

    public searchUser = (teamId: string, {limit, keyword}: { limit?: number, keyword?: string }): Promise<IDialogWithContact> => {
        return this.userRepo.getManyCache(teamId, false, {keyword, limit}).then((res) => {
            return ({
                contacts: res.filter((user: IUser) => {
                    return user.lastname !== undefined || user.firstname !== undefined;
                }),
                dialogs: [],
            });
        });
    }

    public searchUsersById(ids: string[]) {
        return this.userRepo.findInArray(ids, 0, 1000);
    }

    public getCurrentUserId(): string {
        return this.userRepo.getCurrentUserId();
    }

    public searchAllMessages({keyword, labelIds, teamId}: { keyword: string, labelIds: number[], teamId: string }, params: { after?: number, limit?: number }) {
        return this.messageRepo.searchAll({keyword, labelIds, teamId}, params);
    }

    public searchUsername(username: string) {
        return this.userRepo.contactSearch(username);
    }

    public globalSearch(teamId: string, keyword: string, ignoreUsers: IUser[], callback: (users: IUser[]) => void) {
        const limit = 128;
        const skip = 0;
        let users: IUser[] = [];
        this.userRepo.getManyCache(teamId, false, {filterDeleted: true, keyword, limit}).then((userRes) => {
            const ids: { [key: string]: IUser } = {};
            const peers: Array<[string, number]> = [];
            userRes.forEach((item: IUser) => {
                if (!ids.hasOwnProperty(item.id || '')) {
                    ids[item.id || ''] = item;
                    peers.push([item.id || '', PeerType.PEERUSER]);
                    peers.push([item.id || '', PeerType.PEEREXTERNALUSER]);
                    peers.push([item.id || '', PeerType.PEERSELF]);
                }
            });
            return this.dialogRepo.findInArray(teamId, peers, skip, limit).then((res) => {
                return res.map((d) => {
                    return ids[d.peerid || ''] || null;
                }).filter(o => o !== null);
            });
        }).then((res) => {
            fn(res || []);
        });
        this.searchUsername(keyword).then((res) => {
            fn(res || []);
        });
        const fn = (us: IUser[]) => {
            users = uniqBy([...users, ...us], 'id');
            users = differenceBy(users, ignoreUsers, 'id');
            callback(users);
        };
    }

    public getSearchTopPeers(teamId: string, type: TopPeerType, limit: number, onlyUser?: boolean): Promise<ITopPeerItem[]> {
        return this.topPeerRepo.list(teamId, type, limit).then((res) => {
            const promises: any[] = [];
            const userIds: string[] = [];
            const groupIds: string[] = [];
            res.forEach((item) => {
                if (!item.peer) {
                    return;
                }
                if (item.peer.type === PeerType.PEERUSER || item.peer.type === PeerType.PEEREXTERNALUSER) {
                    userIds.push(item.peer.id || '0');
                } else if (item.peer.type === PeerType.PEERGROUP && onlyUser !== true) {
                    groupIds.push(item.peer.id || '0');
                }
            });
            promises.push(this.userRepo.findInArray(userIds, 0, C_TOP_PEER_LEN));
            promises.push(this.groupRepo.findInArray(teamId, groupIds, 0, C_TOP_PEER_LEN));
            return Promise.all(promises).then((data) => {
                const list: ITopPeerItem[] = [];
                res.forEach((item) => {
                    if (!item.peer) {
                        return;
                    }
                    if (item.peer.type === PeerType.PEERUSER || item.peer.type === PeerType.PEEREXTERNALUSER) {
                        const t = find(data[0], {id: item.id});
                        if (t) {
                            list.push({
                                item: t,
                                type: PeerType.PEERUSER,
                            });
                        }
                    } else if (item.peer.type === PeerType.PEERGROUP && onlyUser !== true) {
                        const t = find(data[1], {id: item.id});
                        if (t) {
                            list.push({
                                item: t,
                                type: PeerType.PEERGROUP,
                            });
                        }
                    }
                });
                return list;
            });
        });
    }
}
