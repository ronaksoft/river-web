import {Group, GroupParticipant} from '../../services/sdk/messages/core.types_pb';

interface IGroup extends Group.AsObject {
    avatar?: string;
    participantList?: GroupParticipant.AsObject[];
}

export {IGroup};
