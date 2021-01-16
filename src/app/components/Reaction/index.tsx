/*
    Creation Time: 2020 - Sep - 21
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import {IMessage} from "../../repository/message/interface";
import {localize} from "../../services/utilities/localize";
import {MoreHorizRounded} from "@material-ui/icons";

import './style.scss';

interface IProps {
    message: IMessage;
    onContextMenu: (e?: any) => void;
    onClick: (e?: any) => void;
}

export const Reaction = ({message, onContextMenu, onClick}: IProps) => {
    if (!message.reactionsList || message.reactionsList.length === 0) {
        return null;
    }
    const ellipsisView = () => {
        if (!message.reactionsList || message.reactionsList.length === 0) {
            return null;
        }
        return message.reactionsList.length > 3 && <div className="reaction-item ellipsis">
            <div className="reaction-wrapper">
                <MoreHorizRounded/>
            </div>
        </div>;
    };
    return (
        <div className="message-reaction" onContextMenu={onContextMenu} onClick={onClick}>
            {message.me ? ellipsisView() : null}
            {message.reactionsList.slice(0, 3).map((item, index) => {
                return (<div key={`${item.reaction}`} className="reaction-item">
                    <div className="reaction-wrapper">
                        <div className="reaction-emoji">{item.reaction}</div>
                    </div>
                    {(item.total || 0) > 1 && <div className="reaction-counter">{localize(item.total || 0)}</div>}
                </div>);
            })}
            {!message.me ? ellipsisView() : null}
        </div>
    );
};

export default Reaction;
