/* tslint:disable */
// package: msg
// file: updates.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";
import * as calendar_pb from "./calendar_pb";
import * as chat_messages_medias_pb from "./chat.messages.medias_pb";
import * as chat_phone_pb from "./chat.phone_pb";

export class UpdateGetState extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateGetState.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateGetState): UpdateGetState.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateGetState, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateGetState;
  static deserializeBinaryFromReader(message: UpdateGetState, reader: jspb.BinaryReader): UpdateGetState;
}

export namespace UpdateGetState {
  export type AsObject = {
  }
}

export class UpdateGetDifference extends jspb.Message {
  getFrom(): number;
  setFrom(value: number): void;

  getLimit(): number;
  setLimit(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateGetDifference.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateGetDifference): UpdateGetDifference.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateGetDifference, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateGetDifference;
  static deserializeBinaryFromReader(message: UpdateGetDifference, reader: jspb.BinaryReader): UpdateGetDifference;
}

export namespace UpdateGetDifference {
  export type AsObject = {
    from: number,
    limit: number,
  }
}

export class UpdateDifference extends jspb.Message {
  getMore(): boolean;
  setMore(value: boolean): void;

  getMaxupdateid(): number;
  setMaxupdateid(value: number): void;

  getMinupdateid(): number;
  setMinupdateid(value: number): void;

  clearUpdatesList(): void;
  getUpdatesList(): Array<core_types_pb.UpdateEnvelope>;
  setUpdatesList(value: Array<core_types_pb.UpdateEnvelope>): void;
  addUpdates(value?: core_types_pb.UpdateEnvelope, index?: number): core_types_pb.UpdateEnvelope;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  clearGroupsList(): void;
  getGroupsList(): Array<core_types_pb.Group>;
  setGroupsList(value: Array<core_types_pb.Group>): void;
  addGroups(value?: core_types_pb.Group, index?: number): core_types_pb.Group;

  getCurrentupdateid(): number;
  setCurrentupdateid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateDifference.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateDifference): UpdateDifference.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateDifference, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateDifference;
  static deserializeBinaryFromReader(message: UpdateDifference, reader: jspb.BinaryReader): UpdateDifference;
}

export namespace UpdateDifference {
  export type AsObject = {
    more: boolean,
    maxupdateid: number,
    minupdateid: number,
    updatesList: Array<core_types_pb.UpdateEnvelope.AsObject>,
    usersList: Array<core_types_pb.User.AsObject>,
    groupsList: Array<core_types_pb.Group.AsObject>,
    currentupdateid: number,
  }
}

export class UpdateTooLong extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTooLong.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTooLong): UpdateTooLong.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateTooLong, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTooLong;
  static deserializeBinaryFromReader(message: UpdateTooLong, reader: jspb.BinaryReader): UpdateTooLong;
}

export namespace UpdateTooLong {
  export type AsObject = {
  }
}

export class UpdateState extends jspb.Message {
  getUpdateid(): number;
  setUpdateid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateState.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateState): UpdateState.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateState, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateState;
  static deserializeBinaryFromReader(message: UpdateState, reader: jspb.BinaryReader): UpdateState;
}

export namespace UpdateState {
  export type AsObject = {
    updateid: number,
  }
}

export class UpdateMessageID extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  getRandomid(): number;
  setRandomid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateMessageID.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateMessageID): UpdateMessageID.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateMessageID, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateMessageID;
  static deserializeBinaryFromReader(message: UpdateMessageID, reader: jspb.BinaryReader): UpdateMessageID;
}

export namespace UpdateMessageID {
  export type AsObject = {
    ucount: number,
    messageid: number,
    randomid: number,
  }
}

export class UpdateNewMessage extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): core_types_pb.UserMessage | undefined;
  setMessage(value?: core_types_pb.UserMessage): void;

  hasSender(): boolean;
  clearSender(): void;
  getSender(): core_types_pb.User | undefined;
  setSender(value?: core_types_pb.User): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  getSenderrefid(): number;
  setSenderrefid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateNewMessage.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateNewMessage): UpdateNewMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateNewMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateNewMessage;
  static deserializeBinaryFromReader(message: UpdateNewMessage, reader: jspb.BinaryReader): UpdateNewMessage;
}

export namespace UpdateNewMessage {
  export type AsObject = {
    ucount: number,
    updateid: number,
    message?: core_types_pb.UserMessage.AsObject,
    sender?: core_types_pb.User.AsObject,
    accesshash: string,
    senderrefid: number,
  }
}

export class UpdateMessageEdited extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): core_types_pb.UserMessage | undefined;
  setMessage(value?: core_types_pb.UserMessage): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateMessageEdited.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateMessageEdited): UpdateMessageEdited.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateMessageEdited, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateMessageEdited;
  static deserializeBinaryFromReader(message: UpdateMessageEdited, reader: jspb.BinaryReader): UpdateMessageEdited;
}

export namespace UpdateMessageEdited {
  export type AsObject = {
    ucount: number,
    updateid: number,
    message?: core_types_pb.UserMessage.AsObject,
  }
}

export class UpdateMessagesDeleted extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateMessagesDeleted.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateMessagesDeleted): UpdateMessagesDeleted.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateMessagesDeleted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateMessagesDeleted;
  static deserializeBinaryFromReader(message: UpdateMessagesDeleted, reader: jspb.BinaryReader): UpdateMessagesDeleted;
}

export namespace UpdateMessagesDeleted {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    messageidsList: Array<number>,
    peer?: core_types_pb.Peer.AsObject,
  }
}

export class UpdateReadHistoryInbox extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  getMaxid(): number;
  setMaxid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateReadHistoryInbox.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateReadHistoryInbox): UpdateReadHistoryInbox.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateReadHistoryInbox, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateReadHistoryInbox;
  static deserializeBinaryFromReader(message: UpdateReadHistoryInbox, reader: jspb.BinaryReader): UpdateReadHistoryInbox;
}

export namespace UpdateReadHistoryInbox {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    peer?: core_types_pb.Peer.AsObject,
    maxid: number,
  }
}

export class UpdateReadHistoryOutbox extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  getMaxid(): number;
  setMaxid(value: number): void;

  getUserid(): number;
  setUserid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateReadHistoryOutbox.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateReadHistoryOutbox): UpdateReadHistoryOutbox.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateReadHistoryOutbox, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateReadHistoryOutbox;
  static deserializeBinaryFromReader(message: UpdateReadHistoryOutbox, reader: jspb.BinaryReader): UpdateReadHistoryOutbox;
}

export namespace UpdateReadHistoryOutbox {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    peer?: core_types_pb.Peer.AsObject,
    maxid: number,
    userid: number,
  }
}

export class UpdateMessagePinned extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  getUserid(): number;
  setUserid(value: number): void;

  getMsgid(): number;
  setMsgid(value: number): void;

  getVersion(): number;
  setVersion(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateMessagePinned.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateMessagePinned): UpdateMessagePinned.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateMessagePinned, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateMessagePinned;
  static deserializeBinaryFromReader(message: UpdateMessagePinned, reader: jspb.BinaryReader): UpdateMessagePinned;
}

export namespace UpdateMessagePinned {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    peer?: core_types_pb.Peer.AsObject,
    userid: number,
    msgid: number,
    version: number,
  }
}

export class UpdateUserTyping extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  getUserid(): string;
  setUserid(value: string): void;

  getAction(): core_types_pb.TypingAction;
  setAction(value: core_types_pb.TypingAction): void;

  getPeerid(): string;
  setPeerid(value: string): void;

  getPeertype(): number;
  setPeertype(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateUserTyping.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateUserTyping): UpdateUserTyping.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateUserTyping, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateUserTyping;
  static deserializeBinaryFromReader(message: UpdateUserTyping, reader: jspb.BinaryReader): UpdateUserTyping;
}

export namespace UpdateUserTyping {
  export type AsObject = {
    ucount: number,
    teamid: string,
    userid: string,
    action: core_types_pb.TypingAction,
    peerid: string,
    peertype: number,
  }
}

export class UpdateUserStatus extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUserid(): string;
  setUserid(value: string): void;

  getStatus(): number;
  setStatus(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateUserStatus.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateUserStatus): UpdateUserStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateUserStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateUserStatus;
  static deserializeBinaryFromReader(message: UpdateUserStatus, reader: jspb.BinaryReader): UpdateUserStatus;
}

export namespace UpdateUserStatus {
  export type AsObject = {
    ucount: number,
    userid: string,
    status: number,
  }
}

export class UpdateUsername extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getUserid(): string;
  setUserid(value: string): void;

  getUsername(): string;
  setUsername(value: string): void;

  getFirstname(): string;
  setFirstname(value: string): void;

  getLastname(): string;
  setLastname(value: string): void;

  getBio(): string;
  setBio(value: string): void;

  getPhone(): string;
  setPhone(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateUsername.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateUsername): UpdateUsername.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateUsername, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateUsername;
  static deserializeBinaryFromReader(message: UpdateUsername, reader: jspb.BinaryReader): UpdateUsername;
}

export namespace UpdateUsername {
  export type AsObject = {
    ucount: number,
    updateid: number,
    userid: string,
    username: string,
    firstname: string,
    lastname: string,
    bio: string,
    phone: string,
  }
}

export class UpdateUserPhoto extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getUserid(): string;
  setUserid(value: string): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): core_types_pb.UserPhoto | undefined;
  setPhoto(value?: core_types_pb.UserPhoto): void;

  getPhotoid(): string;
  setPhotoid(value: string): void;

  clearDeletedphotoidsList(): void;
  getDeletedphotoidsList(): Array<string>;
  setDeletedphotoidsList(value: Array<string>): void;
  addDeletedphotoids(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateUserPhoto.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateUserPhoto): UpdateUserPhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateUserPhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateUserPhoto;
  static deserializeBinaryFromReader(message: UpdateUserPhoto, reader: jspb.BinaryReader): UpdateUserPhoto;
}

export namespace UpdateUserPhoto {
  export type AsObject = {
    ucount: number,
    updateid: number,
    userid: string,
    photo?: core_types_pb.UserPhoto.AsObject,
    photoid: string,
    deletedphotoidsList: Array<string>,
  }
}

export class UpdateNotifySettings extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  getUserid(): string;
  setUserid(value: string): void;

  hasNotifypeer(): boolean;
  clearNotifypeer(): void;
  getNotifypeer(): core_types_pb.Peer | undefined;
  setNotifypeer(value?: core_types_pb.Peer): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): core_types_pb.PeerNotifySettings | undefined;
  setSettings(value?: core_types_pb.PeerNotifySettings): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateNotifySettings.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateNotifySettings): UpdateNotifySettings.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateNotifySettings, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateNotifySettings;
  static deserializeBinaryFromReader(message: UpdateNotifySettings, reader: jspb.BinaryReader): UpdateNotifySettings;
}

export namespace UpdateNotifySettings {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    userid: string,
    notifypeer?: core_types_pb.Peer.AsObject,
    settings?: core_types_pb.PeerNotifySettings.AsObject,
  }
}

export class UpdateGroupParticipantAdd extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getGroupid(): string;
  setGroupid(value: string): void;

  getUserid(): string;
  setUserid(value: string): void;

  getInviterid(): string;
  setInviterid(value: string): void;

  getDate(): number;
  setDate(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateGroupParticipantAdd.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateGroupParticipantAdd): UpdateGroupParticipantAdd.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateGroupParticipantAdd, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateGroupParticipantAdd;
  static deserializeBinaryFromReader(message: UpdateGroupParticipantAdd, reader: jspb.BinaryReader): UpdateGroupParticipantAdd;
}

export namespace UpdateGroupParticipantAdd {
  export type AsObject = {
    ucount: number,
    updateid: number,
    groupid: string,
    userid: string,
    inviterid: string,
    date: number,
  }
}

export class UpdateGroupParticipantDeleted extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getGroupid(): string;
  setGroupid(value: string): void;

  getUserid(): string;
  setUserid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateGroupParticipantDeleted.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateGroupParticipantDeleted): UpdateGroupParticipantDeleted.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateGroupParticipantDeleted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateGroupParticipantDeleted;
  static deserializeBinaryFromReader(message: UpdateGroupParticipantDeleted, reader: jspb.BinaryReader): UpdateGroupParticipantDeleted;
}

export namespace UpdateGroupParticipantDeleted {
  export type AsObject = {
    ucount: number,
    updateid: number,
    groupid: string,
    userid: string,
  }
}

export class UpdateGroupParticipantAdmin extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getGroupid(): string;
  setGroupid(value: string): void;

  getUserid(): string;
  setUserid(value: string): void;

  getIsadmin(): boolean;
  setIsadmin(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateGroupParticipantAdmin.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateGroupParticipantAdmin): UpdateGroupParticipantAdmin.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateGroupParticipantAdmin, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateGroupParticipantAdmin;
  static deserializeBinaryFromReader(message: UpdateGroupParticipantAdmin, reader: jspb.BinaryReader): UpdateGroupParticipantAdmin;
}

export namespace UpdateGroupParticipantAdmin {
  export type AsObject = {
    ucount: number,
    updateid: number,
    groupid: string,
    userid: string,
    isadmin: boolean,
  }
}

export class UpdateGroupAdmins extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getGroupid(): string;
  setGroupid(value: string): void;

  getAdminenabled(): boolean;
  setAdminenabled(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateGroupAdmins.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateGroupAdmins): UpdateGroupAdmins.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateGroupAdmins, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateGroupAdmins;
  static deserializeBinaryFromReader(message: UpdateGroupAdmins, reader: jspb.BinaryReader): UpdateGroupAdmins;
}

export namespace UpdateGroupAdmins {
  export type AsObject = {
    ucount: number,
    updateid: number,
    groupid: string,
    adminenabled: boolean,
  }
}

export class UpdateGroupPhoto extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getGroupid(): string;
  setGroupid(value: string): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): core_types_pb.GroupPhoto | undefined;
  setPhoto(value?: core_types_pb.GroupPhoto): void;

  getPhotoid(): string;
  setPhotoid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateGroupPhoto.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateGroupPhoto): UpdateGroupPhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateGroupPhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateGroupPhoto;
  static deserializeBinaryFromReader(message: UpdateGroupPhoto, reader: jspb.BinaryReader): UpdateGroupPhoto;
}

export namespace UpdateGroupPhoto {
  export type AsObject = {
    ucount: number,
    updateid: number,
    groupid: string,
    photo?: core_types_pb.GroupPhoto.AsObject,
    photoid: string,
  }
}

export class UpdateReadMessagesContents extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateReadMessagesContents.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateReadMessagesContents): UpdateReadMessagesContents.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateReadMessagesContents, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateReadMessagesContents;
  static deserializeBinaryFromReader(message: UpdateReadMessagesContents, reader: jspb.BinaryReader): UpdateReadMessagesContents;
}

export namespace UpdateReadMessagesContents {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    messageidsList: Array<number>,
    peer?: core_types_pb.Peer.AsObject,
  }
}

export class UpdateAuthorizationReset extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateAuthorizationReset.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateAuthorizationReset): UpdateAuthorizationReset.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateAuthorizationReset, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateAuthorizationReset;
  static deserializeBinaryFromReader(message: UpdateAuthorizationReset, reader: jspb.BinaryReader): UpdateAuthorizationReset;
}

export namespace UpdateAuthorizationReset {
  export type AsObject = {
    ucount: number,
    updateid: number,
  }
}

export class UpdateDraftMessage extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): core_types_pb.DraftMessage | undefined;
  setMessage(value?: core_types_pb.DraftMessage): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateDraftMessage.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateDraftMessage): UpdateDraftMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateDraftMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateDraftMessage;
  static deserializeBinaryFromReader(message: UpdateDraftMessage, reader: jspb.BinaryReader): UpdateDraftMessage;
}

export namespace UpdateDraftMessage {
  export type AsObject = {
    ucount: number,
    updateid: number,
    message?: core_types_pb.DraftMessage.AsObject,
  }
}

export class UpdateDraftMessageCleared extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateDraftMessageCleared.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateDraftMessageCleared): UpdateDraftMessageCleared.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateDraftMessageCleared, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateDraftMessageCleared;
  static deserializeBinaryFromReader(message: UpdateDraftMessageCleared, reader: jspb.BinaryReader): UpdateDraftMessageCleared;
}

export namespace UpdateDraftMessageCleared {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    peer?: core_types_pb.Peer.AsObject,
  }
}

export class UpdateDialogPinned extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  getPinned(): boolean;
  setPinned(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateDialogPinned.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateDialogPinned): UpdateDialogPinned.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateDialogPinned, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateDialogPinned;
  static deserializeBinaryFromReader(message: UpdateDialogPinned, reader: jspb.BinaryReader): UpdateDialogPinned;
}

export namespace UpdateDialogPinned {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    peer?: core_types_pb.Peer.AsObject,
    pinned: boolean,
  }
}

export class UpdateDialogPinnedReorder extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  clearPeerList(): void;
  getPeerList(): Array<core_types_pb.Peer>;
  setPeerList(value: Array<core_types_pb.Peer>): void;
  addPeer(value?: core_types_pb.Peer, index?: number): core_types_pb.Peer;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateDialogPinnedReorder.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateDialogPinnedReorder): UpdateDialogPinnedReorder.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateDialogPinnedReorder, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateDialogPinnedReorder;
  static deserializeBinaryFromReader(message: UpdateDialogPinnedReorder, reader: jspb.BinaryReader): UpdateDialogPinnedReorder;
}

export namespace UpdateDialogPinnedReorder {
  export type AsObject = {
    ucount: number,
    updateid: number,
    peerList: Array<core_types_pb.Peer.AsObject>,
  }
}

export class UpdateAccountPrivacy extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  clearChatinviteList(): void;
  getChatinviteList(): Array<core_types_pb.PrivacyRule>;
  setChatinviteList(value: Array<core_types_pb.PrivacyRule>): void;
  addChatinvite(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  clearLastseenList(): void;
  getLastseenList(): Array<core_types_pb.PrivacyRule>;
  setLastseenList(value: Array<core_types_pb.PrivacyRule>): void;
  addLastseen(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  clearPhonenumberList(): void;
  getPhonenumberList(): Array<core_types_pb.PrivacyRule>;
  setPhonenumberList(value: Array<core_types_pb.PrivacyRule>): void;
  addPhonenumber(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  clearProfilephotoList(): void;
  getProfilephotoList(): Array<core_types_pb.PrivacyRule>;
  setProfilephotoList(value: Array<core_types_pb.PrivacyRule>): void;
  addProfilephoto(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  clearForwardedmessageList(): void;
  getForwardedmessageList(): Array<core_types_pb.PrivacyRule>;
  setForwardedmessageList(value: Array<core_types_pb.PrivacyRule>): void;
  addForwardedmessage(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  clearCallList(): void;
  getCallList(): Array<core_types_pb.PrivacyRule>;
  setCallList(value: Array<core_types_pb.PrivacyRule>): void;
  addCall(value?: core_types_pb.PrivacyRule, index?: number): core_types_pb.PrivacyRule;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateAccountPrivacy.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateAccountPrivacy): UpdateAccountPrivacy.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateAccountPrivacy, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateAccountPrivacy;
  static deserializeBinaryFromReader(message: UpdateAccountPrivacy, reader: jspb.BinaryReader): UpdateAccountPrivacy;
}

export namespace UpdateAccountPrivacy {
  export type AsObject = {
    ucount: number,
    updateid: number,
    chatinviteList: Array<core_types_pb.PrivacyRule.AsObject>,
    lastseenList: Array<core_types_pb.PrivacyRule.AsObject>,
    phonenumberList: Array<core_types_pb.PrivacyRule.AsObject>,
    profilephotoList: Array<core_types_pb.PrivacyRule.AsObject>,
    forwardedmessageList: Array<core_types_pb.PrivacyRule.AsObject>,
    callList: Array<core_types_pb.PrivacyRule.AsObject>,
  }
}

export class UpdateLabelItemsAdded extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  clearLabelidsList(): void;
  getLabelidsList(): Array<number>;
  setLabelidsList(value: Array<number>): void;
  addLabelids(value: number, index?: number): number;

  clearLabelsList(): void;
  getLabelsList(): Array<core_types_pb.Label>;
  setLabelsList(value: Array<core_types_pb.Label>): void;
  addLabels(value?: core_types_pb.Label, index?: number): core_types_pb.Label;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateLabelItemsAdded.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateLabelItemsAdded): UpdateLabelItemsAdded.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateLabelItemsAdded, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateLabelItemsAdded;
  static deserializeBinaryFromReader(message: UpdateLabelItemsAdded, reader: jspb.BinaryReader): UpdateLabelItemsAdded;
}

export namespace UpdateLabelItemsAdded {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    peer?: core_types_pb.Peer.AsObject,
    messageidsList: Array<number>,
    labelidsList: Array<number>,
    labelsList: Array<core_types_pb.Label.AsObject>,
  }
}

export class UpdateLabelItemsRemoved extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  clearLabelidsList(): void;
  getLabelidsList(): Array<number>;
  setLabelidsList(value: Array<number>): void;
  addLabelids(value: number, index?: number): number;

  clearLabelsList(): void;
  getLabelsList(): Array<core_types_pb.Label>;
  setLabelsList(value: Array<core_types_pb.Label>): void;
  addLabels(value?: core_types_pb.Label, index?: number): core_types_pb.Label;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateLabelItemsRemoved.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateLabelItemsRemoved): UpdateLabelItemsRemoved.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateLabelItemsRemoved, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateLabelItemsRemoved;
  static deserializeBinaryFromReader(message: UpdateLabelItemsRemoved, reader: jspb.BinaryReader): UpdateLabelItemsRemoved;
}

export namespace UpdateLabelItemsRemoved {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    peer?: core_types_pb.Peer.AsObject,
    messageidsList: Array<number>,
    labelidsList: Array<number>,
    labelsList: Array<core_types_pb.Label.AsObject>,
  }
}

export class UpdateLabelSet extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  clearLabelsList(): void;
  getLabelsList(): Array<core_types_pb.Label>;
  setLabelsList(value: Array<core_types_pb.Label>): void;
  addLabels(value?: core_types_pb.Label, index?: number): core_types_pb.Label;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateLabelSet.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateLabelSet): UpdateLabelSet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateLabelSet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateLabelSet;
  static deserializeBinaryFromReader(message: UpdateLabelSet, reader: jspb.BinaryReader): UpdateLabelSet;
}

export namespace UpdateLabelSet {
  export type AsObject = {
    ucount: number,
    updateid: number,
    labelsList: Array<core_types_pb.Label.AsObject>,
  }
}

export class UpdateLabelDeleted extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  clearLabelidsList(): void;
  getLabelidsList(): Array<number>;
  setLabelidsList(value: Array<number>): void;
  addLabelids(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateLabelDeleted.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateLabelDeleted): UpdateLabelDeleted.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateLabelDeleted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateLabelDeleted;
  static deserializeBinaryFromReader(message: UpdateLabelDeleted, reader: jspb.BinaryReader): UpdateLabelDeleted;
}

export namespace UpdateLabelDeleted {
  export type AsObject = {
    ucount: number,
    updateid: number,
    labelidsList: Array<number>,
  }
}

export class UpdateUserBlocked extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getUserid(): string;
  setUserid(value: string): void;

  getBlocked(): boolean;
  setBlocked(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateUserBlocked.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateUserBlocked): UpdateUserBlocked.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateUserBlocked, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateUserBlocked;
  static deserializeBinaryFromReader(message: UpdateUserBlocked, reader: jspb.BinaryReader): UpdateUserBlocked;
}

export namespace UpdateUserBlocked {
  export type AsObject = {
    ucount: number,
    updateid: number,
    userid: string,
    blocked: boolean,
  }
}

export class UpdateMessagePoll extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getPollid(): number;
  setPollid(value: number): void;

  hasPoll(): boolean;
  clearPoll(): void;
  getPoll(): chat_messages_medias_pb.MediaPoll | undefined;
  setPoll(value?: chat_messages_medias_pb.MediaPoll): void;

  hasResults(): boolean;
  clearResults(): void;
  getResults(): chat_messages_medias_pb.PollResults | undefined;
  setResults(value?: chat_messages_medias_pb.PollResults): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateMessagePoll.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateMessagePoll): UpdateMessagePoll.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateMessagePoll, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateMessagePoll;
  static deserializeBinaryFromReader(message: UpdateMessagePoll, reader: jspb.BinaryReader): UpdateMessagePoll;
}

export namespace UpdateMessagePoll {
  export type AsObject = {
    ucount: number,
    updateid: number,
    pollid: number,
    poll?: chat_messages_medias_pb.MediaPoll.AsObject,
    results?: chat_messages_medias_pb.PollResults.AsObject,
  }
}

export class UpdateBotCallbackQuery extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getQueryid(): number;
  setQueryid(value: number): void;

  getUserid(): number;
  setUserid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateBotCallbackQuery.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateBotCallbackQuery): UpdateBotCallbackQuery.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateBotCallbackQuery, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateBotCallbackQuery;
  static deserializeBinaryFromReader(message: UpdateBotCallbackQuery, reader: jspb.BinaryReader): UpdateBotCallbackQuery;
}

export namespace UpdateBotCallbackQuery {
  export type AsObject = {
    ucount: number,
    updateid: number,
    queryid: number,
    userid: number,
    peer?: core_types_pb.Peer.AsObject,
    messageid: number,
    data: Uint8Array | string,
  }
}

export class UpdateBotInlineQuery extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getQueryid(): number;
  setQueryid(value: number): void;

  getUserid(): number;
  setUserid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  getQuery(): string;
  setQuery(value: string): void;

  getOffset(): string;
  setOffset(value: string): void;

  hasGeo(): boolean;
  clearGeo(): void;
  getGeo(): core_types_pb.GeoLocation | undefined;
  setGeo(value?: core_types_pb.GeoLocation): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateBotInlineQuery.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateBotInlineQuery): UpdateBotInlineQuery.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateBotInlineQuery, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateBotInlineQuery;
  static deserializeBinaryFromReader(message: UpdateBotInlineQuery, reader: jspb.BinaryReader): UpdateBotInlineQuery;
}

export namespace UpdateBotInlineQuery {
  export type AsObject = {
    ucount: number,
    updateid: number,
    queryid: number,
    userid: number,
    peer?: core_types_pb.Peer.AsObject,
    query: string,
    offset: string,
    geo?: core_types_pb.GeoLocation.AsObject,
  }
}

export class UpdateBotInlineSend extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getUserid(): number;
  setUserid(value: number): void;

  getQuery(): string;
  setQuery(value: string): void;

  getResultid(): string;
  setResultid(value: string): void;

  hasGeo(): boolean;
  clearGeo(): void;
  getGeo(): core_types_pb.GeoLocation | undefined;
  setGeo(value?: core_types_pb.GeoLocation): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateBotInlineSend.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateBotInlineSend): UpdateBotInlineSend.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateBotInlineSend, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateBotInlineSend;
  static deserializeBinaryFromReader(message: UpdateBotInlineSend, reader: jspb.BinaryReader): UpdateBotInlineSend;
}

export namespace UpdateBotInlineSend {
  export type AsObject = {
    ucount: number,
    updateid: number,
    userid: number,
    query: string,
    resultid: string,
    geo?: core_types_pb.GeoLocation.AsObject,
  }
}

export class UpdateTeamCreated extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.Team | undefined;
  setTeam(value?: core_types_pb.Team): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTeamCreated.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTeamCreated): UpdateTeamCreated.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateTeamCreated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTeamCreated;
  static deserializeBinaryFromReader(message: UpdateTeamCreated, reader: jspb.BinaryReader): UpdateTeamCreated;
}

export namespace UpdateTeamCreated {
  export type AsObject = {
    ucount: number,
    updateid: number,
    team?: core_types_pb.Team.AsObject,
  }
}

export class UpdateTeamMemberAdded extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.User | undefined;
  setUser(value?: core_types_pb.User): void;

  hasContact(): boolean;
  clearContact(): void;
  getContact(): core_types_pb.ContactUser | undefined;
  setContact(value?: core_types_pb.ContactUser): void;

  getAdderid(): string;
  setAdderid(value: string): void;

  getHash(): number;
  setHash(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTeamMemberAdded.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTeamMemberAdded): UpdateTeamMemberAdded.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateTeamMemberAdded, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTeamMemberAdded;
  static deserializeBinaryFromReader(message: UpdateTeamMemberAdded, reader: jspb.BinaryReader): UpdateTeamMemberAdded;
}

export namespace UpdateTeamMemberAdded {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    user?: core_types_pb.User.AsObject,
    contact?: core_types_pb.ContactUser.AsObject,
    adderid: string,
    hash: number,
  }
}

export class UpdateTeamMemberRemoved extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  getUserid(): string;
  setUserid(value: string): void;

  getRemoverid(): string;
  setRemoverid(value: string): void;

  getHash(): number;
  setHash(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTeamMemberRemoved.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTeamMemberRemoved): UpdateTeamMemberRemoved.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateTeamMemberRemoved, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTeamMemberRemoved;
  static deserializeBinaryFromReader(message: UpdateTeamMemberRemoved, reader: jspb.BinaryReader): UpdateTeamMemberRemoved;
}

export namespace UpdateTeamMemberRemoved {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    userid: string,
    removerid: string,
    hash: number,
  }
}

export class UpdateTeamMemberStatus extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  getChangerid(): string;
  setChangerid(value: string): void;

  getAdmin(): boolean;
  setAdmin(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTeamMemberStatus.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTeamMemberStatus): UpdateTeamMemberStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateTeamMemberStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTeamMemberStatus;
  static deserializeBinaryFromReader(message: UpdateTeamMemberStatus, reader: jspb.BinaryReader): UpdateTeamMemberStatus;
}

export namespace UpdateTeamMemberStatus {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    changerid: string,
    admin: boolean,
  }
}

export class UpdateTeamPhoto extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): core_types_pb.TeamPhoto | undefined;
  setPhoto(value?: core_types_pb.TeamPhoto): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTeamPhoto.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTeamPhoto): UpdateTeamPhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateTeamPhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTeamPhoto;
  static deserializeBinaryFromReader(message: UpdateTeamPhoto, reader: jspb.BinaryReader): UpdateTeamPhoto;
}

export namespace UpdateTeamPhoto {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    photo?: core_types_pb.TeamPhoto.AsObject,
  }
}

export class UpdateTeam extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTeam.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTeam): UpdateTeam.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateTeam, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTeam;
  static deserializeBinaryFromReader(message: UpdateTeam, reader: jspb.BinaryReader): UpdateTeam;
}

export namespace UpdateTeam {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    name: string,
  }
}

export class UpdateCommunityMessage extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getSenderid(): number;
  setSenderid(value: number): void;

  getReceiverid(): number;
  setReceiverid(value: number): void;

  getBody(): string;
  setBody(value: string): void;

  getCreatedon(): number;
  setCreatedon(value: number): void;

  getGlobalmsgid(): number;
  setGlobalmsgid(value: number): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

  getSendermsgid(): number;
  setSendermsgid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateCommunityMessage.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateCommunityMessage): UpdateCommunityMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateCommunityMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateCommunityMessage;
  static deserializeBinaryFromReader(message: UpdateCommunityMessage, reader: jspb.BinaryReader): UpdateCommunityMessage;
}

export namespace UpdateCommunityMessage {
  export type AsObject = {
    teamid: string,
    senderid: number,
    receiverid: number,
    body: string,
    createdon: number,
    globalmsgid: number,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
    sendermsgid: number,
  }
}

export class UpdateCommunityReadOutbox extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getSenderid(): number;
  setSenderid(value: number): void;

  getReceiverid(): number;
  setReceiverid(value: number): void;

  getSendermsgid(): number;
  setSendermsgid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateCommunityReadOutbox.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateCommunityReadOutbox): UpdateCommunityReadOutbox.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateCommunityReadOutbox, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateCommunityReadOutbox;
  static deserializeBinaryFromReader(message: UpdateCommunityReadOutbox, reader: jspb.BinaryReader): UpdateCommunityReadOutbox;
}

export namespace UpdateCommunityReadOutbox {
  export type AsObject = {
    teamid: string,
    senderid: number,
    receiverid: number,
    sendermsgid: number,
  }
}

export class UpdateCommunityTyping extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getSenderid(): number;
  setSenderid(value: number): void;

  getReceiverid(): number;
  setReceiverid(value: number): void;

  getAction(): core_types_pb.TypingAction;
  setAction(value: core_types_pb.TypingAction): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateCommunityTyping.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateCommunityTyping): UpdateCommunityTyping.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateCommunityTyping, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateCommunityTyping;
  static deserializeBinaryFromReader(message: UpdateCommunityTyping, reader: jspb.BinaryReader): UpdateCommunityTyping;
}

export namespace UpdateCommunityTyping {
  export type AsObject = {
    teamid: string,
    senderid: number,
    receiverid: number,
    action: core_types_pb.TypingAction,
  }
}

export class UpdateReaction extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  clearCounterList(): void;
  getCounterList(): Array<core_types_pb.ReactionCounter>;
  setCounterList(value: Array<core_types_pb.ReactionCounter>): void;
  addCounter(value?: core_types_pb.ReactionCounter, index?: number): core_types_pb.ReactionCounter;

  getTeamid(): string;
  setTeamid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  hasSender(): boolean;
  clearSender(): void;
  getSender(): core_types_pb.User | undefined;
  setSender(value?: core_types_pb.User): void;

  clearYourreactionsList(): void;
  getYourreactionsList(): Array<string>;
  setYourreactionsList(value: Array<string>): void;
  addYourreactions(value: string, index?: number): string;

  getReaction(): string;
  setReaction(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateReaction.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateReaction): UpdateReaction.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateReaction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateReaction;
  static deserializeBinaryFromReader(message: UpdateReaction, reader: jspb.BinaryReader): UpdateReaction;
}

export namespace UpdateReaction {
  export type AsObject = {
    ucount: number,
    updateid: number,
    messageid: number,
    counterList: Array<core_types_pb.ReactionCounter.AsObject>,
    teamid: string,
    peer?: core_types_pb.Peer.AsObject,
    sender?: core_types_pb.User.AsObject,
    yourreactionsList: Array<string>,
    reaction: string,
  }
}

export class UpdateCalendarEventAdded extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  hasEvent(): boolean;
  clearEvent(): void;
  getEvent(): calendar_pb.CalendarEvent | undefined;
  setEvent(value?: calendar_pb.CalendarEvent): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateCalendarEventAdded.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateCalendarEventAdded): UpdateCalendarEventAdded.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateCalendarEventAdded, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateCalendarEventAdded;
  static deserializeBinaryFromReader(message: UpdateCalendarEventAdded, reader: jspb.BinaryReader): UpdateCalendarEventAdded;
}

export namespace UpdateCalendarEventAdded {
  export type AsObject = {
    ucount: number,
    updateid: number,
    event?: calendar_pb.CalendarEvent.AsObject,
  }
}

export class UpdateCalendarEventRemoved extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getEventid(): string;
  setEventid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateCalendarEventRemoved.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateCalendarEventRemoved): UpdateCalendarEventRemoved.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateCalendarEventRemoved, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateCalendarEventRemoved;
  static deserializeBinaryFromReader(message: UpdateCalendarEventRemoved, reader: jspb.BinaryReader): UpdateCalendarEventRemoved;
}

export namespace UpdateCalendarEventRemoved {
  export type AsObject = {
    ucount: number,
    updateid: number,
    eventid: string,
  }
}

export class UpdateCalendarEventEdited extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  hasEvent(): boolean;
  clearEvent(): void;
  getEvent(): calendar_pb.CalendarEvent | undefined;
  setEvent(value?: calendar_pb.CalendarEvent): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateCalendarEventEdited.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateCalendarEventEdited): UpdateCalendarEventEdited.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateCalendarEventEdited, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateCalendarEventEdited;
  static deserializeBinaryFromReader(message: UpdateCalendarEventEdited, reader: jspb.BinaryReader): UpdateCalendarEventEdited;
}

export namespace UpdateCalendarEventEdited {
  export type AsObject = {
    ucount: number,
    updateid: number,
    event?: calendar_pb.CalendarEvent.AsObject,
  }
}

export class UpdateRedirect extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  clearRedirectsList(): void;
  getRedirectsList(): Array<ClientRedirect>;
  setRedirectsList(value: Array<ClientRedirect>): void;
  addRedirects(value?: ClientRedirect, index?: number): ClientRedirect;

  getEmpty(): boolean;
  setEmpty(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateRedirect.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateRedirect): UpdateRedirect.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateRedirect, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateRedirect;
  static deserializeBinaryFromReader(message: UpdateRedirect, reader: jspb.BinaryReader): UpdateRedirect;
}

export namespace UpdateRedirect {
  export type AsObject = {
    ucount: number,
    updateid: number,
    redirectsList: Array<ClientRedirect.AsObject>,
    empty: boolean,
  }
}

export class ClientRedirect extends jspb.Message {
  getHostport(): string;
  setHostport(value: string): void;

  getPermanent(): boolean;
  setPermanent(value: boolean): void;

  getTarget(): RedirectTarget;
  setTarget(value: RedirectTarget): void;

  clearAlternativesList(): void;
  getAlternativesList(): Array<string>;
  setAlternativesList(value: Array<string>): void;
  addAlternatives(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientRedirect.AsObject;
  static toObject(includeInstance: boolean, msg: ClientRedirect): ClientRedirect.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClientRedirect, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientRedirect;
  static deserializeBinaryFromReader(message: ClientRedirect, reader: jspb.BinaryReader): ClientRedirect;
}

export namespace ClientRedirect {
  export type AsObject = {
    hostport: string,
    permanent: boolean,
    target: RedirectTarget,
    alternativesList: Array<string>,
  }
}

export class UpdatePhoneCall extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  getPeerid(): string;
  setPeerid(value: string): void;

  getPeertype(): number;
  setPeertype(value: number): void;

  getCallid(): string;
  setCallid(value: string): void;

  getUserid(): string;
  setUserid(value: string): void;

  getAccesshash(): string;
  setAccesshash(value: string): void;

  getAction(): chat_phone_pb.PhoneCallAction;
  setAction(value: chat_phone_pb.PhoneCallAction): void;

  getActiondata(): Uint8Array | string;
  getActiondata_asU8(): Uint8Array;
  getActiondata_asB64(): string;
  setActiondata(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePhoneCall.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePhoneCall): UpdatePhoneCall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdatePhoneCall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePhoneCall;
  static deserializeBinaryFromReader(message: UpdatePhoneCall, reader: jspb.BinaryReader): UpdatePhoneCall;
}

export namespace UpdatePhoneCall {
  export type AsObject = {
    ucount: number,
    teamid: string,
    peerid: string,
    peertype: number,
    callid: string,
    userid: string,
    accesshash: string,
    action: chat_phone_pb.PhoneCallAction,
    actiondata: Uint8Array | string,
  }
}

export class UpdatePhoneCallStarted extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  getCallid(): string;
  setCallid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePhoneCallStarted.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePhoneCallStarted): UpdatePhoneCallStarted.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdatePhoneCallStarted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePhoneCallStarted;
  static deserializeBinaryFromReader(message: UpdatePhoneCallStarted, reader: jspb.BinaryReader): UpdatePhoneCallStarted;
}

export namespace UpdatePhoneCallStarted {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    peer?: core_types_pb.Peer.AsObject,
    callid: string,
  }
}

export class UpdatePhoneCallEnded extends jspb.Message {
  getUcount(): number;
  setUcount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer | undefined;
  setPeer(value?: core_types_pb.Peer): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePhoneCallEnded.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePhoneCallEnded): UpdatePhoneCallEnded.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdatePhoneCallEnded, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePhoneCallEnded;
  static deserializeBinaryFromReader(message: UpdatePhoneCallEnded, reader: jspb.BinaryReader): UpdatePhoneCallEnded;
}

export namespace UpdatePhoneCallEnded {
  export type AsObject = {
    ucount: number,
    updateid: number,
    teamid: string,
    peer?: core_types_pb.Peer.AsObject,
  }
}

export enum RedirectTarget {
  REDIRECTTARGETRPC = 0,
  REDIRECTTARGETFILE = 1,
  REDIRECTTARGETPROXY = 2,
  REDIRECTTARGETRESERVED1 = 3,
  REDIRECTTARGETRESERVED2 = 4,
  REDIRECTTARGETRESERVED3 = 5,
  REDIRECTTARGETRESERVED4 = 6,
}

