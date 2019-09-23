// package: msg
// file: chat.api.music.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";
import * as chat_core_message_medias_pb from "./chat.core.message.medias_pb";

export class MusicsGet extends jspb.Message {
  hasPlaylistid(): boolean;
  clearPlaylistid(): void;
  getPlaylistid(): number | undefined;
  setPlaylistid(value: number): void;

  hasIndex(): boolean;
  clearIndex(): void;
  getIndex(): number | undefined;
  setIndex(value: number): void;

  hasFile(): boolean;
  clearFile(): void;
  getFile(): chat_core_types_pb.FileLocation | undefined;
  setFile(value?: chat_core_types_pb.FileLocation): void;

  hasAttribute(): boolean;
  clearAttribute(): void;
  getAttribute(): chat_core_message_medias_pb.DocumentAttributeAudio | undefined;
  setAttribute(value?: chat_core_message_medias_pb.DocumentAttributeAudio): void;

  hasThumbnail(): boolean;
  clearThumbnail(): void;
  getThumbnail(): chat_core_types_pb.FileLocation | undefined;
  setThumbnail(value?: chat_core_types_pb.FileLocation): void;

  hasMd5checksum(): boolean;
  clearMd5checksum(): void;
  getMd5checksum(): string | undefined;
  setMd5checksum(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MusicsGet.AsObject;
  static toObject(includeInstance: boolean, msg: MusicsGet): MusicsGet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MusicsGet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MusicsGet;
  static deserializeBinaryFromReader(message: MusicsGet, reader: jspb.BinaryReader): MusicsGet;
}

export namespace MusicsGet {
  export type AsObject = {
    playlistid?: number,
    index?: number,
    file?: chat_core_types_pb.FileLocation.AsObject,
    attribute?: chat_core_message_medias_pb.DocumentAttributeAudio.AsObject,
    thumbnail?: chat_core_types_pb.FileLocation.AsObject,
    md5checksum?: string,
  }
}

export class MusicsAdd extends jspb.Message {
  hasPlaylistid(): boolean;
  clearPlaylistid(): void;
  getPlaylistid(): number | undefined;
  setPlaylistid(value: number): void;

  hasIndex(): boolean;
  clearIndex(): void;
  getIndex(): number | undefined;
  setIndex(value: number): void;

  hasFile(): boolean;
  clearFile(): void;
  getFile(): chat_core_types_pb.InputFileLocation;
  setFile(value?: chat_core_types_pb.InputFileLocation): void;

  hasThumbnail(): boolean;
  clearThumbnail(): void;
  getThumbnail(): chat_core_types_pb.InputFileLocation | undefined;
  setThumbnail(value?: chat_core_types_pb.InputFileLocation): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MusicsAdd.AsObject;
  static toObject(includeInstance: boolean, msg: MusicsAdd): MusicsAdd.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MusicsAdd, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MusicsAdd;
  static deserializeBinaryFromReader(message: MusicsAdd, reader: jspb.BinaryReader): MusicsAdd;
}

export namespace MusicsAdd {
  export type AsObject = {
    playlistid?: number,
    index?: number,
    file: chat_core_types_pb.InputFileLocation.AsObject,
    thumbnail?: chat_core_types_pb.InputFileLocation.AsObject,
  }
}

export class MusicsRemove extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MusicsRemove.AsObject;
  static toObject(includeInstance: boolean, msg: MusicsRemove): MusicsRemove.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MusicsRemove, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MusicsRemove;
  static deserializeBinaryFromReader(message: MusicsRemove, reader: jspb.BinaryReader): MusicsRemove;
}

export namespace MusicsRemove {
  export type AsObject = {
  }
}

export class MusicsSetStatus extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MusicsSetStatus.AsObject;
  static toObject(includeInstance: boolean, msg: MusicsSetStatus): MusicsSetStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MusicsSetStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MusicsSetStatus;
  static deserializeBinaryFromReader(message: MusicsSetStatus, reader: jspb.BinaryReader): MusicsSetStatus;
}

export namespace MusicsSetStatus {
  export type AsObject = {
  }
}

export class MusicsFollow extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MusicsFollow.AsObject;
  static toObject(includeInstance: boolean, msg: MusicsFollow): MusicsFollow.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MusicsFollow, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MusicsFollow;
  static deserializeBinaryFromReader(message: MusicsFollow, reader: jspb.BinaryReader): MusicsFollow;
}

export namespace MusicsFollow {
  export type AsObject = {
  }
}

export class MusicsUnFollow extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MusicsUnFollow.AsObject;
  static toObject(includeInstance: boolean, msg: MusicsUnFollow): MusicsUnFollow.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MusicsUnFollow, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MusicsUnFollow;
  static deserializeBinaryFromReader(message: MusicsUnFollow, reader: jspb.BinaryReader): MusicsUnFollow;
}

export namespace MusicsUnFollow {
  export type AsObject = {
  }
}

