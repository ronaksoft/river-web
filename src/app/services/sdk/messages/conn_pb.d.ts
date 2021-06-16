/* tslint:disable */
// package: msg
// file: conn.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class PublicKey extends jspb.Message {
  getN(): string;
  setN(value: string): void;

  getFingerprint(): string;
  setFingerprint(value: string): void;

  getE(): number;
  setE(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PublicKey.AsObject;
  static toObject(includeInstance: boolean, msg: PublicKey): PublicKey.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PublicKey, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PublicKey;
  static deserializeBinaryFromReader(message: PublicKey, reader: jspb.BinaryReader): PublicKey;
}

export namespace PublicKey {
  export type AsObject = {
    n: string,
    fingerprint: string,
    e: number,
  }
}

export class ServerKeys extends jspb.Message {
  clearPublickeysList(): void;
  getPublickeysList(): Array<PublicKey>;
  setPublickeysList(value: Array<PublicKey>): void;
  addPublickeys(value?: PublicKey, index?: number): PublicKey;

  clearDhgroupsList(): void;
  getDhgroupsList(): Array<core_types_pb.DHGroup>;
  setDhgroupsList(value: Array<core_types_pb.DHGroup>): void;
  addDhgroups(value?: core_types_pb.DHGroup, index?: number): core_types_pb.DHGroup;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerKeys.AsObject;
  static toObject(includeInstance: boolean, msg: ServerKeys): ServerKeys.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerKeys, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerKeys;
  static deserializeBinaryFromReader(message: ServerKeys, reader: jspb.BinaryReader): ServerKeys;
}

export namespace ServerKeys {
  export type AsObject = {
    publickeysList: Array<PublicKey.AsObject>,
    dhgroupsList: Array<core_types_pb.DHGroup.AsObject>,
  }
}

export class RiverConnection extends jspb.Message {
  getAuthid(): string;
  setAuthid(value: string): void;

  getAuthkey(): Uint8Array | string;
  getAuthkey_asU8(): Uint8Array;
  getAuthkey_asB64(): string;
  setAuthkey(value: Uint8Array | string): void;

  getUserid(): string;
  setUserid(value: string): void;

  getUsername(): string;
  setUsername(value: string): void;

  getPhone(): string;
  setPhone(value: string): void;

  getFirstname(): string;
  setFirstname(value: string): void;

  getLastname(): string;
  setLastname(value: string): void;

  getDifftime(): number;
  setDifftime(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RiverConnection.AsObject;
  static toObject(includeInstance: boolean, msg: RiverConnection): RiverConnection.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RiverConnection, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RiverConnection;
  static deserializeBinaryFromReader(message: RiverConnection, reader: jspb.BinaryReader): RiverConnection;
}

export namespace RiverConnection {
  export type AsObject = {
    authid: string,
    authkey: Uint8Array | string,
    userid: string,
    username: string,
    phone: string,
    firstname: string,
    lastname: string,
    difftime: number,
  }
}

