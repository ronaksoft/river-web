/* tslint:disable */
// package: msg
// file: chat.api.dev.proto

import * as jspb from "google-protobuf";

export class EchoWithDelay extends jspb.Message {
  hasDelayinseconds(): boolean;
  clearDelayinseconds(): void;
  getDelayinseconds(): number | undefined;
  setDelayinseconds(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EchoWithDelay.AsObject;
  static toObject(includeInstance: boolean, msg: EchoWithDelay): EchoWithDelay.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EchoWithDelay, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EchoWithDelay;
  static deserializeBinaryFromReader(message: EchoWithDelay, reader: jspb.BinaryReader): EchoWithDelay;
}

export namespace EchoWithDelay {
  export type AsObject = {
    delayinseconds?: number,
  }
}

export class TestRequest extends jspb.Message {
  hasPayload(): boolean;
  clearPayload(): void;
  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): void;

  hasHash(): boolean;
  clearHash(): void;
  getHash(): Uint8Array | string;
  getHash_asU8(): Uint8Array;
  getHash_asB64(): string;
  setHash(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TestRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TestRequest): TestRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TestRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TestRequest;
  static deserializeBinaryFromReader(message: TestRequest, reader: jspb.BinaryReader): TestRequest;
}

export namespace TestRequest {
  export type AsObject = {
    payload: Uint8Array | string,
    hash: Uint8Array | string,
  }
}

export class TestResponse extends jspb.Message {
  hasLength(): boolean;
  clearLength(): void;
  getLength(): number | undefined;
  setLength(value: number): void;

  hasHash(): boolean;
  clearHash(): void;
  getHash(): Uint8Array | string;
  getHash_asU8(): Uint8Array;
  getHash_asB64(): string;
  setHash(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TestResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TestResponse): TestResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TestResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TestResponse;
  static deserializeBinaryFromReader(message: TestResponse, reader: jspb.BinaryReader): TestResponse;
}

export namespace TestResponse {
  export type AsObject = {
    length?: number,
    hash: Uint8Array | string,
  }
}

