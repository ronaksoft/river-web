/* tslint:disable */
// package: msg
// file: system.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class SystemGetServerKeys extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetServerKeys.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetServerKeys): SystemGetServerKeys.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetServerKeys, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetServerKeys;
  static deserializeBinaryFromReader(message: SystemGetServerKeys, reader: jspb.BinaryReader): SystemGetServerKeys;
}

export namespace SystemGetServerKeys {
  export type AsObject = {
  }
}

export class SystemGetServerTime extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetServerTime.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetServerTime): SystemGetServerTime.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetServerTime, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetServerTime;
  static deserializeBinaryFromReader(message: SystemGetServerTime, reader: jspb.BinaryReader): SystemGetServerTime;
}

export namespace SystemGetServerTime {
  export type AsObject = {
  }
}

export class SystemGetInfo extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetInfo.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetInfo): SystemGetInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetInfo;
  static deserializeBinaryFromReader(message: SystemGetInfo, reader: jspb.BinaryReader): SystemGetInfo;
}

export namespace SystemGetInfo {
  export type AsObject = {
  }
}

export class SystemGetSalts extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetSalts.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetSalts): SystemGetSalts.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetSalts, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetSalts;
  static deserializeBinaryFromReader(message: SystemGetSalts, reader: jspb.BinaryReader): SystemGetSalts;
}

export namespace SystemGetSalts {
  export type AsObject = {
  }
}

export class SystemGetConfig extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetConfig.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetConfig): SystemGetConfig.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetConfig;
  static deserializeBinaryFromReader(message: SystemGetConfig, reader: jspb.BinaryReader): SystemGetConfig;
}

export namespace SystemGetConfig {
  export type AsObject = {
  }
}

export class SystemUploadUsage extends jspb.Message {
  clearUsageList(): void;
  getUsageList(): Array<ClientUsage>;
  setUsageList(value: Array<ClientUsage>): void;
  addUsage(value?: ClientUsage, index?: number): ClientUsage;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemUploadUsage.AsObject;
  static toObject(includeInstance: boolean, msg: SystemUploadUsage): SystemUploadUsage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemUploadUsage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemUploadUsage;
  static deserializeBinaryFromReader(message: SystemUploadUsage, reader: jspb.BinaryReader): SystemUploadUsage;
}

export namespace SystemUploadUsage {
  export type AsObject = {
    usageList: Array<ClientUsage.AsObject>,
  }
}

export class SystemGetResponse extends jspb.Message {
  clearRequestidsList(): void;
  getRequestidsList(): Array<number>;
  setRequestidsList(value: Array<number>): void;
  addRequestids(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetResponse): SystemGetResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetResponse;
  static deserializeBinaryFromReader(message: SystemGetResponse, reader: jspb.BinaryReader): SystemGetResponse;
}

export namespace SystemGetResponse {
  export type AsObject = {
    requestidsList: Array<number>,
  }
}

export class ClientUsage extends jspb.Message {
  getYear(): number;
  setYear(value: number): void;

  getMonth(): number;
  setMonth(value: number): void;

  getDay(): number;
  setDay(value: number): void;

  getUserid(): number;
  setUserid(value: number): void;

  getForegroundtime(): number;
  setForegroundtime(value: number): void;

  getAvgresponsetime(): number;
  setAvgresponsetime(value: number): void;

  getTotalrequests(): number;
  setTotalrequests(value: number): void;

  getReceivedmessages(): number;
  setReceivedmessages(value: number): void;

  getSentmessages(): number;
  setSentmessages(value: number): void;

  getReceivedmedia(): number;
  setReceivedmedia(value: number): void;

  getSentmedia(): number;
  setSentmedia(value: number): void;

  getUploadbytes(): number;
  setUploadbytes(value: number): void;

  getDownloadbytes(): number;
  setDownloadbytes(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientUsage.AsObject;
  static toObject(includeInstance: boolean, msg: ClientUsage): ClientUsage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClientUsage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientUsage;
  static deserializeBinaryFromReader(message: ClientUsage, reader: jspb.BinaryReader): ClientUsage;
}

export namespace ClientUsage {
  export type AsObject = {
    year: number,
    month: number,
    day: number,
    userid: number,
    foregroundtime: number,
    avgresponsetime: number,
    totalrequests: number,
    receivedmessages: number,
    sentmessages: number,
    receivedmedia: number,
    sentmedia: number,
    uploadbytes: number,
    downloadbytes: number,
  }
}

export class SystemConfig extends jspb.Message {
  getGifbot(): string;
  setGifbot(value: string): void;

  getWikibot(): string;
  setWikibot(value: string): void;

  getTestmode(): boolean;
  setTestmode(value: boolean): void;

  getPhonecallenabled(): boolean;
  setPhonecallenabled(value: boolean): void;

  getExpireon(): number;
  setExpireon(value: number): void;

  getGroupmaxsize(): number;
  setGroupmaxsize(value: number): void;

  getForwardedmaxcount(): number;
  setForwardedmaxcount(value: number): void;

  getOnlineupdateperiodinsec(): number;
  setOnlineupdateperiodinsec(value: number): void;

  getEdittimelimitinsec(): number;
  setEdittimelimitinsec(value: number): void;

  getRevoketimelimitinsec(): number;
  setRevoketimelimitinsec(value: number): void;

  getPinneddialogsmaxcount(): number;
  setPinneddialogsmaxcount(value: number): void;

  getUrlprefix(): number;
  setUrlprefix(value: number): void;

  getMessagemaxlength(): number;
  setMessagemaxlength(value: number): void;

  getCaptionmaxlength(): number;
  setCaptionmaxlength(value: number): void;

  clearDcsList(): void;
  getDcsList(): Array<DataCenter>;
  setDcsList(value: Array<DataCenter>): void;
  addDcs(value?: DataCenter, index?: number): DataCenter;

  getMaxlabels(): number;
  setMaxlabels(value: number): void;

  getToppeerdecayrate(): number;
  setToppeerdecayrate(value: number): void;

  getToppeermaxstep(): number;
  setToppeermaxstep(value: number): void;

  getMaxactivesessions(): number;
  setMaxactivesessions(value: number): void;

  clearReactionsList(): void;
  getReactionsList(): Array<string>;
  setReactionsList(value: Array<string>): void;
  addReactions(value: string, index?: number): string;

  getMaxuploadsize(): number;
  setMaxuploadsize(value: number): void;

  getMaxuploadpartsize(): number;
  setMaxuploadpartsize(value: number): void;

  getMaxuploadparts(): number;
  setMaxuploadparts(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemConfig.AsObject;
  static toObject(includeInstance: boolean, msg: SystemConfig): SystemConfig.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemConfig;
  static deserializeBinaryFromReader(message: SystemConfig, reader: jspb.BinaryReader): SystemConfig;
}

export namespace SystemConfig {
  export type AsObject = {
    gifbot: string,
    wikibot: string,
    testmode: boolean,
    phonecallenabled: boolean,
    expireon: number,
    groupmaxsize: number,
    forwardedmaxcount: number,
    onlineupdateperiodinsec: number,
    edittimelimitinsec: number,
    revoketimelimitinsec: number,
    pinneddialogsmaxcount: number,
    urlprefix: number,
    messagemaxlength: number,
    captionmaxlength: number,
    dcsList: Array<DataCenter.AsObject>,
    maxlabels: number,
    toppeerdecayrate: number,
    toppeermaxstep: number,
    maxactivesessions: number,
    reactionsList: Array<string>,
    maxuploadsize: number,
    maxuploadpartsize: number,
    maxuploadparts: number,
  }
}

export class DataCenter extends jspb.Message {
  getIp(): string;
  setIp(value: string): void;

  getPort(): number;
  setPort(value: number): void;

  getHttp(): boolean;
  setHttp(value: boolean): void;

  getWebsocket(): boolean;
  setWebsocket(value: boolean): void;

  getQuic(): boolean;
  setQuic(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DataCenter.AsObject;
  static toObject(includeInstance: boolean, msg: DataCenter): DataCenter.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DataCenter, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DataCenter;
  static deserializeBinaryFromReader(message: DataCenter, reader: jspb.BinaryReader): DataCenter;
}

export namespace DataCenter {
  export type AsObject = {
    ip: string,
    port: number,
    http: boolean,
    websocket: boolean,
    quic: boolean,
  }
}

export class SystemSalts extends jspb.Message {
  clearSaltsList(): void;
  getSaltsList(): Array<number>;
  setSaltsList(value: Array<number>): void;
  addSalts(value: number, index?: number): number;

  getStartsfrom(): number;
  setStartsfrom(value: number): void;

  getDuration(): number;
  setDuration(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemSalts.AsObject;
  static toObject(includeInstance: boolean, msg: SystemSalts): SystemSalts.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemSalts, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemSalts;
  static deserializeBinaryFromReader(message: SystemSalts, reader: jspb.BinaryReader): SystemSalts;
}

export namespace SystemSalts {
  export type AsObject = {
    saltsList: Array<number>,
    startsfrom: number,
    duration: number,
  }
}

export class AppUpdate extends jspb.Message {
  getAvailable(): boolean;
  setAvailable(value: boolean): void;

  getMandatory(): boolean;
  setMandatory(value: boolean): void;

  getIdentifier(): string;
  setIdentifier(value: string): void;

  getVersionname(): string;
  setVersionname(value: string): void;

  getDownloadurl(): string;
  setDownloadurl(value: string): void;

  getDescription(): string;
  setDescription(value: string): void;

  getDisplayinterval(): number;
  setDisplayinterval(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: AppUpdate): AppUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AppUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppUpdate;
  static deserializeBinaryFromReader(message: AppUpdate, reader: jspb.BinaryReader): AppUpdate;
}

export namespace AppUpdate {
  export type AsObject = {
    available: boolean,
    mandatory: boolean,
    identifier: string,
    versionname: string,
    downloadurl: string,
    description: string,
    displayinterval: number,
  }
}

export class SystemInfo extends jspb.Message {
  getWorkgroupname(): string;
  setWorkgroupname(value: string): void;

  getBigphotourl(): string;
  setBigphotourl(value: string): void;

  getSmallphotourl(): string;
  setSmallphotourl(value: string): void;

  getStorageurl(): string;
  setStorageurl(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemInfo.AsObject;
  static toObject(includeInstance: boolean, msg: SystemInfo): SystemInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemInfo;
  static deserializeBinaryFromReader(message: SystemInfo, reader: jspb.BinaryReader): SystemInfo;
}

export namespace SystemInfo {
  export type AsObject = {
    workgroupname: string,
    bigphotourl: string,
    smallphotourl: string,
    storageurl: string,
  }
}

export class SystemServerTime extends jspb.Message {
  getTimestamp(): number;
  setTimestamp(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemServerTime.AsObject;
  static toObject(includeInstance: boolean, msg: SystemServerTime): SystemServerTime.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemServerTime, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemServerTime;
  static deserializeBinaryFromReader(message: SystemServerTime, reader: jspb.BinaryReader): SystemServerTime;
}

export namespace SystemServerTime {
  export type AsObject = {
    timestamp: number,
  }
}

export class SystemKeys extends jspb.Message {
  clearRsapublickeysList(): void;
  getRsapublickeysList(): Array<core_types_pb.RSAPublicKey>;
  setRsapublickeysList(value: Array<core_types_pb.RSAPublicKey>): void;
  addRsapublickeys(value?: core_types_pb.RSAPublicKey, index?: number): core_types_pb.RSAPublicKey;

  clearDhgroupsList(): void;
  getDhgroupsList(): Array<core_types_pb.DHGroup>;
  setDhgroupsList(value: Array<core_types_pb.DHGroup>): void;
  addDhgroups(value?: core_types_pb.DHGroup, index?: number): core_types_pb.DHGroup;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemKeys.AsObject;
  static toObject(includeInstance: boolean, msg: SystemKeys): SystemKeys.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemKeys, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemKeys;
  static deserializeBinaryFromReader(message: SystemKeys, reader: jspb.BinaryReader): SystemKeys;
}

export namespace SystemKeys {
  export type AsObject = {
    rsapublickeysList: Array<core_types_pb.RSAPublicKey.AsObject>,
    dhgroupsList: Array<core_types_pb.DHGroup.AsObject>,
  }
}

