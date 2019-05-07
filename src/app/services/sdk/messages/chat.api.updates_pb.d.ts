// package: msg
// file: chat.api.updates.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";

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
  getUpdatesList(): Array<chat_core_types_pb.UpdateEnvelope>;
  setUpdatesList(value: Array<chat_core_types_pb.UpdateEnvelope>): void;
  addUpdates(value?: chat_core_types_pb.UpdateEnvelope, index?: number): chat_core_types_pb.UpdateEnvelope;

  clearUsersList(): void;
  getUsersList(): Array<chat_core_types_pb.User>;
  setUsersList(value: Array<chat_core_types_pb.User>): void;
  addUsers(value?: chat_core_types_pb.User, index?: number): chat_core_types_pb.User;

  clearGroupsList(): void;
  getGroupsList(): Array<chat_core_types_pb.Group>;
  setGroupsList(value: Array<chat_core_types_pb.Group>): void;
  addGroups(value?: chat_core_types_pb.Group, index?: number): chat_core_types_pb.Group;

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
    updatesList: Array<chat_core_types_pb.UpdateEnvelope.AsObject>,
    usersList: Array<chat_core_types_pb.User.AsObject>,
    groupsList: Array<chat_core_types_pb.Group.AsObject>,
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
  getMessage(): chat_core_types_pb.UserMessage;
  setMessage(value?: chat_core_types_pb.UserMessage): void;

  hasSender(): boolean;
  clearSender(): void;
  getSender(): chat_core_types_pb.User;
  setSender(value?: chat_core_types_pb.User): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
  setAccesshash(value: string): void;

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
    message: chat_core_types_pb.UserMessage.AsObject,
    sender: chat_core_types_pb.User.AsObject,
    accesshash?: string,
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
  getMessage(): chat_core_types_pb.UserMessage;
  setMessage(value?: chat_core_types_pb.UserMessage): void;

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
    message: chat_core_types_pb.UserMessage.AsObject,
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
  getPeer(): chat_core_types_pb.Peer | undefined;
  setPeer(value?: chat_core_types_pb.Peer): void;

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
    peer?: chat_core_types_pb.Peer.AsObject,
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
  getPeer(): chat_core_types_pb.Peer;
  setPeer(value?: chat_core_types_pb.Peer): void;

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
    peer: chat_core_types_pb.Peer.AsObject,
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
  getPeer(): chat_core_types_pb.Peer;
  setPeer(value?: chat_core_types_pb.Peer): void;

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
    peer: chat_core_types_pb.Peer.AsObject,
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
  getAction(): chat_core_types_pb.TypingAction | undefined;
  setAction(value: chat_core_types_pb.TypingAction): void;

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
    action?: chat_core_types_pb.TypingAction,
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
  getPhoto(): chat_core_types_pb.UserPhoto | undefined;
  setPhoto(value?: chat_core_types_pb.UserPhoto): void;

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
    photo?: chat_core_types_pb.UserPhoto.AsObject,
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
  getNotifypeer(): chat_core_types_pb.Peer;
  setNotifypeer(value?: chat_core_types_pb.Peer): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): chat_core_types_pb.PeerNotifySettings;
  setSettings(value?: chat_core_types_pb.PeerNotifySettings): void;

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
    notifypeer: chat_core_types_pb.Peer.AsObject,
    settings: chat_core_types_pb.PeerNotifySettings.AsObject,
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
  getPhoto(): chat_core_types_pb.GroupPhoto | undefined;
  setPhoto(value?: chat_core_types_pb.GroupPhoto): void;

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
    photo?: chat_core_types_pb.GroupPhoto.AsObject,
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
  getPeer(): chat_core_types_pb.Peer;
  setPeer(value?: chat_core_types_pb.Peer): void;

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
    peer: chat_core_types_pb.Peer.AsObject,
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

  hasMessage(): boolean;
  clearMessage(): void;
  getMessage(): chat_core_types_pb.DraftMessage;
  setMessage(value?: chat_core_types_pb.DraftMessage): void;

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
    message: chat_core_types_pb.DraftMessage.AsObject,
  }
}

export class UpdateDraftMessageCleared extends jspb.Message {
  hasUcount(): boolean;
  clearUcount(): void;
  getUcount(): number | undefined;
  setUcount(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.Peer;
  setPeer(value?: chat_core_types_pb.Peer): void;

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
    peer: chat_core_types_pb.Peer.AsObject,
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
  getPeer(): chat_core_types_pb.Peer;
  setPeer(value?: chat_core_types_pb.Peer): void;

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
    peer: chat_core_types_pb.Peer.AsObject,
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
  getPeerList(): Array<chat_core_types_pb.Peer>;
  setPeerList(value: Array<chat_core_types_pb.Peer>): void;
  addPeer(value?: chat_core_types_pb.Peer, index?: number): chat_core_types_pb.Peer;

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
    peerList: Array<chat_core_types_pb.Peer.AsObject>,
  }
}

