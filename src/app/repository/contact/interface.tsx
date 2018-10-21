import {ContactUser} from '../../services/sdk/messages/core.types_pb';

interface IContact extends ContactUser.AsObject {
    _id?: string;
    _rev?: string;
    avatar?: string;
}

export {IContact};