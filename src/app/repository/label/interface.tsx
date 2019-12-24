/*
    Creation Time: 2018 - Nov - 26
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {Label} from '../../services/sdk/messages/chat.core.types_pb';

interface ILabel extends Label.AsObject {
    increase_counter?: number;
    min?: number;
    max?: number;
}

interface ILabelItem {
    id?: number;
    lid?: number;
    mid?: number;
    peertype?: number;
    peerid?: string;
}

// @ts-ignore
export {ILabel, ILabelItem};
