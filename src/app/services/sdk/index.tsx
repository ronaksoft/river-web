/*
    Creation Time: 2018 - Sep - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {
    AuthAuthorization,
    AuthCheckedPhone,
    AuthCheckPhone,
    AuthLogin,
    AuthLogout,
    AuthRecall,
    AuthRecalled,
    AuthRegister, AuthResendCode,
    AuthSendCode,
    AuthSentCode
} from './messages/chat.api.auth_pb';
import Server from './server';
import {C_MSG} from './const';
import {IConnInfo} from './interface';
import {
    ContactsDelete,
    ContactsGet,
    ContactsImport,
    ContactsImported,
    ContactsMany
} from './messages/chat.api.contacts_pb';
import {
    Bool, Dialog,
    Group,
    GroupFull,
    InputFile,
    InputPeer,
    InputUser,
    MessageEntity,
    PeerNotifySettings,
    PhoneContact,
    PushTokenProvider,
    TypingAction,
    User
} from './messages/chat.core.types_pb';
import {
    InputMediaType,
    MessagesClearHistory,
    MessagesDelete,
    MessagesDialogs,
    MessagesEdit,
    MessagesForward,
    MessagesGetDialogs,
    MessagesGetHistory, MessagesGetPinnedDialogs,
    MessagesMany,
    MessagesReadContents,
    MessagesReadHistory,
    MessagesSend,
    MessagesSendMedia,
    MessagesSent,
    MessagesSetTyping, MessagesToggleDialogPin
} from './messages/chat.api.messages_pb';
import {UpdateDifference, UpdateGetDifference, UpdateGetState, UpdateState} from './messages/chat.api.updates_pb';
import {
    AccountAuthorizations,
    AccountCheckUsername, AccountGetAuthorizations,
    AccountGetNotifySettings,
    AccountRegisterDevice,
    AccountRemovePhoto, AccountResetAuthorization,
    AccountSetNotifySettings,
    AccountUpdateProfile,
    AccountUpdateUsername,
    AccountUploadPhoto
} from './messages/chat.api.accounts_pb';
import {
    GroupsAddUser,
    GroupsCreate,
    GroupsDeleteUser,
    GroupsEditTitle,
    GroupsGetFull, GroupsRemovePhoto,
    GroupsToggleAdmins,
    GroupsUpdateAdmin,
    GroupsUploadPhoto
} from './messages/chat.api.groups_pb';
import {UsersGetFull, UsersMany} from './messages/chat.api.users_pb';
import {SystemGetInfo, SystemInfo, SystemGetSalts, SystemSalts} from './messages/chat.api.system_pb';

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
    private systemInfoCache: any = null;

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
        localStorage.removeItem('river.contacts.hash');
        localStorage.removeItem('river.settings.download');
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

    public resendCode(phone: string, hash: string): Promise<Bool.AsObject> {
        const data = new AuthResendCode();
        data.setPhone(phone);
        data.setPhonecodehash(hash);
        return this.server.send(C_MSG.AuthResendCode, data.serializeBinary(), true);
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
        data.setVersion(0);
        return this.server.send(C_MSG.AuthRecall, data.serializeBinary(), true);
    }

    public sessionGetAll(): Promise<AccountAuthorizations.AsObject> {
        const data = new AccountGetAuthorizations();
        return this.server.send(C_MSG.AccountGetAuthorizations, data.serializeBinary(), true);
    }

    public sessionTerminate(id: string): Promise<AuthRecalled.AsObject> {
        const data = new AccountResetAuthorization();
        data.setAuthid(id);
        return this.server.send(C_MSG.AccountResetAuthorization, data.serializeBinary(), true);
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

    public getContacts(crc?: number): Promise<ContactsMany.AsObject> {
        const data = new ContactsGet();
        data.setCrc32hash(crc || 0);
        return this.server.send(C_MSG.ContactsGet, data.serializeBinary());
    }

    public removeContact(contactIds: string[]): Promise<Bool.AsObject> {
        const data = new ContactsDelete();
        data.setUseridsList(contactIds);
        return this.server.send(C_MSG.ContactsDelete, data.serializeBinary());
    }

    public getDialogs(skip: number, limit: number): Promise<MessagesDialogs.AsObject> {
        const data = new MessagesGetDialogs();
        data.setOffset(skip || 0);
        data.setLimit(limit || 0);
        return this.server.send(C_MSG.MessagesGetDialogs, data.serializeBinary());
    }

    public sendMessage(randomId: number, body: string, peer: InputPeer, replyTo?: number, entities?: MessageEntity[]): Promise<MessagesSent.AsObject> {
        const data = new MessagesSend();
        data.setRandomid(randomId);
        data.setBody(body);
        data.setPeer(peer);
        data.setCleardraft(false);
        if (replyTo) {
            data.setReplyto(replyTo);
        }
        if (entities) {
            data.setEntitiesList(entities);
        }
        return this.server.send(C_MSG.MessagesSend, data.serializeBinary());
    }

    public editMessage(randomId: number, id: number, body: string, peer: InputPeer, entities?: MessageEntity[]): Promise<MessagesSent.AsObject> {
        const data = new MessagesEdit();
        data.setRandomid(randomId);
        data.setBody(body);
        data.setPeer(peer);
        data.setMessageid(id);
        if (entities) {
            data.setEntitiesList(entities);
        }
        return this.server.send(C_MSG.MessagesEdit, data.serializeBinary());
    }

    public sendMediaMessage(randomId: number, peer: InputPeer, mediaType: InputMediaType, mediaData: Uint8Array, replyTo?: number): Promise<MessagesSent.AsObject> {
        const data = new MessagesSendMedia();
        data.setRandomid(randomId);
        data.setPeer(peer);
        data.setMediatype(mediaType);
        data.setMediadata(mediaData);
        data.setCleardraft(false);
        if (replyTo) {
            data.setReplyto(replyTo);
        }
        return this.server.send(C_MSG.MessagesSendMedia, data.serializeBinary());
    }

    public readMessageContent(ids: number[], peer: InputPeer): Promise<MessagesSent.AsObject> {
        const data = new MessagesReadContents();
        data.setPeer(peer);
        data.setMessageidsList(ids);
        return this.server.send(C_MSG.MessagesReadContents, data.serializeBinary());
    }

    public getMessageHistory(peer: InputPeer, {limit, minId, maxId}: any): Promise<MessagesMany.AsObject> {
        const data = new MessagesGetHistory();
        data.setPeer(peer);
        data.setLimit(limit || 0);
        data.setMinid(Math.floor(minId || 0));
        data.setMaxid(Math.floor(maxId || 0));
        return this.server.send(C_MSG.MessagesGetHistory, data.serializeBinary(), false);
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
        data.setTokentype(PushTokenProvider.PUSHTOKENFIREBASE);
        data.setClientid('river');
        return this.server.send(C_MSG.AccountRegisterDevice, data.serializeBinary(), true);
    }

    public removeMessage(peer: InputPeer, ids: number[], revoke: boolean): Promise<Bool.AsObject> {
        const data = new MessagesDelete();
        data.setPeer(peer);
        data.setMessageidsList(ids);
        data.setRevoke(revoke);
        return this.server.send(C_MSG.MessagesDelete, data.serializeBinary(), true);
    }

    public forwardMessage(peer: InputPeer, ids: number[], randomId: number, targetPeer: InputPeer, silence: boolean): Promise<Bool.AsObject> {
        const data = new MessagesForward();
        data.setFrompeer(peer);
        data.setMessageidsList(ids);
        data.setTopeer(targetPeer);
        data.setRandomid(randomId);
        data.setSilence(silence);
        return this.server.send(C_MSG.MessagesForward, data.serializeBinary(), false);
    }

    public clearMessage(peer: InputPeer, maxId: number, clearDialog: boolean) {
        const data = new MessagesClearHistory();
        data.setPeer(peer);
        data.setMaxid(maxId);
        data.setDelete(clearDialog);
        return this.server.send(C_MSG.MessagesClearHistory, data.serializeBinary(), true);
    }

    public usernameAvailable(username: string): Promise<Bool.AsObject> {
        const data = new AccountCheckUsername();
        data.setUsername(username);
        return this.server.send(C_MSG.AccountCheckUsername, data.serializeBinary(), true);
    }

    public updateUsername(username: string): Promise<User.AsObject> {
        const data = new AccountUpdateUsername();
        data.setUsername(username);
        return this.server.send(C_MSG.AccountUpdateUsername, data.serializeBinary(), true);
    }

    public updateProfile(firstname: string, lastname: string, bio: string): Promise<Bool.AsObject> {
        const data = new AccountUpdateProfile();
        data.setFirstname(firstname);
        data.setLastname(lastname);
        data.setBio(bio);
        return this.server.send(C_MSG.AccountUpdateProfile, data.serializeBinary(), true);
    }

    public uploadProfilePicture(file: InputFile): Promise<Bool.AsObject> {
        const data = new AccountUploadPhoto();
        data.setFile(file);
        return this.server.send(C_MSG.AccountUploadPhoto, data.serializeBinary(), true);
    }

    public removeProfilePicture(): Promise<Bool.AsObject> {
        const data = new AccountRemovePhoto();
        return this.server.send(C_MSG.AccountRemovePhoto, data.serializeBinary(), true);
    }

    public getUserFull(usersInput: InputUser[]): Promise<UsersMany.AsObject> {
        const data = new UsersGetFull();
        data.setUsersList(usersInput);
        return this.server.send(C_MSG.UsersGetFull, data.serializeBinary(), true);
    }

    public setNotifySettings(peer: InputPeer, settings: PeerNotifySettings): Promise<Bool.AsObject> {
        const data = new AccountSetNotifySettings();
        data.setPeer(peer);
        data.setSettings(settings);
        return this.server.send(C_MSG.AccountSetNotifySettings, data.serializeBinary(), true);
    }

    public getNotifySettings(peer: InputPeer): Promise<PeerNotifySettings.AsObject> {
        const data = new AccountGetNotifySettings();
        data.setPeer(peer);
        return this.server.send(C_MSG.AccountGetNotifySettings, data.serializeBinary(), true);
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

    public groupUpdateAdmin(peer: InputPeer, user: InputUser, admin: boolean): Promise<Bool.AsObject> {
        const data = new GroupsUpdateAdmin();
        data.setGroupid(peer.getId() || '');
        data.setUser(user);
        data.setAdmin(admin);
        return this.server.send(C_MSG.GroupsUpdateAdmin, data.serializeBinary(), true);
    }

    public groupToggleAdmin(peer: InputPeer, adminEnabled: boolean): Promise<Bool.AsObject> {
        const data = new GroupsToggleAdmins();
        data.setGroupid(peer.getId() || '');
        data.setAdminenabled(adminEnabled);
        return this.server.send(C_MSG.GroupsToggleAdmins, data.serializeBinary(), true);
    }

    public groupUploadPicture(groupId: string, file: InputFile): Promise<Bool.AsObject> {
        const data = new GroupsUploadPhoto();
        data.setGroupid(groupId);
        data.setFile(file);
        return this.server.send(C_MSG.GroupsUploadPhoto, data.serializeBinary(), true);
    }

    public groupRemovePicture(groupId: string): Promise<Bool.AsObject> {
        const data = new GroupsRemovePhoto();
        data.setGroupid(groupId);
        return this.server.send(C_MSG.GroupsRemovePhoto, data.serializeBinary(), true);
    }

    public systemGetInfo(useCache?: boolean): Promise<SystemInfo.AsObject> {
        if (useCache && this.systemInfoCache) {
            return Promise.resolve(this.systemInfoCache);
        }
        const data = new SystemGetInfo();
        return this.server.send(C_MSG.SystemGetInfo, data.serializeBinary(), true).then((res) => {
            this.systemInfoCache = res;
            return res;
        });
    }

    public dialogGetPinned(): Promise<MessagesDialogs.AsObject> {
        const data = new MessagesGetPinnedDialogs();
        return this.server.send(C_MSG.MessagesGetPinnedDialogs, data.serializeBinary(), true);
    }

    public dialogTogglePin(peer: InputPeer, pin: boolean): Promise<Dialog.AsObject> {
        const data = new MessagesToggleDialogPin();
        data.setPeer(peer);
        data.setPin(pin);
        return this.server.send(C_MSG.MessagesToggleDialogPin, data.serializeBinary(), true);
    }

    public getServerSalts(): Promise<SystemSalts.AsObject> {
        const data = new SystemGetSalts();
        return this.server.send(C_MSG.SystemGetSalts, data.serializeBinary(), true);
    }
}
