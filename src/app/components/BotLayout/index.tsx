import React from "react";
import {
    Button, ButtonBuy, ButtonCallback, ButtonRequestGeoLocation, ButtonRequestPhone, ButtonSwitchInline,
    ButtonUrl,
    ButtonUrlAuth,
    KeyboardButtonRow
} from "../../services/sdk/messages/chat.core.message.markups_pb";
import {IMessageBotCol} from "../../repository/message/interface";
import {C_BUTTON_ACTION} from "../../repository/message/consts";

export default function BotLayout({rows, prefix}: { rows: KeyboardButtonRow.AsObject[] | undefined, prefix: string }) {
    const getButton = (col: IMessageBotCol) => {
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
    };

    if (!rows) {
        return <div/>;
    }
    return (
        <div className={prefix}>
            {rows.map((row, i) => {
                return (
                    <div key={i} className={`${prefix}-row`}>
                        {row.buttonsList.map((col: IMessageBotCol, j) => {
                            return (<div key={j} className={`${prefix}-col`}>
                                {getButton(col)}
                            </div>);
                        })}
                    </div>
                );
            })}
        </div>
    );
}
