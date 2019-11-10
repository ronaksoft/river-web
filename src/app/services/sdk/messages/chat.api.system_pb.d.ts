/* tslint:disable */
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

export class SystemGetAppUpdate extends jspb.Message {
  hasClienttype(): boolean;
  clearClienttype(): void;
  getClienttype(): string | undefined;
  setClienttype(value: string): void;

  hasVersion(): boolean;
  clearVersion(): void;
  getVersion(): number | undefined;
  setVersion(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetAppUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetAppUpdate): SystemGetAppUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetAppUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetAppUpdate;
  static deserializeBinaryFromReader(message: SystemGetAppUpdate, reader: jspb.BinaryReader): SystemGetAppUpdate;
}

export namespace SystemGetAppUpdate {
  export type AsObject = {
    clienttype?: string,
    version?: number,
  }
}

export class SystemGetInfo extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetInfo.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetInfo): SystemGetInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetInfo;
  static deserializeBinaryFromReader(message: SystemGetInfo, reader: jspb.BinaryReader): SystemGetInfo;
}

export namespace SystemGetInfo {
  export type AsObject = {
  }
}

export class SystemGetSalts extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetSalts.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetSalts): SystemGetSalts.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetSalts, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetSalts;
  static deserializeBinaryFromReader(message: SystemGetSalts, reader: jspb.BinaryReader): SystemGetSalts;
}

export namespace SystemGetSalts {
  export type AsObject = {
  }
}

export class SystemSalts extends jspb.Message {
  clearSaltsList(): void;
  getSaltsList(): Array<number>;
  setSaltsList(value: Array<number>): void;
  addSalts(value: number, index?: number): number;

  hasStartsfrom(): boolean;
  clearStartsfrom(): void;
  getStartsfrom(): number | undefined;
  setStartsfrom(value: number): void;

  hasDuration(): boolean;
  clearDuration(): void;
  getDuration(): number | undefined;
  setDuration(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemSalts.AsObject;
  static toObject(includeInstance: boolean, msg: SystemSalts): SystemSalts.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemSalts, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemSalts;
  static deserializeBinaryFromReader(message: SystemSalts, reader: jspb.BinaryReader): SystemSalts;
}

export namespace SystemSalts {
  export type AsObject = {
    saltsList: Array<number>,
    startsfrom?: number,
    duration?: number,
  }
}

export class AppUpdate extends jspb.Message {
  hasAvailable(): boolean;
  clearAvailable(): void;
  getAvailable(): boolean | undefined;
  setAvailable(value: boolean): void;

  hasMandatory(): boolean;
  clearMandatory(): void;
  getMandatory(): boolean | undefined;
  setMandatory(value: boolean): void;

  hasIdentifier(): boolean;
  clearIdentifier(): void;
  getIdentifier(): string | undefined;
  setIdentifier(value: string): void;

  hasVersionname(): boolean;
  clearVersionname(): void;
  getVersionname(): string | undefined;
  setVersionname(value: string): void;

  hasDownloadurl(): boolean;
  clearDownloadurl(): void;
  getDownloadurl(): string | undefined;
  setDownloadurl(value: string): void;

  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): string | undefined;
  setDescription(value: string): void;

  hasDisplayinterval(): boolean;
  clearDisplayinterval(): void;
  getDisplayinterval(): number | undefined;
  setDisplayinterval(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: AppUpdate): AppUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AppUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppUpdate;
  static deserializeBinaryFromReader(message: AppUpdate, reader: jspb.BinaryReader): AppUpdate;
}

export namespace AppUpdate {
  export type AsObject = {
    available?: boolean,
    mandatory?: boolean,
    identifier?: string,
    versionname?: string,
    downloadurl?: string,
    description?: string,
    displayinterval?: number,
  }
}

export class SystemInfo extends jspb.Message {
  hasWorkgroupname(): boolean;
  clearWorkgroupname(): void;
  getWorkgroupname(): string | undefined;
  setWorkgroupname(value: string): void;

  hasBigphotourl(): boolean;
  clearBigphotourl(): void;
  getBigphotourl(): string | undefined;
  setBigphotourl(value: string): void;

  hasSmallphotourl(): boolean;
  clearSmallphotourl(): void;
  getSmallphotourl(): string | undefined;
  setSmallphotourl(value: string): void;

  hasStorageurl(): boolean;
  clearStorageurl(): void;
  getStorageurl(): string | undefined;
  setStorageurl(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemInfo.AsObject;
  static toObject(includeInstance: boolean, msg: SystemInfo): SystemInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemInfo;
  static deserializeBinaryFromReader(message: SystemInfo, reader: jspb.BinaryReader): SystemInfo;
}

export namespace SystemInfo {
  export type AsObject = {
    workgroupname?: string,
    bigphotourl?: string,
    smallphotourl?: string,
    storageurl?: string,
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

