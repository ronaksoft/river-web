/*
    Creation Time: 2018 - Nov - 26
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {IMessage} from "../message/interface";
import {Label} from "../../services/sdk/messages/core.types_pb";

export interface ILabel extends Label.AsObject {
    increase_counter?: number;
    min?: number;
    max?: number;
}

export interface ILabelItem {
    id?: number;
    lid?: number;
    mid?: number;
    peertype?: number;
    peerid?: string;
    teamid: string;
}

export interface ILabelItemList {
    labelCount: number;
    messageList: IMessage[];
}
