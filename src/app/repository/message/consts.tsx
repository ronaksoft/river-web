export const C_MESSAGE_TYPE = {
    Date: -1,
    End: -4,
    Gap: -5,
    Hole: -2,
    NewMessage: -3,
    Normal: 2,
    System: 1,
};

export const C_MESSAGE_ACTION = {
    MessageActionClearHistory: 0x07,
    MessageActionContactRegistered: 0x01,
    MessageActionGroupAddUser: 0x03,
    MessageActionGroupCreated: 0x02,
    MessageActionGroupDeleteUser: 0x05,
    MessageActionGroupTitleChanged: 0x06,
    MessageActionNope: 0x00,
};
