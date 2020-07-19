/* tslint:disable */
// package: msg
// file: contacts.proto

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

export class ContactsAdd extends jspb.Message {
  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser;
  setUser(value?: core_types_pb.InputUser): void;

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
    user: core_types_pb.InputUser.AsObject,
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

export class ContactsDeleteAll extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsDeleteAll.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsDeleteAll): ContactsDeleteAll.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsDeleteAll, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsDeleteAll;
  static deserializeBinaryFromReader(message: ContactsDeleteAll, reader: jspb.BinaryReader): ContactsDeleteAll;
}

export namespace ContactsDeleteAll {
  export type AsObject = {
  }
}

export class ContactsBlock extends jspb.Message {
  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser;
  setUser(value?: core_types_pb.InputUser): void;

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
    user: core_types_pb.InputUser.AsObject,
  }
}

export class ContactsUnblock extends jspb.Message {
  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser;
  setUser(value?: core_types_pb.InputUser): void;

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
    user: core_types_pb.InputUser.AsObject,
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

export class ContactsGetTopPeers extends jspb.Message {
  hasOffset(): boolean;
  clearOffset(): void;
  getOffset(): number | undefined;
  setOffset(value: number): void;

  hasLimit(): boolean;
  clearLimit(): void;
  getLimit(): number | undefined;
  setLimit(value: number): void;

  hasCategory(): boolean;
  clearCategory(): void;
  getCategory(): TopPeerCategory | undefined;
  setCategory(value: TopPeerCategory): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsGetTopPeers.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsGetTopPeers): ContactsGetTopPeers.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsGetTopPeers, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsGetTopPeers;
  static deserializeBinaryFromReader(message: ContactsGetTopPeers, reader: jspb.BinaryReader): ContactsGetTopPeers;
}

export namespace ContactsGetTopPeers {
  export type AsObject = {
    offset?: number,
    limit?: number,
    category?: TopPeerCategory,
  }
}

export class ContactsResetTopPeer extends jspb.Message {
  hasCategory(): boolean;
  clearCategory(): void;
  getCategory(): TopPeerCategory | undefined;
  setCategory(value: TopPeerCategory): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsResetTopPeer.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsResetTopPeer): ContactsResetTopPeer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsResetTopPeer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsResetTopPeer;
  static deserializeBinaryFromReader(message: ContactsResetTopPeer, reader: jspb.BinaryReader): ContactsResetTopPeer;
}

export namespace ContactsResetTopPeer {
  export type AsObject = {
    category?: TopPeerCategory,
    peer: core_types_pb.InputPeer.AsObject,
  }
}

export class ContactsTopPeers extends jspb.Message {
  hasCategory(): boolean;
  clearCategory(): void;
  getCategory(): TopPeerCategory | undefined;
  setCategory(value: TopPeerCategory): void;

  hasCount(): boolean;
  clearCount(): void;
  getCount(): number | undefined;
  setCount(value: number): void;

  clearPeersList(): void;
  getPeersList(): Array<TopPeer>;
  setPeersList(value: Array<TopPeer>): void;
  addPeers(value?: TopPeer, index?: number): TopPeer;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  clearGroupsList(): void;
  getGroupsList(): Array<core_types_pb.Group>;
  setGroupsList(value: Array<core_types_pb.Group>): void;
  addGroups(value?: core_types_pb.Group, index?: number): core_types_pb.Group;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactsTopPeers.AsObject;
  static toObject(includeInstance: boolean, msg: ContactsTopPeers): ContactsTopPeers.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactsTopPeers, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactsTopPeers;
  static deserializeBinaryFromReader(message: ContactsTopPeers, reader: jspb.BinaryReader): ContactsTopPeers;
}

export namespace ContactsTopPeers {
  export type AsObject = {
    category?: TopPeerCategory,
    count?: number,
    peersList: Array<TopPeer.AsObject>,
    usersList: Array<core_types_pb.User.AsObject>,
    groupsList: Array<core_types_pb.Group.AsObject>,
  }
}

export class TopPeer extends jspb.Message {
  hasTeamid(): boolean;
  clearTeamid(): void;
  getTeamid(): string | undefined;
  setTeamid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer;
  setPeer(value?: core_types_pb.Peer): void;

  hasRate(): boolean;
  clearRate(): void;
  getRate(): number | undefined;
  setRate(value: number): void;

  hasLastupdate(): boolean;
  clearLastupdate(): void;
  getLastupdate(): number | undefined;
  setLastupdate(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TopPeer.AsObject;
  static toObject(includeInstance: boolean, msg: TopPeer): TopPeer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TopPeer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TopPeer;
  static deserializeBinaryFromReader(message: TopPeer, reader: jspb.BinaryReader): TopPeer;
}

export namespace TopPeer {
  export type AsObject = {
    teamid?: string,
    peer: core_types_pb.Peer.AsObject,
    rate?: number,
    lastupdate?: number,
  }
}

export class BlockedContactsMany extends jspb.Message {
  clearContactsList(): void;
  getContactsList(): Array<BlockedContact>;
  setContactsList(value: Array<BlockedContact>): void;
  addContacts(value?: BlockedContact, index?: number): BlockedContact;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

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
    usersList: Array<core_types_pb.User.AsObject>,
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
  getContactusersList(): Array<core_types_pb.ContactUser>;
  setContactusersList(value: Array<core_types_pb.ContactUser>): void;
  addContactusers(value?: core_types_pb.ContactUser, index?: number): core_types_pb.ContactUser;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  hasEmpty(): boolean;
  clearEmpty(): void;
  getEmpty(): boolean | undefined;
  setEmpty(value: boolean): void;

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
    contactusersList: Array<core_types_pb.ContactUser.AsObject>,
    usersList: Array<core_types_pb.User.AsObject>,
    empty?: boolean,
  }
}

export class ContactsMany extends jspb.Message {
  clearContactsList(): void;
  getContactsList(): Array<core_types_pb.PhoneContact>;
  setContactsList(value: Array<core_types_pb.PhoneContact>): void;
  addContacts(value?: core_types_pb.PhoneContact, index?: number): core_types_pb.PhoneContact;

  clearContactusersList(): void;
  getContactusersList(): Array<core_types_pb.ContactUser>;
  setContactusersList(value: Array<core_types_pb.ContactUser>): void;
  addContactusers(value?: core_types_pb.ContactUser, index?: number): core_types_pb.ContactUser;

  hasModified(): boolean;
  clearModified(): void;
  getModified(): boolean | undefined;
  setModified(value: boolean): void;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  hasEmpty(): boolean;
  clearEmpty(): void;
  getEmpty(): boolean | undefined;
  setEmpty(value: boolean): void;

  hasHash(): boolean;
  clearHash(): void;
  getHash(): number | undefined;
  setHash(value: number): void;

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
    contactusersList: Array<core_types_pb.ContactUser.AsObject>,
    modified?: boolean,
    usersList: Array<core_types_pb.User.AsObject>,
    empty?: boolean,
    hash?: number,
  }
}

export enum TopPeerCategory {
  USERS = 0,
  GROUPS = 1,
  FORWARDS = 2,
  BOTSMESSAGE = 3,
  BOTSINLINE = 4,
}

