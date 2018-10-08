// package: msg
// file: api.files.proto

import * as jspb from "google-protobuf";

export class FileSavePart extends jspb.Message {
  hasFileid(): boolean;
  clearFileid(): void;
  getFileid(): number | undefined;
  setFileid(value: number): void;

  hasPartid(): boolean;
  clearPartid(): void;
  getPartid(): number | undefined;
  setPartid(value: number): void;

  hasTotalparts(): boolean;
  clearTotalparts(): void;
  getTotalparts(): number | undefined;
  setTotalparts(value: number): void;

  hasBytes(): boolean;
  clearBytes(): void;
  getBytes(): Uint8Array | string;
  getBytes_asU8(): Uint8Array;
  getBytes_asB64(): string;
  setBytes(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FileSavePart.AsObject;
  static toObject(includeInstance: boolean, msg: FileSavePart): FileSavePart.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FileSavePart, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FileSavePart;
  static deserializeBinaryFromReader(message: FileSavePart, reader: jspb.BinaryReader): FileSavePart;
}

export namespace FileSavePart {
  export type AsObject = {
    fileid?: number,
    partid?: number,
    totalparts?: number,
    bytes: Uint8Array | string,
  }
}

export class FileGet extends jspb.Message {
  hasLocation(): boolean;
  clearLocation(): void;
  getLocation(): FileLocation;
  setLocation(value?: FileLocation): void;

  hasOffset(): boolean;
  clearOffset(): void;
  getOffset(): number | undefined;
  setOffset(value: number): void;

  hasLimit(): boolean;
  clearLimit(): void;
  getLimit(): number | undefined;
  setLimit(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FileGet.AsObject;
  static toObject(includeInstance: boolean, msg: FileGet): FileGet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FileGet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FileGet;
  static deserializeBinaryFromReader(message: FileGet, reader: jspb.BinaryReader): FileGet;
}

export namespace FileGet {
  export type AsObject = {
    location: FileLocation.AsObject,
    offset?: number,
    limit?: number,
  }
}

export class FileLocation extends jspb.Message {
  hasPartitionid(): boolean;
  clearPartitionid(): void;
  getPartitionid(): number | undefined;
  setPartitionid(value: number): void;

  hasFileid(): boolean;
  clearFileid(): void;
  getFileid(): number | undefined;
  setFileid(value: number): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): number | undefined;
  setAccesshash(value: number): void;

  hasTotalparts(): boolean;
  clearTotalparts(): void;
  getTotalparts(): number | undefined;
  setTotalparts(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FileLocation.AsObject;
  static toObject(includeInstance: boolean, msg: FileLocation): FileLocation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FileLocation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FileLocation;
  static deserializeBinaryFromReader(message: FileLocation, reader: jspb.BinaryReader): FileLocation;
}

export namespace FileLocation {
  export type AsObject = {
    partitionid?: number,
    fileid?: number,
    accesshash?: number,
    totalparts?: number,
  }
}

export class File extends jspb.Message {
  hasType(): boolean;
  clearType(): void;
  getType(): FileType | undefined;
  setType(value: FileType): void;

  hasModifiedtime(): boolean;
  clearModifiedtime(): void;
  getModifiedtime(): number | undefined;
  setModifiedtime(value: number): void;

  hasBytes(): boolean;
  clearBytes(): void;
  getBytes(): Uint8Array | string;
  getBytes_asU8(): Uint8Array;
  getBytes_asB64(): string;
  setBytes(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): File.AsObject;
  static toObject(includeInstance: boolean, msg: File): File.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: File, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): File;
  static deserializeBinaryFromReader(message: File, reader: jspb.BinaryReader): File;
}

export namespace File {
  export type AsObject = {
    type?: FileType,
    modifiedtime?: number,
    bytes: Uint8Array | string,
  }
}

export enum FileType {
  UNKNOWN = 0,
  PARTIAL = 1,
  JPEG = 2,
  GIF = 3,
  PNG = 4,
  WEBP = 5,
  MP3 = 6,
  MP4 = 7,
  MOV = 8,
}

