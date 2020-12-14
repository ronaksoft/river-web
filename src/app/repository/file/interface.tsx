/*
    Creation Time: 2019 - Jan - 12
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {FileType} from "../../services/sdk/messages/files_pb";

export interface IFile {
    id: string;
    data: Blob;
    hash: string;
    md5: string;
    size: number;
}

export interface ITempFile {
    id: string;
    part: number;
    data: Blob;
    type?: FileType;
    modifiedtime?: number;
}

export interface IFileMap {
    id: string;
    saved?: boolean;
    saved_path?: string;
    msg_ids?: number[];
}
