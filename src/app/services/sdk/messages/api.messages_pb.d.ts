// package: msg
// file: api.messages.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class MessagesSend extends jspb.Message {
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

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesSend.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesSend): MessagesSend.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesSend, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesSend;
  static deserializeBinaryFromReader(message: MessagesSend, reader: jspb.BinaryReader): MessagesSend;
}

export namespace MessagesSend {
  export type AsObject = {
    randomid?: number,
    peer: core_types_pb.InputPeer.AsObject,
    body?: string,
    replyto?: number,
  }
}

export class MessagesEdit extends jspb.Message {
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

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesEdit.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesEdit): MessagesEdit.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesEdit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesEdit;
  static deserializeBinaryFromReader(message: MessagesEdit, reader: jspb.BinaryReader): MessagesEdit;
}

export namespace MessagesEdit {
  export type AsObject = {
    randomid?: number,
    peer: core_types_pb.InputPeer.AsObject,
    body?: string,
    messageid?: number,
  }
}

export class MessagesSendMedia extends jspb.Message {
  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasFile(): boolean;
  clearFile(): void;
  getFile(): core_types_pb.InputFile;
  setFile(value?: core_types_pb.InputFile): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesSendMedia.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesSendMedia): MessagesSendMedia.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesSendMedia, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesSendMedia;
  static deserializeBinaryFromReader(message: MessagesSendMedia, reader: jspb.BinaryReader): MessagesSendMedia;
}

export namespace MessagesSendMedia {
  export type AsObject = {
    randomid?: number,
    peer: core_types_pb.InputPeer.AsObject,
    file: core_types_pb.InputFile.AsObject,
  }
}

export class MessagesReadHistory extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasMaxid(): boolean;
  clearMaxid(): void;
  getMaxid(): number | undefined;
  setMaxid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesReadHistory.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesReadHistory): MessagesReadHistory.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesReadHistory, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesReadHistory;
  static deserializeBinaryFromReader(message: MessagesReadHistory, reader: jspb.BinaryReader): MessagesReadHistory;
}

export namespace MessagesReadHistory {
  export type AsObject = {
    peer: core_types_pb.InputPeer.AsObject,
    maxid?: number,
  }
}

export class MessagesGet extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  clearMessagesidsList(): void;
  getMessagesidsList(): Array<number>;
  setMessagesidsList(value: Array<number>): void;
  addMessagesids(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesGet.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesGet): MessagesGet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesGet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesGet;
  static deserializeBinaryFromReader(message: MessagesGet, reader: jspb.BinaryReader): MessagesGet;
}

export namespace MessagesGet {
  export type AsObject = {
    peer: core_types_pb.InputPeer.AsObject,
    messagesidsList: Array<number>,
  }
}

export class MessagesGetHistory extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasLimit(): boolean;
  clearLimit(): void;
  getLimit(): number | undefined;
  setLimit(value: number): void;

  hasMaxid(): boolean;
  clearMaxid(): void;
  getMaxid(): number | undefined;
  setMaxid(value: number): void;

  hasMinid(): boolean;
  clearMinid(): void;
  getMinid(): number | undefined;
  setMinid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesGetHistory.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesGetHistory): MessagesGetHistory.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesGetHistory, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesGetHistory;
  static deserializeBinaryFromReader(message: MessagesGetHistory, reader: jspb.BinaryReader): MessagesGetHistory;
}

export namespace MessagesGetHistory {
  export type AsObject = {
    peer: core_types_pb.InputPeer.AsObject,
    limit?: number,
    maxid?: number,
    minid?: number,
  }
}

export class MessagesGetDialogs extends jspb.Message {
  hasLimit(): boolean;
  clearLimit(): void;
  getLimit(): number | undefined;
  setLimit(value: number): void;

  hasOffset(): boolean;
  clearOffset(): void;
  getOffset(): number | undefined;
  setOffset(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesGetDialogs.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesGetDialogs): MessagesGetDialogs.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesGetDialogs, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesGetDialogs;
  static deserializeBinaryFromReader(message: MessagesGetDialogs, reader: jspb.BinaryReader): MessagesGetDialogs;
}

export namespace MessagesGetDialogs {
  export type AsObject = {
    limit?: number,
    offset?: number,
  }
}

export class MessagesGetDialog extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesGetDialog.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesGetDialog): MessagesGetDialog.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesGetDialog, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesGetDialog;
  static deserializeBinaryFromReader(message: MessagesGetDialog, reader: jspb.BinaryReader): MessagesGetDialog;
}

export namespace MessagesGetDialog {
  export type AsObject = {
    peer: core_types_pb.InputPeer.AsObject,
  }
}

export class MessagesSetTyping extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasAction(): boolean;
  clearAction(): void;
  getAction(): core_types_pb.TypingAction | undefined;
  setAction(value: core_types_pb.TypingAction): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesSetTyping.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesSetTyping): MessagesSetTyping.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesSetTyping, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesSetTyping;
  static deserializeBinaryFromReader(message: MessagesSetTyping, reader: jspb.BinaryReader): MessagesSetTyping;
}

export namespace MessagesSetTyping {
  export type AsObject = {
    peer: core_types_pb.InputPeer.AsObject,
    action?: core_types_pb.TypingAction,
  }
}

export class MessagesCreateGroup extends jspb.Message {
  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.InputUser>;
  setUsersList(value: Array<core_types_pb.InputUser>): void;
  addUsers(value?: core_types_pb.InputUser, index?: number): core_types_pb.InputUser;

  hasTitle(): boolean;
  clearTitle(): void;
  getTitle(): string | undefined;
  setTitle(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesCreateGroup.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesCreateGroup): MessagesCreateGroup.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesCreateGroup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesCreateGroup;
  static deserializeBinaryFromReader(message: MessagesCreateGroup, reader: jspb.BinaryReader): MessagesCreateGroup;
}

export namespace MessagesCreateGroup {
  export type AsObject = {
    usersList: Array<core_types_pb.InputUser.AsObject>,
    title?: string,
  }
}

export class MessagesAddGroupUser extends jspb.Message {
  hasChatid(): boolean;
  clearChatid(): void;
  getChatid(): number | undefined;
  setChatid(value: number): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser;
  setUser(value?: core_types_pb.InputUser): void;

  hasForwardlimit(): boolean;
  clearForwardlimit(): void;
  getForwardlimit(): number | undefined;
  setForwardlimit(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesAddGroupUser.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesAddGroupUser): MessagesAddGroupUser.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesAddGroupUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesAddGroupUser;
  static deserializeBinaryFromReader(message: MessagesAddGroupUser, reader: jspb.BinaryReader): MessagesAddGroupUser;
}

export namespace MessagesAddGroupUser {
  export type AsObject = {
    chatid?: number,
    user: core_types_pb.InputUser.AsObject,
    forwardlimit?: number,
  }
}

export class MessagesEditGroupTitle extends jspb.Message {
  hasChatid(): boolean;
  clearChatid(): void;
  getChatid(): number | undefined;
  setChatid(value: number): void;

  hasTitle(): boolean;
  clearTitle(): void;
  getTitle(): string | undefined;
  setTitle(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesEditGroupTitle.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesEditGroupTitle): MessagesEditGroupTitle.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesEditGroupTitle, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesEditGroupTitle;
  static deserializeBinaryFromReader(message: MessagesEditGroupTitle, reader: jspb.BinaryReader): MessagesEditGroupTitle;
}

export namespace MessagesEditGroupTitle {
  export type AsObject = {
    chatid?: number,
    title?: string,
  }
}

export class MessagesDeleteGroupUser extends jspb.Message {
  hasChatid(): boolean;
  clearChatid(): void;
  getChatid(): number | undefined;
  setChatid(value: number): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser;
  setUser(value?: core_types_pb.InputUser): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesDeleteGroupUser.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesDeleteGroupUser): MessagesDeleteGroupUser.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesDeleteGroupUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesDeleteGroupUser;
  static deserializeBinaryFromReader(message: MessagesDeleteGroupUser, reader: jspb.BinaryReader): MessagesDeleteGroupUser;
}

export namespace MessagesDeleteGroupUser {
  export type AsObject = {
    chatid?: number,
    user: core_types_pb.InputUser.AsObject,
  }
}

export class MessagesDialogs extends jspb.Message {
  clearDialogsList(): void;
  getDialogsList(): Array<core_types_pb.Dialog>;
  setDialogsList(value: Array<core_types_pb.Dialog>): void;
  addDialogs(value?: core_types_pb.Dialog, index?: number): core_types_pb.Dialog;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  clearMessagesList(): void;
  getMessagesList(): Array<core_types_pb.UserMessage>;
  setMessagesList(value: Array<core_types_pb.UserMessage>): void;
  addMessages(value?: core_types_pb.UserMessage, index?: number): core_types_pb.UserMessage;

  hasCount(): boolean;
  clearCount(): void;
  getCount(): number | undefined;
  setCount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesDialogs.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesDialogs): MessagesDialogs.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesDialogs, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesDialogs;
  static deserializeBinaryFromReader(message: MessagesDialogs, reader: jspb.BinaryReader): MessagesDialogs;
}

export namespace MessagesDialogs {
  export type AsObject = {
    dialogsList: Array<core_types_pb.Dialog.AsObject>,
    usersList: Array<core_types_pb.User.AsObject>,
    messagesList: Array<core_types_pb.UserMessage.AsObject>,
    count?: number,
    updateid?: number,
  }
}

export class MessagesSent extends jspb.Message {
  hasMessageid(): boolean;
  clearMessageid(): void;
  getMessageid(): number | undefined;
  setMessageid(value: number): void;

  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasCreatedon(): boolean;
  clearCreatedon(): void;
  getCreatedon(): number | undefined;
  setCreatedon(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesSent.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesSent): MessagesSent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesSent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesSent;
  static deserializeBinaryFromReader(message: MessagesSent, reader: jspb.BinaryReader): MessagesSent;
}

export namespace MessagesSent {
  export type AsObject = {
    messageid?: number,
    randomid?: number,
    createdon?: number,
  }
}

export class MessagesMany extends jspb.Message {
  clearMessagesList(): void;
  getMessagesList(): Array<core_types_pb.UserMessage>;
  setMessagesList(value: Array<core_types_pb.UserMessage>): void;
  addMessages(value?: core_types_pb.UserMessage, index?: number): core_types_pb.UserMessage;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesMany.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesMany): MessagesMany.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesMany, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesMany;
  static deserializeBinaryFromReader(message: MessagesMany, reader: jspb.BinaryReader): MessagesMany;
}

export namespace MessagesMany {
  export type AsObject = {
    messagesList: Array<core_types_pb.UserMessage.AsObject>,
    usersList: Array<core_types_pb.User.AsObject>,
  }
}

