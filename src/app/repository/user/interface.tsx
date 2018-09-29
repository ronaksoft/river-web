import {User} from "../../services/sdk/messages/core.types_pb";

interface IUser extends User.AsObject {
    _id?: number;
    avatar?: string;
}

export {IUser};