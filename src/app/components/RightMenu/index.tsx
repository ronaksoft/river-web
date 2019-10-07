/*
    Creation Time: 2019 - Oct - 06
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2018
*/

import * as React from 'react';
import {InputPeer, PeerType} from "../../services/sdk/messages/chat.core.types_pb";
import GroupInfoMenu from "../GroupInfoMenu";
import UserInfoMenu from "../UserInfoMenu";

import './style.css';

interface IProps {
    onChange: (shrink: boolean) => void;
    onDeleteAndExitGroup?: () => void;
    onMessageAttachmentAction: (cmd: 'cancel' | 'download' | 'cancel_download' | 'view' | 'open', messageId: number) => void;
}

interface IState {
    peer: InputPeer | null;
    rightMenu: boolean;
}

class RightMenu extends React.Component<IProps, IState> {
    private ref: any;

    constructor(props: IProps) {
        super(props);

        this.state = {
            peer: null,
            rightMenu: true,
        };
    }

    public componentDidMount() {
        //
    }

    public componentWillUnmount() {
        //
    }

    public setPeer(peer: InputPeer | null) {
        this.setState({
            peer,
        });
    }

    public setMenu(force?: boolean) {
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
            }
        } else {
            if (!force) {
                this.ref.classList.remove('active');
                shrink = false;
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
                {(rightMenu && peer && peer.getType() === PeerType.PEERGROUP) &&
                <GroupInfoMenu key="group-info" peer={peer} onClose={this.closeHandler}
                               onAction={this.props.onMessageAttachmentAction}
                               onDeleteAndExitGroup={this.props.onDeleteAndExitGroup}/>}
                {(rightMenu && peer && peer.getType() === PeerType.PEERUSER) &&
                <UserInfoMenu key="user-info" peer={peer} onClose={this.closeHandler}
                              onAction={this.props.onMessageAttachmentAction}/>}
            </div>
        );
    }

    private refHandler = (ref: any) => {
        this.ref = ref;
    }

    private closeHandler = () => {
        this.setMenu(false);
    }
}

export default RightMenu;
