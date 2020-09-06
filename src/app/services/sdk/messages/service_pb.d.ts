/* tslint:disable */
// package: msg
// file: service.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class ServiceSendMessage extends jspb.Message {
  hasOnbehalf(): boolean;
  clearOnbehalf(): void;
  getOnbehalf(): number | undefined;
  setOnbehalf(value: number): void;

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

  hasCleardraft(): boolean;
  clearCleardraft(): void;
  getCleardraft(): boolean | undefined;
  setCleardraft(value: boolean): void;

  clearEntitiesList(): void;
  getEntitiesList(): Array<core_types_pb.MessageEntity>;
  setEntitiesList(value: Array<core_types_pb.MessageEntity>): void;
  addEntities(value?: core_types_pb.MessageEntity, index?: number): core_types_pb.MessageEntity;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServiceSendMessage.AsObject;
  static toObject(includeInstance: boolean, msg: ServiceSendMessage): ServiceSendMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServiceSendMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServiceSendMessage;
  static deserializeBinaryFromReader(message: ServiceSendMessage, reader: jspb.BinaryReader): ServiceSendMessage;
}

export namespace ServiceSendMessage {
  export type AsObject = {
    onbehalf?: number,
    randomid?: number,
    peer: core_types_pb.InputPeer.AsObject,
    body?: string,
    replyto?: number,
    cleardraft?: boolean,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
  }
}

