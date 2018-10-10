import DB from '../../services/db/dialog';
import {IDialog} from './interface';
import {throttle, differenceBy, find, merge, uniqBy, cloneDeep} from 'lodash';
import SDK from '../../services/sdk';
import UserRepo from '../user';
import MessageRepo from '../message';
import {IMessage} from "../message/interface";

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
        this.messageRepo = new MessageRepo();
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
            return {
                dialogs: remoteRes.dialogsList,
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
        let tempDialogs = cloneDeep(dialogs);
        tempDialogs = uniqBy(tempDialogs, '_id');
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
            return this.createMany([...createItems, ...updateItems]);
        }).catch((err: any) => {
            window.console.log('dialog upsert', err);
        });
    }

    public lazyUpsert(dialogs: IDialog[], messageMap?: { [key: number]: IMessage }) {
        dialogs.forEach((dialog) => {
            this.updateMap(dialog, messageMap);
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
        if (!this.lazyMap.hasOwnProperty(dialog.peerid || 0)) {
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
            dialogs.push(this.lazyMap[key]);
        });
        this.upsert(dialogs).then(() => {
            this.lazyMap = {};
        });
    }
}
