import {IMessage} from '../../repository/message/interface';
import {MediaType} from '../../services/sdk/messages/core.types_pb';
import {
    DocumentAttributeType,
    MediaDocument,
    MediaWebDocument
} from '../../services/sdk/messages/chat.messages.medias_pb';
import {C_MESSAGE_ACTION, C_MESSAGE_TYPE} from '../../repository/message/consts';
import i18n from '../../services/i18n';
import UserRepo from "../../repository/user";
import {currentUserId} from "../../services/sdk";
import {getTypeByMime} from "../Uploader";

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
    WebDocument: 10,
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
            if (!message.actiondata) {
                return `${name} ${i18n.t('message.added_a_user')}`;
            } else {
                const userIds: string[] = message.actiondata.useridsList;
                if (userIds && userIds.length > 0) {
                    const targetUser = UserRepo.getInstance().getInstant(userIds[0]);
                    if (targetUser) {
                        return `${name} ${i18n.tf('message.added_a_user_param', targetUser.firstname || '')}`;
                    } else {
                        return `${name} ${i18n.t('message.added_a_user')}`;
                    }
                } else {
                    return `${name} ${i18n.t('message.added_a_user')}`;
                }
            }
        case C_MESSAGE_ACTION.MessageActionGroupDeleteUser:
            if (!message.actiondata) {
                return `${name} ${i18n.t('message.removed_a_user')}`;
            } else {
                const userIds: string[] = message.actiondata.useridsList;
                if (message.actiondata.useridsList.indexOf(message.senderid) > -1) {
                    return `${name} ${i18n.t('message.left')}`;
                } else {
                    if (userIds && userIds.length > 0) {
                        const targetUser = UserRepo.getInstance().getInstant(userIds[0]);
                        if (targetUser) {
                            return `${name} ${i18n.tf('message.removed_a_user_param', targetUser.firstname || '')}`;
                        } else {
                            return `${name} ${i18n.t('message.removed_a_user')}`;
                        }
                    } else {
                        return `${name} ${i18n.t('message.removed_a_user')}`;
                    }
                }
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
        case C_MESSAGE_ACTION.MessageActionCallStarted:
            return `${i18n.t('message.call_from')} ${name}`;
        case C_MESSAGE_ACTION.MessageActionCallEnded:
            return `${i18n.t('message.call_ended')}`;
        default:
            return i18n.t('message.unsupported_message');
    }
};

export const getMessageTitle = (message: IMessage, ignoreCaption?: boolean, maxChars?: number): { text: string, icon: number } => {
    const messageIcon: { text: string, icon: number } = {icon: C_MESSAGE_ICON.None, text: ''};
    if (message.messagetype === C_MESSAGE_TYPE.System) {
        messageIcon.text = getSystemMessageTitle(message);
    } else {
        switch (message.mediatype) {
            default:
            case MediaType.MEDIATYPEEMPTY:
                messageIcon.text = (message.body || '').substr(0, maxChars || 64);
                if (message.fwdsenderid && message.fwdsenderid !== "" && message.fwdsenderid !== "0") {
                    messageIcon.icon = C_MESSAGE_ICON.Forwarded;
                } else if (message.replyto) {
                    messageIcon.icon = C_MESSAGE_ICON.Reply;
                }
                break;
            case MediaType.MEDIATYPEDOCUMENT:
                const messageMediaDocument: MediaDocument.AsObject = message.mediadata;
                if (message.messagetype === C_MESSAGE_TYPE.Voice || message.messagetype === C_MESSAGE_TYPE.VoiceMail) {
                    messageIcon.icon = C_MESSAGE_ICON.Voice;
                    messageIcon.text = i18n.t('message.voice_message');
                } else if (message.messagetype === C_MESSAGE_TYPE.Audio) {
                    messageIcon.icon = C_MESSAGE_ICON.Audio;
                    messageIcon.text = i18n.t('message.audio_message');
                } else if (message.messagetype === C_MESSAGE_TYPE.Video) {
                    messageIcon.icon = C_MESSAGE_ICON.Video;
                    messageIcon.text = i18n.t('message.video_message');
                } else if (message.messagetype === C_MESSAGE_TYPE.Picture) {
                    messageIcon.icon = C_MESSAGE_ICON.Photo;
                    messageIcon.text = i18n.t('message.photo_message');
                } else if (message.messagetype === C_MESSAGE_TYPE.File) {
                    messageIcon.icon = C_MESSAGE_ICON.File;
                    messageIcon.text = i18n.t('message.file');
                } else if (message.messagetype === C_MESSAGE_TYPE.Gif) {
                    messageIcon.icon = C_MESSAGE_ICON.GIF;
                    messageIcon.text = i18n.t('message.gif');
                } else if (message.messagetype === C_MESSAGE_TYPE.WebDocument) {
                    const messageMediaWebDocument: MediaWebDocument.AsObject = message.mediadata;
                    const docType = getTypeByMime(messageMediaWebDocument.mimetype);
                    if (docType === 'image') {
                        messageIcon.icon = C_MESSAGE_ICON.Photo;
                        messageIcon.text = i18n.t('message.photo_message');
                    } else if (docType === 'video') {
                        messageIcon.icon = C_MESSAGE_ICON.Video;
                        messageIcon.text = i18n.t('message.video_message');
                    } else {
                        messageIcon.icon = C_MESSAGE_ICON.WebDocument;
                        messageIcon.text = i18n.t('message.web_document');
                    }
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
                if (ignoreCaption !== true && messageMediaDocument.caption && messageMediaDocument.caption.length > 0) {
                    messageIcon.text = (messageMediaDocument.caption || '').substr(0, maxChars || 64);
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
            case MediaType.MEDIATYPEWEBDOCUMENT:
                const messageMediaWebDocument: MediaWebDocument.AsObject = message.mediadata;
                const docType = getTypeByMime(messageMediaWebDocument.mimetype);
                if (docType === 'image') {
                    messageIcon.icon = C_MESSAGE_ICON.Photo;
                    messageIcon.text = i18n.t('message.photo_message');
                } else if (docType === 'video') {
                    messageIcon.icon = C_MESSAGE_ICON.Video;
                    messageIcon.text = i18n.t('message.video_message');
                } else {
                    messageIcon.icon = C_MESSAGE_ICON.WebDocument;
                    messageIcon.text = i18n.t('message.web_document');
                }
                break;
        }
    }

    return messageIcon;
};

export const yourPeerDisableStatus = (message: IMessage): (boolean | undefined) => {
    switch (message.messageaction) {
        case C_MESSAGE_ACTION.MessageActionGroupAddUser:
            if (message.actiondata) {
                const userIds: string[] = message.actiondata.useridsList;
                if (userIds && userIds.length > 0 && userIds.indexOf(currentUserId) > -1) {
                    return false;
                }
            }
            break;
        case C_MESSAGE_ACTION.MessageActionGroupDeleteUser:
            if (message.actiondata) {
                const userIds: string[] = message.actiondata.useridsList;
                if (userIds && userIds.length > 0 && userIds.indexOf(currentUserId) > -1) {
                    return true;
                }
            }
            break;
    }
    return undefined;
};
