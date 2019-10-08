/*
    Creation Time: 2019 - Oct - 07
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import {InputPeer, PeerType} from "../../services/sdk/messages/chat.core.types_pb";
import i18n from "../../services/i18n";
import {InfoOutlined, KeyboardArrowLeftRounded} from "@material-ui/icons";
import StatusBar from "../StatusBar";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import {omitBy, isNil} from "lodash";

import './style.css';

interface IProps {
    onBack: () => void;
    statusBarRefHandler: (ref: StatusBar) => void;
    isMobileView: boolean;
    onAction: (cmd: string) => (e: any) => void;
}

interface IState {
    moreInfoAnchorEl: any;
    peer: InputPeer | null;
    isConnecting: boolean;
    isOnline: boolean;
    isUpdating: boolean;
    selectedDialogId: string;
}

class InfoBar extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            isConnecting: false,
            isOnline: false,
            isUpdating: false,
            moreInfoAnchorEl: null,
            peer: null,
            selectedDialogId: 'null',
        };
    }

    public setPeer(peer: InputPeer | null, selectedDialogId: string) {
        this.setState({
            peer,
            selectedDialogId,
        });
    }

    public setStatus(state: {
        isConnecting?: boolean;
        isOnline?: boolean;
        isUpdating?: boolean;
        peer?: InputPeer | null,
        selectedDialogId?: string,
    }) {
        // @ts-ignore
        this.setState(omitBy(state, isNil));
    }

    public render() {
        const {moreInfoAnchorEl, selectedDialogId, isConnecting, isOnline, isUpdating, peer} = this.state;
        const messageMoreMenuItem = [{
            cmd: 'info',
            title: (peer && peer.getType() === PeerType.PEERGROUP) ? i18n.t('chat.group_info') : i18n.t('chat.contact_info'),
        }, {
            cmd: 'search',
            title: i18n.t('chat.search_messages'),
        }];
        return (
            <div className="info-bar">
                {this.props.isMobileView &&
                <div className="back-to-chats" onClick={this.props.onBack}>
                    <KeyboardArrowLeftRounded/>
                </div>}
                <StatusBar ref={this.props.statusBarRefHandler} isConnecting={isConnecting}
                           isOnline={isOnline}
                           isUpdating={isUpdating}
                           onAction={this.props.onAction}
                           peer={peer} selectedDialogId={selectedDialogId}/>
                <div className="buttons">
                    <IconButton
                        onClick={this.messageMoreOpenHandler}
                    ><InfoOutlined/></IconButton>
                    <Menu
                        anchorEl={moreInfoAnchorEl}
                        open={Boolean(moreInfoAnchorEl)}
                        onClose={this.messageMoreCloseHandler}
                        className="kk-context-menu darker"
                    >
                        {messageMoreMenuItem.map((item, key) => {
                            return (
                                <MenuItem key={key}
                                          onClick={this.actionHandler(item.cmd)}
                                          className="context-item"
                                >{item.title}</MenuItem>
                            );
                        })}
                    </Menu>
                </div>
            </div>
        );
    }

    private messageMoreOpenHandler = (event: any) => {
        this.setState({
            moreInfoAnchorEl: event.currentTarget,
        });
    }

    private messageMoreCloseHandler = () => {
        this.setState({
            moreInfoAnchorEl: null,
        });
    }

    private actionHandler = (cmd: string) => (e: any) => {
        this.messageMoreCloseHandler();
        this.props.onAction(cmd)(e);
    }
}

export default InfoBar;
