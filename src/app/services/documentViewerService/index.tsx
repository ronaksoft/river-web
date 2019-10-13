/*
    Creation Time: 2019 - Feb - 02
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {InputFileLocation, InputPeer} from '../sdk/messages/chat.core.types_pb';
import MediaRepo from '../../repository/media';
import {C_MEDIA_TYPE} from '../../repository/media/interface';

interface IDocumentItem {
    caption: string;
    downloaded?: boolean;
    fileLocation: InputFileLocation.AsObject;
    fileSize?: number;
    geo?: google.maps.LatLngLiteral;
    height?: number;
    id?: number;
    md5?: string;
    mimeType?: string;
    rtl?: boolean;
    thumbFileLocation?: InputFileLocation.AsObject;
    width?: number;
}

export interface IDocument {
    anchor?: 'message' | 'shared_media' | 'shared_media_full';
    items: IDocumentItem[];
    peerId?: string;
    rect?: ClientRect;
    peer?: InputPeer;
    photoId?: string;
    type: 'avatar' | 'picture' | 'video' | 'location';
}

export default class DocumentViewerService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new DocumentViewerService();
        }
        return this.instance;
    }

    private static instance: DocumentViewerService;
    private onDocumentReady: any = null;
    private onDocumentPrev: any = null;
    private onDocumentNext: any = null;
    private mediaRepo: MediaRepo;

    public constructor() {
        this.mediaRepo = MediaRepo.getInstance();
    }

    public setDocumentReady(fn: any) {
        this.onDocumentReady = fn;
    }

    public setDocumentPrev(fn: any) {
        this.onDocumentPrev = fn;
    }

    public setDocumentNext(fn: any) {
        this.onDocumentNext = fn;
    }

    public loadDocument(doc: IDocument) {
        if (!this.onDocumentReady) {
            return;
        }
        this.onDocumentReady(doc);
        this.initPagination(doc);
    }

    private initPagination(doc: IDocument) {
        if ((doc.type !== 'video' && doc.type !== 'picture') || !doc.peerId) {
            return;
        }
        this.mediaRepo.getMany({
            before: (doc.items[0].id || 0) - 1,
            limit: 1,
            type: C_MEDIA_TYPE.Media
        }, doc.peerId).then((res) => {
            if (this.onDocumentPrev && res.messages.length > 0) {
                this.onDocumentPrev(res.messages[0]);
            } else {
                this.onDocumentPrev(null);
            }
        });
        this.mediaRepo.getMany({
            after: (doc.items[0].id || 0) + 1,
            limit: 1,
            type: C_MEDIA_TYPE.Media
        }, doc.peerId).then((res) => {
            if (this.onDocumentNext && res.messages.length > 0) {
                this.onDocumentNext(res.messages[0]);
            } else {
                this.onDocumentNext(null);
            }
        });
    }
}
