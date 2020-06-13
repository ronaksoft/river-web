/* tslint:disable */
// package: msg
// file: chat.phone.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class PhoneAcceptCall extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputUser;
  setPeer(value?: core_types_pb.InputUser): void;

  hasAnswersdp(): boolean;
  clearAnswersdp(): void;
  getAnswersdp(): Uint8Array | string;
  getAnswersdp_asU8(): Uint8Array;
  getAnswersdp_asB64(): string;
  setAnswersdp(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneAcceptCall.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneAcceptCall): PhoneAcceptCall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneAcceptCall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneAcceptCall;
  static deserializeBinaryFromReader(message: PhoneAcceptCall, reader: jspb.BinaryReader): PhoneAcceptCall;
}

export namespace PhoneAcceptCall {
  export type AsObject = {
    peer: core_types_pb.InputUser.AsObject,
    answersdp: Uint8Array | string,
  }
}

export class PhoneRequestCall extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputUser;
  setPeer(value?: core_types_pb.InputUser): void;

  hasOffersdp(): boolean;
  clearOffersdp(): void;
  getOffersdp(): Uint8Array | string;
  getOffersdp_asU8(): Uint8Array;
  getOffersdp_asB64(): string;
  setOffersdp(value: Uint8Array | string): void;

  hasVideo(): boolean;
  clearVideo(): void;
  getVideo(): boolean | undefined;
  setVideo(value: boolean): void;

  hasRandomid(): boolean;
  clearRandomid(): void;
  getRandomid(): number | undefined;
  setRandomid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneRequestCall.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneRequestCall): PhoneRequestCall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneRequestCall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneRequestCall;
  static deserializeBinaryFromReader(message: PhoneRequestCall, reader: jspb.BinaryReader): PhoneRequestCall;
}

export namespace PhoneRequestCall {
  export type AsObject = {
    peer: core_types_pb.InputUser.AsObject,
    offersdp: Uint8Array | string,
    video?: boolean,
    randomid?: number,
  }
}

export class PhoneDiscardCall extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputUser;
  setPeer(value?: core_types_pb.InputUser): void;

  hasDuration(): boolean;
  clearDuration(): void;
  getDuration(): number | undefined;
  setDuration(value: number): void;

  hasVideo(): boolean;
  clearVideo(): void;
  getVideo(): boolean | undefined;
  setVideo(value: boolean): void;

  hasReason(): boolean;
  clearReason(): void;
  getReason(): DiscardReason | undefined;
  setReason(value: DiscardReason): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneDiscardCall.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneDiscardCall): PhoneDiscardCall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneDiscardCall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneDiscardCall;
  static deserializeBinaryFromReader(message: PhoneDiscardCall, reader: jspb.BinaryReader): PhoneDiscardCall;
}

export namespace PhoneDiscardCall {
  export type AsObject = {
    peer: core_types_pb.InputUser.AsObject,
    duration?: number,
    video?: boolean,
    reason?: DiscardReason,
  }
}

export class PhoneReceivedCall extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputUser;
  setPeer(value?: core_types_pb.InputUser): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneReceivedCall.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneReceivedCall): PhoneReceivedCall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneReceivedCall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneReceivedCall;
  static deserializeBinaryFromReader(message: PhoneReceivedCall, reader: jspb.BinaryReader): PhoneReceivedCall;
}

export namespace PhoneReceivedCall {
  export type AsObject = {
    peer: core_types_pb.InputUser.AsObject,
  }
}

export class PhoneSetCallRating extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputUser;
  setPeer(value?: core_types_pb.InputUser): void;

  hasInitiator(): boolean;
  clearInitiator(): void;
  getInitiator(): boolean | undefined;
  setInitiator(value: boolean): void;

  hasRate(): boolean;
  clearRate(): void;
  getRate(): number | undefined;
  setRate(value: number): void;

  hasComment(): boolean;
  clearComment(): void;
  getComment(): string | undefined;
  setComment(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneSetCallRating.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneSetCallRating): PhoneSetCallRating.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneSetCallRating, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneSetCallRating;
  static deserializeBinaryFromReader(message: PhoneSetCallRating, reader: jspb.BinaryReader): PhoneSetCallRating;
}

export namespace PhoneSetCallRating {
  export type AsObject = {
    peer: core_types_pb.InputUser.AsObject,
    initiator?: boolean,
    rate?: number,
    comment?: string,
  }
}

export class PhoneCall extends jspb.Message {
  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): number | undefined;
  setUserid(value: number): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): number | undefined;
  setAccesshash(value: number): void;

  hasVideo(): boolean;
  clearVideo(): void;
  getVideo(): boolean | undefined;
  setVideo(value: boolean): void;

  hasDate(): boolean;
  clearDate(): void;
  getDate(): number | undefined;
  setDate(value: number): void;

  clearStunserversList(): void;
  getStunserversList(): Array<string>;
  setStunserversList(value: Array<string>): void;
  addStunservers(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneCall.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneCall): PhoneCall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneCall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneCall;
  static deserializeBinaryFromReader(message: PhoneCall, reader: jspb.BinaryReader): PhoneCall;
}

export namespace PhoneCall {
  export type AsObject = {
    userid?: number,
    accesshash?: number,
    video?: boolean,
    date?: number,
    stunserversList: Array<string>,
  }
}

export enum DiscardReason {
  DISCARDREASONUNKNOWN = 0,
  DISCARDREASONMISSED = 1,
  DISCARDREASONBUSY = 2,
  DISCARDREASONHANGUP = 3,
  DISCARDREASONDISCONNECT = 4,
}

export enum PhoneCallAction {
  PHONECALLEMPTY = 0,
  PHONECALLACCEPTED = 1,
  PHONECALLREQUESTED = 2,
  PHONECALLCALLWAITING = 3,
  PHONECALLDISCARDED = 4,
}

