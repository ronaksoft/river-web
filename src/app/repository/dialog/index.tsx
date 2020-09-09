/*
    Creation Time: 2018 - Sep - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import DB from '../../services/db/dialog';
import {IDialog, IDialogWithUpdateId, IDraft, IPeer} from './interface';
import {throttle, differenceWith, find, uniqBy, cloneDeep} from 'lodash';
import APIManager from '../../services/sdk';
import UserRepo from '../user';
import MessageRepo from '../message';
import {IMessage} from '../message/interface';
import {DexieDialogDB} from '../../services/db/dexie/dialog';
import GroupRepo from '../group';
import {C_MESSAGE_ICON, getMessageTitle} from '../../components/Dialog/utils';
import {kMerge} from "../../services/utilities/kDash";
import {PeerType} from "../../services/sdk/messages/core.types_pb";
import Dexie from "dexie";
import {MediaDocument} from "../../services/sdk/messages/chat.messages.medias_pb";

const withThumb = [C_MESSAGE_ICON.Audio, C_MESSAGE_ICON.File, C_MESSAGE_ICON.GIF, C_MESSAGE_ICON.Photo, C_MESSAGE_ICON.Video];

export default class DialogRepo {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new DialogRepo();
        }

        return this.instance;
    }

    private static instance: DialogRepo;

    private dbService: DB;
    private db: DexieDialogDB;
    private apiManager: APIManager;
    private messageRepo: MessageRepo;
    private userId: string;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;
    private lazyMap: { [key: string]: IDialog } = {};
    private readonly updateThrottle: any = null;
    private insertToDbTimeout: any = null;

    public constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.apiManager = APIManager.getInstance();
        this.messageRepo = MessageRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.updateThrottle = throttle(this.insertToDbDebounced, 256);
        this.userId = APIManager.getInstance().getConnInfo().UserID || '0';
    }

    public loadConnInfo() {
        APIManager.getInstance().loadConnInfo();
        this.userId = APIManager.getInstance().getConnInfo().UserID || '0';
    }

    /* Drafts Start*/

    public saveDraft(draft: IDraft) {
        return this.db.drafts.put(draft);
    }

    public getDraft(teamId: string, peerId: string) {
        return this.db.drafts.get([teamId, peerId]);
    }

    public removeDraft(teamId: string, peerId: string, peerType: number) {
        return this.db.drafts.delete([teamId, peerId, peerType]);
    }

    /* Drafts End */

    public create(dialog: IDialog) {
        return this.db.dialogs.put(dialog);
    }

    public remove(teamId: string, id: string, peerType: number) {
        delete this.lazyMap[`${teamId}_${id}_${peerType}`];
        return this.db.dialogs.delete([teamId, id, peerType]);
    }

    public createMany(dialogs: IDialog[]) {
        return this.db.dialogs.bulkPut(dialogs);
    }

    public get(teamId: string, peerId: string, peerType: number): Promise<IDialog | undefined> {
        return this.db.dialogs.get([teamId, peerId, peerType]).then((dialog) => {
            const mapId = `${teamId}_${peerId}_${peerType}`;
            if (this.lazyMap.hasOwnProperty(mapId) && dialog) {
                return this.mergeCheck(dialog, this.lazyMap[mapId]);
            } else {
                return dialog;
            }
        });
    }

    public getSnapshot(teamId: string, {limit, skip}: { limit?: number, skip?: number }): Promise<IDialogWithUpdateId> {
        const safeLimit = limit || 50;
        let safeSkip = skip || 0;
        let retries = 0;
        const getDialogs = ({resolve, reject, dialogs}: any) => {
            dialogs = dialogs || [];
            // @ts-ignore
            this.getManyForSnapshot(teamId, {skip: safeSkip, limit: safeLimit}).then((remoteRes) => {
                // window.console.log('intersectionBy', intersectionBy(cloneDeep(remoteRes.dialogs), dialogs, 'peerid'));
                dialogs.push.apply(dialogs, remoteRes.dialogs);
                dialogs = uniqBy(dialogs, 'peerid');
                if (remoteRes.dialogs.length === safeLimit) {
                    safeSkip += safeLimit;
                    return getDialogs({limit: safeLimit, skip: safeSkip, resolve, reject, dialogs});
                } else {
                    return resolve({
                        dialogs,
                        updateid: remoteRes.updateid,
                    });
                }
            }).catch((err: any) => {
                retries++;
                if (retries < 3) {
                    return this.getSnapshot(teamId, {limit: safeLimit, skip: safeSkip});
                } else {
                    return reject();
                }
            });
        };
        return new Promise((resolve, reject) => {
            getDialogs({resolve, reject});
        });
    }

    public getMany(teamId: string, {skip, limit}: any): Promise<IDialog[]> {
        return this.apiManager.getDialogs(skip || 0, limit || 30).then((remoteRes) => {
            remoteRes.messagesList = MessageRepo.parseMessageMany(remoteRes.messagesList, this.userId);
            this.messageRepo.importBulk(remoteRes.messagesList);
            const messageMap: { [key: number]: IMessage } = {};
            remoteRes.messagesList.forEach((msg) => {
                messageMap[msg.id || 0] = msg;
            });
            this.userRepo.importBulk(false, remoteRes.usersList);
            this.groupRepo.importBulk(remoteRes.groupsList);
            this.lazyUpsert(remoteRes.dialogsList, messageMap);
            return remoteRes.dialogsList;
        });
    }

    public getManyForSnapshot(teamId: string, {skip, limit}: { skip?: number, limit?: number }): Promise<IDialogWithUpdateId> {
        if (this.userId === '0' || this.userId === '') {
            this.loadConnInfo();
        }
        return this.apiManager.getDialogs(skip || 0, limit || 30).then((remoteRes) => {
            // window.console.log('remoteRes.dialogsList', remoteRes.dialogsList.length);
            // cloneDeep(remoteRes.dialogsList).forEach((d)=> {
            //     if (d.peertype === PeerType.PEERGROUP) {
            //         window.console.log('group', remoteRes.groupsList.find(o=> o.id === d.peerid));
            //     } else if (d.peertype === PeerType.PEERUSER) {
            //         window.console.log('user', remoteRes.usersList.find(o=> o.id === d.peerid));
            //     }
            // });
            remoteRes.messagesList = MessageRepo.parseMessageMany(remoteRes.messagesList, this.userId);
            this.messageRepo.importBulk(remoteRes.messagesList);
            const messageMap: { [key: number]: IMessage } = {};
            remoteRes.messagesList.forEach((msg) => {
                messageMap[msg.id || 0] = msg;
            });
            this.userRepo.importBulk(false, remoteRes.usersList);
            this.groupRepo.importBulk(remoteRes.groupsList);
            this.lazyUpsert(remoteRes.dialogsList, messageMap);
            const dialogs: IDialog[] = remoteRes.dialogsList;
            dialogs.map((dialog) => {
                const msg = messageMap[dialog.topmessageid || 0];
                if (msg) {
                    dialog = this.applyMessage(dialog, msg);
                    const data = msg.mediadata as MediaDocument.AsObject;
                    if (data && data.doc && data.doc.tinythumbnail) {
                        dialog.tiny_thumb = data.doc.tinythumbnail as string;
                    }
                }
                return dialog;
            });
            return {
                dialogs,
                updateid: remoteRes.updateid || 0,
            };
        });
    }

    public findInArray(teamId: string, peers: Array<[string, number]>, skip: number, limit: number) {
        const peerIds: string[] = [];
        const query: any = peers.map((p) => {
            peerIds.push(p[0]);
            return [teamId, ...p];
        });
        return this.db.dialogs.where(`[teamid+peerid+peertype]`).anyOf(query).offset(skip || 0).limit(limit).toArray().then((res) => {
            if (peerIds.indexOf(this.userId) > -1 && !find(res, {peerid: this.userId})) {
                res.unshift({
                    accesshash: '0',
                    last_update: Date.now(),
                    peerid: this.userId,
                    peertype: PeerType.PEERUSER,
                    preview: '',
                    sender_id: this.userId,
                    teamid: teamId,
                });
            }
            return res;
        });
    }

    public getManyCache(teamId: string, {skip, limit}: any): Promise<IDialog[]> {
        if (!this.db.dialogs) {
            return Promise.reject();
        }
        const minTeam: any = teamId === 'all' ? Dexie.minKey : teamId;
        const maxTeam: any = teamId === 'all' ? Dexie.maxKey : teamId;
        return this.db.dialogs.where('[teamid+last_update]').between([minTeam, Dexie.minKey], [maxTeam, Dexie.maxKey], true, true)
            .reverse().offset(skip || 0).limit(limit || 1000).toArray().then((res) => {
                const ids = res.filter(o => o.preview_icon && withThumb.indexOf(o.preview_icon) > -1 && o.topmessageid).map(o => o.topmessageid || 0);
                if (ids.length > 0) {
                    return this.messageRepo.getIn(ids, true).then((msgs) => {
                        const msgMap: { [key: number]: string } = {};
                        msgs.forEach((msg) => {
                            const data = msg.mediadata as MediaDocument.AsObject;
                            if (data && data.doc && data.doc.tinythumbnail) {
                                msgMap[msg.id || 0] = data.doc.tinythumbnail as string;
                            }
                        });
                        res.map(dialog => {
                            if (dialog.topmessageid && msgMap.hasOwnProperty(dialog.topmessageid)) {
                                dialog.tiny_thumb = msgMap[dialog.topmessageid];
                            }
                            return dialog;
                        });
                        return res;
                    });
                } else {
                    return res;
                }
            });
    }

    public importBulk(dialogs: IDialog[], messageMap?: { [key: number]: IMessage }): Promise<any> {
        dialogs = dialogs.map((dialog) => {
            if (messageMap &&
                dialog.topmessageid) {
                const msg = messageMap[dialog.topmessageid || 0];
                if (msg) {
                    dialog = this.applyMessage(dialog, msg);
                }
            }
            return dialog;
        });
        return this.upsert(dialogs);
    }

    public upsert(dialogs: IDialog[]): Promise<any> {
        const tempDialogs = uniqBy(dialogs, 'peerid');
        const queries = dialogs.map((dialog) => {
            dialog.teamid = dialog.teamid || '0';
            delete dialog.tiny_thumb;
            return [dialog.teamid || '0', dialog.peerid || '', dialog.peertype || 0];
        });
        return this.db.dialogs.where('[teamid+peerid+peertype]').anyOf(queries).toArray().then((result) => {
            const createItems: IDialog[] = differenceWith(tempDialogs, result, (i1, i2) => i1.teamid === i2.teamid && i1.peerid === i2.peerid && i1.peertype === i2.peertype);
            const updateItems: IDialog[] = result.map((dialog: IDialog) => {
                const t = find(tempDialogs, {teamid: dialog.teamid, peerid: dialog.peerid, peertype: dialog.peertype});
                if (t) {
                    return this.mergeCheck(dialog, t);
                } else {
                    return dialog;
                }
            });
            return this.createMany([...createItems, ...updateItems]);
        });
    }

    public flush() {
        this.updateThrottle.cancel();
        clearTimeout(this.insertToDbTimeout);
        return this.insertToDb();
    }

    public lazyUpsert(dialogs: IDialog[], messageMap?: { [key: number]: IMessage }) {
        cloneDeep(dialogs).forEach((dialog) => {
            this.updateMap(dialog, cloneDeep(messageMap));
        });
        this.updateThrottle();
    }

    private mergeCheck(dialog: IDialog, newDialog: IDialog): IDialog {
        if (newDialog.force !== true && dialog.topmessageid && newDialog.topmessageid && dialog.topmessageid > newDialog.topmessageid) {
            return dialog;
        }
        if (newDialog.readinboxmaxid !== undefined && newDialog.readinboxmaxid < (dialog.readinboxmaxid || 0)) {
            newDialog.readinboxmaxid = dialog.readinboxmaxid;
        }
        if (newDialog.readoutboxmaxid !== undefined && newDialog.readoutboxmaxid < (dialog.readoutboxmaxid || 0)) {
            newDialog.readoutboxmaxid = dialog.readoutboxmaxid;
        }
        if (newDialog.force !== true && newDialog.topmessageid !== undefined && newDialog.topmessageid < (dialog.topmessageid || 0)) {
            newDialog.topmessageid = dialog.topmessageid;
        }
        if (newDialog.draft && !newDialog.draft.peerid) {
            dialog.draft = {};
            newDialog.draft = {};
        }
        const d = kMerge(dialog, newDialog);
        if (newDialog.force === true) {
            delete d.force;
        }
        return d;
    }

    private updateMap = (dialog: IDialog, messageMap?: { [key: number]: IMessage }) => {
        if (messageMap &&
            dialog.topmessageid) {
            const msg = messageMap[dialog.topmessageid || 0];
            if (msg) {
                dialog = this.applyMessage(dialog, msg);
            }
        }
        const dialogId = `${dialog.teamid || '0'}_${dialog.peerid || '0'}_${dialog.peertype || 0}`;
        if (this.lazyMap.hasOwnProperty(dialogId)) {
            const t = this.lazyMap[dialogId];
            this.lazyMap[dialogId] = this.mergeCheck(t, dialog);
        } else {
            this.lazyMap[dialogId] = dialog;
        }
    }

    private insertToDbDebounced = () => {
        this.insertToDbTimeout = setTimeout(() => {
            this.insertToDb();
        }, 128);
    }

    private insertToDb = () => {
        const dialogs: IDialog[] = [];
        Object.values(this.lazyMap).forEach((item) => {
            dialogs.push(cloneDeep(item));
        });
        if (dialogs.length === 0) {
            this.lazyMap = {};
            return Promise.resolve();
        }
        this.lazyMap = {};
        return this.upsert(dialogs).then((info) => {
            return info;
        });
    }

    private applyMessage(dialog: IDialog, msg: IMessage): IDialog {
        const messageTitle = getMessageTitle(msg);
        dialog.action_code = msg.messageaction;
        dialog.action_data = msg.actiondata;
        dialog.preview = messageTitle.text;
        dialog.preview_icon = messageTitle.icon;
        dialog.preview_me = (msg.senderid === this.userId);
        dialog.preview_rtl = msg.rtl;
        dialog.last_update = msg.createdon;
        dialog.sender_id = msg.senderid;
        dialog.saved_messages = (msg.peerid === this.userId);
        return dialog;
    }
}

export function GetPeerName(peerId: string | undefined, peerType: number | undefined) {
    return `${peerId || ''}_${peerType || 0}`;
}

export function GetPeerNameByPeer(peer: IPeer) {
    return `${peer.id}_${peer.peerType}`;
}