/* tslint:disable */
// package: msg
// file: bot.api.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";
import * as chat_api_messages_pb from "./chat.api.messages_pb";

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

export class BotRecall extends jspb.Message {
  hasVersion(): boolean;
  clearVersion(): void;
  getVersion(): number | undefined;
  setVersion(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotRecall.AsObject;
  static toObject(includeInstance: boolean, msg: BotRecall): BotRecall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotRecall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotRecall;
  static deserializeBinaryFromReader(message: BotRecall, reader: jspb.BinaryReader): BotRecall;
}

export namespace BotRecall {
  export type AsObject = {
    version?: number,
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

export class BotEditMessage extends jspb.Message {
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

  hasMessageid(): boolean;
  clearMessageid(): void;
  getMessageid(): number | undefined;
  setMessageid(value: number): void;

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
  toObject(includeInstance?: boolean): BotEditMessage.AsObject;
  static toObject(includeInstance: boolean, msg: BotEditMessage): BotEditMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotEditMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotEditMessage;
  static deserializeBinaryFromReader(message: BotEditMessage, reader: jspb.BinaryReader): BotEditMessage;
}

export namespace BotEditMessage {
  export type AsObject = {
    randomid?: number,
    peer: chat_core_types_pb.InputPeer.AsObject,
    body?: string,
    messageid?: number,
    entitiesList: Array<chat_core_types_pb.MessageEntity.AsObject>,
    replymarkup?: number,
    replymarkupdata: Uint8Array | string,
  }
}

export class BotSendMedia extends jspb.Message {
  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasMediatype(): boolean;
  clearMediatype(): void;
  getMediatype(): chat_api_messages_pb.InputMediaType | undefined;
  setMediatype(value: chat_api_messages_pb.InputMediaType): void;

  hasMediadata(): boolean;
  clearMediadata(): void;
  getMediadata(): Uint8Array | string;
  getMediadata_asU8(): Uint8Array;
  getMediadata_asB64(): string;
  setMediadata(value: Uint8Array | string): void;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotSendMedia.AsObject;
  static toObject(includeInstance: boolean, msg: BotSendMedia): BotSendMedia.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotSendMedia, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotSendMedia;
  static deserializeBinaryFromReader(message: BotSendMedia, reader: jspb.BinaryReader): BotSendMedia;
}

export namespace BotSendMedia {
  export type AsObject = {
    randomid?: number,
    peer: chat_core_types_pb.InputPeer.AsObject,
    mediatype?: chat_api_messages_pb.InputMediaType,
    mediadata: Uint8Array | string,
    replyto?: number,
  }
}

export class BotSaveFilePart extends jspb.Message {
  hasFileid(): boolean;
  clearFileid(): void;
  getFileid(): string | undefined;
  setFileid(value: string): void;

  hasPartid(): boolean;
  clearPartid(): void;
  getPartid(): number | undefined;
  setPartid(value: number): void;

  hasTotalparts(): boolean;
  clearTotalparts(): void;
  getTotalparts(): number | undefined;
  setTotalparts(value: number): void;

  hasBytes(): boolean;
  clearBytes(): void;
  getBytes(): Uint8Array | string;
  getBytes_asU8(): Uint8Array;
  getBytes_asB64(): string;
  setBytes(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotSaveFilePart.AsObject;
  static toObject(includeInstance: boolean, msg: BotSaveFilePart): BotSaveFilePart.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotSaveFilePart, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotSaveFilePart;
  static deserializeBinaryFromReader(message: BotSaveFilePart, reader: jspb.BinaryReader): BotSaveFilePart;
}

export namespace BotSaveFilePart {
  export type AsObject = {
    fileid?: string,
    partid?: number,
    totalparts?: number,
    bytes: Uint8Array | string,
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

export class BotUpdatePhoto extends jspb.Message {
  hasFile(): boolean;
  clearFile(): void;
  getFile(): chat_core_types_pb.InputFileLocation | undefined;
  setFile(value?: chat_core_types_pb.InputFileLocation): void;

  hasBotid(): boolean;
  clearBotid(): void;
  getBotid(): number | undefined;
  setBotid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotUpdatePhoto.AsObject;
  static toObject(includeInstance: boolean, msg: BotUpdatePhoto): BotUpdatePhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotUpdatePhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotUpdatePhoto;
  static deserializeBinaryFromReader(message: BotUpdatePhoto, reader: jspb.BinaryReader): BotUpdatePhoto;
}

export namespace BotUpdatePhoto {
  export type AsObject = {
    file?: chat_core_types_pb.InputFileLocation.AsObject,
    botid?: number,
  }
}

export class BotRevokeToken extends jspb.Message {
  hasBotid(): boolean;
  clearBotid(): void;
  getBotid(): number | undefined;
  setBotid(value: number): void;

  hasGetnew(): boolean;
  clearGetnew(): void;
  getGetnew(): boolean | undefined;
  setGetnew(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotRevokeToken.AsObject;
  static toObject(includeInstance: boolean, msg: BotRevokeToken): BotRevokeToken.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotRevokeToken, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotRevokeToken;
  static deserializeBinaryFromReader(message: BotRevokeToken, reader: jspb.BinaryReader): BotRevokeToken;
}

export namespace BotRevokeToken {
  export type AsObject = {
    botid?: number,
    getnew?: boolean,
  }
}

export class BotSetCallbackAnswer extends jspb.Message {
  hasQueryid(): boolean;
  clearQueryid(): void;
  getQueryid(): number | undefined;
  setQueryid(value: number): void;

  hasUrl(): boolean;
  clearUrl(): void;
  getUrl(): string | undefined;
  setUrl(value: string): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): string | undefined;
  setMessage(value: string): void;

  hasCachetime(): boolean;
  clearCachetime(): void;
  getCachetime(): number | undefined;
  setCachetime(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotSetCallbackAnswer.AsObject;
  static toObject(includeInstance: boolean, msg: BotSetCallbackAnswer): BotSetCallbackAnswer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotSetCallbackAnswer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotSetCallbackAnswer;
  static deserializeBinaryFromReader(message: BotSetCallbackAnswer, reader: jspb.BinaryReader): BotSetCallbackAnswer;
}

export namespace BotSetCallbackAnswer {
  export type AsObject = {
    queryid?: number,
    url?: string,
    message?: string,
    cachetime?: number,
  }
}

export class BotGetCallbackAnswer extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasMessageid(): boolean;
  clearMessageid(): void;
  getMessageid(): number | undefined;
  setMessageid(value: number): void;

  hasData(): boolean;
  clearData(): void;
  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotGetCallbackAnswer.AsObject;
  static toObject(includeInstance: boolean, msg: BotGetCallbackAnswer): BotGetCallbackAnswer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotGetCallbackAnswer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotGetCallbackAnswer;
  static deserializeBinaryFromReader(message: BotGetCallbackAnswer, reader: jspb.BinaryReader): BotGetCallbackAnswer;
}

export namespace BotGetCallbackAnswer {
  export type AsObject = {
    peer: chat_core_types_pb.InputPeer.AsObject,
    messageid?: number,
    data: Uint8Array | string,
  }
}

export class BotToken extends jspb.Message {
  hasToken(): boolean;
  clearToken(): void;
  getToken(): Uint8Array | string;
  getToken_asU8(): Uint8Array;
  getToken_asB64(): string;
  setToken(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotToken.AsObject;
  static toObject(includeInstance: boolean, msg: BotToken): BotToken.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotToken, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotToken;
  static deserializeBinaryFromReader(message: BotToken, reader: jspb.BinaryReader): BotToken;
}

export namespace BotToken {
  export type AsObject = {
    token: Uint8Array | string,
  }
}

export class BotRecalled extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): number | undefined;
  setId(value: number): void;

  hasUsername(): boolean;
  clearUsername(): void;
  getUsername(): string | undefined;
  setUsername(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotRecalled.AsObject;
  static toObject(includeInstance: boolean, msg: BotRecalled): BotRecalled.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotRecalled, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotRecalled;
  static deserializeBinaryFromReader(message: BotRecalled, reader: jspb.BinaryReader): BotRecalled;
}

export namespace BotRecalled {
  export type AsObject = {
    id?: number,
    username?: string,
  }
}

export class BotCallbackAnswer extends jspb.Message {
  hasUrl(): boolean;
  clearUrl(): void;
  getUrl(): string | undefined;
  setUrl(value: string): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): string | undefined;
  setMessage(value: string): void;

  hasCachetime(): boolean;
  clearCachetime(): void;
  getCachetime(): number | undefined;
  setCachetime(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotCallbackAnswer.AsObject;
  static toObject(includeInstance: boolean, msg: BotCallbackAnswer): BotCallbackAnswer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotCallbackAnswer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotCallbackAnswer;
  static deserializeBinaryFromReader(message: BotCallbackAnswer, reader: jspb.BinaryReader): BotCallbackAnswer;
}

export namespace BotCallbackAnswer {
  export type AsObject = {
    url?: string,
    message?: string,
    cachetime?: number,
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

export class BotGetCommands extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotGetCommands.AsObject;
  static toObject(includeInstance: boolean, msg: BotGetCommands): BotGetCommands.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotGetCommands, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotGetCommands;
  static deserializeBinaryFromReader(message: BotGetCommands, reader: jspb.BinaryReader): BotGetCommands;
}

export namespace BotGetCommands {
  export type AsObject = {
    peer: chat_core_types_pb.InputPeer.AsObject,
  }
}

export class BotCommandsMany extends jspb.Message {
  clearCommandsList(): void;
  getCommandsList(): Array<chat_core_types_pb.BotCommands>;
  setCommandsList(value: Array<chat_core_types_pb.BotCommands>): void;
  addCommands(value?: chat_core_types_pb.BotCommands, index?: number): chat_core_types_pb.BotCommands;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotCommandsMany.AsObject;
  static toObject(includeInstance: boolean, msg: BotCommandsMany): BotCommandsMany.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotCommandsMany, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotCommandsMany;
  static deserializeBinaryFromReader(message: BotCommandsMany, reader: jspb.BinaryReader): BotCommandsMany;
}

export namespace BotCommandsMany {
  export type AsObject = {
    commandsList: Array<chat_core_types_pb.BotCommands.AsObject>,
  }
}

