/* tslint:disable */
// package: msg
// file: core.types.proto

import * as jspb from "google-protobuf";
import * as rony_pb from "./rony_pb";

export class Ping extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Ping.AsObject;
  static toObject(includeInstance: boolean, msg: Ping): Ping.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Ping, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Ping;
  static deserializeBinaryFromReader(message: Ping, reader: jspb.BinaryReader): Ping;
}

export namespace Ping {
  export type AsObject = {
    id: number,
  }
}

export class Pong extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Pong.AsObject;
  static toObject(includeInstance: boolean, msg: Pong): Pong.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Pong, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Pong;
  static deserializeBinaryFromReader(message: Pong, reader: jspb.BinaryReader): Pong;
}

export namespace Pong {
  export type AsObject = {
    id: number,
  }
}

export class UpdateEnvelope extends jspb.Message {
  getConstructor(): number;
  setConstructor(value: number): void;

  getUpdate(): Uint8Array | string;
  getUpdate_asU8(): Uint8Array;
  getUpdate_asB64(): string;
  setUpdate(value: Uint8Array | string): void;

  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTimestamp(): number;
  setTimestamp(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateEnvelope.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateEnvelope): UpdateEnvelope.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateEnvelope, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateEnvelope;
  static deserializeBinaryFromReader(message: UpdateEnvelope, reader: jspb.BinaryReader): UpdateEnvelope;
}

export namespace UpdateEnvelope {
  export type AsObject = {
    constructor: number,
    update: Uint8Array | string,
    ucount: number,
    updateid: number,
    timestamp: number,
  }
}

export class UpdateContainer extends jspb.Message {
  getLength(): number;
  setLength(value: number): void;

  clearUpdatesList(): void;
  getUpdatesList(): Array<UpdateEnvelope>;
  setUpdatesList(value: Array<UpdateEnvelope>): void;
  addUpdates(value?: UpdateEnvelope, index?: number): UpdateEnvelope;

  getMinupdateid(): number;
  setMinupdateid(value: number): void;

  getMaxupdateid(): number;
  setMaxupdateid(value: number): void;

  clearUsersList(): void;
  getUsersList(): Array<User>;
  setUsersList(value: Array<User>): void;
  addUsers(value?: User, index?: number): User;

  clearGroupsList(): void;
  getGroupsList(): Array<Group>;
  setGroupsList(value: Array<Group>): void;
  addGroups(value?: Group, index?: number): Group;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateContainer.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateContainer): UpdateContainer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateContainer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateContainer;
  static deserializeBinaryFromReader(message: UpdateContainer, reader: jspb.BinaryReader): UpdateContainer;
}

export namespace UpdateContainer {
  export type AsObject = {
    length: number,
    updatesList: Array<UpdateEnvelope.AsObject>,
    minupdateid: number,
    maxupdateid: number,
    usersList: Array<User.AsObject>,
    groupsList: Array<Group.AsObject>,
  }
}

export class ProtoMessage extends jspb.Message {
  getAuthid(): number;
  setAuthid(value: number): void;

  getMessagekey(): Uint8Array | string;
  getMessagekey_asU8(): Uint8Array;
  getMessagekey_asB64(): string;
  setMessagekey(value: Uint8Array | string): void;

  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProtoMessage.AsObject;
  static toObject(includeInstance: boolean, msg: ProtoMessage): ProtoMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ProtoMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProtoMessage;
  static deserializeBinaryFromReader(message: ProtoMessage, reader: jspb.BinaryReader): ProtoMessage;
}

export namespace ProtoMessage {
  export type AsObject = {
    authid: number,
    messagekey: Uint8Array | string,
    payload: Uint8Array | string,
  }
}

export class ProtoEncryptedPayload extends jspb.Message {
  getServersalt(): number;
  setServersalt(value: number): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  getSessionid(): number;
  setSessionid(value: number): void;

  hasEnvelope(): boolean;
  clearEnvelope(): void;
  getEnvelope(): rony_pb.MessageEnvelope | undefined;
  setEnvelope(value?: rony_pb.MessageEnvelope): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProtoEncryptedPayload.AsObject;
  static toObject(includeInstance: boolean, msg: ProtoEncryptedPayload): ProtoEncryptedPayload.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ProtoEncryptedPayload, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProtoEncryptedPayload;
  static deserializeBinaryFromReader(message: ProtoEncryptedPayload, reader: jspb.BinaryReader): ProtoEncryptedPayload;
}

export namespace ProtoEncryptedPayload {
  export type AsObject = {
    serversalt: number,
    messageid: number,
    sessionid: number,
    envelope?: rony_pb.MessageEnvelope.AsObject,
  }
}

export class Ack extends jspb.Message {
  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Ack.AsObject;
  static toObject(includeInstance: boolean, msg: Ack): Ack.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Ack, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Ack;
  static deserializeBinaryFromReader(message: Ack, reader: jspb.BinaryReader): Ack;
}

export namespace Ack {
  export type AsObject = {
    messageidsList: Array<number>,
  }
}

export class Bool extends jspb.Message {
  getResult(): boolean;
  setResult(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Bool.AsObject;
  static toObject(includeInstance: boolean, msg: Bool): Bool.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Bool, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Bool;
  static deserializeBinaryFromReader(message: Bool, reader: jspb.BinaryReader): Bool;
}

export namespace Bool {
  export type AsObject = {
    result: boolean,
  }
}

export class Dialog extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getPeerid(): string;
  setPeerid(value: string): void;

  getPeertype(): number;
  setPeertype(value: number): void;

  getTopmessageid(): number;
  setTopmessageid(value: number): void;

  getReadinboxmaxid(): number;
  setReadinboxmaxid(value: number): void;

  getReadoutboxmaxid(): number;
  setReadoutboxmaxid(value: number): void;

  getUnreadcount(): number;
  setUnreadcount(value: number): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  hasNotifysettings(): boolean;
  clearNotifysettings(): void;
  getNotifysettings(): PeerNotifySettings | undefined;
  setNotifysettings(value?: PeerNotifySettings): void;

  getMentionedcount(): number;
  setMentionedcount(value: number): void;

  getPinned(): boolean;
  setPinned(value: boolean): void;

  hasDraft(): boolean;
  clearDraft(): void;
  getDraft(): DraftMessage | undefined;
  setDraft(value?: DraftMessage): void;

  getPinnedmessageid(): number;
  setPinnedmessageid(value: number): void;

  getActivecallid(): string;
  setActivecallid(value: string): void;

  getReadonly(): boolean;
  setReadonly(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Dialog.AsObject;
  static toObject(includeInstance: boolean, msg: Dialog): Dialog.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Dialog, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Dialog;
  static deserializeBinaryFromReader(message: Dialog, reader: jspb.BinaryReader): Dialog;
}

export namespace Dialog {
  export type AsObject = {
    teamid: string,
    peerid: string,
    peertype: number,
    topmessageid: number,
    readinboxmaxid: number,
    readoutboxmaxid: number,
    unreadcount: number,
    accesshash: string,
    notifysettings?: PeerNotifySettings.AsObject,
    mentionedcount: number,
    pinned: boolean,
    draft?: DraftMessage.AsObject,
    pinnedmessageid: number,
    activecallid: string,
    readonly: boolean,
  }
}

export class InputPeer extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getType(): PeerType;
  setType(value: PeerType): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputPeer.AsObject;
  static toObject(includeInstance: boolean, msg: InputPeer): InputPeer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputPeer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputPeer;
  static deserializeBinaryFromReader(message: InputPeer, reader: jspb.BinaryReader): InputPeer;
}

export namespace InputPeer {
  export type AsObject = {
    id: string,
    type: PeerType,
    accesshash: string,
  }
}

export class Peer extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getType(): number;
  setType(value: number): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Peer.AsObject;
  static toObject(includeInstance: boolean, msg: Peer): Peer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Peer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Peer;
  static deserializeBinaryFromReader(message: Peer, reader: jspb.BinaryReader): Peer;
}

export namespace Peer {
  export type AsObject = {
    id: string,
    type: number,
    accesshash: string,
  }
}

export class InputPassword extends jspb.Message {
  getSrpid(): string;
  setSrpid(value: string): void;

  getA(): Uint8Array | string;
  getA_asU8(): Uint8Array;
  getA_asB64(): string;
  setA(value: Uint8Array | string): void;

  getM1(): Uint8Array | string;
  getM1_asU8(): Uint8Array;
  getM1_asB64(): string;
  setM1(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputPassword.AsObject;
  static toObject(includeInstance: boolean, msg: InputPassword): InputPassword.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputPassword, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputPassword;
  static deserializeBinaryFromReader(message: InputPassword, reader: jspb.BinaryReader): InputPassword;
}

export namespace InputPassword {
  export type AsObject = {
    srpid: string,
    a: Uint8Array | string,
    m1: Uint8Array | string,
  }
}

export class InputFileLocation extends jspb.Message {
  getClusterid(): number;
  setClusterid(value: number): void;

  getFileid(): string;
  setFileid(value: string): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  getVersion(): number;
  setVersion(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputFileLocation.AsObject;
  static toObject(includeInstance: boolean, msg: InputFileLocation): InputFileLocation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputFileLocation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputFileLocation;
  static deserializeBinaryFromReader(message: InputFileLocation, reader: jspb.BinaryReader): InputFileLocation;
}

export namespace InputFileLocation {
  export type AsObject = {
    clusterid: number,
    fileid: string,
    accesshash: string,
    version: number,
  }
}

export class FileLocation extends jspb.Message {
  getClusterid(): number;
  setClusterid(value: number): void;

  getFileid(): string;
  setFileid(value: string): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FileLocation.AsObject;
  static toObject(includeInstance: boolean, msg: FileLocation): FileLocation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FileLocation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FileLocation;
  static deserializeBinaryFromReader(message: FileLocation, reader: jspb.BinaryReader): FileLocation;
}

export namespace FileLocation {
  export type AsObject = {
    clusterid: number,
    fileid: string,
    accesshash: string,
  }
}

export class WebLocation extends jspb.Message {
  getUrl(): string;
  setUrl(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WebLocation.AsObject;
  static toObject(includeInstance: boolean, msg: WebLocation): WebLocation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WebLocation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WebLocation;
  static deserializeBinaryFromReader(message: WebLocation, reader: jspb.BinaryReader): WebLocation;
}

export namespace WebLocation {
  export type AsObject = {
    url: string,
  }
}

export class InputWebLocation extends jspb.Message {
  getUrl(): string;
  setUrl(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputWebLocation.AsObject;
  static toObject(includeInstance: boolean, msg: InputWebLocation): InputWebLocation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputWebLocation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputWebLocation;
  static deserializeBinaryFromReader(message: InputWebLocation, reader: jspb.BinaryReader): InputWebLocation;
}

export namespace InputWebLocation {
  export type AsObject = {
    url: string,
  }
}

export class UserPhoto extends jspb.Message {
  hasPhotobig(): boolean;
  clearPhotobig(): void;
  getPhotobig(): FileLocation | undefined;
  setPhotobig(value?: FileLocation): void;

  hasPhotosmall(): boolean;
  clearPhotosmall(): void;
  getPhotosmall(): FileLocation | undefined;
  setPhotosmall(value?: FileLocation): void;

  getPhotoid(): string;
  setPhotoid(value: string): void;

  hasPhotobigweb(): boolean;
  clearPhotobigweb(): void;
  getPhotobigweb(): WebLocation | undefined;
  setPhotobigweb(value?: WebLocation): void;

  hasPhotosmallweb(): boolean;
  clearPhotosmallweb(): void;
  getPhotosmallweb(): WebLocation | undefined;
  setPhotosmallweb(value?: WebLocation): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserPhoto.AsObject;
  static toObject(includeInstance: boolean, msg: UserPhoto): UserPhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UserPhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserPhoto;
  static deserializeBinaryFromReader(message: UserPhoto, reader: jspb.BinaryReader): UserPhoto;
}

export namespace UserPhoto {
  export type AsObject = {
    photobig?: FileLocation.AsObject,
    photosmall?: FileLocation.AsObject,
    photoid: string,
    photobigweb?: WebLocation.AsObject,
    photosmallweb?: WebLocation.AsObject,
  }
}

export class InputUser extends jspb.Message {
  getUserid(): string;
  setUserid(value: string): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputUser.AsObject;
  static toObject(includeInstance: boolean, msg: InputUser): InputUser.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputUser;
  static deserializeBinaryFromReader(message: InputUser, reader: jspb.BinaryReader): InputUser;
}

export namespace InputUser {
  export type AsObject = {
    userid: string,
    accesshash: string,
  }
}

export class User extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getFirstname(): string;
  setFirstname(value: string): void;

  getLastname(): string;
  setLastname(value: string): void;

  getUsername(): string;
  setUsername(value: string): void;

  getStatus(): UserStatus;
  setStatus(value: UserStatus): void;

  getRestricted(): boolean;
  setRestricted(value: boolean): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): UserPhoto | undefined;
  setPhoto(value?: UserPhoto): void;

  getBio(): string;
  setBio(value: string): void;

  getPhone(): string;
  setPhone(value: string): void;

  getLastseen(): number;
  setLastseen(value: number): void;

  clearPhotogalleryList(): void;
  getPhotogalleryList(): Array<UserPhoto>;
  setPhotogalleryList(value: Array<UserPhoto>): void;
  addPhotogallery(value?: UserPhoto, index?: number): UserPhoto;

  getIsbot(): boolean;
  setIsbot(value: boolean): void;

  getDeleted(): boolean;
  setDeleted(value: boolean): void;

  getBlocked(): boolean;
  setBlocked(value: boolean): void;

  hasBotinfo(): boolean;
  clearBotinfo(): void;
  getBotinfo(): BotInfo | undefined;
  setBotinfo(value?: BotInfo): void;

  getOfficial(): boolean;
  setOfficial(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): User.AsObject;
  static toObject(includeInstance: boolean, msg: User): User.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: User, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): User;
  static deserializeBinaryFromReader(message: User, reader: jspb.BinaryReader): User;
}

export namespace User {
  export type AsObject = {
    id: string,
    firstname: string,
    lastname: string,
    username: string,
    status: UserStatus,
    restricted: boolean,
    accesshash: string,
    photo?: UserPhoto.AsObject,
    bio: string,
    phone: string,
    lastseen: number,
    photogalleryList: Array<UserPhoto.AsObject>,
    isbot: boolean,
    deleted: boolean,
    blocked: boolean,
    botinfo?: BotInfo.AsObject,
    official: boolean,
  }
}

export class ContactUser extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getFirstname(): string;
  setFirstname(value: string): void;

  getLastname(): string;
  setLastname(value: string): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  getPhone(): string;
  setPhone(value: string): void;

  getUsername(): string;
  setUsername(value: string): void;

  getClientid(): string;
  setClientid(value: string): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): UserPhoto | undefined;
  setPhoto(value?: UserPhoto): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactUser.AsObject;
  static toObject(includeInstance: boolean, msg: ContactUser): ContactUser.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactUser;
  static deserializeBinaryFromReader(message: ContactUser, reader: jspb.BinaryReader): ContactUser;
}

export namespace ContactUser {
  export type AsObject = {
    id: string,
    firstname: string,
    lastname: string,
    accesshash: string,
    phone: string,
    username: string,
    clientid: string,
    photo?: UserPhoto.AsObject,
  }
}

export class Bot extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getName(): string;
  setName(value: string): void;

  getUsername(): string;
  setUsername(value: string): void;

  getBio(): string;
  setBio(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Bot.AsObject;
  static toObject(includeInstance: boolean, msg: Bot): Bot.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Bot, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Bot;
  static deserializeBinaryFromReader(message: Bot, reader: jspb.BinaryReader): Bot;
}

export namespace Bot {
  export type AsObject = {
    id: string,
    name: string,
    username: string,
    bio: string,
  }
}

export class BotCommands extends jspb.Message {
  getCommand(): string;
  setCommand(value: string): void;

  getDescription(): string;
  setDescription(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotCommands.AsObject;
  static toObject(includeInstance: boolean, msg: BotCommands): BotCommands.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotCommands, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotCommands;
  static deserializeBinaryFromReader(message: BotCommands, reader: jspb.BinaryReader): BotCommands;
}

export namespace BotCommands {
  export type AsObject = {
    command: string,
    description: string,
  }
}

export class BotInfo extends jspb.Message {
  hasBot(): boolean;
  clearBot(): void;
  getBot(): Bot | undefined;
  setBot(value?: Bot): void;

  getUserid(): number;
  setUserid(value: number): void;

  getDescription(): string;
  setDescription(value: string): void;

  clearBotcommandsList(): void;
  getBotcommandsList(): Array<BotCommands>;
  setBotcommandsList(value: Array<BotCommands>): void;
  addBotcommands(value?: BotCommands, index?: number): BotCommands;

  getInlinegeo(): boolean;
  setInlinegeo(value: boolean): void;

  getInlineplaceholder(): string;
  setInlineplaceholder(value: string): void;

  getInlinequery(): boolean;
  setInlinequery(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotInfo.AsObject;
  static toObject(includeInstance: boolean, msg: BotInfo): BotInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotInfo;
  static deserializeBinaryFromReader(message: BotInfo, reader: jspb.BinaryReader): BotInfo;
}

export namespace BotInfo {
  export type AsObject = {
    bot?: Bot.AsObject,
    userid: number,
    description: string,
    botcommandsList: Array<BotCommands.AsObject>,
    inlinegeo: boolean,
    inlineplaceholder: string,
    inlinequery: boolean,
  }
}

export class GroupPhoto extends jspb.Message {
  hasPhotobig(): boolean;
  clearPhotobig(): void;
  getPhotobig(): FileLocation | undefined;
  setPhotobig(value?: FileLocation): void;

  hasPhotosmall(): boolean;
  clearPhotosmall(): void;
  getPhotosmall(): FileLocation | undefined;
  setPhotosmall(value?: FileLocation): void;

  getPhotoid(): string;
  setPhotoid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupPhoto.AsObject;
  static toObject(includeInstance: boolean, msg: GroupPhoto): GroupPhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupPhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupPhoto;
  static deserializeBinaryFromReader(message: GroupPhoto, reader: jspb.BinaryReader): GroupPhoto;
}

export namespace GroupPhoto {
  export type AsObject = {
    photobig?: FileLocation.AsObject,
    photosmall?: FileLocation.AsObject,
    photoid: string,
  }
}

export class Group extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getId(): string;
  setId(value: string): void;

  getTitle(): string;
  setTitle(value: string): void;

  getCreatedon(): number;
  setCreatedon(value: number): void;

  getParticipants(): number;
  setParticipants(value: number): void;

  getEditedon(): number;
  setEditedon(value: number): void;

  clearFlagsList(): void;
  getFlagsList(): Array<GroupFlags>;
  setFlagsList(value: Array<GroupFlags>): void;
  addFlags(value: GroupFlags, index?: number): GroupFlags;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): GroupPhoto | undefined;
  setPhoto(value?: GroupPhoto): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Group.AsObject;
  static toObject(includeInstance: boolean, msg: Group): Group.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Group, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Group;
  static deserializeBinaryFromReader(message: Group, reader: jspb.BinaryReader): Group;
}

export namespace Group {
  export type AsObject = {
    teamid: string,
    id: string,
    title: string,
    createdon: number,
    participants: number,
    editedon: number,
    flagsList: Array<GroupFlags>,
    photo?: GroupPhoto.AsObject,
  }
}

export class GroupFull extends jspb.Message {
  hasGroup(): boolean;
  clearGroup(): void;
  getGroup(): Group | undefined;
  setGroup(value?: Group): void;

  clearUsersList(): void;
  getUsersList(): Array<User>;
  setUsersList(value: Array<User>): void;
  addUsers(value?: User, index?: number): User;

  clearParticipantsList(): void;
  getParticipantsList(): Array<GroupParticipant>;
  setParticipantsList(value: Array<GroupParticipant>): void;
  addParticipants(value?: GroupParticipant, index?: number): GroupParticipant;

  hasNotifysettings(): boolean;
  clearNotifysettings(): void;
  getNotifysettings(): PeerNotifySettings | undefined;
  setNotifysettings(value?: PeerNotifySettings): void;

  clearPhotogalleryList(): void;
  getPhotogalleryList(): Array<GroupPhoto>;
  setPhotogalleryList(value: Array<GroupPhoto>): void;
  addPhotogallery(value?: GroupPhoto, index?: number): GroupPhoto;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupFull.AsObject;
  static toObject(includeInstance: boolean, msg: GroupFull): GroupFull.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupFull, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupFull;
  static deserializeBinaryFromReader(message: GroupFull, reader: jspb.BinaryReader): GroupFull;
}

export namespace GroupFull {
  export type AsObject = {
    group?: Group.AsObject,
    usersList: Array<User.AsObject>,
    participantsList: Array<GroupParticipant.AsObject>,
    notifysettings?: PeerNotifySettings.AsObject,
    photogalleryList: Array<GroupPhoto.AsObject>,
  }
}

export class GroupParticipant extends jspb.Message {
  getUserid(): string;
  setUserid(value: string): void;

  getFirstname(): string;
  setFirstname(value: string): void;

  getLastname(): string;
  setLastname(value: string): void;

  getType(): ParticipantType;
  setType(value: ParticipantType): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  getUsername(): string;
  setUsername(value: string): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): UserPhoto | undefined;
  setPhoto(value?: UserPhoto): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupParticipant.AsObject;
  static toObject(includeInstance: boolean, msg: GroupParticipant): GroupParticipant.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupParticipant, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupParticipant;
  static deserializeBinaryFromReader(message: GroupParticipant, reader: jspb.BinaryReader): GroupParticipant;
}

export namespace GroupParticipant {
  export type AsObject = {
    userid: string,
    firstname: string,
    lastname: string,
    type: ParticipantType,
    accesshash: string,
    username: string,
    photo?: UserPhoto.AsObject,
  }
}

export class UserMessage extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getId(): number;
  setId(value: number): void;

  getPeerid(): string;
  setPeerid(value: string): void;

  getPeertype(): number;
  setPeertype(value: number): void;

  getCreatedon(): number;
  setCreatedon(value: number): void;

  getEditedon(): number;
  setEditedon(value: number): void;

  getFwd(): boolean;
  setFwd(value: boolean): void;

  getFwdsenderid(): string;
  setFwdsenderid(value: string): void;

  getFwdchannelid(): string;
  setFwdchannelid(value: string): void;

  getFwdchannelmessageid(): string;
  setFwdchannelmessageid(value: string): void;

  getFlags(): number;
  setFlags(value: number): void;

  getMessagetype(): number;
  setMessagetype(value: number): void;

  getBody(): string;
  setBody(value: string): void;

  getSenderid(): string;
  setSenderid(value: string): void;

  getContentread(): boolean;
  setContentread(value: boolean): void;

  getInbox(): boolean;
  setInbox(value: boolean): void;

  getReplyto(): number;
  setReplyto(value: number): void;

  getMessageaction(): number;
  setMessageaction(value: number): void;

  getMessageactiondata(): Uint8Array | string;
  getMessageactiondata_asU8(): Uint8Array;
  getMessageactiondata_asB64(): string;
  setMessageactiondata(value: Uint8Array | string): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<MessageEntity>;
  setEntitiesList(value: Array<MessageEntity>): void;
  addEntities(value?: MessageEntity, index?: number): MessageEntity;

  getMediatype(): MediaType;
  setMediatype(value: MediaType): void;

  getMedia(): Uint8Array | string;
  getMedia_asU8(): Uint8Array;
  getMedia_asB64(): string;
  setMedia(value: Uint8Array | string): void;

  getReplymarkup(): number;
  setReplymarkup(value: number): void;

  getReplymarkupdata(): Uint8Array | string;
  getReplymarkupdata_asU8(): Uint8Array;
  getReplymarkupdata_asB64(): string;
  setReplymarkupdata(value: Uint8Array | string): void;

  clearLabelidsList(): void;
  getLabelidsList(): Array<number>;
  setLabelidsList(value: Array<number>): void;
  addLabelids(value: number, index?: number): number;

  getViabotid(): string;
  setViabotid(value: string): void;

  clearReactionsList(): void;
  getReactionsList(): Array<ReactionCounter>;
  setReactionsList(value: Array<ReactionCounter>): void;
  addReactions(value?: ReactionCounter, index?: number): ReactionCounter;

  clearYourreactionsList(): void;
  getYourreactionsList(): Array<string>;
  setYourreactionsList(value: Array<string>): void;
  addYourreactions(value: string, index?: number): string;

  getMediacat(): MediaCategory;
  setMediacat(value: MediaCategory): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserMessage.AsObject;
  static toObject(includeInstance: boolean, msg: UserMessage): UserMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UserMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserMessage;
  static deserializeBinaryFromReader(message: UserMessage, reader: jspb.BinaryReader): UserMessage;
}

export namespace UserMessage {
  export type AsObject = {
    teamid: string,
    id: number,
    peerid: string,
    peertype: number,
    createdon: number,
    editedon: number,
    fwd: boolean,
    fwdsenderid: string,
    fwdchannelid: string,
    fwdchannelmessageid: string,
    flags: number,
    messagetype: number,
    body: string,
    senderid: string,
    contentread: boolean,
    inbox: boolean,
    replyto: number,
    messageaction: number,
    messageactiondata: Uint8Array | string,
    entitiesList: Array<MessageEntity.AsObject>,
    mediatype: MediaType,
    media: Uint8Array | string,
    replymarkup: number,
    replymarkupdata: Uint8Array | string,
    labelidsList: Array<number>,
    viabotid: string,
    reactionsList: Array<ReactionCounter.AsObject>,
    yourreactionsList: Array<string>,
    mediacat: MediaCategory,
  }
}

export class ReactionCounter extends jspb.Message {
  getReaction(): string;
  setReaction(value: string): void;

  getTotal(): number;
  setTotal(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReactionCounter.AsObject;
  static toObject(includeInstance: boolean, msg: ReactionCounter): ReactionCounter.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReactionCounter, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReactionCounter;
  static deserializeBinaryFromReader(message: ReactionCounter, reader: jspb.BinaryReader): ReactionCounter;
}

export namespace ReactionCounter {
  export type AsObject = {
    reaction: string,
    total: number,
  }
}

export class DraftMessage extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getPeerid(): string;
  setPeerid(value: string): void;

  getPeertype(): number;
  setPeertype(value: number): void;

  getDate(): number;
  setDate(value: number): void;

  getBody(): string;
  setBody(value: string): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<MessageEntity>;
  setEntitiesList(value: Array<MessageEntity>): void;
  addEntities(value?: MessageEntity, index?: number): MessageEntity;

  getReplyto(): number;
  setReplyto(value: number): void;

  getEditedid(): number;
  setEditedid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DraftMessage.AsObject;
  static toObject(includeInstance: boolean, msg: DraftMessage): DraftMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DraftMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DraftMessage;
  static deserializeBinaryFromReader(message: DraftMessage, reader: jspb.BinaryReader): DraftMessage;
}

export namespace DraftMessage {
  export type AsObject = {
    teamid: string,
    peerid: string,
    peertype: number,
    date: number,
    body: string,
    entitiesList: Array<MessageEntity.AsObject>,
    replyto: number,
    editedid: number,
  }
}

export class MessageEntity extends jspb.Message {
  getType(): MessageEntityType;
  setType(value: MessageEntityType): void;

  getOffset(): number;
  setOffset(value: number): void;

  getLength(): number;
  setLength(value: number): void;

  getUserid(): string;
  setUserid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageEntity.AsObject;
  static toObject(includeInstance: boolean, msg: MessageEntity): MessageEntity.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageEntity, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageEntity;
  static deserializeBinaryFromReader(message: MessageEntity, reader: jspb.BinaryReader): MessageEntity;
}

export namespace MessageEntity {
  export type AsObject = {
    type: MessageEntityType,
    offset: number,
    length: number,
    userid: string,
  }
}

export class RSAPublicKey extends jspb.Message {
  getFingerprint(): string;
  setFingerprint(value: string): void;

  getN(): string;
  setN(value: string): void;

  getE(): number;
  setE(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RSAPublicKey.AsObject;
  static toObject(includeInstance: boolean, msg: RSAPublicKey): RSAPublicKey.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RSAPublicKey, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RSAPublicKey;
  static deserializeBinaryFromReader(message: RSAPublicKey, reader: jspb.BinaryReader): RSAPublicKey;
}

export namespace RSAPublicKey {
  export type AsObject = {
    fingerprint: string,
    n: string,
    e: number,
  }
}

export class DHGroup extends jspb.Message {
  getFingerprint(): string;
  setFingerprint(value: string): void;

  getPrime(): string;
  setPrime(value: string): void;

  getGen(): number;
  setGen(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DHGroup.AsObject;
  static toObject(includeInstance: boolean, msg: DHGroup): DHGroup.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DHGroup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DHGroup;
  static deserializeBinaryFromReader(message: DHGroup, reader: jspb.BinaryReader): DHGroup;
}

export namespace DHGroup {
  export type AsObject = {
    fingerprint: string,
    prime: string,
    gen: number,
  }
}

export class PhoneContact extends jspb.Message {
  getClientid(): string;
  setClientid(value: string): void;

  getFirstname(): string;
  setFirstname(value: string): void;

  getLastname(): string;
  setLastname(value: string): void;

  getPhone(): string;
  setPhone(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneContact.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneContact): PhoneContact.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneContact, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneContact;
  static deserializeBinaryFromReader(message: PhoneContact, reader: jspb.BinaryReader): PhoneContact;
}

export namespace PhoneContact {
  export type AsObject = {
    clientid: string,
    firstname: string,
    lastname: string,
    phone: string,
  }
}

export class PeerNotifySettings extends jspb.Message {
  getFlags(): number;
  setFlags(value: number): void;

  getMuteuntil(): number;
  setMuteuntil(value: number): void;

  getSound(): string;
  setSound(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PeerNotifySettings.AsObject;
  static toObject(includeInstance: boolean, msg: PeerNotifySettings): PeerNotifySettings.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PeerNotifySettings, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PeerNotifySettings;
  static deserializeBinaryFromReader(message: PeerNotifySettings, reader: jspb.BinaryReader): PeerNotifySettings;
}

export namespace PeerNotifySettings {
  export type AsObject = {
    flags: number,
    muteuntil: number,
    sound: string,
  }
}

export class InputFile extends jspb.Message {
  getFileid(): string;
  setFileid(value: string): void;

  getTotalparts(): number;
  setTotalparts(value: number): void;

  getFilename(): string;
  setFilename(value: string): void;

  getMd5checksum(): string;
  setMd5checksum(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputFile.AsObject;
  static toObject(includeInstance: boolean, msg: InputFile): InputFile.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputFile, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputFile;
  static deserializeBinaryFromReader(message: InputFile, reader: jspb.BinaryReader): InputFile;
}

export namespace InputFile {
  export type AsObject = {
    fileid: string,
    totalparts: number,
    filename: string,
    md5checksum: string,
  }
}

export class InputDocument extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  getClusterid(): number;
  setClusterid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputDocument.AsObject;
  static toObject(includeInstance: boolean, msg: InputDocument): InputDocument.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputDocument, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputDocument;
  static deserializeBinaryFromReader(message: InputDocument, reader: jspb.BinaryReader): InputDocument;
}

export namespace InputDocument {
  export type AsObject = {
    id: string,
    accesshash: string,
    clusterid: number,
  }
}

export class PrivacyRule extends jspb.Message {
  getPrivacytype(): PrivacyType;
  setPrivacytype(value: PrivacyType): void;

  clearUseridsList(): void;
  getUseridsList(): Array<string>;
  setUseridsList(value: Array<string>): void;
  addUserids(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrivacyRule.AsObject;
  static toObject(includeInstance: boolean, msg: PrivacyRule): PrivacyRule.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PrivacyRule, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrivacyRule;
  static deserializeBinaryFromReader(message: PrivacyRule, reader: jspb.BinaryReader): PrivacyRule;
}

export namespace PrivacyRule {
  export type AsObject = {
    privacytype: PrivacyType,
    useridsList: Array<string>,
  }
}

export class Label extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getName(): string;
  setName(value: string): void;

  getColour(): string;
  setColour(value: string): void;

  getCount(): number;
  setCount(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Label.AsObject;
  static toObject(includeInstance: boolean, msg: Label): Label.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Label, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Label;
  static deserializeBinaryFromReader(message: Label, reader: jspb.BinaryReader): Label;
}

export namespace Label {
  export type AsObject = {
    id: number,
    name: string,
    colour: string,
    count: number,
  }
}

export class LabelsMany extends jspb.Message {
  clearLabelsList(): void;
  getLabelsList(): Array<Label>;
  setLabelsList(value: Array<Label>): void;
  addLabels(value?: Label, index?: number): Label;

  getEmpty(): boolean;
  setEmpty(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LabelsMany.AsObject;
  static toObject(includeInstance: boolean, msg: LabelsMany): LabelsMany.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LabelsMany, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LabelsMany;
  static deserializeBinaryFromReader(message: LabelsMany, reader: jspb.BinaryReader): LabelsMany;
}

export namespace LabelsMany {
  export type AsObject = {
    labelsList: Array<Label.AsObject>,
    empty: boolean,
  }
}

export class InputGeoLocation extends jspb.Message {
  getLat(): number;
  setLat(value: number): void;

  getLong(): number;
  setLong(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputGeoLocation.AsObject;
  static toObject(includeInstance: boolean, msg: InputGeoLocation): InputGeoLocation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputGeoLocation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputGeoLocation;
  static deserializeBinaryFromReader(message: InputGeoLocation, reader: jspb.BinaryReader): InputGeoLocation;
}

export namespace InputGeoLocation {
  export type AsObject = {
    lat: number,
    pb_long: number,
  }
}

export class GeoLocation extends jspb.Message {
  getLat(): number;
  setLat(value: number): void;

  getLong(): number;
  setLong(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GeoLocation.AsObject;
  static toObject(includeInstance: boolean, msg: GeoLocation): GeoLocation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GeoLocation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GeoLocation;
  static deserializeBinaryFromReader(message: GeoLocation, reader: jspb.BinaryReader): GeoLocation;
}

export namespace GeoLocation {
  export type AsObject = {
    lat: number,
    pb_long: number,
  }
}

export class InputTeam extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputTeam.AsObject;
  static toObject(includeInstance: boolean, msg: InputTeam): InputTeam.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InputTeam, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputTeam;
  static deserializeBinaryFromReader(message: InputTeam, reader: jspb.BinaryReader): InputTeam;
}

export namespace InputTeam {
  export type AsObject = {
    id: string,
    accesshash: string,
  }
}

export class TeamPhoto extends jspb.Message {
  hasPhotobig(): boolean;
  clearPhotobig(): void;
  getPhotobig(): FileLocation | undefined;
  setPhotobig(value?: FileLocation): void;

  hasPhotosmall(): boolean;
  clearPhotosmall(): void;
  getPhotosmall(): FileLocation | undefined;
  setPhotosmall(value?: FileLocation): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamPhoto.AsObject;
  static toObject(includeInstance: boolean, msg: TeamPhoto): TeamPhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamPhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamPhoto;
  static deserializeBinaryFromReader(message: TeamPhoto, reader: jspb.BinaryReader): TeamPhoto;
}

export namespace TeamPhoto {
  export type AsObject = {
    photobig?: FileLocation.AsObject,
    photosmall?: FileLocation.AsObject,
  }
}

export class Team extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getName(): string;
  setName(value: string): void;

  getCreatorid(): string;
  setCreatorid(value: string): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  clearFlagsList(): void;
  getFlagsList(): Array<TeamFlags>;
  setFlagsList(value: Array<TeamFlags>): void;
  addFlags(value: TeamFlags, index?: number): TeamFlags;

  getCapacity(): number;
  setCapacity(value: number): void;

  getCommunity(): boolean;
  setCommunity(value: boolean): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): TeamPhoto | undefined;
  setPhoto(value?: TeamPhoto): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Team.AsObject;
  static toObject(includeInstance: boolean, msg: Team): Team.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Team, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Team;
  static deserializeBinaryFromReader(message: Team, reader: jspb.BinaryReader): Team;
}

export namespace Team {
  export type AsObject = {
    id: string,
    name: string,
    creatorid: string,
    accesshash: string,
    flagsList: Array<TeamFlags>,
    capacity: number,
    community: boolean,
    photo?: TeamPhoto.AsObject,
  }
}

export enum TypingAction {
  TYPINGACTIONTYPING = 0,
  TYPINGACTIONRECORDINGVOICE = 1,
  TYPINGACTIONRECORDINGVIDEO = 2,
  TYPINGACTIONUPLOADING = 3,
  TYPINGACTIONCANCEL = 4,
}

export enum PeerType {
  PEERSELF = 0,
  PEERUSER = 1,
  PEERGROUP = 2,
  PEEREXTERNALUSER = 3,
  PEERCHANNEL = 4,
}

export enum UserStatus {
  USERSTATUSOFFLINE = 0,
  USERSTATUSONLINE = 1,
  USERSTATUSRECENTLY = 2,
  USERSTATUSLASTWEEK = 3,
  USERSTATUSLASTMONTH = 4,
}

export enum GroupFlags {
  GROUPFLAGSEMPTY = 0,
  GROUPFLAGSCREATOR = 1,
  GROUPFLAGSNONPARTICIPANT = 2,
  GROUPFLAGSADMIN = 3,
  GROUPFLAGSADMINSENABLED = 4,
  GROUPFLAGSDEACTIVATED = 5,
  GROUPFLAGSADMINONLY = 6,
  GROUPFLAGSRESERVED1 = 7,
  GROUPFLAGSRESERVED2 = 8,
  GROUPFLAGSRESERVED3 = 9,
  GROUPFLAGSRESERVED4 = 10,
}

export enum ParticipantType {
  PARTICIPANTTYPEMEMBER = 0,
  PARTICIPANTTYPEADMIN = 1,
  PARTICIPANTTYPECREATOR = 2,
}

export enum InputMediaType {
  INPUTMEDIATYPEEMPTY = 0,
  INPUTMEDIATYPEINVOICE = 1,
  INPUTMEDIATYPEPOLL = 2,
  INPUTMEDIATYPECONTACT = 3,
  INPUTMEDIATYPEUPLOADEDDOCUMENT = 4,
  INPUTMEDIATYPEDOCUMENT = 5,
  INPUTMEDIATYPEGEOLOCATION = 6,
  INPUTMEDIATYPEWEBDOCUMENT = 7,
  INPUTMEDIATYPESEALED = 8,
  INPUTMEDIATYPEMESSAGEDOCUMENT = 9,
  INPUTMEDIATYPERESERVED4 = 10,
  INPUTMEDIATYPERESERVED5 = 11,
  INPUTMEDIATYPERESERVED6 = 12,
  INPUTMEDIATYPERESERVED7 = 13,
  INPUTMEDIATYPERESERVED8 = 14,
}

export enum MediaType {
  MEDIATYPEEMPTY = 0,
  MEDIATYPEPOLL = 1,
  MEDIATYPEDOCUMENT = 2,
  MEDIATYPECONTACT = 3,
  MEDIATYPEGEOLOCATION = 4,
  MEDIATYPEINVOICE = 5,
  MEDIATYPEWEBDOCUMENT = 6,
  MEDIATYPESEALED = 7,
  MEDIATYPERESERVED1 = 8,
  MEDIATYPERESERVED2 = 9,
  MEDIATYPERESERVED3 = 10,
  MEDIATYPERESERVED4 = 11,
  MEDIATYPERESERVED5 = 12,
  MEDIATYPERESERVED6 = 13,
}

export enum MediaCategory {
  MEDIACATEGORYNONE = 0,
  MEDIACATEGORYAUDIO = 1,
  MEDIACATEGORYVOICE = 2,
  MEDIACATEGORYMEDIA = 3,
  MEDIACATEGORYFILE = 4,
  MEDIACATEGORYGIF = 5,
  MEDIACATEGORYWEB = 6,
  MEDIACATEGORYCONTACT = 7,
  MEDIACATEGORYLOCATION = 8,
  MEDIACATEGORYPOLL = 9,
  MEDIACATEGORYRESERVED0 = 10,
  MEDIACATEGORYRESERVED1 = 11,
  MEDIACATEGORYRESERVED2 = 12,
  MEDIACATEGORYRESERVED3 = 13,
  MEDIACATEGORYRESERVED4 = 14,
  MEDIACATEGORYRESERVED5 = 15,
}

export enum MessageEntityType {
  MESSAGEENTITYTYPEBOLD = 0,
  MESSAGEENTITYTYPEITALIC = 1,
  MESSAGEENTITYTYPEMENTION = 2,
  MESSAGEENTITYTYPEURL = 3,
  MESSAGEENTITYTYPEEMAIL = 4,
  MESSAGEENTITYTYPEHASHTAG = 5,
  MESSAGEENTITYTYPECODE = 6,
  MESSAGEENTITYTYPEBOTCOMMAND = 7,
  MESSAGEENTITYTYPEMENTIONALL = 8,
  MESSAGEENTITYTYPERESERVED4 = 9,
  MESSAGEENTITYTYPERESERVED5 = 10,
  MESSAGEENTITYTYPERESERVED6 = 11,
  MESSAGEENTITYTYPERESERVED7 = 12,
  MESSAGEENTITYTYPERESERVED8 = 13,
}

export enum PushTokenProvider {
  PUSHTOKENFIREBASE = 0,
  PUSHTOKENAPN = 1,
  PUSHTOKENPUSHKIT = 2,
}

export enum PrivacyKey {
  PRIVACYKEYNONE = 0,
  PRIVACYKEYCHATINVITE = 1,
  PRIVACYKEYLASTSEEN = 2,
  PRIVACYKEYPHONENUMBER = 3,
  PRIVACYKEYPROFILEPHOTO = 4,
  PRIVACYKEYFORWARDEDMESSAGE = 5,
  PRIVACYKEYCALL = 6,
  PRIVACYKEYRESERVED1 = 7,
  PRIVACYKEYRESERVED2 = 8,
  PRIVACYKEYRESERVED3 = 9,
  PRIVACYKEYRESERVED4 = 10,
  PRIVACYKEYRESERVED5 = 11,
  PRIVACYKEYRESERVED6 = 12,
}

export enum PrivacyType {
  PRIVACYTYPEALLOWALL = 0,
  PRIVACYTYPEALLOWCONTACTS = 1,
  PRIVACYTYPEDISALLOWALL = 2,
  PRIVACYTYPEALLOWUSERS = 101,
  PRIVACYTYPEDISALLOWUSERS = 102,
}

export enum TeamFlags {
  TEAMFLAGSEMPTY = 0,
  TEAMFLAGSCREATOR = 1,
  TEAMFLAGSADMIN = 2,
  TEAMFLAGSRESERVED1 = 3,
  TEAMFLAGSRESERVED2 = 4,
  TEAMFLAGSRESERVED3 = 5,
  TEAMFLAGSRESERVED4 = 6,
  TEAMFLAGSRESERVED5 = 7,
}

