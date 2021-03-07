/*
    Creation Time: 2019 - June - 02
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
import {InputPeer, PeerType, TypingAction} from "../../services/sdk/messages/core.types_pb";
import UserName from "../UserName";
import GroupName from "../GroupName";
import {isTypingRender} from "../DialogMessage";
import LastSeen from "../LastSeen";
import i18n from "../../services/i18n";
import Smoother from "../../services/utilities/smoother";
import {GetPeerName} from "../../repository/dialog";

import './style.scss';
import APIManager from "../../services/sdk";

interface IProps {
    currentUserId: string;
    isConnecting: boolean;
    isOnline: boolean;
    isUpdating: boolean;
    onAction: (cmd: string) => (e?: any) => void;
    peer: InputPeer | null;
    teamId: string;
}

interface IState {
    isConnecting: boolean;
    isOnline: boolean;
    isTypingList: { [key: string]: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } } };
    isUpdating: boolean;
    peer: InputPeer | null;
    selectedId: string;
}

class StatusBar extends React.Component<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        return {
            isConnecting: props.isConnecting,
            isOnline: props.isOnline,
            isUpdating: props.isUpdating,
            peer: props.peer,
            selectedId: props.peer ? (props.peer.getId() || '') : '',
        };
    }

    private disableClick: boolean = false;
    private smoother: Smoother;

    constructor(props: IProps) {
        super(props);

        this.state = {
            isConnecting: props.isConnecting,
            isOnline: props.isOnline,
            isTypingList: {},
            isUpdating: props.isUpdating,
            peer: null,
            selectedId: props.peer ? (props.peer.getId() || '') : '',
        };

        this.smoother = new Smoother(2000, this.updateFunctionHandler);
    }

    public componentWillUnmount() {
        this.smoother.destroy();
    }

    public setIsTypingList(isTypingList: { [key: string]: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } } }) {
        this.setState({
            isTypingList,
        });
    }

    public render() {
        const {peer, selectedId} = this.state;
        if (!peer) {
            return null;
        }
        const isGroup = peer.getType() === PeerType.PEERGROUP;
        const savedMessages = (this.props.currentUserId === selectedId);
        return (
            <span className={'status-bar' + (savedMessages ? ' saved-messages' : '')} onClick={this.clickHandler}>
                {!isGroup &&
                <UserName id={selectedId} className="name" you={true}
                          youPlaceholder={i18n.t('general.saved_messages')} noDetail={true}/>}
                {isGroup &&
                <GroupName id={selectedId} teamId={this.props.teamId} className="name"/>}
                {this.getChatStatus(savedMessages)}
            </span>
        );
    }

    private getChatStatus(hideStatus: boolean) {
        const {peer, isConnecting, selectedId, isTypingList} = this.state;
        if (!peer) {
            return null;
        }
        const {teamId} = this.props;
        const peerName = GetPeerName(peer.getId(), peer.getType());
        const showIsConnecting = this.smoother.getState(isConnecting);
        let typingList: { [key: string]: { fn: any, action: TypingAction } } = {};
        let ids: number = 0;
        if (isTypingList.hasOwnProperty(teamId) && isTypingList[teamId].hasOwnProperty(peerName)) {
            typingList = this.state.isTypingList[teamId][peerName];
            ids = Object.keys(typingList).length;
        }
        if (!this.state.isOnline) {
            return (<span>{i18n.t('status.waiting_for_network')}</span>);
        } else if (isConnecting && showIsConnecting) {
            return (<span className="try-again-container"><span>{i18n.t('status.connecting')}</span><span
                className="try-again" onClick={this.tryAgainHandler}>{i18n.t('status.try_again')}</span></span>);
        } else if (this.state.isUpdating) {
            return (<span>{i18n.t('status.updating')}</span>);
        } else if (ids > 0) {
            return (isTypingRender(typingList, peer.getType() || PeerType.PEERUSER, true));
        } else if (!hideStatus) {
            return (<LastSeen id={selectedId} teamId={this.props.teamId} withLastSeen={true}/>);
        } else {
            return null;
        }
    }

    private clickHandler = () => {
        if (this.disableClick) {
            return;
        }
        this.disableClick = true;
        this.props.onAction('info')();
        setTimeout(() => {
            this.disableClick = false;
        }, 300);
    }

    private tryAgainHandler = (e: any) => {
        e.stopPropagation();
        e.preventDefault();
        APIManager.getInstance().checkNetwork();
    }

    private updateFunctionHandler = () => {
        this.forceUpdate();
    }
}

export default StatusBar;
