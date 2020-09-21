/*
    Creation Time: 2020 - Sep - 21
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import {Popover, PopoverPosition} from '@material-ui/core';
import {MoreVertRounded} from '@material-ui/icons';
import {IMessage} from "../../repository/message/interface";

import './style.scss';

const defaultReactions = ['😂', '😡', '👎', '👍', '❤️'];
const allReactions = [...defaultReactions, '😢', '🙋‍♀', '🙋‍♂️', '🛢', '🤐', '😖', '🙁', '🥳', '🤩', '😋', '😏'];

interface IProps {
    onSelect?: (id: number, reaction: string) => void;
}

interface IState {
    message: IMessage;
    more: boolean;
    position: PopoverPosition | undefined;
}

class ReactionPicker extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            message: {},
            more: false,
            position: undefined,
        };
    }

    public open(position: PopoverPosition, message: IMessage) {
        this.setState({
            message,
            position,
        });
    }

    public render() {
        const {position, more} = this.state;
        return (
            <Popover open={Boolean(position)} anchorPosition={position} anchorReference="anchorPosition"
                     onClose={this.closeHandler} classes={{paper: 'reaction-picker-popover'}}>
                <div className={'reaction-picker' + (more ? ' full' : '')}>
                    {(more ? allReactions : defaultReactions).map((item) => {
                        return (<div className="reaction-item" key={item} onClick={this.selectHandler(item)}>
                            <div className="reaction-emoji">{item}</div>
                        </div>);
                    })}
                    <div className="reaction-more" onClick={this.toggleMoreHandler}>
                        <MoreVertRounded/>
                    </div>
                </div>
            </Popover>
        );
    }

    private closeHandler = () => {
        this.setState({
            message: {},
            more: false,
            position: undefined,
        });
    }

    private toggleMoreHandler = () => {
        this.setState({
            more: !this.state.more,
        });
    }

    private selectHandler = (reaction: string) => () => {
        this.closeHandler();
        const {message} = this.state;
        if (this.props.onSelect && message) {
            this.props.onSelect(message.id || 0, reaction);
        }
    }
}

export default ReactionPicker;