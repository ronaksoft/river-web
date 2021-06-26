/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
/* tslint:disable */
// package: msg
// file: service.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class ServiceSendMessage extends jspb.Message {
  getOnbehalf(): number;
  setOnbehalf(value: number): void;

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
    onbehalf: number,
    randomid: number,
    peer?: core_types_pb.InputPeer.AsObject,
    body: string,
    replyto: number,
    cleardraft: boolean,
    entitiesList: Array<core_types_pb.MessageEntity.AsObject>,
  }
}

