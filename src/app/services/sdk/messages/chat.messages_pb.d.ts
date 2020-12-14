/* tslint:disable */
// package: msg
// file: chat.messages.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class MessagesSend extends jspb.Message {
  getRandomid(): number;
  setRandomid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getBody(): string;
  setBody(value: string): void;

  getReplyto(): number;
  setReplyto(value: number): void;

  getCleardraft(): boolean;
  setCleardraft(value: boolean): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

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
    randomid: number,
    peer?: core_types_pb.InputPeer.AsObject,
    body: string,
    replyto: number,
    cleardraft: boolean,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
  }
}

export class MessagesSendMedia extends jspb.Message {
  getRandomid(): number;
  setRandomid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getMediatype(): core_types_pb.InputMediaTypeMap[keyof core_types_pb.InputMediaTypeMap];
  setMediatype(value: core_types_pb.InputMediaTypeMap[keyof core_types_pb.InputMediaTypeMap]): void;

  getMediadata(): Uint8Array | string;
  getMediadata_asU8(): Uint8Array;
  getMediadata_asB64(): string;
  setMediadata(value: Uint8Array | string): void;

  getReplyto(): number;
  setReplyto(value: number): void;

  getCleardraft(): boolean;
  setCleardraft(value: boolean): void;

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
    randomid: number,
    peer?: core_types_pb.InputPeer.AsObject,
    mediatype: core_types_pb.InputMediaTypeMap[keyof core_types_pb.InputMediaTypeMap],
    mediadata: Uint8Array | string,
    replyto: number,
    cleardraft: boolean,
  }
}

export class MessagesEdit extends jspb.Message {
  getRandomid(): number;
  setRandomid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getBody(): string;
  setBody(value: string): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

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
    randomid: number,
    peer?: core_types_pb.InputPeer.AsObject,
    body: string,
    messageid: number,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
  }
}

export class MessagesReadHistory extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getMaxid(): number;
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
    peer?: core_types_pb.InputPeer.AsObject,
    maxid: number,
  }
}

export class MessagesGet extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
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
    peer?: core_types_pb.InputPeer.AsObject,
    messagesidsList: Array<number>,
  }
}

export class MessagesGetHistory extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getLimit(): number;
  setLimit(value: number): void;

  getMaxid(): number;
  setMaxid(value: number): void;

  getMinid(): number;
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
    peer?: core_types_pb.InputPeer.AsObject,
    limit: number,
    maxid: number,
    minid: number,
  }
}

export class MessagesGetDialogs extends jspb.Message {
  getLimit(): number;
  setLimit(value: number): void;

  getOffset(): number;
  setOffset(value: number): void;

  getExcludepinned(): boolean;
  setExcludepinned(value: boolean): void;

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
    limit: number,
    offset: number,
    excludepinned: boolean,
  }
}

export class MessagesGetPinnedDialogs extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesGetPinnedDialogs.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesGetPinnedDialogs): MessagesGetPinnedDialogs.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesGetPinnedDialogs, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesGetPinnedDialogs;
  static deserializeBinaryFromReader(message: MessagesGetPinnedDialogs, reader: jspb.BinaryReader): MessagesGetPinnedDialogs;
}

export namespace MessagesGetPinnedDialogs {
  export type AsObject = {
  }
}

export class MessagesGetDialog extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
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
    peer?: core_types_pb.InputPeer.AsObject,
  }
}

export class MessagesSetTyping extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getAction(): core_types_pb.TypingActionMap[keyof core_types_pb.TypingActionMap];
  setAction(value: core_types_pb.TypingActionMap[keyof core_types_pb.TypingActionMap]): void;

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
    peer?: core_types_pb.InputPeer.AsObject,
    action: core_types_pb.TypingActionMap[keyof core_types_pb.TypingActionMap],
  }
}

export class MessagesClearHistory extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getMaxid(): number;
  setMaxid(value: number): void;

  getDelete(): boolean;
  setDelete(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesClearHistory.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesClearHistory): MessagesClearHistory.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesClearHistory, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesClearHistory;
  static deserializeBinaryFromReader(message: MessagesClearHistory, reader: jspb.BinaryReader): MessagesClearHistory;
}

export namespace MessagesClearHistory {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    maxid: number,
    pb_delete: boolean,
  }
}

export class MessagesDelete extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  getRevoke(): boolean;
  setRevoke(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesDelete.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesDelete): MessagesDelete.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesDelete, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesDelete;
  static deserializeBinaryFromReader(message: MessagesDelete, reader: jspb.BinaryReader): MessagesDelete;
}

export namespace MessagesDelete {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    messageidsList: Array<number>,
    revoke: boolean,
  }
}

export class MessagesForward extends jspb.Message {
  hasFrompeer(): boolean;
  clearFrompeer(): void;
  getFrompeer(): core_types_pb.InputPeer | undefined;
  setFrompeer(value?: core_types_pb.InputPeer): void;

  hasTopeer(): boolean;
  clearTopeer(): void;
  getTopeer(): core_types_pb.InputPeer | undefined;
  setTopeer(value?: core_types_pb.InputPeer): void;

  getSilence(): boolean;
  setSilence(value: boolean): void;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  getRandomid(): number;
  setRandomid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesForward.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesForward): MessagesForward.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesForward, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesForward;
  static deserializeBinaryFromReader(message: MessagesForward, reader: jspb.BinaryReader): MessagesForward;
}

export namespace MessagesForward {
  export type AsObject = {
    frompeer?: core_types_pb.InputPeer.AsObject,
    topeer?: core_types_pb.InputPeer.AsObject,
    silence: boolean,
    messageidsList: Array<number>,
    randomid: number,
  }
}

export class MessagesReadContents extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesReadContents.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesReadContents): MessagesReadContents.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesReadContents, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesReadContents;
  static deserializeBinaryFromReader(message: MessagesReadContents, reader: jspb.BinaryReader): MessagesReadContents;
}

export namespace MessagesReadContents {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    messageidsList: Array<number>,
  }
}

export class MessagesSaveDraft extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getReplyto(): number;
  setReplyto(value: number): void;

  getBody(): string;
  setBody(value: string): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

  getEditedid(): number;
  setEditedid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesSaveDraft.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesSaveDraft): MessagesSaveDraft.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesSaveDraft, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesSaveDraft;
  static deserializeBinaryFromReader(message: MessagesSaveDraft, reader: jspb.BinaryReader): MessagesSaveDraft;
}

export namespace MessagesSaveDraft {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    replyto: number,
    body: string,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
    editedid: number,
  }
}

export class MessagesClearDraft extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesClearDraft.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesClearDraft): MessagesClearDraft.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesClearDraft, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesClearDraft;
  static deserializeBinaryFromReader(message: MessagesClearDraft, reader: jspb.BinaryReader): MessagesClearDraft;
}

export namespace MessagesClearDraft {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
  }
}

export class MessagesToggleDialogPin extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getPin(): boolean;
  setPin(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesToggleDialogPin.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesToggleDialogPin): MessagesToggleDialogPin.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesToggleDialogPin, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesToggleDialogPin;
  static deserializeBinaryFromReader(message: MessagesToggleDialogPin, reader: jspb.BinaryReader): MessagesToggleDialogPin;
}

export namespace MessagesToggleDialogPin {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    pin: boolean,
  }
}

export class MessagesReorderPinnedDialogs extends jspb.Message {
  clearPeersList(): void;
  getPeersList(): Array<core_types_pb.InputPeer>;
  setPeersList(value: Array<core_types_pb.InputPeer>): void;
  addPeers(value?: core_types_pb.InputPeer, index?: number): core_types_pb.InputPeer;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesReorderPinnedDialogs.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesReorderPinnedDialogs): MessagesReorderPinnedDialogs.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesReorderPinnedDialogs, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesReorderPinnedDialogs;
  static deserializeBinaryFromReader(message: MessagesReorderPinnedDialogs, reader: jspb.BinaryReader): MessagesReorderPinnedDialogs;
}

export namespace MessagesReorderPinnedDialogs {
  export type AsObject = {
    peersList: Array<core_types_pb.InputPeer.AsObject>,
  }
}

export class MessagesSendScreenShotNotification extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getRandomid(): number;
  setRandomid(value: number): void;

  getReplyto(): number;
  setReplyto(value: number): void;

  getMinid(): number;
  setMinid(value: number): void;

  getMaxid(): number;
  setMaxid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesSendScreenShotNotification.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesSendScreenShotNotification): MessagesSendScreenShotNotification.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesSendScreenShotNotification, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesSendScreenShotNotification;
  static deserializeBinaryFromReader(message: MessagesSendScreenShotNotification, reader: jspb.BinaryReader): MessagesSendScreenShotNotification;
}

export namespace MessagesSendScreenShotNotification {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    randomid: number,
    replyto: number,
    minid: number,
    maxid: number,
  }
}

export class MessagesSendReaction extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  getReaction(): string;
  setReaction(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesSendReaction.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesSendReaction): MessagesSendReaction.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesSendReaction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesSendReaction;
  static deserializeBinaryFromReader(message: MessagesSendReaction, reader: jspb.BinaryReader): MessagesSendReaction;
}

export namespace MessagesSendReaction {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    messageid: number,
    reaction: string,
  }
}

export class MessagesDeleteReaction extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  clearReactionsList(): void;
  getReactionsList(): Array<string>;
  setReactionsList(value: Array<string>): void;
  addReactions(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesDeleteReaction.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesDeleteReaction): MessagesDeleteReaction.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesDeleteReaction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesDeleteReaction;
  static deserializeBinaryFromReader(message: MessagesDeleteReaction, reader: jspb.BinaryReader): MessagesDeleteReaction;
}

export namespace MessagesDeleteReaction {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    messageid: number,
    reactionsList: Array<string>,
  }
}

export class MessagesGetReactionList extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  getHash(): number;
  setHash(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesGetReactionList.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesGetReactionList): MessagesGetReactionList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesGetReactionList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesGetReactionList;
  static deserializeBinaryFromReader(message: MessagesGetReactionList, reader: jspb.BinaryReader): MessagesGetReactionList;
}

export namespace MessagesGetReactionList {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    messageid: number,
    hash: number,
  }
}

export class MessagesTogglePin extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  getSilent(): boolean;
  setSilent(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesTogglePin.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesTogglePin): MessagesTogglePin.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesTogglePin, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesTogglePin;
  static deserializeBinaryFromReader(message: MessagesTogglePin, reader: jspb.BinaryReader): MessagesTogglePin;
}

export namespace MessagesTogglePin {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    messageid: number,
    silent: boolean,
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

  getCount(): number;
  setCount(value: number): void;

  getUpdateid(): number;
  setUpdateid(value: number): void;

  clearGroupsList(): void;
  getGroupsList(): Array<core_types_pb.Group>;
  setGroupsList(value: Array<core_types_pb.Group>): void;
  addGroups(value?: core_types_pb.Group, index?: number): core_types_pb.Group;

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
    count: number,
    updateid: number,
    groupsList: Array<core_types_pb.Group.AsObject>,
  }
}

export class MessagesSent extends jspb.Message {
  getMessageid(): number;
  setMessageid(value: number): void;

  getRandomid(): number;
  setRandomid(value: number): void;

  getCreatedon(): number;
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
    messageid: number,
    randomid: number,
    createdon: number,
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

  clearGroupsList(): void;
  getGroupsList(): Array<core_types_pb.Group>;
  setGroupsList(value: Array<core_types_pb.Group>): void;
  addGroups(value?: core_types_pb.Group, index?: number): core_types_pb.Group;

  getContinuous(): boolean;
  setContinuous(value: boolean): void;

  getEmpty(): boolean;
  setEmpty(value: boolean): void;

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
    groupsList: Array<core_types_pb.Group.AsObject>,
    continuous: boolean,
    empty: boolean,
  }
}

export class MessagesReactionList extends jspb.Message {
  clearListList(): void;
  getListList(): Array<ReactionList>;
  setListList(value: Array<ReactionList>): void;
  addList(value?: ReactionList, index?: number): ReactionList;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  getHash(): number;
  setHash(value: number): void;

  getModified(): boolean;
  setModified(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesReactionList.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesReactionList): MessagesReactionList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesReactionList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesReactionList;
  static deserializeBinaryFromReader(message: MessagesReactionList, reader: jspb.BinaryReader): MessagesReactionList;
}

export namespace MessagesReactionList {
  export type AsObject = {
    listList: Array<ReactionList.AsObject>,
    usersList: Array<core_types_pb.User.AsObject>,
    hash: number,
    modified: boolean,
  }
}

export class ReactionList extends jspb.Message {
  getReaction(): string;
  setReaction(value: string): void;

  clearUseridsList(): void;
  getUseridsList(): Array<string>;
  setUseridsList(value: Array<string>): void;
  addUserids(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReactionList.AsObject;
  static toObject(includeInstance: boolean, msg: ReactionList): ReactionList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReactionList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReactionList;
  static deserializeBinaryFromReader(message: ReactionList, reader: jspb.BinaryReader): ReactionList;
}

export namespace ReactionList {
  export type AsObject = {
    reaction: string,
    useridsList: Array<string>,
  }
}

