/*
    Creation Time: 2018 - Aug - 25
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {UserMessage} from '../../services/sdk/messages/core.types_pb';

interface IMessage extends UserMessage.AsObject {
    me?: boolean;
    avatar?: boolean;
    rtl?: boolean;
    temp?: boolean;
    actiondata?: any;
    mention_me?: boolean;
}

export {IMessage};
