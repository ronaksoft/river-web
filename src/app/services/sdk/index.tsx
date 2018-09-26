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

    public constructor() {
        this.server = Server.getInstance();
        const s = localStorage.getItem('river.conn.info');
        if (s) {
            this.connInfo = JSON.parse(s);
        }
    }

    public getConnInfo(): IConnInfo {
        return this.connInfo;
    }

    public setConnInfo(info: IConnInfo) {
        this.connInfo = info;
        const s = JSON.stringify(info);
        localStorage.setItem('river.conn.info', s);
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
}
