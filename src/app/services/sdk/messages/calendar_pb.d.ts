/* tslint:disable */
// package: msg
// file: calendar.proto

import * as jspb from "google-protobuf";

export class CalendarGetEvents extends jspb.Message {
  getFrom(): number;
  setFrom(value: number): void;

  getTo(): number;
  setTo(value: number): void;

  getFilter(): number;
  setFilter(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CalendarGetEvents.AsObject;
  static toObject(includeInstance: boolean, msg: CalendarGetEvents): CalendarGetEvents.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CalendarGetEvents, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CalendarGetEvents;
  static deserializeBinaryFromReader(message: CalendarGetEvents, reader: jspb.BinaryReader): CalendarGetEvents;
}

export namespace CalendarGetEvents {
  export type AsObject = {
    from: number,
    to: number,
    filter: number,
  }
}

export class CalendarSetEvent extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getDate(): number;
  setDate(value: number): void;

  getStartrange(): number;
  setStartrange(value: number): void;

  getDuration(): number;
  setDuration(value: number): void;

  getRecurring(): boolean;
  setRecurring(value: boolean): void;

  getPeriod(): RecurringPeriod;
  setPeriod(value: RecurringPeriod): void;

  getAllday(): boolean;
  setAllday(value: boolean): void;

  getTeam(): boolean;
  setTeam(value: boolean): void;

  getGlobal(): boolean;
  setGlobal(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CalendarSetEvent.AsObject;
  static toObject(includeInstance: boolean, msg: CalendarSetEvent): CalendarSetEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CalendarSetEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CalendarSetEvent;
  static deserializeBinaryFromReader(message: CalendarSetEvent, reader: jspb.BinaryReader): CalendarSetEvent;
}

export namespace CalendarSetEvent {
  export type AsObject = {
    name: string,
    date: number,
    startrange: number,
    duration: number,
    recurring: boolean,
    period: RecurringPeriod,
    allday: boolean,
    team: boolean,
    global: boolean,
  }
}

export class CalendarEditEvent extends jspb.Message {
  getEventid(): number;
  setEventid(value: number): void;

  getName(): string;
  setName(value: string): void;

  getDate(): number;
  setDate(value: number): void;

  getStartrange(): number;
  setStartrange(value: number): void;

  getDuration(): number;
  setDuration(value: number): void;

  getRecurring(): boolean;
  setRecurring(value: boolean): void;

  getPeriod(): RecurringPeriod;
  setPeriod(value: RecurringPeriod): void;

  getAllday(): boolean;
  setAllday(value: boolean): void;

  getPolicy(): CalendarEditPolicy;
  setPolicy(value: CalendarEditPolicy): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CalendarEditEvent.AsObject;
  static toObject(includeInstance: boolean, msg: CalendarEditEvent): CalendarEditEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CalendarEditEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CalendarEditEvent;
  static deserializeBinaryFromReader(message: CalendarEditEvent, reader: jspb.BinaryReader): CalendarEditEvent;
}

export namespace CalendarEditEvent {
  export type AsObject = {
    eventid: number,
    name: string,
    date: number,
    startrange: number,
    duration: number,
    recurring: boolean,
    period: RecurringPeriod,
    allday: boolean,
    policy: CalendarEditPolicy,
  }
}

export class CalendarRemoveEvent extends jspb.Message {
  getEventid(): number;
  setEventid(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CalendarRemoveEvent.AsObject;
  static toObject(includeInstance: boolean, msg: CalendarRemoveEvent): CalendarRemoveEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CalendarRemoveEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CalendarRemoveEvent;
  static deserializeBinaryFromReader(message: CalendarRemoveEvent, reader: jspb.BinaryReader): CalendarRemoveEvent;
}

export namespace CalendarRemoveEvent {
  export type AsObject = {
    eventid: number,
  }
}

export class CalendarEvent extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getName(): string;
  setName(value: string): void;

  getRecurring(): boolean;
  setRecurring(value: boolean): void;

  getPeriod(): RecurringPeriod;
  setPeriod(value: RecurringPeriod): void;

  getAllday(): boolean;
  setAllday(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CalendarEvent.AsObject;
  static toObject(includeInstance: boolean, msg: CalendarEvent): CalendarEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CalendarEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CalendarEvent;
  static deserializeBinaryFromReader(message: CalendarEvent, reader: jspb.BinaryReader): CalendarEvent;
}

export namespace CalendarEvent {
  export type AsObject = {
    id: number,
    name: string,
    recurring: boolean,
    period: RecurringPeriod,
    allday: boolean,
  }
}

export class CalendarEventInstance extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getEventid(): number;
  setEventid(value: number): void;

  getStart(): number;
  setStart(value: number): void;

  getEnd(): number;
  setEnd(value: number): void;

  getColour(): string;
  setColour(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CalendarEventInstance.AsObject;
  static toObject(includeInstance: boolean, msg: CalendarEventInstance): CalendarEventInstance.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CalendarEventInstance, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CalendarEventInstance;
  static deserializeBinaryFromReader(message: CalendarEventInstance, reader: jspb.BinaryReader): CalendarEventInstance;
}

export namespace CalendarEventInstance {
  export type AsObject = {
    id: number,
    eventid: number,
    start: number,
    end: number,
    colour: string,
  }
}

export enum RecurringPeriod {
  RECURRINGNONE = 0,
  RECURRINGDAILY = 1,
  RECURRINGWEEKLY = 2,
  RECURRINGMONTHLY = 3,
  RECURRINGYEARLY = 4,
}

export enum CalendarEditPolicy {
  CALENDAREDITONE = 0,
  CALENDAREDITFOLLOWING = 1,
  CALENDAREDITALL = 2,
}

