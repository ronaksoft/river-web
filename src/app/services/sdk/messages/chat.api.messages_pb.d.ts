/* tslint:disable */
// package: msg
// file: chat.api.messages.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";

export class MessagesSend extends jspb.Message {
  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

  hasCleardraft(): boolean;
  clearCleardraft(): void;
  getCleardraft(): boolean | undefined;
  setCleardraft(value: boolean): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<chat_core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<chat_core_types_pb.MessageEntity>): void;
  addEntities(value?: chat_core_types_pb.MessageEntity, index?: number): chat_core_types_pb.MessageEntity;

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
    peer: chat_core_types_pb.InputPeer.AsObject,
    body?: string,
    replyto?: number,
    cleardraft?: boolean,
    entitiesList: Array<chat_core_types_pb.MessageEntity.AsObject>,
  }
}

export class MessagesBroadcast extends jspb.Message {
  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesBroadcast.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesBroadcast): MessagesBroadcast.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesBroadcast, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesBroadcast;
  static deserializeBinaryFromReader(message: MessagesBroadcast, reader: jspb.BinaryReader): MessagesBroadcast;
}

export namespace MessagesBroadcast {
  export type AsObject = {
    body?: string,
  }
}

export class MessagesBroadcastProgress extends jspb.Message {
  hasPercentage(): boolean;
  clearPercentage(): void;
  getPercentage(): number | undefined;
  setPercentage(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessagesBroadcastProgress.AsObject;
  static toObject(includeInstance: boolean, msg: MessagesBroadcastProgress): MessagesBroadcastProgress.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessagesBroadcastProgress, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessagesBroadcastProgress;
  static deserializeBinaryFromReader(message: MessagesBroadcastProgress, reader: jspb.BinaryReader): MessagesBroadcastProgress;
}

export namespace MessagesBroadcastProgress {
  export type AsObject = {
    percentage?: number,
  }
}

export class MessagesSendMedia extends jspb.Message {
  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasMediatype(): boolean;
  clearMediatype(): void;
  getMediatype(): InputMediaType | undefined;
  setMediatype(value: InputMediaType): void;

  hasMediadata(): boolean;
  clearMediadata(): void;
  getMediadata(): Uint8Array | string;
  getMediadata_asU8(): Uint8Array;
  getMediadata_asB64(): string;
  setMediadata(value: Uint8Array | string): void;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

  hasCleardraft(): boolean;
  clearCleardraft(): void;
  getCleardraft(): boolean | undefined;
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
    randomid?: number,
    peer: chat_core_types_pb.InputPeer.AsObject,
    mediatype?: InputMediaType,
    mediadata: Uint8Array | string,
    replyto?: number,
    cleardraft?: boolean,
  }
}

export class MessagesEdit extends jspb.Message {
  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  hasMessageid(): boolean;
  clearMessageid(): void;
  getMessageid(): number | undefined;
  setMessageid(value: number): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<chat_core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<chat_core_types_pb.MessageEntity>): void;
  addEntities(value?: chat_core_types_pb.MessageEntity, index?: number): chat_core_types_pb.MessageEntity;

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
    peer: chat_core_types_pb.InputPeer.AsObject,
    body?: string,
    messageid?: number,
    entitiesList: Array<chat_core_types_pb.MessageEntity.AsObject>,
  }
}

export class MessagesReadHistory extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

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
    peer: chat_core_types_pb.InputPeer.AsObject,
    maxid?: number,
  }
}

export class MessagesGet extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

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
    peer: chat_core_types_pb.InputPeer.AsObject,
    messagesidsList: Array<number>,
  }
}

export class MessagesGetHistory extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

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
    peer: chat_core_types_pb.InputPeer.AsObject,
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

  hasExcludepinned(): boolean;
  clearExcludepinned(): void;
  getExcludepinned(): boolean | undefined;
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
    limit?: number,
    offset?: number,
    excludepinned?: boolean,
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
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

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
    peer: chat_core_types_pb.InputPeer.AsObject,
  }
}

export class MessagesSetTyping extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasAction(): boolean;
  clearAction(): void;
  getAction(): chat_core_types_pb.TypingAction | undefined;
  setAction(value: chat_core_types_pb.TypingAction): void;

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
    peer: chat_core_types_pb.InputPeer.AsObject,
    action?: chat_core_types_pb.TypingAction,
  }
}

export class MessagesClearHistory extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasMaxid(): boolean;
  clearMaxid(): void;
  getMaxid(): number | undefined;
  setMaxid(value: number): void;

  hasDelete(): boolean;
  clearDelete(): void;
  getDelete(): boolean | undefined;
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
    peer: chat_core_types_pb.InputPeer.AsObject,
    maxid?: number,
    pb_delete?: boolean,
  }
}

export class MessagesDelete extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  hasRevoke(): boolean;
  clearRevoke(): void;
  getRevoke(): boolean | undefined;
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
    peer: chat_core_types_pb.InputPeer.AsObject,
    messageidsList: Array<number>,
    revoke?: boolean,
  }
}

export class MessagesForward extends jspb.Message {
  hasFrompeer(): boolean;
  clearFrompeer(): void;
  getFrompeer(): chat_core_types_pb.InputPeer;
  setFrompeer(value?: chat_core_types_pb.InputPeer): void;

  hasTopeer(): boolean;
  clearTopeer(): void;
  getTopeer(): chat_core_types_pb.InputPeer;
  setTopeer(value?: chat_core_types_pb.InputPeer): void;

  hasSilence(): boolean;
  clearSilence(): void;
  getSilence(): boolean | undefined;
  setSilence(value: boolean): void;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
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
    frompeer: chat_core_types_pb.InputPeer.AsObject,
    topeer: chat_core_types_pb.InputPeer.AsObject,
    silence?: boolean,
    messageidsList: Array<number>,
    randomid?: number,
  }
}

export class MessagesReadContents extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

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
    peer: chat_core_types_pb.InputPeer.AsObject,
    messageidsList: Array<number>,
  }
}

export class MessagesSaveDraft extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

  hasBody(): boolean;
  clearBody(): void;
  getBody(): string | undefined;
  setBody(value: string): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<chat_core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<chat_core_types_pb.MessageEntity>): void;
  addEntities(value?: chat_core_types_pb.MessageEntity, index?: number): chat_core_types_pb.MessageEntity;

  hasEditedid(): boolean;
  clearEditedid(): void;
  getEditedid(): number | undefined;
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
    peer: chat_core_types_pb.InputPeer.AsObject,
    replyto?: number,
    body?: string,
    entitiesList: Array<chat_core_types_pb.MessageEntity.AsObject>,
    editedid?: number,
  }
}

export class MessagesClearDraft extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

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
    peer: chat_core_types_pb.InputPeer.AsObject,
  }
}

export class MessagesToggleDialogPin extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasPin(): boolean;
  clearPin(): void;
  getPin(): boolean | undefined;
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
    peer: chat_core_types_pb.InputPeer.AsObject,
    pin?: boolean,
  }
}

export class MessagesReorderPinnedDialogs extends jspb.Message {
  clearPeersList(): void;
  getPeersList(): Array<chat_core_types_pb.InputPeer>;
  setPeersList(value: Array<chat_core_types_pb.InputPeer>): void;
  addPeers(value?: chat_core_types_pb.InputPeer, index?: number): chat_core_types_pb.InputPeer;

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
    peersList: Array<chat_core_types_pb.InputPeer.AsObject>,
  }
}

export class MessagesSendScreenShotNotification extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): chat_core_types_pb.InputPeer;
  setPeer(value?: chat_core_types_pb.InputPeer): void;

  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasReplyto(): boolean;
  clearReplyto(): void;
  getReplyto(): number | undefined;
  setReplyto(value: number): void;

  hasMinid(): boolean;
  clearMinid(): void;
  getMinid(): number | undefined;
  setMinid(value: number): void;

  hasMaxid(): boolean;
  clearMaxid(): void;
  getMaxid(): number | undefined;
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
    peer: chat_core_types_pb.InputPeer.AsObject,
    randomid?: number,
    replyto?: number,
    minid?: number,
    maxid?: number,
  }
}

export class MessagesDialogs extends jspb.Message {
  clearDialogsList(): void;
  getDialogsList(): Array<chat_core_types_pb.Dialog>;
  setDialogsList(value: Array<chat_core_types_pb.Dialog>): void;
  addDialogs(value?: chat_core_types_pb.Dialog, index?: number): chat_core_types_pb.Dialog;

  clearUsersList(): void;
  getUsersList(): Array<chat_core_types_pb.User>;
  setUsersList(value: Array<chat_core_types_pb.User>): void;
  addUsers(value?: chat_core_types_pb.User, index?: number): chat_core_types_pb.User;

  clearMessagesList(): void;
  getMessagesList(): Array<chat_core_types_pb.UserMessage>;
  setMessagesList(value: Array<chat_core_types_pb.UserMessage>): void;
  addMessages(value?: chat_core_types_pb.UserMessage, index?: number): chat_core_types_pb.UserMessage;

  hasCount(): boolean;
  clearCount(): void;
  getCount(): number | undefined;
  setCount(value: number): void;

  hasUpdateid(): boolean;
  clearUpdateid(): void;
  getUpdateid(): number | undefined;
  setUpdateid(value: number): void;

  clearGroupsList(): void;
  getGroupsList(): Array<chat_core_types_pb.Group>;
  setGroupsList(value: Array<chat_core_types_pb.Group>): void;
  addGroups(value?: chat_core_types_pb.Group, index?: number): chat_core_types_pb.Group;

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
    dialogsList: Array<chat_core_types_pb.Dialog.AsObject>,
    usersList: Array<chat_core_types_pb.User.AsObject>,
    messagesList: Array<chat_core_types_pb.UserMessage.AsObject>,
    count?: number,
    updateid?: number,
    groupsList: Array<chat_core_types_pb.Group.AsObject>,
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
  getMessagesList(): Array<chat_core_types_pb.UserMessage>;
  setMessagesList(value: Array<chat_core_types_pb.UserMessage>): void;
  addMessages(value?: chat_core_types_pb.UserMessage, index?: number): chat_core_types_pb.UserMessage;

  clearUsersList(): void;
  getUsersList(): Array<chat_core_types_pb.User>;
  setUsersList(value: Array<chat_core_types_pb.User>): void;
  addUsers(value?: chat_core_types_pb.User, index?: number): chat_core_types_pb.User;

  clearGroupsList(): void;
  getGroupsList(): Array<chat_core_types_pb.Group>;
  setGroupsList(value: Array<chat_core_types_pb.Group>): void;
  addGroups(value?: chat_core_types_pb.Group, index?: number): chat_core_types_pb.Group;

  hasContinuous(): boolean;
  clearContinuous(): void;
  getContinuous(): boolean | undefined;
  setContinuous(value: boolean): void;

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
    messagesList: Array<chat_core_types_pb.UserMessage.AsObject>,
    usersList: Array<chat_core_types_pb.User.AsObject>,
    groupsList: Array<chat_core_types_pb.Group.AsObject>,
    continuous?: boolean,
  }
}

export enum InputMediaType {
  INPUTMEDIATYPEEMPTY = 0,
  INPUTMEDIATYPEUPLOADEDPHOTO = 1,
  INPUTMEDIATYPEPHOTO = 2,
  INPUTMEDIATYPECONTACT = 3,
  INPUTMEDIATYPEUPLOADEDDOCUMENT = 4,
  INPUTMEDIATYPEDOCUMENT = 5,
  INPUTMEDIATYPEGEOLOCATION = 6,
  RESERVED1 = 10,
  RESERVED2 = 11,
  RESERVED3 = 12,
  RESERVED4 = 13,
  RESERVED5 = 14,
}

