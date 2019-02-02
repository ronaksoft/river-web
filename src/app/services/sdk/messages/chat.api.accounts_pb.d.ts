// package: msg
// file: chat.api.accounts.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";

export class AccountSetNotifySettings extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): chat_core_types_pb.PeerNotifySettings;
  setSettings(value?: chat_core_types_pb.PeerNotifySettings): void;

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
    peer: chat_core_types_pb.InputPeer.AsObject,
    settings: chat_core_types_pb.PeerNotifySettings.AsObject,
  }
}

export class AccountGetNotifySettings extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

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
    peer: chat_core_types_pb.InputPeer.AsObject,
  }
}

export class AccountRegisterDevice extends jspb.Message {
  hasTokentype(): boolean;
  clearTokentype(): void;
  getTokentype(): number | undefined;
  setTokentype(value: number): void;

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
    tokentype?: number,
    token?: string,
    devicemodel?: string,
    systemversion?: string,
    appversion?: string,
    langcode?: string,
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
  getFile(): chat_core_types_pb.InputFile;
  setFile(value?: chat_core_types_pb.InputFile): void;

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
    file: chat_core_types_pb.InputFile.AsObject,
  }
}

export class AccountUpdatePhoto extends jspb.Message {
  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): chat_core_types_pb.InputDocument;
  setPhoto(value?: chat_core_types_pb.InputDocument): void;

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
    photo: chat_core_types_pb.InputDocument.AsObject,
  }
}

export class AccountRemovePhoto extends jspb.Message {
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
  }
}

export class AccountSetPrivacy extends jspb.Message {
  hasKey(): boolean;
  clearKey(): void;
  getKey(): AccountPrivacyKey | undefined;
  setKey(value: AccountPrivacyKey): void;

  clearRulesList(): void;
  getRulesList(): Array<AccountPrivacyRule>;
  setRulesList(value: Array<AccountPrivacyRule>): void;
  addRules(value?: AccountPrivacyRule, index?: number): AccountPrivacyRule;

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
    key?: AccountPrivacyKey,
    rulesList: Array<AccountPrivacyRule.AsObject>,
  }
}

export class AccountGetPrivacy extends jspb.Message {
  hasKey(): boolean;
  clearKey(): void;
  getKey(): AccountPrivacyKey | undefined;
  setKey(value: AccountPrivacyKey): void;

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
    key?: AccountPrivacyKey,
  }
}

export class AccountGetActiveSessions extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountGetActiveSessions.AsObject;
  static toObject(includeInstance: boolean, msg: AccountGetActiveSessions): AccountGetActiveSessions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountGetActiveSessions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountGetActiveSessions;
  static deserializeBinaryFromReader(message: AccountGetActiveSessions, reader: jspb.BinaryReader): AccountGetActiveSessions;
}

export namespace AccountGetActiveSessions {
  export type AsObject = {
  }
}

export class AccountSessions extends jspb.Message {
  clearSessionsList(): void;
  getSessionsList(): Array<chat_core_types_pb.ActiveSession>;
  setSessionsList(value: Array<chat_core_types_pb.ActiveSession>): void;
  addSessions(value?: chat_core_types_pb.ActiveSession, index?: number): chat_core_types_pb.ActiveSession;

  hasActiveauthid(): boolean;
  clearActiveauthid(): void;
  getActiveauthid(): number | undefined;
  setActiveauthid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountSessions.AsObject;
  static toObject(includeInstance: boolean, msg: AccountSessions): AccountSessions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountSessions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountSessions;
  static deserializeBinaryFromReader(message: AccountSessions, reader: jspb.BinaryReader): AccountSessions;
}

export namespace AccountSessions {
  export type AsObject = {
    sessionsList: Array<chat_core_types_pb.ActiveSession.AsObject>,
    activeauthid?: number,
  }
}

export class AccountPrivacyRules extends jspb.Message {
  clearRulesList(): void;
  getRulesList(): Array<AccountPrivacyRule>;
  setRulesList(value: Array<AccountPrivacyRule>): void;
  addRules(value?: AccountPrivacyRule, index?: number): AccountPrivacyRule;

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
    rulesList: Array<AccountPrivacyRule.AsObject>,
  }
}

export class AccountPrivacyRule extends jspb.Message {
  hasPrivacytype(): boolean;
  clearPrivacytype(): void;
  getPrivacytype(): AccountPrivacyType | undefined;
  setPrivacytype(value: AccountPrivacyType): void;

  hasData(): boolean;
  clearData(): void;
  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountPrivacyRule.AsObject;
  static toObject(includeInstance: boolean, msg: AccountPrivacyRule): AccountPrivacyRule.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountPrivacyRule, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountPrivacyRule;
  static deserializeBinaryFromReader(message: AccountPrivacyRule, reader: jspb.BinaryReader): AccountPrivacyRule;
}

export namespace AccountPrivacyRule {
  export type AsObject = {
    privacytype?: AccountPrivacyType,
    data: Uint8Array | string,
  }
}

export enum AccountPrivacyKey {
  ACCOUNTPRIVACYKEYNONE = 0,
  ACCOUNTPRIVACYKEYCHATINVITE = 1,
  ACCOUNTPRIVACYKEYSTATUSTIMESTAMP = 2,
  ACCOUNTPRIVACYKEYPHONECALL = 3,
}

export enum AccountPrivacyType {
  ACCOUNTPRIVACYTYPEALLOWALL = 0,
  ACCOUNTPRIVACYTYPEALLOWCONTACTS = 1,
  ACCOUNTPRIVACYTYPEALLOWUSERS = 2,
  ACCOUNTPRIVACYTYPEDISALLOWALL = 3,
  ACCOUNTPRIVACYTYPEDISALLOWCONTACTS = 4,
  ACCOUNTPRIVACYTYPEDISALLOWUSERS = 5,
}

