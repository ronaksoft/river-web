/*
    Creation Time: 2018 - Sep - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import DB from '../../services/db/dialog';
import {IDialog, IDialogWithUpdateId, IDraft} from './interface';
import {throttle, differenceBy, find, uniqBy, cloneDeep} from 'lodash';
import SDK from '../../services/sdk';
import UserRepo from '../user';
import MessageRepo from '../message';
import {IMessage} from '../message/interface';
import UpdateManager from '../../services/sdk/server/updateManager';
import {DexieDialogDB} from '../../services/db/dexie/dialog';
import GroupRepo from '../group';
import {getMessageTitle} from '../../components/Dialog/utils';
import {kMerge} from "../../services/utilities/kDash";
import {PeerType} from "../../services/sdk/messages/chat.core.types_pb";

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
    private sdk: SDK;
    private messageRepo: MessageRepo;
    private userId: string;
    private userRepo: UserRepo;
    private groupRepo: GroupRepo;
    private lazyMap: { [key: number]: IDialog } = {};
    private readonly updateThrottle: any = null;
    private insertToDbTimeout: any = null;
    private updateManager: UpdateManager;

    public constructor() {
        this.updateManager = UpdateManager.getInstance();
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.sdk = SDK.getInstance();
        this.messageRepo = MessageRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.updateThrottle = throttle(this.insertToDbDebounced, 256);
        this.userId = SDK.getInstance().getConnInfo().UserID || '0';
    }

    public loadConnInfo() {
        SDK.getInstance().loadConnInfo();
        this.userId = SDK.getInstance().getConnInfo().UserID || '0';
    }

    /* Drafts Start*/

    public saveDraft(draft: IDraft) {
        return this.db.drafts.put(draft);
    }

    public getDraft(peerId: string) {
        return this.db.drafts.get(peerId);
    }

    public removeDraft(peerId: string) {
        return this.db.drafts.delete(peerId);
    }

    /* Drafts End */

    public create(dialog: IDialog) {
        return this.db.dialogs.put(dialog);
    }

    public remove(id: string) {
        delete this.lazyMap[id];
        return this.db.dialogs.delete(id);
    }

    public createMany(dialogs: IDialog[]) {
        return this.db.dialogs.bulkPut(dialogs);
    }

    public get(id: string): Promise<IDialog> {
        return this.db.dialogs.get(id).then((dialog) => {
            if (this.lazyMap.hasOwnProperty(id) && dialog) {
                return this.mergeCheck(dialog, this.lazyMap[id]);
            } else {
                return dialog;
            }
        });
    }

    public getSnapshot({limit, skip}: any): Promise<IDialogWithUpdateId> {
        limit = limit || 50;
        skip = skip || 0;
        let retries = 0;
        const getDialogs = ({resolve, reject, dialogs}: any) => {
            dialogs = dialogs || [];
            // @ts-ignore
            this.getManyForSnapshot({skip, limit}).then((remoteRes) => {
                // window.console.log('intersectionBy', intersectionBy(cloneDeep(remoteRes.dialogs), dialogs, 'peerid'));
                dialogs.push.apply(dialogs, remoteRes.dialogs);
                dialogs = uniqBy(dialogs, 'peerid');
                if (remoteRes.dialogs.length === limit) {
                    skip += limit;
                    return getDialogs({limit, skip, resolve, reject, dialogs});
                } else {
                    return resolve({
                        dialogs,
                        updateid: remoteRes.updateid,
                    });
                }
            }).catch((err: any) => {
                retries++;
                if (retries < 3) {
                    return this.getSnapshot({limit, skip, dialogs});
                } else {
                    return reject();
                }
            });
        };
        return new Promise((resolve, reject) => {
            getDialogs({resolve, reject});
        });
    }

    public getMany({skip, limit}: any): Promise<IDialog[]> {
        return this.sdk.getDialogs(skip || 0, limit || 30).then((remoteRes) => {
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

    public getManyForSnapshot({skip, limit}: any): Promise<IDialogWithUpdateId> {
        if (this.userId === '0' || this.userId === '') {
            this.loadConnInfo();
        }
        return this.sdk.getDialogs(skip || 0, limit || 30).then((remoteRes) => {
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
                }
                return dialog;
            });
            return {
                dialogs,
                updateid: remoteRes.updateid || 0,
            };
        });
    }

    public findInArray(peerIds: string[], skip: number, limit: number) {
        return this.db.dialogs.where('peerid').anyOf(peerIds).offset(skip || 0).limit(limit).toArray().then((res) => {
            if (peerIds.indexOf(this.userId) > -1 && !find(res, {peerid: this.userId})) {
                res.unshift({
                    accesshash: '0',
                    last_update: Date.now(),
                    peerid: this.userId,
                    peertype: PeerType.PEERUSER,
                    preview: '',
                    sender_id: this.userId,
                });
            }
            return res;
        });
    }

    public getManyCache({skip, limit}: any): Promise<IDialog[]> {
        if (!this.db.dialogs) {
            return Promise.reject();
        }
        return this.db.dialogs
            .orderBy('last_update').reverse()
            .offset(skip || 0).limit(limit || 1000).toArray();
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
        const ids = dialogs.map((dialog) => {
            return dialog.peerid || '';
        });
        return this.db.dialogs.where('peerid').anyOf(ids).toArray().then((result) => {
            const createItems: IDialog[] = differenceBy(tempDialogs, result, 'peerid');
            const updateItems: IDialog[] = result;
            updateItems.map((dialog: IDialog) => {
                const t = find(tempDialogs, {peerid: dialog.peerid});
                if (t) {
                    return this.mergeCheck(dialog, t);
                } else {
                    return dialog;
                }
            });
            return this.createMany([...createItems, ...updateItems]);
        }).catch((err: any) => {
            window.console.debug('dialog upsert', err);
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
        if (this.lazyMap.hasOwnProperty(dialog.peerid || 0)) {
            const t = this.lazyMap[dialog.peerid || 0];
            this.lazyMap[dialog.peerid || 0] = this.mergeCheck(t, dialog);
        } else {
            this.lazyMap[dialog.peerid || 0] = dialog;
        }
    }

    private insertToDbDebounced = () => {
        this.insertToDbTimeout = setTimeout(() => {
            this.insertToDb();
        }, 128);
    }

    private insertToDb = () => {
        const dialogs: IDialog[] = [];
        Object.keys(this.lazyMap).forEach((key) => {
            dialogs.push(cloneDeep(this.lazyMap[key]));
        });
        if (dialogs.length === 0) {
            this.updateManager.flushLastUpdateId();
            this.lazyMap = {};
            return Promise.resolve();
        }
        this.lazyMap = {};
        return this.upsert(dialogs).then((info) => {
            this.updateManager.flushLastUpdateId();
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
