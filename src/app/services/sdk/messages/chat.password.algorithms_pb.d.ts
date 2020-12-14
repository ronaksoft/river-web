/* tslint:disable */
// package: msg
// file: chat.password.algorithms.proto

import * as jspb from "google-protobuf";

export class PasswordAlgorithmVer6A extends jspb.Message {
  getSalt1(): Uint8Array | string;
  getSalt1_asU8(): Uint8Array;
  getSalt1_asB64(): string;
  setSalt1(value: Uint8Array | string): void;

  getSalt2(): Uint8Array | string;
  getSalt2_asU8(): Uint8Array;
  getSalt2_asB64(): string;
  setSalt2(value: Uint8Array | string): void;

  getG(): number;
  setG(value: number): void;

  getP(): Uint8Array | string;
  getP_asU8(): Uint8Array;
  getP_asB64(): string;
  setP(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PasswordAlgorithmVer6A.AsObject;
  static toObject(includeInstance: boolean, msg: PasswordAlgorithmVer6A): PasswordAlgorithmVer6A.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PasswordAlgorithmVer6A, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PasswordAlgorithmVer6A;
  static deserializeBinaryFromReader(message: PasswordAlgorithmVer6A, reader: jspb.BinaryReader): PasswordAlgorithmVer6A;
}

export namespace PasswordAlgorithmVer6A {
  export type AsObject = {
    salt1: Uint8Array | string,
    salt2: Uint8Array | string,
    g: number,
    p: Uint8Array | string,
  }
}

