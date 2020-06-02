/*
    Creation Time: 2019 - May - 26
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import * as React from 'react';
import SettingsModal from '../SettingsModal';
import {PersonAddRounded, SendRounded} from '@material-ui/icons';
import SearchList, {IInputPeer} from '../SearchList';
import {TopPeerType} from "../../repository/topPeer";

import './style.scss';

interface IProps {
    onClose: () => void;
    onDone: (inputPeers: IInputPeer[]) => void;
    title: string;
    contactOnly?: boolean;
    enableTopPeer?: boolean;
    topPeerType?: TopPeerType;
}

interface IState {
    selectedPeers: IInputPeer[];
    open: boolean;
}

class SelectPeerDialog extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            open: false,
            selectedPeers: [],
        };
    }

    public openDialog() {
        this.setState({
            open: true,
        });
    }

    public render() {
        const {open, selectedPeers} = this.state;
        return (
            <SettingsModal open={open} title={this.props.title}
                           icon={<PersonAddRounded/>}
                           onClose={this.modalCloseHandler}
                           height="500px"
                           noScrollbar={true}
            >
                <div className="select-peer-dialog">
                    <SearchList onChange={this.forwardRecipientChangeHandler} enableTopPeer={this.props.enableTopPeer}
                                topPeerType={this.props.topPeerType} contactOnly={this.props.contactOnly}/>
                    {Boolean(selectedPeers.length > 0) && <div className="actions-bar">
                        <div className="add-action send" onClick={this.forwardHandler}>
                            <SendRounded/>
                        </div>
                    </div>}
                </div>
            </SettingsModal>
        );
    }

    private modalCloseHandler = () => {
        this.setState({
            open: false,
            selectedPeers: [],
        });
        this.props.onClose();
    }

    private forwardHandler = () => {
        if (this.props.onDone) {
            this.props.onDone(this.state.selectedPeers);
            this.modalCloseHandler();
        }
    }

    private forwardRecipientChangeHandler = (inputPeers: IInputPeer[]) => {
        this.setState({
            selectedPeers: inputPeers,
        });
    }
}

export default SelectPeerDialog;
