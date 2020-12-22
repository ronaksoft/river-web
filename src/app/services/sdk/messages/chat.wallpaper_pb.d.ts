/* tslint:disable */
// package: msg
// file: chat.wallpaper.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";
import * as chat_messages_medias_pb from "./chat.messages.medias_pb";

export class WallPaperGet extends jspb.Message {
  getCrc32hash(): number;
  setCrc32hash(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WallPaperGet.AsObject;
  static toObject(includeInstance: boolean, msg: WallPaperGet): WallPaperGet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WallPaperGet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WallPaperGet;
  static deserializeBinaryFromReader(message: WallPaperGet, reader: jspb.BinaryReader): WallPaperGet;
}

export namespace WallPaperGet {
  export type AsObject = {
    crc32hash: number,
  }
}

export class WallPaperSave extends jspb.Message {
  hasWallpaper(): boolean;
  clearWallpaper(): void;
  getWallpaper(): InputWallPaper | undefined;
  setWallpaper(value?: InputWallPaper): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): WallPaperSettings | undefined;
  setSettings(value?: WallPaperSettings): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WallPaperSave.AsObject;
  static toObject(includeInstance: boolean, msg: WallPaperSave): WallPaperSave.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WallPaperSave, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WallPaperSave;
  static deserializeBinaryFromReader(message: WallPaperSave, reader: jspb.BinaryReader): WallPaperSave;
}

export namespace WallPaperSave {
  export type AsObject = {
    wallpaper?: InputWallPaper.AsObject,
    settings?: WallPaperSettings.AsObject,
  }
}

export class WallPaperDelete extends jspb.Message {
  hasWallpaper(): boolean;
  clearWallpaper(): void;
  getWallpaper(): InputWallPaper | undefined;
  setWallpaper(value?: InputWallPaper): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WallPaperDelete.AsObject;
  static toObject(includeInstance: boolean, msg: WallPaperDelete): WallPaperDelete.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WallPaperDelete, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WallPaperDelete;
  static deserializeBinaryFromReader(message: WallPaperDelete, reader: jspb.BinaryReader): WallPaperDelete;
}

export namespace WallPaperDelete {
  export type AsObject = {
    wallpaper?: InputWallPaper.AsObject,
  }
}

export class WallPaperUpload extends jspb.Message {
  hasUploadedfile(): boolean;
  clearUploadedfile(): void;
  getUploadedfile(): core_types_pb.InputFile | undefined;
  setUploadedfile(value?: core_types_pb.InputFile): void;

  hasFile(): boolean;
  clearFile(): void;
  getFile(): core_types_pb.InputDocument | undefined;
  setFile(value?: core_types_pb.InputDocument): void;

  getMimetype(): string;
  setMimetype(value: string): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): WallPaperSettings | undefined;
  setSettings(value?: WallPaperSettings): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WallPaperUpload.AsObject;
  static toObject(includeInstance: boolean, msg: WallPaperUpload): WallPaperUpload.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WallPaperUpload, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WallPaperUpload;
  static deserializeBinaryFromReader(message: WallPaperUpload, reader: jspb.BinaryReader): WallPaperUpload;
}

export namespace WallPaperUpload {
  export type AsObject = {
    uploadedfile?: core_types_pb.InputFile.AsObject,
    file?: core_types_pb.InputDocument.AsObject,
    mimetype: string,
    settings?: WallPaperSettings.AsObject,
  }
}

export class WallPaperReset extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WallPaperReset.AsObject;
  static toObject(includeInstance: boolean, msg: WallPaperReset): WallPaperReset.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WallPaperReset, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WallPaperReset;
  static deserializeBinaryFromReader(message: WallPaperReset, reader: jspb.BinaryReader): WallPaperReset;
}

export namespace WallPaperReset {
  export type AsObject = {
  }
}

export class InputWallPaper extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getAccesshash(): number;
  setAccesshash(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputWallPaper.AsObject;
  static toObject(includeInstance: boolean, msg: InputWallPaper): InputWallPaper.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputWallPaper, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputWallPaper;
  static deserializeBinaryFromReader(message: InputWallPaper, reader: jspb.BinaryReader): InputWallPaper;
}

export namespace InputWallPaper {
  export type AsObject = {
    id: number,
    accesshash: number,
  }
}

export class WallPaperSettings extends jspb.Message {
  getBlur(): boolean;
  setBlur(value: boolean): void;

  getMotion(): boolean;
  setMotion(value: boolean): void;

  getBackgroundcolour(): number;
  setBackgroundcolour(value: number): void;

  getBackgroundsecondcolour(): number;
  setBackgroundsecondcolour(value: number): void;

  getOpacity(): number;
  setOpacity(value: number): void;

  getRotation(): number;
  setRotation(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WallPaperSettings.AsObject;
  static toObject(includeInstance: boolean, msg: WallPaperSettings): WallPaperSettings.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WallPaperSettings, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WallPaperSettings;
  static deserializeBinaryFromReader(message: WallPaperSettings, reader: jspb.BinaryReader): WallPaperSettings;
}

export namespace WallPaperSettings {
  export type AsObject = {
    blur: boolean,
    motion: boolean,
    backgroundcolour: number,
    backgroundsecondcolour: number,
    opacity: number,
    rotation: number,
  }
}

export class WallPaper extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getAccesshash(): number;
  setAccesshash(value: number): void;

  getCreator(): boolean;
  setCreator(value: boolean): void;

  getDefault(): boolean;
  setDefault(value: boolean): void;

  getPattern(): boolean;
  setPattern(value: boolean): void;

  getDark(): boolean;
  setDark(value: boolean): void;

  hasDocument(): boolean;
  clearDocument(): void;
  getDocument(): chat_messages_medias_pb.Document | undefined;
  setDocument(value?: chat_messages_medias_pb.Document): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): WallPaperSettings | undefined;
  setSettings(value?: WallPaperSettings): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WallPaper.AsObject;
  static toObject(includeInstance: boolean, msg: WallPaper): WallPaper.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WallPaper, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WallPaper;
  static deserializeBinaryFromReader(message: WallPaper, reader: jspb.BinaryReader): WallPaper;
}

export namespace WallPaper {
  export type AsObject = {
    id: number,
    accesshash: number,
    creator: boolean,
    pb_default: boolean,
    pattern: boolean,
    dark: boolean,
    document?: chat_messages_medias_pb.Document.AsObject,
    settings?: WallPaperSettings.AsObject,
  }
}

export class WallPapersMany extends jspb.Message {
  clearWallpapersList(): void;
  getWallpapersList(): Array<WallPaper>;
  setWallpapersList(value: Array<WallPaper>): void;
  addWallpapers(value?: WallPaper, index?: number): WallPaper;

  getCount(): number;
  setCount(value: number): void;

  getCrc32hash(): number;
  setCrc32hash(value: number): void;

  getEmpty(): boolean;
  setEmpty(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WallPapersMany.AsObject;
  static toObject(includeInstance: boolean, msg: WallPapersMany): WallPapersMany.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WallPapersMany, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WallPapersMany;
  static deserializeBinaryFromReader(message: WallPapersMany, reader: jspb.BinaryReader): WallPapersMany;
}

export namespace WallPapersMany {
  export type AsObject = {
    wallpapersList: Array<WallPaper.AsObject>,
    count: number,
    crc32hash: number,
    empty: boolean,
  }
}

