/* tslint:disable */
// package: msg
// file: chat.labels.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class LabelsCreate extends jspb.Message {
  getRandomid(): number;
  setRandomid(value: number): void;

  getName(): string;
  setName(value: string): void;

  getColour(): string;
  setColour(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LabelsCreate.AsObject;
  static toObject(includeInstance: boolean, msg: LabelsCreate): LabelsCreate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LabelsCreate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LabelsCreate;
  static deserializeBinaryFromReader(message: LabelsCreate, reader: jspb.BinaryReader): LabelsCreate;
}

export namespace LabelsCreate {
  export type AsObject = {
    randomid: number,
    name: string,
    colour: string,
  }
}

export class LabelsEdit extends jspb.Message {
  getLabelid(): number;
  setLabelid(value: number): void;

  getName(): string;
  setName(value: string): void;

  getColour(): string;
  setColour(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LabelsEdit.AsObject;
  static toObject(includeInstance: boolean, msg: LabelsEdit): LabelsEdit.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LabelsEdit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LabelsEdit;
  static deserializeBinaryFromReader(message: LabelsEdit, reader: jspb.BinaryReader): LabelsEdit;
}

export namespace LabelsEdit {
  export type AsObject = {
    labelid: number,
    name: string,
    colour: string,
  }
}

export class LabelsDelete extends jspb.Message {
  clearLabelidsList(): void;
  getLabelidsList(): Array<number>;
  setLabelidsList(value: Array<number>): void;
  addLabelids(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LabelsDelete.AsObject;
  static toObject(includeInstance: boolean, msg: LabelsDelete): LabelsDelete.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LabelsDelete, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LabelsDelete;
  static deserializeBinaryFromReader(message: LabelsDelete, reader: jspb.BinaryReader): LabelsDelete;
}

export namespace LabelsDelete {
  export type AsObject = {
    labelidsList: Array<number>,
  }
}

export class LabelsGet extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LabelsGet.AsObject;
  static toObject(includeInstance: boolean, msg: LabelsGet): LabelsGet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LabelsGet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LabelsGet;
  static deserializeBinaryFromReader(message: LabelsGet, reader: jspb.BinaryReader): LabelsGet;
}

export namespace LabelsGet {
  export type AsObject = {
  }
}

export class LabelsAddToMessage extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  clearLabelidsList(): void;
  getLabelidsList(): Array<number>;
  setLabelidsList(value: Array<number>): void;
  addLabelids(value: number, index?: number): number;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LabelsAddToMessage.AsObject;
  static toObject(includeInstance: boolean, msg: LabelsAddToMessage): LabelsAddToMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LabelsAddToMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LabelsAddToMessage;
  static deserializeBinaryFromReader(message: LabelsAddToMessage, reader: jspb.BinaryReader): LabelsAddToMessage;
}

export namespace LabelsAddToMessage {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    labelidsList: Array<number>,
    messageidsList: Array<number>,
  }
}

export class LabelsRemoveFromMessage extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  clearLabelidsList(): void;
  getLabelidsList(): Array<number>;
  setLabelidsList(value: Array<number>): void;
  addLabelids(value: number, index?: number): number;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LabelsRemoveFromMessage.AsObject;
  static toObject(includeInstance: boolean, msg: LabelsRemoveFromMessage): LabelsRemoveFromMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LabelsRemoveFromMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LabelsRemoveFromMessage;
  static deserializeBinaryFromReader(message: LabelsRemoveFromMessage, reader: jspb.BinaryReader): LabelsRemoveFromMessage;
}

export namespace LabelsRemoveFromMessage {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    labelidsList: Array<number>,
    messageidsList: Array<number>,
  }
}

export class LabelsListItems extends jspb.Message {
  getLabelid(): number;
  setLabelid(value: number): void;

  getMinid(): number;
  setMinid(value: number): void;

  getMaxid(): number;
  setMaxid(value: number): void;

  getLimit(): number;
  setLimit(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LabelsListItems.AsObject;
  static toObject(includeInstance: boolean, msg: LabelsListItems): LabelsListItems.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LabelsListItems, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LabelsListItems;
  static deserializeBinaryFromReader(message: LabelsListItems, reader: jspb.BinaryReader): LabelsListItems;
}

export namespace LabelsListItems {
  export type AsObject = {
    labelid: number,
    minid: number,
    maxid: number,
    limit: number,
  }
}

export class LabelItems extends jspb.Message {
  getLabelid(): number;
  setLabelid(value: number): void;

  clearMessagesList(): void;
  getMessagesList(): Array<core_types_pb.UserMessage>;
  setMessagesList(value: Array<core_types_pb.UserMessage>): void;
  addMessages(value?: core_types_pb.UserMessage, index?: number): core_types_pb.UserMessage;

  clearDialogsList(): void;
  getDialogsList(): Array<core_types_pb.Dialog>;
  setDialogsList(value: Array<core_types_pb.Dialog>): void;
  addDialogs(value?: core_types_pb.Dialog, index?: number): core_types_pb.Dialog;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  clearGroupsList(): void;
  getGroupsList(): Array<core_types_pb.Group>;
  setGroupsList(value: Array<core_types_pb.Group>): void;
  addGroups(value?: core_types_pb.Group, index?: number): core_types_pb.Group;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LabelItems.AsObject;
  static toObject(includeInstance: boolean, msg: LabelItems): LabelItems.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LabelItems, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LabelItems;
  static deserializeBinaryFromReader(message: LabelItems, reader: jspb.BinaryReader): LabelItems;
}

export namespace LabelItems {
  export type AsObject = {
    labelid: number,
    messagesList: Array<core_types_pb.UserMessage.AsObject>,
    dialogsList: Array<core_types_pb.Dialog.AsObject>,
    usersList: Array<core_types_pb.User.AsObject>,
    groupsList: Array<core_types_pb.Group.AsObject>,
  }
}

