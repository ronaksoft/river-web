/*
    Creation Time: 2020 - June - 01
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {InputPeer, PeerType} from "../../services/sdk/messages/chat.core.types_pb";
import {IUser} from "../user/interface";
import {IGroup} from "../group/interface";

export interface ITopPeer {
    id: string;
    rate: number;
    lastupdate: number;
    peer?: InputPeer.AsObject;
}

export interface ITopPeerItem {
    type: PeerType;
    item: IUser | IGroup;
}
