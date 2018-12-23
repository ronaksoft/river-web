import {ContactUser} from '../../services/sdk/messages/core.types_pb';

interface IContact extends ContactUser.AsObject {
    avatar?: string;
    category?: string;
    temp?: boolean;
}

export {IContact};
