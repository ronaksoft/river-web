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
import {CallRounded, CancelOutlined, InfoOutlined, KeyboardArrowLeftRounded, SearchRounded} from "@material-ui/icons";
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
    callStarted: boolean;
    peer: InputPeer | null;
    isConnecting: boolean;
    isOnline: boolean;
    isUpdating: boolean;
    teamId: string;
    withCall: boolean;
}

class InfoBar extends React.Component<IProps, IState> {
    private currentUserId: string = UserRepo.getInstance().getCurrentUserId();
    private userRepo: UserRepo;

    constructor(props: IProps) {
        super(props);

        this.state = {
            callStarted: false,
            isConnecting: false,
            isOnline: false,
            isUpdating: false,
            peer: null,
            teamId: props.teamId,
            withCall: true,
        };

        this.userRepo = UserRepo.getInstance();
    }

    public setPeer(teamId: string, peer: InputPeer | null) {
        this.setState({
            peer,
            teamId,
            withCall: false,
        });
        this.checkCall(peer);
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

    public setCallStarted(callStarted: boolean) {
        this.setState({
            callStarted,
        });
    }

    public render() {
        const {isConnecting, isOnline, isUpdating, peer, teamId, withCall, callStarted} = this.state;
        const isGroup = (peer && peer.getType() === PeerType.PEERGROUP);
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
                    {withCall && <>{callStarted ?
                        <div className={'call-indicator ' + (!isGroup ? 'disabled' : '')}
                        >{i18n.t(isGroup ? 'call.join_call' : 'call.call_started')}</div> :
                        <Tooltip title={i18n.t('call.call')}><IconButton
                            onClick={this.props.onAction('call')}
                        ><CallRounded/></IconButton></Tooltip>}
                    </>}
                    <Tooltip
                        title={i18n.t('chat.search_messages')}
                    >
                        <IconButton
                            onClick={this.props.onAction('search')}
                        ><SearchRounded/></IconButton>
                    </Tooltip>
                    <Tooltip
                        title={isGroup ? i18n.t('chat.group_info') : i18n.t('chat.contact_info')}
                    >
                        <IconButton
                            onClick={this.props.onAction('info')}
                        ><InfoOutlined/></IconButton>
                    </Tooltip>
                </div>
            </div>
        );
    }

    private checkCall(peer: InputPeer | null) {
        if (!peer) {
            return;
        }
        if (peer.getType() === PeerType.PEERUSER) {
            this.userRepo.get(peer.getId() || '0').then((user) => {
                if (user) {
                    this.setState({
                        withCall: !Boolean(user.isbot || user.official),
                    });
                }
            });
        } else if (peer.getType() === PeerType.PEERGROUP) {
            this.setState({
                withCall: true,
            });
        }
    }
}

export default InfoBar;
