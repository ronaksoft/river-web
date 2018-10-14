// package: msg
// file: api.system.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

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

export class SystemClientLog extends jspb.Message {
  hasDeviceid(): boolean;
  clearDeviceid(): void;
  getDeviceid(): string | undefined;
  setDeviceid(value: string): void;

  hasDeviceos(): boolean;
  clearDeviceos(): void;
  getDeviceos(): string | undefined;
  setDeviceos(value: string): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasText(): boolean;
  clearText(): void;
  getText(): string | undefined;
  setText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemClientLog.AsObject;
  static toObject(includeInstance: boolean, msg: SystemClientLog): SystemClientLog.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemClientLog, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemClientLog;
  static deserializeBinaryFromReader(message: SystemClientLog, reader: jspb.BinaryReader): SystemClientLog;
}

export namespace SystemClientLog {
  export type AsObject = {
    deviceid?: string,
    deviceos?: string,
    userid?: string,
    text?: string,
  }
}

export class SystemPublicKeys extends jspb.Message {
  clearRsapublickeysList(): void;
  getRsapublickeysList(): Array<core_types_pb.RSAPublicKey>;
  setRsapublickeysList(value: Array<core_types_pb.RSAPublicKey>): void;
  addRsapublickeys(value?: core_types_pb.RSAPublicKey, index?: number): core_types_pb.RSAPublicKey;

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
    rsapublickeysList: Array<core_types_pb.RSAPublicKey.AsObject>,
  }
}

export class SystemDHGroups extends jspb.Message {
  clearDhgroupsList(): void;
  getDhgroupsList(): Array<core_types_pb.DHGroup>;
  setDhgroupsList(value: Array<core_types_pb.DHGroup>): void;
  addDhgroups(value?: core_types_pb.DHGroup, index?: number): core_types_pb.DHGroup;

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
    dhgroupsList: Array<core_types_pb.DHGroup.AsObject>,
  }
}

