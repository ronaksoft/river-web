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
import GroupInfoMenu from "../GroupInfoMenu";
import UserInfoMenu from "../UserInfoMenu";
import {IDialog} from "../../repository/dialog/interface";

import './style.scss';

interface IProps {
    onChange: (shrink: boolean) => void;
    onDeleteAndExitGroup?: () => void;
    onMessageAttachmentAction: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open' | 'start_bot', messageId: number) => void;
    onToggleMenu: (open: boolean) => void;
    onError?: (message: string) => void;
}

interface IState {
    peer: InputPeer | null;
    rightMenu: boolean;
}

class RightMenu extends React.PureComponent<IProps, IState> {
    private teamId: string = '0';
    private ref: any;
    private dialog: IDialog | null = null;
    private groupInfoMenuRef: GroupInfoMenu | undefined;
    private userInfoMenuRef: UserInfoMenu | undefined;

    constructor(props: IProps) {
        super(props);

        this.state = {
            peer: null,
            rightMenu: false,
        };
    }

    public setPeer(teamId: string, peer: InputPeer | null, dialog: IDialog | null) {
        this.teamId = teamId;
        this.dialog = dialog;
        this.setState({
            peer,
        }, () => {
            if (this.userInfoMenuRef) {
                this.userInfoMenuRef.setPeer(teamId, peer, dialog);
            }
            if (this.groupInfoMenuRef) {
                this.groupInfoMenuRef.setPeer(teamId, peer, dialog);
            }
        });
    }

    public toggleMenu(force?: boolean) {
        let shrink: boolean = false;
        if (force === undefined) {
            this.ref.classList.toggle('active');
            if (this.ref.classList.contains('active')) {
                shrink = true;
                this.setState({
                    rightMenu: true,
                }, () => {
                    if (this.props.onToggleMenu) {
                        this.props.onToggleMenu(this.state.rightMenu);
                    }
                });
            } else {
                shrink = false;
                this.setState({
                    rightMenu: false,
                }, () => {
                    if (this.props.onToggleMenu) {
                        this.props.onToggleMenu(this.state.rightMenu);
                    }
                });
            }
        } else {
            if (!force) {
                this.ref.classList.remove('active');
                shrink = false;
                this.setState({
                    rightMenu: false,
                }, () => {
                    if (this.props.onToggleMenu) {
                        this.props.onToggleMenu(this.state.rightMenu);
                    }
                });
            } else {
                this.ref.classList.add('active');
                shrink = true;
                this.setState({
                    rightMenu: true,
                }, () => {
                    if (this.props.onToggleMenu) {
                        this.props.onToggleMenu(this.state.rightMenu);
                    }
                });
            }
        }
        this.props.onChange(shrink);
    }

    public render() {
        const {rightMenu, peer} = this.state;
        return (
            <div ref={this.refHandler} className="right-menu">
                {Boolean(rightMenu && peer && peer.getType() === PeerType.PEERGROUP) &&
                <GroupInfoMenu key="group-info" ref={this.groupInfoMenuRefHandler} onClose={this.closeHandler}
                               peer={peer} onAction={this.props.onMessageAttachmentAction}
                               onDeleteAndExitGroup={this.props.onDeleteAndExitGroup} onError={this.props.onError}/>}
                {Boolean(rightMenu && peer && (peer.getType() === PeerType.PEERUSER || peer.getType() === PeerType.PEEREXTERNALUSER)) &&
                <UserInfoMenu key="user-info" ref={this.userInfoMenuRefHandler} peer={peer} onClose={this.closeHandler}
                              onAction={this.props.onMessageAttachmentAction} onError={this.props.onError}/>}
            </div>
        );
    }

    private refHandler = (ref: any) => {
        this.ref = ref;
    }

    private closeHandler = () => {
        this.toggleMenu(false);
    }

    private groupInfoMenuRefHandler = (ref: any) => {
        this.groupInfoMenuRef = ref;
        if (this.groupInfoMenuRef) {
            this.groupInfoMenuRef.setPeer(this.teamId, this.state.peer, this.dialog);
        }
    }

    private userInfoMenuRefHandler = (ref: any) => {
        this.userInfoMenuRef = ref;
        if (this.userInfoMenuRef) {
            this.userInfoMenuRef.setPeer(this.teamId, this.state.peer, this.dialog);
        }
    }
}

export default RightMenu;
