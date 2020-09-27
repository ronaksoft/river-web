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
import {C_LOCALSTORAGE} from "../../services/sdk/const";
import {clone, orderBy} from "lodash";

import './style.scss';

const defaultReactions = ['😂', '😡', '👎', '👍', '❤️'];
const allReactions = [...defaultReactions, '😢', '🙋‍♀️', '🙋‍♂️', '🛢', '🤐', '😖', '🙁', '🥳', '🤩', '😋', '😏'];

interface IProps {
    onSelect?: (id: number, reaction: string, remove: boolean) => void;
}

interface IState {
    message: IMessage;
    more: boolean;
    position: PopoverPosition | undefined;
    selectedReactions: { [key: string]: boolean };
    reactions: string[];
}

class ReactionPicker extends React.PureComponent<IProps, IState> {
    private frequency: { [key: string]: number } = {};

    constructor(props: IProps) {
        super(props);

        this.state = {
            message: {},
            more: false,
            position: undefined,
            reactions: [],
            selectedReactions: {},
        };
    }

    public open(position: PopoverPosition, message: IMessage) {
        const selectedReactions: { [key: string]: boolean } = {};
        (message.yourreactionsList || []).forEach((reaction) => {
            selectedReactions[reaction || ''] = true;
        });
        this.setState({
            message,
            position,
            reactions: this.getSortedReactions(false),
            selectedReactions,
        });
    }

    public componentDidMount() {
        const data = localStorage.getItem(C_LOCALSTORAGE.ReactionFrequently);
        if (data) {
            try {
                this.frequency = JSON.parse(data);
            } catch (e) {
                //
            }
        }
    }

    public render() {
        const {position, more, selectedReactions, reactions} = this.state;
        return (
            <Popover open={Boolean(position)} anchorPosition={position} anchorReference="anchorPosition"
                     onClose={this.closeHandler} classes={{paper: 'reaction-picker-popover'}}>
                <div className={'reaction-picker' + (more ? ' full' : '')}>
                    {reactions.map((item) => {
                        return (
                            <div className={'reaction-item' + (selectedReactions[item] ? ' selected' : '')} key={item}
                                 onClick={this.selectHandler(item)}>
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
            selectedReactions: {},
        });
    }

    private getSortedReactions(complete: boolean): string[] {
        const temp: any[] = [];
        const list: string[] = clone(allReactions);
        for (const [reaction, frequency] of Object.entries(this.frequency)) {
            const index = list.indexOf(reaction);
            if (index > -1) {
                window.console.log(frequency, reaction);
                list.splice(index, 1);
                temp.push({
                    cnt: frequency,
                    val: reaction,
                });
            }
        }
        return [...orderBy(temp, 'cnt', 'desc').map(o => o.val), ...list].slice(0, complete ? 48 : 5);
    }

    private toggleMoreHandler = () => {
        this.setState({
            more: !this.state.more,
            reactions: this.getSortedReactions(!this.state.more),
        });
    }

    private selectHandler = (reaction: string) => () => {
        this.closeHandler();
        const {message, selectedReactions} = this.state;
        if (this.props.onSelect && message) {
            if (!selectedReactions[reaction]) {
                this.updateFrequency(reaction);
            }
            this.props.onSelect(message.id || 0, reaction, selectedReactions[reaction]);
        }
    }

    private updateFrequency(reaction: string) {
        let frequency: any = {};
        const data = localStorage.getItem(C_LOCALSTORAGE.ReactionFrequently);
        if (data) {
            try {
                frequency = JSON.parse(data);
            } catch (e) {
                //
            }
        }
        if (frequency.hasOwnProperty(reaction)) {
            frequency[reaction]++;
        } else {
            frequency[reaction] = 1;
        }
        this.frequency = frequency;
        localStorage.setItem(C_LOCALSTORAGE.ReactionFrequently, JSON.stringify(frequency));
    }
}

export default ReactionPicker;