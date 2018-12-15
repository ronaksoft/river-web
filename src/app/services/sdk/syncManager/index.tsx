import {C_MSG} from '../const';
import {UpdateEnvelope} from '../messages/core.messages_pb';
import {
    UpdateDifference,
    UpdateMessageEdited, UpdateMessagesDeleted,
    UpdateNewMessage, UpdateNotifySettings,
    UpdateReadHistoryInbox,
    UpdateReadHistoryOutbox, UpdateUsername,
} from '../messages/api.updates_pb';
import {IUser} from '../../../repository/user/interface';
import {IMessage} from '../../../repository/message/interface';
import {IDialog} from '../../../repository/dialog/interface';
import {merge} from 'lodash';
import DialogRepo from '../../../repository/dialog';
import MessageRepo from '../../../repository/message';
import UserRepo from '../../../repository/user';
import UpdateManager from '../server/updateManager';
import GroupRepo from '../../../repository/group';
import {IGroup} from '../../../repository/group/interface';
import {Group} from '../messages/core.types_pb';

export default class SyncManager {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new SyncManager();
        }

        return this.instance;
    }

    private static instance: SyncManager;

    private updateManager: UpdateManager;
    private dialogRepo: DialogRepo;
    private messageRepo: MessageRepo;
    private userRepo: UserRepo;
    // @ts-ignore
    private groupRepo: GroupRepo;

    public constructor() {
        window.console.log('Sync manager started');
        this.updateManager = UpdateManager.getInstance();
        this.userRepo = UserRepo.getInstance();
        this.groupRepo = GroupRepo.getInstance();
        this.dialogRepo = DialogRepo.getInstance();
        this.messageRepo = MessageRepo.getInstance();
    }

    public getLastUpdateId(): number {
        return this.updateManager.getLastUpdateId();
    }

    public setLastUpdateId(id: number) {
        this.updateManager.setLastUpdateId(id);
    }

    public applyUpdate(data: UpdateDifference.AsObject): Promise<number> {
        return new Promise((resolve, reject) => {
            const lastUpdateId = data.maxupdateid || 0;
            if (lastUpdateId > 0) {
                this.setLastUpdateId(lastUpdateId);
            }
            this.updateMany(data.updatesList, data.groupsList);
            if (data.more) {
                setTimeout(() => {
                    resolve((data.maxupdateid || 0) + 1);
                }, 200);
            } else {
                reject({
                    code: -1,
                });
            }
        });
    }

    private updateMany(envelopes: UpdateEnvelope.AsObject[], groups: Group.AsObject[]) {
        let dialogs: { [key: number]: IDialog } = {};
        const messages: { [key: number]: IMessage } = {};
        const toRemoveMessages: number[] = [];
        const users: { [key: number]: IUser } = {};
        envelopes.forEach((envelope) => {
            // @ts-ignore
            const data: Uint8Array = envelope.update;
            switch (envelope.constructor) {
                case C_MSG.UpdateNewMessage:
                    const updateNewMessage = UpdateNewMessage.deserializeBinary(data).toObject();
                    users[updateNewMessage.sender.id || 0] = updateNewMessage.sender;
                    messages[updateNewMessage.message.id || 0] = MessageRepo.parseMessage(updateNewMessage.message);
                    dialogs = this.updateDialog(dialogs, {
                        accesshash: updateNewMessage.accesshash,
                        action_code: updateNewMessage.message.messageaction,
                        action_data: messages[updateNewMessage.message.id || 0].actiondata,
                        last_update: updateNewMessage.message.createdon,
                        peerid: updateNewMessage.message.peerid,
                        peertype: updateNewMessage.message.peertype,
                        preview: (updateNewMessage.message.body || '').substr(0, 64),
                        sender_id: updateNewMessage.message.senderid,
                        target_id: updateNewMessage.message.peerid,
                        topmessageid: updateNewMessage.message.id,
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
                    messages[updateMessageEdited.message.id || 0] = MessageRepo.parseMessage(updateMessageEdited.message);
                    break;
                case C_MSG.UpdateMessagesDeleted:
                    const updateMessagesDeleted = UpdateMessagesDeleted.deserializeBinary(data).toObject();
                    updateMessagesDeleted.messageidsList.forEach((id) => {
                        if (messages.hasOwnProperty(id)) {
                            delete messages[id || 0];
                        } else {
                            toRemoveMessages.push(id);
                        }
                    });
                    break;
                case C_MSG.UpdateUsername:
                    const updateUsername = UpdateUsername.deserializeBinary(data).toObject();
                    if (users.hasOwnProperty(updateUsername.userid || 0)) {
                        users[updateUsername.userid || 0] = merge(users[updateUsername.userid || 0], {
                            firstname: updateUsername.firstname,
                            id: updateUsername.userid,
                            lastname: updateUsername.lastname,
                            username: updateUsername.username,
                        });
                    }
                    break;
                case C_MSG.UpdateNotifySettings:
                    const updateNotifySettings = UpdateNotifySettings.deserializeBinary(data).toObject();
                    dialogs = this.updateDialog(dialogs, {
                        accesshash: updateNotifySettings.notifypeer.accesshash,
                        notifysettings: updateNotifySettings.settings,
                        peerid: updateNotifySettings.notifypeer.id,
                    });
                    break;
                default:
                    break;
            }
        });
        this.updateMessageDB(messages, toRemoveMessages);
        this.updateUserDB(users);
        this.updateDialogDB(dialogs);
        this.updateGroupDB(groups);
    }

    private updateDialog(dialogs: { [key: number]: IDialog }, dialog: IDialog) {
        const d: IDialog = dialogs[dialog.peerid || 0];
        if (d) {
            if ((d.readinboxmaxid || 0) > (dialog.readinboxmaxid || 0)) {
                dialog.readinboxmaxid = (d.readinboxmaxid || 0);
            }
            if ((d.readoutboxmaxid || 0) > (dialog.readoutboxmaxid || 0)) {
                dialog.readoutboxmaxid = (d.readoutboxmaxid || 0);
            }
            if (dialog.topmessageid) {
                if (dialog.topmessageid > (d.topmessageid || 0)) {
                    dialogs[dialog.peerid || 0] = merge(d, dialog);
                }
            } else {
                dialogs[dialog.peerid || 0] = merge(d, dialog);
            }
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
            this.messageRepo.flush();
            setTimeout(() => {
                data.forEach((item) => {
                    if (item.readinboxmaxid) {
                        this.messageRepo.getUnreadCount(item.peerid || '', item.readinboxmaxid || 0).then((res) => {
                            item.unreadcount = res;
                        });
                    }
                });
                this.dialogRepo.lazyUpsert(data);
                this.dialogRepo.flush();
            }, 500);
            setTimeout(() => {
                this.broadcastEvent('Dialog_DB_Updated', {ids: keys});
            }, 1000);
        }
    }

    private updateMessageDB(messages: { [key: number]: IMessage }, toRemoveMessages: number[]) {
        this.messageRepo.removeMany(toRemoveMessages);
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
            this.messageRepo.lazyUpsert(data);
            setTimeout(() => {
                this.broadcastEvent('Message_DB_Updated', {
                    ids: keys,
                    peerids: peerIds,
                });
            }, 1000);
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

    private updateGroupDB(groups: Group.AsObject[]) {
        const data: IGroup[] = [];
        const keys = groups.map((group) => {
            // @ts-ignore
            data.push(group);
            return group.id;
        });
        if (data.length > 0) {
            this.groupRepo.importBulk(data).then(() => {
                this.broadcastEvent('Group_DB_Updated', {ids: keys});
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
