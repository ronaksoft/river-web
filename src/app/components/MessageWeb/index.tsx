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
    constructor(props: IProps) {
        super(props);

        const info = getWebDocumentInfo(props.message);
        this.state = {
            docType: getTypeByMime(info.mimetype),
            info,
        };
    }

    public render() {
        return (
            <div className="message-web">
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
                    <img src={info.url} alt="web-doc" onLoad={this.props.measureFn}/>
                </div>;
            case 'video':
                return <div className="web-image" style={info.size.width > 0 ? {
                    height: `${info.size.height}px`,
                    width: `${info.size.width}px`,
                } : undefined}>
                    <video src={info.url} onLoad={this.props.measureFn} controls={true}/>
                </div>;
        }

        return <div className="web-unsupported">{i18n.t('general.unsupported_document')}</div>;
    }
}

export default MessageWeb;
