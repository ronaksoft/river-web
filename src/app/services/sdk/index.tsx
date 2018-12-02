import {
    AuthAuthorization,
    AuthCheckedPhone,
    AuthCheckPhone,
    AuthLogin, AuthLogout,
    AuthRecall,
    AuthRecalled,
    AuthRegister,
    AuthSendCode,
    AuthSentCode
} from './messages/api.auth_pb';
import Server from './server';
import {C_MSG} from './const';
import {IConnInfo} from './interface';
import {ContactsGet, ContactsImport, ContactsImported, ContactsMany} from './messages/api.contacts_pb';
import {Group, GroupFull, InputPeer, InputUser, PhoneContact, TypingAction} from './messages/core.types_pb';
import {
    MessagesDelete,
    MessagesDialogs, MessagesEdit,
    MessagesGetDialogs,
    MessagesGetHistory,
    MessagesMany, MessagesReadHistory,
    MessagesSend,
    MessagesSent,
    MessagesSetTyping
} from './messages/api.messages_pb';
import {UpdateDifference, UpdateGetDifference, UpdateGetState, UpdateState} from './messages/api.updates_pb';
import {Bool} from './messages/core.messages_pb';
import {AccountRegisterDevice} from './messages/api.accounts_pb';
import {GroupsAddUser, GroupsCreate, GroupsDeleteUser, GroupsEditTitle, GroupsGetFull} from './messages/api.groups_pb';

export default class SDK {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new SDK();
        }

        return this.instance;
    }

    private static instance: SDK;

    private server: Server;
    private connInfo: IConnInfo;

    private clientId: number;

    public constructor() {
        this.server = Server.getInstance();
        const s = localStorage.getItem('river.conn.info');
        if (s) {
            this.connInfo = JSON.parse(s);
        } else {
            this.connInfo = {
                AuthID: '0',
                AuthKey: '',
                FirstName: '',
                LastName: '',
                Phone: '',
                UserID: '0',
                Username: ''
            };
        }
        const id = localStorage.getItem('river.conn.client.id');
        if (id) {
            this.clientId = parseInt(id, 10);
        }
        // this.msgId = 0;
        // this.messageRepo = new MessageRepo();
        // this.dialogRepo = new DialogRepo();
        // this.userRepor = new UserRepo();
    }

    public getConnInfo(): IConnInfo {
        return this.connInfo;
    }

    public setConnInfo(info: IConnInfo) {
        this.connInfo = info;
        const s = JSON.stringify(info);
        localStorage.setItem('river.conn.info', s);
    }

    public resetConnInfo() {
        this.loadConnInfo();
        const info = this.getConnInfo();
        info.UserID = '0';
        info.FirstName = '';
        info.LastName = '';
        info.Phone = '';
        info.Username = '';
        this.setConnInfo(info);
    }

    public loadConnInfo(): IConnInfo {
        const s = localStorage.getItem('river.conn.info');
        if (s) {
            this.connInfo = this.connInfo = JSON.parse(s);
        }
        return this.connInfo;
    }

    public getClientId(): number {
        return this.clientId;
    }

    public setClientId(id: number) {
        this.clientId = id;
        localStorage.setItem('river.client.id', String(id));
    }

    public sendCode(phone: string): Promise<AuthSentCode.AsObject> {
        const data = new AuthSendCode;
        data.setPhone(phone);
        return this.server.send(C_MSG.AuthSendCode, data.serializeBinary(), true);
    }

    public checkPhone(phone: string): Promise<AuthCheckedPhone.AsObject> {
        const data = new AuthCheckPhone();
        data.setPhone(phone);
        return this.server.send(C_MSG.AuthCheckPhone, data.serializeBinary(), true);
    }

    public register(phone: string, phoneCode: string, phoneCodeHash: string, fName: string, lName: string): Promise<any> {
        const data = new AuthRegister();
        data.setPhone(phone);
        data.setPhonecode(phoneCode);
        data.setPhonecodehash(phoneCodeHash);
        data.setFirstname(fName);
        data.setLastname(lName);
        return this.server.send(C_MSG.AuthRegister, data.serializeBinary(), true);
    }

    public login(phone: string, phoneCode: string, phoneCodeHash: string): Promise<AuthAuthorization.AsObject> {
        const data = new AuthLogin();
        data.setPhone(phone);
        data.setPhonecode(phoneCode);
        data.setPhonecodehash(phoneCodeHash);
        return this.server.send(C_MSG.AuthLogin, data.serializeBinary(), true);
    }

    public recall(clientId: string): Promise<AuthRecalled.AsObject> {
        const data = new AuthRecall();
        data.setClientid(clientId);
        return this.server.send(C_MSG.AuthRecall, data.serializeBinary(), true);
    }

    public contactImport(replace: boolean, contacts: PhoneContact.AsObject[]): Promise<ContactsImported.AsObject> {
        const data = new ContactsImport();
        const arr: PhoneContact[] = [];
        contacts.forEach((cont) => {
            const contact = new PhoneContact();
            if (cont.clientid) {
                contact.setClientid(cont.clientid);
            }
            if (cont.firstname) {
                contact.setFirstname(cont.firstname);
            }
            if (cont.lastname) {
                contact.setLastname(cont.lastname);
            }
            if (cont.phone) {
                contact.setPhone(cont.phone);
            }
            arr.push(contact);
        });
        data.setContactsList(arr);
        data.setReplace(replace);
        return this.server.send(C_MSG.ContactsImport, data.serializeBinary());
    }

    public getContacts(): Promise<ContactsMany.AsObject> {
        const data = new ContactsGet();
        data.setMd5hash('');
        return this.server.send(C_MSG.ContactsGet, data.serializeBinary());
    }

    public getDialogs(skip: number, limit: number): Promise<MessagesDialogs.AsObject> {
        const data = new MessagesGetDialogs();
        data.setOffset(skip || 0);
        data.setLimit(limit || 0);
        return this.server.send(C_MSG.MessagesGetDialogs, data.serializeBinary());
    }

    public sendMessage(body: string, peer: InputPeer, replyTo?: number): Promise<MessagesSent.AsObject> {
        const data = new MessagesSend();
        // this.msgId++;
        data.setRandomid(parseInt(Math.random().toFixed(10).split('.')[1], 10));
        data.setBody(body);
        data.setPeer(peer);
        if (replyTo) {
            data.setReplyto(replyTo);
        }
        window.console.log(peer.getAccesshash());
        return this.server.send(C_MSG.MessagesSend, data.serializeBinary());
    }

    public editMessage(id: number, body: string, peer: InputPeer): Promise<MessagesSent.AsObject> {
        const data = new MessagesEdit();
        // this.msgId++;
        data.setRandomid(parseInt(Math.random().toFixed(10).split('.')[1], 10));
        data.setBody(body);
        data.setPeer(peer);
        data.setMessageid(id);
        return this.server.send(C_MSG.MessagesEdit, data.serializeBinary());
    }

    public getMessageHistory(peer: InputPeer, {limit, minId, maxId}: any): Promise<MessagesMany.AsObject> {
        const data = new MessagesGetHistory();
        data.setPeer(peer);
        data.setLimit(limit || 0);
        data.setMinid(minId || 0);
        data.setMaxid(maxId || 0);
        return this.server.send(C_MSG.MessagesGetHistory, data.serializeBinary());
    }

    public typing(peer: InputPeer, type: TypingAction): Promise<MessagesMany.AsObject> {
        const data = new MessagesSetTyping();
        data.setPeer(peer);
        data.setAction(type);
        return this.server.send(C_MSG.MessagesSetTyping, data.serializeBinary(), true);
    }

    public setMessagesReadHistory(peer: InputPeer, maxId: number): Promise<Bool> {
        const data = new MessagesReadHistory();
        data.setPeer(peer);
        data.setMaxid(maxId);
        return this.server.send(C_MSG.MessagesReadHistory, data.serializeBinary(), true);
    }

    public getUpdateState(): Promise<UpdateState.AsObject> {
        const data = new UpdateGetState();
        return this.server.send(C_MSG.UpdateGetState, data.serializeBinary(), true);
    }

    public getUpdateDifference(from: number, limit: number): Promise<UpdateDifference> {
        const data = new UpdateGetDifference();
        data.setFrom(from);
        data.setLimit(limit);
        return this.server.send(C_MSG.UpdateGetDifference, data.serializeBinary(), true);
    }

    public logout(authId: string): Promise<Bool> {
        const data = new AuthLogout();
        data.setAuthidsList([authId]);
        return this.server.send(C_MSG.AuthLogout, data.serializeBinary(), true);
    }

    public registerDevice(token: string, tokenType: number, appVersion: string, deviceModel: string, langCode: string, systemVersion: string): Promise<Bool.AsObject> {
        const data = new AccountRegisterDevice();
        data.setAppversion(appVersion);
        data.setDevicemodel(deviceModel);
        data.setLangcode(langCode);
        data.setSystemversion(systemVersion);
        data.setToken(token);
        data.setTokentype(tokenType);
        return this.server.send(C_MSG.AccountRegisterDevice, data.serializeBinary(), true);
    }

    public removeMessage(peer: InputPeer, ids: number[], revoke: boolean): Promise<Bool.AsObject> {
        const data = new MessagesDelete();
        data.setPeer(peer);
        data.setMessageidsList(ids);
        data.setRevoke(revoke);
        return this.server.send(C_MSG.MessagesDelete, data.serializeBinary(), true);
    }

    public groupCreate(users: InputUser[], title: string): Promise<Group.AsObject> {
        const data = new GroupsCreate();
        data.setUsersList(users);
        data.setTitle(title);
        return this.server.send(C_MSG.GroupsCreate, data.serializeBinary(), true);
    }

    public groupGetFull(peer: InputPeer): Promise<GroupFull.AsObject> {
        const data = new GroupsGetFull();
        data.setGroupid(peer.getId() || '');
        return this.server.send(C_MSG.GroupsGetFull, data.serializeBinary(), true);
    }

    public groupEditTitle(peer: InputPeer, title: string): Promise<Bool.AsObject> {
        const data = new GroupsEditTitle();
        data.setGroupid(peer.getId() || '');
        data.setTitle(title);
        return this.server.send(C_MSG.GroupsEditTitle, data.serializeBinary(), true);
    }

    public groupRemoveMember(peer: InputPeer, user: InputUser): Promise<Bool.AsObject> {
        const data = new GroupsDeleteUser();
        data.setGroupid(peer.getId() || '');
        data.setUser(user);
        return this.server.send(C_MSG.GroupsDeleteUser, data.serializeBinary(), true);
    }

    public groupAddMember(peer: InputPeer, user: InputUser, limit: number): Promise<Bool.AsObject> {
        const data = new GroupsAddUser();
        data.setGroupid(peer.getId() || '');
        data.setUser(user);
        data.setForwardlimit(limit);
        return this.server.send(C_MSG.GroupsAddUser, data.serializeBinary(), true);
    }
}
