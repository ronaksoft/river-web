/* tslint:disable */
// package: msg
// file: updates.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";
import * as calendar_pb from "./calendar_pb";
import * as chat_messages_medias_pb from "./chat.messages.medias_pb";

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
  hasFrom(): boolean;
  clearFrom(): void;
  getFrom(): number | undefined;
  setFrom(value: number): void;

  hasLimit(): boolean;
  clearLimit(): void;
  getLimit(): number | undefined;
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
    from?: number,
    limit?: number,
  }
}

export class UpdateDifference extends jspb.Message {
  hasMore(): boolean;
  clearMore(): void;
  getMore(): boolean | undefined;
  setMore(value: boolean): void;

  hasMaxupdateid(): boolean;
  clearMaxupdateid(): void;
  getMaxupdateid(): number | undefined;
  setMaxupdateid(value: number): void;

  hasMinupdateid(): boolean;
  clearMinupdateid(): void;
  getMinupdateid(): number | undefined;
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

  hasCurrentupdateid(): boolean;
  clearCurrentupdateid(): void;
  getCurrentupdateid(): number | undefined;
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
    more?: boolean,
    maxupdateid?: number,
    minupdateid?: number,
    updatesList: Array<core_types_pb.UpdateEnvelope.AsObject>,
    usersList: Array<core_types_pb.User.AsObject>,
    groupsList: Array<core_types_pb.Group.AsObject>,
    currentupdateid?: number,
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
  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
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
    updateid?: number,
  }
}

export class UpdateMessageID extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasMessageid(): boolean;
  clearMessageid(): void;
  getMessageid(): number | undefined;
  setMessageid(value: number): void;

  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
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
    ucount?: number,
    messageid?: number,
    randomid?: number,
  }
}

export class UpdateNewMessage extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): core_types_pb.UserMessage;
  setMessage(value?: core_types_pb.UserMessage): void;

  hasSender(): boolean;
  clearSender(): void;
  getSender(): core_types_pb.User;
  setSender(value?: core_types_pb.User): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
  setAccesshash(value: string): void;

  hasSenderrefid(): boolean;
  clearSenderrefid(): void;
  getSenderrefid(): number | undefined;
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
    ucount?: number,
    updateid?: number,
    message: core_types_pb.UserMessage.AsObject,
    sender: core_types_pb.User.AsObject,
    accesshash?: string,
    senderrefid?: number,
  }
}

export class UpdateMessageEdited extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): core_types_pb.UserMessage;
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
    ucount?: number,
    updateid?: number,
    message: core_types_pb.UserMessage.AsObject,
  }
}

export class UpdateMessagesDeleted extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

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
    ucount?: number,
    updateid?: number,
    messageidsList: Array<number>,
    peer?: core_types_pb.Peer.AsObject,
  }
}

export class UpdateReadHistoryInbox extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer;
  setPeer(value?: core_types_pb.Peer): void;

  hasMaxid(): boolean;
  clearMaxid(): void;
  getMaxid(): number | undefined;
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
    ucount?: number,
    updateid?: number,
    peer: core_types_pb.Peer.AsObject,
    maxid?: number,
  }
}

export class UpdateReadHistoryOutbox extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer;
  setPeer(value?: core_types_pb.Peer): void;

  hasMaxid(): boolean;
  clearMaxid(): void;
  getMaxid(): number | undefined;
  setMaxid(value: number): void;

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
    ucount?: number,
    updateid?: number,
    peer: core_types_pb.Peer.AsObject,
    maxid?: number,
  }
}

export class UpdateUserTyping extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasAction(): boolean;
  clearAction(): void;
  getAction(): core_types_pb.TypingAction | undefined;
  setAction(value: core_types_pb.TypingAction): void;

  hasPeerid(): boolean;
  clearPeerid(): void;
  getPeerid(): string | undefined;
  setPeerid(value: string): void;

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
    ucount?: number,
    userid?: string,
    action?: core_types_pb.TypingAction,
    peerid?: string,
  }
}

export class UpdateUserStatus extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): number | undefined;
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
    ucount?: number,
    userid?: string,
    status?: number,
  }
}

export class UpdateUsername extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasUsername(): boolean;
  clearUsername(): void;
  getUsername(): string | undefined;
  setUsername(value: string): void;

  hasFirstname(): boolean;
  clearFirstname(): void;
  getFirstname(): string | undefined;
  setFirstname(value: string): void;

  hasLastname(): boolean;
  clearLastname(): void;
  getLastname(): string | undefined;
  setLastname(value: string): void;

  hasBio(): boolean;
  clearBio(): void;
  getBio(): string | undefined;
  setBio(value: string): void;

  hasPhone(): boolean;
  clearPhone(): void;
  getPhone(): string | undefined;
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
    ucount?: number,
    updateid?: number,
    userid?: string,
    username?: string,
    firstname?: string,
    lastname?: string,
    bio?: string,
    phone?: string,
  }
}

export class UpdateUserPhoto extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): core_types_pb.UserPhoto | undefined;
  setPhoto(value?: core_types_pb.UserPhoto): void;

  hasPhotoid(): boolean;
  clearPhotoid(): void;
  getPhotoid(): string | undefined;
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
    ucount?: number,
    updateid?: number,
    userid?: string,
    photo?: core_types_pb.UserPhoto.AsObject,
    photoid?: string,
    deletedphotoidsList: Array<string>,
  }
}

export class UpdateNotifySettings extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasNotifypeer(): boolean;
  clearNotifypeer(): void;
  getNotifypeer(): core_types_pb.Peer;
  setNotifypeer(value?: core_types_pb.Peer): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): core_types_pb.PeerNotifySettings;
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
    ucount?: number,
    updateid?: number,
    userid?: string,
    notifypeer: core_types_pb.Peer.AsObject,
    settings: core_types_pb.PeerNotifySettings.AsObject,
  }
}

export class UpdateGroupParticipantAdd extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasInviterid(): boolean;
  clearInviterid(): void;
  getInviterid(): string | undefined;
  setInviterid(value: string): void;

  hasDate(): boolean;
  clearDate(): void;
  getDate(): number | undefined;
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
    ucount?: number,
    updateid?: number,
    groupid?: string,
    userid?: string,
    inviterid?: string,
    date?: number,
  }
}

export class UpdateGroupParticipantDeleted extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
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
    ucount?: number,
    updateid?: number,
    groupid?: string,
    userid?: string,
  }
}

export class UpdateGroupParticipantAdmin extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasIsadmin(): boolean;
  clearIsadmin(): void;
  getIsadmin(): boolean | undefined;
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
    ucount?: number,
    updateid?: number,
    groupid?: string,
    userid?: string,
    isadmin?: boolean,
  }
}

export class UpdateGroupAdmins extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasAdminenabled(): boolean;
  clearAdminenabled(): void;
  getAdminenabled(): boolean | undefined;
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
    ucount?: number,
    updateid?: number,
    groupid?: string,
    adminenabled?: boolean,
  }
}

export class UpdateGroupPhoto extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasGroupid(): boolean;
  clearGroupid(): void;
  getGroupid(): string | undefined;
  setGroupid(value: string): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): core_types_pb.GroupPhoto | undefined;
  setPhoto(value?: core_types_pb.GroupPhoto): void;

  hasPhotoid(): boolean;
  clearPhotoid(): void;
  getPhotoid(): string | undefined;
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
    ucount?: number,
    updateid?: number,
    groupid?: string,
    photo?: core_types_pb.GroupPhoto.AsObject,
    photoid?: string,
  }
}

export class UpdateReadMessagesContents extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer;
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
    ucount?: number,
    updateid?: number,
    messageidsList: Array<number>,
    peer: core_types_pb.Peer.AsObject,
  }
}

export class UpdateAuthorizationReset extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
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
    ucount?: number,
    updateid?: number,
  }
}

export class UpdateDraftMessage extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): core_types_pb.DraftMessage;
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
    ucount?: number,
    updateid?: number,
    message: core_types_pb.DraftMessage.AsObject,
  }
}

export class UpdateDraftMessageCleared extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer;
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
    ucount?: number,
    updateid?: number,
    peer: core_types_pb.Peer.AsObject,
  }
}

export class UpdateDialogPinned extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer;
  setPeer(value?: core_types_pb.Peer): void;

  hasPinned(): boolean;
  clearPinned(): void;
  getPinned(): boolean | undefined;
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
    ucount?: number,
    updateid?: number,
    peer: core_types_pb.Peer.AsObject,
    pinned?: boolean,
  }
}

export class UpdateDialogPinnedReorder extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
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
    ucount?: number,
    updateid?: number,
    peerList: Array<core_types_pb.Peer.AsObject>,
  }
}

export class UpdateAccountPrivacy extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
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
    ucount?: number,
    updateid?: number,
    chatinviteList: Array<core_types_pb.PrivacyRule.AsObject>,
    lastseenList: Array<core_types_pb.PrivacyRule.AsObject>,
    phonenumberList: Array<core_types_pb.PrivacyRule.AsObject>,
    profilephotoList: Array<core_types_pb.PrivacyRule.AsObject>,
    forwardedmessageList: Array<core_types_pb.PrivacyRule.AsObject>,
    callList: Array<core_types_pb.PrivacyRule.AsObject>,
  }
}

export class UpdateLabelItemsAdded extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer;
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
    ucount?: number,
    updateid?: number,
    peer: core_types_pb.Peer.AsObject,
    messageidsList: Array<number>,
    labelidsList: Array<number>,
    labelsList: Array<core_types_pb.Label.AsObject>,
  }
}

export class UpdateLabelItemsRemoved extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer;
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
    ucount?: number,
    updateid?: number,
    peer: core_types_pb.Peer.AsObject,
    messageidsList: Array<number>,
    labelidsList: Array<number>,
    labelsList: Array<core_types_pb.Label.AsObject>,
  }
}

export class UpdateLabelSet extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
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
    ucount?: number,
    updateid?: number,
    labelsList: Array<core_types_pb.Label.AsObject>,
  }
}

export class UpdateLabelDeleted extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
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
    ucount?: number,
    updateid?: number,
    labelidsList: Array<number>,
  }
}

export class UpdateUserBlocked extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasBlocked(): boolean;
  clearBlocked(): void;
  getBlocked(): boolean | undefined;
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
    ucount?: number,
    updateid?: number,
    userid?: string,
    blocked?: boolean,
  }
}

export class UpdateMessagePoll extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasPollid(): boolean;
  clearPollid(): void;
  getPollid(): number | undefined;
  setPollid(value: number): void;

  hasPoll(): boolean;
  clearPoll(): void;
  getPoll(): chat_messages_medias_pb.MediaPoll | undefined;
  setPoll(value?: chat_messages_medias_pb.MediaPoll): void;

  hasResults(): boolean;
  clearResults(): void;
  getResults(): chat_messages_medias_pb.PollResults;
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
    ucount?: number,
    updateid?: number,
    pollid?: number,
    poll?: chat_messages_medias_pb.MediaPoll.AsObject,
    results: chat_messages_medias_pb.PollResults.AsObject,
  }
}

export class UpdateBotCallbackQuery extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasQueryid(): boolean;
  clearQueryid(): void;
  getQueryid(): number | undefined;
  setQueryid(value: number): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): number | undefined;
  setUserid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer;
  setPeer(value?: core_types_pb.Peer): void;

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
    ucount?: number,
    updateid?: number,
    queryid?: number,
    userid?: number,
    peer: core_types_pb.Peer.AsObject,
    messageid?: number,
    data: Uint8Array | string,
  }
}

export class UpdateBotInlineQuery extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasQueryid(): boolean;
  clearQueryid(): void;
  getQueryid(): number | undefined;
  setQueryid(value: number): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): number | undefined;
  setUserid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.Peer;
  setPeer(value?: core_types_pb.Peer): void;

  hasQuery(): boolean;
  clearQuery(): void;
  getQuery(): string | undefined;
  setQuery(value: string): void;

  hasOffset(): boolean;
  clearOffset(): void;
  getOffset(): string | undefined;
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
    ucount?: number,
    updateid?: number,
    queryid?: number,
    userid?: number,
    peer: core_types_pb.Peer.AsObject,
    query?: string,
    offset?: string,
    geo?: core_types_pb.GeoLocation.AsObject,
  }
}

export class UpdateBotInlineSend extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): number | undefined;
  setUserid(value: number): void;

  hasQuery(): boolean;
  clearQuery(): void;
  getQuery(): string | undefined;
  setQuery(value: string): void;

  hasResultid(): boolean;
  clearResultid(): void;
  getResultid(): string | undefined;
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
    ucount?: number,
    updateid?: number,
    userid?: number,
    query?: string,
    resultid?: string,
    geo?: core_types_pb.GeoLocation.AsObject,
  }
}

export class UpdateTeamCreated extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): core_types_pb.Team;
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
    ucount?: number,
    updateid?: number,
    team: core_types_pb.Team.AsObject,
  }
}

export class UpdateTeamMemberAdded extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasTeamid(): boolean;
  clearTeamid(): void;
  getTeamid(): string | undefined;
  setTeamid(value: string): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasAdderid(): boolean;
  clearAdderid(): void;
  getAdderid(): string | undefined;
  setAdderid(value: string): void;

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
    ucount?: number,
    updateid?: number,
    teamid?: string,
    userid?: string,
    adderid?: string,
  }
}

export class UpdateTeamMemberRemoved extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasTeamid(): boolean;
  clearTeamid(): void;
  getTeamid(): string | undefined;
  setTeamid(value: string): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasRemoverid(): boolean;
  clearRemoverid(): void;
  getRemoverid(): string | undefined;
  setRemoverid(value: string): void;

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
    ucount?: number,
    updateid?: number,
    teamid?: string,
    userid?: string,
    removerid?: string,
  }
}

export class UpdateTeamPhotoChanged extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasTeamid(): boolean;
  clearTeamid(): void;
  getTeamid(): string | undefined;
  setTeamid(value: string): void;

  hasPhoto(): boolean;
  clearPhoto(): void;
  getPhoto(): core_types_pb.FileLocation;
  setPhoto(value?: core_types_pb.FileLocation): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTeamPhotoChanged.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTeamPhotoChanged): UpdateTeamPhotoChanged.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateTeamPhotoChanged, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTeamPhotoChanged;
  static deserializeBinaryFromReader(message: UpdateTeamPhotoChanged, reader: jspb.BinaryReader): UpdateTeamPhotoChanged;
}

export namespace UpdateTeamPhotoChanged {
  export type AsObject = {
    ucount?: number,
    updateid?: number,
    teamid?: string,
    photo: core_types_pb.FileLocation.AsObject,
  }
}

export class UpdateCalendarEventAdded extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasEvent(): boolean;
  clearEvent(): void;
  getEvent(): calendar_pb.CalendarEvent;
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
    ucount?: number,
    updateid?: number,
    event: calendar_pb.CalendarEvent.AsObject,
  }
}

export class UpdateCalendarEventRemoved extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasEventid(): boolean;
  clearEventid(): void;
  getEventid(): string | undefined;
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
    ucount?: number,
    updateid?: number,
    eventid?: string,
  }
}

export class UpdateCalendarEventEdited extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  hasEvent(): boolean;
  clearEvent(): void;
  getEvent(): calendar_pb.CalendarEvent;
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
    ucount?: number,
    updateid?: number,
    event: calendar_pb.CalendarEvent.AsObject,
  }
}

