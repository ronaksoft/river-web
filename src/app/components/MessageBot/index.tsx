/*
    Creation Time: 2020 - Feb - 19
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import * as React from 'react';
import {IMessage, IMessageBotCol} from '../../repository/message/interface';
import {InputPeer} from '../../services/sdk/messages/chat.core.types_pb';
import {C_BUTTON_ACTION, C_REPLY_ACTION} from "../../repository/message/consts";
import {
    Button, ButtonBuy, ButtonCallback, ButtonRequestGeoLocation, ButtonRequestPhone, ButtonSwitchInline,
    ButtonUrl, ButtonUrlAuth,
    ReplyInlineMarkup,
    ReplyKeyboardMarkup
} from "../../services/sdk/messages/chat.core.message.markups_pb";

import './style.scss';

interface IProps {
    message: IMessage;
    peer: InputPeer | null;
}

interface IState {
    fileName: string;
}

class MessageBot extends React.PureComponent<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            fileName: '',
        };
    }

    public render() {
        const {message} = this.props;
        if (!message.replydata) {
            return '';
        }
        if (message.replymarkup === C_REPLY_ACTION.ReplyInlineMarkup) {
            const replyInlineMarkup: ReplyInlineMarkup.AsObject = message.replydata;
            return (
                <div className="message-bot">
                    {replyInlineMarkup.rowsList.map((row, i) => {
                        return (
                            <div key={i} className="message-row">
                                {row.buttonsList.map((col: IMessageBotCol, j) => {
                                    return (<div key={j} className="message-col">
                                        {this.getButton(col)}
                                    </div>);
                                })}
                            </div>
                        );
                    })}
                </div>
            );
        } else if (message.replymarkup === C_REPLY_ACTION.ReplyKeyboardMarkup) {
            const replyKeyboardMarkup: ReplyKeyboardMarkup.AsObject = message.replydata;
            return (
                <div className="message-bot">
                    {replyKeyboardMarkup.rowsList.map((row, i) => {
                        return (
                            <div key={i} className="message-row">
                                {row.buttonsList.map((col: IMessageBotCol, j) => {
                                    return (<div key={j} className="message-col">
                                        {this.getButton(col)}
                                    </div>);
                                })}
                            </div>
                        );
                    })}
                </div>
            );
        }
        return '';
    }

    private getButton(col: IMessageBotCol) {
        switch (col.constructor) {
            case C_BUTTON_ACTION.Button:
                const button: Button.AsObject = col.buttondata;
                return (<div className="bot-button">{button.text}</div>);
            case C_BUTTON_ACTION.ButtonUrl:
                const buttonUrl: ButtonUrl.AsObject = col.buttondata;
                return (<div className="bot-button">{buttonUrl.text}</div>);
            case C_BUTTON_ACTION.ButtonUrlAuth:
                const buttonUrlAuth: ButtonUrlAuth.AsObject = col.buttondata;
                return (<div className="bot-button">{buttonUrlAuth.text}</div>);
            case C_BUTTON_ACTION.ButtonSwitchInline:
                const buttonSwitchInline: ButtonSwitchInline.AsObject = col.buttondata;
                return (<div className="bot-button">{buttonSwitchInline.text}</div>);
            case C_BUTTON_ACTION.ButtonRequestPhone:
                const buttonRequestPhone: ButtonRequestPhone.AsObject = col.buttondata;
                return (<div className="bot-button">{buttonRequestPhone.text}</div>);
            case C_BUTTON_ACTION.ButtonRequestGeoLocation:
                const buttonRequestGeoLocation: ButtonRequestGeoLocation.AsObject = col.buttondata;
                return (<div className="bot-button">{buttonRequestGeoLocation.text}</div>);
            case C_BUTTON_ACTION.ButtonCallback:
                const buttonCallback: ButtonCallback.AsObject = col.buttondata;
                return (<div className="bot-button">{buttonCallback.text}</div>);
            case C_BUTTON_ACTION.ButtonBuy:
                const buttonBuy: ButtonBuy.AsObject = col.buttondata;
                return (<div className="bot-button">{buttonBuy.text}</div>);
            default:
                return '';
        }
    }
}

export default MessageBot;
