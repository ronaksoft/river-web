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
import {IMessage, IReactionInfo} from "../../repository/message/interface";
import i18n from "../../services/i18n";
import {InputPeer} from "../../services/sdk/messages/core.types_pb";
import UserAvatar from "../UserAvatar";
import UserName from "../UserName";
import Chip from "@material-ui/core/Chip";
import MessageRepo from "../../repository/message";
import {Loading} from "../Loading";
import {localize} from "../../services/utilities/localize";

import './style.scss';

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
    private messageRepo: MessageRepo;

    constructor(props: IProps) {
        super(props);

        this.state = {
            loading: false,
            message: {},
            open: false,
            reactionList: [],
        };

        this.messageRepo = MessageRepo.getInstance();
    }

    public openDialog(peer: InputPeer, message: IMessage) {
        this.setState({
            loading: true,
            message,
            open: true,
            reactionList: (message.reactionsList || []).map((o) => {
                return {
                    counter: o.total,
                    reaction: o.reaction,
                    useridsList: [],
                };
            }),
        }, () => {
            this.messageRepo.getReactionList(peer, message.id || 0).then((res) => {
                this.setState({
                    loading: false,
                    reactionList: res || [],
                });
            }).catch((err) => {
                this.setState({
                    loading: false,
                });
            });
        });
    }

    public render() {
        const {open, reactionList, loading} = this.state;
        return (
            <SettingsModal open={open} title={i18n.t('reaction.list')}
                           icon={<TagFacesRounded/>} onClose={this.modalCloseHandler} height={this.getHeight()}
                           autoHeight={true} minHeight={49} maxHeight={380}
            >
                <div className="reaction-list-dialog">
                    {reactionList.map((item) => {
                        return (<div key={item.reaction} className="reaction-item">
                            <div className="reaction-value">
                                <Chip avatar={<div className="reaction-emoji">{item.reaction}</div>}
                                      label={localize(item.counter || 0)} className="reaction-chip"/>
                            </div>
                            <div className="reaction-user">
                                {!loading ? item.useridsList.map((id) => {
                                    return (<Chip key={id} avatar={<UserAvatar id={id || '0'}/>}
                                                  tabIndex={-1} className="user-chip"
                                                  label={<UserName id={id || '0'} you={true} unsafe={true}/>}/>);
                                }) : <Loading/>}
                            </div>
                        </div>);
                    })}
                </div>
            </SettingsModal>
        );
    }

    private modalCloseHandler = () => {
        this.setState({
            loading: false,
            message: {},
            open: false,
        });
    }

    private getHeight() {
        const {reactionList} = this.state;
        let h = 0;
        reactionList.forEach((item) => {
            h += (item.counter || 0) * 49;
        });
        if (h > 225) {
            h = 225;
        }
        return `${h}px`;
    }
}

export default ReactionList;