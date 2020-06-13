/* tslint:disable */
// package: msg
// file: accounts.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class AccountSetNotifySettings extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): core_types_pb.PeerNotifySettings;
  setSettings(value?: core_types_pb.PeerNotifySettings): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.InputTeam | undefined;
  setTeam(value?: core_types_pb.InputTeam): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountSetNotifySettings.AsObject;
  static toObject(includeInstance: boolean, msg: AccountSetNotifySettings): AccountSetNotifySettings.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountSetNotifySettings, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountSetNotifySettings;
  static deserializeBinaryFromReader(message: AccountSetNotifySettings, reader: jspb.BinaryReader): AccountSetNotifySettings;
}

export namespace AccountSetNotifySettings {
  export type AsObject = {
    peer: core_types_pb.InputPeer.AsObject,
    settings: core_types_pb.PeerNotifySettings.AsObject,
    team?: core_types_pb.InputTeam.AsObject,
  }
}

export class AccountGetNotifySettings extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.InputTeam | undefined;
  setTeam(value?: core_types_pb.InputTeam): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountGetNotifySettings.AsObject;
  static toObject(includeInstance: boolean, msg: AccountGetNotifySettings): AccountGetNotifySettings.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountGetNotifySettings, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountGetNotifySettings;
  static deserializeBinaryFromReader(message: AccountGetNotifySettings, reader: jspb.BinaryReader): AccountGetNotifySettings;
}

export namespace AccountGetNotifySettings {
  export type AsObject = {
    peer: core_types_pb.InputPeer.AsObject,
    team?: core_types_pb.InputTeam.AsObject,
  }
}

export class AccountRegisterDevice extends jspb.Message {
  hasToken(): boolean;
  clearToken(): void;
  getToken(): string | undefined;
  setToken(value: string): void;

  hasDevicemodel(): boolean;
  clearDevicemodel(): void;
  getDevicemodel(): string | undefined;
  setDevicemodel(value: string): void;

  hasSystemversion(): boolean;
  clearSystemversion(): void;
  getSystemversion(): string | undefined;
  setSystemversion(value: string): void;

  hasAppversion(): boolean;
  clearAppversion(): void;
  getAppversion(): string | undefined;
  setAppversion(value: string): void;

  hasLangcode(): boolean;
  clearLangcode(): void;
  getLangcode(): string | undefined;
  setLangcode(value: string): void;

  hasTokentype(): boolean;
  clearTokentype(): void;
  getTokentype(): core_types_pb.PushTokenProvider | undefined;
  setTokentype(value: core_types_pb.PushTokenProvider): void;

  hasClientid(): boolean;
  clearClientid(): void;
  getClientid(): string | undefined;
  setClientid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountRegisterDevice.AsObject;
  static toObject(includeInstance: boolean, msg: AccountRegisterDevice): AccountRegisterDevice.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountRegisterDevice, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountRegisterDevice;
  static deserializeBinaryFromReader(message: AccountRegisterDevice, reader: jspb.BinaryReader): AccountRegisterDevice;
}

export namespace AccountRegisterDevice {
  export type AsObject = {
    token?: string,
    devicemodel?: string,
    systemversion?: string,
    appversion?: string,
    langcode?: string,
    tokentype?: core_types_pb.PushTokenProvider,
    clientid?: string,
  }
}

export class AccountUnregisterDevice extends jspb.Message {
  hasTokentype(): boolean;
  clearTokentype(): void;
  getTokentype(): number | undefined;
  setTokentype(value: number): void;

  hasToken(): boolean;
  clearToken(): void;
  getToken(): string | undefined;
  setToken(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountUnregisterDevice.AsObject;
  static toObject(includeInstance: boolean, msg: AccountUnregisterDevice): AccountUnregisterDevice.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountUnregisterDevice, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountUnregisterDevice;
  static deserializeBinaryFromReader(message: AccountUnregisterDevice, reader: jspb.BinaryReader): AccountUnregisterDevice;
}

export namespace AccountUnregisterDevice {
  export type AsObject = {
    tokentype?: number,
    token?: string,
  }
}

export class AccountUpdateProfile extends jspb.Message {
  hasFirstname(): boolean;
  clearFirstname(): void;
  getFirstname(): string | undefined;
  setFirstname(value: string): void;

  hasLastname(): boolean;
  clearLastname(): void;
  getLastname(): string | undefined;
  setLastname(value: string): void;

  hasBio(): boolean;
  clearBio(): void;
  getBio(): string | undefined;
  setBio(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountUpdateProfile.AsObject;
  static toObject(includeInstance: boolean, msg: AccountUpdateProfile): AccountUpdateProfile.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountUpdateProfile, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountUpdateProfile;
  static deserializeBinaryFromReader(message: AccountUpdateProfile, reader: jspb.BinaryReader): AccountUpdateProfile;
}

export namespace AccountUpdateProfile {
  export type AsObject = {
    firstname?: string,
    lastname?: string,
    bio?: string,
  }
}

export class AccountCheckUsername extends jspb.Message {
  hasUsername(): boolean;
  clearUsername(): void;
  getUsername(): string | undefined;
  setUsername(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountCheckUsername.AsObject;
  static toObject(includeInstance: boolean, msg: AccountCheckUsername): AccountCheckUsername.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountCheckUsername, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountCheckUsername;
  static deserializeBinaryFromReader(message: AccountCheckUsername, reader: jspb.BinaryReader): AccountCheckUsername;
}

export namespace AccountCheckUsername {
  export type AsObject = {
    username?: string,
  }
}

export class AccountUpdateUsername extends jspb.Message {
  hasUsername(): boolean;
  clearUsername(): void;
  getUsername(): string | undefined;
  setUsername(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountUpdateUsername.AsObject;
  static toObject(includeInstance: boolean, msg: AccountUpdateUsername): AccountUpdateUsername.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountUpdateUsername, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountUpdateUsername;
  static deserializeBinaryFromReader(message: AccountUpdateUsername, reader: jspb.BinaryReader): AccountUpdateUsername;
}

export namespace AccountUpdateUsername {
  export type AsObject = {
    username?: string,
  }
}

export class AccountUploadPhoto extends jspb.Message {
  hasFile(): boolean;
  clearFile(): void;
  getFile(): core_types_pb.InputFile;
  setFile(value?: core_types_pb.InputFile): void;

  hasReturnobject(): boolean;
  clearReturnobject(): void;
  getReturnobject(): boolean | undefined;
  setReturnobject(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountUploadPhoto.AsObject;
  static toObject(includeInstance: boolean, msg: AccountUploadPhoto): AccountUploadPhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountUploadPhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountUploadPhoto;
  static deserializeBinaryFromReader(message: AccountUploadPhoto, reader: jspb.BinaryReader): AccountUploadPhoto;
}

export namespace AccountUploadPhoto {
  export type AsObject = {
    file: core_types_pb.InputFile.AsObject,
    returnobject?: boolean,
  }
}

export class AccountUpdatePhoto extends jspb.Message {
  hasPhotoid(): boolean;
  clearPhotoid(): void;
  getPhotoid(): string | undefined;
  setPhotoid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountUpdatePhoto.AsObject;
  static toObject(includeInstance: boolean, msg: AccountUpdatePhoto): AccountUpdatePhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountUpdatePhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountUpdatePhoto;
  static deserializeBinaryFromReader(message: AccountUpdatePhoto, reader: jspb.BinaryReader): AccountUpdatePhoto;
}

export namespace AccountUpdatePhoto {
  export type AsObject = {
    photoid?: string,
  }
}

export class AccountRemovePhoto extends jspb.Message {
  hasPhotoid(): boolean;
  clearPhotoid(): void;
  getPhotoid(): string | undefined;
  setPhotoid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountRemovePhoto.AsObject;
  static toObject(includeInstance: boolean, msg: AccountRemovePhoto): AccountRemovePhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountRemovePhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountRemovePhoto;
  static deserializeBinaryFromReader(message: AccountRemovePhoto, reader: jspb.BinaryReader): AccountRemovePhoto;
}

export namespace AccountRemovePhoto {
  export type AsObject = {
    photoid?: string,
  }
}

export class AccountSendChangePhoneCode extends jspb.Message {
  hasPhone(): boolean;
  clearPhone(): void;
  getPhone(): string | undefined;
  setPhone(value: string): void;

  hasApphash(): boolean;
  clearApphash(): void;
  getApphash(): string | undefined;
  setApphash(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountSendChangePhoneCode.AsObject;
  static toObject(includeInstance: boolean, msg: AccountSendChangePhoneCode): AccountSendChangePhoneCode.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountSendChangePhoneCode, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountSendChangePhoneCode;
  static deserializeBinaryFromReader(message: AccountSendChangePhoneCode, reader: jspb.BinaryReader): AccountSendChangePhoneCode;
}

export namespace AccountSendChangePhoneCode {
  export type AsObject = {
    phone?: string,
    apphash?: string,
  }
}

export class AccountResendChangePhoneCode extends jspb.Message {
  hasPhone(): boolean;
  clearPhone(): void;
  getPhone(): string | undefined;
  setPhone(value: string): void;

  hasPhonecodehash(): boolean;
  clearPhonecodehash(): void;
  getPhonecodehash(): string | undefined;
  setPhonecodehash(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountResendChangePhoneCode.AsObject;
  static toObject(includeInstance: boolean, msg: AccountResendChangePhoneCode): AccountResendChangePhoneCode.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountResendChangePhoneCode, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountResendChangePhoneCode;
  static deserializeBinaryFromReader(message: AccountResendChangePhoneCode, reader: jspb.BinaryReader): AccountResendChangePhoneCode;
}

export namespace AccountResendChangePhoneCode {
  export type AsObject = {
    phone?: string,
    phonecodehash?: string,
  }
}

export class AccountChangePhone extends jspb.Message {
  hasPhone(): boolean;
  clearPhone(): void;
  getPhone(): string | undefined;
  setPhone(value: string): void;

  hasPhonecodehash(): boolean;
  clearPhonecodehash(): void;
  getPhonecodehash(): string | undefined;
  setPhonecodehash(value: string): void;

  hasPhonecode(): boolean;
  clearPhonecode(): void;
  getPhonecode(): string | undefined;
  setPhonecode(value: string): void;

  hasPassword(): boolean;
  clearPassword(): void;
  getPassword(): core_types_pb.InputPassword | undefined;
  setPassword(value?: core_types_pb.InputPassword): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountChangePhone.AsObject;
  static toObject(includeInstance: boolean, msg: AccountChangePhone): AccountChangePhone.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountChangePhone, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountChangePhone;
  static deserializeBinaryFromReader(message: AccountChangePhone, reader: jspb.BinaryReader): AccountChangePhone;
}

export namespace AccountChangePhone {
  export type AsObject = {
    phone?: string,
    phonecodehash?: string,
    phonecode?: string,
    password?: core_types_pb.InputPassword.AsObject,
  }
}

export class AccountSetPrivacy extends jspb.Message {
  clearChatinviteList(): void;
  getChatinviteList(): Array<core_types_pb.PrivacyRule>;
  setChatinviteList(value: Array<core_types_pb.PrivacyRule>): void;
  addChatinvite(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  clearLastseenList(): void;
  getLastseenList(): Array<core_types_pb.PrivacyRule>;
  setLastseenList(value: Array<core_types_pb.PrivacyRule>): void;
  addLastseen(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  clearPhonenumberList(): void;
  getPhonenumberList(): Array<core_types_pb.PrivacyRule>;
  setPhonenumberList(value: Array<core_types_pb.PrivacyRule>): void;
  addPhonenumber(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  clearProfilephotoList(): void;
  getProfilephotoList(): Array<core_types_pb.PrivacyRule>;
  setProfilephotoList(value: Array<core_types_pb.PrivacyRule>): void;
  addProfilephoto(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  clearForwardedmessageList(): void;
  getForwardedmessageList(): Array<core_types_pb.PrivacyRule>;
  setForwardedmessageList(value: Array<core_types_pb.PrivacyRule>): void;
  addForwardedmessage(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  clearCallList(): void;
  getCallList(): Array<core_types_pb.PrivacyRule>;
  setCallList(value: Array<core_types_pb.PrivacyRule>): void;
  addCall(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountSetPrivacy.AsObject;
  static toObject(includeInstance: boolean, msg: AccountSetPrivacy): AccountSetPrivacy.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountSetPrivacy, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountSetPrivacy;
  static deserializeBinaryFromReader(message: AccountSetPrivacy, reader: jspb.BinaryReader): AccountSetPrivacy;
}

export namespace AccountSetPrivacy {
  export type AsObject = {
    chatinviteList: Array<core_types_pb.PrivacyRule.AsObject>,
    lastseenList: Array<core_types_pb.PrivacyRule.AsObject>,
    phonenumberList: Array<core_types_pb.PrivacyRule.AsObject>,
    profilephotoList: Array<core_types_pb.PrivacyRule.AsObject>,
    forwardedmessageList: Array<core_types_pb.PrivacyRule.AsObject>,
    callList: Array<core_types_pb.PrivacyRule.AsObject>,
  }
}

export class AccountGetPrivacy extends jspb.Message {
  hasKey(): boolean;
  clearKey(): void;
  getKey(): core_types_pb.PrivacyKey | undefined;
  setKey(value: core_types_pb.PrivacyKey): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountGetPrivacy.AsObject;
  static toObject(includeInstance: boolean, msg: AccountGetPrivacy): AccountGetPrivacy.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountGetPrivacy, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountGetPrivacy;
  static deserializeBinaryFromReader(message: AccountGetPrivacy, reader: jspb.BinaryReader): AccountGetPrivacy;
}

export namespace AccountGetPrivacy {
  export type AsObject = {
    key?: core_types_pb.PrivacyKey,
  }
}

export class AccountGetAuthorizations extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountGetAuthorizations.AsObject;
  static toObject(includeInstance: boolean, msg: AccountGetAuthorizations): AccountGetAuthorizations.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountGetAuthorizations, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountGetAuthorizations;
  static deserializeBinaryFromReader(message: AccountGetAuthorizations, reader: jspb.BinaryReader): AccountGetAuthorizations;
}

export namespace AccountGetAuthorizations {
  export type AsObject = {
  }
}

export class AccountResetAuthorization extends jspb.Message {
  hasAuthid(): boolean;
  clearAuthid(): void;
  getAuthid(): string | undefined;
  setAuthid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountResetAuthorization.AsObject;
  static toObject(includeInstance: boolean, msg: AccountResetAuthorization): AccountResetAuthorization.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountResetAuthorization, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountResetAuthorization;
  static deserializeBinaryFromReader(message: AccountResetAuthorization, reader: jspb.BinaryReader): AccountResetAuthorization;
}

export namespace AccountResetAuthorization {
  export type AsObject = {
    authid?: string,
  }
}

export class AccountUpdateStatus extends jspb.Message {
  hasOnline(): boolean;
  clearOnline(): void;
  getOnline(): boolean | undefined;
  setOnline(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountUpdateStatus.AsObject;
  static toObject(includeInstance: boolean, msg: AccountUpdateStatus): AccountUpdateStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountUpdateStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountUpdateStatus;
  static deserializeBinaryFromReader(message: AccountUpdateStatus, reader: jspb.BinaryReader): AccountUpdateStatus;
}

export namespace AccountUpdateStatus {
  export type AsObject = {
    online?: boolean,
  }
}

export class AccountSetLang extends jspb.Message {
  hasLangcode(): boolean;
  clearLangcode(): void;
  getLangcode(): string | undefined;
  setLangcode(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountSetLang.AsObject;
  static toObject(includeInstance: boolean, msg: AccountSetLang): AccountSetLang.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountSetLang, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountSetLang;
  static deserializeBinaryFromReader(message: AccountSetLang, reader: jspb.BinaryReader): AccountSetLang;
}

export namespace AccountSetLang {
  export type AsObject = {
    langcode?: string,
  }
}

export class AccountGetPassword extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountGetPassword.AsObject;
  static toObject(includeInstance: boolean, msg: AccountGetPassword): AccountGetPassword.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountGetPassword, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountGetPassword;
  static deserializeBinaryFromReader(message: AccountGetPassword, reader: jspb.BinaryReader): AccountGetPassword;
}

export namespace AccountGetPassword {
  export type AsObject = {
  }
}

export class AccountGetPasswordSettings extends jspb.Message {
  hasPassword(): boolean;
  clearPassword(): void;
  getPassword(): core_types_pb.InputPassword | undefined;
  setPassword(value?: core_types_pb.InputPassword): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountGetPasswordSettings.AsObject;
  static toObject(includeInstance: boolean, msg: AccountGetPasswordSettings): AccountGetPasswordSettings.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountGetPasswordSettings, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountGetPasswordSettings;
  static deserializeBinaryFromReader(message: AccountGetPasswordSettings, reader: jspb.BinaryReader): AccountGetPasswordSettings;
}

export namespace AccountGetPasswordSettings {
  export type AsObject = {
    password?: core_types_pb.InputPassword.AsObject,
  }
}

export class AccountUpdatePasswordSettings extends jspb.Message {
  hasPassword(): boolean;
  clearPassword(): void;
  getPassword(): core_types_pb.InputPassword | undefined;
  setPassword(value?: core_types_pb.InputPassword): void;

  hasPasswordhash(): boolean;
  clearPasswordhash(): void;
  getPasswordhash(): Uint8Array | string;
  getPasswordhash_asU8(): Uint8Array;
  getPasswordhash_asB64(): string;
  setPasswordhash(value: Uint8Array | string): void;

  hasAlgorithm(): boolean;
  clearAlgorithm(): void;
  getAlgorithm(): number | undefined;
  setAlgorithm(value: number): void;

  hasAlgorithmdata(): boolean;
  clearAlgorithmdata(): void;
  getAlgorithmdata(): Uint8Array | string;
  getAlgorithmdata_asU8(): Uint8Array;
  getAlgorithmdata_asB64(): string;
  setAlgorithmdata(value: Uint8Array | string): void;

  hasHint(): boolean;
  clearHint(): void;
  getHint(): string | undefined;
  setHint(value: string): void;

  clearQuestionsList(): void;
  getQuestionsList(): Array<SecurityQuestion>;
  setQuestionsList(value: Array<SecurityQuestion>): void;
  addQuestions(value?: SecurityQuestion, index?: number): SecurityQuestion;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountUpdatePasswordSettings.AsObject;
  static toObject(includeInstance: boolean, msg: AccountUpdatePasswordSettings): AccountUpdatePasswordSettings.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountUpdatePasswordSettings, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountUpdatePasswordSettings;
  static deserializeBinaryFromReader(message: AccountUpdatePasswordSettings, reader: jspb.BinaryReader): AccountUpdatePasswordSettings;
}

export namespace AccountUpdatePasswordSettings {
  export type AsObject = {
    password?: core_types_pb.InputPassword.AsObject,
    passwordhash: Uint8Array | string,
    algorithm?: number,
    algorithmdata: Uint8Array | string,
    hint?: string,
    questionsList: Array<SecurityQuestion.AsObject>,
  }
}

export class AccountRecoverPassword extends jspb.Message {
  clearAnswersList(): void;
  getAnswersList(): Array<SecurityAnswer>;
  setAnswersList(value: Array<SecurityAnswer>): void;
  addAnswers(value?: SecurityAnswer, index?: number): SecurityAnswer;

  hasAlgorithm(): boolean;
  clearAlgorithm(): void;
  getAlgorithm(): number | undefined;
  setAlgorithm(value: number): void;

  hasAlgorithmdata(): boolean;
  clearAlgorithmdata(): void;
  getAlgorithmdata(): Uint8Array | string;
  getAlgorithmdata_asU8(): Uint8Array;
  getAlgorithmdata_asB64(): string;
  setAlgorithmdata(value: Uint8Array | string): void;

  hasSrpid(): boolean;
  clearSrpid(): void;
  getSrpid(): string | undefined;
  setSrpid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountRecoverPassword.AsObject;
  static toObject(includeInstance: boolean, msg: AccountRecoverPassword): AccountRecoverPassword.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountRecoverPassword, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountRecoverPassword;
  static deserializeBinaryFromReader(message: AccountRecoverPassword, reader: jspb.BinaryReader): AccountRecoverPassword;
}

export namespace AccountRecoverPassword {
  export type AsObject = {
    answersList: Array<SecurityAnswer.AsObject>,
    algorithm?: number,
    algorithmdata: Uint8Array | string,
    srpid?: string,
  }
}

export class AccountPasswordSettings extends jspb.Message {
  hasHint(): boolean;
  clearHint(): void;
  getHint(): string | undefined;
  setHint(value: string): void;

  clearQuestionsList(): void;
  getQuestionsList(): Array<RecoveryQuestion>;
  setQuestionsList(value: Array<RecoveryQuestion>): void;
  addQuestions(value?: RecoveryQuestion, index?: number): RecoveryQuestion;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountPasswordSettings.AsObject;
  static toObject(includeInstance: boolean, msg: AccountPasswordSettings): AccountPasswordSettings.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountPasswordSettings, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountPasswordSettings;
  static deserializeBinaryFromReader(message: AccountPasswordSettings, reader: jspb.BinaryReader): AccountPasswordSettings;
}

export namespace AccountPasswordSettings {
  export type AsObject = {
    hint?: string,
    questionsList: Array<RecoveryQuestion.AsObject>,
  }
}

export class SecurityQuestions extends jspb.Message {
  clearQuestionsList(): void;
  getQuestionsList(): Array<SecurityQuestion>;
  setQuestionsList(value: Array<SecurityQuestion>): void;
  addQuestions(value?: SecurityQuestion, index?: number): SecurityQuestion;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SecurityQuestions.AsObject;
  static toObject(includeInstance: boolean, msg: SecurityQuestions): SecurityQuestions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SecurityQuestions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SecurityQuestions;
  static deserializeBinaryFromReader(message: SecurityQuestions, reader: jspb.BinaryReader): SecurityQuestions;
}

export namespace SecurityQuestions {
  export type AsObject = {
    questionsList: Array<SecurityQuestion.AsObject>,
  }
}

export class RecoveryQuestion extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): number | undefined;
  setId(value: number): void;

  hasText(): boolean;
  clearText(): void;
  getText(): string | undefined;
  setText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RecoveryQuestion.AsObject;
  static toObject(includeInstance: boolean, msg: RecoveryQuestion): RecoveryQuestion.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RecoveryQuestion, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RecoveryQuestion;
  static deserializeBinaryFromReader(message: RecoveryQuestion, reader: jspb.BinaryReader): RecoveryQuestion;
}

export namespace RecoveryQuestion {
  export type AsObject = {
    id?: number,
    text?: string,
  }
}

export class SecurityQuestion extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): number | undefined;
  setId(value: number): void;

  hasText(): boolean;
  clearText(): void;
  getText(): string | undefined;
  setText(value: string): void;

  hasAnswer(): boolean;
  clearAnswer(): void;
  getAnswer(): string | undefined;
  setAnswer(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SecurityQuestion.AsObject;
  static toObject(includeInstance: boolean, msg: SecurityQuestion): SecurityQuestion.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SecurityQuestion, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SecurityQuestion;
  static deserializeBinaryFromReader(message: SecurityQuestion, reader: jspb.BinaryReader): SecurityQuestion;
}

export namespace SecurityQuestion {
  export type AsObject = {
    id?: number,
    text?: string,
    answer?: string,
  }
}

export class SecurityAnswer extends jspb.Message {
  hasQuestionid(): boolean;
  clearQuestionid(): void;
  getQuestionid(): number | undefined;
  setQuestionid(value: number): void;

  hasAnswer(): boolean;
  clearAnswer(): void;
  getAnswer(): string | undefined;
  setAnswer(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SecurityAnswer.AsObject;
  static toObject(includeInstance: boolean, msg: SecurityAnswer): SecurityAnswer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SecurityAnswer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SecurityAnswer;
  static deserializeBinaryFromReader(message: SecurityAnswer, reader: jspb.BinaryReader): SecurityAnswer;
}

export namespace SecurityAnswer {
  export type AsObject = {
    questionid?: number,
    answer?: string,
  }
}

export class AccountPassword extends jspb.Message {
  hasHaspassword(): boolean;
  clearHaspassword(): void;
  getHaspassword(): boolean | undefined;
  setHaspassword(value: boolean): void;

  hasHint(): boolean;
  clearHint(): void;
  getHint(): string | undefined;
  setHint(value: string): void;

  hasAlgorithm(): boolean;
  clearAlgorithm(): void;
  getAlgorithm(): number | undefined;
  setAlgorithm(value: number): void;

  hasAlgorithmdata(): boolean;
  clearAlgorithmdata(): void;
  getAlgorithmdata(): Uint8Array | string;
  getAlgorithmdata_asU8(): Uint8Array;
  getAlgorithmdata_asB64(): string;
  setAlgorithmdata(value: Uint8Array | string): void;

  hasSrpb(): boolean;
  clearSrpb(): void;
  getSrpb(): Uint8Array | string;
  getSrpb_asU8(): Uint8Array;
  getSrpb_asB64(): string;
  setSrpb(value: Uint8Array | string): void;

  hasRandomdata(): boolean;
  clearRandomdata(): void;
  getRandomdata(): Uint8Array | string;
  getRandomdata_asU8(): Uint8Array;
  getRandomdata_asB64(): string;
  setRandomdata(value: Uint8Array | string): void;

  hasSrpid(): boolean;
  clearSrpid(): void;
  getSrpid(): string | undefined;
  setSrpid(value: string): void;

  clearQuestionsList(): void;
  getQuestionsList(): Array<RecoveryQuestion>;
  setQuestionsList(value: Array<RecoveryQuestion>): void;
  addQuestions(value?: RecoveryQuestion, index?: number): RecoveryQuestion;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountPassword.AsObject;
  static toObject(includeInstance: boolean, msg: AccountPassword): AccountPassword.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountPassword, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountPassword;
  static deserializeBinaryFromReader(message: AccountPassword, reader: jspb.BinaryReader): AccountPassword;
}

export namespace AccountPassword {
  export type AsObject = {
    haspassword?: boolean,
    hint?: string,
    algorithm?: number,
    algorithmdata: Uint8Array | string,
    srpb: Uint8Array | string,
    randomdata: Uint8Array | string,
    srpid?: string,
    questionsList: Array<RecoveryQuestion.AsObject>,
  }
}

export class AccountAuthorizations extends jspb.Message {
  clearAuthorizationsList(): void;
  getAuthorizationsList(): Array<AccountAuthorization>;
  setAuthorizationsList(value: Array<AccountAuthorization>): void;
  addAuthorizations(value?: AccountAuthorization, index?: number): AccountAuthorization;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountAuthorizations.AsObject;
  static toObject(includeInstance: boolean, msg: AccountAuthorizations): AccountAuthorizations.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountAuthorizations, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountAuthorizations;
  static deserializeBinaryFromReader(message: AccountAuthorizations, reader: jspb.BinaryReader): AccountAuthorizations;
}

export namespace AccountAuthorizations {
  export type AsObject = {
    authorizationsList: Array<AccountAuthorization.AsObject>,
  }
}

export class AccountAuthorization extends jspb.Message {
  hasAuthid(): boolean;
  clearAuthid(): void;
  getAuthid(): string | undefined;
  setAuthid(value: string): void;

  hasModel(): boolean;
  clearModel(): void;
  getModel(): string | undefined;
  setModel(value: string): void;

  hasAppversion(): boolean;
  clearAppversion(): void;
  getAppversion(): string | undefined;
  setAppversion(value: string): void;

  hasSystemversion(): boolean;
  clearSystemversion(): void;
  getSystemversion(): string | undefined;
  setSystemversion(value: string): void;

  hasLangcode(): boolean;
  clearLangcode(): void;
  getLangcode(): string | undefined;
  setLangcode(value: string): void;

  hasCreatedat(): boolean;
  clearCreatedat(): void;
  getCreatedat(): number | undefined;
  setCreatedat(value: number): void;

  hasActiveat(): boolean;
  clearActiveat(): void;
  getActiveat(): number | undefined;
  setActiveat(value: number): void;

  hasClientip(): boolean;
  clearClientip(): void;
  getClientip(): string | undefined;
  setClientip(value: string): void;

  hasLastaccess(): boolean;
  clearLastaccess(): void;
  getLastaccess(): number | undefined;
  setLastaccess(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountAuthorization.AsObject;
  static toObject(includeInstance: boolean, msg: AccountAuthorization): AccountAuthorization.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountAuthorization, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountAuthorization;
  static deserializeBinaryFromReader(message: AccountAuthorization, reader: jspb.BinaryReader): AccountAuthorization;
}

export namespace AccountAuthorization {
  export type AsObject = {
    authid?: string,
    model?: string,
    appversion?: string,
    systemversion?: string,
    langcode?: string,
    createdat?: number,
    activeat?: number,
    clientip?: string,
    lastaccess?: number,
  }
}

export class AccountPrivacyRules extends jspb.Message {
  clearRulesList(): void;
  getRulesList(): Array<core_types_pb.PrivacyRule>;
  setRulesList(value: Array<core_types_pb.PrivacyRule>): void;
  addRules(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountPrivacyRules.AsObject;
  static toObject(includeInstance: boolean, msg: AccountPrivacyRules): AccountPrivacyRules.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountPrivacyRules, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountPrivacyRules;
  static deserializeBinaryFromReader(message: AccountPrivacyRules, reader: jspb.BinaryReader): AccountPrivacyRules;
}

export namespace AccountPrivacyRules {
  export type AsObject = {
    rulesList: Array<core_types_pb.PrivacyRule.AsObject>,
  }
}

