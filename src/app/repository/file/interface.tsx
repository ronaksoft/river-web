/*
    Creation Time: 2019 - Jan - 12
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

interface IFile {
    id: string;
    data: Blob;
    hash: string;
    size: number;
}

interface ITempFile {
    id: string;
    part: number;
    data: Blob;
}

export {IFile, ITempFile};
