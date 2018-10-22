import DB from '../../services/db/dialog';
import {IDialog} from './interface';
import {throttle, differenceBy, find, merge, uniqBy, cloneDeep} from 'lodash';
import SDK from '../../services/sdk';
import UserRepo from '../user';
import MessageRepo from '../message';
import {IMessage} from '../message/interface';

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
    private db: any;
    private sdk: SDK;
    private messageRepo: MessageRepo;
    private userRepo: UserRepo;
    private lazyMap: { [key: number]: IDialog } = {};
    private readonly updateThrottle: any = null;

    public constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.sdk = SDK.getInstance();
        this.messageRepo = MessageRepo.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.updateThrottle = throttle(this.insertToDb, 5000);
    }

    public create(dialog: IDialog) {
        this.db.put(dialog);
    }

    public createMany(dialogs: IDialog[]) {
        return this.db.bulkDocs(dialogs);
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
            this.messageRepo.importBulk(remoteRes.messagesList);
            const messageMap: { [key: number]: IMessage } = {};
            remoteRes.messagesList.forEach((msg) => {
                messageMap[msg.id || 0] = msg;
            });
            this.userRepo.importBulk(remoteRes.usersList);
            this.lazyUpsert(remoteRes.dialogsList, messageMap);
            return remoteRes.dialogsList;
        });
    }

    public getManyForSnapshot({skip, limit}: any): Promise<IDialogWithUpdateId> {
        return this.sdk.getDialogs(skip || 0, limit || 30).then((remoteRes) => {
            this.messageRepo.importBulk(remoteRes.messagesList);
            const messageMap: { [key: number]: IMessage } = {};
            remoteRes.messagesList.forEach((msg) => {
                messageMap[msg.id || 0] = msg;
            });
            this.userRepo.importBulk(remoteRes.usersList);
            this.lazyUpsert(remoteRes.dialogsList, messageMap);
            const dialogs: IDialog[] = remoteRes.dialogsList;
            dialogs.map((dialog) => {
                const msg = messageMap[dialog.topmessageid || 0];
                if (msg) {
                    dialog.preview = (msg.body || '').substr(0, 64);
                    dialog.last_update = msg.createdon;
                    dialog.user_id = msg.peerid;
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
        const q: any = [
            {last_update: {'$gt': true}},
        ];
        return this.db.find({
            limit: (limit || 30),
            selector: {
                $and: q,
            },
            skip: (skip || 0),
            sort: [
                {last_update: 'desc'},
            ],
        }).then((result: any) => {
            return result.docs;
        });
    }

    public importBulk(dialogs: IDialog[], messageMap?: { [key: number]: IMessage }): Promise<any> {
        dialogs = dialogs.map((dialog) => {
            dialog._id = String(dialog.peerid);
            if (messageMap &&
                dialog.topmessageid) {
                const msg = messageMap[dialog.topmessageid || 0];
                if (msg) {
                    dialog.preview = (msg.body || '').substr(0, 64);
                    dialog.last_update = msg.createdon;
                    dialog.user_id = msg.peerid;
                }
            }
            return dialog;
        });
        return this.upsert(dialogs);
    }

    public upsert(dialogs: IDialog[]): Promise<any> {
        const tempDialogs = uniqBy(dialogs, '_id');
        const ids = dialogs.map((dialog) => {
            return dialog._id;
        });
        return this.db.find({
            selector: {
                _id: {'$in': ids}
            },
        }).then((result: any) => {
            const createItems: IDialog[] = differenceBy(tempDialogs, result.docs, '_id');
            // @ts-ignore
            const updateItems: IDialog[] = result.docs;
            updateItems.map((dialog: IDialog) => {
                const t = find(tempDialogs, {_id: dialog._id});
                return merge(dialog, t);
            });
            const items = [...createItems, ...updateItems];
            return this.createMany(items).then((res: any) => {
                this.resolveConflicts(items, res);
                return res;
            });
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
                dialog.last_update = msg.createdon;
                dialog.user_id = msg.peerid;
            }
        }
        if (this.lazyMap.hasOwnProperty(dialog.peerid || 0)) {
            const t = this.lazyMap[dialog.peerid || 0];
            this.lazyMap[dialog.peerid || 0] = merge(dialog, t);
        } else {
            dialog._id = String(dialog.peerid);
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
        this.upsert(dialogs).then(() => {
            //
        }).catch(() => {
            //
        });
    }

    private resolveConflicts(docs: IDialog[], res: any) {
        res.forEach((item: any) => {
            if (item.error && item.status === 409) {
                this.db.get(item.id, {conflicts: true}).then((getRes: any) => {
                    this.db.remove(getRes._id, getRes._rev).then(() => {
                        const t = find(docs, {_id: getRes._id});
                        if (t) {
                            // @ts-ignore
                            t._rev = undefined;
                            this.db.put(t);
                        }
                    });
                });
            }
        });
    }
}
