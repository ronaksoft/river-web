/* tslint:disable */
// package: msg
// file: chat.messages.markups.proto

import * as jspb from "google-protobuf";

export class ReplyKeyboardMarkup extends jspb.Message {
  getSingleuse(): boolean;
  setSingleuse(value: boolean): void;

  getSelective(): boolean;
  setSelective(value: boolean): void;

  getResize(): boolean;
  setResize(value: boolean): void;

  clearRowsList(): void;
  getRowsList(): Array<KeyboardButtonRow>;
  setRowsList(value: Array<KeyboardButtonRow>): void;
  addRows(value?: KeyboardButtonRow, index?: number): KeyboardButtonRow;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplyKeyboardMarkup.AsObject;
  static toObject(includeInstance: boolean, msg: ReplyKeyboardMarkup): ReplyKeyboardMarkup.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReplyKeyboardMarkup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplyKeyboardMarkup;
  static deserializeBinaryFromReader(message: ReplyKeyboardMarkup, reader: jspb.BinaryReader): ReplyKeyboardMarkup;
}

export namespace ReplyKeyboardMarkup {
  export type AsObject = {
    singleuse: boolean,
    selective: boolean,
    resize: boolean,
    rowsList: Array<KeyboardButtonRow.AsObject>,
  }
}

export class ReplyInlineMarkup extends jspb.Message {
  clearRowsList(): void;
  getRowsList(): Array<KeyboardButtonRow>;
  setRowsList(value: Array<KeyboardButtonRow>): void;
  addRows(value?: KeyboardButtonRow, index?: number): KeyboardButtonRow;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplyInlineMarkup.AsObject;
  static toObject(includeInstance: boolean, msg: ReplyInlineMarkup): ReplyInlineMarkup.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReplyInlineMarkup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplyInlineMarkup;
  static deserializeBinaryFromReader(message: ReplyInlineMarkup, reader: jspb.BinaryReader): ReplyInlineMarkup;
}

export namespace ReplyInlineMarkup {
  export type AsObject = {
    rowsList: Array<KeyboardButtonRow.AsObject>,
  }
}

export class ReplyKeyboardHide extends jspb.Message {
  getSelective(): boolean;
  setSelective(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplyKeyboardHide.AsObject;
  static toObject(includeInstance: boolean, msg: ReplyKeyboardHide): ReplyKeyboardHide.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReplyKeyboardHide, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplyKeyboardHide;
  static deserializeBinaryFromReader(message: ReplyKeyboardHide, reader: jspb.BinaryReader): ReplyKeyboardHide;
}

export namespace ReplyKeyboardHide {
  export type AsObject = {
    selective: boolean,
  }
}

export class ReplyKeyboardForceReply extends jspb.Message {
  getSingleuse(): boolean;
  setSingleuse(value: boolean): void;

  getSelective(): boolean;
  setSelective(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReplyKeyboardForceReply.AsObject;
  static toObject(includeInstance: boolean, msg: ReplyKeyboardForceReply): ReplyKeyboardForceReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReplyKeyboardForceReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReplyKeyboardForceReply;
  static deserializeBinaryFromReader(message: ReplyKeyboardForceReply, reader: jspb.BinaryReader): ReplyKeyboardForceReply;
}

export namespace ReplyKeyboardForceReply {
  export type AsObject = {
    singleuse: boolean,
    selective: boolean,
  }
}

export class KeyboardButtonRow extends jspb.Message {
  clearButtonsList(): void;
  getButtonsList(): Array<KeyboardButtonEnvelope>;
  setButtonsList(value: Array<KeyboardButtonEnvelope>): void;
  addButtons(value?: KeyboardButtonEnvelope, index?: number): KeyboardButtonEnvelope;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyboardButtonRow.AsObject;
  static toObject(includeInstance: boolean, msg: KeyboardButtonRow): KeyboardButtonRow.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: KeyboardButtonRow, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyboardButtonRow;
  static deserializeBinaryFromReader(message: KeyboardButtonRow, reader: jspb.BinaryReader): KeyboardButtonRow;
}

export namespace KeyboardButtonRow {
  export type AsObject = {
    buttonsList: Array<KeyboardButtonEnvelope.AsObject>,
  }
}

export class KeyboardButtonEnvelope extends jspb.Message {
  getConstructor(): number;
  setConstructor(value: number): void;

  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyboardButtonEnvelope.AsObject;
  static toObject(includeInstance: boolean, msg: KeyboardButtonEnvelope): KeyboardButtonEnvelope.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: KeyboardButtonEnvelope, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyboardButtonEnvelope;
  static deserializeBinaryFromReader(message: KeyboardButtonEnvelope, reader: jspb.BinaryReader): KeyboardButtonEnvelope;
}

export namespace KeyboardButtonEnvelope {
  export type AsObject = {
    constructor: number,
    data: Uint8Array | string,
  }
}

export class Button extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Button.AsObject;
  static toObject(includeInstance: boolean, msg: Button): Button.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Button, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Button;
  static deserializeBinaryFromReader(message: Button, reader: jspb.BinaryReader): Button;
}

export namespace Button {
  export type AsObject = {
    text: string,
  }
}

export class ButtonUrl extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getUrl(): string;
  setUrl(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ButtonUrl.AsObject;
  static toObject(includeInstance: boolean, msg: ButtonUrl): ButtonUrl.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ButtonUrl, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ButtonUrl;
  static deserializeBinaryFromReader(message: ButtonUrl, reader: jspb.BinaryReader): ButtonUrl;
}

export namespace ButtonUrl {
  export type AsObject = {
    text: string,
    url: string,
  }
}

export class ButtonCallback extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ButtonCallback.AsObject;
  static toObject(includeInstance: boolean, msg: ButtonCallback): ButtonCallback.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ButtonCallback, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ButtonCallback;
  static deserializeBinaryFromReader(message: ButtonCallback, reader: jspb.BinaryReader): ButtonCallback;
}

export namespace ButtonCallback {
  export type AsObject = {
    text: string,
    data: Uint8Array | string,
  }
}

export class ButtonRequestPhone extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ButtonRequestPhone.AsObject;
  static toObject(includeInstance: boolean, msg: ButtonRequestPhone): ButtonRequestPhone.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ButtonRequestPhone, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ButtonRequestPhone;
  static deserializeBinaryFromReader(message: ButtonRequestPhone, reader: jspb.BinaryReader): ButtonRequestPhone;
}

export namespace ButtonRequestPhone {
  export type AsObject = {
    text: string,
  }
}

export class ButtonRequestGeoLocation extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ButtonRequestGeoLocation.AsObject;
  static toObject(includeInstance: boolean, msg: ButtonRequestGeoLocation): ButtonRequestGeoLocation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ButtonRequestGeoLocation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ButtonRequestGeoLocation;
  static deserializeBinaryFromReader(message: ButtonRequestGeoLocation, reader: jspb.BinaryReader): ButtonRequestGeoLocation;
}

export namespace ButtonRequestGeoLocation {
  export type AsObject = {
    text: string,
  }
}

export class ButtonSwitchInline extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getQuery(): string;
  setQuery(value: string): void;

  getSamepeer(): boolean;
  setSamepeer(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ButtonSwitchInline.AsObject;
  static toObject(includeInstance: boolean, msg: ButtonSwitchInline): ButtonSwitchInline.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ButtonSwitchInline, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ButtonSwitchInline;
  static deserializeBinaryFromReader(message: ButtonSwitchInline, reader: jspb.BinaryReader): ButtonSwitchInline;
}

export namespace ButtonSwitchInline {
  export type AsObject = {
    text: string,
    query: string,
    samepeer: boolean,
  }
}

export class ButtonBuy extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ButtonBuy.AsObject;
  static toObject(includeInstance: boolean, msg: ButtonBuy): ButtonBuy.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ButtonBuy, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ButtonBuy;
  static deserializeBinaryFromReader(message: ButtonBuy, reader: jspb.BinaryReader): ButtonBuy;
}

export namespace ButtonBuy {
  export type AsObject = {
    text: string,
  }
}

