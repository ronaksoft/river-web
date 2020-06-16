/* tslint:disable */
// package: msg
// file: chat.bot.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";
import * as chat_messages_medias_pb from "./chat.messages.medias_pb";
import * as chat_wallpaper_pb from "./chat.wallpaper_pb";

export class BotStart extends jspb.Message {
  hasBot(): boolean;
  clearBot(): void;
  getBot(): core_types_pb.InputPeer;
  setBot(value?: core_types_pb.InputPeer): void;

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
    bot: core_types_pb.InputPeer.AsObject,
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
  getBotcommandsList(): Array<core_types_pb.BotCommands>;
  setBotcommandsList(value: Array<core_types_pb.BotCommands>): void;
  addBotcommands(value?: core_types_pb.BotCommands, index?: number): core_types_pb.BotCommands;

  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): string | undefined;
  setDescription(value: string): void;

  hasInlineplaceholder(): boolean;
  clearInlineplaceholder(): void;
  getInlineplaceholder(): string | undefined;
  setInlineplaceholder(value: string): void;

  hasInlinegeo(): boolean;
  clearInlinegeo(): void;
  getInlinegeo(): boolean | undefined;
  setInlinegeo(value: boolean): void;

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
    botcommandsList: Array<core_types_pb.BotCommands.AsObject>,
    description?: string,
    inlineplaceholder?: string,
    inlinegeo?: boolean,
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
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

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
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

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
    peer: core_types_pb.InputPeer.AsObject,
    body?: string,
    replyto?: number,
    cleardraft?: boolean,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
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
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  hasMessageid(): boolean;
  clearMessageid(): void;
  getMessageid(): number | undefined;
  setMessageid(value: number): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

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
    peer: core_types_pb.InputPeer.AsObject,
    body?: string,
    messageid?: number,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
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
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasMediatype(): boolean;
  clearMediatype(): void;
  getMediatype(): core_types_pb.InputMediaType | undefined;
  setMediatype(value: core_types_pb.InputMediaType): void;

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
    peer: core_types_pb.InputPeer.AsObject,
    mediatype?: core_types_pb.InputMediaType,
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
  getFile(): core_types_pb.InputFileLocation | undefined;
  setFile(value?: core_types_pb.InputFileLocation): void;

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
    file?: core_types_pb.InputFileLocation.AsObject,
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

export class BotDeleteMessage extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotDeleteMessage.AsObject;
  static toObject(includeInstance: boolean, msg: BotDeleteMessage): BotDeleteMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotDeleteMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotDeleteMessage;
  static deserializeBinaryFromReader(message: BotDeleteMessage, reader: jspb.BinaryReader): BotDeleteMessage;
}

export namespace BotDeleteMessage {
  export type AsObject = {
    peer: core_types_pb.InputPeer.AsObject,
    messageidsList: Array<number>,
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
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

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
    peer: core_types_pb.InputPeer.AsObject,
    messageid?: number,
    data: Uint8Array | string,
  }
}

export class BotGetInlineResults extends jspb.Message {
  hasBot(): boolean;
  clearBot(): void;
  getBot(): core_types_pb.InputUser;
  setBot(value?: core_types_pb.InputUser): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasQuery(): boolean;
  clearQuery(): void;
  getQuery(): string | undefined;
  setQuery(value: string): void;

  hasOffset(): boolean;
  clearOffset(): void;
  getOffset(): string | undefined;
  setOffset(value: string): void;

  hasLocation(): boolean;
  clearLocation(): void;
  getLocation(): core_types_pb.InputGeoLocation | undefined;
  setLocation(value?: core_types_pb.InputGeoLocation): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotGetInlineResults.AsObject;
  static toObject(includeInstance: boolean, msg: BotGetInlineResults): BotGetInlineResults.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotGetInlineResults, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotGetInlineResults;
  static deserializeBinaryFromReader(message: BotGetInlineResults, reader: jspb.BinaryReader): BotGetInlineResults;
}

export namespace BotGetInlineResults {
  export type AsObject = {
    bot: core_types_pb.InputUser.AsObject,
    peer: core_types_pb.InputPeer.AsObject,
    query?: string,
    offset?: string,
    location?: core_types_pb.InputGeoLocation.AsObject,
  }
}

export class BotSetInlineResults extends jspb.Message {
  hasGallery(): boolean;
  clearGallery(): void;
  getGallery(): boolean | undefined;
  setGallery(value: boolean): void;

  hasPrivate(): boolean;
  clearPrivate(): void;
  getPrivate(): boolean | undefined;
  setPrivate(value: boolean): void;

  hasCachetime(): boolean;
  clearCachetime(): void;
  getCachetime(): number | undefined;
  setCachetime(value: number): void;

  hasNextoffset(): boolean;
  clearNextoffset(): void;
  getNextoffset(): string | undefined;
  setNextoffset(value: string): void;

  clearResultsList(): void;
  getResultsList(): Array<InputBotInlineResult>;
  setResultsList(value: Array<InputBotInlineResult>): void;
  addResults(value?: InputBotInlineResult, index?: number): InputBotInlineResult;

  hasSwitchpm(): boolean;
  clearSwitchpm(): void;
  getSwitchpm(): BotInlineSwitchPM | undefined;
  setSwitchpm(value?: BotInlineSwitchPM): void;

  hasQueryid(): boolean;
  clearQueryid(): void;
  getQueryid(): number | undefined;
  setQueryid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotSetInlineResults.AsObject;
  static toObject(includeInstance: boolean, msg: BotSetInlineResults): BotSetInlineResults.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotSetInlineResults, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotSetInlineResults;
  static deserializeBinaryFromReader(message: BotSetInlineResults, reader: jspb.BinaryReader): BotSetInlineResults;
}

export namespace BotSetInlineResults {
  export type AsObject = {
    gallery?: boolean,
    pb_private?: boolean,
    cachetime?: number,
    nextoffset?: string,
    resultsList: Array<InputBotInlineResult.AsObject>,
    switchpm?: BotInlineSwitchPM.AsObject,
    queryid?: number,
  }
}

export class BotSendInlineResults extends jspb.Message {
  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasQueryid(): boolean;
  clearQueryid(): void;
  getQueryid(): number | undefined;
  setQueryid(value: number): void;

  hasResultid(): boolean;
  clearResultid(): void;
  getResultid(): string | undefined;
  setResultid(value: string): void;

  hasCleardraft(): boolean;
  clearCleardraft(): void;
  getCleardraft(): boolean | undefined;
  setCleardraft(value: boolean): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

  hasSilent(): boolean;
  clearSilent(): void;
  getSilent(): boolean | undefined;
  setSilent(value: boolean): void;

  hasHidevia(): boolean;
  clearHidevia(): void;
  getHidevia(): boolean | undefined;
  setHidevia(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotSendInlineResults.AsObject;
  static toObject(includeInstance: boolean, msg: BotSendInlineResults): BotSendInlineResults.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotSendInlineResults, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotSendInlineResults;
  static deserializeBinaryFromReader(message: BotSendInlineResults, reader: jspb.BinaryReader): BotSendInlineResults;
}

export namespace BotSendInlineResults {
  export type AsObject = {
    randomid?: number,
    queryid?: number,
    resultid?: string,
    cleardraft?: boolean,
    peer: core_types_pb.InputPeer.AsObject,
    replyto?: number,
    silent?: boolean,
    hidevia?: boolean,
  }
}

export class BotUploadWallPaper extends jspb.Message {
  hasFile(): boolean;
  clearFile(): void;
  getFile(): core_types_pb.InputFileLocation;
  setFile(value?: core_types_pb.InputFileLocation): void;

  hasDark(): boolean;
  clearDark(): void;
  getDark(): boolean | undefined;
  setDark(value: boolean): void;

  hasPattern(): boolean;
  clearPattern(): void;
  getPattern(): boolean | undefined;
  setPattern(value: boolean): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): chat_wallpaper_pb.WallPaperSettings;
  setSettings(value?: chat_wallpaper_pb.WallPaperSettings): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotUploadWallPaper.AsObject;
  static toObject(includeInstance: boolean, msg: BotUploadWallPaper): BotUploadWallPaper.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotUploadWallPaper, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotUploadWallPaper;
  static deserializeBinaryFromReader(message: BotUploadWallPaper, reader: jspb.BinaryReader): BotUploadWallPaper;
}

export namespace BotUploadWallPaper {
  export type AsObject = {
    file: core_types_pb.InputFileLocation.AsObject,
    dark?: boolean,
    pattern?: boolean,
    settings: chat_wallpaper_pb.WallPaperSettings.AsObject,
  }
}

export class BotResults extends jspb.Message {
  hasGallery(): boolean;
  clearGallery(): void;
  getGallery(): boolean | undefined;
  setGallery(value: boolean): void;

  hasQueryid(): boolean;
  clearQueryid(): void;
  getQueryid(): number | undefined;
  setQueryid(value: number): void;

  hasNextoffset(): boolean;
  clearNextoffset(): void;
  getNextoffset(): string | undefined;
  setNextoffset(value: string): void;

  hasSwitchpm(): boolean;
  clearSwitchpm(): void;
  getSwitchpm(): BotInlineSwitchPM | undefined;
  setSwitchpm(value?: BotInlineSwitchPM): void;

  clearResultsList(): void;
  getResultsList(): Array<BotInlineResult>;
  setResultsList(value: Array<BotInlineResult>): void;
  addResults(value?: BotInlineResult, index?: number): BotInlineResult;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotResults.AsObject;
  static toObject(includeInstance: boolean, msg: BotResults): BotResults.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotResults, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotResults;
  static deserializeBinaryFromReader(message: BotResults, reader: jspb.BinaryReader): BotResults;
}

export namespace BotResults {
  export type AsObject = {
    gallery?: boolean,
    queryid?: number,
    nextoffset?: string,
    switchpm?: BotInlineSwitchPM.AsObject,
    resultsList: Array<BotInlineResult.AsObject>,
  }
}

export class BotInlineSwitchPM extends jspb.Message {
  hasText(): boolean;
  clearText(): void;
  getText(): string | undefined;
  setText(value: string): void;

  hasStartparam(): boolean;
  clearStartparam(): void;
  getStartparam(): string | undefined;
  setStartparam(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotInlineSwitchPM.AsObject;
  static toObject(includeInstance: boolean, msg: BotInlineSwitchPM): BotInlineSwitchPM.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotInlineSwitchPM, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotInlineSwitchPM;
  static deserializeBinaryFromReader(message: BotInlineSwitchPM, reader: jspb.BinaryReader): BotInlineSwitchPM;
}

export namespace BotInlineSwitchPM {
  export type AsObject = {
    text?: string,
    startparam?: string,
  }
}

export class BotInlineResult extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): string | undefined;
  setId(value: string): void;

  hasType(): boolean;
  clearType(): void;
  getType(): core_types_pb.MediaType | undefined;
  setType(value: core_types_pb.MediaType): void;

  hasTitle(): boolean;
  clearTitle(): void;
  getTitle(): string | undefined;
  setTitle(value: string): void;

  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): string | undefined;
  setDescription(value: string): void;

  hasUrl(): boolean;
  clearUrl(): void;
  getUrl(): string | undefined;
  setUrl(value: string): void;

  hasThumb(): boolean;
  clearThumb(): void;
  getThumb(): chat_messages_medias_pb.MediaWebDocument | undefined;
  setThumb(value?: chat_messages_medias_pb.MediaWebDocument): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): BotInlineMessage;
  setMessage(value?: BotInlineMessage): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotInlineResult.AsObject;
  static toObject(includeInstance: boolean, msg: BotInlineResult): BotInlineResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotInlineResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotInlineResult;
  static deserializeBinaryFromReader(message: BotInlineResult, reader: jspb.BinaryReader): BotInlineResult;
}

export namespace BotInlineResult {
  export type AsObject = {
    id?: string,
    type?: core_types_pb.MediaType,
    title?: string,
    description?: string,
    url?: string,
    thumb?: chat_messages_medias_pb.MediaWebDocument.AsObject,
    message: BotInlineMessage.AsObject,
  }
}

export class InputBotInlineResult extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): string | undefined;
  setId(value: string): void;

  hasType(): boolean;
  clearType(): void;
  getType(): core_types_pb.InputMediaType | undefined;
  setType(value: core_types_pb.InputMediaType): void;

  hasTitle(): boolean;
  clearTitle(): void;
  getTitle(): string | undefined;
  setTitle(value: string): void;

  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): string | undefined;
  setDescription(value: string): void;

  hasUrl(): boolean;
  clearUrl(): void;
  getUrl(): string | undefined;
  setUrl(value: string): void;

  hasThumb(): boolean;
  clearThumb(): void;
  getThumb(): chat_messages_medias_pb.InputMediaWebDocument | undefined;
  setThumb(value?: chat_messages_medias_pb.InputMediaWebDocument): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): InputBotInlineMessage;
  setMessage(value?: InputBotInlineMessage): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputBotInlineResult.AsObject;
  static toObject(includeInstance: boolean, msg: InputBotInlineResult): InputBotInlineResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputBotInlineResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputBotInlineResult;
  static deserializeBinaryFromReader(message: InputBotInlineResult, reader: jspb.BinaryReader): InputBotInlineResult;
}

export namespace InputBotInlineResult {
  export type AsObject = {
    id?: string,
    type?: core_types_pb.InputMediaType,
    title?: string,
    description?: string,
    url?: string,
    thumb?: chat_messages_medias_pb.InputMediaWebDocument.AsObject,
    message: InputBotInlineMessage.AsObject,
  }
}

export class BotInlineMessage extends jspb.Message {
  hasMediadata(): boolean;
  clearMediadata(): void;
  getMediadata(): Uint8Array | string;
  getMediadata_asU8(): Uint8Array;
  getMediadata_asB64(): string;
  setMediadata(value: Uint8Array | string): void;

  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

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
  toObject(includeInstance?: boolean): BotInlineMessage.AsObject;
  static toObject(includeInstance: boolean, msg: BotInlineMessage): BotInlineMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotInlineMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotInlineMessage;
  static deserializeBinaryFromReader(message: BotInlineMessage, reader: jspb.BinaryReader): BotInlineMessage;
}

export namespace BotInlineMessage {
  export type AsObject = {
    mediadata: Uint8Array | string,
    body?: string,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
    replyto?: number,
    replymarkup?: number,
    replymarkupdata: Uint8Array | string,
  }
}

export class InputBotInlineMessage extends jspb.Message {
  hasInputmediadata(): boolean;
  clearInputmediadata(): void;
  getInputmediadata(): Uint8Array | string;
  getInputmediadata_asU8(): Uint8Array;
  getInputmediadata_asB64(): string;
  setInputmediadata(value: Uint8Array | string): void;

  hasNowebpage(): boolean;
  clearNowebpage(): void;
  getNowebpage(): boolean | undefined;
  setNowebpage(value: boolean): void;

  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

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
  toObject(includeInstance?: boolean): InputBotInlineMessage.AsObject;
  static toObject(includeInstance: boolean, msg: InputBotInlineMessage): InputBotInlineMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputBotInlineMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputBotInlineMessage;
  static deserializeBinaryFromReader(message: InputBotInlineMessage, reader: jspb.BinaryReader): InputBotInlineMessage;
}

export namespace InputBotInlineMessage {
  export type AsObject = {
    inputmediadata: Uint8Array | string,
    nowebpage?: boolean,
    body?: string,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
    replyto?: number,
    replymarkup?: number,
    replymarkupdata: Uint8Array | string,
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
  getBotsList(): Array<core_types_pb.BotInfo>;
  setBotsList(value: Array<core_types_pb.BotInfo>): void;
  addBots(value?: core_types_pb.BotInfo, index?: number): core_types_pb.BotInfo;

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
    botsList: Array<core_types_pb.BotInfo.AsObject>,
  }
}

export class BotGetCommands extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

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
    peer: core_types_pb.InputPeer.AsObject,
  }
}

export class BotCommandsMany extends jspb.Message {
  clearCommandsList(): void;
  getCommandsList(): Array<core_types_pb.BotCommands>;
  setCommandsList(value: Array<core_types_pb.BotCommands>): void;
  addCommands(value?: core_types_pb.BotCommands, index?: number): core_types_pb.BotCommands;

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
    commandsList: Array<core_types_pb.BotCommands.AsObject>,
  }
}

