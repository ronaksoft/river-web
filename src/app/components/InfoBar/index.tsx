/*
    Creation Time: 2019 - Oct - 07
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {InputPeer, PeerType} from "../../services/sdk/messages/core.types_pb";
import i18n from "../../services/i18n";
import {CancelOutlined, InfoOutlined, KeyboardArrowLeftRounded, SearchRounded, CallRounded} from "@material-ui/icons";
import StatusBar from "../StatusBar";
import {IconButton, Tooltip} from "@material-ui/core";
import {isNil, omitBy} from "lodash";
import UserRepo from "../../repository/user";

import './style.scss';

interface IProps {
    onBack: () => void;
    onClose?: () => void;
    statusBarRefHandler: (ref: StatusBar) => void;
    isMobileView: boolean;
    onAction: (cmd: string) => (e: any) => void;
    teamId: string;
}

interface IState {
    peer: InputPeer | null;
    isConnecting: boolean;
    isOnline: boolean;
    isUpdating: boolean;
    teamId: string;
    withCall: boolean;
}

class InfoBar extends React.Component<IProps, IState> {
    private currentUserId: string = UserRepo.getInstance().getCurrentUserId();

    constructor(props: IProps) {
        super(props);

        this.state = {
            isConnecting: false,
            isOnline: false,
            isUpdating: false,
            peer: null,
            teamId: props.teamId,
            withCall: false,
        };
    }

    public setPeer(teamId: string, peer: InputPeer | null) {
        this.setState({
            peer,
            teamId,
            withCall: peer ? peer.getType() === PeerType.PEERUSER : false,
        });
    }

    public setStatus(state: {
        isConnecting?: boolean;
        isOnline?: boolean;
        isUpdating?: boolean;
        peer?: InputPeer | null,
        selectedPeerName?: string,
    }) {
        // @ts-ignore
        this.setState(omitBy(state, isNil));
    }

    public render() {
        const {isConnecting, isOnline, isUpdating, peer, teamId, withCall} = this.state;
        return (
            <div className={'info-bar' + (withCall ? ' with-call' : '')}>
                {this.props.isMobileView ?
                    <div className="back-to-chats" onClick={this.props.onBack}>
                        <KeyboardArrowLeftRounded/>
                    </div> :
                    <div className="back-to-chats close-button">
                        <IconButton onClick={this.props.onClose}>
                            <CancelOutlined/>
                        </IconButton>
                    </div>
                }
                <StatusBar ref={this.props.statusBarRefHandler} onAction={this.props.onAction}
                           isConnecting={isConnecting} isOnline={isOnline} isUpdating={isUpdating}
                           peer={peer} teamId={teamId} currentUserId={this.currentUserId}
                />
                <div className="buttons">
                    {withCall && <Tooltip
                        title={i18n.t('chat.search_messages')}
                    >
                        <IconButton
                            onClick={this.props.onAction('call')}
                        ><CallRounded/></IconButton>
                    </Tooltip>}
                    <Tooltip
                        title={i18n.t('chat.search_messages')}
                    >
                        <IconButton
                            onClick={this.props.onAction('search')}
                        ><SearchRounded/></IconButton>
                    </Tooltip>
                    <Tooltip
                        title={(peer && peer.getType() === PeerType.PEERGROUP) ? i18n.t('chat.group_info') : i18n.t('chat.contact_info')}
                    >
                        <IconButton
                            onClick={this.props.onAction('info')}
                        ><InfoOutlined/></IconButton>
                    </Tooltip>
                </div>
            </div>
        );
    }
}

export default InfoBar;
