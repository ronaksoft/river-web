/* tslint:disable */
// package: rony
// file: rony.proto

import * as jspb from "google-protobuf";

export class MessageEnvelope extends jspb.Message {
  getConstructor(): number;
  setConstructor(value: number): void;

  getRequestid(): number;
  setRequestid(value: number): void;

  getMessage(): Uint8Array | string;
  getMessage_asU8(): Uint8Array;
  getMessage_asB64(): string;
  setMessage(value: Uint8Array | string): void;

  getAuth(): Uint8Array | string;
  getAuth_asU8(): Uint8Array;
  getAuth_asB64(): string;
  setAuth(value: Uint8Array | string): void;

  clearHeaderList(): void;
  getHeaderList(): Array<KeyValue>;
  setHeaderList(value: Array<KeyValue>): void;
  addHeader(value?: KeyValue, index?: number): KeyValue;

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
    constructor: number,
    requestid: number,
    message: Uint8Array | string,
    auth: Uint8Array | string,
    headerList: Array<KeyValue.AsObject>,
  }
}

export class MessageContainer extends jspb.Message {
  getLength(): number;
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
    length: number,
    envelopesList: Array<MessageEnvelope.AsObject>,
  }
}

export class Error extends jspb.Message {
  getCode(): string;
  setCode(value: string): void;

  getItems(): string;
  setItems(value: string): void;

  getTemplate(): string;
  setTemplate(value: string): void;

  clearTemplateitemsList(): void;
  getTemplateitemsList(): Array<string>;
  setTemplateitemsList(value: Array<string>): void;
  addTemplateitems(value: string, index?: number): string;

  getLocaltemplate(): string;
  setLocaltemplate(value: string): void;

  clearLocaltemplateitemsList(): void;
  getLocaltemplateitemsList(): Array<string>;
  setLocaltemplateitemsList(value: Array<string>): void;
  addLocaltemplateitems(value: string, index?: number): string;

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
    code: string,
    items: string,
    template: string,
    templateitemsList: Array<string>,
    localtemplate: string,
    localtemplateitemsList: Array<string>,
  }
}

export class Redirect extends jspb.Message {
  clearLeaderhostportList(): void;
  getLeaderhostportList(): Array<string>;
  setLeaderhostportList(value: Array<string>): void;
  addLeaderhostport(value: string, index?: number): string;

  clearHostportsList(): void;
  getHostportsList(): Array<string>;
  setHostportsList(value: Array<string>): void;
  addHostports(value: string, index?: number): string;

  getServerid(): string;
  setServerid(value: string): void;

  getWaitinsec(): number;
  setWaitinsec(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Redirect.AsObject;
  static toObject(includeInstance: boolean, msg: Redirect): Redirect.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Redirect, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Redirect;
  static deserializeBinaryFromReader(message: Redirect, reader: jspb.BinaryReader): Redirect;
}

export namespace Redirect {
  export type AsObject = {
    leaderhostportList: Array<string>,
    hostportsList: Array<string>,
    serverid: string,
    waitinsec: number,
  }
}

export class KeyValue extends jspb.Message {
  getKey(): string;
  setKey(value: string): void;

  getValue(): string;
  setValue(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyValue.AsObject;
  static toObject(includeInstance: boolean, msg: KeyValue): KeyValue.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: KeyValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyValue;
  static deserializeBinaryFromReader(message: KeyValue, reader: jspb.BinaryReader): KeyValue;
}

export namespace KeyValue {
  export type AsObject = {
    key: string,
    value: string,
  }
}

