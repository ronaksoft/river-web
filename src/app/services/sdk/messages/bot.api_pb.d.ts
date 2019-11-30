/* tslint:disable */
// package: msg
// file: bot.api.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";

export class StartBot extends jspb.Message {
  hasBot(): boolean;
  clearBot(): void;
  getBot(): chat_core_types_pb.InputPeer;
  setBot(value?: chat_core_types_pb.InputPeer): void;

  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasStartparam(): boolean;
  clearStartparam(): void;
  getStartparam(): string | undefined;
  setStartparam(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartBot.AsObject;
  static toObject(includeInstance: boolean, msg: StartBot): StartBot.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StartBot, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StartBot;
  static deserializeBinaryFromReader(message: StartBot, reader: jspb.BinaryReader): StartBot;
}

export namespace StartBot {
  export type AsObject = {
    bot: chat_core_types_pb.InputPeer.AsObject,
    randomid?: number,
    startparam?: string,
  }
}

