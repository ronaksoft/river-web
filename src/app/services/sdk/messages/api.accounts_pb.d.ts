// package: msg
// file: api.accounts.proto

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
  }
}

export class AccountGetNotifySettings extends jspb.Message {
  clearPeerList(): void;
  getPeerList(): Array<core_types_pb.InputPeer>;
  setPeerList(value: Array<core_types_pb.InputPeer>): void;
  addPeer(value?: core_types_pb.InputPeer, index?: number): core_types_pb.InputPeer;

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
    peerList: Array<core_types_pb.InputPeer.AsObject>,
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

