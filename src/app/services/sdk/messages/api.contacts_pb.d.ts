// package: msg
// file: api.contacts.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class ContactsImport extends jspb.Message {
  clearContactsList(): void;
  getContactsList(): Array<core_types_pb.PhoneContact>;
  setContactsList(value: Array<core_types_pb.PhoneContact>): void;
  addContacts(value?: core_types_pb.PhoneContact, index?: number): core_types_pb.PhoneContact;

  hasReplace(): boolean;
  clearReplace(): void;
  getReplace(): boolean | undefined;
  setReplace(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsImport.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsImport): ContactsImport.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsImport, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsImport;
  static deserializeBinaryFromReader(message: ContactsImport, reader: jspb.BinaryReader): ContactsImport;
}

export namespace ContactsImport {
  export type AsObject = {
    contactsList: Array<core_types_pb.PhoneContact.AsObject>,
    replace?: boolean,
  }
}

export class ContactsGet extends jspb.Message {
  hasMd5hash(): boolean;
  clearMd5hash(): void;
  getMd5hash(): string | undefined;
  setMd5hash(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsGet.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsGet): ContactsGet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsGet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsGet;
  static deserializeBinaryFromReader(message: ContactsGet, reader: jspb.BinaryReader): ContactsGet;
}

export namespace ContactsGet {
  export type AsObject = {
    md5hash?: string,
  }
}

export class ContactsDelete extends jspb.Message {
  clearUseridsList(): void;
  getUseridsList(): Array<string>;
  setUseridsList(value: Array<string>): void;
  addUserids(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsDelete.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsDelete): ContactsDelete.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsDelete, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsDelete;
  static deserializeBinaryFromReader(message: ContactsDelete, reader: jspb.BinaryReader): ContactsDelete;
}

export namespace ContactsDelete {
  export type AsObject = {
    useridsList: Array<string>,
  }
}

export class ContactsImported extends jspb.Message {
  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.ContactUser>;
  setUsersList(value: Array<core_types_pb.ContactUser>): void;
  addUsers(value?: core_types_pb.ContactUser, index?: number): core_types_pb.ContactUser;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsImported.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsImported): ContactsImported.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsImported, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsImported;
  static deserializeBinaryFromReader(message: ContactsImported, reader: jspb.BinaryReader): ContactsImported;
}

export namespace ContactsImported {
  export type AsObject = {
    usersList: Array<core_types_pb.ContactUser.AsObject>,
  }
}

export class ContactsMany extends jspb.Message {
  clearContactsList(): void;
  getContactsList(): Array<core_types_pb.PhoneContact>;
  setContactsList(value: Array<core_types_pb.PhoneContact>): void;
  addContacts(value?: core_types_pb.PhoneContact, index?: number): core_types_pb.PhoneContact;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.ContactUser>;
  setUsersList(value: Array<core_types_pb.ContactUser>): void;
  addUsers(value?: core_types_pb.ContactUser, index?: number): core_types_pb.ContactUser;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsMany.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsMany): ContactsMany.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsMany, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsMany;
  static deserializeBinaryFromReader(message: ContactsMany, reader: jspb.BinaryReader): ContactsMany;
}

export namespace ContactsMany {
  export type AsObject = {
    contactsList: Array<core_types_pb.PhoneContact.AsObject>,
    usersList: Array<core_types_pb.ContactUser.AsObject>,
  }
}

