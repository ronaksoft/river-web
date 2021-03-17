/*
    Creation Time: 2019 - Aug - 14
    Created by:  (hamidrezakk)
    Maintainers:
       1.  HamidrezaKK (hamidrezakks@gmail.com)
    Auditor: HamidrezaKK
    Copyright Ronak Software Group 2019
*/

import React from 'react';
import SettingsModal from '../SettingsModal';
import {PersonAddRounded, CheckRounded} from '@material-ui/icons';
import SearchList, {IInputPeer} from '../SearchList';
import i18n from '../../services/i18n';

import './style.scss';

interface IProps {
    onClose?: () => void;
    onDone: (target: string, inputPeers: IInputPeer[]) => void;
    teamId: string;
}

interface IState {
    open: boolean;
    selectedIds: string[];
    target: string;
    userList: IInputPeer[];
}

class UserListDialog extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            open: false,
            selectedIds: [],
            target: '',
            userList: [],
        };
    }

    public openDialog(target: string, selectedIds: string[]) {
        this.setState({
            open: true,
            selectedIds,
            target,
        });
    }

    public render() {
        const {open, selectedIds, userList} = this.state;
        return (
            <SettingsModal open={open} title={i18n.t('general.contacts')}
                           icon={<PersonAddRounded/>}
                           onClose={this.modalCloseHandler}
                           height="500px"
                           noScrollbar={true}
            >
                <div className="user-list-dialog">
                    <SearchList selectedIds={selectedIds} contactOnly={true} teamId={this.props.teamId}
                                onChange={this.forwardRecipientChangeHandler}/>
                    {Boolean(userList.length > 0 || (selectedIds.length > 0 && userList.length === 0)) &&
                    <div className="actions-bar">
                        <div className="add-action send" onClick={this.doneHandler}>
                            <CheckRounded/>
                        </div>
                    </div>}
                </div>
            </SettingsModal>
        );
    }

    private modalCloseHandler = () => {
        this.setState({
            open: false,
        });
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    private doneHandler = () => {
        if (this.props.onDone) {
            this.props.onDone(this.state.target, this.state.userList);
            this.modalCloseHandler();
        }
    }

    private forwardRecipientChangeHandler = (inputPeers: IInputPeer[]) => {
        this.setState({
            userList: inputPeers,
        });
    }
}

export default UserListDialog;
