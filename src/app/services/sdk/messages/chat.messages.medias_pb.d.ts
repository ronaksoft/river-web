/* tslint:disable */
// package: msg
// file: chat.messages.medias.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class DocumentAttributeVoiceCall extends jspb.Message {
  getMaxcallattempts(): number;
  setMaxcallattempts(value: number): void;

  getCallattemptsleep(): number;
  setCallattemptsleep(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DocumentAttributeVoiceCall.AsObject;
  static toObject(includeInstance: boolean, msg: DocumentAttributeVoiceCall): DocumentAttributeVoiceCall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DocumentAttributeVoiceCall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DocumentAttributeVoiceCall;
  static deserializeBinaryFromReader(message: DocumentAttributeVoiceCall, reader: jspb.BinaryReader): DocumentAttributeVoiceCall;
}

export namespace DocumentAttributeVoiceCall {
  export type AsObject = {
    maxcallattempts: number,
    callattemptsleep: number,
  }
}

export class DocumentAttributeAudio extends jspb.Message {
  getVoice(): boolean;
  setVoice(value: boolean): void;

  getDuration(): number;
  setDuration(value: number): void;

  getTitle(): string;
  setTitle(value: string): void;

  getPerformer(): string;
  setPerformer(value: string): void;

  getAlbum(): string;
  setAlbum(value: string): void;

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
    voice: boolean,
    duration: number,
    title: string,
    performer: string,
    album: string,
    waveform: Uint8Array | string,
  }
}

export class DocumentAttributeVideo extends jspb.Message {
  getWidth(): number;
  setWidth(value: number): void;

  getHeight(): number;
  setHeight(value: number): void;

  getDuration(): number;
  setDuration(value: number): void;

  getRound(): boolean;
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
    width: number,
    height: number,
    duration: number,
    round: boolean,
  }
}

export class DocumentAttributePhoto extends jspb.Message {
  getWidth(): number;
  setWidth(value: number): void;

  getHeight(): number;
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
    width: number,
    height: number,
  }
}

export class DocumentAttributeFile extends jspb.Message {
  getFilename(): string;
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
    filename: string,
  }
}

export class DocumentAttributeAnimated extends jspb.Message {
  getSound(): boolean;
  setSound(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DocumentAttributeAnimated.AsObject;
  static toObject(includeInstance: boolean, msg: DocumentAttributeAnimated): DocumentAttributeAnimated.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DocumentAttributeAnimated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DocumentAttributeAnimated;
  static deserializeBinaryFromReader(message: DocumentAttributeAnimated, reader: jspb.BinaryReader): DocumentAttributeAnimated;
}

export namespace DocumentAttributeAnimated {
  export type AsObject = {
    sound: boolean,
  }
}

export class DocumentAttribute extends jspb.Message {
  getType(): DocumentAttributeType;
  setType(value: DocumentAttributeType): void;

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
    type: DocumentAttributeType,
    data: Uint8Array | string,
  }
}

export class Document extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  getDate(): number;
  setDate(value: number): void;

  getMimetype(): string;
  setMimetype(value: string): void;

  getFilesize(): number;
  setFilesize(value: number): void;

  getVersion(): number;
  setVersion(value: number): void;

  getClusterid(): number;
  setClusterid(value: number): void;

  clearAttributesList(): void;
  getAttributesList(): Array<DocumentAttribute>;
  setAttributesList(value: Array<DocumentAttribute>): void;
  addAttributes(value?: DocumentAttribute, index?: number): DocumentAttribute;

  hasThumbnail(): boolean;
  clearThumbnail(): void;
  getThumbnail(): core_types_pb.FileLocation | undefined;
  setThumbnail(value?: core_types_pb.FileLocation): void;

  getMd5checksum(): string;
  setMd5checksum(value: string): void;

  getTinythumbnail(): Uint8Array | string;
  getTinythumbnail_asU8(): Uint8Array;
  getTinythumbnail_asB64(): string;
  setTinythumbnail(value: Uint8Array | string): void;

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
    id: string,
    accesshash: string,
    date: number,
    mimetype: string,
    filesize: number,
    version: number,
    clusterid: number,
    attributesList: Array<DocumentAttribute.AsObject>,
    thumbnail?: core_types_pb.FileLocation.AsObject,
    md5checksum: string,
    tinythumbnail: Uint8Array | string,
  }
}

export class InputMediaWebDocument extends jspb.Message {
  getUrl(): string;
  setUrl(value: string): void;

  getDocsize(): number;
  setDocsize(value: number): void;

  getMimetype(): string;
  setMimetype(value: string): void;

  clearAttributesList(): void;
  getAttributesList(): Array<DocumentAttribute>;
  setAttributesList(value: Array<DocumentAttribute>): void;
  addAttributes(value?: DocumentAttribute, index?: number): DocumentAttribute;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputMediaWebDocument.AsObject;
  static toObject(includeInstance: boolean, msg: InputMediaWebDocument): InputMediaWebDocument.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputMediaWebDocument, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputMediaWebDocument;
  static deserializeBinaryFromReader(message: InputMediaWebDocument, reader: jspb.BinaryReader): InputMediaWebDocument;
}

export namespace InputMediaWebDocument {
  export type AsObject = {
    url: string,
    docsize: number,
    mimetype: string,
    attributesList: Array<DocumentAttribute.AsObject>,
  }
}

export class MediaWebDocument extends jspb.Message {
  getUrl(): string;
  setUrl(value: string): void;

  getDocsize(): number;
  setDocsize(value: number): void;

  getMimetype(): string;
  setMimetype(value: string): void;

  clearAttributesList(): void;
  getAttributesList(): Array<DocumentAttribute>;
  setAttributesList(value: Array<DocumentAttribute>): void;
  addAttributes(value?: DocumentAttribute, index?: number): DocumentAttribute;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MediaWebDocument.AsObject;
  static toObject(includeInstance: boolean, msg: MediaWebDocument): MediaWebDocument.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MediaWebDocument, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MediaWebDocument;
  static deserializeBinaryFromReader(message: MediaWebDocument, reader: jspb.BinaryReader): MediaWebDocument;
}

export namespace MediaWebDocument {
  export type AsObject = {
    url: string,
    docsize: number,
    mimetype: string,
    attributesList: Array<DocumentAttribute.AsObject>,
    accesshash: string,
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

export class InputMediaContact extends jspb.Message {
  getPhone(): string;
  setPhone(value: string): void;

  getFirstname(): string;
  setFirstname(value: string): void;

  getLastname(): string;
  setLastname(value: string): void;

  getVcard(): string;
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
    phone: string,
    firstname: string,
    lastname: string,
    vcard: string,
  }
}

export class MediaContact extends jspb.Message {
  getPhone(): string;
  setPhone(value: string): void;

  getFirstname(): string;
  setFirstname(value: string): void;

  getLastname(): string;
  setLastname(value: string): void;

  getVcard(): string;
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
    phone: string,
    firstname: string,
    lastname: string,
    vcard: string,
  }
}

export class InputMediaUploadedDocument extends jspb.Message {
  hasFile(): boolean;
  clearFile(): void;
  getFile(): core_types_pb.InputFile | undefined;
  setFile(value?: core_types_pb.InputFile): void;

  hasThumbnail(): boolean;
  clearThumbnail(): void;
  getThumbnail(): core_types_pb.InputFile | undefined;
  setThumbnail(value?: core_types_pb.InputFile): void;

  getMimetype(): string;
  setMimetype(value: string): void;

  getCaption(): string;
  setCaption(value: string): void;

  clearStickersList(): void;
  getStickersList(): Array<core_types_pb.InputDocument>;
  setStickersList(value: Array<core_types_pb.InputDocument>): void;
  addStickers(value?: core_types_pb.InputDocument, index?: number): core_types_pb.InputDocument;

  clearAttributesList(): void;
  getAttributesList(): Array<DocumentAttribute>;
  setAttributesList(value: Array<DocumentAttribute>): void;
  addAttributes(value?: DocumentAttribute, index?: number): DocumentAttribute;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

  getTinythumbnail(): Uint8Array | string;
  getTinythumbnail_asU8(): Uint8Array;
  getTinythumbnail_asB64(): string;
  setTinythumbnail(value: Uint8Array | string): void;

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
    file?: core_types_pb.InputFile.AsObject,
    thumbnail?: core_types_pb.InputFile.AsObject,
    mimetype: string,
    caption: string,
    stickersList: Array<core_types_pb.InputDocument.AsObject>,
    attributesList: Array<DocumentAttribute.AsObject>,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
    tinythumbnail: Uint8Array | string,
  }
}

export class InputMediaDocument extends jspb.Message {
  getCaption(): string;
  setCaption(value: string): void;

  hasDocument(): boolean;
  clearDocument(): void;
  getDocument(): core_types_pb.InputDocument | undefined;
  setDocument(value?: core_types_pb.InputDocument): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

  hasThumbnail(): boolean;
  clearThumbnail(): void;
  getThumbnail(): core_types_pb.InputFile | undefined;
  setThumbnail(value?: core_types_pb.InputFile): void;

  clearAttributesList(): void;
  getAttributesList(): Array<DocumentAttribute>;
  setAttributesList(value: Array<DocumentAttribute>): void;
  addAttributes(value?: DocumentAttribute, index?: number): DocumentAttribute;

  getTinythumbnail(): Uint8Array | string;
  getTinythumbnail_asU8(): Uint8Array;
  getTinythumbnail_asB64(): string;
  setTinythumbnail(value: Uint8Array | string): void;

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
    caption: string,
    document?: core_types_pb.InputDocument.AsObject,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
    thumbnail?: core_types_pb.InputFile.AsObject,
    attributesList: Array<DocumentAttribute.AsObject>,
    tinythumbnail: Uint8Array | string,
  }
}

export class InputMediaMessageDocument extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  getCaption(): string;
  setCaption(value: string): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputMediaMessageDocument.AsObject;
  static toObject(includeInstance: boolean, msg: InputMediaMessageDocument): InputMediaMessageDocument.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputMediaMessageDocument, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputMediaMessageDocument;
  static deserializeBinaryFromReader(message: InputMediaMessageDocument, reader: jspb.BinaryReader): InputMediaMessageDocument;
}

export namespace InputMediaMessageDocument {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    messageid: number,
    caption: string,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
  }
}

export class MediaDocument extends jspb.Message {
  getCaption(): string;
  setCaption(value: string): void;

  getTtlinseconds(): number;
  setTtlinseconds(value: number): void;

  hasDoc(): boolean;
  clearDoc(): void;
  getDoc(): Document | undefined;
  setDoc(value?: Document): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

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
    caption: string,
    ttlinseconds: number,
    doc?: Document.AsObject,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
  }
}

export class InputMediaGeoLocation extends jspb.Message {
  getLat(): number;
  setLat(value: number): void;

  getLong(): number;
  setLong(value: number): void;

  getCaption(): string;
  setCaption(value: string): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

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
    lat: number,
    pb_long: number,
    caption: string,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
  }
}

export class MediaGeoLocation extends jspb.Message {
  getLat(): number;
  setLat(value: number): void;

  getLong(): number;
  setLong(value: number): void;

  getCaption(): string;
  setCaption(value: string): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

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
    lat: number,
    pb_long: number,
    caption: string,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
  }
}

export class InputMediaPoll extends jspb.Message {
  hasPoll(): boolean;
  clearPoll(): void;
  getPoll(): MediaPoll | undefined;
  setPoll(value?: MediaPoll): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputMediaPoll.AsObject;
  static toObject(includeInstance: boolean, msg: InputMediaPoll): InputMediaPoll.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputMediaPoll, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputMediaPoll;
  static deserializeBinaryFromReader(message: InputMediaPoll, reader: jspb.BinaryReader): InputMediaPoll;
}

export namespace InputMediaPoll {
  export type AsObject = {
    poll?: MediaPoll.AsObject,
  }
}

export class MediaPoll extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getClosed(): boolean;
  setClosed(value: boolean): void;

  getPublicvoters(): boolean;
  setPublicvoters(value: boolean): void;

  getMultichoice(): boolean;
  setMultichoice(value: boolean): void;

  getQuiz(): boolean;
  setQuiz(value: boolean): void;

  getQuestion(): string;
  setQuestion(value: string): void;

  clearAnswersList(): void;
  getAnswersList(): Array<PollAnswer>;
  setAnswersList(value: Array<PollAnswer>): void;
  addAnswers(value?: PollAnswer, index?: number): PollAnswer;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MediaPoll.AsObject;
  static toObject(includeInstance: boolean, msg: MediaPoll): MediaPoll.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MediaPoll, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MediaPoll;
  static deserializeBinaryFromReader(message: MediaPoll, reader: jspb.BinaryReader): MediaPoll;
}

export namespace MediaPoll {
  export type AsObject = {
    id: number,
    closed: boolean,
    publicvoters: boolean,
    multichoice: boolean,
    quiz: boolean,
    question: string,
    answersList: Array<PollAnswer.AsObject>,
  }
}

export class PollAnswer extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getOption(): Uint8Array | string;
  getOption_asU8(): Uint8Array;
  getOption_asB64(): string;
  setOption(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PollAnswer.AsObject;
  static toObject(includeInstance: boolean, msg: PollAnswer): PollAnswer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PollAnswer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PollAnswer;
  static deserializeBinaryFromReader(message: PollAnswer, reader: jspb.BinaryReader): PollAnswer;
}

export namespace PollAnswer {
  export type AsObject = {
    text: string,
    option: Uint8Array | string,
  }
}

export class PollResults extends jspb.Message {
  clearResultsList(): void;
  getResultsList(): Array<PollAnswerVoters>;
  setResultsList(value: Array<PollAnswerVoters>): void;
  addResults(value?: PollAnswerVoters, index?: number): PollAnswerVoters;

  getTotalvoters(): number;
  setTotalvoters(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PollResults.AsObject;
  static toObject(includeInstance: boolean, msg: PollResults): PollResults.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PollResults, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PollResults;
  static deserializeBinaryFromReader(message: PollResults, reader: jspb.BinaryReader): PollResults;
}

export namespace PollResults {
  export type AsObject = {
    resultsList: Array<PollAnswerVoters.AsObject>,
    totalvoters: number,
  }
}

export class PollAnswerVoters extends jspb.Message {
  getChosen(): boolean;
  setChosen(value: boolean): void;

  getCorrect(): boolean;
  setCorrect(value: boolean): void;

  getOption(): Uint8Array | string;
  getOption_asU8(): Uint8Array;
  getOption_asB64(): string;
  setOption(value: Uint8Array | string): void;

  getVoters(): number;
  setVoters(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PollAnswerVoters.AsObject;
  static toObject(includeInstance: boolean, msg: PollAnswerVoters): PollAnswerVoters.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PollAnswerVoters, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PollAnswerVoters;
  static deserializeBinaryFromReader(message: PollAnswerVoters, reader: jspb.BinaryReader): PollAnswerVoters;
}

export namespace PollAnswerVoters {
  export type AsObject = {
    chosen: boolean,
    correct: boolean,
    option: Uint8Array | string,
    voters: number,
  }
}

export enum DocumentType {
  DOCUMENTTYPEUNKNOWN = 0,
  DOCUMENTTYPEPHOTO = 1,
  DOCUMENTTYPEVOICE = 2,
  DOCUMENTTYPEVIDEO = 3,
  DOCUMENTTYPEWEBPAGE = 4,
  DOCUMENTTYPERESERVED1 = 5,
  DOCUMENTTYPERESERVED2 = 6,
  DOCUMENTTYPERESERVED3 = 7,
  DOCUMENTTYPERESERVED4 = 8,
}

export enum DocumentAttributeType {
  ATTRIBUTETYPENONE = 0,
  ATTRIBUTETYPEAUDIO = 1,
  ATTRIBUTETYPEVIDEO = 2,
  ATTRIBUTETYPEPHOTO = 3,
  ATTRIBUTETYPEFILE = 4,
  ATTRIBUTETYPEANIMATED = 5,
  ATTRIBUTETYPEVOICECALL = 6,
  ATTRIBUTERESERVED2 = 7,
  ATTRIBUTERESERVED3 = 8,
  ATTRIBUTERESERVED4 = 9,
}

