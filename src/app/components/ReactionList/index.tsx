/*
    Creation Time: 2020 - Sep - 21
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import {TagFacesRounded} from '@material-ui/icons';
import SettingsModal from "../SettingsModal";
import {IMessage} from "../../repository/message/interface";
import i18n from "../../services/i18n";
import APIManager from "../../services/sdk";
import {InputPeer} from "../../services/sdk/messages/core.types_pb";
import {ReactionList as RiverReactionList} from "../../services/sdk/messages/chat.messages_pb";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import Chip from "@material-ui/core/Chip";
import {Loading} from "../Loading";
import {find} from "lodash";
import {localize} from "../../services/utilities/localize";

import './style.scss';

interface IReactionInfo extends RiverReactionList.AsObject {
    counter?: number;
}

interface IProps {
    onSelect?: (id: number, reaction: string, remove: boolean) => void;
}

interface IState {
    open: boolean;
    loading: boolean;
    message: IMessage;
    reactionList: IReactionInfo[];
}

class ReactionList extends React.Component<IProps, IState> {
    private apiManager: APIManager;

    constructor(props: IProps) {
        super(props);

        this.state = {
            loading: false,
            message: {},
            open: false,
            reactionList: [],
        };

        this.apiManager = APIManager.getInstance();
    }

    public openDialog(peer: InputPeer, message: IMessage) {
        this.setState({
            message,
            open: true,
        });
        this.apiManager.reactionList(peer, message.id || 0, 0).then((res) => {
            (res.listList || []).map((item: IReactionInfo) => {
                const t = find(message.reactionsList || [], {reaction: item.reaction});
                if (t) {
                    item.counter = t.total;
                }
                return item;
            });
            this.setState({
                loading: false,
                reactionList: res.listList || [],
            });
        }).catch(() => {
            this.setState({
                loading: false,
            });
        });
    }

    public render() {
        const {open, reactionList, loading} = this.state;
        return (
            <SettingsModal open={open} title={i18n.t('reaction.list')}
                           icon={<TagFacesRounded/>} onClose={this.modalCloseHandler} height={this.getHeight()}
            >
                <div className="reaction-list-dialog">
                    {reactionList.map((item) => {
                        return (<div key={item.reaction} className="reaction-item">
                            <div className="reaction-value">
                                <Chip avatar={<div className="reaction-emoji">{item.reaction}</div>}
                                      label={localize(item.counter || 0)} className="reaction-chip"/>
                            </div>
                            <div className="reaction-user">
                                {item.useridsList.map((id) => {
                                    return (<Chip key={id} avatar={<UserAvatar id={id || '0'}/>}
                                                  tabIndex={-1} className="user-chip"
                                                  label={<UserName id={id || '0'} you={true} unsafe={true}/>}/>);
                                })}
                            </div>
                        </div>);
                    })}
                    {loading && <Loading/>}
                </div>
            </SettingsModal>
        );
    }

    private modalCloseHandler = () => {
        this.setState({
            message: {},
            open: false,
        });
    }

    private getHeight() {
        const {reactionList} = this.state;
        let h = reactionList.length * 49;
        if (h > 225) {
            h = 225;
        }
        return `${h}px`;
    }
}

export default ReactionList;