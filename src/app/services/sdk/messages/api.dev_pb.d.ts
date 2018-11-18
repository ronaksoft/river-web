// package: msg
// file: api.dev.proto

import * as jspb from "google-protobuf";

export class EchoWithDelay extends jspb.Message {
  hasDelayinseconds(): boolean;
  clearDelayinseconds(): void;
  getDelayinseconds(): number | undefined;
  setDelayinseconds(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EchoWithDelay.AsObject;
  static toObject(includeInstance: boolean, msg: EchoWithDelay): EchoWithDelay.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EchoWithDelay, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EchoWithDelay;
  static deserializeBinaryFromReader(message: EchoWithDelay, reader: jspb.BinaryReader): EchoWithDelay;
}

export namespace EchoWithDelay {
  export type AsObject = {
    delayinseconds?: number,
  }
}

