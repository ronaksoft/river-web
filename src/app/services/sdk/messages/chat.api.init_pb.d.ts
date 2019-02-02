// package: msg
// file: chat.api.init.proto

import * as jspb from "google-protobuf";

export class InitDB extends jspb.Message {
  hasKeyspace(): boolean;
  clearKeyspace(): void;
  getKeyspace(): string | undefined;
  setKeyspace(value: string): void;

  hasHost(): boolean;
  clearHost(): void;
  getHost(): string | undefined;
  setHost(value: string): void;

  hasUsername(): boolean;
  clearUsername(): void;
  getUsername(): string | undefined;
  setUsername(value: string): void;

  hasPassword(): boolean;
  clearPassword(): void;
  getPassword(): string | undefined;
  setPassword(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitDB.AsObject;
  static toObject(includeInstance: boolean, msg: InitDB): InitDB.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InitDB, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitDB;
  static deserializeBinaryFromReader(message: InitDB, reader: jspb.BinaryReader): InitDB;
}

export namespace InitDB {
  export type AsObject = {
    keyspace?: string,
    host?: string,
    username?: string,
    password?: string,
  }
}

export class InitConnect extends jspb.Message {
  hasClientnonce(): boolean;
  clearClientnonce(): void;
  getClientnonce(): number | undefined;
  setClientnonce(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitConnect.AsObject;
  static toObject(includeInstance: boolean, msg: InitConnect): InitConnect.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InitConnect, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitConnect;
  static deserializeBinaryFromReader(message: InitConnect, reader: jspb.BinaryReader): InitConnect;
}

export namespace InitConnect {
  export type AsObject = {
    clientnonce?: number,
  }
}

export class InitResponse extends jspb.Message {
  hasClientnonce(): boolean;
  clearClientnonce(): void;
  getClientnonce(): number | undefined;
  setClientnonce(value: number): void;

  hasServernonce(): boolean;
  clearServernonce(): void;
  getServernonce(): number | undefined;
  setServernonce(value: number): void;

  hasRsapubkeyfingerprint(): boolean;
  clearRsapubkeyfingerprint(): void;
  getRsapubkeyfingerprint(): number | undefined;
  setRsapubkeyfingerprint(value: number): void;

  hasDhgroupfingerprint(): boolean;
  clearDhgroupfingerprint(): void;
  getDhgroupfingerprint(): number | undefined;
  setDhgroupfingerprint(value: number): void;

  hasPq(): boolean;
  clearPq(): void;
  getPq(): number | undefined;
  setPq(value: number): void;

  hasServertimestamp(): boolean;
  clearServertimestamp(): void;
  getServertimestamp(): number | undefined;
  setServertimestamp(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitResponse.AsObject;
  static toObject(includeInstance: boolean, msg: InitResponse): InitResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InitResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitResponse;
  static deserializeBinaryFromReader(message: InitResponse, reader: jspb.BinaryReader): InitResponse;
}

export namespace InitResponse {
  export type AsObject = {
    clientnonce?: number,
    servernonce?: number,
    rsapubkeyfingerprint?: number,
    dhgroupfingerprint?: number,
    pq?: number,
    servertimestamp?: number,
  }
}

export class InitCompleteAuth extends jspb.Message {
  hasClientnonce(): boolean;
  clearClientnonce(): void;
  getClientnonce(): number | undefined;
  setClientnonce(value: number): void;

  hasServernonce(): boolean;
  clearServernonce(): void;
  getServernonce(): number | undefined;
  setServernonce(value: number): void;

  hasClientdhpubkey(): boolean;
  clearClientdhpubkey(): void;
  getClientdhpubkey(): Uint8Array | string;
  getClientdhpubkey_asU8(): Uint8Array;
  getClientdhpubkey_asB64(): string;
  setClientdhpubkey(value: Uint8Array | string): void;

  hasP(): boolean;
  clearP(): void;
  getP(): number | undefined;
  setP(value: number): void;

  hasQ(): boolean;
  clearQ(): void;
  getQ(): number | undefined;
  setQ(value: number): void;

  hasEncryptedpayload(): boolean;
  clearEncryptedpayload(): void;
  getEncryptedpayload(): Uint8Array | string;
  getEncryptedpayload_asU8(): Uint8Array;
  getEncryptedpayload_asB64(): string;
  setEncryptedpayload(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitCompleteAuth.AsObject;
  static toObject(includeInstance: boolean, msg: InitCompleteAuth): InitCompleteAuth.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InitCompleteAuth, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitCompleteAuth;
  static deserializeBinaryFromReader(message: InitCompleteAuth, reader: jspb.BinaryReader): InitCompleteAuth;
}

export namespace InitCompleteAuth {
  export type AsObject = {
    clientnonce?: number,
    servernonce?: number,
    clientdhpubkey: Uint8Array | string,
    p?: number,
    q?: number,
    encryptedpayload: Uint8Array | string,
  }
}

export class InitCompleteAuthInternal extends jspb.Message {
  hasSecretnonce(): boolean;
  clearSecretnonce(): void;
  getSecretnonce(): Uint8Array | string;
  getSecretnonce_asU8(): Uint8Array;
  getSecretnonce_asB64(): string;
  setSecretnonce(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitCompleteAuthInternal.AsObject;
  static toObject(includeInstance: boolean, msg: InitCompleteAuthInternal): InitCompleteAuthInternal.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InitCompleteAuthInternal, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitCompleteAuthInternal;
  static deserializeBinaryFromReader(message: InitCompleteAuthInternal, reader: jspb.BinaryReader): InitCompleteAuthInternal;
}

export namespace InitCompleteAuthInternal {
  export type AsObject = {
    secretnonce: Uint8Array | string,
  }
}

export class InitAuthCompleted extends jspb.Message {
  hasClientnonce(): boolean;
  clearClientnonce(): void;
  getClientnonce(): number | undefined;
  setClientnonce(value: number): void;

  hasServernonce(): boolean;
  clearServernonce(): void;
  getServernonce(): number | undefined;
  setServernonce(value: number): void;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): InitAuthCompleted.Statuses | undefined;
  setStatus(value: InitAuthCompleted.Statuses): void;

  hasSecrethash(): boolean;
  clearSecrethash(): void;
  getSecrethash(): number | undefined;
  setSecrethash(value: number): void;

  hasServerdhpubkey(): boolean;
  clearServerdhpubkey(): void;
  getServerdhpubkey(): Uint8Array | string;
  getServerdhpubkey_asU8(): Uint8Array;
  getServerdhpubkey_asB64(): string;
  setServerdhpubkey(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitAuthCompleted.AsObject;
  static toObject(includeInstance: boolean, msg: InitAuthCompleted): InitAuthCompleted.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InitAuthCompleted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitAuthCompleted;
  static deserializeBinaryFromReader(message: InitAuthCompleted, reader: jspb.BinaryReader): InitAuthCompleted;
}

export namespace InitAuthCompleted {
  export type AsObject = {
    clientnonce?: number,
    servernonce?: number,
    status?: InitAuthCompleted.Statuses,
    secrethash?: number,
    serverdhpubkey: Uint8Array | string,
  }

  export enum Statuses {
    OK = 0,
    FAIL = 1,
    RETRY = 2,
  }
}

export class InitBindUser extends jspb.Message {
  hasAuthkey(): boolean;
  clearAuthkey(): void;
  getAuthkey(): string | undefined;
  setAuthkey(value: string): void;

  hasUsername(): boolean;
  clearUsername(): void;
  getUsername(): string | undefined;
  setUsername(value: string): void;

  hasPhone(): boolean;
  clearPhone(): void;
  getPhone(): string | undefined;
  setPhone(value: string): void;

  hasFirstname(): boolean;
  clearFirstname(): void;
  getFirstname(): string | undefined;
  setFirstname(value: string): void;

  hasLastname(): boolean;
  clearLastname(): void;
  getLastname(): string | undefined;
  setLastname(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitBindUser.AsObject;
  static toObject(includeInstance: boolean, msg: InitBindUser): InitBindUser.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InitBindUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitBindUser;
  static deserializeBinaryFromReader(message: InitBindUser, reader: jspb.BinaryReader): InitBindUser;
}

export namespace InitBindUser {
  export type AsObject = {
    authkey?: string,
    username?: string,
    phone?: string,
    firstname?: string,
    lastname?: string,
  }
}

export class InitUserBound extends jspb.Message {
  hasAuthid(): boolean;
  clearAuthid(): void;
  getAuthid(): number | undefined;
  setAuthid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitUserBound.AsObject;
  static toObject(includeInstance: boolean, msg: InitUserBound): InitUserBound.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InitUserBound, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitUserBound;
  static deserializeBinaryFromReader(message: InitUserBound, reader: jspb.BinaryReader): InitUserBound;
}

export namespace InitUserBound {
  export type AsObject = {
    authid?: number,
  }
}

