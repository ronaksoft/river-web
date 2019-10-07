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
import i18n from '../../services/i18n';

import './style.css';

interface IProps {
    onClose: () => void;
    onDone: (inputPeers: IInputPeer[]) => void;
}

interface IState {
    forwardRecipients: IInputPeer[];
    open: boolean;
}

class ForwardDialog extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            forwardRecipients: [],
            open: false,
        };
    }

    public openDialog() {
        this.setState({
            open: true,
        });
    }

    public render() {
        const {open, forwardRecipients} = this.state;
        return (
            <SettingsModal open={open} title={i18n.t('general.recipient')}
                           icon={<PersonAddRounded/>}
                           onClose={this.modalCloseHandler}
                           height="500px"
                           noScrollbar={true}
            >
                <div className="forward-dialog">
                    <SearchList onChange={this.forwardRecipientChangeHandler}/>
                    {Boolean(forwardRecipients.length > 0) && <div className="actions-bar">
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
            forwardRecipients: [],
            open: false,
        });
        this.props.onClose();
    }

    private forwardHandler = () => {
        if (this.props.onDone) {
            this.props.onDone(this.state.forwardRecipients);
            this.modalCloseHandler();
        }
    }

    private forwardRecipientChangeHandler = (inputPeers: IInputPeer[]) => {
        this.setState({
            forwardRecipients: inputPeers,
        });
    }
}

export default ForwardDialog;
