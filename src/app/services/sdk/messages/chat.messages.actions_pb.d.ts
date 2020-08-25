/* tslint:disable */
// package: msg
// file: chat.messages.actions.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class MessageActionGroupAddUser extends jspb.Message {
  clearUseridsList(): void;
  getUseridsList(): Array<string>;
  setUseridsList(value: Array<string>): void;
  addUserids(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageActionGroupAddUser.AsObject;
  static toObject(includeInstance: boolean, msg: MessageActionGroupAddUser): MessageActionGroupAddUser.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageActionGroupAddUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageActionGroupAddUser;
  static deserializeBinaryFromReader(message: MessageActionGroupAddUser, reader: jspb.BinaryReader): MessageActionGroupAddUser;
}

export namespace MessageActionGroupAddUser {
  export type AsObject = {
    useridsList: Array<string>,
  }
}

export class MessageActionGroupDeleteUser extends jspb.Message {
  clearUseridsList(): void;
  getUseridsList(): Array<string>;
  setUseridsList(value: Array<string>): void;
  addUserids(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageActionGroupDeleteUser.AsObject;
  static toObject(includeInstance: boolean, msg: MessageActionGroupDeleteUser): MessageActionGroupDeleteUser.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageActionGroupDeleteUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageActionGroupDeleteUser;
  static deserializeBinaryFromReader(message: MessageActionGroupDeleteUser, reader: jspb.BinaryReader): MessageActionGroupDeleteUser;
}

export namespace MessageActionGroupDeleteUser {
  export type AsObject = {
    useridsList: Array<string>,
  }
}

export class MessageActionGroupCreated extends jspb.Message {
  hasGrouptitle(): boolean;
  clearGrouptitle(): void;
  getGrouptitle(): string | undefined;
  setGrouptitle(value: string): void;

  clearUseridsList(): void;
  getUseridsList(): Array<string>;
  setUseridsList(value: Array<string>): void;
  addUserids(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageActionGroupCreated.AsObject;
  static toObject(includeInstance: boolean, msg: MessageActionGroupCreated): MessageActionGroupCreated.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageActionGroupCreated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageActionGroupCreated;
  static deserializeBinaryFromReader(message: MessageActionGroupCreated, reader: jspb.BinaryReader): MessageActionGroupCreated;
}

export namespace MessageActionGroupCreated {
  export type AsObject = {
    grouptitle?: string,
    useridsList: Array<string>,
  }
}

export class MessageActionGroupTitleChanged extends jspb.Message {
  hasGrouptitle(): boolean;
  clearGrouptitle(): void;
  getGrouptitle(): string | undefined;
  setGrouptitle(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageActionGroupTitleChanged.AsObject;
  static toObject(includeInstance: boolean, msg: MessageActionGroupTitleChanged): MessageActionGroupTitleChanged.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageActionGroupTitleChanged, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageActionGroupTitleChanged;
  static deserializeBinaryFromReader(message: MessageActionGroupTitleChanged, reader: jspb.BinaryReader): MessageActionGroupTitleChanged;
}

export namespace MessageActionGroupTitleChanged {
  export type AsObject = {
    grouptitle?: string,
  }
}

export class MessageActionGroupPhotoChanged extends jspb.Message {
  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): core_types_pb.GroupPhoto | undefined;
  setPhoto(value?: core_types_pb.GroupPhoto): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageActionGroupPhotoChanged.AsObject;
  static toObject(includeInstance: boolean, msg: MessageActionGroupPhotoChanged): MessageActionGroupPhotoChanged.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageActionGroupPhotoChanged, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageActionGroupPhotoChanged;
  static deserializeBinaryFromReader(message: MessageActionGroupPhotoChanged, reader: jspb.BinaryReader): MessageActionGroupPhotoChanged;
}

export namespace MessageActionGroupPhotoChanged {
  export type AsObject = {
    photo?: core_types_pb.GroupPhoto.AsObject,
  }
}

export class MessageActionClearHistory extends jspb.Message {
  hasMaxid(): boolean;
  clearMaxid(): void;
  getMaxid(): number | undefined;
  setMaxid(value: number): void;

  hasDelete(): boolean;
  clearDelete(): void;
  getDelete(): boolean | undefined;
  setDelete(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageActionClearHistory.AsObject;
  static toObject(includeInstance: boolean, msg: MessageActionClearHistory): MessageActionClearHistory.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageActionClearHistory, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageActionClearHistory;
  static deserializeBinaryFromReader(message: MessageActionClearHistory, reader: jspb.BinaryReader): MessageActionClearHistory;
}

export namespace MessageActionClearHistory {
  export type AsObject = {
    maxid?: number,
    pb_delete?: boolean,
  }
}

export class MessageActionContactRegistered extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageActionContactRegistered.AsObject;
  static toObject(includeInstance: boolean, msg: MessageActionContactRegistered): MessageActionContactRegistered.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageActionContactRegistered, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageActionContactRegistered;
  static deserializeBinaryFromReader(message: MessageActionContactRegistered, reader: jspb.BinaryReader): MessageActionContactRegistered;
}

export namespace MessageActionContactRegistered {
  export type AsObject = {
  }
}

export class MessageActionScreenShotTaken extends jspb.Message {
  hasMinid(): boolean;
  clearMinid(): void;
  getMinid(): number | undefined;
  setMinid(value: number): void;

  hasMaxid(): boolean;
  clearMaxid(): void;
  getMaxid(): number | undefined;
  setMaxid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageActionScreenShotTaken.AsObject;
  static toObject(includeInstance: boolean, msg: MessageActionScreenShotTaken): MessageActionScreenShotTaken.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageActionScreenShotTaken, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageActionScreenShotTaken;
  static deserializeBinaryFromReader(message: MessageActionScreenShotTaken, reader: jspb.BinaryReader): MessageActionScreenShotTaken;
}

export namespace MessageActionScreenShotTaken {
  export type AsObject = {
    minid?: number,
    maxid?: number,
  }
}

export class MessageActionThreadClosed extends jspb.Message {
  hasThreadid(): boolean;
  clearThreadid(): void;
  getThreadid(): number | undefined;
  setThreadid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageActionThreadClosed.AsObject;
  static toObject(includeInstance: boolean, msg: MessageActionThreadClosed): MessageActionThreadClosed.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageActionThreadClosed, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageActionThreadClosed;
  static deserializeBinaryFromReader(message: MessageActionThreadClosed, reader: jspb.BinaryReader): MessageActionThreadClosed;
}

export namespace MessageActionThreadClosed {
  export type AsObject = {
    threadid?: number,
  }
}

