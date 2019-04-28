// package: msg
// file: client.updates.proto

import * as jspb from "google-protobuf";
import * as chat_core_types_pb from "./chat.core.types_pb";
import * as client_core_messages_pb from "./client.core.messages_pb";

export class ClientUpdatePendingMessageDelivery extends jspb.Message {
  hasMessages(): boolean;
  clearMessages(): void;
  getMessages(): chat_core_types_pb.UserMessage;
  setMessages(value?: chat_core_types_pb.UserMessage): void;

  hasPendingmessage(): boolean;
  clearPendingmessage(): void;
  getPendingmessage(): client_core_messages_pb.ClientPendingMessage;
  setPendingmessage(value?: client_core_messages_pb.ClientPendingMessage): void;

  hasSuccess(): boolean;
  clearSuccess(): void;
  getSuccess(): boolean | undefined;
  setSuccess(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientUpdatePendingMessageDelivery.AsObject;
  static toObject(includeInstance: boolean, msg: ClientUpdatePendingMessageDelivery): ClientUpdatePendingMessageDelivery.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClientUpdatePendingMessageDelivery, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientUpdatePendingMessageDelivery;
  static deserializeBinaryFromReader(message: ClientUpdatePendingMessageDelivery, reader: jspb.BinaryReader): ClientUpdatePendingMessageDelivery;
}

export namespace ClientUpdatePendingMessageDelivery {
  export type AsObject = {
    messages: chat_core_types_pb.UserMessage.AsObject,
    pendingmessage: client_core_messages_pb.ClientPendingMessage.AsObject,
    success?: boolean,
  }
}

export class ClientUpdateMessagesDeleted extends jspb.Message {
  hasPeerid(): boolean;
  clearPeerid(): void;
  getPeerid(): number | undefined;
  setPeerid(value: number): void;

  hasPeertype(): boolean;
  clearPeertype(): void;
  getPeertype(): number | undefined;
  setPeertype(value: number): void;

  clearMessageidsList(): void;
  getMessageidsList(): Array<number>;
  setMessageidsList(value: Array<number>): void;
  addMessageids(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientUpdateMessagesDeleted.AsObject;
  static toObject(includeInstance: boolean, msg: ClientUpdateMessagesDeleted): ClientUpdateMessagesDeleted.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClientUpdateMessagesDeleted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientUpdateMessagesDeleted;
  static deserializeBinaryFromReader(message: ClientUpdateMessagesDeleted, reader: jspb.BinaryReader): ClientUpdateMessagesDeleted;
}

export namespace ClientUpdateMessagesDeleted {
  export type AsObject = {
    peerid?: number,
    peertype?: number,
    messageidsList: Array<number>,
  }
}

