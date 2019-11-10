/*
    Creation Time: 2019 - Feb - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

const C_MEDIA_TYPE = {
    AUDIO: 3,
    FILE: 5,
    LOCATION: 6,
    Media: -2,
    Music: -3,
    PHOTO: 1,
    VIDEO: 2,
    VOICE: 4,
};

interface IMedia {
    id: number;
    peerid: string;
    timestamp?: number;
    type: number;
}

// @ts-ignore
export {IMedia, C_MEDIA_TYPE};
