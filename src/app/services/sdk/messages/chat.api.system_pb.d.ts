// package: msg
// file: chat.api.system.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";

export class SystemGetPublicKeys extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetPublicKeys.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetPublicKeys): SystemGetPublicKeys.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetPublicKeys, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetPublicKeys;
  static deserializeBinaryFromReader(message: SystemGetPublicKeys, reader: jspb.BinaryReader): SystemGetPublicKeys;
}

export namespace SystemGetPublicKeys {
  export type AsObject = {
  }
}

export class SystemGetDHGroups extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetDHGroups.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetDHGroups): SystemGetDHGroups.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetDHGroups, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetDHGroups;
  static deserializeBinaryFromReader(message: SystemGetDHGroups, reader: jspb.BinaryReader): SystemGetDHGroups;
}

export namespace SystemGetDHGroups {
  export type AsObject = {
  }
}

export class SystemGetServerTime extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetServerTime.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetServerTime): SystemGetServerTime.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetServerTime, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetServerTime;
  static deserializeBinaryFromReader(message: SystemGetServerTime, reader: jspb.BinaryReader): SystemGetServerTime;
}

export namespace SystemGetServerTime {
  export type AsObject = {
  }
}

export class SystemServerTime extends jspb.Message {
  hasTimestamp(): boolean;
  clearTimestamp(): void;
  getTimestamp(): number | undefined;
  setTimestamp(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemServerTime.AsObject;
  static toObject(includeInstance: boolean, msg: SystemServerTime): SystemServerTime.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemServerTime, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemServerTime;
  static deserializeBinaryFromReader(message: SystemServerTime, reader: jspb.BinaryReader): SystemServerTime;
}

export namespace SystemServerTime {
  export type AsObject = {
    timestamp?: number,
  }
}

export class SystemPublicKeys extends jspb.Message {
  clearRsapublickeysList(): void;
  getRsapublickeysList(): Array<chat_core_types_pb.RSAPublicKey>;
  setRsapublickeysList(value: Array<chat_core_types_pb.RSAPublicKey>): void;
  addRsapublickeys(value?: chat_core_types_pb.RSAPublicKey, index?: number): chat_core_types_pb.RSAPublicKey;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemPublicKeys.AsObject;
  static toObject(includeInstance: boolean, msg: SystemPublicKeys): SystemPublicKeys.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemPublicKeys, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemPublicKeys;
  static deserializeBinaryFromReader(message: SystemPublicKeys, reader: jspb.BinaryReader): SystemPublicKeys;
}

export namespace SystemPublicKeys {
  export type AsObject = {
    rsapublickeysList: Array<chat_core_types_pb.RSAPublicKey.AsObject>,
  }
}

export class SystemDHGroups extends jspb.Message {
  clearDhgroupsList(): void;
  getDhgroupsList(): Array<chat_core_types_pb.DHGroup>;
  setDhgroupsList(value: Array<chat_core_types_pb.DHGroup>): void;
  addDhgroups(value?: chat_core_types_pb.DHGroup, index?: number): chat_core_types_pb.DHGroup;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemDHGroups.AsObject;
  static toObject(includeInstance: boolean, msg: SystemDHGroups): SystemDHGroups.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemDHGroups, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemDHGroups;
  static deserializeBinaryFromReader(message: SystemDHGroups, reader: jspb.BinaryReader): SystemDHGroups;
}

export namespace SystemDHGroups {
  export type AsObject = {
    dhgroupsList: Array<chat_core_types_pb.DHGroup.AsObject>,
  }
}

