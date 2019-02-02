// package: msg
// file: chat.core.account.privacies.proto

import * as jspb from "google-protobuf";

export class AccountPrivacyAllowAll extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountPrivacyAllowAll.AsObject;
  static toObject(includeInstance: boolean, msg: AccountPrivacyAllowAll): AccountPrivacyAllowAll.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountPrivacyAllowAll, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountPrivacyAllowAll;
  static deserializeBinaryFromReader(message: AccountPrivacyAllowAll, reader: jspb.BinaryReader): AccountPrivacyAllowAll;
}

export namespace AccountPrivacyAllowAll {
  export type AsObject = {
  }
}

export class AccountPrivacyAllowContacts extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountPrivacyAllowContacts.AsObject;
  static toObject(includeInstance: boolean, msg: AccountPrivacyAllowContacts): AccountPrivacyAllowContacts.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountPrivacyAllowContacts, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountPrivacyAllowContacts;
  static deserializeBinaryFromReader(message: AccountPrivacyAllowContacts, reader: jspb.BinaryReader): AccountPrivacyAllowContacts;
}

export namespace AccountPrivacyAllowContacts {
  export type AsObject = {
  }
}

export class AccountPrivacyAllowUsers extends jspb.Message {
  clearUseridsList(): void;
  getUseridsList(): Array<string>;
  setUseridsList(value: Array<string>): void;
  addUserids(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountPrivacyAllowUsers.AsObject;
  static toObject(includeInstance: boolean, msg: AccountPrivacyAllowUsers): AccountPrivacyAllowUsers.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountPrivacyAllowUsers, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountPrivacyAllowUsers;
  static deserializeBinaryFromReader(message: AccountPrivacyAllowUsers, reader: jspb.BinaryReader): AccountPrivacyAllowUsers;
}

export namespace AccountPrivacyAllowUsers {
  export type AsObject = {
    useridsList: Array<string>,
  }
}

export class AccountPrivacyDisallowAll extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountPrivacyDisallowAll.AsObject;
  static toObject(includeInstance: boolean, msg: AccountPrivacyDisallowAll): AccountPrivacyDisallowAll.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountPrivacyDisallowAll, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountPrivacyDisallowAll;
  static deserializeBinaryFromReader(message: AccountPrivacyDisallowAll, reader: jspb.BinaryReader): AccountPrivacyDisallowAll;
}

export namespace AccountPrivacyDisallowAll {
  export type AsObject = {
  }
}

export class AccountPrivacyDisallowContacts extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountPrivacyDisallowContacts.AsObject;
  static toObject(includeInstance: boolean, msg: AccountPrivacyDisallowContacts): AccountPrivacyDisallowContacts.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountPrivacyDisallowContacts, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountPrivacyDisallowContacts;
  static deserializeBinaryFromReader(message: AccountPrivacyDisallowContacts, reader: jspb.BinaryReader): AccountPrivacyDisallowContacts;
}

export namespace AccountPrivacyDisallowContacts {
  export type AsObject = {
  }
}

export class AccountPrivacyDisallowUsers extends jspb.Message {
  clearUseridsList(): void;
  getUseridsList(): Array<string>;
  setUseridsList(value: Array<string>): void;
  addUserids(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountPrivacyDisallowUsers.AsObject;
  static toObject(includeInstance: boolean, msg: AccountPrivacyDisallowUsers): AccountPrivacyDisallowUsers.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountPrivacyDisallowUsers, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountPrivacyDisallowUsers;
  static deserializeBinaryFromReader(message: AccountPrivacyDisallowUsers, reader: jspb.BinaryReader): AccountPrivacyDisallowUsers;
}

export namespace AccountPrivacyDisallowUsers {
  export type AsObject = {
    useridsList: Array<string>,
  }
}

