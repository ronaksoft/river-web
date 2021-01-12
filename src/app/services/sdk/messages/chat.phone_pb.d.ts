/* tslint:disable */
// package: msg
// file: chat.phone.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class PhoneInitCall extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneInitCall.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneInitCall): PhoneInitCall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneInitCall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneInitCall;
  static deserializeBinaryFromReader(message: PhoneInitCall, reader: jspb.BinaryReader): PhoneInitCall;
}

export namespace PhoneInitCall {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
  }
}

export class PhoneRequestCall extends jspb.Message {
  getRandomid(): number;
  setRandomid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getInitiator(): boolean;
  setInitiator(value: boolean): void;

  clearParticipantsList(): void;
  getParticipantsList(): Array<PhoneParticipantSDP>;
  setParticipantsList(value: Array<PhoneParticipantSDP>): void;
  addParticipants(value?: PhoneParticipantSDP, index?: number): PhoneParticipantSDP;

  getCallid(): string;
  setCallid(value: string): void;

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
    randomid: number,
    peer?: core_types_pb.InputPeer.AsObject,
    initiator: boolean,
    participantsList: Array<PhoneParticipantSDP.AsObject>,
    callid: string,
  }
}

export class PhoneAcceptCall extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getCallid(): string;
  setCallid(value: string): void;

  clearParticipantsList(): void;
  getParticipantsList(): Array<PhoneParticipantSDP>;
  setParticipantsList(value: Array<PhoneParticipantSDP>): void;
  addParticipants(value?: PhoneParticipantSDP, index?: number): PhoneParticipantSDP;

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
    peer?: core_types_pb.InputPeer.AsObject,
    callid: string,
    participantsList: Array<PhoneParticipantSDP.AsObject>,
  }
}

export class PhoneDiscardCall extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getCallid(): string;
  setCallid(value: string): void;

  getDuration(): number;
  setDuration(value: number): void;

  getReason(): DiscardReason;
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
    peer?: core_types_pb.InputPeer.AsObject,
    callid: string,
    duration: number,
    reason: DiscardReason,
  }
}

export class PhoneUpdateCall extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getCallid(): string;
  setCallid(value: string): void;

  clearParticipantsList(): void;
  getParticipantsList(): Array<core_types_pb.InputUser>;
  setParticipantsList(value: Array<core_types_pb.InputUser>): void;
  addParticipants(value?: core_types_pb.InputUser, index?: number): core_types_pb.InputUser;

  getAction(): PhoneCallAction;
  setAction(value: PhoneCallAction): void;

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
    peer?: core_types_pb.InputPeer.AsObject,
    callid: string,
    participantsList: Array<core_types_pb.InputUser.AsObject>,
    action: PhoneCallAction,
    actiondata: Uint8Array | string,
  }
}

export class PhoneRateCall extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getCallid(): string;
  setCallid(value: string): void;

  getRate(): number;
  setRate(value: number): void;

  getReasontype(): PhoneCallRateReason;
  setReasontype(value: PhoneCallRateReason): void;

  getReasondata(): Uint8Array | string;
  getReasondata_asU8(): Uint8Array;
  getReasondata_asB64(): string;
  setReasondata(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneRateCall.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneRateCall): PhoneRateCall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneRateCall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneRateCall;
  static deserializeBinaryFromReader(message: PhoneRateCall, reader: jspb.BinaryReader): PhoneRateCall;
}

export namespace PhoneRateCall {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    callid: string,
    rate: number,
    reasontype: PhoneCallRateReason,
    reasondata: Uint8Array | string,
  }
}

export class PhoneCall extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getDate(): number;
  setDate(value: number): void;

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
    id: string,
    date: number,
  }
}

export class PhoneInit extends jspb.Message {
  clearIceserversList(): void;
  getIceserversList(): Array<IceServer>;
  setIceserversList(value: Array<IceServer>): void;
  addIceservers(value?: IceServer, index?: number): IceServer;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneInit.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneInit): PhoneInit.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneInit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneInit;
  static deserializeBinaryFromReader(message: PhoneInit, reader: jspb.BinaryReader): PhoneInit;
}

export namespace PhoneInit {
  export type AsObject = {
    iceserversList: Array<IceServer.AsObject>,
  }
}

export class IceServer extends jspb.Message {
  clearUrlsList(): void;
  getUrlsList(): Array<string>;
  setUrlsList(value: Array<string>): void;
  addUrls(value: string, index?: number): string;

  getUsername(): string;
  setUsername(value: string): void;

  getCredential(): string;
  setCredential(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IceServer.AsObject;
  static toObject(includeInstance: boolean, msg: IceServer): IceServer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: IceServer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IceServer;
  static deserializeBinaryFromReader(message: IceServer, reader: jspb.BinaryReader): IceServer;
}

export namespace IceServer {
  export type AsObject = {
    urlsList: Array<string>,
    username: string,
    credential: string,
  }
}

export class PhoneParticipant extends jspb.Message {
  getConnectionid(): number;
  setConnectionid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputUser | undefined;
  setPeer(value?: core_types_pb.InputUser): void;

  getInitiator(): boolean;
  setInitiator(value: boolean): void;

  getAdmin(): boolean;
  setAdmin(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneParticipant.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneParticipant): PhoneParticipant.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneParticipant, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneParticipant;
  static deserializeBinaryFromReader(message: PhoneParticipant, reader: jspb.BinaryReader): PhoneParticipant;
}

export namespace PhoneParticipant {
  export type AsObject = {
    connectionid: number,
    peer?: core_types_pb.InputUser.AsObject,
    initiator: boolean,
    admin: boolean,
  }
}

export class PhoneParticipantSDP extends jspb.Message {
  getConnectionid(): number;
  setConnectionid(value: number): void;

  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputUser | undefined;
  setPeer(value?: core_types_pb.InputUser): void;

  getSdp(): string;
  setSdp(value: string): void;

  getType(): string;
  setType(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneParticipantSDP.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneParticipantSDP): PhoneParticipantSDP.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneParticipantSDP, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneParticipantSDP;
  static deserializeBinaryFromReader(message: PhoneParticipantSDP, reader: jspb.BinaryReader): PhoneParticipantSDP;
}

export namespace PhoneParticipantSDP {
  export type AsObject = {
    connectionid: number,
    peer?: core_types_pb.InputUser.AsObject,
    sdp: string,
    type: string,
  }
}

export class PhoneActionCallEmpty extends jspb.Message {
  getEmpty(): boolean;
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
    empty: boolean,
  }
}

export class PhoneActionAccepted extends jspb.Message {
  getSdp(): string;
  setSdp(value: string): void;

  getType(): string;
  setType(value: string): void;

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
    sdp: string,
    type: string,
  }
}

export class PhoneActionRequested extends jspb.Message {
  getSdp(): string;
  setSdp(value: string): void;

  getType(): string;
  setType(value: string): void;

  clearParticipantsList(): void;
  getParticipantsList(): Array<PhoneParticipant>;
  setParticipantsList(value: Array<PhoneParticipant>): void;
  addParticipants(value?: PhoneParticipant, index?: number): PhoneParticipant;

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
    sdp: string,
    type: string,
    participantsList: Array<PhoneParticipant.AsObject>,
  }
}

export class PhoneActionCallWaiting extends jspb.Message {
  getEmpty(): boolean;
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
    empty: boolean,
  }
}

export class PhoneActionDiscarded extends jspb.Message {
  getDuration(): number;
  setDuration(value: number): void;

  getVideo(): boolean;
  setVideo(value: boolean): void;

  getReason(): DiscardReason;
  setReason(value: DiscardReason): void;

  getTerminate(): boolean;
  setTerminate(value: boolean): void;

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
    duration: number,
    video: boolean,
    reason: DiscardReason,
    terminate: boolean,
  }
}

export class PhoneActionIceExchange extends jspb.Message {
  getCandidate(): string;
  setCandidate(value: string): void;

  getSdpmlineindex(): number;
  setSdpmlineindex(value: number): void;

  getSdpmid(): string;
  setSdpmid(value: string): void;

  getUsernamefragment(): string;
  setUsernamefragment(value: string): void;

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
    candidate: string,
    sdpmlineindex: number,
    sdpmid: string,
    usernamefragment: string,
  }
}

export class PhoneActionAck extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionAck.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionAck): PhoneActionAck.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionAck, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionAck;
  static deserializeBinaryFromReader(message: PhoneActionAck, reader: jspb.BinaryReader): PhoneActionAck;
}

export namespace PhoneActionAck {
  export type AsObject = {
  }
}

export class PhoneActionKick extends jspb.Message {
  clearUseridsList(): void;
  getUseridsList(): Array<string>;
  setUseridsList(value: Array<string>): void;
  addUserids(value: string, index?: number): string;

  getTimeout(): boolean;
  setTimeout(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionKick.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionKick): PhoneActionKick.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionKick, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionKick;
  static deserializeBinaryFromReader(message: PhoneActionKick, reader: jspb.BinaryReader): PhoneActionKick;
}

export namespace PhoneActionKick {
  export type AsObject = {
    useridsList: Array<string>,
    timeout: boolean,
  }
}

export class PhoneMediaSettingsUpdated extends jspb.Message {
  getVideo(): boolean;
  setVideo(value: boolean): void;

  getAudio(): boolean;
  setAudio(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneMediaSettingsUpdated.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneMediaSettingsUpdated): PhoneMediaSettingsUpdated.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneMediaSettingsUpdated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneMediaSettingsUpdated;
  static deserializeBinaryFromReader(message: PhoneMediaSettingsUpdated, reader: jspb.BinaryReader): PhoneMediaSettingsUpdated;
}

export namespace PhoneMediaSettingsUpdated {
  export type AsObject = {
    video: boolean,
    audio: boolean,
  }
}

export class PhoneReactionSet extends jspb.Message {
  getReaction(): string;
  setReaction(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneReactionSet.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneReactionSet): PhoneReactionSet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneReactionSet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneReactionSet;
  static deserializeBinaryFromReader(message: PhoneReactionSet, reader: jspb.BinaryReader): PhoneReactionSet;
}

export namespace PhoneReactionSet {
  export type AsObject = {
    reaction: string,
  }
}

export class PhoneSDPOffer extends jspb.Message {
  getSdp(): string;
  setSdp(value: string): void;

  getType(): string;
  setType(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneSDPOffer.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneSDPOffer): PhoneSDPOffer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneSDPOffer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneSDPOffer;
  static deserializeBinaryFromReader(message: PhoneSDPOffer, reader: jspb.BinaryReader): PhoneSDPOffer;
}

export namespace PhoneSDPOffer {
  export type AsObject = {
    sdp: string,
    type: string,
  }
}

export class PhoneSDPAnswer extends jspb.Message {
  getSdp(): string;
  setSdp(value: string): void;

  getType(): string;
  setType(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneSDPAnswer.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneSDPAnswer): PhoneSDPAnswer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneSDPAnswer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneSDPAnswer;
  static deserializeBinaryFromReader(message: PhoneSDPAnswer, reader: jspb.BinaryReader): PhoneSDPAnswer;
}

export namespace PhoneSDPAnswer {
  export type AsObject = {
    sdp: string,
    type: string,
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

export enum PhoneCallRateReason {
  PHONECALLRATEREASONEMPTY = 0,
  PHONECALLRATEREASONRESERVED1 = 1,
  PHONECALLRATEREASONRESERVED2 = 2,
  PHONECALLRATEREASONRESERVED3 = 3,
  PHONECALLRATEREASONRESERVED4 = 4,
  PHONECALLRATEREASONRESERVED5 = 5,
  PHONECALLRATEREASONRESERVED6 = 6,
  PHONECALLRATEREASONRESERVED7 = 7,
  PHONECALLRATEREASONRESERVED8 = 8,
  PHONECALLRATEREASONRESERVED9 = 9,
  PHONECALLRATEREASONRESERVED10 = 10,
  PHONECALLRATEREASONRESERVED11 = 11,
  PHONECALLRATEREASONRESERVED12 = 12,
  PHONECALLRATEREASONRESERVED13 = 13,
  PHONECALLRATEREASONRESERVED14 = 14,
  PHONECALLRATEREASONRESERVED15 = 15,
}

export enum PhoneCallAction {
  PHONECALLEMPTY = 0,
  PHONECALLACCEPTED = 1,
  PHONECALLREQUESTED = 2,
  PHONECALLCALLWAITING = 3,
  PHONECALLDISCARDED = 4,
  PHONECALLICEEXCHANGE = 5,
  PHONECALLMEDIASETTINGSCHANGED = 6,
  PHONECALLREACTIONSET = 7,
  PHONECALLSDPOFFER = 8,
  PHONECALLSDPANSWER = 9,
  PHONECALLACK = 10,
  PHONECALLKICK = 11,
  PHONECALLRESERVED8 = 12,
  PHONECALLRESERVED9 = 13,
  PHONECALLRESERVED10 = 14,
  PHONECALLRESERVED11 = 15,
  PHONECALLRESERVED12 = 16,
  PHONECALLRESERVED13 = 17,
  PHONECALLRESERVED14 = 18,
  PHONECALLRESERVED15 = 19,
  PHONECALLRESERVED16 = 20,
  PHONECALLRESERVED17 = 21,
  PHONECALLRESERVED18 = 22,
  PHONECALLRESERVED19 = 23,
}

