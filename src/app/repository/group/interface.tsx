import {Group} from '../../services/sdk/messages/core.types_pb';

interface IGroup extends Group.AsObject {
    avatar?: string;
}

export {IGroup};
