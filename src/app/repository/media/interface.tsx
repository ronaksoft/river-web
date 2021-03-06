/*
    Creation Time: 2019 - Feb - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {MediaCategory} from "../../services/sdk/messages/core.types_pb";

export const C_MEDIA_TYPE = {
    AUDIO: 3,
    FILE: 5,
    GIF: 7,
    LOCATION: 6,
    MEDIA: -2,
    MUSIC: -3,
    PHOTO: 1,
    PHOTOVIDEO: -4,
    VIDEO: 2,
    VOICE: 4,
};

export interface IMedia {
    id: number;
    teamid: string;
    peerid: string;
    peertype: number;
    timestamp?: number;
    type: MediaCategory;
    hole?: boolean;
}
