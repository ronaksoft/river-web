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

export class BotIsStarted extends jspb.Message {
  hasBot(): boolean;
  clearBot(): void;
  getBot(): chat_core_types_pb.InputPeer;
  setBot(value?: chat_core_types_pb.InputPeer): void;

  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotIsStarted.AsObject;
  static toObject(includeInstance: boolean, msg: BotIsStarted): BotIsStarted.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotIsStarted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotIsStarted;
  static deserializeBinaryFromReader(message: BotIsStarted, reader: jspb.BinaryReader): BotIsStarted;
}

export namespace BotIsStarted {
  export type AsObject = {
    bot: chat_core_types_pb.InputPeer.AsObject,
    randomid?: number,
  }
}

export class BotSetInfo extends jspb.Message {
  hasBotid(): boolean;
  clearBotid(): void;
  getBotid(): number | undefined;
  setBotid(value: number): void;

  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  hasOwner(): boolean;
  clearOwner(): void;
  getOwner(): number | undefined;
  setOwner(value: number): void;

  clearBotcommandsList(): void;
  getBotcommandsList(): Array<chat_core_types_pb.BotCommands>;
  setBotcommandsList(value: Array<chat_core_types_pb.BotCommands>): void;
  addBotcommands(value?: chat_core_types_pb.BotCommands, index?: number): chat_core_types_pb.BotCommands;

  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): string | undefined;
  setDescription(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BotSetInfo.AsObject;
  static toObject(includeInstance: boolean, msg: BotSetInfo): BotSetInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BotSetInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BotSetInfo;
  static deserializeBinaryFromReader(message: BotSetInfo, reader: jspb.BinaryReader): BotSetInfo;
}

export namespace BotSetInfo {
  export type AsObject = {
    botid?: number,
    randomid?: number,
    owner?: number,
    botcommandsList: Array<chat_core_types_pb.BotCommands.AsObject>,
    description?: string,
  }
}

