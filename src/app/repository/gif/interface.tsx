/*
    Creation Time: 2020 - June - 13
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import {MediaDocument} from "../../services/sdk/messages/chat.messages.medias_pb";

export interface IGif extends MediaDocument.AsObject{
    id?: string;
    last_used?: number;
    attributes?: any[];
    messagetype?: number;
    downloaded?: boolean;
    remote?: boolean;
    queryId?: string;
    resultId?: string;
}

export interface IGifWithBot {
    list: IGif[];
    botId: string;
}