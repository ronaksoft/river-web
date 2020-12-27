/*
    Creation Time: 2020 - Dec - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {InputTeam} from "../../services/sdk/messages/core.types_pb";

export interface ICommand {
    cmd: number;
    data: Uint8Array;
    id?: number;
    inputTeam?: InputTeam.AsObject;
    instant: boolean;
    reqId: number;
    timestamp: number;
    try: number;
}
