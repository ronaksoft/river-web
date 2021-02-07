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

export class PhoneJoinCall extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getCallid(): string;
  setCallid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneJoinCall.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneJoinCall): PhoneJoinCall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneJoinCall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneJoinCall;
  static deserializeBinaryFromReader(message: PhoneJoinCall, reader: jspb.BinaryReader): PhoneJoinCall;
}

export namespace PhoneJoinCall {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    callid: string,
  }
}

export class PhoneAddParticipant extends jspb.Message {
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

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneAddParticipant.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneAddParticipant): PhoneAddParticipant.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneAddParticipant, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneAddParticipant;
  static deserializeBinaryFromReader(message: PhoneAddParticipant, reader: jspb.BinaryReader): PhoneAddParticipant;
}

export namespace PhoneAddParticipant {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    callid: string,
    participantsList: Array<core_types_pb.InputUser.AsObject>,
  }
}

export class PhoneRemoveParticipant extends jspb.Message {
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

  getTimeout(): boolean;
  setTimeout(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneRemoveParticipant.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneRemoveParticipant): PhoneRemoveParticipant.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneRemoveParticipant, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneRemoveParticipant;
  static deserializeBinaryFromReader(message: PhoneRemoveParticipant, reader: jspb.BinaryReader): PhoneRemoveParticipant;
}

export namespace PhoneRemoveParticipant {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    callid: string,
    participantsList: Array<core_types_pb.InputUser.AsObject>,
    timeout: boolean,
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

export class PhoneGetHistory extends jspb.Message {
  getLimit(): number;
  setLimit(value: number): void;

  getAfter(): number;
  setAfter(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneGetHistory.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneGetHistory): PhoneGetHistory.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneGetHistory, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneGetHistory;
  static deserializeBinaryFromReader(message: PhoneGetHistory, reader: jspb.BinaryReader): PhoneGetHistory;
}

export namespace PhoneGetHistory {
  export type AsObject = {
    limit: number,
    after: number,
  }
}

export class PhoneCallRecord extends jspb.Message {
  getUserid(): string;
  setUserid(value: string): void;

  getTeamid(): string;
  setTeamid(value: string): void;

  getCallid(): string;
  setCallid(value: string): void;

  getCreatedon(): number;
  setCreatedon(value: number): void;

  getEndedon(): number;
  setEndedon(value: number): void;

  getIncoming(): boolean;
  setIncoming(value: boolean): void;

  getPeerid(): string;
  setPeerid(value: string): void;

  getPeertype(): number;
  setPeertype(value: number): void;

  getStatus(): number;
  setStatus(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneCallRecord.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneCallRecord): PhoneCallRecord.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneCallRecord, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneCallRecord;
  static deserializeBinaryFromReader(message: PhoneCallRecord, reader: jspb.BinaryReader): PhoneCallRecord;
}

export namespace PhoneCallRecord {
  export type AsObject = {
    userid: string,
    teamid: string,
    callid: string,
    createdon: number,
    endedon: number,
    incoming: boolean,
    peerid: string,
    peertype: number,
    status: number,
  }
}

export class PhoneCallsMany extends jspb.Message {
  clearPhonecallsList(): void;
  getPhonecallsList(): Array<PhoneCallRecord>;
  setPhonecallsList(value: Array<PhoneCallRecord>): void;
  addPhonecalls(value?: PhoneCallRecord, index?: number): PhoneCallRecord;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  clearGroupsList(): void;
  getGroupsList(): Array<core_types_pb.Group>;
  setGroupsList(value: Array<core_types_pb.Group>): void;
  addGroups(value?: core_types_pb.Group, index?: number): core_types_pb.Group;

  getContinuous(): boolean;
  setContinuous(value: boolean): void;

  getEmpty(): boolean;
  setEmpty(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneCallsMany.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneCallsMany): PhoneCallsMany.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneCallsMany, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneCallsMany;
  static deserializeBinaryFromReader(message: PhoneCallsMany, reader: jspb.BinaryReader): PhoneCallsMany;
}

export namespace PhoneCallsMany {
  export type AsObject = {
    phonecallsList: Array<PhoneCallRecord.AsObject>,
    usersList: Array<core_types_pb.User.AsObject>,
    groupsList: Array<core_types_pb.Group.AsObject>,
    continuous: boolean,
    empty: boolean,
  }
}

export class PhoneUpdateAdmin extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer | undefined;
  setPeer(value?: core_types_pb.InputPeer): void;

  getCallid(): string;
  setCallid(value: string): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.InputUser | undefined;
  setUser(value?: core_types_pb.InputUser): void;

  getAdmin(): boolean;
  setAdmin(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneUpdateAdmin.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneUpdateAdmin): PhoneUpdateAdmin.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneUpdateAdmin, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneUpdateAdmin;
  static deserializeBinaryFromReader(message: PhoneUpdateAdmin, reader: jspb.BinaryReader): PhoneUpdateAdmin;
}

export namespace PhoneUpdateAdmin {
  export type AsObject = {
    peer?: core_types_pb.InputPeer.AsObject,
    callid: string,
    user?: core_types_pb.InputUser.AsObject,
    admin: boolean,
  }
}

export class PhoneCall extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getCreatedon(): number;
  setCreatedon(value: number): void;

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
    createdon: number,
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

export class PhoneParticipants extends jspb.Message {
  clearParticipantsList(): void;
  getParticipantsList(): Array<PhoneParticipant>;
  setParticipantsList(value: Array<PhoneParticipant>): void;
  addParticipants(value?: PhoneParticipant, index?: number): PhoneParticipant;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneParticipants.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneParticipants): PhoneParticipants.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneParticipants, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneParticipants;
  static deserializeBinaryFromReader(message: PhoneParticipants, reader: jspb.BinaryReader): PhoneParticipants;
}

export namespace PhoneParticipants {
  export type AsObject = {
    participantsList: Array<PhoneParticipant.AsObject>,
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

export class PhoneActionParticipantAdded extends jspb.Message {
  clearParticipantsList(): void;
  getParticipantsList(): Array<PhoneParticipant>;
  setParticipantsList(value: Array<PhoneParticipant>): void;
  addParticipants(value?: PhoneParticipant, index?: number): PhoneParticipant;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionParticipantAdded.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionParticipantAdded): PhoneActionParticipantAdded.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionParticipantAdded, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionParticipantAdded;
  static deserializeBinaryFromReader(message: PhoneActionParticipantAdded, reader: jspb.BinaryReader): PhoneActionParticipantAdded;
}

export namespace PhoneActionParticipantAdded {
  export type AsObject = {
    participantsList: Array<PhoneParticipant.AsObject>,
  }
}

export class PhoneActionParticipantRemoved extends jspb.Message {
  clearUseridsList(): void;
  getUseridsList(): Array<string>;
  setUseridsList(value: Array<string>): void;
  addUserids(value: string, index?: number): string;

  getTimeout(): boolean;
  setTimeout(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionParticipantRemoved.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionParticipantRemoved): PhoneActionParticipantRemoved.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionParticipantRemoved, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionParticipantRemoved;
  static deserializeBinaryFromReader(message: PhoneActionParticipantRemoved, reader: jspb.BinaryReader): PhoneActionParticipantRemoved;
}

export namespace PhoneActionParticipantRemoved {
  export type AsObject = {
    useridsList: Array<string>,
    timeout: boolean,
  }
}

export class PhoneActionJoinRequested extends jspb.Message {
  clearUseridsList(): void;
  getUseridsList(): Array<string>;
  setUseridsList(value: Array<string>): void;
  addUserids(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionJoinRequested.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionJoinRequested): PhoneActionJoinRequested.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionJoinRequested, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionJoinRequested;
  static deserializeBinaryFromReader(message: PhoneActionJoinRequested, reader: jspb.BinaryReader): PhoneActionJoinRequested;
}

export namespace PhoneActionJoinRequested {
  export type AsObject = {
    useridsList: Array<string>,
  }
}

export class PhoneActionAdminUpdated extends jspb.Message {
  getUserid(): string;
  setUserid(value: string): void;

  getAdmin(): boolean;
  setAdmin(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionAdminUpdated.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionAdminUpdated): PhoneActionAdminUpdated.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionAdminUpdated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionAdminUpdated;
  static deserializeBinaryFromReader(message: PhoneActionAdminUpdated, reader: jspb.BinaryReader): PhoneActionAdminUpdated;
}

export namespace PhoneActionAdminUpdated {
  export type AsObject = {
    userid: string,
    admin: boolean,
  }
}

export class PhoneActionScreenShare extends jspb.Message {
  getEnable(): boolean;
  setEnable(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionScreenShare.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionScreenShare): PhoneActionScreenShare.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionScreenShare, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionScreenShare;
  static deserializeBinaryFromReader(message: PhoneActionScreenShare, reader: jspb.BinaryReader): PhoneActionScreenShare;
}

export namespace PhoneActionScreenShare {
  export type AsObject = {
    enable: boolean,
  }
}

export class PhoneActionMediaSettingsUpdated extends jspb.Message {
  getVideo(): boolean;
  setVideo(value: boolean): void;

  getAudio(): boolean;
  setAudio(value: boolean): void;

  getScreenshare(): boolean;
  setScreenshare(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionMediaSettingsUpdated.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionMediaSettingsUpdated): PhoneActionMediaSettingsUpdated.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionMediaSettingsUpdated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionMediaSettingsUpdated;
  static deserializeBinaryFromReader(message: PhoneActionMediaSettingsUpdated, reader: jspb.BinaryReader): PhoneActionMediaSettingsUpdated;
}

export namespace PhoneActionMediaSettingsUpdated {
  export type AsObject = {
    video: boolean,
    audio: boolean,
    screenshare: boolean,
  }
}

export class PhoneActionReactionSet extends jspb.Message {
  getReaction(): string;
  setReaction(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionReactionSet.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionReactionSet): PhoneActionReactionSet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionReactionSet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionReactionSet;
  static deserializeBinaryFromReader(message: PhoneActionReactionSet, reader: jspb.BinaryReader): PhoneActionReactionSet;
}

export namespace PhoneActionReactionSet {
  export type AsObject = {
    reaction: string,
  }
}

export class PhoneActionSDPOffer extends jspb.Message {
  getSdp(): string;
  setSdp(value: string): void;

  getType(): string;
  setType(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionSDPOffer.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionSDPOffer): PhoneActionSDPOffer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionSDPOffer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionSDPOffer;
  static deserializeBinaryFromReader(message: PhoneActionSDPOffer, reader: jspb.BinaryReader): PhoneActionSDPOffer;
}

export namespace PhoneActionSDPOffer {
  export type AsObject = {
    sdp: string,
    type: string,
  }
}

export class PhoneActionSDPAnswer extends jspb.Message {
  getSdp(): string;
  setSdp(value: string): void;

  getType(): string;
  setType(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneActionSDPAnswer.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneActionSDPAnswer): PhoneActionSDPAnswer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PhoneActionSDPAnswer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneActionSDPAnswer;
  static deserializeBinaryFromReader(message: PhoneActionSDPAnswer, reader: jspb.BinaryReader): PhoneActionSDPAnswer;
}

export namespace PhoneActionSDPAnswer {
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
  PHONECALLPARTICIPANTADDED = 11,
  PHONECALLPARTICIPANTREMOVED = 12,
  PHONECALLJOINREQUESTED = 13,
  PHONECALLADMINUPDATED = 14,
  PHONECALLSCREENSHARE = 15,
  PHONECALLRESERVED12 = 16,
  PHONECALLRESERVED13 = 17,
  PHONECALLRESERVED14 = 18,
  PHONECALLRESERVED15 = 19,
  PHONECALLRESERVED16 = 20,
  PHONECALLRESERVED17 = 21,
  PHONECALLRESERVED18 = 22,
  PHONECALLRESERVED19 = 23,
}

