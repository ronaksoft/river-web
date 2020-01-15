/* tslint:disable */
// package: msg
// file: chat.api.contacts.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";

export class ContactsImport extends jspb.Message {
  clearContactsList(): void;
  getContactsList(): Array<chat_core_types_pb.PhoneContact>;
  setContactsList(value: Array<chat_core_types_pb.PhoneContact>): void;
  addContacts(value?: chat_core_types_pb.PhoneContact, index?: number): chat_core_types_pb.PhoneContact;

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
    contactsList: Array<chat_core_types_pb.PhoneContact.AsObject>,
    replace?: boolean,
  }
}

export class ContactsAdd extends jspb.Message {
  hasUser(): boolean;
  clearUser(): void;
  getUser(): chat_core_types_pb.InputUser;
  setUser(value?: chat_core_types_pb.InputUser): void;

  hasFirstname(): boolean;
  clearFirstname(): void;
  getFirstname(): string | undefined;
  setFirstname(value: string): void;

  hasLastname(): boolean;
  clearLastname(): void;
  getLastname(): string | undefined;
  setLastname(value: string): void;

  hasPhone(): boolean;
  clearPhone(): void;
  getPhone(): string | undefined;
  setPhone(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsAdd.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsAdd): ContactsAdd.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsAdd, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsAdd;
  static deserializeBinaryFromReader(message: ContactsAdd, reader: jspb.BinaryReader): ContactsAdd;
}

export namespace ContactsAdd {
  export type AsObject = {
    user: chat_core_types_pb.InputUser.AsObject,
    firstname?: string,
    lastname?: string,
    phone?: string,
  }
}

export class ContactsGet extends jspb.Message {
  hasCrc32hash(): boolean;
  clearCrc32hash(): void;
  getCrc32hash(): number | undefined;
  setCrc32hash(value: number): void;

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
    crc32hash?: number,
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

export class ContactsBlock extends jspb.Message {
  hasUser(): boolean;
  clearUser(): void;
  getUser(): chat_core_types_pb.InputUser;
  setUser(value?: chat_core_types_pb.InputUser): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsBlock.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsBlock): ContactsBlock.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsBlock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsBlock;
  static deserializeBinaryFromReader(message: ContactsBlock, reader: jspb.BinaryReader): ContactsBlock;
}

export namespace ContactsBlock {
  export type AsObject = {
    user: chat_core_types_pb.InputUser.AsObject,
  }
}

export class ContactsUnblock extends jspb.Message {
  hasUser(): boolean;
  clearUser(): void;
  getUser(): chat_core_types_pb.InputUser;
  setUser(value?: chat_core_types_pb.InputUser): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsUnblock.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsUnblock): ContactsUnblock.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsUnblock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsUnblock;
  static deserializeBinaryFromReader(message: ContactsUnblock, reader: jspb.BinaryReader): ContactsUnblock;
}

export namespace ContactsUnblock {
  export type AsObject = {
    user: chat_core_types_pb.InputUser.AsObject,
  }
}

export class ContactsGetBlocked extends jspb.Message {
  hasOffset(): boolean;
  clearOffset(): void;
  getOffset(): number | undefined;
  setOffset(value: number): void;

  hasLimit(): boolean;
  clearLimit(): void;
  getLimit(): number | undefined;
  setLimit(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsGetBlocked.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsGetBlocked): ContactsGetBlocked.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsGetBlocked, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsGetBlocked;
  static deserializeBinaryFromReader(message: ContactsGetBlocked, reader: jspb.BinaryReader): ContactsGetBlocked;
}

export namespace ContactsGetBlocked {
  export type AsObject = {
    offset?: number,
    limit?: number,
  }
}

export class ContactsSearch extends jspb.Message {
  hasQ(): boolean;
  clearQ(): void;
  getQ(): string | undefined;
  setQ(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsSearch.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsSearch): ContactsSearch.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsSearch, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsSearch;
  static deserializeBinaryFromReader(message: ContactsSearch, reader: jspb.BinaryReader): ContactsSearch;
}

export namespace ContactsSearch {
  export type AsObject = {
    q?: string,
  }
}

export class BlockedContactsMany extends jspb.Message {
  clearContactsList(): void;
  getContactsList(): Array<BlockedContact>;
  setContactsList(value: Array<BlockedContact>): void;
  addContacts(value?: BlockedContact, index?: number): BlockedContact;

  clearUsersList(): void;
  getUsersList(): Array<chat_core_types_pb.User>;
  setUsersList(value: Array<chat_core_types_pb.User>): void;
  addUsers(value?: chat_core_types_pb.User, index?: number): chat_core_types_pb.User;

  hasTotal(): boolean;
  clearTotal(): void;
  getTotal(): number | undefined;
  setTotal(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockedContactsMany.AsObject;
  static toObject(includeInstance: boolean, msg: BlockedContactsMany): BlockedContactsMany.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlockedContactsMany, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockedContactsMany;
  static deserializeBinaryFromReader(message: BlockedContactsMany, reader: jspb.BinaryReader): BlockedContactsMany;
}

export namespace BlockedContactsMany {
  export type AsObject = {
    contactsList: Array<BlockedContact.AsObject>,
    usersList: Array<chat_core_types_pb.User.AsObject>,
    total?: number,
  }
}

export class BlockedContact extends jspb.Message {
  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): number | undefined;
  setUserid(value: number): void;

  hasDate(): boolean;
  clearDate(): void;
  getDate(): number | undefined;
  setDate(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlockedContact.AsObject;
  static toObject(includeInstance: boolean, msg: BlockedContact): BlockedContact.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BlockedContact, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlockedContact;
  static deserializeBinaryFromReader(message: BlockedContact, reader: jspb.BinaryReader): BlockedContact;
}

export namespace BlockedContact {
  export type AsObject = {
    userid?: number,
    date?: number,
  }
}

export class ContactsImported extends jspb.Message {
  clearContactusersList(): void;
  getContactusersList(): Array<chat_core_types_pb.ContactUser>;
  setContactusersList(value: Array<chat_core_types_pb.ContactUser>): void;
  addContactusers(value?: chat_core_types_pb.ContactUser, index?: number): chat_core_types_pb.ContactUser;

  clearUsersList(): void;
  getUsersList(): Array<chat_core_types_pb.User>;
  setUsersList(value: Array<chat_core_types_pb.User>): void;
  addUsers(value?: chat_core_types_pb.User, index?: number): chat_core_types_pb.User;

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
    contactusersList: Array<chat_core_types_pb.ContactUser.AsObject>,
    usersList: Array<chat_core_types_pb.User.AsObject>,
  }
}

export class ContactsMany extends jspb.Message {
  clearContactsList(): void;
  getContactsList(): Array<chat_core_types_pb.PhoneContact>;
  setContactsList(value: Array<chat_core_types_pb.PhoneContact>): void;
  addContacts(value?: chat_core_types_pb.PhoneContact, index?: number): chat_core_types_pb.PhoneContact;

  clearContactusersList(): void;
  getContactusersList(): Array<chat_core_types_pb.ContactUser>;
  setContactusersList(value: Array<chat_core_types_pb.ContactUser>): void;
  addContactusers(value?: chat_core_types_pb.ContactUser, index?: number): chat_core_types_pb.ContactUser;

  hasModified(): boolean;
  clearModified(): void;
  getModified(): boolean | undefined;
  setModified(value: boolean): void;

  clearUsersList(): void;
  getUsersList(): Array<chat_core_types_pb.User>;
  setUsersList(value: Array<chat_core_types_pb.User>): void;
  addUsers(value?: chat_core_types_pb.User, index?: number): chat_core_types_pb.User;

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
    contactsList: Array<chat_core_types_pb.PhoneContact.AsObject>,
    contactusersList: Array<chat_core_types_pb.ContactUser.AsObject>,
    modified?: boolean,
    usersList: Array<chat_core_types_pb.User.AsObject>,
  }
}

