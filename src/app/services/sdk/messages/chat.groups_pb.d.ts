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

  hasTitle(): boolean;
  clearTitle(): void;
  getTitle(): string | undefined;
  setTitle(value: string): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.InputTeam | undefined;
  setTeam(value?: core_types_pb.InputTeam): void;

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
    title?: string,
    team?: core_types_pb.InputTeam.AsObject,
  }
}

export class GroupsAddUser extends jspb.Message {
  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser;
  setUser(value?: core_types_pb.InputUser): void;

  hasForwardlimit(): boolean;
  clearForwardlimit(): void;
  getForwardlimit(): number | undefined;
  setForwardlimit(value: number): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.InputTeam | undefined;
  setTeam(value?: core_types_pb.InputTeam): void;

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
    groupid?: string,
    user: core_types_pb.InputUser.AsObject,
    forwardlimit?: number,
    team?: core_types_pb.InputTeam.AsObject,
  }
}

export class GroupsEditTitle extends jspb.Message {
  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasTitle(): boolean;
  clearTitle(): void;
  getTitle(): string | undefined;
  setTitle(value: string): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.InputTeam | undefined;
  setTeam(value?: core_types_pb.InputTeam): void;

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
    groupid?: string,
    title?: string,
    team?: core_types_pb.InputTeam.AsObject,
  }
}

export class GroupsDeleteUser extends jspb.Message {
  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser;
  setUser(value?: core_types_pb.InputUser): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.InputTeam | undefined;
  setTeam(value?: core_types_pb.InputTeam): void;

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
    groupid?: string,
    user: core_types_pb.InputUser.AsObject,
    team?: core_types_pb.InputTeam.AsObject,
  }
}

export class GroupsGetFull extends jspb.Message {
  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.InputTeam | undefined;
  setTeam(value?: core_types_pb.InputTeam): void;

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
    groupid?: string,
    team?: core_types_pb.InputTeam.AsObject,
  }
}

export class GroupsToggleAdmins extends jspb.Message {
  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasAdminenabled(): boolean;
  clearAdminenabled(): void;
  getAdminenabled(): boolean | undefined;
  setAdminenabled(value: boolean): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.InputTeam | undefined;
  setTeam(value?: core_types_pb.InputTeam): void;

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
    groupid?: string,
    adminenabled?: boolean,
    team?: core_types_pb.InputTeam.AsObject,
  }
}

export class GroupsUpdateAdmin extends jspb.Message {
  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser;
  setUser(value?: core_types_pb.InputUser): void;

  hasAdmin(): boolean;
  clearAdmin(): void;
  getAdmin(): boolean | undefined;
  setAdmin(value: boolean): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.InputTeam | undefined;
  setTeam(value?: core_types_pb.InputTeam): void;

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
    groupid?: string,
    user: core_types_pb.InputUser.AsObject,
    admin?: boolean,
    team?: core_types_pb.InputTeam.AsObject,
  }
}

export class GroupsUploadPhoto extends jspb.Message {
  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasFile(): boolean;
  clearFile(): void;
  getFile(): core_types_pb.InputFile;
  setFile(value?: core_types_pb.InputFile): void;

  hasReturnobject(): boolean;
  clearReturnobject(): void;
  getReturnobject(): boolean | undefined;
  setReturnobject(value: boolean): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.InputTeam | undefined;
  setTeam(value?: core_types_pb.InputTeam): void;

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
    groupid?: string,
    file: core_types_pb.InputFile.AsObject,
    returnobject?: boolean,
    team?: core_types_pb.InputTeam.AsObject,
  }
}

export class GroupsRemovePhoto extends jspb.Message {
  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasPhotoid(): boolean;
  clearPhotoid(): void;
  getPhotoid(): string | undefined;
  setPhotoid(value: string): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.InputTeam | undefined;
  setTeam(value?: core_types_pb.InputTeam): void;

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
    groupid?: string,
    photoid?: string,
    team?: core_types_pb.InputTeam.AsObject,
  }
}

export class GroupsUpdatePhoto extends jspb.Message {
  hasPhotoid(): boolean;
  clearPhotoid(): void;
  getPhotoid(): string | undefined;
  setPhotoid(value: string): void;

  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.InputTeam | undefined;
  setTeam(value?: core_types_pb.InputTeam): void;

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
    photoid?: string,
    groupid?: string,
    team?: core_types_pb.InputTeam.AsObject,
  }
}

