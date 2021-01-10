/* tslint:disable */
// package: msg
// file: team.proto

import * as jspb from "google-protobuf";
import * as core_types_pb from "./core.types_pb";

export class TeamGet extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamGet.AsObject;
  static toObject(includeInstance: boolean, msg: TeamGet): TeamGet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamGet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamGet;
  static deserializeBinaryFromReader(message: TeamGet, reader: jspb.BinaryReader): TeamGet;
}

export namespace TeamGet {
  export type AsObject = {
    id: string,
  }
}

export class TeamAddMember extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getUserid(): string;
  setUserid(value: string): void;

  getManager(): boolean;
  setManager(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamAddMember.AsObject;
  static toObject(includeInstance: boolean, msg: TeamAddMember): TeamAddMember.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamAddMember, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamAddMember;
  static deserializeBinaryFromReader(message: TeamAddMember, reader: jspb.BinaryReader): TeamAddMember;
}

export namespace TeamAddMember {
  export type AsObject = {
    teamid: string,
    userid: string,
    manager: boolean,
  }
}

export class TeamRemoveMember extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getUserid(): string;
  setUserid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamRemoveMember.AsObject;
  static toObject(includeInstance: boolean, msg: TeamRemoveMember): TeamRemoveMember.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamRemoveMember, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamRemoveMember;
  static deserializeBinaryFromReader(message: TeamRemoveMember, reader: jspb.BinaryReader): TeamRemoveMember;
}

export namespace TeamRemoveMember {
  export type AsObject = {
    teamid: string,
    userid: string,
  }
}

export class TeamPromote extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getUserid(): string;
  setUserid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamPromote.AsObject;
  static toObject(includeInstance: boolean, msg: TeamPromote): TeamPromote.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamPromote, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamPromote;
  static deserializeBinaryFromReader(message: TeamPromote, reader: jspb.BinaryReader): TeamPromote;
}

export namespace TeamPromote {
  export type AsObject = {
    teamid: string,
    userid: string,
  }
}

export class TeamDemote extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getUserid(): string;
  setUserid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamDemote.AsObject;
  static toObject(includeInstance: boolean, msg: TeamDemote): TeamDemote.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamDemote, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamDemote;
  static deserializeBinaryFromReader(message: TeamDemote, reader: jspb.BinaryReader): TeamDemote;
}

export namespace TeamDemote {
  export type AsObject = {
    teamid: string,
    userid: string,
  }
}

export class TeamLeave extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamLeave.AsObject;
  static toObject(includeInstance: boolean, msg: TeamLeave): TeamLeave.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamLeave, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamLeave;
  static deserializeBinaryFromReader(message: TeamLeave, reader: jspb.BinaryReader): TeamLeave;
}

export namespace TeamLeave {
  export type AsObject = {
    teamid: string,
  }
}

export class TeamJoin extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getToken(): Uint8Array | string;
  getToken_asU8(): Uint8Array;
  getToken_asB64(): string;
  setToken(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamJoin.AsObject;
  static toObject(includeInstance: boolean, msg: TeamJoin): TeamJoin.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamJoin, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamJoin;
  static deserializeBinaryFromReader(message: TeamJoin, reader: jspb.BinaryReader): TeamJoin;
}

export namespace TeamJoin {
  export type AsObject = {
    teamid: string,
    token: Uint8Array | string,
  }
}

export class TeamListMembers extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamListMembers.AsObject;
  static toObject(includeInstance: boolean, msg: TeamListMembers): TeamListMembers.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamListMembers, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamListMembers;
  static deserializeBinaryFromReader(message: TeamListMembers, reader: jspb.BinaryReader): TeamListMembers;
}

export namespace TeamListMembers {
  export type AsObject = {
    teamid: string,
  }
}

export class TeamEdit extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  getName(): string;
  setName(value: string): void;

  getReturnteam(): boolean;
  setReturnteam(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamEdit.AsObject;
  static toObject(includeInstance: boolean, msg: TeamEdit): TeamEdit.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamEdit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamEdit;
  static deserializeBinaryFromReader(message: TeamEdit, reader: jspb.BinaryReader): TeamEdit;
}

export namespace TeamEdit {
  export type AsObject = {
    teamid: string,
    name: string,
    returnteam: boolean,
  }
}

export class TeamUploadPhoto extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  hasFile(): boolean;
  clearFile(): void;
  getFile(): core_types_pb.InputFile | undefined;
  setFile(value?: core_types_pb.InputFile): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamUploadPhoto.AsObject;
  static toObject(includeInstance: boolean, msg: TeamUploadPhoto): TeamUploadPhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamUploadPhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamUploadPhoto;
  static deserializeBinaryFromReader(message: TeamUploadPhoto, reader: jspb.BinaryReader): TeamUploadPhoto;
}

export namespace TeamUploadPhoto {
  export type AsObject = {
    teamid: string,
    file?: core_types_pb.InputFile.AsObject,
  }
}

export class TeamRemovePhoto extends jspb.Message {
  getTeamid(): string;
  setTeamid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamRemovePhoto.AsObject;
  static toObject(includeInstance: boolean, msg: TeamRemovePhoto): TeamRemovePhoto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamRemovePhoto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamRemovePhoto;
  static deserializeBinaryFromReader(message: TeamRemovePhoto, reader: jspb.BinaryReader): TeamRemovePhoto;
}

export namespace TeamRemovePhoto {
  export type AsObject = {
    teamid: string,
  }
}

export class TeamMembers extends jspb.Message {
  clearMembersList(): void;
  getMembersList(): Array<TeamMember>;
  setMembersList(value: Array<TeamMember>): void;
  addMembers(value?: TeamMember, index?: number): TeamMember;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamMembers.AsObject;
  static toObject(includeInstance: boolean, msg: TeamMembers): TeamMembers.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamMembers, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamMembers;
  static deserializeBinaryFromReader(message: TeamMembers, reader: jspb.BinaryReader): TeamMembers;
}

export namespace TeamMembers {
  export type AsObject = {
    membersList: Array<TeamMember.AsObject>,
    usersList: Array<core_types_pb.User.AsObject>,
  }
}

export class TeamMember extends jspb.Message {
  getUserid(): string;
  setUserid(value: string): void;

  getAdmin(): boolean;
  setAdmin(value: boolean): void;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): core_types_pb.User | undefined;
  setUser(value?: core_types_pb.User): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamMember.AsObject;
  static toObject(includeInstance: boolean, msg: TeamMember): TeamMember.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamMember, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamMember;
  static deserializeBinaryFromReader(message: TeamMember, reader: jspb.BinaryReader): TeamMember;
}

export namespace TeamMember {
  export type AsObject = {
    userid: string,
    admin: boolean,
    user?: core_types_pb.User.AsObject,
  }
}

export class TeamsMany extends jspb.Message {
  clearTeamsList(): void;
  getTeamsList(): Array<core_types_pb.Team>;
  setTeamsList(value: Array<core_types_pb.Team>): void;
  addTeams(value?: core_types_pb.Team, index?: number): core_types_pb.Team;

  clearUsersList(): void;
  getUsersList(): Array<core_types_pb.User>;
  setUsersList(value: Array<core_types_pb.User>): void;
  addUsers(value?: core_types_pb.User, index?: number): core_types_pb.User;

  getEmpty(): boolean;
  setEmpty(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TeamsMany.AsObject;
  static toObject(includeInstance: boolean, msg: TeamsMany): TeamsMany.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TeamsMany, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TeamsMany;
  static deserializeBinaryFromReader(message: TeamsMany, reader: jspb.BinaryReader): TeamsMany;
}

export namespace TeamsMany {
  export type AsObject = {
    teamsList: Array<core_types_pb.Team.AsObject>,
    usersList: Array<core_types_pb.User.AsObject>,
    empty: boolean,
  }
}

