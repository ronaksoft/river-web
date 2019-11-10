/*
    Creation Time: 2018 - Nov - 26
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {Group, GroupParticipant, GroupPhoto} from '../../services/sdk/messages/chat.core.types_pb';

interface IGroup extends Group.AsObject {
    avatar?: string;
    participantList?: GroupParticipant.AsObject[];
    delete_photo?: boolean;
    photogalleryList?: GroupPhoto.AsObject[];
    hasUpdate?: boolean;
}

// @ts-ignore
export {IGroup};
