/*
    Creation Time: 2020 - June - 01
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {IUser} from "../user/interface";
import {IGroup} from "../group/interface";
import {InputPeer, PeerTypeMap} from "../../services/sdk/messages/core.types_pb";

export interface ITopPeer {
    teamid: string;
    id: string;
    peertype: number;
    rate: number;
    lastupdate: number;
    peer?: InputPeer.AsObject;
}

export interface ITopPeerItem {
    type: PeerTypeMap;
    item: IUser | IGroup;
}
