// package: msg
// file: core.message_medias.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class InputMediaUploadedPhoto extends jspb.Message {
  hasCaption(): boolean;
  clearCaption(): void;
  getCaption(): string | undefined;
  setCaption(value: string): void;

  clearStickersList(): void;
  getStickersList(): Array<core_types_pb.InputDocument>;
  setStickersList(value: Array<core_types_pb.InputDocument>): void;
  addStickers(value?: core_types_pb.InputDocument, index?: number): core_types_pb.InputDocument;

  hasFile(): boolean;
  clearFile(): void;
  getFile(): core_types_pb.InputFile;
  setFile(value?: core_types_pb.InputFile): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputMediaUploadedPhoto.AsObject;
  static toObject(includeInstance: boolean, msg: InputMediaUploadedPhoto): InputMediaUploadedPhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputMediaUploadedPhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputMediaUploadedPhoto;
  static deserializeBinaryFromReader(message: InputMediaUploadedPhoto, reader: jspb.BinaryReader): InputMediaUploadedPhoto;
}

export namespace InputMediaUploadedPhoto {
  export type AsObject = {
    caption?: string,
    stickersList: Array<core_types_pb.InputDocument.AsObject>,
    file: core_types_pb.InputFile.AsObject,
  }
}

export class InputMediaPhoto extends jspb.Message {
  hasCaption(): boolean;
  clearCaption(): void;
  getCaption(): string | undefined;
  setCaption(value: string): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): core_types_pb.InputDocument;
  setPhoto(value?: core_types_pb.InputDocument): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputMediaPhoto.AsObject;
  static toObject(includeInstance: boolean, msg: InputMediaPhoto): InputMediaPhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputMediaPhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputMediaPhoto;
  static deserializeBinaryFromReader(message: InputMediaPhoto, reader: jspb.BinaryReader): InputMediaPhoto;
}

export namespace InputMediaPhoto {
  export type AsObject = {
    caption?: string,
    photo: core_types_pb.InputDocument.AsObject,
  }
}

export class InputMediaContact extends jspb.Message {
  hasPhone(): boolean;
  clearPhone(): void;
  getPhone(): string | undefined;
  setPhone(value: string): void;

  hasFirstname(): boolean;
  clearFirstname(): void;
  getFirstname(): string | undefined;
  setFirstname(value: string): void;

  hasLastname(): boolean;
  clearLastname(): void;
  getLastname(): string | undefined;
  setLastname(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputMediaContact.AsObject;
  static toObject(includeInstance: boolean, msg: InputMediaContact): InputMediaContact.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputMediaContact, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputMediaContact;
  static deserializeBinaryFromReader(message: InputMediaContact, reader: jspb.BinaryReader): InputMediaContact;
}

export namespace InputMediaContact {
  export type AsObject = {
    phone?: string,
    firstname?: string,
    lastname?: string,
  }
}

export class InputMediaUploadedDocument extends jspb.Message {
  hasFile(): boolean;
  clearFile(): void;
  getFile(): core_types_pb.InputFile;
  setFile(value?: core_types_pb.InputFile): void;

  hasThumbnail(): boolean;
  clearThumbnail(): void;
  getThumbnail(): core_types_pb.InputFile;
  setThumbnail(value?: core_types_pb.InputFile): void;

  hasMimetype(): boolean;
  clearMimetype(): void;
  getMimetype(): string | undefined;
  setMimetype(value: string): void;

  hasCaption(): boolean;
  clearCaption(): void;
  getCaption(): string | undefined;
  setCaption(value: string): void;

  clearStickersList(): void;
  getStickersList(): Array<core_types_pb.InputDocument>;
  setStickersList(value: Array<core_types_pb.InputDocument>): void;
  addStickers(value?: core_types_pb.InputDocument, index?: number): core_types_pb.InputDocument;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputMediaUploadedDocument.AsObject;
  static toObject(includeInstance: boolean, msg: InputMediaUploadedDocument): InputMediaUploadedDocument.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputMediaUploadedDocument, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputMediaUploadedDocument;
  static deserializeBinaryFromReader(message: InputMediaUploadedDocument, reader: jspb.BinaryReader): InputMediaUploadedDocument;
}

export namespace InputMediaUploadedDocument {
  export type AsObject = {
    file: core_types_pb.InputFile.AsObject,
    thumbnail: core_types_pb.InputFile.AsObject,
    mimetype?: string,
    caption?: string,
    stickersList: Array<core_types_pb.InputDocument.AsObject>,
  }
}

export class InputMediaDocument extends jspb.Message {
  hasCaption(): boolean;
  clearCaption(): void;
  getCaption(): string | undefined;
  setCaption(value: string): void;

  hasDocument(): boolean;
  clearDocument(): void;
  getDocument(): core_types_pb.InputDocument;
  setDocument(value?: core_types_pb.InputDocument): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputMediaDocument.AsObject;
  static toObject(includeInstance: boolean, msg: InputMediaDocument): InputMediaDocument.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputMediaDocument, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputMediaDocument;
  static deserializeBinaryFromReader(message: InputMediaDocument, reader: jspb.BinaryReader): InputMediaDocument;
}

export namespace InputMediaDocument {
  export type AsObject = {
    caption?: string,
    document: core_types_pb.InputDocument.AsObject,
  }
}

