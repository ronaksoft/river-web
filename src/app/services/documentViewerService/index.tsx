/*
    Creation Time: 2019 - Feb - 02
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import {InputFileLocation} from '../sdk/messages/chat.core.types_pb';

interface IDocumentItem {
    caption: string;
    fileLocation: InputFileLocation.AsObject;
    thumbFileLocation?: InputFileLocation.AsObject;
}

export interface IDocument {
    type: 'avatar' | 'picture' | 'video' | 'location';
    items: IDocumentItem[];
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

    public constructor() {
        //
    }

    public setDocumentReady(fn: any) {
        this.onDocumentReady = fn;
    }

    public loadDocument(doc: IDocument) {
        if (!this.onDocumentReady) {
            return;
        }
        this.onDocumentReady(doc);
    }
}
