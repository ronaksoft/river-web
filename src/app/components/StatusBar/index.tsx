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

import './style.css';

interface IProps {
    isConnecting: boolean;
    isUpdating: boolean;
    onAction: (cmd: string) => void;
    peer: InputPeer | null;
    selectedDialogId: string;
}

interface IState {
    isConnecting: boolean;
    isTypingList: { [key: string]: { [key: string]: { fn: any, action: TypingAction } } };
    isUpdating: boolean;
    peer: InputPeer | null;
    selectedDialogId: string;
}

class StatusBar extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            isConnecting: false,
            isTypingList: {},
            isUpdating: false,
            peer: null,
            selectedDialogId: props.selectedDialogId,
        };
    }

    public componentWillReceiveProps(newProps: IProps) {
        this.setState({
            isConnecting: newProps.isConnecting,
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
        const {peer} = this.state;
        if (!peer) {
            return '';
        }
        const isGroup = peer.getType() === PeerType.PEERGROUP;
        return (
            <span className="status-bar" onClick={this.props.onAction.bind(this, 'info')}>
                {!isGroup &&
                <UserName id={this.state.selectedDialogId} className="name" you={true}
                          youPlaceholder={i18n.t('general.saved_messages')} noDetail={true}/>}
                {isGroup &&
                <GroupName id={this.state.selectedDialogId} className="name"/>}
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
        if (this.state.isConnecting) {
            return (<span>Connecting...</span>);
        } else if (this.state.isUpdating) {
            return (<span>Updating...</span>);
        } else if (ids > 0) {
            return (isTypingRender(typingList, peer.getType() || PeerType.PEERUSER));
        } else {
            return (<LastSeen id={selectedDialogId} withLastSeen={true}/>);
        }
    }
}

export default StatusBar;
