import {ParticipantType, User} from '../../services/sdk/messages/core.types_pb';

interface IUser extends User.AsObject {
    avatar?: string;
}

interface IParticipant extends IUser {
    userid?: string;
    type?: ParticipantType;
}

export {IUser, IParticipant};
