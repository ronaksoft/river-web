import React from "react";
import {
    Button, ButtonBuy, ButtonCallback, ButtonRequestGeoLocation, ButtonRequestPhone, ButtonSwitchInline,
    ButtonUrl,
    ButtonUrlAuth,
    KeyboardButtonRow
} from "../../services/sdk/messages/chat.core.message.markups_pb";
import {IMessageBotCol} from "../../repository/message/interface";
import {C_BUTTON_ACTION} from "../../repository/message/consts";

export default function BotLayout({rows, prefix, onAction}: { rows: KeyboardButtonRow.AsObject[] | undefined, prefix: string, onAction?: (cmd: number, data: any) => void }) {
    const clickHandler = (cmd: number, data: any) => () => {
        if (onAction) {
            onAction(cmd, data);
        }
    };

    const getButton = (col: IMessageBotCol) => {
        switch (col.constructor) {
            case C_BUTTON_ACTION.Button:
                const button: Button.AsObject = col.buttondata;
                return (<div className="bot-button no-pointer">{button.text}</div>);
            case C_BUTTON_ACTION.ButtonUrl:
                const buttonUrl: ButtonUrl.AsObject = col.buttondata;
                return (<div className="bot-button bot-button-url"
                             onClick={clickHandler(col.constructor, col.buttondata)}>{buttonUrl.text}</div>);
            case C_BUTTON_ACTION.ButtonUrlAuth:
                const buttonUrlAuth: ButtonUrlAuth.AsObject = col.buttondata;
                return (<div className="bot-button bot-button-url-auth"
                             onClick={clickHandler(col.constructor, col.buttondata)}>{buttonUrlAuth.text}</div>);
            case C_BUTTON_ACTION.ButtonSwitchInline:
                const buttonSwitchInline: ButtonSwitchInline.AsObject = col.buttondata;
                return (<div className="bot-button bot-button-switch-inline"
                             onClick={clickHandler(col.constructor, col.buttondata)}>{buttonSwitchInline.text}</div>);
            case C_BUTTON_ACTION.ButtonRequestPhone:
                const buttonRequestPhone: ButtonRequestPhone.AsObject = col.buttondata;
                return (<div className="bot-button bot-button-request-phone"
                             onClick={clickHandler(col.constructor, col.buttondata)}>{buttonRequestPhone.text}</div>);
            case C_BUTTON_ACTION.ButtonRequestGeoLocation:
                const buttonRequestGeoLocation: ButtonRequestGeoLocation.AsObject = col.buttondata;
                return (<div className="bot-button bot-button-request-geo-location"
                             onClick={clickHandler(col.constructor, col.buttondata)}>{buttonRequestGeoLocation.text}</div>);
            case C_BUTTON_ACTION.ButtonCallback:
                const buttonCallback: ButtonCallback.AsObject = col.buttondata;
                return (<div className="bot-button bot-button-callback"
                             onClick={clickHandler(col.constructor, col.buttondata)}>{buttonCallback.text}</div>);
            case C_BUTTON_ACTION.ButtonBuy:
                const buttonBuy: ButtonBuy.AsObject = col.buttondata;
                return (<div className="bot-button bot-button-buy"
                             onClick={clickHandler(col.constructor, col.buttondata)}>{buttonBuy.text}</div>);
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
