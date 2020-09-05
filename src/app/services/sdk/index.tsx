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
    AuthCheckPassword,
    AuthCheckPhone,
    AuthLogin,
    AuthLogout,
    AuthRecall,
    AuthRecalled,
    AuthRegister,
    AuthResendCode,
    AuthSendCode,
    AuthSentCode
} from './messages/auth_pb';
import Server from './server';
import {C_ERR, C_ERR_ITEM, C_LOCALSTORAGE, C_MSG} from './const';
import {IConnInfo} from './interface';
import {
    BlockedContactsMany,
    ContactsAdd,
    ContactsBlock,
    ContactsDelete,
    ContactsDeleteAll,
    ContactsGet,
    ContactsGetBlocked,
    ContactsGetTopPeers,
    ContactsImport,
    ContactsImported,
    ContactsMany, ContactsResetTopPeer,
    ContactsSearch, ContactsTopPeers,
    ContactsUnblock,
    TopPeerCategory
} from './messages/contacts_pb';
import {
    Bool,
    Dialog,
    FileLocation,
    Group,
    GroupFull,
    GroupPhoto, InputDocument,
    InputFile,
    InputMediaType,
    InputPassword,
    InputPeer, InputTeam,
    InputUser,
    Label,
    LabelsMany,
    MessageEntity,
    PeerNotifySettings,
    PhoneContact, Ping, Pong,
    PrivacyKey,
    PrivacyRule,
    PushTokenProvider,
    TypingAction,
    User,
    UserPhoto
} from './messages/core.types_pb';
import {
    MessagesClearDraft,
    MessagesClearHistory,
    MessagesDelete,
    MessagesDialogs,
    MessagesEdit,
    MessagesForward,
    MessagesGet,
    MessagesGetDialogs,
    MessagesGetHistory,
    MessagesGetPinnedDialogs,
    MessagesMany,
    MessagesReadContents,
    MessagesReadHistory,
    MessagesSaveDraft,
    MessagesSend,
    MessagesSendMedia,
    MessagesSent,
    MessagesSetTyping,
    MessagesToggleDialogPin
} from './messages/chat.messages_pb';
import {UpdateDifference, UpdateGetDifference, UpdateGetState, UpdateState} from './messages/updates_pb';
import {
    AccountAuthorizations,
    AccountChangePhone,
    AccountCheckUsername,
    AccountGetAuthorizations,
    AccountGetNotifySettings,
    AccountGetPassword,
    AccountGetPrivacy, AccountGetTeams,
    AccountPassword,
    AccountPrivacyRules,
    AccountRecoverPassword,
    AccountRegisterDevice,
    AccountRemovePhoto,
    AccountResetAuthorization,
    AccountSendChangePhoneCode,
    AccountSetLang,
    AccountSetNotifySettings,
    AccountSetPrivacy,
    AccountUpdatePasswordSettings,
    AccountUpdatePhoto,
    AccountUpdateProfile,
    AccountUpdateUsername,
    AccountUploadPhoto,
    SecurityAnswer,
    SecurityQuestion
} from './messages/accounts_pb';
import {
    GroupsAddUser,
    GroupsCreate,
    GroupsDeleteUser,
    GroupsEditTitle,
    GroupsGetFull,
    GroupsRemovePhoto,
    GroupsToggleAdmins,
    GroupsUpdateAdmin,
    GroupsUpdatePhoto,
    GroupsUploadPhoto
} from './messages/chat.groups_pb';
import {UsersGet, UsersGetFull, UsersMany} from './messages/users_pb';
import {
    SystemConfig,
    SystemGetConfig,
    SystemGetInfo,
    SystemGetSalts,
    SystemInfo,
    SystemSalts
} from './messages/system_pb';
import {parsePhoneNumberFromString} from 'libphonenumber-js';
import {
    LabelItems,
    LabelsAddToMessage,
    LabelsCreate,
    LabelsDelete,
    LabelsEdit,
    LabelsGet,
    LabelsListItems,
    LabelsRemoveFromMessage
} from "./messages/chat.labels_pb";
import UniqueId from "../uniqueId";
import {
    BotCallbackAnswer,
    BotGetCallbackAnswer,
    BotGetInlineResults,
    BotResults, BotSendInlineResults,
    BotStart
} from "./messages/chat.bot_pb";
import {FileGetBySha256} from "./messages/files_pb";
import {GifDelete, GifGetSaved, GifSave, SavedGifs} from "./messages/gif_pb";
import {DocumentAttribute} from "./messages/chat.messages.medias_pb";
import FileManager from "./fileManager";
import {TeamsMany} from "./messages/team_pb";

export default class APIManager {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new APIManager();
        }
        return this.instance;
    }

    private static instance: APIManager;

    private server: Server;
    private connInfo: IConnInfo;

    private clientId: number = 0;
    private systemInfoCache: any = null;

    private typingList: { [key: string]: boolean } = {};

    private verboseAPI: boolean = localStorage.getItem(C_LOCALSTORAGE.DebugVerboseAPI) === 'true';

    public constructor() {
        this.server = Server.getInstance();

        const s = localStorage.getItem(C_LOCALSTORAGE.ConnInfo);
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
    }

    public setTeam(team: InputTeam.AsObject | undefined) {
        this.server.setTeam(team);
        FileManager.getInstance().setTeam(team);
    }

    public getConnInfo(): IConnInfo {
        return this.connInfo;
    }

    public setConnInfo(info: IConnInfo) {
        this.connInfo = info;
        const s = JSON.stringify(info);
        localStorage.setItem(C_LOCALSTORAGE.ConnInfo, s);
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
        localStorage.removeItem(C_LOCALSTORAGE.ContactsHash);
        localStorage.removeItem(C_LOCALSTORAGE.SettingsDownload);
        localStorage.removeItem(C_LOCALSTORAGE.GifHash);
        localStorage.removeItem(C_LOCALSTORAGE.TeamId);
        localStorage.removeItem(C_LOCALSTORAGE.TeamData);
        localStorage.removeItem(C_LOCALSTORAGE.SnapshotRecord);
        localStorage.removeItem(C_LOCALSTORAGE.ThemeBg);
        localStorage.removeItem(C_LOCALSTORAGE.ThemeBgPic);
    }

    public loadConnInfo(): IConnInfo {
        const s = localStorage.getItem(C_LOCALSTORAGE.ConnInfo);
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
        const data = new AuthSendCode();
        data.setPhone(phone);
        this.logVerbose(data);
        return this.server.send(C_MSG.AuthSendCode, data.serializeBinary(), true);
    }

    public resendCode(phone: string, hash: string): Promise<Bool.AsObject> {
        const data = new AuthResendCode();
        data.setPhone(phone);
        data.setPhonecodehash(hash);
        this.logVerbose(data);
        return this.server.send(C_MSG.AuthResendCode, data.serializeBinary(), true);
    }

    public checkPhone(phone: string): Promise<AuthCheckedPhone.AsObject> {
        const data = new AuthCheckPhone();
        data.setPhone(phone);
        this.logVerbose(data);
        return this.server.send(C_MSG.AuthCheckPhone, data.serializeBinary(), true);
    }

    public register(phone: string, phoneCode: string, phoneCodeHash: string, fName: string, lName: string, lang: string): Promise<any> {
        const data = new AuthRegister();
        data.setPhone(phone);
        data.setPhonecode(phoneCode);
        data.setPhonecodehash(phoneCodeHash);
        data.setFirstname(fName);
        data.setLastname(lName);
        data.setLangcode(lang);
        this.logVerbose(data);
        return this.server.send(C_MSG.AuthRegister, data.serializeBinary(), true);
    }

    public login(phone: string, phoneCode: string, phoneCodeHash: string): Promise<AuthAuthorization.AsObject | AccountPassword> {
        const data = new AuthLogin();
        data.setPhone(phone);
        data.setPhonecode(phoneCode);
        data.setPhonecodehash(phoneCodeHash);
        this.logVerbose(data);
        return this.server.send(C_MSG.AuthLogin, data.serializeBinary(), true);
    }

    public loginByPassword(inputPassword: InputPassword): Promise<AuthAuthorization.AsObject> {
        const data = new AuthCheckPassword();
        data.setPassword(inputPassword);
        this.logVerbose(data);
        return this.server.send(C_MSG.AuthCheckPassword, data.serializeBinary(), true);
    }

    public authRecall(): Promise<AuthRecalled.AsObject> {
        const data = new AuthRecall();
        data.setClientid('0');
        data.setVersion(0);
        this.logVerbose(data);
        return this.server.send(C_MSG.AuthRecall, data.serializeBinary(), true);
    }

    public sessionGetAll(): Promise<AccountAuthorizations.AsObject> {
        const data = new AccountGetAuthorizations();
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountGetAuthorizations, data.serializeBinary(), true);
    }

    public sessionTerminate(id: string): Promise<AuthRecalled.AsObject> {
        const data = new AccountResetAuthorization();
        data.setAuthid(id);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountResetAuthorization, data.serializeBinary(), true);
    }

    public contactImport(replace: boolean, contacts: PhoneContact.AsObject[]): Promise<ContactsImported.AsObject> {
        const data = new ContactsImport();
        const arr: PhoneContact[] = [];
        contacts.forEach((cont, key) => {
            const contact = new PhoneContact();
            if (cont.clientid) {
                contact.setClientid(cont.clientid || `${UniqueId.getRandomId()}`);
            } else {
                contact.setClientid(String(UniqueId.getRandomId()));
            }
            if (cont.firstname) {
                contact.setFirstname(cont.firstname || '');
            }
            if (cont.lastname) {
                contact.setLastname(cont.lastname || '');
            }
            if (cont.phone) {
                if (cont.phone.indexOf('237400') !== 0) {
                    const phoneObj = parsePhoneNumberFromString(cont.phone, 'IR');
                    if (phoneObj) {
                        // @ts-ignore
                        contact.setPhone(phoneObj.number || '');
                    }
                } else {
                    contact.setPhone(cont.phone || '');
                }
            }
            arr.push(contact);
        });
        data.setContactsList(arr);
        data.setReplace(replace);
        this.logVerbose(data);
        return this.server.send(C_MSG.ContactsImport, data.serializeBinary(), false);
    }

    public getContacts(crc?: number): Promise<ContactsMany.AsObject> {
        const data = new ContactsGet();
        data.setCrc32hash(crc || 0);
        this.logVerbose(data);
        return this.server.send(C_MSG.ContactsGet, data.serializeBinary(), true, {
            retry: 2,
            retryErrors: [{
                code: C_ERR.ErrCodeInternal,
                items: C_ERR_ITEM.ErrItemTimeout
            }],
        });
    }

    public removeContact(contactIds: string[]): Promise<Bool.AsObject> {
        const data = new ContactsDelete();
        data.setUseridsList(contactIds);
        this.logVerbose(data);
        return this.server.send(C_MSG.ContactsDelete, data.serializeBinary(), true);
    }

    public deleteAllContacts() {
        const data = new ContactsDeleteAll();
        this.logVerbose(data);
        return this.server.send(C_MSG.ContactsDeleteAll, data.serializeBinary(), true);
    }

    public getDialogs(skip: number, limit: number): Promise<MessagesDialogs.AsObject> {
        const data = new MessagesGetDialogs();
        data.setOffset(skip || 0);
        data.setLimit(limit || 0);
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesGetDialogs, data.serializeBinary(), false, {
            retry: 5,
            retryErrors: [{
                code: C_ERR.ErrCodeInternal,
                items: C_ERR_ITEM.ErrItemTimeout
            }],
            timeout: 10000,
        });
    }

    public sendMessage(randomId: number, body: string, peer: InputPeer, replyTo?: number, entities?: MessageEntity[], reqIdFn?: (rId: number) => void): Promise<MessagesSent.AsObject> {
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
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesSend, data.serializeBinary(), false, {
            retry: 1,
            retryErrors: [{
                code: C_ERR.ErrCodeInternal,
                items: C_ERR_ITEM.ErrItemTimeout
            }],
            timeout: 5000,
        }, reqIdFn);
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
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesEdit, data.serializeBinary(), true, {
            retry: 1,
            retryErrors: [{
                code: C_ERR.ErrCodeInternal,
                items: C_ERR_ITEM.ErrItemTimeout
            }],
        });
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
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesSendMedia, data.serializeBinary(), false, {
            retry: 3,
            retryErrors: [{
                code: C_ERR.ErrCodeInternal,
                items: C_ERR_ITEM.ErrItemTimeout
            }, {
                code: C_ERR.ErrCodeInvalid,
                items: C_ERR_ITEM.ErrItemNotFound
            }],
            retryWait: 1000,
        });
    }

    public readMessageContent(ids: number[], peer: InputPeer): Promise<MessagesSent.AsObject> {
        const data = new MessagesReadContents();
        data.setPeer(peer);
        data.setMessageidsList(ids);
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesReadContents, data.serializeBinary(), false);
    }

    public getMessageHistory(peer: InputPeer, {limit, minId, maxId}: any): Promise<MessagesMany.AsObject> {
        const data = new MessagesGetHistory();
        data.setPeer(peer);
        data.setLimit(limit || 0);
        data.setMinid(Math.floor(minId || 0));
        data.setMaxid(Math.floor(maxId || 0));
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesGetHistory, data.serializeBinary(), true, {
            retry: 7,
            retryErrors: [{
                code: C_ERR.ErrCodeInternal,
                items: C_ERR_ITEM.ErrItemServer,
            }],
        });
    }

    public getManyMessage(peer: InputPeer, ids: number[]): Promise<MessagesMany.AsObject> {
        const data = new MessagesGet();
        data.setPeer(peer);
        data.setMessagesidsList(ids);
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesGet, data.serializeBinary(), true);
    }

    public typing(peer: InputPeer, type: TypingAction): Promise<Bool.AsObject> {
        const key = `${peer.getId()}_${peer.getType()}_${type}`;
        if (this.typingList.hasOwnProperty(key)) {
            return Promise.resolve({result: true});
        }
        this.typingList[key] = true;
        const timeout = setTimeout(() => {
            delete this.typingList[key];
        }, 10000);
        const data = new MessagesSetTyping();
        data.setPeer(peer);
        data.setAction(type);
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesSetTyping, data.serializeBinary(), true).then((res) => {
            clearTimeout(timeout);
            delete this.typingList[key];
            return res;
        }).catch(() => {
            clearTimeout(timeout);
            delete this.typingList[key];
        });
    }

    public setMessagesReadHistory(peer: InputPeer, maxId: number): Promise<Bool> {
        const data = new MessagesReadHistory();
        data.setPeer(peer);
        data.setMaxid(maxId);
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesReadHistory, data.serializeBinary(), true, {
            retry: 3,
            retryErrors: [{
                code: C_ERR.ErrCodeInternal,
                items: C_ERR_ITEM.ErrItemTimeout
            }],
        });
    }

    public getUpdateState(): Promise<UpdateState.AsObject> {
        const data = new UpdateGetState();
        this.logVerbose(data);
        return this.server.send(C_MSG.UpdateGetState, data.serializeBinary(), true);
    }

    public getUpdateDifference(from: number, limit: number): Promise<UpdateDifference> {
        const data = new UpdateGetDifference();
        data.setFrom(from);
        data.setLimit(limit);
        return this.server.send(C_MSG.UpdateGetDifference, data.serializeBinary(), true, {
            retry: 3,
            retryErrors: [{
                code: C_ERR.ErrCodeInternal,
                items: C_ERR_ITEM.ErrItemTimeout
            }],
        });
    }

    public logout(authId: string): Promise<Bool> {
        const data = new AuthLogout();
        data.setAuthidsList([authId]);
        this.logVerbose(data);
        return this.server.send(C_MSG.AuthLogout, data.serializeBinary(), true, {timeout: 5000});
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
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountRegisterDevice, data.serializeBinary(), true);
    }

    public removeMessage(peer: InputPeer, ids: number[], revoke: boolean): Promise<Bool.AsObject> {
        const data = new MessagesDelete();
        data.setPeer(peer);
        data.setMessageidsList(ids);
        data.setRevoke(revoke);
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesDelete, data.serializeBinary(), true);
    }

    public forwardMessage(peer: InputPeer, ids: number[], randomId: number, targetPeer: InputPeer, silence: boolean): Promise<Bool.AsObject> {
        const data = new MessagesForward();
        data.setFrompeer(peer);
        data.setMessageidsList(ids);
        data.setTopeer(targetPeer);
        data.setRandomid(randomId);
        data.setSilence(silence);
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesForward, data.serializeBinary(), false);
    }

    public clearMessage(peer: InputPeer, maxId: number, clearDialog: boolean) {
        const data = new MessagesClearHistory();
        data.setPeer(peer);
        data.setMaxid(maxId);
        data.setDelete(clearDialog);
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesClearHistory, data.serializeBinary(), true);
    }

    public usernameAvailable(username: string): Promise<Bool.AsObject> {
        const data = new AccountCheckUsername();
        data.setUsername(username);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountCheckUsername, data.serializeBinary(), true);
    }

    public updateUsername(username: string): Promise<User.AsObject> {
        const data = new AccountUpdateUsername();
        data.setUsername(username);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountUpdateUsername, data.serializeBinary(), true);
    }

    public updateProfile(firstname: string, lastname: string, bio: string): Promise<Bool.AsObject> {
        const data = new AccountUpdateProfile();
        data.setFirstname(firstname);
        data.setLastname(lastname);
        data.setBio(bio);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountUpdateProfile, data.serializeBinary(), true);
    }

    public uploadProfilePicture(file: InputFile): Promise<UserPhoto.AsObject> {
        const data = new AccountUploadPhoto();
        data.setFile(file);
        data.setReturnobject(true);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountUploadPhoto, data.serializeBinary(), true);
    }

    public updateProfilePicture(id: string): Promise<Bool.AsObject> {
        const data = new AccountUpdatePhoto();
        data.setPhotoid(id);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountUpdatePhoto, data.serializeBinary(), true);
    }

    public removeProfilePicture(id?: string): Promise<Bool.AsObject> {
        const data = new AccountRemovePhoto();
        data.setPhotoid(id || '0');
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountRemovePhoto, data.serializeBinary(), true);
    }

    public getUserFull(usersInput: InputUser[]): Promise<UsersMany.AsObject> {
        const data = new UsersGetFull();
        data.setUsersList(usersInput);
        this.logVerbose(data);
        return this.server.send(C_MSG.UsersGetFull, data.serializeBinary(), true);
    }

    public getUser(usersInput: InputUser[]): Promise<UsersMany.AsObject> {
        const data = new UsersGet();
        data.setUsersList(usersInput);
        this.logVerbose(data);
        return this.server.send(C_MSG.UsersGet, data.serializeBinary(), false);
    }

    public setNotifySettings(peer: InputPeer, settings: PeerNotifySettings): Promise<Bool.AsObject> {
        const data = new AccountSetNotifySettings();
        data.setPeer(peer);
        data.setSettings(settings);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountSetNotifySettings, data.serializeBinary(), true);
    }

    public getNotifySettings(peer: InputPeer): Promise<PeerNotifySettings.AsObject> {
        const data = new AccountGetNotifySettings();
        data.setPeer(peer);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountGetNotifySettings, data.serializeBinary(), true);
    }

    public groupCreate(users: InputUser[], title: string): Promise<Group.AsObject> {
        const data = new GroupsCreate();
        data.setUsersList(users);
        data.setTitle(title);
        data.setRandomid(UniqueId.getRandomId());
        this.logVerbose(data);
        return this.server.send(C_MSG.GroupsCreate, data.serializeBinary(), true);
    }

    public groupGetFull(peer: InputPeer): Promise<GroupFull.AsObject> {
        const data = new GroupsGetFull();
        data.setGroupid(peer.getId() || '');
        this.logVerbose(data);
        return this.server.send(C_MSG.GroupsGetFull, data.serializeBinary(), true);
    }

    public groupEditTitle(peer: InputPeer, title: string): Promise<Bool.AsObject> {
        const data = new GroupsEditTitle();
        data.setGroupid(peer.getId() || '');
        data.setTitle(title);
        this.logVerbose(data);
        return this.server.send(C_MSG.GroupsEditTitle, data.serializeBinary(), true);
    }

    public groupRemoveMember(peer: InputPeer, user: InputUser): Promise<Bool.AsObject> {
        const data = new GroupsDeleteUser();
        data.setGroupid(peer.getId() || '');
        data.setUser(user);
        this.logVerbose(data);
        return this.server.send(C_MSG.GroupsDeleteUser, data.serializeBinary(), true);
    }

    public groupAddMember(peer: InputPeer, user: InputUser, limit: number): Promise<Bool.AsObject> {
        const data = new GroupsAddUser();
        data.setGroupid(peer.getId() || '');
        data.setUser(user);
        data.setForwardlimit(limit);
        this.logVerbose(data);
        return this.server.send(C_MSG.GroupsAddUser, data.serializeBinary(), true);
    }

    public groupUpdateAdmin(peer: InputPeer, user: InputUser, admin: boolean): Promise<Bool.AsObject> {
        const data = new GroupsUpdateAdmin();
        data.setGroupid(peer.getId() || '');
        data.setUser(user);
        data.setAdmin(admin);
        this.logVerbose(data);
        return this.server.send(C_MSG.GroupsUpdateAdmin, data.serializeBinary(), true);
    }

    public groupToggleAdmin(peer: InputPeer, adminEnabled: boolean): Promise<Bool.AsObject> {
        const data = new GroupsToggleAdmins();
        data.setGroupid(peer.getId() || '');
        data.setAdminenabled(adminEnabled);
        this.logVerbose(data);
        return this.server.send(C_MSG.GroupsToggleAdmins, data.serializeBinary(), true);
    }

    public groupUploadPicture(groupId: string, file: InputFile): Promise<GroupPhoto.AsObject> {
        const data = new GroupsUploadPhoto();
        data.setGroupid(groupId);
        data.setFile(file);
        data.setReturnobject(true);
        this.logVerbose(data);
        return this.server.send(C_MSG.GroupsUploadPhoto, data.serializeBinary(), true);
    }

    public groupUpdatePicture(groupId: string, id?: string): Promise<Bool.AsObject> {
        const data = new GroupsUpdatePhoto();
        data.setGroupid(groupId);
        data.setPhotoid(id || '0');
        this.logVerbose(data);
        return this.server.send(C_MSG.GroupsUpdatePhoto, data.serializeBinary(), true);
    }

    public groupRemovePicture(groupId: string, id?: string): Promise<Bool.AsObject> {
        const data = new GroupsRemovePhoto();
        data.setGroupid(groupId);
        data.setPhotoid(id || '0');
        this.logVerbose(data);
        return this.server.send(C_MSG.GroupsRemovePhoto, data.serializeBinary(), true);
    }

    public systemGetInfo(useCache?: boolean): Promise<SystemInfo.AsObject> {
        if (useCache && this.systemInfoCache) {
            return Promise.resolve(this.systemInfoCache);
        }
        const data = new SystemGetInfo();
        this.logVerbose(data);
        return this.server.send(C_MSG.SystemGetInfo, data.serializeBinary(), true).then((res) => {
            this.systemInfoCache = res;
            return res;
        });
    }

    public dialogGetPinned(): Promise<MessagesDialogs.AsObject> {
        const data = new MessagesGetPinnedDialogs();
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesGetPinnedDialogs, data.serializeBinary(), true);
    }

    public dialogTogglePin(peer: InputPeer, pin: boolean): Promise<Dialog.AsObject> {
        const data = new MessagesToggleDialogPin();
        data.setPeer(peer);
        data.setPin(pin);
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesToggleDialogPin, data.serializeBinary(), true);
    }

    public getPrivacy(privacyKey: PrivacyKey): Promise<AccountPrivacyRules.AsObject> {
        const data = new AccountGetPrivacy();
        data.setKey(privacyKey);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountGetPrivacy, data.serializeBinary(), false);
    }

    public setPrivacy({callList, chatInviteList, chatForwardedList, lastSeenList, phoneNumberList, profilePhotoList}: { callList?: PrivacyRule[], chatInviteList?: PrivacyRule[], chatForwardedList?: PrivacyRule[], lastSeenList?: PrivacyRule[], phoneNumberList?: PrivacyRule[], profilePhotoList?: PrivacyRule[] }): Promise<Bool.AsObject> {
        const data = new AccountSetPrivacy();
        data.setCallList(callList || []);
        data.setChatinviteList(chatInviteList || []);
        data.setForwardedmessageList(chatForwardedList || []);
        data.setLastseenList(lastSeenList || []);
        data.setPhonenumberList(phoneNumberList || []);
        data.setProfilephotoList(profilePhotoList || []);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountSetPrivacy, data.serializeBinary(), false);
    }

    public saveDraft(peer: InputPeer, body: string, replyTo?: number, entities?: MessageEntity.AsObject[]): Promise<Bool.AsObject> {
        const data = new MessagesSaveDraft();
        data.setPeer(peer);
        data.setBody(body);
        data.setReplyto(replyTo || 0);
        const messageEntities: MessageEntity[] = [];
        if (entities) {
            entities.forEach((o) => {
                const entity = new MessageEntity();
                entity.setLength(o.length || 0);
                entity.setOffset(o.offset || 0);
                entity.setType(o.type || 0);
                entity.setUserid(o.userid || '');
                messageEntities.push(entity);
            });
        }
        data.setEntitiesList(messageEntities);
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesSaveDraft, data.serializeBinary(), true);
    }

    public clearDraft(peer: InputPeer): Promise<Bool.AsObject> {
        const data = new MessagesClearDraft();
        data.setPeer(peer);
        this.logVerbose(data);
        return this.server.send(C_MSG.MessagesClearDraft, data.serializeBinary(), true);
    }

    public setLang(langCode: string): Promise<Bool.AsObject> {
        const data = new AccountSetLang();
        data.setLangcode(langCode);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountSetLang, data.serializeBinary(), true, {timeout: 3000});
    }

    public labelCreate(name: string, color: string,): Promise<Label.AsObject> {
        const data = new LabelsCreate();
        data.setName(name);
        data.setColour(color);
        data.setRandomid(UniqueId.getRandomId());
        this.logVerbose(data);
        return this.server.send(C_MSG.LabelsCreate, data.serializeBinary(), true);
    }

    public labelEdit(id: number, name: string, color: string): Promise<Bool.AsObject> {
        const data = new LabelsEdit();
        data.setLabelid(id);
        data.setName(name);
        data.setColour(color);
        this.logVerbose(data);
        return this.server.send(C_MSG.LabelsEdit, data.serializeBinary(), true);
    }

    public labelDelete(ids: number[]): Promise<Bool.AsObject> {
        const data = new LabelsDelete();
        data.setLabelidsList(ids);
        this.logVerbose(data);
        return this.server.send(C_MSG.LabelsDelete, data.serializeBinary(), true);
    }

    public labelGet(): Promise<LabelsMany.AsObject> {
        const data = new LabelsGet();
        this.logVerbose(data);
        return this.server.send(C_MSG.LabelsGet, data.serializeBinary(), true);
    }

    public labelAddToMessage(peer: InputPeer, labelIds: number[], msgIds: number[]): Promise<Bool.AsObject> {
        const data = new LabelsAddToMessage();
        data.setPeer(peer);
        data.setLabelidsList(labelIds);
        data.setMessageidsList(msgIds);
        this.logVerbose(data);
        return this.server.send(C_MSG.LabelsAddToMessage, data.serializeBinary(), true);
    }

    public labelRemoveFromMessage(peer: InputPeer, labelIds: number[], msgIds: number[]): Promise<Bool.AsObject> {
        const data = new LabelsRemoveFromMessage();
        data.setPeer(peer);
        data.setLabelidsList(labelIds);
        data.setMessageidsList(msgIds);
        this.logVerbose(data);
        return this.server.send(C_MSG.LabelsRemoveFromMessage, data.serializeBinary(), true);
    }

    public labelList(id: number, min: number, max: number, limit: number): Promise<LabelItems.AsObject> {
        const data = new LabelsListItems();
        data.setLabelid(id);
        data.setLimit(limit);
        data.setMinid(min);
        data.setMaxid(max);
        this.logVerbose(data);
        return this.server.send(C_MSG.LabelsListItems, data.serializeBinary(), true);
    }

    public contactSearch(query: string): Promise<UsersMany.AsObject> {
        const data = new ContactsSearch();
        data.setQ(query);
        this.logVerbose(data);
        return this.server.send(C_MSG.ContactsSearch, data.serializeBinary(), true);
    }

    public contactAdd(inputUser: InputUser, firstName: string, lastName: string, phone: string): Promise<any> {
        const data = new ContactsAdd();
        data.setFirstname(firstName);
        data.setLastname(lastName);
        data.setPhone(phone);
        data.setUser(inputUser);
        this.logVerbose(data);
        return this.server.send(C_MSG.ContactsAdd, data.serializeBinary(), true);
    }

    public accountChangeNumber(phone: string, phoneCode: string, phoneHash: string, inputPassword?: InputPassword): Promise<User.AsObject> {
        const data = new AccountChangePhone();
        data.setPhone(phone);
        data.setPhonecode(phoneCode);
        data.setPhonecodehash(phoneHash);
        data.setPassword(inputPassword);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountChangePhone, data.serializeBinary(), true);
    }

    public accountSendChangePhoneCode(phone: string): Promise<AuthSentCode.AsObject> {
        const data = new AccountSendChangePhoneCode();
        data.setPhone(phone);
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountSendChangePhoneCode, data.serializeBinary(), true);
    }

    public accountGetPassword(): Promise<AccountPassword> {
        const data = new AccountGetPassword();
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountGetPassword, data.serializeBinary(), true);
    }

    public accountSetPassword(algorithm: number, algorithmData: Uint8Array, passwordHash: Uint8Array | undefined, hint: string, questionList: SecurityQuestion.AsObject[], passwordInput?: InputPassword): Promise<Bool.AsObject> {
        const data = new AccountUpdatePasswordSettings();
        data.setAlgorithm(algorithm);
        data.setAlgorithmdata(algorithmData);
        data.setPasswordhash(passwordHash ? passwordHash : new Uint8Array(0));
        data.setHint(hint);
        data.setPassword(passwordInput);
        questionList.forEach((question) => {
            const securityQuestion = new SecurityQuestion();
            securityQuestion.setAnswer(question.answer || '');
            securityQuestion.setText(question.text || '');
            securityQuestion.setId(question.id || 0);
            data.addQuestions(securityQuestion);
        });
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountUpdatePasswordSettings, data.serializeBinary(), true);
    }

    public accountRecover(algorithm: number, algorithmData: Uint8Array, srpId: string, answerList: SecurityAnswer.AsObject[]) {
        const data = new AccountRecoverPassword();
        data.setAlgorithm(algorithm);
        data.setAlgorithmdata(algorithmData);
        data.setSrpid(srpId);
        answerList.forEach((answer) => {
            const securityAnswer = new SecurityAnswer();
            securityAnswer.setAnswer(answer.answer || '');
            securityAnswer.setQuestionid(answer.questionid || 0);
            data.addAnswers(securityAnswer);
        });
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountRecoverPassword, data.serializeBinary(), true);
    }

    public accountGetBlockedUser(skip: number, limit: number): Promise<BlockedContactsMany.AsObject> {
        const data = new ContactsGetBlocked();
        data.setOffset(skip);
        data.setLimit(limit);
        this.logVerbose(data);
        return this.server.send(C_MSG.ContactsGetBlocked, data.serializeBinary(), true);
    }

    public accountBlock(inputUser: InputUser): Promise<any> {
        const data = new ContactsBlock();
        data.setUser(inputUser);
        this.logVerbose(data);
        return this.server.send(C_MSG.ContactsBlock, data.serializeBinary(), true);
    }

    public accountUnblock(inputUser: InputUser): Promise<any> {
        const data = new ContactsUnblock();
        data.setUser(inputUser);
        this.logVerbose(data);
        return this.server.send(C_MSG.ContactsUnblock, data.serializeBinary(), true);
    }

    public botStart(inputPeer: InputPeer, randomId: number): Promise<Bool.AsObject> {
        const data = new BotStart();
        data.setBot(inputPeer);
        data.setRandomid(randomId);
        data.setStartparam("");
        this.logVerbose(data);
        return this.server.send(C_MSG.BotStart, data.serializeBinary(), true);
    }

    public botGetCallbackAnswer(inputPeer: InputPeer, payload: any, msgId?: number): Promise<BotCallbackAnswer.AsObject> {
        const data = new BotGetCallbackAnswer();
        data.setPeer(inputPeer);
        data.setData(payload);
        if (msgId) {
            data.setMessageid(msgId);
        }
        this.logVerbose(data);
        return this.server.send(C_MSG.BotGetCallbackAnswer, data.serializeBinary(), true);
    }

    public getTopPeer(category: TopPeerCategory, offset: number, limit: number): Promise<ContactsTopPeers.AsObject> {
        const data = new ContactsGetTopPeers();
        data.setCategory(category);
        data.setOffset(offset);
        data.setLimit(limit);
        this.logVerbose(data);
        return this.server.send(C_MSG.ContactsGetTopPeers, data.serializeBinary(), false);
    }

    public removeTopPeer(category: TopPeerCategory, peer: InputPeer): Promise<Bool.AsObject> {
        const data = new ContactsResetTopPeer();
        data.setCategory(category);
        data.setPeer(peer);
        this.logVerbose(data);
        return this.server.send(C_MSG.ContactsResetTopPeer, data.serializeBinary(), true);
    }

    public getSystemConfig(): Promise<SystemConfig.AsObject> {
        const data = new SystemGetConfig();
        this.logVerbose(data);
        return this.server.send(C_MSG.SystemGetConfig, data.serializeBinary(), false).then((config) => {
            this.server.setSystemConfig(config);
            return config;
        });
    }

    public getInstantSystemConfig(): SystemConfig.AsObject {
        return this.server.getSystemConfig();
    }

    public getGif(hash: number): Promise<SavedGifs.AsObject> {
        const data = new GifGetSaved();
        data.setHash(hash);
        this.logVerbose(data);
        return this.server.send(C_MSG.GifGetSaved, data.serializeBinary(), false);
    }

    public saveGif(inputDocument: InputDocument, attributeList: DocumentAttribute[]): Promise<Bool.AsObject> {
        const data = new GifSave();
        data.setDoc(inputDocument);
        data.setAttributesList(attributeList);
        this.logVerbose(data);
        return this.server.send(C_MSG.GifSave, data.serializeBinary(), false);
    }

    public removeGif(inputDocument: InputDocument): Promise<Bool.AsObject> {
        const data = new GifDelete();
        data.setDoc(inputDocument);
        this.logVerbose(data);
        return this.server.send(C_MSG.GifDelete, data.serializeBinary(), false);
    }

    public accountGetTeams(): Promise<TeamsMany.AsObject> {
        const data = new AccountGetTeams();
        this.logVerbose(data);
        return this.server.send(C_MSG.AccountGetTeams, data.serializeBinary(), true);
    }

    public botGetInlineResults(botPeer: InputUser, userPeer: InputPeer, query: string, offset: string): Promise<BotResults.AsObject> {
        const data = new BotGetInlineResults();
        data.setBot(botPeer);
        data.setPeer(userPeer);
        data.setQuery(query);
        data.setOffset(offset);
        return this.server.send(C_MSG.BotGetInlineResults, data.serializeBinary(), true);
    }

    public botSendInlineResults(randomId: number, inputPeer: InputPeer, queryId: string, resultId: string, replyTo?: number): Promise<Bool.AsObject> {
        const data = new BotSendInlineResults();
        data.setRandomid(randomId);
        data.setQueryid(queryId);
        data.setResultid(resultId);
        data.setPeer(inputPeer);
        if (replyTo) {
            data.setReplyto(replyTo);
        }
        return this.server.send(C_MSG.BotSendInlineResults, data.serializeBinary(), true);
    }

    public ping(): Promise<Pong.AsObject> {
        const data = new Ping();
        data.setId(Date.now());
        this.logVerbose(data);
        return this.server.send(C_MSG.Ping, data.serializeBinary(), true, {
            retry: 1,
            timeout: 2000,
        });
    }

    public genSrpHash(password: string, algorithm: number, algorithmData: Uint8Array): Promise<Uint8Array> {
        return this.server.genSrpHash(password, algorithm, algorithmData);
    }

    public genInputPassword(password: string, accountPassword: AccountPassword): Promise<InputPassword> {
        return this.server.genInputPassword(password, accountPassword.serializeBinary());
    }

    public getServerSalts(): Promise<SystemSalts.AsObject> {
        const data = new SystemGetSalts();
        return this.server.send(C_MSG.SystemGetSalts, data.serializeBinary(), true);
    }

    public getFileBySha256(sha256: Uint8Array, size: number): Promise<FileLocation.AsObject> {
        const data = new FileGetBySha256();
        data.setSha256(sha256);
        data.setFilesize(size);
        this.logVerbose(data);
        return this.server.send(C_MSG.FileGetBySha256, data.serializeBinary(), true, {
            retry: 2,
            retryWait: 500,
        });
    }

    public startNetWork() {
        this.server.startNetwork();
    }

    public cancelRequest(reqId: number) {
        this.server.cancelReqId(reqId);
    }

    public stopNetWork() {
        this.server.stopNetwork();
    }

    public isStarted() {
        return this.server.isStarted();
    }

    private logVerbose(data: any) {
        if (this.verboseAPI && data && data.toObject) {
            window.console.info('%cRequest', 'background-color: #008AAA', data.toObject());
        }
    }
}
