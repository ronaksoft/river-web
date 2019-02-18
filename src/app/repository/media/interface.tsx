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
    FILE: 4,
    Media: -2,
    PHOTO: 1,
    VIDEO: 2,
    VOICE: 5,
};

interface IMedia {
    id: number;
    peerid: string;
    type: number;
}

export {IMedia, C_MEDIA_TYPE};
