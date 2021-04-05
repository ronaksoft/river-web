/*
    Creation Time: 2021 - April - 05
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2021
*/

import React from "react";
import {IMessage} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/core.types_pb';
import {MediaWebDocument} from "../../services/sdk/messages/chat.messages.medias_pb";
import {getContentSize} from "../MessageMedia";
import {getTypeByMime, mimeDocType} from "../Uploader";
import i18n from "../../services/i18n";
import DocumentViewerService, {IDocument} from "../../services/documentViewerService";
import {C_MESSAGE_TYPE} from "../../repository/message/consts";

import './style.scss';

interface IWebDocumentInfo {
    url: string;
    docsize: number;
    mimetype: string;
    accesshash: string;
    size: {
        height: number,
        width: number,
    };
}

const getWebDocumentInfo = (message: IMessage): IWebDocumentInfo => {
    const info: IWebDocumentInfo = {
        accesshash: '',
        docsize: 0,
        mimetype: '',
        size: {
            height: 0,
            width: 0,
        },
        url: '',
    };
    const messageMediaWebDocument: MediaWebDocument.AsObject = message.mediadata;
    if (!messageMediaWebDocument) {
        return null;
    }

    info.accesshash = messageMediaWebDocument.accesshash;
    info.docsize = messageMediaWebDocument.docsize;
    info.mimetype = messageMediaWebDocument.mimetype;
    info.url = messageMediaWebDocument.url;

    const size = getContentSize(message);
    if (size) {
        info.size = size;
    }
    return info;
};

interface IProps {
    measureFn: any;
    message: IMessage;
    peer: InputPeer | null;
}

interface IState {
    docType: mimeDocType;
    info: IWebDocumentInfo;
}

class MessageWeb extends React.PureComponent<IProps, IState> {
    private documentViewerService: DocumentViewerService;

    constructor(props: IProps) {
        super(props);

        const info = getWebDocumentInfo(props.message);
        this.state = {
            docType: getTypeByMime(info.mimetype),
            info,
        };

        this.documentViewerService = DocumentViewerService.getInstance();
    }

    public render() {
        return (
            <div className="message-web" onClick={this.showMediaHandler}>
                {this.getContent()}
            </div>
        );
    }

    private getContent() {
        const {docType, info} = this.state;
        switch (docType) {
            case 'image':
                return <div className="web-image" style={info.size.width > 0 ? {
                    height: `${info.size.height}px`,
                    width: `${info.size.width}px`,
                } : undefined}>
                    <img src={info.url} alt="web-doc" onLoad={this.props.measureFn} className="document"/>
                </div>;
            case 'video':
                return <div className="web-image" style={info.size.width > 0 ? {
                    height: `${info.size.height}px`,
                    width: `${info.size.width}px`,
                } : undefined}>
                    <video src={info.url} onLoad={this.props.measureFn} controls={false} className="document"/>
                </div>;
        }

        return <div className="web-unsupported">{i18n.t('general.unsupported_document')}</div>;
    }

    private showMediaHandler = (e: any) => {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        const {message} = this.props;
        const {info, docType} = this.state;
        if (!info) {
            return;
        }

        if (!(docType === 'video' || docType === 'image')) {
            return;
        }

        let el = (e.currentTarget || e);
        const picEl = el.querySelector('.picture');
        if (picEl) {
            el = picEl;
        }
        const doc: IDocument = {
            anchor: 'message',
            items: [{
                caption: '',
                createdon: message.createdon,
                downloaded: true,
                fileLocation: {
                    accesshash: '0',
                    clusterid: 1,
                    fileid: '0',
                    version: 0,
                },
                height: info.size.height,
                id: message.id || 0,
                mimeType: info.mimetype,
                rtl: message.rtl,
                url: info.url,
                userId: message.senderid || '',
                width: info.size.width,
            }],
            peer: {id: message.peerid || '', peerType: message.peertype || 0},
            rect: el.getBoundingClientRect(),
            teamId: message.teamid || '0',
            type: message.messagetype === C_MESSAGE_TYPE.Video ? 'video' : 'picture',
            web: true,
        };
        this.documentViewerService.loadDocument(doc);
    }
}

export default MessageWeb;
