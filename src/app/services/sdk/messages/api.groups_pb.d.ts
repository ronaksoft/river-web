// package: msg
// file: api.groups.proto

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
  }
}

export class GroupsAddUser extends jspb.Message {
  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): number | undefined;
  setGroupid(value: number): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser;
  setUser(value?: core_types_pb.InputUser): void;

  hasForwardlimit(): boolean;
  clearForwardlimit(): void;
  getForwardlimit(): number | undefined;
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
    groupid?: number,
    user: core_types_pb.InputUser.AsObject,
    forwardlimit?: number,
  }
}

export class GroupsEditTitle extends jspb.Message {
  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): number | undefined;
  setGroupid(value: number): void;

  hasTitle(): boolean;
  clearTitle(): void;
  getTitle(): string | undefined;
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
    groupid?: number,
    title?: string,
  }
}

export class GroupsDeleteUser extends jspb.Message {
  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): number | undefined;
  setGroupid(value: number): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser;
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
    groupid?: number,
    user: core_types_pb.InputUser.AsObject,
  }
}

export class GroupsGetFull extends jspb.Message {
  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): number | undefined;
  setGroupid(value: number): void;

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
    groupid?: number,
  }
}

