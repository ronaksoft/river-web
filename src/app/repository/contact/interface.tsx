import {ContactUser} from '../../services/sdk/messages/core.types_pb';

interface IContact extends ContactUser.AsObject {
    id?: string;
    avatar?: string;
}

export {IContact};
