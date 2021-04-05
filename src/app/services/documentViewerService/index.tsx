/*
    Creation Time: 2019 - Feb - 02
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {InputFileLocation, InputPeer, MediaCategory, MessageEntity} from '../sdk/messages/core.types_pb';
import MediaRepo from '../../repository/media';
import {IPeer} from "../../repository/dialog/interface";
import {SetOptional} from "type-fest";

interface IDocumentItem {
    caption: string;
    createdon?: number;
    downloaded?: boolean;
    duration?: number;
    entityList?: MessageEntity.AsObject[];
    fileLocation: SetOptional<InputFileLocation.AsObject, 'version'>;
    fileSize?: number;
    geo?: google.maps.LatLngLiteral;
    height?: number;
    id?: number;
    md5?: string;
    mimeType?: string;
    orientation?: number;
    rtl?: boolean;
    snippet?: string;
    thumbFileLocation?: SetOptional<InputFileLocation.AsObject, 'version'>;
    userId?: string;
    width?: number;
}

export interface IDocument {
    anchor?: 'message' | 'shared_media' | 'shared_media_full' | 'label';
    labelId?: number;
    items: IDocumentItem[];
    peer?: IPeer;
    rect?: ClientRect;
    inputPeer?: InputPeer;
    photoId?: string;
    type: 'avatar' | 'picture' | 'video' | 'location' | 'code';
    stream?: boolean;
    teamId: string;
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
    private preventClosing: boolean = false;
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

    public setPreventClosing(enable: boolean) {
        this.preventClosing = enable;
    }

    public getPreventClosing() {
        return this.preventClosing;
    }

    public loadDocument(doc: IDocument) {
        if (!this.onDocumentReady) {
            return;
        }
        this.onDocumentReady(doc);
        if (doc.labelId !== undefined) {
            if (this.onDocumentPrev) {
                this.onDocumentPrev(null);
            }
            if (this.onDocumentNext) {
                this.onDocumentNext(null);
            }
        } else {
            this.initPagination(doc);
        }
    }

    private initPagination(doc: IDocument) {
        if ((doc.type !== 'video' && doc.type !== 'picture') || !doc.peer) {
            return;
        }
        const inputPeer = new InputPeer();
        inputPeer.setId(doc.peer.id);
        inputPeer.setType(doc.peer.peerType);
        this.mediaRepo.list(doc.teamId, inputPeer, {
            before: (doc.items[0].id || 0) - 1,
            limit: 1,
            localOnly: true,
            type: MediaCategory.MEDIACATEGORYMEDIA,
        }).then((res) => {
            if (this.onDocumentPrev && res.messages.length > 0) {
                this.onDocumentPrev(res.messages[0]);
            } else {
                this.onDocumentPrev(null);
            }
        });
        this.mediaRepo.list(doc.teamId, inputPeer, {
            after: (doc.items[0].id || 0) + 1,
            limit: 1,
            localOnly: true,
            type: MediaCategory.MEDIACATEGORYMEDIA,
        }).then((res) => {
            if (this.onDocumentNext && res.messages.length > 0) {
                this.onDocumentNext(res.messages[0]);
            } else {
                this.onDocumentNext(null);
            }
        });
    }
}
