/*
    Creation Time: 2018 - Sep - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {ParticipantType, User} from "../../services/sdk/messages/core.types_pb";

export interface IUser extends User.AsObject {
    accesshash?: string;
    category?: string;
    clientid?: string;
    is_contact?: number;
    status_last_modified?: number;
    is_bot_started?: boolean;
    remove_photo?: boolean;
    last_updated?: number;
}

export interface IParticipant extends IUser {
    userid?: string;
    type?: ParticipantType;
    accesshash?: string;
}

export interface IContact {
    teamid: string;
    id: string;
}