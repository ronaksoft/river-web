// package: msg
// file: worker.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class JobSendMessage extends jspb.Message {
  hasGlobalid(): boolean;
  clearGlobalid(): void;
  getGlobalid(): number | undefined;
  setGlobalid(value: number): void;

  hasSenderid(): boolean;
  clearSenderid(): void;
  getSenderid(): number | undefined;
  setSenderid(value: number): void;

  hasSendermessageid(): boolean;
  clearSendermessageid(): void;
  getSendermessageid(): number | undefined;
  setSendermessageid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  hasCreatedon(): boolean;
  clearCreatedon(): void;
  getCreatedon(): number | undefined;
  setCreatedon(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobSendMessage.AsObject;
  static toObject(includeInstance: boolean, msg: JobSendMessage): JobSendMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobSendMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobSendMessage;
  static deserializeBinaryFromReader(message: JobSendMessage, reader: jspb.BinaryReader): JobSendMessage;
}

export namespace JobSendMessage {
  export type AsObject = {
    globalid?: number,
    senderid?: number,
    sendermessageid?: number,
    peer: core_types_pb.InputPeer.AsObject,
    body?: string,
    createdon?: number,
  }
}

export class JobUserJoined extends jspb.Message {
  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): number | undefined;
  setUserid(value: number): void;

  hasPhone(): boolean;
  clearPhone(): void;
  getPhone(): string | undefined;
  setPhone(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobUserJoined.AsObject;
  static toObject(includeInstance: boolean, msg: JobUserJoined): JobUserJoined.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobUserJoined, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobUserJoined;
  static deserializeBinaryFromReader(message: JobUserJoined, reader: jspb.BinaryReader): JobUserJoined;
}

export namespace JobUserJoined {
  export type AsObject = {
    userid?: number,
    phone?: string,
  }
}

export class JobEditMessage extends jspb.Message {
  hasGlobalid(): boolean;
  clearGlobalid(): void;
  getGlobalid(): number | undefined;
  setGlobalid(value: number): void;

  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobEditMessage.AsObject;
  static toObject(includeInstance: boolean, msg: JobEditMessage): JobEditMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobEditMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobEditMessage;
  static deserializeBinaryFromReader(message: JobEditMessage, reader: jspb.BinaryReader): JobEditMessage;
}

export namespace JobEditMessage {
  export type AsObject = {
    globalid?: number,
    body?: string,
  }
}

export class JobReadHistory extends jspb.Message {
  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): number | undefined;
  setUserid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasReadinboxmaxid(): boolean;
  clearReadinboxmaxid(): void;
  getReadinboxmaxid(): number | undefined;
  setReadinboxmaxid(value: number): void;

  hasMessageid(): boolean;
  clearMessageid(): void;
  getMessageid(): number | undefined;
  setMessageid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobReadHistory.AsObject;
  static toObject(includeInstance: boolean, msg: JobReadHistory): JobReadHistory.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobReadHistory, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobReadHistory;
  static deserializeBinaryFromReader(message: JobReadHistory, reader: jspb.BinaryReader): JobReadHistory;
}

export namespace JobReadHistory {
  export type AsObject = {
    userid?: number,
    peer: core_types_pb.InputPeer.AsObject,
    readinboxmaxid?: number,
    messageid?: number,
  }
}

export class JobImportContacts extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobImportContacts.AsObject;
  static toObject(includeInstance: boolean, msg: JobImportContacts): JobImportContacts.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobImportContacts, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobImportContacts;
  static deserializeBinaryFromReader(message: JobImportContacts, reader: jspb.BinaryReader): JobImportContacts;
}

export namespace JobImportContacts {
  export type AsObject = {
  }
}

