import {AuthCheckPhone, AuthRegister, AuthSendCode} from './messages/api.auth_pb';
import Server from './server';
import {C_MSG} from "./const";

export default class SDK {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new SDK();
        }

        return this.instance;
    }

    private static instance: SDK;

    private server: Server;

    public constructor() {
        this.server = Server.getInstance();
    }

    public sendCode(phone: string): Promise<any> {
        const data = new AuthSendCode;
        data.setPhone(phone);
        return this.server.send(C_MSG.AuthSentCode, data.serializeBinary());
    }

    public checkPhone(phone: string): Promise<any> {
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
}
