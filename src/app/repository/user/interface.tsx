/*
    Creation Time: 2018 - Sep - 29
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {ParticipantType, User} from '../../services/sdk/messages/chat.core.types_pb';

interface IUser extends User.AsObject {
    accesshash?: string;
    category?: string;
    clientid?: string;
    is_contact?: number;
    phone?: string;
    status_last_modified?: number;
}

interface IParticipant extends IUser {
    userid?: string;
    type?: ParticipantType;
    accesshash?: string;
}

// @ts-ignore
export {IUser, IParticipant};
