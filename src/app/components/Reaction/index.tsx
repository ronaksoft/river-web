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

import './style.scss';

interface IProps {
    message: IMessage;
}

export const Reaction = ({message}: IProps) => {
    if (!message.reactionsList || message.reactionsList.length === 0 || message.reactionsList[0].reaction === "") {
        return null;
    }
    return (
        <div className="message-reaction">
            {message.reactionsList.map((item) => {
                return (<div key={item.reaction} className="reaction-item">
                    <div className="reaction-wrapper">
                        <div className="reaction-emoji">{item.reaction}</div>
                    </div>
                    {(item.total || 0) > 1 && <div className="reaction-counter">{localize(item.total || 0)}</div>}
                </div>);
            })}
        </div>
    );
};

export default Reaction;
