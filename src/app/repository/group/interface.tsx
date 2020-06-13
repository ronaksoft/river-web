/*
    Creation Time: 2018 - Nov - 26
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {Group, GroupParticipant, GroupPhoto} from "../../services/sdk/messages/core.types_pb";

export interface IGroup extends Group.AsObject {
    avatar?: string;
    participantList?: GroupParticipant.AsObject[];
    photogalleryList?: GroupPhoto.AsObject[];
    hasUpdate?: boolean;
    remove_photo?: boolean;
    last_updated?: number;
}
