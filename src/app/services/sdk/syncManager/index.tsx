import {C_MSG} from '../const';
import {UpdateEnvelope} from '../messages/core.messages_pb';
import {
    UpdateDifference,
    UpdateMessageEdited,
    UpdateNewMessage,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox,
} from '../messages/api.updates_pb';
import {IUser} from '../../../repository/user/interface';
import {IMessage} from '../../../repository/message/interface';
import {IDialog} from '../../../repository/dialog/interface';
import {merge} from 'lodash';
import DialogRepo from '../../../repository/dialog';
import MessageRepo from '../../../repository/message';
import UserRepo from '../../../repository/user';

export default class SyncManager {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new SyncManager();
        }

        return this.instance;
    }

    private static instance: SyncManager;

    private lastUpdateId: number = 0;

    private dialogRepo: DialogRepo;
    private messageRepo: MessageRepo;
    private userRepo: UserRepo;

    public constructor() {
        window.console.log('Sync manager started');
        this.getLastUpdateId();
        this.dialogRepo = new DialogRepo();
        this.messageRepo = new MessageRepo();
        this.userRepo = UserRepo.getInstance();
    }

    public getLastUpdateId(): number {
        const data = localStorage.getItem('river.last_update_id');
        if (data) {
            this.lastUpdateId = JSON.parse(data).lastId;
            return this.lastUpdateId;
        }
        return 0;
    }

    public setLastUpdateId(id: number) {
        this.lastUpdateId = id;
        localStorage.setItem('river.last_update_id', JSON.stringify({
            lastId: this.lastUpdateId,
        }));
    }

    public applyUpdate(data: UpdateDifference): Promise<number> {
        return new Promise((resolve, reject) => {
            this.updateMany(data.getUpdatesList());
            if (data.getMore()) {
                setTimeout(() => {
                    resolve((data.getMaxupdateid() || 0) + 1);
                }, 500);
            } else {
                reject({
                    code: -1,
                });
            }
        });
    }

    private updateMany(envelopes: UpdateEnvelope[]) {
        let lastId = 0;
        let dialogs: { [key: number]: IDialog } = {};
        const messages: { [key: number]: IMessage } = {};
        const users: { [key: number]: IUser } = {};
        envelopes.forEach((envelope) => {
            const data = envelope.getUpdate_asU8();
            if ((envelope.getUpdateid() || 0) > lastId) {
                lastId = envelope.getUpdateid() || 0;
            }
            switch (envelope.getConstructor()) {
                case C_MSG.UpdateNewMessage:
                    const updateNewMessage = UpdateNewMessage.deserializeBinary(data).toObject();
                    users[updateNewMessage.sender.id || 0] = updateNewMessage.sender;
                    messages[updateNewMessage.message.id || 0] = updateNewMessage.message;
                    dialogs = this.updateDialog(dialogs, {
                        accesshash: updateNewMessage.accesshash,
                        last_update: updateNewMessage.message.createdon,
                        peerid: updateNewMessage.message.peerid,
                        peertype: updateNewMessage.message.peertype,
                        preview: (updateNewMessage.message.body || '').substr(0, 64),
                        topmessageid: updateNewMessage.message.id,
                        unreadcount: 0,
                        user_id: updateNewMessage.message.peerid,
                    });
                    break;
                case C_MSG.UpdateReadHistoryInbox:
                    const updateReadHistoryInbox = UpdateReadHistoryInbox.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        peerid: updateReadHistoryInbox.peer.id,
                        readinboxmaxid: updateReadHistoryInbox.maxid,
                    });
                    break;
                case C_MSG.UpdateReadHistoryOutbox:
                    const updateReadHistoryOutbox = UpdateReadHistoryOutbox.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        peerid: updateReadHistoryOutbox.peer.id,
                        readoutboxmaxid: updateReadHistoryOutbox.maxid
                    });
                    break;
                case C_MSG.UpdateMessageEdited:
                    const updateMessageEdited = UpdateMessageEdited.deserializeBinary(data).toObject();
                    messages[updateMessageEdited.message.id || 0] = updateMessageEdited.message;
                    break;
                default:
                    break;
            }
        });
        this.setLastUpdateId(lastId || 0);
        this.updateDialogDB(dialogs);
        this.updateMessageDB(messages);
        this.updateUserDB(users);
    }

    private updateDialog(dialogs: { [key: number]: IDialog }, dialog: IDialog) {
        const d = dialogs[dialog.peerid || 0];
        if (d) {
            dialogs[dialog.peerid || 0] = merge(d, dialog);
        } else {
            dialogs[dialog.peerid || 0] = dialog;
        }
        return dialogs;
    }

    private updateDialogDB(dialogs: { [key: number]: IDialog }) {
        const data: IDialog[] = [];
        const keys = Object.keys(dialogs);
        keys.forEach((key) => {
            data.push(dialogs[key]);
        });
        if (data.length > 0) {
            // TODO: check
            this.dialogRepo.importBulk(data).then(() => {
                this.broadcastEvent('Dialog_DB_Updated', {ids: keys});
            });
        }
    }

    private updateMessageDB(messages: { [key: number]: IMessage }) {
        const data: IMessage[] = [];
        const keys = Object.keys(messages);
        const peerIds: number[] = [];
        keys.forEach((key) => {
            data.push(messages[key]);
            if (!peerIds[messages[key].peerid]) {
                peerIds.push(messages[key].peerid);
            }
        });
        if (data.length > 0) {
            this.messageRepo.importBulk(data).then(() => {
                this.broadcastEvent('Message_DB_Updated', {
                    ids: keys,
                    peerids: peerIds,
                });
            });
        }
    }

    private updateUserDB(users: { [key: number]: IUser }) {
        const data: IUser[] = [];
        const keys = Object.keys(users);
        keys.forEach((key) => {
            data.push(users[key]);
        });
        if (data.length > 0) {
            this.userRepo.importBulk(data).then(() => {
                this.broadcastEvent('User_DB_Updated', {ids: keys});
            });
        }
    }

    private broadcastEvent(name: string, data: any) {
        const event = new CustomEvent(name, {
            bubbles: true,
            detail: data,
        });
        window.dispatchEvent(event);
    }
}
