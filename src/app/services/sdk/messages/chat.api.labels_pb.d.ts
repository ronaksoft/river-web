/* tslint:disable */
// package: msg
// file: chat.api.labels.proto

import * as jspb from "google-protobuf";

export class LabelsSet extends jspb.Message {
  hasLabelid(): boolean;
  clearLabelid(): void;
  getLabelid(): number | undefined;
  setLabelid(value: number): void;

  hasName(): boolean;
  clearName(): void;
  getName(): string | undefined;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LabelsSet.AsObject;
  static toObject(includeInstance: boolean, msg: LabelsSet): LabelsSet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LabelsSet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LabelsSet;
  static deserializeBinaryFromReader(message: LabelsSet, reader: jspb.BinaryReader): LabelsSet;
}

export namespace LabelsSet {
  export type AsObject = {
    labelid?: number,
    name?: string,
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

export class LabelsAddToDialog extends jspb.Message {
  hasPeertype(): boolean;
  clearPeertype(): void;
  getPeertype(): number | undefined;
  setPeertype(value: number): void;

  hasPeerid(): boolean;
  clearPeerid(): void;
  getPeerid(): number | undefined;
  setPeerid(value: number): void;

  clearLabelidsList(): void;
  getLabelidsList(): Array<number>;
  setLabelidsList(value: Array<number>): void;
  addLabelids(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LabelsAddToDialog.AsObject;
  static toObject(includeInstance: boolean, msg: LabelsAddToDialog): LabelsAddToDialog.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LabelsAddToDialog, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LabelsAddToDialog;
  static deserializeBinaryFromReader(message: LabelsAddToDialog, reader: jspb.BinaryReader): LabelsAddToDialog;
}

export namespace LabelsAddToDialog {
  export type AsObject = {
    peertype?: number,
    peerid?: number,
    labelidsList: Array<number>,
  }
}

export class LabelsRemoveFromDialog extends jspb.Message {
  hasPeertype(): boolean;
  clearPeertype(): void;
  getPeertype(): number | undefined;
  setPeertype(value: number): void;

  hasPeerid(): boolean;
  clearPeerid(): void;
  getPeerid(): number | undefined;
  setPeerid(value: number): void;

  clearLabelidsList(): void;
  getLabelidsList(): Array<number>;
  setLabelidsList(value: Array<number>): void;
  addLabelids(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LabelsRemoveFromDialog.AsObject;
  static toObject(includeInstance: boolean, msg: LabelsRemoveFromDialog): LabelsRemoveFromDialog.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LabelsRemoveFromDialog, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LabelsRemoveFromDialog;
  static deserializeBinaryFromReader(message: LabelsRemoveFromDialog, reader: jspb.BinaryReader): LabelsRemoveFromDialog;
}

export namespace LabelsRemoveFromDialog {
  export type AsObject = {
    peertype?: number,
    peerid?: number,
    labelidsList: Array<number>,
  }
}

export class LabelsAddToMessage extends jspb.Message {
  hasPeertype(): boolean;
  clearPeertype(): void;
  getPeertype(): number | undefined;
  setPeertype(value: number): void;

  hasPeerid(): boolean;
  clearPeerid(): void;
  getPeerid(): number | undefined;
  setPeerid(value: number): void;

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
    peertype?: number,
    peerid?: number,
    labelidsList: Array<number>,
    messageidsList: Array<number>,
  }
}

export class LabelsRemoveFromMessage extends jspb.Message {
  hasPeertype(): boolean;
  clearPeertype(): void;
  getPeertype(): number | undefined;
  setPeertype(value: number): void;

  hasPeerid(): boolean;
  clearPeerid(): void;
  getPeerid(): number | undefined;
  setPeerid(value: number): void;

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
    peertype?: number,
    peerid?: number,
    labelidsList: Array<number>,
    messageidsList: Array<number>,
  }
}

export class Label extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): number | undefined;
  setId(value: number): void;

  hasName(): boolean;
  clearName(): void;
  getName(): string | undefined;
  setName(value: string): void;

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
    id?: number,
    name?: string,
  }
}

export class LabelsMany extends jspb.Message {
  clearLabelsList(): void;
  getLabelsList(): Array<Label>;
  setLabelsList(value: Array<Label>): void;
  addLabels(value?: Label, index?: number): Label;

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
  }
}

