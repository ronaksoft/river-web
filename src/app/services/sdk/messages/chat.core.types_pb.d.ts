/* tslint:disable */
// package: msg
// file: chat.core.types.proto

import * as jspb from "google-protobuf";

export class MessageEnvelope extends jspb.Message {
  hasConstructor(): boolean;
  clearConstructor(): void;
  getConstructor(): number | undefined;
  setConstructor(value: number): void;

  hasRequestid(): boolean;
  clearRequestid(): void;
  getRequestid(): number | undefined;
  setRequestid(value: number): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): Uint8Array | string;
  getMessage_asU8(): Uint8Array;
  getMessage_asB64(): string;
  setMessage(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageEnvelope.AsObject;
  static toObject(includeInstance: boolean, msg: MessageEnvelope): MessageEnvelope.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageEnvelope, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageEnvelope;
  static deserializeBinaryFromReader(message: MessageEnvelope, reader: jspb.BinaryReader): MessageEnvelope;
}

export namespace MessageEnvelope {
  export type AsObject = {
    constructor?: number,
    requestid?: number,
    message: Uint8Array | string,
  }
}

export class MessageContainer extends jspb.Message {
  hasLength(): boolean;
  clearLength(): void;
  getLength(): number | undefined;
  setLength(value: number): void;

  clearEnvelopesList(): void;
  getEnvelopesList(): Array<MessageEnvelope>;
  setEnvelopesList(value: Array<MessageEnvelope>): void;
  addEnvelopes(value?: MessageEnvelope, index?: number): MessageEnvelope;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageContainer.AsObject;
  static toObject(includeInstance: boolean, msg: MessageContainer): MessageContainer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageContainer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageContainer;
  static deserializeBinaryFromReader(message: MessageContainer, reader: jspb.BinaryReader): MessageContainer;
}

export namespace MessageContainer {
  export type AsObject = {
    length?: number,
    envelopesList: Array<MessageEnvelope.AsObject>,
  }
}

export class UpdateEnvelope extends jspb.Message {
  hasConstructor(): boolean;
  clearConstructor(): void;
  getConstructor(): number | undefined;
  setConstructor(value: number): void;

  hasUpdate(): boolean;
  clearUpdate(): void;
  getUpdate(): Uint8Array | string;
  getUpdate_asU8(): Uint8Array;
  getUpdate_asB64(): string;
  setUpdate(value: Uint8Array | string): void;

  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasTimestamp(): boolean;
  clearTimestamp(): void;
  getTimestamp(): number | undefined;
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
    constructor?: number,
    update: Uint8Array | string,
    ucount?: number,
    updateid?: number,
    timestamp?: number,
  }
}

export class UpdateContainer extends jspb.Message {
  hasLength(): boolean;
  clearLength(): void;
  getLength(): number | undefined;
  setLength(value: number): void;

  clearUpdatesList(): void;
  getUpdatesList(): Array<UpdateEnvelope>;
  setUpdatesList(value: Array<UpdateEnvelope>): void;
  addUpdates(value?: UpdateEnvelope, index?: number): UpdateEnvelope;

  hasMinupdateid(): boolean;
  clearMinupdateid(): void;
  getMinupdateid(): number | undefined;
  setMinupdateid(value: number): void;

  hasMaxupdateid(): boolean;
  clearMaxupdateid(): void;
  getMaxupdateid(): number | undefined;
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
    length?: number,
    updatesList: Array<UpdateEnvelope.AsObject>,
    minupdateid?: number,
    maxupdateid?: number,
    usersList: Array<User.AsObject>,
    groupsList: Array<Group.AsObject>,
  }
}

export class ProtoMessage extends jspb.Message {
  hasAuthid(): boolean;
  clearAuthid(): void;
  getAuthid(): number | undefined;
  setAuthid(value: number): void;

  hasMessagekey(): boolean;
  clearMessagekey(): void;
  getMessagekey(): Uint8Array | string;
  getMessagekey_asU8(): Uint8Array;
  getMessagekey_asB64(): string;
  setMessagekey(value: Uint8Array | string): void;

  hasPayload(): boolean;
  clearPayload(): void;
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
    authid?: number,
    messagekey: Uint8Array | string,
    payload: Uint8Array | string,
  }
}

export class ProtoEncryptedPayload extends jspb.Message {
  hasServersalt(): boolean;
  clearServersalt(): void;
  getServersalt(): number | undefined;
  setServersalt(value: number): void;

  hasMessageid(): boolean;
  clearMessageid(): void;
  getMessageid(): number | undefined;
  setMessageid(value: number): void;

  hasSessionid(): boolean;
  clearSessionid(): void;
  getSessionid(): number | undefined;
  setSessionid(value: number): void;

  hasEnvelope(): boolean;
  clearEnvelope(): void;
  getEnvelope(): MessageEnvelope;
  setEnvelope(value?: MessageEnvelope): void;

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
    serversalt?: number,
    messageid?: number,
    sessionid?: number,
    envelope: MessageEnvelope.AsObject,
  }
}

export class Error extends jspb.Message {
  hasCode(): boolean;
  clearCode(): void;
  getCode(): string | undefined;
  setCode(value: string): void;

  hasItems(): boolean;
  clearItems(): void;
  getItems(): string | undefined;
  setItems(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Error.AsObject;
  static toObject(includeInstance: boolean, msg: Error): Error.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Error, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Error;
  static deserializeBinaryFromReader(message: Error, reader: jspb.BinaryReader): Error;
}

export namespace Error {
  export type AsObject = {
    code?: string,
    items?: string,
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
  hasResult(): boolean;
  clearResult(): void;
  getResult(): boolean | undefined;
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
    result?: boolean,
  }
}

export class Dialog extends jspb.Message {
  hasPeerid(): boolean;
  clearPeerid(): void;
  getPeerid(): string | undefined;
  setPeerid(value: string): void;

  hasPeertype(): boolean;
  clearPeertype(): void;
  getPeertype(): number | undefined;
  setPeertype(value: number): void;

  hasTopmessageid(): boolean;
  clearTopmessageid(): void;
  getTopmessageid(): number | undefined;
  setTopmessageid(value: number): void;

  hasReadinboxmaxid(): boolean;
  clearReadinboxmaxid(): void;
  getReadinboxmaxid(): number | undefined;
  setReadinboxmaxid(value: number): void;

  hasReadoutboxmaxid(): boolean;
  clearReadoutboxmaxid(): void;
  getReadoutboxmaxid(): number | undefined;
  setReadoutboxmaxid(value: number): void;

  hasUnreadcount(): boolean;
  clearUnreadcount(): void;
  getUnreadcount(): number | undefined;
  setUnreadcount(value: number): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
  setAccesshash(value: string): void;

  hasNotifysettings(): boolean;
  clearNotifysettings(): void;
  getNotifysettings(): PeerNotifySettings | undefined;
  setNotifysettings(value?: PeerNotifySettings): void;

  hasMentionedcount(): boolean;
  clearMentionedcount(): void;
  getMentionedcount(): number | undefined;
  setMentionedcount(value: number): void;

  hasPinned(): boolean;
  clearPinned(): void;
  getPinned(): boolean | undefined;
  setPinned(value: boolean): void;

  hasDraft(): boolean;
  clearDraft(): void;
  getDraft(): DraftMessage | undefined;
  setDraft(value?: DraftMessage): void;

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
    peerid?: string,
    peertype?: number,
    topmessageid?: number,
    readinboxmaxid?: number,
    readoutboxmaxid?: number,
    unreadcount?: number,
    accesshash?: string,
    notifysettings?: PeerNotifySettings.AsObject,
    mentionedcount?: number,
    pinned?: boolean,
    draft?: DraftMessage.AsObject,
  }
}

export class Peer extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): string | undefined;
  setId(value: string): void;

  hasType(): boolean;
  clearType(): void;
  getType(): number | undefined;
  setType(value: number): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
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
    id?: string,
    type?: number,
    accesshash?: string,
  }
}

export class InputPeer extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): string | undefined;
  setId(value: string): void;

  hasType(): boolean;
  clearType(): void;
  getType(): PeerType | undefined;
  setType(value: PeerType): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
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
    id?: string,
    type?: PeerType,
    accesshash?: string,
  }
}

export class InputUser extends jspb.Message {
  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
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
    userid?: string,
    accesshash?: string,
  }
}

export class InputFileLocation extends jspb.Message {
  hasClusterid(): boolean;
  clearClusterid(): void;
  getClusterid(): number | undefined;
  setClusterid(value: number): void;

  hasFileid(): boolean;
  clearFileid(): void;
  getFileid(): string | undefined;
  setFileid(value: string): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
  setAccesshash(value: string): void;

  hasVersion(): boolean;
  clearVersion(): void;
  getVersion(): number | undefined;
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
    clusterid?: number,
    fileid?: string,
    accesshash?: string,
    version?: number,
  }
}

export class FileLocation extends jspb.Message {
  hasClusterid(): boolean;
  clearClusterid(): void;
  getClusterid(): number | undefined;
  setClusterid(value: number): void;

  hasFileid(): boolean;
  clearFileid(): void;
  getFileid(): string | undefined;
  setFileid(value: string): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
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
    clusterid?: number,
    fileid?: string,
    accesshash?: string,
  }
}

export class UserPhoto extends jspb.Message {
  hasPhotobig(): boolean;
  clearPhotobig(): void;
  getPhotobig(): FileLocation;
  setPhotobig(value?: FileLocation): void;

  hasPhotosmall(): boolean;
  clearPhotosmall(): void;
  getPhotosmall(): FileLocation;
  setPhotosmall(value?: FileLocation): void;

  hasPhotoid(): boolean;
  clearPhotoid(): void;
  getPhotoid(): string | undefined;
  setPhotoid(value: string): void;

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
    photobig: FileLocation.AsObject,
    photosmall: FileLocation.AsObject,
    photoid?: string,
  }
}

export class User extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): string | undefined;
  setId(value: string): void;

  hasFirstname(): boolean;
  clearFirstname(): void;
  getFirstname(): string | undefined;
  setFirstname(value: string): void;

  hasLastname(): boolean;
  clearLastname(): void;
  getLastname(): string | undefined;
  setLastname(value: string): void;

  hasUsername(): boolean;
  clearUsername(): void;
  getUsername(): string | undefined;
  setUsername(value: string): void;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): UserStatus | undefined;
  setStatus(value: UserStatus): void;

  hasRestricted(): boolean;
  clearRestricted(): void;
  getRestricted(): boolean | undefined;
  setRestricted(value: boolean): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
  setAccesshash(value: string): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): UserPhoto | undefined;
  setPhoto(value?: UserPhoto): void;

  hasBio(): boolean;
  clearBio(): void;
  getBio(): string | undefined;
  setBio(value: string): void;

  hasPhone(): boolean;
  clearPhone(): void;
  getPhone(): string | undefined;
  setPhone(value: string): void;

  hasLastseen(): boolean;
  clearLastseen(): void;
  getLastseen(): number | undefined;
  setLastseen(value: number): void;

  clearPhotogalleryList(): void;
  getPhotogalleryList(): Array<UserPhoto>;
  setPhotogalleryList(value: Array<UserPhoto>): void;
  addPhotogallery(value?: UserPhoto, index?: number): UserPhoto;

  hasIsbot(): boolean;
  clearIsbot(): void;
  getIsbot(): boolean | undefined;
  setIsbot(value: boolean): void;

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
    id?: string,
    firstname?: string,
    lastname?: string,
    username?: string,
    status?: UserStatus,
    restricted?: boolean,
    accesshash?: string,
    photo?: UserPhoto.AsObject,
    bio?: string,
    phone?: string,
    lastseen?: number,
    photogalleryList?: Array<UserPhoto.AsObject>,
    isbot?: boolean,
  }
}

export class ContactUser extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): string | undefined;
  setId(value: string): void;

  hasFirstname(): boolean;
  clearFirstname(): void;
  getFirstname(): string | undefined;
  setFirstname(value: string): void;

  hasLastname(): boolean;
  clearLastname(): void;
  getLastname(): string | undefined;
  setLastname(value: string): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
  setAccesshash(value: string): void;

  hasPhone(): boolean;
  clearPhone(): void;
  getPhone(): string | undefined;
  setPhone(value: string): void;

  hasUsername(): boolean;
  clearUsername(): void;
  getUsername(): string | undefined;
  setUsername(value: string): void;

  hasClientid(): boolean;
  clearClientid(): void;
  getClientid(): string | undefined;
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
    id?: string,
    firstname?: string,
    lastname?: string,
    accesshash?: string,
    phone?: string,
    username?: string,
    clientid?: string,
    photo?: UserPhoto.AsObject,
  }
}

export class UserMessage extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): number | undefined;
  setId(value: number): void;

  hasPeerid(): boolean;
  clearPeerid(): void;
  getPeerid(): string | undefined;
  setPeerid(value: string): void;

  hasPeertype(): boolean;
  clearPeertype(): void;
  getPeertype(): number | undefined;
  setPeertype(value: number): void;

  hasCreatedon(): boolean;
  clearCreatedon(): void;
  getCreatedon(): number | undefined;
  setCreatedon(value: number): void;

  hasEditedon(): boolean;
  clearEditedon(): void;
  getEditedon(): number | undefined;
  setEditedon(value: number): void;

  hasFwdsenderid(): boolean;
  clearFwdsenderid(): void;
  getFwdsenderid(): string | undefined;
  setFwdsenderid(value: string): void;

  hasFwdchannelid(): boolean;
  clearFwdchannelid(): void;
  getFwdchannelid(): string | undefined;
  setFwdchannelid(value: string): void;

  hasFwdchannelmessageid(): boolean;
  clearFwdchannelmessageid(): void;
  getFwdchannelmessageid(): string | undefined;
  setFwdchannelmessageid(value: string): void;

  hasFlags(): boolean;
  clearFlags(): void;
  getFlags(): number | undefined;
  setFlags(value: number): void;

  hasMessagetype(): boolean;
  clearMessagetype(): void;
  getMessagetype(): number | undefined;
  setMessagetype(value: number): void;

  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  hasSenderid(): boolean;
  clearSenderid(): void;
  getSenderid(): string | undefined;
  setSenderid(value: string): void;

  hasContentread(): boolean;
  clearContentread(): void;
  getContentread(): boolean | undefined;
  setContentread(value: boolean): void;

  hasInbox(): boolean;
  clearInbox(): void;
  getInbox(): boolean | undefined;
  setInbox(value: boolean): void;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

  hasMessageaction(): boolean;
  clearMessageaction(): void;
  getMessageaction(): number | undefined;
  setMessageaction(value: number): void;

  hasMessageactiondata(): boolean;
  clearMessageactiondata(): void;
  getMessageactiondata(): Uint8Array | string;
  getMessageactiondata_asU8(): Uint8Array;
  getMessageactiondata_asB64(): string;
  setMessageactiondata(value: Uint8Array | string): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<MessageEntity>;
  setEntitiesList(value: Array<MessageEntity>): void;
  addEntities(value?: MessageEntity, index?: number): MessageEntity;

  hasMediatype(): boolean;
  clearMediatype(): void;
  getMediatype(): MediaType | undefined;
  setMediatype(value: MediaType): void;

  hasMedia(): boolean;
  clearMedia(): void;
  getMedia(): Uint8Array | string;
  getMedia_asU8(): Uint8Array;
  getMedia_asB64(): string;
  setMedia(value: Uint8Array | string): void;

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
    id?: number,
    peerid?: string,
    peertype?: number,
    createdon?: number,
    editedon?: number,
    fwdsenderid?: string,
    fwdchannelid?: string,
    fwdchannelmessageid?: string,
    flags?: number,
    messagetype?: number,
    body?: string,
    senderid?: string,
    contentread?: boolean,
    inbox?: boolean,
    replyto?: number,
    messageaction?: number,
    messageactiondata?: Uint8Array | string,
    entitiesList?: Array<MessageEntity.AsObject>,
    mediatype?: MediaType,
    media?: Uint8Array | string,
    replymarkup?: number,
    replymarkupdata?: Uint8Array | string,
  }
}

export class DraftMessage extends jspb.Message {
  hasPeerid(): boolean;
  clearPeerid(): void;
  getPeerid(): string | undefined;
  setPeerid(value: string): void;

  hasPeertype(): boolean;
  clearPeertype(): void;
  getPeertype(): number | undefined;
  setPeertype(value: number): void;

  hasDate(): boolean;
  clearDate(): void;
  getDate(): number | undefined;
  setDate(value: number): void;

  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<MessageEntity>;
  setEntitiesList(value: Array<MessageEntity>): void;
  addEntities(value?: MessageEntity, index?: number): MessageEntity;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

  hasEditedid(): boolean;
  clearEditedid(): void;
  getEditedid(): number | undefined;
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
    peerid?: string,
    peertype?: number,
    date?: number,
    body?: string,
    entitiesList?: Array<MessageEntity.AsObject>,
    replyto?: number,
    editedid?: number,
  }
}

export class MessageEntity extends jspb.Message {
  hasType(): boolean;
  clearType(): void;
  getType(): MessageEntityType | undefined;
  setType(value: MessageEntityType): void;

  hasOffset(): boolean;
  clearOffset(): void;
  getOffset(): number | undefined;
  setOffset(value: number): void;

  hasLength(): boolean;
  clearLength(): void;
  getLength(): number | undefined;
  setLength(value: number): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
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
    type?: MessageEntityType,
    offset?: number,
    length?: number,
    userid?: string,
  }
}

export class RSAPublicKey extends jspb.Message {
  hasFingerprint(): boolean;
  clearFingerprint(): void;
  getFingerprint(): number | undefined;
  setFingerprint(value: number): void;

  hasN(): boolean;
  clearN(): void;
  getN(): string | undefined;
  setN(value: string): void;

  hasE(): boolean;
  clearE(): void;
  getE(): number | undefined;
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
    fingerprint?: number,
    n?: string,
    e?: number,
  }
}

export class DHGroup extends jspb.Message {
  hasFingerprint(): boolean;
  clearFingerprint(): void;
  getFingerprint(): number | undefined;
  setFingerprint(value: number): void;

  hasPrime(): boolean;
  clearPrime(): void;
  getPrime(): string | undefined;
  setPrime(value: string): void;

  hasGen(): boolean;
  clearGen(): void;
  getGen(): number | undefined;
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
    fingerprint?: number,
    prime?: string,
    gen?: number,
  }
}

export class PhoneContact extends jspb.Message {
  hasClientid(): boolean;
  clearClientid(): void;
  getClientid(): string | undefined;
  setClientid(value: string): void;

  hasFirstname(): boolean;
  clearFirstname(): void;
  getFirstname(): string | undefined;
  setFirstname(value: string): void;

  hasLastname(): boolean;
  clearLastname(): void;
  getLastname(): string | undefined;
  setLastname(value: string): void;

  hasPhone(): boolean;
  clearPhone(): void;
  getPhone(): string | undefined;
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
    clientid?: string,
    firstname?: string,
    lastname?: string,
    phone?: string,
  }
}

export class PeerNotifySettings extends jspb.Message {
  hasFlags(): boolean;
  clearFlags(): void;
  getFlags(): number | undefined;
  setFlags(value: number): void;

  hasMuteuntil(): boolean;
  clearMuteuntil(): void;
  getMuteuntil(): number | undefined;
  setMuteuntil(value: number): void;

  hasSound(): boolean;
  clearSound(): void;
  getSound(): string | undefined;
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
    flags?: number,
    muteuntil?: number,
    sound?: string,
  }
}

export class InputFile extends jspb.Message {
  hasFileid(): boolean;
  clearFileid(): void;
  getFileid(): string | undefined;
  setFileid(value: string): void;

  hasTotalparts(): boolean;
  clearTotalparts(): void;
  getTotalparts(): number | undefined;
  setTotalparts(value: number): void;

  hasFilename(): boolean;
  clearFilename(): void;
  getFilename(): string | undefined;
  setFilename(value: string): void;

  hasMd5checksum(): boolean;
  clearMd5checksum(): void;
  getMd5checksum(): string | undefined;
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
    fileid?: string,
    totalparts?: number,
    filename?: string,
    md5checksum?: string,
  }
}

export class GroupPhoto extends jspb.Message {
  hasPhotobig(): boolean;
  clearPhotobig(): void;
  getPhotobig(): FileLocation;
  setPhotobig(value?: FileLocation): void;

  hasPhotosmall(): boolean;
  clearPhotosmall(): void;
  getPhotosmall(): FileLocation;
  setPhotosmall(value?: FileLocation): void;

  hasPhotoid(): boolean;
  clearPhotoid(): void;
  getPhotoid(): string | undefined;
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
    photobig: FileLocation.AsObject,
    photosmall: FileLocation.AsObject,
    photoid?: string,
  }
}

export class Group extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): string | undefined;
  setId(value: string): void;

  hasTitle(): boolean;
  clearTitle(): void;
  getTitle(): string | undefined;
  setTitle(value: string): void;

  hasCreatedon(): boolean;
  clearCreatedon(): void;
  getCreatedon(): number | undefined;
  setCreatedon(value: number): void;

  hasParticipants(): boolean;
  clearParticipants(): void;
  getParticipants(): number | undefined;
  setParticipants(value: number): void;

  hasEditedon(): boolean;
  clearEditedon(): void;
  getEditedon(): number | undefined;
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
    id?: string,
    title?: string,
    createdon?: number,
    participants?: number,
    editedon?: number,
    flagsList?: Array<GroupFlags>,
    photo?: GroupPhoto.AsObject,
  }
}

export class GroupFull extends jspb.Message {
  hasGroup(): boolean;
  clearGroup(): void;
  getGroup(): Group;
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
  getNotifysettings(): PeerNotifySettings;
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
    group: Group.AsObject,
    usersList: Array<User.AsObject>,
    participantsList: Array<GroupParticipant.AsObject>,
    notifysettings: PeerNotifySettings.AsObject,
    photogalleryList: Array<GroupPhoto.AsObject>,
  }
}

export class GroupParticipant extends jspb.Message {
  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasFirstname(): boolean;
  clearFirstname(): void;
  getFirstname(): string | undefined;
  setFirstname(value: string): void;

  hasLastname(): boolean;
  clearLastname(): void;
  getLastname(): string | undefined;
  setLastname(value: string): void;

  hasType(): boolean;
  clearType(): void;
  getType(): ParticipantType | undefined;
  setType(value: ParticipantType): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
  setAccesshash(value: string): void;

  hasUsername(): boolean;
  clearUsername(): void;
  getUsername(): string | undefined;
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
    userid?: string,
    firstname?: string,
    lastname?: string,
    type?: ParticipantType,
    accesshash?: string,
    username?: string,
    photo?: UserPhoto.AsObject,
  }
}

export class InputDocument extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): string | undefined;
  setId(value: string): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
  setAccesshash(value: string): void;

  hasClusterid(): boolean;
  clearClusterid(): void;
  getClusterid(): number | undefined;
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
    id?: string,
    accesshash?: string,
    clusterid?: number,
  }
}

export class PrivacyRule extends jspb.Message {
  hasPrivacytype(): boolean;
  clearPrivacytype(): void;
  getPrivacytype(): PrivacyType | undefined;
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
    privacytype?: PrivacyType,
    useridsList: Array<string>,
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
  PEERSUPERGROUP = 3,
  PEERCHANNEL = 4,
}

export enum UserStatus {
  USERSTATUSOFFLINE = 0,
  USERSTATUSONLINE = 1,
  USERSTATUSRECENTLY = 2,
  USERSTATUSLASTWEEK = 3,
  USERSTATUSLASTMONTH = 4,
}

export enum MediaType {
  MEDIATYPEEMPTY = 0,
  MEDIATYPEPHOTO = 1,
  MEDIATYPEDOCUMENT = 2,
  MEDIATYPECONTACT = 3,
  MEDIATYPEGEOLOCATION = 4,
}

export enum MessageEntityType {
  MESSAGEENTITYTYPEBOLD = 0,
  MESSAGEENTITYTYPEITALIC = 1,
  MESSAGEENTITYTYPEMENTION = 2,
  MESSAGEENTITYTYPEURL = 3,
  MESSAGEENTITYTYPEEMAIL = 4,
  MESSAGEENTITYTYPEHASHTAG = 5,
  MESSAGEENTITYTYPERESERVED1 = 6,
  MESSAGEENTITYTYPERESERVED2 = 7,
  MESSAGEENTITYTYPERESERVED3 = 8,
  MESSAGEENTITYTYPERESERVED4 = 9,
  MESSAGEENTITYTYPERESERVED5 = 10,
  MESSAGEENTITYTYPERESERVED6 = 11,
  MESSAGEENTITYTYPERESERVED7 = 12,
  MESSAGEENTITYTYPERESERVED8 = 13,
}

export enum GroupFlags {
  GROUPFLAGSEMPTY = 0,
  GROUPFLAGSCREATOR = 1,
  GROUPFLAGSNONPARTICIPANT = 2,
  GROUPFLAGSADMIN = 3,
  GROUPFLAGSADMINSENABLED = 4,
  GROUPFLAGSDEACTIVATED = 5,
}

export enum ParticipantType {
  PARTICIPANTTYPEMEMBER = 0,
  PARTICIPANTTYPEADMIN = 1,
  PARTICIPANTTYPECREATOR = 2,
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

