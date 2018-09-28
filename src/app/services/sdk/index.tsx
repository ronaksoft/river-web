import {
    AuthAuthorization,
    AuthCheckedPhone,
    AuthCheckPhone,
    AuthLogin, AuthRecall, AuthRecalled,
    AuthRegister,
    AuthSendCode,
    AuthSentCode
} from './messages/api.auth_pb';
import Server from './server';
import {C_MSG} from "./const";
import {IConnInfo} from "./interface";
import {ContactsGet, ContactsImport, ContactsImported, ContactsMany} from "./messages/api.contacts_pb";
import {InputPeer, PhoneContact} from "./messages/core.types_pb";
import {MessagesDialogs, MessagesGetDialogs, MessagesSend, MessagesSent} from "./messages/api.messages_pb";

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
    // private msgId: number;

    public constructor() {
        this.server = Server.getInstance();
        const s = localStorage.getItem('river.conn.info');
        if (s) {
            this.connInfo = JSON.parse(s);
        } else {
            this.connInfo = {
                AuthID: 0,
                AuthKey: '',
                FirstName: '',
                LastName: '',
                Phone: '',
                UserID: 0,
                Username: ''
            };
        }
        const id = localStorage.getItem('river.conn.client.id');
        if (id) {
            this.clientId = parseInt(id, 10);
        }
        // this.msgId = 0;
    }

    public getConnInfo(): IConnInfo {
        return this.connInfo;
    }

    public setConnInfo(info: IConnInfo) {
        this.connInfo = info;
        const s = JSON.stringify(info);
        localStorage.setItem('river.conn.info', s);
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
        return this.server.send(C_MSG.AuthSendCode, data.serializeBinary());
    }

    public checkPhone(phone: string): Promise<AuthCheckedPhone.AsObject> {
        const data = new AuthCheckPhone();
        data.setPhone(phone);
        return this.server.send(C_MSG.AuthCheckPhone, data.serializeBinary());
    }

    public register(phone: string, phoneCode: string, phoneCodeHash: string, fName: string, lName: string): Promise<any> {
        const data = new AuthRegister();
        data.setPhone(phone);
        data.setPhonecode(phoneCode);
        data.setPhonecodehash(phoneCodeHash);
        data.setFirstname(fName);
        data.setLastname(lName);
        return this.server.send(C_MSG.AuthRegister, data.serializeBinary());
    }

    public login(phone: string, phoneCode: string, phoneCodeHash: string): Promise<AuthAuthorization.AsObject> {
        const data = new AuthLogin();
        data.setPhone(phone);
        data.setPhonecode(phoneCode);
        data.setPhonecodehash(phoneCodeHash);
        return this.server.send(C_MSG.AuthLogin, data.serializeBinary());
    }

    public recall(clientId: number): Promise<AuthRecalled.AsObject> {
        const data = new AuthRecall();
        data.setClientid(clientId);
        return this.server.send(C_MSG.AuthRecall, data.serializeBinary());
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
        data.setOffset(skip);
        data.setLimit(limit);
        return this.server.send(C_MSG.MessagesGetDialogs, data.serializeBinary());
    }

    public sendMessage(body: string, peer: InputPeer, replyTo?: number): Promise<MessagesSent.AsObject> {
        const data = new MessagesSend();
        // this.msgId++;
        data.setRandomid(parseInt(Math.random().toFixed(length).split('.')[1], 10));
        data.setBody(body);
        data.setPeer(peer);
        if (replyTo) {
            data.setReplyto(replyTo);
        }
        return this.server.send(C_MSG.MessagesSend, data.serializeBinary());
    }
}
