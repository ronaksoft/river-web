/* tslint:disable */
// package: msg
// file: chat.api.gif.proto

import * as jspb from "google-protobuf";
import * as chat_core_message_medias_pb from "./chat.core.message.medias_pb";
import * as chat_core_types_pb from "./chat.core.types_pb";

export class GifGetSaved extends jspb.Message {
  hasHash(): boolean;
  clearHash(): void;
  getHash(): number | undefined;
  setHash(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GifGetSaved.AsObject;
  static toObject(includeInstance: boolean, msg: GifGetSaved): GifGetSaved.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GifGetSaved, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GifGetSaved;
  static deserializeBinaryFromReader(message: GifGetSaved, reader: jspb.BinaryReader): GifGetSaved;
}

export namespace GifGetSaved {
  export type AsObject = {
    hash?: number,
  }
}

export class GifSave extends jspb.Message {
  hasDoc(): boolean;
  clearDoc(): void;
  getDoc(): chat_core_types_pb.InputDocument;
  setDoc(value?: chat_core_types_pb.InputDocument): void;

  hasUnsave(): boolean;
  clearUnsave(): void;
  getUnsave(): boolean | undefined;
  setUnsave(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GifSave.AsObject;
  static toObject(includeInstance: boolean, msg: GifSave): GifSave.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GifSave, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GifSave;
  static deserializeBinaryFromReader(message: GifSave, reader: jspb.BinaryReader): GifSave;
}

export namespace GifSave {
  export type AsObject = {
    doc: chat_core_types_pb.InputDocument.AsObject,
    unsave?: boolean,
  }
}

export class GifSearch extends jspb.Message {
  hasQuery(): boolean;
  clearQuery(): void;
  getQuery(): string | undefined;
  setQuery(value: string): void;

  hasHash(): boolean;
  clearHash(): void;
  getHash(): number | undefined;
  setHash(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GifSearch.AsObject;
  static toObject(includeInstance: boolean, msg: GifSearch): GifSearch.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GifSearch, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GifSearch;
  static deserializeBinaryFromReader(message: GifSearch, reader: jspb.BinaryReader): GifSearch;
}

export namespace GifSearch {
  export type AsObject = {
    query?: string,
    hash?: number,
  }
}

export class FoundGifs extends jspb.Message {
  hasNextoffset(): boolean;
  clearNextoffset(): void;
  getNextoffset(): number | undefined;
  setNextoffset(value: number): void;

  clearGifsList(): void;
  getGifsList(): Array<FoundGif>;
  setGifsList(value: Array<FoundGif>): void;
  addGifs(value?: FoundGif, index?: number): FoundGif;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FoundGifs.AsObject;
  static toObject(includeInstance: boolean, msg: FoundGifs): FoundGifs.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FoundGifs, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FoundGifs;
  static deserializeBinaryFromReader(message: FoundGifs, reader: jspb.BinaryReader): FoundGifs;
}

export namespace FoundGifs {
  export type AsObject = {
    nextoffset?: number,
    gifsList: Array<FoundGif.AsObject>,
  }
}

export class FoundGif extends jspb.Message {
  hasUrl(): boolean;
  clearUrl(): void;
  getUrl(): string | undefined;
  setUrl(value: string): void;

  hasDoc(): boolean;
  clearDoc(): void;
  getDoc(): chat_core_message_medias_pb.Document;
  setDoc(value?: chat_core_message_medias_pb.Document): void;

  hasThumb(): boolean;
  clearThumb(): void;
  getThumb(): chat_core_message_medias_pb.Document;
  setThumb(value?: chat_core_message_medias_pb.Document): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FoundGif.AsObject;
  static toObject(includeInstance: boolean, msg: FoundGif): FoundGif.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FoundGif, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FoundGif;
  static deserializeBinaryFromReader(message: FoundGif, reader: jspb.BinaryReader): FoundGif;
}

export namespace FoundGif {
  export type AsObject = {
    url?: string,
    doc: chat_core_message_medias_pb.Document.AsObject,
    thumb: chat_core_message_medias_pb.Document.AsObject,
  }
}

export class SavedGifs extends jspb.Message {
  hasHash(): boolean;
  clearHash(): void;
  getHash(): number | undefined;
  setHash(value: number): void;

  clearDocsList(): void;
  getDocsList(): Array<chat_core_message_medias_pb.MediaDocument>;
  setDocsList(value: Array<chat_core_message_medias_pb.MediaDocument>): void;
  addDocs(value?: chat_core_message_medias_pb.MediaDocument, index?: number): chat_core_message_medias_pb.MediaDocument;

  hasNotmodified(): boolean;
  clearNotmodified(): void;
  getNotmodified(): boolean | undefined;
  setNotmodified(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SavedGifs.AsObject;
  static toObject(includeInstance: boolean, msg: SavedGifs): SavedGifs.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SavedGifs, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SavedGifs;
  static deserializeBinaryFromReader(message: SavedGifs, reader: jspb.BinaryReader): SavedGifs;
}

export namespace SavedGifs {
  export type AsObject = {
    hash?: number,
    docsList: Array<chat_core_message_medias_pb.MediaDocument.AsObject>,
    notmodified?: boolean,
  }
}

