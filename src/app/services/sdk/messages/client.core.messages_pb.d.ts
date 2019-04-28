// package: msg
// file: client.core.messages.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";
import * as chat_api_messages_pb from "./chat.api.messages_pb";
import * as chat_core_message_medias_pb from "./chat.core.message.medias_pb";

export class ClientPendingMessage extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): number | undefined;
  setId(value: number): void;

  hasRequestid(): boolean;
  clearRequestid(): void;
  getRequestid(): number | undefined;
  setRequestid(value: number): void;

  hasPeerid(): boolean;
  clearPeerid(): void;
  getPeerid(): number | undefined;
  setPeerid(value: number): void;

  hasPeertype(): boolean;
  clearPeertype(): void;
  getPeertype(): number | undefined;
  setPeertype(value: number): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): number | undefined;
  setAccesshash(value: number): void;

  hasCreatedon(): boolean;
  clearCreatedon(): void;
  getCreatedon(): number | undefined;
  setCreatedon(value: number): void;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  hasSenderid(): boolean;
  clearSenderid(): void;
  getSenderid(): number | undefined;
  setSenderid(value: number): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<chat_core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<chat_core_types_pb.MessageEntity>): void;
  addEntities(value?: chat_core_types_pb.MessageEntity, index?: number): chat_core_types_pb.MessageEntity;

  hasMediatype(): boolean;
  clearMediatype(): void;
  getMediatype(): chat_api_messages_pb.InputMediaType | undefined;
  setMediatype(value: chat_api_messages_pb.InputMediaType): void;

  hasMedia(): boolean;
  clearMedia(): void;
  getMedia(): Uint8Array | string;
  getMedia_asU8(): Uint8Array;
  getMedia_asB64(): string;
  setMedia(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientPendingMessage.AsObject;
  static toObject(includeInstance: boolean, msg: ClientPendingMessage): ClientPendingMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClientPendingMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientPendingMessage;
  static deserializeBinaryFromReader(message: ClientPendingMessage, reader: jspb.BinaryReader): ClientPendingMessage;
}

export namespace ClientPendingMessage {
  export type AsObject = {
    id?: number,
    requestid?: number,
    peerid?: number,
    peertype?: number,
    accesshash?: number,
    createdon?: number,
    replyto?: number,
    body?: string,
    senderid?: number,
    entitiesList: Array<chat_core_types_pb.MessageEntity.AsObject>,
    mediatype?: chat_api_messages_pb.InputMediaType,
    media: Uint8Array | string,
  }
}

export class ClientSendMessageMedia extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasMediatype(): boolean;
  clearMediatype(): void;
  getMediatype(): chat_api_messages_pb.InputMediaType | undefined;
  setMediatype(value: chat_api_messages_pb.InputMediaType): void;

  hasCaption(): boolean;
  clearCaption(): void;
  getCaption(): string | undefined;
  setCaption(value: string): void;

  hasFilename(): boolean;
  clearFilename(): void;
  getFilename(): string | undefined;
  setFilename(value: string): void;

  hasFilepath(): boolean;
  clearFilepath(): void;
  getFilepath(): string | undefined;
  setFilepath(value: string): void;

  hasThumbfilepath(): boolean;
  clearThumbfilepath(): void;
  getThumbfilepath(): string | undefined;
  setThumbfilepath(value: string): void;

  hasFilemime(): boolean;
  clearFilemime(): void;
  getFilemime(): string | undefined;
  setFilemime(value: string): void;

  hasThumbmime(): boolean;
  clearThumbmime(): void;
  getThumbmime(): string | undefined;
  setThumbmime(value: string): void;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

  hasCleardraft(): boolean;
  clearCleardraft(): void;
  getCleardraft(): boolean | undefined;
  setCleardraft(value: boolean): void;

  clearAttributesList(): void;
  getAttributesList(): Array<chat_core_message_medias_pb.DocumentAttribute>;
  setAttributesList(value: Array<chat_core_message_medias_pb.DocumentAttribute>): void;
  addAttributes(value?: chat_core_message_medias_pb.DocumentAttribute, index?: number): chat_core_message_medias_pb.DocumentAttribute;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientSendMessageMedia.AsObject;
  static toObject(includeInstance: boolean, msg: ClientSendMessageMedia): ClientSendMessageMedia.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClientSendMessageMedia, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientSendMessageMedia;
  static deserializeBinaryFromReader(message: ClientSendMessageMedia, reader: jspb.BinaryReader): ClientSendMessageMedia;
}

export namespace ClientSendMessageMedia {
  export type AsObject = {
    peer: chat_core_types_pb.InputPeer.AsObject,
    mediatype?: chat_api_messages_pb.InputMediaType,
    caption?: string,
    filename?: string,
    filepath?: string,
    thumbfilepath?: string,
    filemime?: string,
    thumbmime?: string,
    replyto?: number,
    cleardraft?: boolean,
    attributesList: Array<chat_core_message_medias_pb.DocumentAttribute.AsObject>,
  }
}

