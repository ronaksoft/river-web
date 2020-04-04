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
import GroupInfoMenu from "../GroupInfoMenu";
import UserInfoMenu from "../UserInfoMenu";

import './style.scss';

interface IProps {
    onChange: (shrink: boolean) => void;
    onDeleteAndExitGroup?: () => void;
    onMessageAttachmentAction: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open' | 'start_bot', messageId: number) => void;
}

interface IState {
    peer: InputPeer | null;
    rightMenu: boolean;
}

class RightMenu extends React.PureComponent<IProps, IState> {
    private ref: any;

    constructor(props: IProps) {
        super(props);

        this.state = {
            peer: null,
            rightMenu: false,
        };
    }

    public setPeer(peer: InputPeer | null) {
        this.setState({
            peer,
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
                });
            } else {
                shrink = false;
                this.setState({
                    rightMenu: false,
                });
            }
        } else {
            if (!force) {
                this.ref.classList.remove('active');
                shrink = false;
                this.setState({
                    rightMenu: false,
                });
            } else {
                this.ref.classList.add('active');
                shrink = true;
                this.setState({
                    rightMenu: true,
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
                <GroupInfoMenu key="group-info" peer={peer} onClose={this.closeHandler}
                               onAction={this.props.onMessageAttachmentAction}
                               onDeleteAndExitGroup={this.props.onDeleteAndExitGroup}/>}
                {Boolean(rightMenu && peer && peer.getType() === PeerType.PEERUSER) &&
                <UserInfoMenu key="user-info" peer={peer} onClose={this.closeHandler}
                              onAction={this.props.onMessageAttachmentAction}/>}
            </div>
        );
    }

    private refHandler = (ref: any) => {
        this.ref = ref;
    }

    private closeHandler = () => {
        this.toggleMenu(false);
    }
}

export default RightMenu;
