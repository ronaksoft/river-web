/* tslint:disable */
// package: msg
// file: chat.phone.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class PhoneAcceptCall extends jspb.Message {
  hasCallid(): boolean;
  clearCallid(): void;
  getCallid(): string | undefined;
  setCallid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputUser;
  setPeer(value?: core_types_pb.InputUser): void;

  hasAnswersdp(): boolean;
  clearAnswersdp(): void;
  getAnswersdp(): string | undefined;
  setAnswersdp(value: string): void;

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
    callid?: string,
    peer: core_types_pb.InputUser.AsObject,
    answersdp?: string,
  }
}

export class PhoneRequestCall extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputUser;
  setPeer(value?: core_types_pb.InputUser): void;

  hasOffersdp(): boolean;
  clearOffersdp(): void;
  getOffersdp(): string | undefined;
  setOffersdp(value: string): void;

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
    offersdp?: string,
    video?: boolean,
    randomid?: number,
  }
}

export class PhoneDiscardCall extends jspb.Message {
  hasCallid(): boolean;
  clearCallid(): void;
  getCallid(): string | undefined;
  setCallid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputUser;
  setPeer(value?: core_types_pb.InputUser): void;

  hasDuration(): boolean;
  clearDuration(): void;
  getDuration(): number | undefined;
  setDuration(value: number): void;

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
    callid?: string,
    peer: core_types_pb.InputUser.AsObject,
    duration?: number,
    reason?: DiscardReason,
  }
}

export class PhoneUpdateCall extends jspb.Message {
  hasCallid(): boolean;
  clearCallid(): void;
  getCallid(): string | undefined;
  setCallid(value: string): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputUser;
  setPeer(value?: core_types_pb.InputUser): void;

  hasAction(): boolean;
  clearAction(): void;
  getAction(): PhoneCallAction | undefined;
  setAction(value: PhoneCallAction): void;

  hasActiondata(): boolean;
  clearActiondata(): void;
  getActiondata(): Uint8Array | string;
  getActiondata_asU8(): Uint8Array;
  getActiondata_asB64(): string;
  setActiondata(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneUpdateCall.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneUpdateCall): PhoneUpdateCall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneUpdateCall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneUpdateCall;
  static deserializeBinaryFromReader(message: PhoneUpdateCall, reader: jspb.BinaryReader): PhoneUpdateCall;
}

export namespace PhoneUpdateCall {
  export type AsObject = {
    callid?: string,
    peer: core_types_pb.InputUser.AsObject,
    action?: PhoneCallAction,
    actiondata: Uint8Array | string,
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
  hasId(): boolean;
  clearId(): void;
  getId(): string | undefined;
  setId(value: string): void;

  hasUserid(): boolean;
  clearUserid(): void;
  getUserid(): string | undefined;
  setUserid(value: string): void;

  hasAccesshash(): boolean;
  clearAccesshash(): void;
  getAccesshash(): string | undefined;
  setAccesshash(value: string): void;

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
    id?: string,
    userid?: string,
    accesshash?: string,
    video?: boolean,
    date?: number,
    stunserversList: Array<string>,
  }
}

export class PhoneActionCallEmpty extends jspb.Message {
  hasEmpty(): boolean;
  clearEmpty(): void;
  getEmpty(): boolean | undefined;
  setEmpty(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionCallEmpty.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionCallEmpty): PhoneActionCallEmpty.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionCallEmpty, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionCallEmpty;
  static deserializeBinaryFromReader(message: PhoneActionCallEmpty, reader: jspb.BinaryReader): PhoneActionCallEmpty;
}

export namespace PhoneActionCallEmpty {
  export type AsObject = {
    empty?: boolean,
  }
}

export class PhoneActionAccepted extends jspb.Message {
  hasSdp(): boolean;
  clearSdp(): void;
  getSdp(): string | undefined;
  setSdp(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionAccepted.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionAccepted): PhoneActionAccepted.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionAccepted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionAccepted;
  static deserializeBinaryFromReader(message: PhoneActionAccepted, reader: jspb.BinaryReader): PhoneActionAccepted;
}

export namespace PhoneActionAccepted {
  export type AsObject = {
    sdp?: string,
  }
}

export class PhoneActionRequested extends jspb.Message {
  hasSdp(): boolean;
  clearSdp(): void;
  getSdp(): string | undefined;
  setSdp(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionRequested.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionRequested): PhoneActionRequested.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionRequested, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionRequested;
  static deserializeBinaryFromReader(message: PhoneActionRequested, reader: jspb.BinaryReader): PhoneActionRequested;
}

export namespace PhoneActionRequested {
  export type AsObject = {
    sdp?: string,
  }
}

export class PhoneActionCallWaiting extends jspb.Message {
  hasEmpty(): boolean;
  clearEmpty(): void;
  getEmpty(): boolean | undefined;
  setEmpty(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionCallWaiting.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionCallWaiting): PhoneActionCallWaiting.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionCallWaiting, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionCallWaiting;
  static deserializeBinaryFromReader(message: PhoneActionCallWaiting, reader: jspb.BinaryReader): PhoneActionCallWaiting;
}

export namespace PhoneActionCallWaiting {
  export type AsObject = {
    empty?: boolean,
  }
}

export class PhoneActionDiscarded extends jspb.Message {
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
  toObject(includeInstance?: boolean): PhoneActionDiscarded.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionDiscarded): PhoneActionDiscarded.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionDiscarded, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionDiscarded;
  static deserializeBinaryFromReader(message: PhoneActionDiscarded, reader: jspb.BinaryReader): PhoneActionDiscarded;
}

export namespace PhoneActionDiscarded {
  export type AsObject = {
    duration?: number,
    video?: boolean,
    reason?: DiscardReason,
  }
}

export class PhoneActionIceExchange extends jspb.Message {
  hasIce(): boolean;
  clearIce(): void;
  getIce(): string | undefined;
  setIce(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionIceExchange.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionIceExchange): PhoneActionIceExchange.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionIceExchange, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionIceExchange;
  static deserializeBinaryFromReader(message: PhoneActionIceExchange, reader: jspb.BinaryReader): PhoneActionIceExchange;
}

export namespace PhoneActionIceExchange {
  export type AsObject = {
    ice?: string,
  }
}

export enum DiscardReason {
  DISCARDREASONUNKNOWN = 0,
  DISCARDREASONMISSED = 1,
  DISCARDREASONBUSY = 2,
  DISCARDREASONHANGUP = 3,
  DISCARDREASONDISCONNECT = 4,
  DISCARDREASONRESERVED1 = 5,
  DISCARDREASONRESERVED2 = 6,
  DISCARDREASONRESERVED3 = 7,
  DISCARDREASONRESERVED4 = 8,
  DISCARDREASONRESERVED5 = 9,
  DISCARDREASONRESERVED6 = 10,
  DISCARDREASONRESERVED7 = 11,
  DISCARDREASONRESERVED8 = 12,
  DISCARDREASONRESERVED9 = 13,
}

export enum PhoneCallAction {
  PHONECALLEMPTY = 0,
  PHONECALLACCEPTED = 1,
  PHONECALLREQUESTED = 2,
  PHONECALLCALLWAITING = 3,
  PHONECALLDISCARDED = 4,
  PHONECALLICEEXCHANGE = 5,
  PHONECALLRESERVED2 = 6,
  PHONECALLRESERVED3 = 7,
  PHONECALLRESERVED4 = 8,
  PHONECALLRESERVED5 = 9,
  PHONECALLRESERVED6 = 10,
  PHONECALLRESERVED7 = 11,
  PHONECALLRESERVED8 = 12,
  PHONECALLRESERVED9 = 13,
}

