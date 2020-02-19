/* tslint:disable */
// package: msg
// file: bot.api.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";

export class BotStart extends jspb.Message {
  hasBot(): boolean;
  clearBot(): void;
  getBot(): chat_core_types_pb.InputPeer;
  setBot(value?: chat_core_types_pb.InputPeer): void;

  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasStartparam(): boolean;
  clearStartparam(): void;
  getStartparam(): string | undefined;
  setStartparam(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotStart.AsObject;
  static toObject(includeInstance: boolean, msg: BotStart): BotStart.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotStart, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotStart;
  static deserializeBinaryFromReader(message: BotStart, reader: jspb.BinaryReader): BotStart;
}

export namespace BotStart {
  export type AsObject = {
    bot: chat_core_types_pb.InputPeer.AsObject,
    randomid?: number,
    startparam?: string,
  }
}

export class BotSetInfo extends jspb.Message {
  hasBotid(): boolean;
  clearBotid(): void;
  getBotid(): number | undefined;
  setBotid(value: number): void;

  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasOwner(): boolean;
  clearOwner(): void;
  getOwner(): number | undefined;
  setOwner(value: number): void;

  clearBotcommandsList(): void;
  getBotcommandsList(): Array<chat_core_types_pb.BotCommands>;
  setBotcommandsList(value: Array<chat_core_types_pb.BotCommands>): void;
  addBotcommands(value?: chat_core_types_pb.BotCommands, index?: number): chat_core_types_pb.BotCommands;

  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): string | undefined;
  setDescription(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotSetInfo.AsObject;
  static toObject(includeInstance: boolean, msg: BotSetInfo): BotSetInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotSetInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotSetInfo;
  static deserializeBinaryFromReader(message: BotSetInfo, reader: jspb.BinaryReader): BotSetInfo;
}

export namespace BotSetInfo {
  export type AsObject = {
    botid?: number,
    randomid?: number,
    owner?: number,
    botcommandsList: Array<chat_core_types_pb.BotCommands.AsObject>,
    description?: string,
  }
}

export class BotGet extends jspb.Message {
  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasLimit(): boolean;
  clearLimit(): void;
  getLimit(): number | undefined;
  setLimit(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotGet.AsObject;
  static toObject(includeInstance: boolean, msg: BotGet): BotGet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotGet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotGet;
  static deserializeBinaryFromReader(message: BotGet, reader: jspb.BinaryReader): BotGet;
}

export namespace BotGet {
  export type AsObject = {
    userid?: string,
    limit?: number,
  }
}

export class BotSendMessage extends jspb.Message {
  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

  hasCleardraft(): boolean;
  clearCleardraft(): void;
  getCleardraft(): boolean | undefined;
  setCleardraft(value: boolean): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<chat_core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<chat_core_types_pb.MessageEntity>): void;
  addEntities(value?: chat_core_types_pb.MessageEntity, index?: number): chat_core_types_pb.MessageEntity;

  hasReplymarkup(): boolean;
  clearReplymarkup(): void;
  getReplymarkup(): number | undefined;
  setReplymarkup(value: number): void;

  hasReplymarkupdata(): boolean;
  clearReplymarkupdata(): void;
  getReplymarkupdata(): Uint8Array | string;
  getReplymarkupdata_asU8(): Uint8Array;
  getReplymarkupdata_asB64(): string;
  setReplymarkupdata(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotSendMessage.AsObject;
  static toObject(includeInstance: boolean, msg: BotSendMessage): BotSendMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotSendMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotSendMessage;
  static deserializeBinaryFromReader(message: BotSendMessage, reader: jspb.BinaryReader): BotSendMessage;
}

export namespace BotSendMessage {
  export type AsObject = {
    randomid?: number,
    peer: chat_core_types_pb.InputPeer.AsObject,
    body?: string,
    replyto?: number,
    cleardraft?: boolean,
    entitiesList: Array<chat_core_types_pb.MessageEntity.AsObject>,
    replymarkup?: number,
    replymarkupdata: Uint8Array | string,
  }
}

export class BotsMany extends jspb.Message {
  clearBotsList(): void;
  getBotsList(): Array<chat_core_types_pb.BotInfo>;
  setBotsList(value: Array<chat_core_types_pb.BotInfo>): void;
  addBots(value?: chat_core_types_pb.BotInfo, index?: number): chat_core_types_pb.BotInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotsMany.AsObject;
  static toObject(includeInstance: boolean, msg: BotsMany): BotsMany.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotsMany, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotsMany;
  static deserializeBinaryFromReader(message: BotsMany, reader: jspb.BinaryReader): BotsMany;
}

export namespace BotsMany {
  export type AsObject = {
    botsList: Array<chat_core_types_pb.BotInfo.AsObject>,
  }
}

export class BotUpdateProfile extends jspb.Message {
  hasBotid(): boolean;
  clearBotid(): void;
  getBotid(): number | undefined;
  setBotid(value: number): void;

  hasName(): boolean;
  clearName(): void;
  getName(): string | undefined;
  setName(value: string): void;

  hasBio(): boolean;
  clearBio(): void;
  getBio(): string | undefined;
  setBio(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotUpdateProfile.AsObject;
  static toObject(includeInstance: boolean, msg: BotUpdateProfile): BotUpdateProfile.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotUpdateProfile, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotUpdateProfile;
  static deserializeBinaryFromReader(message: BotUpdateProfile, reader: jspb.BinaryReader): BotUpdateProfile;
}

export namespace BotUpdateProfile {
  export type AsObject = {
    botid?: number,
    name?: string,
    bio?: string,
  }
}

