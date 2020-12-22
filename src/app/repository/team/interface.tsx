/*
    Creation Time: 2020 - June - 27
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {Team} from "../../services/sdk/messages/core.types_pb";

export interface ITeam extends Partial<Team.AsObject> {
    unread_counter?: number;
    notify?: boolean;
    count_unread?: boolean;
}
