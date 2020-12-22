/* tslint:disable */
// package: msg
// file: files.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class FileSavePart extends jspb.Message {
  getFileid(): string;
  setFileid(value: string): void;

  getPartid(): number;
  setPartid(value: number): void;

  getTotalparts(): number;
  setTotalparts(value: number): void;

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
    fileid: string,
    partid: number,
    totalparts: number,
    bytes: Uint8Array | string,
  }
}

export class FileGet extends jspb.Message {
  hasLocation(): boolean;
  clearLocation(): void;
  getLocation(): core_types_pb.InputFileLocation | undefined;
  setLocation(value?: core_types_pb.InputFileLocation): void;

  getOffset(): number;
  setOffset(value: number): void;

  getLimit(): number;
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
    location?: core_types_pb.InputFileLocation.AsObject,
    offset: number,
    limit: number,
  }
}

export class FileGetBySha256 extends jspb.Message {
  getSha256(): Uint8Array | string;
  getSha256_asU8(): Uint8Array;
  getSha256_asB64(): string;
  setSha256(value: Uint8Array | string): void;

  getFilesize(): number;
  setFilesize(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FileGetBySha256.AsObject;
  static toObject(includeInstance: boolean, msg: FileGetBySha256): FileGetBySha256.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FileGetBySha256, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FileGetBySha256;
  static deserializeBinaryFromReader(message: FileGetBySha256, reader: jspb.BinaryReader): FileGetBySha256;
}

export namespace FileGetBySha256 {
  export type AsObject = {
    sha256: Uint8Array | string,
    filesize: number,
  }
}

export class File extends jspb.Message {
  getType(): FileType;
  setType(value: FileType): void;

  getModifiedtime(): number;
  setModifiedtime(value: number): void;

  getBytes(): Uint8Array | string;
  getBytes_asU8(): Uint8Array;
  getBytes_asB64(): string;
  setBytes(value: Uint8Array | string): void;

  getMd5hash(): string;
  setMd5hash(value: string): void;

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
    type: FileType,
    modifiedtime: number,
    bytes: Uint8Array | string,
    md5hash: string,
  }
}

export enum FileType {
  FILETYPEUNKNOWN = 0,
  FILETYPEPARTIAL = 1,
  FILETYPEJPEG = 2,
  FILETYPEGIF = 3,
  FILETYPEPNG = 4,
  FILETYPEWEBP = 5,
  FILETYPEMP3 = 6,
  FILETYPEMP4 = 7,
  FILETYPEMOV = 8,
}

