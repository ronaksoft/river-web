/*
    Creation Time: 2018 - Sep - 09
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import {C_MSG} from '../const';
import {AuthSentCode, AuthCheckedPhone, AuthAuthorization, AuthRecalled} from '../messages/auth_pb';
import {BlockedContactsMany, ContactsImported, ContactsMany, ContactsTopPeers} from '../messages/contacts_pb';
import {
    Bool,
    Error,
    FileLocation, GroupPhoto,
    Label,
    LabelsMany,
    MessageContainer, Pong, Team,
    UserPhoto
} from '../messages/core.types_pb';
import {
    MessagesDialogs,
    MessagesGetDialogs,
    MessagesMany,
    MessagesReactionList,
    MessagesSent
} from '../messages/chat.messages_pb';
import {Dialog, Group, GroupFull, PeerNotifySettings, User} from '../messages/core.types_pb';
import {
    UpdateDifference,
    UpdateGetDifference,
    UpdateState,
} from '../messages/updates_pb';
import {File} from '../messages/files_pb';
import {AccountAuthorizations, AccountPassword, AccountPrivacyRules} from '../messages/accounts_pb';
import {SystemConfig, SystemInfo, SystemSalts, SystemServerTime} from '../messages/system_pb';
import {UsersMany} from '../messages/users_pb';
import {LabelItems, LabelsListItems} from "../messages/chat.labels_pb";
import {BotCallbackAnswer, BotResults} from "../messages/chat.bot_pb";
import {FoundGifs, SavedGifs} from "../messages/gif_pb";
import {TeamMembers, TeamsMany} from "../messages/team_pb";
import {GroupsHistoryStats} from "../messages/chat.groups_pb";
import {PhoneCall} from "../messages/chat.phone_pb";

export default class Presenter {
    public static getMessage(constructor: number, data: Uint8Array): any {
        switch (constructor) {
            case C_MSG.AuthSentCode:
                return AuthSentCode.deserializeBinary(data);
            case C_MSG.AuthCheckedPhone:
                return AuthCheckedPhone.deserializeBinary(data);
            case C_MSG.AuthAuthorization:
                return AuthAuthorization.deserializeBinary(data);
            case C_MSG.AuthRecalled:
                return AuthRecalled.deserializeBinary(data);
            case C_MSG.ContactsImported:
                return ContactsImported.deserializeBinary(data);
            case C_MSG.Error:
                return Error.deserializeBinary(data);
            case C_MSG.ContactsMany:
                return ContactsMany.deserializeBinary(data);
            case C_MSG.MessagesDialogs:
                return MessagesDialogs.deserializeBinary(data);
            case C_MSG.Dialog:
                return Dialog.deserializeBinary(data);
            case C_MSG.MessagesSent:
                return MessagesSent.deserializeBinary(data);
            case C_MSG.MessagesMany:
                return MessagesMany.deserializeBinary(data);
            case C_MSG.Bool:
                return Bool.deserializeBinary(data);
            case C_MSG.UpdateState:
                return UpdateState.deserializeBinary(data);
            case C_MSG.UpdateDifference:
                return UpdateDifference.deserializeBinary(data);
            case C_MSG.Group:
                return Group.deserializeBinary(data);
            case C_MSG.GroupFull:
                return GroupFull.deserializeBinary(data);
            case C_MSG.User:
                return User.deserializeBinary(data);
            case C_MSG.PeerNotifySettings:
                return PeerNotifySettings.deserializeBinary(data);
            case C_MSG.File:
                return File.deserializeBinary(data);
            case C_MSG.AccountAuthorizations:
                return AccountAuthorizations.deserializeBinary(data);
            case C_MSG.SystemInfo:
                return SystemInfo.deserializeBinary(data);
            case C_MSG.SystemServerTime:
                return SystemServerTime.deserializeBinary(data);
            case C_MSG.UsersMany:
                return UsersMany.deserializeBinary(data);
            case C_MSG.SystemSalts:
                return SystemSalts.deserializeBinary(data);
            case C_MSG.AccountPrivacyRules:
                return AccountPrivacyRules.deserializeBinary(data);
            case C_MSG.MessageContainer:
                return MessageContainer.deserializeBinary(data);
            case C_MSG.LabelsMany:
                return LabelsMany.deserializeBinary(data);
            case C_MSG.LabelItems:
                return LabelItems.deserializeBinary(data);
            case C_MSG.Label:
                return Label.deserializeBinary(data);
            case C_MSG.AccountPassword:
                return AccountPassword.deserializeBinary(data);
            case C_MSG.BlockedContactsMany:
                return BlockedContactsMany.deserializeBinary(data);
            case C_MSG.UserPhoto:
                return UserPhoto.deserializeBinary(data);
            case C_MSG.GroupPhoto:
                return GroupPhoto.deserializeBinary(data);
            case C_MSG.GroupsHistoryStats:
                return GroupsHistoryStats.deserializeBinary(data);
            case C_MSG.BotCallbackAnswer:
                return BotCallbackAnswer.deserializeBinary(data);
            case C_MSG.FileLocation:
                return FileLocation.deserializeBinary(data);
            case C_MSG.UpdateGetDifference:
                return UpdateGetDifference.deserializeBinary(data);
            case C_MSG.LabelsListItems:
                return LabelsListItems.deserializeBinary(data);
            case C_MSG.MessagesGetDialogs:
                return MessagesGetDialogs.deserializeBinary(data);
            case C_MSG.ContactsTopPeers:
                return ContactsTopPeers.deserializeBinary(data);
            case C_MSG.SystemConfig:
                return SystemConfig.deserializeBinary(data);
            case C_MSG.SavedGifs:
                return SavedGifs.deserializeBinary(data);
            case C_MSG.FoundGifs:
                return FoundGifs.deserializeBinary(data);
            case C_MSG.MessagesReactionList:
                return MessagesReactionList.deserializeBinary(data);
            case C_MSG.BotResults:
                return BotResults.deserializeBinary(data);
            case C_MSG.Team:
                return Team.deserializeBinary(data);
            case C_MSG.TeamsMany:
                return TeamsMany.deserializeBinary(data);
            case C_MSG.TeamMembers:
                return TeamMembers.deserializeBinary(data);
            case C_MSG.PhoneCall:
                return PhoneCall.deserializeBinary(data);
            case C_MSG.Pong:
                return Pong.deserializeBinary(data);
            default:
                return null;
        }
    }
}
