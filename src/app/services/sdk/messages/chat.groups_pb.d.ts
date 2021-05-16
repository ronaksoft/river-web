/* tslint:disable */
// package: msg
// file: chat.groups.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class GroupsCreate extends jspb.Message {
  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.InputUser>;
  setUsersList(value: Array<core_types_pb.InputUser>): void;
  addUsers(value?: core_types_pb.InputUser, index?: number): core_types_pb.InputUser;

  getTitle(): string;
  setTitle(value: string): void;

  getRandomid(): number;
  setRandomid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsCreate.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsCreate): GroupsCreate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsCreate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsCreate;
  static deserializeBinaryFromReader(message: GroupsCreate, reader: jspb.BinaryReader): GroupsCreate;
}

export namespace GroupsCreate {
  export type AsObject = {
    usersList: Array<core_types_pb.InputUser.AsObject>,
    title: string,
    randomid: number,
  }
}

export class GroupsAddUser extends jspb.Message {
  getGroupid(): string;
  setGroupid(value: string): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser | undefined;
  setUser(value?: core_types_pb.InputUser): void;

  getForwardlimit(): number;
  setForwardlimit(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsAddUser.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsAddUser): GroupsAddUser.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsAddUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsAddUser;
  static deserializeBinaryFromReader(message: GroupsAddUser, reader: jspb.BinaryReader): GroupsAddUser;
}

export namespace GroupsAddUser {
  export type AsObject = {
    groupid: string,
    user?: core_types_pb.InputUser.AsObject,
    forwardlimit: number,
  }
}

export class GroupsEditTitle extends jspb.Message {
  getGroupid(): string;
  setGroupid(value: string): void;

  getTitle(): string;
  setTitle(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsEditTitle.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsEditTitle): GroupsEditTitle.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsEditTitle, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsEditTitle;
  static deserializeBinaryFromReader(message: GroupsEditTitle, reader: jspb.BinaryReader): GroupsEditTitle;
}

export namespace GroupsEditTitle {
  export type AsObject = {
    groupid: string,
    title: string,
  }
}

export class GroupsDeleteUser extends jspb.Message {
  getGroupid(): string;
  setGroupid(value: string): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser | undefined;
  setUser(value?: core_types_pb.InputUser): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsDeleteUser.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsDeleteUser): GroupsDeleteUser.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsDeleteUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsDeleteUser;
  static deserializeBinaryFromReader(message: GroupsDeleteUser, reader: jspb.BinaryReader): GroupsDeleteUser;
}

export namespace GroupsDeleteUser {
  export type AsObject = {
    groupid: string,
    user?: core_types_pb.InputUser.AsObject,
  }
}

export class GroupsGetFull extends jspb.Message {
  getGroupid(): string;
  setGroupid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsGetFull.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsGetFull): GroupsGetFull.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsGetFull, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsGetFull;
  static deserializeBinaryFromReader(message: GroupsGetFull, reader: jspb.BinaryReader): GroupsGetFull;
}

export namespace GroupsGetFull {
  export type AsObject = {
    groupid: string,
  }
}

export class GroupsToggleAdmins extends jspb.Message {
  getGroupid(): string;
  setGroupid(value: string): void;

  getAdminenabled(): boolean;
  setAdminenabled(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsToggleAdmins.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsToggleAdmins): GroupsToggleAdmins.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsToggleAdmins, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsToggleAdmins;
  static deserializeBinaryFromReader(message: GroupsToggleAdmins, reader: jspb.BinaryReader): GroupsToggleAdmins;
}

export namespace GroupsToggleAdmins {
  export type AsObject = {
    groupid: string,
    adminenabled: boolean,
  }
}

export class GroupsToggleAdminOnly extends jspb.Message {
  getGroupid(): string;
  setGroupid(value: string): void;

  getAdminonly(): boolean;
  setAdminonly(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsToggleAdminOnly.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsToggleAdminOnly): GroupsToggleAdminOnly.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsToggleAdminOnly, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsToggleAdminOnly;
  static deserializeBinaryFromReader(message: GroupsToggleAdminOnly, reader: jspb.BinaryReader): GroupsToggleAdminOnly;
}

export namespace GroupsToggleAdminOnly {
  export type AsObject = {
    groupid: string,
    adminonly: boolean,
  }
}

export class GroupsUpdateAdmin extends jspb.Message {
  getGroupid(): string;
  setGroupid(value: string): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser | undefined;
  setUser(value?: core_types_pb.InputUser): void;

  getAdmin(): boolean;
  setAdmin(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsUpdateAdmin.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsUpdateAdmin): GroupsUpdateAdmin.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsUpdateAdmin, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsUpdateAdmin;
  static deserializeBinaryFromReader(message: GroupsUpdateAdmin, reader: jspb.BinaryReader): GroupsUpdateAdmin;
}

export namespace GroupsUpdateAdmin {
  export type AsObject = {
    groupid: string,
    user?: core_types_pb.InputUser.AsObject,
    admin: boolean,
  }
}

export class GroupsUploadPhoto extends jspb.Message {
  getGroupid(): string;
  setGroupid(value: string): void;

  hasFile(): boolean;
  clearFile(): void;
  getFile(): core_types_pb.InputFile | undefined;
  setFile(value?: core_types_pb.InputFile): void;

  getReturnobject(): boolean;
  setReturnobject(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsUploadPhoto.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsUploadPhoto): GroupsUploadPhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsUploadPhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsUploadPhoto;
  static deserializeBinaryFromReader(message: GroupsUploadPhoto, reader: jspb.BinaryReader): GroupsUploadPhoto;
}

export namespace GroupsUploadPhoto {
  export type AsObject = {
    groupid: string,
    file?: core_types_pb.InputFile.AsObject,
    returnobject: boolean,
  }
}

export class GroupsRemovePhoto extends jspb.Message {
  getGroupid(): string;
  setGroupid(value: string): void;

  getPhotoid(): string;
  setPhotoid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsRemovePhoto.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsRemovePhoto): GroupsRemovePhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsRemovePhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsRemovePhoto;
  static deserializeBinaryFromReader(message: GroupsRemovePhoto, reader: jspb.BinaryReader): GroupsRemovePhoto;
}

export namespace GroupsRemovePhoto {
  export type AsObject = {
    groupid: string,
    photoid: string,
  }
}

export class GroupsUpdatePhoto extends jspb.Message {
  getPhotoid(): string;
  setPhotoid(value: string): void;

  getGroupid(): string;
  setGroupid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsUpdatePhoto.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsUpdatePhoto): GroupsUpdatePhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsUpdatePhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsUpdatePhoto;
  static deserializeBinaryFromReader(message: GroupsUpdatePhoto, reader: jspb.BinaryReader): GroupsUpdatePhoto;
}

export namespace GroupsUpdatePhoto {
  export type AsObject = {
    photoid: string,
    groupid: string,
  }
}

export class GroupsGetReadHistoryStats extends jspb.Message {
  getGroupid(): string;
  setGroupid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsGetReadHistoryStats.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsGetReadHistoryStats): GroupsGetReadHistoryStats.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsGetReadHistoryStats, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsGetReadHistoryStats;
  static deserializeBinaryFromReader(message: GroupsGetReadHistoryStats, reader: jspb.BinaryReader): GroupsGetReadHistoryStats;
}

export namespace GroupsGetReadHistoryStats {
  export type AsObject = {
    groupid: string,
  }
}

export class GroupsHistoryStats extends jspb.Message {
  clearStatsList(): void;
  getStatsList(): Array<ReadHistoryStat>;
  setStatsList(value: Array<ReadHistoryStat>): void;
  addStats(value?: ReadHistoryStat, index?: number): ReadHistoryStat;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  getEmpty(): boolean;
  setEmpty(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupsHistoryStats.AsObject;
  static toObject(includeInstance: boolean, msg: GroupsHistoryStats): GroupsHistoryStats.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupsHistoryStats, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupsHistoryStats;
  static deserializeBinaryFromReader(message: GroupsHistoryStats, reader: jspb.BinaryReader): GroupsHistoryStats;
}

export namespace GroupsHistoryStats {
  export type AsObject = {
    statsList: Array<ReadHistoryStat.AsObject>,
    usersList: Array<core_types_pb.User.AsObject>,
    empty: boolean,
  }
}

export class ReadHistoryStat extends jspb.Message {
  getUserid(): string;
  setUserid(value: string): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReadHistoryStat.AsObject;
  static toObject(includeInstance: boolean, msg: ReadHistoryStat): ReadHistoryStat.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReadHistoryStat, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReadHistoryStat;
  static deserializeBinaryFromReader(message: ReadHistoryStat, reader: jspb.BinaryReader): ReadHistoryStat;
}

export namespace ReadHistoryStat {
  export type AsObject = {
    userid: string,
    messageid: number,
  }
}

