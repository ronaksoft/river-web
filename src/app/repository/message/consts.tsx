/*
    Creation Time: 2018 - Oct - 20
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

export const C_MESSAGE_TYPE = {
    Audio: -10,
    Contact: -8,
    Date: -1,
    End: -4,
    File: -7,
    Gap: -5,
    Gif: -13,
    Hole: -2,
    Location: -12,
    NewMessage: -3,
    Normal: 2,
    Picture: -9,
    System: 1,
    Video: -11,
    Voice: -6,
    VoiceMail: -15,
    WebDocument: -14,
};

export const C_MESSAGE_ACTION = {
    MessageActionCallEnded: 0x0c,
    MessageActionCallStarted: 0x0b,
    MessageActionClearHistory: 0x07,
    MessageActionContactRegistered: 0x01,
    MessageActionEmptyDialog: -0x01,
    MessageActionGroupAddUser: 0x03,
    MessageActionGroupCreated: 0x02,
    MessageActionGroupDeleteUser: 0x05,
    MessageActionGroupPhotoChanged: 0x08,
    MessageActionGroupTitleChanged: 0x06,
    MessageActionNope: 0x00,
    MessageActionScreenShot: 0x09,
    MessageActionThreadClosed: 0x0a,
};

export const C_REPLY_ACTION = {
    ReplyInlineMarkup: 2436413989,
    ReplyKeyboardForceReply: 258469686,
    ReplyKeyboardHide: 3134153306,
    ReplyKeyboardMarkup: 3207405102,
};

export const C_BUTTON_ACTION = {
    Button: 1034594571,
    ButtonBuy: 2992465437,
    ButtonCallback: 4007711268,
    ButtonRequestGeoLocation: 323515934,
    ButtonRequestPhone: 630958494,
    ButtonSwitchInline: 3842667878,
    ButtonUrl: 2309530052,
    ButtonUrlAuth: 2344836100,
};
