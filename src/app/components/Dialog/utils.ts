import {IMessage} from '../../repository/message/interface';
import {MediaType} from '../../services/sdk/messages/chat.core.types_pb';
import {DocumentAttributeType, MediaDocument} from '../../services/sdk/messages/chat.core.message.medias_pb';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';

export const getMessageTitle = (message: IMessage): string => {
    switch (message.mediatype) {
        default:
        case MediaType.MEDIATYPEEMPTY:
            return (message.body || '').substr(0, 64);
        case MediaType.MEDIATYPEDOCUMENT:
            const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
            if (messageMediaDocument.caption && messageMediaDocument.caption.length > 0) {
                return (messageMediaDocument.caption || '').substr(0, 64);
            }
            if (message.messagetype === C_MESSAGE_TYPE.Voice) {
                return 'Voice Message';
            } else if (message.messagetype === C_MESSAGE_TYPE.Contact) {
                return 'Contact';
            } else {
                if (messageMediaDocument.doc.attributesList) {
                    let title = '';
                    for (let i = 0; i < messageMediaDocument.doc.attributesList.length; i++) {
                        if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEAUDIO) {
                            title = 'Audio Message';
                            break;
                        } else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEVIDEO) {
                            title = 'Video Message';
                            break;
                        } else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEPHOTO) {
                            title = 'Photo Message';
                            break;
                        } else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEFILE) {
                            if (title === '') {
                                title = 'File';
                            }
                            break;
                        } else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTEANIMATED) {
                            title = 'GIF';
                            break;
                        }
                        /* else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPENONE) {
                            title = '';
                            break;
                        }*/
                    }
                    return title;
                }
            }
            return '';
        case MediaType.MEDIATYPECONTACT:
            return 'Contact';
    }
};
