// package: msg
// file: api.accounts.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class AccountSetNotifySettings extends jspb.Message {
  hasPeer(): boolean;
  clearPeer(): void;
  getPeer(): core_types_pb.InputPeer;
  setPeer(value?: core_types_pb.InputPeer): void;

  hasSettings(): boolean;
  clearSettings(): void;
  getSettings(): core_types_pb.NotifySettings;
  setSettings(value?: core_types_pb.NotifySettings): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountSetNotifySettings.AsObject;
  static toObject(includeInstance: boolean, msg: AccountSetNotifySettings): AccountSetNotifySettings.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountSetNotifySettings, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountSetNotifySettings;
  static deserializeBinaryFromReader(message: AccountSetNotifySettings, reader: jspb.BinaryReader): AccountSetNotifySettings;
}

export namespace AccountSetNotifySettings {
  export type AsObject = {
    peer: core_types_pb.InputPeer.AsObject,
    settings: core_types_pb.NotifySettings.AsObject,
  }
}

export class AccountGetNotifySettings extends jspb.Message {
  clearPeersList(): void;
  getPeersList(): Array<core_types_pb.InputPeer>;
  setPeersList(value: Array<core_types_pb.InputPeer>): void;
  addPeers(value?: core_types_pb.InputPeer, index?: number): core_types_pb.InputPeer;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountGetNotifySettings.AsObject;
  static toObject(includeInstance: boolean, msg: AccountGetNotifySettings): AccountGetNotifySettings.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountGetNotifySettings, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountGetNotifySettings;
  static deserializeBinaryFromReader(message: AccountGetNotifySettings, reader: jspb.BinaryReader): AccountGetNotifySettings;
}

export namespace AccountGetNotifySettings {
  export type AsObject = {
    peersList: Array<core_types_pb.InputPeer.AsObject>,
  }
}

