// package: msg
// file: core.types.proto

import * as jspb from "google-protobuf";

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
  }
}

export enum TypingAction {
  TYPING = 0,
  RECORDINGVOICE = 1,
  RECORDINGVIDEO = 2,
  UPLOADING = 3,
  CANCEL = 4,
}

export enum PeerType {
  PEERSELF = 0,
  PEERUSER = 1,
  PEERCHAT = 2,
  PEERCHANNEL = 3,
}

