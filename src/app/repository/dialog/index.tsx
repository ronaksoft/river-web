import DB from '../../services/db/dialog';
import {IDialog} from './interface';
import {differenceBy, find, merge} from 'lodash';
import SDK from '../../services/sdk';
import UserRepo from '../user';
import MessageRepo from '../message';
import {IMessage} from "../message/interface";

export default class DialogRepo {
    private dbService: DB;
    private db: any;
    private sdk: SDK;
    private messageRepo: MessageRepo;
    private userRepo: UserRepo;

    public constructor() {
        this.dbService = DB.getInstance();
        this.db = this.dbService.getDB();
        this.sdk = SDK.getInstance();
        this.messageRepo = new MessageRepo();
        this.userRepo = UserRepo.getInstance();
    }

    public create(dialog: IDialog) {
        this.db.put(dialog);
    }

    public createMany(dialogs: IDialog[]) {
        return this.db.bulkDocs(dialogs);
    }

    public getMany({skip, limit}: any): Promise<IDialog[]> {
        return this.sdk.getDialogs(skip || 0, limit || 30).then((remoteRes) => {
            this.messageRepo.importBulk(remoteRes.messagesList);
            const messageMap: { [key: number]: IMessage } = {};
            remoteRes.messagesList.forEach((msg) => {
                messageMap[msg.id || 0] = msg;
            });
            this.userRepo.importBulk(remoteRes.usersList);
            this.importBulk(remoteRes.dialogsList, messageMap);
            return remoteRes.dialogsList;
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
        const ids = dialogs.map((dialog) => {
            return dialog._id;
        });
        return this.db.find({
            selector: {
                _id: {'$in': ids}
            },
        }).then((result: any) => {
            const createItems: IDialog[] = differenceBy(dialogs, result.docs, '_id');
            // @ts-ignore
            const updateItems: IDialog[] = result.docs;
            updateItems.map((dialog: IDialog) => {
                const t = find(dialogs, {_id: dialog._id});
                return merge(dialog, t);
            });
            return this.createMany([...createItems, ...updateItems]);
        }).catch((err: any) => {
            window.console.log('ewrferf', err);
        });
    }
}
