/* tslint:disable */
// package: msg
// file: chat.community.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class CommunitySendMessage extends jspb.Message {
  getRandomid(): number;
  setRandomid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getBody(): string;
  setBody(value: string): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

  getReplymarkup(): number;
  setReplymarkup(value: number): void;

  getReplymarkupdata(): Uint8Array | string;
  getReplymarkupdata_asU8(): Uint8Array;
  getReplymarkupdata_asB64(): string;
  setReplymarkupdata(value: Uint8Array | string): void;

  getSenderid(): number;
  setSenderid(value: number): void;

  getSendermsgid(): number;
  setSendermsgid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommunitySendMessage.AsObject;
  static toObject(includeInstance: boolean, msg: CommunitySendMessage): CommunitySendMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommunitySendMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommunitySendMessage;
  static deserializeBinaryFromReader(message: CommunitySendMessage, reader: jspb.BinaryReader): CommunitySendMessage;
}

export namespace CommunitySendMessage {
  export type AsObject = {
    randomid: number,
    peer?: core_types_pb.InputPeer.AsObject,
    body: string,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
    replymarkup: number,
    replymarkupdata: Uint8Array | string,
    senderid: number,
    sendermsgid: number,
  }
}

export class CommunitySendMedia extends jspb.Message {
  getRandomid(): number;
  setRandomid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getMediatype(): core_types_pb.InputMediaTypeMap[keyof core_types_pb.InputMediaTypeMap];
  setMediatype(value: core_types_pb.InputMediaTypeMap[keyof core_types_pb.InputMediaTypeMap]): void;

  getMediadata(): Uint8Array | string;
  getMediadata_asU8(): Uint8Array;
  getMediadata_asB64(): string;
  setMediadata(value: Uint8Array | string): void;

  getReplyto(): number;
  setReplyto(value: number): void;

  getCleardraft(): boolean;
  setCleardraft(value: boolean): void;

  getSenderid(): number;
  setSenderid(value: number): void;

  getSendermsgid(): number;
  setSendermsgid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommunitySendMedia.AsObject;
  static toObject(includeInstance: boolean, msg: CommunitySendMedia): CommunitySendMedia.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommunitySendMedia, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommunitySendMedia;
  static deserializeBinaryFromReader(message: CommunitySendMedia, reader: jspb.BinaryReader): CommunitySendMedia;
}

export namespace CommunitySendMedia {
  export type AsObject = {
    randomid: number,
    peer?: core_types_pb.InputPeer.AsObject,
    mediatype: core_types_pb.InputMediaTypeMap[keyof core_types_pb.InputMediaTypeMap],
    mediadata: Uint8Array | string,
    replyto: number,
    cleardraft: boolean,
    senderid: number,
    sendermsgid: number,
  }
}

export class CommunitySetTyping extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getAction(): core_types_pb.TypingActionMap[keyof core_types_pb.TypingActionMap];
  setAction(value: core_types_pb.TypingActionMap[keyof core_types_pb.TypingActionMap]): void;

  getSenderid(): number;
  setSenderid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommunitySetTyping.AsObject;
  static toObject(includeInstance: boolean, msg: CommunitySetTyping): CommunitySetTyping.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommunitySetTyping, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommunitySetTyping;
  static deserializeBinaryFromReader(message: CommunitySetTyping, reader: jspb.BinaryReader): CommunitySetTyping;
}

export namespace CommunitySetTyping {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    action: core_types_pb.TypingActionMap[keyof core_types_pb.TypingActionMap],
    senderid: number,
  }
}

export class CommunityGetUpdates extends jspb.Message {
  getWaitafterinms(): number;
  setWaitafterinms(value: number): void;

  getWaitmaxinms(): number;
  setWaitmaxinms(value: number): void;

  getSizelimit(): number;
  setSizelimit(value: number): void;

  getOffsetid(): number;
  setOffsetid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommunityGetUpdates.AsObject;
  static toObject(includeInstance: boolean, msg: CommunityGetUpdates): CommunityGetUpdates.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommunityGetUpdates, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommunityGetUpdates;
  static deserializeBinaryFromReader(message: CommunityGetUpdates, reader: jspb.BinaryReader): CommunityGetUpdates;
}

export namespace CommunityGetUpdates {
  export type AsObject = {
    waitafterinms: number,
    waitmaxinms: number,
    sizelimit: number,
    offsetid: number,
  }
}

export class CommunityGetMembers extends jspb.Message {
  getOffset(): number;
  setOffset(value: number): void;

  getLimit(): number;
  setLimit(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommunityGetMembers.AsObject;
  static toObject(includeInstance: boolean, msg: CommunityGetMembers): CommunityGetMembers.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommunityGetMembers, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommunityGetMembers;
  static deserializeBinaryFromReader(message: CommunityGetMembers, reader: jspb.BinaryReader): CommunityGetMembers;
}

export namespace CommunityGetMembers {
  export type AsObject = {
    offset: number,
    limit: number,
  }
}

export class CommunityRecall extends jspb.Message {
  getTeamid(): number;
  setTeamid(value: number): void;

  getAccesskey(): Uint8Array | string;
  getAccesskey_asU8(): Uint8Array;
  getAccesskey_asB64(): string;
  setAccesskey(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommunityRecall.AsObject;
  static toObject(includeInstance: boolean, msg: CommunityRecall): CommunityRecall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommunityRecall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommunityRecall;
  static deserializeBinaryFromReader(message: CommunityRecall, reader: jspb.BinaryReader): CommunityRecall;
}

export namespace CommunityRecall {
  export type AsObject = {
    teamid: number,
    accesskey: Uint8Array | string,
  }
}

export class CommunityAuthorizeUser extends jspb.Message {
  getPhone(): string;
  setPhone(value: string): void;

  getFirstname(): string;
  setFirstname(value: string): void;

  getLastname(): string;
  setLastname(value: string): void;

  getProvider(): string;
  setProvider(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommunityAuthorizeUser.AsObject;
  static toObject(includeInstance: boolean, msg: CommunityAuthorizeUser): CommunityAuthorizeUser.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommunityAuthorizeUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommunityAuthorizeUser;
  static deserializeBinaryFromReader(message: CommunityAuthorizeUser, reader: jspb.BinaryReader): CommunityAuthorizeUser;
}

export namespace CommunityAuthorizeUser {
  export type AsObject = {
    phone: string,
    firstname: string,
    lastname: string,
    provider: string,
  }
}

export class CommunityUser extends jspb.Message {
  getUserid(): number;
  setUserid(value: number): void;

  getFirstname(): string;
  setFirstname(value: string): void;

  getLastname(): string;
  setLastname(value: string): void;

  getPhone(): string;
  setPhone(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommunityUser.AsObject;
  static toObject(includeInstance: boolean, msg: CommunityUser): CommunityUser.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommunityUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommunityUser;
  static deserializeBinaryFromReader(message: CommunityUser, reader: jspb.BinaryReader): CommunityUser;
}

export namespace CommunityUser {
  export type AsObject = {
    userid: number,
    firstname: string,
    lastname: string,
    phone: string,
  }
}

export class CommunityUpdateEnvelope extends jspb.Message {
  getOffsetid(): number;
  setOffsetid(value: number): void;

  getPartitionid(): number;
  setPartitionid(value: number): void;

  getConstructor(): number;
  setConstructor(value: number): void;

  getUpdate(): Uint8Array | string;
  getUpdate_asU8(): Uint8Array;
  getUpdate_asB64(): string;
  setUpdate(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommunityUpdateEnvelope.AsObject;
  static toObject(includeInstance: boolean, msg: CommunityUpdateEnvelope): CommunityUpdateEnvelope.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommunityUpdateEnvelope, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommunityUpdateEnvelope;
  static deserializeBinaryFromReader(message: CommunityUpdateEnvelope, reader: jspb.BinaryReader): CommunityUpdateEnvelope;
}

export namespace CommunityUpdateEnvelope {
  export type AsObject = {
    offsetid: number,
    partitionid: number,
    constructor: number,
    update: Uint8Array | string,
  }
}

export class CommunityUpdateContainer extends jspb.Message {
  clearUpdatesList(): void;
  getUpdatesList(): Array<CommunityUpdateEnvelope>;
  setUpdatesList(value: Array<CommunityUpdateEnvelope>): void;
  addUpdates(value?: CommunityUpdateEnvelope, index?: number): CommunityUpdateEnvelope;

  getEmpty(): boolean;
  setEmpty(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommunityUpdateContainer.AsObject;
  static toObject(includeInstance: boolean, msg: CommunityUpdateContainer): CommunityUpdateContainer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommunityUpdateContainer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommunityUpdateContainer;
  static deserializeBinaryFromReader(message: CommunityUpdateContainer, reader: jspb.BinaryReader): CommunityUpdateContainer;
}

export namespace CommunityUpdateContainer {
  export type AsObject = {
    updatesList: Array<CommunityUpdateEnvelope.AsObject>,
    empty: boolean,
  }
}

