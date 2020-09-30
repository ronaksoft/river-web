/*
    Creation Time: 2020 - Sep - 30
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2020
*/

import React from 'react';
import {ClearRounded} from "@material-ui/icons";
import {IconButton} from "@material-ui/core";
import MessagePreview from "../MessagePreview";
import {IMessage} from "../../repository/message/interface";
import {InputPeer} from "../../services/sdk/messages/core.types_pb";

import './style.scss';

interface IProps {
    onClose?: (id: number) => void;
    onClick?: (id: number, e: any) => void;
    peer: InputPeer | null;
    teamId: string;
    disableClick: boolean;
}

interface IState {
    disableClick: boolean;
    id: number;
    message: IMessage | null;
    open: boolean;
}

class PinnedMessage extends React.PureComponent<IProps, IState> {
    public static getDerivedStateFromProps(props: IProps, state: IState) {
        if (props.disableClick === state.disableClick) {
            return null;
        }
        return {
            disableClick: props.disableClick,
        };
    }

    constructor(props: IProps) {
        super(props);

        this.state = {
            disableClick: props.disableClick,
            id: 0,
            message: null,
            open: false,
        };
    }

    public open(id: number) {
        if (id === 0) {
            if (this.state.open) {
                this.setState({
                    id,
                    message: null,
                    open: false,
                });
            }
            return;
        }
        this.setState({
            id,
            message: id ? {
                id,
            } : null,
            open: true,
        });
    }

    public componentDidMount() {
        //
    }

    public render() {
        const {disableClick, open, message} = this.state;
        return (<div className={'pinned-message' + (open ? ' open' : '')}>
            {message && <>
                <MessagePreview disableClick={disableClick} message={message} peer={this.props.peer}
                                teamId={this.props.teamId} pinnedMessage={true} onClick={this.props.onClick}/>
                <div className="pinned-message-icon">
                    <IconButton onClick={this.closeHandler}>
                        <ClearRounded/>
                    </IconButton>
                </div>
            </>}
        </div>);
    }

    private closeHandler = () => {
        this.setState({
            message: null,
            open: false,
        });
        if (this.props.onClose) {
            this.props.onClose(this.state.id);
        }
    }
}

export default PinnedMessage;