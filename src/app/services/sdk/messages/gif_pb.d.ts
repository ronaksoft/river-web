/* tslint:disable */
// package: msg
// file: gif.proto

import * as jspb from "google-protobuf";
import * as chat_messages_medias_pb from "./chat.messages.medias_pb";
import * as core_types_pb from "./core.types_pb";

export class GifGetSaved extends jspb.Message {
  getHash(): number;
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
    hash: number,
  }
}

export class GifSave extends jspb.Message {
  hasDoc(): boolean;
  clearDoc(): void;
  getDoc(): core_types_pb.InputDocument | undefined;
  setDoc(value?: core_types_pb.InputDocument): void;

  clearAttributesList(): void;
  getAttributesList(): Array<chat_messages_medias_pb.DocumentAttribute>;
  setAttributesList(value: Array<chat_messages_medias_pb.DocumentAttribute>): void;
  addAttributes(value?: chat_messages_medias_pb.DocumentAttribute, index?: number): chat_messages_medias_pb.DocumentAttribute;

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
    doc?: core_types_pb.InputDocument.AsObject,
    attributesList: Array<chat_messages_medias_pb.DocumentAttribute.AsObject>,
  }
}

export class GifDelete extends jspb.Message {
  hasDoc(): boolean;
  clearDoc(): void;
  getDoc(): core_types_pb.InputDocument | undefined;
  setDoc(value?: core_types_pb.InputDocument): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GifDelete.AsObject;
  static toObject(includeInstance: boolean, msg: GifDelete): GifDelete.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GifDelete, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GifDelete;
  static deserializeBinaryFromReader(message: GifDelete, reader: jspb.BinaryReader): GifDelete;
}

export namespace GifDelete {
  export type AsObject = {
    doc?: core_types_pb.InputDocument.AsObject,
  }
}

export class GifSearch extends jspb.Message {
  getQuery(): string;
  setQuery(value: string): void;

  getHash(): number;
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
    query: string,
    hash: number,
  }
}

export class FoundGifs extends jspb.Message {
  getNextoffset(): number;
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
    nextoffset: number,
    gifsList: Array<FoundGif.AsObject>,
  }
}

export class FoundGif extends jspb.Message {
  getUrl(): string;
  setUrl(value: string): void;

  hasDoc(): boolean;
  clearDoc(): void;
  getDoc(): chat_messages_medias_pb.Document | undefined;
  setDoc(value?: chat_messages_medias_pb.Document): void;

  hasThumb(): boolean;
  clearThumb(): void;
  getThumb(): chat_messages_medias_pb.Document | undefined;
  setThumb(value?: chat_messages_medias_pb.Document): void;

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
    url: string,
    doc?: chat_messages_medias_pb.Document.AsObject,
    thumb?: chat_messages_medias_pb.Document.AsObject,
  }
}

export class SavedGifs extends jspb.Message {
  getHash(): number;
  setHash(value: number): void;

  clearDocsList(): void;
  getDocsList(): Array<chat_messages_medias_pb.MediaDocument>;
  setDocsList(value: Array<chat_messages_medias_pb.MediaDocument>): void;
  addDocs(value?: chat_messages_medias_pb.MediaDocument, index?: number): chat_messages_medias_pb.MediaDocument;

  getNotmodified(): boolean;
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
    hash: number,
    docsList: Array<chat_messages_medias_pb.MediaDocument.AsObject>,
    notmodified: boolean,
  }
}

