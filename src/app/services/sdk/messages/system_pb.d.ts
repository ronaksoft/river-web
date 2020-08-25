/* tslint:disable */
// package: msg
// file: system.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class SystemGetPublicKeys extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetPublicKeys.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetPublicKeys): SystemGetPublicKeys.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetPublicKeys, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetPublicKeys;
  static deserializeBinaryFromReader(message: SystemGetPublicKeys, reader: jspb.BinaryReader): SystemGetPublicKeys;
}

export namespace SystemGetPublicKeys {
  export type AsObject = {
  }
}

export class SystemGetDHGroups extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemGetDHGroups.AsObject;
  static toObject(includeInstance: boolean, msg: SystemGetDHGroups): SystemGetDHGroups.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemGetDHGroups, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemGetDHGroups;
  static deserializeBinaryFromReader(message: SystemGetDHGroups, reader: jspb.BinaryReader): SystemGetDHGroups;
}

export namespace SystemGetDHGroups {
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
  hasYear(): boolean;
  clearYear(): void;
  getYear(): number | undefined;
  setYear(value: number): void;

  hasMonth(): boolean;
  clearMonth(): void;
  getMonth(): number | undefined;
  setMonth(value: number): void;

  hasDay(): boolean;
  clearDay(): void;
  getDay(): number | undefined;
  setDay(value: number): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): number | undefined;
  setUserid(value: number): void;

  hasForegroundtime(): boolean;
  clearForegroundtime(): void;
  getForegroundtime(): number | undefined;
  setForegroundtime(value: number): void;

  hasAvgresponsetime(): boolean;
  clearAvgresponsetime(): void;
  getAvgresponsetime(): number | undefined;
  setAvgresponsetime(value: number): void;

  hasTotalrequests(): boolean;
  clearTotalrequests(): void;
  getTotalrequests(): number | undefined;
  setTotalrequests(value: number): void;

  hasReceivedmessages(): boolean;
  clearReceivedmessages(): void;
  getReceivedmessages(): number | undefined;
  setReceivedmessages(value: number): void;

  hasSentmessages(): boolean;
  clearSentmessages(): void;
  getSentmessages(): number | undefined;
  setSentmessages(value: number): void;

  hasReceivedmedia(): boolean;
  clearReceivedmedia(): void;
  getReceivedmedia(): number | undefined;
  setReceivedmedia(value: number): void;

  hasSentmedia(): boolean;
  clearSentmedia(): void;
  getSentmedia(): number | undefined;
  setSentmedia(value: number): void;

  hasUploadbytes(): boolean;
  clearUploadbytes(): void;
  getUploadbytes(): number | undefined;
  setUploadbytes(value: number): void;

  hasDownloadbytes(): boolean;
  clearDownloadbytes(): void;
  getDownloadbytes(): number | undefined;
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
    year?: number,
    month?: number,
    day?: number,
    userid?: number,
    foregroundtime?: number,
    avgresponsetime?: number,
    totalrequests?: number,
    receivedmessages?: number,
    sentmessages?: number,
    receivedmedia?: number,
    sentmedia?: number,
    uploadbytes?: number,
    downloadbytes?: number,
  }
}

export class SystemConfig extends jspb.Message {
  hasGifbot(): boolean;
  clearGifbot(): void;
  getGifbot(): string | undefined;
  setGifbot(value: string): void;

  hasWikibot(): boolean;
  clearWikibot(): void;
  getWikibot(): string | undefined;
  setWikibot(value: string): void;

  hasTestmode(): boolean;
  clearTestmode(): void;
  getTestmode(): boolean | undefined;
  setTestmode(value: boolean): void;

  hasPhonecallenabled(): boolean;
  clearPhonecallenabled(): void;
  getPhonecallenabled(): boolean | undefined;
  setPhonecallenabled(value: boolean): void;

  hasExpireon(): boolean;
  clearExpireon(): void;
  getExpireon(): number | undefined;
  setExpireon(value: number): void;

  hasGroupmaxsize(): boolean;
  clearGroupmaxsize(): void;
  getGroupmaxsize(): number | undefined;
  setGroupmaxsize(value: number): void;

  hasForwardedmaxcount(): boolean;
  clearForwardedmaxcount(): void;
  getForwardedmaxcount(): number | undefined;
  setForwardedmaxcount(value: number): void;

  hasOnlineupdateperiodinsec(): boolean;
  clearOnlineupdateperiodinsec(): void;
  getOnlineupdateperiodinsec(): number | undefined;
  setOnlineupdateperiodinsec(value: number): void;

  hasEdittimelimitinsec(): boolean;
  clearEdittimelimitinsec(): void;
  getEdittimelimitinsec(): number | undefined;
  setEdittimelimitinsec(value: number): void;

  hasRevoketimelimitinsec(): boolean;
  clearRevoketimelimitinsec(): void;
  getRevoketimelimitinsec(): number | undefined;
  setRevoketimelimitinsec(value: number): void;

  hasPinneddialogsmaxcount(): boolean;
  clearPinneddialogsmaxcount(): void;
  getPinneddialogsmaxcount(): number | undefined;
  setPinneddialogsmaxcount(value: number): void;

  hasUrlprefix(): boolean;
  clearUrlprefix(): void;
  getUrlprefix(): number | undefined;
  setUrlprefix(value: number): void;

  hasMessagemaxlength(): boolean;
  clearMessagemaxlength(): void;
  getMessagemaxlength(): number | undefined;
  setMessagemaxlength(value: number): void;

  hasCaptionmaxlength(): boolean;
  clearCaptionmaxlength(): void;
  getCaptionmaxlength(): number | undefined;
  setCaptionmaxlength(value: number): void;

  clearDcsList(): void;
  getDcsList(): Array<DataCenter>;
  setDcsList(value: Array<DataCenter>): void;
  addDcs(value?: DataCenter, index?: number): DataCenter;

  hasMaxlabels(): boolean;
  clearMaxlabels(): void;
  getMaxlabels(): number | undefined;
  setMaxlabels(value: number): void;

  hasToppeerdecayrate(): boolean;
  clearToppeerdecayrate(): void;
  getToppeerdecayrate(): number | undefined;
  setToppeerdecayrate(value: number): void;

  hasToppeermaxstep(): boolean;
  clearToppeermaxstep(): void;
  getToppeermaxstep(): number | undefined;
  setToppeermaxstep(value: number): void;

  hasMaxactivesessions(): boolean;
  clearMaxactivesessions(): void;
  getMaxactivesessions(): number | undefined;
  setMaxactivesessions(value: number): void;

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
    gifbot?: string,
    wikibot?: string,
    testmode?: boolean,
    phonecallenabled?: boolean,
    expireon?: number,
    groupmaxsize?: number,
    forwardedmaxcount?: number,
    onlineupdateperiodinsec?: number,
    edittimelimitinsec?: number,
    revoketimelimitinsec?: number,
    pinneddialogsmaxcount?: number,
    urlprefix?: number,
    messagemaxlength?: number,
    captionmaxlength?: number,
    dcsList: Array<DataCenter.AsObject>,
    maxlabels?: number,
    toppeerdecayrate?: number,
    toppeermaxstep?: number,
    maxactivesessions?: number,
  }
}

export class DataCenter extends jspb.Message {
  hasIp(): boolean;
  clearIp(): void;
  getIp(): string | undefined;
  setIp(value: string): void;

  hasPort(): boolean;
  clearPort(): void;
  getPort(): number | undefined;
  setPort(value: number): void;

  hasHttp(): boolean;
  clearHttp(): void;
  getHttp(): boolean | undefined;
  setHttp(value: boolean): void;

  hasWebsocket(): boolean;
  clearWebsocket(): void;
  getWebsocket(): boolean | undefined;
  setWebsocket(value: boolean): void;

  hasQuic(): boolean;
  clearQuic(): void;
  getQuic(): boolean | undefined;
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
    ip?: string,
    port?: number,
    http?: boolean,
    websocket?: boolean,
    quic?: boolean,
  }
}

export class SystemSalts extends jspb.Message {
  clearSaltsList(): void;
  getSaltsList(): Array<number>;
  setSaltsList(value: Array<number>): void;
  addSalts(value: number, index?: number): number;

  hasStartsfrom(): boolean;
  clearStartsfrom(): void;
  getStartsfrom(): number | undefined;
  setStartsfrom(value: number): void;

  hasDuration(): boolean;
  clearDuration(): void;
  getDuration(): number | undefined;
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
    startsfrom?: number,
    duration?: number,
  }
}

export class AppUpdate extends jspb.Message {
  hasAvailable(): boolean;
  clearAvailable(): void;
  getAvailable(): boolean | undefined;
  setAvailable(value: boolean): void;

  hasMandatory(): boolean;
  clearMandatory(): void;
  getMandatory(): boolean | undefined;
  setMandatory(value: boolean): void;

  hasIdentifier(): boolean;
  clearIdentifier(): void;
  getIdentifier(): string | undefined;
  setIdentifier(value: string): void;

  hasVersionname(): boolean;
  clearVersionname(): void;
  getVersionname(): string | undefined;
  setVersionname(value: string): void;

  hasDownloadurl(): boolean;
  clearDownloadurl(): void;
  getDownloadurl(): string | undefined;
  setDownloadurl(value: string): void;

  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): string | undefined;
  setDescription(value: string): void;

  hasDisplayinterval(): boolean;
  clearDisplayinterval(): void;
  getDisplayinterval(): number | undefined;
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
    available?: boolean,
    mandatory?: boolean,
    identifier?: string,
    versionname?: string,
    downloadurl?: string,
    description?: string,
    displayinterval?: number,
  }
}

export class SystemInfo extends jspb.Message {
  hasWorkgroupname(): boolean;
  clearWorkgroupname(): void;
  getWorkgroupname(): string | undefined;
  setWorkgroupname(value: string): void;

  hasBigphotourl(): boolean;
  clearBigphotourl(): void;
  getBigphotourl(): string | undefined;
  setBigphotourl(value: string): void;

  hasSmallphotourl(): boolean;
  clearSmallphotourl(): void;
  getSmallphotourl(): string | undefined;
  setSmallphotourl(value: string): void;

  hasStorageurl(): boolean;
  clearStorageurl(): void;
  getStorageurl(): string | undefined;
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
    workgroupname?: string,
    bigphotourl?: string,
    smallphotourl?: string,
    storageurl?: string,
  }
}

export class SystemServerTime extends jspb.Message {
  hasTimestamp(): boolean;
  clearTimestamp(): void;
  getTimestamp(): number | undefined;
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
    timestamp?: number,
  }
}

export class SystemPublicKeys extends jspb.Message {
  clearRsapublickeysList(): void;
  getRsapublickeysList(): Array<core_types_pb.RSAPublicKey>;
  setRsapublickeysList(value: Array<core_types_pb.RSAPublicKey>): void;
  addRsapublickeys(value?: core_types_pb.RSAPublicKey, index?: number): core_types_pb.RSAPublicKey;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemPublicKeys.AsObject;
  static toObject(includeInstance: boolean, msg: SystemPublicKeys): SystemPublicKeys.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemPublicKeys, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemPublicKeys;
  static deserializeBinaryFromReader(message: SystemPublicKeys, reader: jspb.BinaryReader): SystemPublicKeys;
}

export namespace SystemPublicKeys {
  export type AsObject = {
    rsapublickeysList: Array<core_types_pb.RSAPublicKey.AsObject>,
  }
}

export class SystemDHGroups extends jspb.Message {
  clearDhgroupsList(): void;
  getDhgroupsList(): Array<core_types_pb.DHGroup>;
  setDhgroupsList(value: Array<core_types_pb.DHGroup>): void;
  addDhgroups(value?: core_types_pb.DHGroup, index?: number): core_types_pb.DHGroup;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemDHGroups.AsObject;
  static toObject(includeInstance: boolean, msg: SystemDHGroups): SystemDHGroups.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemDHGroups, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemDHGroups;
  static deserializeBinaryFromReader(message: SystemDHGroups, reader: jspb.BinaryReader): SystemDHGroups;
}

export namespace SystemDHGroups {
  export type AsObject = {
    dhgroupsList: Array<core_types_pb.DHGroup.AsObject>,
  }
}

