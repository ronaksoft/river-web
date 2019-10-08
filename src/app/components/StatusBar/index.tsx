/*
    Creation Time: 2019 - June - 02
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {InputPeer, PeerType, TypingAction} from "../../services/sdk/messages/chat.core.types_pb";
import UserName from "../UserName";
import GroupName from "../GroupName";
import {isTypingRender} from "../DialogMessage";
import LastSeen from "../LastSeen";
import i18n from "../../services/i18n";
import Socket from "../../services/sdk/server/socket";

import './style.css';

interface IProps {
    isConnecting: boolean;
    isOnline: boolean;
    isUpdating: boolean;
    onAction: (cmd: string) => (e?: any) => void;
    peer: InputPeer | null;
    selectedDialogId: string;
}

interface IState {
    isConnecting: boolean;
    isOnline: boolean;
    isTypingList: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } };
    isUpdating: boolean;
    peer: InputPeer | null;
    selectedDialogId: string;
}

class StatusBar extends React.Component<IProps, IState> {
    private disableClick: boolean = false;

    constructor(props: IProps) {
        super(props);

        this.state = {
            isConnecting: props.isConnecting,
            isOnline: props.isOnline,
            isTypingList: {},
            isUpdating: props.isUpdating,
            peer: null,
            selectedDialogId: props.selectedDialogId,
        };
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            isConnecting: newProps.isConnecting,
            isOnline: newProps.isOnline,
            isUpdating: newProps.isUpdating,
            peer: newProps.peer,
            selectedDialogId: newProps.selectedDialogId,
        });
    }

    public setIsTypingList(isTypingList: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } }) {
        this.setState({
            isTypingList,
        });
    }

    public render() {
        const {peer, selectedDialogId} = this.state;
        if (!peer) {
            return '';
        }
        const isGroup = peer.getType() === PeerType.PEERGROUP;
        return (
            <span className="status-bar" onClick={this.clickHandler}>
                {!isGroup &&
                <UserName id={selectedDialogId} className="name" you={true}
                          youPlaceholder={i18n.t('general.saved_messages')} noDetail={true}/>}
                {isGroup &&
                <GroupName id={selectedDialogId} className="name"/>}
                {this.getChatStatus()}
            </span>
        );
    }

    private getChatStatus() {
        const {selectedDialogId, peer} = this.state;
        if (!peer) {
            return '';
        }
        let typingList: { [key: string]: { fn: any, action: TypingAction } } = {};
        let ids: number = 0;
        if (this.state.isTypingList.hasOwnProperty(selectedDialogId)) {
            typingList = this.state.isTypingList[selectedDialogId];
            ids = Object.keys(typingList).length;
        }
        if (!this.state.isOnline) {
            return (<span>{i18n.t('status.waiting_for_network')}</span>);
        } else if (this.state.isConnecting) {
            return (<span className="try-again-container"><span>{i18n.t('status.connecting')}</span><span
                className="try-again" onClick={this.tryAgainHandler}>{i18n.t('status.try_again')}</span></span>);
        } else if (this.state.isUpdating) {
            return (<span>{i18n.t('status.updating')}</span>);
        } else if (ids > 0) {
            return (isTypingRender(typingList, peer.getType() || PeerType.PEERUSER));
        } else {
            return (<LastSeen id={selectedDialogId} withLastSeen={true}/>);
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
        Socket.getInstance().tryAgain();
    }
}

export default StatusBar;
