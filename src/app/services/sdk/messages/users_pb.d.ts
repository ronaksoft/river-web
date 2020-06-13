/* tslint:disable */
// package: msg
// file: users.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class UsersGet extends jspb.Message {
  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.InputUser>;
  setUsersList(value: Array<core_types_pb.InputUser>): void;
  addUsers(value?: core_types_pb.InputUser, index?: number): core_types_pb.InputUser;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UsersGet.AsObject;
  static toObject(includeInstance: boolean, msg: UsersGet): UsersGet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UsersGet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UsersGet;
  static deserializeBinaryFromReader(message: UsersGet, reader: jspb.BinaryReader): UsersGet;
}

export namespace UsersGet {
  export type AsObject = {
    usersList: Array<core_types_pb.InputUser.AsObject>,
  }
}

export class UsersGetFull extends jspb.Message {
  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.InputUser>;
  setUsersList(value: Array<core_types_pb.InputUser>): void;
  addUsers(value?: core_types_pb.InputUser, index?: number): core_types_pb.InputUser;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UsersGetFull.AsObject;
  static toObject(includeInstance: boolean, msg: UsersGetFull): UsersGetFull.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UsersGetFull, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UsersGetFull;
  static deserializeBinaryFromReader(message: UsersGetFull, reader: jspb.BinaryReader): UsersGetFull;
}

export namespace UsersGetFull {
  export type AsObject = {
    usersList: Array<core_types_pb.InputUser.AsObject>,
  }
}

export class UsersMany extends jspb.Message {
  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  hasEmpty(): boolean;
  clearEmpty(): void;
  getEmpty(): boolean | undefined;
  setEmpty(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UsersMany.AsObject;
  static toObject(includeInstance: boolean, msg: UsersMany): UsersMany.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UsersMany, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UsersMany;
  static deserializeBinaryFromReader(message: UsersMany, reader: jspb.BinaryReader): UsersMany;
}

export namespace UsersMany {
  export type AsObject = {
    usersList: Array<core_types_pb.User.AsObject>,
    empty?: boolean,
  }
}

