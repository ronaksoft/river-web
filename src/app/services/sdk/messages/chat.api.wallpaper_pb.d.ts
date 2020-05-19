/* tslint:disable */
// package: msg
// file: chat.api.wallpaper.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";
import * as chat_core_message_medias_pb from "./chat.core.message.medias_pb";

export class WallPaperGet extends jspb.Message {
  hasCrc32hash(): boolean;
  clearCrc32hash(): void;
  getCrc32hash(): number | undefined;
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
    crc32hash?: number,
  }
}

export class WallPaperSave extends jspb.Message {
  hasWallpaper(): boolean;
  clearWallpaper(): void;
  getWallpaper(): InputWallPaper;
  setWallpaper(value?: InputWallPaper): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): WallPaperSettings;
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
    wallpaper: InputWallPaper.AsObject,
    settings: WallPaperSettings.AsObject,
  }
}

export class WallPaperDelete extends jspb.Message {
  hasWallpaper(): boolean;
  clearWallpaper(): void;
  getWallpaper(): InputWallPaper;
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
    wallpaper: InputWallPaper.AsObject,
  }
}

export class WallPaperUpload extends jspb.Message {
  hasFile(): boolean;
  clearFile(): void;
  getFile(): chat_core_types_pb.InputFile;
  setFile(value?: chat_core_types_pb.InputFile): void;

  hasMimetype(): boolean;
  clearMimetype(): void;
  getMimetype(): string | undefined;
  setMimetype(value: string): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): WallPaperSettings;
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
    file: chat_core_types_pb.InputFile.AsObject,
    mimetype?: string,
    settings: WallPaperSettings.AsObject,
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
  hasClusterid(): boolean;
  clearClusterid(): void;
  getClusterid(): number | undefined;
  setClusterid(value: number): void;

  hasId(): boolean;
  clearId(): void;
  getId(): number | undefined;
  setId(value: number): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): number | undefined;
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
    clusterid?: number,
    id?: number,
    accesshash?: number,
  }
}

export class WallPaperSettings extends jspb.Message {
  hasBlur(): boolean;
  clearBlur(): void;
  getBlur(): boolean | undefined;
  setBlur(value: boolean): void;

  hasMotion(): boolean;
  clearMotion(): void;
  getMotion(): boolean | undefined;
  setMotion(value: boolean): void;

  hasBackgroundcolour(): boolean;
  clearBackgroundcolour(): void;
  getBackgroundcolour(): number | undefined;
  setBackgroundcolour(value: number): void;

  hasBackgroundsecondcolour(): boolean;
  clearBackgroundsecondcolour(): void;
  getBackgroundsecondcolour(): number | undefined;
  setBackgroundsecondcolour(value: number): void;

  hasOpacity(): boolean;
  clearOpacity(): void;
  getOpacity(): number | undefined;
  setOpacity(value: number): void;

  hasRotation(): boolean;
  clearRotation(): void;
  getRotation(): number | undefined;
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
    blur?: boolean,
    motion?: boolean,
    backgroundcolour?: number,
    backgroundsecondcolour?: number,
    opacity?: number,
    rotation?: number,
  }
}

export class WallPaper extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): number | undefined;
  setId(value: number): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): number | undefined;
  setAccesshash(value: number): void;

  hasCreator(): boolean;
  clearCreator(): void;
  getCreator(): boolean | undefined;
  setCreator(value: boolean): void;

  hasDefault(): boolean;
  clearDefault(): void;
  getDefault(): boolean | undefined;
  setDefault(value: boolean): void;

  hasPattern(): boolean;
  clearPattern(): void;
  getPattern(): boolean | undefined;
  setPattern(value: boolean): void;

  hasDark(): boolean;
  clearDark(): void;
  getDark(): boolean | undefined;
  setDark(value: boolean): void;

  hasDocument(): boolean;
  clearDocument(): void;
  getDocument(): chat_core_message_medias_pb.Document | undefined;
  setDocument(value?: chat_core_message_medias_pb.Document): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): WallPaperSettings | undefined;
  setSettings(value?: WallPaperSettings): void;

  hasSlug(): boolean;
  clearSlug(): void;
  getSlug(): string | undefined;
  setSlug(value: string): void;

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
    id?: number,
    accesshash?: number,
    creator?: boolean,
    pb_default?: boolean,
    pattern?: boolean,
    dark?: boolean,
    document?: chat_core_message_medias_pb.Document.AsObject,
    settings?: WallPaperSettings.AsObject,
    slug?: string,
  }
}

export class WallPapersMany extends jspb.Message {
  clearWallpapersList(): void;
  getWallpapersList(): Array<WallPaper>;
  setWallpapersList(value: Array<WallPaper>): void;
  addWallpapers(value?: WallPaper, index?: number): WallPaper;

  hasCount(): boolean;
  clearCount(): void;
  getCount(): number | undefined;
  setCount(value: number): void;

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
    count?: number,
  }
}

