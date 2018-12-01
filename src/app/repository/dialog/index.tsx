import DB from '../../services/db/dialog';
import {IDialog} from './interface';
import {throttle, differenceBy, find, merge, uniqBy, cloneDeep} from 'lodash';
import SDK from '../../services/sdk';
import UserRepo from '../user';
import MessageRepo from '../message';
import {IMessage} from '../message/interface';
import UpdateManager from '../../services/sdk/server/updateManager';
import {DexieDialogDB} from '../../services/db/dexie/dialog';
import GroupRepo from '../group';

interface IDialogWithUpdateId {
    dialogs: IDialog[];
    updateid: number;
}

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
    private updateManager: UpdateManager;

    public constructor() {
        this.updateManager = UpdateManager.getInstance();
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.sdk = SDK.getInstance();
        this.messageRepo = MessageRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.updateThrottle = throttle(this.insertToDb, 1000);
        this.userId = SDK.getInstance().getConnInfo().UserID || '0';
    }

    public loadConnInfo() {
        SDK.getInstance().loadConnInfo();
        this.userId = SDK.getInstance().getConnInfo().UserID || '0';
    }

    public create(dialog: IDialog) {
        return this.db.dialogs.put(dialog);
    }

    public createMany(dialogs: IDialog[]) {
        return this.db.dialogs.bulkPut(dialogs);
    }

    public getSnapshot({limit, skip, dialogs}: any): Promise<IDialogWithUpdateId> {
        limit = limit || 50;
        skip = skip || 0;
        dialogs = dialogs || [];
        return new Promise((resolve, reject) => {
            // @ts-ignore
            this.getManyForSnapshot({skip, limit}).then((remoteRes) => {
                dialogs.push.apply(dialogs, remoteRes.dialogs);
                if (remoteRes.dialogs.length === limit) {
                    skip += limit;
                    return this.getSnapshot({limit, skip, dialogs});
                } else {
                    resolve({
                        dialogs,
                        updateid: remoteRes.updateid,
                    });
                }
            }).catch(reject);
        });
    }

    public getMany({skip, limit}: any): Promise<IDialog[]> {
        return this.sdk.getDialogs(skip || 0, limit || 30).then((remoteRes) => {
            remoteRes.messagesList = MessageRepo.parseMessageMany(remoteRes.messagesList);
            this.messageRepo.importBulk(remoteRes.messagesList);
            const messageMap: { [key: number]: IMessage } = {};
            remoteRes.messagesList.forEach((msg) => {
                messageMap[msg.id || 0] = msg;
            });
            this.userRepo.importBulk(remoteRes.usersList);
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
            remoteRes.messagesList = MessageRepo.parseMessageMany(remoteRes.messagesList);
            this.messageRepo.importBulk(remoteRes.messagesList);
            const messageMap: { [key: number]: IMessage } = {};
            remoteRes.messagesList.forEach((msg) => {
                messageMap[msg.id || 0] = msg;
            });
            this.userRepo.importBulk(remoteRes.usersList);
            this.groupRepo.importBulk(remoteRes.groupsList);
            this.lazyUpsert(remoteRes.dialogsList, messageMap);
            const dialogs: IDialog[] = remoteRes.dialogsList;
            dialogs.map((dialog) => {
                const msg = messageMap[dialog.topmessageid || 0];
                if (msg) {
                    dialog.preview = (msg.body || '').substr(0, 64);
                    dialog.preview_me = (msg.senderid === this.userId);
                    dialog.last_update = msg.createdon;
                    dialog.target_id = msg.peerid;
                }
                return dialog;
            });
            return {
                dialogs,
                updateid: remoteRes.updateid || 0,
            };
        });
    }

    public getManyCache({skip, limit}: any): Promise<IDialog[]> {
        return this.db.dialogs
            .orderBy('last_update').reverse()
            .offset(skip || 0).limit(limit || 30).toArray();
    }

    public importBulk(dialogs: IDialog[], messageMap?: { [key: number]: IMessage }): Promise<any> {
        dialogs = dialogs.map((dialog) => {
            if (messageMap &&
                dialog.topmessageid) {
                const msg = messageMap[dialog.topmessageid || 0];
                if (msg) {
                    dialog.preview = (msg.body || '').substr(0, 64);
                    dialog.preview_me = (msg.senderid === this.userId);
                    dialog.last_update = msg.createdon;
                    dialog.target_id = msg.peerid;
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
                return merge(dialog, t);
            });
            return this.createMany([...createItems, ...updateItems]);
        }).catch((err: any) => {
            window.console.log('dialog upsert', err);
        });
    }

    public flush() {
        this.updateThrottle.cancel();
        this.insertToDb();
    }

    public lazyUpsert(dialogs: IDialog[], messageMap?: { [key: number]: IMessage }) {
        cloneDeep(dialogs).forEach((dialog) => {
            this.updateMap(dialog, cloneDeep(messageMap));
        });
        this.updateThrottle();
    }

    private updateMap = (dialog: IDialog, messageMap?: { [key: number]: IMessage }) => {
        if (messageMap &&
            dialog.topmessageid) {
            const msg = messageMap[dialog.topmessageid || 0];
            if (msg) {
                dialog.preview = (msg.body || '').substr(0, 64);
                dialog.preview_me = (msg.senderid === this.userId);
                dialog.last_update = msg.createdon;
                dialog.target_id = msg.peerid;
            }
        }
        if (this.lazyMap.hasOwnProperty(dialog.peerid || 0)) {
            const t = this.lazyMap[dialog.peerid || 0];
            this.lazyMap[dialog.peerid || 0] = merge(dialog, t);
        } else {
            this.lazyMap[dialog.peerid || 0] = dialog;
        }
    }

    private insertToDb = () => {
        const dialogs: IDialog[] = [];
        Object.keys(this.lazyMap).forEach((key) => {
            dialogs.push(cloneDeep(this.lazyMap[key]));
        });
        if (dialogs.length === 0) {
            return;
        }
        this.lazyMap = {};
        this.upsert(dialogs).then((info) => {
            this.updateManager.flushLastUpdateId();
        }).catch((err) => {
            window.console.log(err);
        });
    }
}
