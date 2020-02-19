import {IMessage} from '../../repository/message/interface';
import {MediaType} from '../../services/sdk/messages/chat.core.types_pb';
import {DocumentAttributeType, MediaDocument} from '../../services/sdk/messages/chat.core.message.medias_pb';
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE} from '../../repository/message/consts';
import i18n from '../../services/i18n';
import UserRepo from "../../repository/user";

export const C_MESSAGE_ICON = {
    Audio: 2,
    Contact: 6,
    File: 5,
    Forwarded: 20,
    GIF: 7,
    Location: 9,
    None: 0,
    Photo: 4,
    Reply: 21,
    Sticker: 8,
    Video: 1,
    Voice: 3,
};

const getSystemMessageTitle = (message: IMessage) => {
    const user = UserRepo.getInstance().getInstant(message.senderid || '');
    const name = user ? user.firstname : '';
    switch (message.messageaction) {
        case C_MESSAGE_ACTION.MessageActionContactRegistered:
            return `${name} ${i18n.t('message.joined_river')}`;
        case C_MESSAGE_ACTION.MessageActionGroupCreated:
            return `${name} ${i18n.t('message.created_the_group')}`;
        case C_MESSAGE_ACTION.MessageActionGroupAddUser:
            return `${name} ${i18n.t('message.added_a_user')}`;
        case C_MESSAGE_ACTION.MessageActionGroupDeleteUser:
            if (!message.actiondata || message.actiondata.useridsList.indexOf(message.senderid) === -1) {
                return `${name} ${i18n.t('message.removed_a_user')}`;
            } else {
                return `${name} ${i18n.t('message.left')}`;
            }
        case C_MESSAGE_ACTION.MessageActionGroupTitleChanged:
            return `${name} ${i18n.t('message.changed_the_title')}`;
        case C_MESSAGE_ACTION.MessageActionClearHistory:
            return i18n.t('message.history_cleared');
        case C_MESSAGE_ACTION.MessageActionGroupPhotoChanged:
            if (!message.actiondata) {
                return i18n.t('message.removed_the_group_photo');
            } else {
                return `${name} ${i18n.t('message.changed_the_group_photo')}`;
            }
        case C_MESSAGE_ACTION.MessageActionScreenShot:
            return `${name} ${i18n.t('message.took_an_screenshot')}`;
        default:
            return i18n.t('message.unsupported_message');
    }
};

export const getMessageTitle = (message: IMessage): { text: string, icon: number } => {
    const messageIcon: { text: string, icon: number } = {text: '', icon: C_MESSAGE_ICON.None};
    if (message.messagetype === C_MESSAGE_TYPE.System) {
        messageIcon.text = getSystemMessageTitle(message);
    } else {
        switch (message.mediatype) {
            default:
            case MediaType.MEDIATYPEEMPTY:
                messageIcon.text = (message.body || '').substr(0, 64);
                if (message.fwdsenderid && message.fwdsenderid !== "" && message.fwdsenderid !== "0") {
                    messageIcon.icon = C_MESSAGE_ICON.Forwarded;
                } else if (message.replyto) {
                    messageIcon.icon = C_MESSAGE_ICON.Reply;
                }
                break;
            case MediaType.MEDIATYPEDOCUMENT:
                const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
                if (message.messagetype === C_MESSAGE_TYPE.Voice) {
                    messageIcon.icon = C_MESSAGE_ICON.Voice;
                    messageIcon.text = i18n.t('message.voice_message');
                } else if (message.messagetype === C_MESSAGE_TYPE.Audio) {
                    messageIcon.icon = C_MESSAGE_ICON.Audio;
                    messageIcon.text = i18n.t('message.audio_message');
                } else if (message.messagetype === C_MESSAGE_TYPE.Video) {
                    messageIcon.icon = C_MESSAGE_ICON.Video;
                    messageIcon.text = i18n.t('message.video_message');
                } else if (message.messagetype === C_MESSAGE_TYPE.File) {
                    messageIcon.icon = C_MESSAGE_ICON.File;
                    messageIcon.text = i18n.t('message.file');
                } else {
                    if (messageMediaDocument.doc && messageMediaDocument.doc.attributesList) {
                        for (let i = 0; i < messageMediaDocument.doc.attributesList.length; i++) {
                            if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEAUDIO) {
                                messageIcon.icon = C_MESSAGE_ICON.Audio;
                                messageIcon.text = i18n.t('message.audio_message');
                            } else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEVIDEO) {
                                messageIcon.icon = C_MESSAGE_ICON.Video;
                                messageIcon.text = i18n.t('message.video_message');
                            } else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEPHOTO) {
                                messageIcon.icon = C_MESSAGE_ICON.Photo;
                                messageIcon.text = i18n.t('message.photo_message');
                            } else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEFILE) {
                                if (messageIcon.text === '') {
                                    messageIcon.icon = C_MESSAGE_ICON.File;
                                    messageIcon.text = i18n.t('message.file');
                                }
                            } else if (messageMediaDocument.doc.attributesList[i].type === DocumentAttributeType.ATTRIBUTETYPEANIMATED) {
                                messageIcon.icon = C_MESSAGE_ICON.GIF;
                                messageIcon.text = i18n.t('message.gif');
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
                messageIcon.text = i18n.t('message.contact');
                break;
            case MediaType.MEDIATYPEGEOLOCATION:
                messageIcon.icon = C_MESSAGE_ICON.Location;
                messageIcon.text = i18n.t('message.location');
                break;
        }
    }

    return messageIcon;
};
