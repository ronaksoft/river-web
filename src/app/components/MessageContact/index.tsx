/*
    Creation Time: 2019 - Jan - 21
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {IMessage} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/core.types_pb';
import {PersonRounded} from '@material-ui/icons';
import {MediaContact} from '../../services/sdk/messages/chat.messages.medias_pb';
import {saveAs} from 'file-saver';

import './style.scss';

interface IProps {
    message: IMessage;
    peer: InputPeer | null;
    onAction?: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open', message: IMessage) => void;
}

interface IState {
    fileName: string;
}

class MessageContact extends React.PureComponent<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            fileName: '',
        };
    }

    public render() {
        const contact: MediaContact.AsObject = this.props.message.mediadata;
        return (
            <div className="message-contact">
                <div className="contact-content">
                    <div className="contact-action" onClick={this.downloadVCardHandler}>
                        <PersonRounded/>
                    </div>
                    <div className="contact-info">
                        <div className="contact-name">{`${contact.firstname} ${contact.lastname}`}</div>
                        <a className="contact-phone" href={`tel:${contact.phone}`}>{contact.phone}</a>
                    </div>
                </div>
            </div>
        );
    }

    /* Download VCard handler */
    private downloadVCardHandler = () => {
        const contact: MediaContact.AsObject = this.props.message.mediadata;
        if (contact.vcard) {
            const blob = new Blob([contact.vcard], {type: 'text/vcard'});
            saveAs(blob, `${contact.firstname}-${contact.lastname}-${contact.phone}.vcf`);
        }
    }
}

export default MessageContact;
