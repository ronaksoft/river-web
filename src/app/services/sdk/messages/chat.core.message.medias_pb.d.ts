/* tslint:disable */
// package: msg
// file: chat.core.message.medias.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";

export class DocumentAttributeAudio extends jspb.Message {
  hasVoice(): boolean;
  clearVoice(): void;
  getVoice(): boolean | undefined;
  setVoice(value: boolean): void;

  hasDuration(): boolean;
  clearDuration(): void;
  getDuration(): number | undefined;
  setDuration(value: number): void;

  hasTitle(): boolean;
  clearTitle(): void;
  getTitle(): string | undefined;
  setTitle(value: string): void;

  hasPerformer(): boolean;
  clearPerformer(): void;
  getPerformer(): string | undefined;
  setPerformer(value: string): void;

  hasAlbum(): boolean;
  clearAlbum(): void;
  getAlbum(): string | undefined;
  setAlbum(value: string): void;

  hasWaveform(): boolean;
  clearWaveform(): void;
  getWaveform(): Uint8Array | string;
  getWaveform_asU8(): Uint8Array;
  getWaveform_asB64(): string;
  setWaveform(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DocumentAttributeAudio.AsObject;
  static toObject(includeInstance: boolean, msg: DocumentAttributeAudio): DocumentAttributeAudio.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DocumentAttributeAudio, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DocumentAttributeAudio;
  static deserializeBinaryFromReader(message: DocumentAttributeAudio, reader: jspb.BinaryReader): DocumentAttributeAudio;
}

export namespace DocumentAttributeAudio {
  export type AsObject = {
    voice?: boolean,
    duration?: number,
    title?: string,
    performer?: string,
    album?: string,
    waveform: Uint8Array | string,
  }
}

export class DocumentAttributeVideo extends jspb.Message {
  hasWidth(): boolean;
  clearWidth(): void;
  getWidth(): number | undefined;
  setWidth(value: number): void;

  hasHeight(): boolean;
  clearHeight(): void;
  getHeight(): number | undefined;
  setHeight(value: number): void;

  hasDuration(): boolean;
  clearDuration(): void;
  getDuration(): number | undefined;
  setDuration(value: number): void;

  hasRound(): boolean;
  clearRound(): void;
  getRound(): boolean | undefined;
  setRound(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DocumentAttributeVideo.AsObject;
  static toObject(includeInstance: boolean, msg: DocumentAttributeVideo): DocumentAttributeVideo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DocumentAttributeVideo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DocumentAttributeVideo;
  static deserializeBinaryFromReader(message: DocumentAttributeVideo, reader: jspb.BinaryReader): DocumentAttributeVideo;
}

export namespace DocumentAttributeVideo {
  export type AsObject = {
    width?: number,
    height?: number,
    duration?: number,
    round?: boolean,
  }
}

export class DocumentAttributePhoto extends jspb.Message {
  hasWidth(): boolean;
  clearWidth(): void;
  getWidth(): number | undefined;
  setWidth(value: number): void;

  hasHeight(): boolean;
  clearHeight(): void;
  getHeight(): number | undefined;
  setHeight(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DocumentAttributePhoto.AsObject;
  static toObject(includeInstance: boolean, msg: DocumentAttributePhoto): DocumentAttributePhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DocumentAttributePhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DocumentAttributePhoto;
  static deserializeBinaryFromReader(message: DocumentAttributePhoto, reader: jspb.BinaryReader): DocumentAttributePhoto;
}

export namespace DocumentAttributePhoto {
  export type AsObject = {
    width?: number,
    height?: number,
  }
}

export class DocumentAttributeFile extends jspb.Message {
  hasFilename(): boolean;
  clearFilename(): void;
  getFilename(): string | undefined;
  setFilename(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DocumentAttributeFile.AsObject;
  static toObject(includeInstance: boolean, msg: DocumentAttributeFile): DocumentAttributeFile.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DocumentAttributeFile, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DocumentAttributeFile;
  static deserializeBinaryFromReader(message: DocumentAttributeFile, reader: jspb.BinaryReader): DocumentAttributeFile;
}

export namespace DocumentAttributeFile {
  export type AsObject = {
    filename?: string,
  }
}

export class DocumentAttribute extends jspb.Message {
  hasType(): boolean;
  clearType(): void;
  getType(): DocumentAttributeType | undefined;
  setType(value: DocumentAttributeType): void;

  hasData(): boolean;
  clearData(): void;
  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DocumentAttribute.AsObject;
  static toObject(includeInstance: boolean, msg: DocumentAttribute): DocumentAttribute.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DocumentAttribute, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DocumentAttribute;
  static deserializeBinaryFromReader(message: DocumentAttribute, reader: jspb.BinaryReader): DocumentAttribute;
}

export namespace DocumentAttribute {
  export type AsObject = {
    type?: DocumentAttributeType,
    data: Uint8Array | string,
  }
}

export class Document extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): string | undefined;
  setId(value: string): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
  setAccesshash(value: string): void;

  hasDate(): boolean;
  clearDate(): void;
  getDate(): number | undefined;
  setDate(value: number): void;

  hasMimetype(): boolean;
  clearMimetype(): void;
  getMimetype(): string | undefined;
  setMimetype(value: string): void;

  hasFilesize(): boolean;
  clearFilesize(): void;
  getFilesize(): number | undefined;
  setFilesize(value: number): void;

  hasVersion(): boolean;
  clearVersion(): void;
  getVersion(): number | undefined;
  setVersion(value: number): void;

  hasClusterid(): boolean;
  clearClusterid(): void;
  getClusterid(): number | undefined;
  setClusterid(value: number): void;

  clearAttributesList(): void;
  getAttributesList(): Array<DocumentAttribute>;
  setAttributesList(value: Array<DocumentAttribute>): void;
  addAttributes(value?: DocumentAttribute, index?: number): DocumentAttribute;

  hasThumbnail(): boolean;
  clearThumbnail(): void;
  getThumbnail(): chat_core_types_pb.FileLocation | undefined;
  setThumbnail(value?: chat_core_types_pb.FileLocation): void;

  hasMd5checksum(): boolean;
  clearMd5checksum(): void;
  getMd5checksum(): string | undefined;
  setMd5checksum(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Document.AsObject;
  static toObject(includeInstance: boolean, msg: Document): Document.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Document, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Document;
  static deserializeBinaryFromReader(message: Document, reader: jspb.BinaryReader): Document;
}

export namespace Document {
  export type AsObject = {
    id?: string,
    accesshash?: string,
    date?: number,
    mimetype?: string,
    filesize?: number,
    version?: number,
    clusterid?: number,
    attributesList: Array<DocumentAttribute.AsObject>,
    thumbnail?: chat_core_types_pb.FileLocation.AsObject,
    md5checksum?: string,
  }
}

export class InputMediaUploadedPhoto extends jspb.Message {
  hasCaption(): boolean;
  clearCaption(): void;
  getCaption(): string | undefined;
  setCaption(value: string): void;

  clearStickersList(): void;
  getStickersList(): Array<chat_core_types_pb.InputDocument>;
  setStickersList(value: Array<chat_core_types_pb.InputDocument>): void;
  addStickers(value?: chat_core_types_pb.InputDocument, index?: number): chat_core_types_pb.InputDocument;

  hasFile(): boolean;
  clearFile(): void;
  getFile(): chat_core_types_pb.InputFile;
  setFile(value?: chat_core_types_pb.InputFile): void;

  clearAttributesList(): void;
  getAttributesList(): Array<DocumentAttribute>;
  setAttributesList(value: Array<DocumentAttribute>): void;
  addAttributes(value?: DocumentAttribute, index?: number): DocumentAttribute;

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
    stickersList: Array<chat_core_types_pb.InputDocument.AsObject>,
    file: chat_core_types_pb.InputFile.AsObject,
    attributesList: Array<DocumentAttribute.AsObject>,
  }
}

export class InputMediaPhoto extends jspb.Message {
  hasCaption(): boolean;
  clearCaption(): void;
  getCaption(): string | undefined;
  setCaption(value: string): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): chat_core_types_pb.InputDocument;
  setPhoto(value?: chat_core_types_pb.InputDocument): void;

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
    photo: chat_core_types_pb.InputDocument.AsObject,
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

  hasVcard(): boolean;
  clearVcard(): void;
  getVcard(): string | undefined;
  setVcard(value: string): void;

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
    vcard?: string,
  }
}

export class InputMediaUploadedDocument extends jspb.Message {
  hasFile(): boolean;
  clearFile(): void;
  getFile(): chat_core_types_pb.InputFile;
  setFile(value?: chat_core_types_pb.InputFile): void;

  hasThumbnail(): boolean;
  clearThumbnail(): void;
  getThumbnail(): chat_core_types_pb.InputFile | undefined;
  setThumbnail(value?: chat_core_types_pb.InputFile): void;

  hasMimetype(): boolean;
  clearMimetype(): void;
  getMimetype(): string | undefined;
  setMimetype(value: string): void;

  hasCaption(): boolean;
  clearCaption(): void;
  getCaption(): string | undefined;
  setCaption(value: string): void;

  clearStickersList(): void;
  getStickersList(): Array<chat_core_types_pb.InputDocument>;
  setStickersList(value: Array<chat_core_types_pb.InputDocument>): void;
  addStickers(value?: chat_core_types_pb.InputDocument, index?: number): chat_core_types_pb.InputDocument;

  clearAttributesList(): void;
  getAttributesList(): Array<DocumentAttribute>;
  setAttributesList(value: Array<DocumentAttribute>): void;
  addAttributes(value?: DocumentAttribute, index?: number): DocumentAttribute;

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
    file: chat_core_types_pb.InputFile.AsObject,
    thumbnail?: chat_core_types_pb.InputFile.AsObject,
    mimetype?: string,
    caption?: string,
    stickersList: Array<chat_core_types_pb.InputDocument.AsObject>,
    attributesList: Array<DocumentAttribute.AsObject>,
  }
}

export class InputMediaDocument extends jspb.Message {
  hasCaption(): boolean;
  clearCaption(): void;
  getCaption(): string | undefined;
  setCaption(value: string): void;

  hasDocument(): boolean;
  clearDocument(): void;
  getDocument(): chat_core_types_pb.InputDocument;
  setDocument(value?: chat_core_types_pb.InputDocument): void;

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
    document: chat_core_types_pb.InputDocument.AsObject,
  }
}

export class InputMediaGeoLocation extends jspb.Message {
  hasLat(): boolean;
  clearLat(): void;
  getLat(): number | undefined;
  setLat(value: number): void;

  hasLong(): boolean;
  clearLong(): void;
  getLong(): number | undefined;
  setLong(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputMediaGeoLocation.AsObject;
  static toObject(includeInstance: boolean, msg: InputMediaGeoLocation): InputMediaGeoLocation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputMediaGeoLocation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputMediaGeoLocation;
  static deserializeBinaryFromReader(message: InputMediaGeoLocation, reader: jspb.BinaryReader): InputMediaGeoLocation;
}

export namespace InputMediaGeoLocation {
  export type AsObject = {
    lat?: number,
    pb_long?: number,
  }
}

export class MediaPhoto extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MediaPhoto.AsObject;
  static toObject(includeInstance: boolean, msg: MediaPhoto): MediaPhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MediaPhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MediaPhoto;
  static deserializeBinaryFromReader(message: MediaPhoto, reader: jspb.BinaryReader): MediaPhoto;
}

export namespace MediaPhoto {
  export type AsObject = {
  }
}

export class MediaDocument extends jspb.Message {
  hasCaption(): boolean;
  clearCaption(): void;
  getCaption(): string | undefined;
  setCaption(value: string): void;

  hasTtlinseconds(): boolean;
  clearTtlinseconds(): void;
  getTtlinseconds(): number | undefined;
  setTtlinseconds(value: number): void;

  hasDoc(): boolean;
  clearDoc(): void;
  getDoc(): Document;
  setDoc(value?: Document): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MediaDocument.AsObject;
  static toObject(includeInstance: boolean, msg: MediaDocument): MediaDocument.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MediaDocument, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MediaDocument;
  static deserializeBinaryFromReader(message: MediaDocument, reader: jspb.BinaryReader): MediaDocument;
}

export namespace MediaDocument {
  export type AsObject = {
    caption?: string,
    ttlinseconds?: number,
    doc: Document.AsObject,
  }
}

export class MediaContact extends jspb.Message {
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

  hasVcard(): boolean;
  clearVcard(): void;
  getVcard(): string | undefined;
  setVcard(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MediaContact.AsObject;
  static toObject(includeInstance: boolean, msg: MediaContact): MediaContact.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MediaContact, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MediaContact;
  static deserializeBinaryFromReader(message: MediaContact, reader: jspb.BinaryReader): MediaContact;
}

export namespace MediaContact {
  export type AsObject = {
    phone?: string,
    firstname?: string,
    lastname?: string,
    vcard?: string,
  }
}

export class MediaGeoLocation extends jspb.Message {
  hasLat(): boolean;
  clearLat(): void;
  getLat(): number | undefined;
  setLat(value: number): void;

  hasLong(): boolean;
  clearLong(): void;
  getLong(): number | undefined;
  setLong(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MediaGeoLocation.AsObject;
  static toObject(includeInstance: boolean, msg: MediaGeoLocation): MediaGeoLocation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MediaGeoLocation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MediaGeoLocation;
  static deserializeBinaryFromReader(message: MediaGeoLocation, reader: jspb.BinaryReader): MediaGeoLocation;
}

export namespace MediaGeoLocation {
  export type AsObject = {
    lat?: number,
    pb_long?: number,
  }
}

export class MediaWebPage extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MediaWebPage.AsObject;
  static toObject(includeInstance: boolean, msg: MediaWebPage): MediaWebPage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MediaWebPage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MediaWebPage;
  static deserializeBinaryFromReader(message: MediaWebPage, reader: jspb.BinaryReader): MediaWebPage;
}

export namespace MediaWebPage {
  export type AsObject = {
  }
}

export enum DocumentAttributeType {
  ATTRIBUTETYPENONE = 0,
  ATTRIBUTETYPEAUDIO = 1,
  ATTRIBUTETYPEVIDEO = 2,
  ATTRIBUTETYPEPHOTO = 3,
  ATTRIBUTETYPEFILE = 4,
  ATTRIBUTEANIMATED = 5,
}

export enum DocumentType {
  DOCUMENTTYPEUNKNOWN = 0,
  DOCUMENTTYPEPHOTO = 1,
  DOCUMENTTYPEVOICE = 2,
  DOCUMENTTYPEVIDEO = 3,
  DOCUMENTTYPEWEBPAGE = 4,
}

