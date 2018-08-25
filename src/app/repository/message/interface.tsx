interface IMessage {
    _id: string;
    avatar: string | undefined;
    conversation_id: string;
    me: boolean;
    message: string;
    timestamp: number;
}

export {IMessage};