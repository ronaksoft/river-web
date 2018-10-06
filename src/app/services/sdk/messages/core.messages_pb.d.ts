// package: msg
// file: core.messages.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class MessageEnvelope extends jspb.Message {
  hasConstructor(): boolean;
  clearConstructor(): void;
  getConstructor(): number | undefined;
  setConstructor(value: number): void;

  hasRequestid(): boolean;
  clearRequestid(): void;
  getRequestid(): number | undefined;
  setRequestid(value: number): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): Uint8Array | string;
  getMessage_asU8(): Uint8Array;
  getMessage_asB64(): string;
  setMessage(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageEnvelope.AsObject;
  static toObject(includeInstance: boolean, msg: MessageEnvelope): MessageEnvelope.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageEnvelope, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageEnvelope;
  static deserializeBinaryFromReader(message: MessageEnvelope, reader: jspb.BinaryReader): MessageEnvelope;
}

export namespace MessageEnvelope {
  export type AsObject = {
    constructor?: number,
    requestid?: number,
    message: Uint8Array | string,
  }
}

export class MessageContainer extends jspb.Message {
  hasLength(): boolean;
  clearLength(): void;
  getLength(): number | undefined;
  setLength(value: number): void;

  clearEnvelopesList(): void;
  getEnvelopesList(): Array<MessageEnvelope>;
  setEnvelopesList(value: Array<MessageEnvelope>): void;
  addEnvelopes(value?: MessageEnvelope, index?: number): MessageEnvelope;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageContainer.AsObject;
  static toObject(includeInstance: boolean, msg: MessageContainer): MessageContainer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageContainer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageContainer;
  static deserializeBinaryFromReader(message: MessageContainer, reader: jspb.BinaryReader): MessageContainer;
}

export namespace MessageContainer {
  export type AsObject = {
    length?: number,
    envelopesList: Array<MessageEnvelope.AsObject>,
  }
}

export class UpdateEnvelope extends jspb.Message {
  hasConstructor(): boolean;
  clearConstructor(): void;
  getConstructor(): number | undefined;
  setConstructor(value: number): void;

  hasUpdate(): boolean;
  clearUpdate(): void;
  getUpdate(): Uint8Array | string;
  getUpdate_asU8(): Uint8Array;
  getUpdate_asB64(): string;
  setUpdate(value: Uint8Array | string): void;

  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasTimestamp(): boolean;
  clearTimestamp(): void;
  getTimestamp(): number | undefined;
  setTimestamp(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateEnvelope.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateEnvelope): UpdateEnvelope.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateEnvelope, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateEnvelope;
  static deserializeBinaryFromReader(message: UpdateEnvelope, reader: jspb.BinaryReader): UpdateEnvelope;
}

export namespace UpdateEnvelope {
  export type AsObject = {
    constructor?: number,
    update: Uint8Array | string,
    ucount?: number,
    updateid?: number,
    timestamp?: number,
  }
}

export class UpdateContainer extends jspb.Message {
  hasLength(): boolean;
  clearLength(): void;
  getLength(): number | undefined;
  setLength(value: number): void;

  clearUpdatesList(): void;
  getUpdatesList(): Array<UpdateEnvelope>;
  setUpdatesList(value: Array<UpdateEnvelope>): void;
  addUpdates(value?: UpdateEnvelope, index?: number): UpdateEnvelope;

  hasMinupdateid(): boolean;
  clearMinupdateid(): void;
  getMinupdateid(): number | undefined;
  setMinupdateid(value: number): void;

  hasMaxupdateid(): boolean;
  clearMaxupdateid(): void;
  getMaxupdateid(): number | undefined;
  setMaxupdateid(value: number): void;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateContainer.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateContainer): UpdateContainer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateContainer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateContainer;
  static deserializeBinaryFromReader(message: UpdateContainer, reader: jspb.BinaryReader): UpdateContainer;
}

export namespace UpdateContainer {
  export type AsObject = {
    length?: number,
    updatesList: Array<UpdateEnvelope.AsObject>,
    minupdateid?: number,
    maxupdateid?: number,
    usersList: Array<core_types_pb.User.AsObject>,
  }
}

export class ProtoMessage extends jspb.Message {
  hasAuthid(): boolean;
  clearAuthid(): void;
  getAuthid(): number | undefined;
  setAuthid(value: number): void;

  hasMessagekey(): boolean;
  clearMessagekey(): void;
  getMessagekey(): Uint8Array | string;
  getMessagekey_asU8(): Uint8Array;
  getMessagekey_asB64(): string;
  setMessagekey(value: Uint8Array | string): void;

  hasPayload(): boolean;
  clearPayload(): void;
  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProtoMessage.AsObject;
  static toObject(includeInstance: boolean, msg: ProtoMessage): ProtoMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ProtoMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProtoMessage;
  static deserializeBinaryFromReader(message: ProtoMessage, reader: jspb.BinaryReader): ProtoMessage;
}

export namespace ProtoMessage {
  export type AsObject = {
    authid?: number,
    messagekey: Uint8Array | string,
    payload: Uint8Array | string,
  }
}

export class ProtoEncryptedPayload extends jspb.Message {
  hasServersalt(): boolean;
  clearServersalt(): void;
  getServersalt(): number | undefined;
  setServersalt(value: number): void;

  hasMessageid(): boolean;
  clearMessageid(): void;
  getMessageid(): number | undefined;
  setMessageid(value: number): void;

  hasSessionid(): boolean;
  clearSessionid(): void;
  getSessionid(): number | undefined;
  setSessionid(value: number): void;

  hasEnvelope(): boolean;
  clearEnvelope(): void;
  getEnvelope(): MessageEnvelope;
  setEnvelope(value?: MessageEnvelope): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProtoEncryptedPayload.AsObject;
  static toObject(includeInstance: boolean, msg: ProtoEncryptedPayload): ProtoEncryptedPayload.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ProtoEncryptedPayload, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProtoEncryptedPayload;
  static deserializeBinaryFromReader(message: ProtoEncryptedPayload, reader: jspb.BinaryReader): ProtoEncryptedPayload;
}

export namespace ProtoEncryptedPayload {
  export type AsObject = {
    serversalt?: number,
    messageid?: number,
    sessionid?: number,
    envelope: MessageEnvelope.AsObject,
  }
}

export class Error extends jspb.Message {
  hasCode(): boolean;
  clearCode(): void;
  getCode(): string | undefined;
  setCode(value: string): void;

  hasItems(): boolean;
  clearItems(): void;
  getItems(): string | undefined;
  setItems(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Error.AsObject;
  static toObject(includeInstance: boolean, msg: Error): Error.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Error, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Error;
  static deserializeBinaryFromReader(message: Error, reader: jspb.BinaryReader): Error;
}

export namespace Error {
  export type AsObject = {
    code?: string,
    items?: string,
  }
}

export class Ack extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Ack.AsObject;
  static toObject(includeInstance: boolean, msg: Ack): Ack.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Ack, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Ack;
  static deserializeBinaryFromReader(message: Ack, reader: jspb.BinaryReader): Ack;
}

export namespace Ack {
  export type AsObject = {
  }
}

export class Bool extends jspb.Message {
  hasResult(): boolean;
  clearResult(): void;
  getResult(): boolean | undefined;
  setResult(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Bool.AsObject;
  static toObject(includeInstance: boolean, msg: Bool): Bool.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Bool, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Bool;
  static deserializeBinaryFromReader(message: Bool, reader: jspb.BinaryReader): Bool;
}

export namespace Bool {
  export type AsObject = {
    result?: boolean,
  }
}

export class WorkerRequest extends jspb.Message {
  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): number | undefined;
  setUserid(value: number): void;

  hasAuthid(): boolean;
  clearAuthid(): void;
  getAuthid(): number | undefined;
  setAuthid(value: number): void;

  hasEnvelope(): boolean;
  clearEnvelope(): void;
  getEnvelope(): MessageEnvelope;
  setEnvelope(value?: MessageEnvelope): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WorkerRequest.AsObject;
  static toObject(includeInstance: boolean, msg: WorkerRequest): WorkerRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WorkerRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WorkerRequest;
  static deserializeBinaryFromReader(message: WorkerRequest, reader: jspb.BinaryReader): WorkerRequest;
}

export namespace WorkerRequest {
  export type AsObject = {
    userid?: number,
    authid?: number,
    envelope: MessageEnvelope.AsObject,
  }
}

export class APIPushMessage extends jspb.Message {
  hasConnectionid(): boolean;
  clearConnectionid(): void;
  getConnectionid(): number | undefined;
  setConnectionid(value: number): void;

  hasAuthid(): boolean;
  clearAuthid(): void;
  getAuthid(): number | undefined;
  setAuthid(value: number): void;

  hasAction(): boolean;
  clearAction(): void;
  getAction(): APIPushAction | undefined;
  setAction(value: APIPushAction): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): APIPushMessage.AsObject;
  static toObject(includeInstance: boolean, msg: APIPushMessage): APIPushMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: APIPushMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): APIPushMessage;
  static deserializeBinaryFromReader(message: APIPushMessage, reader: jspb.BinaryReader): APIPushMessage;
}

export namespace APIPushMessage {
  export type AsObject = {
    connectionid?: number,
    authid?: number,
    action?: APIPushAction,
  }
}

export enum APIPushAction {
  NEWMESSAGE = 0,
  NEWUPDATE = 1,
  EXPIRED = 2,
}

