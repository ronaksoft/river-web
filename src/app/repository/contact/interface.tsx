import {ContactUser} from '../../services/sdk/messages/core.types_pb';

interface IContact extends ContactUser.AsObject {
    avatar?: string;
}

export {IContact};
