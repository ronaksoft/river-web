import {IMessage} from '../../repository/message/interface';
import {MediaType} from '../../services/sdk/messages/chat.core.types_pb';
import {DocumentAttributeType, MediaDocument} from '../../services/sdk/messages/chat.core.message.medias_pb';
import {C_MESSAGE_TYPE} from '../../repository/message/consts';

export const C_MESSAGE_ICON = {
    Audio: 2,
    Contact: 6,
    File: 5,
    GIF: 7,
    Location: 9,
    None: 0,
    Photo: 4,
    Sticker: 8,
    Video: 1,
    Voice: 3,
};

export const getMessageTitle = (message: IMessage): { text: string, icon: number } => {
    const messageIcon: { text: string, icon: number } = {text: '', icon: C_MESSAGE_ICON.None};

    switch (message.mediatype) {
        default:
        case MediaType.MEDIATYPEEMPTY:
            messageIcon.text = (message.body || '').substr(0, 64);
            break;
        case MediaType.MEDIATYPEDOCUMENT:
            const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
            if (message.messagetype === C_MESSAGE_TYPE.Voice) {
                messageIcon.icon = C_MESSAGE_ICON.Voice;
                messageIcon.text = 'Voice Message';
            } else if (message.messagetype === C_MESSAGE_TYPE.Audio) {
                messageIcon.icon = C_MESSAGE_ICON.Audio;
                messageIcon.text = 'Audio Message';
            } else if (message.messagetype === C_MESSAGE_TYPE.Video) {
                messageIcon.icon = C_MESSAGE_ICON.Video;
                messageIcon.text = 'Video Message';
            } else if (message.messagetype === C_MESSAGE_TYPE.File) {
                messageIcon.icon = C_MESSAGE_ICON.File;
                messageIcon.text = 'File';
            } else {
                if (messageMediaDocument.doc && messageMediaDocument.doc.attributesList) {
                    for (let i = 0; i < messageMediaDocument.doc.attributesList.length; i++) {
                        if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEAUDIO) {
                            messageIcon.icon = C_MESSAGE_ICON.Audio;
                            messageIcon.text = 'Audio Message';
                        } else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEVIDEO) {
                            messageIcon.icon = C_MESSAGE_ICON.Video;
                            messageIcon.text = 'Video Message';
                        } else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEPHOTO) {
                            messageIcon.icon = C_MESSAGE_ICON.Photo;
                            messageIcon.text = 'Photo Message';
                        } else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEFILE) {
                            if (messageIcon.text === '') {
                                messageIcon.icon = C_MESSAGE_ICON.File;
                                messageIcon.text = 'File';
                            }
                        } else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTEANIMATED) {
                            messageIcon.icon = C_MESSAGE_ICON.GIF;
                            messageIcon.text = 'GIF';
                        }
                        /* else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPENONE) {
                            title = '';
                            break;
                        }*/
                    }
                }
            }
            if (messageMediaDocument.caption && messageMediaDocument.caption.length > 0) {
                messageIcon.text = (messageMediaDocument.caption || '').substr(0, 64);
            }
            break;
        case MediaType.MEDIATYPECONTACT:
            messageIcon.icon = C_MESSAGE_ICON.Contact;
            messageIcon.text = 'Contact';
            break;
        case MediaType.MEDIATYPEGEOLOCATION:
            messageIcon.icon = C_MESSAGE_ICON.Location;
            messageIcon.text = 'Location';
            break;
    }

    return messageIcon;
};
