/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
// package: msg
// file: dev.proto

import * as jspb from "google-protobuf";

export class EchoWithDelay extends jspb.Message {
  getDelayinseconds(): number;
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
    delayinseconds: number,
  }
}

export class TestRequest extends jspb.Message {
  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): void;

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
    hash: Uint8Array | string,
  }
}

export class TestRequestWithString extends jspb.Message {
  getPayload(): string;
  setPayload(value: string): void;

  getHash(): string;
  setHash(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TestRequestWithString.AsObject;
  static toObject(includeInstance: boolean, msg: TestRequestWithString): TestRequestWithString.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TestRequestWithString, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TestRequestWithString;
  static deserializeBinaryFromReader(message: TestRequestWithString, reader: jspb.BinaryReader): TestRequestWithString;
}

export namespace TestRequestWithString {
  export type AsObject = {
    payload: string,
    hash: string,
  }
}

export class TestResponseWithString extends jspb.Message {
  getHash(): Uint8Array | string;
  getHash_asU8(): Uint8Array;
  getHash_asB64(): string;
  setHash(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TestResponseWithString.AsObject;
  static toObject(includeInstance: boolean, msg: TestResponseWithString): TestResponseWithString.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TestResponseWithString, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TestResponseWithString;
  static deserializeBinaryFromReader(message: TestResponseWithString, reader: jspb.BinaryReader): TestResponseWithString;
}

export namespace TestResponseWithString {
  export type AsObject = {
    hash: Uint8Array | string,
  }
}

