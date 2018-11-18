import {User} from '../../services/sdk/messages/core.types_pb';

interface IUser extends User.AsObject {
    avatar?: string;
}

export {IUser};
