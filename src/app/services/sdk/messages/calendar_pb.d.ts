/* tslint:disable */
// package: msg
// file: calendar.proto

import * as jspb from "google-protobuf";

export class CalendarGetEvents extends jspb.Message {
  hasFrom(): boolean;
  clearFrom(): void;
  getFrom(): number | undefined;
  setFrom(value: number): void;

  hasTo(): boolean;
  clearTo(): void;
  getTo(): number | undefined;
  setTo(value: number): void;

  hasFilter(): boolean;
  clearFilter(): void;
  getFilter(): number | undefined;
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
    from?: number,
    to?: number,
    filter?: number,
  }
}

export class CalendarSetEvent extends jspb.Message {
  hasName(): boolean;
  clearName(): void;
  getName(): string | undefined;
  setName(value: string): void;

  hasDate(): boolean;
  clearDate(): void;
  getDate(): number | undefined;
  setDate(value: number): void;

  hasStartrange(): boolean;
  clearStartrange(): void;
  getStartrange(): number | undefined;
  setStartrange(value: number): void;

  hasDuration(): boolean;
  clearDuration(): void;
  getDuration(): number | undefined;
  setDuration(value: number): void;

  hasRecurring(): boolean;
  clearRecurring(): void;
  getRecurring(): boolean | undefined;
  setRecurring(value: boolean): void;

  hasPeriod(): boolean;
  clearPeriod(): void;
  getPeriod(): RecurringPeriod | undefined;
  setPeriod(value: RecurringPeriod): void;

  hasAllday(): boolean;
  clearAllday(): void;
  getAllday(): boolean | undefined;
  setAllday(value: boolean): void;

  hasTeam(): boolean;
  clearTeam(): void;
  getTeam(): boolean | undefined;
  setTeam(value: boolean): void;

  hasGlobal(): boolean;
  clearGlobal(): void;
  getGlobal(): boolean | undefined;
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
    name?: string,
    date?: number,
    startrange?: number,
    duration?: number,
    recurring?: boolean,
    period?: RecurringPeriod,
    allday?: boolean,
    team?: boolean,
    global?: boolean,
  }
}

export class CalendarEditEvent extends jspb.Message {
  hasEventid(): boolean;
  clearEventid(): void;
  getEventid(): number | undefined;
  setEventid(value: number): void;

  hasName(): boolean;
  clearName(): void;
  getName(): string | undefined;
  setName(value: string): void;

  hasDate(): boolean;
  clearDate(): void;
  getDate(): number | undefined;
  setDate(value: number): void;

  hasStartrange(): boolean;
  clearStartrange(): void;
  getStartrange(): number | undefined;
  setStartrange(value: number): void;

  hasDuration(): boolean;
  clearDuration(): void;
  getDuration(): number | undefined;
  setDuration(value: number): void;

  hasRecurring(): boolean;
  clearRecurring(): void;
  getRecurring(): boolean | undefined;
  setRecurring(value: boolean): void;

  hasPeriod(): boolean;
  clearPeriod(): void;
  getPeriod(): RecurringPeriod | undefined;
  setPeriod(value: RecurringPeriod): void;

  hasAllday(): boolean;
  clearAllday(): void;
  getAllday(): boolean | undefined;
  setAllday(value: boolean): void;

  hasPolicy(): boolean;
  clearPolicy(): void;
  getPolicy(): CalendarEditPolicy | undefined;
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
    eventid?: number,
    name?: string,
    date?: number,
    startrange?: number,
    duration?: number,
    recurring?: boolean,
    period?: RecurringPeriod,
    allday?: boolean,
    policy?: CalendarEditPolicy,
  }
}

export class CalendarRemoveEvent extends jspb.Message {
  hasEventid(): boolean;
  clearEventid(): void;
  getEventid(): number | undefined;
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
    eventid?: number,
  }
}

export class CalendarEvent extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): number | undefined;
  setId(value: number): void;

  hasName(): boolean;
  clearName(): void;
  getName(): string | undefined;
  setName(value: string): void;

  hasRecurring(): boolean;
  clearRecurring(): void;
  getRecurring(): boolean | undefined;
  setRecurring(value: boolean): void;

  hasPeriod(): boolean;
  clearPeriod(): void;
  getPeriod(): RecurringPeriod | undefined;
  setPeriod(value: RecurringPeriod): void;

  hasAllday(): boolean;
  clearAllday(): void;
  getAllday(): boolean | undefined;
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
    id?: number,
    name?: string,
    recurring?: boolean,
    period?: RecurringPeriod,
    allday?: boolean,
  }
}

export class CalendarEventInstance extends jspb.Message {
  hasId(): boolean;
  clearId(): void;
  getId(): number | undefined;
  setId(value: number): void;

  hasEventid(): boolean;
  clearEventid(): void;
  getEventid(): number | undefined;
  setEventid(value: number): void;

  hasStart(): boolean;
  clearStart(): void;
  getStart(): number | undefined;
  setStart(value: number): void;

  hasEnd(): boolean;
  clearEnd(): void;
  getEnd(): number | undefined;
  setEnd(value: number): void;

  hasColour(): boolean;
  clearColour(): void;
  getColour(): string | undefined;
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
    id?: number,
    eventid?: number,
    start?: number,
    end?: number,
    colour?: string,
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

