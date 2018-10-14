import {User} from '../../services/sdk/messages/core.types_pb';

interface IUser extends User.AsObject {
    _id?: string;
    _rev?: string;
    avatar?: string;
}

export {IUser};