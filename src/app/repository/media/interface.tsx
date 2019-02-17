/*
    Creation Time: 2019 - Feb - 17
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

const C_MEDIA_TYPE = {
    AUDIO: 2,
    FILE: 4,
    PHOTO: 1,
    VIDEO: 3,
    VOICE: 5,
};

interface IMedia {
    id: number;
    peerid: string;
    type: number;
}

export {IMedia, C_MEDIA_TYPE};
