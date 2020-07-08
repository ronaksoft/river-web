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
import {InfoOutlined, KeyboardArrowLeftRounded, CancelOutlined, SearchRounded} from "@material-ui/icons";
import StatusBar from "../StatusBar";
import {IconButton, Tooltip} from "@material-ui/core";
import {omitBy, isNil} from "lodash";
import UserRepo from "../../repository/user";

import './style.scss';

interface IProps {
    onBack: () => void;
    onClose?: () => void;
    statusBarRefHandler: (ref: StatusBar) => void;
    isMobileView: boolean;
    onAction: (cmd: string) => (e: any) => void;
}

interface IState {
    peer: InputPeer | null;
    isConnecting: boolean;
    isOnline: boolean;
    isUpdating: boolean;
}

class InfoBar extends React.Component<IProps, IState> {
    private teamId: string = '0';
    private currentUserId: string = UserRepo.getInstance().getCurrentUserId();

    constructor(props: IProps) {
        super(props);

        this.state = {
            isConnecting: false,
            isOnline: false,
            isUpdating: false,
            peer: null,
        };
    }

    public setPeer(teamId: string, peer: InputPeer | null) {
        this.teamId = teamId;
        this.setState({
            peer,
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
        const {isConnecting, isOnline, isUpdating, peer} = this.state;
        return (
            <div className="info-bar">
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
                <StatusBar ref={this.props.statusBarRefHandler} isConnecting={isConnecting}
                           isOnline={isOnline}
                           isUpdating={isUpdating}
                           onAction={this.props.onAction}
                           peer={peer}
                           teamId={this.teamId}
                           currentUserId={this.currentUserId}
                />
                <div className="buttons">
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
