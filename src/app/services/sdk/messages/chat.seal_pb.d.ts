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
// file: chat.seal.proto

import * as jspb from "google-protobuf";

export class SealSetPubKey extends jspb.Message {
  hasKey(): boolean;
  clearKey(): void;
  getKey(): Uint8Array | string;
  getKey_asU8(): Uint8Array;
  getKey_asB64(): string;
  setKey(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SealSetPubKey.AsObject;
  static toObject(includeInstance: boolean, msg: SealSetPubKey): SealSetPubKey.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SealSetPubKey, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SealSetPubKey;
  static deserializeBinaryFromReader(message: SealSetPubKey, reader: jspb.BinaryReader): SealSetPubKey;
}

export namespace SealSetPubKey {
  export type AsObject = {
    key: Uint8Array | string,
  }
}

